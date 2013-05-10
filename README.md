IOS允许网站开发者像NativeaApp一样在IOS设备的主屏幕为其网站添加一个启动Icon，这个代表着网站的Icon在苹果官方开发者文档里被称为["Web Clip"][1]，它的作用类似于桌面浏览器的书签，用户通过点击Icon能直接快速打开这个url的网站。

为了给某个网页或者整个网站指定一个漂亮的桌面启动图标，IOS Safari提供了两个私有接口： `apple-touch-icon` 和 `apple-touch-icon-precomposed`。

## Apple-touch-icon

### 设置方法

通过在页面HTML的头部添加 `<link>` 标签

    <link rel="apple-touch-icon" href="touch-icon-iphone.png" />
    <link rel="apple-touch-icon-precomposed" href="apple-touch-icon-precomposed-iphone.png" />
    

这两个标签都是用来指定桌面图标的，但两者有个细微的区别，

*   通过 `apple-touch-icon` 添加的图标是会带IOS图标统一的高光效果
*   通过 `apple-touch-icon-precomposed` 添加的图标则是设计原图，不带高光渐变效果的。
    
    ![][2]

### 图片大小

为了给不同的IOS设备指定其启动图标，在[IOS Human Interface Guide][3]中提到，推荐以下四种尺寸：

| IOS设备                         | 最适尺寸(px)  |
| ----------------------------- | --------- |
| iPhone 和 iTouch               | 57 x 57   |
| retina iPhone 和 retina iTouch | 114 x 114 |
| iPad                          | 72 x 72   |
| retina iPad                   | 144 x 144 |

相应地，要指定不同分辨率的设备的图标，可以添加相应的 `<link>` 标签序列，官方建议的顺序是这样的

    <link rel="apple-touch-icon" href="touch-icon-iphone.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="touch-icon-ipad.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="touch-icon-iphone-retina.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="touch-icon-ipad-retina.png" />
    

通过 `<link>` 的 `<sizes>` 属性可以特别地声明这个图标是为哪种分辨率设备准备的，如果没有指明 `<sizes>` 属性的大小，则默认值为57x57。

如果所有的 `<link>` 标签序列中都没有符合官方推荐的最适尺寸的话，那么IOS会从所有比推荐的最适尺寸大的图标中选择尺寸最小的那一个，如果所有的 `<link>` 标签序列中的图标都比当前推荐的最适尺寸小的话，IOS会从这些图片中自动选择最大的那个来作为启动图标。

特别地，如果整个页面都没有指定任何的 `apple-touch-icon` 的图标的话，IOS则会自动去**网站根目录**寻找有 `apple-touch-icon` 和 `apple-touch-icon-precomposed` 前缀的图标文件。

### 图片格式

用于设置成为桌面启动图标的图片文件，可以是以下三种类别

*   纯静态的图片
    
    图片的路径可以绝对路径、相对于当前页面的相对路径以及相对于网站根目录的路径。
    
    目前发现不仅支持png格式的，jpg和gif也在支持的列表中，如：
    
    ![][4]
    
         http://av.cm/tick/img/demo.png
        
    
    但如果是动态gif图片只会截取一帧（第一帧？）来显示

*   包含图片文件头的HTTP REQUEST
    
    可以不是一个静态的文件，而是由服务器返回的带有图片文件比如 `image/png` 文件头的请求。就像我们常用的图片占位图工具 <http://getimg.in> 的图片：
    
    ![][5]
    
         http://getimg.in/144x144tcat
        
    
    这个的优点是可以根据前端需要动态地返回不同的图片，缺点是，每次新的图片都需要请求服务器，从服务器下载

*   base64格式的图片
    
    这是一个包含png文件头的长字符串，它可以是一张从静态图片转换的，也可以是从服务器返回的，还可以是canvas生成的
    
    <img src=""
    
         data:image/png;base64,(xxxxxx)
        

## 更新桌面启动图标

### 不完全动态的桌面图标

首先需要声明的是，webapp不能像nativeapp一样后台推送，在没打开前是不运行的，而webapp里所有的js逻辑都只有在页面打开状态下才能运行，所以动态修改桌面启动图标的方法只有在每次点开后才能生效。

