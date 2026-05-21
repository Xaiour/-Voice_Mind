"""
Audio Preprocessing Utilities
Handles audio normalization, noise reduction, and format conversion.
"""

import numpy as np
import librosa
from scipy.signal import butter, filtfilt


def preprocess_audio(audio_path: str, target_sr: int = 22050) -> tuple:
    """
    Load and preprocess audio file.

    Steps:
    1. Load audio (any format) and resample to target SR
    2. Convert to mono
    3. Normalize amplitude
    4. Apply bandpass filter (80Hz - 8000Hz for speech)
    5. Remove leading/trailing silence

    Args:
        audio_path: Path to audio file
        target_sr: Target sample rate (default: 22050)

    Returns:
        Tuple of (preprocessed_audio_array, sample_rate)
    """
    # Load and resample
    y, sr = librosa.load(audio_path, sr=target_sr, mono=True)

    # Normalize amplitude to [-1, 1]
    y = normalize_audio(y)

    # Apply bandpass filter for speech frequencies
    y = bandpass_filter(y, sr, lowcut=80, highcut=8000)

    # Trim silence
    y_trimmed, _ = librosa.effects.trim(y, top_db=25)

    # Ensure minimum length (0.5 seconds)
    min_samples = int(sr * 0.5)
    if len(y_trimmed) < min_samples:
        y_trimmed = y  # Fallback to untrimmed

    return y_trimmed, sr


def normalize_audio(y: np.ndarray) -> np.ndarray:
    """
    Normalize audio amplitude to [-1, 1] range.
    Prevents division by zero for silent audio.
    """
    max_val = np.max(np.abs(y))
    if max_val > 0:
        return y / max_val
    return y


def bandpass_filter(
    y: np.ndarray, sr: int, lowcut: float = 80, highcut: float = 8000, order: int = 5
) -> np.ndarray:
    """
    Apply Butterworth bandpass filter to isolate speech frequencies.

    Args:
        y: Audio signal
        sr: Sample rate
        lowcut: Low frequency cutoff (Hz)
        highcut: High frequency cutoff (Hz)
        order: Filter order

    Returns:
        Filtered audio signal
    """
    nyquist = sr / 2.0
    low = lowcut / nyquist
    high = min(highcut / nyquist, 0.99)  # Ensure valid range

    b, a = butter(order, [low, high], btype="band")
    return filtfilt(b, a, y).astype(np.float32)


def compute_snr(y: np.ndarray, sr: int) -> float:
    """
    Estimate Signal-to-Noise Ratio (SNR) in dB.
    Useful for assessing audio quality before analysis.
    """
    # Estimate noise from quiet segments
    frame_length = 2048
    hop_length = 512
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

    # Bottom 10% of frames = noise estimate
    noise_threshold = np.percentile(rms, 10)
    noise_frames = rms[rms <= noise_threshold]
    signal_frames = rms[rms > noise_threshold]

    if len(noise_frames) == 0 or len(signal_frames) == 0:
        return 0.0

    noise_power = np.mean(noise_frames ** 2)
    signal_power = np.mean(signal_frames ** 2)

    if noise_power == 0:
        return 60.0  # Very clean signal

    snr = 10 * np.log10(signal_power / noise_power)
    return float(round(snr, 1))
