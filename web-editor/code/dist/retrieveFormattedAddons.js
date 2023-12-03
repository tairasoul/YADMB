export function retrieveAddonProperties(addon) {
    switch (addon.type) {
        case "audioResourceResolver":
            return addon.resourceResolvers;
        case "playlistDataResolver":
            return addon.playlistResolvers;
        case "playlistThumbnailResolver":
            return addon.thumbnailResolvers;
        case "songThumbnailResolver":
            return addon.thumbnailResolvers;
        case "songDataResolver":
            return addon.dataResolvers;
        case "songResolver":
            return addon.resolvers;
        case "command":
            return addon.commands;
        case "pagerAddon":
            return addon.pagers;
    }
}
export function hasResolvers(addon) {
    switch (addon.type) {
        case "audioResourceResolver":
        case "playlistDataResolver":
        case "playlistThumbnailResolver":
        case "songThumbnailResolver":
        case "songDataResolver":
        case "songResolver":
            return true;
        default:
            return false;
    }
}
