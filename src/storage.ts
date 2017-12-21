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

    load (force: boolean) {
        if (force || this.autosave) {
            var serialized = window.localStorage.getItem (this.containerId)
            if (serialized)
                this.deserialize (serialized)
        }
    }

    save (force: boolean, getObj?: () => any) {
        if (force || this.autosave) {
            var obj = getObj ? getObj() : this.serialize()
            window.localStorage.setItem (this.containerId, obj)
        }
    }
        
    clear() {
        window.localStorage.removeItem (this.containerId)
    }

    get autosave () {
        return window.localStorage.getItem (this.containerId + "-autosave") == "true"
    }

    set autosave (saveOn: boolean) {
        window.localStorage.setItem (this.containerId + "-autosave", "" + saveOn)
        if (saveOn)
            this.save (false)
    }
}