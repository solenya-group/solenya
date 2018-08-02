import { Component } from './component'
import { HValue, a } from './html'
import { Let } from './util'
import createHistory from "history/createBrowserHistory"
import { Action } from "history"
import { Exclude } from "class-transformer"
import { VElement } from './dom'

const history = createHistory()

export interface IRouted extends Component
{
    /** The router that manages the component's route */
    router: Router
    
    /** The route name of a component; combined with parent and child route names it forms a path */
    readonly routeName: string

    /** Optional - a function that maps a name to a child, where the child is also a routed component */
    childRoute? (name: string): IRouted | undefined

    /** called when component is routed */
    navigated? () : void

    beforeNavigate? (name: string, action?: Action) : Promise<boolean>
}

export class Router
{   
    /** The current child route name; an empty string if no child route is selected */
    currentChildName = ""    

    @Exclude()
    component: IRouted

    constructor (component: IRouted)
    {
        this.component = component
    }

    /** Sets the current path, setting the history accordingly */
    async navigate (childPath: string, action?: Action) : Promise<boolean>
    {                    
        const success = await this.root.setChildPath (combinePaths (this.pathRootToThis (false, true), childPath), action)
        this.component.update (() => {})
        if (success)      
            this.setHistory (action)            
        
        return success
    }

    private clearCurrent() {        
        const curChild = this.currentChildComponent
        if (curChild) {
            curChild.router.clearCurrent()        
            this.currentChildName = ''
        }
    }
    
    private async setChildPath (childPath: string, action?: Action) : Promise<boolean>
    {         
        if (this.currentChildName != pathHead (childPath) || (this.currentChildName == '' && pathHead (childPath) == ''))
            if (this.component.beforeNavigate && false === await this.component.beforeNavigate (childPath, action))
                return false

        this.clearCurrent()

        const newChild = ! this.component.childRoute ? undefined : this.component.childRoute (pathHead (childPath))            
        let success = true
                
        if (newChild) {
            this.currentChildName = newChild.routeName
            success = await newChild.router.setChildPath (pathTail (childPath), action)     
        }

        if (this.component.navigated)
            this.component.navigated()

        return success
    }

    get isActive () {
        return this.parent == null || this.parent!.currentChildName == this.component.routeName
    }

    /** The current child component of this route */
    get currentChildComponent(): IRouted | undefined {
        return this.currentChildName == "" || ! this.component.childRoute ?
            undefined :
            this.component.childRoute (this.currentChildName)                
    }

    pathFull() {        
        return branch (this.root, this.leaf, true, true)
    }
   
    /** Returns the path from the root to this */
    pathRootToThis (includeRoot: boolean, includeThis: boolean) {
        return branch (this.root, this, includeRoot, includeThis)
    }

   /** Returns the path from this to the leaf node */
    pathThisToLeaf (includeThis: boolean, includeLeaf: boolean) {
        return branch (this, this.leaf, includeThis, includeLeaf)        
    } 
    
    /** The parent router */
    get parent() {
        var c = this.component as Component
        while (c.parent) {
            c = c.parent
            if (isRouted (c))
                return c.router
        }
        return undefined
    }  

    /** The last router in the current path */
    get leaf(): Router {
        return this.currentChildName == "" ? this : this.currentChildComponent!.router.leaf
    }

    /** The root router */
    get root() : Router {
        const p = this.parent     
        return p ? p.root : this
    }

    navigateLink (path: string, ...values: HValue[]) : VElement {
        return a ({
            href: Let (combinePaths (this.pathRootToThis (true, true), path), x => x.indexOf ("/") == 0 ? x : "/" + x),
            onclick: (e:any)  => {
                this.navigate (path)
                return false
            }},
            ...values
        )
    } 

    protected setHistory (action?: Action) {
        const path = combinePaths ( "/" + this.pathFull()) // hack
        if (location.pathname != path) {            
            if (action == 'REPLACE' || equalsIgnoreCase (location.pathname, path))
                  history.replace (path)
            else if (action == 'POP')
                history.goBack()
            else
                history.push (path)
        }
    }
    
    followHistory () {    
        if (! this.parent)
            history.listen (async (historyLocation, action) => {
                const rootPath = "/" + this.component.routeName
                if (location.pathname.indexOf (rootPath) == 0)
                    this.navigate (location.pathname.substr (rootPath.length), action)                
            })
        else
            throw "Only the root router can follow history"
    }

    autoRouteChildren (childNames: string[]) {
         childNames.forEach (name => {
            const c = this.component[name]
            c.routeName = name
            c.router = new Router (c)
        })
    }
}

export function isRouted(c: Component | IRouted) : c is IRouted {
   return (<IRouted>c).router !== undefined
}

export function combinePaths (...pathParts: string[]) {
    return pathParts.join ("/").replace(/\/+/g,"/")
}

export function splitPath (path: string) {
     return path.split('/').filter(s => s != '')
}

export function normalizePath (path: string): string {
    return splitPath (path).join ('/')
}

export function pathHead (path: string) : string {
    return splitPath (path)[0] || ''
}

export function pathTail (path: string) : string {
    const split = splitPath (path)
    split.shift()
    return split.join ('/')
}

export function equalsIgnoreCase(a: string, b: string) {
    if (a == b) return true
    if (a == null || b == null) return false
    return a.toLowerCase() == b.toLowerCase()
}

export function branch (from: Router, to: Router, fromInclusive: boolean, toInclusive: boolean) : string
{    
    const current = toInclusive && (from != to || fromInclusive) ? to.component.routeName : ""
    const parent = to.parent
    return parent == null ?
        current :
        combinePaths (
            branch (from, parent, fromInclusive, true),
            current
        )
}