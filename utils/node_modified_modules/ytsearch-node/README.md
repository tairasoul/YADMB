# ytsearch-node

[![NPM version](https://img.shields.io/npm/v/ytsearch-node.svg?maxAge=3600)](https://www.npmjs.com/package/ytsearch-node)



ytsearch-node is a js only package that allows you make typical YouTube search. It doesn't require any API keys or account login.

A Runkit Simulation for this package can be found [here](https://runkit.com/only1drhex/ytsearch-node)

# Installation

``` pip
npm install ytsearch-node 
```







# Usage

``` js
const ytsearch = require('ytsearch-node');

const results = await ytsearch("Black Panther");
for(i=0;i<6;i++) console.log(results[i].title, results[i].shortViewCount)


Marvel Studios' Black Panther - Official Trailer 50.5M

Wakanda Battle - "I'm Not Dead" Scene - Black Panther Returns - Black Panther (2018) Movie Clip 19.9M

Hiding in the Shadows | The Real Black Panther | National Geographic Wild UK 4.2M

Meet The K2 Black Panther – One Of The World’s Best Tanks (Not Made In the USA) 13K

(Black Panther) Best Action Hollywood Blockbuster Movie in Hindi Full Action HD 633.7K

Black Panther - Car Chase Scene -  Movie clip Epic  4k UHD 428.8K




 ```
