import { VElement, VLifecycle } from "./dom"

export function lifecycle (el: VElement, life: VLifecycle) : VElement
{
    const attributes = el.attributes

    var create = attributes.oncreate
    var update = attributes.onupdate
    var remove = attributes.onremove
    var destroy = attributes.ondestroy

    attributes.oncreate = (el, attrs) => {                   
        life.oncreate && life.oncreate (el, attrs)
        create && create(el, attrs)
    }

    attributes.onupdate = (el, attrs) => {                   
        life.onupdate && life.onupdate (el, attrs)
        update && update(el, attrs)
    }

    attributes.onremove = (el, rem ) => {        
        life.onremove && life.onremove (el, rem)
        remove && remove ( el, () => {})
    }

    attributes.ondestroy = el => {        
        life.ondestroy && life.ondestroy (el) 
        destroy && destroy(el)
    }

    return el
}