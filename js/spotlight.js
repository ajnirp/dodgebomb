function setupSpotLight(temp_spotLightHeight) {
	var temp_spotLight;
	temp_spotLight = new THREE.SpotLight(0xffffff);
    temp_spotLight.position.set(0, 0, temp_spotLightHeight);
    temp_spotLight.intensity = 1;
    temp_spotLight.angle = Math.PI / 2;
    temp_spotLight.castShadow = true;
    temp_spotLight.shadowCameraVisible = false;
    // temp_spotLight.shadowDarkness = 0.5;
    return temp_spotLight;
}

/* spotlight position is fixed, but the spotlight focus follows the ball */
function spotLightFollow() {
    spotLight.target.position.x = ball.position.x;
    spotLight.target.position.y = ball.position.y;
}

/* completely unconvincingly creepy DOOM-style light flicker */
function spotLightFlicker() {
    if (Math.random() < 0.04) {
        spotLight.intensity = 1.4 - spotLight.intensity;
    }
}