import { VElement, VAttributes, VLifecycle } from './dom'

export function combineLifecycles (a: VLifecycle, b: VLifecycle)
{   
    const {onAttached, onBeforeUpdate, onUpdated, onBeforeRemove, onRemoved} = a

    if (onAttached || b.onAttached)
        a.onAttached = (el, attrs) => {                               
            onAttached && onAttached (el, attrs)
            b.onAttached && b.onAttached (el, attrs)
        }

    if (onBeforeUpdate || b.onBeforeUpdate)
        a.onBeforeUpdate = (el, attrs) => {                               
            onBeforeUpdate && onBeforeUpdate(el, attrs)
            b.onBeforeUpdate && b.onBeforeUpdate (el, attrs)
        }

    if (onUpdated || b.onUpdated)
        a.onUpdated = (el, attrs) => {                               
            onUpdated && onUpdated (el, attrs)
            b.onUpdated && b.onUpdated (el, attrs)
        }

    if (onBeforeRemove || b.onBeforeRemove)
        b.onBeforeRemove = async el => {  
            onBeforeRemove && await onBeforeRemove (el)
            b.onBeforeRemove && await b.onBeforeRemove (el)            
        }  

    if (onRemoved || b.onRemoved)
        a.onRemoved = el => {                    
            onRemoved && onRemoved (el)
            b.onRemoved && b.onRemoved (el)
        }    

    return a
}