var fs = require("fs");
var path = require("path");

PropertyEditor = cc.Class.extend({
    _propertyBox:null,
    _projConfig:null,

    selectedCopyNode:null,
    displayID:null,
    relateID:null,
    copyInfoName:null,

    btnSaveToLocal:null,
    btnNewFile:null,
    btnCloseFile:null,
    btnOpenFile:null,

    inputSavePath:null,
    inputOpenFilePath:null,
    curNodeOnEditor:null,
    curSavePath:"",
    labelSaveResult:null,

    texSize1: null,
    texSize2: null,
    textSize3: null,

    init : function(){
        this._projConfig = cc.$("#projConfig");
        this._propertyBox = cc.$("#property");


        this.selectedCopyNode = cc.$("#selectedCopyNode");
        this.displayID = cc.$("#displayID");
        this.relateID = cc.$("#relateID");
        this.copyInfoName = cc.$("#copyInfoName");

        this.btnSaveToLocal = cc.$("#saveToLocal");
        this.btnOpenFile = cc.$("#openFile");
        this.btnCloseFile = cc.$("#closeFile");
        this.btnNewFile = cc.$("#newFile");

        this.inputSavePath = cc.$("#savePath");
        this.inputOpenFilePath = cc.$("#openFilePath");
        this.labelSaveResult = cc.$("#saveResult");



        this.texSize1 = cc.$("#texSize1");
        this.texSize2 = cc.$("#texSize2");
        this.texSize3 = cc.$("#texSize3");

        this.texRadious = cc.$("#texRadious");

        var that = this;

        this.texSize1.addEventListener("click", function(){
            that.curNodeOnEditor.setIcon(CopyNodeSize.big);
        });
        this.texSize2.addEventListener("click", function(){
            that.curNodeOnEditor.setIcon(CopyNodeSize.mid);
        });
        this.texSize3.addEventListener("click", function(){
            that.curNodeOnEditor.setIcon(CopyNodeSize.small);
        });

        this.displayID.addEventListener("blur",function(){
            that.curNodeOnEditor.setDisplayID(this.value);
        });

        this.relateID.addEventListener("blur",function(){
            that.curNodeOnEditor.setRelateID(this.value);
        });

        this.btnSaveToLocal.addEventListener("click",function(){
            that.saveToLocal();
        });

        this.btnOpenFile.addEventListener("click",function(){
            that.openFile();
        });

        this.btnCloseFile.addEventListener("click",function(){
            that.closeFile();
        });

        this.btnNewFile.addEventListener("click",function(){
            that.newFile();
        });

        this.inputSavePath.addEventListener("change", function() {
            that.curSavePath = this.value;
            this.value = "";

            that.saveToLocal();
        });

        this.inputOpenFilePath.addEventListener("change", function() {
            that._readFile(this.value);
            this.value = "";
        });
    },

    showInfo:function(node){
        this.displayID.blur();
        this.relateID.blur();

        this.curNodeOnEditor = node;
        var info = this.curNodeOnEditor.t_copy;
        this.selectedCopyNode.innerHTML = this.curNodeOnEditor.__instanceId;
        this.displayID.value = info.displayID;
        this.relateID.value = info.relateID

        this.texSize1.checked = false;
        this.texSize2.checked = false;
        this.texSize3.checked = false;
        switch(info.icon){
            case CopyNodeSize.big:
                this.texSize1.checked = true;
                break;
            case CopyNodeSize.mid:
                this.texSize2.checked = true;
                break;
            case CopyNodeSize.small:
                this.texSize3.checked = true;
                break;
        }
    },
    saveEveryTenSec:function(){
        var data = this._saveInfo();
        sys.localStorage.setItem("t_copy", data);
    },
    newFile:function(){
        this.curSavePath = "";
        this.copyInfoName.value = "Untitled File";
        this.displayID.value = "0";
        this.relateID.value = "0";
        this.btnCloseFile.removeAttribute("disabled");
        this.btnSaveToLocal.removeAttribute("disabled");

        CopyInfoLayer.getInstance().reset();
    },
    closeFile:function(){
        this.curSavePath = "";
        this.copyInfoName.value = "";
        this.displayID.value = "";
        this.relateID.value = "";
        this.btnCloseFile.setAttribute("disabled","disabled");
        this.btnSaveToLocal.setAttribute("disabled","disabled");

        CopyInfoLayer.getInstance().removeAllChildren();
    },
    _readFile:function(path){
        var buff = fs.readFileSync(path);
        var data = JSON.parse(buff.toString());

        this.copyInfoName.value = data.title;
        this.displayID.value = "0";
        this.relateID.value = "0";
        this.btnCloseFile.removeAttribute("disabled");
        this.btnSaveToLocal.removeAttribute("disabled");
        this.curSavePath = path;

        CopyInfoLayer.getInstance().rebuildFromData(data);
    },
    openFile:function(){
        this.inputOpenFilePath.click();
    },

    saveToLocal:function(){
        var data = this._saveInfo();
        var that = this;
        if(this.curSavePath == ""){
            this.inputSavePath.click();
        }
        else{
            fs.writeFile(this.curSavePath, data, function(){
                that.labelSaveResult.innerHTML = "保存成功哦~亲~";
                setTimeout(function(){
                    that.labelSaveResult.innerHTML = "";
                },5000)
            });

        }
    },

    _saveInfo:function(){
        var data = copyInfoData;
        data.title = this.copyInfoName.value;
        data.copyInfoNode = [];

        var copyInfoLayer = CopyInfoLayer.getInstance();
        var children = copyInfoLayer.getChildren();
        var obj,tmpNode;

        for (var i = 0; i < children.length; i++) {
            obj = children[i];
            obj.t_copy.connectNodesID =[];
            obj.t_copy.pos = obj.getPosition();
            obj.t_copy.tag = obj.getTag();
            obj.t_copy.connectParentID = obj.connectParent.getTag();

            for (var j = 0; j < obj.connectChildren.length; j++) {
                tmpNode = obj.connectChildren[j];
                obj.t_copy.connectNodesID.push(tmpNode.getTag());
            }
            data.copyInfoNode.push(obj.t_copy);
        }
        return JSON.stringify(data);
    }
});

PropertyEditor.getInstance = function(){
    if(!this._instance){
        this._instance = new PropertyEditor();
        this._instance.init();
    }
    return this._instance;
};