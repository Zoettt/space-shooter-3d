// 基础场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// 游戏对象
let player1, player2;
const enemies = [];
const bullets1 = [];
const bullets2 = [];
let score1 = 0;
let score2 = 0;
let player1Health = 3;
let player2Health = 3;

// 初始化游戏
function init() {
    // 设置渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 设置相机位置
    camera.position.z = 20;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // 创建玩家
    createPlayers();

    // 添加键盘控制
    document.addEventListener('keydown', handleKeyPress);

    // 开始动画循环
    animate();
}

// 创建玩家飞机
// 修改创建玩家函数
function createPlayers() {
    // 创建飞机几何体
    const planeGeometry = new THREE.Group();
    
    // 机身（主体）
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    planeGeometry.add(body);
    
    // 机翼
    const wingGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
    const wingMaterial = new THREE.MeshPhongMaterial({color: 0x666666});
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.y = 0.1;
    planeGeometry.add(wing);
    
    // 尾翼
    const tailGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.8);
    const tailMaterial = new THREE.MeshPhongMaterial({color: 0x666666});
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-0.8, 0.2, 0);
    planeGeometry.add(tail);
    
    // 创建照片贴图平面
    const loader = new THREE.TextureLoader();
    const photoGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    
    // 玩家1（蓝色飞机）
    const player1Group = planeGeometry.clone();
    player1Group.children.forEach(part => {
        part.material = part.material.clone();
        part.material.color.setHex(0x0000ff);
    });
    
    // 添加玩家1的照片
    loader.load('/Users/guanjie/Desktop/trae/web-game/assets/photo1.jpg', (texture) => {
        const photoMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const photo = new THREE.Mesh(photoGeometry, photoMaterial);
        photo.position.set(0, 0.4, 0);  // 放在机身上方
        photo.rotation.x = -Math.PI / 6;  // 略微倾斜
        player1Group.add(photo);
    });
    
    player1 = player1Group;
    player1.position.set(-5, -10, 0);
    scene.add(player1);
    
    // 玩家2（绿色飞机）
    const player2Group = planeGeometry.clone();
    player2Group.children.forEach(part => {
        part.material = part.material.clone();
        part.material.color.setHex(0x00ff00);
    });
    
    // 添加玩家2的照片
    loader.load('/Users/guanjie/Desktop/trae/web-game/assets/photo2.jpg', (texture) => {
        const photoMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const photo = new THREE.Mesh(photoGeometry, photoMaterial);
        photo.position.set(0, 0.4, 0);
        photo.rotation.x = -Math.PI / 6;
        player2Group.add(photo);
    });
    
    player2 = player2Group;
    player2.position.set(5, -10, 0);
    scene.add(player2);
}

// 键盘控制
function handleKeyPress(event) {
    const speed = 0.8;
    switch(event.code) {
        case 'ArrowLeft':
            if (player1.position.x > -10) player1.position.x -= speed;
            break;
        case 'ArrowRight':
            if (player1.position.x < 10) player1.position.x += speed;
            break;
        case 'Space':
            shoot(player1, bullets1, 1);
            break;
        case 'KeyA':
            if (player2.position.x > -10) player2.position.x -= speed;
            break;
        case 'KeyD':
            if (player2.position.x < 10) player2.position.x += speed;
            break;
        case 'KeyW':
            shoot(player2, bullets2, 2);
            break;
    }
}

// 射击功能
function shoot(player, bulletArray, playerNum) {
    const bulletGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const bulletMaterial = new THREE.MeshPhongMaterial({color: 0xffff00});
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(player.position);
    bullet.position.y += 1;
    scene.add(bullet);
    bulletArray.push(bullet);
}

// 动画循环
// 添加键盘状态跟踪
const keyState = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    KeyA: false,
    KeyD: false,
    KeyW: false
};

// 射击冷却时间
let player1ShootCooldown = 0;
let player2ShootCooldown = 0;

// 修改初始化函数中的键盘事件监听
function init() {
    // 设置渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 设置相机位置
    camera.position.z = 20;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // 创建玩家
    createPlayers();

    // 添加键盘控制
    document.addEventListener('keydown', (e) => {
        keyState[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keyState[e.code] = false;
    });

    animate();
}

// 更新动画循环
function animate() {
    requestAnimationFrame(animate);
    
    handlePlayerMovement();
    handleShooting();
    updateBullets();
    updateEnemies();
    checkCollisions();
    checkPlayerCollisions();  // 添加这行
    renderer.render(scene, camera);
}

// 添加新的碰撞检测函数
function checkPlayerCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // 检查与玩家1的碰撞
        if (isColliding(enemy, player1)) {
            handlePlayerCollision(1);
            scene.remove(enemy);
            enemies.splice(i, 1);
            continue;
        }
        
        // 检查与玩家2的碰撞
        if (isColliding(enemy, player2)) {
            handlePlayerCollision(2);
            scene.remove(enemy);
            enemies.splice(i, 1);
            continue;
        }
    }
}

