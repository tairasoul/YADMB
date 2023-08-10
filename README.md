# discord-music-bot
a music bot because why not

# how to use

simply install all the required packages, change your-token to your bot's token in config.json, and run node bot.mjs

OR

use [this installer](https://github.com/fheahdythdr/discord-music-bot-setup/releases/tag/v1.1.0)

# installers

linux and windows are now supported with [the latest release](https://github.com/fheahdythdr/discord-music-bot-setup/releases/tag/v1.1.0)

download discord-music-bot-installer-linux if on linux, otherwise discord-music-bot-installer-windows.rar

# extra information

~~this bot stores all music played in a local folder, so it doesn't have to keep streaming to youtube.~~

~~if you have a workaround that works universally, feel free to implement it and create a pull request~~

~~if you have a workaround that only works on your end, feel free to try to implement it on your local files~~

this bot no longer stores it locally.

if you want it to store locally, easiest way is to go to an earlier commit

# changelog

added import/export, fixed up a few commands.
working on new command

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

# other features

## multi server

this bot will in fact work in multiple servers. the old original source was only for 1 server with me and my friends, after that i adapted it to be multi server, and now i've moved it over to using oceanic.js
