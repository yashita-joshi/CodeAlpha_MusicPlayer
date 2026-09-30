# Spin

A music player I made using HTML, CSS and JavaScript.

## What it does
- Play, pause, next and previous
- Shows song title, artist and duration
- Progress bar you can click or drag to jump to any point
- Volume slider and a mute button
- Playlist: click any song to play it, current song is highlighted
- Autoplay: when one song ends, the next one starts
- Shuffle and repeat-one buttons
- Keyboard: Space to play/pause, left/right to seek, up/down for volume
- Works on phone and laptop screens

## Built with
HTML, CSS and plain JavaScript (the browser's `Audio` object). No libraries.

## How to run
Download or clone the repo and open `index.html` in a browser.

## Adding songs
Put the mp3 files in the `songs` folder and add a line for each in the `PLAYLIST` list at the top of `script.js`.

## Notes
Browsers don't allow audio to start on its own when a page opens, so the first song needs one click on play. After that, autoplay moves through the playlist.
