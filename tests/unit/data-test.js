import { module, test } from 'qunit';
import DS from 'ember-data';
import { getContext } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { get as emberGet } from '@ember/object';
import { run } from '@ember/runloop';
import { gte } from 'ember-compatibility-helpers';

function get(obj, key) {
  if (gte('3.1.0')) {
    return obj[key];
  } else {
    return emberGet(obj, key);
  }
}

function getService(name) {
  return getContext().owner.lookup(`service:${name}`);
}

function register(registeredName, object) {
  getContext().owner.register(registeredName, object);
}

function stubAdapter() {
  let store = getService('store');
  run(() => store.createRecord('post', { name: name1 }));
  run(() => store.createRecord('post', { name: name2 }));
}

let name1 = 'Rails is omakase';
let name2 = 'The Parley Letter';
let expectedNames = [name1, name2].join();

module('ember-data', function(hooks) {
  setupApplicationTest(hooks);

  test('attr', async function(assert) {
    let Post = DS.Model.extend({ name: DS.attr() });
    register(`model:post`, Post);
    stubAdapter();

    let store = getService('store');
    let posts = await store.peekAll('post');
    let names = posts
      .toArray()
      .map(post => get(post, 'name'))
      .join();

    assert.equal(names, expectedNames, 'The correct records are in the array');
  });

  test('@attr', async function(assert) {
    let Post = class extends DS.Model {
      @DS.attr() name;
    };

    register(`model:post`, Post);
    stubAdapter();

    let store = getService('store');
    let posts = await store.peekAll('post');
    let names = posts
      .toArray()
      .map(post => get(post, 'name'))
      .join();

    assert.equal(names, expectedNames, 'The correct records are in the array');
  });

  test('@attr can be used without parens', async function(assert) {
    let Post = class extends DS.Model {
      @DS.attr name;
    };

    register(`model:post`, Post);
    stubAdapter();

    let store = getService('store');
    let posts = await store.peekAll('post');
    let names = posts
      .toArray()
      .map(post => get(post, 'name'))
      .join();

    assert.equal(names, expectedNames, 'The correct records are in the array');
  });

  if (gte('ember-data', '3.11.0')) {
    test('@attr works with module imports without parens', async function(assert) {
      let { default: Model, attr } = window.require('@ember-data/model');

      let Post = class extends Model {
        @attr name;
      };

      register(`model:post`, Post);
      stubAdapter();

      let store = getService('store');
      let posts = await store.peekAll('post');
      let names = posts
        .toArray()
        .map(post => get(post, 'name'))
        .join();

      assert.equal(names, expectedNames, 'The correct records are in the array');
    });
  }
});
