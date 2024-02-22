import './style.css'
import Phaser from 'phaser'
import { Swipe } from './swipe.js';

const gameStartDiv = document.getElementById('gameStart');
const gameEasyButton = document.getElementById('easy');
const gameMediumButton = document.getElementById('medium');
const gameHardButton = document.getElementById('hard');
const gameOverDiv = document.getElementById('gameOver');
const scoreSpan = document.getElementById('score');

var speedDown = 200;
var difficultyModifier = 0;
var ready = false;

class GameScene extends Phaser.Scene {

  // set variables
  constructor() {
    super("scene-game")
    this.player
    this.bg
    this.cursor
    this.target
    this.points = 0;
    this.lives = 3;
    this.textTime
    this.timedEvent
    this.timeElasped = 0
    this.coinSFX
    this.bgMusic
    this.bgMusicSpace
    this.emitterBanana
    this.emitterCoconut
    this.moveCooldown
    this.spawnLocations = [300, 700];
    this.monkeyleft = 375;
    this.monkeyright = 625;
    this.startTime = 0;
    this.started = false;
    this.skylist = [];
    this.treelist = [];
    this.frame = 1;
    this.oldtime = 0;
    this.counter = 0;
    this.distanceTraveled = 0;
  }
  // load assets
  preload(){
    // sprites
    this.load.image('tree', './assets/Log.png');
    this.load.image('monkey', './assets/monkey.png');
    this.load.image('banana', './assets/banana.png');
    this.load.image('bunch', './assets/bunch.png');
    this.load.image('pineapple', './assets/pineapple.png');
    this.load.image('coconut', './assets/coconut.png');
    this.load.image('anger', './assets/anger.png');
    this.load.image('heart', './assets/heart.png');

    // background images
    this.load.image('beach', './assets/beach.png');
    this.load.image('sky_trans', './assets/sky_trans.png');
    this.load.image('sky', './assets/sky.png');
    this.load.image('space_trans', './assets/space_trans.png');
    this.load.image('space_1', './assets/space_1.png');
    this.load.image('space_2', './assets/space_2.png');

    // load monkey animation frame images
    this.load.image('F1', './assets/F1.png');
    this.load.image('F2', './assets/F2.png');
    this.load.image('F3', './assets/F3.png');
    this.load.image('F4', './assets/F4.png');

    this.load.image('H1', './assets/H1.png');
    this.load.image('H2', './assets/H2.png');
    this.load.image('H3', './assets/H3.png');
    this.load.image('H4', './assets/H4.png');

    // custom number font images
    this.load.image('0', './assets/0.png');
    this.load.image('1', './assets/1.png');
    this.load.image('2', './assets/2.png');
    this.load.image('3', './assets/3.png');
    this.load.image('4', './assets/4.png');
    this.load.image('5', './assets/5.png');
    this.load.image('6', './assets/6.png');
    this.load.image('7', './assets/7.png');
    this.load.image('8', './assets/8.png');
    this.load.image('9', './assets/9.png');

    // audio assets
    this.load.audio('coin', './assets/sfx_BananaGet.wav');
    this.load.audio('hurt', './assets/sfx_hurt.wav');
    this.load.audio('yum', './assets/sfx_yum.wav');
    this.load.audio('bgMusic', './assets/mus_monkeytime_bpm142.wav');
    this.load.audio('bgMusicSpace', './assets/mus_deepspacemonkeytime_bpm142.wav');
    // set preload variables
    this.timeElasped = 0;
  }
 // create game objects
  create(){
    this.scene.pause();

    this.coinSFX = this.sound.add('coin');
    this.coinSFX.volume = 0.75;
    this.hurtSFX = this.sound.add('hurt');
    this.yumSFX = this.sound.add('yum');
    this.bgMusic = this.sound.add('bgMusic');
    this.bgMusicSpace = this.sound.add('bgMusicSpace');

    //background
    for (var i = 0; i < 50; i++) {
      let img = 'sky';
      if (i == 0) {
        img = 'beach';
      }
      else if (i == 1) {
        img = 'sky_trans';
      }
      else if (i == 25) {
        img = 'space_trans';
      } 
      else if (i > 25 && i % 2 == 0) {
        img = 'space_1';
      }
      else if (i > 25 && i % 2 != 0) {
        img = 'space_2';
      }
      let bg = this.add.image(500, 695 * (-i+1), img).setDisplaySize(1000, 700);
      this.skylist.push(bg);
    }

    // player
    this.player = this.physics.add.image(this.monkeyleft, 750, 'F1').setDisplaySize(500 , 500);
    this.player.setTexture('F1');
    this.player.setImmovable(true);
    this.player.body.setAllowGravity(false);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(425, 425);

    // tree
    for (var i = 0; i < 50; i++) {
      let tree = this.add.image(500, 1000 * (-i+1), 'tree').setDisplaySize(60, 1000);
      this.treelist.push(tree);
    }

    // player hands 
    this.hands = this.add.image(this.monkeyleft, 750, 'H1').setDisplaySize(500 , 500);

    // banana / coconut

    this.target = this.physics.add.image(0, -100, 'banana').setDisplaySize(100, 100);
    this.target.x = this.monkeyleft;
    this.target.value = 10;

    this.physics.add.overlap(this.player, this.target, this.TargetHit, null, this);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.heartImageList = [];

    this.scoreImageList = [];
  
    this.startTime = 0;

    this.moveCooldown = null;

    this.emitterBanana = this.add.particles(85, -50, 'banana',{
      speed: 200,
      gravityY: 300,
      scale: 0.3,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterBanana.startFollow(this.player);

    this.emitterCoconut = this.add.particles(85, -50, 'anger',{
      speed: 200,
      gravityY: 300,
      scale: 0.1,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterCoconut.startFollow(this.player);

    this.emitterHeart = this.add.particles(85, -50, 'heart',{
      speed: 200,
      gravityY: 300,
      scale: 0.3,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterHeart.startFollow(this.player);

    this.UpdateHeartDisplay();

    const swipe = new Swipe(this, {
      swipeDetectedCallback: (direction) => {
        //let angle = 0;
        switch (direction) {
          case 'DOWN':
            //angle = 90;
            break;
          case 'UP':
            //angle = -90;
            break;
          case 'RIGHT':
            this.Move(false);
            break;
          case 'LEFT':
            this.Move(true);
            break;
          default:
            break;
        }
      },
    });

    // at the end of create function, un-disable the html start buttons
    gameEasyButton.disabled = false;
    gameMediumButton.disabled = false;
    gameHardButton.disabled = false;
    ready = true;
  }
  // update game state
  update(){
    // start timer
    if (!this.scene.isPaused('scene-game') && this.started == false){
      this.startTime = Math.floor(this.time.now / 1000);
      this.started = true;
      
      this.bgMusic.play();
      this.bgMusicSpace.play();

      this.bgMusic.volume = 0.8;
      this.bgMusicSpace.volume = 0;

      this.bgMusic.loop = true;
      this.bgMusicSpace.loop = true;
    }
    // update timer + score
    this.timeElasped = Math.floor(this.time.now / 1000) - this.startTime;
    speedDown = 200 + (this.timeElasped * 10) + (200 * difficultyModifier);
    // set max limit on speed
    if (speedDown > 1500) {
      speedDown = 1500;
    }
    let score = Math.floor((this.points + (Math.round(this.timeElasped)*0.001*speedDown)));
    this.DisplayScore(score);
    // move bg
    for (var i = 0; i < this.skylist.length; i++) {
      this.skylist[i].y += speedDown / 1000;
    }
    for (var i = 0; i < this.treelist.length; i++) {
      this.treelist[i].y += speedDown / 1000;
    }
    this.distanceTraveled += speedDown / 1000;

    if (this.target.y > 1000) {
      this.TargetRespawn();
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
    // animation
    this.counter--;
    if(this.counter < speedDown / 40){
      this.ChangeFrame();
      this.counter = 80;
    }
    // bg music transition
    if (this.distanceTraveled > 16000 && (this.bgMusic.volume > 0 || this.bgMusicSpace.volume < 0.8)) {
      this.bgMusic.volume -= 0.01;
      this.bgMusicSpace.volume += 0.01;
    }
  }
  // custom functions
  TargetHit() {

    // banana
    if (this.target.value > 0) {
      this.coinSFX.play();
      this.emitterBanana.start();
      this.points += this.target.value;
      this.DisplayScore(this.points);
    }
    // coconut
    else if (this.target.value < 0) {
      this.hurtSFX.play();
      this.emitterCoconut.start();
      this.lives--;
      this.UpdateHeartDisplay();
    }
    // pinapple
    else {
      this.yumSFX.play();
      this.emitterHeart.start();
      this.lives++;
      this.UpdateHeartDisplay();
    }

    if (this.lives <= 0) {
      this.GameOver();
    }
    this.TargetRespawn();
  }

  TargetRespawn() {
    this.target.y = -100;
    this.target.x = this.SpawnLocation();
    this.target.setMaxVelocity(0, speedDown);
    let rand = Math.random();

    if ( rand <= (0.5 - 0.15 * difficultyModifier) )
    {
      this.target.setTexture('banana');
      this.target.value = 10;
    } 
    else if ( rand <= (0.6 - 0.18 * difficultyModifier) )
    {
      this.target.setTexture('bunch');
      this.target.value = 50;
    } 
    else if ( rand <= (0.65 - 0.2 * difficultyModifier) )
    {
      this.target.setTexture('pineapple');
      this.target.value = 0;
    } 
    else {
      this.target.setTexture('coconut');
      this.target.value = -10;
    }
  }

  SpawnLocation(){
    return this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)] + Phaser.Math.Between(-50, 50);
  }

  GameOver() {
    this.sys.game.destroy(true);

    gameOverDiv.style.display = 'flex';
    scoreSpan.innerHTML = this.points;
  }

  Move(isLeft){
    // input left arrow
    if(isLeft){
      // invert image
      if (this.player.x == this.monkeyright){
        this.player.setFlipX(false);
        this.hands.setFlipX(false);
        this.emitterBanana.setX(85);
        this.emitterCoconut.setX(85);
      }
      this.player.x = this.monkeyleft;
      this.hands.x = this.monkeyleft;
    }
    // input right arrow
    else{
      if (this.player.x == this.monkeyleft){
        this.player.setFlipX(true);
        this.hands.setFlipX(true);
        this.emitterBanana.setX(-85);
        this.emitterCoconut.setX(-85);
      }
      this.player.x = this.monkeyright;
      this.hands.x = this.monkeyright;
    }
    this.moveCooldown = null;
  }

  UpdateHeartDisplay() {
    // remove prior hearts
    for (var i = 0; i < this.heartImageList.length; i++) {
      this.heartImageList[i].destroy();
    }
    // set 
    for (var i = 0; i < this.lives; i++) {
      let heart = this.add.image(920, 80 + (i * 100), 'heart').setDisplaySize(100, 80)
      //add to list
      this.heartImageList.push(heart);
    }
  }

  ChangeFrame() {
    if (this.frame == 1) {
      this.player.setTexture('F2');
      this.hands.setTexture('H2');
      this.frame = 2;
    } 
    else if (this.frame == 2) {
      this.player.setTexture('F3');
      this.hands.setTexture('H3');
      this.frame = 3;
    } 
    else if (this.frame == 3) {
      this.player.setTexture('F4');
      this.hands.setTexture('H4');
      this.frame = 4;
    } 
    else if (this.frame == 4) {
      this.player.setTexture('F1');
      this.hands.setTexture('H1');
      this.frame = 1;
    }
  }

  DisplayScore(score) {
    // remove prior hearts
    for (var i = 0; i < this.scoreImageList.length; i++) {
      this.scoreImageList[i].destroy();
    }
    // set 
    score = score.toString();
    for (var i = 0; i < score.length; i++) {
      let digit = this.add.image(80 + (i * 100), 100, score[i]).setDisplaySize(80, 130)
      //add to list
      this.scoreImageList.push(digit);
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

gameEasyButton.addEventListener('click', () => {
  if(!ready) return;
  difficultyModifier = 0;
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});

gameMediumButton.addEventListener('click', () => {
  if(!ready) return;
  difficultyModifier = 1;
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});

gameHardButton.addEventListener('click', () => {
  if(!ready) return;
  difficultyModifier = 2;
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});