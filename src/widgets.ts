import { VElement } from '.'
import { Component } from './component'
import { a, div, HProps, HValue, input, label, option, select, textarea, combineAttrs } from './html'
import { fuzzyEquals, getLabel, humanizeIdentifier, key, parseFloatDeNaN } from './util'

export type PropertyRef<T> = string | (() => T)

export const commandLink = (...values: HValue[]) =>
    a ({ href: "javascript:;"}, ...values)

export const getPropertyKey = <T> (prop: PropertyRef<T>) =>
    typeof (prop) == "string" ? prop: key (prop)

export const getPropertyValue = <T> (props: DatabindProps<T>) =>
    props.component [getPropertyKey (props.prop)]

export const setPropertyValue = <T> (props: DatabindProps<T>, value: T) =>
{    
    const key = getPropertyKey (props.prop)
    props.component.update (() =>
        {            
            props.component [key] = value
        },
        {key: key, value: value}
    )
}

export const typeify = <T extends string|number|undefined> (guideValue: any, strValue: string) =>
    <T><any> (typeof(guideValue) == "number" ? parseFloatDeNaN (strValue) : strValue)

export const getFriendlyName = <T> (obj: any, prop: PropertyRef<T>) => {
    const k = getPropertyKey (prop)
    return getLabel (obj, k) || humanizeIdentifier (k)
}

export const combineObjAttrs = <T> (...objs: Partial<T>[]) => {    
    const newObj = {}
    for (var obj of objs)
        for (var k of Object.keys (obj))
            if (newObj[k] == null)
                newObj[k] = obj[k]
            else if (/[aA]ttrs/.test (k))
                newObj[k] = combineAttrs (newObj[k], obj[k])            
    return <T> newObj
}

export interface StringBinding<T>
{   
    inputStringToModel : (inputString: string, prevModel: T) => T
    modelToInputString : (model: T, prevInputString: string) => string    
}

export interface InputValueProps<T> extends StringBinding<T>, CoreInputAttrs<T> {}

export interface DatabindProps<T> {
    component: Component,
    prop: PropertyRef<T>, 
}

export interface CoreInputAttrs<T> extends DatabindProps<T>
{    
    attrs?: HProps
}

export const inputValue = <T extends string|number|undefined> (props: InputValueProps<T>) =>
    input (
        {
            value: props.modelToInputString (getPropertyValue (props), ""),
            oninput: e =>
                setPropertyValue (props, 
                    props.inputStringToModel (
                        (<HTMLInputElement>e.target).value,
                        getPropertyValue (props)
                    )
            ),
            onUpdated: (el: HTMLInputElement) =>
                el.value = props.modelToInputString (getPropertyValue (props), el.value)
        },
        props.attrs
    )  

export interface InputProps<T> extends CoreInputAttrs<T> {}

export const inputText = (props: InputProps<string|undefined>) =>
    inputValue ({
        ...props,
        inputStringToModel: s => s,
        modelToInputString: (s, prevS) => s || ""
    })

export const inputNumber = (props: InputProps<number|undefined>) =>
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

export interface InputRangeProps extends CoreInputAttrs<number> {}

export const inputRange = (props: InputRangeProps) =>
{
    const onchange = (e: Event) => setPropertyValue (props, parseFloatDeNaN ((<HTMLInputElement>e.target).value))

    return input (
        {
            type: "range",           
            value: getPropertyValue (props),
            oninput: onchange,
            onchange: onchange,
            onUpdated: (el: HTMLInputElement) => { el.value = getPropertyValue (props) }
        },
        props.attrs
    )
}

export interface SelectorProps<T> extends CoreInputAttrs<T> {
    options?: SelectOption<T>[]
    hasEmpty?: boolean,
    prefix?: string,
    selectedClass?: string
}

export interface SelectOption<T> {
    value: T
    label: HValue,
    attrs?: HProps    
}

export function selector<T extends string|number|undefined> (
    props: SelectorProps<T>  
)
{
    const options = props.options || []
    const value = getPropertyValue (props)
    const allOptions = ! props.hasEmpty ? options : [<SelectOption<T>>{value: undefined, label: ""}, ...options]
    const id = (props.prefix || "") + getPropertyKey(props.prop) 
    const guideValue = ! options.length ? undefined : options[options.length-1].value

    return (
        select ({
            type: "select",
            name : id,
            id : id,
            onchange: e => setPropertyValue (props, typeify<T> (guideValue, (<any>e.target).value))
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

export interface RadioGroupProps<T> extends CoreInputAttrs<T> {
    options?: RadioOption<T>[]
    optionAttrs?: HProps,
    inputAttrs?: HProps,
    labelAttrs?: HProps,
    prefix?: string,
    selectedClass?: string
}

export function radioGroup<T extends string|number|undefined> (props: RadioGroupProps<T>)
{
    const options = props.options || []
    const id = (props.prefix || "") + getPropertyKey(props.prop) 
    return (
        div ({ id: id }, props.attrs,
            options.map(option => {
                const checked = fuzzyEquals (option.value, getPropertyValue (props))
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
                        checked: checked ? "checked" : "",                        
                        onchange: e => setPropertyValue (props,
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

export interface CheckProps extends CoreInputAttrs<boolean> {
    labelAttrs?: HProps,
    inputAttrs?: HProps,
    label?: HValue,
    prefix?: string,
}

export function checkbox (props: CheckProps)
{
    const id = (props.prefix || "") + getPropertyKey(props.prop) 

    return (
        div (props.attrs,
            input (                
                {
                    id: id,
                    value: "" + getPropertyValue (props),
                    type: "checkbox",
                    name: id,
                    checked: getPropertyValue (props) ? "checked" : undefined,
                    onchange: () => {
                        setPropertyValue (props, ! getPropertyValue (props))
                    },
                    onUpdated: el => {                              
                        (<HTMLInputElement>el).checked = el.getAttribute ("checked") == "checked"
                    }
                },
                props.inputAttrs,
            ),
            label ({ for: id }, props.labelAttrs, props.label || getFriendlyName (props.component, props.prop))
        )
    )
}
export const inputTextArea = (props: InputProps<string>) =>
    textarea ({
        oninput: e => setPropertyValue (props, ((<HTMLTextAreaElement>e.target).value)),            
        onUpdated: (el: HTMLInputElement) => el.value = getPropertyValue (props)
    },
        props.attrs,
        getPropertyValue (props)     
    )