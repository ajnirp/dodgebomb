/* initialise the camera */
function setupCamera() {
	var cam = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    cam.position.z = cameraElevation;
    cam.position.y = cameraSetBack;
    cam.rotation.x = 1.1;
    return cam;
}

/* camera moves with ball (though not at the same pace) */
function cameraFollow() {
    camera.position.y = cameraSetBack + 0.5 * ball.position.y;
    camera.rotation.y = - 0.003 * ball.position.x;
}