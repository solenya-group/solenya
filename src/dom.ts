// based on https://github.com/picodom/picodom/

export function vnode(element: Element, map: any) : VNode<VProps> {
    return (
        element &&
        hImp( // h
            element.tagName.toLowerCase(),
            {},
            map.call(element.childNodes, (element: HTMLElement) =>
                element.nodeType === 3
                    ? element.nodeValue
                    : vnode(element, map)
            )
        )
    )
}

export function get<T>(path: string[], from: T) {
    for (var i = 0; i < path.length; i++) {
        from = from[path[i]]
    }
    return from
}

export function set<T>(to: T, from: T) {
    for (var i in from) {
        to[i] = from[i]
    }
    return to
}

function getKey(node?: VNode<VProps>) {
    if (node && node.props) {
        return node.props.key
    }
}

export function isFunction(any: any) {
    return "function" === typeof any
}

export function merge(to: any, from: any): any {
    return set(set({}, to), from)
}

function setElementProp(element: Node, name: string, value: any, oldValue?: any) {
    if (name === "key") {
    }
    //else if (name === "style") {
    //    for (var i in merge(oldValue, (value = value || {}))) {
    //        (<HTMLElement>element).style[i] = null == value[i] ? "" : value[i]
    //    }
    //}
        else {
        try {
            element[name] = null == value ? "" : value
        } catch (_) { }

        if (!isFunction(value)) {
            if (null == value || false === value) {
                (<HTMLElement>element).removeAttribute(name)
            } else {
                (<HTMLElement>element).setAttribute(name, value)
            }
        }
    }
}

function createElement<Props extends VProps>(callbacks: any[], node: VNodeChild<Props>, isSVG?: boolean): Node {
    if (typeof node === "string") {
        return document.createTextNode(node)
    } else {
        const element = (isSVG = isSVG || node.type === "svg")
            ? document.createElementNS("http://www.w3.org/2000/svg", node.type)
            : document.createElement(node.type)

        if (node.props.oncreate) {
            callbacks.push(() =>
                node.props.oncreate!(element)
            )
        }

        for (var i = 0; i < node.children.length; i++) {
            element.appendChild(createElement(callbacks, <VNode<Props>>node.children[i], isSVG))
        }

        for (var j in node.props) {
            setElementProp(element, j, node.props[j])
        }
        return element
    }
}

function updateElement<Props extends VProps>(callbacks: any[], element: Node, oldProps: Props, props: Props) {
    for (var i in merge(oldProps, props)) {
        var value = props[i]
        var oldValue = i === "value" || i === "checked" ? (<any>element)[i] : oldProps[i]

        if (value !== oldValue) {
            setElementProp(element, i, value, oldValue)
        }
    }

    if (props.onupdate) {
        callbacks.push(() =>
            props.onupdate!(element, oldProps)
        )
    }
}

function removeElement<Props extends VProps>(parent: Node, element: Node, props: Props) {
    function done() {
        parent.removeChild(element)
    }

    if (props && props.onremove) {
        props.onremove(element, done)
    } else {
        done()
    }
}

export function isVNode (vnode: VNodeChild<VProps>) : vnode is VNode<VProps> {
    return (<VNode<VProps>>vnode).type != null;
}

