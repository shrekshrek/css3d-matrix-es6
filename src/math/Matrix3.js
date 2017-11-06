
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


export {Matrix3};
