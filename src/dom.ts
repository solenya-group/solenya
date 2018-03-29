// based on https://github.com/jorgebucaran/ultradom

export interface VElement {
    nodeName: string
    attributes: VAttributes
    children: VNode[]
    key?: string | number
}

export type VNode = VElement | string | number

export interface VAttributes extends VLifecycle {
    key?: string | number
}

export interface VLifecycle {
    onadd? (element: Element, attributes?: VAttributes) : void // pickle mod
    onbeforeupdate? (element: Element, attributes?: VAttributes) : void // pickle mod
    onafterupdate? (element: Element, attributes?: VAttributes) : void // pickle mod
    onremove? (element: Element, remove: () => void) : void
    ondestroy? (element: Element) : void
}

// pickle mod
export function isVElement(vnode?: VNode): vnode is VElement {
    return vnode && vnode["attributes"]
}

// pickle mod
function squash (children:any[]) {
    var squashed: any[] = []
    for (var x of children)
        if (!Array.isArray(x)) {
            if (x !== null && x !== undefined)
                squashed.push (x)
        }
        else
            for (var y of squash (x)) // pickle mod: overly recursive?
                squashed.push (y)
    return squashed
}

export function createVElement(name: string | Function, attributes: VAttributes, ...children: any[]): VElement
{ 
    children = squash (children)

    return typeof name === "function"
        ? name(attributes || {}, children) 
        : {
            nodeName: name,
            attributes: attributes || {},
            children: children,

            key: attributes && attributes.key
        }
}

export function patch (velement: VElement, element?: Element) {
    var lifecycleCallbacks: (() => void)[] = []

    element = <Element> patchElement(
        element && (<any>element).parentNode,
        element,
        element && (<any>element).node == null
            ? recycleElement(element, [].map)
            : element && (<any>element).node,
        velement,
        lifecycleCallbacks,
        element != null && (<any>element).node == null // is recycling
    )

    element["node"] = velement // pickle mod

    while (lifecycleCallbacks.length)
        lifecycleCallbacks.pop()!() // pickle mod

    return element
}

function recycleElement(element: Element, map: Function) {
    return {
        nodeName: element.nodeName.toLowerCase(),
        attributes: {},
        children: map.call(element.childNodes, function (element: Element) {
            return element.nodeType === 3 // Node.TEXT_NODE
                ? element.nodeValue
                : recycleElement(element, map)
        })
    }
}

export function merge (dominant: any, recessive: any) { // pickle mod
    var obj = {}

    for (var i in recessive) obj[i] = recessive[i]
    for (var i in dominant) obj[i] = dominant[i]

    return obj
}

function getKey(node: VNode) {
    return isVElement(node) ? node.key : null
}

// pickle mods (needs to work with qt browser)
function updateAttribute(element: Element, name: string, value: any, oldValue: any, isSVG: boolean) {
    if (name === "key")
        return
    if (typeof value === "function")
        element[name] = value
    else if (value != null && value !== false)
        element.setAttribute(name, value)        
    if (value == null || value === false)
        element.removeAttribute(name)
}

function createNode(vnode: VNode, callbacks: any[], isSVG: boolean) {
    var node =
        typeof vnode === "string" || typeof vnode === "number"
            ? document.createTextNode("" + vnode) // pickle mod
            : (isSVG = (isSVG || vnode.nodeName === "svg"))
                ? document.createElementNS("http://www.w3.org/2000/svg", vnode.nodeName)
                : document.createElement(vnode.nodeName)

    if (isVElement(vnode)) { // pickle mod        
        var attributes = vnode.attributes 
        if (attributes) {

            if (attributes.onadd) {
                callbacks.push(function () {
                    attributes.onadd!(<Element>node, attributes) // pickle mod
                })
            }

            for (var i = 0; i < vnode.children.length; i++) {
                node.appendChild(createNode(vnode.children[i], callbacks, isSVG))
            }

            for (var name in attributes) {
                updateAttribute(<Element>node, name, attributes[name], null, isSVG)
            }
        }
    }

    return node
}

function updateElement(
    element: Element,
    oldAttributes: VAttributes,
    attributes: VAttributes,
    callbacks: any[],
    isRecycling: boolean,
    isSVG: boolean
) {   
    for (var name in merge (attributes, oldAttributes)) {
        if (
            attributes[name] !==
            (name === "value" || name === "checked"
                ? element[name]
                : oldAttributes[name])
        ) {
            updateAttribute(
                element,
                name,
                attributes[name],
                oldAttributes[name],
                isSVG
            )
        }
    }
    // pickle mods
    if (! isRecycling && attributes.onbeforeupdate) {
        attributes.onbeforeupdate(element, attributes)
    }

    var cb = isRecycling ? attributes.onadd : attributes.onafterupdate
    if (cb) {
        callbacks.push(function () {
            cb!(element, oldAttributes)
        })            
    }
}

