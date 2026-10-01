
import { Drawer } from './drawer.js';
import { TowerTypes, EnemyTypes } from './entity_definitions.js';
import { TowerDefenceLevelDefinitions } from './td_level_definitions.js';

export class TowerDefence {
    canvas;
    context;
    drawer;
    enemyTypes;
    tdLevelDefinitions;
    currentLevelIndex;
    currentLevel;
    currentWaveIndex;
    currentWave;
    currentWaveTime;
    currentWaveEnemies;
    towerTypes;
    towers;
    towerPlaceholder;
    selectedTower;
    projectiles;
    explosions;
    msPerFrame = 50;
    money = 1000;
    moneyDisplay;
    towerInfoDisplay;

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = 500;
        this.canvas.height = 300;
        this.context = this.canvas.getContext('2d');
        this.drawer = new Drawer(this.context);

        this.init();

        // Start immediately for now, during development,
        // then uncomment the button binding instead
//        document.querySelector('#playButton').addEventListener('click', () => { this.start(); })
        this.start();
    }

    init() {
        this.enemyTypes = new EnemyTypes();
        this.tdLevelDefinitions = new TowerDefenceLevelDefinitions();
        this.towerTypes = new TowerTypes().towerTypes;
        this.towers = [];
        this.projectiles = [];
        this.explosions = [];
        this.initTestTowers(); // TODO: Remove when user can click to add towers

        this.canvas.addEventListener('click', (event) => {
            this.onCanvasClick(event);
        });

        document.addEventListener('keydown', (event) => {
            this.onKeydown(event);
        });

        this.moneyDisplay = document.getElementById('moneyDisplay');
        this.updateMoneyDisplay();
        this.updateTowerCostDisplay();

        this.towerInfoDisplay = document.getElementById('towerInfo');
    }

    initTestTowers() {
        this.towers.push(new InstaHurtTower(40, 40, 'G'));
        this.towers.push(new ProjectileTower(70, 40, 'I'));
        this.towers.push(new InstaHurtTower(100, 40, 'S'));
        this.towers.push(new BeamTower(130, 40, 'L'));
        this.towers.push(new ProjectileTower(160, 40, 'E'));
    }

    start() {
        this.startLevel(0);
        this.tick();
    }

    startLevel(index) {
        this.currentLevelIndex = index;
        this.currentLevel = this.tdLevelDefinitions.getLevel(index);

        this.currentWaveIndex = 0;
        this.currentWave = this.currentLevel.waves[0];
        this.currentWaveTime = 0.0;
        this.currentWaveEnemies = [];
        this.currentWaveEnemies =
            this.currentWave.enemies.map((enemy) =>
                new Enemy(enemy.typeId, enemy.delay));
    }

    tick() {
        const deltaT = this.msPerFrame / 1000;
        this.update(deltaT);
        this.draw();
        setTimeout(() => { this.tick(); }, this.msPerFrame);
    }

    update(deltaT) {
        this.currentWaveTime += deltaT;
        this.moveEnemies(deltaT);
        this.updateTowers(deltaT);
        this.updateProjectiles(deltaT);
        this.updateExplosions(deltaT);
        this.updateMoneyDisplay();
    }

    moveEnemies(deltaT) {
        const pathSegments = this.currentLevel.enemyPath.segments;
        const enemies = this.currentWaveEnemies;
        for(let enemy of enemies) {
            enemy.activateOnTime(this.currentWaveTime, pathSegments);
            if(enemy.isActive) {
                enemy.updatePosition(
                    deltaT,
                    pathSegments,
                    () => { this.onEnemyReachGoal(enemy); }
                );
            }
        }
    }

    onEnemyReachGoal(enemy) {
        enemy.hasReachedGoal = true;
    }

    onEnemyHit(enemy, projectile, enemies) {
        if(projectile.isIce()) {
            enemy.slow(
                projectile.getSlowDuration(),
                projectile.getSlowFactor()
            );
            return;
        }

        if(projectile.isExplosive()) {
            projectile.explode(enemies);
            this.explosions.push(new Explosion(projectile));
            return;
        }

        enemy.hurt(projectile.getDamage());
    }

    updateTowers(deltaT) {
        const enemies = this.currentWaveEnemies;

        for(let tower of this.towers) {
            tower.update(deltaT);
            for(let enemy of enemies) {
                if(enemy.isActive && !enemy.hasBeenKilled && !enemy.hasReachedGoal) {
                    this.updateTowerAttack(tower, enemy, deltaT);
                }
            }
        }
    }

    updateTowerAttack(tower, enemy, deltaT) {
        if(tower.canReach(enemy) && tower.canAttack()) {
            switch(tower.typeId) {
                case 'G': // Gun
                    enemy.hurt(tower.damage);
                    tower.startAttackAnimation(enemy);
                    break;
                case 'I': // Ice
                    this.projectiles.push(tower.spawnProjectile(enemy));
                    break;
                case 'S': // Sniper
                    enemy.hurt(tower.damage);
                    tower.startAttackAnimation(enemy);
                    break;
                case 'L': // Laser
                    tower.startBeam(enemy);
                    break;
                case 'E': // Explosive
                    this.projectiles.push(tower.spawnProjectile(enemy));
                    break;
            }

            tower.resetCooldown();
        }
    }

    updateProjectiles(deltaT) {
        const enemies = this.currentWaveEnemies;

        for(let projectile of this.projectiles) {
            projectile.update(deltaT);

            for(let enemy of enemies) {
                if(projectile.isOnEnemy(enemy)) {
                    this.onEnemyHit(enemy, projectile, enemies);
                }
            }
        }
    }

    updateExplosions(deltaT) {
        for(let explosion of this.explosions) {
            explosion.update(deltaT);
        }
    }

    updateMoneyDisplay() {
        this.moneyDisplay.innerText = '$' + this.money.toFixed(0);
    }

    updateTowerCostDisplay() {
        const typeG = this.towerTypes.find((towerType) => towerType.id === 'G');
        const typeI = this.towerTypes.find((towerType) => towerType.id === 'I');
        const typeS = this.towerTypes.find((towerType) => towerType.id === 'S');
        const typeL = this.towerTypes.find((towerType) => towerType.id === 'L');
        const typeE = this.towerTypes.find((towerType) => towerType.id === 'E');
        document.getElementById("priceG").innerText = "$" + typeG.cost;
        document.getElementById("priceI").innerText = "$" + typeI.cost;
        document.getElementById("priceS").innerText = "$" + typeS.cost;
        document.getElementById("priceL").innerText = "$" + typeL.cost;
        document.getElementById("priceE").innerText = "$" + typeE.cost;
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawer.rect(1, 1, this.canvas.width-1, this.canvas.height-1, '#fff');

        // Background
        this.drawer.enemyPathAndGoal(this.currentLevel.enemyPath);

        // Lasers
        for(let tower of this.towers) {
            if(tower.typeId === 'L') {
                this.drawer.laser(tower);
            }
        }

        // Projectiles
        for(let projectile of this.projectiles) {
            this.drawer.projectile(projectile);
        }

        // Explosions
        for(let explosion of this.explosions) {
            if(explosion.t > 0.0) {
                this.drawer.circle(explosion.x, explosion.y, explosion.r, '#f00');
            }
        }

        // Towers
        for(let tower of this.towers) {
            if(tower.isAttackAnimationRunning()) {
                const x1 = tower.x;
                const y1 = tower.y;
                const x2 = tower.attackAnimationEnemy.x;
                const y2 = tower.attackAnimationEnemy.y;
                this.drawer.line(x1, y1, x2, y2, "#ddd");
            }

            const w = 20;
            const h = 20;
            this.drawer.tower(tower.x, tower.y, w, h, tower.typeId);
        }

        // Enemies
        this.drawer.enemies(this.currentWaveEnemies);

        // Enemy health bars
        this.drawer.enemyHealthBars(this.currentWaveEnemies);

        // Tower placeholder (when adding a new tower)
        if(this.towerPlaceholder) {
            this.drawer.towerPlaceholder(this.towerPlaceholder);
        }
    }

    onCanvasClick(e) {
        this.towerInfoDisplay.innerText = 'none';
        this.selectedTower = undefined;
        for(let tower of this.towers) {
            if(this.towerWasClicked(tower, e)) {
                const info = tower.typeId;
                this.towerInfoDisplay.innerText = info;
                this.selectedTower = tower;
            }
        }

        if(this.selectedTower != undefined) {
            this.towerPlaceholder = undefined;
            return;
        }

        this.towerPlaceholder = {
            x: e.offsetX,
            y: e.offsetY,
        }

        this.towerPlaceholder.isColliding =
            this.towerPlaceHolderIsColliding();
    }

    towerWasClicked(tower, e) {
        const x = e.offsetX;
        const y = e.offsetY;
        const w = 10;
        const h = 10;
        if(x > tower.x - w && x < tower.x + w) {
            if(y > tower.y - h && y < tower.y + h) {
                return true;
            }
        }
        return false;
    }

    towerPlaceHolderIsColliding() {
        let isColliding = false;
        const x = this.towerPlaceholder.x;
        const y = this.towerPlaceholder.y;
        const w = 20;
        const h = 20;
        for(let tower of this.towers) {
            if(x > tower.x - w && x < tower.x + w) {
                if(y > tower.y - h && y < tower.y + h) {
                    isColliding = true;
                }
            }
        }
        return isColliding;
    }

    onKeydown(e) {
        if(this.towerPlaceholder) {
            if(e.key === 'Escape') {
                this.towerPlaceholder = undefined;
                return;
            }

            if(this.towerPlaceholder.isColliding) {
                return;
            }

            const upperKey = e.key.toUpperCase();

            if(upperKey === 'G') {
                this.buyTower(upperKey);
            }

            if(upperKey === 'I') {
                this.buyTower(upperKey);
            }

            if(upperKey === 'S') {
                this.buyTower(upperKey);
            }

            if(upperKey === 'L') {
                this.buyTower(upperKey);
            }

            if(upperKey === 'E') {
                this.buyTower(upperKey);
            }
        }
    }

    buyTower(typeId) {
        const towerType = this.towerTypes.find((towerType) => towerType.id === typeId);
        if(this.money >= towerType.cost) {
            this.money -= towerType.cost;
            this.placeTower(towerType);
        }
    }

    placeTower(towerType) {
        const x = this.towerPlaceholder.x;
        const y = this.towerPlaceholder.y;

        if(towerType.id === 'G') {
            this.towers.push(new InstaHurtTower(x, y, 'G'));
        }
        if(towerType.id === 'I') {
            this.towers.push(new ProjectileTower(x, y, 'I'));
        }
        if(towerType.id === 'S') {
            this.towers.push(new InstaHurtTower(x, y, 'S'));
        }
        if(towerType.id === 'L') {
            this.towers.push(new BeamTower(x, y, 'L'));
        }
        if(towerType.id === 'E') {
            this.towers.push(new ProjectileTower(x, y, 'E'));
        }
    }
}

