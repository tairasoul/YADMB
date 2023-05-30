import { Collection } from 'discord.js';
import fs from "node:fs"
import path from 'path';
// add .substring(1) if you're on windows
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const parent = path.join(__dirname + "/..");
if (!fs.existsSync(parent + "/data")) fs.mkdirSync(parent + "/data");
const { token } = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
const Client = oceanic.Client;
import ytsr from 'ytsr';
import utils from './utils/utils.js';
import * as voice from "@discordjs/voice";
import ytdl from 'ytdl-core';
import { createAudioPlayer, NoSubscriberBehavior, createAudioResource } from "@discordjs/voice";
const guilds = {

}

import ytpl from 'ytpl';

const currentVolume = 0.05

Array.prototype.clear = function() {
    return this.splice(0, 500000)
}

function playNextSong(guild) {
    if (guilds[guild].queuedTracks[0]) {
        console.log(guilds[guild].queuedTracks);
        const currentTrack = guilds[guild].currentTrack
        guilds[guild].currentlyPlayingTrackObject = guilds[guild].queuedTracks[currentTrack]
        const a = createAudioResource(fs.createReadStream(guilds[guild].queuedTracks[currentTrack].path), {
            inlineVolume: true
        })
        guilds[guild].currentAudioResource = a;
        a.volume.setVolume(currentVolume)
        guilds[guild].currentlyPlayingTrack = guilds[guild].queuedTracks[currentTrack].songName
        guilds[guild].audioPlayer.play(a)
        if (guilds[guild].connection) guilds[guild].connection.subscribe(guilds[guild].audioPlayer);
        function oncething() {
            guilds[guild].audioPlayer.once('stateChange', (oldState, newState) => {
                if (newState.status == 'idle') {
                    if (guilds[guild].playing) {
                        if ((!guilds[guild].looping && !guilds[guild].loopqueue)) {
                            guilds[guild].queuedTracks.splice(0, 1);
                            if (guilds[guild].currentTrack >= guilds[guild].queuedTracks.length) {
                                guilds[guild].currentTrack = 0
                            }
                        }
                        if (guilds[guild].skip) {
                            guilds[guild].skip = false
                            guilds[guild].queuedTracks.splice(guilds[guild].currentTrack, 1);
                            if (guilds[guild].currentTrack >= guilds[guild].queuedTracks.length) {
                                guilds[guild].currentTrack = 0
                            }
                        }
                        if (guilds[guild].loopqueue && !guilds[guild].skip) {
                            guilds[guild].currentTrack += 1
                            if (guilds[guild].currentTrack >= guilds[guild].queuedTracks.length) {
                                guilds[guild].currentTrack = 0
                            }
                        }
                        playNextSong(guild);
                    }
                    else if (guilds[guild].skip) {
                        guilds[guild].skip = false
                        guilds[guild].queuedTracks.splice(guilds[guild].currentTrack, 1);
                        playNextSong(guild);
                    }
                }
                else {
                    oncething();
                }
            })
        }
        oncething();
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

client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.voiceState || !newState) return;
    if (oldState.voiceState && guilds[oldState.guild.id].connection && oldState.voiceState.channel.voiceMembers.size == 1) {
        guilds[oldState.guild.id].connection.removeAllListeners(); guilds[oldState.guild.id].connection.disconnect();guilds[oldState.guild.id].connection = null;
    }
    if (oldState && !newState.channelID && guilds[oldState.guild.id].connection && oldState.user.bot) {
        guilds[oldState.guild.id].connection.removeAllListeners();
        guilds[oldState.guild.id].connection.disconnect();
        guilds[oldState.guild.id].connection = null
    }
    if (oldState && !newState.channelID && oldState.user.bot) guilds[oldState.guild.id].playing = false;
})

String.prototype.removeChar = function(char) {
    // Replace all occurrences of the character with an empty string
    const modifiedString = this.replace(char, '');
    // If the modified string is the same as the original string, return the modified string
    if (modifiedString == this) {
      return modifiedString;
    }
    // Otherwise, call the function recursively on the modified string
    return modifiedString.removeChar(char);
};

String.prototype.replaceSpaces = function(replacement) {
    // Initialize the modified string to an empty string
    let modifiedString = '';
    // Initialize the position to 0
    let pos = 2000;
    // Iterate over the string by 2000 characters at a time
    while (pos < this.length) {
      // Get the substring of the string up to the current position
      const substring = this.substring(0, pos);
      // Find the last occurrence of the space character in the substring
      const index = substring.lastIndexOf(' ');
      // If a space character is found
      if (index !== -1) {
        // Get the part of the string before the space character
        const before = this.slice(0, index);
        // Get the part of the string after the space character
        const after = this.slice(index + 1);
        // Concatenate the modified string with the part before the space character, the replacement character, and the part after the space character
        modifiedString = modifiedString.concat(before, replacement, after);
      } else {
        // If no space character is found, concatenate the modified string with the rest of the original string
        modifiedString = modifiedString.concat(this.slice(pos));
      }
      // Increment the position by 2000 characters
      pos += 2000;
    }
    // Return the modified string
    return modifiedString;
};

