function setAddTargetPage(){
  reloadRecordData();
}
function reloadRecordData(){
  var scroll = document.getElementById("recordScroll");
  scroll.innerHTML="";
  chrome.runtime.sendMessage({
      type:"getRecord"
  },(response)=>{
      if(response.check=="pass"){
        loadRecordData(JSON.parse(response.recordData));
      }
  });
}
function loadRecordData(recordData){
  var scroll = document.getElementById("recordScroll");
  for(var i=0; i<recordData.length;i++){
    let fixRow = document.createElement("div");
    let item1 = document.createElement("div");
    let item2 = document.createElement("div");
    let item3 = document.createElement("div");
    let url = Object.keys(recordData[i])[0];
    let scriptDomains = recordData[i][url];
    item1.className = 'Item Flex5';
    item1.innerHTML = url;
    item2.className = 'Item Clickable';
    item2.innerHTML = "show";
    item2.onclick = ()=>{showHidden(fixRow)};
    item3.className = 'Item Clickable';
    item3.innerHTML = "+";
    item3.onclick = ()=>{addTarget(fixRow)};
    fixRow.className = "FixRow";
    fixRow.appendChild(item1);
    fixRow.appendChild(item2);
    fixRow.appendChild(item3);
    scroll.appendChild(fixRow);  
    addScriptDomains(scriptDomains);
  }
}
function showHidden(thisRow){
  if(thisRow.nextSibling){
    var statusDiv = thisRow.firstChild.nextSibling;
    if(statusDiv.innerHTML == 'Hide') statusDiv.innerHTML = 'Show';
    else statusDiv.innerHTML = 'Hide';
    var thisRow = thisRow.nextSibling;
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
function addTarget(row){
  var thisRow = row.nextSibling;
  var key = row.firstChild.innerHTML;
  var trustList =[];
  while(true){
    if(thisRow.className=='Hide'||thisRow.className=='ThinRow'){
      if(thisRow.lastChild.innerHTML=='信任'){
        trustList.push(thisRow.firstChild.innerHTML+'/pass');
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
    type:"addTarget",
    list:trustList,
    key:key
  },(response)=>{
    if(response.check=="pass"){
      //alert("新增成功");
    }else{
      alert("新增失敗");
    }
  });
    
}
function addScriptDomains(scriptDomains){
  var scroll = document.getElementById("recordScroll");
  let titleRow = document.createElement("div");
  titleRow.className = 'Hide';
  let title = document.createElement("div");
  title.className = 'ThinItem Flex5';
  title.innerHTML = "請檢查以下網域，再點擊 + 將此網站納入防禦範圍";
  let title2 = document.createElement("div");
  title2.className = 'ThinItem Flex2';
  title2.innerHTML = "處理方式";
  titleRow.appendChild(title);
  titleRow.appendChild(title2);
  scroll.appendChild(titleRow);
  for(var i=0; i<scriptDomains.length; i++){
    let thinRow = document.createElement("div");
    thinRow.className = 'Hide';
    let item1 = document.createElement("div");
    item1.className = 'ThinItem Flex5';
    item1.innerHTML = scriptDomains[i];
    let item2 = document.createElement("div");
    item2.className = 'ThinItem Flex2 Clickable';
    item2.innerHTML = '預設';
    item2.onclick= ()=>{trustOrNot(item2)};
    thinRow.appendChild(item1);
    thinRow.appendChild(item2);
    scroll.appendChild(thinRow);
  }
}
function trustOrNot(item){
  if(item.innerHTML=='預設') item.innerHTML = '信任';
  else if(item.innerHTML=='信任') item.innerHTML = '阻擋';
  else item.innerHTML = '預設';
}