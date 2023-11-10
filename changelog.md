# Changelog for discord-music-bot

Full restructure of how commands are made.

This has been done by using a oceanic.Client extension class (MusicClient) that handles queues, has a custom .on and .off function with m_interactionCreate that has the interaction, guild and the MusicClient sent in.

All commands are now split into seperate files, retaining previous functionality.
