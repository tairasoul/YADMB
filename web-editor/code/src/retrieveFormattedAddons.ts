import { AddonInfo } from "./addonTypes";

export function retrieveAddonProperties(addon: AddonInfo) {
    /*switch(addon.type) {
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
    }*/
    if (addon.data.resolvers) {
        return addon.data.resolvers;
    }
}

export function hasResolvers(addon: AddonInfo) {
   if (addon.data) {
        if (addon.data.resolvers) 
            return true;
    }
    return false;
}
