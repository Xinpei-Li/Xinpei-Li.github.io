// --- 遊戲設定 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 480;

// 定義重力和地面高度
const GRAVITY = 0.7;
const FLOOR_Y = canvas.height - 50; // 地面線

// --- 角色類別 (Fighter Class) ---
class Fighter {
    constructor({ x, y, width, height, color, velocity, healthBarId, isAI = false }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocity = velocity || { x: 0, y: 0 };
        this.isJumping = false;
        this.health = 100;
        this.healthBar = document.getElementById(healthBarId);
        this.isAttacking = false;
        this.attackBox = {
            position: { x: this.x, y: this.y },
            width: 100,
            height: 50
        };
        this.isAI = isAI; // 標記是否為電腦控制
    }

    // 繪製角色
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 繪製攻擊判定框 (測試用，實際遊戲中通常不顯示)
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    // 更新角色的位置和狀態
    update() {
        this.draw();

        // 根據角色顏色/方向，更新攻擊判定框的位置
        if (this.color === 'red') { // Player 1 (紅方) 攻擊框在右側
            this.attackBox.position.x = this.x + this.width;
        } else { // Player 2 (藍方/電腦) 攻擊框在左側
            this.attackBox.position.x = this.x - this.attackBox.width;
        }
        this.attackBox.position.y = this.y;

        // 應用水平速度
        this.x += this.velocity.x;
        // 應用垂直速度
        this.y += this.velocity.y;

        // 應用重力 (如果不在地面上)
        if (this.y + this.height + this.velocity.y < FLOOR_Y) {
            this.velocity.y += GRAVITY;
        } else {
            // 角色落地
            this.velocity.y = 0;
            this.y = FLOOR_Y - this.height;
            this.isJumping = false;
        }

        // 更新生命條
        this.healthBar.style.width = this.health + '%';
    }

    // 角色攻擊動作
    attack() {
        if (!this.isAttacking) { // 避免連續攻擊
            this.isAttacking = true;
            // 攻擊動畫/判定只持續 100 毫秒
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
    healthBarId: 'player1Health'
});

const player2 = new Fighter({
    x: canvas.width - 150,
    y: 0,
    width: 50,
    height: 100,
    color: 'blue',
    healthBarId: 'player2Health',
    isAI: true // 設為 AI 控制
});

// --- 輸入控制 (Keys) ---
const keys = {
    // Player 1: WASD & Space
    a: { pressed: false },
    d: { pressed: false },
    space: { pressed: false }, // Attack
    // Player 2 的按鍵邏輯已經移除
};

// --- 碰撞偵測函數 ---
function rectangularCollision(rect1, rect2) {
    // 檢查 rect1 的攻擊框是否與 rect2 的本體碰撞
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
    const attackRange = 100; // 電腦覺得可以攻擊的距離 (與攻擊框寬度相關)
    const tooClose = 50; // 距離太近，考慮後退

    // 1. 基礎移動邏輯 (追蹤)
    player2.velocity.x = 0;
    
    if (distance > attackRange) {
        // 玩家太遠，靠近玩家 (向左移動)
        player2.velocity.x = -3;
    } else if (distance < tooClose && distance > 0) {
        // 玩家太近，嘗試遠離一點 (向右移動)
        player2.velocity.x = 2;
    }
    
    // 2. 攻擊邏輯
    // 如果玩家在攻擊範圍內，且電腦不在攻擊中，且有 5% 的機率攻擊
    if (distance <= attackRange && distance > 0 && !player2.isAttacking && Math.random() < 0.05) {
        player2.attack();
    }

    // 3. 跳躍邏輯 (偶爾)
    // 每幀 0.5% 的機率跳躍
    if (!player2.isJumping && Math.random() < 0.005) {
        player2.velocity.y = -15; // 跳躍力度
        player2.isJumping = true;
    }
}


// --- 遊戲主循環 (Animation Loop) ---
function animate() {
    window.requestAnimationFrame(animate); 

    // 清空畫布並繪製背景
    ctx.fillStyle = 'black'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    
    // 繪製地面
    ctx.fillStyle = '#654321'; 
    ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);

    // 處理玩家 1 的移動
    player1.velocity.x = 0;
    if (keys.a.pressed) {
        player1.velocity.x = -5;
    } else if (keys.d.pressed) {
        player1.velocity.x = 5;
    }

    // 處理電腦 AI 的行動
    handleBotAI();

    // 更新角色位置
    player1.update();
    player2.update();

    // --- 攻擊判定邏輯 ---
    // 1. 玩家 1 攻擊玩家 2 (電腦)
    if (player1.isAttacking && rectangularCollision(player1, player2)) {
        player1.isAttacking = false; 
        player2.health -= 20; 
        console.log('Player 1 Hit Player 2 (AI)!');
    }

    // 2. 玩家 2 (電腦) 攻擊玩家 1
    if (player2.isAttacking && rectangularCollision(player2, player1)) {
        player2.isAttacking = false;
        player1.health -= 20;
        console.log('Player 2 (AI) Hit Player 1!');
    }
    
    // 處理遊戲結束
    if (player1.health <= 0 || player2.health <= 0) {
        // 停止動畫循環
        cancelAnimationFrame(animate); 
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        // 判斷贏家
        const winner = player1.health > 0 ? 'Player 1 Wins' : 'AI Wins';
        ctx.fillText('Game Over: ' + winner, canvas.width / 2, canvas.height / 2);
    }
}

// 啟動遊戲
animate();


// --- 鍵盤事件監聽 (僅處理 Player 1) ---
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        // Player 1 移動
        case 'd': keys.d.pressed = true; break;
        case 'a': keys.a.pressed = true; break;
        
        // Player 1 跳躍
        case 'w': 
            if (!player1.isJumping) { 
                player1.velocity.y = -15; 
                player1.isJumping = true;
            }
            break;
        
        // Player 1 攻擊
        case ' ': 
            player1.attack(); 
            break; 
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd': keys.d.pressed = false; break;
        case 'a': keys.a.pressed = false; break;
    }
});
