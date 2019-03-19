
var searchData = {
  type:'search',
  Domain:"all",
  Type:'all',
  Tag:'all',
  EditST:'1970/01/01 00:00',
  EditED:'3000/12/31 23:59',
  TrigST:'1970/01/01 00:00',
  TrigED:'3000/12/31 23:59',
}

window.onload = async()=>{
  if(await signedIn()){
    gotoManage();
  }else{
    gotoLogin();
  }
  async function signedIn(){
    var data = {type:'check'};
    var result = await POST('main.php',data);
    if(result=='pass') return true;
    else return false;
  }
}

function GET(url){
  return new Promise((resolve,reject)=>{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = ()=>{
        if (xhr.status !== 200){
          alert('Request failed.  Returned status of ' + xhr.status);
          resolve("fail");
        }else{
          resolve(xhr.responseText);
        } 
    }
    xhr.send();
  });
}

function POST(url,data){
  return new Promise((resolve,reject)=>{
    console.log('send :',data);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = ()=> {
      if (xhr.status !== 200){
        alert('Request failed.  Returned status of ' + xhr.status);
        resolve("fail");
      }else{
        console.log('receive :',xhr.responseText);
        resolve(xhr.responseText);
      }
    };
    xhr.send(JSON.stringify(data));
  });
}

//顯示登入畫面
async function gotoLogin(){
  var response = await GET("login.html");
  var body = document.querySelector('body');
  body.className = "d-flex flex-column bg-secondary";
  body.innerHTML = response;
  var form = document.querySelector('form');
  //送出登入請求並跳轉頁面
  form.onsubmit = async()=>{
    var data = {
      type:"login",
      account:document.querySelector('#account').value,
      password:document.querySelector('#password').value
    };
    var result = await POST("main.php",data);
    if(result=="pass") gotoManage();
    else{
      alert(result);
      var button = document.querySelector('button');
      button.className = "btn btn-warning";
      button.innerHTML = "再試一次";
    }
    return false;
  };
}

