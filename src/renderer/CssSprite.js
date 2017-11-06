import {CssObject} from './CssObject';


function CssSprite(element) {
    CssObject.call(this, element);
}


CssSprite.prototype = Object.assign(Object.create(CssObject.prototype), {
    constructor: CssSprite,

    isCssSprite: true,

});


export {CssSprite};