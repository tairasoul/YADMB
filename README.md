# Yet Another Discord Music Bot
a music bot because i got bored and made one

started in december 2022, this is one of the projects i've been working on the longest.

if you encounter any problems or have any suggestions, open an issue.

if you want a different, probably more stable music bot, check out [jagrosh's music bot](https://github.com/jagrosh/MusicBot)

# installing addons

installing addons is as simple as putting their provided file or folder into dist/addons, and making sure the bot runs correctly!

# addon docs

addon docs can be found [here](https://github.com/tairasoul/YADMB/blob/main/addon-docs.md)

# how to use

simply install all the required packages, change your-token to your bot's token in config.json, and run node dist/bot

OR

use [this installer](https://github.com/fheahdythdr/discord-music-bot-setup/releases/tag/v1.2.0)

# debugging

to enable logging of more debug-related information, create a file called enableDebugging (no extension) in dist/

# installers

linux and windows are now supported with [the latest release](https://github.com/tairasoul/discord-music-bot-setup/releases/tag/v1.2.0)

download discord-music-bot-installer-linux if on linux, otherwise discord-music-bot-installer-windows.rar

# Changelog

Changelog has been moved to [changelog.md](https://github.com/tairasoul/YADMB/blob/main/changelog.md)

# features

- you can set the volume to whatever (yes, this means you can destroy your friend's eardrums)

- you can add an entire playlist or channel

- add songs from youtube, spotify, soundcloud and deezer (not sure how well they will work since im just using default play-dl)

- can create custom playlists
    - these playlists are saved on your pc, with each playlist being its own file formatted as (username).playlist.(playlst name).export.txt, meaning you don't have to rely on the bot to save it in a reliable manner and it works across multiple instances of the bot

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
