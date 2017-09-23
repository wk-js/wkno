# wkno

`wkno` is a lightweight task runner using `Promise`.

## Command line

```
   --verbose -v          Display every logs
   --file -F <string>    Precise a entrypoint file
   --parallel -p         Execute tasks in parallel
   --tasks -T            List available tasks
   --no-color            Remove colors
```

```
wkno <my_task_name>
```

If `package.json` file exists, it will consider `scripts` as tasks; exception for `wkno` scripts whether it exists.

If `wkno.js` file exists, an object with all tasks must be exported and loaded as tasks.

```js
// wkno.js
const tasks = {

  "task1": function(resolve) {
    resolve({ name: 'John' })
  },

  "task2": function(resolve) {
    this.result.message = 'Salut'
    resolve(this.result)
  },

  "task3": function(resolve) {
    this.result.day = 'monday'
    resolve(this.result)
  },

  "task4": function(resolve) {
    console.log(this.result)
    resolve(this)
  }

}

module.exports = tasks
```

List tasks

```sh
wkno -T

> wkno task1
> wkno task2
> wkno task3
> wkno task4
```

Execute task in serie

```sh
wkno task1 task2 task3 task4

> { name: "John", message: "Salut", day: "monday" }
```

In CLI, `wkno` add some methods in `global` scope.

* `wkno.concurrency` (Default: 10) - Maximum task called at the same time in parallel
* `task(action:Function, context?:Object, options?:Object)`
* `serie(tasks:Object, order?:Array)`
* `parallel(tasks:Object, order?:Array)`

```js
// tasks.js
const tasks = {

  // Create a task with a context object
  "task1": task(function(resolve) {
    resolve(this.name)
    this.name = 'Max'
  }, { name: 'John' }, { description: 'Set user name' }),

  "task2": function(resolve) {
    console.log(this.result)
    resolve()
  },

  "task3": function(resolve) {
    console.log('Who is there ?')
    resolve()
  }

}

module.exports = tasks
```

```sh
wkno -F tasks.js

> wkno task1     # Set user name
> wkno task2
> wkno task3
```

Execute in client side

```js
// wkno.js
const tasks = require('./tasks')

// Execute tasks in series with the execution order
serie(tasks, [
  'task3', 'task1', 'task2',
  'task3', 'task1', 'task2'
])
```

```
> Who is there ?
> John
> Who is there ?
> Max
```

You can do the same thing without `wkno` CLI.

```js
// file.js
const wkno  = require('wkno')
const tasks = require('tasks')

wkno.serie(tasks, [
  'task3', 'task1', 'task2',
  'task3', 'task1', 'task2'
])
```

## API

### `task(action:Function, context?:Object, options?:Object) -> Function`

Create a new task

* `action` - Task action
* `context?` - An object accessible inside task action with `this`
* `options?` - Task options
* `{String} options.taskName` - Task name
* `{String} options.description` - Task description
* `{Boolean} options.visible` - Hide task in `wkno -T`

### `serie(tasks:Object, order?:Array) -> Promise`

Execute tasks in serie

* `tasks` - Tasks
* `order?` — By default, tasks are executed in the `Object.keys()` order. But you can change that order with an array of name. You can call multiple time the same task name.

### `parallel(tasks:Object, order?:Array) -> Promise`

Execute tasks in parallel

* `tasks` - Tasks
* `order?` — By default, tasks are executed in the `Object.keys()` order. But you can change that order with an array of name. You can call multiple time the same task name.