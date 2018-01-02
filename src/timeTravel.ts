export class TimeTravel<T>
{
    states: T[] = []
    cursor: number = -1
    setState: (state: T) => void

    constructor (setState: (state: T) => void)
    {       
        this.setState = setState
    }

    push (obj: T) {
        if (this.cursor != this.states.length - 1)
            this.states = this.states.slice (0, this.cursor + 1)
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
        this.goto (this.cursor + 1)
    }

    prev() {
        this.goto (this.cursor - 1)
    }

    goto (cursor: number) {
        if (cursor >= 0 && cursor < this.states.length) {
            this.cursor = cursor
            this.setState (this.states [cursor])
        }
    }

    seek (predicate: (state: T) => boolean) {
        for (var i = 0; i < this.states.length; i++)
            if (predicate (this.states[i]))
                this.goto (i)
    }
}