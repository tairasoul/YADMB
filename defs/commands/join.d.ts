import * as oceanic from "oceanic.js";
import MusicClient, { Guild } from "../client.js";
import ResolverUtils from "../resolverUtils.js";
declare const _default: {
    name: string;
    description: string;
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverUtils, guild: Guild, client: MusicClient) => Promise<oceanic.Message<oceanic.AnyInteractionChannel | oceanic.Uncached> | undefined>;
};
export default _default;
