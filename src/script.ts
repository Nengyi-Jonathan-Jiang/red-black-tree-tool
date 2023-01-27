// INSERT 37 42 47 21 46 18 30 33 9 6 7 45 3 29 43

class N {
    public el: HTMLElement;
    public input: HTMLSpanElement;
    public _value: string;
    public _color: boolean;
    private lc : N;
    private rc : N;
    private _parent: N;

    constructor(value: string) {
        this.el = document.createElement("div");
        this.input = document.createElement("span");
        this.input.className = "value-input";
        this.input.setAttribute("spellcheck", "false");
        this.input.setAttribute("contenteditable", "true");
        this.el.appendChild(this.input);
        this.input.addEventListener('long-press', this.input.oncontextmenu = e => {
            this.color = value == null || !this.color;
            e.preventDefault();
        })
        this.input.onkeydown = e => {
            if (e.key == "Enter")
                this.value = this.input.innerText.trim(),
                this.input.blur();
            // Prevent too long text, prevent non-word characters
            else if(e.key.length == 1 && !e.ctrlKey && !(this.input.innerText.length < 9 && e.key.match(/^[a-zA-Z0-9.\- ]$/)))
                e.preventDefault();
        }
        this.input.addEventListener('focusout', _ => {
            this.value = this.input.innerText.trim();
        })

        this.value = value;
        this.color = false;

        N.updateEdgeRendering(this.root);
    }

    set color(c){
        this._color = c && this._value != null;
        this.el.className =
            this._value == null ? "nil" :
            c ? "black node" : "red node";
    }
    get color(){ return this._color }

    set value(v: string){
        if(v == "" || v == "NIL"){
            this._value = null;
            this.input.innerText = "NIL";
            this.el.className = "nil";

            this.lc && this.lc.delete();
            this.rc && this.rc.delete();
            this.lc = this.rc = null;
        }
        else {
            this._value = v;
            this.input.innerText = v;

            this.lc || (this.left = new N(""));
            this.rc || (this.right = new N(""));
        }
        this.color = this.color;

        N.updateEdgeRendering(this.root);
    }

    set left(n){this.lc = n; n && (this.el.appendChild(n.el), n._parent = this)}
    set right(n){this.rc = n; n && (this.el.appendChild(n.el), n._parent = this)}
    get left() {return this.lc}
    get right() {return this.rc}

    delete(){
        this.el.parentElement.removeChild(this.el);
        N.updateEdgeRendering(this.root);
    }

    get parent(){
        return this._parent;
    }

    get root() : N {
        return this.parent == null ? this : this.parent.root;
    }

    private static updateEdgeRendering(root: N){
        [root.left, root.right].filter(i => !!i).map(function process(x: N){
            const [xe, pe] = [x.input, x.parent.input];
            const [pr, xr] = [xe, pe].map(i => i.getBoundingClientRect());
            const [pc, xc] = [pr, xr].map(i => [i.x + i.width / 2, i.y + i.height / 2]);

            const [dx, dy] = [xc[0] - pc[0], xc[1] - pc[1]];
            x.el.style.setProperty("--l", Math.sqrt(dx * dx + dy * dy) + "px");
            x.el.style.setProperty("--theta", Math.atan2(dy, dx) + "rad");

            x.left && process(x.left);
            x.right && process(x.right);
        })
    }


    public static parseData(s:string){ let i = 0; return this._parseData(() => i >= s.length ? null : s[i++]) }
    private static _parseData(next: ()=>string):N{    // Input: s := NIL | {s:<text>:s}
        let c1 = next();
        if(c1=='{'){
            const left = this._parseData(next);
            next(); //Advance past ":"
            let val = "", c;
            while((c = next()) && c != ":") val += c;
            // We stop after advancing past ":", just parse again
            const right = this._parseData(next);
            // Advance past "}"
            next();

            const res = new N(val);
            res.left = left;
            res.right = right;
            return res;
        }
        else if(c1 == 'N'){

        }

        return null;
    }
    public static toData(n: N){
        return n == null ? 'nil' : `{${n.left}:${n.value}:${n.right}}`
    }
}

document.querySelector('.red-black-tree').appendChild(new N("").el);