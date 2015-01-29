# "Game Base Code"

## Description

I'm not going to insult the internet by calling this a game engine. What it is is some fairly useful Three.JS boilerplate that can be used for building exciting WebGL type things, with a few things that makes making games a bit easier.

- A slightly more impressive rendering pipeline that makes it easy to add bloom, glow effects etc.
- Various other libraries related to animation loops, easing etc already imported
- An input aggregator
- An asset loader
- A vaguely useful and performant particle engine
- a vaguely useful and powerful camera control thing
- A text-to-texture thing for creating HUDs etc.

Specific to game stuff, this also contains:

- Blender Quad geometry -> SAT Polygons
- Spatial hash grid

## Usage

To build this code you need browserify. Typically you'd do

~~~sh
$ browserify src/entry.js --debug -o public/scripts/build.js
~~~

This generates the output file along with source maps. Source maps will be deleted when you do a minification.

## The main loop

The main loop is in `entry.js`, line 47. This runs every animation frame, sorts out some time information and calls the pipeline renderer to actually draw a frame

`src/lib/pipeline.js` is where most of the post-processing is set up. You can add/remove and disable/enable various filters etc.

## Input aggregator

`src/lib/input-aggregator.js` handles DOM events and turns these into a queriable object so that each tick you can figure out what's being pressed or not.0

## Asset loading

`src/lib/load-all-assets.js` is an asset pre-loader. By default entry.js waits until this has run before beginning the program proper. The main program gets this object which contains all the assets and its' then up to it to decide where and how to deal with it.

## Collision Detection Stuff

Currently undocumented. `src/lib/hshg.js` is a grid system for broad phase collision detection, and then there's `sat` which is installed as an npm module, this is for narrow phase collision detection. The SAT stuff can handle arbitrary convex polygons, circles and boxes. I need to document this and it's possible I need to patch the HSHG.js file because in this repo it doesn't allow you to set entities as static and therefore unable to collide with each other. 

## Other Misc Undocumented Crap

I apologise in advance. I don't expect anyone to use this stuff, by the way.
