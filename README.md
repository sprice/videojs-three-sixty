# Three Sixty

A Video.js plugin for 360 degree spherical video.

## Usage

Include `three.js` and `DeviceOrientationControls.js`[0] along with `video.js`.

```js
  var player = videojs('example-video');
  player.ThreeSixty({
    width: 1280,             // Renered screen width
    height: 720,            // Rendered screen height
    projection: 'cube_map',  // Allowed values are `equirectangular` and `cube_map`
    edge: 540                // When using `cube_map`, the length of the cube edge
  });
```

[0] [DeviceOrientationControls.js](https://github.com/sprice/device-orientation-controls)

## Cube map

This is experimental at the moment. Lines are noticible along edges.

Assumes video encoded from equirectangular projection with the [Facebook Transform ffmpeg filter](https://github.com/facebook/transform)
