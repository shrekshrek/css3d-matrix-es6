import {Quaternion} from '../math/Quaternion';
import {Vector3} from '../math/Vector3';
import {Matrix4} from '../math/Matrix4';
import {Euler} from '../math/Euler';
import {Matrix3} from '../math/Matrix3';
import {EventDispatcher} from './EventDispatcher';


var object3DId = 0;

function Object3D() {
    this.id = object3DId++;

    this.name = '';
    this.type = 'Object3D';

    this.parent = null;
    this.children = [];

    this.up = Object3D.DefaultUp.clone();

    //这里最重要的就是position，quaternion，scale，另一个rotation的作用是为了方便使用欧拉角转换成四元数
    this.position = new Vector3();
    this.rotation = new Euler();
    this.quaternion = new Quaternion();
    this.scale = new Vector3(1, 1, 1);

    var _self = this;

    function onRotationChange() {
        _self.quaternion.setFromEuler(_self.rotation, false);
    }

    function onQuaternionChange() {
        _self.rotation.setFromQuaternion(_self.quaternion, undefined, false);
    }

    this.rotation.onChange(onRotationChange);
    this.quaternion.onChange(onQuaternionChange);

    this.modelViewMatrix = new Matrix4();
    this.normalMatrix = new Matrix3();

    this.matrix = new Matrix4();
    this.matrixWorld = new Matrix4();

    this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
    this.matrixWorldNeedsUpdate = false;

    this.visible = true;
}

Object3D.DefaultUp = new Vector3(0, 1, 0);
Object3D.DefaultMatrixAutoUpdate = true;


