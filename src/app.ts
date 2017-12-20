import { TimeTravel } from './timeTravel'
import { Component } from './component'
import { vnode, patch, VNode } from './dom'
import { serialize, deserialize, plainToClass, classToPlain} from 'class-transformer'

export class App 
{
    private container: Element
    private lock: boolean
    private rootComponent: Component
    private rootElement: Element
    private rootVNode: VNode<any>

    saveOn: boolean
    recordOn = true
    time: TimeTravel<any>    
    activeUpdates = 0    

    constructor (rootComponentConstructor : new() => Component, containerId: string, saveOn: boolean = false)
    {
        this.saveOn = saveOn

        if (! saveOn)
            window.localStorage.removeItem(containerId)
        
        var persisted = window.localStorage.getItem(containerId)
        if (persisted != null)
            this.rootComponent = <Component>deserialize (rootComponentConstructor, persisted)        
        else 
            this.rootComponent = new rootComponentConstructor()           

        this.container = document.getElementById (containerId)!        
    
        this.time = new TimeTravel<any> (state => {
            this.rootComponent = <Component><any> plainToClass(rootComponentConstructor, state, {enableCircularCheck:true}  )
            this.refresh()
        })
    
        this.refresh()
    }

    snapshot()
    {        
        if (this.activeUpdates == 0)
        {            
            var json = classToPlain (this.rootComponent)
            this.time.push (json)
            if (this.saveOn)
                window.localStorage.setItem (this.container.id, serialize (json))
        }        
    }

    refresh ()
    {
        this.rootComponent.app = this

        if (this.recordOn)
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