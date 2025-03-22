const binanceApiKey = document.getElementById("binanceApiKey");
const binanceSecretKey = document.getElementById("binanceSecretKey");
const tradeSignal = document.getElementById("tradeSignal");

async function fetchMarketData() {
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
    const data = await response.json();
    return data;
}

async function analyzeMarket() {
    const marketData = await fetchMarketData();
    const rsi = calculateRSI(marketData);
    const macd = calculateMACD(marketData);
    const ema = calculateEMA(marketData);

    const signal = await getAiTradingSignal(rsi, macd, ema);
    tradeSignal.innerText = signal;

    return signal;
}

function calculateRSI(data) {
    return Math.random() * 100;  // ডেমো হিসাব, লাইভ মার্কেট ডাটা প্রয়োগ করতে হবে
}

function calculateMACD(data) {
    return Math.random() * 2 - 1; 
}

function calculateEMA(data) {
    return data.weightedAvgPrice;
}

async function getAiTradingSignal(rsi, macd, ema) {
    const prompts = [
        `RSI: ${rsi}, MACD: ${macd}, EMA: ${ema}. What should be the best trading decision?`
    ];
    
    const chatGPTResponse = await callAI("https://api.openai.com/v1/chat/completions", "ChatGPT", prompts);
    const deepSeekResponse = await callAI("https://deepseek.com/api", "DeepSeek", prompts);
    const geminiResponse = await callAI("https://gemini.google.com/api", "Gemini", prompts);
    const llamaResponse = await callAI("https://llama.com/api", "Llama", prompts);

    const responses = [chatGPTResponse, deepSeekResponse, geminiResponse, llamaResponse];
    return chooseBestSignal(responses);
}

async function callAI(apiUrl, model, prompts) {
    const apiKey = document.getElementById(`${model.toLowerCase()}ApiKey`).value;
    
    if (!apiKey) return "No Response";
    
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt: prompts[0] })
    });

    const data = await response.json();
    return data.choices?.[0]?.text || "No Response";
}

function chooseBestSignal(responses) {
    const signalCounts = { BUY: 0, SELL: 0, HOLD: 0 };

    responses.forEach(response => {
        if (response.includes("BUY")) signalCounts.BUY++;
        if (response.includes("SELL")) signalCounts.SELL++;
        if (response.includes("HOLD")) signalCounts.HOLD++;
    });

    return Object.keys(signalCounts).reduce((a, b) => signalCounts[a] > signalCounts[b] ? a : b);
}

async function executeTrade(signal) {
    const apiKey = binanceApiKey.value;
    const secretKey = binanceSecretKey.value;

    if (!apiKey || !secretKey) {
        alert("Binance API Key প্রয়োজন!");
        return;
    }

    const orderData = {
        symbol: "BTCUSDT",
        side: signal,
        type: "MARKET",
        quantity: 0.001
    };

    await fetch("https://api.binance.com/api/v3/order", {
        method: "POST",
        headers: {
            "X-MBX-APIKEY": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    });

    alert(`${signal} Order Executed!`);
}

document.getElementById("buyBtn").addEventListener("click", () => executeTrade("BUY"));
document.getElementById("sellBtn").addEventListener("click", () => executeTrade("SELL"));
document.getElementById("holdBtn").addEventListener("click", () => executeTrade("HOLD"));

async function startTrading() {
    setInterval(analyzeMarket, 30000);  // প্রতি ৩০ সেকেন্ড পর মার্কেট বিশ্লেষণ
}

analyzeMarket();