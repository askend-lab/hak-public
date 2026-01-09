#!/usr/bin/env python3
"""
Merlin TTS Service - Simplified version for Sprint 01
"""

import os
import sys
import tempfile
import subprocess
import base64
from flask import Flask, request, jsonify, abort, send_file

app = Flask(__name__)

VERSION = "1.0.0-sprint01"
MERLIN_DIR = os.environ.get('MERLIN_DIR', '/home/merlin_user')
TEMP_DIR = os.path.join(MERLIN_DIR, 'temp')
SRC_DIR = os.path.join(MERLIN_DIR, 'src')

# Ensure temp directory exists
os.makedirs(TEMP_DIR, exist_ok=True)

@app.errorhandler(400)
def bad_request(e):
    return jsonify(error=str(e)), 400

@app.errorhandler(500)
def internal_error(e):
    return jsonify(error=str(e)), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "version": VERSION})

@app.route('/synthesize', methods=['POST'])
def synthesize():
    """
    Synthesize Estonian text to speech
    
    Request:
        POST /synthesize
        Content-Type: application/json
        {
            "text": "m<ees p<ee+ti k<in]ni",
            "voice": "efm_l",
            "returnBase64": true
        }
    
    Response (with returnBase64=true):
        {
            "audio": "base64_encoded_wav_data",
            "format": "wav"
        }
    """
    # Parse JSON
    try:
        data = request.get_json()
    except Exception as e:
        abort(400, description=f"Invalid JSON: {str(e)}")
    
    # Validate input
    if not data or 'text' not in data:
        abort(400, description="Missing 'text' field in request body")
    
    text = data['text']
    if not isinstance(text, str) or not text.strip():
        abort(400, description="'text' must be a non-empty string")
    
    # Get voice model
    voice = data.get('voice', 'efm_l')
    if voice not in ['efm_s', 'efm_l']:
        abort(400, description="'voice' must be 'efm_s' or 'efm_l'")
    
    # Get speed parameter (0.5 - 2.0, default 1.0)
    speed = data.get('speed', 1.0)
    if not isinstance(speed, (int, float)) or speed < 0.5 or speed > 2.0:
        abort(400, description="'speed' must be between 0.5 and 2.0")
    
    # Get pitch adjustment in Hz (-500 to +500, default 0)
    pitch = data.get('pitch', 0)
    if not isinstance(pitch, (int, float)) or pitch < -500 or pitch > 500:
        abort(400, description="'pitch' must be between -500 and +500 Hz")
    
    # Check if return base64
    return_base64 = data.get('returnBase64', True)
    
    try:
        # Create temporary files with UTF-8 encoding for Estonian characters
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, dir=TEMP_DIR, encoding='utf-8') as text_file:
            text_file.write(text)
            text_file_path = text_file.name
        
        wav_file_path = text_file_path.replace('.txt', '.wav')
        
        # Run Merlin synthesis
        cmd = [
            'python',
            os.path.join(SRC_DIR, 'run_merlin.py'),
            MERLIN_DIR,
            TEMP_DIR,
            voice,
            text_file_path,
            wav_file_path
        ]
        
        # Execute with conda environment
        # Note: capture_output not available in Python 3.6, use stdout/stderr
        result = subprocess.run(
            ['bash', '-c', f'source /home/merlin_user/miniconda3/etc/profile.d/conda.sh && conda activate mrln_et && {" ".join(cmd)}'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            timeout=30
        )
        
        if result.returncode != 0:
            raise Exception(f"Merlin synthesis failed: {result.stderr}")
        
        # Check if WAV file was created
        if not os.path.exists(wav_file_path):
            raise Exception("WAV file was not generated")
        
        # Apply post-processing with SOX if speed or pitch adjustments requested
        if speed != 1.0 or pitch != 0:
            processed_wav = wav_file_path.replace('.wav', '_processed.wav')
            sox_effects = []
            
            # Add tempo adjustment (preserves pitch)
            if speed != 1.0:
                sox_effects.append(f'tempo {speed}')
            
            # Add pitch adjustment (in Hz)
            if pitch != 0:
                sox_effects.append(f'pitch {int(pitch)}')
            
            # Run SOX with effects
            sox_cmd = f'sox {wav_file_path} {processed_wav} {" ".join(sox_effects)}'
            sox_result = subprocess.run(
                ['bash', '-c', sox_cmd],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                timeout=10
            )
            
            if sox_result.returncode != 0:
                raise Exception(f"SOX processing failed: {sox_result.stderr}")
            
            # Replace original with processed
            os.remove(wav_file_path)
            wav_file_path = processed_wav
        
        # Return WAV file
        if return_base64:
            with open(wav_file_path, 'rb') as f:
                audio_data = base64.b64encode(f.read()).decode('utf-8')
            
            # Cleanup
            os.remove(text_file_path)
            os.remove(wav_file_path)
            
            return jsonify({
                "audio": audio_data,
                "format": "wav"
            }), 200
        else:
            # Send file and cleanup after
            response = send_file(
                wav_file_path,
                mimetype='audio/wav',
                as_attachment=True,
                download_name='synthesis.wav'
            )
            
            # Cleanup temporary files
            @response.call_on_close
            def cleanup():
                try:
                    os.remove(text_file_path)
                    os.remove(wav_file_path)
                except:
                    pass
            
            return response
        
    except subprocess.TimeoutExpired:
        abort(500, description="Synthesis timeout (30s)")
    except Exception as e:
        # Cleanup on error
        try:
            if 'text_file_path' in locals():
                os.remove(text_file_path)
            if 'wav_file_path' in locals() and os.path.exists(wav_file_path):
                os.remove(wav_file_path)
        except:
            pass
        
        abort(500, description=f"Synthesis error: {str(e)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
