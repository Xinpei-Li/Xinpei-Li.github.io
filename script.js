// 獲取所有需要的 DOM 元素
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const countdownDisplay = document.getElementById('countdown');

// 常數
const GAME_WIDTH = 800; // 遊戲容器的寬度
const GAME_HEIGHT = 400; // 遊戲容器的高度

// 遊戲狀態追蹤
let gameState = 'waiting'; 
let gameLoopId; // 用於儲存 requestAnimationFrame 的 ID

// ==========================================
// 1. 角色類別 (Character Class) 骨架
// 這是我們建立玩家和敵人物件的藍圖
// ==========================================

class Character {
    constructor(elementId, x, y, health) {
        this.element = document.getElementById(elementId);
        
        // 核心屬性
        this.width = 50;
        this.height = 80;
        this.position = { x: x, y: y }; // x: 橫向位置, y: 縱向位置 (從底部開始算)
        this.velocity = { x: 0, y: 0 }; // x: 水平速度, y: 垂直速度 (跳躍/重力)
        this.health = health;
        
        // 狀態
        this.isAttacking = false;
        this.isJumping = false;

        // 首次渲染
        this.draw();
    }

    // 繪製/更新角色在畫面上的位置
    draw() {
        // 更新 DOM 元素的位置 (CSS 的 left 和 bottom 屬性)
        this.element.style.left = this.position.x + 'px';
        this.element.style.bottom = this.position.y + 'px';
    }

    // 更新角色狀態和位置 (將在 gameLoop 中被呼叫)
    update() {
        // *** 這裡將是實作移動、重力、跳躍、攻擊邏輯的地方 ***

        // 呼叫 draw 來將位置變化渲染到畫面上
        this.draw();
    }
}

// 建立玩家和敵人實例
let player = new Character('player', 100, 0, 100); // x=100, y=0 (在地面上), 100HP
let enemy = new Character('enemy', GAME_WIDTH - 150, 0, 100); // x=650, y=0, 100HP


// ==========================================
// 2. 遊戲迴圈 (Game Loop) 骨架
// 這是遊戲的核心，不斷更新所有物件的狀態
// ==========================================

function gameLoop() {
    // 只有在 'playing' 狀態下才執行邏輯
    if (gameState === 'playing') {
        
        // 1. 更新所有角色狀態
        player.update();
        enemy.update();
        
        // 2. 處理碰撞和傷害判定 (之後實作)
        
        // 3. 檢查勝負條件 (之後實作)
    }

    // 不斷要求瀏覽器在下一幀重繪時呼叫 gameLoop
    gameLoopId = requestAnimationFrame(gameLoop);
}


// ==========================================
// 3. 遊戲流程控制與啟動
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
        
        // 應用動畫
        countdownDisplay.classList.remove('countdown-active');
        void countdownDisplay.offsetWidth; 
        countdownDisplay.classList.add('countdown-active');
        countdownDisplay.style.opacity = 1;

        count -= 1;

        if (count < -1) { 
            clearInterval(intervalId);
            countdownDisplay.style.opacity = 0;
            countdownDisplay.textContent = '';
            
            // GO! 之後延遲 1 秒後開始遊戲 (您的要求)
            setTimeout(() => {
                startGame();
            }, 1000); 
        }

    }, 1000); // 每 1 秒執行一次
}

function startGame() {
    console.log("遊戲正式開始！");
    gameState = 'playing';
    
    // 啟動遊戲核心迴圈
    gameLoopId = requestAnimationFrame(gameLoop);
    
    // 我們需要確保 player 和 enemy 已經被正確建立 (目前已在檔案開頭建立)
}

// ------------------------------------------
// 現在的遊戲已經可以運行流程，但角色不會動。
// 下一個步驟是：在 player.update() 內加入移動邏輯。
// ------------------------------------------
