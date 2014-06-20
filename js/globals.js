/****************************************
 *
 * Constants and globals
 *
 ****************************************/

/* GL constants */
var WIDTH = 800, 
    HEIGHT = 480;
var VIEW_ANGLE = 50,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

/* timestep */
var dt = 0.85;

/* camera constants */
var cameraElevation = 250,
    cameraSetBack = -400;

/* spotlight */
// var spotLightHeight = 600;
var spotLightHeight = 1200;

var ball; // this is not a constant, i should probably remove it :|
var ballRadius = 10, enemyRadius = 10, fragmentRadius = 3;

var ballMaxVelocity = 5;
var ballMaxAcceleration = 4;

var boostModeOn = false;
var boostModeAvailable = true; /* boost mode is available exactly once per life */
var boostModeDuration = 10000; /* boost mode dies out within 10 secs */
var boostModeTimeLeft = boostModeDuration;
var boostCountdownId;
/* Trail of "previous-positions" of the ball that will be displayed when
 * boostMode is on */
var boostTrail = [];

var enemyMaterial = new THREE.MeshPhongMaterial({ color: 'grey' });
var ballRedMaterial = new THREE.MeshPhongMaterial({ color: 'red' });
var fragmentMaterial = new THREE.MeshPhongMaterial({ color: 'orange' });
var ballGeometry = new THREE.SphereGeometry(ballRadius, 12, 6);
var fragmentGeometry = new THREE.SphereGeometry(fragmentRadius, 12, 6);

/* JSON object storing the enemies */
var enemies = {};
var enemyId = 0; /* each enemy gets a unique ID */
var indicators = {}; /* each enemy gets a green arrow indicating where they are */

var enemyRadiusMin = ballRadius - 4;
var enemyRadiusMax = ballRadius + 4;
var enemyGeometry = [];
for (var i = enemyRadiusMin ; i <= enemyRadiusMax ; i++) {
	enemyGeometry.push(new THREE.SphereGeometry(i, 12, 6));
}

/* physics constants */
var groundFriction = 1.5,
    gravity = 1.5,
    groundRestitutionCoefficient = 0.5;

var boundsTolerance = 15000,
    jumpTolerance = 5,
    ballInAirTolerance = 0.5;

var groundRadius = 600;

var bounds = groundRadius*groundRadius + ballRadius*ballRadius;

/* enum for cause of death */
var deathCauseEnum = {
  ENEMY_CONTACT: 0,
  FELL_OFF_EDGE: 1
};

/* enum for current state of the ball */
var ballStateEnum = {
	IN_THE_AIR: 0, /* the ball is in the middle of a jump */
	FALLING_OFF: 1, /* the ball crossed bounds and is falling off the edge */
	EXPLODING: 2, /* the ball got hit by an enemy */
	NORMAL: 3 /* the ball is safe on the ground and within the game boundary */
}

var enemySpawnFrequency = 2000; // msec

var raycaster = new THREE.Raycaster();

/* number of explosion fragments generated when an enemy hits our hero.
 * note that while explosion fragments persist in the scene, another explosion
 * can simultaneously happen. So numExplosionFragments is not necessarily ==
 * explosionFragments.length, in fact it is a factor of it!
 */
var numExplosionFragments = 8;

/* explosion fragments */
var explosionFragments = [];

/* lifetime of an explosion fragment in milliseconds */
var fragmentLifetime = 7000;

/* coins */
var coins = {}; /* global object to store coins */
var coinId = 0; /* id for each coin */
var coinColor = 0xffff00;
var coinRadius = 12;
var coinThickness = 3;
var coinGeometry = new THREE.CylinderGeometry(coinRadius,
                                              coinRadius,
                                              coinThickness,
                                              16);
var coinMaterial = new THREE.MeshPhongMaterial({
  color: coinColor,
  specular: coinColor,
  ambient: 0xABA615,
  shininess: 20
});
var coinSpawnFrequency = 5000;
var coinLifetime = 8000; /* coins live for coinLifetime sec */
var scoreDisplaySpan = document.getElementById("scoreDisplay");
var coinsCollected = 0;
var coinPickupTolerance = 25;

/* controls and options */
var gameOptions = {

  paused: false,
  displayScore: true,
  mute: false

}

/* sounds */
var sounds = {

  explosion: new Howl({
    urls: ['assets/explosion.wav']
  }),

  coinPickup: new Howl({
    urls: ['assets/coin.wav'],
    onplay: function () { sounds.blockCoinPickup = true; }
  }),

  blockCoinPickup: false

}