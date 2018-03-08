var div = document.querySelectorAll("div");

for(var d in div){
    d.onmouseover = ()=>{
        div[0].style.backgroundColor = "#ADADAD";
    }
    d.onmouseout = ()=>{
        div[0].style.backgroundColor = "#FFFFFF";
    }
}

console.log(div);