export class Enemy {
    enemyTypes;

    typeId;
    activationDelay;
    enemyType;
    hp;
    maxHp;
    speed;
    slowDuration;
    slowFactor;

    pathSegments;
    currentPathSegmentIndex;
    currentPathSegment;
    x;
    y;

    isActive;
    hasReachedGoal;
    hasBeenKilled;

    constructor(typeId, activationDelay) {
        this.typeId = typeId;
        this.activationDelay = activationDelay;
        this.enemyTypes = new EnemyTypes();
        this.enemyType = this.enemyTypes.getById(this.typeId);
        this.hp = this.maxHp = this.enemyType.maxHp;
        this.speed = this.enemyType.speed;
        this.isActive = false;
        this.hasReachedGoal = false;
        this.hasBeenKilled = false;
    }

    activateOnTime(time, pathSegments) {
        if(!this.isActive && time > this.activationDelay) {
            this.isActive = true;
            this.pathSegments = pathSegments;
            this.currentPathSegmentIndex = 0;
            this.setPathSegment();
        }
    }

    setPathSegment() {
        this.currentPathSegment = this.pathSegments[this.currentPathSegmentIndex];
        this.x = this.currentPathSegment.x1;
        this.y = this.currentPathSegment.y1;
    }

    nextPathSegment() {
        this.currentPathSegmentIndex ++;
        this.setPathSegment();
    }

