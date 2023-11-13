import * as oceanic from "oceanic.js";
import { Guild } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        type: oceanic.ApplicationCommandOptionTypes;
        name: string;
        description: string;
        required: boolean;
    }[];
    callback: (interaction: oceanic.CommandInteraction, guild: Guild) => Promise<oceanic.Message<oceanic.AnyInteractionChannel | oceanic.Uncached> | undefined>;
};
export default _default;
