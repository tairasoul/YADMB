import addonUtils from "./dist/addon.utils.js";

const connection = new WebSocket(`ws://localhost:2567`);

/**
 * @type {addonUtils}
 */

let utils;

connection.addEventListener("open", () => connection.send(JSON.stringify({request: "readAddons"})))
connection.addEventListener("message", (ev) => {
    const parsed = JSON.parse(ev.data);
    if (parsed.response == "readAddons") {
        utils = new addonUtils(parsed.addons, connection);
    }
})

function createSong(thumbnailUrl, title, artist) {
    const playlist = document.getElementById("playlist");
    const container = document.createElement('div[class="player-container"]');
    const thumbnailDiv = document.createElement('div[class="thumbnail]');
    const thumbnail = document.createElement(`img[src=${thumbnailUrl}]`);
    const songInfo = document.createElement('div[class="song-info" draggable="true"]');
    const songTitle = document.createElement('p[class="song-title"]');
    const songArtist = document.createElement('p[class="artist"]');
    const removeDiv = document.createElement('div[class="remove"]');
    const removeButton = document.createElement('button[class="remove-button" onclick="removeElement(this)"]');
    songTitle.textContent = title;
    songArtist.textContent = artist;
    thumbnail.parentElement = thumbnailDiv;
    songTitle.parentElement = songInfo;
    songArtist.parentElement = songInfo;
    thumbnailDiv.parentElement = container;
    songInfo.parentElement = container;
    removeButton.parentElement = removeDiv;
    removeDiv.parentElement = container;
    container.parentElement = playlist;
}

document.addSong = async (/** @type {string} */text) => {
    const resolvers = await utils.getAvailableResolvers(text);
    console.log(resolvers);
    if (resolvers.length === 0) {
        const error_modal = document.getElementById("error-modal");
        error_modal.querySelector("label").textContent = `No resolvers found for URL ${text}`;
        error_modal.style.display = "flex";
        return;
    }
    /** @type {import("./dist/types").WebInfo} */
    let output;
    for (const resolver of resolvers) {
        output = await resolver.webResolver(text);
        if (output) {
            break;
        }
    }
    createSong(output.songThumbnail, output.songName, output.songArtist)
}