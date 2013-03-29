##更新桌面启动图标

###不完全动态的桌面图标

首先需要声明的是，webapp不能像nativeapp一样后台推送，在没打开前是不运行的，而webapp里所有的js逻辑都只有在页面打开状态下才能运行，所以动态修改桌面启动图标的方法只有在每次点开后才能生效。

基于此，动态桌面图标的使用并不适合比如天气、新闻、twitter等即时性很高、后台主动推送的场景，仅仅适用于用户每次手动打开后便更新内容，更新完之后的icon能作为一个状态的标识供用户参考，比如任务管理工具、记帐软件等。

###选择canvas作为动态图片来源

使用base64的优点是，可以选择由canvas来动态生成，并且不需要有网络请求，直接在本地完成。

而且我们的场景非常特殊：仅IOS的Safari，所以完全可以不用考虑浏览器的支持度。

	var canvas = document.createElement('canvas');
    canvas.width = 144;
    canvas.height = 144;
    var context = canvas.getContext("2d");
    var baseImg = canvas.toDataURL();    

###通过js动态创建和修改指定桌面图标的 `<link>` 标签

桌面图标在页面里的声明仅仅存在 `<link>` 中，理论上我们只要动态修改 `<link>` 标签的图片地址就能实现动态的图标。

首次从safari里将页面添加主屏幕时，IOS会检查页面里的 `<link>` 标签，读取图片的地址然后生成启动图标。并且这个标签只要在用户执行这步操作之前就有的，即不管是页面模板里静态本来存在的，还是通过js动态创建的，该方法一样生效。

[http://av.cm/tick/DefaultLink.html](http://av.cm/tick/DefaultLink.html)

[http://av.cm/tick/ClickAddLink.html](http://av.cm/tick/ClickAddLink.html)


我们期望的场景是，用户在webapp里进行了一项操作，这个操作更新了整个webapp的状态，我们希望这个状态的改变能在桌面的启动图标里体现出来。

拿task工具来举例，用户在点开之前，桌面图标上显现任务队列里还有3个任务，当添加了一个新的任务之后，桌面图标上的任务数字应该变成4。当所有的任务都被打勾完成之后，桌面图标也应该反馈这样的状态，比如显示0条任务或者其它鼓励类的图标。

所以理论上，我们要做的就是在每次操作之后，通过js在一个canvas中绘出新的图案，再将这个canvas转化成base64的图片，动态创建到一个 `<link>` 标签添加至head就行了。

但事实上并不是这样。


###webapp的桌面图标渲染

当在webapp里创建了一个 `<link>` 再退出后，发现桌面的启动图标并没有像我们期望的那样被更新。

经过死乞白赖的测试后发现，在webapp里进行添加和修改的 `<link>` 标签并不能被IOS读取和渲染到，虽然 `<link>` 标签在页面里的确存在着，但并不会被更新到桌面。因为**webapp里的图标是在body.onload的时候被渲染的**。

是的，尽管这样听上去很不科学，但是他还是发生了。

（demo）

既然已知图标是在 `body.onload` 时被渲染的，那么我们需要在每次操作之后都要进行一次reload操作，并且在body.onload的时候再生成图片添加 `<link>` 标签。为了保证在每次页面重载的时候状态不丢失，需要把状态保存起来，考虑到webapp特殊的使用场景和环境，使用LocalStorage就非常方便。

###最终的逻辑

所以，更新桌面图标的方法都应该绑定在 `body.onload` 上，整个流程看上去应该这个样子的：

1. 页面载入（包括从桌面打开页面时），读取LocalStorage，根据LocalStorage转换成状态，通过canvas生成体现状态的图片并转换成base64格式，创建 `<link>` 添加到 `<head>` 里
2. 在打开的页面里进行操作，把操作完的状态在到LocalStorage中，然后通过 `location.reload()` 重新载入一次页面，执行第一步。

基本上所有与更新Icon的关键逻辑都在 `body.onload` 时执行完毕，其它的中间态都只是对状态的更新。


##Tick-Task

这里有一个简单的DEMO，以webapp形式实现的任务工具。主要演示了上面提到的更新桌面启动图标的逻辑。

第一次添加到主屏幕时显示的是从Safari里默认的初始图片（这里是一个灯泡），当更新了任务列表之后，桌面上的启动图标将会显示任务列表里未完成的任务，除此之外：

* 当在safari中打开时，根据 `navigation.standalone` 判断当前网页是否以webapp运行。如果不是则显示添加到主屏幕的提示。
* 添加任务或者完成任务会将条目内容存到LocalStorage，并且刷新页面，根据所剩未完成条目数生成图片添加到link。
* 使用Manifest保存全部静态资源，保证每次页面重载时的体验，并且在离线状态下仍然可用。
* 使用开源的页面摇晃检测js库 - [shake.js](https://github.com/alexgibson/shake.js "shake.js")，完成条目后摇晃手机可以清除已完成任务，并播放声音。

你还可以在github上[查看详细的代码](https://github.com/hellometers/tick)，并且如果愿意的话提出改进。

Try and enjoy it.

##最后

webapp因为权限的原因，尚不能做到：


* webapp不能像nativeapp一样后台push，在没打开前是不运行的，而webapp里所有的js逻辑都只有在页面处理打开状态下才能运行，所以动态修改桌面启动图标的方法只有在每次点开后才能生效。
* 目前尚未找到像更改桌面图标一样动态地更改标题的方法
* 未找到给webapp添加气泡的方法


但是，Apple在IOS设备的主屏幕上为webapp开了一扇窗户，我们也许可以通过这扇窗为用户带来特别的体验。
