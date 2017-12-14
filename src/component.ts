import { App } from './app';
import { div } from './html'
import { VNode } from './dom'
import { parseTyped, KeyValue } from './util'
import { Exclude, classToPlain } from 'class-transformer'

export abstract class Component
{
    @Exclude() app?: App
    @Exclude() parent?: Component    
        
    view(): VNode<any> {
        return div ((<any>this.constructor).name)
    }

    beforeUpdate? (payload?: any) : boolean

    afterUpdate? (payload?: any) : void

    update(updater: () => void, payload: any = {})
    {
        const app = this.root().app
        payload.source = this
        
        try {
            if (app)
                app.activeUpdates++

            for (var c of this.branch())
                if (c.beforeUpdate && c.beforeUpdate (payload) === false)
                    return

            updater()

            for (var c of this.branch())
                if (c.afterUpdate)
                    c.afterUpdate (payload)
        }
        finally {
            if (app)
                app.activeUpdates--
        }

        if (app) {  
           app.snapshot()
           app.refresh()
        }
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

    setApp (app: App) {
        this.app = app
        this.setParent (undefined)
    }

    setParent (parent?: Component) {
        this.parent = parent
        for (var key of Object.keys(this)) {
            var c = this[key]
            if (c != parent && c instanceof Component)
                c.setParent (this)  
        }
        if (this.afterAttached)
            this.afterAttached()
    }

    afterAttached?() : void
}