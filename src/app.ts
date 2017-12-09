import { TimeTravel } from './timeTravel'
import { Component } from './component'
import { vnode, patch, VNode } from './dom'

export class App 
{
    private container: Element
    private lock: boolean
    private rootComponent: Component
    private rootElement: Element
    private rootVNode: VNode<any>

    time: TimeTravel<Component>
    isRecording = true    
    activeUpdates = 0

    constructor (rootComponent: Component, containerId: string)
    {
        this.rootComponent = rootComponent
        this.container = document.getElementById (containerId)!

        rootComponent.app = () => this
    
        this.time = new TimeTravel<Component> (this.rootComponent, state => {
            this.rootComponent = state
            this.refresh()
        })

        this.refresh()       
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