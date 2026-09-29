
export class TowerTypes {
    towerTypes;

    constructor() {
        this.towerTypes = [];

        this.towerTypes.push({
            id: 'G',
            cost: 100,
            range: 100,
            damage: 5,
            cooldown: 0.5,
        });

        this.towerTypes.push({
            id: 'I',
            cost: 200,
            range: 100,
            damage: 0,
            cooldown: 3.0,
            slowDuration: 1.5,
            slowFactor: 0.5,
        });

        this.towerTypes.push({
            id: 'S',
            cost: 400,
            range: 200,
            damage: 35,
            cooldown: 3.0,
        });

        this.towerTypes.push({
            id: 'L',
            cost: 150,
            range: 100,
            damage: 10, // Per second
            cooldown: 0.3,
        });

        this.towerTypes.push({
            id: 'E',
            cost: 250,
            range: 100,
            damage: 50,
            cooldown: 5.0,
        });
    }

    getById(typeId) {
        return this.towerTypes.find((towerType) => towerType.id == typeId);
    }
}


export class EnemyTypes {
    enemyTypes;

    constructor() {
        this.enemyTypes = [];
        this.enemyTypes.push({
            id: 1,
            name: 'Enemy 1',
            speed: 20.0,
            maxHp: 100,
            hp: 100,
        });
    }

    getById(typeId) {
        return this.enemyTypes.find((enemyType) => enemyType.id === typeId);
    }
}
