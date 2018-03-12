var div = document.querySelectorAll("div");
console.log(div.length);
for(var i = 0; i < div.length; i++){
    ()=>{
        var j = i;
        div[j].onmouseover = ()=>{
            div[j].style.backgroundColor = "#ADADAD";
        }
        div[j].onmouseout = ()=>{
            div[j].style.backgroundColor = "#FFFFFF";
        }
        console.log(div[j]);
    }
}

