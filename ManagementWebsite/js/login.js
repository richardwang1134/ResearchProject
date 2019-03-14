

//設定onclick事件


var form = document.querySelector('form');
form.onsubmit=()=>{
    var data = JSON.stringify({
        account:document.querySelector('account').value,
        password:document.querySelector('password').value
    });
    return false;
}



$.ajax({
    type: "POST",
    //async為false -> 同步 
    //async為true  -> 非同步
    async: false,   
    dataType: "json",
    url: "從根目錄開始或者相對路徑等等/指到的.aspx/function_01",
    //↑↑↑↑↑↑反正就是要指到你寫的aspx拉↑↑↑↑↑↑↑↑
    contentType: 'application/json; charset=UTF-8',
    data: sJson,
    success: function (msg) {
        //後端回傳的東西包成Object回來,
        //ex:{sResult = 例如在後端自己命名的某型別sResult物件}
        var sResult = msg.d.sResult;
        //後端回傳的東西包成Object回來,
        //ex:{db_Result = 例如在後端自己命名的DataTable物件}
        var db_Result = msg.d.db_Result;
        
        //do something
        },
        //statusCode範例
        statusCode: {
            403: function (response) {
                LocationHerf();
            }
        }
    }
});

var LocationHerf = function () {
    window.location.href = "你要轉page的URL拉";
};
