/* completely unconvincingly creepy DOOM-style light flicker */
function spotLightFlicker() {
    if (Math.random() < 0.04) {
        spotLight.intensity = 1.4 - spotLight.intensity;
    }
}