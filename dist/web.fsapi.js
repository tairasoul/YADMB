import { WebSocketServer } from "ws";
import addonLoader from "./web.utils/addon.import.js";
import crypto from "crypto";
function createSha256(str) {
    const hash = crypto.createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
}
const server = new WebSocketServer({
    port: 2567
});
const loader = new addonLoader();
let addonsRead = false;
const hashTable = {};
server.on("connection", (socket) => {
    socket.on("message", async (message) => {
        const req = JSON.parse(message.toString());
        console.log(`received request for ${req.request}`);
        if (req.request === "readAddons") {
            if (!addonsRead) {
                console.log("reading addons");
                await loader.readAddons();
                for (const addon of loader.addons) {
                    for (const resolver of addon.resolvers) {
                        const av_hash = createSha256(`${addon.name}.${addon.version}.${resolver.name}.available`);
                        hashTable[av_hash] = resolver.available;
                        const wb_hash = createSha256(`${addon.name}.${addon.version}.${resolver.name}.webResolver`);
                        console.log(`${addon.name}.${addon.version}.${resolver.name}.webResolver`);
                        console.log(wb_hash);
                        hashTable[wb_hash] = resolver.webResolver;
                    }
                }
                addonsRead = true;
            }
            console.log(`sending response for ${req.request}, ${loader.addons}`);
            socket.send(JSON.stringify({ response: "readAddons", addons: loader.addons }));
        }
        else if (req.request === "hashExecute") {
            const corresponding = await hashTable[req.hash](...req.params);
            socket.send(JSON.stringify({ response: `hashExecute${req.hash}`, data: corresponding }));
        }
    });
});
