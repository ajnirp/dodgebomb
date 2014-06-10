// var currentControls = "keyboard";
var currentControls = "gamepad";

function upInput() {
	if (currentControls === "keyboard") {
		return Key.isDown(Key.W);
	} else if (currentControls === "gamepad") {
		return buttonPressed(gamepad.buttons[12]);
	}
}

function downInput() {
	if (currentControls === "keyboard") {
		return Key.isDown(Key.S);
	} else if (currentControls === "gamepad") {
		return buttonPressed(gamepad.buttons[13]);
	}
}

function rightInput() {
	if (currentControls === "keyboard") {
		return Key.isDown(Key.D);
	} else if (currentControls === "gamepad") {
		return buttonPressed(gamepad.buttons[15]);
	}
}

function leftInput() {
	if (currentControls === "keyboard") {
		return Key.isDown(Key.A);
	} else if (currentControls === "gamepad") {
		return buttonPressed(gamepad.buttons[14]);
	}
}

function ballMovement() {
    // if (currentControls === "keyboard") {
    //     if (Key.isDown(Key.W)) {
    //         ball.acceleration.y = ball.maxAcceleration;
    //     } else if (Key.isDown(Key.S)) {
    //         ball.acceleration.y = -ball.maxAcceleration;
    //     }

    //     if (Key.isDown(Key.A)) {
    //         ball.acceleration.x = -ball.maxAcceleration;
    //     } else if (Key.isDown(Key.D)) {
    //         ball.acceleration.x = ball.maxAcceleration;
    //     }

    //     if (Key.isDown(Key.Q)) {
    //         ball.velocity = { x: 0, y: 0, z: 0 };
    //         ball.acceleration = { x: 0, y: 0, z: 0 };
    //     }

    //     if (Key.isDown(Key.SPACE)) {
    //         if (Math.abs(ball.position.z - ballRadius) < jumpTolerance) {
    //             ball.velocity.z = 10;
    //         }
    //     }

    //     if (noKeyPressed()) {
    //         /* no acceleration unless a key is pressed */
    //         ball.acceleration.x = 0;
    //         ball.acceleration.y = 0;
    //     }
    // }
    if (upInput()) {
        ball.acceleration.y = ball.maxAcceleration;
    } else if (downInput()) {
        ball.acceleration.y = -ball.maxAcceleration;
    }

    if (leftInput()) {
        ball.acceleration.x = -ball.maxAcceleration;
    } else if (rightInput()) {
        ball.acceleration.x = ball.maxAcceleration;
    }

    if (Key.isDown(Key.Q)) {
        // scene.remove(ball);
        ball.velocity = { x: 0, y: 0, z: 0 };
        ball.acceleration = { x: 0, y: 0, z: 0 };
    }

    if (Key.isDown(Key.SPACE)) {
        if (Math.abs(ball.position.z - ballRadius) < jumpTolerance) {
            ball.velocity.z = 10;
        }
    }
}