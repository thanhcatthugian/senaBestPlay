// Quản lý trạng thái ứng dụng
const state = {
    balance: 1000000,
    currentBetAmount: 0,
    currentSide: null,
    timeLeft: 30,
    isBettingPhase: true,
    diceIcons: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
};

// Truy xuất DOM
const elements = {
    balance: document.getElementById('balance'),
    currentBetSide: document.getElementById('current-bet-side'),
    currentBetAmount: document.getElementById('current-bet-amount'),
    timer: document.getElementById('timer'),
    diceContainer: document.getElementById('dice-container'),
    resultText: document.getElementById('result-text'),
    history: document.getElementById('history'),
    toast: document.getElementById('toast'),
    betTaiZone: document.getElementById('bet-tai-zone'),
    betXiuZone: document.getElementById('bet-xiu-zone')
};

// Cập nhật giao diện
function updateUI() {
    elements.balance.innerText = state.balance.toLocaleString();
    elements.currentBetAmount.innerText = state.currentBetAmount.toLocaleString();
    elements.currentBetSide.innerText = state.currentSide || 'Chưa chọn';
}

// Xử lý chọn cửa cược
function selectSide(side) {
    if (!state.isBettingPhase) return;
    
    state.currentSide = side;
    elements.betTaiZone.classList.remove('active-tai');
    elements.betXiuZone.classList.remove('active-xiu');

    if (side === 'TAI') {
        elements.betTaiZone.classList.add('active-tai');
    } else {
        elements.betXiuZone.classList.add('active-xiu');
    }
    updateUI();
}

// Xử lý nạp tiền cược
function handleBetClick(amount) {
    if (!state.isBettingPhase) {
        showToast("Đã hết thời gian đặt cược!");
        return;
    }
    if (!state.currentSide) {
        showToast("Vui lòng chọn TÀI hoặc XỈU trước!");
        return;
    }
    if (state.balance < amount) {
        showToast("Số dư không đủ!");
        return;
    }

    state.balance -= amount;
    state.currentBetAmount += amount;
    updateUI();
}

// Hiển thị thông báo Toast
function showToast(message) {
    elements.toast.innerText = message;
    elements.toast.style.display = 'block';
    setTimeout(() => {
        elements.toast.style.display = 'none';
    }, 3000);
}

// Vòng lặp thời gian game
function gameLoop() {
    setInterval(() => {
        state.timeLeft--;
        elements.timer.innerText = state.timeLeft;

        if (state.timeLeft <= 0) {
            if (state.isBettingPhase) {
                // Chuyển sang giai đoạn trả kết quả
                state.isBettingPhase = false;
                state.timeLeft = 8; 
                elements.timer.innerText = "MỞ";
                processGameResult();
            } else {
                // Chuyển sang phiên mới
                state.isBettingPhase = true;
                state.timeLeft = 30;
                resetNewRound();
            }
        }
    }, 1000);
}

// Xử lý kết quả ngẫu nhiên
function processGameResult() {
    const diceEls = document.querySelectorAll('.dice');
    elements.resultText.innerText = "Đang lắc...";
    
    // Thêm hiệu ứng rung
    diceEls.forEach(el => el.classList.add('shaking'));

    setTimeout(() => {
        diceEls.forEach(el => el.classList.remove('shaking'));
        
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2 + d3;

        diceEls[0].innerText = state.diceIcons[d1 - 1];
        diceEls[1].innerText = state.diceIcons[d2 - 1];
        diceEls[2].innerText = state.diceIcons[d3 - 1];

        let finalResult = "";
        if (d1 === d2 && d2 === d3) {
            finalResult = "TAM BẢO"; 
        } else {
            finalResult = total >= 11 ? "TAI" : "XIU";
        }

        elements.resultText.innerText = `${total} điểm - ${finalResult}`;
        
        // Tính toán tiền thắng/thua
        if (state.currentSide === finalResult) {
            const winPrize = state.currentBetAmount * 2;
            state.balance += winPrize;
            showToast(`THẮNG! +${winPrize.toLocaleString()}đ`);
        } else if (state.currentSide) {
            showToast(`THUA! Kết quả là ${finalResult}`);
        }

        updateHistory(finalResult);
        state.currentBetAmount = 0;
        state.currentSide = null;
        updateUI();
    }, 2500);
}

function updateHistory(res) {
    const dot = document.createElement('div');
    dot.className = `dot ${res === 'TAI' ? 'tai' : 'xiu'}`;
    dot.innerText = res === 'TAI' ? 'T' : 'X';
    elements.history.prepend(dot);
}

function resetNewRound() {
    elements.resultText.innerText = "Đang đợi đặt cược...";
    document.querySelectorAll('.dice').forEach(d => d.innerText = "?");
    elements.betTaiZone.classList.remove('active-tai');
    elements.betXiuZone.classList.remove('active-xiu');
    updateUI();
}

// Event Listeners cho các nút cược
document.querySelectorAll('.btn-amount').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const amount = parseInt(btn.getAttribute('data-amount'));
        handleBetClick(amount);
    });
});

elements.betTaiZone.addEventListener('click', () => selectSide('TAI'));
elements.betXiuZone.addEventListener('click', () => selectSide('XIU'));

// Khởi tạo Game
updateUI();
gameLoop();