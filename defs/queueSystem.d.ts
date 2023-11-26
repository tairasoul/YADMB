import voice from "@discordjs/voice";
import { queuedTrack, loopType } from "./client.js";
import { infoData } from "./addonLoader.js";
import ResolverUtils from "./resolverUtils.js";
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
    nextTrack(): import("./client.js").track | null | undefined;
    skip(): Promise<import("./client.js").track | null | undefined>;
    pause(): boolean;
    resume(): boolean;
    play(resolvers: ResolverUtils): Promise<void>;
}
