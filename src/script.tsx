// INSERT 37 42 47 21 46 18 30 33 9 6 7 45 3 29 43

const enum Color {
    RED='red', 
    BLACK='black', 
    DOUBLE_BLACK='double-black', 
    PLUS_1='plus-1', 
    MINUS_1='minus-1', 
    PLUS_2='plus-2', 
    MINUS_2='minus-2',
    SUBTREE='subtree',
    NIL='nil',
}

class N {
    public el: HTMLElement;
    public node: HTMLSpanElement;
    public input: HTMLSpanElement;
    public menu: HTMLDivElement;
    private _value: string;
    private _color: Color;
    private lc: N;
    private rc: N;
    private _parent: N;

    constructor(value: string) {
        this.el = document.createElement("div");

        this.node = document.createElement("span");
        this.node.className = "value-input";
        this.el.appendChild(this.node);

        this.input = document.createElement("span");
        this.input.className = "value-input-text";
        this.input.setAttribute("spellcheck", "false");
        this.input.setAttribute("contenteditable", "true");
        this.node.appendChild(this.input);

        this.menu = document.createElement("div");
        this.menu.className = "node-color";
        this.menu.setAttribute("tabindex", "0");

        for(const color of 
            [Color.BLACK, Color.RED, Color.DOUBLE_BLACK, Color.MINUS_1, Color.PLUS_1, Color.MINUS_2, Color.PLUS_2]
        ){
            const btn = document.createElement("button");
            btn.className = 'color-btn ' + (color as string);
            btn.setAttribute("tabindex", "0");
            this.menu.appendChild(btn);

            btn.onclick = _ => {
                this.color = color;
            }
        }

        {
            {
                const btn = document.createElement("button");
                btn.className = 'color-btn left-rotate';
                btn.setAttribute("tabindex", "0");
                this.menu.appendChild(btn);

                btn.onclick = _ => {
                    if(this.left.value) this.leftRotate();
                }
            }
            {
                const btn = document.createElement("button");
                btn.className = 'color-btn right-rotate';
                btn.setAttribute("tabindex", "0");
                this.menu.appendChild(btn);

                btn.onclick = _ => {
                    if(this.right.value) this.rightRotate();
                }
            }
        }

        this.menu.style.display = 'none';

        this.node.appendChild(this.menu);

        this.node.oncontextmenu = e => {
            let shouldShow = this.menu.style.display != 'flex';
            document
                .querySelectorAll('div.node-color')
                .forEach(i => (i as HTMLElement).style.display = 'none');
            this.menu.style.display = shouldShow ? 'flex' : 'none';
            e.preventDefault();
        }
        this.input.onkeydown = e => {
            if (e.key == "Enter") {
                let s = this.input.innerText.trim();
                if (s != this.value) {
                    this.value = s;
                }
                this.node.blur();
                e.preventDefault();
            }
            else if(e.ctrlKey && e.key.match(/^[1-8]$/g)){
                this.color = [Color.BLACK, Color.RED, Color.DOUBLE_BLACK, Color.MINUS_1, Color.PLUS_1, Color.MINUS_2, Color.PLUS_2, Color.SUBTREE][+e.key - 1];
                e.preventDefault();
            }
            else if(e.ctrlKey && e.key == 'Backspace'){
                this.color = Color.NIL;
                e.preventDefault();
            }
            // Prevent too long text, prevent non-word characters
            else if (
                e.key.length == 1 && !e.ctrlKey && 
                !(this.input.innerText.length < 9 && e.key.match(/^[a-zA-Z0-9.\- ]$/))
            ) e.preventDefault();
            else if(e.ctrlKey && e.key == "ArrowLeft"){
                this.right?.value && this.rightRotate();
            }
            else if(e.ctrlKey && e.key == "ArrowRight"){
                this.left?.value && this.leftRotate();
            }

            N.updateLayout(this.root);
        }
        this.input.addEventListener('focusout', _ => {
            let s = this.input.innerText.trim();
            if (s != this.value) {
                this.value = s;
            }

            N.updateLayout(this.root);
        })

        this._setColor(Color.NIL);
        this._setValue(value);

        N.updateLayout(this.root);
    }

    set color(c) {
        this._setColor(c);
        saveStep(this.root);
    }

