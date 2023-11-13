import * as oceanic from "oceanic.js";
import MusicClient, { Guild, ResolverInformation } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient) => Promise<oceanic.Message<oceanic.AnyInteractionChannel | oceanic.Uncached> | undefined>;
};
export default _default;
