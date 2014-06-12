/* setup the playing field */
function setupPlane() {
	var planeTexture = new THREE.ImageUtils.loadTexture('img/dirt.png');
	planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
	planeTexture.repeat.set(10,10);
	var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x51A8F5 }); // old plane
	// var planeMaterial = new THREE.MeshLambertMaterial({ map: planeTexture, side: THREE.SingleSide });
	return new THREE.Mesh(new THREE.CircleGeometry(groundRadius, 32), planeMaterial);
}