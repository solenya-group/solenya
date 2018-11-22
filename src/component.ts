import { App } from './app';
import { div } from './html'
import { VElement } from './dom'
import { parseTyped, KeyValue, ensureFieldsNums, IsSystemProperty, isSystemProperty } from './util'
import { Exclude, Type } from 'class-transformer'

export abstract class Component
{
    /** The app associated with the component; undefined if not yet attached - use judiciously - main purpose is internal use by update method */
    @IsSystemProperty() @Exclude() app?: App

    /** The parent component; undefined if the root component - use judiciously - main purpose is internal use by update method */
    @IsSystemProperty() @Exclude() parent?: Component   

    @IsSystemProperty() @Exclude() private refreshQueue: Function[] = []

    /** Called after construction, with a flag indicating if deserialization occured */
    attached (deserialized: boolean) {}
        
    /** Override to return a virtual DOM element that visually represents the component's state */
    view(): VElement {        
        return div ((<any>this.constructor).name)
    }

    /** Override to listen to an update after its occured
     * @param payload Contains data associated with update - the update method will set the source property to 'this'
     */
    updated (payload: any) { }

    private branchUpdated (payload: any = {}) {
        payload.source = this
        for (var c of this.branch())
            c.updated (payload)
    }

    private preUpdate (payload: any = {}) {
        if (this.app)
            this.app.activeUpdates++
    }

    private postUpdate () {
        if (this.app)
            this.app.activeUpdates--        
    }

    private appRefresh() {        
        if (this.app) {
           this.app.snapshot ()
           this.app.refresh ()
        }
    }

    /** Call with action that updates the component's state, with optional payload object */
    update (updater: () => void, payload: any = {})
    {               
        try {
            this.preUpdate (payload)
            updater()
            this.branchUpdated(payload)
        }
        finally {
            this.postUpdate()
        }
        this.appRefresh()
    }

    /** A convenient shortcut to update a component property; wraps property change in update */
    updateProperty (payload: KeyValue) {
        this.update (() => 
            this[payload.key] = parseTyped (payload.value, this[payload.key]),
            payload
        )
    }    

    /* Returns the root component by recursively walking through each parent */
    root() : Component {
        return ! this.parent ? this : this.parent.root()
    }

    /** Returns the branch, inclusively from this component to the root component */
    branch() {
        const branch = []
        var current: Component | undefined = this
        while (current) {
            branch.push (current)
            current = current.parent
        }          
        return branch
    }

    /** Returns the properties that are components, appended with flattened out array properties of components. */
    children() {
        const children: Component[] = []
        const childrenFromArrayProperties: Component[] = []

        for (var key of Object.keys(this)) {
            var child = this[key]
            if (child != this.parent && child instanceof Component)
                children.push (child)
            else if (child instanceof Array)
                for (var aChild of child)
                    if (aChild != this.parent && aChild instanceof Component) 
                        childrenFromArrayProperties.push (aChild)                                                
        }
        return children.concat (childrenFromArrayProperties)
    }

    /** Returns the names of properties that are components */
    childrenKeys() {
        return Object.keys (this).filter (k => this[k] instanceof Component && this[k] != this.parent)
    }

    /** Attaches a component to the component tree.
     * Called automatically on refresh but can be explicitly called to eagerly attach.
     */
    attach (app: App, parent?: Component, deserialize = false) {
        const detached = this.parent == null && this.app == null
        
        this.parent = parent
        this.app = app

        for (var child of this.children())
            child.attach (app, this, deserialize)
       
        if (detached) {
            ensureFieldsNums (this)
            this.attached (deserialize)             
        }
    }

    /** internal use only */
    runRefreshesInternal() {
        for (var child of this.children())
            child.runRefreshesInternal()
        while (this.refreshQueue.length)
            this.refreshQueue.shift()!()
    }

    /** Call to run an action after the view is rendered. Think of it like setTimeout but executed at exactly at the right time in the update cycle. */
    onRefreshed (action: () => void) {
        this.refreshQueue.push (action)
    }

    /** Auto generates class-transformer's @Type decorators to properties that are components. */
    initDecorators() {
         for (var propName of this.childrenKeys()) {
            const propValue = this[propName]            
            propValue.initDecorators()            
            Type (() => propValue.constructor)(this, propName)
        }
    }

    /** Returns properties not marked with the `isSystemProperty()` decorator. */
    properties() {
        return Object.keys (this).filter(k => ! isSystemProperty (this, k))
    }
}