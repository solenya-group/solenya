export class Storage
{
    private containerId: string
    private serialize: () => string
    private deserialize: (serialized: string) => void
    
    constructor(containerId: string, serialize: () => string, deserialize: (serialized: string) => void) {
        this.containerId = containerId
        this.serialize = serialize
        this.deserialize = deserialize
    }

    load (doLoad?: boolean) {
        if (supported() && (doLoad || (this.autosave && doLoad !== false))) {
            var serialized = window.localStorage.getItem (this.containerId)
            if (serialized)
                this.deserialize (serialized)
        }
    }

    save (doSave?: boolean, getObj?: () => any) {
        if (supported() && (doSave || (this.autosave && doSave !== false))) {
            var obj = getObj ? getObj() : this.serialize()
            window.localStorage.setItem (this.containerId, obj)
        }
    }
        
    clear() {
        if (supported())
            window.localStorage.removeItem (this.containerId)
    }

    get autosave () {
        if (! supported())
            return false
        return window.localStorage.getItem (this.containerId + "-autosave") == "true"
    }

    set autosave (saveOn: boolean) {
        if (! supported())
            return
        window.localStorage.setItem (this.containerId + "-autosave", "" + saveOn)
        if (saveOn)
            this.save (false)
    }
}

function supported() {
    return window.localStorage != null
}