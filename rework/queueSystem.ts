import voice, { createAudioResource } from "@discordjs/voice";
import fs from "node:fs"
import path from 'path';
import { fileURLToPath } from 'url';
import util from "node:util";
import playdl, { InfoData } from "play-dl";
import utils from "./utils.js"

const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`)) debug = true;

function debugLog(text: any) {
    if (debug) console.log(text)
}

type track = {
    name: string;
    url: string;
}

type loopType = "none" | "queue" | "song" | "playlist";

type queuedTrack = {
    type: "playlist" | "song";
    tracks: track[];
    trackNumber: number;
    name: string;
}

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
        info: InfoData
    } | null = null;

    constructor(guildAudioPlayer: voice.AudioPlayer) {
        this.audioPlayer = guildAudioPlayer;
    }

    setLoopType(loopType: loopType) {
        this.internalLoop = loopType;
    }

    setVolume(volumeString: string) {
        this.volumeString = volumeString;
    }

    get loopType() {
        return this.internalLoop;
    }

    get volume() {
        return this.volumeString
    }

    nextTrack() {
        const cur = this.tracks[this.internalCurrentIndex]
        if (this.internalLoop == "song") {
            return cur.tracks[cur.trackNumber];
        }
        if (cur.type == "playlist" && (cur.trackNumber < cur.tracks.length || this.internalLoop == "playlist")) {
            if (this.internalLoop == "playlist") {
                if (cur.trackNumber >= cur.tracks.length)
                    cur.trackNumber = 0;
            }
            if (this.internalLoop == "none") {
                cur.tracks.splice(0, 1);
            }
            else {
                cur.trackNumber++;
            }
        }
        else if ((cur.type == "playlist" && cur.trackNumber == cur.tracks.length) || cur.type == "song") {
            if (this.internalLoop == "queue") {
                this.internalCurrentIndex++;
            }
            else {
                this.tracks.splice(0, 1);
            }
        }
        const newCurrent = this.tracks[this.internalCurrentIndex];
        if (newCurrent == undefined) {
            return null;
        }
        return newCurrent.tracks[newCurrent.trackNumber];
    }

    async skip() {
        this.audioPlayer.stop(true);
        if (this.tracks[this.internalCurrentIndex].type == "song") this.tracks.splice(--this.internalCurrentIndex, 1);
        else this.tracks[this.internalCurrentIndex].tracks.splice(--this.tracks[this.internalCurrentIndex].trackNumber, 1)
        const track = this.nextTrack();
        return track;
    }

    pause() {
        return this.audioPlayer.pause(true);
    }
    
    resume() {
        return this.audioPlayer.unpause();
    }

    async play() {
        const currentInternal = this.tracks[this.internalCurrentIndex];
        debugLog(util.inspect(currentInternal, false, 5, true));
        debugLog(this.internalCurrentIndex);
        debugLog(util.inspect(this.tracks, false, 5, true));
        const track = currentInternal.tracks[currentInternal.trackNumber];
        if (track == undefined) return false;
        const info = await playdl.video_info(track.url);
        const stream = await playdl.stream_from_info(info);
        const resource = createAudioResource(stream.stream, {
            inlineVolume: true,
            inputType: stream.type
        })
        resource.volume?.setVolume(utils.parseVolumeString(this.volumeString));
        this.audioPlayer.play(resource);
        const duration = info.video_details.durationInSec;
        this.currentInfo = {
            name: track.name,
            resource: resource,
            songStart: duration * 1000,
            info: info
        }
    }
}