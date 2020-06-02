const test = require('ava');
const e = require('../lib/index.macro');

e.any.returnIt = (obj) => () => obj;
e.Array.take5 = (array) => () => array.map(() => 5);
e.String.take5 = (str) => (prefix) => prefix + str + '5';
e.Function.returnIt = (fun) => () => fun();
e.Array.second = (array) => array[1];

test('properly executed function', (t) => {
  t.is('rattlesnake'.returnIt(), 'rattlesnake');
  t.is((5).returnIt(), 5);
  t.deepEqual([1, 2, 3].take5(), [5, 5, 5]);
  t.is('take'.take5('q-'), 'q-take5');
});

test('overridnig function', (t) => {
  const fun = () => 'works!';
  t.is(fun.returnIt(), 'works!');
  t.is('take'.take5('q-'), 'q-take5');
});

test('extension properties (getter)', (t) => {
  t.is([3, 2].second, 2);
});

test('extension is proper type', (t) => {
  t.is(typeof ''.returnIt, 'function');
  t.is(typeof [1, 2].second, 'number');
});

e.String.charAt = (str) => (index) => 'pranked!';
e.Array.map = (arr) => () => ["it's", 'a', 'map'];
e.Object.add = (obj) => (prop, value) => ({ prop: value, ...obj });
const fruit = {
  banana: 10,
  add: (v) => 'fruit' + v,
};

test("don't override object properies", (t) => {
  t.is('Hello'.charAt(0), 'H');
  t.deepEqual(
    [1, 2, 3].map((v) => v * 2),
    [2, 4, 6]
  );
  t.is(fruit.add(10), 'fruit10');
});

e.Number.inc = (num) => () => num + 1;
e.Number.add = (num) => (value) => num + value;

test('function chain', (t) => {
  t.is((10).inc().inc().add(5), 17);
});

e.String.first = (str) => str[0];
e.String.name = (str) => str.constructor.name;
e.String.tag = (str) => `string: ${str}`;

test('property chain', (t) => {
  t.is('Wow'.name.first.tag, 'string: S');
});

test('error if property undefinded', (t) => {
  t.throws(() => (10).tag(), { instanceOf: Error });
});
