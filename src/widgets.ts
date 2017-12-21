import { VNode, VProps } from './dom'
import { button, input, select, option, div, label, span, br, a } from './html'
import { KeyValue, key, PropertyName, propertyName, Let, fuzzyEquals } from './util'

export function commandButton(click: () => void, ...values: any[]) { 
    return button (
        {
            onclick: (e: Event) => click()
        },
        ...values
    )
}

export function commandLink(click: () => void, ...values: any[]) {
    return a (
        {
            onclick: (e: Event) => click(),
            href: "javascript:;"
        },
        ...values
    )
 }

export function inputer(propertyAccess: () => any, inputAction: (propertyChange: KeyValue) => any, ...values: any[])
{
    var handler = handlePropertyChange (propertyAccess, inputAction)
    return input(
        {
            value: Let(propertyAccess(), value =>
                typeof value === "number" && isNaN (value) ? "" : value
            ),   
            oninput: handler,
            onchange: handler
        },
        ...values
    )
}

export function handlePropertyChange (propertyAccess: () => any, action: (propertyChange: KeyValue) => void) {
    return (e: Event) => action({
        key : key (propertyAccess),
        value: (<HTMLInputElement|HTMLSelectElement>e.target).value
    })
}

export function slider (propertyAccess: () => any, min: number, max: number, step: number, slideAction: (propertyChange: KeyValue) => any, ...values: any[])
{
    var handler = handlePropertyChange (propertyAccess, slideAction)
    return input (
        {
            type: "range",
            min: min,
            max: max,
            value: propertyAccess(),
            oninput: handler,
            onchange: handler
        },
        ...values
    )
}

export function selector
(
    labelNode: string|VNode<any>,
    propertyAccess: () => any,
    options: string[][] = [],
    hasEmpty: boolean = false,
    selectAction: (propertyChange: KeyValue) => any,
    ...values: any[]
)
{
    const value = propertyAccess()
    const allOptions = ! hasEmpty ? options : [["", ""], ...options]
    const id = key (propertyAccess)

    return (
        labeledInput (
            id,
            labelNode,
            select (
                {
                    type: "select",
                    name : id,
                    id : id,
                    onchange: handlePropertyChange (propertyAccess, selectAction)
                },
                ...values,
                ...allOptions.map (pair =>
                    option ({
                        value: pair[0],
                        selected: fuzzyEquals (pair[0], value) ? "selected" : undefined
                    },
                        pair[1]
                    )
                )
            )
        )
    )
}

export function labeledInput(inputId: PropertyName, labelNode: any, inputNode: VNode<any>)
{
    return div (
        label ({ for: propertyName (inputId) }, labelNode),
        div (inputNode)
    )
}

export function radioGroup 
(
    propertyAccess: () => any,
    options: string[][] = [],
    checkedAction: (propertyChange: KeyValue) => any
)
{
    return div (
        options.map (pair =>
            label (
                input({
                    value: pair[0],
                    name: key (propertyAccess),
                    type: "radio",
                    checked: fuzzyEquals(pair[0], propertyAccess()) ? "checked" : undefined,
                    onchange: handlePropertyChange (propertyAccess, checkedAction),
                    onupdate: (element: HTMLInputElement, props?: VProps) => {
                        element.checked = element.getAttribute ("checked") == "checked"
                    }
                }),
                pair[1],
                br()
            )
        )
    )
 }