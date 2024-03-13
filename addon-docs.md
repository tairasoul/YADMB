# Addon documentation.

First, start by installing [yadmb-types](https://www.npmjs.com/package/yadmb-types?activeTab=readme) from npmjs.

These types are used for autocomplete.

## Project setup

The only files you actually need will be a .js file, however if you plan to use custom libs within your addon, make an exclusions.json in the root and add the path of the files.

An addon looks something like [this base addon](https://github.com/tairasoul/YADMB/blob/main/addons/base/src/addon.ts).

You can use [this template](https://github.com/tairasoul/yadmb-addon-template) as a base.

## Resolver types

Addons have 7 types of resolvers, those being:

### Audio resolvers

Audio resolvers handle creating audio resources that the player can play.

They must also return information that commands like /progress can use.

### Provider resolvers

Provider resolvers simply resolve to the name of the song provider (ex. youtube, soundcloud, spotify).

They are only there to verify that the platform given is a valid platform.

If you do not add these in, all other resolvers won't work.

### Song data resolvers

Song data resolvers simply resolve a URL of a song into a table, containing the URL and the title of the song.

The URL should be playable through one of the audio resolvers, otherwise an error will get thrown when the queue system tries to play the song.

### Web data resolvers

Web data resolvers resolve a URL into songArtist, songName, songThumbnail and songUrl. This gets used by the web-ui to create elements the user can rearrange and interact with to create a custom playlist.

### Pagers

Pagers resolve a URL and an index into usable data for view-queue, and any other potential addon commands.

Check out [the base pagers](https://github.com/tairasoul/YADMB/blob/main/addons/base/src/resolvers/pagers.ts) to see how they look.

### Playlist data resolvers

Playlist data resolvers resolve a playlist URL into a table, containing an array called items that contains all the song data, and the title of the playlist.

## Commands

Addons can also contain commands.

Commands are simple / commands, that work the same as the built in commands.

They get the same parameters and have the same capabilities.

You can take a look at any command in the src/commands folder to see how one should be structured.

## Module dependencies

An addon can declare dependencies through a packages.json file.

If you need a specific version of an NPM module, include it in the addon and add the module's dependencies into packages.json

For example, if you need, say, the ws module, packages.json should look like this:
```json
[
    "ws"
]
```

The bot will automatically install the package, and uninstall it once no addons use it anymore.

## Caching data

For the types of addons that have the global cache passed in, it's fairly simple.

You get data (or null if no data exists or existing data is invalid) for a specific id by doing:
```ts
// End the first string with -___-data, replacing ___ with the type of data.
// If you're caching playlist data, end it with -playlist-data.
// If you're caching song data, end it with -song-data.
// If you're caching a queued item's data, end it with -queued-pager-data.
// If you're caching an individual track's data (trackPager), end it with -track-pager-data.
// Or, if you wish to cache all types of data on any initial request for a track, don't end it with -___-data.
// This does mean that the first time that data gets requested, it'll take longer, but it means that any subsequent requests for the data will be very quick.
// This way no data ends up overlapping.
const data = await cache.get("service-name", "song-id")
```

The data has 3 properties.

id - a string containing the unique identifier for the track

title - a string with the track's name

extra - a key-value pair of any extra data. gets turned into json when caching, gets parsed when calling .get()

Use extra to store any extra data you may need, like tracks (for playlists) or thumbnails (for pagers).

In order to cache data, do:
```ts
await cache.cache("service-name", {
    id: "song-id", // Any identifier you'll use in your addon.
    title: "song-title", // The title of the song.
    extra: {
        // Any extra information you wish to store.
        // Keep in mind this does get turned into JSON, but does get parsed automatically when doing cache.get();
    }
})
```

If you want to uncache data, call `await cache.uncache("service-name", "song-id")`

If you want to remove all invalid data from your service, call `await cache.removeInvalidFromTable("service-name")`

