
import { getCenter } from './helpers.js';
import { getEvent } from './gameEvents.js';

const FIXED_TPS = 1;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  preload() {
    this.load.image('kHero', 'assets/heroes.png');
  }
  init(get) {
    this.event = get.event;
  }
  create() {
    this.gameWidth = this.sys.game.config.width;
    this.gameHeight = this.sys.game.config.height;

    this.player = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'kHero').setScale(0.5);
    this.player.setDepth(10);


    this.cursors = this.input.keyboard.createCursorKeys();

    this.enemies = this.add.group();

    this.projectiles = this.add.group();
    this.lastShot = 0;
    this.shotDelay = 5000;


    this.event.spawn.forEach(spawn => {
      this.spawnEnemy(spawn);
    });


    this.time.addEvent({
      delay: 1000,
      callback:  this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

  }

  spawnEnemy (unitName = null){

    const side = Phaser.Math.Between(0, 3);
    let x, y;

    switch(side) {
      case 0:
        x = Phaser.Math.Between(0, this.gameWidth);
        y = -20;
        break;
      case 1:
        x = Phaser.Math.Between(0, this.gameWidth);
        y = this.gameHeight + 20;
        break;
      case 2:
        x = -20;
        y = Phaser.Math.Between(0, this.gameHeight);
        break;
      case 3: // справа
        x = this.gameWidth + 20;
        y = Phaser.Math.Between(0, this.gameHeight);
        break;
    }

    let enemy;
    if(unitName != null) {
      enemy = this.add.circle(x, y, 10, 0xffa500, 1)
    }else {
      enemy = this.add.circle(x, y, 10, 0xff5555, 1);
    }


    this.enemies.add(enemy);
  }

  fireProjectile() {
    if (this.enemies.children.size === 0) return;

    let closestEnemy = null;
    let minDist = Infinity;

    this.enemies.children.entries.forEach(enemy => {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if(dist < minDist) {
        minDist = dist;
        closestEnemy = enemy;
      }
    });

    if(!closestEnemy) return;

    const projectile = this.add.circle(this.player.x, this.player.y, 4, 0xffffff, 1);
    this.projectiles.add(projectile);

    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, closestEnemy.x, closestEnemy.y);
    projectile.speed = 300;
    projectile.dx = Math.cos(angle);
    projectile.dy = Math.sin(angle);
  }

  update() {
    const now = this.time.now;

    const speed = 200;
    const dx = (this.cursors.right.isDown ? 1 : 0) - (this.cursors.left.isDown ? 1 : 0);
    const dy = (this.cursors.down.isDown ? 1 : 0) - (this.cursors.up.isDown ? 1 : 0);

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      console.log(len);
      this.player.x += (dx / len) * speed * this.game.loop.delta / 1000;
      this.player.y += (dy / len) * speed * this.game.loop.delta / 1000;

    // add polygon
    }

    this.enemies.children.entries.forEach(enemy => {
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      enemy.x += Math.cos(angle) * 50 * this.game.loop.delta / 1000;
      enemy.y += Math.sin(angle) * 50 * this.game.loop.delta / 1000;
    })

    //fire
    if(now - this.lastShot > this.shotDelay){
      this.fireProjectile();
      this.lastShot = now;
    }

    this.projectiles.children.entries.forEach(proj => {
      const delta = this.game.loop.delta / 1000;
      proj.x += proj.dx * proj.speed * delta;
      proj.y += proj.dy * proj.speed * delta;

      if (
        proj.x < -50 ||
        proj.x > this.gameWidth + 50 ||
        proj.y < -50 ||
        proj.y > this.gameHeight + 50
      ) {
        proj.destroy();
        return;
      }

      let collision = null;

      // переделать это на метод интерсект!
      for (let i = 0; i < this.enemies.children.entries.length; i++) {
        const enemy = this.enemies.children.entries[i];
        const dx = proj.x - enemy.x;
        const dy = proj.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= 14) { // 4 + 10
          enemy.destroy();
          proj.destroy();
          break; // один снаряд — один враг
  }
}

    });

  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload()
  {
    this.load.image('startBtn', 'assets/start.png');
  }

  create()
  {
    const center = getCenter(this);

    //this.texture.get('startBtn').setFilter(Phaser.Texture.FilterMode.NEARES);

    const startButton = this.add.image(center.x,center.y, 'startBtn').setScale(5)
      .setInteractive({useHandCursor: true}).on('pointerdown', () => {
        this.scene.start('SpeakWithHelper', {
          event: 'startGame'
        });
      });
  }
}

class SpeakWithHelper extends Phaser.Scene {
  constructor(event) {
    super('SpeakWithHelper');
  }
  init(get) {
    this.event = get.event;
  }
  preload()
  {
    // тут нужно кнопку продолжить!
    this.load.image('startBtn', 'assets/start.png');
  }
  create()
  {
    const event = getEvent('startGame');
    this.add.text(100, 100, event.text, {
            fontSize: '24px',
            fill: '#ffffff'
    });

    const center = getCenter(this);
    console.log(event.spawn);
    this.add.image(center.x, center.y, 'startBtn').setScale(5)
      .setInteractive({useHandCursor: true}).on('pointerdown', () => {
      this.scene.start(event.nextScene, {
        event: event
      });
    });
  }
}

const config = {
  width: window.innerWidth,
  height: window.innerHeight,
  type: Phaser.AUTO,
  scene: [MenuScene,GameScene,SpeakWithHelper],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade'
  }
};


const game = new Phaser.Game(config);
