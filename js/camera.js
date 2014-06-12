/* initialise the camera */
function setupCamera() {
  var temp_camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  temp_camera.position.z = cameraElevation;
  temp_camera.position.y = cameraSetBack;
  temp_camera.rotation.x = 1.1;
  return temp_camera;
}