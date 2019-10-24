(function() {
  function isFieldDescriptor(possibleDesc) {
    let [target, key, desc] = possibleDesc;

    return (
      possibleDesc.length === 3 &&
      typeof target === 'object' &&
      target !== null &&
      typeof key === 'string' &&
      ((typeof desc === 'object' &&
        desc !== null &&
        'enumerable' in desc &&
        'configurable' in desc) ||
        desc === undefined) // TS compatibility
    );
  }

  let mainRequire = require;

  function computedMacroWithOptionalParams(fn) {
    return (...maybeDesc) =>
      (isFieldDescriptor(maybeDesc)
        ? Function.apply.call(fn(), undefined, maybeDesc)
        : Function.apply.call(fn, undefined, maybeDesc))
  }

  window.require = require = function patchDataDecorators(moduleName) {
    let DS;

    try {
      DS = mainRequire('ember-data').default;
    } catch (e) {
      return mainRequire(moduleName);
    }

    let {
      attr: dataAttr,
      belongsTo: dataBelongsTo,
      hasMany: dataHasMany,
    } = DS;

    let attr = computedMacroWithOptionalParams(dataAttr);
    let belongsTo = computedMacroWithOptionalParams(dataBelongsTo);
    let hasMany = computedMacroWithOptionalParams(dataHasMany);

    DS.attr = attr;
    DS.belongsTo = belongsTo;
    DS.hasMany = hasMany;

    if (mainRequire.entries['@ember-data/model/index']) {
      let newExports = Object.assign(
        {},
        mainRequire.entries['@ember-data/model/index'].module.exports,
        { attr, belongsTo, hasMany }
      );

      mainRequire.entries['@ember-data/model/index'].module.exports = newExports;
    }

    window.require = require = mainRequire;

    return mainRequire(moduleName);
  }
})();

