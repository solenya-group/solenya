import { createVElement, VElement, VAttributes, VNode, VLifecycle, isVElement, merge } from './dom'
import { combineLifecycles } from './lifecycle'
import { style, types } from 'typestyle'

export interface HProps extends VAttributes, HAttributes {
    [key: string] : any
}

export type HValue = VNode | HProps | null | undefined

function typeStyleize (props?: HProps) {        
    if (props && typeof (props.style) === 'object') {
        props.class = ! props.class ?
            style (props.style) :
            props.class + " " + style (props.style)
        props.style = undefined
    }
}

export function combineAttrs (dominant: HProps | undefined, recessive: HProps | undefined) {
    return combineAttrsMutate ({...dominant}, {...recessive})
}

function combineAttrsMutate (dominant: HProps|undefined, recessive: HProps|undefined)
{    
    typeStyleize (dominant)
    typeStyleize (recessive)            

    if (! dominant)
        return recessive
    else if (! recessive)
        return dominant
    
    if (dominant.class && recessive.class)
        dominant.class = dominant.class + " " + recessive.class

    dominant = combineLifecycles (dominant, recessive)
    dominant = <HAttributes & VLifecycle> merge (dominant, recessive)                                 

    return dominant
}

function isAttribute (a?: any): a is HAttributes & VLifecycle {    
    return a != null && typeof a == "object" && ! isVElement(<any>a) && ! Array.isArray(a)
}

