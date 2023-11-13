import * as builders from "@oceanicjs/builders";
export default {
    name: "join",
    description: "Join a VC and start playing tracks if available.",
    callback: async (interaction, resolvers, guild, client) => {
        await interaction.defer();
        if (interaction.member?.voiceState?.channelID) {
            if (guild.connection) {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("I am already in a VC.");
                return await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
            guild.connection = client.joinVoiceChannel({
                channelID: interaction.member.voiceState.channelID,
                guildID: interaction.guildID,
                selfDeaf: true,
                selfMute: false,
                voiceAdapterCreator: interaction.guild?.voiceAdapterCreator
            });
            guild.voiceChannel = interaction.member.voiceState.channel;
            guild.connection.subscribe(guild.audioPlayer);
            guild.connection.on("error", (error) => {
                const id = interaction.channelID;
                const ig = interaction.guild;
                if (ig) {
                    const c = ig.channels.get(id);
                    if (c) {
                        const embed = new builders.EmbedBuilder();
                        embed.setDescription("Connection had an error. Error is " + error);
                        c.createMessage({ embeds: [embed.toJSON()] });
                    }
                }
            });
            const queue = guild.queue;
            const ct = queue.internalCurrentIndex;
            const qt = queue.tracks;
            const cst = qt[ct]?.trackNumber;
            const qst = qt[ct]?.tracks;
            const string = `Joined VC <#${interaction.member.voiceState.channelID}>${qt.length > 0 ? ` starting track **${qst[cst].name}**` : ""}`;
            const embed = new builders.EmbedBuilder();
            embed.setDescription(string);
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
            if (qt.length > 0) {
                await queue.play(resolvers);
            }
        }
    }
};
