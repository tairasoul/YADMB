import GetAutocomplete from "../yt-autocomplete.js";
import * as oceanic from "oceanic.js";

export default {
    command: "search",
    execute: async (interaction: oceanic.AutocompleteInteraction) => {
        const data = interaction.data.options.getString("term", true);
        if (data == "")
            return [];
        return await GetAutocomplete(data);
    }
}