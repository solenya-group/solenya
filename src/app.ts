import { TimeTravel } from './timeTravel'
import { Storage } from './storage'
import { Component } from './component'
import { vnode, patch, VNode } from './dom'
import { serialize, deserialize, plainToClass, classToPlain} from 'class-transformer'

export class App 
{
    private _rootComponent: Component
    private container: Element
    private lock: boolean    
    private rootElement: Element
    private rootVNode: VNode<any>

    storage: Storage
    timeTravelOn = true
    time: TimeTravel<any>        
    activeUpdates = 0

    constructor (rootComponentConstructor : new() => Component, containerId: string)
    {
        this.container = document.getElementById (containerId)!        

        this.time = new TimeTravel<any> (state =>
            this.rootComponent = <Component><any> plainToClass(rootComponentConstructor, state, {enableCircularCheck:true}))

        this.storage = new Storage
        (
            containerId,
            () => serialize (this.rootComponent),
            serialized => this.rootComponent = <Component> deserialize (rootComponentConstructor, serialized)
        )

        var saved = this.storage.load (false)

        if (! this.rootComponent)
            this.rootComponent = new rootComponentConstructor()
    }

    get rootComponent() {
        return this._rootComponent
    }

    set rootComponent (rootComponent: Component) {
        this._rootComponent = rootComponent
        this.refresh()
    }

    snapshot()
    {        
        if (this.activeUpdates == 0)
        {            
            var json = classToPlain (this.rootComponent)
            this.time.push (json)
            this.storage.save (false, () => serialize (json))
        }        
    }

    refresh ()
    {
        this.rootComponent.app = this

        if (this.timeTravelOn)
            this.snapshot()

        if (this.lock)
            return;

        this.lock = true;
        setTimeout(() =>
        {
            this.lock = false;            

            var nextNode = this.rootComponent.view()

            if (this.lock)
                return;

            var manualDomPatches : (() => void)[] = []
            this.rootElement = <Element> patch (manualDomPatches, this.container!, this.rootElement, this.rootVNode, nextNode)
            this.rootVNode = nextNode;

            for (var p of manualDomPatches)
                p()     

            this.rootComponent.afterRefreshRecurse()
        })
    }
}