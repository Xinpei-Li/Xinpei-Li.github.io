// --- 遊戲設定 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 480;

const GRAVITY = 0.7;
const FLOOR_Y = canvas.height - 50; 

// --- 遊戲狀態與 DOM 元素 ---
let gameActive = false; 
let animationFrameId;   

const gameOverlay = document.getElementById('gameOverlay');
const gameMessage = document.getElementById('gameMessage');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

if (restartButton) restartButton.style.display = 'none';


// --- 圖片加載處理 ---
const loadedImages = {};
let imagesToLoad = 0;

function loadImage(name, src) {
    imagesToLoad++;
    const img = new Image();
    img.onload = () => {
        imagesToLoad--;
        if (imagesToLoad === 0) {
            drawInitialScreen(); 
        }
    };
    img.src = src;
    // 解決像素圖模糊問題
    ctx.imageSmoothingEnabled = false; 
    img.style.imageRendering = 'pixelated';
    loadedImages[name] = img;
}

// **圖片載入：請確保路徑正確！**
loadImage('player1_idle', './assets/player1_idle.png');
loadImage('player2_idle', './assets/player2_idle.png');
loadImage('player1_attack', './assets/player1_attack.png'); 
loadImage('player2_attack', './assets/player2_attack.png'); 
loadImage('background', './assets/background.png');


// --- 角色類別 (Fighter Class) ---
class Fighter {
    constructor({ x, y, width, height, color, healthBarId, isAI = false, imageKeys }) {
        this.initialX = x; 
        this.initialY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocity = { x: 0, y: 0 };
        this.isJumping = false;
        this.health = 100;
        this.healthBar = document.getElementById(healthBarId);
        this.isAttacking = false;
        this.isAI = isAI; 
        this.imageKeys = imageKeys;
        this.attackBox = {
            position: { x: this.x, y: this.y },
            width: 100,
            height: 50
        };
    }

    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = { x: 0, y: 0 };
        this.isJumping = false;
        this.health = 100;
        this.isAttacking = false;
        if (this.healthBar) {
            this.healthBar.style.width = '100%';
        }
    }

    draw() {
        // 決定當前要繪製的圖片
        let currentImage;
        if (this.isAttacking) {
            currentImage = loadedImages[this.imageKeys.attack];
        } else {
            currentImage = loadedImages[this.imageKeys.idle];
        }

        if (currentImage && currentImage.complete) {
            ctx.drawImage(
                currentImage, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        } else {
             // 圖片未載入時，退回繪製方塊
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // 繪製攻擊判定框 (用於調試)
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; 
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    update() {
        this.draw();

        // 1. 更新攻擊判定框的位置 (根據角色方向)
        if (this.color === 'red') {
            this.attackBox.position.x = this.x + this.width;
        } else {
            this.attackBox.position.x = this.x - this.attackBox.width;
        }
        this.attackBox.position.y = this.y;

        // 2. 應用物理和移動
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // 應用重力
        if (this.y + this.height + this.velocity.y < FLOOR_Y) {
            this.velocity.y += GRAVITY;
        } else {
            this.velocity.y = 0;
            this.y = FLOOR_Y - this.height;
            this.isJumping = false;
        }

        // 3. 更新生命條顯示
        if (this.healthBar) {
            this.healthBar.style.width = Math.max(0, this.health) + '%';
        }
    }

    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            // 攻擊判定和動畫持續 100 毫秒
            setTimeout(() => {
                this.isAttacking = false;
            }, 100);
        }
    }
}

// --- 創建玩家實例 ---
const player1 = new Fighter({
    x: 100,
    y: 0,
    width: 50,
    height: 100,
    color: 'red',
    healthBarId: 'player1Health',
    imageKeys: { idle: 'player1_idle', attack: 'player1_attack' }
});

const player2 = new Fighter({
    x: canvas.width - 150,
    y: 0,
    width: 50,
    height: 100,
    color: 'blue',
    healthBarId: 'player2Health',
    isAI: true,
    imageKeys: { idle: 'player2_idle', attack: 'player2_attack' }
});

// --- 輸入控制狀態 (Keys) ---
const keys = {
    a: { pressed: false },
    d: { pressed: false },
};

