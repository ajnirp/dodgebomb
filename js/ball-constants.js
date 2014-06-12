var ball;
var ballRadius, enemyRadius;

ballRadius = enemyRadius = 10;

var enemyMaterial = new THREE.MeshPhongMaterial({  color: 'grey' /*, transparent: true, opacity: 0.8*/ });
var ballRedMaterial = new THREE.MeshPhongMaterial({  color: 'red' /*, transparent: true, opacity: 0.8*/ });
var ballGeometry = new THREE.SphereGeometry(ballRadius, 12, 6);

var boundsTolerance = 15000,
    jumpTolerance = 5,
    ballInAirTolerance = 0.5;