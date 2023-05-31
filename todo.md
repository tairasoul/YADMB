# todo 

- add optional DJ role (if specified, only that role can use commands)
  - if DJ role is not specified, everyone can use commands
  - if DJ role is specified, give admins capability to specify which commands only DJ's can use and which commands everyone can use

- (maybe) make a c++ program that'll guide you through each step of getting this to run

# in progress



# finished + comments

- migrate from local filesystem to directly streaming from youtube 
  - i am not sure if it still gets rate-limited, we'll have to fuck around and find out to see

- no longer uses ytdl, instead uses yt-stream
  - sometimes seems to skip songs and buffers a bit before playing the next song
  - not sure why, if you have any idea why it sometimes skips songs or buffers please create an issue

# cancelled + reason


- change libraries from ytdl to use [youtube-stream-url](https://www.npmjs.com/package/youtube-stream-url)
  - the resulting url doesn't work
