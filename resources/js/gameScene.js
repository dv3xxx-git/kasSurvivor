import { getEvent } from './gameEvents.js';
import { getCryptoData } from './cryptoStats.js';
import { getCenter } from './helpers.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('kasHeroImage', 'assets/sprKasHero.png');
    this.load.image('btc', 'assets/btc.png');
    this.load.image('monster', 'assets/monster.png');
    this.load.image('backGame', 'assets/backGame.png');
  }

  init(get) {
    this.event = get.event;
  }

  create() {
    const cryptoData = getCryptoData();

    //speed


    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;

    // back
    this.bg = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'backGame')
      .setScrollFactor(0)
      .setDepth(-100);
    const scaleX = this.gameWidth / this.bg.width;
    const scaleY = this.gameHeight / this.bg.height;
    const scale = Math.max(scaleX, scaleY);
    this.bg.setScale(scale);

    const img = this.textures.get('kasHeroImage').getSourceImage();
    const frameWidth = Math.floor(img.width / 3);
    const frameHeight = img.height;

    this.textures.addSpriteSheet('kasHero', img, { frameWidth, frameHeight });

    this.anims.create({
      key: 'kasHeroRun',
      frames: this.anims.generateFrameNumbers('kasHero', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1,
    });
    const center = getCenter(this);

    this.player = this.physics.add.sprite(center.x, center.y, 'kasHero', 0);
    this.player.setOrigin(0.5, 1);
    this.player.setScale(0.15);
    this.player.hp = cryptoData['KAS']['hPoint'];
    this.player.setDepth(10);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
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

    // spawn из event
    for (const monsterName in this.event.spawn) {
      this.spawnEnemy(monsterName, this.event.spawn[monsterName]);
    }

    // периодический спавн (ВАЖНО: передаем функцию-обёртку, иначе unitName потеряется)
    this.time.addEvent({
      delay: 1000,
      callback: () => this.spawnEnemy(null, 1),
      callbackScope: this,
      loop: true
    });
  }

  spawnEnemy(unitName = null, countMonster = 1) {
    const cryptoData = getCryptoData();

    for (let i = 0; i < countMonster; i++) {
      const side = Phaser.Math.Between(0, 3);
      let x, y;

      switch (side) {
        case 0: x = Phaser.Math.Between(0, this.gameWidth); y = -20; break;
        case 1: x = Phaser.Math.Between(0, this.gameWidth); y = this.gameHeight + 20; break;
        case 2: x = -20; y = Phaser.Math.Between(0, this.gameHeight); break;
        case 3: x = this.gameWidth + 20; y = Phaser.Math.Between(0, this.gameHeight); break;
      }

      let enemy;

      if (unitName === 'Bitcoin') {
        enemy = this.add.sprite(x, y, 'btc');
        enemy.setScale(0.12);
        enemy.setOrigin(0.5, 0.5);
        enemy.hp = cryptoData['BTC']['hPoint'];
        enemy.dmg = cryptoData['BTC']['damage'];
      } else {
        enemy = this.add.sprite(x, y, 'monster');
        enemy.setScale(0.08);
        enemy.setOrigin(0.5, 0.5);
        enemy.hp = 1;
        enemy.dmg = 1;
      }

      this.enemies.add(enemy);
    }
  }

  fireProjectile() {
    const cryptoData = getCryptoData();
    if (this.enemies.children.size === 0) return;

    let closestEnemy = null;
    let minDist = Infinity;

    this.enemies.children.entries.forEach(enemy => {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closestEnemy = enemy;
      }
    });

    if (!closestEnemy) return;

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
      enemy.x += Math.cos(angle) * 50 * dt;
      enemy.y += Math.sin(angle) * 50 * dt;

      if (enemy.setFlipX) enemy.setFlipX(enemy.x > this.player.x);
    });

    // fire
    if (now - this.lastShot > this.shotDelay) {
      this.fireProjectile();
      this.lastShot = now;
    }

    // projectiles
    this.projectiles.children.entries.forEach(proj => {
      proj.x += proj.dx * proj.speed * dt;
      proj.y += proj.dy * proj.speed * dt;

      if (proj.x < -50 || proj.x > this.gameWidth + 50 || proj.y < -50 || proj.y > this.gameHeight + 50) {
        proj.destroy();
        return;
      }

      for (let i = 0; i < this.enemies.children.entries.length; i++) {
        const enemy = this.enemies.children.entries[i];
        const dx = proj.x - enemy.x;
        const dy = proj.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= 14) {
          enemy.hp -= proj.dmg;
          proj.destroy();

          if (enemy.hp <= 0) enemy.destroy();
          break;
        }
      }
    });

    this.checkPlayerState();
  }

  checkPlayerState() {
    for (let i = 0; i < this.enemies.children.entries.length; i++) {
      const enemy = this.enemies.children.entries[i];
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 14) {
        if (this.player.hp - enemy.dmg <= 0) {
          this.scene.stop();
          const event = getEvent('dead');
          this.scene.start(event.nextScene, { event });
          return true;
        } else {
          this.player.hp -= enemy.dmg;
        }
      }
    }
    return false;
  }
}
