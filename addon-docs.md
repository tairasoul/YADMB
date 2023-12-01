# Addon documentation.

First, start by installing [yadmb-types](https://www.npmjs.com/package/yadmb-types?activeTab=readme) from npmjs.

These types are used for autocomplete.

## Project setup

The only files you actually need will be a .ts file, however if you plan to use custom libs within your addon, make an exclusions.json in the root and add the path of the files.

An addon looks something like [this base addon](https://github.com/tairasoul/YADMB/blob/main/addons/base/src/name.ts) used for resolving providers.

You can use [this template](https://github.com/tairasoul/yadmb-addon-template) as a base.

## Addon types

You have 6 types of addons:

- Custom commands

- Audio resolvers

- Provider resolvers

- Song data resolvers

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

### Pagers

Pagers resolve a URL and an index into usable data for view-queue, and any other potential addon commands.

Check out [the base pagers](https://github.com/tairasoul/YADMB/blob/main/addons/base/src/pagers.ts) to see how they look.

### Playlist data resolvers

Playlist data resolvers resolve a playlist URL into a table, containing an array called items that contains all the song data, and the title of the playlist.

## Commands

Commands are simple / commands, that work the same as the built in commands.

They get the same parameters and have the same capabilities.

You can take a look at any command in the rework/commands folder to see how one should be structured.