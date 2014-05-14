/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var nodeId = 1000;
var history = [];

var CopyInfoLayer = cc.Layer.extend({
    firstPos: 1,
    curSelectNode: null,
    preKey: null,
    time:0,
    beModified:false,

    init: function () {
        this._super();
        this.setTouchEnabled(true);
        this.setKeyboardEnabled(true);
        this.scheduleUpdate();
        var copyInfoData = sys.localStorage.getItem("t_copy");
        if(copyInfoData != null){
            this.rebuildFromData(JSON.parse(copyInfoData));
            var children = this.getChildren();
            this.setCurSelectNode(children[children.length-1]);
        }
        else{
            this.reset();
        }
    },
    reset:function(){
        this.removeAllChildren();

        var s = cc.Director.getInstance().getWinSize();
        var firstNode = this.newCopyNode(1);
        firstNode.setPosition(cc.p(200, 913/2));
        firstNode.setTag(999);
        firstNode.connectParent = this;
        this.setCurSelectNode(firstNode);
    },
    newCopyNode: function (id, radious) {
        var firstNode = copyInfoNode.create();
        firstNode.setDelegate(this);
        if(id){
            firstNode.setDisplayID(parseInt(id));
        }else{
            firstNode.setDisplayID("");
        }

        this.addChild(firstNode);

        return firstNode;
    },
    setCurSelectNode: function (node) {
        if (this.curSelectNode) {
            this.curSelectNode.normalColor();
        }
        node.selectedColor();
        this.curSelectNode = node;

        PropertyEditor.getInstance().showInfo(this.curSelectNode);
    },
    removeRelatedNode: function (node) {
        if(node.connectParent){
            var connectSprite, connectChildren1 = node.connectParent.connectChildren,
                connectors = node.connectParent.connectors;
            for (var k = 0; k < connectChildren1.length; k++) {
                connectSprite = connectChildren1[k];
                if (connectSprite == node) {
                    cc.ArrayRemoveObject(connectChildren1, connectSprite);
                    this._removeSelftNodes(connectSprite);
                    connectors.pop().removeFromParent(true);
                }
            }
        }
        else{
            this._removeSelftNodes(node);
        }
    },
    _removeSelftNodes: function (node) {
        node.removeFromParent(true);
        var connectSprite, connectChildren = node.connectChildren;
        for (var j = 0; j < connectChildren.length; j++) {
            connectSprite = connectChildren[j];
            this._removeSelftNodes(connectSprite);
        }
    },

    onKeyDown: function (e) {
        if (e == cc.KEY.backspace || e == cc.KEY.Delete) {
            this.curSelectNode.removeSelf();
        }

        if (((this.preKey == 91 || this.preKey == cc.KEY.ctrl) && e == cc.KEY.z) ||
            (this.preKey == cc.KEY.z && (this.preKey == 91 || this.preKey == cc.KEY.ctrl)) ||
            (this.preKey == cc.KEY.z && this.preKey == cc.KEY.z)) {
            var children = this.getChildren();
            var sprite = children[children.length - 1];
            sprite.removeSelf();
        }

        if (((this.preKey == 91 || this.preKey == cc.KEY.ctrl) && e == cc.KEY.s) ||
            (this.preKey == cc.KEY.s && (this.preKey == 91 || this.preKey == cc.KEY.ctrl))) {
            PropertyEditor.getInstance().saveToLocal();
        }

        this.preKey = e;
    },
    onKeyUp: function (e) {
        this.preKey = null;
    },
    onTouchesBegan: function (touches) {
        this.firstPos = touches[0].getLocation();
    },
    onTouchesMoved: function (touches) {
        var diffPos = cc.pSub(this.firstPos, touches[0].getLocation());
        var myPos = cc.pSub(this.getPosition(), diffPos);
        if (myPos.x <= 0) {
            this.setPositionX(myPos.x);
        }

        this.firstPos = touches[0].getLocation();
    },

    rebuildFromData:function(data){
        this.removeAllChildren();
        this.curSelectNode = null;

        var nodes = data.copyInfoNode,node,sprite,connectNodesID,connectSprite;
        for (var i = 0; i < nodes.length; i++) {
            node = nodes[i];
            sprite =  this.newCopyNode(node.displayID);
            sprite.setRelateID(node.relateID);
            sprite.setTag(node.tag);
            sprite.setPosition(node.pos);
            sprite.setIcon(node.icon);
        }

        for (var j = 0; j < nodes.length; j++) {
            connectNodesID = nodes[j].connectNodesID;
            sprite  = this.getChildByTag(nodes[j].tag);
            var parent = this.getChildByTag(nodes[j].connectParentID);
            sprite.connectParent = parent ? parent : this;

            for (var k = 0; k < connectNodesID.length; k++) {
                connectSprite = this.getChildByTag(connectNodesID[k]);
                var c = cc.Sprite.create("connector.png");
                sprite.addChild(c);
                sprite.connectors.push(c);
                sprite.connectChildren.push(connectSprite);
            }
            sprite.updateConnection();
        }
    },

    update:function(dt){
        this.time+=dt;
        if(this.time > 5 && this.beModified){
            this.time = 0;
            this.beModified = false;
            PropertyEditor.getInstance().saveEveryTenSec();
        }
    },
    setBeModified:function(){
        this.beModified = true;
    }
});

CopyInfoLayer.getInstance = function () {
    if (!this._instance) {
        this._instance = new CopyInfoLayer();
        this._instance.init();
    }
    return  this._instance;
};

var BgLayer = cc.LayerColor.extend({
    init: function () {
        this._super(cc.c4b(200, 200, 200, 255));
    },

    draw: function(){
        this._super();
        var drawingUtil = cc.drawingUtil;
        drawingUtil.setDrawColor4B(0, 0, 0, 255);
        drawingUtil.setLineWidth(20);
        var s = cc.Director.getInstance().getWinSize();
        drawingUtil.drawLine(cc.p(0,913), cc.p(s.width, 913));
    }
});

var CopyInfoScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var bg = new BgLayer;
        bg.init();
        this.addChild(bg);
        var copyInfoLayer = CopyInfoLayer.getInstance();
        this.addChild(copyInfoLayer);
    }

});
