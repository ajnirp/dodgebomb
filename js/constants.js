/* camera constants */
var cameraElevation = 200,
    cameraSetBack = -400;

var ball; // this is not a constant, i should probably remove it :|
var ballRadius, enemyRadius;

ballRadius = enemyRadius = 10;

var enemyMaterial = new THREE.MeshPhongMaterial({  color: 'grey' /*, transparent: true, opacity: 0.8*/ });
var ballRedMaterial = new THREE.MeshPhongMaterial({  color: 'red' /*, transparent: true, opacity: 0.8*/ });
var ballGeometry = new THREE.SphereGeometry(ballRadius, 12, 6);

/* physics constants */
var groundFriction = 0.7,
    gravity = 1.5,
    groundRestitutionCoefficient = 0.5;

var boundsTolerance = 15000,
    jumpTolerance = 5,
    ballInAirTolerance = 0.5;

var groundRadius = 400;

var bounds = groundRadius*groundRadius + ballRadius*ballRadius;

/* enums */
var deathCauseEnum = {
	ENEMY_CONTACT: 0,
	FELL_OFF_EDGE: 1
};

var ballStateEnum = {
	IN_THE_AIR: 0,
	FALLING_OFF: 1,
	EXPLODING: 2,
	NORMAL: 3
}

var enemySpawnFrequency = 3000; // msec
var enemyCleanupFrequency = 15000; // msec

var raycaster = new THREE.Raycaster();