import 'reflect-metadata'

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
    var type = guessPrimitiveType (guideValue)
    if (type == "number")
        return parseFloat (s)
    if (type == "boolean")
        return s == "true"
    return s
}

export function Let<T, U>(obj: T, op: (x: T) => U) {
    return op(obj)
}

export function isNullOrEmpty (s?: string | null) {
    return s == null || s === ''
}

// needed to work on ie
export function guessPrimitiveType (value: any)
{
    if (value === undefined)
        return "undefined"
    if (value === null)
        return "null"
    var type = value.constructor.toString()
    if (type.indexOf ("Number") != -1)
        return "number"
    if (type.indexOf ("Boolean") != -1)
        return "boolean"
    return "string"
}

export function Num() {
    return Reflect.metadata("num", true);
}

export function getNum(target: any, propertyKey: string) {
    return Reflect.getMetadata("num", target, propertyKey);
}

export function ensureFieldsNums (obj: object) {
    for (var x of Object.keys(obj))
        if (getNum(obj, x)) {
            const n = obj[x]
            obj[x] = n == null ? NaN : parseFloat (n)
        }
}