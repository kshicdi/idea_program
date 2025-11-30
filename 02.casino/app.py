#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
카지노 룰렛 게임 웹 서버
Flask를 사용하여 웹 애플리케이션을 제공합니다.
"""

from flask import Flask, send_from_directory
import os
from pathlib import Path

# 현재 스크립트의 디렉토리를 기준으로 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Flask 앱 초기화
app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
app.config['JSON_AS_ASCII'] = False  # 한글 깨짐 방지


@app.route('/')
def index():
    """메인 페이지"""
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    """정적 파일 제공 (CSS, JS 등)"""
    return send_from_directory(BASE_DIR, filename)


if __name__ == '__main__':
    # 로컬 실행 시
    port = int(os.environ.get('PORT', 3822))
    app.run(debug=True, host='0.0.0.0', port=port)
else:
    # Render 등 클라우드 환경에서 실행 시
    port = int(os.environ.get('PORT', 10000))
    app.run(debug=False, host='0.0.0.0', port=port)
