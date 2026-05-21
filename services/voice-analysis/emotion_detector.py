"""
Emotion Detection Module
Analyzes extracted voice features to detect mental health indicators.

Detects:
    - Depression markers (low pitch, low energy, slow speech, monotone)
    - Stress markers (high pitch variability, high energy, fast speech)
    - Anxiety markers (high pitch, jitter, rapid speech, short pauses)
    - Vocal instability (high jitter, pitch breaks)

Returns standardized scores (0-100) and primary emotion label.
"""

import numpy as np


def analyze_emotions(features: dict) -> dict:
    """
    Compute emotional scores from voice biomarkers.

    Args:
        features: Dict from feature_extractor.extract_voice_features()

    Returns:
        Standardized analysis result with scores, emotion, and metrics.
    """
    # Extract key metrics
    pitch = features["pitch_mean"]
    pitch_var = features["pitch_std"]
    speech_rate = features["speech_rate"]
    energy = features["energy_mean"]
    pause_ratio = features["pause_ratio"]
    jitter = features["jitter"]

    # ─── Compute Clinical Scores (0-100) ──────────────────────

    depression_score = _compute_depression_score(
        pitch, pitch_var, speech_rate, energy, pause_ratio
    )

    stress_score = _compute_stress_score(
        pitch, pitch_var, speech_rate, energy, jitter
    )

    anxiety_score = _compute_anxiety_score(
        pitch, pitch_var, speech_rate, pause_ratio, jitter
    )

    # ─── Determine Primary Emotion ────────────────────────────
    emotion, confidence = _determine_emotion(
        depression_score, stress_score, anxiety_score,
        pitch, energy, speech_rate, pause_ratio
    )

    # ─── Build Response ───────────────────────────────────────
    return {
        "stress_score": int(stress_score),
        "anxiety_score": int(anxiety_score),
        "depression_score": int(depression_score),
        "emotion": emotion,
        "confidence": round(confidence, 2),
        "metrics": {
            "pitch": round(pitch, 1),
            "pitch_variability": round(pitch_var, 1),
            "speech_rate": round(speech_rate, 2),
            "energy": round(energy, 4),
            "pause_ratio": round(pause_ratio, 3),
            "jitter": round(jitter, 4),
        },
        "mfccs": features.get("mfccs", []),
        "duration": round(features.get("duration", 0), 1),
        "indicators": _get_indicators(depression_score, stress_score, anxiety_score, jitter),
    }


def _compute_depression_score(
    pitch: float, pitch_var: float, speech_rate: float, energy: float, pause_ratio: float
) -> float:
    """
    Depression markers:
    - Low pitch (below ~130 Hz for general population)
    - Low pitch variability (monotone, flat affect)
    - Slow speech rate (< 3 syllables/sec)
    - Low vocal energy
    - High pause ratio (long silences, hesitation)
    """
    score = 0.0

    # Low pitch contribution (below 130 Hz is concerning)
    if pitch > 0:
        pitch_factor = max(0, (180 - pitch) / 180) * 100
        score += pitch_factor * 0.20

    # Low variability (monotone) — std < 20 Hz is flat
    if pitch_var < 25:
        mono_factor = max(0, (25 - pitch_var) / 25) * 100
        score += mono_factor * 0.20

    # Slow speech
    if speech_rate < 4.0:
        slow_factor = max(0, (4.0 - speech_rate) / 4.0) * 100
        score += slow_factor * 0.20

    # Low energy
    if energy < 0.1:
        energy_factor = max(0, (0.1 - energy) / 0.1) * 100
        score += energy_factor * 0.20

    # High pause ratio (lots of silence/hesitation)
    if pause_ratio > 0.3:
        pause_factor = min(1.0, (pause_ratio - 0.3) / 0.4) * 100
        score += pause_factor * 0.20

    return min(100, max(0, score))


