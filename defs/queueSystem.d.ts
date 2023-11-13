import voice from "@discordjs/voice";
import { InfoData } from "play-dl";
type track = {
    name: string;
    url: string;
};
type loopType = "none" | "queue" | "song" | "playlist";
type queuedTrack = {
    type: "playlist" | "song";
    tracks: track[];
    trackNumber: number;
    name: string;
};
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
        info: InfoData;
    } | null;
    constructor(guildAudioPlayer: voice.AudioPlayer);
    setLoopType(loopType: loopType): void;
    setVolume(volumeString: string): void;
    get loopType(): loopType;
    get volume(): string;
    nextTrack(): track | null | undefined;
    skip(): Promise<track | null | undefined>;
    pause(): boolean;
    resume(): boolean;
    play(): Promise<false | undefined>;
}
export {};
