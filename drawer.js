
export class Drawer {
    context;

    constructor(context) { this.context = context }

    line(x1, y1, x2, y2, strokeColor) {
        this.context.beginPath();
        this.context.moveTo(x1, y1)
        this.context.lineTo(x2, y2)
        this.context.strokeStyle = strokeColor;
        this.context.stroke();
    }

    rect(x, y, w, h, fillColor, strokeColor) {
        this.context.beginPath();
        this.context.rect(x, y, w, h);
        if(fillColor) {
            this.context.fillStyle = fillColor;
            this.context.fill();
        }
        this.context.strokeStyle = strokeColor ?? 'black';
        this.context.stroke();
    }

    circle(x, y, r, fillColor) {
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI);
        if(fillColor) {
            this.context.fillStyle = fillColor;
            this.context.fill();
        }
        this.context.strokeStyle = 'black';
        this.context.stroke();
    }

    text(x, y, text) {
        this.context.beginPath();
        this.context.fillStyle = '#000';
        this.context.font = "14px arial";
        this.context.fillText(text, x, y);
    }

    healthBar(x, y, hp, maxHp) {
        const w = 20;
        const hpPercent = hp / maxHp;
        const fillWidth = hpPercent * w;
        this.rect(x-w*0.5, y-14, w, 4, '#777');
        this.rect(x-w*0.5, y-14, fillWidth, 4, '#00ff00')
    }

    enemyPathAndGoal(enemyPath) {
        for(var i = 0; i < enemyPath.segments.length; i++) {
            const segment = enemyPath.segments[i];
            this.line(segment.x1, segment.y1, segment.x2, segment.y2, '#aaa');
        }

        const pathEnd = enemyPath.segments[enemyPath.segments.length - 1];
        this.circle(pathEnd.x2, pathEnd.y2, 10, '#853');
    }

    enemies(enemies) {
        for(var i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if(!enemy.hasReachedGoal && !enemy.hasBeenKilled) {
                let color = '#ccc';
                if(enemy.slowDuration > 0.0) color = '#adf';
                this.circle(enemy.x, enemy.y, 7, color);
            }
        }
    }

    enemyHealthBars(enemies) {
        for(var i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if(!enemy.hasReachedGoal && !enemy.hasBeenKilled) {
                this.healthBar(enemy.x, enemy.y, enemy.hp, enemy.maxHp);
            }
        }
    }

    tower(x, y, w, h, type) {
        const y0 = 14;
        switch(type) {
            case 'G':
                this.rectWithLetter(x, y, w, h, '#fde', 'G', 4, y0);
                break;
            case 'I':
                this.rectWithLetter(x, y, w, h, '#cef', 'I', 8, y0);
                break;
            case 'S':
                this.rectWithLetter(x, y, w, h, '#ddd', 'S', 5, y0);
                break;
            case 'L':
                this.rectWithLetter(x, y, w, h, '#cfc', 'L', 5, y0);
                break;
            case 'E':
                this.rectWithLetter(x, y, w, h, '#fda', 'E', 5, y0);
                break;
        }
    }

    towerPlaceholder(towerPlaceholder) {
        const w = 20;
        const h = 20;
        const wh = w * 0.5;
        const hh = h * 0.5;
        this.rect(
            towerPlaceholder.x - wh,
            towerPlaceholder.y - hh,
            w, h,
            '#0001',
            '#0005'
        );
    }

    rectWithLetter(x, y, w, h, color, letter, letterX, letterY) {
        const wh = w * 0.5;
        const hh = h * 0.5;
        this.rect(x - wh, y - hh, w, h, color);
        this.text(x - wh + letterX, y - hh + letterY, letter);
    }

    projectile(projectile) {
        const x = projectile.x;
        const y = projectile.y;
        if(projectile.isActive) {
            this.circle(x, y, 2, '#f00');
        }
    }

    laser(tower) {
        if(!tower.currentEnemy) return;
        const enemy = tower.currentEnemy;
        this.line(tower.x, tower.y, enemy.x, enemy.y, "#f00");
    }
}
