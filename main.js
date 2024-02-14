import './style.css'
import Phaser from 'phaser'
import { Swipe } from './swipe.js';

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
    this.bg
    this.cursor
    this.target
    this.points = 0;
    //this.timerpoints = 0;
    this.lives = 3;
    this.textScore
    this.textTime
    //this.textLives
    this.timedEvent
    this.timeElasped = 0
    this.coinSFX
    this.bgMusic
    this.emitterBanana
    this.emitterBomb
    this.moveCooldown
    this.spawnLocations = [300, 700];
    this.monkeyleft = 375;
    this.monkeyright = 625;
    this.startTime = 0;
    this.started = false;
    this.skylist = [];
    this.treelist = [];
  }
  // load assets
  preload(){
    // images
    this.load.image('bg', '/assets/bg.png');
    this.load.image('bglong', '/assets/bg2.png');
    this.load.image('tree', '/assets/Log.png');
    this.load.image('sky', '/assets/sky.png');
    this.load.image('monkey', '/assets/monkey.png');
    this.load.image('banana', '/assets/banana.png');
    this.load.image('bomb', '/assets/bomb.png');
    this.load.image('anger', '/assets/anger.png');
    this.load.image('heart_full', '/assets/heart_full.png');
    this.load.image('heart_empty', '/assets/heart_empty.png');
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

    //background

    this.bg = this.add.image(0, -9010, 'bglong').setOrigin(0, 0).setDisplaySize(1000, 10000);
    // sky
    for (var i = 0; i < 50; i++) {
      let sky = this.add.image(500, 695 * (-i+1), 'sky').setDisplaySize(1000, 700);
      this.skylist.push(sky);
    }

    // player

    this.player = this.physics.add.image(this.monkeyleft, 750, 'monkey').setDisplaySize(500 , 500);
    this.player.setImmovable(true);
    this.player.body.setAllowGravity(false);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(425, 425);

    // tree
    for (var i = 0; i < 50; i++) {
      let tree = this.add.image(500, 1000 * (-i+1), 'tree').setDisplaySize(60, 1000);
      this.treelist.push(tree);
    }

    // banana / bomb

    this.target = this.physics.add.image(0, -100, 'banana').setDisplaySize(100, 100);
    this.target.x = this.monkeyleft;
    this.target.value = 10;

    this.physics.add.overlap(this.player, this.target, this.targetHit, null, this);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(10, 10, 'Score: 0', { fontSize: '40px', fill: '#000' });
    //this.textTime = this.add.text(10, 60, 'Timer: 0', { fontSize: '40px', fill: '#000' });
    //this.textLives = this.add.text(10, 110, 'Lives: 3', { fontSize: '40px', fill: '#000' });

    this.heartlist = [];
  
    this.startTime = 0;

    this.moveCooldown = null;

    this.emitterBanana = this.add.particles(85, -50, 'banana',{
      speed: 200,
      gravityY: 300,
      scale: 0.1,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterBanana.startFollow(this.player);

    this.emitterBomb = this.add.particles(85, -50, 'anger',{
      speed: 200,
      gravityY: 300,
      scale: 0.1,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterBomb.startFollow(this.player);

    this.heartdisplay();

    const swipe = new Swipe(this, {
      swipeDetectedCallback: (direction) => {
        console.log(direction);
        //let angle = 0;
        switch (direction) {
          case 'DOWN':
            //angle = 90;
            break;
          case 'UP':
            //angle = -90;
            break;
          case 'RIGHT':
            this.move(false);
            break;
          case 'LEFT':
            this.move(true);
            break;
          default:
            break;
        }
        this.add.tween({
          targets: arrow,
          angle: angle,
          ease: Phaser.Math.Easing.Sine.Out,
          duration: 500,
        });
      },
    });
  }
  // update game state
  update(){
    // start timer
    if (!this.scene.isPaused('scene-game') && this.started == false){
      this.startTime = Math.floor(this.time.now / 1000);
      console.log(this.startTime);
      this.started = true;
    }
    // update timer + score
    this.timeElasped = Math.floor(this.time.now / 1000) - this.startTime;
    //this.textTime.setText('Timer: ' + Math.round(this.timeElasped));
    speedDown = 300 + (this.timeElasped * 10);
    this.textScore.setText('Score: ' + Math.floor((this.points + (Math.round(this.timeElasped)*0.001*speedDown))));
    // move bg
    this.bg.y += speedDown / 1000;
    for (var i = 0; i < this.skylist.length; i++) {
      this.skylist[i].y += speedDown / 1000;
    }
    for (var i = 0; i < this.treelist.length; i++) {
      this.treelist[i].y += speedDown / 1000;
    }

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
      //this.textLives.setText('Lives: ' + this.lives);
      this.heartdisplay();
    } 

    if (this.lives <= 0) {
      this.gameOver();
    }
    this.targetRespawn();
  }

  targetRespawn() {
    this.target.y = -100;
    this.target.x = this.spawnLocation();
    this.target.setMaxVelocity(0, speedDown);
    if (this.target.x % 2 == 0) {
      this.target.setTexture('banana');
      this.target.value = 10;
    } else {
      this.target.setTexture('bomb');
      this.target.value = -10;
    }
  }

  spawnLocation(){
    return this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)] + Phaser.Math.Between(-50, 50);
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
      // invert image
      if (this.player.x == this.monkeyright){
        this.player.setFlipX(false);
        this.emitterBanana.setX(85);
        this.emitterBomb.setX(85);
      }
      this.player.x = this.monkeyleft;
      /*
      if (this.player.x == 750){
        this.player.x = 500;
      } else if (this.player.x == 500){
        this.player.x = 250;
      }
      */
    }
    // input right arrow
    else{
      if (this.player.x == this.monkeyleft){
        this.player.setFlipX(true);
        this.emitterBanana.setX(-85);
        this.emitterBomb.setX(-85);
      }
      this.player.x = this.monkeyright;
      /*
      if (this.player.x == 250){
        this.player.x = 500;
      } else if (this.player.x == 500){
        this.player.x = 750;
      }
      */
    }
    this.moveCooldown = null;
  }

  heartdisplay() {
    // remove prior hearts
    for (var i = 0; i < this.heartlist.length; i++) {
      this.heartlist[i].destroy();
    }
    // set 
    for (var i = 0; i < this.lives; i++) {
      let heart = this.add.image(900, 100 + (i * 120), 'heart_full').setDisplaySize(100, 100)
      //add to list
      this.heartlist.push(heart);
    }
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