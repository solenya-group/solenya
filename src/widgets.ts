import { Component } from './component'
import { a, div, HAttributes, HValue, input, label, mergeAttrs, option, select, textarea } from './html'
import { fuzzyEquals, getLabel, humanizeIdentifier, key, parseFloatDeNaN, isNullOrEmpty } from './util'

export type PropertyRef<T> = string | (() => T)

export const commandLink = (...values: HValue[]) =>
    a ({ href: "javascript:;"}, ...values)

export const getPropertyKey = <T> (prop: PropertyRef<T>) =>
    typeof (prop) == "string" ? prop: key (prop)

export const getPropertyValue = <T> (obj: any, prop: PropertyRef<T>) =>
    obj [getPropertyKey (prop)]

export const setPropertyValue = <T> (obj: any, prop: PropertyRef<T>, value: T) =>
{    
    const key = getPropertyKey (prop)
    if (obj instanceof Component)
        obj.update (() => { obj[key] = value }, {key, value})
    else
        obj[key] = value
}

export const getBoundValue = <T> (binding: DatabindProps<T>) =>
    getPropertyValue (binding.target, binding.prop)

export const setBoundValue = <T> (binding: DatabindProps<T>, value: T) =>
    setPropertyValue (binding.target, binding.prop, value)

export const typeify = <T extends string|number|undefined> (guideValue: any, strValue: string) =>
    <T><any> (typeof(guideValue) == "number" ? parseFloatDeNaN (strValue) : strValue)

export const getFriendlyName = <T> (obj: any, prop: PropertyRef<T>) => {
    const k = getPropertyKey (prop)
    return getLabel (obj, k) || humanizeIdentifier (k)
}

/** Merges multiple objects, where nested objects with properties ending with the word "attrs" are merged using
 * the mergeAttrs function */
export const mergeNestedAttrs = <T> (...objs: Partial<T>[]) => {    
    const newObj = {}
    for (var obj of objs)
        for (var k of Object.keys (obj))
            if (newObj[k] == null)
                newObj[k] = obj[k]
            else if (/[aA]ttrs/.test (k))
                newObj[k] = mergeAttrs (newObj[k], obj[k])            
    return <T> newObj
}

export interface StringBinding<T>
{   
    inputStringToModel : (inputString: string, prevModel: T) => T
    modelToInputString : (model: T, prevInputString: string) => string    
}

export interface InputValueProps<T> extends StringBinding<T>, InputProps<T> {}

export interface DatabindProps<T> {
    target: Component,
    prop: PropertyRef<T>, 
}

export interface InputProps<T> extends DatabindProps<T>
{    
    attrs?: HAttributes
}

export const inputValue = <T extends string|number|undefined> (props: InputValueProps<T>) =>
    input ({
        value: props.modelToInputString (getBoundValue (props), ""),
        oninput: e =>
            setBoundValue (props, 
                props.inputStringToModel (
                    (<HTMLInputElement>e.target).value,
                    getBoundValue (props)
                )
        ),
        onUpdated: (el: HTMLInputElement) =>
            el.value = props.modelToInputString (getBoundValue (props), el.value)
        },
        props.attrs
    )  

export interface InputEditorProps<T> extends InputProps<T> {}

export const inputText = (props: InputEditorProps<string|undefined>) =>
    inputValue ({
        ...props,
        inputStringToModel: s => s,
        modelToInputString: (s, prevS) => s || ""
    })

export const inputNumber = (props: InputEditorProps<number|undefined>) =>
    inputValue ({
        ...props,
        inputStringToModel: inputStringToNumber,
        modelToInputString: numberToInputString,
    })   

export function inputStringToNumber (s: string, prevNumber: number|undefined) : number|undefined { 
    return parseFloatDeNaN (s)
}

export function numberToInputString (n: number|undefined, prevInputString: string) : string {
    if ("" + n == "NaN" || n == null) {
        if (new RegExp ("^[+-.]$").test (prevInputString))
            return prevInputString
        return ""
    }
    if (parseFloat(prevInputString) == n && new RegExp("^[+-]?([0-9]*[.])?[0-9]*$").test (prevInputString))
        return prevInputString
    return "" + n
}

export interface InputRangeProps extends InputProps<number> {}

export const inputRange = (props: InputRangeProps) =>
{
    const onchange = (e: Event) => setBoundValue (props, parseFloatDeNaN ((<HTMLInputElement>e.target).value))

    return input ({
        type: "range",           
        value: getBoundValue (props),
        oninput: onchange,
        onchange: onchange,
        onUpdated: (el: HTMLInputElement) => { el.value = getBoundValue (props) }
    },
        props.attrs
    )
}

