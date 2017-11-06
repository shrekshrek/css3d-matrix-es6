import {Vector3} from './Vector3';


function Quaternion(x, y, z, w) {
    this._x = x || 0;
    this._y = y || 0;
    this._z = z || 0;
    this._w = ( w !== undefined ) ? w : 1;
}

//定义类方法
Object.assign(Quaternion, {
    //球面差值
    slerp: function (qa, qb, qm, t) {
        return qm.copy(qa).slerp(qb, t);
    },

    slerpFlat: function (dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
        var x0 = src0[srcOffset0 + 0],
            y0 = src0[srcOffset0 + 1],
            z0 = src0[srcOffset0 + 2],
            w0 = src0[srcOffset0 + 3],

            x1 = src1[srcOffset1 + 0],
            y1 = src1[srcOffset1 + 1],
            z1 = src1[srcOffset1 + 2],
            w1 = src1[srcOffset1 + 3];

        if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
            var s = 1 - t,
                cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
                dir = ( cos >= 0 ? 1 : -1 ),
                sqrSin = 1 - cos * cos;

            if (sqrSin > Number.EPSILON) {
                var sin = Math.sqrt(sqrSin),
                    len = Math.atan2(sin, cos * dir);
                s = Math.sin(s * len) / sin;
                t = Math.sin(t * len) / sin;
            }

            var tDir = t * dir;

            x0 = x0 * s + x1 * tDir;
            y0 = y0 * s + y1 * tDir;
            z0 = z0 * s + z1 * tDir;
            w0 = w0 * s + w1 * tDir;

            if (s === 1 - t) {
                var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
                x0 *= f;
                y0 *= f;
                z0 *= f;
                w0 *= f;
            }
        }

        dst[dstOffset] = x0;
        dst[dstOffset + 1] = y0;
        dst[dstOffset + 2] = z0;
        dst[dstOffset + 3] = w0;
    }
});

//定义属性
Object.defineProperties(Quaternion.prototype, {
    "x": {
        get: function () {
            return this._x;
        },
        set: function (value) {
            this._x = value;
            this.onChangeCallback();
        }
    },

    "y": {
        get: function () {
            return this._y;
        },
        set: function (value) {
            this._y = value;
            this.onChangeCallback();
        }
    },

    "z": {
        get: function () {
            return this._z;
        },
        set: function (value) {
            this._z = value;
            this.onChangeCallback();
        }
    },

    "w": {
        get: function () {
            return this._w;
        },
        set: function (value) {
            this._w = value;
            this.onChangeCallback();
        }
    }
});

