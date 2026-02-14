
import { getCenter } from './helpers.js';
import { getEvent } from './gameEvents.js';

const FIXED_TPS = 1;

let cryptoData = null;

async function loadCryptoStatsData() {
  const response = await fetch('/getCryptoStats');
  const result = await response.json();
  cryptoData = result;
}



class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  preload() {
    this.load.image('kasHeroImage', 'assets/sprKasHero.png');

    //this.load.image('kHero', 'assets/heroes.png');
  }
  init(get) {
    this.event = get.event;
  }
  create() {
    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;

    const img = this.textures.get('kasHeroImage').getSourceImage();
    const frameWidth = Math.floor(img.width / 3);
    const frameHeight = img.height;

    this.textures.addSpriteSheet('kasHero', img, { frameWidth, frameHeight });

    this.anims.create({
      key: 'kasHeroRun',
      frames: this.anims.generateFrameNumbers('kasHero', {start: 0, end: 2}),
      frameRate: 10,
      repeat: -1,
    });

    this.player = this.physics.add.sprite(200, 200, 'kasHero', 0);
    this.player.setOrigin(0.5, 1);
    this.player.setScale(0.1);
    //this.player = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'kHero').setScale(0.5);
    this.player.hp = cryptoData['KAS']['hPoint'];
    this.player.setDepth(10);

    // arrow
    this.cursors = this.input.keyboard.createCursorKeys();
    //wasd
    // WASD
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });


    this.enemies = this.add.group();

    this.projectiles = this.add.group();
    this.lastShot = 0;
    this.shotDelay = 5000;

    this.hpText = this.add.text(this.gameWidth - 20, 20, `HP: ${this.player.hp}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0);
    /*this.event.spawn.forEach((spawn, index) => {
      console.log(spawn, index);
      this.spawnEnemy(spawn);
    });*/
    for (const monsterName in this.event.spawn){
      this.spawnEnemy(monsterName, this.event.spawn[monsterName])
    }

    this.time.addEvent({
      delay: 1000,
      callback:  this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

  }

  spawnEnemy (unitName = null, countMonster = 1){
    for (let i = 0; i < countMonster; i++) {
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
      let hp;
      let dmg;

      if(unitName != null) {
        if(unitName == 'Bitcoin')
        {
          hp = cryptoData['BTC']['hPoint'];
          dmg = cryptoData['BTC']['damage'];
          enemy = this.add.circle(x, y, 10, 0xffa500, 1);
          enemy.hp = hp;
          enemy.dmg = dmg;
        }
        else {
          hp = 1;
          dmg = 1;
          enemy = this.add.circle(x, y, 10, 0xff5555, 1);
          enemy.hp = hp;
          enemy.dmg = dmg;
        }
      }else {
        hp = 1;
        dmg = 1;
        enemy = this.add.circle(x, y, 10, 0xff5555, 1);
        enemy.hp = hp;
        enemy.dmg = dmg;
      }
      this.enemies.add(enemy);
    }

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
    projectile.dmg = cryptoData['KAS']['damage'];
    projectile.dx = Math.cos(angle);
    projectile.dy = Math.sin(angle);
  }

  update() {




    const now = this.time.now;

    const speed = 200;

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const up = this.cursors.up.isDown || this.keys.up.isDown;
    const down = this.cursors.down.isDown || this.keys.down.isDown;


    const dx = (right ? 1 : 0) - (left ? 1 : 0);
    const dy = (down ? 1 : 0) - (up ? 1 : 0);
    const dt = this.game.loop.delta / 1000;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);

      this.player.x += (dx / len) * speed * dt;
      this.player.y += (dy / len) * speed * dt;

      if (dx < 0) this.player.setFlipX(true);
      if (dx > 0) this.player.setFlipX(false);

      this.player.play('kasHeroRun', true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(0);
    }

    this.hpText.setText(`HP: ${this.player.hp}`);

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
          if(enemy.hp - proj.dmg <= 0)
          {
            enemy.destroy();
            proj.destroy();
          }
          enemy.hp = enemy.hp - proj.dmg;
          proj.destroy();
          console.log(enemy.hp);
          break; // один снаряд — один враг
        }
      }
    });
    //checkAttackbyEnemies
    if(this.checkPlayerState()) {
      return;
    };
  }

  checkPlayerState() {
    for (let i = 0; i < this.enemies.children.entries.length; i++) {
      const enemy = this.enemies.children.entries[i];
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 14){
        if(this.player.hp - enemy.dmg <= 0){
          this.scene.stop();

          const event = getEvent('dead');
          this.scene.start(event.nextScene, {
            event: event
          });

          return true;
        }
        else {
          this.player.hp = this.player.hp - enemy.dmg;
        }

      }
    }
  }
}

class DeadScene extends Phaser.Scene {
  constructor() {
    super('DeadScene');
  }

  preload()
  {
    this.load.image('startBtn', 'assets/start.png');
  }

  create()
  {
    const center = getCenter(this);
    const startButton = this.add.image(center.x,center.y, 'startBtn')
      .setInteractive({useHandCursor: true}).on('pointerdown', () => {
        this.scene.start('SpeakWithHelper', {
          event: 'resetGame'
        });
      });
  }

}

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('menu', 'assets/menu.png');
  }

  async create() {
    await loadCryptoStatsData();
    this.defaultInfo = this.buildCryptoInfo(cryptoData);

    this.bg = this.add.image(0, 0, 'menu').setOrigin(0.5, 0.5).setScrollFactor(0);

    // scroll table
    this.infoBox = { x: 0, y: 0, w: 10, h: 10, scrollY: 0, maxScroll: 0 };
    this.infoBg = this.add.rectangle(0, 0, 10, 10, 0x000000, 0.2)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setFillStyle(0x000000, 0.0);

    this.infoText = this.add.text(0, 0, this.defaultInfo, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#a8f0ff',
      wordWrap: { width: 10 }
    }).setScrollFactor(0);


    this.infoMaskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    this.infoMaskGfx.setScrollFactor(0);

    this.infoText.setMask(this.infoMaskGfx.createGeometryMask());

    this.startZone = this.add.rectangle(0, 0, 10, 10, 0x00ff00, 0.0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.startZone.on('pointerdown', () => {
      this.scene.start('SpeakWithHelper', { event: 'startGame' });
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const x = pointer.worldX;
      const y = pointer.worldY;

      const inside =
      x >= this.infoBox.x && x <= this.infoBox.x + this.infoBox.w &&
      y >= this.infoBox.y && y <= this.infoBox.y + this.infoBox.h;

      if (inside) this.scrollInfo(deltaY);
    });

    this.layoutMenu();
    this.scale.on('resize', () => this.layoutMenu());
  }

  buildCryptoInfo(data) {
    if (!data) return 'no data';

    const lines = [];

    for (const [elem, v] of Object.entries(data)) {
      const hp = v?.hPoint ?? 0;
      const dmg = v?.damage ?? 0;
      const mcap = v?.marketCap ?? 0;
      const price = v?.price ?? 0;

      lines.push(
        `${elem}`,
        `MarketCap(hp): `,
        `   ${mcap}(${hp}) HP`,
        `Price(dmg): `,
        `   ${price}(${dmg}) DMG`,
        ''
      );
    }

    return lines.join('\n');
  }

  scrollInfo(deltaY) {
    const step = 28;
    this.infoBox.scrollY = Phaser.Math.Clamp(
      this.infoBox.scrollY + Math.sign(deltaY) * step,
      0,
      this.infoBox.maxScroll
    );
    this.infoText.y = this.infoBox.y - this.infoBox.scrollY;
  }

  resetScroll() {
    this.infoBox.scrollY = 0;
    this.infoText.y = this.infoBox.y;
    this.recalcScrollLimits();
  }

  recalcScrollLimits() {
    const textHeight = this.infoText.height;
    this.infoBox.maxScroll = Math.max(0, textHeight - this.infoBox.h);
    this.infoBox.scrollY = Phaser.Math.Clamp(this.infoBox.scrollY, 0, this.infoBox.maxScroll);
    this.infoText.y = this.infoBox.y - this.infoBox.scrollY;
  }

  layoutMenu() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.bg.setPosition(w / 2, h / 2);

    const scaleX = w / this.bg.width;
    const scaleY = h / this.bg.height;
    const scale = Math.min(scaleX, scaleY);
    this.bg.setScale(scale);

    const left = this.bg.x - this.bg.displayWidth / 2;
    const top  = this.bg.y - this.bg.displayHeight / 2;

    const infoX = 0.14, infoY = 0.45, infoW = 0.28, infoH = 0.22;
    const startX = 0.69, startY = 0.85, startW = 0.385, startH = 0.16;
    //scroll
    this.infoBox.x = left + this.bg.displayWidth * infoX;
    this.infoBox.y = top  + this.bg.displayHeight * infoY;
    this.infoBox.w = this.bg.displayWidth * infoW;
    this.infoBox.h = this.bg.displayHeight * infoH;

    this.infoText.setWordWrapWidth(this.infoBox.w);

    this.infoText.setPosition(this.infoBox.x, this.infoBox.y - this.infoBox.scrollY);

    this.infoMaskGfx.clear();
    this.infoMaskGfx.fillStyle(0xffffff, 1);
    this.infoMaskGfx.fillRect(this.infoBox.x, this.infoBox.y, this.infoBox.w, this.infoBox.h);

    this.recalcScrollLimits();

    this.startZone.setPosition(
      left + this.bg.displayWidth * startX,
      top  + this.bg.displayHeight * startY
    );
    this.startZone.setSize(
      this.bg.displayWidth * startW,
      this.bg.displayHeight * startH
    );

    this.startZone.input.hitArea.setTo(
      -this.startZone.width / 2,
      -this.startZone.height / 2,
      this.startZone.width,
      this.startZone.height
    );
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
    const event = getEvent(this.event);
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
  scene: [MenuScene,GameScene,SpeakWithHelper,DeadScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade'
  }
};


const game = new Phaser.Game(config);
