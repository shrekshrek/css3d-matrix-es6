/*!
 * GIT:https://github.com/shrekshrek/css3d-matrix-es6
 * @author: Shrek.wang
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.M3D = {})));
}(this, (function (exports) { 'use strict';

	function EventDispatcher() {
	}

	Object.assign(EventDispatcher.prototype, {
	    addEventListener: function (type, listener) {
	        if (this._listeners === undefined) this._listeners = {};
	        var listeners = this._listeners;
	        if (listeners[type] === undefined) {
	            listeners[type] = [];
	        }

	        if (listeners[type].indexOf(listener) === -1) {
	            listeners[type].push(listener);
	        }
	    },

	    hasEventListener: function (type, listener) {
	        if (this._listeners === undefined) return false;
	        var listeners = this._listeners;
	        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
	    },

	    removeEventListener: function (type, listener) {
	        if (this._listeners === undefined) return;
	        var listeners = this._listeners;
	        var listenerArray = listeners[type];
	        if (listenerArray !== undefined) {
	            var index = listenerArray.indexOf(listener);
	            if (index !== -1) {
	                listenerArray.splice(index, 1);
	            }
	        }
	    },

	    dispatchEvent: function (event) {
	        if (this._listeners === undefined) return;
	        var listeners = this._listeners;
	        var listenerArray = listeners[event.type];
	        if (listenerArray !== undefined) {
	            event.target = this;
	            var array = [], i = 0;
	            var length = listenerArray.length;
	            for (i = 0; i < length; i++) {
	                array[i] = listenerArray[i];
	            }
	            for (i = 0; i < length; i++) {
	                array[i].call(this, event);
	            }
	        }
	    }
	});

	var _Math = {
	    DEG2RAD: Math.PI / 180,
	    RAD2DEG: 180 / Math.PI,

	    clamp: function (value, min, max) {
	        return Math.max(min, Math.min(max, value));
	    },

	    //获取正模
	    euclideanModulo: function (n, m) {
	        return ( ( n % m ) + m ) % m;
	    },

	    mapLinear: function (x, a1, a2, b1, b2) {
	        return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
	    },

	    //线性差值
	    lerp: function (x, y, t) {
	        return ( 1 - t ) * x + t * y;
	    },

	    smoothstep: function (x, min, max) {
	        if (x <= min) return 0;
	        if (x >= max) return 1;
	        x = ( x - min ) / ( max - min );
	        return x * x * ( 3 - 2 * x );
	    },

	    smootherstep: function (x, min, max) {
	        if (x <= min) return 0;
	        if (x >= max) return 1;
	        x = ( x - min ) / ( max - min );
	        return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
	    },

	    randInt: function (low, high) {
	        return low + Math.floor(Math.random() * ( high - low + 1 ));
	    },

	    randFloat: function (low, high) {
	        return low + Math.random() * ( high - low );
	    },

	    randFloatSpread: function (range) {
	        return range * ( 0.5 - Math.random() );
	    },

	    degToRad: function (degrees) {
	        return degrees * _Math.DEG2RAD;
	    },

	    radToDeg: function (radians) {
	        return radians * _Math.RAD2DEG;
	    },

	    isPowerOfTwo: function (value) {
	        return ( value & ( value - 1 ) ) === 0 && value !== 0;
	    },

	    nearestPowerOfTwo: function (value) {
	        return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
	    },

	    nextPowerOfTwo: function (value) {
	        value--;
	        value |= value >> 1;
	        value |= value >> 2;
	        value |= value >> 4;
	        value |= value >> 8;
	        value |= value >> 16;
	        value++;
	        return value;
	    }

	};

	function Matrix4(){
	    this.elements = [
	        1, 0, 0, 0,
	        0, 1, 0, 0,
	        0, 0, 1, 0,
	        0, 0, 0, 1
	    ];
	}


	Object.assign( Matrix4.prototype, {

	    isMatrix4: true,

	    set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {
	        var te = this.elements;
	        te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
	        te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
	        te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
	        te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;
	        return this;
	    },

	    identity: function () {
	        this.set(
	            1, 0, 0, 0,
	            0, 1, 0, 0,
	            0, 0, 1, 0,
	            0, 0, 0, 1
	        );
	        return this;
	    },

	    clone: function () {
	        return new this.constructor().fromArray( this.elements );
	    },

	    copy: function ( m ) {
	        var te = this.elements;
	        var me = m.elements;
	        for ( var i = 0; i < 16; i ++ ) te[ i ] = me[ i ];
	        return this;
	    },

	    //复制矩阵平移信息，就是仿射矩阵的第四列数据
	    copyPosition: function ( m ) {
	        var te = this.elements, me = m.elements;
	        te[ 12 ] = me[ 12 ];
	        te[ 13 ] = me[ 13 ];
	        te[ 14 ] = me[ 14 ];
	        return this;
	    },

	    //提取矩阵中的三个基向量，分别就是矩阵的第一二三列，这里需要理解矩阵与基向量的概念。
	    extractBasis: function ( xAxis, yAxis, zAxis ) {
	        xAxis.setFromMatrixColumn( this, 0 );
	        yAxis.setFromMatrixColumn( this, 1 );
	        zAxis.setFromMatrixColumn( this, 2 );
	        return this;
	    },

	    //直接给定三个基向量来定义矩阵
	    makeBasis: function ( xAxis, yAxis, zAxis ) {
	        this.set(
	            xAxis.x, yAxis.x, zAxis.x, 0,
	            xAxis.y, yAxis.y, zAxis.y, 0,
	            xAxis.z, yAxis.z, zAxis.z, 0,
	            0,       0,       0,       1
	        );
	        return this;
	    },

	    //提取三维旋转向量到本矩阵，将目标矩阵的三个基向量标准化(除以向量长度)后赋值到本矩阵中。
	    extractRotation: function () {
	        var v1 = new Vector3();
	        return function extractRotation( m ) {
	            var te = this.elements;
	            var me = m.elements;
	            var scaleX = 1 / v1.setFromMatrixColumn( m, 0 ).length();
	            var scaleY = 1 / v1.setFromMatrixColumn( m, 1 ).length();
	            var scaleZ = 1 / v1.setFromMatrixColumn( m, 2 ).length();
	            te[ 0 ] = me[ 0 ] * scaleX;
	            te[ 1 ] = me[ 1 ] * scaleX;
	            te[ 2 ] = me[ 2 ] * scaleX;
	            te[ 4 ] = me[ 4 ] * scaleY;
	            te[ 5 ] = me[ 5 ] * scaleY;
	            te[ 6 ] = me[ 6 ] * scaleY;
	            te[ 8 ] = me[ 8 ] * scaleZ;
	            te[ 9 ] = me[ 9 ] * scaleZ;
	            te[ 10 ] = me[ 10 ] * scaleZ;
	            return this;
	        };
	    }(),

	    //通过欧拉角获得旋转矩阵
	    makeRotationFromEuler: function ( euler ) {
	        if ( ( euler && euler.isEuler ) === false ) {
	            console.error( 'THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.' );
	        }

	        var te = this.elements;

	        var x = euler.x, y = euler.y, z = euler.z;
	        var a = Math.cos( x ), b = Math.sin( x );
	        var c = Math.cos( y ), d = Math.sin( y );
	        var e = Math.cos( z ), f = Math.sin( z );

	        if ( euler.order === 'XYZ' ) {
	            var ae = a * e, af = a * f, be = b * e, bf = b * f;
	            te[ 0 ] = c * e;
	            te[ 4 ] = - c * f;
	            te[ 8 ] = d;
	            te[ 1 ] = af + be * d;
	            te[ 5 ] = ae - bf * d;
	            te[ 9 ] = - b * c;
	            te[ 2 ] = bf - ae * d;
	            te[ 6 ] = be + af * d;
	            te[ 10 ] = a * c;
	        } else if ( euler.order === 'YXZ' ) {
	            var ce = c * e, cf = c * f, de = d * e, df = d * f;
	            te[ 0 ] = ce + df * b;
	            te[ 4 ] = de * b - cf;
	            te[ 8 ] = a * d;
	            te[ 1 ] = a * f;
	            te[ 5 ] = a * e;
	            te[ 9 ] = - b;
	            te[ 2 ] = cf * b - de;
	            te[ 6 ] = df + ce * b;
	            te[ 10 ] = a * c;
	        } else if ( euler.order === 'ZXY' ) {
	            var ce = c * e, cf = c * f, de = d * e, df = d * f;
	            te[ 0 ] = ce - df * b;
	            te[ 4 ] = - a * f;
	            te[ 8 ] = de + cf * b;
	            te[ 1 ] = cf + de * b;
	            te[ 5 ] = a * e;
	            te[ 9 ] = df - ce * b;
	            te[ 2 ] = - a * d;
	            te[ 6 ] = b;
	            te[ 10 ] = a * c;
	        } else if ( euler.order === 'ZYX' ) {
	            var ae = a * e, af = a * f, be = b * e, bf = b * f;
	            te[ 0 ] = c * e;
	            te[ 4 ] = be * d - af;
	            te[ 8 ] = ae * d + bf;
	            te[ 1 ] = c * f;
	            te[ 5 ] = bf * d + ae;
	            te[ 9 ] = af * d - be;
	            te[ 2 ] = - d;
	            te[ 6 ] = b * c;
	            te[ 10 ] = a * c;
	        } else if ( euler.order === 'YZX' ) {
	            var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
	            te[ 0 ] = c * e;
	            te[ 4 ] = bd - ac * f;
	            te[ 8 ] = bc * f + ad;
	            te[ 1 ] = f;
	            te[ 5 ] = a * e;
	            te[ 9 ] = - b * e;
	            te[ 2 ] = - d * e;
	            te[ 6 ] = ad * f + bc;
	            te[ 10 ] = ac - bd * f;
	        } else if ( euler.order === 'XZY' ) {
	            var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
	            te[ 0 ] = c * e;
	            te[ 4 ] = - f;
	            te[ 8 ] = d * e;
	            te[ 1 ] = ac * f + bd;
	            te[ 5 ] = a * e;
	            te[ 9 ] = ad * f - bc;
	            te[ 2 ] = bc * f - ad;
	            te[ 6 ] = b * e;
	            te[ 10 ] = bd * f + ac;
	        }
	        // last column
	        te[ 3 ] = 0;
	        te[ 7 ] = 0;
	        te[ 11 ] = 0;
	        // bottom row
	        te[ 12 ] = 0;
	        te[ 13 ] = 0;
	        te[ 14 ] = 0;
	        te[ 15 ] = 1;
	        return this;
	    },

	    //通过四元数获得旋转矩阵，推导过程可以baidu
	    makeRotationFromQuaternion: function ( q ) {
	        var te = this.elements;

	        var x = q.x, y = q.y, z = q.z, w = q.w;
	        var x2 = x + x, y2 = y + y, z2 = z + z;
	        var xx = x * x2, xy = x * y2, xz = x * z2;
	        var yy = y * y2, yz = y * z2, zz = z * z2;
	        var wx = w * x2, wy = w * y2, wz = w * z2;

	        te[ 0 ] = 1 - ( yy + zz );
	        te[ 4 ] = xy - wz;
	        te[ 8 ] = xz + wy;

	        te[ 1 ] = xy + wz;
	        te[ 5 ] = 1 - ( xx + zz );
	        te[ 9 ] = yz - wx;

	        te[ 2 ] = xz - wy;
	        te[ 6 ] = yz + wx;
	        te[ 10 ] = 1 - ( xx + yy );

	        // last column
	        te[ 3 ] = 0;
	        te[ 7 ] = 0;
	        te[ 11 ] = 0;

	        // bottom row
	        te[ 12 ] = 0;
	        te[ 13 ] = 0;
	        te[ 14 ] = 0;
	        te[ 15 ] = 1;
	        return this;
	    },

	    //这里是一个可以比较清晰看到基向量和旋转矩阵关系的地方，先算出z轴基向量，再算出x轴基向量，最后是y轴，然后基向量组合成旋转矩阵
	    lookAt: function () {
	        var x = new Vector3();
	        var y = new Vector3();
	        var z = new Vector3();
	        return function lookAt( eye, target, up ) {
	            var te = this.elements;
	            z.subVectors( eye, target ).normalize();
	            if ( z.lengthSq() === 0 ) {
	                z.z = 1;
	            }

	            x.crossVectors( up, z ).normalize();

	            if ( x.lengthSq() === 0 ) {
	                z.z += 0.0001;
	                x.crossVectors( up, z ).normalize();
	            }

	            y.crossVectors( z, x );

	            te[ 0 ] = x.x; te[ 4 ] = y.x; te[ 8 ] = z.x;
	            te[ 1 ] = x.y; te[ 5 ] = y.y; te[ 9 ] = z.y;
	            te[ 2 ] = x.z; te[ 6 ] = y.z; te[ 10 ] = z.z;
	            return this;
	        };
	    }(),

	    //矩阵乘法
	    multiply: function ( m ) {
	        return this.multiplyMatrices( this, m );
	    },

	    //矩阵左乘
	    premultiply: function ( m ) {
	        return this.multiplyMatrices( m, this );
	    },

	    //矩阵相乘
	    multiplyMatrices: function ( a, b ) {
	        var ae = a.elements;
	        var be = b.elements;
	        var te = this.elements;

	        var a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
	        var a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
	        var a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
	        var a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

	        var b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
	        var b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
	        var b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
	        var b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

	        te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
	        te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
	        te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
	        te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

	        te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
	        te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
	        te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
	        te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

	        te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
	        te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
	        te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
	        te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

	        te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
	        te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
	        te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
	        te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
	        return this;
	    },

	    //矩阵乘以标量
	    multiplyScalar: function ( s ) {
	        var te = this.elements;
	        te[ 0 ] *= s; te[ 4 ] *= s; te[ 8 ] *= s; te[ 12 ] *= s;
	        te[ 1 ] *= s; te[ 5 ] *= s; te[ 9 ] *= s; te[ 13 ] *= s;
	        te[ 2 ] *= s; te[ 6 ] *= s; te[ 10 ] *= s; te[ 14 ] *= s;
	        te[ 3 ] *= s; te[ 7 ] *= s; te[ 11 ] *= s; te[ 15 ] *= s;
	        return this;
	    },

	    //四维矩阵行列式计算
	    determinant: function () {
	        var te = this.elements;

	        var n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
	        var n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
	        var n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
	        var n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

	        return (
	            n41 * (
	                + n14 * n23 * n32
	                - n13 * n24 * n32
	                - n14 * n22 * n33
	                + n12 * n24 * n33
	                + n13 * n22 * n34
	                - n12 * n23 * n34
	            ) +
	            n42 * (
	                + n11 * n23 * n34
	                - n11 * n24 * n33
	                + n14 * n21 * n33
	                - n13 * n21 * n34
	                + n13 * n24 * n31
	                - n14 * n23 * n31
	            ) +
	            n43 * (
	                + n11 * n24 * n32
	                - n11 * n22 * n34
	                - n14 * n21 * n32
	                + n12 * n21 * n34
	                + n14 * n22 * n31
	                - n12 * n24 * n31
	            ) +
	            n44 * (
	                - n13 * n22 * n31
	                - n11 * n23 * n32
	                + n11 * n22 * n33
	                + n13 * n21 * n32
	                - n12 * n21 * n33
	                + n12 * n23 * n31
	            )
	        );
	    },

	    //矩阵转置
	    transpose: function () {
	        var te = this.elements;
	        var tmp;

	        tmp = te[ 1 ]; te[ 1 ] = te[ 4 ]; te[ 4 ] = tmp;
	        tmp = te[ 2 ]; te[ 2 ] = te[ 8 ]; te[ 8 ] = tmp;
	        tmp = te[ 6 ]; te[ 6 ] = te[ 9 ]; te[ 9 ] = tmp;

	        tmp = te[ 3 ]; te[ 3 ] = te[ 12 ]; te[ 12 ] = tmp;
	        tmp = te[ 7 ]; te[ 7 ] = te[ 13 ]; te[ 13 ] = tmp;
	        tmp = te[ 11 ]; te[ 11 ] = te[ 14 ]; te[ 14 ] = tmp;

	        return this;
	    },

	    //设置位移
	    setPosition: function ( v ) {
	        var te = this.elements;
	        te[ 12 ] = v.x;
	        te[ 13 ] = v.y;
	        te[ 14 ] = v.z;
	        return this;
	    },

	    //计算逆矩阵
	    getInverse: function ( m ) {
	        var te = this.elements,
	            me = m.elements,

	            n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ],
	            n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ],
	            n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ],
	            n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ],

	            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
	            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
	            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
	            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

	        var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

	        if ( det === 0 ) return this.identity();

	        var detInv = 1 / det;

	        te[ 0 ] = t11 * detInv;
	        te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
	        te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
	        te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

	        te[ 4 ] = t12 * detInv;
	        te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
	        te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
	        te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

	        te[ 8 ] = t13 * detInv;
	        te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
	        te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
	        te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

	        te[ 12 ] = t14 * detInv;
	        te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
	        te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
	        te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;
	        return this;
	    },

	    //矩阵乘以标量
	    scale: function ( v ) {
	        var te = this.elements;
	        var x = v.x, y = v.y, z = v.z;
	        te[ 0 ] *= x; te[ 4 ] *= y; te[ 8 ] *= z;
	        te[ 1 ] *= x; te[ 5 ] *= y; te[ 9 ] *= z;
	        te[ 2 ] *= x; te[ 6 ] *= y; te[ 10 ] *= z;
	        te[ 3 ] *= x; te[ 7 ] *= y; te[ 11 ] *= z;
	        return this;
	    },

	    //获得三维基坐标缩放比例最大值
	    getMaxScaleOnAxis: function () {
	        var te = this.elements;
	        var scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
	        var scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
	        var scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];
	        return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );
	    },

	    //设置位移矩阵
	    makeTranslation: function ( x, y, z ) {
	        this.set(
	            1, 0, 0, x,
	            0, 1, 0, y,
	            0, 0, 1, z,
	            0, 0, 0, 1
	        );
	        return this;
	    },

	    //设置x轴旋转矩阵
	    makeRotationX: function ( theta ) {
	        var c = Math.cos( theta ), s = Math.sin( theta );
	        this.set(
	            1, 0,  0, 0,
	            0, c, - s, 0,
	            0, s,  c, 0,
	            0, 0,  0, 1
	        );
	        return this;
	    },

	    //设置y轴旋转矩阵
	    makeRotationY: function ( theta ) {
	        var c = Math.cos( theta ), s = Math.sin( theta );
	        this.set(
	            c, 0, s, 0,
	            0, 1, 0, 0,
	            - s, 0, c, 0,
	            0, 0, 0, 1
	        );
	        return this;
	    },

	    //设置z轴旋转矩阵
	    makeRotationZ: function ( theta ) {
	        var c = Math.cos( theta ), s = Math.sin( theta );
	        this.set(
	            c, - s, 0, 0,
	            s,  c, 0, 0,
	            0,  0, 1, 0,
	            0,  0, 0, 1
	        );
	        return this;
	    },

	    //通过轴角设置旋转矩阵
	    makeRotationAxis: function ( axis, angle ) {
	        var c = Math.cos( angle );
	        var s = Math.sin( angle );
	        var t = 1 - c;
	        var x = axis.x, y = axis.y, z = axis.z;
	        var tx = t * x, ty = t * y;

	        this.set(
	            tx * x + c, tx * y - s * z, tx * z + s * y, 0,
	            tx * y + s * z, ty * y + c, ty * z - s * x, 0,
	            tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
	            0, 0, 0, 1
	        );
	        return this;
	    },

	    //设施缩放变换矩阵
	    makeScale: function ( x, y, z ) {
	        this.set(
	            x, 0, 0, 0,
	            0, y, 0, 0,
	            0, 0, z, 0,
	            0, 0, 0, 1
	        );
	        return this;
	    },

	    //设置剪切变换矩阵
	    makeShear: function ( x, y, z ) {
	        this.set(
	            1, y, z, 0,
	            x, 1, z, 0,
	            x, y, 1, 0,
	            0, 0, 0, 1
	        );
	        return this;
	    },

	    //通过位置向量，旋转四元数，缩放向量合并定义仿射矩阵
	    compose: function ( position, quaternion, scale ) {
	        this.makeRotationFromQuaternion( quaternion );
	        this.scale( scale );
	        this.setPosition( position );
	        return this;
	    },

	    //将放射矩阵分解成位置向量，旋转四元数，缩放向量
	    decompose: function () {
	        var vector = new Vector3();
	        var matrix = new Matrix4();
	        return function decompose( position, quaternion, scale ) {
	            var te = this.elements;
	            var sx = vector.set( te[ 0 ], te[ 1 ], te[ 2 ] ).length();
	            var sy = vector.set( te[ 4 ], te[ 5 ], te[ 6 ] ).length();
	            var sz = vector.set( te[ 8 ], te[ 9 ], te[ 10 ] ).length();

	            // if determine is negative, we need to invert one scale
	            var det = this.determinant();
	            if ( det < 0 ) {
	                sx = - sx;
	            }

	            position.x = te[ 12 ];
	            position.y = te[ 13 ];
	            position.z = te[ 14 ];

	            // scale the rotation part
	            for ( var i = 0; i < 16; i ++ ) matrix.elements[ i ] = this.elements[ i ]; // at this point matrix is incomplete so we can't use .copy()

	            var invSX = 1 / sx;
	            var invSY = 1 / sy;
	            var invSZ = 1 / sz;

	            matrix.elements[ 0 ] *= invSX;
	            matrix.elements[ 1 ] *= invSX;
	            matrix.elements[ 2 ] *= invSX;

	            matrix.elements[ 4 ] *= invSY;
	            matrix.elements[ 5 ] *= invSY;
	            matrix.elements[ 6 ] *= invSY;

	            matrix.elements[ 8 ] *= invSZ;
	            matrix.elements[ 9 ] *= invSZ;
	            matrix.elements[ 10 ] *= invSZ;

	            quaternion.setFromRotationMatrix( matrix );

	            scale.x = sx;
	            scale.y = sy;
	            scale.z = sz;
	            return this;
	        };
	    }(),

	    //计算透视矩阵，就是最常用变换三人组MVP中的P
	    makePerspective: function ( left, right, top, bottom, near, far ) {
	        var te = this.elements;
	        var x = 2 * near / ( right - left );
	        var y = 2 * near / ( top - bottom );

	        var a = ( right + left ) / ( right - left );
	        var b = ( top + bottom ) / ( top - bottom );
	        var c = - ( far + near ) / ( far - near );
	        var d = - 2 * far * near / ( far - near );

	        te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
	        te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
	        te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
	        te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;
	        return this;
	    },

	    //计算正交矩阵
	    makeOrthographic: function ( left, right, top, bottom, near, far ) {
	        var te = this.elements;
	        var w = 1.0 / ( right - left );
	        var h = 1.0 / ( top - bottom );
	        var p = 1.0 / ( far - near );

	        var x = ( right + left ) * w;
	        var y = ( top + bottom ) * h;
	        var z = ( far + near ) * p;

	        te[ 0 ] = 2 * w;te[ 4 ] = 0;	te[ 8 ] = 0;		te[ 12 ] = - x;
	        te[ 1 ] = 0;	te[ 5 ] = 2 * h;te[ 9 ] = 0;		te[ 13 ] = - y;
	        te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 2 * p;	te[ 14 ] = - z;
	        te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = 0;		te[ 15 ] = 1;
	        return this;
	    },

	    equals: function ( matrix ) {
	        var te = this.elements;
	        var me = matrix.elements;
	        for ( var i = 0; i < 16; i ++ ) {
	            if ( te[ i ] !== me[ i ] ) return false;
	        }
	        return true;
	    },

	    fromArray: function ( array, offset ) {
	        if ( offset === undefined ) offset = 0;
	        for( var i = 0; i < 16; i ++ ) {
	            this.elements[ i ] = array[ i + offset ];
	        }
	        return this;
	    },

	    toArray: function ( array, offset ) {
	        if ( array === undefined ) array = [];
	        if ( offset === undefined ) offset = 0;

	        var te = this.elements;

	        array[ offset ] = te[ 0 ];
	        array[ offset + 1 ] = te[ 1 ];
	        array[ offset + 2 ] = te[ 2 ];
	        array[ offset + 3 ] = te[ 3 ];

	        array[ offset + 4 ] = te[ 4 ];
	        array[ offset + 5 ] = te[ 5 ];
	        array[ offset + 6 ] = te[ 6 ];
	        array[ offset + 7 ] = te[ 7 ];

	        array[ offset + 8 ]  = te[ 8 ];
	        array[ offset + 9 ]  = te[ 9 ];
	        array[ offset + 10 ] = te[ 10 ];
	        array[ offset + 11 ] = te[ 11 ];

	        array[ offset + 12 ] = te[ 12 ];
	        array[ offset + 13 ] = te[ 13 ];
	        array[ offset + 14 ] = te[ 14 ];
	        array[ offset + 15 ] = te[ 15 ];
	        return array;
	    }

	});

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

	function Euler(x, y, z, order) {
	    this._x = x || 0;
	    this._y = y || 0;
	    this._z = z || 0;
	    this._order = order || Euler.DefaultOrder;
	}

	//欧拉角旋转顺序，默认顺序是X轴,Y轴,Z轴
	Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];
	Euler.DefaultOrder = 'XYZ';

	//定义属性
	Object.defineProperties(Euler.prototype, {
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

	    "order": {
	        get: function () {
	            return this._order;
	        },
	        set: function (value) {
	            this._order = value;
	            this.onChangeCallback();
	        }
	    }

	});

	//定义方法
	Object.assign(Euler.prototype, {

	    isEuler: true,

	    set: function (x, y, z, order) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._order = order || this._order;
	        this.onChangeCallback();
	        return this;
	    },

	    clone: function () {
	        return new this.constructor(this._x, this._y, this._z, this._order);
	    },

	    copy: function (euler) {
	        this._x = euler._x;
	        this._y = euler._y;
	        this._z = euler._z;
	        this._order = euler._order;
	        this.onChangeCallback();
	        return this;
	    },

	    //用四维仿射矩阵中的旋转部分换算为欧拉角，具体的换算过程可以baidu
	    setFromRotationMatrix: function (m, order, update) {
	        var clamp = _Math.clamp;

	        var te = m.elements;
	        var m11 = te[0], m12 = te[4], m13 = te[8];
	        var m21 = te[1], m22 = te[5], m23 = te[9];
	        var m31 = te[2], m32 = te[6], m33 = te[10];

	        order = order || this._order;

	        if (order === 'XYZ') {
	            this._y = Math.asin(clamp(m13, -1, 1));
	            if (Math.abs(m13) < 0.99999) {
	                this._x = Math.atan2(-m23, m33);
	                this._z = Math.atan2(-m12, m11);
	            } else {
	                this._x = Math.atan2(m32, m22);
	                this._z = 0;
	            }
	        } else if (order === 'YXZ') {
	            this._x = Math.asin(-clamp(m23, -1, 1));
	            if (Math.abs(m23) < 0.99999) {
	                this._y = Math.atan2(m13, m33);
	                this._z = Math.atan2(m21, m22);
	            } else {
	                this._y = Math.atan2(-m31, m11);
	                this._z = 0;
	            }
	        } else if (order === 'ZXY') {
	            this._x = Math.asin(clamp(m32, -1, 1));
	            if (Math.abs(m32) < 0.99999) {
	                this._y = Math.atan2(-m31, m33);
	                this._z = Math.atan2(-m12, m22);
	            } else {
	                this._y = 0;
	                this._z = Math.atan2(m21, m11);
	            }
	        } else if (order === 'ZYX') {
	            this._y = Math.asin(-clamp(m31, -1, 1));
	            if (Math.abs(m31) < 0.99999) {
	                this._x = Math.atan2(m32, m33);
	                this._z = Math.atan2(m21, m11);
	            } else {
	                this._x = 0;
	                this._z = Math.atan2(-m12, m22);
	            }
	        } else if (order === 'YZX') {
	            this._z = Math.asin(clamp(m21, -1, 1));
	            if (Math.abs(m21) < 0.99999) {
	                this._x = Math.atan2(-m23, m22);
	                this._y = Math.atan2(-m31, m11);
	            } else {
	                this._x = 0;
	                this._y = Math.atan2(m13, m33);
	            }
	        } else if (order === 'XZY') {
	            this._z = Math.asin(-clamp(m12, -1, 1));
	            if (Math.abs(m12) < 0.99999) {
	                this._x = Math.atan2(m32, m22);
	                this._y = Math.atan2(m13, m11);
	            } else {
	                this._x = Math.atan2(-m23, m33);
	                this._y = 0;
	            }
	        } else {
	            console.warn('THREE.Euler: .setFromRotationMatrix() given unsupported order: ' + order);
	        }

	        this._order = order;

	        if (update !== false) this.onChangeCallback();

	        return this;
	    },

	    //用四元数换算成欧拉角，先将四元数转成矩阵，再将矩阵转到欧拉角
	    setFromQuaternion: function () {
	        var matrix = new Matrix4();
	        return function setFromQuaternion(q, order, update) {
	            matrix.makeRotationFromQuaternion(q);
	            return this.setFromRotationMatrix(matrix, order, update);
	        };
	    }(),

	    //用三维向量设置欧拉角
	    setFromVector3: function (v, order) {
	        return this.set(v.x, v.y, v.z, order || this._order);
	    },

	    //重新安排旋转顺序，先将当前旋转信息换算成四元数，再用新顺序换算回来
	    reorder: function () {
	        var q = new Quaternion();
	        return function reorder(newOrder) {
	            q.setFromEuler(this);
	            return this.setFromQuaternion(q, newOrder);
	        };
	    }(),

	    //判断是否相等
	    equals: function (euler) {
	        return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );
	    },

	    fromArray: function (array) {
	        this._x = array[0];
	        this._y = array[1];
	        this._z = array[2];
	        if (array[3] !== undefined) this._order = array[3];
	        this.onChangeCallback();
	        return this;
	    },

	    toArray: function (array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;
	        array[offset] = this._x;
	        array[offset + 1] = this._y;
	        array[offset + 2] = this._z;
	        array[offset + 3] = this._order;
	        return array;
	    },

	    toVector3: function (optionalResult) {
	        if (optionalResult) {
	            return optionalResult.set(this._x, this._y, this._z);
	        } else {
	            return new Vector3(this._x, this._y, this._z);
	        }
	    },

	    onChange: function (callback) {
	        this.onChangeCallback = callback;
	        return this;
	    },

	    onChangeCallback: function () {
	    }

	});

	function Matrix3() {
	    //虽然是列主序，但这里elements布局看到的确是行主序，第一行1，0，0是x轴基向量，其实代表的是实际矩阵的左边第一列向量，这里要区分清楚。
	    this.elements = [
	        1, 0, 0,
	        0, 1, 0,
	        0, 0, 1
	    ];
	}


	Object.assign(Matrix3.prototype, {

	    isMatrix3: true,

	    //这里注意，这里的矩阵是列主序的，所以一下排布看起来可以清晰一些
	    set: function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {
	        var te = this.elements;
	        te[ 0 ] = n11; te[ 3 ] = n12; te[ 6 ] = n13;
	        te[ 1 ] = n21; te[ 4 ] = n22; te[ 7 ] = n23;
	        te[ 2 ] = n31; te[ 5 ] = n32; te[ 8 ] = n33;
	        return this;
	    },

	    //因为是列主序，这里使用set方法时的参数布局看到的就是列主序，左边竖列1，0，0是x轴基向量。
	    identity: function () {
	        this.set(
	            1, 0, 0,
	            0, 1, 0,
	            0, 0, 1
	        );
	        return this;
	    },

	    clone: function () {
	        return new this.constructor().fromArray( this.elements );
	    },

	    copy: function ( m ) {
	        var te = this.elements;
	        var me = m.elements;
	        for ( var i = 0; i < 9; i ++ ) te[ i ] = me[ i ];
	        return this;
	    },

	    //获取思维矩阵的三维部分，相当于从仿射矩阵变为旋转矩阵，这里结合上面提到的列主序原则，不难理解这里set中的排列顺序。
	    setFromMatrix4: function ( m ) {
	        var me = m.elements;
	        this.set(
	            me[ 0 ], me[ 4 ], me[  8 ],
	            me[ 1 ], me[ 5 ], me[  9 ],
	            me[ 2 ], me[ 6 ], me[ 10 ]
	        );
	        return this;
	    },

	    multiplyScalar: function ( s ) {
	        var te = this.elements;
	        te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
	        te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
	        te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;
	        return this;
	    },

	    //矩阵行列式，结果不受矩阵转置影响。这里包括下面的求逆中参数排列成行主序是为了查看方便，这里不影响计算结果。
	    determinant: function () {
	        var te = this.elements;
	        var a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
	            d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
	            g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];
	        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
	    },

	    //矩阵求逆，具体算法可以baidu
	    getInverse: function(matrix){
	        var me = matrix.elements,
	            te = this.elements,

	            n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ],
	            n12 = me[ 3 ], n22 = me[ 4 ], n32 = me[ 5 ],
	            n13 = me[ 6 ], n23 = me[ 7 ], n33 = me[ 8 ],

	            t11 = n33 * n22 - n32 * n23,
	            t12 = n32 * n13 - n33 * n12,
	            t13 = n23 * n12 - n22 * n13,

	            det = n11 * t11 + n21 * t12 + n31 * t13;

	        if ( det === 0 ) return this.identity();

	        var detInv = 1 / det;

	        te[ 0 ] = t11 * detInv;
	        te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
	        te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;
	        te[ 3 ] = t12 * detInv;
	        te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
	        te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;
	        te[ 6 ] = t13 * detInv;
	        te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
	        te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;
	        return this;
	    },

	    //矩阵转置
	    transpose: function () {
	        var tmp, m = this.elements;
	        tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
	        tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
	        tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;
	        return this;
	    },

	    //获取法线变换矩阵
	    getNormalMatrix: function ( matrix4 ) {
	        return this.setFromMatrix4( matrix4 ).getInverse( this ).transpose();
	    },

	    fromArray: function ( array, offset ) {
	        if ( offset === undefined ) offset = 0;
	        for ( var i = 0; i < 9; i ++ ) {
	            this.elements[ i ] = array[ i + offset ];
	        }
	        return this;
	    },

	    toArray: function ( array, offset ) {
	        if ( array === undefined ) array = [];
	        if ( offset === undefined ) offset = 0;
	        var te = this.elements;
	        array[ offset ] = te[ 0 ];
	        array[ offset + 1 ] = te[ 1 ];
	        array[ offset + 2 ] = te[ 2 ];
	        array[ offset + 3 ] = te[ 3 ];
	        array[ offset + 4 ] = te[ 4 ];
	        array[ offset + 5 ] = te[ 5 ];
	        array[ offset + 6 ] = te[ 6 ];
	        array[ offset + 7 ] = te[ 7 ];
	        array[ offset + 8 ] = te[ 8 ];
	        return array;
	    }

	});

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

	function Scene () {

	    Object3D.call( this );

	    this.type = 'Scene';

	}

	Scene.prototype = Object.assign( Object.create( Object3D.prototype ), {

	    constructor: Scene,

	} );

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

	function Group() {

		Object3D.call( this );

		this.type = 'Group';

	}

	Group.prototype = Object.assign( Object.create( Object3D.prototype ), {

		constructor: Group

	} );

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

	function CssSprite(element) {
	    CssObject.call(this, element);
	}


	CssSprite.prototype = Object.assign(Object.create(CssObject.prototype), {
	    constructor: CssSprite,

	    isCssSprite: true,

	});

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

	exports.EventDispatcher = EventDispatcher;
	exports.Object3D = Object3D;
	exports.Scene = Scene;
	exports.Camera = Camera;
	exports.Group = Group;
	exports.Math = _Math;
	exports.Euler = Euler;
	exports.Matrix3 = Matrix3;
	exports.Matrix4 = Matrix4;
	exports.Quaternion = Quaternion;
	exports.Vector3 = Vector3;
	exports.CssSprite = CssSprite;
	exports.CssObject = CssObject;
	exports.CssRenderer = CssRenderer;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
