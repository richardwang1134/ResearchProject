/*
待實作功能

    資料結構改變
        現在每個網站就是一個物件
        {website.name:website}
        宣告方式
            var website = new Website(status,name);
            var obj[name]=website;
        可再視需求新增Website類別建構方式
        儲存時 把物件上傳即可
        讀取時 website.name 就是key

以下都是form裡面要做的內容

    全部登出
        可在coockie新建一個deleteAll method
        並且須改變按鈕的classname和innerHTML
    登入
        暫時先只做改變按鈕的classname和innerHTML還有onclick事件
    登出
        可直接用coockie.delete
        並且須改變按鈕的classname和innerHTML還有onclick事件
    新增網站
        coockie.getInOut會回傳登入前後的coockie(要等2秒)
        須把coockie / name / url / 儲存到
        新增到網站列表
    設定頁面
        須新建立一個setting.html 還有相對應的.js
        讓使用者自行調節目標網站的各種屬性
        例如time(自動登出時間) sensitivity(敏感度) name(可由使用者自訂)
    登入狀態分析
        須視資料結構更改
        分析完畢按照結果更改資料庫內容
    refresh
        須先引用 登入狀態分析 method
        再把資料庫中所有東西抓下來 sync.get() 無參數
        然後把所有網站丟給 print印出popup頁面

惡意網站探測器

    須寫在mainfest中的background (背景執行)
    或者是content scirpt (加到當前網頁)
    偵測到危險就刪coockie

密碼管理系統
    上方選項鍵 做一個登入帳密管理
    帳號資料先以AES加密 再用公鑰加密 最後才存到sync
    登入後先以私鑰解密 要以AES KEY解密 才能取得個別網站的密碼

*/
//start
document.addEventListener('DOMContentLoaded',()=>{
    var form = new Form;
    form.refresh();
});
function Website(s,n){
    this.status=s;
    this.name=n;
}
function Form(){

    this.refresh = function(){
        var sync = new Sync;
        (async()=>{
            var websites = await sync.get();
            print(websites);
        })()
    }
        var print = function(websites){
            printFrame();
            printOption('還不知道',notYet,"option");
            printOption('加新網站',notYet,"option");
            printOption('全部登出',notYet,"option");
            printWebsite(websites);
        }
            var printFrame = function(){
                var frame = document.createElement("div");
                frame.className="Frame";
                document.body.appendChild(frame);
            }
            var printOption = function(text,onClick,cName){
                var p = document.createElement("p");
                var d = document.createElement("div");
                p.innerHTML=text;
                d.className=cName;
                d.addEventListener('click',onClick,false);
                document.body.lastChild.appendChild(d);
                d.appendChild(p);
                
            }
            var printWebsite = function(websites){
                var max=websites.length;
                var text,onClick,cName;
                for(var i = 0; i< max;i++)
                {
                    website = websites[i];
                    //印外框
                    printFrame();
                    //印登入狀態
                    if(website.status){
                        text = "登出";
                        cName = "logout";
                    }
                    else{
                        text = "登入";
                        cName = "login";
                    }
                    printOption(text,notYet,cName);
                    //印網站格
                    text = website.name;
                    onClick = function(){window.open(websites.url)};
                    printOption(text,onclick,"website");
                    //印設定
                    printOption("設定",notYet,"setting");
                }
            }
    var notYet = function(){
        console.log("還沒做好");
    }
};
/*(Only used in async function)
    set(obj) {Website.name:Website} return null
    get(key) {Website.name}         return Website obj
    get()                           return Website objs in array*/
function Sync(){
    this.set = function(obj)
    {
        return new Promise( (resolve) => {
            chrome.storage.local.set( obj, () => resolve() );
        });
    },
    this.get = function(key = null)
    {
        return new Promise( (resolve) => {
            chrome.storage.local.get(key, (item) => {
                var array = [];
                for(var i in item)
                    array.push(item[i]);
                key ? resolve(item[key]) : resolve(array);
            });
        });
    }
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function Coockie(){
    var getURL = function(){
        return new Promise( (resolve) => {
            chrome.tabs.getSelected(null, (tab) => {
               resolve(tab.url);
            });
        });
    }
    this.get = function(URL){
        return new Promise( (resolve) => {
            chrome.cookies.getAll({url:URL}, function(cookies){
                max=cookies.length;
                cookienames=[];
                for (var i = 0; i < max; i++) {
                    var name   = cookies[i].name;
                    cookienames.push(name);     
                }
                //console.log(cookies);
                resolve(cookienames);
            });
        });
    }
    this.delete = function(URL){
        return new Promise( (resolve) => {
            //remove參數包含cookie名稱 所以先取得 再刪除
            chrome.cookies.getAll({url:URL}, function(cookies){
                var names=[],max= cookies.length;
                for (i = 0; i < max; i++)
                    names.push(cookies[i].name);
                for (i=0;i<names.length;i++)
                    chrome.cookies.remove({url:URL,name:names[i]});
                resolve();
            });
        });
    }
    this.getInOut = function(URL){
        return new Promise( (resolve) => {
            (async()=>{
                var inCoockie = await this.get(URL);
                await this.delete(URL);
                chrome.tabs.reload();
                await sleep(2000);
                var outCoockie = await this.get(URL);
                var coockies = [];
                coockies.push(inCoockie);
                coockies.push(outCoockie);
                resolve(coockies);
            })();
        });
    }
};