def _compute_stress_score(
    pitch: float, pitch_var: float, speech_rate: float, energy: float, jitter: float
) -> float:
    """
    Stress markers:
    - High pitch (raised from baseline)
    - High pitch variability (erratic)
    - Fast speech rate (> 5 syllables/sec)
    - High vocal energy (tense)
    - Elevated jitter (vocal tension)
    """
    score = 0.0

    # High pitch
    if pitch > 160:
        pitch_factor = min(1.0, (pitch - 160) / 150) * 100
        score += pitch_factor * 0.20

    # High variability
    if pitch_var > 30:
        var_factor = min(1.0, (pitch_var - 30) / 50) * 100
        score += var_factor * 0.20

    # Fast speech
    if speech_rate > 4.5:
        fast_factor = min(1.0, (speech_rate - 4.5) / 3.0) * 100
        score += fast_factor * 0.20

    # High energy
    if energy > 0.08:
        energy_factor = min(1.0, (energy - 0.08) / 0.15) * 100
        score += energy_factor * 0.20

    # Jitter (vocal tension)
    if jitter > 0.02:
        jitter_factor = min(1.0, (jitter - 0.02) / 0.05) * 100
        score += jitter_factor * 0.20

    return min(100, max(0, score))


def _compute_anxiety_score(
    pitch: float, pitch_var: float, speech_rate: float, pause_ratio: float, jitter: float
) -> float:
    """
    Anxiety markers:
    - Elevated pitch (nervous tension)
    - High pitch variability (wavering voice)
    - Rapid speech (rushing)
    - Low pause ratio (barely pausing, verbal flood)
    - High jitter (tremor in voice)
    """
    score = 0.0

    # Elevated pitch
    if pitch > 150:
        pitch_factor = min(1.0, (pitch - 150) / 120) * 100
        score += pitch_factor * 0.20

    # Pitch instability
    if pitch_var > 25:
        var_factor = min(1.0, (pitch_var - 25) / 40) * 100
        score += var_factor * 0.20

    # Rapid speech
    if speech_rate > 5.0:
        fast_factor = min(1.0, (speech_rate - 5.0) / 3.0) * 100
        score += fast_factor * 0.25

    # Very few pauses (anxiety = continuous speech)
    if pause_ratio < 0.2:
        pause_factor = max(0, (0.2 - pause_ratio) / 0.2) * 100
        score += pause_factor * 0.15

    # Jitter (vocal tremor)
    if jitter > 0.025:
        jitter_factor = min(1.0, (jitter - 0.025) / 0.04) * 100
        score += jitter_factor * 0.20

    return min(100, max(0, score))


def _determine_emotion(
    depression: float, stress: float, anxiety: float,
    pitch: float, energy: float, speech_rate: float, pause_ratio: float
) -> tuple:
    """
    Determine primary emotional state and confidence from scores.
    """
    scores = {
        "depression": depression,
        "stress": stress,
        "anxiety": anxiety,
    }

    max_score = max(scores.values())
    dominant = max(scores, key=scores.get)

    # Determine emotion label based on combined signals
    if max_score < 20:
        emotion = "calm and stable"
        confidence = 0.85
    elif depression > 60 and energy < 0.05:
        emotion = "emotionally fatigued"
        confidence = 0.89
    elif depression > 50:
        emotion = "low mood / withdrawn"
        confidence = 0.82
    elif stress > 70 and anxiety > 50:
        emotion = "highly stressed and anxious"
        confidence = 0.87
    elif stress > 60:
        emotion = "stressed / tense"
        confidence = 0.84
    elif anxiety > 60:
        emotion = "anxious / restless"
        confidence = 0.83
    elif stress > 40 and depression > 40:
        emotion = "emotionally fatigued"
        confidence = 0.80
    elif anxiety > 40 and speech_rate > 5:
        emotion = "nervous / agitated"
        confidence = 0.78
    else:
        emotion = "mildly unsettled"
        confidence = 0.72

    # Adjust confidence based on audio quality / feature reliability
    if pitch == 0:
        confidence *= 0.5  # Couldn't detect pitch = low confidence

    return emotion, round(min(0.99, confidence), 2)


def _get_indicators(depression: float, stress: float, anxiety: float, jitter: float) -> list:
    """
    Generate clinical indicator flags based on thresholds.
    """
    indicators = []

    if depression > 60:
        indicators.append("depression_risk")
    if stress > 60:
        indicators.append("elevated_stress")
    if anxiety > 60:
        indicators.append("anxiety_markers")
    if jitter > 0.04:
        indicators.append("vocal_instability")
    if depression > 40 and stress > 40:
        indicators.append("emotional_exhaustion")

    return indicators
