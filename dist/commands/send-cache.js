export default {
    name: "send-cache",
    description: "Send the cache currently being used by the bot.",
    callback: async (interaction, info) => {
        await interaction.defer();
        const data = await info.cache.getCacheData();
        const name = await info.cache.getDatabaseName();
        await interaction.editOriginal({ files: [{ name, contents: data }] });
    }
};
