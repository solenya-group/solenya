import { App } from './app';
import { div } from './html'
import { VElement } from './dom'
import { parseTyped, KeyValue } from './util'
import { Exclude, classToPlain } from 'class-transformer'

export abstract class Component
{
    /** The app associated with the component; undefined if not yet attached - use judiciously - main purpose is internal use by update method */
    @Exclude() app?: App

    /** The parent component; undefined if the root component - use judiciously - main purpose is internal use by update method */
    @Exclude() parent?: Component   

    @Exclude() private refreshQueue: Function[] = []

    /** Called after construction, with a flag indicating if deserialization occured */
    attached (deserialized: boolean) {}
        
    /** Override to return a virtual DOM element that visually represents the component's state */
    view(): VElement {        
        return div ((<any>this.constructor).name)
    }

    /**
     * Override to capture an update before it occurs, returning `false` to cancel the update
     * @param payload Contains data associated with update - the update method will set the source property to 'this'
     */
    beforeUpdate (payload: any) { return true }

    /** Override to listen to an update after its occured
     * @param payload Contains data associated with update - the update method will set the source property to 'this'
     */
    updated (payload: any) { }

    /** Call with action that updates the component's state, with optional payload obect */
    update(updater: () => void, payload: any = {})
    {       
        payload.source = this
        try {
            if (this.app)
                this.app.activeUpdates++

            for (var c of this.branch())
                if (c.beforeUpdate (payload) === false)
                    return

            updater()

            for (var c of this.branch())
                c.updated (payload)
        }
        finally {
            if (this.app)
                this.app.activeUpdates--
        }

        if (this.app) {
           this.app.snapshot ()
           this.app.refresh ()
        }
    }

    /** A convenient shortcut to update a component property; wraps property change in update */
    updateProperty (payload: KeyValue) {
        return this.update (() => 
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

    /** Returns the properties that are components, flattening out array properties of components */
    children() {
        const children: Component[] = []
        for (var key of Object.keys(this)) {
            var child = this[key]
            if (child != this.parent && child instanceof Component)
                children.push (child)
            else if (child instanceof Array)
                for (var aChild of child)
                    if (aChild != this.parent && aChild instanceof Component)
                        children.push (aChild)                                                
        }
        return children
    }

    /** internal use only */
    attach (app: App, parent?: Component, deserialize = false) {
        const detached = this.parent == null && this.app == null
        
        this.parent = parent
        this.app = app

        for (var child of this.children())
            child.attach (app, this, deserialize)

        if (detached)
            this.attached (deserialize)             
    }

    /** internal use only */
    runRefreshes() {
        for (var child of this.children())
            child.runRefreshes()
        while (this.refreshQueue.length)
            this.refreshQueue.shift()!()
    }

    /** Call to run an action after the view is rendered. Think of it like setTimeout but executed at exactly at the right time in the update cycle. */
    onRefreshed (action: () => void) {
        this.refreshQueue.push (action)
    }
}