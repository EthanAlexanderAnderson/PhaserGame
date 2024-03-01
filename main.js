import './style.css'
import Phaser from 'phaser'
import { Swipe } from './swipe.js';

// get HTML elements
const gameStartDiv = document.getElementById('gameStart');
const gameEasyButton = document.getElementById('easy');
const gameMediumButton = document.getElementById('medium');
const gameHardButton = document.getElementById('hard');
const gameOverDiv = document.getElementById('gameOver');
const scoreSpan = document.getElementById('score');

// global variables
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
    this.target1
    this.target2
    this.target3
    this.targetList = [this.target1, this.target2, this.target3];
    this.points = 0;
    this.lives = 3;
    this.timedEvent
    this.timeElasped = 0
    this.coinSFX
    this.bgMusic
    this.bgMusicSpace
    this.emitterBanana
    this.emitterCoconut
    this.moveCooldown
    this.spawnLocations = [300, 700];
    this.monkeyLocations = [];
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
    gameEasyButton.disabled = false;
    gameMediumButton.disabled = false;
    gameHardButton.disabled = false;
    // sprites
    this.load.image('tree', './assets/Log.png');
    this.load.image('monkey', './assets/monkey.png');
    this.load.image('banana', './assets/banana.png');
    this.load.image('bunch', './assets/bunch.png');
    this.load.image('pineapple', './assets/pineapple.png');
    this.load.image('coconut', './assets/coconut.png');
    this.load.image('anvil', './assets/anvil.png');
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
    this.load.audio('bgMusic', './assets/mus_monkeytime_bpm142.mp3');
    this.load.audio('bgMusicSpace', './assets/mus_deepspacemonkeytime_bpm142.mp3');
    // set preload variables
    this.timeElasped = 0;
  }
 // create game objects
  create(){

    // dont auto play scene
    this.scene.pause();

    // audio
    this.coinSFX = this.sound.add('coin');
    this.coinSFX.volume = 0.75;
    this.hurtSFX = this.sound.add('hurt');
    this.yumSFX = this.sound.add('yum');
    this.bgMusic = this.sound.add('bgMusic');
    this.bgMusicSpace = this.sound.add('bgMusicSpace');

    // background
    for (var i = 0; i < 50; i++) {
      let img = 'sky';
      if (i == 0) {
        img = 'beach';
      }
      else if (i == 1) {
        img = 'sky_trans';
      }
      else if (i == 20) {
        img = 'space_trans';
      } 
      else if (i > 20 && i % 2 == 0) {
        img = 'space_1';
      }
      else if (i > 20 && i % 2 != 0) {
        img = 'space_2';
      }
      let bg = this.add.image(500, 695 * (-i+1), img).setDisplaySize(1000, 700);
      bg.setDepth(-999);
      this.skylist.push(bg);
    }

    // player
    this.player = this.physics.add.image(this.monkeyLocations[0], 750, 'F1').setDisplaySize(500, 500);
    this.player.setTexture('F1');
    this.player.setImmovable(true);
    this.player.body.setAllowGravity(false);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(425, 425);
    // player hands 
    this.hands = this.add.image(this.monkeyLocations[0], 750, 'H1').setDisplaySize(500 , 500).setDepth(2);

    // falling objects (banana, bunch, coconuts, pineapples, anvils)
    this.target1 = this.physics.add.image(this.spawnLocations[1], -100, 'banana').setDepth(1);
    this.target1.value = 10;
    this.physics.add.overlap(this.player, this.target1, () => this.TargetHit(0), null, this);

    this.target2 = this.physics.add.image(this.spawnLocations[0], -500 , 'banana').setDepth(1);
    this.target2.value = 10;
    this.physics.add.overlap(this.player, this.target2, () => this.TargetHit(1), null, this);

    this.target3 = this.physics.add.image(this.spawnLocations[1], -900, 'banana').setDepth(1);
    this.target3.value = 10;
    this.physics.add.overlap(this.player, this.target3, () => this.TargetHit(2), null, this);

    this.targetList = [this.target1, this.target2, this.target3];

    // extra variables
    this.cursor = this.input.keyboard.createCursorKeys();

    // for UI elements
    this.heartImageList = [];
    this.scoreImageList = [];

    // game status variables
    this.startTime = 0;
    this.moveCooldown = null;

    // particle effects
    this.emitterBanana = this.add.particles(85, -50, 'banana',{
      speed: 200,
      gravityY: 300,
      scale: 0.3,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterBanana.startFollow(this.player);
    this.emitterBanana.setDepth(999);

    this.emitterCoconut = this.add.particles(85, -50, 'anger',{
      speed: 200,
      gravityY: 300,
      scale: 0.1,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterCoconut.startFollow(this.player);
    this.emitterCoconut.setDepth(999);

    this.emitterHeart = this.add.particles(85, -50, 'heart',{
      speed: 200,
      gravityY: 300,
      scale: 0.3,
      duration: 100,
      emitting: false,
      lifespan: 4000,
    });
    this.emitterHeart.startFollow(this.player);
    this.emitterHeart.setDepth(999);

    // set initial UI heart display
    this.UpdateHeartDisplay();

    // swipe detection
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
    // enable buttons
    ready = true;
    console.log('preload & create ready');
  }
  // update game state
  update(){
    // start timer, this is all done once
    if (!this.scene.isPaused('scene-game') && this.started == false){
      this.DifficultyBasedSetup();

      this.startTime = Math.floor(this.time.now / 1000);
      this.started = true;
      
      // only play music when game starts
      this.bgMusic.play();
      this.bgMusicSpace.play();

      this.bgMusic.volume = 0.8;
      this.bgMusicSpace.volume = 0;

      this.bgMusic.loop = true;
      this.bgMusicSpace.loop = true;
      console.log('game started');
    }

    // update timer
    this.timeElasped = Math.floor(this.time.now / 1000) - this.startTime;

    // increase speed
    if (speedDown < 1000) {
      speedDown = 200 + (this.timeElasped * 10);
    } else {
      speedDown = 1000 + ((this.timeElasped - 80) * 5);
    }

    // set max limit on speed
    if (speedDown > 1500) {
      speedDown = 1500;
    }

    // update score
    let score = Math.floor((this.points + (Math.floor(this.timeElasped)*0.001*speedDown)));
    this.DisplayScore(score);
    
    // move bg
    for (var i = 0; i < this.skylist.length; i++) {
      this.skylist[i].y += speedDown / 1000;
    }
    for (var i = 0; i < this.treelist.length; i++) {
      this.treelist[i].y += speedDown / 1000;
    }

    // update distance traveled
    this.distanceTraveled += speedDown / 1000;

    // check if target is off screen and respawn
    for (var i = 0; i < 3; i++) {
      if (this.targetList[i].y > 1100) {
        this.TargetRespawn(this.targetList[i]);
      } 
    }

    // input
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

    // bg music transition to space music
    if (this.distanceTraveled > 12800 && (this.bgMusic.volume > 0 || this.bgMusicSpace.volume < 0.8)) {
      this.bgMusic.volume -= 0.01;
      this.bgMusicSpace.volume += 0.01;
    }
  }
  // custom functions

  // set up game based on difficulty
  DifficultyBasedSetup() {
    // EASY
    if (difficultyModifier == 0) {
      // trees
      for (var i = 0; i < 40; i++) {
        let tree = this.add.image(500, 1000 * (-i+1), 'tree').setDisplaySize(60, 1000);
        this.treelist.push(tree);
      }
      // player & item locations
      this.monkeyLocations = [375, 625];
      this.spawnLocations = [300, 700];
    }
    // MEDIUM
    else if (difficultyModifier == 1) {
      for (var i = 0; i < 40; i++) {
        // trees
        let tree = this.add.image(303, 1000 * (-i+1), 'tree').setDisplaySize(40, 1000);
        this.treelist.push(tree);
        let tree2 = this.add.image(696, 1000 * (-i+1), 'tree').setDisplaySize(40, 1000);
        this.treelist.push(tree2);
      }
      // player & item locations & sizes
      this.player.setDisplaySize(333, 333);
      this.hands.setDisplaySize(333, 333);
      this.monkeyLocations = [225, 378, 618, 775];
      this.spawnLocations = [210, 396, 593, 800];
      this.targetList[1].y -= 200;
    }
    // HARD
    else {
      for (var i = 0; i < 40; i++) {
        // trees
        let tree = this.add.image(250, 1000 * (-i+1), 'tree').setDisplaySize(20, 1000);
        this.treelist.push(tree);
        let tree2 = this.add.image(500, 1000 * (-i+1), 'tree').setDisplaySize(20, 1000);
        this.treelist.push(tree2);
        let tree3 = this.add.image(750, 1000 * (-i+1), 'tree').setDisplaySize(20, 1000);
        this.treelist.push(tree3);
      }
      // player & item locations & sizes
      this.player.setDisplaySize(167, 167);
      this.hands.setDisplaySize(167, 167);
      this.monkeyLocations = [208, 292, 458, 542, 708, 792];
      this.spawnLocations = [180, 320, 430, 570, 680, 820];
    }
    // enable / disable items based on difficulty
    for (var i = 0; i < 3; i++) {
      this.targetList[i].setMaxVelocity(0, 0);
      let itemSize = (100 / (difficultyModifier+1)) + 20;
      this.targetList[i].x = this.SpawnLocation();
      this.targetList[i].setDisplaySize(itemSize, itemSize);
    }
    if (difficultyModifier == 0) {
      this.targetList[0].setMaxVelocity(0, speedDown);
    } else {
      this.targetList[0].setMaxVelocity(0, speedDown);
      this.targetList[1].setMaxVelocity(0, speedDown);
      this.targetList[2].setMaxVelocity(0, speedDown);
    }

    // set player location
    this.player.x = this.monkeyLocations[0];
    this.hands.x = this.monkeyLocations[0];
  }

  // when player collides with item
  TargetHit(n) {

    let targetN = this.targetList[n];
    
    // banana
    if (targetN.value > 0) {
      this.coinSFX.play();
      this.emitterBanana.start();
      this.points += targetN.value;
      this.DisplayScore(this.points);
    }
    // coconut & anvil
    else if (targetN.value < 0) {
      this.hurtSFX.play();
      this.emitterCoconut.start();
      // add the negative value to reduce the lives
      this.lives += targetN.value;
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
    this.TargetRespawn(this.targetList[n]);
  }

  // respawn item at top of screen when it goes off the bottom of the screen or is touched by player
  TargetRespawn(targetN) {
    // ensure item spawns well above the current highest item
    targetN.y = this.targetList.reduce((minY, target) => Math.min(minY, target.y), Infinity) - (200 * (difficultyModifier+1) + (difficultyModifier % 2 * 400));
    targetN.setMaxVelocity(0, speedDown);

    // randomize item type
    let rand = Math.random();

    let itemSize = (100 / (difficultyModifier+1)) + 20;
    // banana
    if ( rand <= (0.5 - 0.15 * difficultyModifier) )
    {
      targetN.setTexture('banana');
      targetN.value = 10;
      targetN.setDisplaySize(itemSize, itemSize);
    }
    // bunch
    else if ( rand <= (0.6 - 0.18 * difficultyModifier) )
    {
      targetN.setTexture('bunch');
      targetN.value = 50;
      targetN.setDisplaySize(itemSize + (itemSize*(1/3)), itemSize);
    }
    // pineapple
    else if ( rand <= (0.68 - 0.2 * difficultyModifier) )
    {
      targetN.setTexture('pineapple');
      targetN.value = 0;
      targetN.setDisplaySize(itemSize, itemSize*2);
    }
    // anvil
    else if ( rand <= 0.35 && difficultyModifier == 2)
    {
      targetN.setTexture('anvil');
      targetN.value = -3;
      targetN.setDisplaySize(itemSize*3, itemSize*1.5);
    }
    // coconut
    else {
      targetN.setTexture('coconut');
      targetN.value = -1;
      targetN.setDisplaySize(itemSize, itemSize);
    }
    // if anvil, spawn in middle of the tree
    if (targetN.value == -3) {
      targetN.x = this.SpawnLocation(0);
      if (this.spawnLocations.indexOf(targetN.x) % 2 == 0){
        targetN.x += 50;
      } else {
        targetN.x -= 80;
      }
    }
    // else spawn normally, either left or right of a tree
    else {
      targetN.x = this.SpawnLocation();
    }
  }

  // return a random spawn location for items
  SpawnLocation(variationMultiplier = 1){
    let variation = (30 - (difficultyModifier * 10)) * variationMultiplier;
    return this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)] + Phaser.Math.Between(-variation, variation);
  }

  // game over
  GameOver() {
    this.sys.game.destroy(true);

    gameOverDiv.style.display = 'flex';
    scoreSpan.innerHTML = this.points;
  }

  // move player left or right
  Move(isLeft){
    // input left arrow
    let emitterOffset = (-40 + difficultyModifier * 10);
    if(isLeft){
      // if player is not already furthest left
      if (this.player.x != this.monkeyLocations[0]) {
        this.player.x = this.monkeyLocations[this.monkeyLocations.indexOf(this.player.x) - 1];
        this.hands.x = this.monkeyLocations[this.monkeyLocations.indexOf(this.hands.x) - 1];
      }

      // invert Reggie image
      if (this.monkeyLocations.indexOf(this.player.x) % 2 == 0){
        this.player.setFlipX(false);
        this.hands.setFlipX(false);
        this.emitterBanana.setX(-emitterOffset);
        this.emitterCoconut.setX(-emitterOffset);
        this.emitterHeart.setX(-emitterOffset);
      } else {
        this.player.setFlipX(true);
        this.hands.setFlipX(true);
        this.emitterBanana.setX(emitterOffset);
        this.emitterCoconut.setX(emitterOffset);
        this.emitterHeart.setX(emitterOffset);
      }
    }
    // input right arrow
    else{
      // if player is not already furthest right
      if (this.player.x != this.monkeyLocations[this.monkeyLocations.length - 1]) {
        this.player.x = this.monkeyLocations[this.monkeyLocations.indexOf(this.player.x) + 1];
        this.hands.x = this.monkeyLocations[this.monkeyLocations.indexOf(this.hands.x) + 1];
      }

      // invert Reggie image
      if (this.monkeyLocations.indexOf(this.player.x) % 2 == 0){
        this.player.setFlipX(false);
        this.hands.setFlipX(false);
        this.emitterBanana.setX(-emitterOffset);
        this.emitterCoconut.setX(-emitterOffset);
        this.emitterHeart.setX(-emitterOffset);
      } else {
        this.player.setFlipX(true);
        this.hands.setFlipX(true);
        this.emitterBanana.setX(emitterOffset);
        this.emitterCoconut.setX(emitterOffset);
        this.emitterHeart.setX(emitterOffset);
      }
    }
    this.moveCooldown = null;
  }

  // update heart display with current lives
  UpdateHeartDisplay() {
    // remove prior hearts
    for (var i = 0; i < this.heartImageList.length; i++) {
      this.heartImageList[i].destroy();
    }
    // set new hearts
    for (var i = 0; i < this.lives; i++) {
      let heart = this.add.image(920, 80 + (i * 100), 'heart').setDisplaySize(100, 80)
      //add to list
      this.heartImageList.push(heart);
    }
  }

  // change animation frame for Reggie
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

  // display score using custom number font
  DisplayScore(score) {
    // remove prior score text images
    for (var i = 0; i < this.scoreImageList.length; i++) {
      this.scoreImageList[i].destroy();
    }
    // set new score
    score = score.toString();
    for (var i = 0; i < score.length; i++) {
      let digit = this.add.image(80 + (i * 100), 100, score[i]).setDisplaySize(80, 130)
      //add to list
      this.scoreImageList.push(digit);
    }
  }
}

// game config
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

// event listeners for game start buttons
gameEasyButton.addEventListener('click', () => {
  if(!ready){
    alert('Loading. Please wait a few seconds and try again.');
    return;
  }
  difficultyModifier = 0;
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});

gameMediumButton.addEventListener('click', () => {
  if(!ready){
    alert('Loading. Please wait a few seconds and try again.');
    return;
  }
  difficultyModifier = 1;
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});

gameHardButton.addEventListener('click', () => {
  if(!ready){
    alert('Loading. Please wait a few seconds and try again.');
    return;
  }
  difficultyModifier = 2;
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});