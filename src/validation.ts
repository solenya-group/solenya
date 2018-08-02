import { Component } from "./component"
import { key } from "./util"
import { ValidationError, validateSync } from "class-validator"
import { Exclude } from "class-transformer"

export interface IValidated
{
    validator: Validator
    customValidationErrors?() : Promise<ValidationError[]>
}

export class Validator
{
    @Exclude() form: IValidated & Component
    @Exclude() validationErrors?: ValidationError[]    

    constructor (form: IValidated & Component) {
        this.form = form
    }
    
    async validate ()
    {        
        this.validationErrors = []
        
        this.validationErrors.push (...validateSync (this.form))
        
        if (this.form.customValidationErrors)
            this.validationErrors.push (...await this.form.customValidationErrors())

        for (var c of this.validatedChildren())
            await c.validator.validate()

        return this.isValid
    }

    get isValid() : boolean {
        if (! this.validationErrors)
            return false
        return this.validationErrors.length == 0 && this.validatedChildren().filter(v => ! v.validator.isValid).length == 0
    }

    validatedChildren() : IValidated[] {
        return this.form.children().filter(c => isValidated (c)) as any
    }
    
    get wasValidated() : boolean {
        return this.validationErrors != null && this.validatedChildren().filter(v => ! v.validator.wasValidated).length == 0
    }

    clearErrors() {
        this.validationErrors = undefined
        this.validatedChildren().forEach (v => v.validator.clearErrors())
    }

    async validateThenUpdate (payload?: any) {
        if (! payload || payload.key != "validation") {
            const success = await this.validate()        
            this.form.update (() => {}, {key: "validation"})
            return success
        }
        return false
    }

    validationError (prop: () => any) {
        if (! this.validationErrors)
            return undefined
        
        const error = this.validationErrors.filter (e => e.property == key(prop))
        return error.length == 0 ? undefined : error[0]
    }
}

export function isValidated (form: any): form is IValidated {
    const v = <IValidated>form
    return v.validator != undefined
}