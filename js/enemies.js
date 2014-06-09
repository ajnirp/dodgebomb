function spawnEnemy(speed) {
	var angle = Math.random() * 2 * Math.PI;

	/* enemies spawn slightly outside the perimeter of the ground */
	var spawnX = 1.1 * groundRadius * Math.cos(angle),
	    spawnY = 1.1 * groundRadius * Math.sin(angle);
	var spawnPoint = { x: spawnX, y: spawnY, z: ballRadius };

	/* set spawn speed
	 * as the level increases, the enemies get faster */
	if (typeof(speed) == 'undefined') {
		speed = 4;
	}

	var velX = -spawnX,
	    velY = -spawnY,
	    velZ = 0;

	var invSqrtXY = Math.pow(velX*velX + velY*velY, 0.5);
	velX *= speed / invSqrtXY;
	velY *= speed / invSqrtXY;

	var spawnVel = { x: velX, y: velY, z: velZ };

	return setupBall(ballRadius, 'grey', spawnPoint, spawnVel);
}

function enemyPhysics() {
    var dt = 0.5;

	var toRemove = [];
	var numEnemies = enemies.length;
	for (var i = 0 ; i < numEnemies ; i++) {
		var currEnemy = enemies[i];
		if (outOfBounds(currEnemy) || (currEnemy.velocity.x === 0 && currEnemy.velocity.y === 0)) {
			scene.remove(currEnemy);
			toRemove.push(i);
		} else {
			currEnemy.velocity.x += 0.001 * (ball.position.x - currEnemy.position.x);
			currEnemy.velocity.y += 0.001 * (ball.position.y - currEnemy.position.y);

			currEnemy.position.x += currEnemy.velocity.x * dt;
		    currEnemy.position.y += currEnemy.velocity.y * dt;
		}
	}

	/* remove the marked enemies */
	for (var i = 0 ; i < toRemove.length ; i++) {
		enemies.splice(i, 1);
	};

	console.log(enemies.length);
}