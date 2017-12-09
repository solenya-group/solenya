import { App } from './app';
import { div } from './html'
import { VNode } from './dom'
import { cloneDeep } from 'lodash'
import { parseTyped, KeyValue } from './util'

export abstract class Component
{
    app?: () => App
    parent?: Component    

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
        var root = this.root()
        var app = root.app ? root.app() : undefined
        var clone: Component

        try {
            if (app)
                app.activeUpdates++

            for (var c of this.branch())
                if (c.beforeUpdate && c.beforeUpdate (this, payload) === false)
                    return

            if (app && app.isRecording)
                clone = cloneDeep(root)                

            updater()

            for (var c of this.branch())
                if (c.afterUpdate)
                    c.afterUpdate()
        }
        finally {
            if (app)
                app.activeUpdates--
        }

        if (app && app.activeUpdates == 0) {
            if (app.isRecording)
                app.record (clone!, this)
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
}