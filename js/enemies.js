function isOffscreen(enemy) {
  var origin = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
  var direction = new THREE.Vector3(enemy.position.x - camera.position.x, enemy.position.y - camera.position.y, enemy.position.z - camera.position.z);
  raycaster.set(origin, direction.normalize());
  var intersections = raycaster.intersectObject(enemy);
  return (intersections.length == 0);
}

// function spawnIndicator(enemy) {
//   var geometry = new THREE.Geometry();
//   var v1 = new THREE.Vector3();
//   var v2 = new THREE.Vector3();
//   var v3 = new THREE.Vector3();
//   geometry.vertices.push(v1);
//   geometry.vertices.push(v2);
//   geometry.vertices.push(v3);
//   var indicator = 
// }

function enemyPhysics() {
  var dt = 0.5;

  for (var key in enemies) {
    var currEnemy = enemies[key];

    var xx = currEnemy.position.x;
    var yy = currEnemy.position.y;

    if ((xx*xx + yy*yy > bounds + boundsTolerance) ||
      (currEnemy.velocity.x == 0 && currEnemy.velocity.y == 0)) {
      scene.remove(currEnemy);
      delete enemies[key];
      delete indicators[key];
    }
    else {
      /* check for a collision */
      if (collisionBetween(currEnemy, ball)) {
        youDied(deathCauseEnum.ENEMY_CONTACT);
      }

      /* move the enemy */
      currEnemy.velocity.x += 0.00065 * (ball.position.x - currEnemy.position.x);
      currEnemy.velocity.y += 0.00065 * (ball.position.y - currEnemy.position.y);

      currEnemy.position.x += currEnemy.velocity.x * dt;
      currEnemy.position.y += currEnemy.velocity.y * dt;
    }
  }
}

function collisionBetween(b1, b2) {
  var xx = b1.position.x - b2.position.x;
  var yy = b1.position.y - b2.position.y;
  var zz = b1.position.z - b2.position.z;

  var min_distance = b1.radius + b2.radius;

  return xx*xx + yy*yy + zz*zz <= min_distance*min_distance;
}