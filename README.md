# extensions.macro 🌌

Extension functions and parameters for JavaScript inspired by Kotlin's extensions

## Instalation

```sh
npm i --save-dev extensions.macro
```

Or if using yarn:

```sh
yarn add --dev extensions.macro
```

Then just `import`:

```js
import extension from 'extensions.macro';
```

> Note that you need to have _`babel`_ and _`babel-plugin-macros`_ installed

## Motivation

As you might know that providing new properties for JavaScript built-in objects pollutes the global scope and is widely considered dangerously. This macro solves the problem allowing you to use dot notation for accesing external functions and values 😋

## Examples

### Declaring extension

```js
import extension from 'extensions.macro';
extension.String.plus = (string) => (plusString) => `${string} ${plusString}`;
```

> Note that it's initialized with function witch first argumument( _`string`_ ) provides an instance it's called on.

Then you can use it like:

```js
'Hello'.plus('Extension!'); //Outputs: Hello Extension!
```

### Another example:

```js
import extension from 'extensions.macro';

extension.any.log = (obj) => () => {
  console.log(obj);
  return obj;
};

'The cosmos is yours 🌌'.log();
//Logs: The cosmos is yours 🌌
```

## Usage

### extension.<**_object constructor name_**>.<**_extension name_**> = <**_init_**>

### Object constructor name

It's the result of calling `.constructor.name` on object the extension it's dedicated

```js
(15).constructor.name; //Outputs: Number
```

#### extension.any...

You can write `any` instead of constructor name to match any type of object

### Extension name

It's the name of extension you choose

### Init

It's the function taking object and returning what should extension return

## Rules

- Declare extension in module scope
- Extensions do not override object properties
- Be aware of recursive extension

### Declare extension in module scope

```js
//...
import curry from '@ramda/curry';

extension.Function.curry = (fun) => curry(fun); //✔
{
  extension.Function.curry = (fun) => curry(fun); //❌Throws: Error
}
//...
```

### Extensions do not override object properties

```js
extension.any.reduce = (obj) => (reducer) => reducer(obj);

'Who let the dogs out!?'.reduce((v) => `${v} wow! wow! wow!`);
//Outputs: Who let the dogs out!? wow! wow! wow!

[1, 2, 3].reduce((total, value) => total + value);
//Outputs: 6
```

### Be aware of recursive called extension

Though you can do it but it does not very performant and is considered to be blocked in future versions

```js
extension.Number.factorial = (num) => () => {
  if (num === 1 || num === 0) return 1;
  return num * (num - 1).factorial();
};
//Works, but is bad ❗
```

Do instead:

```js
const factorial = (num) => {
  if (num === 1 || num === 0) return 1;
  return num * factorial(num - 1);
};

extension.Number.factorial = (num) => () => factorial(num);
//Right way ✅
```

## Another features

### Extensions overloading

You can overload `any` extension like so:

```js
extension.any.plus = (obj) => (plusObj) => obj + plusObj;
extension.String.plus = (string) => (plusString) => `${string} + ${plusString}`;

'👽'.plus('💩'); //Outputs 👽 + 💩
(5).plus(2); ////Outputs 7
```

## To Do

- Add `Import` and `Export` feature for extension
- Add more reliable `Errors`

## Proposals

- Add extension setters?
