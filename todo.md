# todo 

- add optional DJ role (if specified, only that role can use commands)
  - if DJ role is not specified, everyone can use commands
  - if DJ role is specified, give admins capability to specify which commands only DJ's can use and which commands everyone can use

- add a progress command
  - updates live, stops updating when someone uses it again (or just deletes and sends it again if a music commands channel is specified)
  - shows how long is remaining
  - shows the thumbnail (if possible, i'm having issues with showing thumbnail in add-search)
  - shows song name, author, likes, views

- shuffle command
  - randomly shuffles each song in the list

- make it so you can skip a whole playlist or just a single song
  - may require a full rework of the music system

- add capability to filter with regex to add-playlist and add-search
  - won't be too hard as then i just have to add an optional argument

- auto-leave after 5 minutes of being alone in a vc or when alone in vc
  - this was originally implemented as "leave when alone in vc" but oceanic.js doesn't make the old vc status contain the channel the user was in

# in progress

# finished + comments

- migrate from local filesystem to directly streaming from youtube 
  - i am not sure if it still gets rate-limited, we'll have to fuck around and find out to see

- no longer uses ytdl, instead uses youtube-dlsr

- (maybe) make a c++ program that'll guide you through each step of getting this to run
  - available at [this repo](https://github.com/fheahdythdr/discord-music-bot-setup)

# cancelled + reason


- change libraries from ytdl to use [youtube-stream-url](https://www.npmjs.com/package/youtube-stream-url)
  - the resulting url doesn't work

# known issues + potential fixes

- cannot skip after clearing queue with no songs left
  - may make clear-queue stop the audio player
