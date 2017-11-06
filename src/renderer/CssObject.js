import {Object3D} from '../core/Object3D';


function CssObject(element) {
    Object3D.call(this);

    this.element = element || document.createElement('div');
    this.element.style.position = 'absolute';

    this.addEventListener('removed', function () {
        if (this.element.parentNode !== null) {
            this.element.parentNode.removeChild(this.element);
        }
    });
}

CssObject.prototype = Object.assign(Object.create(Object3D.prototype), {
    constructor: CssObject,

    isCssObject: true,

});


export {CssObject};