基于此，动态桌面图标的使用并不适合比如天气、新闻、twitter等即时性很高、后台主动推送的场景，仅仅适用于用户每次手动打开后便更新内容，更新完之后的icon能作为一个状态的标识供用户参考，比如任务管理工具、记帐软件等。

### 选择canvas作为动态图片来源

使用base64的优点是，可以选择由canvas来动态生成，并且不需要有网络请求，直接在本地完成。

而且我们的场景非常特殊：仅IOS的Safari，所以完全可以不用考虑浏览器的支持度。

    var canvas = document.createElement('canvas');
    canvas.width = 144;
    canvas.height = 144;
    var context = canvas.getContext("2d");
    var baseImg = canvas.toDataURL();    
    

### 通过js动态创建和修改指定桌面图标的 `<link>` 标签

桌面图标在页面里的声明仅仅存在 `<link>` 中，理论上我们只要动态修改 `<link>` 标签的图片地址就能实现动态的图标。

首次从safari里将页面添加主屏幕时，IOS会检查页面里的 `<link>` 标签，读取图片的地址然后生成启动图标。并且这个标签只要在用户执行这步操作之前就有的，即不管是页面模板里静态本来存在的，还是通过js动态创建的，该方法一样生效。

*   页面中的link是默认存在的
    
    ![][6]
    
    > <http://av.cm/tick/test/DefaultLink.html>

*   通过点击触发生成的link，仍然可以生成到桌面
    
    ![][7]

> <http://av.cm/tick/test/ClickAddLink.html>

我们期望的场景是，用户在webapp里进行了一项操作，这个操作更新了整个webapp的状态，我们希望这个状态的改变能在桌面的启动图标里体现出来。

拿task工具来举例，用户在点开之前，桌面图标上显现任务队列里还有3个任务，当添加了一个新的任务之后，桌面图标上的任务数字应该变成4。当所有的任务都被打勾完成之后，桌面图标也应该反馈这样的状态，比如显示0条任务或者其它鼓励类的图标。

所以理论上，我们要做的就是在每次操作之后，通过js在一个canvas中绘出新的图案，再将这个canvas转化成base64的图片，动态创建到一个 `<link>` 标签添加至head就行了。

但事实上并不是这样。

### webapp的桌面图标渲染

当在webapp里创建了一个 `<link>` 再退出后，发现桌面的启动图标并没有像我们期望的那样被更新。

经过死乞白赖的测试后发现，在webapp里进行添加和修改的 `<link>` 标签并不能被IOS读取和渲染到，虽然 `<link>` 标签在页面里的确存在着，但并不会被更新到桌面。因为**webapp里的图标是在body.onload的时候被渲染的**。

是的，尽管这样听上去很不科学，但是他还是发生了。下面的两个demo的功能都把webapp打开的次数画进canvas，然后生成到桌面图标里，只不过第一个demo的添加方法是在 `body.onload` 时触发，第二个是在用户点击操作时才触发。

*   body.onload 自动触发
    
    ![][7]
    
    > <http://av.cm/tick/test/BodyLoadSetIcon.html>
    > 
    > 本页面将在每次body.onload事件后读出打开的次数，生成下面的图片，并把这个图片添加至head。
    > 
    > 先添加页面至主屏幕，在webapp模式下打开再退出检查桌面启动图标。
    > 
    > 图标上的数字标识出页面被打开的次数，在每次打开再退出后图标上的数字将加1。

*   通过点击操作添加link
    
    ![][8]
    
    > <http://av.cm/tick/test/ClickSetIcon.html>
    > 
    > 本页面在载入的时页面头部并没有link标签，通过点击操作读出打开的次数，生成下面的图片，并把这个图片添加至head。
    > 
    > 先添加页面至主屏幕，在webapp模式下打开再退出检查桌面启动图标。
    > 
    > 在每次打开再退出后图标上的数字始终没有被修改。

