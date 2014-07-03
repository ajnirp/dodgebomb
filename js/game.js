/* http://buildnewgames.com/webgl-threejs/ */
/* http://learningthreejs.com/blog/2012/01/20/casting-shadows/ */

/* load stats: https://github.com/mrdoob/stats.js/blob/master/examples/basic.html */
// var stats = new Stats();
// document.body.appendChild(stats.domElement);

var renderer, camera, scene, spotLight;

/* enemies! */

/* ambient light, needed for the super creepy flicker effect */
// var ambientLight = new THREE.AmbientLight(0x101010);

/* game stuff */
var level = 1;

/* start periodically spawning enemies after an initial wait */
setTimeout(function () {
  setInterval(spawnEnemy, enemySpawnFrequency);
}, 3000);

/* start periodically spawning coins after an initial wait */
setTimeout(function () {
  setInterval(spawnCoin, coinSpawnFrequency);
}, 5000);

/* start randomly spawning powerups after an initial wait */
setTimeout(function () {
  randomlySpawnPowerup();
}, 5000);

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

}

/* Main game loop */
function run(gamepadSnapshot) {

  var now = new Date().getTime();
  var frameDuration = lastTimeRunCalled ? now - lastTimeRunCalled : (1000 / 60);
  lastTimeRunCalled = now;

  dt = (frameDuration * 60 / 1000) * 0.85;

  /* Draw the game elements */
  renderer.render(scene, camera);

  update(gamepadSnapshot);

}

/* Update game elements, create events etc. */
function update(gamepadSnapshot) {

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

  /* physics for each powerup */
  for (var key in powerups) {
    powerupPhysics(key); 
  }

  /* phatak boom */
  for (var i = 0 ; i < explosionFragments.length ; i++) {
    var fragment = explosionFragments[i];
    ballPhysics(fragment);
  }

  // drawShadows();
 
  /* spotlight hovers above the ball */
  spotLight.position.x = ball.position.x;
  spotLight.position.y = ball.position.y;

  /* spotlight focus is towards the ball, always */
  spotLight.target.position.x = ball.position.x;
  spotLight.target.position.y = ball.position.y;

  /* Camera moves with the ball (though not at the same pace) */
  camera.position.y = cameraSetBack + 0.75 * ball.position.y;
  camera.rotation.y = -0.001 * ball.position.x;


  // if (gamepadSnapshot.buttons[2].pressed) {
  //   var outside = offscreenCheck.isOffscreen(ball, camera);
  //   console.log(timeAliveInSec + (outside ? " is offscreen" : " is on-screen"));
  // }

  if (gamepadSnapshot.buttons[6].pressed) {

    ball.velocity.x = 0;
    ball.velocity.y = 0;
    ball.acceleration.x = 0;
    ball.acceleration.y = 0;
  //   ball.maxVelocity = 2;
  // } else {
  //   ball.maxVelocity = 5;

  }

  /* draw the boost trail */
  // boostTrail.shiftTrail(JSON.parse(JSON.stringify(ball)), scene);

  /* Update the FPS counter */
  // stats.update();
}

function youDied(deathCause) {

  if (deathCause === deathCauseEnum.FELL_OFF_EDGE) {

    ball.state = ballStateEnum.FALLING_OFF;
    timeAliveInSec = 0;

  }

  else {

    decreaseLife();

    if (livesLeft) {

      spawnFragments({

        x: ball.position.x,
        y: ball.position.y,
        z: ball.position.z

      });

      newBall();
      timeAliveInSec = 0;

    }

  }

}

function decreaseLife() {

  if (livesLeft) {

    var lifeToRemoveDiv = document.getElementById("life" + livesLeft);
    lifeToRemoveDiv.style.visibility = "hidden";
    livesLeft--;

  }

  else {

    gameOver();

  }

}

