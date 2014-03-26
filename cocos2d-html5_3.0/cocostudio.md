cocostudio
===================

# cocostudio编辑器改进构想

cocostudio的ui编辑器，如果能够支持类似于cocosbuild里面的事件注册功能就好了。

现在通过ui编辑器编辑按键的时候，只能有一个勾选项来决定是否可点击。单纯是这样的功能的话就太弱了。

其实通用的需求个人觉得应该是这样的：

1) 通过ui编辑器构建出游戏ui视图。

2) 在代码中，大部分情况下，我不需要关注各个ui的表现，例如位置、旋转等，因为这些ui编辑器已经帮我们做了，我只关心事件注册。

所以，个人认为代码应该是这么写的（这里只是表达一个意思，并不是用实际ch5的接口来写）：

```
var widget = ccui.genWidget("res/widget01.json");//生成widget
layer.addChild(widget);//设置到具体的node里面
//接下来只管注册事件
widget.registerController({
    "onOpen" : function(){},
    "onClose" : function(){}
});
```

个人的想法是，事件的注册可以通过生成的这个widget来注册，其子节点共享这个controller（可以实现成跟ccb3.0中的一样，里面再用一个Class裹一下）。

个人觉得现在的这种实现方式，我要想注册一个按键事件，会很繁琐：

```
var widget = ccs.uiReader.widgetFromJsonFile(res.uiBagEqupmentDetailLayer_ExportJson);
layer.addChild(widget);
var bg = widget.getChildByName("bg");
var btnClose = bg.getChildByName("btnClose");
btnClose.addTouchEventListener(function(){
    console.log("close!!!")
}, self);
```

这里，我必须关心到各个node的父子关系已获取到btn，然后还要知道如何为这个btn设置事件（addTouchEventListener）。这样体验就很不好了。

通常情况下，我只是想关心注册怎样的事件而已。

当然，如果想像现在这样，灵活度很高的处理，也行，还是原来的操作，获取到之后爱咋整咋整。

然后，要获取到某个node也很麻烦，必须要确切知道父子关系才能获取到。应该提供一个额外的方法，来满足常用的需求：

```
var btnClose = widget.getWidget("btnClose");
```


# GUITest问题

个人觉得，如果是单纯只是GUI的测试例，那么就不该添加ccs的东西，例如以下代码：

```
var widget = ccs.uiReader.widgetFromJsonFile("res/cocosui/UITest/UITest.json");
```