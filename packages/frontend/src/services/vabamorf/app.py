#!/usr/bin/env python3
"""
Vabamorf Stress Marking Service
Simplified Flask API for Estonian text stress marking
"""

import subprocess
import json
import os
from flask import Flask, request, jsonify, abort

# Start vmetajson process
# Flags will be passed via JSON params field
proc = subprocess.Popen(
    ['./vmetajson', '--path=.'],
    universal_newlines=True,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.DEVNULL
)

app = Flask(__name__)

VERSION = "1.0.0-sprint01"
MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 1_000_000))  # 1MB default

@app.errorhandler(413)
def request_too_large(e):
    return jsonify(error="Request too large"), 413

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

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze Estonian text and return stress-marked version
    
    Request:
        POST /analyze
        Content-Type: application/json
        {
            "text": "Mees peeti kinni"
        }
    
    Response:
        {
            "stressedText": "m<ees p<ee+ti k<in]ni"
        }
    """
    # Check content length
    if request.content_length and request.content_length > MAX_CONTENT_LENGTH:
        abort(413)
    
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
    
    # Create JSON input for vmetajson with params
    vmetajson_input = {
        "params": {
            "vmetajson": ["--stem", "--addphonetics"]
        },
        "content": text
    }
    
    try:
        # Send to vmetajson
        proc.stdin.write(f'{json.dumps(vmetajson_input)}\n')
        proc.stdin.flush()
        
        # Read response
        response_line = proc.stdout.readline()
        response_json = json.loads(response_line)
        
        # Extract stressed text from tokens
        # vmetajson returns morphological analysis, we need to extract stems with phonetics
        stressed_tokens = []
        if 'annotations' in response_json and 'tokens' in response_json['annotations']:
            for token_data in response_json['annotations']['tokens']:
                if 'features' in token_data and 'mrf' in token_data['features']:
                    mrf_list = token_data['features']['mrf']
                    if mrf_list and len(mrf_list) > 0:
                        # Take first analysis variant, combine stem+ending
                        first_variant = mrf_list[0]
                        if 'stem' in first_variant:
                            stem = first_variant['stem']
                            ending = first_variant.get('ending', '')
                            if ending and ending != '0':
                                stressed_tokens.append(f"{stem}+{ending}")
                            else:
                                stressed_tokens.append(stem)
                        else:
                            # Fallback to original token
                            stressed_tokens.append(token_data['features']['token'])
                    else:
                        # No analysis, use original
                        stressed_tokens.append(token_data['features']['token'])
                else:
                    # No features, use original token
                    if 'features' in token_data and 'token' in token_data['features']:
                        stressed_tokens.append(token_data['features']['token'])
        
        stressed_text = ' '.join(stressed_tokens) if stressed_tokens else text
        
        return jsonify({
            "stressedText": stressed_text,
            "originalText": text
        }), 200
        
    except Exception as e:
        abort(500, description=f"Processing error: {str(e)}")

@app.route('/variants', methods=['POST'])
def variants():
    """
    Get phonetic variants for a single word

    Request:
        POST /variants
        Content-Type: application/json
        {
            "word": "noormees"
        }

    Response:
        {
            "word": "noormees",
            "variants": [
                {
                    "text": "n<oor_m<ees",
                    "description": "tavaline (kolmas välde)",
                    "morphology": {...}
                },
                ...
            ]
        }
    """
    # Check content length
    if request.content_length and request.content_length > MAX_CONTENT_LENGTH:
        abort(413)

    # Parse JSON
    try:
        data = request.get_json()
    except Exception as e:
        abort(400, description=f"Invalid JSON: {str(e)}")

    # Validate input
    if not data or 'word' not in data:
        abort(400, description="Missing 'word' field in request body")

    word = data['word']
    if not isinstance(word, str) or not word.strip():
        abort(400, description="'word' must be a non-empty string")

    # Create JSON input for vmetajson with params
    vmetajson_input = {
        "params": {
            "vmetajson": ["--stem", "--addphonetics"]
        },
        "content": word
    }

    try:
        # Send to vmetajson
        proc.stdin.write(f'{json.dumps(vmetajson_input)}\n')
        proc.stdin.flush()

        # Read response
        response_line = proc.stdout.readline()
        response_json = json.loads(response_line)

        # Extract all morphological variants with phonetics
        variants = []

        if 'annotations' in response_json and 'tokens' in response_json['annotations']:
            for token_data in response_json['annotations']['tokens']:
                if 'features' in token_data and 'mrf' in token_data['features']:
                    mrf_list = token_data['features']['mrf']

                    # Process each morphological variant
                    for idx, mrf_variant in enumerate(mrf_list):
                        if 'stem' in mrf_variant:
                            stem = mrf_variant['stem']
                            ending = mrf_variant.get('ending', '')
                            pos = mrf_variant.get('pos', '')
                            lemma = mrf_variant.get('lemma', '')
                            fs = mrf_variant.get('fs', '')

                            # Construct phonetic text
                            if ending and ending != '0':
                                phonetic_text = f"{stem}+{ending}"
                            else:
                                phonetic_text = stem

                            # Create description based on morphology
                            description_parts = []

                            # Add lemma if different from word
                            if lemma and lemma.lower() != word.lower():
                                description_parts.append(f"lemma: {lemma}")

                            # Add part of speech
                            pos_map = {
                                'S': 'nimisõna',
                                'V': 'tegusõna',
                                'A': 'omadussõna',
                                'D': 'määrsõna',
                                'P': 'asesõna',
                                'K': 'sidesõna',
                                'J': 'kaassõna',
                                'I': 'hüüdsõna',
                                'Y': 'lühend'
                            }
                            if pos in pos_map:
                                description_parts.append(pos_map[pos])

                            # Add grammatical features
                            if fs:
                                description_parts.append(fs)

                            description = ', '.join(description_parts) if description_parts else 'tavaline'

                            # Add variant
                            variant_entry = {
                                "text": phonetic_text,
                                "description": description,
                                "morphology": {
                                    "lemma": lemma,
                                    "pos": pos,
                                    "fs": fs,
                                    "stem": stem,
                                    "ending": ending
                                }
                            }

                            # Avoid duplicates
                            if not any(v['text'] == phonetic_text and v['description'] == description for v in variants):
                                variants.append(variant_entry)

        # If no variants found, return error
        if not variants:
            abort(500, description="No phonetic variants found for the word")

        return jsonify({
            "word": word,
            "variants": variants
        }), 200

    except Exception as e:
        abort(500, description=f"Processing error: {str(e)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)

