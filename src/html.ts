import { createVElement, VElement, VAttributes, VNode, VLifecycle, isVElement, merge } from './dom'
import { combineLifecycles } from './lifecycle'
import { style, types } from 'typestyle'

export interface HProps extends VAttributes, HAttributes {
    [key: string] : any
}

export type HValue = VNode | HProps | null | undefined

function combineStyles (attributes: any, head: any)
{
    const existingCss = attributes && attributes['class']
    const headCss = head['class']    
    let css = (existingCss && headCss) ? (existingCss + ' ' +headCss) : existingCss || headCss

    const headStyle = head["style"]

    if (headStyle && typeof (headStyle) != 'string') {
        css = ! css ? style (headStyle) : css + " " + style (headStyle)
        head["style"] = undefined
    }
    if (css) {
        if (attributes)
            attributes["class"] = css
        else
            head["class"] = css
    }
}

export function h (tag: string, ...values: HValue[]): VElement
{
    var attributes = null
    while (values.length > 0) {
        var head = values[0]        
        if (head != null && typeof head == "object" && ! isVElement(<any>head) && ! Array.isArray(head))
        {
            combineStyles (attributes, head)
            if (! attributes)
                attributes = head            
            else {
                combineLifecycles (attributes, <VLifecycle>head)                
                attributes = merge (attributes, head)           
            }                   
            values = values.slice(1)
        }
        else
            break
    }

    return createVElement(tag, attributes || {}, ...values)        
}

export function a(...values: HValue[]) {
    return h("a", ...values)
}

export function abbr(...values: HValue[]) {
    return h("abbr", ...values)
}

export function address(...values: HValue[]) {
    return h("address", ...values)
}

export function area(...values: HValue[]) {
    return h("area", ...values)
}

export function article(...values: HValue[]) {
    return h("article", ...values)
}

export function aside(...values: HValue[]) {
    return h("aside", ...values)
}

export function audio(...values: HValue[]) {
    return h("audio", ...values)
}

export function b(...values: HValue[]) {
    return h("b", ...values)
}

export function bdi(...values: HValue[]) {
    return h("bdi", ...values)
}

export function bdo(...values: HValue[]) {
    return h("bdo", ...values)
}

export function blockquote(...values: HValue[]) {
    return h("blockquote", ...values)
}

export function br(...values: HValue[]) {
    return h("br", ...values)
}

export function button(...values: HValue[]) {
    return h("button", ...values)
}

export function canvas(...values: HValue[]) {
    return h("canvas", ...values)
}

export function caption(...values: HValue[]) {
    return h("caption", ...values)
}

export function cite(...values: HValue[]) {
    return h("cite", ...values)
}

export function code(...values: HValue[]) {
    return h("code", ...values)
}

export function col(...values: HValue[]) {
    return h("col", ...values)
}

export function colgroup(...values: HValue[]) {
    return h("colgroup", ...values)
}

export function data(...values: HValue[]) {
    return h("data", ...values)
}

export function datalist(...values: HValue[]) {
    return h("datalist", ...values)
}

export function dd(...values: HValue[]) {
    return h("dd", ...values)
}

export function del(...values: HValue[]) {
    return h("del", ...values)
}

export function details(...values: HValue[]) {
    return h("details", ...values)
}

export function dfn(...values: HValue[]) {
    return h("dfn", ...values)
}

export function dialog(...values: HValue[]) {
    return h("dialog", ...values)
}

export function div(...values: HValue[]) {
    return h("div", ...values)
}

export function dl(...values: HValue[]) {
    return h("dl", ...values)
}

export function dt(...values: HValue[]) {
    return h("dt", ...values)
}

export function em(...values: HValue[]) {
    return h("em", ...values)
}

export function embed(...values: HValue[]) {
    return h("embed", ...values)
}

export function fieldset(...values: HValue[]) {
    return h("fieldset", ...values)
}

export function figcaption(...values: HValue[]) {
    return h("figcaption", ...values)
}

export function figure(...values: HValue[]) {
    return h("figure", ...values)
}

export function footer(...values: HValue[]) {
    return h("footer", ...values)
}

export function form(...values: HValue[]) {
    return h("form", ...values)
}

export function h1(...values: HValue[]) {
    return h("h1", ...values)
}

export function h2(...values: HValue[]) {
    return h("h2", ...values)
}

export function h3(...values: HValue[]) {
    return h("h3", ...values)
}

export function h4(...values: HValue[]) {
    return h("h4", ...values)
}

export function h5(...values: HValue[]) {
    return h("h5", ...values)
}

export function h6(...values: HValue[]) {
    return h("h6", ...values)
}

export function header(...values: HValue[]) {
    return h("header", ...values)
}

export function hr(...values: HValue[]) {
    return h("hr", ...values)
}

export function i(...values: HValue[]) {
    return h("i", ...values)
}

export function iframe(...values: HValue[]) {
    return h("iframe", ...values)
}

export function img(...values: HValue[]) {
    return h("img", ...values)
}

export function input(...values: HValue[]) {
    return h("input", ...values)
}

export function ins(...values: HValue[]) {
    return h("ins", ...values)
}

export function kbd(...values: HValue[]) {
    return h("kbd", ...values)
}

export function label(...values: HValue[]) {
    return h("label", ...values)
}

export function legend(...values: HValue[]) {
    return h("legend", ...values)
}

export function li(...values: HValue[]) {
    return h("li", ...values)
}

export function main(...values: HValue[]) {
    return h("main", ...values)
}

export function map(...values: HValue[]) {
    return h("map", ...values)
}

