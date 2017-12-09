export type KeyValue = {
    key: string;
    value: string
}

export type PropertyName = string | (() => any)

export const propertyName = (name: PropertyName) =>
    typeof(name) == "string" ? name : key (name)

export const key = (propertyAccess: () => any) =>
    (""+propertyAccess).match (/\.(.*);/)![1]

export const fuzzyEquals = (x: any, y: any) =>
    x == y || (typeof(x) == "string" && parseFloat(x) == parseFloat(y))

export const literal = (html: string) =>
    (element: Element) => {element.innerHTML = html};

export const parseTyped = (s: string, guideValue: any) =>
    guideValue.constructor.toString().indexOf ("Number") != -1 ? parseFloat (s) :
    guideValue.constructor.toString().indexOf ("Boolean") != -1 ? Boolean (s) :
    s;

export const Let = <T, U>(obj: T, op: (x: T) => U) =>
    op(obj)

export const isNullOrEmpty = (s?:string|null) =>
    s === null || s === ''

export type CssType = string|null|undefined

export const css = (...classes: CssType[]) =>
    ({
        class : classes.filter (c => ! isNullOrEmpty (c)).join(" ")
    })