/* http://buildnewgames.com/webgl-threejs/ */
/* http://learningthreejs.com/blog/2012/01/20/casting-shadows/ */

var renderer, scene, camera, spotLight;
var spotLights = new Array(8);

var fieldWidth = 400, fieldHeight = 200;

var ball;
var score;

function setup() {
	score = 0;
	createScene();
	draw();
}

function createScene() {
	var WIDTH = 640, HEIGHT = 480;
	var VIEW_ANGLE = 50, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;

	var container = document.getElementById("gameCanvas");

	renderer = new THREE.WebGLRenderer();
    scene = new THREE.Scene();

	/* camera */
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.z = 200;
    camera.position.y = -400;
    camera.rotation.x = 1.1;
	scene.add(camera);

    renderer.setSize(WIDTH, HEIGHT);

    container.appendChild(renderer.domElement);

    /* marble ball */
    var ballRadius = 10, segments = 32, rings = 32;
    var ballGeometry = new THREE.SphereGeometry(ballRadius, segments, rings);
    // var ballMaterial = new THREE.MeshPhongMaterial({  color: 0xff0000, transparent: true, opacity: 0.8 });
    var ballMaterial = new THREE.MeshPhongMaterial({  color: 0xff0000 });

    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.z = ballRadius;
    ball.position.x = 0;
    ball.castShadow = true;
    ball.acceleration = { x: 0, y: 0 };
    ball.velocity = { x: 0, y: 0 };
    ball.maxAcceleration = 2.5;
    ball.maxVelocity = 5;

    scene.add(ball);

    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 0, 170);
    spotLight.intensity = .6;
    spotLight.angle = Math.PI / 2;
    spotLight.castShadow = true;
    spotLight.shadowCameraVisible = false;
    spotLight.shadowDarkness = 0.1;
    scene.add(spotLight);

    scene.add(new THREE.AmbientLight(0x101010));

    // var spotLights = new Array(8);
    for (var i = 0; i <= 8; i++) {
        spotLights[i] = new THREE.SpotLight(0xF7F5BC);
        spotLights[i].intensity = .2;
        // spotLights[i].distance = 100;
        spotLights[i].position.set(200 * Math.sin(i * Math.PI / 4),
                                200 * Math.cos(i * Math.PI / 4),
                                100);
        spotLights[i].castShadow = true;
        spotLights[i].shadowDarkness = 0.1;

        scene.add(spotLights[i]);
    };


    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    /* plane */
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x51A8F5 });

    // var planeWidth = fieldWidth, planeHeight = fieldHeight, planeQuality = 10;
    // var plane = new THREE.Mesh(
    //  new THREE.PlaneGeometry(planeWidth,
    //                          planeHeight,
    //                          planeQuality,
    //                          planeQuality),
    //  planeMaterial);
    var plane = new THREE.Mesh(new THREE.CircleGeometry(200, 32), planeMaterial);

    scene.add(plane);
    plane.receiveShadow = true;
    // console.log(ball.position);
    // console.log(plane.position);
    // console.log(spotLights[1].position);
}

function draw() {
    renderer.render(scene, camera);
    requestAnimationFrame(draw);

    ballPhysics();
    ballMovement();
}

function ballPhysics() {
    var dt = 0.25;
    // ball.position.x += ball.velocity.x*dt + 0.5*ball.acceleration.x*dt*dt;
    // ball.position.y += ball.velocity.y*dt + 0.5*ball.acceleration.y*dt*dt;

    ball.velocity.x += ball.acceleration.x * dt;
    if (ball.velocity.x > ball.maxVelocity) { ball.velocity.x = ball.maxVelocity; }
    if (ball.velocity.x < -ball.maxVelocity) { ball.velocity.x = -ball.maxVelocity; }
    ball.velocity.y += ball.acceleration.y * dt;
    if (ball.velocity.y > ball.maxVelocity) { ball.velocity.y = ball.maxVelocity; }
    if (ball.velocity.y < -ball.maxVelocity) { ball.velocity.y = -ball.maxVelocity; }

    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;

    var xx = ball.position.x;
    var yy = ball.position.y;

    // if (xx*xx + yy*yy >= 40000) { ball.acceleration.x =  }

    console.log(ball.position);
    console.log(ball.velocity);
    console.log(ball.acceleration);
    console.log("...");
}

function ballMovement() {
    if (Key.isDown(Key.W)) {
        ball.acceleration.y = ball.maxAcceleration;
    } else if (Key.isDown(Key.S)) {
        ball.acceleration.y = -ball.maxAcceleration;
    } else if (Key.isDown(Key.A)) {
        ball.acceleration.x = -ball.maxAcceleration;
    } else if (Key.isDown(Key.D)) {
        ball.acceleration.x = ball.maxAcceleration;
    }
}