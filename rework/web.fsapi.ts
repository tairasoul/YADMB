import ws from "ws";
import fs from "fs";
import addonLoader from "./web.utils/addon.import";

const server = new ws.Server({
    port: 2567
})

type webFsRequest = {
    request: string
}

const loader = new addonLoader();

server.on("connection", (socket) => {
    socket.on("message", (message) => {
        const req: webFsRequest = JSON.parse(message.toString());
        if (req.request === "readAddons") {
            loader.readAddonsSync();
            socket.send(JSON.stringify({response: "readAddons", addons: loader.addons}));
        }
    })
})