/****************************************
 *
 * Constants and globals
 *
 ****************************************/

////////////////////////////////////////////////////////////////////////////////

/* Animation stuff */

var lastTimeRunCalled = undefined;

////////////////////////////////////////////////////////////////////////////////

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
var spotLightHeight = 900;

////////////////////////////////////////////////////////////////////////////////

var ball; // this is not a constant, i should probably remove it :|
var ballRadius = 10, enemyRadius = 10;

var ballMaxVelocity = 5;
var ballMaxAcceleration = 4;
var ballJumpVelocity = 15; /* goes upto 20 with the jump powerup */

////////////////////////////////////////////////////////////////////////////////

var boostModeOn = false;
var boostModeAvailable = true; /* boost mode is available exactly once per life */
var boostModeDuration = 10000; /* boost mode dies out within 10 secs */
var boostModeTimeLeft = boostModeDuration;
var boostCountdownId;

////////////////////////////////////////////////////////////////////////////////

var enemyMaterial = new THREE.MeshPhongMaterial({ color: 'grey' });
var ballRedMaterial = new THREE.MeshPhongMaterial({ color: 'red' });
var fragmentMaterial = new THREE.MeshPhongMaterial({ color: 'orange' });
var ballGeometry = new THREE.SphereGeometry(ballRadius, 12, 6);

/* JSON object storing the enemies */
var enemies = {};
var enemyId = 0; /* each enemy gets a unique ID */
// var indicators = {}; /* each enemy gets a green arrow indicating where they are */

////////////////////////////////////////////////////////////////////////////////

/* indicator geometry */
function indicator() {
  this.geometry = new THREE.Geometry();
  this.mesh = undefined;
  this.material = new THREE.MeshBasicMaterial({ color: 0x1EA821 });
}

indicator.prototype.init = function () {
  var v1 = new THREE.Vector3(-15,0,15);
  var v2 = new THREE.Vector3(15,0,15);
  var v3 = new THREE.Vector3(0,15,15);

  this.geometry.vertices.push(v1);
  this.geometry.vertices.push(v2);
  this.geometry.vertices.push(v3);

  this.geometry.faces.push(new THREE.Face3(0,1,2));
  this.geometry.computeFaceNormals();

  this.mesh = new THREE.Mesh(this.geometry, this.material);
}

indicator.prototype.addToScene = function (pos, scene) {
  if (typeof this.mesh == 'undefined') {
    this.init();
  }

  this.mesh.position.x = pos.x;
  this.mesh.position.y = pos.y;
  this.mesh.position.z = pos.z;

  scene.add(this.mesh);
}

////////////////////////////////////////////////////////////////////////////////

/* enemies can have different sizes */
var enemyRadiusMin = ballRadius - 6;
var enemyRadiusMax = ballRadius + 6;
var enemyGeometry = [];
for (var i = enemyRadiusMin ; i <= enemyRadiusMax ; i++) {
  enemyGeometry.push(new THREE.SphereGeometry(i, 12, 6));
}

////////////////////////////////////////////////////////////////////////////////

/* physics constants */
var groundFriction = 1.5,
    gravity = 1.5,
    groundRestitutionCoefficient = 0.5;

var boundsTolerance = 15000,
    jumpTolerance = 5,
    ballInAirTolerance = 0.5;

var groundRadius = 600;

var bounds = groundRadius*groundRadius + ballRadius*ballRadius;

////////////////////////////////////////////////////////////////////////////////

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
  NORMAL: 3, /* the ball is safe on the ground and within the game boundary */
  COUNTDOWN: 4 /* the 3-2-1 countdown is taking place */

}

/* enum for current state of a coin */
var coinStateEnum = {

  IN_THE_AIR: 0, /* the coin has just spawned and is currently falling down */
  NORMAL: 1 /* the coin has stopped bouncing and is now on the ground */

}

/* enum for powerups */
var powerupTypeEnum = {
  
  JUMP: 0, /* higher jumps! */
  BOOST: 1, /* boost mode! */
  SLOW_ENEMIES: 2, /* enemies move much more slowly */
  STOP_ENEMIES: 3, /* all currently alive enemies stop and die */
  /* expander / shrinker powerups */
  GROW_BIG: 4,
  GROW_SMALL: 5

}

////////////////////////////////////////////////////////////////////////////////

var enemySpawnFrequency = 2000; // msec

/* checking if an object is offscreen */
var offscreenCheck = {
  frustum: new THREE.Frustum(),
  updateFrustum: function (cam) {
    this.frustum.setFromMatrix(
      new THREE.Matrix4().multiply(cam.projectionMatrix,
                                   cam.matrixWorldInverse)
    );
  },
  isOffscreen: function (obj, cam) {
    this.updateFrustum(cam);
    var objPosition = new THREE.Vector3(obj.position.x,
                                      obj.position.y,
                                      obj.position.z);
    return !this.frustum.containsPoint(objPosition);
  },
  getOffscreenPoint: function (ball, obj, cam) {
    this.updateFrustum(cam);
    var planes = this.frustum.planes;
    var ballPos = new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z);
    var objPos = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
    var joiningLine = new THREE.Line3(ballPos, objPos);
    for (var i = 0 ; i < 6 ; i++) {
      var plane = planes[i];
      var intersectionPoint = plane.intersectLine(joiningLine);
      if (typeof intersectionPoint != 'undefined') {
        return intersectionPoint;
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

var fragmentRadius = 6;
var fragmentGeometry = new THREE.SphereGeometry(fragmentRadius, 12, 6);

/* number of explosion fragments generated when an enemy hits our hero.
 * note that while explosion fragments persist in the scene, another explosion
 * can simultaneously happen. So numExplosionFragments is not necessarily ==
 * explosionFragments.length, in fact it is a factor of it!
 */
var numExplosionFragments = 30;

/* explosion fragments */
var explosionFragments = [];

/* lifetime of an explosion fragment in milliseconds */
var fragmentLifetime = 800;

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

/* controls and options */
var gameOptions = {

  paused: false,

  displayScore: true,

  gameOver: false,

  /* use the ternary operator because localStorage.dodgeBombMute
   * could also be undefined */
  mute: localStorage.dodgeBombMute ? true : false,

  pauseDisplayDiv: document.getElementById("pauseDisplay"),

  pauseBlocked: false,

  togglePause: function () {

    if (!gameOptions.pauseBlocked) {

      gameOptions.pauseBlocked = true;
      gameOptions.paused ? gameOptions.unpauseGame() : gameOptions.pauseGame();

    }

    window.setTimeout(function () { gameOptions.pauseBlocked = false }, 200);

  },

  pauseGame: function () {

    gameOptions.paused = true;
    gameOptions.pauseDisplayDiv.innerHTML = "PAUSED";

  },

  unpauseGame: function() {

    gameOptions.paused = false;
    gameOptions.pauseDisplayDiv.innerHTML = "";

    lastTimeRunCalled = new Date().getTime();

  }

}

////////////////////////////////////////////////////////////////////////////////

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

// var powerup = {
//   radius: 10;
  
//   material: new THREE.MeshPhongMaterial()
// }

////////////////////////////////////////////////////////////////////////////////

/* Lives left, game over, etc. */

var livesLeft = 5;
