var Color;
(function (Color) {
    Color["RED"] = "red";
    Color["BLACK"] = "black";
    Color["DOUBLE_BLACK"] = "double-black";
    Color["PLUS_1"] = "plus-1";
    Color["MINUS_1"] = "minus-1";
    Color["PLUS_2"] = "plus-2";
    Color["MINUS_2"] = "minus-2";
    Color["SUBTREE"] = "subtree";
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
        this.menu = document.createElement("div");
        this.menu.className = "node-color";
        this.menu.setAttribute("tabindex", "0");
        for (const color of ["black", "red", "double-black", "minus-1", "plus-1", "minus-2", "plus-2"]) {
            const btn = document.createElement("button");
            btn.className = 'color-btn ' + color;
            btn.setAttribute("tabindex", "0");
            this.menu.appendChild(btn);
            btn.onclick = _ => {
                this.color = color;
            };
        }
        {
            {
                const btn = document.createElement("button");
                btn.className = 'color-btn left-rotate';
                btn.setAttribute("tabindex", "0");
                this.menu.appendChild(btn);
                btn.onclick = _ => {
                    if (this.left.value)
                        this.leftRotate();
                };
            }
            {
                const btn = document.createElement("button");
                btn.className = 'color-btn right-rotate';
                btn.setAttribute("tabindex", "0");
                this.menu.appendChild(btn);
                btn.onclick = _ => {
                    if (this.right.value)
                        this.rightRotate();
                };
            }
        }
        this.menu.style.display = 'none';
        this.node.appendChild(this.menu);
        this.node.oncontextmenu = e => {
            let shouldShow = this.menu.style.display != 'flex';
            document
                .querySelectorAll('div.node-color')
                .forEach(i => i.style.display = 'none');
            this.menu.style.display = shouldShow ? 'flex' : 'none';
            e.preventDefault();
        };
        this.input.onkeydown = e => {
            var _a, _b;
            if (e.key == "Enter") {
                let s = this.input.innerText.trim();
                if (s != this.value) {
                    this.value = s;
                }
                this.node.blur();
                e.preventDefault();
            }
            else if (e.ctrlKey && e.key.match(/^[1-8]$/g)) {
                this.color = ["black", "red", "double-black", "minus-1", "plus-1", "minus-2", "plus-2", "subtree"][+e.key - 1];
                e.preventDefault();
                console.log(e.key);
            }
            else if (e.ctrlKey && e.key == 'Backspace') {
                this.color = "nil";
                e.preventDefault();
            }
            else if (e.key.length == 1 && !e.ctrlKey &&
                !(this.input.innerText.length < 9 && e.key.match(/^[a-zA-Z0-9.\- ]$/)))
                e.preventDefault();
            else if (e.ctrlKey && e.key == "ArrowLeft") {
                ((_a = this.right) === null || _a === void 0 ? void 0 : _a.value) && this.rightRotate();
            }
            else if (e.ctrlKey && e.key == "ArrowRight") {
                ((_b = this.left) === null || _b === void 0 ? void 0 : _b.value) && this.leftRotate();
            }
            N.updateLayout(this.root);
        };
        this.input.addEventListener('focusout', _ => {
            let s = this.input.innerText.trim();
            if (s != this.value) {
                this.value = s;
            }
            N.updateLayout(this.root);
        });
        this._setColor("nil");
        this._setValue(value);
        N.updateLayout(this.root);
    }
    set color(c) {
        this._setColor(c);
        saveStep(this.root);
    }
    _setColor(c) {
        this._color = c;
        this.el.className = this._color == "nil" ? 'nil' : 'node ' + this._color;
        if ((c != "nil" && c != "double-black" && c != "subtree") && this.value == null)
            this.value = "0";
        else if (c == "nil" && this.value != null)
            this.value = null;
    }
    get color() {
        return this._color;
    }
    set value(v) {
        this._setValue(v);
        saveStep(this.root);
    }
    _setValue(v) {
        if (v == null || v == "" || v == "NIL") {
            this._value = null;
            this.input.innerText = "NIL";
            if (this.color != "nil" && !(this.color == "double-black" && !this.value))
                this.color = "nil";
            this.lc && this.lc.removeFromParent();
            this.rc && this.rc.removeFromParent();
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
    leftRotate() {
        const p = this.left;
        this.left = p.right;
        if (this.parent == null) {
            this.el.parentElement.appendChild(p.el);
            this.el.parentElement.removeChild(this.el);
            window["r"] = p;
            p.parent = null;
        }
        else if (this == this.parent.left) {
            this.parent.left = p;
        }
        else if (this == this.parent.right) {
            this.parent.right = p;
        }
        else {
            throw "What the poop";
        }
        p.right = this;
        saveStep(this.root);
    }
    rightRotate() {
        const p = this.right;
        this.right = p.left;
        if (this.parent == null) {
            this.el.parentElement.appendChild(p.el);
            this.el.parentElement.removeChild(this.el);
            window["r"] = p;
            p.parent = null;
        }
        else if (this == this.parent.right) {
            this.parent.right = p;
        }
        else if (this == this.parent.left) {
            this.parent.left = p;
        }
        else {
            throw "What the poop";
        }
        p.left = this;
        saveStep(this.root);
    }
    set left(n) {
        var _a;
        this.lc && (this.lc._parent = null);
        (_a = this.lc) === null || _a === void 0 ? void 0 : _a.removeFromDOM();
        this.lc = n;
        n && (n.parent = this);
    }
    set right(n) {
        var _a;
        this.rc && (this.rc._parent = null);
        (_a = this.rc) === null || _a === void 0 ? void 0 : _a.removeFromDOM();
        this.rc = n;
        n && (n.parent = this);
    }
    get left() {
        return this.lc;
    }
    get right() {
        return this.rc;
    }
    removeFromParent() {
        var _a, _b;
        if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.left) == this)
            this.parent.left = null;
        if (((_b = this.parent) === null || _b === void 0 ? void 0 : _b.right) == this)
            this.parent.right = null;
    }
    removeFromDOM() {
        var _a;
        (_a = this.el.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.el);
    }
    get parent() {
        return this._parent;
    }
    set parent(p) {
        this.removeFromParent();
        if (p) {
            if (this == p.lc) {
                p.node.insertAdjacentElement('afterend', this.el);
            }
            else
                p.el.appendChild(this.el);
        }
        this._parent = p;
    }
    get root() {
        var _a, _b;
        return (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.root) !== null && _b !== void 0 ? _b : this;
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
        (function process(x) {
            if (x.parent) {
                const [xe, pe] = [x.node, x.parent.node];
                const [pr, xr] = [xe, pe].map(i => i.getBoundingClientRect());
                const [pc, xc] = [pr, xr].map(i => [i.x + i.width / 2, i.y + i.height / 2]);
                const [dx, dy] = [xc[0] - pc[0], xc[1] - pc[1]];
                x.el.style.setProperty("--l", Math.sqrt(dx * dx + dy * dy) + "px");
                x.el.style.setProperty("--theta", Math.atan2(dy, dx) + "rad");
            }
            else {
                x.el.style.setProperty("--l", "0");
                x.el.style.setProperty("--theta", "0");
            }
            x.left && process(x.left);
            x.right && process(x.right);
        })(root);
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
                R: "minus-2",
                s: "subtree",
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
            ["subtree"]: 's',
        }[n.color]}:${this.toData(n.left)}:${n.value}:${this.toData(n.right)}}`;
    }
}
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
        window["r"].value = t.value;
        window["r"].color = t.color;
        window["r"].left = t.left;
        window["r"].right = t.right;
    }
    document.getElementById('undo').ariaDisabled = "" + !canUndo();
    document.getElementById('redo').ariaDisabled = "" + !canRedo();
}
{
    window["r"] = window.location.hash && N.parseData(window.location.hash.substring(1)) || new N(null);
    document.querySelector('.red-black-tree').appendChild(window["r"].el);
    saveStep(window["r"]);
    document.body.onclick = _ => document
        .querySelectorAll('div.node-color')
        .forEach(i => i.style.display = 'none');
    setInterval(() => N.updateLayout(window["r"].root), 100);
}
//# sourceMappingURL=script.js.map