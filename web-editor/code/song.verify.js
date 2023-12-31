import addonUtils from "./dist/addon.utils.js";

/**
 * @type {addonUtils}
 */

let utils;

const initialSetup = async () => {
    if (!utils) {
        const addons = await (await fetch(`${window.location.protocol}/read-addons`)).json();
        utils = new addonUtils(addons.addons, `${window.location.protocol}`);
    }
}

initialSetup();

function createSong(thumbnailUrl, title, artist, url) {
    console.log(thumbnailUrl, title, artist, url);
    const playlist = document.getElementById("playlist");
    const container = document.createElement('div');
    container.className = "player-container"
    container.setAttribute("url", url);
    container.setAttribute("title", title);
    const thumbnailDiv = document.createElement('div');
    container.draggable = true;
    thumbnailDiv.className = "thumbnail"
    const thumbnail = document.createElement(`img`);
    thumbnail.src = thumbnailUrl
    thumbnail.draggable = false;
    const songInfo = document.createElement('div');
    songInfo.className = "song-info"
    const songTitle = document.createElement('p');
    songTitle.className = "song-title"
    const songArtist = document.createElement('p');
    songArtist.className = "artist"
    const removeDiv = document.createElement('div');
    removeDiv.className = "remove"
    const removeButton = document.createElement('button');
    removeButton.className = "remove-button"
    removeButton.onclick = () => {
        const closest = removeButton.closest(".player-container");
        if (closest) closest.remove();
    }
    songTitle.textContent = title;
    songArtist.textContent = artist;
    thumbnailDiv.appendChild(thumbnail);
    songInfo.appendChild(songTitle);
    songInfo.appendChild(songArtist);
    removeDiv.appendChild(removeButton);
    container.appendChild(thumbnailDiv);
    container.appendChild(songInfo);
    container.appendChild(removeDiv);
    playlist.appendChild(container);
    /*thumbnail.parentElement = thumbnailDiv;
    songTitle.parentElement = songInfo;
    songArtist.parentElement = songInfo;
    thumbnailDiv.parentElement = container;
    songInfo.parentElement = container;
    removeButton.parentElement = removeDiv;
    removeDiv.parentElement = container;
    container.parentElement = playlist;*/
}

window.addSong = async (/** @type {string} */text) => {
    const resolvers = await utils.getAvailableResolvers(text);
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
    console.log(output);
    createSong(output.songThumbnail, output.songName, output.songArtist, output.songUrl)
}

document.exportQueue = async (/** @type {string} */ name) => {
    const elements = document.querySelectorAll(".player-container");
    const exported = {
        name,
        trackNumber: 0,
        type: "playlist",
        tracks: []
    }
    for (const element of elements) {
        const url = element.getAttribute("url")
        const title = element.getAttribute("title");
        exported.tracks.push({url, name: title});
    }
    const encoded = JSON.stringify(exported);
    const b64 = btoa(encoded);

    const blob = new Blob([b64], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `online.playlist.${name}.export.txt`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}