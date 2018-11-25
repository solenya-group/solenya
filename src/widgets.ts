import { VElement, VAttributes } from './dom'
import { HValue, button, input, select, option, div, label, span, br, a, HProps, textarea } from './html'
import { key, Let, fuzzyEquals, parseFloatDeNaN, getLabel, humanizeIdentifier } from './util'
import { Component } from './component'

export type PropertyRef<T> = string | (() => T)

export type BasicBindableType = string | number | undefined

export function commandLink (...values: HValue[]) {
    return a ({ href: "javascript:;"}, ...values)
}

export type InputValueProps<T> =
{
    inputStringToModel : (inputString: string, prevModel: T) => T,
    modelToInputString : (model: T, prevInputString: string) => string,
}

export const getPropertyKey = <T> (prop: PropertyRef<T>) =>
    typeof (prop) == "string" ? prop: key (prop)

export const getPropertyValue = <T> (component: Component, prop: PropertyRef<T>) =>
    component [getPropertyKey (prop)]

export const setPropertyValue = <T> (component: Component, prop: PropertyRef<T>, value: T) =>
{    
    const key = getPropertyKey (prop)
    component.update (() =>
        {            
            component [key] = value
        },
        {key: key, value: value}
    )
}

export const typeify = <T extends BasicBindableType> (guideValue: any, strValue: string) =>
    <T><any> (typeof(guideValue) == "number" ? parseFloatDeNaN (strValue) : strValue)

export const getFriendlyName = <T>(obj: any, prop: PropertyRef<T>) => {
    const k = getPropertyKey (prop)
    return getLabel (obj, k) || humanizeIdentifier (k)
}

export function inputValue<T extends BasicBindableType>
(
    component: Component,
    prop: PropertyRef<T>,    
    props: InputValueProps<T>,    
    ...values: HValue[]
)
{    
    return input (
        {
            value: props.modelToInputString (getPropertyValue (component, prop), ""),
            oninput: e =>
                setPropertyValue (component, prop, 
                    props.inputStringToModel (
                        (<HTMLInputElement>e.target).value,
                        getPropertyValue (component, prop)
                    )
            ),
            onUpdated: (el: HTMLInputElement) =>
                el.value = props.modelToInputString (getPropertyValue (component, prop), el.value)
        },
        ...values
    )  
}

/** Currently empty but here for future proofing */
export type InputProps = {}

export function inputText (component: Component, prop: PropertyRef<string|undefined>, options: InputProps, ...values: HValue[])
{
    return inputValue<string|undefined>(
        component,
        prop,
        {
            inputStringToModel: s => s,
            modelToInputString: (s, prevS) => s || "",
        },        
        ...values
    )
}

export function inputNumber (component: Component, prop: PropertyRef<number|undefined>, options: InputProps, ...values: HValue[])
{
    return inputValue<number|undefined>(
        component,
        prop,
        {
            inputStringToModel: inputStringToNumber,
            modelToInputString: numberToInputString
        },
        ...values
    )
}

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

/** Currently empty but here for future proofing */
export type InputRangeProps = {
}

export function inputRange (component: Component, prop: PropertyRef<number>, props: InputRangeProps, ...values: HValue[])
{
    const onchange = (e: Event) => setPropertyValue (component, prop, parseFloatDeNaN ((<HTMLInputElement>e.target).value))

    return input (
        {
            type: "range",           
            value: getPropertyValue (component, prop),
            oninput: onchange,
            onchange: onchange,
            onUpdated: (el: HTMLInputElement) => { el.value = getPropertyValue (component, prop) }
        },
        ...values
    )
}

export type SelectorProps = {
    attrs?: HProps
    hasEmpty?: boolean
}

export interface SelectOption<T> {
    value: T
    label: HValue,
    disabled? : boolean
}

export function selector<T extends BasicBindableType>
(
    component: Component,
    prop: PropertyRef<T>,
    options: SelectOption<T>[] = [],
    props: SelectorProps
)
{
    const value = getPropertyValue (component, prop)
    const allOptions = ! props.hasEmpty ? options : [{value: undefined, label: "", disabled:false}, ...options]
    const id = getPropertyKey (prop)
    const guideValue = ! options.length ? undefined : options[options.length-1].value

    return (
        select ({
                type: "select",
                name : id,
                id : id,
                onchange: e => setPropertyValue (component, prop,
                    typeify<T> (guideValue, (<any>e.target).value)
                )
            },
            props.attrs,
            ...allOptions.map (so =>
                option ({
                    value: so.value,
                    selected: fuzzyEquals (so.value, value) ? "selected" : undefined,
                    disabled: so.disabled ? "disabled" : undefined
                },
                    so.label
                )
            )
        )
    )
}

export interface RadioOption<T> extends SelectOption<T> {
    extraItem?: HValue
}

export type RadioGroupProps =
{
    attrs?: HProps,    
    optionAttrs?: HProps,
    inputAttrs?: HProps,
    labelAttrs?: HProps,
    prefix?: string
}

export function radioGroup<T extends BasicBindableType>
(
    component: Component,
    prop: PropertyRef<T>,
    options: RadioOption<T>[] = [],    
    props: RadioGroupProps = {}
)
{
    const id = (props.prefix || "") + getPropertyKey(prop) 
    return (
        div ({ id: id }, props.attrs,
            options.map(option => {
                const checked = fuzzyEquals (option.value, getPropertyValue (component, prop))
                const optionId = id+"-"+option.value
                return div ( props.optionAttrs,
                    input({
                        id: optionId,
                        value: "" + option.value,
                        name: id,
                        type: "radio",
                        checked: checked ? "checked" : undefined,
                        onchange: e => setPropertyValue (component, prop,
                            typeify<T> (options[0].value, (<any>e.target).value)
                        ),
                        onUpdated: el => {                              
                            (<HTMLInputElement>el).checked = el.getAttribute ("checked") == "checked"
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

export function checkbox
(
    component: Component,
    prop: PropertyRef<boolean | undefined>,
    props: CheckProps = {}
)
{
    const id = (props.prefix || "") + getPropertyKey(prop) 

    return (
        div (props.attrs,
            input (                
                {
                    id: id,
                    value: "" + getPropertyValue (component, prop),
                    type: "checkbox",
                    name: id,
                    checked: getPropertyValue (component, prop) ? "checked" : undefined,
                    onchange: () => {
                        setPropertyValue (component, prop, ! getPropertyValue (component, prop))
                    },
                    onUpdated: el => {                              
                        (<HTMLInputElement>el).checked = el.getAttribute ("checked") == "checked"
                    }
                },
                props.inputAttrs,
            ),
            label ({ for: id }, props.labelAttrs, props.label || getFriendlyName (component, prop))
        )
    )
}

export type CheckProps = {
    attrs?: HProps,
    labelAttrs?: HProps,
    inputAttrs?: HProps,
    label?: HValue,
    prefix?: string,
}

export function inputTextArea
(
    component: Component,
    prop: PropertyRef<string>,    
    props: InputProps,    
    ...values: HValue[]
)
{    
    return textarea (
        {
            oninput: e => setPropertyValue (component, prop, ((<HTMLTextAreaElement>e.target).value)),            
            onUpdated: (el: HTMLInputElement) => el.value = getPropertyValue (component, prop)
        },
        ...values,
        getPropertyValue (component, prop)
    )  
}