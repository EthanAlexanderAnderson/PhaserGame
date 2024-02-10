import './style.css'
import Phaser from 'phaser'

const gameStartDiv = document.getElementById('gameStart');
const gameStartButton = document.getElementById('start');
const gameOverDiv = document.getElementById('gameOver');
const scoreSpan = document.getElementById('score');

var speedDown = 300;

class GameScene extends Phaser.Scene {

  // set variables
  constructor() {
    super("scene-game")
    this.player
    this.cursor
    this.target
    this.points = 0
    this.lives = 3;
    this.textScore
    this.textTime
    this.textLives
    this.timedEvent
    this.timeElasped = 0
    this.coinSFX
    this.bgMusic
    this.emitterBanana
    this.emitterBomb
    this.moveCooldown
    this.spawnLocations = [250, 500, 750];
    this.startTime = 0;
    this.started = false;
  }
  // load assets
  preload(){
    // images
    this.load.image('bg', '/assets/bg.png');
    this.load.image('monkey', '/assets/monkey.png');
    this.load.image('banana', '/assets/banana.png');
    this.load.image('bomb', '/assets/bomb.png');
    this.load.image('anger', '/assets/anger.png');
    // audio assets
    this.load.audio('coin', '/assets/coin.mp3');
    this.load.audio('bgMusic', '/assets/bgMusic.mp3');
    // set preload variables
    this.timeElasped = 0;
  }
 // create game objects
  create(){
    this.scene.pause();

    this.coinSFX = this.sound.add('coin');
    this.bgMusic = this.sound.add('bgMusic');
    this.bgMusic.play();
    this.bgMusic.volume = 0.1;

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(1000, 1000);
    this.player = this.physics.add.image(500, 750, 'monkey').setDisplaySize(200, 200);
    this.player.setImmovable(true);
    this.player.body.setAllowGravity(false);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(200, 200)

    this.target = this.physics.add.image(0, 0, 'banana').setDisplaySize(80, 80);
    this.target.x = 500;
    this.target.value = 1

    this.physics.add.overlap(this.player, this.target, this.targetHit, null, this);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(10, 10, 'Score: 0', { fontSize: '40px', fill: '#000' });
    this.textTime = this.add.text(10, 60, 'Timer: 0', { fontSize: '40px', fill: '#000' });
    this.textLives = this.add.text(10, 110, 'Lives: 3', { fontSize: '40px', fill: '#000' });
  
    this.startTime = 0;

    this.moveCooldown = null;

    this.emitterBanana = this.add.particles(0, 0, 'banana',{
      speed: 100,
      gravityY: 300,
      scale: 0.05,
      duration: 100,
      emitting: false
    });
    this.emitterBanana.startFollow(this.player);

    this.emitterBomb = this.add.particles(0, 0, 'anger',{
      speed: 100,
      gravityY: 300,
      scale: 0.05,
      duration: 100,
      emitting: false
    });
    this.emitterBomb.startFollow(this.player);
  }
  // update game state
  update(){
    if (!this.scene.isPaused('scene-game') && this.started == false){
      this.startTime = Math.floor(this.time.now / 1000);
      console.log(this.startTime);
      this.started = true;
    }

    this.timeElasped = Math.floor(this.time.now / 1000) - this.startTime;
    this.textTime.setText('Timer: ' + Math.round(this.timeElasped));
    speedDown = 300 + (this.timeElasped * 10);

    if (this.target.y > 1000) {
      this.targetRespawn();
    } 

    const{ left, right } = this.cursor;
    // input left arrow
    if(left.isDown && !this.moveCooldown){
      this.moveCooldown = this.time.delayedCall(100, this.move, [true], this);
    } 
    // input right arrow
    else if(right.isDown && !this.moveCooldown){
      this.moveCooldown = this.time.delayedCall(100, this.move, [false], this);
    }

  }
  // custom functions
  targetHit() {

    // banana
    if (this.target.value > 0) {
      this.coinSFX.play();
      this.emitterBanana.start();
      this.points += this.target.value;
      this.textScore.setText('Score: ' + this.points);
    } 
    // bomb
    else {
      this.emitterBomb.start();
      this.lives--;
      this.textLives.setText('Lives: ' + this.lives);
    } 

    if (this.lives <= 0) {
      this.gameOver();
    }
    this.targetRespawn();
  }

  targetRespawn() {
    this.target.y = 0;
    this.target.x = this.spawnLocation();
    this.target.setMaxVelocity(0, speedDown);
    if (this.target.x % 2 == 0) {
      this.target.setTexture('banana');
      this.target.value = 1;
    } else {
      this.target.setTexture('bomb');
      this.target.value = -10;
    }
  }

  spawnLocation(){
    return this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)] + Phaser.Math.Between(-30, 30);
  }

  gameOver() {
    console.log('game over');
    this.sys.game.destroy(true);

    gameOverDiv.style.display = 'flex';
    scoreSpan.innerHTML = this.points;
  }

  move(isLeft){
    // input left arrow
    if(isLeft){
      if (this.player.x == 750){
        this.player.x = 500;
      } else if (this.player.x == 500){
        this.player.x = 250;
      }
    }
    // input right arrow
    else{
      if (this.player.x == 250){
        this.player.x = 500;
      } else if (this.player.x == 500){
        this.player.x = 750;
      }
    }
    this.moveCooldown = null;
  }
}

const config = {
  type: Phaser.WEBGL,
  width: 1000,
  height: 1000,
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