Object.assign(Object3D.prototype, EventDispatcher.prototype, {

    isObject3D: true,

    //乘以矩阵
    applyMatrix: function (matrix) {
        this.matrix.multiplyMatrices(matrix, this.matrix);
    },

    //通过轴角设置旋转四元数
    setRotationFromAxisAngle: function (axis, angle) {
        this.quaternion.setFromAxisAngle(axis, angle);
    },

    setRotationFromEuler: function (euler) {
        this.quaternion.setFromEuler(euler, true);
    },

    setRotationFromMatrix: function (m) {
        this.quaternion.setFromRotationMatrix(m);
    },

    setRotationFromQuaternion: function (q) {
        this.quaternion.copy(q);
    },

    rotateOnAxis: function () {
        var q1 = new Quaternion();
        return function rotateOnAxis(axis, angle) {
            q1.setFromAxisAngle(axis, angle);
            this.quaternion.multiply(q1);
            return this;
        };
    }(),

    rotateX: function () {
        var v1 = new Vector3(1, 0, 0);
        return function rotateX(angle) {
            return this.rotateOnAxis(v1, angle);
        };
    }(),

    rotateY: function () {
        var v1 = new Vector3(0, 1, 0);
        return function rotateY(angle) {
            return this.rotateOnAxis(v1, angle);
        };
    }(),

    rotateZ: function () {
        var v1 = new Vector3(0, 0, 1);
        return function rotateZ(angle) {
            return this.rotateOnAxis(v1, angle);
        };
    }(),

    translateOnAxis: function () {
        var v1 = new Vector3();
        return function translateOnAxis(axis, distance) {
            v1.copy(axis).applyQuaternion(this.quaternion);
            this.position.add(v1.multiplyScalar(distance));
            return this;
        };
    }(),

    translateX: function () {
        var v1 = new Vector3(1, 0, 0);
        return function translateX(distance) {
            return this.translateOnAxis(v1, distance);
        };
    }(),

    translateY: function () {
        var v1 = new Vector3(0, 1, 0);
        return function translateY(distance) {
            return this.translateOnAxis(v1, distance);
        };
    }(),

    translateZ: function () {
        var v1 = new Vector3(0, 0, 1);
        return function translateZ(distance) {
            return this.translateOnAxis(v1, distance);
        };
    }(),

    localToWorld: function (vector) {
        return vector.applyMatrix4(this.matrixWorld);
    },

    worldToLocal: function () {
        var m1 = new Matrix4();
        return function worldToLocal(vector) {
            return vector.applyMatrix4(m1.getInverse(this.matrixWorld));
        };
    }(),

    lookAt: function () {
        var m1 = new Matrix4();
        return function lookAt(vector) {
            if (this.position.distanceToSquared(vector) === 0) {
                console.warn('THREE.Object3D.lookAt(): target vector is the same as object position.');
                return;
            }

            if (this.isCamera) {
                m1.lookAt(this.position, vector, this.up);
            } else {
                m1.lookAt(vector, this.position, this.up);
            }

            this.quaternion.setFromRotationMatrix(m1);
        };
    }(),

    add: function (object) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++) {
                this.add(arguments[i]);
            }
            return this;
        }

        if (object === this) {
            console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
            return this;
        }

        if (( object && object.isObject3D )) {
            if (object.parent !== null) {
                object.parent.remove(object);
            }
            object.parent = this;
            object.dispatchEvent({type: 'added'});
            this.children.push(object);
        } else {
            console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object);
        }
        return this;
    },

    remove: function (object) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++) {
                this.remove(arguments[i]);
            }
        }

        var index = this.children.indexOf(object);

        if (index !== -1) {
            object.parent = null;
            object.dispatchEvent({type: 'removed'});
            this.children.splice(index, 1);
        }
    },

    getObjectById: function (id) {
        return this.getObjectByProperty('id', id);
    },

    getObjectByName: function (name) {
        return this.getObjectByProperty('name', name);
    },

    getObjectByProperty: function (name, value) {
        if (this[name] === value) return this;
        for (var i = 0, l = this.children.length; i < l; i++) {
            var child = this.children[i];
            var object = child.getObjectByProperty(name, value);
            if (object !== undefined) {
                return object;
            }
        }
        return undefined;
    },

    getWorldPosition: function (optionalTarget) {
        var result = optionalTarget || new Vector3();
        this.updateMatrixWorld(true);
        return result.setFromMatrixPosition(this.matrixWorld);
    },

    getWorldQuaternion: function () {
        var position = new Vector3();
        var scale = new Vector3();
        return function getWorldQuaternion(optionalTarget) {
            var result = optionalTarget || new Quaternion();
            this.updateMatrixWorld(true);
            this.matrixWorld.decompose(position, result, scale);
            return result;
        };
    }(),

    getWorldRotation: function () {
        var quaternion = new Quaternion();
        return function getWorldRotation(optionalTarget) {
            var result = optionalTarget || new Euler();
            this.getWorldQuaternion(quaternion);
            return result.setFromQuaternion(quaternion, this.rotation.order, false);
        };
    }(),

    getWorldScale: function () {
        var position = new Vector3();
        var quaternion = new Quaternion();
        return function getWorldScale(optionalTarget) {
            var result = optionalTarget || new Vector3();
            this.updateMatrixWorld(true);
            this.matrixWorld.decompose(position, quaternion, result);
            return result;
        };
    }(),

    getWorldDirection: function () {
        var quaternion = new Quaternion();
        return function getWorldDirection(optionalTarget) {
            var result = optionalTarget || new Vector3();
            this.getWorldQuaternion(quaternion);
            return result.set(0, 0, 1).applyQuaternion(quaternion);
        };
    }(),

    traverse: function (callback) {
        callback(this);
        var children = this.children;
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].traverse(callback);
        }
    },

    traverseVisible: function (callback) {
        if (this.visible === false) return;
        callback(this);
        var children = this.children;
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].traverseVisible(callback);
        }
    },

    traverseAncestors: function (callback) {
        var parent = this.parent;
        if (parent !== null) {
            callback(parent);
            parent.traverseAncestors(callback);
        }
    },

    updateMatrix: function () {
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
    },

    updateMatrixWorld: function (force) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.matrixWorldNeedsUpdate || force) {
            if (this.parent === null) {
                this.matrixWorld.copy(this.matrix);
            } else {
                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            }
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }

        // update children
        var children = this.children;
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].updateMatrixWorld(force);
        }
    },

});

export {Object3D};
