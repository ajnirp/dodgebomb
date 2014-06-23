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

function enemyPhysics(key) {
  var currEnemy = enemies[key];

  var xx = currEnemy.position.x;
  var yy = currEnemy.position.y;

  /* draw indicator */
  // todo
  // if (offscreenCheck.isOffscreen(currEnemy, camera)) {
  //   var intersectionPoint = offscreenCheck.getOffscreenPoint(ball, currEnemy, camera);
  //   var positionDifference = {
  //     x: ball.position.x - currEnemy.position.x,
  //     y: ball.position.y - currEnemy.position.y,
  //     z: ball.position.z - currEnemy.position.z
  //   };
  //   var closerPoint = {
  //     x: intersectionPoint.x + 0.05 * positionDifference,
  //     y: intersectionPoint.y + 0.05 * positionDifference,
  //     z: intersectionPoint.z + 0.05 * positionDifference
  //   }
  //   /* add an indicator if it does not already exist */
  //   if (typeof currEnemy.indicator == 'undefined') {
  //     console.log("adding indicator");
  //     console.log(currEnemy.id + " int point " + intersectionPoint.x + " " + intersectionPoint.y + " " + intersectionPoint.z);
  //     var origin = new THREE.Vector3(0,0,0);
  //     currEnemy.indicator = new indicator();
  //     currEnemy.indicator.addToScene(origin, scene);
  //   }
  // }

  if ((xx*xx + yy*yy > bounds + boundsTolerance)) {
    if (currEnemy.removeTimeout) { clearTimeout(currEnemy.removeTimeout); }

    scene.remove(currEnemy);
    delete enemies[key];
    // delete indicators[key];
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

function collisionBetween(b1, b2) {
  var xx = b1.position.x - b2.position.x;
  var yy = b1.position.y - b2.position.y;
  var zz = b1.position.z - b2.position.z;

  var min_distance = b1.radius + b2.radius;

  return xx*xx + yy*yy + zz*zz <= min_distance*min_distance;
}