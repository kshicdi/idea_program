// 유럽식 룰렛 색상 정보 (0-36)
const europeanRouletteColors = {
    0: 'green',  // 0은 녹색
    1: 'red', 3: 'red', 5: 'red', 7: 'red', 9: 'red',
    12: 'red', 14: 'red', 16: 'red', 18: 'red', 19: 'red',
    21: 'red', 23: 'red', 25: 'red', 27: 'red', 30: 'red',
    32: 'red', 34: 'red', 36: 'red',
    // 나머지는 모두 검은색
    2: 'black', 4: 'black', 6: 'black', 8: 'black', 10: 'black',
    11: 'black', 13: 'black', 15: 'black', 17: 'black', 20: 'black',
    22: 'black', 24: 'black', 26: 'black', 28: 'black', 29: 'black',
    31: 'black', 33: 'black', 35: 'black'
};

// 미국식 룰렛 색상 정보 (0, 00 포함)
const americanRouletteColors = {
    ...europeanRouletteColors,
    37: 'green'  // 00은 37로 표현
};

// 게임 상태 관리
const gameState = {
    rouletteType: 'european',  // 'european' or 'american'
    recentResults: [],
    previousStates: [],  // 취소를 위한 이전 상태 저장
    budget: {
        initial: 0,
        remaining: 0
    },
    martingale: {
        maxConsecutiveLosses: 4  // 연속 패배 횟수 제한 (기본값: 4회)
    },
    highlow: {
        initialBet: 5,
        currentBet: 5,
        currentPosition: null,  // 현재 배팅 위치
        queue: [],
        currentIndex: 0,
        history: [],
        consecutiveLosses: 0
    },
    color: {
        initialBet: 5,
        currentBet: 5,
        currentPosition: null,  // 현재 배팅 위치
        queue: [],
        currentIndex: 0,
        history: [],
        consecutiveLosses: 0
    },
    oddeven: {
        initialBet: 5,
        currentBet: 5,
        currentPosition: null,  // 현재 배팅 위치
        queue: [],
        currentIndex: 0,
        history: [],
        consecutiveLosses: 0
    },
    number: {
        initialBet: 1,
        currentBet: 1,
        currentPosition: null,  // 현재 배팅 숫자
        queue: [],
        currentIndex: 0,
        history: [],
        consecutiveLosses: 0
    }
};

// 게임 타입별 배팅 위치 옵션
const bettingOptions = {
    highlow: ['대(19-36)', '소(1-18)'],
    color: ['블랙', '레드'],
    oddeven: ['홀', '짝'],
    number: []  // 숫자는 직접 입력
};

// 룰렛 타입 변경
function changeRouletteType() {
    const typeSelect = document.getElementById('roulette-type') || document.getElementById('settings-roulette-type');
    if (!typeSelect) return;
    
    const type = typeSelect.value;
    gameState.rouletteType = type;
    
    // 두 입력 필드 모두 업데이트
    const numberInput = document.getElementById('roulette-number');
    const mobileNumberInput = document.getElementById('mobile-roulette-number');
    
    if (type === 'american') {
        if (numberInput) {
            numberInput.max = 37;  // 00은 37로 표현
            numberInput.placeholder = '0-36, 00(37)';
        }
        if (mobileNumberInput) {
            mobileNumberInput.max = 37;
            mobileNumberInput.placeholder = '0-36, 00(37)';
        }
    } else {
        if (numberInput) {
            numberInput.max = 36;
            numberInput.placeholder = '0-36';
        }
        if (mobileNumberInput) {
            mobileNumberInput.max = 36;
            mobileNumberInput.placeholder = '0-36';
        }
    }
    
    // 룰렛 그리드 다시 생성
    createRouletteGrid();
    
    // 설정 탭의 선택도 동기화
    const settingsSelect = document.getElementById('settings-roulette-type');
    const gameSelect = document.getElementById('roulette-type');
    if (settingsSelect && gameSelect) {
        settingsSelect.value = type;
        gameSelect.value = type;
    }
}