// --- 碰撞偵測 (rectangularCollision) ---
function rectangularCollision(rect1, rect2) {
    return (
        rect1.attackBox.position.x + rect1.attackBox.width >= rect2.x &&
        rect1.attackBox.position.x <= rect2.x + rect2.width &&
        rect1.attackBox.position.y + rect1.attackBox.height >= rect2.y &&
        rect1.attackBox.position.y <= rect2.y + rect2.height
    );
}

// --- 電腦玩家 (Player 2) AI 邏輯 ---
function handleBotAI() {
    const distance = player2.x - player1.x;
    const attackRange = 100; 
    const tooClose = 50; 

    player2.velocity.x = 0;
    
    // 1. 移動邏輯
    if (distance > attackRange) {
        player2.velocity.x = -3; 
    } else if (distance < tooClose && distance > 0) {
        player2.velocity.x = 2; 
    }
    
    // 2. 攻擊邏輯
    if (distance <= attackRange && distance > 0 && Math.random() < 0.05) {
        player2.attack();
    }

    // 3. 跳躍邏輯
    if (!player2.isJumping && Math.random() < 0.005) {
        player2.velocity.y = -15; 
        player2.isJumping = true;
    }
}


// --- 遊戲結束處理 ---
function gameOver(winner) {
    gameActive = false;
    window.cancelAnimationFrame(animationFrameId); 
    
    gameOverlay.style.display = 'flex';
    gameMessage.textContent = 'GAME OVER: ' + winner;
    startButton.style.display = 'none'; 
    restartButton.style.display = 'block'; 
}

// --- 遊戲初始化和重設 ---
function initGame() {
    player1.reset();
    player2.reset();
    gameActive = true;
    
    gameOverlay.style.display = 'none';
    
    // 啟動遊戲循環
    animate();
}

// --- 遊戲主循環 (Animation Loop) ---
function animate() {
    if (!gameActive) return; 

    animationFrameId = window.requestAnimationFrame(animate); 

    // 1. 繪製背景
    if (loadedImages['background'] && loadedImages['background'].complete) {
        ctx.drawImage(loadedImages['background'], 0, 0, canvas.width, canvas.height);
    } else {
        // 如果背景圖沒載入，則繪製備用地面和天空
        ctx.fillStyle = 'black'; 
        ctx.fillRect(0, 0, canvas.width, FLOOR_Y); 
        ctx.fillStyle = '#654321'; 
        ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
    }
    
    // 2. 處理移動和 AI
    player1.velocity.x = 0;
    if (keys.a.pressed) {
        player1.velocity.x = -5;
    } else if (keys.d.pressed) {
        player1.velocity.x = 5;
    }
    handleBotAI();

    // 3. 更新角色
    player1.update();
    player2.update();

    // 4. 攻擊判定
    if (player1.isAttacking && rectangularCollision(player1, player2)) {
        player1.isAttacking = false; 
        player2.health -= 20; 
    }
    if (player2.isAttacking && rectangularCollision(player2, player1)) {
        player2.isAttacking = false;
        player1.health -= 20;
    }
    
    // 5. 檢查遊戲結束
    if (player1.health <= 0 || player2.health <= 0) {
        const winner = player1.health > 0 ? 'Player 1 Wins!' : 'AI Wins!';
        gameOver(winner);
    }
}

// --- 初始畫面繪製 ---
function drawInitialScreen() {
    if (imagesToLoad === 0) {
        // 繪製初始背景
        if (loadedImages['background']) {
            ctx.drawImage(loadedImages['background'], 0, 0, canvas.width, canvas.height);
        }
        player1.draw();
        player2.draw();
    }
}


// --- DOM 事件監聽 ---
if (startButton) startButton.addEventListener('click', initGame);
if (restartButton) restartButton.addEventListener('click', initGame);


// 鍵盤事件監聽
window.addEventListener('keydown', (event) => {
    if (!gameActive) return; 

    switch (event.key) {
        case 'd': keys.d.pressed = true; break;
        case 'a': keys.a.pressed = true; break;
        case 'w': 
            if (!player1.isJumping) { 
                player1.velocity.y = -15; 
                player1.isJumping = true;
            }
            break;
        case ' ': 
            player1.attack(); 
            break; 
    }
});

window.addEventListener('keyup', (event) => {
    if (!gameActive) return; 

    switch (event.key) {
        case 'd': keys.d.pressed = false; break;
        case 'a': keys.a.pressed = false; break;
    }
});
