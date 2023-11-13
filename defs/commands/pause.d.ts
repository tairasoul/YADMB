import * as oceanic from "oceanic.js";
import { Guild, ResolverInformation } from "../client";
declare const _default: {
    name: string;
    description: string;
    callback: (interaction: oceanic.CommandInteraction, _resolvers: ResolverInformation, guild: Guild) => Promise<void>;
};
export default _default;