    updatePosition(deltaT, pathSegments, onReachGoal) {
        let actualDeltaT = deltaT;
        if(this.slowDuration > 0.0) {
            this.slowDuration -= deltaT;
            actualDeltaT *= this.slowFactor;
        }

        const lerpResult = this.lerp(this, actualDeltaT);
        this.x = lerpResult.x;
        this.y = lerpResult.y;

        if(lerpResult.isSegmentEnd) {
            if(pathSegments[this.currentPathSegmentIndex + 1]) {
                this.nextPathSegment();
            } else {
                onReachGoal();
            }
        }
    }

    // TODO: Can be moved to a static tool class
    lerp(enemy, deltaT) {
        const segment = enemy.currentPathSegment;

        const movementPerFrame = enemy.speed * deltaT;

        const segmentVectorX = segment.x2 - segment.x1;
        const segmentVectorY = segment.y2 - segment.y1;
        const segmentLength = Math.sqrt(segmentVectorX * segmentVectorX + segmentVectorY * segmentVectorY);
        const segmentLerpStep = movementPerFrame / segmentLength;

        const diffX = enemy.x - segment.x1;
        const diffY = enemy.y - segment.y1;
        const enemyDistanceAlongSegment = Math.sqrt(diffX * diffX + diffY * diffY);
        const enemyLerp = enemyDistanceAlongSegment / segmentLength;
        const newLerp = enemyLerp + segmentLerpStep;

        const newX = segment.x1 + segmentVectorX * newLerp;
        const newY = segment.y1 + segmentVectorY * newLerp;

        const isSegmentEnd = newLerp > 1.0;

        return { x: newX, y: newY, isSegmentEnd: isSegmentEnd };
    }

