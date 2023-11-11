# Changelog for discord-music-bot

Turns out, it was not LZWCompress.

base-64 was the issue, so i changed to js-base64.

I will stay on just encoding a JSON.stringify() string though.