client.setMaxListeners(0);

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
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Resumed playing " + guilds[interaction.guildID].currentlyPlayingTrack + ".");
            await interaction.editOriginal({embeds: [embed.data]})
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("addqueue")
        .setDescription("Add a link to the queue.")
        .addOption(
            {
                type: oceanic.ApplicationCommandOptionTypes.STRING,
                name: 'link',
                description: 'Link to add to queue',
                required: true
            }
        ).setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer();
            const video = interaction.data.options.getString("link");
            const videoNames = []
            async function addvid(vid) {
                if (!ytdl.validateURL(vid)) {
                    return await interaction.editOriginal("Invalid link.")
                }
                try {
                    let info;
                    let title;
                    let res;
                    let author;
                    info = await ytdl.getInfo(vid);
                    title = info.videoDetails.title
                    author = info.videoDetails.author.name
                    res = vid
                    let newVideoName = title.removeChar('/')
                    if (!fs.existsSync(`${parent}/data/${author}`)) fs.mkdirSync(`${parent}/data/${author}`)
                    if (!fs.existsSync(`${parent}/data/${author}/${newVideoName}.mp3`) || !(fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000)) {
                        const viddl = ytdl(res, {quality: 'highestaudio', IPV6Block: 'fe80::/16'})
                        viddl.pipe(fs.createWriteStream(`${parent}/data/${author}/${newVideoName}.mp3`))
                        viddl.on('end', async () => {
                            console.log('a')
                            const obj = {
                                path: `${parent}/data/${author}/${newVideoName}.mp3`,
                                songName: title
                            }
                            guilds[interaction.guildID].queuedTracks.push(obj)
                            videoNames.push(title)
                            const embed = new builders.EmbedBuilder()
                            embed.setDescription("Added **"+ videoNames.join(', ') + "** to queue.")
                            await interaction.createFollowup({content: '', embeds: [embed.json]})
                            if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                        })
                    }
                    else if (fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000) {
                        const obj = {
                            path: `${parent}/data/${author}/${newVideoName}.mp3`,
                            songName: title
                        }
                        guilds[interaction.guildID].queuedTracks.push(obj)
                        videoNames.push(title)
                        const embed = new builders.EmbedBuilder()
                        embed.setDescription("Added **"+ videoNames.join(', ') + "** to queue.")
                        await interaction.createFollowup({content: '', embeds: [embed.json]})
                        if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                    }
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
            const filter = (await ytsr.getFilters(term)).get('Type').get('Video')
            const searchResults = await ytsr(filter.url, {pages: 1})
            const searches = [];
            const names = {};
            let res;
            let currentVideo;
            async function add() {
                for (const item of searchResults.items) {
                    if (item.type != 'video') return
                    try {
                        const url = item.bestThumbnail.url
                        const embed = new builders.EmbedBuilder()
                        embed.setThumbnail(url);
                        embed.setTitle(item.title);
                        embed.addFields(
                            {name: 'Uploaded at', value: item.uploadedAt},
                            {name: 'Author', value: item.author.name},
                            {name: 'Views', value: item.views.toString()},
                            {name : "Length", value: item.duration}
                        )
                        names[item.title] = {
                            embed: embed,
                            url: item.url
                        }
                        if (!currentVideo) currentVideo = {
                            embed: embed,
                            url: item.url
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
                const vid = currentVideo.url
                if (!ytdl.validateURL(vid)) {
                    return await i.createFollowup({content: "Invalid link."})
                }
                try {
                    let info;
                    let title;
                    let res;
                    let author;
                    info = await ytdl.getInfo(vid);
                    title = info.videoDetails.title
                    author = info.videoDetails.author.name
                    res = vid
                    let newVideoName = title.removeChar('/')
                    if (!fs.existsSync(`${parent}/data/${author}`)) fs.mkdirSync(`${parent}/data/${author}`)
                    if (!fs.existsSync(`${parent}/data/${author}/${newVideoName}.mp3`) || !(fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000)) {
                        const viddl = ytdl(res, {quality: 'highestaudio', IPV6Block: 'fe80::/16'})
                        viddl.pipe(fs.createWriteStream(`${parent}/data/${author}/${newVideoName}.mp3`))
                        viddl.on('end', async () => {
                            console.log('a')
                            const obj = {
                                path: `${parent}/data/${author}/${newVideoName}.mp3`,
                                songName: title
                            }
                            guilds[interaction.guildID].queuedTracks.push(obj)
                            const embed = new builders.EmbedBuilder()
                            embed.setDescription("Added **"+ title + "** to queue.")
                            await i.editOriginal({content: '', embeds: [embed.json]})
                            if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                        })
                    }
                    else if (fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000) {
                        const obj = {
                            path: `${parent}/data/${author}/${newVideoName}.mp3`,
                            songName: title
                        }
                        guilds[interaction.guildID].queuedTracks.push(obj)
                        const embed = new builders.EmbedBuilder()
                        embed.setDescription("Added **"+ title + "** to queue.")
                        await i.editOriginal({content: '', embeds: [embed.json]})
                        if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                    }
                }
                catch (err) {
                    console.error(err)
                    await i.createFollowup({content: "Error encountered while adding video to queue: " + err})
                }
            })
            setTimeout(async () => {
                client.removeListener('interactionCreate', async i => {
                    if (i.guildID != interaction.guildID) return;
                    if (i.user.id != interaction.user.id) return
                    if (i.data.customID != interaction.user.id + 'Add' + term) return
                    await i.defer()
                    const vid = currentVideo.url
                    if (!ytdl.validateURL(vid)) {
                        return await i.createFollowup("Invalid link.")
                    }
                    try {
                        let info;
                        let title;
                        let res;
                        let author;
                        info = await ytdl.getInfo(vid);
                        title = info.videoDetails.title
                        author = info.videoDetails.author.name
                        res = vid
                        let newVideoName = title.removeChar('/')
                        if (!fs.existsSync(`${parent}/data/${author}`)) fs.mkdirSync(`${parent}/data/${author}`)
                        if (!fs.existsSync(`${parent}/data/${author}/${newVideoName}.mp3`) || !(fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000)) {
                            const viddl = ytdl(res, {quality: 'highestaudio', IPV6Block: 'fe80::/16'})
                            viddl.pipe(fs.createWriteStream(`${parent}/data/${author}/${newVideoName}.mp3`))
                            viddl.on('end', async () => {
                                console.log('a')
                                const obj = {
                                    path: `${parent}/data/${author}/${newVideoName}.mp3`,
                                    songName: title
                                }
                                queuedTracks.push(obj)
                                const embed = new builders.EmbedBuilder()
                                embed.setDescription("Added **"+ title + "** to queue.")
                                await i.createFollowup({content: '', embeds: [embed.json]})
                                if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                            })
                        }
                        else if (fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000) {
                            const obj = {
                                path: `${parent}/data/${author}/${newVideoName}.mp3`,
                                songName: title
                            }
                            queuedTracks.push(obj)
                            const embed = new builders.EmbedBuilder()
                            embed.setDescription("Added **"+ title + "** to queue.")
                            await i.editOriginal({content: '', embeds: [embed.json]})
                            if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                        }
                    }
                    catch (err) {
                        console.error(err)
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
                interaction.editOriginal({content: 'Search has timed out. (times out after 4 minutes for performance and stability.)', embeds: [], components: []})
            }, 240000)
        }
    },
    {
        data: new builders.ApplicationCommandBuilder()
        .setName("clear-queue")
        .setDescription('Clear the queue.').setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {
            await interaction.defer()
            guilds[interaction.guildID].queuedTracks.splice(0, 5000)
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Cleared queue.")
            await interaction.editOriginal({content: '', embeds: [embed.json]})
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
                if (guilds[interaction.guildID].connection) return await interaction.editOriginal("Already in a VC.")
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
                    await interaction.editOriginal({content: '', embeds: [embed.json]})
                    playNextSong(interaction.guildID)
                }
                else {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Joined VC <#" + interaction.member.voiceState.channelID + ">")
                    await interaction.editOriginal({content: '', embeds: [embed.json]})
                }
            }
            catch (err) {
                console.error(err)
                const embed = new builders.EmbedBuilder()
                embed.setDescription("You are not in a VC.")
                await interaction.editOriginal({content: '', embeds: [embed.json]})
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
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Paused track " + guilds[interaction.guildID].queuedTracks[guilds[interaction.guildID].currentTrack].songName + '.')
            await interaction.editOriginal({content: '', embeds: [embed.json]})
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
            await interaction.editOriginal({content: '', embeds: [embed.json]})
            guilds[interaction.guildID].skip = true
            guilds[interaction.guildID].audioPlayer.stop(true);
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
                ]
            }
        ).setDMPermission(false),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {await interaction.defer()
            const choice = interaction.data.options.getString("type")
            if (choice == "song" && !guilds[interaction.guildID].loopqueue) {
                guilds[interaction.guildID].looping = !guilds[interaction.guildID].looping;
                if (guilds[interaction.guildID].looping) {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Looping current song.")
                    await interaction.editOriginal({content: '', embeds: [embed.json]})
                }
                else {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("No longer looping current song.")
                    await interaction.editOriginal({content: '', embeds: [embed.json]})
                }
            }
            else if (choice == "queue" && !guilds[interaction.guildID].looping) {
                guilds[interaction.guildID].loopqueue = !guilds[interaction.guildID].loopqueue;
                if (guilds[interaction.guildID].loopqueue) {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("Looping queue.")
                    await interaction.editOriginal({content: '', embeds: [embed.json]})
                }
                else {
                    const embed = new builders.EmbedBuilder()
                    embed.setDescription("No longer looping the queue.")
                    await interaction.editOriginal({content: '', embeds: [embed.json]})
                }
            }
            else if (choice == "song" && guilds[interaction.guildID].loopqueue) {
                const embed = new builders.EmbedBuilder()
                embed.setDescription("Cannot loop song while looping queue.")
                await interaction.editOriginal({content: '', embeds: [embed.json]})
            }
            else if (choice == "queue" && guilds[interaction.guildID].looping) {
                const embed = new builders.EmbedBuilder()
                embed.setDescription("Cannot loop queue while looping song.")
                await interaction.editOriginal({content: '', embeds: [embed.json]})
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
                embed.setDescription("Disconnected.")
                await interaction.editOriginal({content: '', embeds: [embed.json]})
            }
            else {
                const embed = new builders.EmbedBuilder()
                embed.setDescription("Not in a VC.")
                await interaction.editOriginal({content: '', embeds: [embed.json]})
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
                description: "The playlist to add.",
                required: true,
                type: 3
            }
        ),
        async execute(/** @type {oceanic.CommandInteraction} */interaction) {await interaction.defer()
            const playlist = interaction.options.getString('playlist');
            const videos = await ytpl(playlist)
            const videoLength = videos.items.length - 1
            async function addvid(vid) {
                if (!ytdl.validateURL(vid)) {
                    return await interaction.editOriginal({content: "Invalid link."})
                }
                try {
                    let info;
                    let title;
                    let res;
                    let author;
                    info = await ytdl.getInfo(vid);
                    title = info.videoDetails.title
                    author = info.videoDetails.author.name
                    res = vid
                    let newVideoName = title.removeChar('/')
                    if (!fs.existsSync(`${parent}/data/${author}`)) fs.mkdirSync(`${parent}/data/${author}`)
                    if (!fs.existsSync(`${parent}/data/${author}/${newVideoName}.mp3`) || !(fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000)) {
                        const viddl = ytdl(res, {quality: 'highestaudio', IPV6Block: 'fe80::/16'})
                        viddl.pipe(fs.createWriteStream(`${parent}/data/${author}/${newVideoName}.mp3`))
                        viddl.on('end', async () => {
                            console.log('a')
                            const obj = {
                                path: `${parent}/data/${author}/${newVideoName}.mp3`,
                                songName: title,
                                trackType: 'single'
                            }
                            guilds[interaction.guildID].queuedTracks.push(obj)
                            const embed = new builders.EmbedBuilder()
                            embed.setDescription("Added " + videoLength + " tracks to queue.")
                            await interaction.editOriginal({content: '', embeds: [embed.json]})
                            if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                        })
                    }
                    else if (fs.statSync(`${parent}/data/${author}/${newVideoName}.mp3`).size > 2000) {
                        const obj = {
                            path: `${parent}/data/${author}/${newVideoName}.mp3`,
                            songName: title,
                            trackType: 'single'
                        }
                        guilds[interaction.guildID].queuedTracks.push(obj)
                        if (guilds[interaction.guildID].audioPlayer.state.status == voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playNextSong(interaction.guildID);
                    }
                }
                catch (err) {
                    console.error(err)
                    return await interaction.editOriginal({content: "Encountered an error while adding the video to the queue: " + err})
                }
            }
            for (const video of videos.items) {
                await addvid(video.url)
            }
            const embed = new builders.EmbedBuilder()
            embed.setDescription("Added "+ videoLength + " tracks to queue.")
            await interaction.editOriginal({content: '', embeds: [embed.json]})
        }
    }
]

client.on('guildCreate', guild => {
    guilds[guild.id] = {
        skip: false,
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
    async function addCommands(cmd) {
        for (const command of cmd) {
            command.type = 1;
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
            client.application.createGlobalCommand(command.data);
        }
    }
    
    addCommands(cmdArray);
    for (const guild of client.guilds.entries()) {
        guilds[guild[1].id] = {
            skip: false,
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
    client.editStatus(null, [{type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers'}]);
})

client.connect();