export interface SelectorProps<T> extends InputProps<T> {
    options?: SelectOption<T>[]
    hasEmpty?: boolean,
    prefix?: string,
    selectedClass?: string
}

export interface SelectOption<T> {
    value: T
    label: HValue,
    attrs?: HAttributes    
}

export function selector<T extends string|number|undefined> (
    props: SelectorProps<T>  
)
{
    const options = props.options || []
    const value = getBoundValue (props)
    const allOptions = ! props.hasEmpty ? options : [<SelectOption<T>>{value: undefined, label: ""}, ...options]
    const id = prefixId (props.prefix, getPropertyKey(props.prop))
    const guideValue = ! options.length ? undefined : options[options.length-1].value

    return (
        select ({
            type: "select",
            name : id,
            id : id,
            onchange: e => setBoundValue (props, typeify<T> (guideValue, (<any>e.target).value))
        },
            props.attrs,
            ...allOptions.map (so => {
                const isSelected = fuzzyEquals (so.value, value)
                return option ({
                    value: so.value,
                    selected: isSelected ? "selected" : undefined,
                    class: isSelected ? props.selectedClass : undefined
                },
                    so.attrs,
                    so.label
                )}
            )
        )
    )
}

export interface RadioOption<T> extends SelectOption<T> {
    extraItem?: HValue
}

export interface RadioGroupProps<T> extends InputProps<T> {
    options?: RadioOption<T>[]
    optionAttrs?: HAttributes,
    inputAttrs?: HAttributes,
    labelAttrs?: HAttributes,
    prefix?: string,
    selectedClass?: string
}

export function radioGroup<T extends string|number|undefined> (props: RadioGroupProps<T>)
{
    const options = props.options || []
    const id = prefixId (props.prefix, getPropertyKey (props.prop))
    return (
        div ({ id: id }, props.attrs,
            ...options.map(option => {
                const checked = fuzzyEquals (option.value, getBoundValue (props))
                const optionId = id+"-"+option.value
                return div (
                    props.optionAttrs,
                    {
                        class: checked ? props.selectedClass : undefined,
                        onAttached: el => {
                            if (props.selectedClass) {
                                if (checked)
                                    el.classList.add (props.selectedClass)
                                else
                                    el.classList.remove (props.selectedClass)
                            }
                        }
                    },
                    input({
                        id: optionId,
                        value: "" + option.value,
                        name: id,
                        type: "radio",
                        checked: checked ? "checked" : undefined,                        
                        onchange: e => setBoundValue (props,
                            typeify<T> (options[0].value, (<any>e.target).value)
                        ),
                        onUpdated: (el: HTMLInputElement) => {                              
                            el.checked = el.getAttribute ("checked") == "checked"
                        }
                    },
                        props.inputAttrs
                    ),
                    label ({ for: optionId }, props.labelAttrs, option.label),
                    option.extraItem
                )
            })
        )
    )
}

export interface CheckProps extends InputProps<boolean> {
    labelAttrs?: HAttributes,
    inputAttrs?: HAttributes,
    label?: HValue,
    prefix?: string,
}

export function checkbox (props: CheckProps)
{
    const id = prefixId (props.prefix, getPropertyKey(props.prop))

    return (
        div (props.attrs,
            input ({
                id: id,
                value: "" + getBoundValue (props),
                type: "checkbox",
                name: id,
                checked: getBoundValue (props) ? "checked" : undefined,
                onchange: () => {
                    setBoundValue (props, ! getBoundValue (props))
                },
                onUpdated: el => {                              
                    (<HTMLInputElement>el).checked = el.getAttribute ("checked") == "checked"
                }
            },
                props.inputAttrs,
            ),
            label ({ for: id }, props.labelAttrs, props.label || getFriendlyName (props.target, props.prop))
        )
    )
}

export const inputTextArea = (props: InputEditorProps<string>) =>
    textarea ({
        oninput: e => setBoundValue (props, ((<HTMLTextAreaElement>e.target).value)),            
        onUpdated: (el: HTMLInputElement) => el.value = getBoundValue (props)
    },
        props.attrs,
        getBoundValue (props)     
    )

export const prefixId = (prefix: string|undefined, id: string) =>
    (isNullOrEmpty (prefix) ? "" : prefix + "-") + id