// 메인 탭 전환
function showMainTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택한 탭 활성화
    const activeBtn = Array.from(document.querySelectorAll('.main-tab-btn')).find(btn => 
        btn.getAttribute('onclick').includes(`'${tabName}'`)
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// 게임 상태 복사 함수
function saveGameState() {
    return {
        budget: {
            initial: gameState.budget.initial,
            remaining: gameState.budget.remaining
        },
        highlow: {
            initialBet: gameState.highlow.initialBet,
            currentBet: gameState.highlow.currentBet,
            currentPosition: gameState.highlow.currentPosition,
            consecutiveLosses: gameState.highlow.consecutiveLosses,
            historyLength: gameState.highlow.history.length
        },
        color: {
            initialBet: gameState.color.initialBet,
            currentBet: gameState.color.currentBet,
            currentPosition: gameState.color.currentPosition,
            consecutiveLosses: gameState.color.consecutiveLosses,
            historyLength: gameState.color.history.length
        },
        oddeven: {
            initialBet: gameState.oddeven.initialBet,
            currentBet: gameState.oddeven.currentBet,
            currentPosition: gameState.oddeven.currentPosition,
            consecutiveLosses: gameState.oddeven.consecutiveLosses,
            historyLength: gameState.oddeven.history.length
        },
        number: {
            initialBet: gameState.number.initialBet,
            currentBet: gameState.number.currentBet,
            currentPosition: gameState.number.currentPosition,
            consecutiveLosses: gameState.number.consecutiveLosses,
            historyLength: gameState.number.history.length
        },
        recentResultsLength: gameState.recentResults.length
    };
}

// 룰렛 결과 입력
function inputRouletteResult() {
    const numberInput = document.getElementById('roulette-number');
    let number = parseInt(numberInput.value);
    
    if (isNaN(number)) {
        alert('숫자를 입력해주세요.');
        return;
    }
    
    const rouletteType = gameState.rouletteType;
    const maxNumber = rouletteType === 'american' ? 37 : 36;
    
    if (number < 0 || number > maxNumber) {
        alert(`0부터 ${maxNumber}까지의 숫자를 입력해주세요.`);
        return;
    }
    
    // 결과 입력 전 상태 저장 (취소를 위해)
    const previousState = saveGameState();
    gameState.previousStates.push(previousState);
    
    // 결과 분석
    const result = analyzeRouletteResult(number, rouletteType);
    
    // 최근 결과에 추가
    gameState.recentResults.unshift({
        number: number === 37 ? '00' : number,
        color: result.color,
        highlow: result.highlow,
        oddeven: result.oddeven,
        timestamp: new Date().toLocaleTimeString('ko-KR')
    });
    
    // 최대 10개만 유지
    if (gameState.recentResults.length > 10) {
        gameState.recentResults.pop();
    }
    
    // 최근 결과 표시 업데이트
    updateRecentResults();
    
    // 각 게임의 결과 자동 처리
    processGameResults(result);
    
    // 입력 필드 초기화
    numberInput.value = '';
    numberInput.focus();
}

// 룰렛 결과 분석
function analyzeRouletteResult(number, rouletteType) {
    const colors = rouletteType === 'american' ? americanRouletteColors : europeanRouletteColors;
    
    // 0 또는 00 처리
    if (number === 0 || number === 37) {
        return {
            number: number === 37 ? '00' : 0,
            color: 'green',
            highlow: null,  // 0은 대소 판단 불가
            oddeven: null   // 0은 홀짝 판단 불가
        };
    }
    
    const color = colors[number] || 'black';
    const highlow = number >= 19 ? 'high' : 'low';
    const oddeven = number % 2 === 1 ? 'odd' : 'even';
    
    return {
        number: number,
        color: color,
        highlow: highlow,
        oddeven: oddeven
    };
}

// 최근 결과 표시 업데이트
function updateRecentResults() {
    const resultsList = document.getElementById('recent-results-list');
    const undoBtn = document.getElementById('undo-btn');
    const mobileUndoBtn = document.getElementById('mobile-undo-btn');
    
    if (gameState.recentResults.length === 0) {
        resultsList.innerHTML = '<div class="empty-queue">결과가 없습니다</div>';
        if (undoBtn) undoBtn.disabled = true;
        if (mobileUndoBtn) mobileUndoBtn.disabled = true;
        return;
    }
    
    if (undoBtn) undoBtn.disabled = false;
    if (mobileUndoBtn) mobileUndoBtn.disabled = false;
    
    resultsList.innerHTML = gameState.recentResults.map((result, index) => {
        const colorClass = result.color === 'red' ? 'red' : result.color === 'black' ? 'black' : 'green';
        const colorText = result.color === 'red' ? '레드' : result.color === 'black' ? '블랙' : '녹색';
        const highlowText = result.highlow === 'high' ? '대' : result.highlow === 'low' ? '소' : '-';
        const oddevenText = result.oddeven === 'odd' ? '홀' : result.oddeven === 'even' ? '짝' : '-';
        
        return `
            <div class="result-item ${colorClass}">
                <span class="result-number">${result.number}</span>
                <span class="result-info">
                    <span>${colorText}</span>
                    <span>${highlowText}</span>
                    <span>${oddevenText}</span>
                </span>
                <span class="result-time">${result.timestamp}</span>
            </div>
        `;
    }).join('');
}

// 마지막 결과 취소 (복구)
function undoLastResult() {
    if (gameState.previousStates.length === 0 || gameState.recentResults.length === 0) {
        alert('취소할 결과가 없습니다.');
        return;
    }
    
    if (!confirm('마지막 결과를 취소하시겠습니까? 모든 게임의 상태가 이전 상태로 복구됩니다.')) {
        return;
    }
    
    // 이전 상태 가져오기
    const previousState = gameState.previousStates.pop();
    
    // 예산 복구
    gameState.budget.initial = previousState.budget.initial;
    gameState.budget.remaining = previousState.budget.remaining;
    
    // 각 게임 상태 복구
    ['highlow', 'color', 'oddeven'].forEach(gameType => {
        const state = gameState[gameType];
        const prevState = previousState[gameType];
        
        state.currentBet = prevState.currentBet;
        state.currentPosition = prevState.currentPosition;
        state.consecutiveLosses = prevState.consecutiveLosses;
        
        // 히스토리에서 마지막 항목 제거
        const currentHistoryLength = state.history.length;
        const prevHistoryLength = prevState.historyLength;
        if (currentHistoryLength > prevHistoryLength) {
            state.history.pop();
        }
    });
    
    // 최근 결과에서 마지막 항목 제거
    gameState.recentResults.shift();
    
    // UI 업데이트
    updateBudgetDisplay();
    updateRecentResults();
    updateAllBettingInfo();
    
    // 각 게임의 히스토리 표시 업데이트
    ['highlow', 'color', 'oddeven', 'number'].forEach(gameType => {
        showHistory(gameType);
        updateQueueDisplay(gameType);
    });
    
    // 상단 승패 상태 업데이트
    updateResultStatus();
    
    alert('마지막 결과가 취소되었습니다.');
}

// 예산 설정
function setBudget() {
    const input = document.getElementById('budget-input');
    if (!input) {
        return;
    }

    const amount = parseInt(input.value, 10);
    if (isNaN(amount) || amount <= 0) {
        alert('0보다 큰 예산을 입력해주세요.');
        return;
    }

    gameState.budget.initial = amount;
    gameState.budget.remaining = amount;
    updateBudgetDisplay();
}

// 예산 초기화 (남은 예산만 리셋)
function resetBudget() {
    if (gameState.budget.initial <= 0) {
        alert('먼저 예산을 설정해주세요.');
        return;
    }

    if (confirm('남은 예산을 초기 예산으로 되돌릴까요?')) {
        gameState.budget.remaining = gameState.budget.initial;
        updateBudgetDisplay();
    }
}

// 마틴게일 최대값 추천 계산
function recommendMartingaleMax() {
    const hoursInput = document.getElementById('recommend-hours');
    const resultEl = document.getElementById('martingale-recommendation-result');
    
    if (!hoursInput || !resultEl) return;
    
    // 저장된 예산 값 사용
    const budget = gameState.budget.initial;
    
    if (budget <= 0) {
        alert('먼저 위의 예산 설정에서 예산을 입력해주세요.');
        return;
    }
    
    const hours = parseFloat(hoursInput.value);
    
    if (isNaN(hours) || hours <= 0) {
        alert('게임 시간을 올바르게 입력해주세요.');
        return;
    }
    
    // 최소 배팅 금액 가져오기
    const minBet = Math.min(
        gameState.highlow.initialBet,
        gameState.color.initialBet,
        gameState.oddeven.initialBet
    );
    
    if (minBet <= 0) {
        alert('먼저 초기 배팅 금액을 설정해주세요.');
        return;
    }
    
    // 게임 시간당 예상 게임 횟수 (분당 1-2회 정도로 가정, 보수적으로 1회/분)
    const gamesPerMinute = 1;
    const totalGames = Math.floor(hours * 60 * gamesPerMinute);
    
    // 연속 패배 시 총 소모 금액 계산 함수
    // N회 연속 패배 시 총 소모 금액 = 초기 배팅 × (2^(N+1) - 1)
    function calculateTotalLoss(losses) {
        return minBet * (Math.pow(2, losses + 1) - 1);
    }
    
    // 예산의 80%를 안전 마진으로 사용 (20% 여유)
    const safeBudget = budget * 0.8;
    
    // 예산 기반으로 최대 가능한 연속 패배 횟수 찾기
    let maxPossibleLosses = 3;
    let maxLosses = 10;
    
    for (let losses = 3; losses <= maxLosses; losses++) {
        const totalLoss = calculateTotalLoss(losses);
        if (totalLoss <= safeBudget) {
            maxPossibleLosses = losses;
        } else {
            break;
        }
    }
    
    // 게임 시간을 고려한 최적 연속 패배 횟수 계산
    // 게임 시간이 길수록 연속 패배 발생 확률이 높아지므로 더 보수적으로 설정
    let recommendedLosses = maxPossibleLosses;
    
    // 각 연속 패배 횟수별로 예상 발생 횟수 계산
    // 목표: 예상 발생 횟수가 0.5회 이하가 되도록 설정 (안전성 고려)
    for (let losses = maxPossibleLosses; losses >= 3; losses--) {
        const consecutiveLossProbability = Math.pow(0.5, losses);
        const expectedOccurrences = totalGames * consecutiveLossProbability;
        
        // 예상 발생 횟수가 0.5회 이하이면 이 값을 추천
        if (expectedOccurrences <= 0.5) {
            recommendedLosses = losses;
            break;
        }
        
        // 최소값은 3회로 유지
        if (losses === 3) {
            recommendedLosses = 3;
            break;
        }
    }
    
    // 계산 결과
    const recommendedTotalLoss = calculateTotalLoss(recommendedLosses);
    const recommendedMaxBet = minBet * Math.pow(2, recommendedLosses);
    const remainingBudget = budget - recommendedTotalLoss;
    const budgetUsage = ((recommendedTotalLoss / budget) * 100).toFixed(1);
    
    // 게임 횟수 기반 안전성 분석
    // 연속 패배 확률 계산 (대소/색/홀짝 게임 기준 약 50% 승률 가정)
    // N회 연속 패배 확률 = 0.5^N
    const consecutiveLossProbability = Math.pow(0.5, recommendedLosses);
    const expectedOccurrences = totalGames * consecutiveLossProbability;
    
    // 결과 표시
    let resultHtml = `
        <div style="font-weight: bold; color: #0066cc; margin-bottom: 10px; font-size: 1.1em;">
            ✅ 추천: 연속 패배 <strong>${recommendedLosses}회</strong> 이상 시 리셋
        </div>
        <div style="line-height: 1.8; font-size: 0.95em;">
            <div><strong>최대 배팅 금액:</strong> ${recommendedMaxBet.toLocaleString()}원</div>
            <div><strong>연속 패배 시 총 소모:</strong> ${recommendedTotalLoss.toLocaleString()}원 (예산의 ${budgetUsage}%)</div>
            <div><strong>남은 예산:</strong> ${remainingBudget.toLocaleString()}원</div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <div><strong>게임 시간:</strong> ${hours}시간 (예상 ${totalGames}회 게임)</div>
                <div><strong>${recommendedLosses}회 연속 패배 예상 횟수:</strong> 약 ${expectedOccurrences.toFixed(2)}회</div>
                ${maxPossibleLosses !== recommendedLosses ? `<div style="color: #ff6b6b; font-size: 0.9em; margin-top: 5px;">⚠️ 게임 시간이 길어 예상 발생 횟수를 고려하여 ${maxPossibleLosses}회에서 ${recommendedLosses}회로 조정되었습니다.</div>` : ''}
            </div>
        </div>
        <div style="margin-top: 15px;">
            <button onclick="applyRecommendedMartingale(${recommendedLosses})" style="padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                이 값으로 설정하기
            </button>
        </div>
    `;
    
    resultEl.innerHTML = resultHtml;
    resultEl.style.display = 'block';
}

// 추천된 마틴게일 최대값 적용
function applyRecommendedMartingale(losses) {
    const selectEl = document.getElementById('martingale-max-losses');
    if (selectEl) {
        selectEl.value = losses;
        setMartingaleMax();
        alert(`마틴게일 최대값이 연속 패배 ${losses}회로 설정되었습니다.`);
    }
}

// 마틴게일 최대값 설정
function setMartingaleMax() {
    const selectEl = document.getElementById('martingale-max-losses');
    if (!selectEl) return;
    
    const maxLosses = parseInt(selectEl.value) || 4;
    gameState.martingale.maxConsecutiveLosses = maxLosses;
    
    // 표시 업데이트
    updateMartingaleMaxDisplay();
    
    alert(`마틴게일 최대값이 설정되었습니다: ${maxLosses === 0 ? '제한 없음' : `연속 패배 ${maxLosses}회 이상 시 초기 금액으로 리셋`}`);
}

// 마틴게일 최대값 표시 업데이트
function updateMartingaleMaxDisplay() {
    const displayEl = document.getElementById('martingale-max-display');
    const selectEl = document.getElementById('martingale-max-losses');
    const amountInfoEl = document.getElementById('martingale-max-amount-info');
    
    if (displayEl && selectEl) {
        const maxLosses = gameState.martingale.maxConsecutiveLosses;
        if (maxLosses === 0) {
            displayEl.textContent = '제한 없음';
            if (amountInfoEl) {
                amountInfoEl.textContent = '제한 없음';
            }
        } else {
            displayEl.textContent = maxLosses;
            // 실제 최소 배팅 금액 가져오기 (대소/색/홀짝 게임 중 가장 작은 값)
            const minBet = Math.min(
                gameState.highlow.initialBet,
                gameState.color.initialBet,
                gameState.oddeven.initialBet
            );
            const maxBet = minBet * Math.pow(2, maxLosses);
            if (amountInfoEl) {
                amountInfoEl.textContent = `최소 배팅 금액 ${minBet}원 기준 최대 배팅 금액: ${maxBet.toLocaleString()}원`;
            }
            
            // select 옵션 텍스트도 동적으로 업데이트
            if (selectEl.options.length > 0) {
                for (let i = 0; i < selectEl.options.length; i++) {
                    const option = selectEl.options[i];
                    const losses = parseInt(option.value);
                    if (losses > 0 && losses <= 10) {
                        const optionMaxBet = minBet * Math.pow(2, losses);
                        option.textContent = `패배 ${losses}회 이상 (최소 ${minBet}원 기준 → 최대 ${optionMaxBet.toLocaleString()}원)`;
                    }
                }
            }
        }
        selectEl.value = maxLosses;
    }
}

    // 예산 표시 업데이트
function updateBudgetDisplay() {
    const totalEl = document.getElementById('budget-total');
    const remainingEl = document.getElementById('budget-remaining');
    const remainingTopEl = document.getElementById('budget-remaining-top');
    const recommendBudgetDisplay = document.getElementById('recommend-budget-display');

    if (totalEl && remainingEl) {
        totalEl.textContent = gameState.budget.initial.toLocaleString();
        remainingEl.textContent = gameState.budget.remaining.toLocaleString();
    }
    
    if (remainingTopEl) {
        remainingTopEl.textContent = gameState.budget.remaining.toLocaleString();
    }
    
    // 추천 섹션의 예산 표시 업데이트
    if (recommendBudgetDisplay) {
        recommendBudgetDisplay.textContent = gameState.budget.initial.toLocaleString();
    }
}

// 상단 승패 상태 업데이트 (가로 추이 표시)
function updateResultStatus() {
    // 각 게임의 히스토리에서 최근 승패 추이 확인
    ['highlow', 'color', 'oddeven', 'number'].forEach(gameType => {
        const state = gameState[gameType];
        const statusEl = document.getElementById(`result-status-${gameType}`);
        
        if (!statusEl) return;
        
        // 배팅 위치가 없으면 "-" 표시
        if (state.currentPosition === null) {
            statusEl.innerHTML = '<span class="result-status-empty">-</span>';
            return;
        }
        
        // 히스토리가 없으면 "-" 표시
        if (state.history.length === 0) {
            statusEl.innerHTML = '<span class="result-status-empty">-</span>';
            return;
        }
        
        // 최근 10개 결과를 가로로 표시 (최신순)
        const recentHistory = state.history.slice(-10).reverse(); // 최신이 오른쪽에 오도록
        
        let html = '';
        recentHistory.forEach(item => {
            const resultClass = item.result === 'win' ? 'win' : 'lose';
            const resultText = item.result === 'win' ? '승' : '패';
            html += `<span class="result-status-badge ${resultClass}">${resultText}</span>`;
        });
        
        statusEl.innerHTML = html;
    });
}

// 게임 결과 자동 처리
function processGameResults(result) {
    // 각 게임 타입별로 결과 처리
    ['highlow', 'color', 'oddeven', 'number'].forEach(gameType => {
        const state = gameState[gameType];
        
        // 배팅 위치가 설정되지 않았으면 처리하지 않음
        if (state.currentPosition === null) {
            return;
        }
        
        // 현재 배팅 위치 확인
        const currentPosition = state.currentPosition;
        
        // 결과 판단
        let isWin = false;
        
        if (gameType === 'highlow') {
            if (result.highlow === null) {
                // 0이 나왔으므로 패배 처리
                isWin = false;
            } else {
                const expectedHigh = currentPosition.includes('대');
                isWin = (expectedHigh && result.highlow === 'high') || (!expectedHigh && result.highlow === 'low');
            }
        } else if (gameType === 'color') {
            if (result.color === 'green') {
                // 0이 나왔으므로 패배 처리
                isWin = false;
            } else {
                const expectedRed = currentPosition === '레드';
                isWin = (expectedRed && result.color === 'red') || (!expectedRed && result.color === 'black');
            }
        } else if (gameType === 'oddeven') {
            if (result.oddeven === null) {
                // 0이 나왔으므로 패배 처리
                isWin = false;
            } else {
                const expectedOdd = currentPosition === '홀';
                isWin = (expectedOdd && result.oddeven === 'odd') || (!expectedOdd && result.oddeven === 'even');
            }
        } else if (gameType === 'number') {
            // 숫자 배팅: 선택한 숫자와 결과 숫자가 정확히 일치해야 승리
            const selectedNumber = parseInt(currentPosition);
            const resultNumber = result.number === '00' ? 37 : parseInt(result.number);
            isWin = selectedNumber === resultNumber;
        }
        
        // 결과 기록
        recordResult(gameType, isWin ? 'win' : 'lose', result.number);
    });
    
    // 상단 승패 상태 업데이트
    updateResultStatus();
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 초기 배팅 금액 입력 이벤트 리스너
    ['highlow', 'color', 'oddeven', 'number'].forEach(gameType => {
        const input = document.getElementById(`${gameType}-initial`);
        input.addEventListener('change', function() {
            const defaultValue = gameType === 'number' ? 1 : 5;
            const newInitial = parseInt(this.value) || defaultValue;
            const state = gameState[gameType];
            state.initialBet = newInitial;
            // 배팅 위치가 없거나 연속 패배가 없으면 초기 배팅 금액으로 설정
            // 숫자 배팅은 항상 초기 금액 유지
            if (state.currentPosition === null || state.consecutiveLosses === 0 || gameType === 'number') {
                state.currentBet = newInitial;
                updateBettingInfo(gameType);
            }
        });
    });
    
    // 룰렛 숫자 입력 엔터키 이벤트
    const rouletteNumberInput = document.getElementById('roulette-number');
    if (rouletteNumberInput) {
        rouletteNumberInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                inputRouletteResult();
            }
        });
    }
    
    // 모바일 룰렛 숫자 입력 엔터키 이벤트
    const mobileRouletteNumberInput = document.getElementById('mobile-roulette-number');
    if (mobileRouletteNumberInput) {
        mobileRouletteNumberInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                inputRouletteResultMobile();
            }
        });
    }

    // 예산 초기화
    const budgetInput = document.getElementById('budget-input');
    if (budgetInput) {
        const defaultBudget = parseInt(budgetInput.value, 10) || 0;
        gameState.budget.initial = defaultBudget;
        gameState.budget.remaining = defaultBudget;
        updateBudgetDisplay();

        budgetInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                setBudget();
            }
        });
    }
    
    // 초기 배팅 정보 업데이트
    updateAllBettingInfo();
    showHistory('highlow');
    updateRecentResults();
    updateResultStatus();
    updateRandomInfo();
    updateMartingaleMaxDisplay();
    updateNumberBetAmountInput();
    
    // 룰렛 그리드 생성
    createRouletteGrid();
    
    // 마틴게일 최대값 설정 이벤트 리스너
    const martingaleSelect = document.getElementById('martingale-max-losses');
    if (martingaleSelect) {
        martingaleSelect.addEventListener('change', function() {
            setMartingaleMax();
            updateMartingaleMaxDisplay();
        });
    }
    
    // 초기 배팅 금액 변경 시 마틴게일 최대값 정보 업데이트
    ['highlow', 'color', 'oddeven'].forEach(gameType => {
        const input = document.getElementById(`${gameType}-initial`);
        if (input) {
            input.addEventListener('change', function() {
                updateMartingaleMaxDisplay();
            });
        }
    });
    
    // 추천 기능 엔터키 이벤트
    const recommendHoursInput = document.getElementById('recommend-hours');
    
    if (recommendHoursInput) {
        recommendHoursInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                recommendMartingaleMax();
            }
        });
    }
});

