/* initialise a ball */
function setupBall(initialPos, initialVel, material, temp_radius) {
  var ballMaterial = material;

  var b = new THREE.Mesh(ballGeometry, ballMaterial);

  if (typeof(temp_radius) == 'undefined') {
    b.radius = ballRadius;
  } else {
    b.radius = temp_radius;
  }

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

function ballPhysics(b) {
  var dt = 0.5;

  if (b.position.z > ballRadius) { b.state = ballStateEnum.IN_THE_AIR; }

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

  /* new positions */
  b.position.x += b.velocity.x * dt;
  b.position.y += b.velocity.y * dt;
  b.position.z += b.velocity.z * dt;

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

function fallOffEdgeAnimation() {
  ball.state = ballStateEnum.FALLING_OFF;
}