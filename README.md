# Pickle?

Pickle is the web framework for you if you like **conceptual simplicity**.

| What | Simple Way | Complicated Way | Notes |
|-|-|-|-|
| Type Checking | Just use typescript | Extra testing & tooling to compensate for not using static typing. Makes refactoring horrible. | With type-inference the tax for static typing has never been so low for the benefits it gives.
| Rendering HTML | Just use typescript. No templating language required |Yet another templating language, w/ constructs reinventing language features for looping, conditionals, etc. etc. etc. with mysterious ad-hoc rules, lacking the consistency and generality of an actual programmming language. | You don't need a templating language if your programming language is expressive. It's also inherently more complex to essentially embed a programming language in strings, rather than embed strings in a programming language.
| CSS | Just use typescript. Style with `typestyle` | Unmanageable stylesheets, where you can't easily rename, refactor, parameterize, etc. The root of the problem is your styles are expressed in a language that's simplistic and excessively decoupled from your view. | Yes, you can still easily reference ordinary css.
| Paradigm | Use both functional and OO | Only use the functional approach, even if it means turning walking into gymanastics. Reducers, higher-order-components, functional lensing, boilerplate | OO elegantly models state changes over time, and can complement the functional approach. 
| Pure Functions | Use whenever possible | Constructs other than functions when pure functions suffice, with custom or hampered composability. Functions unnecessarily riddled with side-effects.
| Update Path | One-way | Manual updating coupled with some databinding logic w/ its own update path and mysterious property rewriting magic | The virtual DOM approach has some tricky corner cases, but it's mostly a win.
| State Management | Baked in | Separate state manager library w/ tons of boilerplate | In pickle, components represent state. They're separated from the lifecycle of your views. There's no ~~componentWillMount~~ UNSAFE_componentWillMount method.
| Serialization | Baked in | Separate serialization library w/ bridge code to components | Time travel debugging, hot module reloading, transactions, undo/redo all use the same single mechanism.
| Async | Call any async function, then update component state synchronously | Require special support. In some functional reactive frameworks, each component functions as an independent application, necessitating repetitive and complex inter-component wiring simply to regain the synchronicity within each view tree and state tree that should have been implicit |

Pickle is small: see and understand the source code for yourself. Its power comes from its simplicity, and its intended use with many other great libraries:

 * A virtual DOM based on Ultradom *(forked)*
 * typestyle *(dependency)*
 * typescript & reflect-metadata for reflection *(dependency)*
 * class-tranformer for serialization *(dependency)*
 * any animation API using vdom hooks *(as in samples)*
 * mjackson/history for managing HTML history *(as in samples)*
 * any css framework like bootstrap *(as in samples)*
 * webpack for hot reloading *(as in samples)*
 * lodash for great utility functions like debouncing *(as in samples)*
 * class-validator for validation *(as in samples)*

# Installation

`npm install pickle-ts`

# Samples

* Live Demos: http://pickle-ts.com/
* Live Editable Code Samples: https://stackblitz.com/@pickle-ts
* Github Samples: https://github.com/pickle-ts/pickle-samples

# Table of Contents