//定义方法
Object.assign(Quaternion.prototype, {

    isQuaternion: true,

    set: function (x, y, z, w) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this.onChangeCallback();
        return this;
    },

    clone: function () {
        return new this.constructor(this._x, this._y, this._z, this._w);
    },

    copy: function (quaternion) {
        this._x = quaternion.x;
        this._y = quaternion.y;
        this._z = quaternion.z;
        this._w = quaternion.w;
        this.onChangeCallback();
        return this;
    },

    //欧拉角换算四元数
    setFromEuler: function (euler, update) {
        if (( euler && euler.isEuler ) === false) {
            throw new Error('THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.');
        }

        var x = euler._x, y = euler._y, z = euler._z, order = euler.order;

        var cos = Math.cos;
        var sin = Math.sin;

        var c1 = cos(x / 2);
        var c2 = cos(y / 2);
        var c3 = cos(z / 2);

        var s1 = sin(x / 2);
        var s2 = sin(y / 2);
        var s3 = sin(z / 2);

        if (order === 'XYZ') {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === 'YXZ') {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        } else if (order === 'ZXY') {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === 'ZYX') {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        } else if (order === 'YZX') {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === 'XZY') {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        }

        if (update !== false) this.onChangeCallback();
        return this;
    },

    //轴-角换算四元数，这也是四元数的定义。
    setFromAxisAngle: function (axis, angle) {
        var halfAngle = angle / 2, s = Math.sin(halfAngle);
        this._x = axis.x * s;
        this._y = axis.y * s;
        this._z = axis.z * s;
        this._w = Math.cos(halfAngle);
        this.onChangeCallback();
        return this;
    },

    //用仿射矩阵的旋转部分换算成四元数
    setFromRotationMatrix: function (m) {
        var te = m.elements,
            m11 = te[0], m12 = te[4], m13 = te[8],
            m21 = te[1], m22 = te[5], m23 = te[9],
            m31 = te[2], m32 = te[6], m33 = te[10],
            trace = m11 + m22 + m33,
            s;

        if (trace > 0) {
            s = 0.5 / Math.sqrt(trace + 1.0);
            this._w = 0.25 / s;
            this._x = ( m32 - m23 ) * s;
            this._y = ( m13 - m31 ) * s;
            this._z = ( m21 - m12 ) * s;
        } else if (m11 > m22 && m11 > m33) {
            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            this._w = ( m32 - m23 ) / s;
            this._x = 0.25 * s;
            this._y = ( m12 + m21 ) / s;
            this._z = ( m13 + m31 ) / s;
        } else if (m22 > m33) {
            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            this._w = ( m13 - m31 ) / s;
            this._x = ( m12 + m21 ) / s;
            this._y = 0.25 * s;
            this._z = ( m23 + m32 ) / s;
        } else {
            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            this._w = ( m21 - m12 ) / s;
            this._x = ( m13 + m31 ) / s;
            this._y = ( m23 + m32 ) / s;
            this._z = 0.25 * s;
        }

        this.onChangeCallback();
        return this;
    },

    //通过首尾向量计算四元数，也是常用方法。
    setFromUnitVectors: function () {
        var v1 = new Vector3();
        var r;

        var EPS = 0.000001;

        return function setFromUnitVectors(vFrom, vTo) {
            if (v1 === undefined) v1 = new Vector3();
            r = vFrom.dot(vTo) + 1;

            if (r < EPS) {
                r = 0;
                if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
                    v1.set(-vFrom.y, vFrom.x, 0);
                } else {
                    v1.set(0, -vFrom.z, vFrom.y);
                }
            } else {
                v1.crossVectors(vFrom, vTo);
            }

            this._x = v1.x;
            this._y = v1.y;
            this._z = v1.z;
            this._w = r;
            return this.normalize();
        };
    }(),

    //因为这里的四元数都是标准四元数，所以它的共轭等于它的逆。
    inverse: function () {
        return this.conjugate().normalize();
    },

    //求四元数共轭
    conjugate: function () {
        this._x *= -1;
        this._y *= -1;
        this._z *= -1;
        this.onChangeCallback();
        return this;
    },

    //向量点乘
    dot: function (v) {
        return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
    },

    lengthSq: function () {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    },

    length: function () {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    },

    normalize: function () {
        var l = this.length();
        if (l === 0) {
            this._x = 0;
            this._y = 0;
            this._z = 0;
            this._w = 1;
        } else {
            l = 1 / l;
            this._x = this._x * l;
            this._y = this._y * l;
            this._z = this._z * l;
            this._w = this._w * l;
        }
        this.onChangeCallback();
        return this;
    },

    //四元数乘法
    multiply: function (q) {
        return this.multiplyQuaternions(this, q);
    },

    premultiply: function (q) {
        return this.multiplyQuaternions(q, this);
    },

    multiplyQuaternions: function (a, b) {
        var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
        var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

        this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        this.onChangeCallback();
        return this;
    },

    //球面差值
    slerp: function (qb, t) {
        if (t === 0) return this;
        if (t === 1) return this.copy(qb);

        var x = this._x, y = this._y, z = this._z, w = this._w;

        var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

        if (cosHalfTheta < 0) {
            this._w = -qb._w;
            this._x = -qb._x;
            this._y = -qb._y;
            this._z = -qb._z;
            cosHalfTheta = -cosHalfTheta;
        } else {
            this.copy(qb);
        }

        if (cosHalfTheta >= 1.0) {
            this._w = w;
            this._x = x;
            this._y = y;
            this._z = z;
            return this;
        }

        var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        if (Math.abs(sinHalfTheta) < 0.001) {
            this._w = 0.5 * ( w + this._w );
            this._x = 0.5 * ( x + this._x );
            this._y = 0.5 * ( y + this._y );
            this._z = 0.5 * ( z + this._z );
            return this;
        }

        var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
        var ratioA = Math.sin(( 1 - t ) * halfTheta) / sinHalfTheta,
            ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        this._w = ( w * ratioA + this._w * ratioB );
        this._x = ( x * ratioA + this._x * ratioB );
        this._y = ( y * ratioA + this._y * ratioB );
        this._z = ( z * ratioA + this._z * ratioB );

        this.onChangeCallback();
        return this;
    },

    equals: function (quaternion) {
        return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );
    },

    fromArray: function (array, offset) {
        if (offset === undefined) offset = 0;
        this._x = array[offset];
        this._y = array[offset + 1];
        this._z = array[offset + 2];
        this._w = array[offset + 3];
        this.onChangeCallback();
        return this;
    },

    toArray: function (array, offset) {
        if (array === undefined) array = [];
        if (offset === undefined) offset = 0;
        array[offset] = this._x;
        array[offset + 1] = this._y;
        array[offset + 2] = this._z;
        array[offset + 3] = this._w;
        return array;
    },

    onChange: function (callback) {
        this.onChangeCallback = callback;
        return this;
    },

    onChangeCallback: function () {
    }

});

export {Quaternion};
