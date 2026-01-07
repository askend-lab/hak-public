#!/usr/bin/env python3
"""
Merlin TTS SQS Worker
Polls SQS queue, synthesizes audio with Merlin, uploads to S3
"""

import os
import sys
import json
import time
import tempfile
import subprocess
import hashlib
import boto3
from botocore.exceptions import ClientError

# Configuration from environment
SQS_QUEUE_URL = os.environ.get('SQS_QUEUE_URL', '')
S3_BUCKET = os.environ.get('S3_BUCKET', '')
AWS_REGION = os.environ.get('AWS_REGION', 'eu-west-1')
MERLIN_DIR = os.environ.get('MERLIN_DIR', '/home/merlin_user/merlin_repo')
TEMP_DIR = '/home/merlin_user/temp'
SRC_DIR = os.path.join(MERLIN_DIR, 'src')

# AWS clients
sqs = boto3.client('sqs', region_name=AWS_REGION)
s3 = boto3.client('s3', region_name=AWS_REGION)

os.makedirs(TEMP_DIR, exist_ok=True)


def log(message):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {message}", flush=True)


def check_tools():
    """Check if required tools are available"""
    tools_dir = os.path.join(MERLIN_DIR, 'tools')
    bin_dir = os.path.join(tools_dir, 'bin')
    
    log(f"PATH: {os.environ.get('PATH', 'NOT SET')}")
    log(f"MERLIN_DIR: {MERLIN_DIR}")
    log(f"Tools dir exists: {os.path.exists(tools_dir)}")
    log(f"Bin dir exists: {os.path.exists(bin_dir)}")
    
    # Check SPTK
    sptk_bin = os.path.join(bin_dir, 'SPTK-3.9')
    if os.path.exists(sptk_bin):
        files = os.listdir(sptk_bin)
        log(f"SPTK-3.9 bin: {len(files)} files")
        # Check for key binary
        if 'x2x' in files:
            log("SPTK x2x: OK")
        else:
            log("SPTK x2x: MISSING!")
    else:
        log(f"SPTK-3.9 bin dir MISSING: {sptk_bin}")
    
    # Check WORLD
    world_bin = os.path.join(bin_dir, 'WORLD')
    if os.path.exists(world_bin):
        files = os.listdir(world_bin)
        log(f"WORLD bin: {files}")
    else:
        log(f"WORLD bin dir MISSING: {world_bin}")
    
    # Check genlab
    genlab_bin = os.path.join(tools_dir, 'genlab', 'bin')
    if os.path.exists(genlab_bin):
        files = os.listdir(genlab_bin)
        log(f"genlab bin: {files}")
    else:
        log(f"genlab bin dir MISSING: {genlab_bin}")


# Run diagnostics at startup
check_tools()


def synthesize_audio(text, voice='efm_l', speed=1.0, pitch=0):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, 
                                      dir=TEMP_DIR, encoding='utf-8') as f:
        f.write(text)
        text_file = f.name
    
    wav_file = text_file.replace('.txt', '.wav')
    
    try:
        cmd = ['python', os.path.join(SRC_DIR, 'run_merlin.py'),
               MERLIN_DIR, TEMP_DIR, voice, text_file, wav_file]
        
        result = subprocess.run(
            ['bash', '-c', 
             f'source /home/merlin_user/miniconda3/etc/profile.d/conda.sh && '
             f'conda activate mrln_et && {" ".join(cmd)}'],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            universal_newlines=True, timeout=60)
        
        if result.returncode != 0:
            raise Exception(f"Merlin failed: {result.stderr}")
        
        if not os.path.exists(wav_file):
            raise Exception("WAV not generated")
        
        if speed != 1.0 or pitch != 0:
            processed = wav_file.replace('.wav', '_proc.wav')
            effects = []
            if speed != 1.0: effects.append(f'tempo {speed}')
            if pitch != 0: effects.append(f'pitch {int(pitch)}')
            subprocess.run(['bash', '-c', f'sox {wav_file} {processed} {" ".join(effects)}'],
                          timeout=30)
            if os.path.exists(processed):
                os.remove(wav_file)
                wav_file = processed
        
        with open(wav_file, 'rb') as f:
            return f.read()
    finally:
        for f in [text_file, wav_file, wav_file.replace('.wav', '_proc.wav')]:
            try: os.remove(f)
            except: pass


def upload_to_s3(audio_data, cache_key):
    s3_key = f"cache/{cache_key}.wav"
    s3.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=audio_data, ContentType='audio/wav')
    return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"


def process_message(message):
    try:
        body = json.loads(message['Body'])
        text = body.get('text', '')
        voice = body.get('voice', 'efm_l')
        speed = body.get('speed', 1.0)
        pitch = body.get('pitch', 0)
        cache_key = body.get('cacheKey', hashlib.md5(text.encode()).hexdigest())
        
        log(f"Processing: {cache_key}, text=\"{text[:50]}...\"")
        audio = synthesize_audio(text, voice, speed, pitch)
        log(f"Synthesized: {len(audio)} bytes")
        
        url = upload_to_s3(audio, cache_key)
        log(f"Uploaded: {url}")
        
        sqs.delete_message(QueueUrl=SQS_QUEUE_URL, ReceiptHandle=message['ReceiptHandle'])
        return True
    except Exception as e:
        log(f"ERROR: {e}")
        return False


def main():
    log("Merlin SQS Worker starting...")
    log(f"Queue: {SQS_QUEUE_URL}, Bucket: {S3_BUCKET}")
    
    if not SQS_QUEUE_URL or not S3_BUCKET:
        log("ERROR: Missing SQS_QUEUE_URL or S3_BUCKET")
        sys.exit(1)
    
    while True:
        try:
            resp = sqs.receive_message(QueueUrl=SQS_QUEUE_URL, MaxNumberOfMessages=1,
                                       WaitTimeSeconds=20, VisibilityTimeout=300)
            for msg in resp.get('Messages', []):
                process_message(msg)
        except KeyboardInterrupt:
            break
        except Exception as e:
            log(f"ERROR: {e}")
            time.sleep(5)


if __name__ == '__main__':
    main()
