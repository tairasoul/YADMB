import voice from "@discordjs/voice";
import { queuedTrack, loopType } from "./client.js";
import { infoData } from "../types/addonTypes.js";
import ResolverUtils from "./resolverUtils.js";
import { Proxy } from "../types/proxyTypes.js";
import ytdl from "@distube/ytdl-core";
export default class QueueHandler {
    tracks: queuedTrack[];
    private internalLoop;
    internalCurrentIndex: number;
    private audioPlayer;
    private volumeString;
    currentInfo: {
        name: string;
        resource: voice.AudioResource<any>;
        songStart: number;
        info: infoData;
    } | null;
    constructor(guildAudioPlayer: voice.AudioPlayer);
    setLoopType(loopType: loopType): void;
    setVolume(volumeString: string): void;
    get loopType(): loopType;
    get volume(): string;
    resetIndex(): void;
    clearQueue(): void;
    nextTrack(): queuedTrack | import("./client.js").track | null;
    skip(): Promise<void>;
    pause(): boolean;
    resume(): boolean;
    play(resolvers: ResolverUtils, proxyInfo: Proxy | undefined, authenticatedAgent: ytdl.Agent | undefined): Promise<void>;
}
