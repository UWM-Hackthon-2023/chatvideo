// 在 background.js 或其他脚本中
//background.js

function fetchVideoSummary(videoDescription) {
    const apiKey = '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'; // 替换为你的OpenAI API密钥
    const url = 'https://api.openai.com/v1/engines/davinci-codex/completions'; // GPT-3 API URL

    // GPT-3的请求数据
    const data = {
        prompt: "Write a summary about this video: " + videoDescription,
        max_tokens: 100
    };

    // 使用 fetch 发送 API 请求
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            // 处理GPT-3的响应数据
            console.log(data.choices[0].text); // 打印出生成的视频梗概
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
