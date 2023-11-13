import * as oceanic from "oceanic.js";
import { Guild, ResolverInformation } from "../client.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        type: number;
        name: string;
        description: string;
        choices: {
            name: string;
            value: string;
        }[];
        required: boolean;
    }[];
    callback: (interaction: oceanic.CommandInteraction, _resolvers: ResolverInformation, guild: Guild) => Promise<void>;
};
export default _default;
