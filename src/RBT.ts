
class RedBlackTree {
    private root: RBTNode;

    public constructor() {
        this.root = null;
    }

    public add (value: number){
        if (this.root == null) {
            this.root = new RBTNode(value);
            this.root.makeBlack();
        }
        else this._add(this.root, value);
    }

    private _add (parent: RBTNode, value: number){
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

    private fixRedViolation(x: RBTNode) {
        x.parent.isRed && this.rotate(x);
    }

    private rotate(p: RBTNode) {

    }
}

enum Color { RED, BLACK }

class RBTNode {
    private _color: Color;
    private _value: number;

    private _parent: RBTNode;
    private _leftChild: RBTNode;
    private _rightChild: RBTNode;

    get color() {return this._color}
    get value() {return this._value}

    public get parent() { return this._parent }
    public get leftChild() { return this._leftChild }
    public get rightChild () { return this._rightChild }
    public set leftChild(n) { this._leftChild = n; n && (n._parent = this) }
    public set rightChild(n) { this._rightChild = n; n && (n._parent = this) }

    public constructor(value: number) {
        this._value = value;
        this._color = Color.RED;
    }

    public makeRed() { this._color = Color.RED }
    public makeBlack() { this._color = Color.BLACK }
    public get isRed() { return this._color == Color.RED }
    public get isBlack() { return this._color == Color.BLACK }

    public static makeRed(n: RBTNode) { n && n.makeRed() }
    public static makeBlack(n: RBTNode) { n && n.makeBlack() }
    public static isRed(n: RBTNode) { return !this.isBlack(n) }
    public static isBlack(n: RBTNode) {return n == null || n.isBlack }
}
