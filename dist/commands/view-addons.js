export default {
    name: "view-addons",
    description: "View the addons this YADMB instance has.",
    options: [],
    callback: async (interaction, __, _, client) => {
        await interaction.defer();
        let fileData = "";
        for (const addon of client.addons) {
            if (addon.private == true)
                continue;
            const string = `${addon.name} v${addon.version}\n${addon.description}\nCredits: ${addon.credits}${addon.sources ? "\nSources:\n" + addon.sources.join("\n") : ""}\n\n`;
            fileData += string;
        }
        await interaction.editOriginal({ files: [
                {
                    name: `yadmb.instance.${client.user.username}.addons.txt`,
                    contents: new Buffer(fileData)
                }
            ] });
    }
};
