import { createVElement, VElement, isVElement, merge } from './dom'

export function h (tag: string, ...values: any[]): VElement
{
    var attributes = {}
    while (values.length > 0) {
        var head = values[0]        
        if (head != null && typeof head == "object" && ! isVElement(head) && ! Array.isArray(head)) {
            attributes = merge (attributes, head)
            values = values.slice(1)
        }
        else
            break
    }

    return createVElement (tag, attributes, ...values)        
}

export function a(...values: any[]) {
    return h("a", ...values)
}

export function abbr(...values: any[]) {
    return h("abbr", ...values)
}

export function address(...values: any[]) {
    return h("address", ...values)
}

export function area(...values: any[]) {
    return h("area", ...values)
}

export function article(...values: any[]) {
    return h("article", ...values)
}

export function aside(...values: any[]) {
    return h("aside", ...values)
}

export function audio(...values: any[]) {
    return h("audio", ...values)
}

export function b(...values: any[]) {
    return h("b", ...values)
}

export function bdi(...values: any[]) {
    return h("bdi", ...values)
}

export function bdo(...values: any[]) {
    return h("bdo", ...values)
}

export function blockquote(...values: any[]) {
    return h("blockquote", ...values)
}

export function br(...values: any[]) {
    return h("br", ...values)
}

export function button(...values: any[]) {
    return h("button", ...values)
}

export function canvas(...values: any[]) {
    return h("canvas", ...values)
}

export function caption(...values: any[]) {
    return h("caption", ...values)
}

export function cite(...values: any[]) {
    return h("cite", ...values)
}

export function code(...values: any[]) {
    return h("code", ...values)
}

export function col(...values: any[]) {
    return h("col", ...values)
}

export function colgroup(...values: any[]) {
    return h("colgroup", ...values)
}

export function data(...values: any[]) {
    return h("data", ...values)
}

export function datalist(...values: any[]) {
    return h("datalist", ...values)
}

export function dd(...values: any[]) {
    return h("dd", ...values)
}

export function del(...values: any[]) {
    return h("del", ...values)
}

export function details(...values: any[]) {
    return h("details", ...values)
}

export function dfn(...values: any[]) {
    return h("dfn", ...values)
}

export function dialog(...values: any[]) {
    return h("dialog", ...values)
}

export function div(...values: any[]) {
    return h("div", ...values)
}

export function dl(...values: any[]) {
    return h("dl", ...values)
}

export function dt(...values: any[]) {
    return h("dt", ...values)
}

export function em(...values: any[]) {
    return h("em", ...values)
}

export function embed(...values: any[]) {
    return h("embed", ...values)
}

export function fieldset(...values: any[]) {
    return h("fieldset", ...values)
}

export function figcaption(...values: any[]) {
    return h("figcaption", ...values)
}

export function figure(...values: any[]) {
    return h("figure", ...values)
}

export function footer(...values: any[]) {
    return h("footer", ...values)
}

export function form(...values: any[]) {
    return h("form", ...values)
}

export function h1(...values: any[]) {
    return h("h1", ...values)
}

export function h2(...values: any[]) {
    return h("h2", ...values)
}

export function h3(...values: any[]) {
    return h("h3", ...values)
}

export function h4(...values: any[]) {
    return h("h4", ...values)
}

export function h5(...values: any[]) {
    return h("h5", ...values)
}

export function h6(...values: any[]) {
    return h("h6", ...values)
}

export function header(...values: any[]) {
    return h("header", ...values)
}

export function hr(...values: any[]) {
    return h("hr", ...values)
}

export function i(...values: any[]) {
    return h("i", ...values)
}

export function img(...values: any[]) {
    return h("img", ...values)
}

export function input(...values: any[]) {
    return h("input", ...values)
}

export function ins(...values: any[]) {
    return h("ins", ...values)
}

export function kbd(...values: any[]) {
    return h("kbd", ...values)
}

export function label(...values: any[]) {
    return h("label", ...values)
}

export function legend(...values: any[]) {
    return h("legend", ...values)
}

export function li(...values: any[]) {
    return h("li", ...values)
}

export function main(...values: any[]) {
    return h("main", ...values)
}

export function map(...values: any[]) {
    return h("map", ...values)
}

export function mark(...values: any[]) {
    return h("mark", ...values)
}

export function menu(...values: any[]) {
    return h("menu", ...values)
}

export function menuitem(...values: any[]) {
    return h("menuitem", ...values)
}

export function meter(...values: any[]) {
    return h("meter", ...values)
}

export function nav(...values: any[]) {
    return h("nav", ...values)
}

export function object(...values: any[]) {
    return h("object", ...values)
}

export function ol(...values: any[]) {
    return h("ol", ...values)
}

export function optgroup(...values: any[]) {
    return h("optgroup", ...values)
}

export function option(...values: any[]) {
    return h("option", ...values)
}

export function output(...values: any[]) {
    return h("output", ...values)
}

export function p(...values: any[]) {
    return h("p", ...values)
}

export function param(...values: any[]) {
    return h("param", ...values)
}

export function pre(...values: any[]) {
    return h("pre", ...values)
}

export function progress(...values: any[]) {
    return h("progress", ...values)
}

export function q(...values: any[]) {
    return h("q", ...values)
}

export function rp(...values: any[]) {
    return h("rp", ...values)
}

export function rt(...values: any[]) {
    return h("rt", ...values)
}

export function rtc(...values: any[]) {
    return h("rtc", ...values)
}

export function ruby(...values: any[]) {
    return h("ruby", ...values)
}

export function s(...values: any[]) {
    return h("s", ...values)
}

export function samp(...values: any[]) {
    return h("samp", ...values)
}

export function section(...values: any[]) {
    return h("section", ...values)
}

export function select(...values: any[]) {
    return h("select", ...values)
}

export function small(...values: any[]) {
    return h("small", ...values)
}

export function source(...values: any[]) {
    return h("source", ...values)
}

export function span(...values: any[]) {
    return h("span", ...values)
}

export function strong(...values: any[]) {
    return h("strong", ...values)
}

export function sub(...values: any[]) {
    return h("sub", ...values)
}

export function summary(...values: any[]) {
    return h("summary", ...values)
}

export function sup(...values: any[]) {
    return h("sup", ...values)
}

export function svg(...values: any[]) {
    return h("svg", ...values)
}

export function table(...values: any[]) {
    return h("table", ...values)
}

export function tbody(...values: any[]) {
    return h("tbody", ...values)
}

export function td(...values: any[]) {
    return h("td", ...values)
}

export function textarea(...values: any[]) {
    return h("textarea", ...values)
}

export function tfoot(...values: any[]) {
    return h("tfoot", ...values)
}

export function th(...values: any[]) {
    return h("th", ...values)
}

export function thead(...values: any[]) {
    return h("thead", ...values)
}

export function time(...values: any[]) {
    return h("time", ...values)
}

export function tr(...values: any[]) {
    return h("tr", ...values)
}

export function track(...values: any[]) {
    return h("track", ...values)
}

export function u(...values: any[]) {
    return h("u", ...values)
}

export function ul(...values: any[]) {
    return h("ul", ...values)
}

export function video(...values: any[]) {
    return h("video", ...values)
}

export function vvar(...values: any[]) {
    return h("vvar", ...values)
}

export function wbr(...values: any[]) {
    return h("wbr", ...values)
}