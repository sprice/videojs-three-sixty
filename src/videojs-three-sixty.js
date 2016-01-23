import videojs from 'video.js';
import THREE from 'three.js';
import $ from 'jquery';
import isWebGLEnabled from 'detector-webgl';
import DeviceOrientationController from 'DeviceOrientationController';

const ThreeSixty = function(options) {
    const container = this.el();
    const video = this.el().getElementsByTagName('video')[0];
    let scene;
    let camera;
    let aspect = (options.width / options.height) || 16 / 9;
    let renderer;
    let sizeWidth = options.width;
    let sizeHeight = options.height;
    let controls;
    let material;
    let geometry;
    let screen;
    let texture;
    let position;

    function prepareEquirectangular() {
        geometry = new THREE.SphereGeometry(800, 32, 32);
    }

    function prepareCubeMap() {
        const edge = options.edge;

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

        const thirdLow  = 0.3333333333333333;
        const thirdHigh = 0.3333333333333333;
        const sixthLow  = 0.6666666666666666;
        const sixthHigh = 0.6666666666666666;

        const rightSide = [new THREE.Vector2(0, 1), new THREE.Vector2(0, 0.5), new THREE.Vector2(thirdHigh, 0.5), new THREE.Vector2(thirdHigh, 1)];
        const leftSide = [new THREE.Vector2(thirdLow, 1), new THREE.Vector2(thirdLow, 0.5), new THREE.Vector2(sixthHigh, 0.5), new THREE.Vector2(sixthHigh, 1)];
        const topSide = [new THREE.Vector2(1, 0.5), new THREE.Vector2(1, 1), new THREE.Vector2(sixthLow, 1), new THREE.Vector2(sixthLow, 0.5)];
        const bottomSide = [new THREE.Vector2(thirdHigh, 0), new THREE.Vector2(thirdHigh, 0.5), new THREE.Vector2(0, 0.5), new THREE.Vector2(0, 0)];
        const frontSide = [new THREE.Vector2(thirdLow, 0.5), new THREE.Vector2(thirdLow, 0), new THREE.Vector2(sixthHigh, 0), new THREE.Vector2(sixthHigh, 0.5)];
        const backSide = [new THREE.Vector2(sixthLow, 0.5), new THREE.Vector2(sixthLow, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 0.5)];

        geometry = new THREE.BoxGeometry(edge, edge, edge);

        geometry.faceVertexUvs[0] = [];

        geometry.faceVertexUvs[0][0] = [ leftSide[0], leftSide[1], leftSide[3] ];
        geometry.faceVertexUvs[0][1] = [ leftSide[1], leftSide[2], leftSide[3] ];

        geometry.faceVertexUvs[0][2] = [ rightSide[0], rightSide[1], rightSide[3] ];
        geometry.faceVertexUvs[0][3] = [ rightSide[1], rightSide[2], rightSide[3] ];

        geometry.faceVertexUvs[0][4] = [ topSide[0], topSide[1], topSide[3] ];
        geometry.faceVertexUvs[0][5] = [ topSide[1], topSide[2], topSide[3] ];

        geometry.faceVertexUvs[0][6] = [ bottomSide[0], bottomSide[1], bottomSide[3] ];
        geometry.faceVertexUvs[0][7] = [ bottomSide[1], bottomSide[2], bottomSide[3] ];
          
        geometry.faceVertexUvs[0][8] = [ backSide[0], backSide[1], backSide[3] ];
        geometry.faceVertexUvs[0][9] = [ backSide[1], backSide[2], backSide[3] ];

        geometry.faceVertexUvs[0][10] = [ frontSide[0], frontSide[1], frontSide[3] ];
        geometry.faceVertexUvs[0][11] = [ frontSide[1], frontSide[2], frontSide[3] ];
    }

    function init() {
        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(80, aspect, 1, 1000 );
        scene.add(camera);

        // Renderer
        if (isWebGLEnabled) renderer = new THREE.WebGLRenderer({ antialias:true });
        else return console.error('WebGL is not available');
        renderer.setSize(sizeWidth, sizeHeight);
        container.appendChild(renderer.domElement);

        // Controls
        const DOCOptions = {};
        DOCOptions.naturalScrolling = true;
        controls = new DeviceOrientationController(camera, container, DOCOptions);
        controls.connect();

        // Video
        texture = new THREE.Texture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // 360 spherical view
        material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

        if (options.projection === 'cube_map') prepareCubeMap();
        else prepareEquirectangular();

        screen = new THREE.Mesh(geometry, material);
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
        $(video).hide();
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

videojs.plugin('ThreeSixty', ThreeSixty);
