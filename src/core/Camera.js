import { Matrix4 } from '../math/Matrix4';
import { Object3D } from './Object3D';
import { _Math } from '../math/Math';


function Camera( fov ) {
    Object3D.call( this );

    this.type = 'Camera';

    this.matrixWorldInverse = new Matrix4();

    this.fov = fov !== undefined ? fov : 50;
    this.zoom = 1;
}

Camera.prototype = Object.assign( Object.create( Object3D.prototype ), {
    constructor: Camera,

    isCamera: true,

    getEffectiveFOV: function () {
        return _Math.RAD2DEG * 2 * Math.atan(
            Math.tan( _Math.DEG2RAD * 0.5 * this.fov ) / this.zoom );
    },


});


export { Camera };