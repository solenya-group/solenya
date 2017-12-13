export type KeyValue = {
    key: string
    value?: string
}

export type PropertyName = string | (() => any)

export const propertyName = (name: PropertyName) =>
    typeof(name) == "string" ? name : key (name)

export const key = (propertyAccess: () => any) =>
    (""+propertyAccess).match (/\.(.*);/)![1]

export const fuzzyEquals = (x: any, y: any) =>
    x == y ||
    isNullOrEmpty (x) && isNullOrEmpty (y) ||
    (typeof(x) == "string" && typeof(y) == "string" && (parseFloat(x) == parseFloat(y)))

export const literal = (html: string) =>
    (element: Element) => {element.innerHTML = html};

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

export const Let = <T, U>(obj: T, op: (x: T) => U) =>
    op(obj)

export const isNullOrEmpty = (s?:string|null) =>
    s == null || s === ''

export type CssType = string|null|undefined

export const css = (...classes: CssType[]) =>
    ({
        class : classes.filter (c => ! isNullOrEmpty (c)).join(" ")
    })