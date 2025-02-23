import * as oceanic from "oceanic.js";
import ResolverUtils from "./resolverUtils.js";
import { Client, Collection, ClientOptions } from "oceanic.js";
import QueueHandler from "./queueSystem.js";
import voice from "@discordjs/voice";
import * as builders from "@oceanicjs/builders";
import { AddonInfo, AudioResolver, PagerResolver, dataResolver, playlistResolver, resolver, thumbnailResolver } from "../types/addonTypes.js";
import Cache from "./cache.js";
import { Proxy } from "../types/proxyTypes.js";
import ytdl from "@distube/ytdl-core";
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
        proxyInfo: Proxy | undefined;
        authenticatedAgent: ytdl.Agent | undefined;
    }) => Promise<any>);
};
type Autocomplete = {
    command: string;
    execute: (interaction: oceanic.AutocompleteInteraction) => Promise<oceanic.AutocompleteChoice[]>;
};
interface MusicEvents extends oceanic.ClientEvents {
    "m_interactionCreate": [
        interaction: oceanic.AnyInteractionGateway,
        info: {
            resolvers: ResolverUtils;
            guild: Guild;
            client: MusicClient;
            cache: Cache;
            proxyInfo: Proxy | undefined;
            authenticatedAgent: ytdl.Agent | undefined;
        }
    ];
}
interface MClientOptions extends ClientOptions {
    database_path: string;
    database_expiry_time: string;
    database_cleanup_interval: string;
    proxy_cycle_interval: string;
    should_proxy: boolean;
    should_cycle_proxies: boolean;
    use_cookies: boolean;
}
export default class MusicClient extends Client {
    m_guilds: Collection<string, Guild>;
    commands: Collection<string, Command>;
    autocomplete: Collection<string, (interaction: oceanic.AutocompleteInteraction) => Promise<oceanic.AutocompleteChoice[]>>;
    readonly addons: AddonInfo[];
    private resolvers;
    private addonCommands;
    private rawCommands;
    private cache_database;
    private proxyCycle;
    private authenticatedAgent;
    constructor(options: MClientOptions);
    addAddon(addon: AddonInfo): void;
    registerAddons(): void;
    registerAddonCommands(): void;
    loadCommands(): Promise<void>;
    loadAutocomplete(): Promise<void>;
    addAutocomplete(autocomplete: Autocomplete): void;
    addCommand(name: string, description: string, options: oceanic.ApplicationCommandOptions[] | undefined, callback: (interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils;
        guild: Guild;
        client: MusicClient;
        cache: Cache;
    }) => any): void;
    registerCommands(): Promise<void>;
    on<K extends keyof MusicEvents>(event: K, listener: (...args: MusicEvents[K]) => void): this;
    off<K extends keyof MusicEvents>(event: K, listener: (...args: MusicEvents[K]) => void): this;
    addGuild(guild: oceanic.Guild): void;
    removeGuild(guild: oceanic.Guild): void;
}
export {};