// 添加玩家碰撞处理函数
function handlePlayerCollision(playerNum) {
    if (playerNum === 1) {
        player1Health--;
        document.getElementById('health1').textContent = `生命: ${player1Health}`;
        // 受伤闪烁效果
        player1.material.color.set(0xff0000);
        setTimeout(() => {
            player1.material.color.set(0x0000ff);
        }, 200);
        
        if (player1Health <= 0) {
            handlePlayerDeath(1);
        }
    } else {
        player2Health--;
        document.getElementById('health2').textContent = `生命: ${player2Health}`;
        // 受伤闪烁效果
        player2.material.color.set(0xff0000);
        setTimeout(() => {
            player2.material.color.set(0x00ff00);
        }, 200);
        
        if (player2Health <= 0) {
            handlePlayerDeath(2);
        }
    }
}

// 修改玩家死亡处理函数
function handlePlayerDeath(playerNum) {
    if (playerNum === 1) {
        scene.remove(player1);  // 从场景中移除飞机
        setTimeout(() => {
            alert("玩家1坠毁！游戏结束！");
            resetGame();
        }, 100);
    } else {
        scene.remove(player2);  // 从场景中移除飞机
        setTimeout(() => {
            alert("玩家2坠毁！游戏结束！");
            resetGame();
        }, 100);
    }
}

// 修改游戏重置函数
function resetGame() {
    // 清除所有敌人和子弹
    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0;
    
    bullets1.forEach(bullet => scene.remove(bullet));
    bullets1.length = 0;
    
    bullets2.forEach(bullet => scene.remove(bullet));
    bullets2.length = 0;
    
    // 重置玩家状态
    player1Health = 3;
    player2Health = 3;
    player1.visible = true;
    player2.visible = true;
    player1.position.set(-5, -10, 0);
    player2.position.set(5, -10, 0);
    
    // 更新显示
    document.getElementById('health1').textContent = `生命: ${player1Health}`;
    document.getElementById('health2').textContent = `生命: ${player2Health}`;
    score1 = 0;
    score2 = 0;
    document.getElementById('score1').textContent = `玩家1得分: ${score1}`;
    document.getElementById('score2').textContent = `玩家2得分: ${score2}`;
}

// 添加平滑移动处理
function handlePlayerMovement() {
    const speed = 0.8;  // 降低速度使移动更平滑
    
    // 玩家1移动
    if (keyState.ArrowLeft && player1.position.x > -10) {
        player1.position.x -= speed;
    }
    if (keyState.ArrowRight && player1.position.x < 10) {
        player1.position.x += speed;
    }
    
    // 玩家2移动
    if (keyState.KeyA && player2.position.x > -10) {
        player2.position.x -= speed;
    }
    if (keyState.KeyD && player2.position.x < 10) {
        player2.position.x += speed;
    }
}

// 添加平滑射击处理
function handleShooting() {
    // 更新冷却时间
    if (player1ShootCooldown > 0) player1ShootCooldown--;
    if (player2ShootCooldown > 0) player2ShootCooldown--;
    
    // 玩家1射击
    if (keyState.Space && player1ShootCooldown === 0) {
        shoot(player1, bullets1, 1);
        player1ShootCooldown = 5;  // 降低冷却时间，使射击更连贯
    }
    
    // 玩家2射击
    if (keyState.KeyW && player2ShootCooldown === 0) {
        shoot(player2, bullets2, 2);
        player2ShootCooldown = 5;  // 降低冷却时间，使射击更连贯
    }
}

// 修改子弹更新函数
function updateBullets() {
    const bulletSpeed = 0.8;  // 增加子弹速度
    
    const updateBulletArray = (bullets) => {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].position.y += bulletSpeed;
            if (bullets[i].position.y > 15) {
                scene.remove(bullets[i]);
                bullets.splice(i, 1);
            }
        }
    };

    updateBulletArray(bullets1);
    updateBulletArray(bullets2);
}

// 更新敌人位置
function updateEnemies() {
    if (Math.random() < 0.02) {
        createEnemy();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].position.y -= 0.1;
        if (enemies[i].position.y < -15) {
            scene.remove(enemies[i]);
            enemies.splice(i, 1);
        }
    }
}

// 创建敌人
function createEnemy() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 0xff0000});
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(
        Math.random() * 20 - 10,
        15,
        0
    );
    scene.add(enemy);
    enemies.push(enemy);
}

// 碰撞检测
function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets1.length - 1; j >= 0; j--) {
            if (isColliding(enemies[i], bullets1[j])) {
                updateScore(10, 1);
                scene.remove(enemies[i]);
                scene.remove(bullets1[j]);
                enemies.splice(i, 1);
                bullets1.splice(j, 1);
                break;
            }
        }
    }
}

// 碰撞判定
function isColliding(obj1, obj2) {
    const distance = obj1.position.distanceTo(obj2.position);
    return distance < 1;
}

// 更新分数
function updateScore(points, playerNum) {
    if (playerNum === 1) {
        score1 += points;
        document.getElementById('score1').textContent = `玩家1得分: ${score1}`;
    } else {
        score2 += points;
        document.getElementById('score2').textContent = `玩家2得分: ${score2}`;
    }
}

// 启动游戏
window.addEventListener('load', init);