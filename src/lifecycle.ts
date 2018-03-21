import { VElement, VAttributes } from './dom'

export interface LifecycleListener
{
    update?() : void
    remove?() : Promise<void>
    destroy?() : void
}

export function lifecycleListener (velement: VElement, createLifecycleListener: (el: Element) => LifecycleListener)
{   
    const attributes = velement.attributes
    const {oncreate, onupdate, onremove, ondestroy} = velement.attributes

    velement.lifecycleListenerCount = (velement.lifecycleListenerCount || 0) + 1
    const lid = "lifecycleListener" + velement.lifecycleListenerCount

    attributes.oncreate = (el, attrs) => {  
        const life = el[lid] = createLifecycleListener(el)
        oncreate && oncreate(el, attrs)    
    }

    attributes.onupdate = (el, attrs) => {                   
        const life = el[lid] as LifecycleListener
        life.update && life.update()
        onupdate && onupdate(el, attrs)
    }

    attributes.onremove = async (el, rem) => {  
        const life = el[lid] as LifecycleListener        
        if (life.remove)
            await life.remove ()

        if (onremove)
            onremove(el, rem)
        else
            rem()     
    }     

    attributes.ondestroy = el => {        
        const life = el[lid] as LifecycleListener
        life.destroy && life.destroy()
        ondestroy && ondestroy(el)
    }    

    return velement
}