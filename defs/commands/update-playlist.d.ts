import * as oceanic from "oceanic.js";
declare const _default: {
    name: string;
    description: string;
    options: {
        type: oceanic.ApplicationCommandOptionTypes;
        required: boolean;
        name: string;
        description: string;
    }[];
    callback: (interaction: oceanic.CommandInteraction) => Promise<void>;
};
export default _default;
