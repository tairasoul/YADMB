# Yet Another Discord Music Bot
a music bot because i got bored and made one

the concept is a decentralized music bot.

no instance of this stores any of your data in the filesystem, everything that is stored on filesystem will be stored on the user's filesystem and not the host machine.

the only data that gets stored is a cache of song data, for faster song/playlist adding and paging.

started in december 2022, this is one of the projects i've been working on the longest.

if you encounter any problems or have any suggestions, open an issue.

the queue system this uses is custom and.. fairly different from other queue systems i've seen

instead of simply being an array of name-url objects (atleast what i used in my initial version), it's basically a queue of mini-queues

each item in the queue is either a single track or an entire playlist.

this means if you want to add a playlist to get your opinion on it, and don't like it, you can just skip the entire thing.

# alternatives i know of

[jagrosh's music bot](https://github.com/jagrosh/MusicBot)

i havent used this much, but it seems a lot better if you don't want a slash-command based bot, and don't want to do more complex setup.

~~in total all it has is 2 files, the .jar and a file w/ the token.~~ nevermind checked the setup and it's got 2 files and 1 folder now, folder being playlists folder.

[YADMB](https://github.com/TheTipo01/YADMB) made by [TheTipo01](https://github.com/TheTipo01) and made with golang instead of ts.

havent tried it out, but it seems interesting, so go check it out!

[TradeW1nd](https://github.com/North-West-Wind/TradeW1nd)

another bot made with ts. looks pretty cool, is a version of N0rthWestW1nd with only it's music functions.

# config info

the template config looks like this:
```json
{
  "token": "Bot your-token",
  "package_manager": {
    "install": "npm install",
    "uninstall": "npm uninstall"
  },
  "cache_path": ":memory:",
  "expiry_time": "3d",
  "check_interval": "1m",
  "proxy": {
    "enableProxies": false,
    "cycling": false,
    "cycleInterval": "1h"
  },
  "cookies": false
}
```

token - the token for the bot. replace your-token with your bot's token.

package_manager - for addons. install is the install command for your package manager, uninstall is the uninstall command for your package manager.

cache_path - the path to the cache database. :memory: means it's in-memory, but if you want to set it to, say, cache.db in the root directory (where this file is), set it to ./cache.db (this is relative to where you run bot.js from, so if you're one directory above it'll put cache.db one directory above)

expiry_time - how long cached info should be valid for

check_interval - how often the bot checks if cached info is valid

proxy - for the proxying system. enableProxies determines if we use a proxy, cycling determines if we cycle through all proxies available in proxies.json, and cycleInterval determines how long it is before we cycle to the next proxy

cookies - use cookies for youtube videos.

# cookies

> [!CAUTION]
> You should never use your personal google account's cookies for downloading videos. Using disposable accounts is recommended, with no link to your personal account or identity.
>
> Use incognito when signing in, and just to be sure, use a VPN or proxy.

To get your cookies, follow [ytdl-core's instructions](https://github.com/distubejs/ytdl-core?tab=readme-ov-file#how-to-get-cookies) and paste the cookies obtained into `cookies.json`

# proxies

## !! WARNING

## Proxies should be functional, but are untested.

## SOCKS5/4 proxies are unsupported, only use HTTPS proxies.

proxies are formatted as follows

```json
{
  "url": "proxy url",
  "port": 5050,
  "auth": "proxyauth"
}
```

auth is optional, and only required if the proxy needs authentication. auth string is in format of "userId:password"

url is the url of the proxy, port is the proxy's port you connect to.


# installing addons

installing addons is as simple as putting their provided file or folder into the addons folder, and making sure the bot runs correctly!

# addon docs

addon docs can be found [here](https://github.com/tairasoul/YADMB/blob/main/addon-docs.md)

# how to use

ffmpeg is required, install ffmpeg if you don't have it

change your-token to your bot's token in config.json, run `npm run setup-npm` or `pnpm setup-pnpm` (depending on your package manager), wait for it to finish and then run dist node/bot.js

# debugging

to enable logging of more debug-related information, create a file called enableDebugging (no extension) in the root directory

# changelog

changelog has been moved to [changelog.md](https://github.com/tairasoul/YADMB/blob/main/changelog.md)

# additional info

if you use pnpm or yarn instead of npm, you'll have to change package_manager.install, uninstall and list in config.json to use the respective variant for your package manager

play-dl is cloned from https://github.com/YuzuZensai/play-dl-test

# features

- you can set the volume to whatever (yes, this means you can destroy your friend's eardrums)

- you can add an entire playlist or channel

- add songs from youtube, soundcloud and deezer
    - you can add songs from more services with addons

- can create custom playlists
    - these playlists are saved on your pc, with each playlist being its own file formatted as (username).playlist.(playlist name).export.txt, meaning you don't have to rely on the bot to save it in a reliable manner and it works across multiple instances of the bot

- edit custom playlists

- export the entire queue or playlist
    - like the queue you currently have? just export it!

- import an exported queue or custom playlist

- loop the song, playlist or queue

- a progress command that gives you time left, total duration, author, likes and views for current song

- search for anything on youtube as long as it's not age-restricted

- skip individual songs or an entire playlist

- view a snapshot of the queue

- make addons if you want support for other services

- caches data about playlists and songs so adding them again doesn't take as long.
    - they have a configurable expiry date, so the database doesnt get too big
