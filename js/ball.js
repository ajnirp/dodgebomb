/* initialise a ball */
function setupBall(radius, ballColor, initialPos, initialVel) {
    var ballGeometry = new THREE.SphereGeometry(radius, 16, 16);
    var ballMaterial = new THREE.MeshPhongMaterial({  color: ballColor /*, transparent: true, opacity: 0.8*/ });
    b = new THREE.Mesh(ballGeometry, ballMaterial);
    b.castShadow = true;

    /* initialise position */
    if (typeof(initialPos) == 'undefined') {
        b.position = { x: 0, y: 0, z: radius };
    } else {
        b.position = initialPos;
    }

    /* initialise velocity */
    if (typeof(initialVel) == 'undefined') {
        b.velocity = { x: 0, y: 10, z: 0 };
    } else {
        b.velocity = initialVel;
    }

    return b;
}

/* place the ball a little above the center of the ground */
function resetBall() {
    ball.position = { x: 0, y: 0, z: ballRadius + 50 };
    ball.acceleration = { x: 0, y: 0 };
    ball.velocity = { x: 0, y: 0, z: 0 };
    ball.maxAcceleration = 4;
    ball.maxVelocity = 5;
    ball.inTheAir = true;
}

function ballMovement() {
    if (Key.isDown(Key.W)) {
        ball.acceleration.y = ball.maxAcceleration;
    } else if (Key.isDown(Key.S)) {
        ball.acceleration.y = -ball.maxAcceleration;
    }

    if (Key.isDown(Key.A)) {
        ball.acceleration.x = -ball.maxAcceleration;
    } else if (Key.isDown(Key.D)) {
        ball.acceleration.x = ball.maxAcceleration;
    }

    if (Key.isDown(Key.Q)) {
        ball.velocity = { x: 0, y: 0, z: 0 };
        ball.acceleration = { x: 0, y: 0, z: 0 };
    }

    if (Key.isDown(Key.SPACE)) {
        if (Math.abs(ball.position.z - ballRadius) < jumpTolerance) {
            ball.velocity.z = 10;
        }
    }

    if (noKeyPressed()) {
        /* no acceleration unless a key is pressed */
        ball.acceleration.x = 0;
        ball.acceleration.y = 0;
    }
}
function ballPhysics() {
    var dt = 0.5;

    if (ball.position.z > ballRadius) { ball.inTheAir = true; }

    /* apply friction */
    var x_acc_direction = Math.sign(ball.acceleration.x);
    var y_acc_direction = Math.sign(ball.acceleration.y);

    var x_friction = ball.velocity.x != 0 ? groundFriction : 0;
    var y_friction = ball.velocity.y != 0 ? groundFriction : 0;

    // if (Math.abs(x_friction) > Math.abs(ball.acceleration.x)) { x_friction = Math.sign(x_friction) * Math.abs(ball.acceleration.x); }
    // if (Math.abs(y_friction) > Math.abs(ball.acceleration.y)) { y_friction = Math.sign(y_friction) * Math.abs(ball.acceleration.y); }

    ball.acceleration.x -= x_acc_direction * x_friction;
    ball.acceleration.y -= y_acc_direction * y_friction;
    ball.acceleration.z = (ball.inTheAir ? gravity : 0);

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

    if (ball.position.z < ballRadius) {
        ball.position.z = ballRadius;
        if (Math.abs(ball.velocity.z) < ballInAirTolerance) {
            ball.inTheAir = false;
        } else {
            ball.inTheAir = true;
            ball.velocity.z *= -1 * groundRestitutionCoefficient;
        }
    }

    /* out of bounds check */
    if (outOfBounds(ball)) {
        resetBall();
    }
}

/* check if the ball b is outside the grounds */
function outOfBounds(b) {
    var xx = b.position.x;
    var yy = b.position.y;
    return xx*xx + yy*yy > bounds + boundsTolerance;
}

function noKeyPressed() {
    return !((Key.isDown(Key.W)) ||
             (Key.isDown(Key.A)) ||
             (Key.isDown(Key.S)) ||
             (Key.isDown(Key.D)) ||
             Key.isDown(Key.SPACE));
}