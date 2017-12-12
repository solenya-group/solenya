import { App } from './app';
import { div } from './html'
import { VNode } from './dom'
import { parseTyped, KeyValue } from './util'
import { Exclude, classToPlain } from 'class-transformer'

export abstract class Component
{
    @Exclude() app?: () => App
    @Exclude() parent?: Component    
    
    constructor (parent?: Component)
    {
        this.parent = parent;
    }

    view(): VNode<any> {
        return div ((<any>this.constructor).name)
    }

    beforeUpdate? (source: Component, payload?: any) : boolean

    afterUpdate? () : void

    update (updater: () => void, payload?: any)
    {
        const root = this.root()
        const app = root.app ? root.app() : undefined
        
        try {
            if (app)
                app.activeUpdates++

            for (var c of this.branch())
                if (c.beforeUpdate && c.beforeUpdate (this, payload) === false)
                    return

            updater()

            for (var c of this.branch())
                if (c.afterUpdate)
                    c.afterUpdate()
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

    setParent (parent?: Component) {
        this.parent = parent
        for (var key of Object.keys(this)) {
            var c = this[key]
            if (c != parent && c instanceof Component)
                c.setParent (this)  
        }
    }
}