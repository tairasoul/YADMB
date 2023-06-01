# discord-music-bot
a music bot because why not

# how to use

simply install all the required packages, change your-token to your bot's token in config.json, and run node bot.mjs

# installers

if you're on windows, i made [this one](https://github.com/fheahdythdr/discord-music-bot-setup/releases/tag/v1.0.0)

if you're on linux, no luck, but it should be pretty easy

run `sudo apt-get install nodejs git`

make a new directory (optional)

run `git clone https://github.com/fheahdythdr/discord-music-bot`

run `cd discord-music-bot`

open config.json and change your-token to your bot's token

run `npm i && cd utils && npm i && cd ..` to install packages for utils folder and main folder

run `node bot.mjs` to start the bot

### notes

seems to sometimes skip a song for no reason or replay it, got no idea why

### extra information

~~this bot stores all music played in a local folder, so it doesn't have to keep streaming to youtube.~~

~~if you have a workaround that works universally, feel free to implement it and create a pull request~~

~~if you have a workaround that only works on your end, feel free to try to implement it on your local files~~

this bot no longer stores it locally.

if you want it to store locally, easiest way is to go to an earlier commit

# changelog

- now uses youtube-dlsr
- fix issue with not sending a message correctly if the user's already in a vc

# commands

## addqueue

adds a link to the queue

## add-search

searches for the specific term provided, and creates an embed with different pages in a select menu, containing each video returned. it gets the same videos as you would when searching for it manually.

## add-playlist

adds every video in a playlist to the queue

## clear-queue

clears the current track queue

## join

joins the VC you are in

## leave

leaves the vc it's in

## loop

loops the song or the queue, depending on which was provided

## pause

pauses the currently playing track

## resume

resumes the currently playing track

## skip

skips the currently playing track

# other features

## multi server

this bot will in fact work in multiple servers. the old original source was only for 1 server with me and my friends, after that i adapted it to be multi server, and now i've moved it over to using oceanic.js
