let scene, camera, renderer, player, enemies = [], bullets = [], score = 0;
// 修改 WebSocket 连接
// const socket = new WebSocket('ws://localhost:3000');
// 暂时移除 WebSocket 连接，改为本地分数管理
let score = 0;

// 音效管理
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
const sounds = {
    shoot: new THREE.Audio(listener),
    explosion: new THREE.Audio(listener),
    background: new THREE.Audio(listener)
};

function init() {
    // 初始化场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // 设置相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 30);  // 调整相机位置
    camera.lookAt(0, 0, 0);  // 让相机看向场景中心
    
    // 添加音频监听器到相机
    camera.add(listener);
    
    // 设置渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // 加载音效
    loadSounds();
    
    // 创建玩家
    createPlayer();
    
    // 启用阴影
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 添加事件监听
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onWindowResize, false);
    
    // 开始动画循环
    animate();
}

function createPlayer() {
    const geometry = new THREE.BoxGeometry(2, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x0000ff,
        specular: 0x555555,
        shininess: 30 
    });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, -8, 0);
    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);
}

// 添加窗口大小调整处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function loadSounds() {
    audioLoader.load('./sounds/shoot.mp3', buffer => sounds.shoot.setBuffer(buffer));
    audioLoader.load('./sounds/explosion.mp3', buffer => sounds.explosion.setBuffer(buffer));
    audioLoader.load('./sounds/background.mp3', buffer => {
        sounds.background.setBuffer(buffer);
        sounds.background.setLoop(true);
        sounds.background.play();
    });
}

function onKeyDown(event) {
    switch(event.keyCode) {
        case 37: // 左箭头
            movePlayer('left');
            break;
        case 39: // 右箭头
            movePlayer('right');
            break;
        case 32: // 空格
            shoot();
            break;
    }
}

function movePlayer(direction) {
    const speed = 0.3;
    if (direction === 'left' && player.position.x > -10) {
        player.position.x -= speed;
    } else if (direction === 'right' && player.position.x < 10) {
        player.position.x += speed;
    }
    // 移除 WebSocket 相关代码
}

function shoot() {
    const bullet = createBullet();
    bullets.push(bullet);
    scene.add(bullet);
    sounds.shoot.play();
    // 移除 WebSocket 相关代码
}

function createBullet() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(geometry, material);
    bullet.position.copy(player.position);
    bullet.position.y += 1;
    return bullet;
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].position.y += 0.5;
        if (bullets[i].position.y > 30) {
            scene.remove(bullets[i]);
            bullets.splice(i, 1);
        }
    }
}

function createEnemy() {
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(
        Math.random() * 20 - 10,
        20,
        0
    );
    enemies.push(enemy);
    scene.add(enemy);
}

function updateEnemies() {
    if (Math.random() < 0.02) {
        createEnemy();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].position.y -= 0.2;
        if (enemies[i].position.y < -15) {
            scene.remove(enemies[i]);
            enemies.splice(i, 1);
        }
    }
}

function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (enemies[i] && bullets[j]) {
                const distance = enemies[i].position.distanceTo(bullets[j].position);
                if (distance < 1) {
                    scene.remove(enemies[i]);
                    scene.remove(bullets[j]);
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    updateScore(10);
                    sounds.explosion.play();
                }
            }
        }
    }
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = `得分: ${score}`;
    // 移除 WebSocket 相关代码
}

function animate() {
    requestAnimationFrame(animate);
    updateBullets();
    updateEnemies();
    checkCollisions();
    renderer.render(scene, camera);
}

// 初始化游戏
init();