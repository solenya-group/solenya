import { VNode, VProps } from './dom'
import { button, h1, main, input, select, option, div, label, span, br, a } from './html'
import { KeyValue, key, PropertyName, propertyName, Let, fuzzyEquals } from './util'

export const commandButton = (click: () => void, content: any, attrs?: any) => 
    button (
        {
            onclick: (e: Event) => click()
        },
        attrs,
        content
    )

export const commandLink = (click: () => void, content: any, attrs?: any) =>    
    a (
        {
            onclick: (e: Event) => click()
        },
        attrs,
        content
    )

export const inputer = (propertyAccess: () => any, inputAction: (propertyChange: KeyValue) => any, attrs?: any) =>    
    input(
        {
            value: Let(propertyAccess(), value =>
                typeof value === "number" && isNaN (value) ? "" : value
            ),   
            oninput: (e: Event) => inputAction({
                key: key(propertyAccess),
                value: (<HTMLInputElement>e.target).value
            })
        },
        attrs
    )

export const slider = (propertyAccess: () => any, min: number, max:number, step:number, slideAction: (propertyChange: KeyValue) => any, attrs?: any) =>
    input (
        {
            type: "range",
            min: min,
            max: max,
            value: propertyAccess(),
            oninput: (e: Event) => slideAction({
                key: key(propertyAccess),
                value: (<HTMLInputElement>e.target).value
            })
        },
        attrs
    )

export const selector =
(
    labelNode: string|VNode<any>,
    propertyAccess: () => any,
    options: string[][] = [],
    hasEmpty: boolean = false,
    selectAction: (propertyChange: KeyValue) => any,
    attrs?: any
) =>
{
    const value = propertyAccess();
    const allOptions = ! hasEmpty ? options : [["", ""], ...options];
    const id = key (propertyAccess);

    return (
        labeledInput (
            id,
            labelNode,
            select (
                {
                    type: "select",
                    name : id,
                    id : id,
                    onchange: (e: Event) => selectAction ({
                        key: id,
                        value: (<HTMLSelectElement>e.target).value
                    })
                },
                attrs,
                allOptions.map (pair =>
                    option ({
                        value: pair[0],
                        selected: fuzzyEquals (pair[0], value) ? "selected" : undefined
                    },
                        pair[1]
                    )
                )
            )
        )
    );
}

export const labeledInput = (inputId: PropertyName, labelNode: any, inputNode: VNode<any>) =>
    div (
        label ({ for: propertyName (inputId) }, labelNode),
        div (inputNode)
    )

export const radioGroup =
(
    propertyAccess: () => any,
    options: string[][] = [],
    checkedAction: (propertyChange: KeyValue) => any
) =>
    div (
        options.map (pair =>
            label (
                input({
                    value: pair[0],
                    name: key (propertyAccess),
                    type: "radio",
                    checked: fuzzyEquals(pair[0], propertyAccess()) ? "selected" : undefined,
                    onchange: (e: Event) => checkedAction ({
                        key: key (propertyAccess),
                        value: (<HTMLInputElement>e.target).value
                    }),
                    onupdate: (element: HTMLInputElement, props?: VProps) => {
                            // element.checked = element.getAttribute ("checked") == "checked";
                    }
                }),
                pair[1],
                br()
            )
        )
    )