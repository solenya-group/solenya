# Installation

`npm install pickle-ts`

The library is new, small, and easy to modify, so consider copying the source files to your own project, and then modifying it to suit your own needs.

# Samples

https://github.com/pickle-ts/pickle-samples

# Table of Contents

- [Installation](#installation)
- [Samples](#samples)
- [Intro to Pickle](#intro-to-pickle)
- [State, View and Updates](#state--view-and-updates)
- [Composition](#composition)
  * [How it Works](#how-it-works)
  * [The @Type Decorator](#the-type-decorator)
- [Forms](#forms)
- [Updates](#updates)
  * [Advanced Updates](#advanced-updates)
- [Views](#views)
- [App](#app)
- [Time Travel](#time-travel)
- [Serialization](#serialization)
  * [Circular references](#circular-references)
  * [Keep your component state small](#keep-your-component-state-small)
- [Hot Module Reloading](#hot-module-reloading)
- [Async](#async)
- ['this' Rules](#-this--rules)
- [HTML Helpers](#html-helpers)
- [TSX](#tsx)
- [Components or Functions?](#components-or-functions-)
- [Task List App](#task-list-app)
- [Beyond Immutability](#beyond-immutability)
- [Use With...](#use-with)
  * [HTML History](#html-history)
  * [Validation](#validation)

# Intro to Pickle

Pickle is a small library for writing client-side web apps. Core features:

* Serializable, Composable, Inheritable Components
* Unified approach to time travel debugging, hot module reloading, transactions, undo/redo
* Pure view functions via a Virtual DOM (Picodom)
* Typescript orientation
* DRY as possible
* Supports both code and tsx HTML syntax

Let's start with a counter component:

```typescript
export class Counter extends Component
{
    count = 0

    view () {
        return div (
            button ({ onclick : () => this.add (+1) }, "+"),
            this.count,
            button ({ onclick : () => this.add (-1) }, "-")     
        )
    }

    add (x: number) {
        return this.update(() => this.count += x) 
    }
}
```
Components can have state — in this case `count`.

Components have a `view` method, which is a pure non side effecting function of the component's state. Views are rendered with a virtual DOM, such that the real DOM is efficiently patched with only the changes since the last update.

Components update their state exclusively via the their `update` method, which will automatically refresh the view.

# State, View and Updates

A pickle app outputs a virtual DOM node as a pure function of its state. On each update, the previous root virtual DOM node is compared with the new one, and the actual DOM is efficiently patched with the change. DOM events can trigger updates, which result in a view refresh, forming a cyclic relationship between the state and the view.

Components help you factor your app into reusable parts, or parts with separate concerns. An app has a reference to your root component.

Components are designed to be serializable. By default, your component tree is serialized on each update. This provides a unified approach to time travel debugging, hot module reloading, transactions, and undo/redo. Serialization is covered in more detail in the serialization section.

![pickle flow diagram](pickle-flow-diagram.png "Pickle Flow Diagram")

This flow diagram represents updating a GrandChild2 component.

# Composition

Composition is straightforward with `pickle`, allowing you to factor your application into a tree of smaller components:

```typescript
export class TwinCounters extends Component
{
    @Type (() => Counter) counter1 = new Counter ()
    @Type (() => Counter) counter2 = new Counter ()

    view () {
        return div (
            this.counter1.view (),
            this.counter2.view ()
        )
    }
}
```
Components must have parameterless constructors, though they may include *optional* arguments.

Child components should be created in the constructors, field initialisers, and updates of their parents.

You can specific arrays of components, recursive components, or even arrays of recursive components. Here's from one of the samples:

```typescript
export class Tree extends Component
{    
    @Type (() => Tree) trees: Tree[] = []
    ...
}
```

## How it Works

After the root component is created, it's attached to the `App` object. Once attached, each update traverses the component hierarchy ensuring each child has its `parent` property set. This enables updates to a child to bubble up to the root component, which triggers the `App` to refresh, which will then call the root component's `view` method.

## The @Type Decorator

The `@Type` decorator from the `class-transformer` library enables your component classes to be deserialized from plain json objects. It's necessary as **Typescript transpiles away property types** (unlike in C# or Java).

# Forms

To make writing forms easier, pickle provides some widget functions for common inputs, and provides an `updateProperty` callback for updating properties in the `Component`. In this example, we write a BMI component with two sliders:

```typescript
export class BMI extends Component
{
    height: number = 180
    weight: number = 80

    calc () {
        return this.weight / (this.height * this.height / 10000)
    }

    view () {       
        return div (             
            div (
                "height",
                slider (() => this.height, 100, 250, 1, e => this.updateProperty (e)),
                this.height
            ),
            div (
                "weight",
                slider (() => this.weight, 30, 150, 1, e => this.updateProperty (e)),
                this.weight
            ),
            div ("bmi: " + this.calc())
        )
    }
}
```

The `updateProperty` callback takes a `KeyValue` argument, which has a key and value that map to the Component property name and new value. `updateProperty` calls through to the component's `update` for you, which is explained in the next section.

**Always initialise component number fields explicitly, and use NaN rather than undefined**. This is because **Typescript transpiles away property types**, meaning that pickle can't know whether it's dealing with a string or number, and assumes an undefined value is a string by default, in the absence of a runtime value.

# Updates

All state transitions must occur in a constructor, or via an update:

```typescript
    add (x: number) {
        return this.update(() => this.count += x) 
    }
```
You pass `update` a void function that performs a state transition.

A component usually updates its state by directly handling callbacks. We did that in the previous section, with our BMI component updating its state in response to a slider callback with component's `updateProperty` handler. A common pattern is to provide a custom callback in order to perform an additional state change after a property update:

```typescript
    handleSomePropertyChange (payload: KeyValue) {
        this.update(() => {
            this.updateProperty (payload)
            // perform some additional state change
        })
    }
```
At the end of an update, the root component's `view` method is called. Updates are synchronous, but views are refreshed asynchronously.

Nested updates are regarded as a single update. The view will at most be called once for an update.

## Advanced Updates

Occasionally it's useful to generically handle any update to a component, including all its descendents. That can be done by overriding the `beforeUpdate` and `afterUpdate` methods.

Override `beforeUpdate` to prepare for or cancel any update (by returning `false`):

```typescript 
   beforeUpdate (payload?: any) {
       // return true to go ahead with update
       // return false to cancel update
   }
```

Override `afterUpdate` to respond to any update, performing any final state modifications before the view is redrawn:

```typescript
   afterUpdate (payload?: any) {
      ...
   }
```

Both `beforeUpdate` and `afterUpdate` are called on an update, from child through the root. This allows a parent to control and respond to updates made by its children, without having to handle specific callbacks.

`payload` is an optional argument that describes the change. `payload` is typed `any` for convenience, but has a `source` property of type `Component`, since its occassionally useful to know which component initiated the update.

Where does `payload` come from? Component's `update` method actually takes an optional second argument — `payload` — for describing the update. For example, Component's `updateProperty` method, when calling through to `update`, supplies a payload with a `key` and `value`, which correspond to the component property name and value.

# Views

Views are pure functions of state. Pickle uses a virtual DOM (Picodom) to efficiently update the actual DOM.

You can add as may optional parameters as you want to your child component `View` methods. This makes it easy for parents to customize their children without their children needing state:

```typescript
    view () {
        return div (
            this.child1.view (...),
            this.child2.view (...)
        )
    }
```
View methods return the type VNode<any> and be written is ordinary code or use tsx. Both these approaches are explained in their own sections later.

# App

To start Pickle, pass the constructor of your top level component into your App instance, with a string defining the id of the element where you app will be hosted. You must also import `reflect-metadata` before any of your classes are loaded. For example:

```typescript
import 'reflect-metadata'
import { App } from 'pickle-ts'

var app = new App (Counter, "app")
```

You can access the app's `time` property to perform time travel.

You can also construct your app to automatically save to local storage on each update, as explained in the serialization section.

# Time Travel

Maintaining state history is useful when you want transactions, undo/redo, and time travel debugging.

You can turn time travel on and off through the time object on App:

```typescript
time.recordOn = true
```
Now all updates will be recorded.

You can now navigate as follows:

```typescript
time.start()  // goto start state
time.end()    // goto end state
time.next()   // goto next state
time.prev()   // goto prev state
time.goto(4)  // goto nth state
```
You can also use a predicate to seek a particular state:
```typescript
time.seek(state => state.counter.count == 7)
```

When time travel is on, pickle serializes the component tree on each update. It's efficient and mostly transparent, but make sure to read the serialization section.

# Serialization

It's useful to be able to serialize your application to local storage. This means users can refresh without losing their data, which is also great during development.

Indicate whether you want to save to local storage as we update, by passing a boolean value to the `App` constructor:

```typescript
var app = new App (Counter, "app", true)
```
Our application is now persisted on each update. We can turn that on and off as follows:

```typescript
app.saveOn = true|false
```
This will save your serialied component tree in local storage with the container id you specified (e.g `"app"`).

To clear your application state:
```typescript
localStorage.removeItem ("app")
```

Pickle uses the `class-transformer` npm package to serialize and deserialize your component classes. Nested components need to be decorated as follows to deserialize correctly:

```typescript
import { Type } from 'class-transformer'

class MyParent extends Component {
   @Type (() => MyChild) child: MyChild
```

As mentioned previously, that's a little bit of boilerplate but Typescript needs that type information.

When deserializing, as a result of time travel or loading from local storage, your constructors will execute, and then your component's fields will be set.

There's a couple of points to be aware of:

## Circular references

Avoid circular references unless you absolutely need them. Firstly, the serializer doesn't handle them, and secondly, it increases your cyclomatic complexity which is why some languages like F# deliberately force you to minimize them. However, occassionaly you'll need them. To do so:

* override component's `beforeRefresh` method and set the circular references there
* exclude the circular references from being serialized with the `@Exclude()` decorator

## Keep your component state small

Serialization, deserialization, and local storage are surpisingly fast. However, efficiency is still important. Avoid properties with large immutable objects, and instead indirectly reference them with a key. For example, instead of directly storing a localisation table of French data on your component, you'd merely store the string "fr", and return the localisation table based on that key. Minimize the state on your components to that which you need to respond to user actions; keep it as close to a state machine as possible.

# Hot Module Reloading

When your application state is serialized, an ordinary page refresh will run your modified code with your previous state. We can automatically trigger a page refresh by listening to server code changes:

```typescript
module.hot.accept('../app/samples', () => { location.reload() })

```
# Async

Pickle's update path is synchronous, so you perform aynchronous activites outside of update. Suppose a button invokes your submit event handler that calls a web service. That could be defined as follows: 

```typescript
    async submit () {
        var result = await fetch(url)
        if (result.ok) {
            this.update (() => ...)
        }
    }
```
Notice that the `update` occurs *after* the asynchronous operation has completed.

Note that the samples demonstrate calling github's search, with debouncing.

# 'this' Rules

The `this` variable's binding is not as straightforward as in object oriented languages like C# and Java. There's a great article about [this here](https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript).

Within pickle components, follow the pattern you see in this documentation, which has two rules:

Always wrap a method that's used as a callback in a closure, otherwise `this` might be lost before it's bound.

```typescript
    // RIGHT
    methodUsingYourCallback (e => this.updateProperty (e))
    
    // WRONG
    methodUsingYourCallback (this.updateProperty)
```
Use ordinary class methods, not function members when calling update. Otherwise cloning — which pickle relies on for time travel — fails, since the cloned function will refer to the old object's this.

```typescript
    // RIGHT
    add () {
       return this.update (...

    // WRONG
    add = () =>
        this.update (...
```
# HTML Helpers

The HTML helpers take a spread of attribute objects, elements, and primitive values. Attribute objects go first. Some examples:

```typescript
div ()                                  // empty
div ("hello")                           // primitive value
div ({id: 1})                           // attribute
div ({id: 1, foo:2})                    // multiple attributes
div ({id: 1}, "hello")                  // attribute followed by element
div (div ())                            // nested elements
div ({id: 1}, "hello", div("goodbye"))  // combination
```
Multiple attribute objects are merged. Merging attributes is really useful when writing functions allowing the caller to merge their own attributes in with yours. The following are equivalent:

```typescript
div ({id: 1,}, {foo:2})
div ({id: 1, foo:2})   
```

The `css` helper method lets you express css attributes as a list, rather than a string.
```typescript
div (css("foo", "goo"))   
```
`css` will automatically strip out null or undefined values. So the following are equivalent:
```typescript
div (css("foo", null))
div ({class : "foo"})
```
Event handlers are specified as simply a name followed by the handler:
```
button (
    { onclick : () => this.add (1) }, "+"
)
```
The lifecycle callbacks are the same as picodom: `oncreate`, `onupdate`, and `onremove`. Here's an example:

```typescript
 div ({
     oncreate: (element: Element) => this.onCreateModal (element...)
    ...
```
When your virtual div element is turned into an actual div element, your `oncreate` callback is passed the actual div element.

# TSX

Here's the counter example rewritten with tsx:

```typescript
import { Component, h } from '../pickle/pickle'

export class Counter extends Component
{
    count: number = 0

    view () {
        return (
            <div> 
                <button onclick={() => this.add(-1)}>-</button>
                    {this.count}
                <button onclick={() => this.add(+1)}>+</button>
            </div>        
        )
    }
    
    add (x: number) {
        return this.update (() => this.count += x)
    } 
}
```
To use tsx with pickle, you must:

1) In each .tsx file, include the 'h' function from pickle, as element tags get converted into calls to `h`
2) In your project, create a file called `jsx.d.ts` with the following:
```
import { VNode } from 'pickle-ts'

declare global {
    namespace JSX {
        interface Element<Data> extends VNode<Data> { }
        interface IntrinsicElements {
            [elemName: string]: any
        }
    }
}
```
# Components or Functions?

You can write reusable UI code simply writing functions that return virtual DOM nodes, or by deriving from `Component` class. Which to use?

Generally, you want to use functions rather than classes when the state is non-existent or trivial for users of that function to manage. As the state logic becomes more complex, so will the the code that responds to callbacks sent to those view functions. You'll then want to derive from `Component` to encapsulate managing that state.

To give an example, a slider has a state, but its suffice to have a `slider` function with a callback, that can be used to set state elsewhere. Here was our previous example of using the `slider` function:

```typescript
slider (() => this.height, 100, 250, 1, e => this.updateProperty (e))
```
On the other hand, a modal dialog, while also having little state (just a single boolean flag whether its open or not), actually has non-trivial logic around that state. By implementing the modal as a component, every component that uses the modal can get the state logic for free.

# Task List App
It's common for client-side web frameworks to demonstrate how they'd write a task app. Here's how you write one in pickle:

```typescript
export class Todos extends Component
{    
    title: string
    list: string[] = []

    add () {
        this.update(() => {            
            this.list = this.list.concat (this.title!)
            this.title = undefined
        })
    }

    delete (task: string) {
        this.update (() =>
            this.list = this.list.filter (t => t != task)
        )
    }

    view () {
        return div (
            inputer (() => this.title, e => this.updateProperty (e)),
            ! this.title ? undefined : commandButton (() => this.add(), 'Add'),
            ul (
                this.list.map (task =>
                    li (
                        task,
                        commandButton (() => this.delete (task), "delete")
                    )
                )
            )
        )
    }
}
```
Notes:
* Keep things simple! Only write components if they need to manage their own state. In this case, we didn't need a sub component for an individual task.
* In a real application, we'd probably have a unique key associated with each todo item, rather than identifying the todo item by name.
* Try customizing the css. Import the `css` function from pickle, and pass in your css class names. Then pass that css object as an additional argument to `commandButton`.

# Beyond Immutability

Pickle's update model is inspired by transactional memory. The idea is we optimistically mutate the current state, but when we want to, we can time travel back to an old state. This gives us the core benefits of immutability, but with a natural programming model. So an ordinary property update is simply:

```typescript
state.prop++
```
rather than with the immutable pattern:

```typescript
var newState = { ...state, prop: state.prop + 1 }
```
and for nested updates:

```typescript
root.child1.child2.prop++
```
Which with immutability, requires tactics such as functional lensing, otherwise you'd have to go:

```typescript
var newRoot =
    { ...root, child1:
        { ...root.child1, child2:
            { ...root.child1.child2, prop: root.child1.child2.prop + 1 }
        } 
    }
``` 

The other benefit of the transactional memory approach, is we can also have asynchronous methods that optimistically update `this` when continuing. Note that when we time travel, our `this` in that scenario is of course lost.

# Use With...
## HTML History
https://github.com/ReactTraining/history

You'll want to keep your component's state in sync with the history. The sample app demonstrates integrating history to provide basic routing.

## Validation
https://github.com/typestack/class-validator

You'll want to sprinkle your component's properties with validate decorators, and then override the `afterUpdate` method to call `validate`.