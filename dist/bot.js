var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { Collection } from 'discord.js';
import fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import utils from '../utils/utils.js';
import * as voice from "@discordjs/voice";
import { default as playdl } from 'play-dl';
import humanize from 'humanize-duration';
import ytdl from 'ytdl-core';
import { createAudioPlayer, NoSubscriberBehavior, createAudioResource } from "@discordjs/voice";
import ytpl from 'ytpl';
import * as util from "node:util";
// util functions
function startsWith(str, strings) {
    var e_1, _a;
    try {
        for (var strings_1 = __values(strings), strings_1_1 = strings_1.next(); !strings_1_1.done; strings_1_1 = strings_1.next()) {
            var string = strings_1_1.value;
            if (str.startsWith(string))
                return true;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (strings_1_1 && !strings_1_1.done && (_a = strings_1["return"])) _a.call(strings_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return false;
}
function getProvider(url) {
    // no clue if these are all, please open an issue if they are not
    var youtube = ["https://www.youtube.com", "https://youtu.be"];
    var sc = ["https://soundcloud.com", "https://on.soundcloud.com"];
    var deezer = ["https://www.deezer.com"];
    var spotify = ["https://open.spotify.com"];
    if (startsWith(url, youtube))
        return "youtube";
    if (startsWith(url, sc))
        return "soundcloud";
    if (startsWith(url, deezer))
        return "deezer";
    if (startsWith(url, spotify))
        return "spotify";
}
function setupGuild(guild) {
    var cg = guilds[guild.id];
    cg.audioPlayer.on('error', function (error) {
        console.log("an error occured with the audio player, ".concat(error));
    });
    cg.audioPlayer.on("stateChange", function () {
        if (cg.audioPlayer.state.status == voice.AudioPlayerStatus.Idle) {
            console.log(util.inspect(cg.queuedTracks, true, 20));
            switch (cg.loopType) {
                case "none":
                    if (cg.queuedTracks[cg.currentTrack].type === "playlist") {
                        cg.queuedTracks[cg.currentTrack].tracks.splice(0, 1);
                        if (cg.queuedTracks[cg.currentTrack].tracks.length === 0) {
                            cg.queuedTracks.splice(0, 1);
                            playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                        }
                        else {
                            playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                        }
                    }
                    else {
                        cg.queuedTracks[cg.currentTrack].tracks.splice(0, 1);
                        playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    }
                    break;
                case "song":
                    playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    break;
                case "queue":
                    console.log(cg.currentTrack);
                    if (cg.queuedTracks[cg.currentTrack].type === "playlist") {
                        cg.queuedTracks[cg.currentTrack].trackNumber += 1;
                    }
                    else {
                        cg.currentTrack += 1;
                    }
                    console.log(cg.queuedTracks[cg.currentTrack].trackNumber);
                    if (cg.queuedTracks[cg.currentTrack].trackNumber == cg.queuedTracks[cg.currentTrack].tracks.length)
                        cg.currentTrack += 1;
                    console.log(cg.currentTrack);
                    if (cg.currentTrack == cg.queuedTracks.length)
                        cg.currentTrack = 0;
                    console.log(cg.currentTrack);
                    playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    break;
                case "playlist":
                    if (cg.queuedTracks[cg.currentTrack].tracks.length === cg.queuedTracks[cg.currentTrack].trackNumber) {
                        cg.queuedTracks[cg.currentTrack].trackNumber = 0;
                        cg.currentTrack += 1;
                        playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    }
                    else {
                        cg.queuedTracks[cg.currentTrack].trackNumber += 1;
                        playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    }
                    break;
            }
        }
    });
}
// starter variables
var __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
var token = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8')).token;
var guilds = {};
var loopTypeStrs = {
    "none": "No longer looping anything.",
    "song": "Looping the currently playing song.",
    "playlist": "Looping the currently playing playlist (same as song if the current track was added as a song)",
    "queue": "Looping the entire queue."
};
// main client and listeners
var client = new oceanic.Client({
    auth: token,
    allowedMentions: {
        roles: true,
        repliedUser: true
    },
    gateway: {
        intents: [
            "GUILDS",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT",
            "GUILD_PRESENCES",
            "GUILD_MEMBERS",
            "GUILD_VOICE_STATES"
        ],
        autoReconnect: true,
        connectionTimeout: 900000
    }
});
client.on('voiceStateUpdate', function (oldState, newState) {
    if (guilds[oldState.guildID].voiceChannel !== null && guilds[oldState.guildID].connection) {
        var channel = guilds[oldState.guildID].voiceChannel;
        var connection_1 = guilds[oldState.guildID].connection;
        if (channel.voiceMembers.size == 1) {
            guilds[oldState.guildID].leaveTimer = setTimeout(function () {
                connection_1.disconnect();
                connection_1.destroy();
                guilds[oldState.guildID].connection = null;
                guilds[oldState.guildID].voiceChannel = null;
            }, 60 * 1000 * 5);
        }
        else {
            if (guilds[oldState.guildID].leaveTimer != null)
                clearTimeout(guilds[oldState.guildID].leaveTimer);
        }
    }
});
client.on("ready", function () {
    console.log("logged in");
});
client.on('error', function (error) {
    console.error("something went wrong, ".concat(error));
});
// music playback
function playSong(track, guild) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var currentGuild, stream, resource;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    currentGuild = guilds[guild];
                    return [4 /*yield*/, playdl.stream(track.url)];
                case 1:
                    stream = _b.sent();
                    resource = createAudioResource(stream.stream, {
                        inlineVolume: true,
                        inputType: stream.type
                    });
                    (_a = resource.volume) === null || _a === void 0 ? void 0 : _a.setVolume(currentGuild.volume);
                    currentGuild.currentlyPlaying = track.name;
                    currentGuild.audioPlayer.play(resource);
                    return [2 /*return*/];
            }
        });
    });
}
// start commands
var ccommands = new Collection();
client.on('guildCreate', function (guild) {
    guilds[guild.id] = {
        queuedTracks: [],
        connection: null,
        loopType: "none",
        currentTrack: 0,
        voiceChannel: null,
        currentlyPlaying: null,
        audioPlayer: createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        }),
        volume: 0.05,
        leaveTimer: null
    };
    setupGuild(guild);
    client.editStatus("online", [{ type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers' }]);
});
client.on('guildDelete', function (guild) {
    guilds[guild.id].audioPlayer.removeAllListeners();
    delete guilds[guild.id];
    client.editStatus("online", [{ type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers' }]);
});
var commands = [
    {
        data: new builders.ApplicationCommandBuilder(oceanic.ApplicationCommandTypes.CHAT_INPUT, "add-url")
            .setDescription("Add a link to the queue.")
            .addOption({
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            name: "link",
            description: "Link to add.",
            required: true
        })
            .addOption({
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN,
            name: "next",
            description: "Should this song play next? This will either add it in the current playlist, or in the queue.",
            required: false
        }).setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var video, next, provider, embed, ct, nowPlaying, qt, _a, embed, info, title, youtubeadd, yembed, dvid, yvid, deezeradd, dembed, sp_data, search, spotifyadd, spembed, sinfo, sc_add, scembed;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _b.sent();
                            video = interaction.data.options.getString("link", true);
                            next = interaction.data.options.getBoolean("next");
                            provider = getProvider(video);
                            if (!(provider === undefined)) return [3 /*break*/, 3];
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Could not get video/music provider for the link you provided.\n                Does it start with any of the following URLs?\n                https://www.youtube.com\n                https://youtu.be\n                https://soundcloud.com\n                https://on.soundcloud.com\n                https://www.deezer.com\n                https://open.spotify.com");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            if (!interaction.guildID) return [3 /*break*/, 22];
                            ct = guilds[interaction.guildID].currentTrack;
                            nowPlaying = guilds[interaction.guildID].queuedTracks[ct];
                            qt = guilds[interaction.guildID].queuedTracks;
                            _a = provider;
                            switch (_a) {
                                case "youtube": return [3 /*break*/, 4];
                                case "deezer": return [3 /*break*/, 9];
                                case "spotify": return [3 /*break*/, 13];
                                case "soundcloud": return [3 /*break*/, 19];
                            }
                            return [3 /*break*/, 22];
                        case 4:
                            if (!!ytdl.validateURL(video)) return [3 /*break*/, 6];
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Invalid link.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 5: return [2 /*return*/, _b.sent()];
                        case 6: return [4 /*yield*/, ytdl.getInfo(video)];
                        case 7:
                            info = _b.sent();
                            title = info.videoDetails.title;
                            youtubeadd = {
                                type: "song",
                                trackNumber: 0,
                                tracks: [
                                    {
                                        name: title,
                                        url: video
                                    }
                                ]
                            };
                            if (next) {
                                if (nowPlaying.type === "playlist") {
                                    nowPlaying.tracks.push({
                                        name: title,
                                        url: video
                                    });
                                }
                                else {
                                    qt.splice(ct + 1, 0, youtubeadd);
                                }
                            }
                            else {
                                guilds[interaction.guildID].queuedTracks.push(youtubeadd);
                            }
                            yembed = new builders.EmbedBuilder();
                            yembed.setDescription("Added ".concat(title, " to queue."));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [yembed.toJSON()] })];
                        case 8:
                            _b.sent();
                            return [3 /*break*/, 22];
                        case 9: return [4 /*yield*/, playdl.deezer(video)];
                        case 10:
                            dvid = _b.sent();
                            return [4 /*yield*/, playdl.search(dvid.title, {
                                    limit: 1
                                })];
                        case 11:
                            yvid = (_b.sent())[0];
                            deezeradd = {
                                type: "song",
                                trackNumber: 0,
                                tracks: [
                                    {
                                        name: dvid.title,
                                        url: yvid.url
                                    }
                                ]
                            };
                            if (next) {
                                if (nowPlaying.type === "playlist") {
                                    nowPlaying.tracks.push({
                                        name: dvid.title,
                                        url: yvid.url
                                    });
                                }
                                else {
                                    qt.splice(ct + 1, 0, deezeradd);
                                }
                            }
                            else {
                                guilds[interaction.guildID].queuedTracks.push(deezeradd);
                            }
                            dembed = new builders.EmbedBuilder();
                            dembed.setDescription("Added ".concat(dvid.title, " to queue."));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [dembed.toJSON()] })];
                        case 12:
                            _b.sent();
                            return [3 /*break*/, 22];
                        case 13:
                            if (!playdl.is_expired()) return [3 /*break*/, 15];
                            return [4 /*yield*/, playdl.refreshToken()]; // This will check if access token has expired or not. If yes, then refresh the token.
                        case 14:
                            _b.sent(); // This will check if access token has expired or not. If yes, then refresh the token.
                            _b.label = 15;
                        case 15: return [4 /*yield*/, playdl.spotify(video)];
                        case 16:
                            sp_data = _b.sent();
                            return [4 /*yield*/, playdl.search(sp_data.name, { limit: 1 })];
                        case 17:
                            search = (_b.sent())[0];
                            spotifyadd = {
                                type: "song",
                                trackNumber: 0,
                                tracks: [
                                    {
                                        name: sp_data.name,
                                        url: search.url
                                    }
                                ]
                            };
                            if (next) {
                                if (nowPlaying.type === "playlist") {
                                    nowPlaying.tracks.push({
                                        name: sp_data.name,
                                        url: search.url
                                    });
                                }
                                else {
                                    qt.splice(ct + 1, 0, spotifyadd);
                                }
                            }
                            else {
                                guilds[interaction.guildID].queuedTracks.push(spotifyadd);
                            }
                            spembed = new builders.EmbedBuilder();
                            spembed.setDescription("Added ".concat(sp_data.name, " to queue."));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [spembed.toJSON()] })];
                        case 18:
                            _b.sent();
                            return [3 /*break*/, 22];
                        case 19: return [4 /*yield*/, playdl.soundcloud(video)];
                        case 20:
                            sinfo = _b.sent();
                            sc_add = {
                                type: "song",
                                trackNumber: 0,
                                tracks: [
                                    {
                                        name: sinfo.name,
                                        url: video
                                    }
                                ]
                            };
                            if (next) {
                                if (nowPlaying.type === "playlist") {
                                    nowPlaying.tracks.push({
                                        name: sinfo.name,
                                        url: video
                                    });
                                }
                                else {
                                    qt.splice(ct + 1, 0, sc_add);
                                }
                            }
                            else {
                                guilds[interaction.guildID].queuedTracks.push(sc_add);
                            }
                            scembed = new builders.EmbedBuilder();
                            scembed.setDescription("Added ".concat(sinfo.name, " to queue."));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [scembed.toJSON()] })];
                        case 21:
                            _b.sent();
                            return [3 /*break*/, 22];
                        case 22: return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "search")
            .setDescription("Add video(s) from the search results of a specific search term.")
            .addOption({
            name: "term",
            description: "What to search for.",
            required: true,
            type: 3
        })
            .addOption({
            name: "exclude",
            description: "What types of results to exclude.",
            required: false,
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: "playlists",
                    value: "playlist"
                },
                {
                    name: "videos",
                    value: "video"
                }
            ]
        })
            .setDMPermission(false),
        execute: function (interaction) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var term, exclude, results, searches, names, currentVideo, results_1, results_1_1, item, embed, accept, acceptnext, actionRow, actionRow2, pl, vl, vla;
                var e_2, _b;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _c.sent();
                            term = interaction.data.options.getString('term', true);
                            exclude = interaction.data.options.getString('exclude');
                            return [4 /*yield*/, playdl.search(term)];
                        case 2:
                            results = _c.sent();
                            searches = [];
                            names = {};
                            try {
                                for (results_1 = __values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                                    item = results_1_1.value;
                                    if (item.type != "channel" && item.type != exclude) {
                                        embed = new builders.EmbedBuilder();
                                        embed.setThumbnail(item.thumbnails[0].url);
                                        embed.setTitle(item.title);
                                        if (item.uploadedAt)
                                            embed.addField('Uploaded', item.uploadedAt);
                                        if ((_a = item.channel) === null || _a === void 0 ? void 0 : _a.name)
                                            embed.addField("Author", item.channel.name);
                                        if (item.views)
                                            embed.addField("Views", item.views.toString());
                                        if (item.durationInSec)
                                            embed.addField("Duration", humanize(item.durationInSec * 1000));
                                        names[item.title] = {
                                            embed: embed,
                                            url: item.url,
                                            title: item.title
                                        };
                                        // @ts-ignore
                                        if (!currentVideo)
                                            currentVideo = {
                                                embed: embed,
                                                url: item.url,
                                                title: item.title
                                            };
                                        searches.push({ name: item.title });
                                    }
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (results_1_1 && !results_1_1.done && (_b = results_1["return"])) _b.call(results_1);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                            accept = new builders.Button(oceanic.ButtonStyles.PRIMARY, "".concat(interaction.user.id, "Add").concat(term));
                            accept.type = oceanic.ComponentTypes.BUTTON;
                            accept.setLabel("Add video to queue");
                            acceptnext = new builders.Button(oceanic.ButtonStyles.PRIMARY, "".concat(interaction.user.id, "AddNext").concat(term));
                            acceptnext.setLabel("Play this video next");
                            acceptnext.type = oceanic.ComponentTypes.BUTTON;
                            actionRow = utils.SelectMenu(searches, "".concat(interaction.user.id, "Search").concat(term));
                            actionRow2 = new builders.ActionRow();
                            actionRow2.type = oceanic.ComponentTypes.ACTION_ROW;
                            actionRow2.addComponents(accept, acceptnext);
                            pl = function (i) { return __awaiter(_this, void 0, void 0, function () {
                                var values, embed, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            values = i.data.values.getStrings();
                                            embed = names[values[0]].embed;
                                            currentVideo = names[values[0]];
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            // @ts-ignore
                                            return [4 /*yield*/, i.editParent({ components: [actionRow, actionRow2], embeds: [embed.toJSON()] })];
                                        case 2:
                                            // @ts-ignore
                                            _b.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            _a = _b.sent();
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); };
                            vl = function (i) { return __awaiter(_this, void 0, void 0, function () {
                                var youtubeadd, embed, g, ct, t, cst, st;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, i.defer()];
                                        case 1:
                                            _a.sent();
                                            youtubeadd = {
                                                type: "song",
                                                trackNumber: 0,
                                                tracks: [
                                                    {
                                                        name: currentVideo.title,
                                                        url: currentVideo.url
                                                    }
                                                ]
                                            };
                                            guilds[interaction.guildID].queuedTracks.push(youtubeadd);
                                            embed = new builders.EmbedBuilder();
                                            embed.setDescription("Added **".concat(currentVideo.title, "** to queue."));
                                            return [4 /*yield*/, i.editOriginal({
                                                    embeds: [embed.toJSON()]
                                                })];
                                        case 2:
                                            _a.sent();
                                            g = guilds[interaction.guildID];
                                            ct = g.currentTrack;
                                            t = g.queuedTracks[ct];
                                            cst = t.trackNumber;
                                            st = t.tracks[cst];
                                            if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection)
                                                playSong(st, interaction.guildID);
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            vla = function (i) { return __awaiter(_this, void 0, void 0, function () {
                                var g, ct, t, cst, embed;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, i.defer()];
                                        case 1:
                                            _a.sent();
                                            g = guilds[interaction.guildID];
                                            ct = g.currentTrack;
                                            t = g.queuedTracks[ct];
                                            if (t.type === "playlist") {
                                                cst = t.trackNumber;
                                                t.tracks.splice(cst + 1, 0, {
                                                    name: currentVideo.title,
                                                    url: currentVideo.url
                                                });
                                            }
                                            else {
                                                g.queuedTracks.push({
                                                    type: "song",
                                                    trackNumber: 0,
                                                    tracks: [
                                                        {
                                                            name: currentVideo.title,
                                                            url: currentVideo.url
                                                        }
                                                    ]
                                                });
                                            }
                                            embed = new builders.EmbedBuilder();
                                            embed.setDescription("Playing **".concat(currentVideo.title, "** after current track.."));
                                            return [4 /*yield*/, i.editOriginal({
                                                    embeds: [embed.toJSON()]
                                                })];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            // @ts-ignore
                            return [4 /*yield*/, interaction.editOriginal({ components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()] })];
                        case 3:
                            // @ts-ignore
                            _c.sent();
                            utils.LFGIC(client, interaction.guildID, interaction.user.id, "".concat(interaction.user.id, "Search").concat(term), pl);
                            utils.LFGIC(client, interaction.guildID, interaction.user.id, "".concat(interaction.user.id, "Add").concat(term), vl);
                            utils.LFGIC(client, interaction.guildID, interaction.user.id, "".concat(interaction.user.id, "AddNext").concat(term), vla);
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    client.off("interactionCreate", pl);
                                    client.off("interactionCreate", vl);
                                    client.off("interactionCreate", vla);
                                    return [2 /*return*/];
                                });
                            }); }, 120000);
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "clear-queue")
            .setDescription("Clear the queue.")
            .setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var embed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!interaction.guildID) return [3 /*break*/, 3];
                            return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _a.sent();
                            guilds[interaction.guildID].queuedTracks.splice(0, 5000);
                            guilds[interaction.guildID].audioPlayer.stop(true);
                            guilds[interaction.guildID].currentTrack = 0;
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Cleared queue.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "join")
            .setDescription("Join a VC and start playing tracks if available.")
            .setDMPermission(false),
        execute: function (interaction) {
            var _a, _b, _c, _d, _e;
            return __awaiter(this, void 0, void 0, function () {
                var g, embed_1, ct, qt, cst, qst, string, embed;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _f.sent();
                            if (!((_b = (_a = interaction.member) === null || _a === void 0 ? void 0 : _a.voiceState) === null || _b === void 0 ? void 0 : _b.channelID)) return [3 /*break*/, 5];
                            g = guilds[interaction.guildID];
                            if (!g.connection) return [3 /*break*/, 3];
                            embed_1 = new builders.EmbedBuilder();
                            embed_1.setDescription("I am already in a VC.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed_1.toJSON()] })];
                        case 2: return [2 /*return*/, _f.sent()];
                        case 3:
                            g.connection = client.joinVoiceChannel({
                                channelID: interaction.member.voiceState.channelID,
                                guildID: interaction.guildID,
                                selfDeaf: true,
                                selfMute: false,
                                voiceAdapterCreator: (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.voiceAdapterCreator
                            });
                            g.connection.subscribe(g.audioPlayer);
                            g.connection.on("error", function (error) {
                                var id = interaction.channelID;
                                var ig = interaction.guild;
                                if (ig) {
                                    var c = ig.channels.get(id);
                                    if (c) {
                                        var embed_2 = new builders.EmbedBuilder();
                                        embed_2.setDescription("Connection had an error. Error is " + error);
                                        c.createMessage({ embeds: [embed_2.toJSON()] });
                                    }
                                }
                            });
                            ct = g.currentTrack;
                            qt = g.queuedTracks;
                            cst = (_d = qt[ct]) === null || _d === void 0 ? void 0 : _d.trackNumber;
                            qst = (_e = qt[ct]) === null || _e === void 0 ? void 0 : _e.tracks;
                            string = "Joined VC <#".concat(interaction.member.voiceState.channelID, ">").concat(qt.length > 0 ? "starting track **".concat(qst[cst].name, "**") : "");
                            embed = new builders.EmbedBuilder();
                            embed.setDescription(string);
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 4:
                            _f.sent();
                            if (qt.length > 0) {
                                playSong(qst[cst], interaction.guildID);
                            }
                            _f.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "pause")
            .setDescription("Pause current track.").setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var g, embed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _a.sent();
                            g = guilds[interaction.guildID];
                            g.audioPlayer.pause();
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Paused track ".concat(g.currentlyPlaying));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "resume")
            .setDescription("Resume current track.").setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var g, embed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _a.sent();
                            g = guilds[interaction.guildID];
                            g.audioPlayer.unpause();
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Resumed track ".concat(g.currentlyPlaying));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "shuffle")
            .setDescription("Shuffle the entire queue or the current playlist.")
            .addOption({
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            required: true,
            name: "type",
            description: "What to shuffle.",
            choices: [
                {
                    name: "playlist",
                    value: "playlist"
                },
                {
                    name: "queue",
                    value: "queue"
                }
            ]
        })
            .setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var shuffleType, g, ct, embed_3, embed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            shuffleType = interaction.data.options.getString("type", true);
                            g = guilds[interaction.guildID];
                            ct = g.queuedTracks[g.currentTrack];
                            if (!(ct.type === "song" && shuffleType === "playlist")) return [3 /*break*/, 2];
                            embed_3 = new builders.EmbedBuilder();
                            embed_3.setDescription("The current track is a song, not a playlist.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed_3.toJSON()] })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            g.audioPlayer.stop(true);
                            g.currentTrack = 0;
                            ct.trackNumber = 0;
                            if (shuffleType === "playlist") {
                                utils.shuffleArray(ct.tracks);
                            }
                            else {
                                utils.shuffleArray(g.queuedTracks);
                            }
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Shuffled queue, now playing ".concat(ct.tracks[0].name, "."));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 3:
                            _a.sent();
                            playSong(ct.tracks[0], interaction.guildID);
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "skip-song")
            .setDescription("Skip the current song.")
            .setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var embed, g, ct, songName;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _a.sent();
                            embed = new builders.EmbedBuilder();
                            g = guilds[interaction.guildID];
                            ct = g.queuedTracks[g.currentTrack];
                            if (ct.type == "song") {
                                songName = ct.tracks[0].name;
                                g.queuedTracks.splice(g.currentTrack, 1);
                                if (g.currentTrack >= g.queuedTracks.length)
                                    ct.trackNumber = 0;
                            }
                            else {
                                songName = ct.tracks[ct.trackNumber].name;
                                ct.tracks.splice(ct.trackNumber, 1);
                                if (ct.trackNumber >= ct.tracks.length)
                                    ct.trackNumber = 0;
                            }
                            embed.setDescription("Skipped song ".concat(songName, "."));
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "skip-playlist")
            .setDescription("Skip the current playlist.")
            .setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var embed, g;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _a.sent();
                            embed = new builders.EmbedBuilder();
                            g = guilds[interaction.guildID];
                            g.queuedTracks.splice(g.currentTrack, 1);
                            if (g.currentTrack >= g.queuedTracks.length)
                                g.currentTrack = 0;
                            embed.setDescription("Skipped current playlist.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "loop")
            .setDescription("Loop a specific part of the queue.")
            .addOption({
            type: 3,
            name: 'type',
            description: "What do you want to loop?",
            choices: [
                {
                    name: "none", value: "none"
                },
                {
                    name: "song", value: "song"
                },
                {
                    name: "playlist", value: "playlist"
                },
                {
                    name: "queue", value: "queue"
                }
            ],
            required: true
        }).setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var choice, g, embed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _a.sent();
                            choice = interaction.data.options.getString("type", true);
                            g = guilds[interaction.guildID];
                            embed = new builders.EmbedBuilder();
                            embed.setDescription(loopTypeStrs[choice]);
                            g.loopType = choice;
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "leave")
            .setDescription("Leave the current VC.")
            .setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var g, embed, embed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _a.sent();
                            g = guilds[interaction.guildID];
                            if (!g.connection) return [3 /*break*/, 3];
                            g.connection.disconnect();
                            g.connection.destroy();
                            g.voiceChannel = null;
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Disconnected.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("I am not in a VC.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "add-playlist")
            .setDescription("Add a playlist to the queue.")
            .addOption({
            name: 'playlist',
            description: "The playlist to add. Can also be a channel URL.",
            required: true,
            type: 3
        })
            .addOption({
            name: "shuffle",
            description: "Should the playlist be shuffled before being added to queue?",
            required: false,
            type: 5
        })
            .setDMPermission(false),
        execute: function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var playlist, shuffle, embed_4, videos, added_playlist, _a, _b, video, obj, embed, g, ct, t, cst, st;
                var e_3, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, interaction.defer()];
                        case 1:
                            _d.sent();
                            playlist = interaction.data.options.getString("playlist", true);
                            shuffle = interaction.data.options.getBoolean("shuffle");
                            if (!!ytpl.validateID(playlist)) return [3 /*break*/, 3];
                            embed_4 = new builders.EmbedBuilder();
                            embed_4.setDescription("Invalid playlist link.");
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed_4.toJSON()] })];
                        case 2:
                            _d.sent();
                            _d.label = 3;
                        case 3: return [4 /*yield*/, ytpl(playlist)];
                        case 4:
                            videos = _d.sent();
                            added_playlist = {
                                trackNumber: 0,
                                tracks: [],
                                type: "playlist"
                            };
                            try {
                                for (_a = __values(videos.items), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    video = _b.value;
                                    obj = {
                                        name: video.title,
                                        url: video.url
                                    };
                                    added_playlist.tracks.push(obj);
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                            if (shuffle)
                                utils.shuffleArray(added_playlist.tracks);
                            embed = new builders.EmbedBuilder();
                            embed.setDescription("Added **".concat(videos.items.length, " tracks** to the queue as a playlist."));
                            g = guilds[interaction.guildID];
                            g.queuedTracks.push(added_playlist);
                            ct = g.currentTrack;
                            t = g.queuedTracks[ct];
                            cst = t.trackNumber;
                            st = t.tracks[cst];
                            if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection)
                                playSong(st, interaction.guildID);
                            return [4 /*yield*/, interaction.editOriginal({ embeds: [embed.toJSON()] })];
                        case 5:
                            _d.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    }
];
client.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, guild, commands_1, commands_1_1, command, e_4_1;
    var e_5, _c, e_4, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                try {
                    // add all guilds
                    for (_a = __values(client.guilds.entries()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        guild = _b.value;
                        guilds[guild[1].id] = {
                            queuedTracks: [],
                            connection: null,
                            loopType: "none",
                            currentTrack: 0,
                            voiceChannel: null,
                            currentlyPlaying: null,
                            audioPlayer: createAudioPlayer({
                                behaviors: {
                                    noSubscriber: NoSubscriberBehavior.Pause
                                }
                            }),
                            volume: 0.05,
                            leaveTimer: null
                        };
                        setupGuild(guild[1]);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                _e.label = 1;
            case 1:
                _e.trys.push([1, 6, 7, 8]);
                commands_1 = __values(commands), commands_1_1 = commands_1.next();
                _e.label = 2;
            case 2:
                if (!!commands_1_1.done) return [3 /*break*/, 5];
                command = commands_1_1.value;
                console.log("creating global command ".concat(command.data.name));
                ccommands.set(command.data.name, command);
                // @ts-ignore
                return [4 /*yield*/, client.application.createGlobalCommand(command.data)];
            case 3:
                // @ts-ignore
                _e.sent();
                console.log("created global command ".concat(command.data.name));
                _e.label = 4;
            case 4:
                commands_1_1 = commands_1.next();
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 8];
            case 6:
                e_4_1 = _e.sent();
                e_4 = { error: e_4_1 };
                return [3 /*break*/, 8];
            case 7:
                try {
                    if (commands_1_1 && !commands_1_1.done && (_d = commands_1["return"])) _d.call(commands_1);
                }
                finally { if (e_4) throw e_4.error; }
                return [7 /*endfinally*/];
            case 8:
                client.editStatus("online", [{ type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers' }]);
                return [2 /*return*/];
        }
    });
}); });
// @ts-ignore
client.on('interactionCreate', function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var command, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                command = ccommands.get(interaction.data.name);
                if (!command)
                    return [2 /*return*/];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 8]);
                return [4 /*yield*/, command.execute(interaction)];
            case 2:
                _a.sent();
                return [3 /*break*/, 8];
            case 3:
                error_1 = _a.sent();
                if (error_1)
                    console.error(error_1);
                if (!!interaction.acknowledged) return [3 /*break*/, 5];
                return [4 /*yield*/, interaction.createFollowup({ content: "There was an error while executing this command, error is ".concat(error_1) })];
            case 4:
                _a.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, interaction.editOriginal({ content: "There was an error while executing this command, error is ".concat(error_1) })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// finally, connect the client
client.connect();
