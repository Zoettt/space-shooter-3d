const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 存储玩家信息和分数
const players = new Map();
const scores = [];

// 提供静态文件
app.use(express.static(path.join(__dirname, '/')));

// WebSocket 连接处理
wss.on('connection', (ws) => {
    const playerId = Date.now();
    players.set(playerId, { ws, score: 0 });

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'move':
                // 广播玩家移动
                broadcastToOthers(playerId, {
                    type: 'playerMove',
                    id: playerId,
                    position: data.position
                });
                break;
            case 'shoot':
                // 广播射击
                broadcastToOthers(playerId, {
                    type: 'playerShoot',
                    id: playerId,
                    position: data.position
                });
                break;
            case 'score':
                // 更新分数
                players.get(playerId).score = data.score;
                updateScores();
                break;
        }
    });

    ws.on('close', () => {
        players.delete(playerId);
        updateScores();
    });
});

function broadcastToOthers(senderId, data) {
    players.forEach((player, id) => {
        if (id !== senderId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(data));
        }
    });
}

function updateScores() {
    const scoreList = Array.from(players.values())
        .map(p => p.score)
        .sort((a, b) => b - a)
        .slice(0, 10);

    const scoreData = {
        type: 'scoreUpdate',
        scores: scoreList
    };

    players.forEach((player) => {
        if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(scoreData));
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});