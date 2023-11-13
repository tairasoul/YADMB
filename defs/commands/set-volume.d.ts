import * as oceanic from "oceanic.js";
import MusicClient, { Guild } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        name: string;
        type: oceanic.ApplicationCommandOptionTypes;
        required: boolean;
        description: string;
    }[];
    callback: (interaction: oceanic.CommandInteraction, guild: Guild, client: MusicClient) => Promise<void>;
};
export default _default;
