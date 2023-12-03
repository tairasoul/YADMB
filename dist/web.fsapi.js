import addonLoader from "./web.utils/addon.import.js";
import crypto from "crypto";
import { default as express } from "express";
import path from "path";
const app = express();
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
app.use('/code', express.static(path.join(__dirname, "../web-editor/code")));
app.get("/playlist-editor", (request, resp) => {
    resp.sendFile(path.join(__dirname, "../web-editor/playlist-editor.html"));
});
const loader = new addonLoader();
let addonsRead = false;
const hashTable = {};
app.get('/read-addons', async (request, response) => {
    console.log(`received request to read addons`);
    await loader.readAddons();
    if (!addonsRead) {
        console.log("reading addons");
        await loader.readAddons();
        for (const addon of loader.addons) {
            for (const resolver of addon.resolvers) {
                const av_hash = createSha256(`${addon.name}.${addon.version}.${resolver.name}.available`);
                hashTable[av_hash] = resolver.available;
                const wb_hash = createSha256(`${addon.name}.${addon.version}.${resolver.name}.webResolver`);
                hashTable[wb_hash] = resolver.webResolver;
            }
        }
        addonsRead = true;
    }
    response.json({ response: "readAddons", addons: loader.addons });
});
app.get('/execute-hash/:hash', async (request, response) => {
    const { hash } = request.params;
    const url = request.headers.requesturl;
    console.log(hash);
    console.log(url);
    console.log(`received request to execute hash ${hash} with url ${url}`);
    if (hash in hashTable) {
        console.log(`executing hash ${hash} from hashTable`);
        const corresponding = await hashTable[hash](url);
        console.log(`sending response for hashExecute${hash}`);
        response.json({ response: `hashExecute${hash}`, data: corresponding });
    }
});
app.listen(5500, () => {
    console.log("listening on port 5500");
});
function createSha256(str) {
    const hash = crypto.createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
}
