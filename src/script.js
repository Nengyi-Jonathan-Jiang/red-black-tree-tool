var Color;
(function (Color) {
    Color["RED"] = "red";
    Color["BLACK"] = "black";
    Color["DOUBLE_BLACK"] = "double-black";
    Color["PLUS_1"] = "plus-1";
    Color["MINUS_1"] = "minus-1";
    Color["PLUS_2"] = "plus-2";
    Color["MINUS_2"] = "minus-2";
    Color["NIL"] = "nil";
})(Color || (Color = {}));
class N {
    constructor(value) {
        this.el = document.createElement("div");
        this.node = document.createElement("span");
        this.node.className = "value-input";
        this.el.appendChild(this.node);
        this.input = document.createElement("span");
        this.input.className = "value-input-text";
        this.input.setAttribute("spellcheck", "false");
        this.input.setAttribute("contenteditable", "true");
        this.node.appendChild(this.input);
        this.changeColorEl = document.createElement("div");
        this.changeColorEl.className = "node-color";
        this.changeColorEl.setAttribute("tabindex", "0");
        for (const color of ["red", "black", "double-black", "minus-1", "plus-1", "minus-2", "plus-2", "nil"]) {
            const btn = document.createElement("button");
            btn.className = 'color-btn ' + color;
            btn.setAttribute("tabindex", "0");
            this.changeColorEl.appendChild(btn);
            btn.onclick = _ => {
                this.color = color;
                saveStep(this.root);
            };
        }
        this.changeColorEl.style.display = 'none';
        this.node.appendChild(this.changeColorEl);
        this.node.oncontextmenu = e => {
            let shouldShow = this.changeColorEl.style.display != 'flex';
            document
                .querySelectorAll('div.node-color')
                .forEach(i => i.style.display = 'none');
            this.changeColorEl.style.display = shouldShow ? 'flex' : 'none';
            e.preventDefault();
        };
        this.input.onkeydown = e => {
            if (e.key == "Enter") {
                let s = this.input.innerText.trim();
                if (s != this.value) {
                    this.value = s;
                    saveStep(this.root);
                }
                this.node.blur();
                e.preventDefault();
                N.updateLayout(this.root);
            }
            else if (e.ctrlKey && e.key.match(/^[1-7]$/g)) {
                this.color = ["black", "red", "double-black", "minus-1", "plus-1", "minus-2", "plus-2", "nil"][+e.key - 1];
                e.preventDefault();
            }
            else if (e.ctrlKey && e.key == 'Backspace') {
                this.color = "nil";
            }
            else if (e.key.length == 1 && !e.ctrlKey &&
                !(this.input.innerText.length < 9 && e.key.match(/^[a-zA-Z0-9.\- ]$/)))
                e.preventDefault();
            N.updateLayout(this.root);
        };
        this.input.addEventListener('focusout', _ => {
            let s = this.input.innerText.trim();
            if (s != this.value) {
                this.value = s;
                saveStep(this.root);
            }
            N.updateLayout(this.root);
        });
        this.color = "nil";
        this.value = value;
        N.updateLayout(this.root);
    }
    set color(c) {
        this._color = c;
        this.el.className = this._color == "nil" ? 'nil' : 'node ' + this._color;
        if (c != "nil" && this.value == null)
            this.value = "0";
        else if (c == "nil" && this.value != null)
            this.value = null;
    }
    get color() {
        return this._color;
    }
    set value(v) {
        if (v == null || v == "" || v == "NIL") {
            this._value = null;
            this.input.innerText = "NIL";
            if (this.color != "nil")
                this.color = "nil";
            this.lc && this.lc.delete();
            this.rc && this.rc.delete();
            this.lc = this.rc = null;
        }
        else {
            if (this.color == "nil")
                this.color = "black";
            this._value = v;
            this.input.innerText = v;
            this.lc || (this.left = new N(""));
            this.rc || (this.right = new N(""));
        }
        N.updateLayout(this.root);
    }
    get value() {
        return this._value;
    }
    set left(n) {
        this.lc && this.lc.delete();
        this.lc = n;
        n && (this.el.appendChild(n.el), n._parent = this);
    }
    set right(n) {
        this.rc && this.rc.delete();
        this.rc = n;
        n && (this.el.appendChild(n.el), n._parent = this);
    }
    get left() {
        return this.lc;
    }
    get right() {
        return this.rc;
    }
    delete() {
        this.el.parentElement.removeChild(this.el);
        N.updateLayout(this.root);
    }
    get parent() {
        return this._parent;
    }
    get root() {
        return this.parent == null ? this : this.parent.root;
    }
    get reverseLevelOrderTraversal() {
        const S = [];
        const Q = [];
        Q.push(this);
        while (Q.length) {
            const node = Q.shift();
            S.push(node);
            node.left && Q.push(node.left);
            node.right && Q.push(node.right);
        }
        return S;
    }
    static updateLayout(root) {
        for (const node of root.reverseLevelOrderTraversal) {
            let w = node.el.getBoundingClientRect().width;
            let iw = node.node.getBoundingClientRect().width;
            node.el.dataset.w = w.toString();
            let left;
            if (node.value == null)
                left = w / 2;
            else
                left = (+node.left.el.dataset.l + +node.left.el.dataset.w + +node.right.el.dataset.l) / 2;
            node.el.dataset.l = left.toString();
            node.node.style.setProperty("--left", (left - iw / 2).toString());
        }
        [root.left, root.right].filter(i => !!i).forEach(function process(x) {
            const [xe, pe] = [x.node, x.parent.node];
            const [pr, xr] = [xe, pe].map(i => i.getBoundingClientRect());
            const [pc, xc] = [pr, xr].map(i => [i.x + i.width / 2, i.y + i.height / 2]);
            const [dx, dy] = [xc[0] - pc[0], xc[1] - pc[1]];
            x.el.style.setProperty("--l", Math.sqrt(dx * dx + dy * dy) + "px");
            x.el.style.setProperty("--theta", Math.atan2(dy, dx) + "rad");
            x.left && process(x.left);
            x.right && process(x.right);
        });
    }
    static parseData(s) {
        let i = 0;
        let ss = s.replaceAll("%20", " ");
        return this._parseData(() => i >= ss.length ? null : ss[i++]);
    }
    static _parseData(next) {
        let c1 = next();
        if (c1 == '{') {
            const color = {
                b: "black",
                B: "double-black",
                a: "red",
                n: "nil",
                l: "plus-1",
                L: "plus-2",
                r: "minus-1",
                R: "minus-2"
            }[next()];
            next();
            const left = this._parseData(next);
            next();
            let val = "", c;
            while ((c = next()) && c != ":")
                val += c;
            const right = this._parseData(next);
            next();
            const res = new N(val);
            res.color = color;
            res.left = left;
            res.right = right;
            return res;
        }
        else if (c1 == '-') {
            return new N("");
        }
        return null;
    }
    static toData(n) {
        return n == null || n.value == null ? '-' : `{${{
            ["black"]: 'b',
            ["double-black"]: 'B',
            ["red"]: 'a',
            ["nil"]: 'n',
            ["plus-1"]: 'l',
            ["plus-2"]: 'L',
            ["minus-1"]: 'r',
            ["minus-2"]: 'R',
        }[n.color]}:${this.toData(n.left)}:${n.value}:${this.toData(n.right)}}`;
    }
}
let r;
let currStep = -1;
const steps = [];
let lastStep = null;
function saveStep(n) {
    let d = N.toData(n);
    if (d == lastStep)
        return;
    steps.splice(currStep + 1);
    steps.push(N.toData(n));
    currStep++;
    updateAfterStep(false);
}
function undo() {
    canUndo() && currStep--, updateAfterStep();
}
function redo() {
    canRedo() && currStep++, updateAfterStep();
}
function canUndo() {
    return currStep > 0;
}
function canRedo() {
    return currStep + 1 < steps.length;
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
    window["r"] = r;
    saveStep(r);
    document.body.onclick = _ => document
        .querySelectorAll('div.node-color')
        .forEach(i => i.style.display = 'none');
}
//# sourceMappingURL=script.js.map