    hurt(damage) {
        this.hp -= damage;
        if(this.hp <= 0) {
            this.hasBeenKilled = true;
        }
    }

    slow(duration, factor) {
        this.slowDuration = duration;
        this.slowFactor = factor;
    }
}

export class Tower {
    towerTypes;

    typeId;
    cost;
    x;
    y;
    towerType;
    range;
    damage;
    projectilePxPerSecond;
    cooldownRemaining;
    attackAnimationTime;
    attackAnimationEnemy;

    constructor(x, y, towerTypeId) {
        this.towerTypes = new TowerTypes();
        this.x = x;
        this.y = y;
        this.typeId = towerTypeId;
        this.towerType = this.towerTypes.getById(this.typeId);
        this.range = this.towerType.range;
        this.damage = this.towerType.damage;
        this.projectilePxPerSecond = 250.0;
        this.cooldownRemaining = 0.0;
    }

    canReach(enemy) {
        const vectorX = this.x - enemy.x;
        const vectorY = this.y - enemy.y;
        const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        return distance < this.range;
    }

    canAttack() {
        return this.cooldownRemaining === 0.0;
    }

    startAttackAnimation(enemy) {
        if(this.typeId === 'G') {
            this.attackAnimationTime = 0.02;
            this.attackAnimationEnemy = enemy;
        }
        if(this.typeId === 'S') {
            this.attackAnimationTime = 0.03;
            this.attackAnimationEnemy = enemy;
        }
    }

    isAttackAnimationRunning() {
        return this.attackAnimationTime > 0.0;
    }

    update(deltaT) {
        if(this.cooldownRemaining > 0.0) {
            this.cooldownRemaining -= deltaT;
        }
        if(this.cooldownRemaining < 0.0) {
            this.cooldownRemaining = 0.0;
        }
 
        if(this.attackAnimationTime > 0.0) {
            this.attackAnimationTime -= deltaT;
        }
        if(this.attackAnimationTime < 0.0) {
            this.attackAnimationTime = 0.0;
        }
    }