function gameOver() {

  var gameOverMessageDiv = document.getElementById('newBallCountdownDisplay');
  var pressAnyKeyMessageDiv = document.getElementById('pressAnyKeyMessage');

  gameOverMessageDiv.innerHTML = "GAME OVER";
  pressAnyKeyMessageDiv.innerHTML = "Push any button to continue!";

  gameOptions.gameOver = true;

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
    b.position.x = initialPos.x;
    b.position.y = initialPos.y;
    b.position.z = initialPos.z;
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

function newBallCountdown() {

  ball.state = ballStateEnum.COUNTDOWN;

  var countdownTotalTime = 3;
  var countdownTimeoutTime = countdownTotalTime * 700;
  var countdown = countdownTotalTime;
  var countdownDisplayDiv = document.getElementById("newBallCountdownDisplay");

  countdownDisplayDiv.innerHTML = countdown--;
  var countdownIntervalId = window.setInterval(function () {
    countdownDisplayDiv.innerHTML = countdown--;
  }, 700);

  window.setTimeout(function () {
    window.clearInterval(countdownIntervalId);
    countdownDisplayDiv.innerHTML = "";
    ball.state = ballStateEnum.IN_THE_AIR;
  }, countdownTimeoutTime);

}

function newBall() {

  if (gameOptions.gameOver) return;

  newBallCountdown();

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

  reset.allPowerups();

}

function ballPhysics(b) {

  if (b.state && b.state == ballStateEnum.COUNTDOWN) {
    return;
  }

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

  if (xx*xx + yy*yy > bounds/* + boundsTolerance*/ && b == ball) {
    youDied(deathCauseEnum.FELL_OFF_EDGE);
  }

  /* This is where the ball physics diverges based on its state.
   * If the ball is in its falling-off animation, simply let it fall,
   * and stop it when it gets too low.
   * On the other hand, if the ball is within bounds, bounce it off
   * the ground */
  if (b.state == ballStateEnum.FALLING_OFF) {

    if (b.position.z < -80) {

      decreaseLife();

      if (livesLeft) {

        b.state = ballStateEnum.IN_THE_AIR;
        newBall();

      }

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

////////////////////////////////////////////////////////////////////////////////

function setupCoin() {

  var temp_coin = new THREE.Mesh(coinGeometry, coinMaterial);
  return temp_coin;
}

function spawnCoin() {

  var coin = setupCoin();

  /* in order to set the position of the coin, sample a
   * position uniformly on the face of a sphere as follows:
   * eps = Math.random()
   * theta = 2 * pi * eps
   * rad = sqrt(eps) * Rad
   * where rad = distance from centre
   *       theta = angle wrt horizontal radius
   *       Rad = radius of the sphere on which we are sampling
   */

  var rad = Math.pow(Math.random(), 0.5) * groundRadius;
  var theta = 2 * Math.PI * Math.random();

  var spawnX = rad * Math.cos(theta);
  var spawnY = rad * Math.sin(theta);
  var spawnZ = 200;

  coin.position.set(spawnX, spawnY, spawnZ);
  coin.velocity = { x: 0, y: 0, z: 0 };

  coin.state = coinStateEnum.IN_THE_AIR;

  coin.id = coinId;
  scene.add(coin);
  coins[coinId++] = coin;

  coin.pickedUp = false;

  coin.timeout = setTimeout(function () {
    scene.remove(coins[coin.id]);
    delete coins[coin.id];
  }, coinLifetime);

  return coin;

}

function coinPhysics(key) {

  var coin = coins[key];

  /* rotate the coin if it is on the ground */
  if (coin.state == coinStateEnum.NORMAL) {

    coin.rotation.z += 0.1;

  }

  else if (coin.state == coinStateEnum.IN_THE_AIR) {

    /* coins only move in the up-down direction */
    coin.velocity.z -= gravity * dt;

    var newPosition = coin.position.z + coin.velocity.z * dt;

    if (newPosition < coinRadius) {

      /* no more bouncing */
      if (Math.abs(coin.velocity.z) < ballInAirTolerance)  {

        coin.position.z = coinRadius;
        coin.velocity.z = 0;
        coin.state = coinStateEnum.NORMAL;

      }

      /* the coin lives to see another bounce! */
      else {

        coin.velocity.z *= -1 * groundRestitutionCoefficient;
        coin.state = coinStateEnum.IN_THE_AIR;

      }

    }

    else {

      coin.position.z = newPosition;

    }

  }

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
  clearTimeout(coin.timeout);

  /* remove the coin from the game */
  scene.remove(coin)
  delete coin;

  /* play the coin pickup sound */
  sounds.coinPickup.play();
  
  /* update the number of coins collected and display the new score */
  scoreDisplaySpan.innerHTML = 100 * (++coinsCollected);

}

////////////////////////////////////////////////////////////////////////////////

function spawnPowerup(powerupType) {

  var powerup = new THREE.Mesh(powerupGeometry, powerupMaterial);
  powerup.type = powerupType;

  var rad = Math.pow(Math.random(), 0.5) * groundRadius;
  var theta = 2 * Math.PI * Math.random();

  var spawnX = rad * Math.cos(theta);
  var spawnY = rad * Math.sin(theta);
  var spawnZ = 200;

  powerup.position.set(spawnX, spawnY, spawnZ);
  powerup.velocity = { x: 0, y: 0, z: 0 };

  /* powerup points upwards */
  powerup.rotation.x = Math.PI / 2;

  powerup.state = coinStateEnum.IN_THE_AIR;

  powerup.id = powerupId;
  scene.add(powerup);
  powerups[powerupId++] = powerup;

  powerup.pickedUp = false;

  powerup.timeout = setTimeout(function () {
    scene.remove(powerups[powerup.id]);
    delete powerups[powerup.id];
  }, powerupLifetime);

  return powerup;
  
}

function randomlySpawnPowerup() {

  var temp_powerupTypeInt = Math.floor(Math.random() * 6);
  var temp_powerupType;

  switch (temp_powerupTypeInt) {

    case 0:
      temp_powerupType = powerupTypeEnum.COINS;
      break;

    case 1:
      temp_powerupType = powerupTypeEnum.BOOST;
      break;

    case 2:
      temp_powerupType = powerupTypeEnum.SLOW_ENEMIES;
      break;

    case 3:
      temp_powerupType = powerupTypeEnum.STOP_ENEMIES;
      break;

    case 4:
      temp_powerupType = powerupTypeEnum.GROW_BIG;
      break;

    case 5:
      temp_powerupType = powerupTypeEnum.GROW_SMALL;
      break;

  }

  spawnPowerup(temp_powerupType);

  /* next spawn between 20 and 25 seconds from now */
  var nextTimeToSpawn = Math.floor(Math.random() * 6) + 20;

  window.setTimeout(function () {
    randomlySpawnPowerup();
  }, nextTimeToSpawn * 1000);

}

function powerupPhysics(key) {

  var powerup = powerups[key];

  /* rotate the coin if it is on the ground */
  if (powerup.state == coinStateEnum.NORMAL) {

    powerup.rotation.z += 0.1;

  }

  else if (powerup.state == coinStateEnum.IN_THE_AIR) {

    /* coins only move in the up-down direction */
    powerup.velocity.z -= gravity * dt;

    var newPosition = powerup.position.z + powerup.velocity.z * dt;

    if (newPosition < coinRadius) {

      /* no more bouncing */
      if (Math.abs(powerup.velocity.z) < ballInAirTolerance)  {

        powerup.position.z = coinRadius;
        powerup.velocity.z = 0;
        powerup.state = coinStateEnum.NORMAL;

      }

      /* the powerup lives to see another bounce! */
      else {

        powerup.velocity.z *= -1 * groundRestitutionCoefficient;
        powerup.state = coinStateEnum.IN_THE_AIR;

      }

    }

    else {

      powerup.position.z = newPosition;

    }

  }

  /* check for a powerup pickup */
  var xx = ball.position.x - powerup.position.x;
  var yy = ball.position.y - powerup.position.y;
  var zz = ball.position.z - powerup.position.z;

  var min_dist = ballRadius + coinThickness + coinPickupTolerance;
  
  if (xx*xx + yy*yy + zz*zz < min_dist*min_dist && !powerup.pickedUp) {
    powerup.pickedUp = true;
    powerupCollected(powerup);
  }

}

function powerupCollected(powerup) {

  window.clearTimeout(powerup.timeout);

  var randomFloat = Math.random();

  if (randomFloat < 0.33) {
    lotsOfCoins();
  } else if (randomFloat > 0.33 && randomFloat < 0.66) {
    activateBoostMode();
  } else {
    slowDownEnemies();
  }

  scene.remove(powerup);
  delete powerup;

  return;

  if (powerup.type == powerupTypeEnum.BOOST) {
    activateBoostMode();
  }
  else if (powerup.type == powerupTypeEnum.COINS) {
    lotsOfCoins();
  }
  else if (powerup.type == powerupTypeEnum.SLOW_ENEMIES) {
    activateBoostMode();
  }
  else if (powerup.type == powerupTypeEnum.STOP_ENEMIES) {
    activateBoostMode();
  }
  else if (powerup.type == powerupTypeEnum.GROW_BIG) {
    lotsOfCoins();
  }
  else if (powerup.type == powerupTypeEnum.GROW_SMALL) {
    lotsOfCoins();
  }

}

/* activate boost mode! */
function activateBoostMode() {

  if (!boostModeOn &&
       boostModeAvailable)
  {
    boostModeOn = true;
    boostModeAvailable = false;
    boostModeTimeLeft = boostModeDuration;
    ballMaxVelocity = 10;
    ballMaxAcceleration = 10;

    /* start showing a countdown */
    boostCountdownId = window.setInterval(boostCountdown, 1000);

    /* boost mode dies out after some time */
    // setTimeout(function () {
    window.setTimeout(function () {
      boostModeOn = false;
      boostModeTimeLeft = boostModeDuration;
      window.clearInterval(boostCountdownId);
    }, boostModeDuration);

  }

}

/* lots and lots of coins! */
function lotsOfCoins() {
  for (var i = 0 ; i < 20 ; i++) {
    spawnCoin();
  }
}

/* everyone except me, slow down! */
function slowDownEnemies() {

  enemyDisplacementMultiplier = 0.2;

  window.setTimeout(function () {
    enemyDisplacementMultiplier = 1;
  }, 10000);

}

var reset = {

  allPowerups: function () {

    this.boostMode();
    this.slowEnemies();

  },

  boostMode: function () {

    /* boost mode available again */
    boostModeOn = false;
    boostModeAvailable = true;
    boostModeTimeLeft = boostModeDuration;

    if (boostCountdownId) {
      clearTimeout(boostCountdownId);
    }

  },

  slowEnemies: function () {
    enemyDisplacementMultiplier = 1;
  },

  game: function(gamepadSnapshot) {

    lastTimeRunCalled = undefined;

    /* game no longer over! */
    gameOptions.gameOver = false;

    /* update the highscore */
    updateHighScore(100 * coinsCollected);

    /* clear messages from the screen */
    document.getElementById("newBallCountdownDisplay").innerHTML = "";
    document.getElementById("pressAnyKeyMessage").innerHTML = "";

    /* reset time alive */
    timeAliveInSec = 0;

    /* highscore has been updated, now we can reset scoring */
    coinsCollected = 0;
    scoreDisplaySpan.innerHTML = 0;

    /* reset number of lives left */
    livesLeft = 5;
    for (var i = 1 ; i <= livesLeft ; i++) {
      var lifeDisplayDiv = document.getElementById("life" + i);
      lifeDisplayDiv.style.visibility = "visible";
    }

    /* remove all coins, enemies and powerups */
    deleteAll(enemies);
    deleteAll(coins);
    deleteAll(powerups);

    /* reposition the ball */
    ball.position.x = 0;
    ball.position.y = 0;
    ball.position.z = ballRadius + 200;

    /* make sure it falls straight down */
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    ball.velocity.z = 0;

    /* reset all powerups */
    reset.allPowerups();

    /* call the run function again! */
    run(gamepadSnapshot);

  }

}

////////////////////////////////////////////////////////////////////////////////

function deleteAll(things) {
  for (var key in things) {
    scene.remove(things[key]);
    delete things[key];
  }
}

////////////////////////////////////////////////////////////////////////////////

function spawnFragments(spawnPos) {

  /* spawn a bunch of miniballs and make them explode away from the
   * center. Their velocity vectors should be from the center and
   * through a radius of the circle. The radii for each velocity
   * vector should be equiangular with their neighbours
   */
  var multiplier = 2 * Math.PI / numExplosionFragments;
  for (var i = 0 ; i < numExplosionFragments ; i++) {
    var angle = multiplier * i;
    var velX = 30 * Math.cos(angle);
    var velY = 30 * Math.sin(angle);
    var fragmentVel = { x: velX, y: velY, z: 10 };
    // var fragmentVel = { x: 1, y: 1, z: 0 };
    var explosionFragment = setupBall(spawnPos,
                                      fragmentVel,
                                      ballRedMaterial,
                                      fragmentRadius,
                                      fragmentGeometry);
    explosionFragments.push(explosionFragment);
    explosionFragment.acceleration = { x: 0, y: 0, z: 0 };
    explosionFragment.state = ballStateEnum.NORMAL;
    scene.add(explosionFragment);
  }
  /* set a timeout to clear the fragments after a while */
  setTimeout(clearFragments, fragmentLifetime);
}

function clearFragments() {
  /* clean up the first numExplosionFragments fragments from the array
   * of explosion fragments */
  for (var i = 0 ; i < numExplosionFragments ; i++) {
    scene.remove(explosionFragments[i]);
  }
  explosionFragments.splice(0, numExplosionFragments);
}

////////////////////////////////////////////////////////////////////////////////

function collisionBetween(b1, b2) {
  var xx = b1.position.x - b2.position.x;
  var yy = b1.position.y - b2.position.y;
  var zz = b1.position.z - b2.position.z;

  var min_distance = b1.radius + b2.radius;

  return xx*xx + yy*yy + zz*zz <= min_distance*min_distance;
}

function enemyPhysics(key) {
  var currEnemy = enemies[key];

  var xx = currEnemy.position.x;
  var yy = currEnemy.position.y;

  /* draw indicator */
  // todo
  // if (offscreenCheck.isOffscreen(currEnemy, camera)) {
  //   var intersectionPoint = offscreenCheck.getOffscreenPoint(ball, currEnemy, camera);
  //   var positionDifference = {
  //     x: ball.position.x - currEnemy.position.x,
  //     y: ball.position.y - currEnemy.position.y,
  //     z: ball.position.z - currEnemy.position.z
  //   };
  //   var closerPoint = {
  //     x: intersectionPoint.x + 0.05 * positionDifference,
  //     y: intersectionPoint.y + 0.05 * positionDifference,
  //     z: intersectionPoint.z + 0.05 * positionDifference
  //   }
  //   /* add an indicator if it does not already exist */
  //   if (typeof currEnemy.indicator == 'undefined') {
  //     console.log("adding indicator");
  //     console.log(currEnemy.id + " int point " + intersectionPoint.x + " " + intersectionPoint.y + " " + intersectionPoint.z);
  //     var origin = new THREE.Vector3(0,0,0);
  //     currEnemy.indicator = new indicator();
  //     currEnemy.indicator.addToScene(origin, scene);
  //   }
  // }

  if ((xx*xx + yy*yy > bounds + boundsTolerance)) {

    if (currEnemy.removeTimeout) { clearTimeout(currEnemy.removeTimeout); }

    scene.remove(currEnemy);
    delete enemies[key];
    // delete indicators[key];

  }
  else {

    /* check for a collision */
    if (collisionBetween(currEnemy, ball)) {
      
      sounds.explosion.play();
      youDied(deathCauseEnum.ENEMY_CONTACT);

    }

    /* move the enemy */ 
    currEnemy.velocity.x += 0.00065 * enemyDisplacementMultiplier * (ball.position.x - currEnemy.position.x);
    currEnemy.velocity.y += 0.00065 * enemyDisplacementMultiplier * (ball.position.y - currEnemy.position.y);

    currEnemy.position.x += currEnemy.velocity.x * dt;
    currEnemy.position.y += currEnemy.velocity.y * dt;

  }

}

function updateHighScore(scr) {

  var localStorageHighScore = localStorage.dodgeBombHighScore;
  if (typeof(localStorageHighScore) == 'undefined' || localStorageHighScore < scr) {

    localStorage.dodgeBombHighScore = scr;
    console.log("updated high score to " + scr);

  }

}