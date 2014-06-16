/* Constants and globals */

/* timestep */
var dt = 0.5;

/* camera constants */
var cameraElevation = 250,
    cameraSetBack = -400;

/* spotlight */
var spotLightHeight = 600;

var ball; // this is not a constant, i should probably remove it :|
var ballRadius = 10, enemyRadius = 10, fragmentRadius = 3;

var enemyMaterial = new THREE.MeshPhongMaterial({ color: 'grey' });
var ballRedMaterial = new THREE.MeshPhongMaterial({ color: 'red' });
var fragmentMaterial = new THREE.MeshPhongMaterial({ color: 'orange' });
var ballGeometry = new THREE.SphereGeometry(ballRadius, 12, 6);
var fragmentGeometry = new THREE.SphereGeometry(fragmentRadius, 12, 6);

var enemyRadiusMin = ballRadius - 4;
var enemyRadiusMax = ballRadius + 4;
var enemyGeometry = [];
for (var i = enemyRadiusMin ; i <= enemyRadiusMax ; i++) {
	enemyGeometry.push(new THREE.SphereGeometry(i, 12, 6));
}

/* physics constants */
var groundFriction = 0.7,
    gravity = 1.5,
    groundRestitutionCoefficient = 0.5;

var boundsTolerance = 15000,
    jumpTolerance = 5,
    ballInAirTolerance = 0.5;

var groundRadius = 600;

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

/* number of explosion fragments generated when an enemy hits our hero.
 * note that while explosion fragments persist in the scene, another explosion
 * can simultaneously happen. So numExplosionFragments is not necessarily ===
 * explosionFragments.length, in fact it is a factor of it!
 */
var numExplosionFragments = 8;

/* explosion fragments */
var explosionFragments = [];

/* lifetime of an explosion fragment in milliseconds */
var fragmentLifetime = 7000;