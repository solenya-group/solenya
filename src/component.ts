import { App } from './app';
import { div } from './html'
import { VNode } from './dom'
import { parseTyped, KeyValue } from './util'
import { Exclude, classToPlain } from 'class-transformer'

export abstract class Component
{
    @Exclude() _app?: App
    @Exclude() _parent?: Component    
        
    view(): VNode<any> {
        return div ((<any>this.constructor).name)
    }

    beforeUpdate (payload?: any) { return true }

    afterUpdate (payload?: any) { }

    update(updater: () => void, payload: any = {})
    {
        const app = this.root().app
        payload.source = this
        
        try {
            if (app)
                app.activeUpdates++

            for (var c of this.branch())
                if (c.beforeUpdate (payload) === false)
                    return

            updater()

            for (var c of this.branch())
                c.afterUpdate (payload)
        }
        finally {
            if (app)
                app.activeUpdates--
        }

        if (app) 
           app.refresh()
    }

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

    get app() : App | undefined { return this._app }

    set app (app: App | undefined) {
        this._app = app
        this.parent = undefined      
    }

    get parent(): Component | undefined { return this._parent }

    set parent (parent: Component | undefined) {
        this._parent = parent
        for (var child of this.children())
            child.parent = this
        this.beforeRefresh()
    }

    afterRefreshRecurse() {
        for (var child of this.children())
            child.afterRefreshRecurse()
        this.afterRefresh()
    }

    beforeRefresh() { }

    afterRefresh() { }
}