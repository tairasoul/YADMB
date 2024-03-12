/// <reference types="node" />
import * as oceanic from "oceanic.js";
import ResolverUtils from "./resolverUtils.js";
import { Client, Collection, ClientOptions } from "oceanic.js";
import QueueHandler from "./queueSystem.js";
import voice from "@discordjs/voice";
import * as builders from "@oceanicjs/builders";
import { AddonInfo, AudioResolver, PagerResolver, dataResolver, playlistResolver, resolver, thumbnailResolver } from "./addonTypes.js";
import Cache from "./cache.js";
export type track = {
    name: string;
    url: string;
};
export type loopType = "none" | "queue" | "song" | "playlist";
export type queuedTrack = {
    type: "playlist" | "song";
    tracks: track[];
    trackNumber: number;
    name: string;
};
export type Guild = {
    queue: QueueHandler;
    connection: voice.VoiceConnection | null;
    voiceChannel: oceanic.VoiceChannel | null;
    audioPlayer: voice.AudioPlayer;
    id: string;
    leaveTimer: NodeJS.Timeout | null;
};
export type ResolverInformation = {
    songResolvers: resolver[];
    songDataResolvers: dataResolver[];
    playlistResolvers: playlistResolver[];
    audioResourceResolvers: AudioResolver[];
    songThumbnailResolvers: thumbnailResolver[];
    playlistThumbnailResolvers: thumbnailResolver[];
    pagers: PagerResolver[];
};
export type Command = {
    data: builders.ApplicationCommandBuilder;
    execute: ((interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils;
        guild: Guild;
        client: MusicClient;
        cache: Cache;
    }) => Promise<any>);
};
interface MusicEvents extends oceanic.ClientEvents {
    "m_interactionCreate": [
        interaction: oceanic.CommandInteraction,
        info: {
            resolvers: ResolverUtils;
            guild: Guild;
            client: MusicClient;
            cache: Cache;
        }
    ];
}
interface MClientOptions extends ClientOptions {
    database_path?: string;
    database_expiry_time?: string;
}
export default class MusicClient extends Client {
    m_guilds: {
        [id: string]: Guild;
    };
    commands: Collection<string, Command>;
    readonly addons: AddonInfo[];
    private resolvers;
    private addonCommands;
    private rawCommands;
    private cache_database;
    constructor(options: MClientOptions);
    addAddon(addon: AddonInfo): void;
    registerAddons(): void;
    registerAddonCommands(): void;
    loadCommands(): Promise<void>;
    addCommand(name: string, description: string, options: oceanic.ApplicationCommandOptions[] | undefined, callback: (interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils;
        guild: Guild;
        client: MusicClient;
        cache: Cache;
    }) => any): void;
    registerCommands(): Promise<void>;
    removeUnknownCommands(): Promise<void>;
    on<K extends keyof MusicEvents>(event: K, listener: (...args: MusicEvents[K]) => void): this;
    off<K extends keyof MusicEvents>(event: K, listener: (...args: MusicEvents[K]) => void): this;
    addGuild(guild: oceanic.Guild): void;
    removeGuild(guild: oceanic.Guild): void;
}
export {};
