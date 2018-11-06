function setCookiePage(){
  reloadTargets();
  $("#setCookieTab").click(setCookieTabClick);
  $("#mngCookieTab").click(mngCookieTabClick);
}

function reloadTargets(){
  var scroll = document.getElementById('mngTargetsScroll');
  scroll.innerHTML = "";
  chrome.runtime.sendMessage({
    type:"getTargets"
  },(response)=>{
    if(response.check=="pass"){
      var targets = JSON.parse(response.targets);
      for(var i=0;i<targets.length;i++){
        addTargetRow(targets[i],scroll);
      }
    }
  });
}
function addTargetRow(target,scroll){
  var fixRow = document.createElement("div");
  var item1 = document.createElement("div");
  var item2 = document.createElement("div");
  var item3 = document.createElement("div");
  var item4 = document.createElement("div");
  var url = Object.keys(target)[0];
  var trustList = target[url];
  item1.className = 'Item Flex5';
  item1.innerHTML = url;
  item2.className = 'Item Flex2 Clickable';
  item2.innerHTML = "Show";
  item2.onclick = ()=>{switchItem2(fixRow)};
  item3.className = 'Item Flex2 Clickable';
  item3.innerHTML = "Show";
  item3.onclick = ()=>{switchItem3(fixRow)};
  item4.className = 'Item Clickable';
  item4.innerHTML = "-";
  item4.onclick = ()=>{deleteTarget(fixRow)};
  fixRow.className = "FixRow";
  fixRow.appendChild(item1);
  fixRow.appendChild(item2);
  fixRow.appendChild(item3);
  fixRow.appendChild(item4);
  scroll.appendChild(fixRow);  
  for(var i=0; i<trustList.length; i++){
    addScriptDomainRows(trustList[i],scroll);
  }
  addConfirmChangeRow(fixRow,scroll);
}
function switchItem2(fixRow){
  var item2 = fixRow.firstChild.nextSibling;
  var item3 = item2.nextSibling;
  if(item2.innerHTML=='Show'){
    if(item3.innerHTML=='Hide'){
      switchItem3(fixRow);
    }
    var thisRow = fixRow.nextSibling;
    item2.innerHTML = 'Hide';
    if(!thisRow) return;
    while(true){
      if(thisRow.className=='Hide') thisRow.className = 'ThinRow';
      else return;
      if(thisRow.nextSibling) thisRow = thisRow.nextSibling;
      else return;
    }
  }else{
    var thisRow = fixRow.nextSibling;
    item2.innerHTML = 'Show';
    if(!thisRow) return;
    while(true){
      if(thisRow.className=='ThinRow') thisRow.className = 'Hide';
      else return;
      if(thisRow.nextSibling) thisRow = thisRow.nextSibling;
      else return;
    }
  }
}
function switchItem3(fixRow){
  var item2 = fixRow.firstChild.nextSibling;
  var item3 = item2.nextSibling;
  if(item3.innerHTML == 'Show'){
    if(item2.innerHTML == 'Hide'){
      switchItem2(fixRow);
    }
    item3.innerHTML = "Hide";
    url = fixRow.firstChild.innerHTML;
    chrome.cookies.getAll({
      url:'https://'+url
    },(cookies)=>{
      for(var i=0;i<cookies.length;i++){
        addCookieStatuRows(fixRow,cookies[i].name,cookies[i].sameSite);
      }
    });
  }else{
    item3.innerHTML='Show';
    var thisRow = fixRow;
    var nextRow;
    while(true){
      if(thisRow.nextSibling) nextRow = thisRow.nextSibling;
      else return;
      if(nextRow.className=='CookieRow'){
        nextRow.parentNode.removeChild(nextRow);
      }
      else return;
    }
  }
}
function addCookieStatuRows(fixRow,name,sameSite){
  var thinRow = document.createElement("div");
  thinRow.className = 'CookieRow';
  var item1 = document.createElement("div");
  item1.className = 'ThinItem Flex5';
  item1.innerHTML = name;
  var item2 = document.createElement("div");
  item2.className = 'ThinItem Clickable Flex4';
  item2.innerHTML = sameSite;
  item2.onclick = ()=>{switchCookie(name,item2,fixRow)};
  thinRow.appendChild(item1);
  thinRow.appendChild(item2);
  fixRow.parentNode.insertBefore(thinRow,fixRow.nextSibling);
}
function switchCookie(name,item2,fixRow){
  var url = fixRow.firstChild.innerHTML;
  var newStatus;
  if(item2.innerHTML == "strict") {
    newStatus = "lax";
  }else if(item2.innerHTML == "lax"){
    newStatus = "no_restriction";
  }else{
    newStatus = "strict";
  }
  item2.innerHTML = newStatus;
  chrome.cookies.get({
    url:"https://"+url,
    name:name
  },(cookie)=>{
    chrome.cookies.set({
      url:"https://"+url
      ,name:cookie.name
      ,value:cookie.value
      ,path:cookie.path
      ,secure:cookie.secure
      ,httpOnly:cookie.httpOnly
      ,sameSite:newStatus
      ,expirationDate:cookie.expirationDate
      ,storeId:cookie.storeId
    })
  });
}
function addScriptDomainRows(trustItem,scroll){
  var url = trustItem.split('/')[0];
  var trust = trustItem.split('/')[1];
  var thinRow = document.createElement("div");
  thinRow.className = 'Hide';
  var item1 = document.createElement("div");
  item1.className = 'ThinItem';
  item1.innerHTML = url;
  var item2 = document.createElement("div");
  item2.className = 'ThinItem Clickable';
  if(trust=="pass") item2.innerHTML = "信任";
  else item2.innerHTML = "阻擋";
  item2.onclick= ()=>{trustOrNot(item2)};
  thinRow.appendChild(item1);
  thinRow.appendChild(item2);
  scroll.appendChild(thinRow);
}
function addConfirmChangeRow(fixRow,scroll,){
  var thinRow = document.createElement("div");
  thinRow.className = 'Hide';
  var item1 = document.createElement("div");
  item1.className = 'ThinItem Clickable';
  item1.innerHTML = "確定";
  item1.onclick = ()=>{updateTarget(fixRow)};
  thinRow.appendChild(item1);
  scroll.appendChild(thinRow);
}
function updateTarget(fixRow){
  var url = fixRow.firstChild.innerHTML;
  var trustList = [];
  var thisRow = fixRow;
  while(thisRow.nextSibling){
    thisRow = thisRow.nextSibling;
    if(thisRow.className=="ThinRow"){
      var trust;
      if(thisRow.lastChild.innerHTML=="信任") trust = '/pass';
      else trust = '/block';
      var source = thisRow.firstChild.innerHTML;
      if(source!="確定")
      trustList.push(source + trust);
    }else{
      break;
    }
  }
  var obj = {};
  obj[url]=trustList;
  chrome.runtime.sendMessage({
      type:"updateTarget",
      target:obj
    },(response)=>{
      if(response.check!="pass") alert("更新失敗");
    }
  );
}
function deleteTarget(fixRow){
  var url = fixRow.firstChild.innerHTML;
  chrome.runtime.sendMessage({
    type:"deleteTarget",
    target:url
  },(response)=>{
    if(response.check=="pass"){
      while(fixRow.nextSibling){
        var thisRow = fixRow.nextSibling;
        if(thisRow.className=='ThinRow'||thisRow.className=='Hide')
          thisRow.parentNode.removeChild(thisRow);
        else break;
      }
      fixRow.parentNode.removeChild(fixRow);
    }else{
      alert("刪除失敗");
    }
  });
}

function setCookieTabClick(){
    $("#setCookieTab").removeClass("Clickable");
    $("#mngCookieTab").addClass("Clickable");
  }
function mngCookieTabClick(){
$("#setCookieTab").addClass("Clickable");
$("#mngCookieTab").removeClass("Clickable");
}