// 步驟 1: 設計荒謬的答案庫
const answers = [
    "你現在去廚房會找到答案。（絕對不會）",
    "是的，除非太陽從西邊升起。",
    "如果你的貓點頭，那就是真的。",
    "問這麼多幹嘛？去睡覺啦。",
    "機率比你今天踩到香蕉皮還低。",
    "命運之神正在放假，請稍後再試。",
    "再問一次，這次要用氣音，不然不準。",
    "這是一個愚蠢的問題，所以答案是肯定的。",
    "答案就在風中... 但風向變了。",
    "據我的計算，你需要一杯咖啡才能理解這個答案。",
    "也許吧，但你得先解決你的拖延症問題。",
    "別想了，去工作吧。",
    "預言失敗，因為你沒付費。",
    "我的答案是：你很可愛。但這跟問題無關。",
    "你需要先打開一包洋芋片，才能獲得靈感。",
    "等一下！讓我先看看隔壁老王有沒有答案...",
    "我不確定，但你的問題讓我的CPU過熱了。",
    "你已經知道答案了，只是想聽我說出來。",
    "警告：預言結果可能引起不適。",
    "答案：42。你現在知道問題是什麼了嗎？",
];

// 步驟 2: 獲取 DOM 元素
const predictButton = document.getElementById('predict-button');
const resultDiv = document.getElementById('result');
const questionInput = document.getElementById('question-input');

// 步驟 3: 點擊按鈕時觸發核心邏輯
predictButton.addEventListener('click', () => {
    // 檢查輸入
    if (questionInput.value.trim() === "") {
        resultDiv.textContent = "你得先問個問題呀！命運之神不接受空白訂單。";
        resultDiv.style.opacity = 1;
        return;
    }

    // 1. 清空結果並開始加載動畫 (顯示 "命運正在運算中...")
    resultDiv.textContent = "命運正在運算中...";
    resultDiv.classList.add('loading-animation');
    resultDiv.style.opacity = 0.5;

    // 禁用按鈕，防止重複點擊
    predictButton.disabled = true;

    // 模擬預言的延遲（增加神秘感）
    setTimeout(() => {
        // 2. 停止加載動畫並啟用按鈕
        resultDiv.classList.remove('loading-animation');
        predictButton.disabled = false;

        // 3. 生成隨機索引和獲取答案
        const randomIndex = Math.floor(Math.random() * answers.length);
        const randomAnswer = answers[randomIndex];

        // 4. 顯示結果 (使用淡入效果)
        resultDiv.textContent = randomAnswer;
        resultDiv.style.opacity = 1; // 淡入顯示

        // 可選：清空輸入框
        questionInput.value = "";

    }, 1500); // 1.5 秒後揭曉答案
});
