function setSourcePage(){
  reloadRecordData();
  $("#addSourceTab").click(addSourceTabClick);
  $("#mngSourceTab").click(mngSourceTabClick);
}
function reloadRecordData(){
  var scroll = document.getElementById("recordScroll");
  scroll.innerHTML="";
  chrome.runtime.sendMessage({
      type:"getRecord"
  },(response)=>{
      if(response.check=="pass"){
        records = JSON.parse(response.records);
        var scroll = document.getElementById("recordScroll");
        for(var i=0; i<records.length;i++){
            let fixRow = document.createElement("div");
            let item1 = document.createElement("div");
            let item2 = document.createElement("div");
            let url = Object.keys(records[i])[0];
            let scriptDomains = records[i][url];
            console.log(url,records[i]);
            item1.className = 'Item Flex5 Clickable';
            item1.innerHTML = url;
            item1.onclick = ()=>{addToWhiteList(url,scriptDomains)};
            item2.className = 'Item Clickable';
            item2.innerHTML = "+";
            item2.onclick = ()=>{showScriptDomains(fixRow,scriptDomains)};
            fixRow.className = "FixRow";
            fixRow.appendChild(item1);
            fixRow.appendChild(item2);
            scroll.appendChild(fixRow);
        }
      }
  });
}
function showScriptDomains(thisRow,scriptDomains){
  if(thisRow.lastChild.innerHTML=='-'){
    thisRow.lastChild.innerHTML='+';
    while(thisRow.nextSibling.className=='ThinRow'){
      thisRow.parentNode.removeChild(thisRow.nextSibling);
    }
  }else{
    thisRow.lastChild.innerHTML='-';
    for(var i=0; i<scriptDomains.length+1; i++){
      let thinRow = document.createElement("div");
          
      if(i<scriptDomains.length){
        thinRow.className = 'ThinRow';
        thinRow.innerHTML = scriptDomains[i];
      }
      else{
        thinRow.className = 'ThinRow Clickable';
        thinRow.onmouseenter = ()=>{item1.innerHTML="信任所有此網頁引用的腳本來源"};
        thinRow.onmouseout = ()=>{item1.innerHTML=url};
        thinRow.innerHTML = "此網域下的網站引用了以下陌生來源的跨站腳本，所以cookie已經被刪除";
      }
      thisRow.parentNode.insertBefore(thinRow, thisRow.nextSibling);
    }
  }
}
function addToWhiteList(key,scriptDomains){
  console.log(key,scriptDomains);
  chrome.runtime.sendMessage({
    type:"addToWhiteList",
    url:key,
    scriptDomains:JSON.stringify(scriptDomains)
  },(response)=>{
    console.log(response);
  });
}
function addSourceTabClick(){
  $("#addSourceTab").removeClass("Clickable");
  $("#mngSourceTab").addClass("Clickable");
  $("#addSource").css("display","flex");
  $("#mngSource").css("display","none");
}
function mngSourceTabClick(){
  $("#addSourceTab").addClass("Clickable");
  $("#mngSourceTab").removeClass("Clickable");
  $("#addSource").css("display","none");
  $("#mngSource").css("display","flex");
}