import addonloader from "./addonLoader.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const loader = new addonloader(`${__dirname}/addons`);
await loader.readAddons();
console.log(loader.addons);
