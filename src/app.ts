import { TimeTravel } from './timeTravel'
import { Storage } from './storage'
import { Component } from './component'
import { patch } from './dom'
import { serialize, deserialize, plainToClass, classToPlain, ClassTransformOptions } from 'class-transformer'

export type AppOptions = {
    rootComponent?: Component,
    isVdomRendered?: boolean
}

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
     * @param rootComponent Optionally, an existing instance of the root component
     * @param isVdomRendered Optionally, indicate that the vdom is already rendered
     */
    constructor (rootComponentConstructor : new() => Component, containerId: string, options: AppOptions = {})
    {               
        this.isVdomRendered = options.isVdomRendered == true
        this.rootElement = document.getElementById (containerId)!        

        this.time = new TimeTravel<any> (state =>
            this.setRootComponent (
                <Component><any> plainToClass(rootComponentConstructor, state, this.serializerOptions), true, false, false 
            )
        )

        // We need to create a root component early (even if we don't use the instance), to run initDecorators,
        // initDecorators automatically create @Type decorators. These type decorators must be created before deserialization occurs
        var newRoot = (options.rootComponent || new rootComponentConstructor())
        newRoot.initDecorators()

        this.storage = new Storage
        (
            containerId,
            () => serialize (this.rootComponent, this.serializerOptions),
            serialized => {                                
                this.setRootComponent (<Component>
                    deserialize (rootComponentConstructor, serialized, this.serializerOptions),
                    true,
                    false
                )
            }
        )

        this.storage.load ()

        if (! this.rootComponent)
            this.setRootComponent (newRoot)
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
            json = classToPlain (this.rootComponent, this.serializerOptions)
            this.time.push (json)
        }
        this.storage.save (doSave, () => json != null ?
            serialize (json, this.serializerOptions) :
            serialize (this.rootComponent, this.serializerOptions)
        )        
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
            
            this.rootComponent.runRefreshesInternal()
        })
    }

    serializerOptions: ClassTransformOptions = {
        enableCircularCheck: true
    }
}