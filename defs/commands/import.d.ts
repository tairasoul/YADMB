import * as oceanic from "oceanic.js";
import { Guild } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        name: string;
        type: oceanic.ApplicationCommandOptionTypes;
        description: string;
        required: boolean;
    }[];
    callback: (interaction: oceanic.CommandInteraction, guild: Guild) => Promise<void>;
};
export default _default;
