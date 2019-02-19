var activeTab = "trust";
var domainList = {
  "block" : [],
  "trust" : [],
  "csrf" : []
};

//todo 三個須相斥

document.addEventListener(
  "DOMContentLoaded",
  async ()=>{
    initDomainInput();
    await getDomainList()
    setTabClickEvents();
    setAddBtnClickEvent();
        
    function initDomainInput(){
      //輸入欄位預設值 = 當前選擇的分頁的網域
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      },(tabs)=>{
        var url = new URL(tabs[0].url);
        var input = document.querySelector("#domain-input");
        input.value = url.hostname;   
      })
    }

    function getDomainList(){
      return new Promise(
        (resolve,reject)=>{
          //從背景取表單
          chrome.runtime.sendMessage(
            {type: "get"},
            (response)=>{
              domainList = response.domainList;
              resolve();
            }
          );
        }
      );
    }

    function setTabClickEvents(){
      //切換 阻擋 信任 CSRF防護 三個分頁
      var trust = document.querySelector("#trust");
      var block = document.querySelector("#block");
      var csrf = document.querySelector("#csrf");

      trust.onclick = ()=>{switchTab(trust,block,csrf)};
      block.onclick = ()=>{switchTab(block,trust,csrf)};
      csrf.onclick = ()=>{switchTab(csrf,trust,block)};

      trust.click();

      function switchTab(actived,t1,t2){
        //改變標籤外觀
        actived.classList.add("active");
        t1.classList.remove("active");
        t2.classList.remove("active");
        activeTab = actived.id;
        
        //將表單顯示出來
        document.querySelector("tbody").innerHTML = "";
        domainList[activeTab].forEach(item => {
          addRow(item);
        });
      }
    }

    function setAddBtnClickEvent(){

      var button = document.querySelector("#add-button");
      button.onclick = ()=>{

        //讀取input內容
        var domain = document.querySelector("#domain-input").value;
        //輸入檢查
        if(domainList[activeTab].includes(domain)) return;
        if(domain == "") return;
        //UI上新增一列
        addRow(domain);
        //記憶體新增一列
        domainList[activeTab].push(domain);
        syncDomainList();
      };
    }

    function addRow(domain){
      //插入新的一列
      var template = document.querySelector("#domain-template");
      var td = template.content.querySelector("td");
      td.textContent = domain;
      var tbody = document.querySelector("tbody");
      var clone = document.importNode(template.content,true);
      tbody.appendChild(clone);
      //為新插入的列設置onclick事件
      var tr = tbody.querySelector("tr:last-child");
      tr.onclick = ()=>{
        var index = domainList[activeTab].indexOf(domain);
        domainList[activeTab].splice(index,1);
        syncDomainList();
        tr.remove();
      }
    }

    function syncDomainList(){
      chrome.runtime.sendMessage(
        { 
          type: "sync",
          domainList:domainList
        }
      );
    }
  }
);





