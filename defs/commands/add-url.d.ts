import * as oceanic from "oceanic.js";
import { Guild } from "../client.js";
import ResolverUtils from "../resolverUtils.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        type: oceanic.ApplicationCommandOptionTypes;
        name: string;
        description: string;
        required: boolean;
    }[];
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverUtils, guild: Guild) => Promise<oceanic.Message<oceanic.AnyInteractionChannel | oceanic.Uncached> | undefined>;
};
export default _default;
