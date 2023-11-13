import * as oceanic from "oceanic.js";
import { Guild, ResolverInformation } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        type: oceanic.ApplicationCommandOptionTypes;
        required: boolean;
        name: string;
        description: string;
        choices: {
            name: string;
            value: string;
        }[];
    }[];
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild) => Promise<oceanic.Message<oceanic.AnyInteractionChannel | oceanic.Uncached> | undefined>;
};
export default _default;
