import { Collection } from 'discord.js';
import fs from "node:fs"
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const { token } = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
const Client = oceanic.Client;
import ytsr from './utils/node_modified_modules/ytsearch-node/src/parsedata.js';
import utils from './utils/utils.js';
import * as voice from "@discordjs/voice";
import {default as dlsr} from 'youtube-dlsr';
import ytdl from 'ytdl-core';
import { createAudioPlayer, NoSubscriberBehavior, createAudioResource } from "@discordjs/voice";
const guilds = {

}

import ytpl from 'ytpl';

// change to your liking

const currentVolume = 0.075

Array.prototype.clear = function() {
    return this.splice(0, 500000)
}

async function playNextSong(guild) {
    if (guilds[guild].queuedTracks[0]) {
        try {
            if (!guilds[guild].playing) guilds[guild].playing = true;
            const currentTrack = guilds[guild].currentTrack;
            guilds[guild].currentlyPlayingTrackObject = guilds[guild].queuedTracks[currentTrack];
            const get = await dlsr.download(guilds[guild].queuedTracks[currentTrack].url);
            const a = createAudioResource(get, {
                inlineVolume: true
            })
            guilds[guild].currentAudioResource = a;
            a.volume.setVolume(currentVolume);
            guilds[guild].currentlyPlayingTrack = guilds[guild].queuedTracks[currentTrack].songName;
            guilds[guild].audioPlayer.play(a);
            if (guilds[guild].connection) guilds[guild].connection.subscribe(guilds[guild].audioPlayer);
            // probably not the best method, but fuck it.
            function oncething() {
                guilds[guild].audioPlayer.once('stateChange', (oldState, newState) => {
                    if (newState.status == 'idle') {
                        if (guilds[guild].playing) {
                            if ((!guilds[guild].looping && !guilds[guild].loopqueue)) {
                                guilds[guild].queuedTracks.splice(0, 1);
                                if (guilds[guild].currentTrack >= guilds[guild].queuedTracks.length) {
                                    guilds[guild].currentTrack = 0;
                                }
                            }
                            if (guilds[guild].loopqueue) {
                                guilds[guild].currentTrack += 1;
                                if (guilds[guild].currentTrack >= guilds[guild].queuedTracks.length) {
                                    guilds[guild].currentTrack = 0;
                                }
                            }
                            guilds[guild].audioPlayer.removeAllListeners();
                            playNextSong(guild);
                        }
                    }
                    else {
                        oncething();
                    }
                })
                guilds[guild].audioPlayer.once('error', (error) => {
                    console.log(`an audio player error occured in ${guild}, error: ${error}`)
                })
            }
            oncething();
        } catch {}
    }
}


const client = new Client({
    auth: token,
    allowedMentions:{
        roles: true,
        repliedUser:true,
    },
    gateway: {
        intents:[
            "GUILDS",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT",
            "GUILD_PRESENCES",
            "GUILD_MEMBERS",
            "GUILD_VOICE_STATES"
        ],
        autoReconnect: true,
        connectionTimeout: 900000,
    }
});

// temporarily not needed while i think of how to remake this with Oceanic.js

/*client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.voiceState || !newState) return;
    if (oldState.voiceState.channel && guilds[oldState.guild.id].connection && oldState.voiceState.channel?.voiceMembers.size == 1) {
        guilds[oldState.guild.id].connection.removeAllListeners(); guilds[oldState.guild.id].connection.disconnect();guilds[oldState.guild.id].connection = null;
    }
    if (oldState && !newState.channelID && guilds[oldState.guild.id].connection && oldState.user.bot) {
        guilds[oldState.guild.id].connection.removeAllListeners();
        guilds[oldState.guild.id].connection.disconnect();
        guilds[oldState.guild.id].connection = null
    }
    if (oldState && !newState.channelID && oldState.user.bot) guilds[oldState.guild.id].playing = false;
})*/

client.on("ready", () => {
    console.log("logged in");
})

client.commands = new Collection();

