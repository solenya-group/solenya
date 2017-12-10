export class TimeTravel<T>
{
    states: T[] = []
    cursor: number = 0
    setState: (state: T) => void

    constructor (setState: (state: T) => void)
    {       
        this.setState = setState
    }

    push (obj: T) {
        this.states = this.states.concat ([obj])
        this.cursor = this.states.length - 1
    }

    start() {
        this.goto (0)
    }

    end() {
        this.goto (this.states.length - 1)
    }

    next() {
        if (this.cursor < this.states.length - 1)
            this.goto (this.cursor + 1)
    }

    prev() {
        if (this.cursor > 0)
            this.goto (this.cursor - 1)
    }

    goto (cursor: number) {
        this.cursor = cursor
        this.setState (this.states [cursor])
    }

    seek (predicate: (state: T) => boolean) {
        for (var i = 0; i < this.states.length; i++)
            if (predicate (this.states[i]))
                this.goto (i)
    }
}