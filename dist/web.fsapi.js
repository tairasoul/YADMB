import addonLoader from "./web.utils/addon.import.js";
import crypto from "crypto";
import { default as express } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const { web_editor_port } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));
function isExcluded(filePath, exclusionList) {
    return exclusionList.some(exclusion => {
        if (exclusion.endsWith("*")) {
            const prefix = exclusion.slice(0, -1); // Remove the trailing *
            return filePath.startsWith(prefix);
        }
        else if (exclusion.startsWith("*")) {
            const suffix = exclusion.slice(1); // Remove the leading *
            return filePath.endsWith(suffix);
        }
        return filePath === exclusion; // Exact match
    });
}
class addonloader {
    addons = [];
    constructor() {
    }
    async readAddons() {
        for (const addon of fs.readdirSync(path.join(`${__dirname}`, "..", "addons"))) {
            console.log(`reading addon ${addon}`);
            // if addon is dir, re-call readAddons for addonPath/addon
            if (fs.statSync(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`);
                await this.readAddonFolder(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`);
            }
            // else, continue as normal with importing addon.
            else {
                const addonInfo = await import(`file://${path.join(`${__dirname}`, "..", "addons")}/${addon}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${addon} has multiple addons, iterating.`);
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${addon}`);
                        this.addons.push(saddon);
                    });
                }
                else {
                    this.addons.push(addonInfo);
                }
            }
            console.log(`addon ${addon} has been read`);
        }
    }
    async readAddonFolder(addonPath) {
        const exclusions = ["exclusions.json", "node_modules/*", "package.json", "package-lock.json", "pnpm-lock.yaml", "tsconfig.json", "packages.json"];
        if (fs.existsSync(`${addonPath}/exclusions.json`)) {
            const newExclusions = JSON.parse(fs.readFileSync(`${addonPath}/exclusions.json`, 'utf8'));
            for (const exclusion of newExclusions) {
                exclusions.push(exclusion);
            }
        }
        for (const pathname of fs.readdirSync(addonPath, { recursive: true, encoding: "utf8" }).map((v) => v.replace(/\\/g, "/"))) {
            if (fs.statSync(`${addonPath}/${pathname}`).isFile()) {
                if (!isExcluded(pathname, exclusions)) {
                    const addonInfo = await import(`file://${addonPath}/${pathname}`).then(m => m.default);
                    if (addonInfo == undefined) {
                        continue;
                    }
                    if (addonInfo instanceof Array) {
                        console.log(`addon ${path.basename(`${addonPath}/${pathname}`)} has multiple addons, iterating.`);
                        addonInfo.forEach((saddon) => {
                            console.log(`reading addon ${saddon.name} from ${pathname}`);
                            this.addons.push(saddon);
                        });
                    }
                    else {
                        this.addons.push(addonInfo);
                    }
                }
            }
        }
    }
}
export function startWebFunctions() {
    const app = express();
    app.use('/code', express.static(path.join(__dirname, "../web-editor/code")));
    app.use("/styles", express.static(path.join(__dirname, "../web-editor/styles")));
    app.get("/playlist-editor", (request, resp) => {
        console.log("sending playlist-editor.html");
        resp.sendFile(path.join(__dirname, "../web-editor/playlist-editor.html"));
    });
    app.get("/", (request, resp) => {
        console.log("sending homepage.html");
        resp.sendFile(path.join(__dirname, "../web-editor/homepage.html"));
    });
    app.get("/web-addons", (request, resp) => {
        console.log("sending addons.html");
        resp.sendFile(path.join(__dirname, "../web-editor/addons.html"));
    });
    app.get("/bot-addons", (request, resp) => {
        console.log("sending bot-addons.html");
        resp.sendFile(path.join(__dirname, "../web-editor/bot-addons.html"));
    });
    const loader = new addonLoader();
    const localloader = new addonloader();
    let localAddonsRead = false;
    let addonsRead = false;
    const hashTable = {};
    app.get('/read-addons', async (request, response) => {
        console.log(`received request to read addons`);
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
    app.get("/get-bot-addons", async (request, resp) => {
        console.log("received request to send bot addons");
        if (!localAddonsRead) {
            console.log("reading local addons");
            await localloader.readAddons();
            localAddonsRead = true;
        }
        resp.json(JSON.stringify(localloader.addons));
    });
    app.get('/execute-hash/:hash', async (request, response) => {
        const { hash } = request.params;
        const url = request.headers.requesturl;
        console.log(hash);
        console.log(url);
        console.log(`received request to execute hash ${hash} with url ${url}`);
        if (hash in hashTable) {
            console.log(`executing hash from hashTable`);
            const corresponding = await hashTable[hash](url);
            console.log(`sending response for hashExecute`);
            response.json({ response: `hashExecute`, data: corresponding });
        }
    });
    app.listen(web_editor_port, () => {
        console.log("listening on port " + web_editor_port);
    });
    function createSha256(str) {
        const hash = crypto.createHash("sha256");
        hash.update(str);
        return hash.digest("hex");
    }
}