const commands = [];
const cmdArray = [
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("resume")
        .setDescription("Resume playing youtube videos.").setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer();
            guilds[interaction.guildID].audioPlayer.unpause();
            guilds[interaction.guildID].playing = true
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Resumed playing " + guilds[interaction.guildID].currentlyPlayingTrack + ".");
            await interaction.editOriginal({embeds: [embed.json]})
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("add-queue")
        .setDescription("Add a link to the queue.")
        .addOption(
            {
                type: oceanic.ApplicationCommandOptionTypes.STRING,
                name: 'link',
                description: 'Link to add to queue',
                required: true
            }
        )
        .addOption(
            {
                type: oceanic.ApplicationCommandOptionTypes.BOOLEAN,
                name: 'playnext',
                description: 'Should this song play next?',
                required: false
            }
        ).setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer();
            const video = interaction.data.options.getString("link");
            const playNext = interaction.data.options.getBoolean("playnext");
            const videoNames = []
            async function addvid(vid) {
                if (!ytdl.validateURL(vid)) {
                    return await interaction.editOriginal("Invalid link.")
                }
                try {
                    const info = await ytdl.getInfo(vid);
                    const title = info.videoDetails.title
                    const obj = {
                        url: vid,
                        songName: title
                    }
                    if (playNext) {
                        guilds[interaction.guildID].queuedTracks.splice(guilds[interaction.guildID].currentTrack + 1, 0, obj)
                    }
                    else {
                        guilds[interaction.guildID].queuedTracks.push(obj)
                    }
                    videoNames.push(title)
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Added **"+ videoNames.join(", ") + "** to queue.")
                    await interaction.createFollowup({embeds: [embed.json]})
                    if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                }
                catch (err) {
                    console.error(err)
                    return await interaction.createFollowup({content: "Encountered an error while adding the video to the queue: " + err})
                }
            }
            if (video.includes(' ')) {
                const a = video.split(' ')
                for (const vid of a) {
                    await addvid(vid)
                }
            }
            else {
                await addvid(video)
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName('add-search')
        .setDescription('Add a video from a search term.')
        .addOption(
            {
                name: 'term',
                description: 'What to search for.',
                required: true,
                type: 3
            }
        ).setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            const term = interaction.data.options.getString('term');
            const searchResults = await ytsr(term);
            const searches = [];
            const names = {};
            let res;
            let currentVideo;
            async function add() {
                for (const item of searchResults) {
                    if (item.type != 'video') return
                    try {
                        const url = item.thumbnail.url
                        const embed = new builders.EmbedBuilder()
                        embed.setThumbnail(url);
                        embed.setTitle(item.title);
                        embed.addFields(
                            {name: 'Uploaded', value: item.publishedAt},
                            {name: 'Author', value: item.author.name},
                            {name: 'Views', value: item.viewCount.toString()},
                            {name : "Length", value: item.duration}
                        )
                        names[item.title] = {
                            embed: embed,
                            url: item.watchUrl,
                            title: item.title
                        }
                        if (!currentVideo) currentVideo = {
                            embed: embed,
                            url: item.watchUrl,
                            title: item.title
                        }
                        if (!res) res = embed
                        const toPush = {
                            name: item.title
                        }
                        searches.push(toPush)
                    }
                    catch {
                    }
                }
            }
            await add()
            const acceptButton = new builders.Button()
            acceptButton.setStyle(oceanic.ButtonStyles.PRIMARY);
            acceptButton.setLabel('Add video to queue')
            acceptButton.type = oceanic.ComponentTypes.BUTTON
            acceptButton.setCustomID(interaction.user.id + 'Add' + term)
            const actionRow = utils.SelectMenu(searches, interaction.user.id + 'Search' + term)
            const actionRow2 = new builders.ActionRow()
            actionRow2.type = oceanic.ComponentTypes.ACTION_ROW
            actionRow2.addComponents(acceptButton)
            await interaction.editOriginal({content: 'Results for **' + term + '**:', components: [actionRow, actionRow2], embeds: [res.json]})
            client.on('interactionCreate', /** @type {oceanic.ComponentInteraction} */async i => {
                if (i.guildID != interaction.guildID) return;
                if (i.user.id != interaction.user.id) return;
                if (i.data.customID != interaction.user.id + 'Search' + term) return;
                const values = i.data.values.getStrings();
                console.log(values)
                const embed = names[values[0]].embed
                currentVideo = names[values[0]]
                try {
                    await i.editParent({content: 'Results for **' + term + '**:', components: [actionRow, actionRow2], embeds: [embed.json]})
                } catch {}
            })
            client.on('interactionCreate', /** @type {oceanic.ComponentInteraction} */async i => {
                if (i.guildID != interaction.guildID) return;
                if (i.user.id != interaction.user.id) return
                if (i.data.customID != interaction.user.id + 'Add' + term) return
                await i.defer()
                const vid = currentVideo
                if (!ytdl.validateURL(vid.url)) {
                    return await interaction.editOriginal({content: "Invalid link."})
                }
                try {
                    const title = vid.title;
                    const obj = {
                        url: vid.url,
                        songName: title
                    }
                    guilds[interaction.guildID].queuedTracks.push(obj)
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Added **"+ title + "** to queue.")
                    await i.editOriginal({embeds: [embed.json]})
                    if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                }
                catch (err) {
                    console.error(err)
                    await i.createFollowup({content: "Error encountered while adding video to queue: " + err})
                }
            })
            setTimeout(async () => {
                client.removeListener('interactionCreate', /** @type {oceanic.ComponentInteraction} */async i => {
                    if (i.guildID != interaction.guildID) return;
                    if (i.user.id != interaction.user.id) return
                    if (i.data.customID != interaction.user.id + 'Add' + term) return
                    await i.defer()
                    if (!ytdl.validateURL(currentVideo.url)) {
                        return await interaction.editOriginal({content: "Invalid link."})
                    }
                    try {
                        const title = currentVideo.title;
                        const obj = {
                            url: currentVideo.url,
                            songName: title
                        }
                        guilds[interaction.guildID].queuedTracks.push(obj)
                        const embed = new builders.EmbedBuilder()
                        embed.setDescription("Added **"+ title + "** to queue.")
                        await i.editOriginal({embeds: [embed.json]})
                        if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                    }
                    catch (err) {
                        console.error(err)
                        await i.createFollowup({content: "Error encountered while adding video to queue: " + err})
                    }
                })
                client.removeListener('interactionCreate', async i => {
                    if (i.guildID != interaction.guildID) return;
                    if (i.user.id != interaction.user.id) return
                    if (i.data.customID != interaction.user.id + 'Search' + term) return;
                    const values = i.data.values.getStrings();
                    const embed = names[values[0]].embed
                    currentVideo = names[values[0]]
                    try {
                        await i.editOriginal({content: 'Results for **' + term + '**:', components: [actionRow, actionRow2], embeds: [embed.json]})
                    } catch {}
                })
                actionRow.getComponents().forEach((val) => {
                    val.disable()
                })
                actionRow2.getComponents().forEach((val) => {
                    val.disable()
                })
                await interaction.editOriginal({content: 'Results for **' + term + '**:', components: [actionRow, actionRow2], embeds: [currentVideo.embed.json]})
            }, 120000)
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("clear-queue")
        .setDescription('Clear the queue.').setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            guilds[interaction.guildID].queuedTracks.splice(0, 5000);
            guilds[interaction.guildID].audioPlayer.removeAllListeners();
            guilds[interaction.guildID].audioPlayer.stop(true);
            guilds[interaction.guildID].playing = false;
            guilds[interaction.guildID].currentTrack = 0;
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Cleared queue.")
            await interaction.editOriginal({embeds: [embed.json]})
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("join")
        .setDescription("Join a VC and start playing tracks.").setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            try {
                guilds[interaction.guildID].audioPlayer.removeAllListeners('stateChange')
                if (guilds[interaction.guildID].connection) return await interaction.editOriginal({content: "Already in a VC."})
                guilds[interaction.guildID].connection = client.joinVoiceChannel({
                    channelID: interaction.member.voiceState.channelID,
                    guildID: interaction.guildID,
                    selfDeaf: true,
                    selfMute: false,
                    voiceAdapterCreator: interaction.guild.voiceAdapterCreator,
                })
                function connthing() {
                    guilds[interaction.guildID].connection.once('error', (error) => {
                        console.error(error)
                        guilds[interaction.guildID].connection = client.joinVoiceChannel({
                            channelID: interaction.member.voiceState.channelID,
                            guildID: interaction.guildID,
                            selfDeaf: true,
                            selfMute: false,
                            voiceAdapterCreator: interaction.guild.voiceAdapterCreator,
                        })
                        connthing()
                    })
                }
                connthing()
                if (guilds[interaction.guildID].queuedTracks[0]) {
                    guilds[interaction.guildID].playing = true
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Joined VC <#" + interaction.member.voiceState.channelID + "> starting track **" + guilds[interaction.guildID].queuedTracks[guilds[interaction.guildID].currentTrack].songName + "**")
                    await interaction.editOriginal({embeds: [embed.json]})
                    playNextSong(interaction.guildID)
                }
                else {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Joined VC <#" + interaction.member.voiceState.channelID + ">")
                    await interaction.editOriginal({embeds: [embed.json]})
                }
            }
            catch (err) {
                console.error(err)
                const embed = new builders.EmbedBuilder()
                embed.setDescription("You are not in a VC.")
                await interaction.editOriginal({embeds: [embed.json]})
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("pause")
        .setDescription("Pause currently playing track.").setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            guilds[interaction.guildID].audioPlayer.pause();
            guilds[interaction.guildID].playing = false;
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Paused track " + guilds[interaction.guildID].queuedTracks[guilds[interaction.guildID].currentTrack].songName + '.')
            await interaction.editOriginal({embeds: [embed.json]})
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffle the music queue.").setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            guilds[interaction.guildID].audioPlayer.removeAllListeners();
            guilds[interaction.guildID].audioPlayer.stop(true);
            guilds[interaction.guildID].currentTrack = 0;
            utils.shuffleArray(guilds[interaction.guildID].queuedTracks);
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Shuffled queue.")
            playNextSong(interaction.guildID)
            await interaction.editOriginal({embeds: [embed.json]})
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("skip")
        .setDescription("Skip current song.")
        .setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Skipped song " + guilds[interaction.guildID].queuedTracks[guilds[interaction.guildID].currentTrack].songName + '.')
            await interaction.editOriginal({embeds: [embed.json]})
            guilds[interaction.guildID].audioPlayer.removeAllListeners();
            guilds[interaction.guildID].audioPlayer.stop(true);
            guilds[interaction.guildID].queuedTracks.splice(guilds[interaction.guildID].currentTrack, 1);
            if (guilds[interaction.guildID].currentTrack >= guilds[interaction.guildID].queuedTracks.length && guilds[interaction.guildID].loopqueue) {
                guilds[interaction.guildID].currentTrack = 0;
            }
            playNextSong(interaction.guildID);
            
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("loop")
        .setDescription("Loops the currently playing song.")
        .addOption(
            {
                type: 3,
                name: 'type',
                description: "Do you want to loop the currently playing song or the whole queue?",
                choices: [
                    {name: "song", value: "song"},
                    {name: "queue", value: "queue"}
                ],
                required: true
            }
        ).setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {await interaction.defer()
            const choice = interaction.data.options.getString("type")
            if (choice == "song" && !guilds[interaction.guildID].loopqueue) {
                guilds[interaction.guildID].looping = !guilds[interaction.guildID].looping;
                if (guilds[interaction.guildID].looping) {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Looping current song.")
                    await interaction.editOriginal({embeds: [embed.json]})
                }
                else {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("No longer looping current song.")
                    await interaction.editOriginal({embeds: [embed.json]})
                }
            }
            else if (choice == "queue" && !guilds[interaction.guildID].looping) {
                guilds[interaction.guildID].loopqueue = !guilds[interaction.guildID].loopqueue;
                if (guilds[interaction.guildID].loopqueue) {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Looping queue.")
                    await interaction.editOriginal({embeds: [embed.json]})
                }
                else {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("No longer looping the queue.")
                    await interaction.editOriginal({embeds: [embed.json]})
                }
            }
            else if (choice == "song" && guilds[interaction.guildID].loopqueue) {
                const embed = new builders.EmbedBuilder()
                embed.setDescription("Cannot loop song while looping queue.")
                await interaction.editOriginal({embeds: [embed.json]})
            }
            else if (choice == "queue" && guilds[interaction.guildID].looping) {
                const embed = new builders.EmbedBuilder()
                embed.setDescription("Cannot loop queue while looping song.")
                await interaction.editOriginal({embeds: [embed.json]})
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("leave")
        .setDescription("Leave a VC.")
        .setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            if (guilds[interaction.guildID].connection) {
                guilds[interaction.guildID].audioPlayer.removeAllListeners('stateChange')
                guilds[interaction.guildID].connection.disconnect();
                guilds[interaction.guildID].connection = null
                const embed = new builders.EmbedBuilder()
                guilds[interaction.guildID].playing = false;
                embed.setDescription("Disconnected.")
                await interaction.editOriginal({embeds: [embed.json]})
            }
            else {
                const embed = new builders.EmbedBuilder()
                embed.setDescription("Not in a VC.")
                await interaction.editOriginal({embeds: [embed.json]})
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName('add-playlist')
        .setDescription('Add a whole playlist\'s videos to queue.')
        .addOption(
            {
                name: 'playlist',
                description: "The playlist to add. Can also be a channel URL.",
                required: true,
                type: 3
            }
        )
        .addOption(
            {
                name: 'shuffle',
                description: "Should the playlist be shuffled when added?",
                required: false,
                type: 5
            }
        )
        .setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {await interaction.defer()
            const playlist = interaction.data.options.getString('playlist');
            const shuffle = interaction.data.options.getBoolean("shuffle");
            const videos = await ytpl(playlist)
            const videosToConcat = [];
            async function addvid(/** @type {ytpl.Result}*/vid) {
                try {
                    const title = vid.title;
                    const obj = {
                        url: vid.url,
                        songName: title
                    }
                    videosToConcat.push(obj);
                }
                catch (err) {
                    console.error(err)
                    return await interaction.editOriginal({content: "Encountered an error while adding a video to the queue: " + err})
                }
            }
            for (const video of videos.items) {
                await addvid(video)
            }
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Added **" + (videos.items.length) + " tracks** to queue.")
            await interaction.editOriginal({embeds: [embed.json]})
            if (shuffle) utils.shuffleArray(videosToConcat);
            videosToConcat.forEach((val) => guilds[interaction.guildID].queuedTracks.push(val));
            if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
        }
    }
]

client.on('guildCreate', guild => {
    guilds[guild.id] = {
        currentlyPlayingTrack: null,
        currentlyPlayingTrackObject: null,
        currentAudioResource: null,
        connection: null,
        looping: false,
        playing: false,
        loopqueue: false,
        currentTrack: 0,
        queuedTracks: [],
        audioPlayer: createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        })
    }
    client.editStatus(null, [{type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers'}]);
})

client.on('interactionCreate', async interaction => {
    if (!interaction.type == oceanic.InteractionTypes.APPLICATION_COMMAND) return;
    const command = client.commands.get(interaction.data.name);
    if (!command) return;
    try {
        await command.execute(interaction, client);
    } catch (error) {
        if (error) console.error(error);
        
        if (!interaction.acknowledged) {
            await interaction.createFollowup({content: `There was an error while executing this command, error is ${error}`});
        }
        else await interaction.editOriginal({content: `There was an error while executing this command, error is ${error}`});
    }
});


client.on('guildDelete', guild => {
    delete guilds[guild.id]
    client.editStatus(null, [{type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers'}]);
})

client.once("ready", async ()=>{
    for (const guild of client.guilds.entries()) {
        guilds[guild[1].id] = {
            currentlyPlayingTrack: null,
            currentlyPlayingTrackObject: null,
            currentAudioResource: null,
            connection: null,
            looping: false,
            playing: false,
            loopqueue: false,
            currentTrack: 0,
            queuedTracks: [],
            audioPlayer: createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                    maxMissedFrames: 20
                }
            })
        }
    }
    for (const command of cmdArray) {
        console.log(`creating global command ${command.data.name}`);
        command.type = 1;
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
        await client.application.createGlobalCommand(command.data);
        console.log(`made global command ${command.data.name}`);
    }
    const cmds = await client.application.getGlobalCommands();
    cmds.forEach((val) => {
        if (val.name == "addqueue") val.delete();
    })
    client.editStatus(null, [{type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers'}]);
})

client.on('error', (error) => {
    console.error(`something went wrong, ${error}`)
})

client.connect();
