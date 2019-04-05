import EmberObject, { action } from '@ember/object';
import Component from '@ember/component';

import { module, test } from 'qunit';
import { setupRenderingTest, skip } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

function registerComponent(
  test,
  name,
  { ComponentClass = Component, template = null }
) {
  let { owner } = test;

  if (ComponentClass) {
    owner.register(`component:${name}`, ComponentClass);
  }

  if (template) {
    owner.register(`template:components/${name}`, template);
  }
}

module('action-decorator', function(hooks) {
  setupRenderingTest(hooks);

  test('action decorator works with ES6 class', async function(assert) {
    class FooComponent extends Component {
      @action
      foo() {
        assert.ok(true, 'called!');
      }
    }

    registerComponent(this, 'foo-bar', {
      ComponentClass: FooComponent,
      template: hbs`<button {{action 'foo'}}>Click Me!</button>`,
    });

    await render(hbs`{{foo-bar}}`);

    await click('button');
  });

  test('action decorator does not add actions to superclass', async function(assert) {
    class Foo extends EmberObject {
      @action
      foo() {
        // Do nothing
      }
    }

    class Bar extends Foo {
      @action
      bar() {
        assert.ok(false, 'called');
      }
    }

    let foo = Foo.create();
    let bar = Bar.create();

    assert.equal(typeof foo.actions.foo, 'function', 'foo has foo action');
    assert.equal(
      typeof foo.actions.bar,
      'undefined',
      'foo does not have bar action'
    );

    assert.equal(typeof bar.actions.foo, 'function', 'bar has foo action');
    assert.equal(typeof bar.actions.bar, 'function', 'bar has bar action');
  });

  test('actions are properly merged through traditional and ES6 prototype hierarchy', async function(assert) {
    assert.expect(4);

    let FooComponent = Component.extend({
      actions: {
        foo() {
          assert.ok(true, 'foo called!');
        },
      },
    });

    class BarComponent extends FooComponent {
      @action
      bar() {
        assert.ok(true, 'bar called!');
      }
    }

    let BazComponent = BarComponent.extend({
      actions: {
        baz() {
          assert.ok(true, 'baz called!');
        },
      },
    });

    class QuxComponent extends BazComponent {
      @action
      qux() {
        assert.ok(true, 'qux called!');
      }
    }

    registerComponent(this, 'qux-component', {
      ComponentClass: QuxComponent,
      template: hbs`
        <button {{action 'foo'}}>Click Foo!</button>
        <button {{action 'bar'}}>Click Bar!</button>
        <button {{action 'baz'}}>Click Baz!</button>
        <button {{action 'qux'}}>Click Qux!</button>
      `,
    });

    await render(hbs`{{qux-component}}`);

    let buttons = findAll('button');

    for (let button of buttons) {
      await click(button);
    }
  });

  test('action decorator super works with native class methods', async function(assert) {
    class FooComponent extends Component {
      foo() {
        assert.ok(true, 'called!');
      }
    }

    class BarComponent extends FooComponent {
      @action
      foo() {
        super.foo();
      }
    }

    registerComponent(this, 'bar-bar', {
      ComponentClass: BarComponent,
      template: hbs`<button {{action 'foo'}}>Click Me!</button>`,
    });

    await render(hbs`{{bar-bar}}`);

    await click('button');
  });

  test('action decorator super works with traditional class methods', async function(assert) {
    let FooComponent = Component.extend({
      foo() {
        assert.ok(true, 'called!');
      },
    });

    class BarComponent extends FooComponent {
      @action
      foo() {
        super.foo();
      }
    }

    registerComponent(this, 'bar-bar', {
      ComponentClass: BarComponent,
      template: hbs`<button {{action 'foo'}}>Click Me!</button>`,
    });

    await render(hbs`{{bar-bar}}`);

    await click('button');
  });

  // This test fails with _classes_ compiled in loose mode
  skip('action decorator works with parent native class actions', async function(assert) {
    class FooComponent extends Component {
      @action
      foo() {
        assert.ok(true, 'called!');
      }
    }

    class BarComponent extends FooComponent {
      @action
      foo() {
        super.foo();
      }
    }

    registerComponent(this, 'bar-bar', {
      ComponentClass: BarComponent,
      template: hbs`<button {{action 'foo'}}>Click Me!</button>`,
    });

    await render(hbs`{{bar-bar}}`);

    await click('button');
  });

  test('action decorator binds functions', async function(assert) {
    class FooComponent extends Component {
      bar = 'some value';

      @action
      foo() {
        assert.equal(this.bar, 'some value', 'context bound correctly');
      }
    }

    registerComponent(this, 'foo-bar', {
      ComponentClass: FooComponent,
      template: hbs`<button onclick={{this.foo}}>Click Me!</button>`,
    });

    await render(hbs`{{foo-bar}}`);

    await click('button');
  });

  // This test fails with _classes_ compiled in loose mode
  skip('action decorator super works correctly when bound', async function(assert) {
    class FooComponent extends Component {
      bar = 'some value';

      @action
      foo() {
        assert.equal(this.bar, 'some value', 'context bound correctly');
      }
    }

    class BarComponent extends FooComponent {
      @action
      foo() {
        super.foo();
      }
    }

    registerComponent(this, 'bar-bar', {
      ComponentClass: BarComponent,
      template: hbs`<button onclick={{this.foo}}>Click Me!</button>`,
    });

    await render(hbs`{{bar-bar}}`);

    await click('button');
  });

  test('action decorator throws an error if applied to non-methods', async function(assert) {
    assert.throws(() => {
      class TestObject extends EmberObject {
        @action foo = 'bar';
      }

      new TestObject();
    }, /The @action decorator must be applied to methods/);
  });

  test('action decorator throws an error if passed a function in native classes', async function(assert) {
    assert.throws(() => {
      class TestObject extends EmberObject {
        @action(function() {}) foo = 'bar';
      }

      new TestObject();
    }, /The @action decorator may only be passed a method when used in classic classes/);
  });

  test('action decorator can be used as a classic decorator with strings', async function(assert) {
    let FooComponent = Component.extend({
      foo: action(function() {
        assert.ok(true, 'called!');
      }),
    });

    registerComponent(this, 'foo-bar', {
      ComponentClass: FooComponent,
      template: hbs`<button {{action 'foo'}}>Click Me!</button>`,
    });

    await render(hbs`{{foo-bar}}`);

    await click('button');
  });

  test('action decorator can be used as a classic decorator directly', async function(assert) {
    let FooComponent = Component.extend({
      foo: action(function() {
        assert.ok(true, 'called!');
      }),
    });

    registerComponent(this, 'foo-bar', {
      ComponentClass: FooComponent,
      template: hbs`<button onclick={{this.foo}}>Click Me!</button>`,
    });

    await render(hbs`{{foo-bar}}`);

    await click('button');
  });
});
