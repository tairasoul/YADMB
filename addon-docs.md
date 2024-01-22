# Addon documentation.

First, start by installing [yadmb-types](https://www.npmjs.com/package/yadmb-types?activeTab=readme) from npmjs.

These types are used for autocomplete.

## Project setup

The only files you actually need will be a .js file, however if you plan to use custom libs within your addon, make an exclusions.json in the root and add the path of the files.

An addon looks something like [this base addon](https://github.com/tairasoul/YADMB/blob/main/addons/base/src/addon.ts).

You can use [this template](https://github.com/tairasoul/yadmb-addon-template) as a base.

## Addon types

You have 7 types of addons:

- Custom commands

- Audio resolvers

- Provider resolvers

- Song data resolvers

- Web data resolvers (for the web-ui)

- Pagers

and finally,

- Playlist data resolvers

## Resolver types

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

Check out [the base pagers](https://github.com/tairasoul/YADMB/blob/main/addons/base/src/pagers.ts) to see how they look.

### Playlist data resolvers

Playlist data resolvers resolve a playlist URL into a table, containing an array called items that contains all the song data, and the title of the playlist.

## Commands

Commands are simple / commands, that work the same as the built in commands.

They get the same parameters and have the same capabilities.

You can take a look at any command in the rework/commands folder to see how one should be structured.

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