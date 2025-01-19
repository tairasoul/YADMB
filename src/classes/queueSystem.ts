import voice from "@discordjs/voice";
import util from "node:util";
import utils from "../utils.js"
import { queuedTrack, loopType } from "./client.js";
import { infoData } from "../types/addonTypes.js";
import ResolverUtils from "./resolverUtils.js";
import { debugLog } from "../bot.js";
export default class QueueHandler {
    public tracks: queuedTrack[] = [];
    private internalLoop: loopType = "none";
    public internalCurrentIndex: number = 0;
    private audioPlayer: voice.AudioPlayer;
    private volumeString: string = "100%";
    public currentInfo: {
        name: string;
        resource: voice.AudioResource<any>;
        songStart: number;
        info: infoData;
    } | null = null;

    constructor(guildAudioPlayer: voice.AudioPlayer) {
        this.audioPlayer = guildAudioPlayer;
    }

    setLoopType(loopType: loopType) {
        this.internalLoop = loopType;
    }

    setVolume(volumeString: string) {
        this.volumeString = volumeString;
        this.currentInfo?.resource.volume?.setVolume(utils.parseVolumeString(this.volumeString));
    }

    get loopType() {
        return this.internalLoop;
    }

    get volume() {
        return this.volumeString
    }

    resetIndex() {
        this.internalCurrentIndex = 0;
    }

    clearQueue() {
        this.tracks = [];
        this.resetIndex();
        this.audioPlayer.stop(true);
    }

    nextTrack() {
        const cur = this.tracks[this.internalCurrentIndex];
        if (!cur) {
            return null;
        }
        if (this.internalLoop == "song") {
            return cur;
        }
        if (cur.type == "playlist" && (cur.trackNumber <= cur.tracks.length || this.internalLoop == "playlist")) {
            if (this.internalLoop == "playlist") {
                if (cur.trackNumber >= cur.tracks.length)
                    cur.trackNumber = 0;
            }
            if (this.internalLoop == "none") {
                cur.tracks.splice(0, 1);
            }
            else {
                cur.trackNumber++;
                if (cur.trackNumber >= cur.tracks.length) {
                    if (this.internalLoop == "queue") {
                        cur.trackNumber = 0;
                        this.internalCurrentIndex++;
                    }
                    else {
                        this.tracks.splice(0, 1);
                    }
                }
            }
        }
        else if ((cur.type == "playlist" && cur.trackNumber >= cur.tracks.length) || cur.type == "song") {
            if (this.internalLoop == "queue") {
                this.internalCurrentIndex++;
            }
            else {
                this.tracks.splice(0, 1);
            }
        }
        if (this.internalCurrentIndex >= this.tracks.length) {
            this.internalCurrentIndex = 0;
        }
        const newCurrent = this.tracks[this.internalCurrentIndex];
        if (newCurrent == undefined) {
            return null;
        }
        return newCurrent.tracks[newCurrent.trackNumber];
    }

    async skip() {
        this.audioPlayer.stop(true);
    }

    pause() {
        return this.audioPlayer.pause(true);
    }
    
    resume() {
        return this.audioPlayer.unpause();
    }

    async play(resolvers: ResolverUtils) {
        const currentInternal = this.tracks[this.internalCurrentIndex];
        debugLog("logging queue.play() debug info");
        debugLog(util.inspect(currentInternal, false, 5, true));
        debugLog(this.internalCurrentIndex);
        debugLog(util.inspect(this.tracks, false, 5, true));
        const track = currentInternal.tracks[currentInternal.trackNumber];
        const currentURL = track.url
        const audioResolvers = await resolvers.getAudioResolvers(currentURL);
        let audioResource;
        for (const resolver of audioResolvers) {
            const output = await resolver.resolve(currentURL);
            if (output) {
                audioResource = output;
                break;
            }
        }
        debugLog("logging queue.play() audioResource");
        debugLog(audioResource);
        if (audioResource) {
            audioResource.resource.volume?.setVolume(utils.parseVolumeString(this.volumeString));
            this.audioPlayer.play(audioResource.resource);
            this.currentInfo = {
                name: track.name,
                resource: audioResource.resource,
                songStart: audioResource.info.durationInMs,
                info: audioResource.info
            }
        }
        else {
            throw new Error("No audio resolver could resolve url " + currentURL);
        }
    }
}