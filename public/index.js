"use strict";
/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// responsive key check
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
const keys = {
	w: { pressed: false },
	s: { pressed: false },
	d: { pressed: false },
	a: { pressed: false },
};
setInterval(() => {
	if (keys.w.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: 0, dy: -players[socket.id].speed });
		players[socket.id].position.y -= players[socket.id].speed;
		socket.emit("keydown", { keycode: "KeyW", sequenceNumber });
	}
	if (keys.s.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: 0, dy: players[socket.id].speed });
		players[socket.id].position.y += players[socket.id].speed;
		socket.emit("keydown", { keycode: "KeyS", sequenceNumber });
	}
	if (keys.d.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: players[socket.id].speed, dy: 0 });
		players[socket.id].position.x += players[socket.id].speed;
		socket.emit("keydown", { keycode: "KeyD", sequenceNumber });
	}
	if (keys.a.pressed) {
		sequenceNumber++;
		playerInputs.push({ sequenceNumber, dx: -players[socket.id].speed, dy: 0 });
		players[socket.id].position.x -= players[socket.id].speed;
		socket.emit("keydown", { keycode: "KeyA", sequenceNumber });
	}
}, 15);

const socket = io();
const players = {};
const playerInputs = [];
let sequenceNumber = 0;

socket.on("connect", () => {
	console.log("Connection successful...");
	startGame();
});

socket.on("updatePlayers", (backendPlayers) => {
	// Check if a player in the backend doesn't exist in the frontend
	for (const id in backendPlayers) {
		const backendPlayer = backendPlayers[id];
		// If player doesn't exist
		if (!players[id]) {
			players[id] = new Player(backendPlayer.position, backendPlayer.color, id);
		} else {
			// If player already exists update movement
			players[id].position = backendPlayer.position;

			// If player is us implement server reconciliation
			if (id !== socket.id) return;
			const lastBackendInputIndex = playerInputs.findIndex((input) => {
				return backendPlayer.sequenceNumber === input.sequenceNumber;
			});

			if (lastBackendInputIndex > -1) {
				playerInputs.splice(0, lastBackendInputIndex + 1);
			}

			playerInputs.forEach((input) => {
				players[id].position.x += input.dx;
				players[id].position.y += input.dy;
			});
		}
	}

	// Check if a player in the frontend doesn't exist in the backend
	for (const id in players) {
		if (!backendPlayers[id]) {
			delete players[id];
		}
	}
});

function startGame() {
	frame(0);
}

const game = {
	start: performance.now(),
	elapsed: 0,
	refreshRate: 10,
};

function frame(timestamp) {
	game.elapsed = timestamp - game.start;
	if (game.elapsed > game.refreshRate) {
		game.start = timestamp;
		//console.log(`${player.left} ${player.right}`);
		paint();
	}
	requestAnimationFrame(frame);
}

function paint() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (const id in players) {
		players[id].draw();
	}
}
