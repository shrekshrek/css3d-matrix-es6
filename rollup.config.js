import uglify from 'rollup-plugin-uglify';

export default [{
	entry: 'src/M3D.js',
	indent: '\t',
	targets: [
		{
			format: 'umd',
			moduleName: 'M3D',
			dest: 'build/m3d.js'
		}
	],
    banner: '/*!\n * GIT:https://github.com/shrekshrek/css3d-matrix-es6\n * @author: Shrek.wang\n **/\n',
},{
    entry: 'src/M3D.js',
    indent: '\t',
    targets: [
        {
            format: 'umd',
            moduleName: 'M3D',
            dest: 'build/m3d.min.js'
        }
    ],
    plugins: [
        uglify()
    ],
}];
