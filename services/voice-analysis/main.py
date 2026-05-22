"""
VoiceMind — Python Voice Analysis Microservice
Flask server for extracting voice biomarkers and emotional indicators.

Endpoints:
    POST /api/analyze — Upload audio file, returns emotional analysis JSON
    GET  /health     — Health check
"""

import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from feature_extractor import extract_voice_features
from emotion_detector import analyze_emotions

app = Flask(__name__)
CORS(app)

# Config
ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "webm", "m4a", "flac"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def allowed_file(filename):
    """Check if file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "voicemind-voice-analysis", "version": "1.0.0"})


@app.route("/api/analyze", methods=["POST"])
def analyze_audio():
    """
    Main analysis endpoint.
    Accepts: multipart/form-data with 'audio' file field.
    Returns: JSON matching the Express API's expected VoiceFeatures interface.
    """
    # Validate file exists
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided. Use 'audio' field."}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    # Save to temp file for processing
    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            file.save(tmp)
            temp_path = tmp.name

        # Stage 1: Extract voice biomarkers
        features = extract_voice_features(temp_path)

        # Stage 2: Analyze emotions from features
        analysis = analyze_emotions(features)

        # Stage 3: Format response to match Express API's VoiceFeatures interface
        # The Express API expects this exact shape:
        response = {
            "pitch": {
                "mean": features["pitch_mean"],
                "min": features["pitch_min"],
                "max": features["pitch_max"],
                "std": features["pitch_std"],
            },
            "energy": {
                "mean": features["energy_mean"],
                "max": features["energy_max"],
            },
            "speakingRate": features["speech_rate"],
            "pauseFrequency": features["pause_ratio"],
            "voiceQuality": round(1.0 - features["jitter"], 4),  # Invert jitter: lower jitter = higher quality
            "mfccFeatures": features["mfccs"],
            "transcript": "",  # No transcription in current pipeline
            "emotions": {
                "primary": analysis["emotion"],
                "confidence": analysis["confidence"],
                "distribution": {
                    "happy": _score_to_dist(analysis, "happy"),
                    "sad": _score_to_dist(analysis, "sad"),
                    "angry": _score_to_dist(analysis, "angry"),
                    "fearful": _score_to_dist(analysis, "fearful"),
                    "disgust": _score_to_dist(analysis, "disgust"),
                    "surprise": _score_to_dist(analysis, "surprise"),
                    "neutral": _score_to_dist(analysis, "neutral"),
                },
            },
            # Extra fields for direct use
            "stress_score": analysis["stress_score"],
            "anxiety_score": analysis["anxiety_score"],
            "depression_score": analysis["depression_score"],
            "duration": analysis["duration"],
            "indicators": analysis["indicators"],
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


def _score_to_dist(analysis: dict, emotion_name: str) -> float:
    """
    Convert stress/anxiety/depression scores into an emotion distribution.
    Maps clinical scores to discrete emotion probabilities (0.0-1.0).
    """
    stress = analysis["stress_score"] / 100.0
    anxiety = analysis["anxiety_score"] / 100.0
    depression = analysis["depression_score"] / 100.0
    calm = 1.0 - max(stress, anxiety, depression)

    if emotion_name == "happy":
        return round(max(0, calm * 0.7 - depression * 0.3), 3)
    elif emotion_name == "sad":
        return round(min(1.0, depression * 0.8), 3)
    elif emotion_name == "angry":
        return round(min(1.0, stress * 0.5), 3)
    elif emotion_name == "fearful":
        return round(min(1.0, anxiety * 0.7), 3)
    elif emotion_name == "disgust":
        return round(min(1.0, stress * 0.2 + depression * 0.1), 3)
    elif emotion_name == "surprise":
        return round(min(1.0, anxiety * 0.3), 3)
    elif emotion_name == "neutral":
        return round(max(0, calm * 0.8), 3)
    return 0.0


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    app.run(host="0.0.0.0", port=port, debug=True)
