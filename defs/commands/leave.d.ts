import * as oceanic from "oceanic.js";
import { Guild } from "../client.js";
import ResolverUtils from "../resolverUtils.js";
declare const _default: {
    name: string;
    description: string;
    callback: (interaction: oceanic.CommandInteraction, _resolvers: ResolverUtils, guild: Guild) => Promise<void>;
};
export default _default;
