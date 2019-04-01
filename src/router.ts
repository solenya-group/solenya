import { Component } from './component'
import { HValue, a } from './html'
import { Let, equalsIgnoreCase, isNullOrEmpty } from './util'
import { createBrowserHistory, Action } from "history"
import { Exclude } from "class-transformer"
import { VElement } from './dom'

const history = createBrowserHistory()

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
    query = ""

    @Exclude() component: IRouted
    @Exclude() rootBegan?: boolean

    constructor (component: IRouted)
    {
        this.component = component
    }

    /** Sets the current path, setting the history accordingly */
    async navigate (childPath: string, action?: Action, bypassHistoryUpdate = false) : Promise<boolean>
    {              
        const isFirstEverRootNav = this.root == this && ! this.rootBegan

        if (! isFirstEverRootNav && combinePaths ("/", childPath) == this.pathFull())
            return true

        if (this.root == this)
            this.rootBegan = true
                
        const success = await this.root.setChildPath (
            combinePaths (this.pathRootToThis (false, true), childPath),
            action
        )
        
        this.component.update (() => {})
        
        if (success) {    
            this.leaf.query = childPath.indexOf ("?") == -1 ? "" : childPath.substring (childPath.indexOf("?"))
            if (! bypassHistoryUpdate)
                this.setHistory (action)            
        }

        if (isFirstEverRootNav)
            this.followHistory()
        
        return success
    }

    clearCurrent (recurse = false)
    {        
        if (recurse && this.currentChildComponent)
            this.currentChildComponent.router.clearCurrent()                    
        
        this.currentChildName = ''
    }
    
    private async setChildPath (childPath: string, action?: Action) : Promise<boolean>
    {         
        if (this.currentChildName != pathHead (childPath) || (this.currentChildName == '' && pathHead (childPath) == ''))
            if (this.component.beforeNavigate && false === await this.component.beforeNavigate (childPath, action))
                return false

        this.clearCurrent()

        const newChild = this.findChildRoute(pathHead (childPath))      

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
        return this.findChildRoute (this.currentChildName)
    }

    pathFull() {        
        return combinePaths ("/", branch (this.root, this.leaf, true, true)) + this.leaf.query
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
        const pathAndQuery = this.pathFull()
        if (location.pathname + location.search != pathAndQuery) {            
            if (action == 'REPLACE' || equalsIgnoreCase (location.pathname + location.search, pathAndQuery))
                  history.replace (pathAndQuery)
            else if (action == 'POP')
                history.goBack()
            else
                history.push (pathAndQuery)
        }
    }
    
    private followHistory () {    
        if (! this.parent)
            history.listen (async (historyLocation, action) => {
                const rootPath = "/" + this.component.routeName
                if (location.pathname.indexOf (rootPath) == 0)
                    this.navigate (location.pathname.substr (rootPath.length) + location.search, action, true)
            })
        else
            throw "Only the root router can follow history"
    }

    findChildRoute (name: string) {
        if (isNullOrEmpty (name))
            return undefined
        
        if (this.component.childRoute)
            return this.component.childRoute (name)

        const route = this.component.children().filter(x => isRouted(x) && equalsIgnoreCase (x.routeName, name))
        return ! route.length ? undefined : route[0] as IRouted
    }
}

export function isRouted(c: Component | IRouted) : c is IRouted {
   return (<IRouted>c).router !== undefined
}

export function combinePaths (...pathParts: string[]) {
    return pathParts.join ("/").replace(/\/+/g,"/")
}

export function splitPath (path: string) {
    if (path && path.indexOf ("?") != -1)
        path = path.substring (0, path.indexOf ("?"))
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