// 룰렛 그리드 생성
function createRouletteGrid() {
    const grid = document.getElementById('roulette-grid');
    if (!grid) return;
    
    // 유럽식 룰렛 숫자 배치 (0부터 시작)
    const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    
    grid.innerHTML = '';
    
    numbers.forEach(num => {
        const numberBtn = document.createElement('button');
        numberBtn.className = 'roulette-number-btn';
        numberBtn.dataset.number = num;
        
        // 숫자 표시 (0은 특별히 표시)
        if (num === 0) {
            numberBtn.textContent = '0';
            numberBtn.classList.add('green');
        } else {
            numberBtn.textContent = num;
            // 색상 적용
            const color = europeanRouletteColors[num];
            if (color === 'red') {
                numberBtn.classList.add('red');
            } else if (color === 'black') {
                numberBtn.classList.add('black');
            }
        }
        
        // 클릭 이벤트
        numberBtn.addEventListener('click', function() {
            selectNumber(num);
        });
        
        grid.appendChild(numberBtn);
    });
    
    // 미국식 룰렛인 경우 00 추가
    if (gameState.rouletteType === 'american') {
        const doubleZeroBtn = document.createElement('button');
        doubleZeroBtn.className = 'roulette-number-btn green';
        doubleZeroBtn.textContent = '00';
        doubleZeroBtn.dataset.number = '37';
        doubleZeroBtn.addEventListener('click', function() {
            selectNumber(37);
        });
        grid.appendChild(doubleZeroBtn);
    }
    
    // 선택된 숫자 하이라이트 업데이트
    updateRouletteGridHighlight();
}