既然已知图标是在 `body.onload` 时被渲染的，那么我们需要在每次操作之后都要进行一次reload操作，并且在body.onload的时候再生成图片添加 `<link>` 标签。为了保证在每次页面重载的时候状态不丢失，需要把状态保存起来，考虑到webapp特殊的使用场景和环境，使用LocalStorage就非常方便。

### 最终的逻辑

所以，更新桌面图标的方法都应该绑定在 `body.onload` 上，整个流程看上去应该这个样子的：

1.  页面载入（包括从桌面打开页面时），读取LocalStorage，根据LocalStorage转换成状态，通过canvas生成体现状态的图片并转换成base64格式，创建 `<link>` 添加到 `<head>` 里
2.  在打开的页面里进行操作，把操作完的状态在到LocalStorage中，然后通过 `location.reload()` 重新载入一次页面，执行第一步。

基本上所有与更新Icon的关键逻辑都在 `body.onload` 时执行完毕，其它的中间态都只是对状态的更新。

## Tick-Task

这里有一个简单的DEMO，以webapp形式实现的任务工具。主要演示了上面提到的更新桌面启动图标的逻辑。

![][9]

> <http://av.cm/tick/>

<br>

<img style="width:240px" src="http://av.cm/tick/src/1.png" /><img style="width:240px" src="http://av.cm/tick/src/2.png" /><img style="width:240px" src="http://av.cm/tick/src/3.png" />

第一次添加到主屏幕时显示的是从Safari里默认的初始图片（这里是一个灯泡），当更新了任务列表之后，桌面上的启动图标将会显示任务列表里未完成的任务，除此之外：

*   当在safari中打开时，根据 `navigation.standalone` 判断当前网页是否以webapp运行。如果不是则显示添加到主屏幕的提示。
*   添加任务或者完成任务会将条目内容存到LocalStorage，并且刷新页面，根据所剩未完成条目数生成图片添加到link。
*   使用Manifest保存全部静态资源，保证每次页面重载时的体验，并且在离线状态下仍然可用。
*   使用开源的页面摇晃检测js库 - [shake.js][10]，完成条目后摇晃手机可以清除已完成任务，并播放声音。

你还可以在github上[查看详细的代码][11]，并且如果愿意的话提出改进。

Try and enjoy it.

## 最后

webapp因为权限的原因，尚不能做到：

*   webapp不能像nativeapp一样后台push，在没打开前是不运行的，而webapp里所有的js逻辑都只有在页面处理打开状态下才能运行，所以动态修改桌面启动图标的方法只有在每次点开后才能生效。
*   目前尚未找到像更改桌面图标一样动态地更改标题的方法
*   未找到给webapp添加气泡的方法

但是，Apple在IOS设备的主屏幕上为webapp开了一扇窗户，我们也许可以通过这扇窗为用户带来特别的体验。

 [1]: http://developer.apple.com/library/ios/#documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
 [2]: http://av.cm/tick/src/diff.png
 [3]: http://developer.apple.com/library/ios/#documentation/UserExperience/Conceptual/MobileHIG/IconsImages/IconsImages.html#//apple_ref/doc/uid/TP40006556-CH14
 [4]: http://av.cm/tick/img/demo.png
 [5]: http://getimg.in/144x144tcat
 [6]: https://chart.googleapis.com/chart?cht=qr&chs=150x150&choe=UTF-8&chld=L|4&chl=http%3A%2F%2Fav.cm%2Ftick%2Ftest%2FDefaultLink.html
 [7]: https://chart.googleapis.com/chart?cht=qr&chs=150x150&choe=UTF-8&chld=L|4&chl=http%3A%2F%2Fav.cm%2Ftick%2Ftest%2FClickAddLink.html
 [8]: https://chart.googleapis.com/chart?cht=qr&chs=150x150&choe=UTF-8&chld=L|4&chl=http%3A%2F%2Fav.cm%2Ftick%2Ftest%2FClickSetIcon.html
 [9]: https://chart.googleapis.com/chart?cht=qr&chs=150x150&choe=UTF-8&chld=L|4&chl=http%3A%2F%2Fav.cm%2Ftick%2F
 [10]: https://github.com/alexgibson/shake.js "shake.js"
 [11]: https://github.com/hellometers/tick