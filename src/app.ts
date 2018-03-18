import { TimeTravel } from './timeTravel'
import { Storage } from './storage'
import { Component } from './component'
import { patch, VElement } from './dom'
import { serialize, deserialize, plainToClass, classToPlain} from 'class-transformer'

export class App 
{   
    private _rootComponent: Component
    private lock = false
    private rootElement: Element
    private _timeTravelOn = false
    private isVdomRendered = false
    
    storage: Storage    
    time: TimeTravel<any>        
    activeUpdates = 0

    constructor (rootComponentConstructor : new() => Component, containerId: string)
    {
        this.rootElement = document.getElementById (containerId)!        

        this.time = new TimeTravel<any> (state =>
            this.setRootComponent (
                <Component><any> plainToClass(rootComponentConstructor, state, {enableCircularCheck:true}), false, false 
            )
        )

        this.storage = new Storage
        (
            containerId,
            () => serialize (this.rootComponent),
            serialized => this.setRootComponent (<Component> deserialize (rootComponentConstructor, serialized), false)
        )

        this.storage.load ()

        if (! this.rootComponent)
            this.setRootComponent (new rootComponentConstructor())
    }

    get rootComponent() {
        return this._rootComponent
    }

    private setRootComponent (rootComponent: Component, doSave?: boolean, doTimeSnapshot?: boolean) {
        this._rootComponent = rootComponent
        this.snapshot (doSave, doTimeSnapshot)
        this.refresh ()
    }

    get timeTravelOn() {
        return this._timeTravelOn
    }

    set timeTravelOn(value: boolean) {
        this._timeTravelOn = value;
        if (value) 
            this.snapshot (false, true)        
    }

    snapshot (doSave?: boolean, doTimeSnapshot?: boolean)
    {
        if (this.activeUpdates == 0)
        {
            var json: Object
            if (doTimeSnapshot || (this.timeTravelOn && doTimeSnapshot !== false)) {
                json = classToPlain (this.rootComponent)
                this.time.push (json)
            }
            this.storage.save (doSave, () => json != null ? serialize (json) : serialize (this.rootComponent))
        }
    }

    refresh ()
    {
        this.rootComponent.app = this
      
        if (this.lock)
            return;

        this.lock = true;
        setTimeout(() =>
        {
            this.lock = false;            

            var rootVNode = this.rootComponent.view()

            if (this.lock)
                return;

            if (this.isVdomRendered)
                patch (rootVNode, <Element>this.rootElement.lastElementChild)
            else {
                this.rootElement.appendChild (patch (rootVNode))
                this.isVdomRendered = true
            }               

            this.rootComponent.afterRefreshRecurse()
        })
    }
}