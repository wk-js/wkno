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

* `wkno.config.concurrency` (Default: 10) - Maximum task called at the same time in parallel
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
wkno -F wkno.js

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

The `action` is a function called at task execution.

The `context?` is the function bound object. *(Optional)*

The `options?` is a list of task options listed below. *(Optional)*

* `options.taskName` - Name of the task
* `options.description` - Description of the task
* `options.visible` - (Default: true) Hide task in `wkno -T`
* `options.async` - (Default: false) Wait `resolve(value)` or `reject(error)` call. Else take returned value.
* `options.concurrency` - (Default: -1) Task concurrency

### `serie(tasks:Object, order?:Array) -> Promise`

Execute tasks in serie

* `tasks` - Tasks
* `order?` — By default, tasks are executed in the `Object.keys()` order. But you can change that order with an array of name. You can call multiple time the same task name.

### `parallel(tasks:Object, order?:Array) -> Promise`

Execute tasks in parallel

The `tasks` is an object containing all the tasks needed for the execution. If no `order` is given, tasks are executed in the `Object.keys(tasks)` order.

The `order?` is an array with the name of tasks to execute. The name of task can be written multiple time.

### `wkno.config`

The `wkno.config.concurrency` (Default: 10) is the concurrency in parallel.

The `wkno.config.defaults` are default task options when a task is created.

* `wkno.config.defaults.async` (Default: false)
* `wkno.config.defaults.visible` (Default: true)
* `wkno.config.defaults.concurrency` (Default: -1)