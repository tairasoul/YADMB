# Changelog for YADMB

A few changes here.

First, I have moved all addons into the addons folder, making it easier to access.

Second, defs for the important parts are now in dist/ aswell.

Third, exclusions now work with sub-folders. This means adding src/* will actually exclude the entire src folder and not fail to exclude it.
This means you can also exclude specific files within a folder, say dist/dontInclude.js

There shouldn't be much you have to change about an install.