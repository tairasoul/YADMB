export type WebInfo = {
    /**
     * Name of the song.
     */
    songName: string;
    /**
     * Song artist.
     */
    songArtist: string;
    /**
     * Song thumbnail.
     */
    songThumbnail: string;
}

export type WebResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Description of the resolver.
     */
    description: string;
    /**
     * Can this resolver be used for this url?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves a URL into usable info to be displayed.
     */
    webResolver: (url: string) => Promise<WebInfo>;
}

export type AddonInfo = {
    /**
     * Name of the web addon.
     */
    name: string;
    /**
     * Description of the web addon.
     */
    description: string;
    /**
     * Version.
     */
    version: string;
    /**
     * Is this addon private?
     */
    private?: boolean;
    /**
     * Web resolvers.
     */
    resolvers: WebResolver[];
    /**
     * Priority of this resolver.
     */
    priority: number;
}