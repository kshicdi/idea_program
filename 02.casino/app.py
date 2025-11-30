#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
카지노 룰렛 게임 웹 서버
Flask를 사용하여 웹 애플리케이션을 제공합니다.
ngrok을 사용하여 인터넷에서 접속 가능합니다.
"""

from flask import Flask, send_from_directory
import os
import subprocess
import time
import json
import urllib.request
import webbrowser
import socket
from pathlib import Path

# 현재 스크립트가 있는 디렉토리를 기준으로 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Flask 앱 초기화
app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
app.config['JSON_AS_ASCII'] = False  # 한글 깨짐 방지

PORT = 3822
NGROK_API_URL = "http://127.0.0.1:4040/api/tunnels"


def get_local_ip():
    """로컬 IP 주소 가져오기"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def get_ngrok_url():
    """ngrok 터널 URL 가져오기"""
    try:
        time.sleep(2)  # ngrok이 시작될 시간을 줌
        response = urllib.request.urlopen(NGROK_API_URL, timeout=5)
        data = json.loads(response.read().decode())
        tunnels = data.get('tunnels', [])
        if tunnels:
            return tunnels[0].get('public_url')
    except Exception as e:
        print(f"ngrok URL 가져오기 실패: {e}")
    return None


def start_ngrok():
    """ngrok 터널 시작"""
    try:
        # ngrok이 이미 실행 중인지 확인
        try:
            urllib.request.urlopen(NGROK_API_URL, timeout=1)
            print("ngrok이 이미 실행 중입니다.")
            return True
        except:
            pass
        
        # ngrok 시작
        ngrok_process = subprocess.Popen(
            ['ngrok', 'http', str(PORT)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print("ngrok 터널을 시작했습니다...")
        return True
    except FileNotFoundError:
        print("⚠️  ngrok을 찾을 수 없습니다.")
        print("   ngrok을 설치하려면: https://ngrok.com/download")
        print("   또는 Homebrew: brew install ngrok")
        return False
    except Exception as e:
        print(f"⚠️  ngrok 시작 실패: {e}")
        return False


@app.route('/')
def index():
    """메인 페이지"""
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    """정적 파일 제공 (CSS, JS 등)"""
    return send_from_directory(BASE_DIR, filename)


if __name__ == '__main__':
    # 현재 스크립트의 디렉토리로 이동
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # ngrok 시작 (웹 접속용)
    ngrok_started = start_ngrok()
    public_url = None
    if ngrok_started:
        public_url = get_ngrok_url()
    
    local_ip = get_local_ip()
    local_url = f"http://localhost:{PORT}"
    network_url = f"http://{local_ip}:{PORT}"
    
    print("=" * 60)
    print("카지노 룰렛 게임 웹 서버가 시작되었습니다!")
    print("=" * 60)
    print(f"로컬 접속: {local_url}")
    print(f"네트워크 접속: {network_url}")
    
    if public_url:
        print(f"🌐 인터넷 접속: {public_url}")
        print("=" * 60)
        print("💡 이 주소로 어디서든 접속할 수 있습니다!")
        print("   (같은 WiFi 네트워크가 아니어도 됩니다)")
    else:
        print("=" * 60)
        print("⚠️  인터넷 접속을 사용하려면 ngrok이 필요합니다.")
        print("   같은 WiFi 네트워크에서는 위의 네트워크 접속 주소를 사용하세요.")
    
    print("=" * 60)
    print("모바일에서 접속하려면:")
    if public_url:
        print(f"  인터넷: {public_url} (어디서든 접속 가능)")
    print(f"  같은 WiFi: {network_url} (같은 네트워크 필요)")
    print("=" * 60)
    print("서버를 종료하려면 Ctrl+C를 누르세요.")
    print("=" * 60)
    
    # 브라우저 자동 열기
    try:
        if public_url:
            webbrowser.open(public_url)
        else:
            webbrowser.open(local_url)
    except:
        pass
    
    # Flask 서버 실행
    app.run(debug=True, host='0.0.0.0', port=PORT)
