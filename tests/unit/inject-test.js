import EmberObject from '@ember/object';
import Controller from '@ember/controller';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

module('@controller', function(hooks) {
  setupTest(hooks);

  test('it works', function(assert) {
    const FooController = Controller.extend();

    this.owner.register('controller:foo', FooController);

    class BarController extends Controller {
      @controller foo;
    }

    this.owner.register('controller:bar', BarController);

    const bar = this.owner.lookup('controller:bar');

    assert.ok(
      bar.get('foo') instanceof FooController,
      'controller injected correctly'
    );
  });

  test('controller decorator works with controller name', function(assert) {
    const FooController = Controller.extend();

    this.owner.register('controller:foo', FooController);

    class BarController extends Controller {
      @controller('foo') baz;
    }

    this.owner.register('controller:bar', BarController);

    const bar = this.owner.lookup('controller:bar');

    assert.ok(
      bar.get('baz') instanceof FooController,
      'controller injected correctly'
    );
  });

  test('can set controller field', function(assert) {
    assert.expect(0);

    const FooController = Controller.extend();

    this.owner.register('controller:foo', FooController);

    class BarController extends Controller {
      @controller foo;
    }

    this.owner.register('controller:bar', BarController);

    const bar = this.owner.lookup('controller:bar');

    bar.set('foo', FooController.create());
  });

  test('can use in classic classes', function(assert) {
    const FooController = Controller.extend();

    this.owner.register('controller:foo', FooController);

    const BarController = Controller.extend({
      foo: controller(),
    });

    this.owner.register('controller:bar', BarController);

    const bar = this.owner.lookup('controller:bar');

    assert.ok(
      bar.get('foo') instanceof FooController,
      'controller injected correctly'
    );
  });
});

module('@service', function(hooks) {
  setupTest(hooks);

  test('it works', function(assert) {
    const FooService = EmberObject.extend();

    this.owner.register('service:foo', FooService);

    class Baz extends EmberObject {
      @service foo;
    }

    this.owner.register('class:baz', Baz);

    const baz = this.owner.lookup('class:baz');

    assert.ok(
      baz.get('foo') instanceof FooService,
      'service injected correctly'
    );
  });

  test('it works by passing name', function(assert) {
    const FooService = EmberObject.extend();

    this.owner.register('service:foo', FooService);

    class Baz extends EmberObject {
      @service('foo') bar;
    }

    this.owner.register('class:baz', Baz);

    const baz = this.owner.lookup('class:baz');

    assert.ok(
      baz.get('bar') instanceof FooService,
      'service injected correctly'
    );
  });

  test('can set service field', function(assert) {
    assert.expect(0);

    const FooService = EmberObject.extend();

    this.owner.register('service:foo', FooService);

    class Baz extends EmberObject {
      @service foo;
    }

    this.owner.register('class:baz', Baz);

    const baz = this.owner.lookup('class:baz');

    baz.set('foo', FooService.create());
  });

  test('can use in classic classes', function(assert) {
    const FooService = EmberObject.extend();

    this.owner.register('service:foo', FooService);

    const Baz = EmberObject.extend({
      foo: service(),
    });

    this.owner.register('class:baz', Baz);

    const baz = this.owner.lookup('class:baz');

    assert.ok(
      baz.get('foo') instanceof FooService,
      'service injected correctly'
    );
  });
});
