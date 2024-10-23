import { Player } from "./player";

export interface ServerToClientEvents {
    noArg: () => void;
    updatePlayers: (players: { [key: string]: IPlayer }) => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
    keydown: ({ keycode: string, sequenceNumber: number }) => void;
    ping: (callback: () => void) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    position: [number, number];
    color: string
}