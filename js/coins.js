function setupCoin() {
  var temp_coin = new THREE.Mesh(coinGeometry, coinMaterial);
  temp_coin.timeout = undefined; /* the coin removal timeout */
  temp_coin.pickedUp = false;
  return temp_coin;
}

function spawnCoin() {
  var coin = setupCoin();

  /* in order to set the position of the coin, sample a
   * position uniformly on the face of a sphere as follows:
   * eps = Math.random()
   * theta = 2 * pi * eps
   * rad = sqrt(eps) * Rad
   * where rad = distance from centre
   *       theta = angle wrt horizontal radius
   *       Rad = radius of the sphere on which we are sampling
   */

  var rad = Math.pow(Math.random(), 0.5) * groundRadius;
  var theta = 2 * Math.PI * Math.random();

  var spawnX = rad * Math.cos(theta);
  var spawnY = rad * Math.sin(theta);

  coin.position.set(spawnX, spawnY, coinRadius);
  coin.id = coinId;
  scene.add(coin);
  coins[coinId++] = coin;

  coin.timeout = window.setTimeout(function () {
    scene.remove(coins[coin.id]);
    delete coins[coin.id];
  }, coinLifetime);

  return coin;
}