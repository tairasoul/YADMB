import { WebSocketServer } from "ws";
import addonLoader from "./web.utils/addon.import.js";
import crypto from "crypto";

function createSha256(str: string) {
    const hash = crypto.createHash("sha256");
    hash.update(str);
    return hash.digest().toString();
}

const server = new WebSocketServer({
    port: 2567
})

type webFsRequest = {
    request: "readAddons"
} | {
    request: "hashExecute",
    hash: string,
    params: string[]
}

const loader = new addonLoader();

let addonsRead = false;

const hashTable: { [hash: string]: any} = {};

server.on("connection", (socket) => {
    socket.on("message", async (message) => {
        const req: webFsRequest = JSON.parse(message.toString());
        console.log(`received request for ${req.request}`)
        if (req.request === "readAddons") {
            if (!addonsRead) {
                console.log("reading addons");
                await loader.readAddons();
                for (const addon of loader.addons) {
                    for (const resolver of addon.resolvers) {
                        const av_hash = createSha256(`${addon.name}.${resolver.name}.available`);
                        hashTable[av_hash] = resolver.available;
                        const wb_hash = createSha256(`${addon.name}.${resolver.name}.webResolver`);
                        hashTable[wb_hash] = resolver.webResolver;
                    }
                }
                addonsRead = true;
            }
            console.log(`sending response for ${req.request}, ${loader.addons}`)
            socket.send(JSON.stringify({response: "readAddons", addons: loader.addons}));
        }
        else if (req.request === "hashExecute") {
            const corresponding = hashTable[req.hash](...req.params);
            socket.send(JSON.stringify({response: `hashExecute${req.hash}`, data: corresponding}));
        }
    })
})