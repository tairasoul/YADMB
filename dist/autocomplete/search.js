import GetAutocomplete from "../yt-autocomplete.js";
export default {
    command: "search",
    execute: async (interaction) => {
        const data = interaction.data.options.getString("term", true);
        if (data == "")
            return [];
        return await GetAutocomplete(data);
    }
};
