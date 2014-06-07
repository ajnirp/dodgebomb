/* http://buildnewgames.com/webgl-threejs/ */

var renderer, scene, camera, spotLight;

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
	camera.position.z = 420;
	scene.add(camera);

    renderer.setSize(WIDTH, HEIGHT);

    container.appendChild(renderer.domElement);

    /* marble ball */
    var radius = 10, segments = 16, rings = 16;
    var ballGeometry = new THREE.SphereGeometry(radius, segments, rings);
    var ballMaterial = new THREE.MeshPhongMaterial({  color: 0xff0000, transparent: true, opacity: 1 });

    ball = new THREE.Mesh(ballGeometry, ballMaterial);

    scene.add(ball);

	/* point light */
	// var pointLight = new THREE.PointLight(0xffffff, 0.5);

	// pointLight.position.x = 10;
	// pointLight.position.y = 110;
	// pointLight.position.z = 30;

	// scene.add(pointLight);

    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    renderer.shadowMapEnabled = true;

	/* plane */
	var planeWidth = fieldWidth, planeHeight = fieldHeight, planeQuality = 10;

    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x51A8F5 });
	// var plane = new THREE.Mesh(
	// 	new THREE.PlaneGeometry(planeWidth,
	// 		                    planeHeight,
	// 		                    planeQuality,
	// 		                    planeQuality),
	// 	planeMaterial);
    var plane = new THREE.Mesh(new THREE.CircleGeometry(200, 32), planeMaterial);
    plane.position.z = -51;

    scene.add(plane);
    plane.receiveShadow = true;

    /* table */
    var tableMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
    // var table = new THREE.Mesh(
    //     new THREE.CubeGeometry(planeWidth * 1.05,
    //                            planeHeight * 1.03,
    //                            100,
    //                            planeQuality,
    //                            planeQuality,
    //                            1),
    //     tableMaterial);
    var table = new THREE.Mesh(new THREE.CircleGeometry(30, 32), tableMaterial);
    table.position.z = -51;
    scene.add(table);
    table.receiveShadow = true;
}

function draw() {
	renderer.render(scene, camera);
	// requestAnimationFrame(draw);
	// ballPhysics();
}

function ballPhysics() {
}

function cameraPhysics() {
    spotLight.position.x = ball.position.x * 2;
    spotLight.position.y = ball.position.y * 2;
    
    camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
    camera.rotation.y = -60 * Math.PI/180;
    camera.rotation.z = -90 * Math.PI/180;
}