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

export {_Math};
