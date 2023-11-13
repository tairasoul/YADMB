import * as oceanic from "oceanic.js";
import { Guild } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    callback: (interaction: oceanic.CommandInteraction, guild: Guild) => Promise<void>;
};
export default _default;