// 숫자 선택
function selectNumber(number) {
    const state = gameState.number;
    
    // 이미 배팅이 진행 중이면 숫자 변경 불가
    if (state.currentPosition !== null) {
        if (confirm('이미 배팅이 진행 중입니다. 숫자를 변경하면 현재 배팅이 초기화됩니다. 계속하시겠습니까?')) {
            // 배팅 초기화
            state.currentPosition = null;
            state.currentBet = state.initialBet;
            state.consecutiveLosses = 0;
            state.queue = [];
            updateBettingInfo('number');
            updateQueueDisplay('number');
            updateRouletteGridHighlight();
        } else {
            return;
        }
    }
    
    // 숫자 선택 (아직 배팅 시작 전)
    state.currentPosition = number.toString();
    
    // 숫자 입력 필드 업데이트 (숨겨진 필드)
    const numberInput = document.getElementById('number-position-select');
    if (numberInput) {
        numberInput.value = number;
    }
    
    // 선택된 숫자 표시 업데이트
    const positionDisplay = document.getElementById('number-position-display');
    if (positionDisplay) {
        positionDisplay.textContent = number === 37 ? '00' : number;
    }
    
    // 그리드 하이라이트 업데이트
    updateRouletteGridHighlight();
    
    // 배팅 금액 입력 필드 업데이트
    updateNumberBetAmountInput();
}

// 숫자 배팅 금액 조절
function adjustNumberBetAmount(amount) {
    const input = document.getElementById('number-bet-amount-input');
    if (!input) return;
    
    const currentAmount = parseInt(input.value) || 1;
    const newAmount = Math.max(1, currentAmount + amount);
    setNumberBetAmountValue(newAmount);
}

// 숫자 배팅 금액 설정 (입력 필드 변경 시)
function setNumberBetAmount() {
    const input = document.getElementById('number-bet-amount-input');
    if (!input) return;
    
    const amount = parseInt(input.value) || 1;
    setNumberBetAmountValue(amount);
}

// 숫자 배팅 금액 값 설정 (내부 함수)
function setNumberBetAmountValue(amount) {
    const input = document.getElementById('number-bet-amount-input');
    if (!input) return;
    
    const validAmount = Math.max(1, amount);
    input.value = validAmount;
    
    // 게임 상태 업데이트
    const state = gameState.number;
    state.initialBet = validAmount;
    
    // 배팅이 진행 중이 아니면 현재 배팅 금액도 업데이트
    if (state.currentPosition === null) {
        state.currentBet = validAmount;
    }
    
    // 표시 업데이트
    updateBettingInfo('number');
}

// 숫자 배팅 금액 입력 필드 업데이트
function updateNumberBetAmountInput() {
    const input = document.getElementById('number-bet-amount-input');
    if (!input) return;
    
    const state = gameState.number;
    // 배팅이 진행 중이 아니면 초기 금액, 진행 중이면 현재 금액 표시
    if (state.currentPosition === null) {
        input.value = state.initialBet;
    } else {
        input.value = state.currentBet;
    }
}