- [Installation](#installation)
- [Samples](#samples)
- [Intro to Pickle](#intro-to-pickle)
- [State, View and Updates](#state--view-and-updates)
- [Composition](#composition)
- [Component Initialization](#component-initialization)
- [Updates](#updates)
- [Views](#views)
  * [Lifecycle Events](#lifecycle-events)
  * [DOM Keys](#dom-keys)    
  * [Animating a List](#animating-a-list)
- [App](#app)
- [Time Travel](#time-travel)
- [Serialization](#serialization)
  * [Property Serialization](#property-serialization)
  * [Circular references](#circular-references)
  * [Keep your component state small](#keep-your-component-state-small)
- [Hot Module Reloading](#hot-module-reloading)
- [Async](#async)
- [Forms](#forms)
  * [Validation](#validation)
- ['this' Rules](#-this--rules)
- [HTML Helpers](#html-helpers)
- [Style](#style)
  * [Important Gotcha](#important-gotcha)
- [Child-To-Parent Communication](#child-to-parent-communication)
  * [Callback Communication](#callback-communication)
    * [todoMVC](#todomvc)
  * [Parent Interface Communication](#parent-interface-communication)
  * [Update Communication](#update-communication)
- [HTML History](#html-history)
- [API Reference](#api-reference)
  * [Component Class API](#component-class-api)
    * [Component View Members](#component-view-members)
    * [Component Initialization Members](#component-initialization-members)
    * [Component Update Members](#component-update-members)
    * [Component Tree Members](#component-tree-members)
  * [App Class API](#app-class-api)
    * [App Initialization Members](#app-initialization-members)
    * [App Serialization Members](#app-serialization-members)

# Intro to Pickle

Let's start with a counter component:

```typescript
export class Counter extends Component
{
    count = 0

    view () {
        return div (
            commandButton (() => this.add (+1), "+"),
            this.count,
            commandButton (() => this.add (-1), "-")     
        )
    }

    add (x: number) {
        this.update(() => this.count += x) 
    }
}
```
[Play](https://stackblitz.com/edit/pickle-counter)

In pickle, application state lives in your components — in this case `count`.

Components can optionally implement a `view` method, which is a pure non side effecting function of the component's state. Views are rendered with a virtual DOM, such that the real DOM is efficiently patched with only the changes since the last update.

Components update their state exclusively via the their `update` method, which will automatically refresh the view.

# State, View and Updates

A pickle app outputs a virtual DOM node as a pure function of its state. On each update, the previous root virtual DOM node is compared with the new one, and the actual DOM is efficiently patched with the change. DOM events can trigger updates, which result in a view refresh, forming a cyclic relationship between the state and the view.

Components help you factor your app into reusable parts, or parts with separate concerns. An app has a reference to your root component.

Components are designed to be serializable. When autosave or time travel is on, your component tree is serialized on each update. This provides a unified approach to time travel debugging, hot module reloading, transactions, and undo/redo. Serialization is covered in more detail in the serialization section.

![pickle flow diagram](pickle-flow-diagram.png "Pickle Flow Diagram")

This flow diagram represents updating a GrandChild2 component. In this case, we have a very simple application, where the view tree mirrors the component tree. As an application gets larger, the view tree will typically only represent a subset of the component tree. For example, in an application with wizard steps, the component tree would probably have *every* wizard step, while the view tree would only have the *current* wizard step. 

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
[Play](https://stackblitz.com/edit/pickle-composition)

Components must have parameterless constructors, though they may include *optional* arguments. This small design restriction enables `class-transformer`'s deserializer to work.

Child components should be created in the constructors, field initialisers, and updates of their parents.

You can specific arrays of components, recursive components, or even arrays of recursive components. Here's from one of the samples:

```typescript
export class Tree extends Component
{    
    @Type (() => Tree) trees: Tree[] = []
    ...
}
```
[Play](https://stackblitz.com/edit/pickle-tree)

The `@Type` decorator is explained in the serialization section.

# Component Initialization

You component's life begins with a constructor call. As described later, the deserializer will still call your constructor, but then set the object's properties. That's why your constructor's arguments must be optional.

When your app is first created or deserialized, and after every update, a depth-first traversal occurs, where `attached` is called on every component not already attached:

```typescript
   attached (deserialised: boolean) {
       ...
   }
```
On the traversal, child components are identified by being properties or property array elements of the parent. As such each child will get attached, and have its `parent` and `app` properties set (except the root component which obviously has an undefined `parent`). This enables updates to a child to bubble up to the root component.

# Updates

After app startup or deserialization, all state transitions must occur within an update.

An update is straightforward:

```typescript
    add (x: number) {
        this.update(() => this.count += x) 
    }
```
You pass `update` a void function that performs a state transition.

At the end of an update, the root component's `view` method is called. Updates are synchronous, but views are refreshed asynchronously.

Nested updates are regarded as a single update. The view will at most be called once for an update.

In more advanced scenarios you can capture updates, as explained later in the child-to-parent-communication section.

# Views

Views are pure functions of state. Pickle uses a virtual DOM (forked from Ultradom) to efficiently update the actual DOM.

You can add as may optional parameters as you want to your child component `View` methods. This makes it easy for parents to customize their children without their children needing extra state:

```typescript
    view () {
        return div (
            this.child1.view (...),
            this.child2.view (...)
        )
    }
```
`view` methods return the type `VElement`. However, your component might be faceless, having no view implementation, or might have several methods returning different `VElement` objects. This is because pickle components are state-centric, not view-centric.

To write a reusable view, your first approach should be to merely write a function that returns a `VElement`. Only use child components when you need to encapsulate state.

You may also call `Component.onRefreshed` to queue a callback to perform DOM side effects after the next refresh. You typically do so in the `view` method:

```typescript
   view() {
       this.onRefreshed (() => { ... }) // called after DOM is updated
       return div (...)
   }
```
You may however, need deeper control side-effecting the DOM.

## Lifecycle Events

For the most part, views are pure functions of state. However, DOM elements can have additional state, such as inputs that have focus and selections. Furthermore, animations, at a low level, need to interact with the DOM bypassing the virtual DOM. This is for both performance reasons (as you don't want to invoke the GC), as well as keeping your application state logic separated from your animation state. For example, if you delete an item from a list, it's a simplifying assumption for your application state to consider that item gone, but you'll want that item to live a little longer in the real DOM to gracefully exit.

To interact with the DOM directly, you provide lifecycle callbacks on your virtual DOM elements. The lifecycle callbacks should be familiar to anyone familar with a virtual dom:

```
export interface VLifecycle
{
    onAttached? (el: Element, attrs: VAttributes) : void
    onBeforeUpdate? (el: Element, attrs: VAttributes) : void
    onUpdated? (el: Element, attrs: VAttributes) : void    
    onBeforeRemove? (el: Element) : Promise<void>
    onRemoved? (el: Element) : void
}
```
`onAttached` is called when an element is attached to the DOM.

`onUpdate` is called whenever an element is updated. Use it to perform any final updates to the DOM. The `onBeforeUpdate` lets you take any preliminary actions before the element changes.

`onRemoved` is called when an element is removed from the DOM.`onBeforeRemove` allows you take any preliminary actions - which may be asynchronous - before an element is removed. 

Here's how you might plug in some focusing logic when an element is added to the DOM:

```typescript
 div ({
     onAttached: (el, attrs) => handleFocus (el...)
    ...
```
When the patcher adds an element to the DOM corresponding to your virtual div element, it invokes the `onAttached` callback.

Lifecycle callbacks automatically compose. So both `onAttached` functions will be called here, in the order of appearance:

```typescript
 div (
    {
        onAttached: (el, attrs) => handleFocus (el...)
    },
    {
        onAttached: (el, attrs) => handleSelection (el...)
    }
    ...
 }
```
## DOM Keys

After each update, the virtual DOM is patched. The patcher compares the current virtual DOM tree to the previous one, and modifies the real DOM accordingly. However, the patching algorithm can't know your intent, and so occassionally does the wrong thing. It may try to reuse an element that you definitely want to replace, or it may try to replace a list of child elements that you merely wanted to reorder. To better determine the creation and destruction of DOM nodes, provide *keys* for your virtual DOM nodes. For example:

```typescript
div ({key: wizardPage})
```
If the key changes, the patcher now knows to definitely recreate that DOM element. This means even if your next wizard page happened to have an input that could have been updated, that instead it will be replaced, predictably resetting DOM state like focus and selections, and invoking any animations that should occur on element creation.

## Animating a List

Let's combine the concepts in the previous sections to shuffle an array, where each element gracefully moves to its new position each time the array is updated. We can use lodash's shuffle function to perform the `shuffle`, and our own `slideChildren` function to perform the animation. We'll need to make sure each item in the array has a unique `key`, so that the patcher knows to reuse each child element.

```typescript
export class AnimateListExample extends Component
{
    @Exclude() items = range (1, 20)

    view () {        
        return div(
            myButton (() => this.shuffle (), "shuffle"),       
            ul (slideChildren(), this.items.map (n => li ({ key: n }, n)))
        )
    }

    shuffle() {
        this.update (() => this.items = shuffle (this.items))
    }
}
```
We can implement `slideChildren` using the [FLIP](https://aerotwist.com/blog/flip-your-animations/) technique:
```typescript
export function slideChildren () : VLifecycle
{
    return {                       
        onBeforeUpdate (el) {                
            let els = el["state_slideChildren"] = Array.from(el.childNodes).map(c => (c as HTMLElement))
            els.forEach (c => measure(c))
        },
        onUpdated (el) {
            let els = el["state_slideChildren"] as HTMLElement[]
            els.forEach (c => flip (c))
        }                    
    } 
}
```
[Play](https://stackblitz.com/edit/pickle-animating-a-list)

By design, these lifecycle events are not present on pickle components. Pickle components manage application state, only affecting DOM state via its `view` method, and the intentionally ungranular `onRefreshed` method. This lets you separate the very different lifecycles of application state and DOM state, making your code easier to maintain.

While there's always pragmatic exceptions, the principles of pickle state are:

 * Application state belongs on components.
 * DOM state belongs on DOM elements.
 * No state belongs on virtual DOM elements.

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

You can turn time travel on and off on App as follows:

```typescript
app.timeTravelOn = true|false
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

To save our application with each update, we set the app `autosave` property on the app's `storage` object to `true`:

```typescript
app.storage.autosave = true
```
This will save your serialized component tree in local storage with the container id you specified (e.g `"app"`).

To turn `autosave` off and clear your application state from local storage:
```typescript
app.storage.autosave = false
app.storage.clear()
```

## Property Serialization

It's critical to be aware that **Typescript transpiles away property types** (unlike in C# or Java). This means you must follows some rules to ensure serialization works correctly.

Pickle uses the `class-transformer` npm package to serialize and deserialize your component classes. 

Here's an example showing common permutations for serializable properties:

```typescript
import { Type } from 'class-transformer'

class MyParent extends Component {
   name: string   
   isMale = false
   @Num() age = NaN
   @Type (() => Item) myItem: Item
   @Type (() => Item) myList: Item[] = []

   ...
}
```
Here's the rules:

* Initialize fields explicitly - even with empty values - so the serializer can know the type:
    * For arrays use `[]`
    * For numbers use `NaN` and decorate with `Num()` to ensure deserialization works correctly.
    * If pickle encounters an `undefined`, it will assume the type is a `string`.    
* For fields that are themselves components, decorate them with the `@Type` decorator from the `class-transformer` library. This enables your component classes to be deserialized from plain json objects.
    * For arrays, only specify the *element type*, e.g. `() => Item`, as opposed to `() => Item[]`

## Circular references

Avoid circular references unless you absolutely need them. Firstly, the serializer doesn't handle them, and secondly, it increases your cyclomatic complexity which is why some languages like F# deliberately force you to minimize them. However, occassionaly you'll need them. To do so:

* override component's `attached` method to set the circular references there
* exclude the circular references from being serialized with the `@Exclude()` decorator

## Keep your component state small

As a general rule, don't gratuitously use component state, and instead try to use pure functions where you can. In particular, avoid storing UI styles in component state - instead pass styles from a parent view down to child views. If you must store a UI style in a component, you'll probably want to decorate it with `@Exclude` to avoid serialization.

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

# Forms

To make writing forms easier, pickle provides some widget functions for common inputs. You can easily build your own ones by examining the widgets source code.

* `slider` : returns an input for selecting a numeric range
* `inputText` : returns an input for strings or numbers, depending on field type bound to
* `inputValue` : returns an input for strings, with to/from conversion hooks
* `selector` : returns a select containing a list of options
* `radioGroup` : returns a list of radio inputs

In this example, we write a BMI component with two sliders:

```typescript
export class BMI extends Component
{
    height = 180
    weight = 80

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
[Play](https://stackblitz.com/edit/pickle-bmi)

`Component` has a `updateProperty` method that a `KeyValue` argument, that sets a property on the component, then calls component's `update` for you. All the widget functions take a callback that will plug straight into `updateProperty`. This gives you explicit control over the execution path. You can however write your own higher-level widgets that automatically call `updateProperty` for you.

## Validation

We recommend you use `class-validator` to validate with javascript decorators. This lets you write this type of code:

```typescript
export class ValidationSample extends MyForm
{     
    @MinLength(3) @MaxLength(10) @IsNotEmpty()  username = ""
    @Num() @Min(0) @Max(10)                     rating = NaN
    @Num() @IsNumber()                          bonus = NaN

    ok() {
        this.update(() => { this.validated = true })
    }

    view () : VElement {           
        return div (  
            superInput (myInput, this, () => this.username, "Username"),
            superInput (myInput, this, () => this.rating, "Rating"),
            superInput (inputCurrency, this, () => this.bonus, "Bonus"),
            div (
                myButton(() => this.ok(), "ok")
            )
        )       
    }
}
```
This is included in the samples under the `validation` sample. In it we write `superInput`, a higher-order function. It takes an input function as a parameter, and adds a label and validation message. Pickle encourages you to write higher-order functions by building on pickle's primitives.

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

The HTML helpers take a spread of attribute objects, elements, and primitive values. Pickle has been designed to work well with Typescript, so your IDE can provide statement completion. In conjunction with `typestyle`, as we'll see later, we get a deep, clean static typing experience.

Attribute objects go first. Some examples:

```typescript
div ()                                  // empty
div ("hello")                           // primitive value
div ({id: 1})                           // attribute
div ({id: 1, class: "foo"})             // multiple attributes
div ({id: 1}, "hello")                  // attribute followed by element
div (div ())                            // nested elements
div ({id: 1}, "hello", div("goodbye"))  // combination
```
Multiple attribute objects are merged. Merging attributes is really useful when writing functions allowing the caller to merge their own attributes in with yours. The following are equivalent:

```typescript
div ({id: 1}, {class:"foo"})
div ({id: 1, class:"foo"})  
```
Event handlers are specified as simply a name followed by the handler:
```
button (
    { onclick : () => this.add (1) }, "+"
)
```

# Style

While you can use ordinary css or scss files with pickle, pickle has first class support for [typestyle](https://github.com/typestyle/typestyle), that lets you write css in typescript.

The key advantages are:

* Typescript is far more powerful than any stylesheet language - it's a better way to organize and abstract your styles.
* It eliminates the seam between your view functions and styles - easily pass in variables to dynamically modify styles.
* You can colocate your code with your styles, or provide exactly the appropriate level of coupling to maximise maintainability.

Here's what it looks like:

```typescript
div ({style: {color:'green' }}, 'pickle')
```
Pickle will call typestyle's `style` function on the object you provide. It's as if you called:

```typescript
div ({class: style ({color:'green'})}, 'pickle')
```
If you need to reuse a style, then don't inline the style: declare it as a variable and refer to it in your class attribute. You can factor it just as you please.

Typestyle will dynamically create a small unique class name, and add css to the top of your page. So the following:

```typescript
div ({style: {color: 'green'} },
    "pickle"
)
```
Which will generate something like:

```html
<div class="fdwf33">
    pickle
</div>
```
With the following css:
```css
fdwf33 {
    style: green;
}
```
Pickle automatically combines css values. The following are equivalent:

```typescript
div ({class: "big"}, {class: "happy"})
div ({class: "big happy"})
```

You may also use ordinary style strings rather than objects, which bypasses the typestyle library.

## Important Gotcha

Since style objects are actually converted into classes, they may not override other styles in other classes that apply to that element. If this is a issue either add the `!important` modifier to the style, or revert to a string style. You should however discover that with typestyle you have less need to use the `!important` modifier in the first place as you can better abstract your styles.

# Child-To-Parent Communication

Use composition to manage complexity: as your application grows, parent components compose children into larger units of functionality. However, sometimes communication has to go in the reverse direction: from child to parent. This is done in one of three ways:

* Callbacks
* Parent Interface
* Update Path

With all of these approaches, the single-source-of-truth is always maintained. Avoid copying state.

## Callback Communication

With this approach, the parent passes a callback to the child:

```typescript
class ParentComponent extends Component {
    @Type (() => ChildComponent) child: ChildComponent
    view () {
        return (
            ...
            child.view (() => this.updateSomeValue())
            ...
        )
    }    
}

class ChildComponent extends Component {
    ...
    view (updateSomeValue?: () => void) : VElement { 
        ...
    }
}
```
It's worth repeating that you should only use a child component if the child component has its *own* state. If not, save yourself some typing and replace your child component with a function that returns a `VElement`.

### todoMVC

In these live online examples, we demonstrate two equivalent todoMVC samples. The first is implemented monolithically. The latter evolves that implementation, by using the callback pattern, both when factoring out a child component (`taskItem`), and factoring out a function that returns a view (`linkListView`):

* [Monolithic todoMVC](https://stackblitz.com/edit/pickle-task-list)
* [Factored todoMVC](https://stackblitz.com/edit/pickle-task-list-factored)

Note that a small design restriction is that the arguments to `view` must be optional to support the parameterless super class `view`.

## Parent Interface Communication

With this pattern:

1. The parent component implements an interface for exposing only the state your child needs to see
2. The child component has a method that returns this.parent cast to the parent interface

So the code structure is as follows:

```typescript
interface IParent {
    statefulMethod() : SomeType	
}

class ParentComponent extends Component implements IParent {
    statefulMethod() { return ... }
    ...
}

class ChildComponent extends Component {
    iparent() { return <IParent>this.parent }
    ...
}
```
The purpose of the interface is to reduce the surface area of the parent that the child can see, so that you can more easily reason about your code.

You may also use the `Component`'s `root()`, or `branch()` API (explained in the API section further below) to target a specific ancestor, rather than the immediate parent.

## Update Communication

All state changes to `Component` trigger its `updated` method:

```typescript
   updated (payload: any) {
      ...
   }
```
You can also override `beforeUpdate` to prepare for or cancel any update (by returning `false`):

```typescript 
   beforeUpdate (payload: any) {
       // return true to go ahead with update
       // return false to cancel update
   }
```
Both `beforeUpdate` and `updated` are called on an update, from child through the root. This allows a parent to control and respond to updates made by its children, without having to handle specific callbacks.

The `payload` property contains any data associated with the update. The `source` property will be set to component that `update` was called on, which is occasionally useful.

## HTML History

We recommend you use this library:

https://github.com/ReactTraining/history

The `samples` app demonstrates integrating history to provide routing. At its heart, routing is about mapping the path of a url to component state. By responding to history changes, you can set the state which will in turn render the correct view. Often the state in these cases is the name of the component or sub-component that should be rendered at the exclusion of its sibling components.

# API Reference

The `Component` and `App` APIs have been covered in earlier sections, and can also be understood through intellisense and the source code, but are included here to give a reference-oriented overview.

The HTML, lifecycle, serialization, and time travel APIs have already been covered in their dedicated sections.

## Component Class API

### Component View Members

```typescript
/** Override to return a virtual DOM element that visually represents the component's state */
view(): VElement

/** Call to run an action after the view is rendered. Think of it like setTimeout but executed at exactly at the right time in the update cycle. */
onRefreshed (action: () => void) 
```

### Component Initialization Members

```typescript
/** Called after construction, with a flag indicating if deserialization occured */
attached (deserialized: boolean) 
```
### Component Update Members

```typescript
/** Call with action that updates the component's state, with optional payload */
update (updater: () => void, payload: any = {}) 

/** Override to capture an update before it occurs, returning `false` to cancel the update
* @param payload Contains data associated with update - the update method will set the source property to 'this'
*/
beforeUpdate (payload: any) : boolean

/** Override to listen to an update after its occured
* @param payload Contains data associated with update - the update method will set the source property to 'this'
*/
updated (payload: any) : void

/** A convenient shortcut to update a component property; wraps property change in update */
updateProperty (payload: KeyValue)
```

### Component Tree Members

```typescript
/** The app associated with the component; undefined if not yet attached - use judiciously - main purpose is internal use by update method */
app?: App

/** The parent component; undefined if the root component - use judiciously - main purpose is internal use by update method */
parent?: Component  

/** Returns the root component by recursively walking through each parent */
root () : Component 

/** Returns the branch, inclusively from this component to the root component */
branch () : Component[]

/** Returns the properties that are components, flattening out array properties of components */
children () : Component[]      
```
## App Class API

### App Initialization Members
```typescript
/**    
 * The entry point for a pickle app
 * @param rootComponentConstructor The parameterless constructor of the root component
 * @param containerId The element id to render the view, and local storage name
 */
constructor (rootComponentConstructor: new () => Component, containerId: string)

/** Root component of updates, view and serialization */
rootComponent: Component 
```

### App Serialization Members
```typescript
/** Manages serialization of root component to local storage */
storage: Storage 

/** manages time travel - type is 'any' because component snapshots are converted to plain json objects */
time: TimeTravel<any> 

/** whether snapshots occur by default after each update */
timeTravelOn: boolean 

/**
 * Serialize the root component to local storage and/or time travel history
 * @param doSave true = force save, false = do not save, undefined = use value of App.storage.autosave
 * @param doTimeSnapshot true = force snapshot,false = do not snapshot, undefined = use value of App.timeTravelOn
 */
snapshot(doSave?: boolean, doTimeSnapshot?: boolean): void
```