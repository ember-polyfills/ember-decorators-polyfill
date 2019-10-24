'use strict';
const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();
    let emberDataVersion = checker.for('ember-data');

    this.shouldPolyfill = emberVersion.lt('3.10.0-alpha.0') || emberDataVersion.lt('3.10.0-alpha.0');
  },

  included() {
    this._super.included.apply(this, arguments);

    if (!this.shouldPolyfill) {
      return;
    }

    this.import('vendor/ember-decorators-polyfill/index.js');
  },

  treeForVendor(rawVendorTree) {
    if (!this.shouldPolyfill) {
      return;
    }

    let babelAddon = this.addons.find(
      addon => addon.name === 'ember-cli-babel'
    );

    let transpiledVendorTree = babelAddon.transpileTree(rawVendorTree, {
      babel: this.options.babel,

      'ember-cli-babel': {
        compileModules: false,
      },
    });

    return transpiledVendorTree;
  },
};
