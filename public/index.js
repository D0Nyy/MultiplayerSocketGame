"use strict";
/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const game = {
	start: performance.now(),
	elapsed: 0,
	refreshRate: 10,
};

function frame(timestamp) {
	game.elapsed = timestamp - game.start;
	if (game.elapsed > game.refreshRate) {
		game.start = timestamp;
		paint();
	}
	requestAnimationFrame(frame);
}

function paint() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Render ping
	ctx.font = "12px sans-serif";
	ctx.fillStyle = "lightgreen";
	ctx.fillText(`Ping: ${PING.toString()}ms`, 10, 15);
	ctx.save();

	// Render Players
	for (const id in players) {
		players[id].draw();
	}

	// Render Projectiles TODO add to backend
	for (let i = 0; i < projectiles.length; i++) {
		const projectile = projectiles[i];
		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2, false);
		ctx.fill();
	}
}

function startGame() {
	frame(0);
}

// responsive key check
const keys = {
	w: { pressed: false },
	s: { pressed: false },
	d: { pressed: false },
	a: { pressed: false },
};

document.addEventListener("keydown", (e) => {
	if (e.repeat) return;
	switch (e.code) {
		case "KeyW":
			keys.w.pressed = true;
			break;
		case "KeyS":
			keys.s.pressed = true;
			break;
		case "KeyD":
			keys.d.pressed = true;
			break;
		case "KeyA":
			keys.a.pressed = true;
			break;
	}
});
document.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "KeyW":
			keys.w.pressed = false;
			break;
		case "KeyS":
			keys.s.pressed = false;
			break;
		case "KeyD":
			keys.d.pressed = false;
			break;
		case "KeyA":
			keys.a.pressed = false;
			break;
	}
});

// Emit keydown event if key is pressed
setInterval(() => {
	if (keys.w.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: 0, dy: -players[socket.id].speed });
		players[socket.id].y -= players[socket.id].speed; // Immediately Move Player and fix it at updatePlayers
		socket.emit("keydown", { keycode: "KeyW", sequenceNumber }); // Emit Move Event
	}
	if (keys.s.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: 0, dy: players[socket.id].speed });
		players[socket.id].y += players[socket.id].speed;
		socket.emit("keydown", { keycode: "KeyS", sequenceNumber });
	}
	if (keys.d.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: players[socket.id].speed, dy: 0 });
		players[socket.id].x += players[socket.id].speed;
		socket.emit("keydown", { keycode: "KeyD", sequenceNumber });
	}
	if (keys.a.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: -players[socket.id].speed, dy: 0 });
		players[socket.id].x -= players[socket.id].speed;
		socket.emit("keydown", { keycode: "KeyA", sequenceNumber });
	}
}, 15);

// Track mouse movement
let mouseX = 0;
let mouseY = 0;
canvas.onmousemove = (event) => {
	const canvasRect = canvas.getBoundingClientRect(); // get canvas position
	mouseX = Math.ceil(event.clientX - canvasRect.x);
	mouseY = Math.ceil(event.clientY - canvasRect.y);
};

const projectiles = [];
canvas.onmousedown = (event) => {
	console.log(`Shoot: X:${mouseX} Y:${mouseY}`);
	projectiles.push({ x: mouseX, y: mouseY });
};
//----------------------//

const socket = io({
	query: {
		username: prompt("Enter your SKIBIDI nickname:"),
	},
});
const players = {};
const playerInputs = [];
let sequenceNumber = 0;
let PING = 15;

socket.on("connect", () => {
	console.log("Connection successful...");
	startGame();
});

// Server delay calculation
setInterval(() => {
	const start = Date.now();
	socket.emit("ping", () => {
		const duration = Date.now() - start;
		PING = duration;
	});
}, 1000);

socket.on("updatePlayers", (backendPlayers) => {
	// Check if a player in the backend doesn't exist in the frontend
	for (const id in backendPlayers) {
		const backendPlayer = backendPlayers[id];

		// If player doesn't exist create player
		if (!players[id]) {
			players[id] = new Player(
				backendPlayer.x,
				backendPlayer.y,
				backendPlayer.color,
				backendPlayer.username
			);
		} else {
			// If player already exists update movement
			if (id === socket.id) {
				// If player is us implement server reconciliation
				players[id].x = backendPlayer.x;
				players[id].y = backendPlayer.y;

				const lastBackendInputIndex = playerInputs.findIndex((input) => {
					return backendPlayer.sequenceNumber === input.sequenceNumber;
				});

				if (lastBackendInputIndex > -1) {
					playerInputs.splice(0, lastBackendInputIndex + 1);
					playerInputs.forEach((input) => {
						players[id].x += input.dx;
						players[id].y += input.dy;
					});
				}
			} else {
				gsap.to(players[id], {
					x: backendPlayer.x,
					y: backendPlayer.y,
					duration: PING / 1000.0, // change to user ping value
					ease: "linear",
				});
			}
		}
	}

	// Check if a player in the frontend doesn't exist in the backend
	for (const id in players) {
		if (!backendPlayers[id]) {
			delete players[id];
		}
	}
});