//顯示管理畫面
async function gotoManage(){
  var response = await GET("manage.html");
  var body = document.querySelector('body');
  body.className = "";
  body.innerHTML = response;
  refreshTable();

  //設定確認修改按鍵
  var confirmModify = document.getElementById('confirm-modify');
  confirmModify.onclick = async()=>{
    var modifyData = getModify();
    function getModify(){

      var type = 'all';
      if(document.getElementById('modify-checkbox-4').checked) type = 'pass';
      if(document.getElementById('modify-checkbox-5').checked) type = 'block';
      
      var tag = 'all';
      if(document.getElementById('modify-checkbox-1').checked) tag = 'static';
      if(document.getElementById('modify-checkbox-2').checked) tag = 'dynamic';
      if(document.getElementById('modify-checkbox-3').checked) tag = 'delete';
    
      return {
        type:'modify',
        DOMAINNAME:document.getElementById('modify-modal-title').innerHTML,
        SECURITY:type,
        TAG:tag
      };
    }
    console.log(modifyData);
    var result = await POST('main.php',modifyData);
    if(result == 'complete'){
      refreshTable();
    }else{
      console.log(result);
    }
  }
  
  //設定篩選按鍵
  var filter = document.querySelector('#filter');
  filter.onclick = ()=>{

    var myModal = document.getElementById('filter-modal');
    var myModalInstance = new Modal(myModal);
    myModalInstance.show();

    //設定確認篩選條件按鍵
    var confirm = document.querySelector('#confirm');
    confirm.onclick = ()=>{
      searchData = getFilters();
      function getFilters(){
        var domain = document.getElementById('domain-input').value;
        var editTimeST = document.getElementById('edit-time-st').value;
        var editTimeED = document.getElementById('edit-time-ed').value;
        var trigTimeST = document.getElementById('trig-time-st').value;
        var trigTimeED = document.getElementById('trig-time-ed').value;
        
        if(domain=='') domain = 'all';
        if(editTimeST=='') editTimeST='1970/01/01 00:00';
        else editTimeED+=' 23:59';
        if(editTimeED=='') editTimeED='3000/12/31 23:59';
        else editTimeED+=' 23:59';
        if(trigTimeST=='') trigTimeST='1970/01/01 00:00';
        else trigTimeST+=' 23:59';
        if(trigTimeED=='') trigTimeED='3000/12/31 23:59';
        else trigTimeED+=' 23:59';
      
        var type = 'all';
        if(document.getElementById('type-checkbox-1').checked) type = 'pass';
        if(document.getElementById('type-checkbox-2').checked) type = 'block';
        
        var tag = 'all';
        if(document.getElementById('tag-checkbox-1').checked) tag = 'static';
        if(document.getElementById('tag-checkbox-2').checked) tag = 'dynamic';
        if(document.getElementById('tag-checkbox-3').checked) tag = 'delete';
      
        return {
          type:'search',
          Domain:domain,
          Type:type,
          Tag:tag,
          EditST:editTimeST,
          EditED:editTimeED,
          TrigST:trigTimeST,
          TrigED:trigTimeED,
        };
      }
      refreshTable();
    }


  }

  //設定匯入按鈕
  var readFileBtn = document.getElementById('read-file');
  readFileBtn.addEventListener("change", readFile, false);
  async function readFile() {
    var file = this.files[0];
    var fileReader = new FileReader();
    fileReader.onload = async(event)=>{
      var data = loadCSV(event.target.result);
      //將CSV檔案中的字串轉換成array
      function loadCSV(text){
        var rows = text.split("\r\n");
        var table =rows.map(row=>row.split(","));
        var data = {
          type:'insert',
          DOMAINNAME:[],
          TAG:[],
          TYPE:[]
        };
        if( table[0][0]=='DOMAINNAME'&&
            table[0][1]=='TAG'&&
            table[0][2]=='TYPE'){
          for(var i=1; i<table.length; i++){
              if( table[i][0]&&
                  (table[i][1]=='static'||table[i][1]=='dynamic'||table[i][1]=='delete')&&
                  (table[i][2]=='pass'||table[i][2]=='block')){
                data.DOMAINNAME.push(table[i][0]);
                data.TAG.push(table[i][1]);
                data.TYPE.push(table[i][2]);
              }
          }
        }
        return data;
      };
      var response = await POST('main.php',data);
      if(response == "complete"){
        refreshTable();
      }else{
        console.log(response);
      }
    };
    fileReader.readAsText(file);
  }

  //設定登出按鍵
  var logout = document.querySelector('#logout');
  logout.onclick = async()=>{
    var data = {type:"logout"};
    var result = await POST("main.php",data);
    if(result == "complete")
      gotoLogin();
    else{
      alert("logout fail");
      alert(result);
    }
  }

  //刷新列表
  async function refreshTable(){
    var response = await POST('main.php',searchData);
    data = JSON.parse(response);
    var template = document.querySelector('#row-template');
    var td = template.content.querySelectorAll('td');
    var tb = document.querySelector('tbody');
    tb.innerHTML = '';
    for(let n in data){
      let row = data[n];
      td[0].textContent = row['SECURITY'];
      td[1].textContent = row['TAG'];
      td[2].textContent = row['DOMAINNAME'];
      td[3].textContent = time2Str(row['EDITTIME']);
      td[4].textContent = time2Str(row['TRIGGERTIME']);
      let clone = document.importNode(template.content,true);
      //設定修改按鈕事件
      let modifyBtn = clone.getElementById('modify');
      modifyBtn.onclick = ()=>{
        var myModal = document.getElementById('modify-modal');
        console.log(document.getElementById('modify-modal-title'));
        document.getElementById('modify-modal-title').innerHTML=row['DOMAINNAME'];
        var myModalInstance = new Modal(myModal);
        myModalInstance.show();
      };
      //設定修刪除按鈕事件
      let deleteBtn = clone.getElementById('delete');
      deleteBtn.onclick = async()=>{
        var data = {
          type:'delete',
          DOMAINNAME:row['DOMAINNAME']
        };
        var result = await POST('main.php',data);
        if(result=='complete'){
          refreshTable();
        }else{
          console.log(result);
        }        
      }
      tb.appendChild(clone);

    }

    function time2Str(UNIX_timestamp){
      var a = new Date(UNIX_timestamp * 1000);
      var year = a.getFullYear();
      var month = a.getMonth()+1;
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
    
      month = (month < 10 ? "0" : "") + month;
      date = (date < 10 ? "0" : "") + date;
      hour = (hour < 10 ? "0" : "") + hour;
      min = (min < 10 ? "0" : "") + min;
    
      var time = year + '/' + month + '/' +  date +  ' '+ hour + ':' + min;
      return time;
    }
    
  }


}

