# todo 

- add capability to filter with regex to add-playlist and add-search
  - won't be too hard as then i just have to add an optional argument
 
- add more view-queue options
  - for example, making it so you can import a playlist and concat it with a viewed playlist
  - moving a song around the queue
  - exporting playlist
  - others (suggest in issues)
 
- add optional DJ role (if specified, only that role can use commands)

- rewrite the commands that use pages, so the PageHolder class is ACTUALLY used
  - currently bot.ts handles the paging instead of just.. using the functions
 
- instead of paging at command execute time, page when a song is added and add some embeds for each song if playlist
  - this means live-updating view-queue will be easier
  - and it wont take as much time to do view-queue

- partial code rewrites
  - rewrite 2
    - make more util functions (or maybe just more classes) to handle more things
    - for example, paging. paging is currently mostly done by the command itself, only having some functions generate pages for it.
    - paging may be done easier if it's mapped internally instead of within just the command.

- dynamic import system (?)
  - the idea i have in mind is:
    - you are making an addon, and need certain npmjs packages
    - you declare those in a packages.json file, and if the bot doesn't already have that package version or higher installed it'll install it.
    - if it's a strict version, and you NEED that specific version, it'll install it in the folder the addon is in.
    - if one of the packages goes unused (not declared in any packages.json file) it'll uninstall it

# in progress

# finished + comments

- addons
  - i had an idea very suddenly and it seems interesting so im working on it
  - basically, a way to create custom addons, ~~alongside patching some of my own methods~~ and adding commands.
  - this may be difficult as i have NO clue how to do it but fuck it we ball
  - idk how useful this'll be but fuck it
  - the idea is to make it so you don't have to depend on me or a fork of my bot to add support for a platform
  - instead, if you have coding experience you can just make an addon and add it in
 
- partial code rewrites
  - rewrite 1
    - instead of having A LOT of things handled in bot.ts, move some things over to seperate classes
    - for example, make a Client class extension that has all the queue shit internally.
    - also have an internal command collection, and an easy way to seperate all the commands into seperate files instead of needing to have them all in the same file.
    - this will make it so bot.ts isn't as bloated as it is right now, and will make it easier to expand later on
    - another thing it will have is custom crucial events (ex. a custom InteractionCreate event that passes the guild's info to it aswell)
    - this will make it so each command can do whatever it needs to do with the queue, without actually accessing anything outside of the arguments given by the event.

- add a edit-playlist command
  - just added it cause i thought it'd be pretty dumb to have create-playlist and no way to edit a playlist

- switch to a seperate QueueHandler class
  - makes it a LOT cleaner than whatever bs i had before

- add a progress command
  - does not update live
  - shows how long is remaining
  - shows the thumbnail (if possible, i'm having issues with showing thumbnail in add-search)
  - shows song name, author, likes, views

- add a server-info command
  - gives info about the server as seen within the music bot, so queued tracks, volume, all that
  - getting opinions on how it looks atm, will be finished later

- find and fix some final bugs with the current queue system
    - the new queue system has a few bugs left due to the fact it's now more of just adding mini-queues and not singular links
    - it should be completely functional now

- command to view current queue
  - made different pager functions
  - page handling is done in bot.ts

- fix the issue where it sometimes just stops the current song and plays the next one
  - need to add support for soundcloud and spotify next
 
- make it so you can skip a whole playlist or just a single song
  - reworked music system but it introduced a few bugs, those will be fixed

- migrate from local filesystem to directly streaming from youtube 
  - i am not sure if it still gets rate-limited, we'll have to fuck around and find out to see

- add a command to search for channels/playlists (alternate version of add-search)
  - play-dl does this

- ~~no longer uses ytdl, instead uses youtube-dlsr~~ wasn't good either, now play-dl

- (maybe) make a c++ program that'll guide you through each step of getting this to run
  - available at [this repo](https://github.com/fheahdythdr/discord-music-bot-setup)

- auto-leave after 5 minutes of being alone in a vc or when alone in vc
  - this was originally implemented as "leave when alone in vc" but oceanic.js doesn't make the old vc status contain the channel the user was in
  - solved by storing the old channel upon joining within the guild data
  
- shuffle command
  - randomly shuffles each song in the list

- hopefully increase the speed of add-playlist
  - no longer tells you every song added, was very unnecessary
 
- rewrite
  - done rewriting
  - old code had parts from 7 months ago and i wanted to change up the queue system a lil bit

# cancelled + reason

- change libraries from ytdl to use [youtube-stream-url](https://www.npmjs.com/package/youtube-stream-url)
  - the resulting url doesn't work

# known issues + potential fixes

- sometmies doesn't properly connect to VC, causing you to have to do /join again
  - after joining, check if it properly connected, if not retry
