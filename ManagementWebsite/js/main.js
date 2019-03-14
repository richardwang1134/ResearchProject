window.onload = async()=>{
  if(await signedIn()){
    gotoManage();
  }else{
    gotoLogin();
  }
}
async function signedIn(){
  var data = {type:'check'};
  var result = await POST('main.php',data);
  if(result=='pass') return true;
  else return false;
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
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = ()=> {
      if (xhr.status !== 200){
        alert('Request failed.  Returned status of ' + xhr.status);
        resolve("fail");
      }else{
        resolve(xhr.responseText);
      }
    };
    xhr.send(JSON.stringify(data));
  });
}

async function login(){//送出登入請求並跳轉頁面
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
}

async function gotoLogin(){//顯示登入畫面
  var response = await GET("login.html");
  var body = document.querySelector('body');
  body.className = "d-flex flex-column bg-secondary";
  body.innerHTML = response;
  var form = document.querySelector('form');
  form.onsubmit = ()=>{
    login();
    return false;
  };
}

function getFilters(){
  var domain = document.getElementById('domain-input').value;
  var editTimeST = document.getElementById('edit-time-st').value;
  var editTimeED = document.getElementById('edit-time-st').value;
  var trigTimeST = document.getElementById('edit-time-st').value;
  var trigTimeED = document.getElementById('edit-time-st').value;
  
  if(domain=='') domain = 'all';
  if(editTimeST=='') editTimeST='2000/01/01 00:00';
  if(editTimeED=='') editTimeED='3000/12/31 11:59';
  if(trigTimeST=='') trigTimeST='2000/01/01 00:00';
  if(trigTimeED=='') trigTimeED='3000/12/31 11:59';

  var type1 = document.getElementById('type-checkbox-1').checked;
  var type2 = document.getElementById('type-checkbox-2').checked;
  var type3 = document.getElementById('type-checkbox-3').checked;
  var type = 'all';
  if(type1) type = 'pass';
  if(type2) type = 'block';

  
  var tag1 = document.getElementById('tag-checkbox-1').checked;
  var tag2 = document.getElementById('tag-checkbox-2').checked;
  var tag3 = document.getElementById('tag-checkbox-3').checked;
  var tag4 = document.getElementById('tag-checkbox-3').checked;
  var tag = "all";
  if(tag1) tag = 'static';
  if(tag2) tag = 'dynamic';
  if(tag3) tag = 'delete';

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

async function gotoManage(){//顯示管理畫面
  var response = await GET("manage.html");
  var body = document.querySelector('body');
  body.className = "";
  body.innerHTML = response;

  //設定確認篩選條件按鍵
  var confirm = document.querySelector('#confirm');
  confirm.onclick = async()=>{
    var data = getFilters();
    console.log(data);
    var response = await POST('main.php',data);
    //console.log(response);
    console.log(JSON.parse(response));
    printTable(JSON.parse(response));
  }

  //設定篩選按鍵
  var filter = document.querySelector('#filter');
  filter.onclick = ()=>{
    var myModal = document.getElementById('filter-modal');
    var myModalInstance = new Modal(myModal);
      myModalInstance.show();
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
  //取得資料
  var data = {
    type:'search',
    Domain:"all",
    Type:'all',
    Tag:'all',
    EditST:'2000/01/01 00:00',
    EditED:'3000/12/31 23:59',
    TrigST:'2000/01/01 00:00',
    TrigED:'3000/12/31 23:59',
  }
  console.log(data);
  var response = await POST('main.php',data);
  //console.log(response);
  console.log(JSON.parse(response));
  printTable(JSON.parse(response));
  
}


function printTable(data){
  var template = document.querySelector('#row-template');
  var td = template.content.querySelectorAll('td');
  var tb = document.querySelector('tbody');
  tb.innerHTML = '';
  for(var n in data){
    var row = data[n];
    td[0].textContent = row['SECURITY'];
    td[1].textContent = row['TAG'];
    td[2].textContent = row['DOMAINNAME'];
    td[3].textContent = time2Str(row['EDITTIME']);
    td[4].textContent = time2Str(row['TRIGGERTIME']);
    var clone = document.importNode(template.content,true);
    tb.appendChild(clone);
  }
  
}
function time2Str(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = a.getMonth();
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();

  month = (month < 10 ? "0" : "") + month;
  date = (date < 10 ? "0" : "") + date;
  hour = (hour < 10 ? "0" : "") + hour;
  min = (min < 10 ? "0" : "") + min;

  var time = year + '/' + date + '/' + month + ' '+ hour + ':' + min;
  return time;
}