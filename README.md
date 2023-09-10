# discord-music-bot
a music bot because why not

# how to use

simply install all the required packages, change your-token to your bot's token in config.json, and run node dist/bot

OR

use [this installer](https://github.com/fheahdythdr/discord-music-bot-setup/releases/tag/v1.2.0)

# debugging

to enable logging of more debug-related information, create a file called enableDebugging (no extension) in dist/

# installers

linux and windows are now supported with [the latest release](https://github.com/tairasoul/discord-music-bot-setup/releases/tag/v1.2.0)

download discord-music-bot-installer-linux if on linux, otherwise discord-music-bot-installer-windows.rar

# changelog

add create-playlist

# commands

## add-url

adds a link to the queue

## search

searches for the specific term provided, and creates an embed with different pages in a select menu, containing each video returned. it gets the same videos as you would when searching for it manually.

## add-playlist

adds every video in a playlist to the queue

## clear-queue

clears the current track queue

## shuffle

shuffles the queue

## join

joins the VC you are in

## leave

leaves the vc it's in

## loop

loops the song, the playlist, the queue or nothing, depending on which was provided

## pause

pauses the currently playing track

## resume

resumes the currently playing track

## skip-song

skips the currently playing track

## skip-playlist

skips the currently playing playlist

## export

exports the entire queue or the entire current playlist, sends you a file

save this file for when you want to import it later

## import

import a queue/playlist from a file

## view-queue

view the queue

probably still buggy as hell

## create-playlist

create a custom playlist with custom name

# other features

## multi server

this bot will in fact work in multiple servers. the old original source was only for 1 server with me and my friends, after that i adapted it to be multi server, and now i've moved it over to using oceanic.js
