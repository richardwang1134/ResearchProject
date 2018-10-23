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
        recordData = response.recordData;
        var scroll = document.getElementById("recordScroll");
        for(var key in recordData){
          if(recordData.hasOwnProperty(key)){
            let fixRow = document.createElement("div");
            let item1 = document.createElement("div");
            let item2 = document.createElement("div");
            let scriptDomains = recordData[key];
                item1.className = 'Item Flex5 Clickable';
                item1.innerHTML = key;
                item1.onclick = ()=>{showScriptDomains(fixRow,scriptDomains)};
                item2.className = 'Item Clickable';
                item2.innerHTML = "+";
                fixRow.className = "FixRow";
                fixRow.appendChild(item1);
                fixRow.appendChild(item2);
                scroll.appendChild(fixRow);
          }
        }
      }
  });
}
function showScriptDomains(fixRow,scriptDomains){
  var key = fixRow.innerHTML();
  var scroll = document.getElementById("recordScroll");
  for(let i=0; i<scriptDomains.length; i++){
    let thinRow = document.createElement("div");
        thinRow.className = 'ThinRow';
        thinRow.innerHTML = scriptDomains[i];
        scroll.insertBefore(thinRow, fixRow.nextSibling);
  }
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