import mitmproxy.http
from mitmproxy import ctx
import sqlite3
import datetime
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
from threading import Timer
import time

class ListData:
    def __init__(self):
        self.domainname = ""
        self.security = ""
        self.edittime = 0
        self.triggertime = 0
        self.tag = ""
def Test():
    InitProxyData = []
    List1 = ListData()
    List2 = ListData()
    List3 = ListData()
    List4 = ListData()
    List5 = ListData()
    List6 = ListData()
    List7 = ListData()
    List8 = ListData()
    List9 = ListData()
    List10 = ListData()

    
    List1.domainname = "Test1"
    List1.security = "True"
    List1.edittime = 0
    List1.triggertime = 0
    List1.tag = "dynamic"

    List2.domainname = "Test2"
    List2.security = "True"
    List2.edittime = 0
    List2.triggertime = 0
    List2.tag = "static"

    List3.domainname = "Test3"
    List3.security = "True"
    List3.edittime = 0
    List3.triggertime = 0
    List3.tag = "static"

    List4.domainname = "Test4"
    List4.security = "True"
    List4.edittime = 0
    List4.triggertime = 0
    List4.tag = "static"

    List5.domainname = "Test5"
    List5.security = "True"
    List5.edittime = 0
    List5.triggertime = 0
    List5.tag = "delete"

    List6.domainname = "Test6"
    List6.security = "True"
    List6.edittime = 0
    List6.triggertime = 0
    List6.tag = "static"

    List7.domainname = "Test7"
    List7.security = "True"
    List7.edittime = 0
    List7.triggertime = 0
    List7.tag = "static"

    List8.domainname = "Test8"
    List8.security = "True"
    List8.edittime = 0
    List8.triggertime = 0
    List8.tag = "dynamic"

    List9.domainname = "Test9"
    List9.security = "True"
    List9.edittime = 0
    List9.triggertime = 0
    List9.tag = "static"

    List10.domainname = "Test10"
    List10.security = "True"
    List10.edittime = 0
    List10.triggertime = 0
    List10.tag = "delete"

    InitProxyData.append(List1)
    InitProxyData.append(List2)
    InitProxyData.append(List3)
    InitProxyData.append(List4)
    InitProxyData.append(List5)
    InitProxyData.append(List6)
    InitProxyData.append(List7)
    InitProxyData.append(List8)
    InitProxyData.append(List9)
    InitProxyData.append(List10)


    return InitProxyData
def ShortURL(url):
    try:
         ShortURL = url.split("/")[2]
    except:
        return url
    ShortURL = ShortURL.replace("www.", "")
    return ShortURL

