import { Object3D } from './Object3D';

function Scene () {

    Object3D.call( this );

    this.type = 'Scene';

}

Scene.prototype = Object.assign( Object.create( Object3D.prototype ), {

    constructor: Scene,

} );


export { Scene };
