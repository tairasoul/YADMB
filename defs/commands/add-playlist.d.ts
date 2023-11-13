import * as oceanic from "oceanic.js";
import { Guild, ResolverInformation } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        name: string;
        description: string;
        required: boolean;
        type: number;
    }[];
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild) => Promise<void>;
};
export default _default;
