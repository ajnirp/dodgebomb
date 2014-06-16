function spawnFragments(spawnPos) {
  /* spawn a bunch of miniballs and make them explode away from the
   * center. Their velocity vectors should be from the center and
   * through a radius of the circle. The radii for each velocity
   * vector should be equiangular with their neighbours
   */
  var multiplier = 2 * Math.PI / numExplosionFragments;
  for (var i = 0 ; i < numExplosionFragments ; i++) {
    var angle = multiplier * i;
    var fragmentVel = { x: 5 * Math.cos(angle),
                        y: 5 * Math.sin(angle),
                        z: 5 };
    // var fragmentVel = { x: 2, y: 3, z: 0 };
    var explosionFragment = setupBall(spawnPos,
                                      fragmentVel,
                                      fragmentMaterial,
                                      3);
    explosionFragment.state = ballStateEnum.NORMAL;
    explosionFragments.push(explosionFragment);
    scene.add(explosionFragment);
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