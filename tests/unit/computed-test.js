import { DEBUG } from '@glimmer/env';
import { module, test } from 'ember-qunit';
import EmberObject, { computed, get, set, setProperties } from '@ember/object';
import { addObserver } from '@ember/object/observers';

import classic from 'ember-classic-decorator';
import { lte } from 'ember-compatibility-helpers';

module('@computed', function() {
  test('it works', function(assert) {
    assert.expect(2);

    class Foo {
      first = 'rob';
      last = 'jackson';

      @computed('first', 'last')
      get fullName() {
        assert.equal(this.first, 'rob');
        assert.equal(this.last, 'jackson');
      }
    }

    let obj = new Foo();
    get(obj, 'fullName');
  });

  test('it works with functions', function(assert) {
    assert.expect(2);

    class Foo {
      first = 'rob';
      last = 'jackson';

      @computed('first', 'last', function() {
        assert.equal(this.first, 'rob');
        assert.equal(this.last, 'jackson');
      })
      fullName;
    }

    let obj = new Foo();
    get(obj, 'fullName');
  });

  test('it works with computed desc', function(assert) {
    assert.expect(4);

    let expectedName = 'rob jackson';
    let expectedFirst = 'rob';
    let expectedLast = 'jackson';

    class Foo {
      first = 'rob';
      last = 'jackson';

      @computed('first', 'last', {
        get() {
          assert.equal(this.first, expectedFirst, 'getter: first name matches');
          assert.equal(this.last, expectedLast, 'getter: last name matches');
          return `${this.first} ${this.last}`;
        },

        set(key, name) {
          assert.equal(name, expectedName, 'setter: name matches');

          const [first, last] = name.split(' ');
          setProperties(this, { first, last });

          return name;
        },
      })
      fullName;
    }

    let obj = new Foo();
    get(obj, 'fullName');

    expectedName = 'yehuda katz';
    expectedFirst = 'yehuda';
    expectedLast = 'katz';
    set(obj, 'fullName', 'yehuda katz');

    assert.strictEqual(
      get(obj, 'fullName'),
      expectedName,
      'return value of getter is new value of property'
    );
  });

  test('works with getter and setter', function(assert) {
    assert.expect(6);

    let expectedName = 'rob jackson';
    let expectedFirst = 'rob';
    let expectedLast = 'jackson';

    class Foo {
      constructor() {
        this.first = 'rob';
        this.last = 'jackson';
      }

      @computed('first', 'last')
      get fullName() {
        assert.equal(this.first, expectedFirst, 'getter: first name matches');
        assert.equal(this.last, expectedLast, 'getter: last name matches');
        return `${this.first} ${this.last}`;
      }

      set fullName(name) {
        assert.equal(name, expectedName, 'setter: name matches');

        const [first, last] = name.split(' ');
        setProperties(this, { first, last });
      }
    }

    let obj = new Foo();
    get(obj, 'fullName');

    expectedName = 'yehuda katz';
    expectedFirst = 'yehuda';
    expectedLast = 'katz';
    set(obj, 'fullName', 'yehuda katz');

    assert.strictEqual(
      get(obj, 'fullName'),
      expectedName,
      'return value of getter is new value of property'
    );
  });

  test('it works with classic classes', function(assert) {
    assert.expect(2);

    const Foo = EmberObject.extend({
      first: 'rob',
      last: 'jackson',

      fullName: computed('first', 'last', function() {
        assert.equal(this.first, 'rob');
        assert.equal(this.last, 'jackson');
      }),
    });

    let obj = Foo.create();
    get(obj, 'fullName');
  });

  test('it works with classic classes with _super [getter]', function(assert) {
    assert.expect(1);

    const Foo = EmberObject.extend({
      first: 'rob',
      last: 'jackson',

      fullName: computed('first', 'last', function() {
        return `${this.first} ${this.last}`;
      }),
    });

    const Bar = Foo.extend({
      githubAlias: 'rwjblue',
      fullName: computed('githubAlias', function() {
        const fullName = this._super();
        return `${fullName} [ ${this.githubAlias} ]`;
      }),
    });

    let obj = Bar.create();
    const fullName = get(obj, 'fullName');

    assert.equal(fullName, 'rob jackson [ rwjblue ]');
  });

  test('it works with classic classes with _super [setter]', function(assert) {
    assert.expect(2);

    const Foo = EmberObject.extend({
      firstName: null,

      fullName: computed('firstName', {
        get() {
          return `${this.firstName}`;
        },
        set(key, value) {
          let [firstName] = value.split(/\s+/);
          this.set('firstName', firstName);
          return value;
        },
      }),
    });

    const Bar = Foo.extend({
      lastName: null,

      fullName: computed('lastName', {
        get(key) {
          return `${this._super(key)} ${this.lastName}`;
        },
        set(key, value) {
          this._super(key, value);
          let [, lastName] = value.split(/\s+/);
          this.set('lastName', lastName);
          return value;
        },
      }),
    });

    let obj = Bar.create();
    obj.set('fullName', 'rob jackson');
    assert.equal(obj.get('firstName'), 'rob');
    assert.equal(obj.get('lastName'), 'jackson');
  });

  test('it works with classic classes with full desc', function(assert) {
    assert.expect(4);

    let expectedName = 'rob jackson';
    let expectedFirst = 'rob';
    let expectedLast = 'jackson';

    const Foo = EmberObject.extend({
      first: 'rob',
      last: 'jackson',

      fullName: computed('first', 'last', {
        get() {
          assert.equal(this.first, expectedFirst, 'getter: first name matches');
          assert.equal(this.last, expectedLast, 'getter: last name matches');
          return `${this.first} ${this.last}`;
        },

        set(key, name) {
          assert.equal(name, expectedName, 'setter: name matches');

          const [first, last] = name.split(' ');
          setProperties(this, { first, last });

          return name;
        },
      }),
    });

    let obj = Foo.create();
    get(obj, 'fullName');

    expectedName = 'yehuda katz';
    expectedFirst = 'yehuda';
    expectedLast = 'katz';
    set(obj, 'fullName', 'yehuda katz');

    assert.strictEqual(
      get(obj, 'fullName'),
      expectedName,
      'return value of getter is new value of property'
    );
  });

  test('it works with classic classes with setter-only desc', function(assert) {
    assert.expect(4);

    let expectedName = 'rob jackson';

    const Foo = EmberObject.extend({
      first: 'rob',
      last: 'jackson',

      fullName: computed('first', 'last', {
        set(key, name) {
          assert.equal(name, expectedName, 'setter: name matches');

          const [first, last] = name.split(' ');
          setProperties(this, { first, last });

          return name;
        },
      }),
    });

    let obj = Foo.create();

    expectedName = 'yehuda katz';
    set(obj, 'fullName', 'yehuda katz');

    assert.equal(obj.first, 'yehuda', 'first name was updated');
    assert.equal(obj.last, 'katz', 'last name was updated');
    assert.strictEqual(
      get(obj, 'fullName'),
      expectedName,
      'return value of setter is new value of property'
    );
  });

  test('it works with classic classes with getter-only desc extending desc with setter', function(assert) {
    assert.expect(1);

    const Foo = EmberObject.extend({
      fullName: computed('firstName', {
        get() {
          assert.ok(false, 'Overriden CP getter must not be called.');
        },
        set(key, value) {
          return value;
        },
      }),
    });

    const Bar = Foo.extend({
      first: 'rob',
      last: 'jackson',

      fullName: computed('lastName', {
        get() {
          return `${this.first} ${this.last}`;
        },
      }),
    });

    let obj = Bar.create();
    assert.equal(obj.get('fullName'), 'rob jackson');
  });

  test('dependent key changes invalidate the computed property', function(assert) {
    class Foo {
      first = 'rob';
      last = 'jackson';

      @computed('first', 'last')
      get name() {
        return `${this.first} ${this.last}`;
      }
    }

    let obj = new Foo();

    assert.equal(get(obj, 'name'), 'rob jackson');
    set(obj, 'first', 'al');
    assert.equal(get(obj, 'name'), 'al jackson');
  });

  test('only calls getter when dependent keys change', function(assert) {
    let callCount = 0;
    class Foo {
      first = 'rob';
      last = 'jackson';

      @computed('first', 'last')
      get name() {
        callCount++;
      }
    }

    let obj = new Foo();

    get(obj, 'name');
    assert.equal(callCount, 1);

    get(obj, 'name');
    assert.equal(callCount, 1);

    set(obj, 'first', 'al');
    get(obj, 'name');
    assert.equal(callCount, 2);
  });

  test('return value of ES6 setter is not required, but is not ignored', function(assert) {
    class Foo {
      constructor() {
        this.first = 'rob';
        this.last = 'jackson';
      }

      @computed('first', 'last')
      get fullNameNoReturn() {
        return `${this.first} ${this.last}`;
      }

      set fullNameNoReturn(name) {
        const [first, last] = name.split(' ');
        setProperties(this, { first, last });
      }

      @computed('first', 'last')
      get fullNameWithReturn() {
        return `${this.first} ${this.last}`;
      }

      set fullNameWithReturn(name) {
        const [first, last] = name.split(' ');
        setProperties(this, { first, last });

        return 'something else';
      }
    }

    let obj = new Foo();

    set(obj, 'fullNameNoReturn', 'yehuda katz');
    assert.strictEqual(
      get(obj, 'fullNameNoReturn'),
      'yehuda katz',
      'return value of setter is not required, if there is a getter'
    );

    set(obj, 'fullNameWithReturn', 'tom dale');
    assert.strictEqual(
      get(obj, 'fullNameWithReturn'),
      'something else',
      'if the setter returns a value, it is not ignored'
    );
  });

  test('can decorate the same property in multiple subclasses', function(assert) {
    assert.expect(0);

    class Foo {
      @computed('bar')
      get fullName() {}
    }

    class Bar extends Foo {
      @computed('foo')
      get fullName() {}
    }

    class Baz extends Foo {
      @computed('bar')
      get fullName() {}
    }

    // shouldn't cause any errors
    new Foo();
    new Bar();
    new Baz();
  });

  if (lte('3.10.0-alpha.1')) {
    test('can access _dependentKeys on return value', function(assert) {
      let cp = computed('first', 'last', function() {});

      assert.deepEqual(cp._dependentKeys, ['first','last']);
    });
  }

  if (DEBUG) {
    test('throws if used on non-getters', function(assert) {
      assert.throws(() => {
        class Foo {
          constructor() {
            this.first = 'rob';
            this.last = 'jackson';
          }

          @computed('first', 'last')
          fullName() {
            assert.equal(this.first, 'rob');
            assert.equal(this.last, 'jackson');
          }
        }

        new Foo();
      }, /@computed can only be used on accessors or fields, attempted to use it with fullName but that was a method. Try converting it to a getter/);
    });

    test('throws if a ComputedDecorator is passed to `@computed`', function(assert) {
      assert.throws(() => {
        class Foo {
          @computed(
            computed('foo', 'bar', {
              get() {},
            })
          )
          name;
        }

        new Foo();
      });
    });
  }

  module('modifiers', function() {
    test('volatile', function(assert) {
      assert.expect(2);
      @classic
      class Foo extends EmberObject {
        _count = 0;

        @(computed('first').volatile())
        get counter() {
          return this._count++;
        }
        set counter(value) {
          this._count = value;
        }
      }

      let obj = Foo.create();

      addObserver(obj, 'counter', function() {
        assert.ok(false, 'observer called');
      });

      assert.equal(get(obj, 'counter'), 0, 'getter works');
      assert.equal(get(obj, 'counter'), 1, 'getter called each time');

      set(obj, 'counter', 2);
    });

    test('readOnly', function(assert) {
      class Foo {
        first = 'rob';
        last = 'jackson';

        @(computed('first', 'last').readOnly())
        get name() {
          return `${this.first} ${this.last}`;
        }
      }

      let obj = new Foo();

      assert.throws(() => {
        set(obj, 'name', 'al');
      }, /Cannot set read-only property "name" on object:/);
    });

    test('property', function(assert) {
      class Foo {
        first = 'rob';
        last = 'jackson';

        @(computed().property('first', 'last'))
        get name() {
          return `${this.first} ${this.last}`;
        }
      }

      let obj = new Foo();

      set(obj, 'first', 'al');

      assert.equal(get(obj, 'name'), 'al jackson');
    });

    test('can be chained', assert => {
      assert.throws(() => {
        class Foo {
          first = 'rob';
          last = 'jackson';

          @(computed('first')
            .volatile()
            .readOnly()
            .property('last'))
          get name() {
            return `${this.first} ${this.last}`;
          }
        }

        let obj = new Foo();

        set(obj, 'name', 'al');
      }, /Cannot set read-only property "name" on object:/);
    });

    test('work on classic classes', assert => {
      assert.throws(() => {
        const Foo = EmberObject.extend({
          first: 'rob',
          last: 'jackson',

          name: computed('first', function() {
            return `${this.first} ${this.last}`;
          })
            .volatile()
            .readOnly()
            .property('last'),
        });

        let obj = Foo.create();

        set(obj, 'name', 'al');
      }, /Cannot set read-only property "name" on object:/);
    });
  });
});
