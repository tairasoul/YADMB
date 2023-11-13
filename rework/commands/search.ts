import * as oceanic from "oceanic.js";
import MusicClient, { Guild, ResolverInformation, queuedTrack } from "../client.js";
import playdl from "play-dl";
import * as builders from "@oceanicjs/builders";
import humanize from "humanize-duration";
import utils from "../utils.js";
import * as voice from "@discordjs/voice";
import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${path.join(__dirname, "..")}/enableDebugging`)) debug = true;

function debugLog(text: any) {
    if (debug) console.log(text)
}

export default {
    name: "search",
    description: "Add video(s) from the search results of a specific search term.",
    options: [
        {
            name: "term",
            description: "What to search for.",
            required: true,
            type: 3
        },
        {
            name: "exclude-playlist",
            description: "Exclude playlists?",
            required: false,
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: "exclude-channel",
            description: "Exclude channels?",
            required: false,
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: "exclude-video",
            description: "Exclude videos?",
            required: false,
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient) => {
        await interaction.defer();
        const term = interaction.data.options.getString('term', true);
        const excludes = [];
        const enames = [
            "exclude-playlist",
            "exclude-channel",
            "exclude-video"
        ] as const;
        for (const name of enames) {
            if (interaction.data.options.getBoolean(name) === true) {
                excludes.push(name.split("-")[1])
            }
        }
        const results = await playdl.search(term);
        const searches: Array<{name: string}> = [];
        const names: { [key: string]: {embed: builders.EmbedBuilder, url: string, title: string}} = {};
        let currentVideo: { embed: any; title: any; url: any; };
        for (const item of results) {
            if (!excludes.includes(item.type)) {
                const embed = new builders.EmbedBuilder();
                embed.setImage(item.thumbnails[0].url);
                embed.setTitle(item.title as string);
                if (item.uploadedAt) embed.addField('Uploaded', item.uploadedAt);
                if (item.channel?.name) embed.addField("Author",  item.channel.name);
                if (item.views) embed.addField("Views", item.views.toString());
                if (item.durationInSec) embed.addField("Duration", humanize(item.durationInSec * 1000));
                names[item.title as string] = {
                    embed: embed,
                    url: item.url,
                    title: item.title as string
                }
                // @ts-ignore
                if (!currentVideo) currentVideo = {
                    embed: embed,
                    url: item.url,
                    title: item.title
                };
                searches.push({name: item.title as string});
            }
        }
        const accept = new builders.Button(oceanic.ButtonStyles.PRIMARY, `${interaction.user.id}Add${term}`);
        accept.type = oceanic.ComponentTypes.BUTTON;
        accept.setLabel("Add video to queue");
        const acceptnext = new builders.Button(oceanic.ButtonStyles.PRIMARY, `${interaction.user.id}AddNext${term}`);
        acceptnext.setLabel("Play this video next");
        acceptnext.type = oceanic.ComponentTypes.BUTTON;
        const actionRow = utils.SelectMenu(searches, `${interaction.user.id}Search${term}`);
        const actionRow2 = new builders.ActionRow();
        actionRow2.type = oceanic.ComponentTypes.ACTION_ROW;
        actionRow2.addComponents(accept, acceptnext);
        // change page
        // @ts-ignore
        const pl = async (i) => {
            // @ts-ignore
            const values = (i.data.values as oceanic.SelectMenuValuesWrapper).getStrings();
            const embed = names[values[0]].embed;
            currentVideo = names[values[0]];
            try {
                // @ts-ignore
                await i.editParent({components: [actionRow, actionRow2], embeds: [embed.toJSON()]});
            }
            catch {}
        }
        // add video to queue
        // @ts-ignore
        const vl =  async i => {
            await i.defer();
            const youtubeadd: queuedTrack = {
                type: "song",
                trackNumber: 0,
                tracks: [
                    {
                        name: currentVideo.title,
                        url: currentVideo.url
                    }
                ],
                name: currentVideo.title
            }
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Added **${currentVideo.title}** to queue.`);
            await i.editOriginal(
                {
                    embeds: [embed.toJSON()]
                }
            )
            const queue = guild.queue
            const ct = queue.internalCurrentIndex;
            const t = queue.tracks[ct];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            queue.tracks.push(youtubeadd);
            debugLog(`guilds["${interaction.guildID}"].queue.internalCurrentIndex: ${ct}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ct]: ${util.inspect(t, false, 5, true)}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ct].trackNumber: ${cst}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ct].tracks[cst]: ${util.inspect(st, false, 5, true)}`)
            if (guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guild.connection) await queue.play(resolvers);
        }
        // play video next
        //@ts-ignore
        const vla = async i => {
            await i.defer();
            const g = guild
            const queue = g.queue;
            const ct = queue.internalCurrentIndex;
            const t = queue.tracks[ct];
            if (t.type === "playlist") {
                const cst = t.trackNumber;
                t.tracks.splice(cst + 1, 0, {
                    name: currentVideo.title,
                    url: currentVideo.url
                })
            }
            else {
                queue.tracks.push(
                    {
                        type: "song",
                        trackNumber: 0,
                        tracks: [
                            {
                                name: currentVideo.title,
                                url: currentVideo.url
                            }
                        ],
                        name: currentVideo.title
                    }
                )
            }
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Playing **${currentVideo.title}** after current track.`);
            await i.editOriginal(
                {
                    embeds: [embed.toJSON()]
                }
            )
        }
        // @ts-ignore
        await interaction.editOriginal({components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()]})
        utils.LFGIC(client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}Search${term}`, pl)
        utils.LFGIC(client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}Add${term}`,vl)
        utils.LFGIC(client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}AddNext${term}`, vla)
        setTimeout(async () => {
            client.off("interactionCreate", pl);
            client.off("interactionCreate", vl);
            client.off("interactionCreate", vla);
            (actionRow as builders.ActionRow).getComponents().forEach((component) => component.disable());
            actionRow2.getComponents().forEach((component) => component.disable());
            // @ts-ignore
            await interaction.editOriginal({components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()]})
        }, 120000)
    }
}