    _setColor(c : Color){
        this._color = c;
        this.el.className = this._color == Color.NIL ? 'nil' : 'node ' + this._color;
        if((c != Color.NIL && c != Color.DOUBLE_BLACK) && this.value == null) this.value = "0";
        else if(c == Color.NIL && this.value != null) this.value = null;
        if(c == Color.SUBTREE){
            this.left = null;
            this.right = null;
        }
        else if(c != Color.NIL && c != Color.DOUBLE_BLACK){
            this.lc || (this.left = new N(""));
            this.rc || (this.right = new N(""));
        }
    }

    get color() {
        return this._color
    }

    set value(v: string) {
        this._setValue(v);
        saveStep(this.root);
    }

    _setValue(v: string){
        if (v == null || v == "" || v == "NIL") {
            this._value = null;
            this.input.innerText = "NIL";
            if(this.color != Color.NIL && !(this.color == Color.DOUBLE_BLACK && !this.value)) this.color = Color.NIL;

            this.lc && this.lc.removeFromParent();
            this.rc && this.rc.removeFromParent();
            this.lc = this.rc = null;
        } else {
            if(this.color == Color.NIL) this.color = Color.BLACK;

            this._value = v;
            this.input.innerText = v;

            if(this.color != Color.SUBTREE) {
                this.lc || (this.left = new N(""));
                this.rc || (this.right = new N(""));
            }
            else {
                this.left = null;
                this.right = null;
            }
        }

        N.updateLayout(this.root);
    }

    get value() {
        return this._value
    }

    leftRotate () {
        const p = this.left;
        this.left = p.right;
        if(this.parent == null){
            this.el.parentElement.appendChild(p.el);
            this.el.parentElement.removeChild(this.el);
            // @ts-ignore
            window["r"] = p;
            p.parent = null;
        }
        else if(this == this.parent.left){
            this.parent.left = p;
        }
        else if(this == this.parent.right){
            this.parent.right = p;
        }
        else {
            throw "What the poop";
        }
        p.right = this;
        saveStep(this.root);
    }

    rightRotate () {
        const p = this.right;
        this.right = p.left;
        if(this.parent == null){
            this.el.parentElement.appendChild(p.el);
            this.el.parentElement.removeChild(this.el);
            // @ts-ignore
            window["r"] = p;
            p.parent = null;
        }
        else if(this == this.parent.right){
            this.parent.right = p;
        }
        else if(this == this.parent.left){
            this.parent.left = p;
        }
        else {
            throw "What the poop";
        }
        p.left = this;
        saveStep(this.root);
    }
    set left(n) {
        this.lc && (this.lc._parent = null);
        this.lc?.removeFromDOM();
        this.lc = n;
        n && (n.parent = this)
    }

    set right(n) {
        this.rc && (this.rc._parent = null);
        this.rc?.removeFromDOM();
        this.rc = n;
        n && (n.parent = this)
    }

    get left() {
        return this.lc
    }

    get right() {
        return this.rc
    }

    removeFromParent() {
        if(this.parent?.left == this)
            this.parent.left = null;
        if(this.parent?.right == this)
            this.parent.right = null;
    }
    removeFromDOM(){
        this.el.parentElement?.removeChild(this.el);
    }

    get parent() {
        return this._parent;
    }

    set parent(p) {
        this.removeFromParent();
        if(p) {
            if (this == p.lc) {
                p.node.insertAdjacentElement('afterend', this.el);
            } else p.el.appendChild(this.el);
        }
        this._parent = p;
    }

    get root(): N {
        return this.parent?.root ?? this;
    }

