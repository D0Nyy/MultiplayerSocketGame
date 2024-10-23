"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const TAG = "server";
const port = process.env.PORT;
const io = new socket_io_1.Server(server);
app.use(express_1.default.static("public"));
app.use(express_1.default.static(__dirname + '/public'));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
//Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
const players = {};
io.on("connection", (socket) => {
    // Calculate server delay
    socket.on("ping", (callback) => {
        callback();
    });
    console.log(`[${TAG}]: User ${socket.id} connected...`);
    players[socket.id] = {
        x: 100,
        y: 100,
        color: "white",
        sequenceNumber: 0,
        username: socket.handshake.query.username
    };
    console.log(players);
    io.emit("updatePlayers", players);
    // On User Disconnected
    socket.on("disconnect", (reason) => {
        console.log(`[${TAG}]: User ${socket.id} disconnected [${reason}]`);
        delete players[socket.id];
        console.log(players);
        io.emit("updatePlayers", players);
    });
    socket.on("keydown", ({ keycode, sequenceNumber }) => {
        players[socket.id].sequenceNumber = sequenceNumber;
        switch (keycode) {
            case "KeyW":
                players[socket.id].y -= 10;
                break;
            case "KeyS":
                players[socket.id].y += 10;
                break;
            case "KeyD":
                players[socket.id].x += 10;
                break;
            case "KeyA":
                players[socket.id].x -= 10;
                break;
        }
        //io.emit("updatePlayers", players);  no good since it runs for EVERY key pressed for EVERY user
    });
});
setInterval(() => {
    io.emit("updatePlayers", players);
}, 15); // 1000/15 = 66.6FPS backend tick rate?
server.listen(port, () => {
    console.log(`[${TAG}]: Server is listening at port ${port}...`);
});
