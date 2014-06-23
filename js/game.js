/* http://buildnewgames.com/webgl-threejs/ */
/* http://learningthreejs.com/blog/2012/01/20/casting-shadows/ */

console.log("game.js");

/* load stats: https://github.com/mrdoob/stats.js/blob/master/examples/basic.html */
var stats = new Stats();
document.body.appendChild(stats.domElement);

var renderer, camera, scene, spotLight;
// var composer;

/* enemies! */

/* ambient light, needed for the super creepy flicker effect */
// var ambientLight = new THREE.AmbientLight(0x101010);

/* game stuff */
var level = 1;

/* start periodically spawning enemies after an initial wait */
window.setTimeout(function () {
  window.setInterval(spawnEnemy, enemySpawnFrequency);
}, 3000);

/* start periodically spawning coins after an initial wait */
window.setTimeout(function () {
  window.setInterval(spawnCoin, coinSpawnFrequency);
}, 5000);

function isOffScreen(b) {
  var origin = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
  var direction = new THREE.Vector3(b.position.x - camera.position.x,
                                    b.position.y - camera.position.y,
                                    b.position.z - camera.position.z);
  raycaster.set(origin, direction.normalize());
  var intersections = raycaster.intersectObject(b);
  return (intersections.length == 0);
}

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

  /* temp shadow */
  // var shadow = new THREE.EllipseCurve();

  /* initialise the boost trail */
  // for (var i = 0 ; i < boostTrail.array.length ; i++) {
  //   boostTrail.array[i] = JSON.parse(JSON.stringify(ball));
  // }
}

function draw(gamepadSnapshot) {
  /* draw the game elements */
  renderer.render(scene, camera);
  // composer.render(scene, camera);

  /* Take input from the gamepad joystick */
  ball.acceleration.x = ball.maxAcceleration * gamepadSnapshot.axes[0];
  /* negative sign for y acceleration because on the joystick the
   * y value is negative when the joystick is pushed up, and the game
   * uses the opposite convention */
  ball.acceleration.y = -ball.maxAcceleration * gamepadSnapshot.axes[1];

  /* jump */
  if (gamepadSnapshot.buttons[0].pressed &&
      ball.state != ballStateEnum.FALLING_OFF)
  {
    if (Math.abs(ball.position.z - ballRadius) < jumpTolerance) {
      ball.velocity.z = ballJumpVelocity;
    }
  }

  /* ball physics */
  ballPhysics(ball);

  /* physics for each enemy */
  for (var key in enemies) {
    var currEnemy = enemies[key];
    if (!currEnemy.stoppedMoving) {
      enemyPhysics(key);
    }
  }

  /* physics for each coin */
  for (var key in coins) {
    coinPhysics(key); 
  }

  /* phatak boom */
  // if (explosionFragments.length > 0) {
  //   for (var i = 0 ; i < explosionFragments.length ; i++) {
  //     ballPhysics(explosionFragments[i]);
  //   }
  // }

  // drawShadows();
 
  /* spotlight position is fixed
   * but its focus is towards the ball, always */
  spotLight.target.position.x = ball.position.x;
  spotLight.target.position.y = ball.position.y;

  /* Camera moves with the ball (though not at the same pace) */
  camera.position.y = cameraSetBack + 0.75 * ball.position.y;
  camera.rotation.y = -0.001 * ball.position.x;

  if (gamepadSnapshot.buttons[6].pressed)
  {
    // ball.velocity.x = 0;
    // ball.velocity.y = 0;
    // ball.acceleration.x = 0;
    // ball.acceleration.y = 0;
    ball.maxVelocity = 2;
  } else {
    ball.maxVelocity = 5;
  }

  /* draw the boost trail */
  // boostTrail.shiftTrail(JSON.parse(JSON.stringify(ball)), scene);

  // /* activate boost mode! */
  if (!boostModeOn &&
       boostModeAvailable &&
       gamepadSnapshot.buttons[3].pressed)
  {
    boostModeOn = true;
    boostModeAvailable = false;
    boostModeTimeLeft = boostModeDuration;
    ballMaxVelocity = 10;
    ballMaxAcceleration = 10;

    /* start showing a countdown */
    boostCountdownId = window.setInterval(boostCountdown, 1000);

    /* boost mode dies out after some time */
    window.setTimeout(function () {
      boostModeOn = false;
      boostModeTimeLeft = boostModeDuration;
      boostModeDisplay.innerHTML = "";
      window.clearInterval(boostCountdownId);
    }, boostModeDuration);

  }

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

  var enemyRadius = Math.floor(Math.random() * (enemyRadiusMax - enemyRadiusMin + 1)) + enemyRadiusMin;

  /* enemies spawn slightly outside the perimeter of the ground */
  var spawnX = 1.006 * groundRadius * Math.cos(angle),
      spawnY = 1.006 * groundRadius * Math.sin(angle);
  var spawnPoint = { x: spawnX, y: spawnY, z: enemyRadius };
  // var spawnPoint = { x: spawnX, y: spawnY, z: ballRadius };

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

  // return setupBall(spawnPoint,
  //                  spawnVel,
  //                  enemyMaterial,
  //                  ballRadius,
  //                  ballGeometry
  //                  );

  return setupBall(spawnPoint,
                   spawnVel,
                   enemyMaterial,
                   enemyRadius,
                   enemyGeometry[enemyRadius - enemyRadiusMin]
                   );
}

