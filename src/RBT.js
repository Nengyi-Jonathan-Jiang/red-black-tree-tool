class RedBlackTree {
    constructor() {
        this.root = null;
    }
    add(value) {
        if (this.root == null) {
            this.root = new RBTNode(value);
            this.root.makeBlack();
        }
        else
            this._add(this.root, value);
    }
    _add(parent, value) {
        if (RBTNode.isRed(parent.leftChild) || RBTNode.isRed(parent.rightChild)) {
            parent.makeRed();
            RBTNode.makeRed(parent.leftChild);
            RBTNode.makeRed(parent.rightChild);
            this.fixRedViolation(parent);
        }
        value < parent.value
            ? parent.leftChild
                ? this._add(parent.leftChild, value)
                : parent.leftChild = new RBTNode(value)
            : parent.rightChild
                ? this._add(parent.rightChild, value)
                : parent.rightChild = new RBTNode(value);
    }
    fixRedViolation(x) {
        x.parent.isRed && this.rotate(x);
    }
    rotate(p) {
    }
}
var Color;
(function (Color) {
    Color[Color["RED"] = 0] = "RED";
    Color[Color["BLACK"] = 1] = "BLACK";
})(Color || (Color = {}));
class RBTNode {
    constructor(value) {
        this._value = value;
        this._color = Color.RED;
    }
    get color() { return this._color; }
    get value() { return this._value; }
    get parent() { return this._parent; }
    get leftChild() { return this._leftChild; }
    get rightChild() { return this._rightChild; }
    set leftChild(n) { this._leftChild = n; n && (n._parent = this); }
    set rightChild(n) { this._rightChild = n; n && (n._parent = this); }
    makeRed() { this._color = Color.RED; }
    makeBlack() { this._color = Color.BLACK; }
    get isRed() { return this._color == Color.RED; }
    get isBlack() { return this._color == Color.BLACK; }
    static makeRed(n) { n && n.makeRed(); }
    static makeBlack(n) { n && n.makeBlack(); }
    static isRed(n) { return !this.isBlack(n); }
    static isBlack(n) { return n == null || n.isBlack; }
}
//# sourceMappingURL=RBT.js.map