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
    constructor({ x, y, width, height, color, velocity, healthBarId }) {
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
    }

    // 繪製角色
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 繪製攻擊判定框 (測試用，實際遊戲中通常不顯示)
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // 透明白色
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    // 更新角色的位置和狀態
    update() {
        this.draw();

        // 更新攻擊判定框的位置 (位於角色前方)
        this.attackBox.position.x = this.x + this.width;
        this.attackBox.position.y = this.y;

        // 應用水平速度
        this.x += this.velocity.x;
        // 應用垂直速度
        this.y += this.velocity.y;

        // 應用重力 (如果不在地面上)
        if (this.y + this.height + this.velocity.y < FLOOR_Y) {
            this.velocity.y += GRAVITY;
        } else {
            // 角色落地，重設位置到地面，停止垂直速度，並允許再次跳躍
            this.velocity.y = 0;
            this.y = FLOOR_Y - this.height;
            this.isJumping = false;
        }

        // 更新生命條
        this.healthBar.style.width = this.health + '%';
    }

    // 角色攻擊動作
    attack() {
        this.isAttacking = true;
        // 攻擊動畫/判定只持續 100 毫秒
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
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
    healthBarId: 'player2Health'
});

// --- 輸入控制 (Keys) ---
const keys = {
    // Player 1: WASD & Space
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false }, // Jump
    space: { pressed: false }, // Attack

    // Player 2: Arrow Keys & Enter
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowUp: { pressed: false }, // Jump
    Enter: { pressed: false } // Attack
};

// --- 碰撞偵測函數 ---
function rectangularCollision(rect1, rect2) {
    return (
        rect1.attackBox.position.x + rect1.attackBox.width >= rect2.x && // rect1 右邊界 > rect2 左邊界
        rect1.attackBox.position.x <= rect2.x + rect2.width &&          // rect1 左邊界 < rect2 右邊界
        rect1.attackBox.position.y + rect1.attackBox.height >= rect2.y && // rect1 下邊界 > rect2 上邊界
        rect1.attackBox.position.y <= rect2.y + rect2.height              // rect1 上邊界 < rect2 下邊界
    );
}


// --- 遊戲主循環 (Animation Loop) ---
function animate() {
    // 透過 requestAnimationFrame 實現每秒約 60 幀 (FPS)
    window.requestAnimationFrame(animate); 

    // 清空畫布，準備繪製新的一幀
    ctx.fillStyle = 'black'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    
    // 繪製地面 (讓畫面看起來更完整)
    ctx.fillStyle = '#654321'; // 棕色
    ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);


    // 處理玩家 1 的移動
    player1.velocity.x = 0;
    if (keys.a.pressed) {
        player1.velocity.x = -5;
    } else if (keys.d.pressed) {
        player1.velocity.x = 5;
    }

    // 處理玩家 2 的移動
    player2.velocity.x = 0;
    if (keys.ArrowLeft.pressed) {
        player2.velocity.x = -5;
    } else if (keys.ArrowRight.pressed) {
        player2.velocity.x = 5;
    }

    // 更新角色位置
    player1.update();
    player2.update();

    // --- 攻擊判定邏輯 ---
    // 1. 玩家 1 攻擊玩家 2
    if (player1.isAttacking && rectangularCollision(player1, player2)) {
        player1.isAttacking = false; // 攻擊一次後結束判定
        player2.health -= 20; // 扣血
        console.log('Player 1 Hit Player 2!');
        // 在這裡加入被擊中動畫或音效
    }

    // 2. 玩家 2 攻擊玩家 1
    if (player2.isAttacking && rectangularCollision(player2, player1)) {
        player2.isAttacking = false;
        player1.health -= 20;
        console.log('Player 2 Hit Player 1!');
    }
    
    // 處理遊戲結束 (簡化：任何一方血量 <= 0)
    if (player1.health <= 0 || player2.health <= 0) {
        // 停止動畫循環
        cancelAnimationFrame(animate); 
        console.log("Game Over");
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    }
}

// 啟動遊戲
animate();


// --- 鍵盤事件監聽 ---
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        // Player 1
        case 'd': keys.d.pressed = true; break;
        case 'a': keys.a.pressed = true; break;
        case 'w': 
            if (!player1.isJumping) { 
                player1.velocity.y = -15; // 跳躍力度
                player1.isJumping = true;
            }
            break;
        case ' ': 
            player1.attack(); 
            break; 

        // Player 2
        case 'ArrowRight': keys.ArrowRight.pressed = true; break;
        case 'ArrowLeft': keys.ArrowLeft.pressed = true; break;
        case 'ArrowUp': 
            if (!player2.isJumping) { 
                player2.velocity.y = -15; 
                player2.isJumping = true;
            }
            break;
        case 'Enter': 
            player2.attack();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        // Player 1
        case 'd': keys.d.pressed = false; break;
        case 'a': keys.a.pressed = false; break;
        
        // Player 2
        case 'ArrowRight': keys.ArrowRight.pressed = false; break;
        case 'ArrowLeft': keys.ArrowLeft.pressed = false; break;
    }
});
