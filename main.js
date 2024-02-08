import './style.css'
import Phaser from 'phaser'

const speedDown = 300;

const gameStartDiv = document.getElementById('gameStart');
const gameStartButton = document.getElementById('start');
const gameOverDiv = document.getElementById('gameOver');
const scoreSpan = document.getElementById('score');

class GameScene extends Phaser.Scene {

  constructor() {
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown+50;
    this.target
    this.points = 0
    this.textScore
    this.textTime
    this.timedEvent
    this.timeLeft = 30000
    this.coinSFX
    this.bgMusic
    this.emitter
  }

  preload(){
    this.load.image('bg', '/assets/bg.png');
    this.load.image('basket', '/assets/basket.png');
    this.load.image('apple', '/assets/apple.png');
    this.load.image('money', '/assets/money.png');
    this.load.audio('coin', '/assets/coin.mp3');
    this.load.audio('bgMusic', '/assets/bgMusic.mp3');
    this.timeLeft = 30000;
  }

  create(){
    this.scene.pause();

    this.coinSFX = this.sound.add('coin');
    this.bgMusic = this.sound.add('bgMusic');
    this.bgMusic.play();
    this.bgMusic.volume = 0.5;

    this.add.image(0, 0, 'bg').setOrigin(0, 0);
    this.player = this.physics.add.image(0, 400, 'basket').setOrigin(0, 0);
    this.player.setImmovable(true);
    this.player.body.setAllowGravity(false);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(80, 15).setOffset(10, 70);

    this.target = this.physics.add.image(0, 0, 'apple').setOrigin(0, 0);

    this.physics.add.overlap(this.player, this.target, this.targetHit, null, this);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#000' });
    this.textTime = this.add.text(10, 30, 'Time Left: 0', { fontSize: '20px', fill: '#000' });
  
    this.timedEvent = this.time.delayedCall(this.timeLeft, this.gameOver, [], this);

    this.emitter = this.add.particles(0, 0, 'money',{
      speed: 100,
      gravityY: speedDown,
      scale: 0.05,
      duration: 100,
      emitting: false
    });
    this.emitter.startFollow(this.player);
  }

  update(){
    this.timeLeft = this.timedEvent.getRemainingSeconds();
    this.textTime.setText('Time Left: ' + Math.round(this.timeLeft));

    if (this.target.y > 500) {
      this.target.y = 0;
      this.target.x = Phaser.Math.Between(0, 500);
      this.target.setMaxVelocity(0, speedDown);  
    } 

    const{ left, right } = this.cursor;
    if(left.isDown){
      this.player.setVelocityX(-200);
    } else if(right.isDown){
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }
  }

  targetHit() {
    this.coinSFX.play();
    this.emitter.start();
    this.target.setY(0);
    this.target.setX(Phaser.Math.Between(0, 500));
    this.target.setMaxVelocity(0, speedDown);  
    this.points++;
    this.textScore.setText('Score: ' + this.points);
  }

  gameOver() {
    console.log('game over');
    this.sys.game.destroy(true);

    gameOverDiv.style.display = 'flex';
    scoreSpan.innerHTML = this.points;
  }
}

const config = {
  type: Phaser.WEBGL,
  width: 500,
  height: 500,
  canvas:gameCanvas,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: speedDown }
    }
  },
  scene: [GameScene]
}

const game = new Phaser.Game(config)

gameStartButton.addEventListener('click', () => {
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});