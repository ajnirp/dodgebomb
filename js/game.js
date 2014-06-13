/* http://buildnewgames.com/webgl-threejs/ */
/* http://learningthreejs.com/blog/2012/01/20/casting-shadows/ */

/* load stats: https://github.com/mrdoob/stats.js/blob/master/examples/basic.html */
var stats = new Stats();
document.body.appendChild(stats.domElement);

var renderer, scene, camera;
var spotLight;
var groundRadius = 400;

/* camera constants */
var cameraElevation = 200,
    cameraSetBack = -400;

var fieldWidth = 400, fieldHeight = 200;

/* enemies! */
var enemies = {};
var enemyId = 0;

var bounds = groundRadius*groundRadius + ballRadius*ballRadius;

/* ambient light, needed for the super creepy flicker effect */
// var ambientLight = new THREE.AmbientLight(0x101010);

/* game stuff */
var score = 0;
var level = 1;
var enemySpawnFrequency = 3000; // msec
var enemyCleanupFrequency = 15000; // msec
var ballAlive = true;

/* periodically spawn enemies */
setInterval(function () {
    var enemy = spawnEnemy();
    enemy.id = enemyId++;
    enemies[enemyId] = enemy;
    scene.add(enemy);
}, enemySpawnFrequency);
// /* periodically clean up all stationary enemies */
setInterval(function () {
    for (var i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].velocity.x === 0 && enemies.velocity.y === 0) {
            scene.remove(enemies[i]);
            enemies.splice(i,1);
        }
    };
}, enemyCleanupFrequency);

/* physics constants */
var groundFriction = 0.7,
    gravity = 1.5,
    groundRestitutionCoefficient = 0.5;

/* GL constants */
var WIDTH = 640, 
    HEIGHT = 480;
var VIEW_ANGLE = 50,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

function setupScene() {
    /* set up renderer */
	renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);

  /* and attach it to the relevant DOM element */
  var container = document.getElementById("gameCanvas");
  container.appendChild(renderer.domElement);

  /* initialise a new scene */
  scene = new THREE.Scene();

  /* camera */
  camera = setupCamera();
  scene.add(camera);

  /* marble ball */
  ball = setupBall({ x: 0, y: 0, z: ballRadius },
                   { x: 0, y: 0, z: 0 },
                   ballRedMaterial);
  newBall();
  scene.add(ball);

  /* central spotlight */
  spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, 500); /* x, y, spotLightHeight */
  // spotLight.intensity = 1;
  spotLight.angle = Math.PI / 2;
  // spotLight.castShadow = true;
  // spotLight.shadowDarkness = 0.5;
  scene.add(spotLight);

  /* plane */
  var planeTexture = new THREE.ImageUtils.loadTexture('img/stone.png');
  planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
  planeTexture.repeat.set(10,10);
  var planeMaterial = new THREE.MeshLambertMaterial({ map: planeTexture, side: THREE.SingleSide });
  var circleGeometry = new THREE.CircleGeometry(groundRadius, 32);
  var bufferGeometry = THREE.BufferGeometryUtils.fromGeometry(circleGeometry);
  var plane = new THREE.Mesh(bufferGeometry, planeMaterial);
  scene.add(plane);

  // renderer.shadowMapEnabled = true;
  // renderer.shadowMapSoft = true;
}

function draw(gamepadSnapshot) {
  renderer.render(scene, camera);
  ballPhysics();
  enemyPhysics();
  // drawShadows();
 
  /* spotlight position is fixed
   * but its focus is towards the ball, always */
  spotLight.target.position.x = ball.position.x;
  spotLight.target.position.y = ball.position.y;

  /* Camera moves with the ball (though not at the same pace) */
  camera.position.y = cameraSetBack + 0.5 * ball.position.y;
  camera.rotation.y = - 0.003 * ball.position.x;

  if (gamepadSnapshot.buttons[6].pressed ||
      gamepadSnapshot.buttons[7].pressed)
  {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    ball.acceleration.x = 0;
    ball.acceleration.y = 0;
  }

  /* Move the ball */
  ball.acceleration.x = ball.maxAcceleration * gamepadSnapshot.axes[0];
  ball.acceleration.y = -ball.maxAcceleration * gamepadSnapshot.axes[1];
  /* negative sign for y acceleration because on the joystick the
   * y value is negative when the joystick is pushed up, and the game
   * uses the opposite convention */

  if (gamepadSnapshot.buttons[0].pressed) {
    if (Math.abs(ball.position.z - ballRadius) < jumpTolerance) {
        ball.velocity.z = 10;
    }
  }

  /* Update the FPS counter */
  stats.update();
}

function youDied() {
  timeAliveInSec = 0;
  newBall();
}