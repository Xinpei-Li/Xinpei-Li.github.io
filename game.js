// --- 遊戲設定 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設置畫布尺寸
canvas.width = 640;
canvas.height = 480;

const GRAVITY = 0.7;
const FLOOR_Y = canvas.height - 50; 

// --- 遊戲狀態與 DOM 元素 ---
let gameActive = false; // 遊戲是否正在進行
let animationFrameId;   // 動畫循環 ID

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
    img.onerror = () => {
        console.warn(`Warning: Image ${src} failed to load. Using fallback color.`);
        imagesToLoad--; // 即使失敗也要減少計數器
        if (imagesToLoad === 0) {
            drawInitialScreen();
        }
    };
    img.src = src;
    ctx.imageSmoothingEnabled = false; // 確保像素圖清晰
    loadedImages[name] = img;
}

// **圖片載入：請檢查路徑 './assets/' 是否正確！**
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
            // 繪製圖片
            ctx.drawImage(
                currentImage, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        } else {
             // 圖片未載入時，退回繪製方塊 (Fallback)
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // 繪製攻擊判定框 (用於調試，可移除此段 if 隱藏)
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; 
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    update() {
        this.draw();

        // 1. 更新攻擊判定框的位置 (根據角色方向)
        if (this.color
