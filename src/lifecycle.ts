import { VElement, VAttributes, VLifecycle } from './dom'

export function combineLifecycles (a: VLifecycle, b: VLifecycle)
{   
    const {onadd, onbeforeupdate, onafterupdate, onremove, ondestroy} = a

    if (onadd || b.onadd)
        a.onadd = (el, attrs) => {              
            onadd && onadd(el, attrs)
            b.onadd && b.onadd (el, attrs)
        }

    if (onbeforeupdate || b.onbeforeupdate)
        a.onbeforeupdate = (el, attrs) => {                               
            onbeforeupdate && onbeforeupdate(el, attrs)
            b.onbeforeupdate && b.onbeforeupdate (el, attrs)
        }

    if (onafterupdate || b.onafterupdate)
        a.onafterupdate = (el, attrs) => {                               
            onafterupdate && onafterupdate (el, attrs)
            b.onafterupdate && b.onafterupdate (el, attrs)
        }

    if (onremove || b.onremove)
        a.onremove = (el, rem) => {  
            const doRem = () => {
                if (b.onremove)
                    b.onremove (el, rem)
                else
                    rem()  
            }
            if (onremove)
                onremove (el, doRem)
            else
                doRem()
        }     

    if (ondestroy || b.ondestroy)
        a.ondestroy = el => {                    
            ondestroy && ondestroy (el)
            b.ondestroy && b.ondestroy (el)
        }    

    return a
}