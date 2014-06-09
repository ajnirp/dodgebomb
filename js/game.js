/* http://buildnewgames.com/webgl-threejs/ */
/* http://learningthreejs.com/blog/2012/01/20/casting-shadows/ */

var renderer, scene, camera, spotLight;
var spotLights = new Array(8);
var groundRadius = 250;

var fieldWidth = 400, fieldHeight = 200;

var ball, ballRadius;
// var score;
var groundFriction = 0.7,
    gravity = 1.5;

function setup() {
	// score = 0;
	createScene();
	draw();
}

function createScene() {
	var WIDTH = 640, 
        HEIGHT = 480;
	var VIEW_ANGLE = 50,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;

    /* set up renderer and attach it to the relevant DOM element */
	var container = document.getElementById("gameCanvas");
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);

    /* initialise a new scene */
    scene = new THREE.Scene();

    /* camera */
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.z = 200;
    camera.position.y = -400;
    camera.rotation.x = 1.1;
    scene.add(camera);

    /* marble ball */
    ballRadius = 10;
    var segments = 32, rings = 32;
    var ballGeometry = new THREE.SphereGeometry(ballRadius, segments, rings);
    var ballMaterial = new THREE.MeshPhongMaterial({  color: 0xff0000 /*, transparent: true, opacity: 0.8*/ });

    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.z = ballRadius;
    ball.position.x = 0;
    ball.castShadow = true;
    ball.acceleration = { x: 0, y: 0 };
    ball.velocity = { x: 0, y: 0, z: 0 };
    ball.maxAcceleration = 4;
    ball.maxVelocity = 5;
    ball.inTheAir = false;

    scene.add(ball);

    /* central spotlight */
    spotLight = new THREE.SpotLight(0xffffff);
    // spotLight.position.set(0, 0, 210);
    spotLight.position.set(0, 0, 200);
    // spotLight.position.set(0, 0, 500);
    spotLight.intensity = 1;
    spotLight.angle = Math.PI / 2;
    spotLight.castShadow = true;
    spotLight.shadowCameraVisible = false;
    spotLight.shadowDarkness = 1;
    scene.add(spotLight);

    /* ambient light */
    // scene.add(new THREE.AmbientLight(0x101010));

    /* eight spotlights placed at equal distances along the perimeter */
    // for (var i = 0; i <= 8; i++) {
    //     spotLights[i] = new THREE.SpotLight(0xF7F5BC);
    //     spotLights[i].intensity = .2;
    //     spotLights[i].position.set(groundRadius * Math.sin(i * Math.PI / 4),
    //                             groundRadius * Math.cos(i * Math.PI / 4),
    //                             100);
    //     spotLights[i].castShadow = true;
    //     spotLights[i].shadowDarkness = 0.1;

    //     scene.add(spotLights[i]);
    // };


    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    /* plane */
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x51A8F5 });
    var plane = new THREE.Mesh(new THREE.CircleGeometry(groundRadius, 32), planeMaterial);

    scene.add(plane);
    plane.receiveShadow = true;
}

function draw() {
    renderer.render(scene, camera);
    requestAnimationFrame(draw);

    ballPhysics();
    cameraPhysics();
    ballMovement();
}

function ballPhysics() {
    var dt = 0.25;

    if (ball.position.z > ballRadius) { ball.inTheAir = true; }

    /* apply friction */
    var x_acc_direction = Math.sign(ball.acceleration.x);
    var y_acc_direction = Math.sign(ball.acceleration.y);

    var x_friction = ball.velocity.x != 0 ? groundFriction : 0;
    var y_friction = ball.velocity.y != 0 ? groundFriction : 0;

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
        ball.inTheAir = false;
    }

    /* out of bounds check */
    checkBallOutOfBounds();
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
        // if (ball.velocity.z == 0) { ball.velocity.z = 10; }
        if (!ball.inTheAir) { ball.velocity.z = 10; }
    }

    if (noKeyPressed()) {
        /* no acceleration unless a key is pressed */
        ball.acceleration.x = 0;
        ball.acceleration.y = 0;
    }
}

function cameraPhysics() {
    // spotLight.position.x = ball.position.x;
    // spotLight.position.y = ball.position.y;

    /* spotlight position is fixed, but the spotlight focus follows the ball */
    spotLight.target.position.x = ball.position.x;
    spotLight.target.position.y = ball.position.y;

    // camera.position.x = 0.5 * ball.position.x;
    camera.position.y = -400 + 0.5 * ball.position.y;
    camera.rotation.y = - 0.003 * ball.position.x;
}

function noKeyPressed() {
    return !((Key.isDown(W)) ||
             (Key.isDown(A)) ||
             (Key.isDown(S)) ||
             (Key.isDown(D)) ||
             Key.isDown(SPACE));
}

function checkBallOutOfBounds() {
    var xx = ball.position.x;
    var yy = ball.position.y;

    /* tolerance = 10,000 */
    if (xx*xx + yy*yy > groundRadius*groundRadius + ballRadius*ballRadius + 10000) {
        resetBall();
    }
}

function resetBall() {
    ball.position = { x: 0, y: 0, z: ballRadius };
    ball.velocity = { x: 0, y: 0, z: 0 };
    ball.inTheAir = false;
}