    resetCooldown() {
        this.cooldownRemaining = this.towerType.cooldown;
    }
}

export class InstaHurtTower extends Tower {
    constructor(x, y, towerTypeId) {
        super(x, y, towerTypeId);
    }
}

export class ProjectileTower extends Tower {
    constructor(x, y, towerTypeId) {
        super(x, y, towerTypeId);
    }

    spawnProjectile(enemy) {
        return new Projectile(this, enemy, this.projectilePxPerSecond);
    }
}

export class BeamTower extends Tower {
    isBeamOn;
    currentEnemy;

    constructor(x, y, towerTypeId) {
        super(x, y, towerTypeId);
        this.isBeamOn = false;
        this.currentEnemy = null;
    }

    startBeam(enemy) {
        this.currentEnemy = enemy;
        this.isBeamOn = true;
    }

    update(deltaT) {
        super.update(deltaT);
        if(!this.currentEnemy) return;
        if(!super.canReach(this.currentEnemy) || this.currentEnemy.hasBeenKilled) {
            this.isBeamOn = false;
            this.currentEnemy = null;
            return;
        }
        this.currentEnemy.hurt(deltaT * this.damage);
    }
}

export class Projectile {
    x;
    y;
    pxPerSecond;
    hitDistance;
    isActive;
    tower;
    normVectorX;
    normVectorY;

    constructor(tower, enemy, pxPerSecond) {
        this.x = tower.x;
        this.y = tower.y;
        this.tower = tower;
        this.pxPerSecond = pxPerSecond;
        this.hitDistance = this.isExplosive() ? 12.0 : 6.0;
        this.isActive = true;
        this.initNormalVector(enemy);
    }

    initNormalVector(enemy) {
        const vectorX = enemy.x - this.x;
        const vectorY = enemy.y - this.y;
        const length = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        if(length === 0.0) {
            this.normVectorX = 0.0;
            this.normVectorY = 0.0;
            return;
        }
        this.normVectorX = vectorX / length;
        this.normVectorY = vectorY / length;
    }

    update(deltaT) {
        if(this.isActive) {
            this.x += this.normVectorX * this.pxPerSecond * deltaT;
            this.y += this.normVectorY * this.pxPerSecond * deltaT;
        }
    }

    getDistance(enemy) {
        const vectorX = enemy.x - this.x;
        const vectorY = enemy.y - this.y;
        const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        return distance;
    }

    isOnEnemy(enemy) {
        // TODO: This needs better detection,
        // either do subdivision of updates (between frames)
        // or perform line-circle intersection (prev to current pos)
        if(!this.isActive) return false;
        const distance = this.getDistance(enemy);
        const isOnEnemy = distance < this.hitDistance;
        const hasMissedEnemy = distance > 2000.0;
        this.isActive = !isOnEnemy && !hasMissedEnemy;
        return isOnEnemy;
    }

    getDamage() {
        return this.tower.damage;
    }

    // Slowing (TODO: Create subclass)

    isIce() {
        return this.tower.typeId === 'I';
    }

    getSlowDuration() {
        return this.tower.towerType.slowDuration;
    }

    getSlowFactor() {
        return this.tower.towerType.slowFactor;
    }

    // Explosive (TODO: Create subclass)

    isExplosive() {
        return this.tower.typeId === 'E';
    }

    explode(enemies) {
        for(let enemy of enemies) {
            const d = this.getDistance(enemy);
            const r = this.getExplosionRadius();
            if(d < r) {
                enemy.hurt(this.getDamage());
            }
        }
    }

    getExplosionRadius() {
        return this.tower.towerType.radius;
    }
}

export class Explosion {
    x;
    y;
    r;
    t;

    constructor(projectile) {
        this.x = projectile.x;
        this.y = projectile.y;
        this.r = projectile.getExplosionRadius();
        this.t = 0.2;
    }

    update(deltaT) {
        if(this.t > 0.0) {
            this.t -= deltaT;
        } else {
            this.t = 0.0;
        }
    }
}

document.addEventListener('DOMContentLoaded',
    new TowerDefence('gameCanvas')
);