function removeChildren(element: Element, node: VNode) {
    if (isVElement(node)) { // pickle mod
        var attributes = node.attributes
        if (attributes) {
            for (var i = 0; i < node.children.length; i++) {
                removeChildren(<Element>element.childNodes[i], node.children[i])
            }

            if (attributes.ondestroy) {
                attributes.ondestroy(element)
            }
        }
    }
    return element
}

function removeElement(parent: Element, element: Element, velement: VElement) {
    function done() {
        removeChildren(element, velement)
        parent.removeChild(element)
    }
    element["removing"] = true

    var cb = velement.attributes && velement.attributes.onremove
    if (cb) {
        cb(element, done)
    } else {    
        done()
    }
}

function activeNodes (nodes: NodeList) {
    var activeNodes = []
    for (var x = 0; x < nodes.length; x++)
        if (nodes[x]["removing"] !== true)
            activeNodes.push (nodes[x])
    return activeNodes
}

function patchElement(
    parent: Element,
    node: Node | undefined,
    oldVNode: VNode | undefined,
    vnode: VNode,
    lifecycleCallbacks: Function[],
    isRecycling: boolean,
    isSVG = false
) {    
    if (vnode === oldVNode) {
    } else if (oldVNode == null || oldVNode["nodeName"] !== vnode["nodeName"]) { // pickle mod
        var newElement = createNode(vnode!, lifecycleCallbacks, isSVG)
        if (parent) {
            parent.insertBefore(newElement, node || null) // pickle mod
            if (oldVNode != null) {
                removeElement(parent, <Element>node, <VElement> oldVNode) // pickle mod
            }
        }
        node = newElement
    } else if (oldVNode["nodeName"] == null) { // pickle mod
        node!.nodeValue = "" + vnode // pickle mod
    } else {
        updateElement(
            <Element>node,
            (<VElement>oldVNode).attributes,
            (<VElement>vnode).attributes,
            lifecycleCallbacks,
            isRecycling,
            (isSVG = (isSVG || (<VElement>vnode).nodeName === "svg"))
        )

        var oldKeyed = {}
        var newKeyed = {}
        var oldElements: Node[] = []
        var oldChildren = (<VElement>oldVNode).children
        var children = (<VElement>vnode).children
        
        var active = activeNodes (node!.childNodes) // pickle mod (allow asynchronous removes)

        for (var i = 0; i < oldChildren.length; i++) {
            oldElements[i] = active[i] // pickle mod
            var oldKey = getKey(oldChildren[i])
            if (oldKey != null) {
                oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
            }
        }

        var i = 0
        var k = 0

        while (k < children.length) {
            var oldKey = getKey(oldChildren[i])
            var newKey = getKey(children[k])

            if (oldKey && newKeyed[oldKey]) { // pickle mod
                i++
                continue
            }

            if (newKey == null || isRecycling) {
                if (oldKey == null) {
                    patchElement(
                        <Element>node,
                        oldElements[i],
                        <VElement>oldChildren[i],
                        <VElement>children[k],
                        lifecycleCallbacks,
                        isRecycling,
                        isSVG
                    )
                    k++
                }
                i++
            } else {
                var keyedNode = oldKeyed[newKey] || []

                if (oldKey === newKey) {
                    patchElement(
                        <Element>node,
                        keyedNode[0],
                        keyedNode[1],
                        <VElement>children[k],
                        lifecycleCallbacks,
                        isRecycling,
                        isSVG
                    )
                    i++
                } else if (keyedNode[0]) {
                    patchElement(
                        <Element>node,
                        node!.insertBefore(keyedNode[0], oldElements[i]),
                        keyedNode[1],
                        <VElement>children[k],
                        lifecycleCallbacks,
                        isRecycling,
                        isSVG
                    )
                } else {
                    patchElement(
                        <Element>node,
                        oldElements[i],
                        undefined, // pickle mod
                        <VElement>children[k],
                        lifecycleCallbacks,
                        isRecycling,
                        isSVG
                    )
                }

                newKeyed[newKey] = children[k]
                k++
            }
        }

        while (i < oldChildren.length) {
            if (getKey(oldChildren[i]) == null) {
                removeElement(<Element>node, <Element>oldElements[i], <VElement>oldChildren[i])
            }
            i++
        }

        for (var j in oldKeyed) {
            if (!newKeyed[j]) {
                removeElement(<Element>node, oldKeyed[j][0], oldKeyed[j][1])
            }
        }
    }
    return node
}