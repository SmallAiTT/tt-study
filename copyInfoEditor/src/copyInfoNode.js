var t_copy = function(displayID, relateID){
    this.tag = 0;
    this.displayID = displayID | 0;
    this.relateID = relateID | 0;
    this.pos = null;
    this.connectNodesID = [];
    this.connectParentID = null;
    this.icon = null;
};

var CopyNodeSize = {
    big: "big.png",
    mid: "mid.png",
    small: "small.png"
};

var copyInfoNode = cc.Node.extend({
    _labelTTF: null,
    firstPos: null,
    _isNewObj: null,
    _dragging: false,
    _curDraggingNode: null,
    _originColor:null,
    _selectedColor:null,
    _curColor:null,
    delegate: null,
    connectChildren: null,
    connectors: null,
    connectParent: null,
    t_copy:null,
    _icon:null,
    _iconRadious:null,
    _whiteIconRadious:10,

    ctor: function () {
        this._super();
        this.connectChildren = [];
        this.connectors = [];

        this._curColor = this._originColor = new cc.Color4B(91, 191, 91, 128);
        this._selectedColor = new cc.Color4B(236, 88, 73, 128);
        this.t_copy = new t_copy(0,0);

        this._icon = CopyNodeSize.mid;
        var sp = cc.Sprite.create(this._icon);
        var size = sp.getContentSize(), glView = cc.Director.getInstance().getOpenGLView();
        // 还原到真实的size
        size = cc.size(size.width * glView.getScaleX(), size.height * glView.getScaleY());
        // 取半径
        this._iconRadious = Math.sqrt(size.width*size.width + size.height*size.height) * 0.5;
        this.t_copy.icon = this._icon;
        sp.setTag(1234);
        sp.setZOrder(-1000);
        this.addChild(sp);

        this.setTag(nodeId++);
    },

    setIcon: function(icon){
        if(this._icon == icon) return;
        switch (icon) {
            case CopyNodeSize.big:
            case CopyNodeSize.mid:
            case CopyNodeSize.small:
                this.removeChildByTag(1234);
                this._icon = icon;
                this.t_copy.icon = icon;
                var sp = cc.Sprite.create(this._icon);
                var size = sp.getContentSize(), glView = cc.Director.getInstance().getOpenGLView();
                // 还原到真实的size
                size = cc.size(size.width * glView.getScaleX(), size.height * glView.getScaleY());
                // 取半径
                this._iconRadious = Math.sqrt(size.width*size.width + size.height*size.height) * 0.5;
                sp.setZOrder(-1000);
                sp.setTag(1234);
                this.addChild(sp);
                break;
        }
    },

    setDisplayID:function(displayID){
        this.t_copy.displayID = displayID;
        this._labelTTF.setString(displayID);
    },
    setRelateID:function(relateID){
        this.t_copy.relateID = relateID;
    },
    init: function () {
        this._super();
        cc.registerTargetedDelegate(-10, true, this);

        this._labelTTF = cc.LabelTTF.create("0", "Arial", 56);
        this._labelTTF.setColor(cc.BLACK);
        this.addChild(this._labelTTF, 100);

        this.setContentSize(cc.size(180, 180));
    },
    normalColor:function(){
        this._curColor = this._originColor;
    },
    selectedColor:function(){
        this._curColor = this._selectedColor;
    },
    getDelegate: function () {
        return this.delegate;
    },
    setDelegate: function (delegate) {
        this.delegate = delegate;
    },
    onTouchBegan: function (touch) {
        this.firstPos = touch.getLocation();
        var p = this.convertToWorldSpace(cc.p(0, 0));
        var s = this.getContentSize();
        var box1 = cc.rect(p.x - this._whiteIconRadious, p.y - this._whiteIconRadious, this._whiteIconRadious*2, this._whiteIconRadious*2);
        var box2 = cc.rect(p.x - s.width / 2, p.y - s.width / 2, s.width, s.height);
        if (cc.rectContainsPoint(box1, this.firstPos)) {
            this._isNewObj = true;
            return true;
        }
        else if (cc.rectContainsPoint(box2, this.firstPos)) {
            this._isNewObj = false;
            this.getDelegate().setCurSelectNode(this);
            return true;
        }
    },
    onTouchMoved: function (touch) {
        var targetNode;
        if (this._isNewObj) {
            if (!this._dragging) {
                this._dragging = true;
                var id = this.t_copy.displayID;
                var curDraggingNode = this.delegate.newCopyNode(parseInt(id)+1);
                curDraggingNode.setPosition(this.getPosition());
                curDraggingNode.firstPos = this.firstPos;
                curDraggingNode.connectParent = this;
                var c = cc.Sprite.create("connector.png");
                this.addChild(c);
                this.connectors.push(c);
                this.connectChildren.push(curDraggingNode);
                this.delegate.setCurSelectNode(curDraggingNode);
                this._curDraggingNode = curDraggingNode;
            }

            targetNode = this._curDraggingNode;
        }
        else {
            targetNode = this;
        }

        var diffPos = cc.pSub(targetNode.firstPos, touch.getLocation());
        var myPos = cc.pSub(targetNode.getPosition(), diffPos);
        targetNode.setPosition(myPos);
        targetNode.firstPos = touch.getLocation();
    },
    onTouchEnded: function (touch) {
        this._dragging = false;
        this._isNewObj = null;
        this._curDraggingNode = null;

        var delegate = this.delegate;

        var pos = this.getPosition();
        var layerPos = delegate.getPosition();
        if (cc.rectContainsPoint(cc.rect(-layerPos.x, layerPos.y, 200, 200), pos)) {
            this.removeSelf();
        }

        delegate.setBeModified();
    },
    removeSelf: function () {
        if (this.getTag() !== 999) {
            this.delegate.removeRelatedNode(this);
        }
        else {
            var _originPosition = this.getPosition();
            this.runAction(cc.MoveTo.create(0.5, _originPosition));
            alert("草~根节点不能删除啊亲");
        }
    },

    getIconRadious:function(){
        return this._iconRadious;
    },

    updateConnection: function () {
        var connectChildren = this.connectChildren,
            connectors = this.connectors,
            connectSprite,
            diff, connector, angle, vector, startPos, endPos, offset1, offset2;
        for (var j = 0; j < connectChildren.length; j++) {
            connectSprite = connectChildren[j];
            connector = connectors[j];
            vector = cc.pNormalize(cc.pSub(connectSprite.getPosition(), this.getPosition()));
            offset1 = cc.pMult(vector, this.getIconRadious());
            offset2 = cc.pMult(vector, connectSprite.getIconRadious());
            startPos = cc.pAdd(this.getPosition(), offset1);
            endPos = cc.pSub(connectSprite.getPosition(), offset2);
            diff = cc.pSub(endPos, startPos);
            connector.setPosition(cc.pAdd(offset1, cc.pMult(diff, 0.5)));
            angle = cc.kmRadiansToDegrees(cc.pToAngle(vector));
            connector.setRotation(-angle);
        }
    },

    draw: function(){
        this.updateConnection();
        var drawingUtil = cc.drawingUtil;
        var color = this._curColor;
        // 画大圆圈
        drawingUtil.setDrawColor4B(color.r, color.g, color.b, color.a);
        drawingUtil.drawPoint(cc.p(0, 0), this._iconRadious);
        // 画白色小圆圈
        drawingUtil.setDrawColor4B(255, 255, 255, 128);
        drawingUtil.drawPoint(cc.p(0, 0), this._whiteIconRadious*2);
    }
});

copyInfoNode.create = function () {
    var c = new copyInfoNode();
    c.init();
    return c;
};