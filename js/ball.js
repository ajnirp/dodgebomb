/* initialise a ball */
function setupBall(initialPos, initialVel, material) {
  var ballMaterial = material;

  b = new THREE.Mesh(ballGeometry, ballMaterial);
  b.radius = ballRadius;

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
}

function ballPhysics() {
  // console.log(ball.velocity);
  var dt = 0.5;

  if (ball.position.z > ballRadius) { ball.state = ballStateEnum.IN_THE_AIR; }

  var airborne = (ball.state == ballStateEnum.IN_THE_AIR) ||
                 (ball.state == ballStateEnum.FALLING_OFF);
  ball.acceleration.z = (airborne ? gravity : 0);

  /* apply friction */
  var x_acc_direction = THREE.Math.sign(ball.acceleration.x);
  var y_acc_direction = THREE.Math.sign(ball.acceleration.y);

  var x_friction = ball.velocity.x != 0 ? groundFriction : 0;
  var y_friction = ball.velocity.y != 0 ? groundFriction : 0;

  ball.acceleration.x -= x_acc_direction * x_friction;
  ball.acceleration.y -= y_acc_direction * y_friction;

  if (x_acc_direction * ball.acceleration.x < 0) { ball.acceleration.x = 0; }
  if (y_acc_direction * ball.acceleration.y < 0) { ball.acceleration.y = 0; }

  /* new velocities */
  ball.velocity.x += ball.acceleration.x * dt;
  ball.velocity.y += ball.acceleration.y * dt;
  ball.velocity.z -= ball.acceleration.z * dt;

  /* clamp velocities */
  if (ball.velocity.x > ball.maxVelocity) { ball.velocity.x = ball.maxVelocity; }
  if (ball.velocity.x < -ball.maxVelocity) { ball.velocity.x = -ball.maxVelocity; }
  if (ball.velocity.y > ball.maxVelocity) { ball.velocity.y = ball.maxVelocity; }
  if (ball.velocity.y < -ball.maxVelocity) { ball.velocity.y = -ball.maxVelocity; }

  /* new positions */
  ball.position.x += ball.velocity.x * dt;
  ball.position.y += ball.velocity.y * dt;
  ball.position.z += ball.velocity.z * dt;

  if (ball.state == ballStateEnum.FALLING_OFF) {
    if (ball.position.z < -80) {
      console.log("in here");
      ball.state = ballStateEnum.IN_THE_AIR;
      newBall();
    }
  }
  else {
    if (ball.position.z < ballRadius) {
      ball.position.z = ballRadius;
      if (Math.abs(ball.velocity.z) < ballInAirTolerance) {
        ball.state = ballStateEnum.NORMAL;
        ball.acceleration.z = 0;
        ball.velocity.z = 0;
      }
      else {
        ball.state = ballStateEnum.IN_THE_AIR;
        ball.velocity.z *= -1 * groundRestitutionCoefficient;
      }
    }

    /* out of bounds check */
    var xx = ball.position.x;
    var yy = ball.position.y;

    if (xx*xx + yy*yy > bounds/* + boundsTolerance*/)
    {
      youDied(deathCauseEnum.FELL_OFF_EDGE);
      // youDied(deathCauseEnum.ENEMY_CONTACT);
      // newBall();
    }
  }
}

function fallOffEdgeAnimation() {
  // console.log("falling off edge animation");
  ball.state = ballStateEnum.FALLING_OFF;
}