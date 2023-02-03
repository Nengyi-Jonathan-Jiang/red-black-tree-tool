// INSERT 37 42 47 21 46 18 30 33 9 6 7 45 3 29 43

class N {
    public el: HTMLElement;
    public input: HTMLSpanElement;
    private _value: string;
    private _color: boolean;
    private lc: N;
    private rc: N;
    private _parent: N;

    constructor(value: string) {
        this.el = document.createElement("div");
        this.input = document.createElement("span");
        this.input.className = "value-input";
        this.input.setAttribute("spellcheck", "false");
        this.input.setAttribute("contenteditable", "true");
        this.el.appendChild(this.input);
        this.input.oncontextmenu = e => {
            this.color = value == null || !this.color;
            e.preventDefault();
            saveStep(this.root);
        }
        this.input.onkeydown = e => {
            if (e.key == "Enter") {
                let s = this.input.innerText.trim();
                if (s != this.value) {
                    this.value = s;
                    saveStep(this.root);
                }
                this.input.blur();
                e.preventDefault();
            }
            // Prevent too long text, prevent non-word characters
            else if (e.key.length == 1 && !e.ctrlKey && !(this.input.innerText.length < 9 && e.key.match(/^[a-zA-Z0-9.\- ]$/)))
                e.preventDefault();
        }
        this.input.addEventListener('focusout', _ => {
            let s = this.input.innerText.trim();
            if (s != this.value) {
                this.value = s;
                saveStep(this.root);
            }
            this.input.blur();
        })

        this.value = value;
        this.color = false;

        N.updateLayout(this.root);
    }

    set color(c) {
        this._color = c && !!this._value;
        this.el.className =
            this._value == null ? "nil" :
                c ? "black node" : "red node";
    }

    get color() {
        return this._color
    }

    set value(v: string) {
        if (v == null || v == "" || v == "NIL") {
            this._value = null;
            this.input.innerText = "NIL";
            this.el.className = "nil";

            this.lc && this.lc.delete();
            this.rc && this.rc.delete();
            this.lc = this.rc = null;
        } else {
            this._value = v;
            this.input.innerText = v;

            this.lc || (this.left = new N(""));
            this.rc || (this.right = new N(""));
        }
        this.color = this.color;

        N.updateLayout(this.root);
    }

    get value() {
        return this._value
    }

    set left(n) {
        this.lc && this.lc.delete();
        this.lc = n;
        n && (this.el.appendChild(n.el), n._parent = this)
    }

    set right(n) {
        this.rc && this.rc.delete();
        this.rc = n;
        n && (this.el.appendChild(n.el), n._parent = this)
    }

    get left() {
        return this.lc
    }

    get right() {
        return this.rc
    }

    delete() {
        this.el.parentElement.removeChild(this.el);
        N.updateLayout(this.root);
    }

    get parent() {
        return this._parent;
    }

    get root(): N {
        return this.parent == null ? this : this.parent.root;
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
            let iw = node.input.getBoundingClientRect().width;

            node.el.dataset.w = w.toString();

            let left;
            if(node.value == null) // NIL node
                left = w / 2;
            else    // Non-nil
                left = (+node.left.el.dataset.l + +node.left.el.dataset.w + +node.right.el.dataset.l) / 2;

            node.el.dataset.l = left.toString();
            node.input.style.setProperty("--left", (left - iw / 2).toString());
        }

        // Draw lines
        [root.left, root.right].filter(i => !!i).map(function process(x: N) {
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


    public static parseData(s: string) {
        let i = 0;
        let ss = s.replaceAll("%20", " ");
        return this._parseData(() => i >= ss.length ? null : ss[i++]);
    }

    private static _parseData(next: () => string): N {    // Input: s := - | {s:<text>:s}
        let c1 = next();
        if (c1 == '{') {
            const color = next() == 'b';
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
        return n == null || n.value == null ? '-' : `{${'rb'[+n.color]}:${this.toData(n.left)}:${n.value}:${this.toData(n.right)}}`
    }
}


let r: N;
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
        r.value = t.value;
        r.color = t.color;
        r.left = t.left;
        r.right = t.right;
    }

    N.updateLayout(r);
    document.getElementById('undo').ariaDisabled = "" + !canUndo();
    document.getElementById('redo').ariaDisabled = "" + !canRedo();
}

{
    r = window.location.hash && N.parseData(window.location.hash.substring(1)) || new N(null);

    document.querySelector('.red-black-tree').appendChild(r.el);
    r.value = r.value;

    // @ts-ignore
    window["r"] = r;

    saveStep(r);
}