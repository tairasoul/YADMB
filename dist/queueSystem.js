import fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
import util from "node:util";
import utils from "./utils.js";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`))
    debug = true;
function debugLog(text) {
    if (debug)
        console.log(text);
}
export default class QueueHandler {
    tracks = [];
    internalLoop = "none";
    internalCurrentIndex = 0;
    audioPlayer;
    volumeString = "100%";
    currentInfo = null;
    constructor(guildAudioPlayer) {
        this.audioPlayer = guildAudioPlayer;
    }
    setLoopType(loopType) {
        this.internalLoop = loopType;
    }
    setVolume(volumeString) {
        this.volumeString = volumeString;
    }
    get loopType() {
        return this.internalLoop;
    }
    get volume() {
        return this.volumeString;
    }
    nextTrack() {
        const cur = this.tracks[this.internalCurrentIndex];
        if (this.internalLoop == "song") {
            return;
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
        else if ((cur.type == "playlist" && cur.trackNumber >= cur.tracks.length) || cur.type == "song") {
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
        if (this.tracks[this.internalCurrentIndex].type == "song")
            this.tracks.splice(this.internalCurrentIndex, 1);
        else
            this.tracks[this.internalCurrentIndex].tracks.splice(this.tracks[this.internalCurrentIndex].trackNumber, 1);
        this.audioPlayer.stop(true);
        const track = this.nextTrack();
        return track;
    }
    pause() {
        return this.audioPlayer.pause(true);
    }
    resume() {
        return this.audioPlayer.unpause();
    }
    async play(resolvers) {
        const currentInternal = this.tracks[this.internalCurrentIndex];
        debugLog(util.inspect(currentInternal, false, 5, true));
        debugLog(this.internalCurrentIndex);
        debugLog(util.inspect(this.tracks, false, 5, true));
        const track = currentInternal.tracks[currentInternal.trackNumber];
        const currentURL = track.url;
        const resolver = resolvers.findAudioResolver(currentURL);
        if (resolver) {
            const audioResource = await resolver.resolve(currentURL);
            if (audioResource) {
                audioResource.resource.volume?.setVolume(utils.parseVolumeString(this.volumeString));
                this.audioPlayer.play(audioResource.resource);
                this.currentInfo = {
                    name: track.name,
                    resource: audioResource.resource,
                    songStart: audioResource.info.durationInMs,
                    info: audioResource.info
                };
            }
        }
    }
}
