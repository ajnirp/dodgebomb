function spawnFragments(spawnPos) {
  /* spawn a bunch of miniballs and make them explode away from the
   * center. Their velocity vectors should be from the center and
   * through a radius of the circle. The radii for each velocity
   * vector should be equiangular with their neighbours
   */
  var multiplier = 2 * Math.PI / numExplosionFragments;
  for (var i = 0 ; i < numExplosionFragments ; i++) {
    var angle = multiplier * i;
    var velX = 10 * Math.cos(angle);
    var velY = 10 * Math.sin(angle);
    var fragmentVel = { x: Math.random() * 5,
                        y: Math.random() * 5,
                        z: 5 };
    var explosionFragment = setupBall(spawnPos,
                                      fragmentVel,
                                      fragmentMaterial,
                                      fragmentRadius,
                                      fragmentGeometry);
    explosionFragments.push(explosionFragment);
    explosionFragment.acceleration = { x: 0, y: 0, z: 0 };
    explosionFragment.state = ballStateEnum.NORMAL;
    scene.add(explosionFragment);

    // console.log("111");
    // console.log("position " + explosionFragment.position.x);
    // console.log("velocity " + explosionFragment.velocity.x);
    // console.log("acceleration " + explosionFragment.acceleration.x);
    // console.log("maxVelocity " + explosionFragment.maxVelocity);
    // console.log("maxAcceleration " + explosionFragment.maxAcceleration);
    // console.log("222");
  }
  /* set a timeout to clear the fragments after a while */
  window.setTimeout(clearFragments, fragmentLifetime);
}

function clearFragments() {
  /* clean up the first numExplosionFragments fragments from the array
   * of explosion fragments */
  for (var i = 0 ; i < numExplosionFragments ; i++) {
    scene.remove(explosionFragments[i]);
  }
  explosionFragments.splice(0, numExplosionFragments);
}