// 룰렛 그리드 하이라이트 업데이트
function updateRouletteGridHighlight() {
    const state = gameState.number;
    const selectedNumber = state.currentPosition ? parseInt(state.currentPosition) : null;
    
    const buttons = document.querySelectorAll('.roulette-number-btn');
    buttons.forEach(btn => {
        const btnNumber = parseInt(btn.dataset.number);
        if (selectedNumber !== null && btnNumber === selectedNumber) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// 대기열에 추가 (초기 배팅 위치 설정)
function addToQueue(gameType) {
    const state = gameState[gameType];
    const queue = state.queue;
    const options = bettingOptions[gameType];
    
    // 예산 설정 여부 확인
    if (gameState.budget.initial <= 0) {
        alert('먼저 예산을 설정해주세요.');
        return;
    }

    // 현재 배팅 위치가 없으면 사용자가 선택한 위치로 배팅 시작
    if (state.currentPosition === null) {
        let selectedPosition = null;
        
        // 숫자 배팅의 경우
        if (gameType === 'number') {
            // 선택된 숫자 확인
            if (state.currentPosition === null) {
                alert('먼저 룰렛에서 숫자를 선택해주세요.');
                return;
            }
            
            // 배팅 금액 입력 필드에서 현재 금액 가져오기
            const amountInput = document.getElementById('number-bet-amount-input');
            if (amountInput) {
                const inputAmount = parseInt(amountInput.value) || state.initialBet;
                state.initialBet = inputAmount;
                state.currentBet = inputAmount;
            }
            
            selectedPosition = state.currentPosition;
        } else {
            // 드롭다운에서 선택한 위치 가져오기
            const positionSelect = document.getElementById(`${gameType}-position-select`);
            if (!positionSelect) {
                alert('배팅 위치를 선택할 수 없습니다.');
                return;
            }
            
            selectedPosition = positionSelect.value;
            
            // 선택한 위치가 유효한 옵션인지 확인
            if (!options.includes(selectedPosition)) {
                alert('유효하지 않은 배팅 위치입니다.');
                return;
            }
        }
        
        state.currentPosition = selectedPosition;
        state.currentBet = state.initialBet;
        
        // 배팅 금액 확인 및 예산 차감
        if (state.currentBet > gameState.budget.remaining) {
            alert('예산이 부족합니다. 배팅 금액을 조정하거나 예산을 늘려주세요.');
            state.currentPosition = null;
            return;
        }
        
        // 배팅 시작 시 예산 차감
        gameState.budget.remaining -= state.currentBet;
        updateBudgetDisplay();
    } else {
        // 이미 배팅이 진행 중인 경우 - 추가 배팅 불가
        // 마틴게일 전략에서는 패배 시 자동으로 다음 배팅이 진행되므로 대기열이 필요 없음
        if (gameType === 'number') {
            // 숫자 배팅은 이미 진행 중이면 추가 배팅 불가
            return;
        } else {
            // 다른 게임도 이미 진행 중이면 추가 배팅 불가
            alert('이미 배팅이 진행 중입니다. 결과를 입력하면 자동으로 다음 배팅이 진행됩니다.');
            return;
        }
    }
    
    updateQueueDisplay(gameType);
    updateBettingInfo(gameType);
    updateResultStatus();
}

// 대기열 초기화
function clearQueue(gameType) {
    if (confirm('배팅을 초기화하시겠습니까?')) {
        const state = gameState[gameType];
        state.queue = [];
        state.currentIndex = 0;
        state.consecutiveLosses = 0;
        state.currentBet = state.initialBet;
        state.currentPosition = null;
        updateQueueDisplay(gameType);
        updateBettingInfo(gameType);
        updateResultStatus();
    }
}

// 대기열 표시 업데이트
function updateQueueDisplay(gameType) {
    const queueList = document.getElementById(`${gameType}-queue`);
    const state = gameState[gameType];
    const queue = state.queue;
    
    if (!queueList) return;
    
    // 숫자 배팅의 경우 특별 처리
    if (gameType === 'number') {
        if (state.currentPosition === null) {
            queueList.innerHTML = '<div class="empty-queue" style="font-size: 0.9em; padding: 15px; text-align: center; color: #999;">룰렛에서 숫자를 선택하고 배팅 시작 버튼을 클릭하세요</div>';
            return;
        }
        
        const selectedNumber = parseInt(state.currentPosition);
        const displayNumber = selectedNumber === 37 ? '00' : selectedNumber;
        queueList.innerHTML = `
            <div style="font-size: 0.9em; padding: 10px; background: #e3f2fd; border-radius: 8px; text-align: center; margin-top: 10px;">
                <div style="font-size: 1.2em; font-weight: bold; color: #667eea; margin-bottom: 5px;">선택: ${displayNumber}</div>
                <div style="color: #666;">배팅 금액: <strong>${state.currentBet.toLocaleString()}</strong></div>
            </div>
        `;
        return;
    }
    
    // 현재 배팅 위치가 없으면 안내 메시지
    if (state.currentPosition === null) {
        queueList.innerHTML = '<div class="empty-queue" style="font-size: 0.8em; padding: 10px; text-align: center; color: #999;">▶️ 버튼으로 시작</div>';
        return;
    }
    
    // 컴팩트 버전: 현재 배팅만 간단히 표시
    let html = `
        <div style="font-size: 0.85em; padding: 5px; background: #e3f2fd; border-radius: 5px; text-align: center;">
            <strong>${state.currentPosition}</strong> <span style="color: #667eea;">${state.currentBet.toLocaleString()}</span>
        </div>
    `;
    
    queueList.innerHTML = html;
}

// 배팅 정보 업데이트
function updateBettingInfo(gameType) {
    const state = gameState[gameType];
    
    // 숫자 배팅의 경우 특별 처리
    if (gameType === 'number') {
        const amountDisplay = document.getElementById('number-amount-display');
        const positionDisplay = document.getElementById('number-position-display');
        
        if (state.currentPosition === null) {
            if (amountDisplay) amountDisplay.textContent = state.initialBet.toLocaleString();
            if (positionDisplay) positionDisplay.textContent = '-';
        } else {
            if (amountDisplay) amountDisplay.textContent = state.currentBet.toLocaleString();
            const selectedNumber = parseInt(state.currentPosition);
            if (positionDisplay) positionDisplay.textContent = selectedNumber === 37 ? '00' : selectedNumber;
        }
        
        // 배팅 금액 입력 필드 업데이트
        updateNumberBetAmountInput();
        
        // 그리드 하이라이트 업데이트
        updateRouletteGridHighlight();
    } else {
        // 배팅 위치가 없으면 표시하지 않음
        if (state.currentPosition === null) {
            const amountEl = document.getElementById(`${gameType}-amount`);
            const positionEl = document.getElementById(`${gameType}-position`);
            if (amountEl) amountEl.textContent = state.initialBet.toLocaleString();
            if (positionEl) positionEl.textContent = '-';
            return;
        }
        
        // UI 업데이트
        const amountEl = document.getElementById(`${gameType}-amount`);
        const positionEl = document.getElementById(`${gameType}-position`);
        if (amountEl) amountEl.textContent = state.currentBet.toLocaleString();
        if (positionEl) positionEl.textContent = state.currentPosition;
    }
    
    // 모바일 정보도 업데이트
    updateMobileBettingInfo();
}

// 모든 게임의 배팅 정보 업데이트
function updateAllBettingInfo() {
    ['highlow', 'color', 'oddeven', 'number'].forEach(gameType => {
        updateBettingInfo(gameType);
        updateQueueDisplay(gameType);
    });
    updateMobileBettingInfo();
}

// 모바일 배팅 정보 업데이트
function updateMobileBettingInfo() {
    const gameTypes = {
        'highlow': '대소',
        'color': '색',
        'oddeven': '홀짝',
        'number': '숫자'
    };
    
    ['highlow', 'color', 'oddeven', 'number'].forEach(gameType => {
        const state = gameState[gameType];
        const mobileItem = document.getElementById(`mobile-betting-${gameType}`);
        
        if (mobileItem) {
            const valueSpan = mobileItem.querySelector('.mobile-betting-value');
            if (state.currentPosition !== null) {
                valueSpan.textContent = `${state.currentPosition} (${state.currentBet.toLocaleString()})`;
            } else {
                valueSpan.textContent = '-';
            }
        }
    });
}

// 모바일에서 결과 입력
function inputRouletteResultMobile() {
    const numberInput = document.getElementById('mobile-roulette-number');
    const number = parseInt(numberInput.value);
    
    if (isNaN(number)) {
        alert('숫자를 입력해주세요.');
        return;
    }
    
    // 기존 inputRouletteResult 함수 사용
    document.getElementById('roulette-number').value = number;
    inputRouletteResult();
    
    // 모바일 입력창 초기화
    numberInput.value = '';
    // 키보드가 올라오지 않도록 포커스 제거
    numberInput.blur();
    
    // 다른 요소에 포커스를 주어 키보드가 완전히 사라지도록
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

// 빠른 숫자 입력
function backspaceNumber(event) {
    // 이벤트가 있으면 기본 동작 방지
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const mobileInput = document.getElementById('mobile-roulette-number');
    const currentValue = mobileInput.value;
    
    // 마지막 문자 삭제
    if (currentValue.length > 0) {
        mobileInput.value = currentValue.slice(0, -1);
    }
    
    // 키보드가 올라오지 않도록 포커스 제거
    mobileInput.blur();
}

function setQuickNumber(number, event) {
    // 이벤트가 있으면 기본 동작 방지
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const mobileInput = document.getElementById('mobile-roulette-number');
    const currentValue = mobileInput.value;
    
    if (currentValue.length < 2) {
        mobileInput.value = currentValue + number;
    } else {
        mobileInput.value = number;
    }
    
    // 키보드가 올라오지 않도록 포커스 제거
    mobileInput.blur();
    
    // 다른 요소에 포커스를 주어 키보드가 완전히 사라지도록
    if (document.activeElement && document.activeElement !== mobileInput) {
        document.activeElement.blur();
    }
    
    // body에 포커스를 주어 키보드가 완전히 사라지도록
    if (document.body) {
        document.body.focus();
    }
}

// 결과 기록
function recordResult(gameType, result, rouletteNumber = null) {
    const state = gameState[gameType];
    
    // 배팅 위치가 설정되지 않았으면 처리하지 않음
    if (state.currentPosition === null) {
        if (rouletteNumber === null) {
            alert('먼저 배팅 위치를 설정해주세요. (대기열 추가 버튼 클릭)');
        }
        return;
    }
    
    if (gameState.budget.initial <= 0) {
        alert('먼저 예산을 설정해주세요.');
        return;
    }

    const currentPosition = state.currentPosition;
    const bettingAmount = state.currentBet;
    
    // 히스토리에 추가
    const historyItem = {
        position: currentPosition,
        amount: bettingAmount,
        result: result,
        rouletteNumber: rouletteNumber,
        timestamp: new Date().toLocaleString('ko-KR')
    };
    
    state.history.push(historyItem);
    
    if (result === 'win') {
        // 승리 시: 연속 패배 횟수 리셋, 금액은 초기 금액으로 되돌림, 위치 유지
        state.consecutiveLosses = 0;
        state.currentBet = state.initialBet;

        // 배당금 수령
        if (gameType === 'number') {
            // 숫자 배팅: 35:1 배당 (배팅 금액의 36배)
            gameState.budget.remaining += bettingAmount * 36;
        } else {
            // 대소/색/홀짝: 1:1 배당 (배팅 금액의 2배)
            gameState.budget.remaining += bettingAmount * 2;
        }
        
        // 다음 배팅 금액(초기 금액) 차감
        if (state.currentBet > gameState.budget.remaining) {
            alert('예산이 부족합니다. 다음 배팅을 시작할 수 없습니다.');
            state.currentPosition = null;
            state.currentBet = state.initialBet;
        } else {
            gameState.budget.remaining -= state.currentBet;
        }
    } else {
        // 패배 시
        state.consecutiveLosses++;
        
        if (gameType === 'number') {
            // 숫자 배팅: 마틴게일법 적용하지 않음, 배팅 금액 유지
            state.currentBet = state.initialBet;  // 초기 금액 유지
        } else {
            // 다른 게임: 마틴게일법 적용 (금액 2배)
            const nextBet = state.currentBet * 2;
            
            // 마틴게일 최대값 체크 (연속 패배 횟수 기준)
            const maxConsecutiveLosses = gameState.martingale.maxConsecutiveLosses;
            if (maxConsecutiveLosses > 0) {
                // 연속 패배 횟수가 제한에 도달했는지 확인
                if (state.consecutiveLosses >= maxConsecutiveLosses) {
                    // 최대값 도달: 초기 금액으로 리셋
                    const maxBet = state.initialBet * Math.pow(2, maxConsecutiveLosses);
                    state.currentBet = state.initialBet;
                    state.consecutiveLosses = 0;  // 연속 패배 횟수도 리셋
                    alert(`마틴게일 최대값(연속 패배 ${maxConsecutiveLosses}회, 최대 배팅 ${maxBet.toLocaleString()}원)에 도달했습니다. 배팅 금액을 초기 금액(${state.initialBet.toLocaleString()}원)으로 리셋합니다.`);
                } else {
                    state.currentBet = nextBet;
                }
            } else {
                // 제한 없음
                state.currentBet = nextBet;
            }
            
            // 반대 위치로 변경
            const options = bettingOptions[gameType];
            state.currentPosition = state.currentPosition === options[0] ? options[1] : options[0];
        }
        
        // 다음 배팅 금액 차감
        if (state.currentBet > gameState.budget.remaining) {
            alert('예산이 부족합니다. 다음 배팅을 시작할 수 없습니다.');
            state.currentPosition = null;
            state.currentBet = state.initialBet;
        } else {
            gameState.budget.remaining -= state.currentBet;
        }
    }
    
    updateBudgetDisplay();
    updateQueueDisplay(gameType);
    updateBettingInfo(gameType);
    showHistory(gameType);
}

// 게임 리셋
function resetGame(gameType) {
    if (confirm('게임을 초기화하시겠습니까? 모든 기록이 삭제됩니다.')) {
        const state = gameState[gameType];
        state.queue = [];
        state.currentIndex = 0;
        state.consecutiveLosses = 0;
        state.currentBet = state.initialBet;
        state.currentPosition = null;
        state.history = [];
        
        updateQueueDisplay(gameType);
        updateBettingInfo(gameType);
        showHistory(gameType);
        
        // 상단 승패 상태 업데이트
        updateResultStatus();
    }
}

// 히스토리 표시
function showHistory(gameType) {
    const historyContent = document.getElementById('history-content');
    const history = gameState[gameType].history;
    
    // 탭 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    // 탭 버튼 찾기 (이벤트가 없을 경우)
    if (!event) {
        const tabs = document.querySelectorAll('.tab-btn');
        const gameTypes = ['highlow', 'color', 'oddeven', 'number'];
        const index = gameTypes.indexOf(gameType);
        if (index >= 0 && tabs[index]) {
            tabs[index].classList.add('active');
        }
    }
    
    if (history.length === 0) {
        historyContent.innerHTML = '<div class="empty-history">배팅 기록이 없습니다</div>';
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = [...history].reverse();
    
    historyContent.innerHTML = sortedHistory.map(item => {
        const resultClass = item.result === 'win' ? 'win' : 'lose';
        const resultText = item.result === 'win' ? '승리' : '패배';
        const resultColor = item.result === 'win' ? '#27ae60' : '#e74c3c';
        
        const rouletteInfo = item.rouletteNumber !== null && item.rouletteNumber !== undefined 
            ? `<span><strong>룰렛:</strong> ${item.rouletteNumber}</span>` 
            : '';
        
        return `
            <div class="history-item ${resultClass}">
                <div class="history-item-info">
                    <span><strong>위치:</strong> ${item.position}</span>
                    <span><strong>금액:</strong> ${item.amount.toLocaleString()}</span>
                    ${rouletteInfo}
                    <span style="color: ${resultColor};"><strong>결과:</strong> ${resultText}</span>
                    <span><strong>시간:</strong> ${item.timestamp}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 랜덤 시뮬레이션 상태
let randomInterval = null;
let randomCount = 0;

// 랜덤 숫자 생성
function generateRandomNumber() {
    const rouletteType = gameState.rouletteType;
    if (rouletteType === 'american') {
        // 미국식: 0-36, 00(37)
        return Math.floor(Math.random() * 38);
    } else {
        // 유럽식: 0-36
        return Math.floor(Math.random() * 37);
    }
}

// 랜덤 시뮬레이션 시작
function startRandom() {
    // 배팅이 시작되었는지 확인
    const hasActiveBetting = ['highlow', 'color', 'oddeven', 'number'].some(gameType => {
        return gameState[gameType].currentPosition !== null;
    });
    
    if (!hasActiveBetting) {
        alert('먼저 게임 탭에서 배팅을 시작해주세요.');
        return;
    }
    
    if (gameState.budget.initial <= 0) {
        alert('먼저 설정 탭에서 예산을 설정해주세요.');
        return;
    }
    
    const speedInput = document.getElementById('random-speed');
    const speed = parseFloat(speedInput.value) || 1;
    const intervalMs = speed * 1000;
    
    const startBtn = document.getElementById('random-start-btn');
    const stopBtn = document.getElementById('random-stop-btn');
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    randomCount = 0;
    updateRandomInfo();
    
    // 랜덤 숫자 자동 입력
    randomInterval = setInterval(() => {
        const randomNumber = generateRandomNumber();
        
        // 결과 입력
        document.getElementById('roulette-number').value = randomNumber;
        inputRouletteResult();
        
        randomCount++;
        updateRandomInfo(randomNumber);
        
        // 예산이 부족하면 자동 정지
        if (gameState.budget.remaining <= 0) {
            stopRandom();
            alert('예산이 부족하여 시뮬레이션이 중지되었습니다.');
        }
    }, intervalMs);
}

// 랜덤 시뮬레이션 정지
function stopRandom() {
    if (randomInterval) {
        clearInterval(randomInterval);
        randomInterval = null;
    }
    
    const startBtn = document.getElementById('random-start-btn');
    const stopBtn = document.getElementById('random-stop-btn');
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// 랜덤 정보 업데이트
function updateRandomInfo(currentNumber = null) {
    const countEl = document.getElementById('random-count');
    const currentEl = document.getElementById('random-current');
    
    if (countEl) {
        countEl.textContent = randomCount;
    }
    
    if (currentEl) {
        if (currentNumber !== null) {
            const displayNumber = currentNumber === 37 ? '00' : currentNumber;
            currentEl.textContent = displayNumber;
        } else {
            currentEl.textContent = '-';
        }
    }
}

// 전체 게임 리셋
function resetAllGames() {
    if (!confirm('모든 게임을 초기화하시겠습니까? 모든 기록이 삭제됩니다.')) {
        return;
    }
    
    // 랜덤 시뮬레이션 정지
    stopRandom();
    
    // 모든 게임 리셋
    ['highlow', 'color', 'oddeven', 'number'].forEach(gameType => {
        const state = gameState[gameType];
        state.queue = [];
        state.currentIndex = 0;
        state.consecutiveLosses = 0;
        state.currentBet = state.initialBet;
        state.currentPosition = null;
        state.history = [];
        
        updateQueueDisplay(gameType);
        updateBettingInfo(gameType);
        showHistory(gameType);
    });
    
    // 최근 결과 초기화
    gameState.recentResults = [];
    gameState.previousStates = [];
    updateRecentResults();
    updateResultStatus();
    updateRandomInfo();
    
    alert('모든 게임이 초기화되었습니다.');
}

// 추천 기능
function getRecommendation(gameType) {
    if (gameState.recentResults.length === 0) {
        const recommendEl = document.getElementById(`${gameType}-recommendation`);
        if (recommendEl) {
            recommendEl.innerHTML = '<div class="recommendation-item">최근 결과가 없어 추천할 수 없습니다.</div>';
        }
        return;
    }
    
    const state = gameState[gameType];
    const options = bettingOptions[gameType];
    const recentResults = gameState.recentResults;
    
    let recommendation = '';
    let reason = '';
    
    if (gameType === 'highlow') {
        // 대소 추천
        let highCount = 0, lowCount = 0;
        recentResults.forEach(result => {
            if (result.highlow === 'high') highCount++;
            else if (result.highlow === 'low') lowCount++;
        });
        
        // 최근 결과가 적은 쪽 추천 (반전 전략)
        if (highCount > lowCount) {
            recommendation = '소(1-18)';
            reason = `최근 ${highCount}회 대, ${lowCount}회 소 → 반전 전략으로 소 추천`;
        } else if (lowCount > highCount) {
            recommendation = '대(19-36)';
            reason = `최근 ${highCount}회 대, ${lowCount}회 소 → 반전 전략으로 대 추천`;
        } else {
            recommendation = highCount >= lowCount ? '소(1-18)' : '대(19-36)';
            reason = '최근 결과가 동일하여 반전 전략 적용';
        }
        
        // 현재 배팅이 있으면 승리하는 쪽 추천
        if (state.currentPosition !== null) {
            const currentWin = state.history.filter(h => h.result === 'win').length;
            const currentLose = state.history.filter(h => h.result === 'lose').length;
            if (currentLose > currentWin) {
                recommendation = state.currentPosition.includes('대') ? '소(1-18)' : '대(19-36)';
                reason = `현재 배팅 승률 낮음 (승:${currentWin}, 패:${currentLose}) → 반대 추천`;
            }
        }
        
    } else if (gameType === 'color') {
        // 색 추천
        let redCount = 0, blackCount = 0;
        recentResults.forEach(result => {
            if (result.color === 'red') redCount++;
            else if (result.color === 'black') blackCount++;
        });
        
        // 최근 결과가 적은 쪽 추천
        if (redCount > blackCount) {
            recommendation = '블랙';
            reason = `최근 ${redCount}회 레드, ${blackCount}회 블랙 → 반전 전략으로 블랙 추천`;
        } else if (blackCount > redCount) {
            recommendation = '레드';
            reason = `최근 ${redCount}회 레드, ${blackCount}회 블랙 → 반전 전략으로 레드 추천`;
        } else {
            recommendation = redCount >= blackCount ? '블랙' : '레드';
            reason = '최근 결과가 동일하여 반전 전략 적용';
        }
        
        // 현재 배팅이 있으면 승리하는 쪽 추천
        if (state.currentPosition !== null) {
            const currentWin = state.history.filter(h => h.result === 'win').length;
            const currentLose = state.history.filter(h => h.result === 'lose').length;
            if (currentLose > currentWin) {
                recommendation = state.currentPosition === '레드' ? '블랙' : '레드';
                reason = `현재 배팅 승률 낮음 (승:${currentWin}, 패:${currentLose}) → 반대 추천`;
            }
        }
        
    } else if (gameType === 'oddeven') {
        // 홀짝 추천
        let oddCount = 0, evenCount = 0;
        recentResults.forEach(result => {
            if (result.oddeven === 'odd') oddCount++;
            else if (result.oddeven === 'even') evenCount++;
        });
        
        // 최근 결과가 적은 쪽 추천
        if (oddCount > evenCount) {
            recommendation = '짝';
            reason = `최근 ${oddCount}회 홀, ${evenCount}회 짝 → 반전 전략으로 짝 추천`;
        } else if (evenCount > oddCount) {
            recommendation = '홀';
            reason = `최근 ${oddCount}회 홀, ${evenCount}회 짝 → 반전 전략으로 홀 추천`;
        } else {
            recommendation = oddCount >= evenCount ? '짝' : '홀';
            reason = '최근 결과가 동일하여 반전 전략 적용';
        }
        
        // 현재 배팅이 있으면 승리하는 쪽 추천
        if (state.currentPosition !== null) {
            const currentWin = state.history.filter(h => h.result === 'win').length;
            const currentLose = state.history.filter(h => h.result === 'lose').length;
            if (currentLose > currentWin) {
                recommendation = state.currentPosition === '홀' ? '짝' : '홀';
                reason = `현재 배팅 승률 낮음 (승:${currentWin}, 패:${currentLose}) → 반대 추천`;
            }
        }
        
    } else if (gameType === 'number') {
        // 숫자 추천: 최근에 나오지 않은 숫자들 중에서 여러 개 추천
        const recentNumbers = recentResults.map(r => {
            if (r.number === '00') return 37;
            return parseInt(r.number);
        });
        
        // 최근에 나오지 않은 숫자 찾기
        const allNumbers = gameState.rouletteType === 'american' ? 
            Array.from({length: 38}, (_, i) => i) : 
            Array.from({length: 37}, (_, i) => i);
        
        const notRecentNumbers = allNumbers.filter(n => !recentNumbers.includes(n));
        
        let recommendedNumbers = [];
        let reason = '';
        
        if (notRecentNumbers.length > 0) {
            // 최근에 나오지 않은 숫자들 중 상위 5-10개 추천
            const count = Math.min(10, notRecentNumbers.length);
            // 랜덤하게 섞어서 추천
            const shuffled = [...notRecentNumbers].sort(() => Math.random() - 0.5);
            recommendedNumbers = shuffled.slice(0, count);
            reason = `최근 ${recentResults.length}회 결과에 없는 숫자 ${count}개 추천 (총 ${notRecentNumbers.length}개 후보)`;
        } else {
            // 모든 숫자가 나왔으면 최근에 가장 적게 나온 숫자들
            const numberCounts = {};
            allNumbers.forEach(n => numberCounts[n] = 0);
            recentNumbers.forEach(n => numberCounts[n]++);
            
            const sortedNumbers = Object.entries(numberCounts)
                .sort((a, b) => a[1] - b[1])
                .map(([num]) => parseInt(num));
            
            // 가장 적게 나온 상위 10개
            recommendedNumbers = sortedNumbers.slice(0, 10);
            reason = `최근에 가장 적게 나온 숫자 ${recommendedNumbers.length}개 추천`;
        }
        
        // 추천 결과 표시 (숫자 버튼 형태로)
        const recommendEl = document.getElementById(`${gameType}-recommendation`);
        if (recommendEl) {
            const numbersHtml = recommendedNumbers.map(num => {
                const displayNum = num === 37 ? '00' : num;
                const color = num === 0 || num === 37 ? 'green' : 
                             (europeanRouletteColors[num] === 'red' ? 'red' : 'black');
                return `
                    <button class="recommended-number-btn ${color}" onclick="selectRecommendedNumber(${num})" title="클릭하여 선택">
                        ${displayNum}
                    </button>
                `;
            }).join('');
            
            recommendEl.innerHTML = `
                <div class="recommendation-item">
                    <div class="recommendation-title">💡 추천 숫자 (클릭하여 선택)</div>
                    <div class="recommendation-reason">${reason}</div>
                    <div class="recommended-numbers-grid">
                        ${numbersHtml}
                    </div>
                </div>
            `;
        }
        
        return; // 숫자 배팅은 여기서 종료
    }
    
    // 추천 결과 표시 (대소/색/홀짝)
    const recommendEl = document.getElementById(`${gameType}-recommendation`);
    if (recommendEl) {
        recommendEl.innerHTML = `
            <div class="recommendation-item">
                <div class="recommendation-title">💡 추천: <strong>${recommendation}</strong></div>
                <div class="recommendation-reason">${reason}</div>
            </div>
        `;
        
        // 추천을 선택 옵션에 자동 적용
        const selectEl = document.getElementById(`${gameType}-position-select`);
        if (selectEl && options.includes(recommendation)) {
            selectEl.value = recommendation;
        }
    }
}

// 추천된 숫자 선택
function selectRecommendedNumber(number) {
    selectNumber(number);
    
    // 선택 후 추천 영역 업데이트 (선택된 숫자 강조)
    const recommendEl = document.getElementById('number-recommendation');
    if (recommendEl) {
        const buttons = recommendEl.querySelectorAll('.recommended-number-btn');
        buttons.forEach(btn => {
            const btnNum = parseInt(btn.textContent.trim());
            const displayNum = number === 37 ? '00' : number;
            if (btnNum === number || (btn.textContent.trim() === '00' && number === 37)) {
                btn.classList.add('selected-recommended');
            } else {
                btn.classList.remove('selected-recommended');
            }
        });
    }
}

// 취소 함수 전역 노출
window.undoLastResult = undoLastResult;
window.showMainTab = showMainTab;
window.startRandom = startRandom;
window.stopRandom = stopRandom;
window.resetAllGames = resetAllGames;
window.getRecommendation = getRecommendation;
window.selectRecommendedNumber = selectRecommendedNumber;
window.setMartingaleMax = setMartingaleMax;
window.recommendMartingaleMax = recommendMartingaleMax;
window.applyRecommendedMartingale = applyRecommendedMartingale;
window.adjustNumberBetAmount = adjustNumberBetAmount;
window.setNumberBetAmount = setNumberBetAmount;

// 탭 버튼 클릭 이벤트 (전역 함수로 노출)
window.showHistory = function(gameType) {
    const historyContent = document.getElementById('history-content');
    const history = gameState[gameType].history;
    
    // 모든 탭 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 해당 탭 활성화
    const tabs = document.querySelectorAll('.tab-btn');
    const gameTypes = ['highlow', 'color', 'oddeven', 'number'];
    const index = gameTypes.indexOf(gameType);
    if (index >= 0 && tabs[index]) {
        tabs[index].classList.add('active');
    }
    
    if (history.length === 0) {
        historyContent.innerHTML = '<div class="empty-history">배팅 기록이 없습니다</div>';
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = [...history].reverse();
    
    historyContent.innerHTML = sortedHistory.map(item => {
        const resultClass = item.result === 'win' ? 'win' : 'lose';
        const resultText = item.result === 'win' ? '승리' : '패배';
        const resultColor = item.result === 'win' ? '#27ae60' : '#e74c3c';
        
        const rouletteInfo = item.rouletteNumber !== null && item.rouletteNumber !== undefined 
            ? `<span><strong>룰렛:</strong> ${item.rouletteNumber}</span>` 
            : '';
        
        return `
            <div class="history-item ${resultClass}">
                <div class="history-item-info">
                    <span><strong>위치:</strong> ${item.position}</span>
                    <span><strong>금액:</strong> ${item.amount.toLocaleString()}</span>
                    ${rouletteInfo}
                    <span style="color: ${resultColor};"><strong>결과:</strong> ${resultText}</span>
                    <span><strong>시간:</strong> ${item.timestamp}</span>
                </div>
            </div>
        `;
    }).join('');
};

