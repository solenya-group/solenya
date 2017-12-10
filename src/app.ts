import { TimeTravel } from './timeTravel'
import { Component } from './component'
import { vnode, patch, VNode } from './dom'
import { serialize, deserialize} from 'class-transformer'

export class App 
{
    private container: Element
    private lock: boolean
    private rootComponent: Component
    private rootElement: Element
    private rootVNode: VNode<any>

    saveOn: boolean
    time: TimeTravel<Component>
    isRecording = true    
    activeUpdates = 0

    constructor (rootComponentConstructor: any, containerId: string, saveOn: boolean = false)
    {
        this.saveOn = saveOn

        if (! saveOn)
            window.localStorage.removeItem(containerId)
        
        var persisted = window.localStorage.getItem(containerId)
        if (persisted != null) {
            this.rootComponent = <Component>deserialize (rootComponentConstructor, persisted)
            this.rootComponent.setParent(undefined)
        }
        else {
            this.rootComponent = new rootComponentConstructor()
        }        

        this.container = document.getElementById (containerId)!

        this.rootComponent.app = () => this
    
        this.time = new TimeTravel<Component> (this.rootComponent, state => {
            this.rootComponent = state
            this.refresh()
        })

        this.refresh()       
    }

    save () {
        var s = serialize (this.rootComponent, { enableCircularCheck: true })                    
        window.localStorage.setItem (this.container.id, s)
    }

    record (prev: Component, next: Component)
    {
        this.time.push (prev, next)
    }

    refresh ()
    {
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
            }
        )
    }
}