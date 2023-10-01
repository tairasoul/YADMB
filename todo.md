# todo 

- add a progress command
  - updates live, stops updating when someone uses it again (or just deletes and sends it again if a music commands channel is specified)
  - shows how long is remaining
  - shows the thumbnail (if possible, i'm having issues with showing thumbnail in add-search)
  - shows song name, author, likes, views

- add capability to filter with regex to add-playlist and add-search
  - won't be too hard as then i just have to add an optional argument
 
- add more view-queue options
  - for example, making it so you can import a playlist and concat it with a viewed playlist
  - moving a song around the queue
  - exporting playlist
  - others (suggest in issues)
 
- add optional DJ role (if specified, only that role can use commands)

- add a server-info command
  - gives info about the server as seen within the music bot, so queued tracks, volume, all that

# in progress

# finished + comments

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
  - 
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
