class Player {
	constructor(x, y, color, username) {
		this.username = username;
		this.color = color;
		this.x = x;
		this.y = y;
		this.speed = 10; // get this from backend in the feature...
	}

	draw() {
		ctx.font = "12px sans-serif";
		ctx.fillStyle = "white";
		ctx.fillText(this.username, this.x - 60, this.y + 30);
		ctx.save();

		ctx.beginPath();
		ctx.arc(this.x, this.y, 20, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();

		// ctx.beginPath();
		// ctx.moveTo(this.x + 50, this.y);
		// ctx.lineTo(this.x + 50, this.y - 50);
		// ctx.lineTo(this.x + 70, this.y);
		// ctx.lineTo(this.x + 50, this.y);
		// ctx.closePath();
		// ctx.fill();

		ctx.arc(this.x, this.y, 20, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}
}
