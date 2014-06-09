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