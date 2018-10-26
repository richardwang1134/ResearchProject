function setXSSPage(){
  reloadRecordData();
  $("#addXSSTab").click(addXSSTabClick);
  $("#mngXSSTab").click(mngXSSTabClick);
}
function reloadRecordData(){
  var scroll = document.getElementById("recordScroll");
  scroll.innerHTML="";
  chrome.runtime.sendMessage({
      type:"getRecord"
  },(response)=>{
      if(response.check=="pass"){
        loadRecords(JSON.parse(response.records));
      }
  });
}
function loadRecords(records){
  var scroll = document.getElementById("recordScroll");
  for(var i=0; i<records.length;i++){
    let fixRow = document.createElement("div");
    let item1 = document.createElement("div");
    let item2 = document.createElement("div");
    let url = Object.keys(records[i])[0];
    let scriptDomains = records[i][url];
    item1.className = 'Item Flex5 Clickable';
    item1.innerHTML = url;
    item1.onclick = ()=>{showScriptDomains(fixRow)};
    item1.onmouseenter = ()=>{item1.innerHTML="詳情"};
    item1.onmouseleave = ()=>{item1.innerHTML=url};
    item2.className = 'Item Clickable';
    item2.innerHTML = "+";
    item2.onclick = ()=>{newTrustList(fixRow)};
    fixRow.className = "FixRow";
    fixRow.appendChild(item1);
    fixRow.appendChild(item2);
    scroll.appendChild(fixRow);  
    addScriptDomains(scriptDomains);
  }
}
function showScriptDomains(thisRow){
  if(thisRow.nextSibling){
    thisRow = thisRow.nextSibling;
    if(thisRow.className == "Hide"){
      while(true){
        if(thisRow.className=='Hide') thisRow.className = 'ThinRow';
        else return;
        if(thisRow.nextSibling) thisRow = thisRow.nextSibling;
        else return;
      }
    }else{
      while(true){
        if(thisRow.className=='ThinRow') thisRow.className = 'Hide';
        else return;
        if(thisRow.nextSibling) thisRow = thisRow.nextSibling;
        else return;
      }
    }
  }
}
function newTrustList(row){
  var thisRow = row.nextSibling;
  var key = row.firstChild.innerHTML;
  var trustList =[];
  while(true){
    if(thisRow.className=='Hide'||thisRow.className=='ThinRow'){
      if(thisRow.lastChild.innerHTML=='信任'){
        trustList.push(thisRow.firstChild.innerHTML+'/trust');
      }else if(thisRow.lastChild.innerHTML=='阻擋'){
        trustList.push(thisRow.firstChild.innerHTML+'/block');
      }
    }else{
      break;
    }
    if(thisRow.nextSibling) thisRow=thisRow.nextSibling;
    else break;
  }
  chrome.runtime.sendMessage({
    type:"newTrustList",
    list:trustList,
    key:key
  },(response)=>{
    if(response.check=="pass"){
      alert("設定成功");
    }
  });
    
}
function addScriptDomains(scriptDomains){
  var scroll = document.getElementById("recordScroll");
  let titleRow = document.createElement("div");
  titleRow.className = 'Hide';
  let title = document.createElement("div");
  title.className = 'ThinItem';
  title.innerHTML = "請確認信任來自以下網域的腳本，再點擊 + 將此網站納入防禦範圍";
  titleRow.appendChild(title);
  scroll.appendChild(titleRow);
  for(var i=0; i<scriptDomains.length; i++){
    let thinRow = document.createElement("div");
    thinRow.className = 'Hide';
    let item1 = document.createElement("div");
    item1.className = 'ThinItem Flex5';
    item1.innerHTML = scriptDomains[i];
    let item2 = document.createElement("div");
    item2.className = 'ThinItem Clickable';
    item2.innerHTML = '信任';
    item2.onclick= ()=>{trustOrNot(item2)};
    thinRow.appendChild(item1);
    thinRow.appendChild(item2);
    scroll.appendChild(thinRow);
  }
}
function trustOrNot(item){
  if(item.innerHTML=='信任') item.innerHTML = '阻擋';
  else item.innerHTML = '信任';
}
function addXSSTabClick(){
  $("#addXSSTab").removeClass("Clickable");
  $("#mngXSSTab").addClass("Clickable");
  $("#addXSS").css("display","flex");
  $("#mngXSS").css("display","none");
}
function mngXSSTabClick(){
  $("#addXSSTab").addClass("Clickable");
  $("#mngXSSTab").removeClass("Clickable");
  $("#addXSS").css("display","none");
  $("#mngXSS").css("display","flex");
}