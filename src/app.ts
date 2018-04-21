import { TimeTravel } from './timeTravel'
import { Storage } from './storage'
import { Component } from './component'
import { patch, VElement } from './dom'
import { serialize, deserialize, plainToClass, classToPlain} from 'class-transformer'

export class App 
{   
    private _rootComponent!: Component
    private lock = false
    private rootElement: Element
    private _timeTravelOn = false
    private isVdomRendered = false

    /** Manages serialization of root component to local storage */    
    storage: Storage

    /** Manages time travel - type is 'any' because component snapshots are converted to plain json objects */
    time: TimeTravel<any>        

    /** internal use only - update tally to avoid unnecessary refereshes for nested updates */
    activeUpdates = 0

    /**    
     * The entry point for a pickle app
     * @param rootComponentConstructor The parameterless constructor of the root component
     * @param containerId The element id to render the view, and local storage name
     */
    constructor (rootComponentConstructor : new() => Component, containerId: string)
    {               
        this.rootElement = document.getElementById (containerId)!        

        this.time = new TimeTravel<any> (state =>
            this.setRootComponent (
                <Component><any> plainToClass(rootComponentConstructor, state, {enableCircularCheck:true}), true, false, false 
            )
        )

        this.storage = new Storage
        (
            containerId,
            () => serialize (this.rootComponent),
            serialized => this.setRootComponent (<Component> deserialize (rootComponentConstructor, serialized), true, false)
        )

        this.storage.load ()

        if (! this.rootComponent)
            this.setRootComponent (new rootComponentConstructor())
    }

    /** Root component of updates, view and serialization */
    get rootComponent() {
        return this._rootComponent
    }

    private setRootComponent (rootComponent: Component, deserialize = false, doSave?: boolean, doTimeSnapshot?: boolean) {
        this._rootComponent = rootComponent
        this.snapshot (doSave, doTimeSnapshot)
        this.refresh (deserialize)
    }

    /** Whether snapshots occur by default after each update  */
    get timeTravelOn() {
        return this._timeTravelOn
    }

    set timeTravelOn(value: boolean) {
        this._timeTravelOn = value;
        if (value) 
            this.snapshot (false, true)        
    }

    /**
     * Serialize the root component to local storage and/or time travel history
     * @param doSave true = force save, false = do not save, undefined = use value of App.storage.autosave
     * @param doTimeSnapshot true = force snapshot,false = do not snapshot, undefined = use value of App.timeTravelOn
     */
    snapshot (doSave?: boolean, doTimeSnapshot?: boolean)
    {
        if (this.activeUpdates > 0)
            return
        
        var json: Object
        if (doTimeSnapshot || (this.timeTravelOn && doTimeSnapshot !== false)) {
            json = classToPlain (this.rootComponent)
            this.time.push (json)
        }
        this.storage.save (doSave, () => json != null ? serialize (json) : serialize (this.rootComponent))        
    }

    /** internal use only */
    refresh (deserialize = false)
    {
        if (this.activeUpdates > 0)
            return

        this.rootComponent.attach (this, undefined, deserialize)
      
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
            
            this.rootComponent.runRefreshes()
        })
    }
}