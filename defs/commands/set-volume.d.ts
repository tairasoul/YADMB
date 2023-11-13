import * as oceanic from "oceanic.js";
import { Guild, ResolverInformation } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        name: string;
        type: oceanic.ApplicationCommandOptionTypes;
        required: boolean;
        description: string;
    }[];
    callback: (interaction: oceanic.CommandInteraction, _resolvers: ResolverInformation, guild: Guild) => Promise<void>;
};
export default _default;
