# Changelog for discord-music-bot

Move away from LZWCompress, since it is unable to encode non-latin1 characters. This is an issue when it comes to a decent amount of songs and your use case.

Some covers on Youtube include non-latin1 characters, meaning you wouldn't be able to export a playlist if even 1 track had a non-latin1 character.

This fixes that, meaning there should be no more errors when trying to make a playlist and export it.
