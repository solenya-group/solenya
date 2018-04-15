import { App } from './app';
import { div } from './html'
import { VElement } from './dom'
import { parseTyped, KeyValue } from './util'
import { Exclude, classToPlain } from 'class-transformer'

export abstract class Component
{
    @Exclude() app?: App
    @Exclude() parent?: Component   
    refresh?: () => void
        
    view(): VElement {
        return div ((<any>this.constructor).name)
    }

    beforeUpdate (payload: any) { return true }

    updated (payload: any) { }

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

    attached (deserialized: boolean) {}

    root() : Component {
        return ! this.parent ? this : this.parent.root()
    }

    branch() {
        const branch = []
        var current: Component | undefined = this
        while (current) {
            branch.push (current)
            current = current.parent
        }          
        return branch
    }

    updateProperty (payload: KeyValue) {
        return this.update (() => 
            this[payload.key] = parseTyped (payload.value, this[payload.key]),
            payload
        )
    }

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

    setParent (app: App, parent?: Component, deserialize = false) {
        const detached = this.parent == null && this.app == null
        
        this.parent = parent
        this.app = app

        for (var child of this.children())
            child.setParent (app, this, deserialize)

        if (detached)
            this.attached (deserialize)
    }

    afterRefreshRecurse() {
        for (var child of this.children())
            child.afterRefreshRecurse()
        if (this.refresh) {
            this.refresh()
            this.refresh = undefined
        }
    }
}