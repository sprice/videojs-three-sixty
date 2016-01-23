(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = (function() {
  var c = document.createElement('canvas');
  try {
    return !!window.WebGLRenderingContext
      && (!!c.getContext('experimental-webgl') || !!c.getContext('webgl'));
  } catch (e) {
    return null;
  }
}());

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _threeJs = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _threeJs2 = _interopRequireDefault(_threeJs);

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var _jquery2 = _interopRequireDefault(_jquery);

var _detectorWebgl = require('detector-webgl');

var _detectorWebgl2 = _interopRequireDefault(_detectorWebgl);

var _DeviceOrientationController = (typeof window !== "undefined" ? window['DeviceOrientationController'] : typeof global !== "undefined" ? global['DeviceOrientationController'] : null);

var _DeviceOrientationController2 = _interopRequireDefault(_DeviceOrientationController);

var ThreeSixty = function ThreeSixty(options) {
    var container = this.el();
    var video = this.el().getElementsByTagName('video')[0];
    var scene = undefined;
    var camera = undefined;
    var aspect = options.width / options.height || 16 / 9;
    var renderer = undefined;
    var sizeWidth = options.width;
    var sizeHeight = options.height;
    var controls = undefined;
    var material = undefined;
    var geometry = undefined;
    var screen = undefined;
    var texture = undefined;
    var position = undefined;

    function prepareEquirectangular() {
        geometry = new _threeJs2['default'].SphereGeometry(800, 32, 32);
    }

    function prepareCubeMap() {
        var edge = options.edge;

        // Cube Map frame
        //
        // |-----------------------------------|
        // | rightSide  | leftSide  | topSide  |
        // |-----------------------------------|
        // | bottomSide | frontSide | backSide |
        // |-----------------------------------|
        //
        // Sides map counter-clockwise starting from top-left corner of frame
        // Top and bottom map counter clockwise starting from bottom-right corner of frame

        var thirdLow = 0.3333333333333333;
        var thirdHigh = 0.3333333333333333;
        var sixthLow = 0.6666666666666666;
        var sixthHigh = 0.6666666666666666;

        var rightSide = [new _threeJs2['default'].Vector2(0, 1), new _threeJs2['default'].Vector2(0, 0.5), new _threeJs2['default'].Vector2(thirdHigh, 0.5), new _threeJs2['default'].Vector2(thirdHigh, 1)];
        var leftSide = [new _threeJs2['default'].Vector2(thirdLow, 1), new _threeJs2['default'].Vector2(thirdLow, 0.5), new _threeJs2['default'].Vector2(sixthHigh, 0.5), new _threeJs2['default'].Vector2(sixthHigh, 1)];
        var topSide = [new _threeJs2['default'].Vector2(1, 0.5), new _threeJs2['default'].Vector2(1, 1), new _threeJs2['default'].Vector2(sixthLow, 1), new _threeJs2['default'].Vector2(sixthLow, 0.5)];
        var bottomSide = [new _threeJs2['default'].Vector2(thirdHigh, 0), new _threeJs2['default'].Vector2(thirdHigh, 0.5), new _threeJs2['default'].Vector2(0, 0.5), new _threeJs2['default'].Vector2(0, 0)];
        var frontSide = [new _threeJs2['default'].Vector2(thirdLow, 0.5), new _threeJs2['default'].Vector2(thirdLow, 0), new _threeJs2['default'].Vector2(sixthHigh, 0), new _threeJs2['default'].Vector2(sixthHigh, 0.5)];
        var backSide = [new _threeJs2['default'].Vector2(sixthLow, 0.5), new _threeJs2['default'].Vector2(sixthLow, 0), new _threeJs2['default'].Vector2(1, 0), new _threeJs2['default'].Vector2(1, 0.5)];

        geometry = new _threeJs2['default'].BoxGeometry(edge, edge, edge);

        geometry.faceVertexUvs[0] = [];

        geometry.faceVertexUvs[0][0] = [leftSide[0], leftSide[1], leftSide[3]];
        geometry.faceVertexUvs[0][1] = [leftSide[1], leftSide[2], leftSide[3]];

        geometry.faceVertexUvs[0][2] = [rightSide[0], rightSide[1], rightSide[3]];
        geometry.faceVertexUvs[0][3] = [rightSide[1], rightSide[2], rightSide[3]];

        geometry.faceVertexUvs[0][4] = [topSide[0], topSide[1], topSide[3]];
        geometry.faceVertexUvs[0][5] = [topSide[1], topSide[2], topSide[3]];

        geometry.faceVertexUvs[0][6] = [bottomSide[0], bottomSide[1], bottomSide[3]];
        geometry.faceVertexUvs[0][7] = [bottomSide[1], bottomSide[2], bottomSide[3]];

        geometry.faceVertexUvs[0][8] = [backSide[0], backSide[1], backSide[3]];
        geometry.faceVertexUvs[0][9] = [backSide[1], backSide[2], backSide[3]];

        geometry.faceVertexUvs[0][10] = [frontSide[0], frontSide[1], frontSide[3]];
        geometry.faceVertexUvs[0][11] = [frontSide[1], frontSide[2], frontSide[3]];
    }

    function init() {
        // Scene
        scene = new _threeJs2['default'].Scene();

        // Camera
        camera = new _threeJs2['default'].PerspectiveCamera(80, aspect, 1, 1000);
        scene.add(camera);

        // Renderer
        if (_detectorWebgl2['default']) renderer = new _threeJs2['default'].WebGLRenderer({ antialias: true });else return console.error('WebGL is not available');
        renderer.setSize(sizeWidth, sizeHeight);
        container.appendChild(renderer.domElement);

        // Controls
        var DOCOptions = {};
        DOCOptions.naturalScrolling = true;
        controls = new _DeviceOrientationController2['default'](camera, container, DOCOptions);
        controls.connect();

        // Video
        texture = new _threeJs2['default'].Texture(video);
        texture.minFilter = _threeJs2['default'].LinearFilter;
        texture.magFilter = _threeJs2['default'].LinearFilter;

        // 360 spherical view
        material = new _threeJs2['default'].MeshBasicMaterial({ map: texture, side: _threeJs2['default'].DoubleSide });

        if (options.projection === 'cube_map') prepareCubeMap();else prepareEquirectangular();

        screen = new _threeJs2['default'].Mesh(geometry, material);
        screen.scale.x = -1; // Do not mirror the screen
        position = options.projection === 'equirectangular' ? { x: -45, y: 0, z: 0 } : { x: 0, y: 0, z: 0 };
        screen.position.set(position.x, position.y, position.z);
        scene.add(screen);
        camera.lookAt(position);
    }

    function animate() {
        window.requestAnimationFrame(animate);
        render();
        update();
    }

    function update() {
        controls.update();
        (0, _jquery2['default'])(video).hide();
    }

    function render() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            if (texture) {
                texture.needsUpdate = true;
            }
        }
        renderer.render(scene, camera);
    }

    init();
    animate();
};

_videoJs2['default'].plugin('ThreeSixty', ThreeSixty);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"detector-webgl":1}]},{},[2]);
