import * as oceanic from "oceanic.js";
import MusicClient, { Guild } from "../client.js";
import ResolverUtils from "../resolverUtils.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        name: string;
        description: string;
        required: boolean;
        type: number;
    }[];
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverUtils, guild: Guild, client: MusicClient) => Promise<void>;
};
export default _default;