function spawnEnemy() {
  var enemy = setupEnemy(3);

  enemy.id = enemyId;
  var idAdded = enemyId;
  enemy.stoppedMoving = false;

  enemies[enemyId++] = enemy;

  scene.add(enemy);
  setTimeout(function () {
    if (enemy) {
      enemy.stoppedMoving = true;
      enemy.removeTimeout = setTimeout(function () {
        scene.remove(enemies[idAdded]);
        delete enemies[idAdded];
      }, 2000);
    }
  }, 2*enemySpawnFrequency);
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

function newBall() {
  /* place the ball a little above the center of the ground */
  ball.position.x = 0;
  ball.position.y = 0;
  ball.position.z = ballRadius + 200;

  ball.velocity.x = 0;
  ball.velocity.y = 0;
  ball.velocity.z = 0;

  ball.acceleration.x = 0;
  ball.acceleration.y = 0;
  ball.acceleration.z = 0;

  ball.maxAcceleration = 4;
  ball.maxVelocity = 5;

  ball.state = ballStateEnum.IN_THE_AIR;

  /* boost mode available again */
  boostModeOn = false;
  boostModeAvailable = true;
  boostModeTimeLeft = boostModeDuration;
  boostModeDisplay.innerHTML = "";

  if (boostCountdownId) {
    clearTimeout(boostCountdownId);
  }

  /* reset score by resetting coinsCollected */
  coinsCollected = 0;
  scoreDisplaySpan.innerHTML = 0;
}

function ballPhysics(b) {
  if (b.position.z > b.radius) { b.state = ballStateEnum.IN_THE_AIR; }

  var airborne = (b.state == ballStateEnum.IN_THE_AIR) ||
                 (b.state == ballStateEnum.FALLING_OFF);
  b.acceleration.z = (airborne ? gravity : 0);

  /* apply air/ground-friction - a quick hack to remove the automove bug */
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

  var displacementMultiplier = (boostModeOn && b == ball ? 2 : 1);

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

function coinPhysics(key) {
  var coin = coins[key];
  /* rotate the coin */
  coin.rotation.z += 0.1;

  /* check for a coin pickup */
  var xx = ball.position.x - coin.position.x;
  var yy = ball.position.y - coin.position.y;
  var zz = ball.position.z - coin.position.z;
  var min_dist = ballRadius + coinThickness + coinPickupTolerance;
  
  if (xx*xx + yy*yy + zz*zz < min_dist*min_dist && !coin.pickedUp) {
    coin.pickedUp = true;
    coinCollected(coin);
  }
}

function coinCollected(coin) {
  /* clear the removal timeout for the coin */
  window.clearTimeout(coin.timeout);

  /* remove the coin from the game */
  scene.remove(coin)
  delete coin;

  /* play the coin pickup sound */
  sounds.coinPickup.play();
  
  /* update the number of coins collected and display the new score */
  scoreDisplaySpan.innerHTML = 100 * (++coinsCollected);
}