// 獲取所有需要的 DOM 元素
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const countdownDisplay = document.getElementById('countdown');
const timerDisplay = document.getElementById('timer'); 

// 常數 (現在動態獲取寬高，雖然在 CSS 中我們使用了 100vw/100vh)
// 但我們在 JS 中需要知道這些邊界
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;

// 遊戲狀態追蹤
let gameState = 'waiting'; 
let gameLoopId; 
let gameTime = 60; // 初始遊戲時間
let timerIntervalId;

// ==========================================
// 1. 角色類別 (Character Class) 骨架
// ==========================================

class Character {
    constructor(elementId, xPercent, y, health) {
        this.element = document.getElementById(elementId);
        
        // 核心屬性
        this.width = 50;
        this.height = 80;
        // x: 使用百分比來計算初始位置，這樣在全螢幕下也能正確定位
        this.position = { x: (GAME_WIDTH * xPercent) / 100, y: y }; 
        this.velocity = { x: 0, y: 0 }; 
        this.health = health;
        
        // 狀態
        this.isAttacking = false;
        this.isJumping = false;

        this.draw();
    }

    // 繪製/更新角色在畫面上的位置
    draw() {
        this.element.style.left = this.position.x + 'px';
        this.element.style.bottom = this.position.y + 'px';
    }

    // 更新角色狀態和位置 (將來實作移動、重力、跳躍、攻擊)
    update() {
        // ... (這裡將是實作移動邏輯的地方) ...
        this.draw();
    }
}

// 建立玩家和敵人實例 (使用百分比設定初始 X 軸位置)
// 玩家在左邊 10%，敵人距離右邊 10% (即 90%)
let player = new Character('player', 10, 0, 100); 
let enemy = new Character('enemy', 90, 0, 100); 


// ==========================================
// 2. 遊戲迴圈 (Game Loop) 骨架
// ==========================================

function gameLoop() {
    if (gameState === 'playing') {
        player.update();
        enemy.update();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}


// ==========================================
// 3. 遊戲流程控制與啟動 (含計時器邏輯)
// ==========================================

startButton.addEventListener('click', () => {
    if (gameState === 'waiting') {
        startScreen.style.display = 'none';
        gameState = 'counting';
        startCountdown();
    }
});

function startCountdown() {
    let count = 3;
    
    const intervalId = setInterval(() => {
        countdownDisplay.textContent = count > 0 ? count : 'GO!';
        
        countdownDisplay.classList.remove('countdown-active');
        void countdownDisplay.offsetWidth; 
        countdownDisplay.classList.add('countdown-active');
        countdownDisplay.style.opacity = 1;

        count -= 1;

        if (count < -1) { 
            clearInterval(intervalId);
            countdownDisplay.style.opacity = 0;
            countdownDisplay.textContent = '';
            
            setTimeout(() => {
                startGame();
            }, 1000); 
        }

    }, 1000); 
}

function startGame() {
    console.log("遊戲正式開始！");
    gameState = 'playing';
    
    // 啟動遊戲核心迴圈
    gameLoopId = requestAnimationFrame(gameLoop);
    
    // 啟動回合計時器
    startTimer(); 
}

function startTimer() {
    // 確保計時器ID是空的，避免重複啟動
    if (timerIntervalId) clearInterval(timerIntervalId);
    
    timerIntervalId = setInterval(() => {
        if (gameTime > 0) {
            gameTime -= 1;
            timerDisplay.textContent = gameTime;
        } else {
            // 時間歸零，遊戲結束
            clearInterval(timerIntervalId);
            gameState = 'over';
            console.log("時間到！遊戲結束。");
            // 這裡將來會加入遊戲結束的邏輯
        }
    }, 1000);
}
