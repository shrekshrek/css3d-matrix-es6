import {Camera} from '../src/core/Camera';
import {Scene} from '../src/core/Scene';
import {Vector3} from '../src/math/Vector3';
import {CssRenderer} from '../src/renderer/CssRenderer';
import {CssObject} from '../src/renderer/CssObject';
import {CssSprite} from '../src/renderer/CssSprite';

var camera, scene, renderer;

var particlesTotal = 64;
var objects = [];

init();
animate();

function init() {

    camera = new Camera(75);
    camera.position.set(0, 800, 1500);
    camera.lookAt(new Vector3());

    scene = new Scene();

    for (var i = 0; i < particlesTotal; i++) {
        var box = document.createElement('div');
        box.className = "red";

        var object = new CssSprite(box);
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add(object);

        objects.push(object);

    }

    for (var i = 0; i < particlesTotal; i++) {
        var box = document.createElement('div');
        box.className = "blue";

        var object = new CssObject(box);
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add(object);

        objects.push(object);

    }

    renderer = new CssRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(renderer.domElement);


    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);

}


function animate() {

    requestAnimationFrame(animate);


    var time = performance.now();

    camera.position.x = Math.sin(time*0.001) * 500;

    for (var i = 0, l = objects.length; i < l; i++) {

        var object = objects[i];
        var scale = Math.sin(( Math.floor(object.position.x) + time ) * 0.002) * 0.3 + 1;
        object.scale.set(scale, scale, scale);

    }

    renderer.render(scene, camera);

}