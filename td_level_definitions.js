
// Important: Keep this as pure JSON, so
// it can be loaded from files later on

export class TowerDefenceLevelDefinitions {
    levels;

    constructor() {
        this.levels = [];

        this.levels.push(
            {
                name: 'Level 1',
                enemyPath: {
                    segments: [
                        { x1: 2, y1: 100, x2: 200, y2: 100 },
                        { x1: 200, y1: 100, x2: 200, y2: 200 },
                        { x1: 200, y1: 200, x2: 400, y2: 200 },
                        { x1: 400, y1: 200, x2: 400, y2: 50 },
                    ]
                },
                waves: [
                    {
                        name: 'Wave 1',
                        enemies: [
                            { delay: 0.0, typeId: 1 },
                            { delay: 3.0, typeId: 1 },
                            { delay: 6.0, typeId: 1 },
                            { delay: 9.0, typeId: 1 },
                            { delay: 12.0, typeId: 1 },
                            { delay: 15.0, typeId: 1 },
                            { delay: 18.0, typeId: 1 },
                            { delay: 21.0, typeId: 1 },
                            { delay: 24.0, typeId: 1 },
                        ]
                    }
                ],
            }
        );
    }

    getLevel(index) {
        return this.levels[index];
    }
}