export function mark(...values: HValue[]) {
    return h("mark", ...values)
}

export function menu(...values: HValue[]) {
    return h("menu", ...values)
}

export function menuitem(...values: HValue[]) {
    return h("menuitem", ...values)
}

export function meter(...values: HValue[]) {
    return h("meter", ...values)
}

export function nav(...values: HValue[]) {
    return h("nav", ...values)
}

export function object(...values: HValue[]) {
    return h("object", ...values)
}

export function ol(...values: HValue[]) {
    return h("ol", ...values)
}

export function optgroup(...values: HValue[]) {
    return h("optgroup", ...values)
}

export function option(...values: HValue[]) {
    return h("option", ...values)
}

export function output(...values: HValue[]) {
    return h("output", ...values)
}

export function p(...values: HValue[]) {
    return h("p", ...values)
}

export function param(...values: HValue[]) {
    return h("param", ...values)
}

export function pre(...values: HValue[]) {
    return h("pre", ...values)
}

export function progress(...values: HValue[]) {
    return h("progress", ...values)
}

export function q(...values: HValue[]) {
    return h("q", ...values)
}

export function rp(...values: HValue[]) {
    return h("rp", ...values)
}

export function rt(...values: HValue[]) {
    return h("rt", ...values)
}

export function rtc(...values: HValue[]) {
    return h("rtc", ...values)
}

export function ruby(...values: HValue[]) {
    return h("ruby", ...values)
}

export function s(...values: HValue[]) {
    return h("s", ...values)
}

export function samp(...values: HValue[]) {
    return h("samp", ...values)
}

export function section(...values: HValue[]) {
    return h("section", ...values)
}

export function select(...values: HValue[]) {
    return h("select", ...values)
}

export function small(...values: HValue[]) {
    return h("small", ...values)
}

export function source(...values: HValue[]) {
    return h("source", ...values)
}

export function span(...values: HValue[]) {
    return h("span", ...values)
}

export function strong(...values: HValue[]) {
    return h("strong", ...values)
}

export function sub(...values: HValue[]) {
    return h("sub", ...values)
}

export function summary(...values: HValue[]) {
    return h("summary", ...values)
}

export function sup(...values: HValue[]) {
    return h("sup", ...values)
}

export function svg(...values: HValue[]) {
    return h("svg", ...values)
}

export function table(...values: HValue[]) {
    return h("table", ...values)
}

export function tbody(...values: HValue[]) {
    return h("tbody", ...values)
}

export function td(...values: HValue[]) {
    return h("td", ...values)
}

export function textarea(...values: HValue[]) {
    return h("textarea", ...values)
}

export function tfoot(...values: HValue[]) {
    return h("tfoot", ...values)
}

export function th(...values: HValue[]) {
    return h("th", ...values)
}

export function thead(...values: HValue[]) {
    return h("thead", ...values)
}

export function time(...values: HValue[]) {
    return h("time", ...values)
}

export function tr(...values: HValue[]) {
    return h("tr", ...values)
}

export function track(...values: HValue[]) {
    return h("track", ...values)
}

export function u(...values: HValue[]) {
    return h("u", ...values)
}

export function ul(...values: HValue[]) {
    return h("ul", ...values)
}

export function video(...values: HValue[]) {
    return h("video", ...values)
}

export function vvar(...values: HValue[]) {
    return h("vvar", ...values)
}

export function wbr(...values: HValue[]) {
    return h("wbr", ...values)
}

export interface HAttributes {
    accept?: string
    accesskey?: string
    action?: string
    align?: string
    alt?: string
    async?: string
    autocapitalize?: string
    autocomplete?: string
    autofocus?: string
    autoplay?: string
    bgcolor?: string
    border?: string
    buffered?: string
    challenge?: string
    charset?: string
    checked?: string
    cite?: string
    class?: string
    code?: string
    codebase?: string
    color?: string
    cols?: number
    colspan?: number
    content?: string
    contenteditable?: string
    contextmenu?: string
    controls?: string
    coords?: string
    crossorigin?: string
    data?: string
    datetime?: string
    default?: string
    defer?: string
    dir?: string
    dirname?: string
    disabled?: string
    download?: string
    draggable?: string
    dropzone?: string
    enctype?: string
    for?: string
    form?: string
    formaction?: string
    headers?: string
    height?: number
    hidden?: string
    high?: number
    href?: string
    hreflang?: string
    http?: string
    icon?: string
    id?: string
    integrity?: string
    ismap?: string
    itemprop?: string
    keytype?: string
    kind?: string
    label?: string
    lang?: string
    language?: string
    list?: string
    loop?: string
    low?: number
    manifest?: string
    max?: number
    maxlength?: number
    minlength?: number
    media?: string
    method?: string
    min?: number
    multiple?: string
    muted?: string
    name?: string
    novalidate?: string
    open?: string
    optimum?: string
    pattern?: string
    ping?: string
    placeholder?: string
    poster?: string
    preload?: string
    radiogroup?: string
    readonly?: string
    rel?: string
    required?: string
    reversed?: string
    rows?: number
    rowspan?: number
    sandbox?: string
    scope?: string
    scoped?: string
    seamless?: string
    selected?: string
    shape?: string
    size?: number
    sizes?: string
    slot?: string
    span?: string
    spellcheck?: string
    src?: string
    srcdoc?: string
    srclang?: string
    srcset?: string
    start?: string
    step?: number
    style?: string | types.NestedCSSProperties
    summary?: string
    tabindex?: number
    target?: string
    title?: string
    type?: string
    usemap?: string
    value?: string | number
    width?: number
    wrap?: string
}