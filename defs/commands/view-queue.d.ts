import MusicClient, { Guild, ResolverInformation } from "../client.js";
import * as oceanic from "oceanic.js";
declare const _default: {
    name: string;
    description: string;
    callback: (interaction: oceanic.CommandInteraction, _resolvers: ResolverInformation, guild: Guild, client: MusicClient) => Promise<void>;
};
export default _default;
