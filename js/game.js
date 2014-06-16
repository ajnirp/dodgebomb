/* http://buildnewgames.com/webgl-threejs/ */
/* http://learningthreejs.com/blog/2012/01/20/casting-shadows/ */

/* load stats: https://github.com/mrdoob/stats.js/blob/master/examples/basic.html */
var stats = new Stats();
document.body.appendChild(stats.domElement);

var renderer;
var camera;
var scene;
var spotLight;

/* enemies! */

/* ambient light, needed for the super creepy flicker effect */
// var ambientLight = new THREE.AmbientLight(0x101010);

/* game stuff */
var score = 0;
var level = 1;
var ballAlive = true;

/* start spawning enemies after an initial wait */
window.setTimeout(function () {
  window.setInterval(spawnEnemy, enemySpawnFrequency);
  // window.setInterval(function () {
  //   for (var key in enemies) {
  //     if (enemies[key].velocity.x == 0 && enemies[key].velocity.y == 0) {
  //       scene.remove(enemies[key]);
  //       delete enemies[key];
  //     }
  //   }
  // }, 10000);
}, 5000);

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
                   ballRedMaterial,
                   ballRadius,
                   ballGeometry);
  newBall();
  scene.add(ball);

  /* central spotlight */
  spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, spotLightHeight);
  // spotLight.intensity = 1;
  spotLight.angle = Math.PI / 2;
  scene.add(spotLight);

  /* spotlight lamp */
  var lampGeometry = new THREE.CylinderGeometry(5,40,20,16);
  var lampMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  var lamp = new THREE.Mesh(lampGeometry, lampMaterial);
  lamp.position.set(0, 0, spotLightHeight);
  scene.add(lamp);

  /* plane */
  var planeTexture = new THREE.ImageUtils.loadTexture('img/stone.png');
  planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
  planeTexture.repeat.set(10,10);
  var planeMaterial = new THREE.MeshLambertMaterial({ map: planeTexture, side: THREE.SingleSide });
  var circleGeometry = new THREE.CircleGeometry(groundRadius, 128);
  var bufferGeometry = THREE.BufferGeometryUtils.fromGeometry(circleGeometry);
  var plane = new THREE.Mesh(bufferGeometry, planeMaterial);
  scene.add(plane);
}

function draw(gamepadSnapshot) {
  renderer.render(scene, camera);
  ballPhysics(ball);
  enemyPhysics();

  /* phatak boom */
  if (explosionFragments.length > 0) {
    for (var i = 0 ; i < explosionFragments.length ; i++) {
      ballPhysics(explosionFragments[i]);
    }
  }

  // drawShadows();
 
  /* spotlight position is fixed
   * but its focus is towards the ball, always */
  spotLight.target.position.x = ball.position.x;
  spotLight.target.position.y = ball.position.y;

  /* Camera moves with the ball (though not at the same pace) */
  camera.position.y = cameraSetBack + 0.75 * ball.position.y;
  camera.rotation.y = -0.001 * ball.position.x;

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

  /* jump */
  if (gamepadSnapshot.buttons[0].pressed &&
      ball.state != ballStateEnum.FALLING_OFF)
  {
    if (Math.abs(ball.position.z - ballRadius) < jumpTolerance) {
      ball.velocity.z = 10;
    }
  }

  /* activate boost mode! */
  if (!boostModeOn && gamepadSnapshot.buttons[3].pressed) {
    boostModeOn = true;
    ballMaxVelocity = 10;
    aliveAnnouncement.innerHTML = "Boost mode activated!";
    ballMaxAcceleration = 10;
  }

  /* reset gamepad axes */
  gamepadSnapshot.axes[0] = 0;
  gamepadSnapshot.axes[1] = 0;

  /* Update the FPS counter */
  stats.update();
}

function youDied(deathCause) {
  if (deathCause === deathCauseEnum.FELL_OFF_EDGE) {
    ball.state = ballStateEnum.FALLING_OFF;
    timeAliveInSec = 0;
  }
  else {
    // spawnFragments({
    //   x: ball.position.x,
    //   y: ball.position.y,
    //   z: ball.position.z
    // });

    /* and finally, kill off the current ball and get a new one */
    newBall();
    timeAliveInSec = 0;
  }
}

function setupEnemy(speed) {
  var angle = Math.random() * 2 * Math.PI;

  /* enemies spawn slightly outside the perimeter of the ground */
  var spawnX = 1.006 * groundRadius * Math.cos(angle),
      spawnY = 1.006 * groundRadius * Math.sin(angle);
  var spawnPoint = { x: spawnX, y: spawnY, z: ballRadius };

  /* set spawn speed
   * as the level increases, the enemies get faster */
  if (typeof(speed) == 'undefined') {
    speed = 4; /* default enemy speed */
  }

  var velX = -spawnX,
      velY = -spawnY,
      velZ = 0;

  var sqrtXY = Math.pow(velX*velX + velY*velY, 0.5);
  velX *= speed / sqrtXY;
  velY *= speed / sqrtXY;

  var spawnVel = { x: velX, y: velY, z: velZ };

  return setupBall(spawnPoint,
                   spawnVel,
                   enemyMaterial,
                   ballRadius,
                   ballGeometry
                   );
}

