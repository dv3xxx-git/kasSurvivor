
import { getCenter } from './helpers.js';
import { getEvent } from './gameEvents.js';
import { loadCryptoStatsData } from './cryptoStats.js';
import GameScene from './GameScene.js';


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

      });
      //dead later
    this.scene.start('SpeakWithHelper', {
        event: 'resetGame'
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
    const data = await loadCryptoStatsData();
    this.defaultInfo = this.buildCryptoInfo(data);

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
      const bTime = v?.bTime ?? 0;

      lines.push(
        `${elem}`,
        `MarketCap(hp): `,
        `   ${mcap}(${hp}) HP`,
        `Price(dmg): `,
        `   ${price}(${dmg}) DMG`,
        `Speed: ${bTime}`,
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
  constructor() {
    super('SpeakWithHelper');
  }

  init(get) {
    this.eventKey = get.event;
  }

  preload() {
    this.load.image('kasHelper', 'assets/KasHelperDialog.png');
  }

  create() {
    const event = getEvent(this.eventKey);

    this.bg = this.add.image(0, 0, 'kasHelper')
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    this.dialogBox = { x: 0, y: 0, w: 10, h: 10 };

    this.dialogText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#a8f0ff',
      wordWrap: { width: 10 },
      lineSpacing: 6
    }).setScrollFactor(0);

    this.dialogMaskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    this.dialogMaskGfx.setScrollFactor(0);
    this.dialogText.setMask(this.dialogMaskGfx.createGeometryMask());

    this.continueZone = this.add.rectangle(0, 0, 10, 10, 0x00ff00, 0.0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.continueZone.on('pointerover', () => {
      this.tweens.killTweensOf(this.bg);
      this.bg.setTint(0xE0FFFF);
    });

    this.continueZone.on('pointerout', () => {
      this.bg.clearTint();
    });

    this.continueZone.on('pointerdown', () => {
      this.cameras.main.shake(80, 0.002);

      this.scene.start(event.nextScene, { event });
    });

    this.typeText(event.text ?? '', 18);
    console.log(this.typeText);
    this.layoutHelper();
    this.scale.on('resize', () => this.layoutHelper());
  }

  typeText(fullText, speedMs = 20) {
    if (this.typeTimer) this.typeTimer.remove(false);
    this.dialogText.setText('');

    let i = 0;
    this.typeTimer = this.time.addEvent({
      delay: speedMs,
      loop: true,
      callback: () => {
        i++;
        this.dialogText.setText(fullText.slice(0, i));
        this.recalcDialogMask();
        if (i >= fullText.length) this.typeTimer.remove(false);
      }
    });
  }

  layoutHelper() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.bg.setPosition(w / 2, h / 2);

    const scaleX = w / this.bg.width;
    const scaleY = h / this.bg.height;
    const scale = Math.min(scaleX, scaleY);
    this.bg.setScale(scale);

    const left = this.bg.x - this.bg.displayWidth / 2;
    const top = this.bg.y - this.bg.displayHeight / 2;

    const dialogX = 0.45, dialogY = 0.41, dialogW = 0.43, dialogH = 0.18;
    const btnX = 0.653, btnY = 0.91, btnW = 0.31, btnH = 0.12;

    this.dialogBox.x = left + this.bg.displayWidth * dialogX;
    this.dialogBox.y = top  + this.bg.displayHeight * dialogY;
    this.dialogBox.w = this.bg.displayWidth * dialogW;
    this.dialogBox.h = this.bg.displayHeight * dialogH;

    this.dialogText.setPosition(this.dialogBox.x, this.dialogBox.y);
    this.dialogText.setWordWrapWidth(this.dialogBox.w);

    this.recalcDialogMask();

    this.continueZone.setPosition(
      left + this.bg.displayWidth * btnX,
      top + this.bg.displayHeight * btnY
    );
    this.continueZone.setSize(
      this.bg.displayWidth * btnW,
      this.bg.displayHeight * btnH
    );

    this.continueZone.input.hitArea.setTo(
      -this.continueZone.width / 2,
      -this.continueZone.height / 2,
      this.continueZone.width,
      this.continueZone.height
    );
  }

  recalcDialogMask() {
    this.dialogMaskGfx.clear();
    this.dialogMaskGfx.fillStyle(0xffffff, 1);
    this.dialogMaskGfx.fillRect(
      this.dialogBox.x,
      this.dialogBox.y,
      this.dialogBox.w,
      this.dialogBox.h
    );
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

new Phaser.Game(config);
