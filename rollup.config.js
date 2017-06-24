export default {
  entry: './release/index.js',
  dest: './release/bundles/cache.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'ngx-utils.cache',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-server': 'ng.platformServer',
    'rxjs/Observable': 'Rx'
  }
}