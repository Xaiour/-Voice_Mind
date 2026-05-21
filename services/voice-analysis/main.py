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
    Returns: JSON with voice metrics, emotion scores, and indicators.
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

        return jsonify(analysis), 200

    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    app.run(host="0.0.0.0", port=port, debug=True)
