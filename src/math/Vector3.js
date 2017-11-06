import {_Math} from './Math';
import {Matrix4} from './Matrix4';
import {Quaternion} from './Quaternion';


function Vector3(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}


Object.assign(Vector3.prototype, {

    isVector3: true,

    set: function (x, y, z) {
        this.x = x || 0;
        this.y = y || this.x;
        this.z = z || this.x;
        return this;
    },

    clone: function () {
        return new this.constructor(this.x, this.y, this.z);
    },

    copy: function (v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    },

    //以下是向量的加减乘除运算
    add: function (v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    },

    addScalar: function (s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    },

    addVectors: function (a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    },

    addScaledVector: function (v, s) {
        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;
        return this;
    },

    sub: function (v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    },

    subScalar: function (s) {
        this.x -= s;
        this.y -= s;
        this.z -= s;
        return this;
    },

    subVectors: function (a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    },

    multiply: function (v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    },

    multiplyScalar: function (s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    },

    multiplyVectors: function (a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        return this;
    },

    divide: function (v) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
        return this;
    },

    divideScalar: function (s) {
        return this.multiplyScalar(1 / s);
    },

    divideVectors: function (a, b) {
        this.x = a.x / b.x;
        this.y = a.y / b.y;
        this.z = a.z / b.z;
        return this;
    },

    //应用欧拉角，这里计算旋转使用了四元数做中转
    applyEuler: function () {
        var quaternion = new Quaternion();
        return function applyEuler(euler) {
            if ((euler && euler.isEuler) === false) {
                console.error('THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.');
            }
            return this.applyQuaternion(quaternion.setFromEuler(euler));
        };
    }(),

    //应用轴角，这里计算旋转使用了四元数做中转
    applyAxisAngle: function () {
        var quaternion = new Quaternion();
        return function applyAxisAngle(axis, angle) {
            return this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
        };
    }(),

    //正常的三维列向量右乘三维矩阵
    applyMatrix3: function (m) {
        var x = this.x, y = this.y, z = this.z;
        var e = m.elements;
        this.x = e[0] * x + e[3] * y + e[6] * z;
        this.y = e[1] * x + e[4] * y + e[7] * z;
        this.z = e[2] * x + e[5] * y + e[8] * z;
        return this;
    },

    //这里先把三维向量等价于w=1的齐次向量，再和思维矩阵计算，然后再换算回w=1的向量。
    applyMatrix4: function (m) {
        var x = this.x, y = this.y, z = this.z;
        var e = m.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
        this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
        this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
        var w = e[3] * x + e[7] * y + e[11] * z + e[15];
        return this.divideScalar(w);
    },

    //向量先扩展成[x,y,z,0]的四元数，再代入计算四元数乘法
    applyQuaternion: function (q) {
        var x = this.x, y = this.y, z = this.z;
        var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        // calculate quat * vector
        var ix = qw * x + qy * z - qz * y;
        var iy = qw * y + qz * x - qx * z;
        var iz = qw * z + qx * y - qy * x;
        var iw = -qx * x - qy * y - qz * z;
        // calculate result * inverse quat
        this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return this;
    },

    //变换向量方向，这里的参数m为四维仿射向量，但不用计算第四维，只要计算旋转矩阵即可，最后归一化。
    transformDirection: function (m) {
        var x = this.x, y = this.y, z = this.z;
        var e = m.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z;
        this.y = e[1] * x + e[5] * y + e[9] * z;
        this.z = e[2] * x + e[6] * y + e[10] * z;
        return this.normalize();
    },

    min: function (v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);
        return this;
    },

    max: function (v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);
        return this;
    },

    //向量元素范围化，参数是向量
    clamp: function (min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        this.z = Math.max(min.z, Math.min(max.z, this.z));
        return this;
    },

    //向量元素范围化，参数是整数
    clampScalar: function () {
        var min = new Vector3();
        var max = new Vector3();
        return function clampScalar(minVal, maxVal) {
            min.set(minVal, minVal, minVal);
            max.set(maxVal, maxVal, maxVal);
            return this.clamp(min, max);
        };
    }(),

    //向量长度范围化
    clampLength: function (min, max) {
        var length = this.length();
        return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
    },

    //向量向下取整
    floor: function () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    },

    //向量向上取整
    ceil: function () {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
    },

    //向量四舍五入取整
    round: function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    },

    //向量向0点取整
    roundToZero: function () {
        this.x = ( this.x < 0 ) ? Math.ceil(this.x) : Math.floor(this.x);
        this.y = ( this.y < 0 ) ? Math.ceil(this.y) : Math.floor(this.y);
        this.z = ( this.z < 0 ) ? Math.ceil(this.z) : Math.floor(this.z);
        return this;
    },

    //向量反向
    negate: function () {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    },

    lengthSq: function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    },

    length: function () {
        return Math.sqrt(this.lengthSq());
    },

    setLength: function (length) {
        return this.multiplyScalar(length / this.length());
    },

    lerp: function (v, alpha) {
        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;
        this.z += ( v.z - this.z ) * alpha;
        return this;
    },

    lerpVectors: function (v1, v2, alpha) {
        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
    },

    normalize: function () {
        return this.divideScalar(this.length());
    },

    //点乘计算
    dot: function (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    },

    dotVectors: function (a, b) {
        var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;
        return ax * bx + ay * by + az * bz;
    },

    //叉乘计算
    cross: function (v) {
        var x = this.x, y = this.y, z = this.z;
        this.x = y * v.z - z * v.y;
        this.y = z * v.x - x * v.z;
        this.z = x * v.y - y * v.x;
        return this;
    },

    crossVectors: function (a, b) {
        var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    },

    //计算向某向量的投影向量
    projectOnVector: function (vector) {
        var scalar = vector.dot(this) / vector.lengthSq();
        return this.copy(vector).multiplyScalar(scalar);
    },

    //计算向某平面的投影向量，normal为平面法向量
    projectOnPlane: function () {
        var v1 = new Vector3();
        return function projectOnPlane(normal) {
            v1.copy(this).projectOnVector(normal);
            return this.sub(v1);
        };
    }(),

    //计算反射向量，normal为反射面法向量
    reflect: function () {
        var v1 = new Vector3();
        return function reflect(normal) {
            return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
        };
    }(),

    //计算与其他向量的夹角，dot(v1,v2) = |v1|*|v2|*cosA
    angleTo: function (v) {
        var theta = this.dot(v) / ( Math.sqrt(this.lengthSq() * v.lengthSq()) );
        return Math.acos(_Math.clamp(theta, -1, 1));
    },

    //计算与另一个向量的间距
    distanceTo: function (v) {
        return Math.sqrt(this.distanceToSquared(v));
    },

    distanceToSquared: function (v) {
        var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    },

    //从四维仿射矩阵获取平移向量
    setFromMatrixPosition: function (m) {
        return this.setFromMatrixColumn(m, 3);
    },

    //从四维仿射矩阵获取缩放向量
    setFromMatrixScale: function (m) {
        var sx = this.setFromMatrixColumn(m, 0).length();
        var sy = this.setFromMatrixColumn(m, 1).length();
        var sz = this.setFromMatrixColumn(m, 2).length();
        this.x = sx;
        this.y = sy;
        this.z = sz;
        return this;
    },

    //从四维仿射矩阵获取需要的列信息
    setFromMatrixColumn: function (m, index) {
        return this.fromArray(m.elements, index * 4);
    },

    equals: function (v) {
        return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );
    },

    fromArray: function (array, offset) {
        if (offset === undefined) offset = 0;
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        return this;
    },

    toArray: function (array, offset) {
        if (array === undefined) array = [];
        if (offset === undefined) offset = 0;
        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;
        return array;
    },


});

export {Vector3};
