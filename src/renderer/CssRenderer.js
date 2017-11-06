import {Matrix4} from '../math/Matrix4';
import {_Math} from '../math/Math';
import {CssObject} from './CssObject';
import {CssSprite} from './CssSprite';

function CssRenderer() {

    var _width, _height;

    var matrix = new Matrix4();

    var cache = {
        camera: {fov: 0, style: ''},
        objects: {}
    };

    var domElement = document.createElement('div');
    domElement.style.overflow = 'hidden';

    domElement.style.WebkitTransformStyle = 'preserve-3d';
    domElement.style.transformStyle = 'preserve-3d';

    this.domElement = domElement;

    var cameraElement = document.createElement('div');

    cameraElement.style.position = 'absolute';
    cameraElement.style.left = '50%';
    cameraElement.style.top = '50%';

    cameraElement.style.WebkitTransformStyle = 'preserve-3d';
    cameraElement.style.transformStyle = 'preserve-3d';

    domElement.appendChild(cameraElement);

    this.setClearColor = function () {
    };

    this.getSize = function () {
        return {
            width: _width,
            height: _height
        };
    };

    this.setSize = function (width, height) {
        _width = width;
        _height = height;
        domElement.style.width = width + 'px';
        domElement.style.height = height + 'px';
    };

    function epsilon(value) {
        return Math.abs(value) < Number.EPSILON ? 0 : value;
    }

    //css坐标系不是右手坐标系，y轴是向下为正，所以在转成css时需要做修正，这里camera因为使用的是matrixWorldInverse，所以修正部分也做了变化，旋转部分是正交，逆和转置相同。
    function getCameraCSSMatrix(matrix) {
        var elements = matrix.elements;
        return 'matrix3d(' +
            epsilon(elements[0]) + ',' +
            epsilon(-elements[1]) + ',' +
            epsilon(elements[2]) + ',' +
            epsilon(elements[3]) + ',' +
            epsilon(elements[4]) + ',' +
            epsilon(-elements[5]) + ',' +
            epsilon(elements[6]) + ',' +
            epsilon(elements[7]) + ',' +
            epsilon(elements[8]) + ',' +
            epsilon(-elements[9]) + ',' +
            epsilon(elements[10]) + ',' +
            epsilon(elements[11]) + ',' +
            epsilon(elements[12]) + ',' +
            epsilon(-elements[13]) + ',' +
            epsilon(elements[14]) + ',' +
            epsilon(elements[15]) +
            ')';
    }

    //css坐标系不是右手坐标系，y轴是向下为正，所以在转成css时需要做修正
    function getObjectCSSMatrix(matrix) {
        var elements = matrix.elements;
        return 'translate3d(-50%,-50%,0) matrix3d(' +
            epsilon(elements[0]) + ',' +
            epsilon(elements[1]) + ',' +
            epsilon(elements[2]) + ',' +
            epsilon(elements[3]) + ',' +
            epsilon(-elements[4]) + ',' +
            epsilon(-elements[5]) + ',' +
            epsilon(-elements[6]) + ',' +
            epsilon(-elements[7]) + ',' +
            epsilon(elements[8]) + ',' +
            epsilon(elements[9]) + ',' +
            epsilon(elements[10]) + ',' +
            epsilon(elements[11]) + ',' +
            epsilon(elements[12]) + ',' +
            epsilon(elements[13]) + ',' +
            epsilon(elements[14]) + ',' +
            epsilon(elements[15]) +
            ')';
    }

    function renderObject(object, camera) {
        if ( object instanceof CssObject ) {
            var style;
            if (object instanceof CssSprite) {
                //这里的需求是Sprite对象永远面向摄像机，这里的渲染实现结构我们可以看到camera对应的是cameraElement元素，这样做可以保证其他元素直接使用自己的matrixWorld就可以准确描述自己的旋转坐标信息，而不用因为camera变化再重新计算所有其他3d元素的坐标。
                //这里cameraElement的位置根据camera.matrixWorldInverse做了调整，那它之内的元素需要再调整回identity，也就是再乘以camera.camera.matrixWorld就好，所以这里的元素旋转部分都保留设置成camera.matrixWorld就好，位移和缩放使用自己的部分。
                matrix.copy(camera.matrixWorld);
                matrix.copyPosition(object.matrixWorld);
                matrix.scale(object.scale);

                matrix.elements[3] = 0;
                matrix.elements[7] = 0;
                matrix.elements[11] = 0;
                matrix.elements[15] = 1;

                style = getObjectCSSMatrix(matrix);
            } else {
                style = getObjectCSSMatrix(object.matrixWorld);
            }

            var element = object.element;
            var cachedStyle = cache.objects[object.id];

            if (cachedStyle === undefined || cachedStyle !== style) {
                element.style.WebkitTransform = style;
                element.style.transform = style;

                cache.objects[object.id] = style;
            }

            if (element.parentNode !== cameraElement) {
                cameraElement.appendChild(element);
            }
        }

        for (var i = 0, l = object.children.length; i < l; i++) {
            renderObject(object.children[i], camera);
        }
    }

    this.render = function (scene, camera) {
        var fov = 0.5 / Math.tan(_Math.degToRad(camera.getEffectiveFOV() * 0.5)) * _height;

        if (cache.camera.fov !== fov) {
            domElement.style.WebkitPerspective = fov + "px";
            domElement.style.perspective = fov + "px";

            cache.camera.fov = fov;
        }

        scene.updateMatrixWorld();

        if (camera.parent === null) camera.updateMatrixWorld();

        camera.matrixWorldInverse.getInverse(camera.matrixWorld);

        var style = 'translateZ(' + fov + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse);

        if (cache.camera.style !== style) {
            cameraElement.style.WebkitTransform = style;
            cameraElement.style.transform = style;

            cache.camera.style = style;
        }

        renderObject(scene, camera);
    };

}


export {CssRenderer};
