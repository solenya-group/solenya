import 'reflect-metadata'
import { PropertyRef } from '.';
import { getPropertyKey } from './widgets';

export function key (propertyAccess: () => any) {
    return (""+propertyAccess).match (/\.([a-zA-Z_$][0-9a-zA-Z_$]*)[^\.]*$/)![1]
}

export function equalsIgnoreCase(a: string, b: string) {
    if (a == b) return true
    if (a == null || b == null) return false
    return a.toLowerCase() == b.toLowerCase()
}

export function fuzzyEquals(x: any, y: any) {
    return (
        x == y ||
        isNullOrEmpty (x) && isNullOrEmpty (y) ||
        (typeof(x) == "string" && typeof(y) == "string" && (parseFloat(x) == parseFloat(y)))
    )
}

export const parseFloatDeNaN = (s: string) =>
    Let (parseFloat (s), n => isNaN (n) ? undefined : n)

export function literal (html: string) {
    return (element: Element) => {element.innerHTML = html}
}

export function Let<T, U>(obj: T, op: (x: T) => U) {
    return op(obj)
}

export function isNullOrEmpty (s?: string | null) {
    return s == null || s === ''
}

export function NonData() {
    return Reflect.metadata("nonData", true);
}

export function isNonData(target: any, propertyKey: string) {    
    return Reflect.getMetadata("nonData", target, propertyKey);
}

export function Label (s: string) {
    return Reflect.metadata("label", s);
}

export function getLabel(target: any, propertyKey: string) {
    return Reflect.getMetadata("label", target, propertyKey) as string|undefined
}

export const humanizeIdentifier = (str: string) =>
  str
    .replace (/[a-z][A-Z]/g, x => "" + x[0] + " " + x[1])
    .replace (/_[a-z]/g, x => " " + x.slice(1).toUpperCase())
    .replace (/^./, x => x.toUpperCase())