export function h (tag: string, ...values: HValue[]): VElement
{
    var attributes: HProps | undefined
    while (values.length > 0) {
        var head = values[0]        
        if (isAttribute (head)) {
            attributes = combineAttrsMutate (attributes, head)
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
    height?: string | number
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
    width?: string | number
    wrap?: string    

    onabort?: (ev:UIEvent) => any
    onanimationcancel?: (ev:AnimationEvent) => any
    onanimationend?: (ev:AnimationEvent) => any
    onanimationiteration?: (ev:AnimationEvent) => any
    onanimationstart?: (ev:AnimationEvent) => any
    onauxclick?: (ev:Event) => any
    /**
     * Fires when the object loses the input focus.
     * @param ev The focus event.
     */
    onblur?: (ev:FocusEvent) => any
    oncancel?: (ev:Event) => any
    /**
     * Occurs when playback is possible, but would require further buffering.
     * @param ev The event.
     */
    oncanplay?: (ev:Event) => any
    oncanplaythrough?: (ev:Event) => any
    /**
     * Fires when the contents of the object or selection have changed.
     * @param ev The event.
     */
    onchange?: (ev:Event) => any
    /**
     * Fires when the user clicks the left mouse button on the object
     * @param ev The mouse event.
     */
    onclick?: (ev:MouseEvent) => any
    onclose?: (ev:Event) => any
    /**
     * Fires when the user clicks the right mouse button in the client area, opening the context menu.
     * @param ev The mouse event.
     */
    oncontextmenu?: (ev:MouseEvent) => any
    oncuechange?: (ev:Event) => any
    /**
     * Fires when the user double-clicks the object.
     * @param ev The mouse event.
     */
    ondblclick?: (ev:MouseEvent) => any
    /**
     * Fires on the source object continuously during a drag operation.
     * @param ev The event.
     */
    ondrag?: (ev:DragEvent) => any
    /**
     * Fires on the source object when the user releases the mouse at the close of a drag operation.
     * @param ev The event.
     */
    ondragend?: (ev:DragEvent) => any
    /**
     * Fires on the target element when the user drags the object to a valid drop target.
     * @param ev The drag event.
     */
    ondragenter?: (ev:DragEvent) => any
    ondragexit?: (ev:Event) => any
    /**
     * Fires on the target object when the user moves the mouse out of a valid drop target during a drag operation.
     * @param ev The drag event.
     */
    ondragleave?: (ev:DragEvent) => any
    /**
     * Fires on the target element continuously while the user drags the object over a valid drop target.
     * @param ev The event.
     */
    ondragover?: (ev:DragEvent) => any
    /**
     * Fires on the source object when the user starts to drag a text selection or selected object.
     * @param ev The event.
     */
    ondragstart?: (ev:DragEvent) => any
    ondrop?: (ev:DragEvent) => any
    /**
     * Occurs when the duration attribute is updated.
     * @param ev The event.
     */
    ondurationchange?: (ev:Event) => any
    /**
     * Occurs when the media element is reset to its initial state.
     * @param ev The event.
     */
    onemptied?: (ev:Event) => any
    /**
     * Occurs when the end of playback is reached.
     * @param ev The event
     */
    onended?: (ev:Event) => any
    /**
     * Fires when the object receives focus.
     * @param ev The event.
     */
    onfocus?: (ev:FocusEvent) => any
    ongotpointercapture?: (ev:PointerEvent) => any
    oninput?: (ev:Event) => any
    oninvalid?: (ev:Event) => any
    /**
     * Fires when the user presses a key.
     * @param ev The keyboard event
     */
    onkeydown?: (ev:KeyboardEvent) => any
    /**
     * Fires when the user presses an alphanumeric key.
     * @param ev The event.
     */
    onkeypress?: (ev:KeyboardEvent) => any
    /**
     * Fires when the user releases a key.
     * @param ev The keyboard event
     */
    onkeyup?: (ev:KeyboardEvent) => any
    /**
     * Fires immediately after the browser loads the object.
     * @param ev The event.
     */
    onload?: (ev:Event) => any
    /**
     * Occurs when media data is loaded at the current playback position.
     * @param ev The event.
     */
    onloadeddata?: (ev:Event) => any
    /**
     * Occurs when the duration and dimensions of the media have been determined.
     * @param ev The event.
     */
    onloadedmetadata?: (ev:Event) => any
    onloadend?: (ev:ProgressEvent) => any
    /**
     * Occurs when Internet Explorer begins looking for media data.
     * @param ev The event.
     */
    onloadstart?: (ev:Event) => any
    onlostpointercapture?: (ev:PointerEvent) => any
    /**
     * Fires when the user clicks the object with either mouse button.
     * @param ev The mouse event.
     */
    onmousedown?: (ev:MouseEvent) => any
    onmouseenter?: (ev:MouseEvent) => any
    onmouseleave?: (ev:MouseEvent) => any
    /**
     * Fires when the user moves the mouse over the object.
     * @param ev The mouse event.
     */
    onmousemove?: (ev:MouseEvent) => any
    /**
     * Fires when the user moves the mouse pointer outside the boundaries of the object.
     * @param ev The mouse event.
     */
    onmouseout?: (ev:MouseEvent) => any
    /**
     * Fires when the user moves the mouse pointer into the object.
     * @param ev The mouse event.
     */
    onmouseover?: (ev:MouseEvent) => any
    /**
     * Fires when the user releases a mouse button while the mouse is over the object.
     * @param ev The mouse event.
     */
    onmouseup?: (ev:MouseEvent) => any
    /**
     * Occurs when playback is paused.
     * @param ev The event.
     */
    onpause?: (ev:Event) => any
    /**
     * Occurs when the play method is requested.
     * @param ev The event.
     */
    onplay?: (ev:Event) => any
    /**
     * Occurs when the audio or video has started playing.
     * @param ev The event.
     */
    onplaying?: (ev:Event) => any
    onpointercancel?: (ev:PointerEvent) => any
    onpointerdown?: (ev:PointerEvent) => any
    onpointerenter?: (ev:PointerEvent) => any
    onpointerleave?: (ev:PointerEvent) => any
    onpointermove?: (ev:PointerEvent) => any
    onpointerout?: (ev:PointerEvent) => any
    onpointerover?: (ev:PointerEvent) => any
    onpointerup?: (ev:PointerEvent) => any
    /**
     * Occurs to indicate progress while downloading media data.
     * @param ev The event.
     */
    onprogress?: (ev:ProgressEvent) => any
    /**
     * Occurs when the playback rate is increased or decreased.
     * @param ev The event.
     */
    onratechange?: (ev:Event) => any
    /**
     * Fires when the user resets a form.
     * @param ev The event.
     */
    onreset?: (ev:Event) => any
    onresize?: (ev:UIEvent) => any
    /**
     * Fires when the user repositions the scroll box in the scroll bar on the object.
     * @param ev The event.
     */
    onscroll?: (ev:UIEvent) => any
    onsecuritypolicyviolation?: (ev:SecurityPolicyViolationEvent) => any
    /**
     * Occurs when the seek operation ends.
     * @param ev The event.
     */
    onseeked?: (ev:Event) => any
    /**
     * Occurs when the current playback position is moved.
     * @param ev The event.
     */
    onseeking?: (ev:Event) => any
    /**
     * Fires when the current selection changes.
     * @param ev The event.
     */
    onselect?: (ev:UIEvent) => any
    /**
     * Occurs when the download has stopped.
     * @param ev The event.
     */
    onstalled?: (ev:Event) => any
    onsubmit?: (ev:Event) => any
    /**
     * Occurs if the load operation has been intentionally halted.
     * @param ev The event.
     */
    onsuspend?: (ev:Event) => any
    /**
     * Occurs to indicate the current playback position.
     * @param ev The event.
     */
    ontimeupdate?: (ev:Event) => any
    ontoggle?: (ev:Event) => any
    ontouchcancel?: (ev:TouchEvent) => any
    ontouchend?: (ev:TouchEvent) => any
    ontouchmove?: (ev:TouchEvent) => any
    ontouchstart?: (ev:TouchEvent) => any
    ontransitioncancel?: (ev:TransitionEvent) => any
    ontransitionend?: (ev:TransitionEvent) => any
    ontransitionrun?: (ev:TransitionEvent) => any
    ontransitionstart?: (ev:TransitionEvent) => any
    /**
     * Occurs when the volume is changed, or playback is muted or unmuted.
     * @param ev The event.
     */
    onvolumechange?: (ev:Event) => any
    /**
     * Occurs when playback stops because the next frame of a video resource is not available.
     * @param ev The event.
     */
    onwaiting?: (ev:Event) => any
    onwheel?: (ev:WheelEvent) => any
}