# Installation

You can use npm:
`npm install pickle-ts`

But the library is new, small, and easy to modify, so consider copying the source files to your own project, and then modifying it to suit your own needs.

# Intro to Pickle

Pickle is a small library for writing client-side web apps. Core features:

* State Management (for time travel debugging, transactions, undo/redo, serialization, maintaining state on refresh)
* Composable, inheritable component classes, with full control over update path
* Pure view functions via a Virtual DOM (Picodom)
* Typescript orientation
* DRY as possible
* Supports both code and tsx HTML syntax

Let's start with a counter component:

```typescript
export class Counter extends Component
{
    count: number = 0

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
The `view` is written in the functional style: it's a pure function of the state of `Counter`. The view is rendered with a virtual DOM, such that the real DOM is efficiently patched with only the changes since the last update.

`add` is a method that calls `update` to perform a state transition.

All state transitions must occur within an `update`, which will refresh the view.

# State, View and Updates

Pickle has a uni-directional cyclic relationship been state, view, and updates:

* The *view* is a pure function of *state*
* *state* is altered through *updates*
* *updates* are triggered by the *view*

The `Component` class handles this cyclic relationship. 

`Component` also handles component composition.

Pickle can track updates. Like with source control mechanisms, this lets you recreate a previous state.

# Composition

Composition is straightforward with `pickle`, allowing you to factor your application into a tree of smaller components:

```typescript
export class TwinCounters extends Component
{
    counter1: Counter = new Counter (this)
    counter2: Counter = new Counter (this)

    view () {
        return div (
            this.counter1.view (),
            this.counter2.view ()
        )
    }
}
```
All components — apart from your root component — are constructed with a parent component.

Child components should be created in the constructors, field initialisers, and updates of their parents.

# Updates

All state transitions must occur in a constructor, or via an update:

```typescript
    add (x: number) {
        return this.update(() => this.count += x) 
    }
```
You can call `update` without parameters. However, `update` optionally takes a `payload` argument. This is useful to let a component or parent component cancel the update.

Override `beforeUpdate` to prepare for or cancel an update (by returning `false`):

```typescript 
   beforeUpdate (source: Component, payload?: any) {
       // return true to go ahead with update
       // return false to cancel update
   }
```

Override `afterUpdate` to respond to an update, performing any final state modifications before the view is redrawn:

```typescript
   afterUpdate() {
      ...
   }
```

Both `beforeUpdate` and `afterUpdate` are called on an update, from child through the root. This allows a parent to control and respond to updates made by its children.

At the end of an update, the root component's `view` method is called.

If updates are nested the view method will only be called once.

# Views

Views are pure functions of state. Pickle uses a virtual DOM (Picodom) to efficiently update the actual DOM.

The root component must have a parameterless `view` method. In contrast, all child component views are called explicitly, so are free to parameterise their views however they want:

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

To start Pickle, pass the constructor of your top level component into your App instance, with a string defining the id of the element where you app will be hosted. For example:

```typescript
var app = new App (Counter, "app")
```

You can access the app's `time` property to perform time travel.

# Time Travel

Maintaining state history is useful when you want transactions, undo/redo, and time travel debugging.

You can turn time travel on and off through the time object on App:

```typescript
time.recording = true
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
time.seek(state => state.foo == 7)
```

When time travel is on, pickle serializes the component tree on each update. It's fast and there's not too much you have to do, but make sure to read the serialization section.

# Serialization

It's useful to be able to serialize your application to local storage. This means users can refresh without losing their data, which is also great during development.

Indicate whether you want to save to local storage as we update, by passing a boolean value to the `App` constructor:

```typescript
var app = new App (Counter, "app", true)
```
Our application is now persisted on each update. We can turn that on and off as follows:

```typescript
app.saveOn = true/false
```
This will save your serialied component tree in local storage with the container id you specified (e.g `"app"`).

Pickle uses the `class-transformer` npm package to serialize and deserialize your component classes. Nested components need to be decorated as follows to deserialize correctly:

```typescript
import { Type } from 'class-transformer'

class MyParent extends Component {
   @Type (() => MyChild) child: MyChild
```

It's a little bit of boilerplate but Typescript needs that type information.

There's a couple of points to be aware of:

1) Avoid circular references, as the serializer doesn't handle them. If you have to have them, reset them in your constructors. If possible, do without them. It reduces cyclomatic complexity which is why some languages like F# deliberately force you to minimize them. 
2) Avoid properties with large immutable objects, and instead indirectly reference them with a key. For example, instead of directly storing a localisation table of French data on your component, you'd merely store the string "fr", and return the localisation table based on that key. Minimize the state on your components to that which you need to respond to user actions; keep it as close to a state machine as possible.

You can also explicitly exclude particular properties from being serialized with this decorator:
```typescript
@Exclude() 
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
# Forms

To make writing forms easier, pickle provides some widget functions for common inputs, and provides an `updateProperty` callback for updating properties in the `Component`. In this example, we write a BMI component with two sliders:

```typescript
export class BMISlider extends Component
{
    height: number = 180
    weight: number = 80

    calc () {
        return this.weight / (this.height * this.height / 10000)
    }

    view () {       
        return div (             
            "height", slider (() => this.height, 100, 250, 1, e => this.updateProperty (e)),
            "weight", slider (() => this.weight, 30, 150, 1, e => this.updateProperty (e)),
            "bmi: " + this.calc()
        )
    }
}
```

The `updateProperty` callback takes a `KeyValue` object, where they key maps to the Component property, and value the new value of the property. `updateProperty` calls `update` for you, but you can always intercept that update by calling `beforeUpdate` as explained earlier.

One caveat: if the property type in a number, make sure to set it to `NaN` in the field initialiser if you don't yet know the value, otherwise it's impossible for `updateProperty` to know its dealing with a number, and will default to setting that value to a string.

# Components or Functions?

You can write reusable UI code simply writing functions that return virtual DOM nodes, or by deriving from `Component` class. Which to use?

Generally, you want to use functions rather than classes when the state is non-existent or trivial for users of that function to manage. As the state logic becomes more complex, so will the the code that responds to callbacks sent to those view functions. You'll then want to derive from `Component` to encapsulate managing that state.

To give an example, a slider has a state, but its suffice to have a `slider` function with a callback, that can be used to set state elsewhere. Here was our previous example of using the `slider` function:

```typescript
slider (() => this.height, 100, 250, 1, e => this.updateProperty (e))
```
On the other hand, a modal dialog, while also having little state (just a single boolean flag whether its open or not), actually has non-trivial logic around that state. By implementing the modal as a component, every component that uses the modal can get the state logic for free.

# Use With...
## HTML History
https://github.com/ReactTraining/history

You'll want to keep your component's state in sync with the history.

## Validation
https://github.com/typestack/class-validator

You'll want to sprinkle your component's properties with validate decorators, and then override the `afterUpdate` method to call `validate`.