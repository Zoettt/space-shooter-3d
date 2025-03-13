// 游戏核心变量
let scene, camera, renderer;
let player1, player2;
let bullets1 = [], bullets2 = [], enemies = [];
let score1 = 0, score2 = 0;

// 键盘状态 - 使用简单变量
let leftKey = false;
let rightKey = false;
let spaceKey = false;
let aKey = false;
let dKey = false;
let wKey = false;

// 初始化游戏
function init() {
    console.log("游戏初始化开始");
    
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // 添加光源
    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
    
    // 创建玩家
    createPlayers();
    
    // 设置键盘监听
    setupKeyboardListeners();
    
    console.log("游戏初始化完成");
    
    // 开始游戏循环
    gameLoop();
}

// 创建玩家
function createPlayers() {
    // 玩家1（蓝色）
    const geometry1 = new THREE.BoxGeometry(2, 1, 1);
    const material1 = new THREE.MeshBasicMaterial({color: 0x0000ff});
    player1 = new THREE.Mesh(geometry1, material1);
    player1.position.set(-5, -10, 0);
    scene.add(player1);
    
    // 玩家2（绿色）
    const geometry2 = new THREE.BoxGeometry(2, 1, 1);
    const material2 = new THREE.MeshBasicMaterial({color: 0x00ff00});
    player2 = new THREE.Mesh(geometry2, material2);
    player2.position.set(5, -10, 0);
    scene.add(player2);
    
    console.log("玩家创建完成");
}

// 设置键盘监听
function setupKeyboardListeners() {
    // 按键按下
    window.addEventListener('keydown', function(e) {
        console.log("按键按下:", e.code);
        switch(e.code) {
            case 'ArrowLeft': leftKey = true; break;
            case 'ArrowRight': rightKey = true; break;
            case 'Space': spaceKey = true; break;
            case 'KeyA': aKey = true; break;
            case 'KeyD': dKey = true; break;
            case 'KeyW': wKey = true; break;
        }
    });
    
    // 按键释放
    window.addEventListener('keyup', function(e) {
        switch(e.code) {
            case 'ArrowLeft': leftKey = false; break;
            case 'ArrowRight': rightKey = false; break;
            case 'Space': spaceKey = false; break;
            case 'KeyA': aKey = false; break;
            case 'KeyD': dKey = false; break;
            case 'KeyW': wKey = false; break;
        }
    });
    
    console.log("键盘监听设置完成");
}

// 游戏主循环
function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    // 处理玩家移动
    updatePlayers();
    
    // 处理射击
    handleShooting();
    
    // 更新游戏状态
    updateBullets();
    updateEnemies();
    checkCollisions();
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 更新玩家位置
function updatePlayers() {
    const speed = 1.5;
    
    // 玩家1移动
    if (leftKey && player1.position.x > -10) {
        player1.position.x -= speed;
    }
    if (rightKey && player1.position.x < 10) {
        player1.position.x += speed;
    }
    
    // 玩家2移动
    if (aKey && player2.position.x > -10) {
        player2.position.x -= speed;
    }
    if (dKey && player2.position.x < 10) {
        player2.position.x += speed;
    }
}

// 射击冷却
let player1Cooldown = 0;
let player2Cooldown = 0;

// 处理射击
function handleShooting() {
    // 更新冷却
    if (player1Cooldown > 0) player1Cooldown--;
    if (player2Cooldown > 0) player2Cooldown--;
    
    // 玩家1射击
    if (spaceKey && player1Cooldown === 0) {
        createBullet(player1, 1);
        player1Cooldown = 10;
    }
    
    // 玩家2射击
    if (wKey && player2Cooldown === 0) {
        createBullet(player2, 2);
        player2Cooldown = 10;
    }
}

// 创建子弹
function createBullet(player, playerNum) {
    const bulletGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const bulletMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    bullet.position.copy(player.position);
    bullet.position.y += 1;
    scene.add(bullet);
    
    if (playerNum === 1) {
        bullets1.push(bullet);
    } else {
        bullets2.push(bullet);
    }
}

// 更新子弹位置
function updateBullets() {
    // 更新玩家1子弹
    for (let i = bullets1.length - 1; i >= 0; i--) {
        bullets1[i].position.y += 0.5;
        if (bullets1[i].position.y > 15) {
            scene.remove(bullets1[i]);
            bullets1.splice(i, 1);
        }
    }
    
    // 更新玩家2子弹
    for (let i = bullets2.length - 1; i >= 0; i--) {
        bullets2[i].position.y += 0.5;
        if (bullets2[i].position.y > 15) {
            scene.remove(bullets2[i]);
            bullets2.splice(i, 1);
        }
    }
}

// 创建敌人
function createEnemy() {
    const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const enemyMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    
    enemy.position.set(
        Math.random() * 20 - 10,
        15,
        0
    );
    
    scene.add(enemy);
    enemies.push(enemy);
}

// 更新敌人位置
function updateEnemies() {
    // 随机生成敌人
    if (Math.random() < 0.02) {
        createEnemy();
    }
    
    // 更新敌人位置
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].position.y -= 0.1;
        if (enemies[i].position.y < -15) {
            scene.remove(enemies[i]);
            enemies.splice(i, 1);
        }
    }
}

// 检测碰撞
function checkCollisions() {
    // 检测玩家1子弹碰撞
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets1.length - 1; j >= 0; j--) {
            if (isColliding(enemies[i], bullets1[j])) {
                updateScore(1);
                scene.remove(enemies[i]);
                scene.remove(bullets1[j]);
                enemies.splice(i, 1);
                bullets1.splice(j, 1);
                break;
            }
        }
    }
    
    // 检测玩家2子弹碰撞
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets2.length - 1; j >= 0; j--) {
            if (isColliding(enemies[i], bullets2[j])) {
                updateScore(2);
                scene.remove(enemies[i]);
                scene.remove(bullets2[j]);
                enemies.splice(i, 1);
                bullets2.splice(j, 1);
                break;
            }
        }
    }
}

// 碰撞检测
function isColliding(obj1, obj2) {
    const distance = Math.sqrt(
        Math.pow(obj1.position.x - obj2.position.x, 2) +
        Math.pow(obj1.position.y - obj2.position.y, 2)
    );
    return distance < 1;
}

// 更新分数
function updateScore(playerNum) {
    if (playerNum === 1) {
        score1 += 10;
        document.getElementById('score1').textContent = `玩家1得分: ${score1}`;
    } else {
        score2 += 10;
        document.getElementById('score2').textContent = `玩家2得分: ${score2}`;
    }
}

// 启动游戏
window.addEventListener('load', init);