function spawnEnemy() {
  var enemy = setupEnemy(3);
  enemy.id = enemyId;
  var idAdded = enemyId;
  enemies[enemyId++] = enemy;
  scene.add(enemy);
  window.setTimeout(function () {
    /* stop enemy */
    enemies[idAdded].velocity = { x: 0, y: 0, z: 0 };
    /* ...then remove it from the scene after a while */
    // window.setTimeout(function () {
    //   scene.remove(enemies[idAdded]);
    //   delete enemies[idAdded];
    // }, 3000);
  }, enemySpawnFrequency);
  enemyId++;
}

/* initialise a ball */
function setupBall(initialPos, initialVel, material, temp_radius, temp_geometry)
{
  var b = new THREE.Mesh(temp_geometry, material);
  b.radius = temp_radius;

  /* initialise position */
  if (typeof(initialPos) == 'undefined') {
    b.position = { x: 0, y: 0, z: b.radius };
  } else {
    b.position = initialPos;
  }

  /* initialise velocity */
  if (typeof(initialVel) == 'undefined') {
    b.velocity = { x: 0, y: 0, z: 0 };
  } else {
    b.velocity = initialVel;
  }

  b.acceleration = { x: 0, y: 0, z: 0 };
  b.state = ballStateEnum.NORMAL;

  b.maxVelocity = ballMaxVelocity;
  b.maxAcceleration = ballMaxAcceleration;

  return b;
}

/* place the ball a little above the center of the ground */
function newBall() {
  ball.position = { x: 0, y: 0, z: ballRadius + 200 };
  ball.acceleration = { x: 0, y: 0 };
  ball.velocity = { x: 0, y: 0, z: 0 };
  ball.maxAcceleration = 4;
  ball.maxVelocity = 5;
  ball.state = ballStateEnum.IN_THE_AIR;
  boostModeOn = false;
}

function ballPhysics(b) {
  if (b.position.z > b.radius) { b.state = ballStateEnum.IN_THE_AIR; }

  var airborne = (b.state == ballStateEnum.IN_THE_AIR) ||
                 (b.state == ballStateEnum.FALLING_OFF);
  b.acceleration.z = (airborne ? gravity : 0);

  /* apply friction */
  var x_acc_direction = THREE.Math.sign(b.acceleration.x);
  var y_acc_direction = THREE.Math.sign(b.acceleration.y);

  var x_friction = b.velocity.x != 0 ? groundFriction : 0;
  var y_friction = b.velocity.y != 0 ? groundFriction : 0;

  b.acceleration.x -= x_acc_direction * x_friction;
  b.acceleration.y -= y_acc_direction * y_friction;

  if (x_acc_direction * b.acceleration.x < 0) { b.acceleration.x = 0; }
  if (y_acc_direction * b.acceleration.y < 0) { b.acceleration.y = 0; }

  /* new velocities */
  b.velocity.x += b.acceleration.x * dt;
  b.velocity.y += b.acceleration.y * dt;
  b.velocity.z -= b.acceleration.z * dt;

  /* clamp velocities */
  if (b.velocity.x > b.maxVelocity) { b.velocity.x = b.maxVelocity; }
  if (b.velocity.x < -b.maxVelocity) { b.velocity.x = -b.maxVelocity; }
  if (b.velocity.y > b.maxVelocity) { b.velocity.y = b.maxVelocity; }
  if (b.velocity.y < -b.maxVelocity) { b.velocity.y = -b.maxVelocity; }

  var displacementMultiplier = (boostModeOn ? 2 : 1);

  /* new positions */
  b.position.x += displacementMultiplier * b.velocity.x * dt;
  b.position.y += displacementMultiplier * b.velocity.y * dt;
  b.position.z += displacementMultiplier * b.velocity.z * dt;

  /* out of bounds check */
  var xx = b.position.x;
  var yy = b.position.y;

  if (xx*xx + yy*yy > bounds/* + boundsTolerance*/) {
    youDied(deathCauseEnum.FELL_OFF_EDGE);
  }

  /* This is where the ball physics diverges based on its state.
   * If the ball is in its falling-off animation, simply let it fall,
   * and stop it when it gets too low.
   * On the other hand, if the ball is within bounds, bounce it off
   * the ground */
  if (b.state == ballStateEnum.FALLING_OFF) {
    if (b.position.z < -80) {
      b.state = ballStateEnum.IN_THE_AIR;
      newBall();
    }
  }
  else {
    if (b.position.z < b.radius) {
      b.position.z = b.radius;
      if (Math.abs(b.velocity.z) < ballInAirTolerance) {
        b.state = ballStateEnum.NORMAL;
        b.acceleration.z = 0;
        b.velocity.z = 0;
      }
      else {
        b.state = ballStateEnum.IN_THE_AIR;
        b.velocity.z *= -1 * groundRestitutionCoefficient;
      }
    }
  }
}