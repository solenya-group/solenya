import { VElement, VAttributes } from './dom'

export interface LifecycleListener
{
    beforeUpdate?() : void
    afterUpdate?() : void
    remove?() : Promise<void>
    destroy?() : void
}

export function lifecycleListener (velement: VElement, createLifecycleListener: (el: Element) => LifecycleListener)
{   
    const attributes = velement.attributes
    const {onadd, onbeforeupdate, onafterupdate, onremove, ondestroy} = velement.attributes

    velement.lifecycleListenerCount = (velement.lifecycleListenerCount || 0) + 1
    const lid = "lifecycleListener" + velement.lifecycleListenerCount

    attributes.onadd = (el, attrs) => {  
        const life = el[lid] = createLifecycleListener(el)
        onadd && onadd(el, attrs)    
    }

    attributes.onbeforeupdate = (el, attrs) => {                   
        const life = el[lid] as LifecycleListener
        life.beforeUpdate && life.beforeUpdate()
        onbeforeupdate && onbeforeupdate(el, attrs)
    }

    attributes.onafterupdate = (el, attrs) => {                   
        const life = el[lid] as LifecycleListener
        life.afterUpdate && life.afterUpdate()
        onafterupdate && onafterupdate(el, attrs)
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