export function patch<Props extends VProps> (
    callbacks: any[],
    parent: Node,
    element: Node,
    oldNode: VNodeChild<Props> | null,
    node: VNodeChild<Props>,
    isSVG?: boolean,
    nextSibling?: Node
)
    : Node
{
    if (oldNode === node) {
    } else if (null == oldNode) {
        element = parent.insertBefore(createElement(callbacks, node, isSVG), element)
    } else if (isVNode (node) && isVNode (oldNode) && node.type === oldNode.type) {
        updateElement(callbacks, element, oldNode.props, node.props)

        isSVG = isSVG || node.type === "svg"

        var len = node.children.length
        var oldLen = oldNode.children.length
        var oldKeyed = {}
        var oldElements = []
        var keyed = {}

        for (var i = 0; i < oldLen; i++) {
            var oldElement = (oldElements[i] = element.childNodes[i])
            var oldChild = <VNode<VProps>>oldNode.children[i]
            var oldKey = getKey(oldChild)

            if (null != oldKey) {
                oldKeyed[oldKey] = [oldElement, oldChild]
            }
        }

        var i = 0
        var j = 0

        while (j < len) {
            var oldElement = oldElements[i]
            var oldChild = <VNode<VProps>>oldNode.children[i]
            var newChild = <VNode<VProps>>node.children[j]

            var oldKey = getKey(oldChild)
            if ((<any>keyed)[oldKey!]) {
                i++
                continue
            }

            var newKey = getKey(newChild)
            var keyedNode = oldKeyed[newKey!] || []

            if (null == newKey) {
                if (null == oldKey) {
                    patch(callbacks, element, oldElement, oldChild, newChild, isSVG)
                    j++
                }
                i++
            } else {
                if (oldKey === newKey) {
                    patch(callbacks, element, keyedNode[0], keyedNode[1], newChild, isSVG)
                    i++
                } else if (keyedNode[0]) {
                    element.insertBefore(keyedNode[0], oldElement)
                    patch(callbacks, element, keyedNode[0], keyedNode[1], newChild, isSVG)
                } else {
                    patch(callbacks, element, oldElement, null, newChild, isSVG)
                }

                j++
                keyed[newKey] = newChild
            }
        }

        while (i < oldLen) {
            var oldChild = <VNode<VProps>>oldNode.children[i]
            var oldKey = getKey(oldChild)
            if (null == oldKey) {
                removeElement(element, oldElements[i], oldChild.props)
            }
            i++
        }

        for (var k in oldKeyed) {
            var keyedNode = oldKeyed[k]
            var reusableNode = keyedNode[1]
            if (!keyed[reusableNode.props.key]) {
                removeElement(element, keyedNode[0], reusableNode.props)
            }
        }
    } else if (element && node !== element.nodeValue) {
        if (typeof node === "string" && typeof oldNode === "string") {
            element.nodeValue = node
        } else {
            element = parent.insertBefore(
                createElement(callbacks, node, isSVG),
                (nextSibling = element)
            )
            removeElement(parent, nextSibling, (<VNode<Props>>oldNode).props)
        }
    }

    return element
}

//export function h<Props extends VProps>
export function hImp<Props extends VProps>
(
    type: StatelessComponent<Props> | string,
    props?: Props,
    children?: VNodeChildren  
)
    : VNode<Props>
{
    var node
    var stack = []
    children = []

    for (var i = arguments.length; i-- > 2;) {
        stack.push(arguments[i])
    }

    while (stack.length) {
        if (Array.isArray((node = stack.pop()))) {
            for (i = node.length; i--;) {
                stack.push(node[i])
            }
        } else if (null == node || node === true || node === false) {
        } else {
            children.push(typeof node === "number" ? (node = node + "") : node)
        }
    }

    return typeof type === "string"
        ? <VNode<Props>>{
            type: type,
            props: props || {},
            children: children
        }
        : <VNode<Props>>type(props || <Props>{}, <any>children)
}

export interface StatelessComponent<Props> {
    (props: Props, children: VNodeChild<{} | null>[]): VNode<{}>
}

export interface VProps {
    key?: string,
    oncreate?: (element: Node, props?: VProps) => void
    onupdate?: (element: Node, props?: VProps) => void
    onremove?: (element: Node, remove: () => void) => void
}

export interface VNode<Props extends VProps> {
    type: string
    props: Props
    children: VNodeChild<{} | null>[]
}

export type VNodeChild<Props> = VNode<Props> | string

export type VNodeChildren =
    | Array<VNodeChild<{} | null> | number | undefined>
    | VNodeChild<{} | null>
    | number