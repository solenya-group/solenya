export class TimeTravel<T>
{
    states: T[] = []
    cursor: number = 0
    setState: (state: T) => void

    constructor (initialState: T, setState: (state: T) => void)
    {       
        this.setState = setState
        this.states = [initialState]
    }

    push (prev: T, next: T) {
        if (this.cursor != this.states.length - 1)
            this.states = this.states.slice (0, this.cursor + 1)

        this.states = this.states.concat ([next])
        this.cursor = this.states.length - 1
        this.states[this.cursor-1] = prev
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