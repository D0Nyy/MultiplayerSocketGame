import express, { Express, Request, Response } from "express";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "./types"
import { Server } from "socket.io"
import http from "http"
import dotenv from "dotenv";
import { IPlayer } from "./types/player";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const TAG = "server"
const port = process.env.PORT;
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

app.use(express.static("public"))
app.use(express.static(__dirname + '/public'))

app.get("/", (req: Request, res: Response) => {
    res.sendFile(__dirname + "/index.html")
})

//Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
const players: { [key: string]: IPlayer } = {}

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
        delete players[socket.id]
        console.log(players);
        io.emit("updatePlayers", players);
    });

    socket.on("keydown", ({ keycode, sequenceNumber }) => {
        players[socket.id].sequenceNumber = sequenceNumber;
        switch (keycode) {
            case "KeyW":
                players[socket.id].y -= 10
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
    })
})

setInterval(() => {
    io.emit("updatePlayers", players);
}, 15) // 1000/15 = 66.6FPS backend tick rate?

server.listen(port, () => {
    console.log(`[${TAG}]: Server is listening at port ${port}...`);
})
