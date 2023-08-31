class Player {
	constructor(position, color, username) {
		this.username = username;
		this.position = position;
		this.color = color;
		this.direction = {
			x: 0,
			y: 0,
		};
		this.speed = 10; // get this from backend in the feature...
	}

	draw() {
		ctx.font = "12px sans-serif";
		ctx.fillStyle = "white";
		ctx.fillText(this.username, this.position.x - 50, this.position.y + 20);
		ctx.save();

		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, 20, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}
}
