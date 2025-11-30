# Render 배포 가이드

이 문서는 카지노 룰렛 게임을 Render에 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. **GitHub 계정** (이미 있음)
2. **Render 계정** (https://render.com 에서 무료 가입)

## 🚀 배포 단계

### 1단계: GitHub에 코드 업로드

```bash
# 이미 GitHub 저장소가 연결되어 있다면
cd /Users/dx/Documents/아이디어프로그램
git add "02.카지노어플/"
git commit -m "Add casino roulette game for Render deployment"
git push

# Git 저장소가 없다면
git init
git remote add origin https://github.com/사용자명/저장소명.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### 2단계: Render에서 웹 서비스 생성

1. **Render 대시보드 접속**
   - https://dashboard.render.com 접속
   - GitHub 계정으로 로그인

2. **새 웹 서비스 생성**
   - "New +" 버튼 클릭
   - "Web Service" 선택

3. **GitHub 저장소 연결**
   - "Connect account" 또는 "Connect repository" 클릭
   - GitHub 저장소 선택
   - "Connect" 클릭

4. **서비스 설정**
   ```
   Name: casino-roulette-game (원하는 이름)
   Region: Singapore (한국과 가까움)
   Branch: main (또는 master)
   Root Directory: 02.카지노어플  (또는 영문 폴더명으로 변경)
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: (Procfile 사용 시 자동 설정됨)
   ```

5. **고급 설정 (Advanced)**
   - Auto-Deploy: Yes (GitHub 푸시 시 자동 배포)
   - Health Check Path: `/`

6. **"Create Web Service" 클릭**

### 3단계: 배포 확인

1. **배포 로그 확인**
   - Render 대시보드 → "Logs" 탭
   - 빌드 및 실행 로그 확인

2. **서비스 URL 확인**
   - Render 대시보드 → "Settings" 탭
   - "Service URL" 확인 (예: `https://casino-roulette-game.onrender.com`)

3. **접속 테스트**
   - 브라우저에서 서비스 URL 접속
   - 카지노 게임이 정상적으로 표시되는지 확인

## 🔧 문제 해결

### 빌드 실패
- **원인**: 의존성 설치 실패
- **해결**: `requirements.txt` 확인, Python 버전 확인 (`runtime.txt`)

### 서비스 시작 실패
- **원인**: PORT 환경변수 미설정 또는 gunicorn 미설치
- **해결**: `Procfile` 확인, `requirements.txt`에 `gunicorn` 포함 확인

### 15분 비활성 후 접속 지연
- **원인**: Render 무료 티어의 sleep 기능
- **해결**: 유료 플랜 업그레이드 또는 접속자 2명이면 문제 없음

## 📝 유지보수

### 코드 업데이트
```bash
git add .
git commit -m "Update code"
git push
```
→ Render가 자동으로 재배포합니다.

### 로그 확인
- Render 대시보드 → "Logs" 탭에서 실시간 로그 확인

## 💰 비용

- **무료 티어**: 
  - 15분 비활성 시 sleep
  - 750시간/월 무료
  - 접속자 2명이면 충분

- **Starter 플랜** ($7/월):
  - Sleep 없음
  - 더 빠른 응답
  - 필요시 업그레이드

## 🔗 유용한 링크

- Render 문서: https://render.com/docs
- Flask 배포 가이드: https://render.com/docs/deploy-flask
- 지원: https://render.com/docs/support

