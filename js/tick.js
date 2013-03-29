var Tick={
    init:function(){
        if(!window.navigator.standalone){
            $('head').append('<link id="touchIcon" rel="apple-touch-icon-precomposed" href="img/home.png" />');
            $(".lay-content").html('<div class="fn-guide"><img style="height:72px;width:72px;" src="img/home.png" /><p>Please add to Home Screen.</p></div>');
        }
        else
        {
           this.getTodoListFromLocalStorage();
           this.initAddTodoItem();
           /* if (!window.navigator.standalone)  */this.updateTouchIcon();
           this.initCheckItem();
           this.initShake();
        }
    },
    getTodoListFromLocalStorage:function(){
        var listStr=localStorage.listStr;
        var listObj;
        if(listStr) {
            listObj=eval(listStr);
            var ELlist=$("#todolist");
            var NotCheckedList="";
            var CheckedList="";
            for(var i=0;i<listObj.length;i++)
            {
                if(listObj[i].checked=="NO")
                 NotCheckedList+='<li class="list-item"><input type="checkbox" id="'+ listObj[i].date +'" /><label for="'+ listObj[i].date +'"></label><span class="todo-title" title="' + listObj[i].title + '" time="' + listObj[i].date + '" >'+listObj[i].title+'</span></li>';
                else  CheckedList+='<li class="list-item checked"><input type="checkbox" checked id="'+ listObj[i].date +'" /><label for="'+ listObj[i].date +'"></label><span class="todo-title checked" title="' + listObj[i].title + '" time="' + listObj[i].date + '" >'+listObj[i].title+'</span></li>';
                
            }            
            ELlist.append(NotCheckedList);
            ELlist.append(CheckedList);
        }
    },
    /*初始化添加元素的方法*/
    initAddTodoItem:function(){
        $("#addtodo-btn").click(function(){
            var inputstr = $("#addtodo-input").val();
            var inputTime =+new Date();
            if(inputstr != "") {
                var ELlist=$("#todolist");
                var htmlstr='<li class="list-item"><input type="checkbox" id="'+ inputTime +'" /><label for="'+ inputTime +'"></label><span class="todo-title" title="'+ inputstr +'" time="' + inputTime +'" >'+inputstr+'</span></li>';
                ELlist.prepend(htmlstr);
            }
            $("#addtodo-input").val("");
            Tick.updateLocalStorage();
            Tick.updateTouchIcon();
            location.reload();
        });
        $("#addtodo-input").keyup(function(event){
            if(event.keyCode == 13){
                var inputstr = $("#addtodo-input").val();
            var inputTime =+new Date();
            if(inputstr != "") {
                var ELlist=$("#todolist");
                var htmlstr='<li class="list-item"><input type="checkbox" id="'+ inputTime +'" /><label for="'+ inputTime +'"></label><span class="todo-title" title="'+ inputstr +'" time="' + inputTime +'" >'+inputstr+'</span></li>';
                ELlist.prepend(htmlstr);
            }
            $("#addtodo-input").val("");
            Tick.updateLocalStorage();
            Tick.updateTouchIcon();
            location.reload();
            }
        });
    },
    initCheckItem:function(){
        $("#todolist label").live("click",function(){
            $(this).parent(".list-item").toggleClass("checked");
            $(this).next(".todo-title").toggleClass("checked");
            Tick.updateLocalStorage();
            Tick.updateTouchIcon();
            location.reload();
        })
    },
    updateLocalStorage:function(){
        var list = $("#todolist .todo-title");
        var listStr="[";
        for(var i=0;i<list.length;i++){
            var ELitem=$(list[i]);
            listStr+= '{"date":';
            listStr+= ELitem.attr("time");
            listStr+= ',"title":"';
            listStr+= ELitem.attr("title")+'"';
            if(ELitem.hasClass("checked"))
            {
            listStr+= ',"checked":"YES"';            
            }
            else listStr+= ',"checked":"NO"';            
            listStr+= '},';
        }
        if(list.length>0)
            listStr=listStr.slice(0,listStr.length-1);
        listStr+="]";        
        localStorage.listStr = listStr;
        console.log(listStr);
    },
    initShake:function(){
        window.addEventListener('shake',Tick.deleteCheckedItem, false);
        
          

    },
    deleteCheckedItem:function(){
        var count =$(".list-item.checked").length;   
        $("#todolist .checked").remove();        
        Tick.updateLocalStorage();
        if(count>0) Tick.playSound(count);
    },
    playSound:function(num){
        var el = document.createElement("audio");
        el.src="sound\/" + (num>5?"victory":num) + ".mp3";        
        el.play();
        // location.reload();
    },
    updateTouchIcon:function(){
        var canvas = document.createElement('canvas');
        canvas.width = 144;
        canvas.height = 144;
        var context = canvas.getContext("2d");
        context.fillStyle="#ef4372";
        context.fillRect(0,0,144,144);
        context.textAlign="center";
        context.fillStyle = '#ffffff';
        context.textBaseline = "middle";
        context.font = "bold 90px HelveticaNeue";
            context.fillText($("#todolist .list-item").length - $(".list-item.checked").length +"", 70, 70);
            var baseImg = canvas.toDataURL();
            if($("#touchIcon").length>0) $("#touchIcon").attr("href",baseImg);
            else $('head').append('<link id="touchIcon" rel="apple-touch-icon-precomposed" href="' + baseImg + '" />');

            // $('#showimg').removeClass("ui-none").html("").append('<img style="width:72px;" src="' + baseImg + '" />');
       
    },

    hunder:function(){
    }
};

Tick.init();
