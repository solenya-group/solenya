export type KeyValue = {
    key: string
    value?: string
}

export type PropertyName = string | (() => any)

export function propertyName(name: PropertyName) {
    return typeof(name) == "string" ? name : key (name)
}

export function key (propertyAccess: () => any) {
    return (""+propertyAccess).match (/\.(.*);/)![1]
}

export function fuzzyEquals(x: any, y: any) {
    return (
        x == y ||
        isNullOrEmpty (x) && isNullOrEmpty (y) ||
        (typeof(x) == "string" && typeof(y) == "string" && (parseFloat(x) == parseFloat(y)))
    )
}

export function literal (html: string) {
    return (element: Element) => {element.innerHTML = html}
}

export function parseTyped (s: string|undefined, guideValue: any) {
    if (s == null || guideValue == null)       
        return s
    var type = guideValue.constructor.toString()
    if (type.indexOf ("Number") != -1)
        return parseFloat (s)
    if (type.indexOf ("Boolean") != -1)
        return Boolean (s)
    return s
}

export function Let<T, U>(obj: T, op: (x: T) => U) {
    return op(obj)
}

export function isNullOrEmpty (s?: string | null) {
    return s == null || s === ''
}