"""
Voice Feature Extraction Pipeline
Extracts biomarkers from audio using librosa, numpy, and scipy.

Features extracted:
    1. Mean pitch (F0)
    2. Pitch variability (std of F0)
    3. Speech rate (syllables per second estimate)
    4. RMS vocal energy
    5. Pause ratio (silence vs speech)
    6. Jitter (pitch perturbation)
    7. MFCCs (13 coefficients)
"""

import numpy as np
import librosa
from scipy.signal import find_peaks


def extract_voice_features(audio_path: str) -> dict:
    """
    Full feature extraction pipeline.

    Args:
        audio_path: Path to audio file (any format supported by librosa)

    Returns:
        Dictionary of extracted voice biomarkers
    """
    # Load audio (mono, 22050 Hz sample rate)
    y, sr = librosa.load(audio_path, sr=22050, mono=True)

    # Trim silence from edges
    y_trimmed, _ = librosa.effects.trim(y, top_db=25)

    # If audio too short after trimming, use original
    if len(y_trimmed) < sr * 0.5:
        y_trimmed = y

    # Extract all features
    pitch_features = _extract_pitch(y_trimmed, sr)
    energy_features = _extract_energy(y_trimmed, sr)
    speech_rate = _estimate_speech_rate(y_trimmed, sr)
    pause_ratio = _calculate_pause_ratio(y_trimmed, sr)
    jitter = _calculate_jitter(y_trimmed, sr)
    mfccs = _extract_mfccs(y_trimmed, sr)
    duration = len(y) / sr

    return {
        "pitch_mean": pitch_features["mean"],
        "pitch_std": pitch_features["std"],
        "pitch_min": pitch_features["min"],
        "pitch_max": pitch_features["max"],
        "energy_mean": energy_features["mean"],
        "energy_max": energy_features["max"],
        "speech_rate": speech_rate,
        "pause_ratio": pause_ratio,
        "jitter": jitter,
        "mfccs": mfccs,
        "duration": duration,
    }


def _extract_pitch(y: np.ndarray, sr: int) -> dict:
    """
    Extract fundamental frequency (F0) using librosa's pyin.
    Returns pitch statistics in Hz.
    """
    # Use pyin for robust pitch tracking
    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),  # ~65 Hz
        fmax=librosa.note_to_hz("C7"),  # ~2093 Hz
        sr=sr,
    )

    # Filter only voiced frames
    f0_voiced = f0[voiced_flag] if voiced_flag is not None else f0[~np.isnan(f0)]

    if len(f0_voiced) == 0:
        return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0}

    return {
        "mean": float(np.mean(f0_voiced)),
        "std": float(np.std(f0_voiced)),
        "min": float(np.min(f0_voiced)),
        "max": float(np.max(f0_voiced)),
    }


def _extract_energy(y: np.ndarray, sr: int) -> dict:
    """
    Extract RMS energy of the signal.
    Normalized to 0-1 range.
    """
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]

    return {
        "mean": float(np.mean(rms)),
        "max": float(np.max(rms)),
    }


def _estimate_speech_rate(y: np.ndarray, sr: int) -> float:
    """
    Estimate speech rate as syllables per second.
    Uses energy envelope peak detection as proxy for syllable nuclei.
    """
    # Get energy envelope
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=256)[0]

    # Smooth the envelope
    from scipy.ndimage import uniform_filter1d
    rms_smooth = uniform_filter1d(rms, size=10)

    # Find peaks (syllable nuclei)
    threshold = np.mean(rms_smooth) * 0.5
    peaks, _ = find_peaks(rms_smooth, height=threshold, distance=8)

    # Calculate rate
    duration = len(y) / sr
    if duration == 0:
        return 0.0

    syllables_per_second = len(peaks) / duration
    return round(float(syllables_per_second), 2)


def _calculate_pause_ratio(y: np.ndarray, sr: int) -> float:
    """
    Calculate ratio of silence/pauses to total audio duration.
    Uses energy-based voice activity detection.
    """
    # Frame-level energy
    frame_length = 2048
    hop_length = 512
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

    # Adaptive threshold (30% of mean energy)
    threshold = np.mean(rms) * 0.3

    # Count silent frames
    silent_frames = np.sum(rms < threshold)
    total_frames = len(rms)

    if total_frames == 0:
        return 0.0

    return round(float(silent_frames / total_frames), 3)


def _calculate_jitter(y: np.ndarray, sr: int) -> float:
    """
    Calculate jitter (pitch perturbation quotient).
    Measures cycle-to-cycle variation in fundamental frequency.
    Higher jitter = more vocal instability.
    """
    # Extract pitch periods
    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
        sr=sr,
    )

    f0_voiced = f0[voiced_flag] if voiced_flag is not None else f0[~np.isnan(f0)]

    if len(f0_voiced) < 3:
        return 0.0

    # Convert frequency to period (seconds)
    periods = 1.0 / f0_voiced

    # Calculate jitter as mean absolute difference between consecutive periods
    diffs = np.abs(np.diff(periods))
    jitter = float(np.mean(diffs) / np.mean(periods))

    return round(jitter, 4)


def _extract_mfccs(y: np.ndarray, sr: int) -> list:
    """
    Extract 13 Mel-Frequency Cepstral Coefficients (MFCCs).
    Returns mean of each coefficient across all frames.
    """
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_means = np.mean(mfccs, axis=1)

    return [round(float(x), 4) for x in mfcc_means]