class ProxyRun:
    def __init__(self):
        self.num = 0
        self.ListDB = []
        #self.ListDB = Test()
        self.synchronize()

    def CheckData(self,checkurl):
        Found = ""
        Security = ""
        Result = ""
        now = int(time.time())
        original = checkurl
        checkurl = ShortURL(checkurl)

        for data in self.ListDB:
            if(checkurl == data.domainname):
                Security = data.security
                Found = "True"
                if(data.triggertime != now):
                    data.triggertime = now

        if(Found == "True" and Security == "False"):
            Result = "Block"
            return Result
        elif(Found == "True" and Security == "True"):
            Result = "Pass"
            return Result
        else:
            print("Checking ", checkurl, " Security...")
            List = ListData()

            quote_page = "http://www.urlvoid.com/scan/" + checkurl + "/"
            page = urllib.request.urlopen(quote_page)
            soup = BeautifulSoup(page, "html.parser")
            span_tag = soup.find_all('span')
            datalist = []
            Secure = "True"
            Result = "Pass"
            for i in range(23, 99):
                if (i % 2 == 0):
                    datalist.append(span_tag[i].text)
            for data in datalist:
                if (data != " Nothing Found"):
                    Secure = "False"
                    Result = "Block"

            List.domainname = checkurl
            List.security = Secure
            List.edittime = now
            List.triggertime = now
            List.tag = "dynamic"
            self.ListDB.append(List)
            print("There are ",len(self.ListDB)," data in ListDB")
            if(len(self.ListDB) > 1000):
                self.cleanolddata()

            self.num = self.num + 1
            return Result

    def synchronize(self):
        DBData = []
        NewData = []
        self.conn = sqlite3.connect('C:\\SQLiteDB\\ProxyDB.db')
        self.c = self.conn.cursor()

        for data in self.c.execute('SELECT * FROM List'):
            List = ListData()
            List.domainname = data[0]
            List.security = data[1]
            List.edittime = data[2]
            List.triggertime = data[3]
            List.tag = data[4]
            DBData.append(List)
            self.num = self.num + 1

        for data in DBData:
            if(data.tag == "delete"):
                sql = "DELETE from List where DOMAINNAME = ?;"
                self.c.execute(sql, (data.domainname,))
                self.conn.commit()

            elif(data.tag == "dynamic"):
                delete = False
                for ProxyData in self.ListDB:
                    if((ProxyData.tag == "delete") and (ProxyData.domainname == data.domainname)):
                        sql = "DELETE from List where DOMAINNAME = ?;"
                        self.c.execute(sql, (data.domainname,))
                        self.conn.commit()
                        delete = True
                if(not delete):
                    NewData.append(data)

            elif(data.tag == "static"):
                NewData.append(data)

        for ProxyData in self.ListDB:
            if((ProxyData.tag == "dynamic" or ProxyData.tag == "static")):
                found = False
                for data in DBData:
                    if(ProxyData.domainname == data.domainname):
                        found = True
                if(not found):
                    try:
                        NewData.append(ProxyData)
                        self.c.execute(
                        "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                            ProxyData.domainname, ProxyData.security, ProxyData.edittime, ProxyData.triggertime, ProxyData.tag))
                        self.conn.commit()
                    except:
                        print("Data has existed")
        
        self.ListDB = NewData
        self.conn.close()
        print("Synchronization has completed!")
        self.PrintMemData()
        timer = Timer(60, self.synchronize)
        timer.start()
    
    def cleanolddata(self):
        now = int(time.time())
        for data in self.ListDB:
            if(data.tag != "static"):
                if((now-data.triggertime)/86400 > 7):
                    data.tag = "delete"

    def PrintMemData(self):
        for data in self.ListDB:
            print("URL:", "{0:30}".format(data.domainname),
                  "Security:", "{0:10}".format(data.security),
                  "EditTime:", "{0:15}".format(data.edittime),
                  "TriggerTime:", "{0:15}".format(data.triggertime),
                  "Tag:", "{0:10}".format(data.tag))
    
    def request(self, flow: mitmproxy.http.HTTPFlow):
        self.num = self.num + 1
        try:
            if(flow.request.headers["proxy-mode"] == "Block"):
                flow.intercept()
                #proxymessage = flow.request.url + "has been blocked , if you want to browse the website, you can add the url into WhiteList"
                #flow.request.headers["proxy-message"] = proxymessage
                print(ShortURL(flow.request.url)," has been blocked!")
            elif(flow.request.headers["proxy-mode"] == "Pass"):
                print(ShortURL(flow.request.url)," is Passed")

            if(flow.request.headers["proxy-mode"] == "default"):
                if(self.CheckData(flow.request.url) == "Block"):
                    #proxymessage = flow.request.url + "has been blocked , if you want to browse the website, you can add the url into WhiteList"
                    #flow.response = http.HTTPResponse.make(
                    #200,  # (optional) status code
                    #b"Hello World",  # (optional) content
                    #{"Content-Type": "text/html"}  # (optional) headers
                    #)
                    flow.intercept()
                    print(ShortURL(flow.request.url),"has benn blocked")
        except:
                self.num = self.num

        try:
            if(flow.request.headers["Strict-Cookie"] == "on"):
                flow.request.cookies = ""
                print("The Cookie has been deleted!")
        except:
            self.num = self.num

addons = [
    ProxyRun()
]
