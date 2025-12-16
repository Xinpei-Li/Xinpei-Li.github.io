// 獲取所有需要的 DOM 元素
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const countdownDisplay = document.getElementById('countdown');
const timerDisplay = document.getElementById('timer'); 
const playerHealthBar = document.getElementById('player-health-bar'); 
const enemyHealthBar = document.getElementById('enemy-health-bar'); // 恢復敵人的血條元素

// 常數
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const GROUND_LEVEL = 0; // 地面 Y 座標

// 遊戲狀態追蹤
let gameState = 'waiting'; 
let gameLoopId; 
let gameTime = 60; // 初始遊戲時間
let timerIntervalId;

// ==========================================
// 1. 角色類別 (Character Class)
// ==========================================

class Character {
    constructor(elementId, xPercent, y, health) {
        this.element = document.getElementById(elementId);
        
        // 核心屬性 (尺寸已在 CSS 調整為 80x120)
        this.width = 80;
        this.height = 120;
        
        this.position = { x: (GAME_WIDTH * xPercent) / 100, y: y }; 
        this.velocity = { x: 0, y: 0 }; 
        this.health = health;
        
        this.isAttacking = false;
        this.isJumping = false;
        
        this.draw();
    }

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

// 建立玩家和敵人實例
let player = new Character('player', 10, GROUND_LEVEL, 100); 
let enemy = new Character('enemy', 90, GROUND_LEVEL, 100); // 敵人已恢復


// ==========================================
// 2. 遊戲迴圈 (Game Loop) 
// ==========================================

function gameLoop() {
    if (gameState === 'playing') {
        player.update();
        enemy.update(); // 恢復敵人更新
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
    
    gameLoopId = requestAnimationFrame(gameLoop);
    startTimer(); 
}

function startTimer() {
    if (timerIntervalId) clearInterval(timerIntervalId);
    
    timerIntervalId = setInterval(() => {
        if (gameTime > 0) {
            gameTime -= 1;
            timerDisplay.textContent = gameTime;
        } else {
            clearInterval(timerIntervalId);
            gameState = 'over';
            console.log("時間到！遊戲結束。");
        }
    }, 1000);
}
