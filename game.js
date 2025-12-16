// 遊戲配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container', // 遊戲渲染目標
    pixelArt: true, // 啟用像素藝術模式，讓圖像不會模糊
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, // 模擬重力
            debug: false // 設為 true 可以在開發時看到碰撞邊框
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let coins;
let score = 0;
let scoreText;
let timeText;
let timerEvent;
let timeLeft = 60; // 60 秒限制
let gameOver = false;

function preload ()
{
    // --- 載入資源 ---
    // 這裡我們用 Phaser 內建的圖形來模擬像素圖
    // 在您繪製好像素圖後，您將用 this.load.image 或 this.load.spritesheet 來取代它們
    
    // 模擬角色圖 (16x16 綠色方塊)
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAHBJREFUOE9jZKAyYKRi8A/E4X+I2P+N4f+NGBj8B/EYEAN1DqXgLwEGMtK6z1wMYGBgYKCD/6H0T6x/E33B+HekYx/A4wMvTggx1n3Y80e/R6d/Q3zI31L/gT//hAAMGBh0P9hG+d/E/1L+R1J/Y7+BgYEDAKRPA4gJ8d7zAAAAAElFTkSuQmCC'); 
    
    // 模擬平台圖 (16x16 棕色方塊)
    this.load.image('platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZKAyYKRi8A/E4X+I2P+N4f+NGBj8B/EYEAN1DqUAg+X8D8b/R1YvQ/gAAAAAElFTkSuQmCC'); 
    
    // 模擬金幣圖 (16x16 黃色方塊)
    this.load.image('coin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGVJREFUOE9jZKAyYKRi8A/E4X+I2P+N4f+NGBj8B/EYEAN1DqXgLwEGMtK6z1wMYGBgYKCD/6H0T6x/E33B+HekYx/A4wMvTggx1n3Y80e/R6d/Q3zI31L/gT//hAAMGBh0P9hG+d/E/1L+R1J/Y7+BgYEDAIo/AYgO8d/vAAAAAElFTkSuQmCC'); 
}

function create ()
{
    // 設定遊戲背景
    this.cameras.main.setBackgroundColor('#87CEEB'); // 經典馬力歐天空藍

    // 1. 建立平台群組
    platforms = this.physics.add.staticGroup();

    // 建立地面
    platforms.create(400, 584, 'platform').setScale(50, 2).refreshBody(); // 寬度 50 * 16px
    
    // 建立上層平台 (寶庫結構)
    platforms.create(600, 400, 'platform').setScale(10, 1).refreshBody();
    platforms.create(50, 250, 'platform').setScale(8, 1).refreshBody();
    platforms.create(750, 220, 'platform').setScale(8, 1).refreshBody();

    // 2. 建立角色
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2); // 小小的反彈
    player.setCollideWorldBounds(true);
    // 讓角色看起來更像素化
    player.setScale(2); 

    // 3. 碰撞設定
    this.physics.add.collider(player, platforms);

    // 4. 建立金幣
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 11, // 總共 12 個
        setXY: { x: 12, y: 0, stepX: 70 } // 從 X=12 開始，每隔 70 像素一個
    });

    // 讓金幣看起來更像素化
    coins.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); // 讓金幣有彈性
        child.setScale(2);
    });

    // 金幣與平台碰撞
    this.physics.add.collider(coins, platforms);
    
    // 玩家與金幣重疊時，觸發 collectCoin 函式
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // 5. 輸入控制
    cursors = this.input.keyboard.createCursorKeys();

    // 6. 介面 (UI)
    scoreText = this.add.text(16, 16, '分數: 0', { fontSize: '32px', fill: '#000', fontFamily: 'monospace' }).setScrollFactor(0);
    timeText = this.add.text(600, 16, '時間: 60', { fontSize: '32px', fill: '#000', fontFamily: 'monospace' }).setScrollFactor(0);

    // 7. 計時器
    timerEvent = this.time.addEvent({ 
        delay: 1000, 
        callback: updateTime, 
        callbackScope: this, 
        loop: true 
    });
}

// 收集金幣的函式
function collectCoin (player, coin)
{
    coin.disableBody(true, true); // 隱藏並停用金幣
    score += 100;
    scoreText.setText('分數: ' + score);

    // 檢查是否收集完所有金幣，如果收集完了，重新生成一組
    if (coins.countActive(true) === 0)
    {
        coins.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

// 更新計時器的函式
function updateTime()
{
    timeLeft--;
    timeText.setText('時間: ' + timeLeft);

    if (timeLeft <= 0)
    {
        timerEvent.remove(false); // 停止計時器
        gameOver = true;
        this.physics.pause(); // 暫停所有物理效果
        player.setTint(0xff0000); // 讓角色變紅
        this.add.text(400, 300, '遊戲結束！', { fontSize: '64px', fill: '#FF0000', fontFamily: 'monospace' }).setOrigin(0.5);
    }
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    // 左右移動
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
    }
    else
    {
        player.setVelocityX(0);
    }

    // 跳躍 (確保只有在接觸地板時才能跳躍)
    // 這裡使用 'up' 鍵來跳躍，就像經典的馬力歐一樣
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-450); // 往上跳躍
    }
}