    get reverseLevelOrderTraversal() : N[] {
        const S : N[] = [];
        const Q : N[] = [];

        Q.push(this);
        while (Q.length) {
            const node = Q.shift();
            S.push(node);
            node.left && Q.push(node.left);
            node.right && Q.push(node.right);
        }

        return S;
    }
    public static updateLayout(root: N) {
        // Re-space nodes
        for(const node of root.reverseLevelOrderTraversal){
            let w = node.el.getBoundingClientRect().width;
            let iw = node.node.getBoundingClientRect().width;

            node.el.dataset.w = w.toString();

            let left;
            if(node.value == null) // NIL node
                left = w / 2;
            else    // Non-nil
                left = (+node.left.el.dataset.l + +node.left.el.dataset.w + +node.right.el.dataset.l) / 2;

            node.el.dataset.l = left.toString();
            node.node.style.setProperty("--left", (left - iw / 2).toString());
        }

        // Draw lines
        (function process(x: N) {
            if(x.parent) {
                const [xe, pe] = [x.node, x.parent.node];
                const [pr, xr] = [xe, pe].map(i => i.getBoundingClientRect());
                const [pc, xc] = [pr, xr].map(i => [i.x + i.width / 2, i.y + i.height / 2]);

                const [dx, dy] = [xc[0] - pc[0], xc[1] - pc[1]];
                x.el.style.setProperty("--l", Math.sqrt(dx * dx + dy * dy) + "px");
                x.el.style.setProperty("--theta", Math.atan2(dy, dx) + "rad");
            }
            else {
                x.el.style.setProperty("--l", "0");
                x.el.style.setProperty("--theta","0");
            }
            x.left && process(x.left);
            x.right && process(x.right);
        })(root);
    }


    public static parseData(s: string) {
        let i = 0;
        let ss = s.replaceAll("%20", " ");
        return this._parseData(() => i >= ss.length ? null : ss[i++]);
    }

    private static _parseData(next: () => string): N {    // Input: s := - | {s:<text>:s}
        let c1 = next();
        if (c1 == '{') {
            const color = {
                b:Color.BLACK,
                B:Color.DOUBLE_BLACK,
                a:Color.RED,
                n:Color.NIL,
                l:Color.PLUS_1,
                L:Color.PLUS_2,
                r:Color.MINUS_1,
                R:Color.MINUS_2,
                s:Color.SUBTREE,
            }[next()];
            next(); //Advance past ":"
            const left = this._parseData(next);
            next(); //Advance past ":"
            let val = "", c;
            while ((c = next()) && c != ":") val += c;
            // We stop after advancing past ":", just parse again
            const right = this._parseData(next);
            // Advance past "}"
            next();

            const res = new N(val);
            res.color = color;
            res.left = left;
            res.right = right;
            return res;
        } else if (c1 == '-') {
            return new N("");
        }

        return null;
    }

    public static toData(n: N): string {
        return n == null || n.value == null ? '-' : `{${{
            [Color.BLACK]:'b',
            [Color.DOUBLE_BLACK]:'B',
            [Color.RED]:'a',
            [Color.NIL]:'n',
            [Color.PLUS_1]:'l',
            [Color.PLUS_2]:'L',
            [Color.MINUS_1]:'r',
            [Color.MINUS_2]:'R',
            [Color.SUBTREE]:'s',
        }[n.color]}:${this.toData(n.left)}:${n.value}:${this.toData(n.right)}}`
    }
}

let currStep = -1;
const steps: string[] = [];
let lastStep: string = null;

function saveStep(n: N) {
    let d = N.toData(n);
    if (d == lastStep) return;
    steps.splice(currStep + 1);
    steps.push(N.toData(n));
    currStep++;
    updateAfterStep(false);
}

function undo() {
    canUndo() && currStep--, updateAfterStep()
}

function redo() {
    canRedo() && currStep++, updateAfterStep()
}

function canUndo() {
    return currStep > 0
}

function canRedo() {
    return currStep + 1 < steps.length
}

function updateAfterStep(updateTree = true) {
    let s = steps[currStep] || '-';
    lastStep = window.location.hash = s;

    if (updateTree) {
        let t = N.parseData(s);
        // @ts-ignore
        window["r"].value = t.value;
        // @ts-ignore
        window["r"].color = t.color;
        // @ts-ignore
        window["r"].left = t.left;
        // @ts-ignore
        window["r"].right = t.right;
    }

    document.getElementById('undo').ariaDisabled = "" + !canUndo();
    document.getElementById('redo').ariaDisabled = "" + !canRedo();
}

{

    // @ts-ignore
    window["r"] = window.location.hash && N.parseData(window.location.hash.substring(1)) || new N(null);

    document.querySelector('.red-black-tree').appendChild(// @ts-ignore
        window["r"].el);

    saveStep(// @ts-ignore
        window["r"] );

    document.body.onclick = _ => document
        .querySelectorAll('div.node-color')
        .forEach(i => (i as HTMLElement).style.display = 'none');

    setInterval(() => N.updateLayout(
        // @ts-ignore
        window["r"].root
    ), 100)
}