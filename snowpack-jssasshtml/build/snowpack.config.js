// import pkgJ from './package.json';
const name = 'app';
const date = new Date().toDateString();

module.exports = {
  plugins: [
    '@snowpack/plugin-sass'
    // ['snowpack-plugin-zip', { outputPath: `build/${name}--${date}.zip` }]
  ],
  optimize: {
    minify: true,
    bundle: true,
    splitting: true,
    treeshake: true,
    target: 'es2019'
  }
};