import { WebSocketServer } from "ws";
import addonLoader from "./web.utils/addon.import.js";
const server = new WebSocketServer({
    port: 2567
});
const loader = new addonLoader();
let addonsRead = false;
server.on("connection", (socket) => {
    socket.on("message", async (message) => {
        const req = JSON.parse(message.toString());
        console.log(`received request for ${req.request}`);
        if (req.request === "readAddons") {
            if (!addonsRead) {
                console.log("reading addons");
                await loader.readAddons();
                addonsRead = true;
            }
            console.log(`sending response for ${req.request}, ${loader.addons}`);
            socket.send(JSON.stringify({ response: "readAddons", addons: loader.addons }));
        }
    });
});
