/* http://buildnewgames.com/webgl-threejs/ */
/* http://learningthreejs.com/blog/2012/01/20/casting-shadows/ */

/* load stats: https://github.com/mrdoob/stats.js/blob/master/examples/basic.html */
var stats = new Stats();
stats.setMode(1);
document.body.appendChild(stats.domElement);

var renderer, scene, camera, spotLight;
var groundRadius = 250;

/* camera constants */
var cameraElevation = 200,
    cameraSetBack = -400;

var fieldWidth = 400, fieldHeight = 200;

/* the humble protagonist of this game */
var ball;
var ballRadius = 10;

/* enemies! */
var enemies = new Array(0);

var bounds = groundRadius*groundRadius + ballRadius*ballRadius;
var boundsTolerance = 20000,
    jumpTolerance = 5,
    ballInAirTolerance = 0.5;

/* ambient light, needed for the super creepy flicker effect */
// var ambientLight = new THREE.AmbientLight(0x101010);

/* game stuff */
var score = 0;
var level = 1;
var enemySpawnFrequency = 3000; // msec
var ballAlive = true;

/* periodically spawn enemies */
// var intervalID = window.setInterval(function () {
//     var enemy = spawnEnemy();
//     enemies.push(enemy);
//     scene.add(enemy);
// }, enemySpawnFrequency);

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

function setup() {
	createScene();
	draw();
}

function createScene() {
    /* set up renderer and attach it to the relevant DOM element */
	var container = document.getElementById("gameCanvas");
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);

    /* initialise a new scene */
    scene = new THREE.Scene();

    /* camera */
    camera = setupCamera();
    scene.add(camera);

    /* marble ball */
    ball = setupBall(ballRadius, 'red', { x: 0, y: 0, z: ballRadius }, { x: 0, y: 0, z: 0 });
    newBall();
    scene.add(ball);

    /* central spotlight */
    spotLight = setupSpotLight();
    scene.add(spotLight);

    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    /* plane */
    var planeTexture = new THREE.ImageUtils.loadTexture('img/dirt.png');
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(10,10);
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x51A8F5 }); // old plane
    // var planeMaterial = new THREE.MeshLambertMaterial({ map: planeTexture, side: THREE.SingleSide });
    var plane = new THREE.Mesh(new THREE.CircleGeometry(groundRadius, 32), planeMaterial);

    scene.add(plane);
    plane.receiveShadow = true;
}

function draw() {
    renderer.render(scene, camera);
    requestAnimationFrame(draw);

    if (level > 1) {
        spotLightFlicker();
    }

    ballPhysics();
    enemyPhysics();

    spotLightFollow();
    cameraFollow();

    ballMovement();

    /* update stats */
    stats.update();
}

function youDied() {
    timeAliveInSec = 0;
    newBall();
}