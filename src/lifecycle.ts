import { VElement, VAttributes, VLifecycle } from './dom'

export function lifecycleListener (velement: VElement, life: VLifecycle)
{   
    const attributes = velement.attributes
    const {onadd, onbeforeupdate, onafterupdate, onremove, ondestroy} = velement.attributes

    if (onadd || life.onadd)
        attributes.onadd = (el, attrs) => {  
            life.onadd && life.onadd (el, attrs)
            onadd && onadd(el, attrs)    
        }

    if (onbeforeupdate || life.onbeforeupdate)
        attributes.onbeforeupdate = (el, attrs) => {                   
            life.onbeforeupdate && life.onbeforeupdate (el, attrs)
            onbeforeupdate && onbeforeupdate(el, attrs)
        }

    if (onafterupdate || life.onafterupdate)
        attributes.onafterupdate = (el, attrs) => {                   
            life.onafterupdate && life.onafterupdate (el, attrs)
            onafterupdate && onafterupdate (el, attrs)
        }

    if (onremove || life.onremove)
        attributes.onremove = (el, rem) => {  
            const doRem = () => {
                if (onremove)
                    onremove (el, rem)
                else
                    rem()  
            }
            if (life.onremove)
                life.onremove (el, doRem)
            else
                doRem()
        }     

    if (ondestroy || life.ondestroy)
        attributes.ondestroy = el => {        
            life.ondestroy && life.ondestroy (el)
            ondestroy && ondestroy (el)
        }    

    return velement
}