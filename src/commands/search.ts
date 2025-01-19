import * as oceanic from "oceanic.js";
import MusicClient, { Guild, queuedTrack } from "../classes/client.js";
import playdl from "play-dl";
import * as builders from "@oceanicjs/builders";
import humanize from "humanize-duration";
import utils from "../utils.js";
import * as voice from "@discordjs/voice";
import util from "util";
import ResolverUtils from "../classes/resolverUtils.js";
import { debugLog } from "../bot.js";
import Cache from "../classes/cache.js";
import { Proxy } from "../types/proxyTypes.js";

export default {
    name: "search",
    description: "Add video(s) from the search results of a specific search term.",
    options: [
        {
            name: "term",
            description: "What to search for.",
            required: true,
            type: 3,
            autocomplete: true
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils, 
        guild: Guild, 
        client: MusicClient,
        cache: Cache,
        proxyInfo: Proxy |  undefined
    }) => {
        await interaction.defer();
        const term = interaction.data.options.getString('term', true);
        const results = await playdl.search(term);
        const searches: Array<{name: string}> = [];
        const names: { [key: string]: {embed: builders.EmbedBuilder, url: string, title: string}} = {};
        let currentVideo: { embed: any; title: any; url: any; };
        for (const item of results) {
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
        const accept = new builders.Button(oceanic.ButtonStyles.PRIMARY, `${interaction.user.id}Add${term}`);
        accept.type = oceanic.ComponentTypes.BUTTON;
        accept.setLabel("Add video to queue");
        const cancel = new builders.Button(oceanic.ButtonStyles.PRIMARY, `${interaction.user.id}Cancel${term}`);
        cancel.setLabel("Cancel");
        cancel.type = oceanic.ComponentTypes.BUTTON;
        const acceptnext = new builders.Button(oceanic.ButtonStyles.PRIMARY, `${interaction.user.id}AddNext${term}`);
        acceptnext.setLabel("Play this video next");
        acceptnext.type = oceanic.ComponentTypes.BUTTON;
        const actionRow = utils.SelectMenu(searches, `${interaction.user.id}Search${term}`);
        const actionRow2 = new builders.ActionRow();
        actionRow2.type = oceanic.ComponentTypes.ACTION_ROW;
        actionRow2.addComponents(accept, cancel, acceptnext);
        // cancel all
        // @ts-ignore
        const ca = async (i) => {
            info.client.off("interactionCreate", pl);
            info.client.off("interactionCreate", vl);
            info.client.off("interactionCreate", vla);
            info.client.off("interactionCreate", ca);
            (actionRow as builders.ActionRow).getComponents().forEach((component) => component.disable());
            actionRow2.getComponents().forEach((component) => component.disable());
            // @ts-ignore
            await i.editParent({components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()]})
            setTimeout(async () => {
                await i.deleteOriginal();
            }, 3000)
        }
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
            const queue = info.guild.queue
            const ct = queue.internalCurrentIndex;
            const t = queue.tracks[ct];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            queue.tracks.push(youtubeadd);
            debugLog("logging search debug info")
            debugLog(`guilds["${interaction.guildID}"].queue.internalCurrentIndex: ${ct}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ct]: ${util.inspect(t, false, 5, true)}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ct].trackNumber: ${cst}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ct].tracks[cst]: ${util.inspect(st, false, 5, true)}`)
            if (info.guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && info.guild.connection) await queue.play(info.resolvers, info.proxyInfo);
        }
        // play video next
        //@ts-ignore
        const vla = async i => {
            await i.defer();
            const g = info.guild
            const queue = g.queue;
            const ct = queue.internalCurrentIndex;
            const t = queue.tracks[ct];
            if (t.type === "playlist") {
                const cst = t.trackNumber;
                const track_embed = new builders.EmbedBuilder();
                const track_thumbnail = await info.resolvers.getSongThumbnail(currentVideo.url, info.cache);
                track_embed.setTitle(currentVideo.title);
                if (track_thumbnail) track_embed.setThumbnail(track_thumbnail);
                t.tracks.splice(cst + 1, 0, {
                    name: currentVideo.title,
                    url: currentVideo.url
                })
            }
            else {
                const track_embed = new builders.EmbedBuilder();
                const track_thumbnail = await info.resolvers.getSongThumbnail(currentVideo.url, info.cache);
                track_embed.setTitle(currentVideo.title);
                if (track_thumbnail) track_embed.setThumbnail(track_thumbnail);
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
        utils.LFGIC(info.client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}Search${term}`, pl)
        utils.LFGIC(info.client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}Add${term}`,vl)
        utils.LFGIC(info.client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}AddNext${term}`, vla)
        utils.LFGIC(info.client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}Cancel${term}`, ca)
        setTimeout(async () => {
            info.client.off("interactionCreate", pl);
            info.client.off("interactionCreate", vl);
            info.client.off("interactionCreate", vla);
            info.client.off("interactionCreate", ca);
            (actionRow as builders.ActionRow).getComponents().forEach((component) => component.disable());
            actionRow2.getComponents().forEach((component) => component.disable());
            // @ts-ignore
            await interaction.editOriginal({components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()]})
            setTimeout(async () => {
                await interaction.deleteOriginal();
            }, 3000)
        }, 120000)
    }
}