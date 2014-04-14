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

个人觉得，既然有了编辑器，那么，程序员在大多数情况下时不需要关心其ui表现的，还要关心事件处理就好了。
ui的表现由编辑这个ui的人（有可能是程序员也有可能是美术）去关心就好了。
如果程序员还要去关心ui的细节，例如父子结构等，那么耦合就太大了。那天ui的树状结构被调整了，程序还得改一次。实在蛋疼。

# GUITest问题

（这里是对cocos2d-html5测试例编写的想法，可以忽略）

个人觉得，如果是单纯只是GUI的测试例，那么就不该添加ccs的东西，例如以下代码：

```
var widget = ccs.uiReader.widgetFromJsonFile("res/cocosui/UITest/UITest.json");
```

# ccui.Button事件注册

ccui.Button的事件注册感觉有点需要改进下，就是应该可以支持只传一个function。

现在是这样的：

```
btnClose.addTouchEventListener(function(){
    console.log("close!!!")
}, target);
```

这种情况下有点鸡肋，因为我压根就不想要这个target的。


# ccs 导出的资源文件问题

这点主要是H5有问题，因为H5需要preload资源。

但是，虽说-x里面不需要preload也能运行，但实际上，在游戏开发过程中，我们还是会先进行preload，
因为当图片太多或者太大的时候，进入到场景中就会产生延迟加载的现象，就是图片挨个出来，
这种体验还是没有先preload资源来的好。

ccs导出资源时，有个模式时导出使用大图。我使用了ccs构建了多个ui widget，由于分辨率，所以会需要导出多套资源。

导出的时候，所以的图片都打包在一起了，然后由于每张图片有最大个数限制，这样，导出的图片就不一样了（名字），例如：

```
2048:
Project0.png
Project0.plist
Project1.png
Project1.plist

1024:
Project0.png
Project0.plist
```

由于`2048`的图片比较大，超过了每张允许的最大尺寸，所以会分成两张图片。而`1024`的刚刚好一张就行了。

这么一来，我进行preload资源的时候就非常麻烦，尤其是随着项目的开发进行，图片肯定越来越多，那我就要注意我preload的资源才行。

最后是，我加载`ccs`的exportJson文件的时候，引擎能够动态的帮忙加载。


# 关于cocostudio中使用了绝对路径的问题

打开cocostudio的项目文件，会发现很多地方使用了绝对路径，个人感觉这是不科学的。应该使用相对路径。

现在的情况是使用了绝对路径，然后我将工程换个目录，仍然能够打开，但是这时候，项目文件就被重新修改了。
这种在项目中是非常不好的体验。因为这些东西通常会托管到版本库中，这种操作就会带来一些文件被修改了，是件十分蛋疼的事情。

还有就是如果我使用了cocostudio自带的资源，居然也是绝对路径！！！这是很坑的，尤其是多人协作的时候，就有可能出现问题。
这种建议是可以使用占位符的方式来解决：`"${ccsRes}/....."`。



# 建议cocostudio能够提供命令行功能

（例如texturePacker就支持了命令行的功能，用起来就舒服很多。）

在项目中，如果每次由于cocostudio编辑的工程中做了修改，都要人工导出文件，再复制到程序工程的资源文件夹中，那是非常坑爹的一件事情。
建议cocostudio能够支持命令行导出的模式，这将会极大的提高工作效率。

这里，罗列下我的需求点：

### 导出项目

* 导出的名字
* 导出的位置
* 导出的缩放（多分辨率导出）

### 导出ui

我们项目中，是只用一个ccui工程，里面编辑了很多ui。现在的导出模式，如果使用了大图，就都会用同一张大图，且名字为项目名加index、后缀为`.png`和`.plist`。
但是我们更希望的是，可以指定某个`ui_***.json`只导出指定的图片，例如`ui_fight1.json`和`ui_fight2.json`都是`fight`模块，
然后我们在Resources里面配置了个资源文件夹专门放这个模块的图片资源`ui_fight`。那么我们就希望，导出的文件能够是：
`ui_fight1.ExportJson`，`ui_fight2.ExportJson`以及共用的`ui_fight.plist`和`ui_fight.png`。

### 支持打包图片的命令行

能够支持打包图片，这样我就可以不用TexturePacker了。


# 导出文件压缩

现在只能支持到对ExportJson文件进行去空格的压缩，并不是实际意义上的压缩。

这里`-x`这希望能够导出二进制压缩文件，而h5还是使用json，只是对key值进行压缩，例如字段名`name`用`1`替代。

现在的文件还是过大。

H5中建议不要用二进制，解析起来还是没json快。

# Armature的bug

场景：

使用2048在cocostudio中进行编辑，导出的是1024。这时候，在代码中设置了设计分辨率为2048，资源分辨率为1024，
然后`cc.director.setContentScaleFactor(1024/2048)`，这时候ccui是正常的，但是armature却错位了。
原因在于armature的ExportJson中的`contentScale`值设置成了0.5。
然后引擎内部又多用了一次contentScaleFactor，相当于多缩放了一次。

解决方式：手动将导出的armature的ExportJson的`contentScale`设置为1。