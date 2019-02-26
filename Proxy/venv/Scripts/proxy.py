import mitmproxy.http
from mitmproxy import ctx
import sqlite3
import datetime
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
from threading import Timer

UpdateTime = 86400

def ShortURL(url):
    try:
         ShortURL = url.split("/")[2]
    except:
        return url
    ShortURL = ShortURL.replace("www.", "")
    return ShortURL

def NewData(self, url):
    shorturl = ShortURL(url)
    self.c.execute("INSERT INTO List(URL,SECURITY,LASTCHECKTIME)  VALUES ('%s', '%s', '%s')" % (
    shorturl, 'False', '2019-01-01'))
    self.conn.commit()

def UpdateData(self, url):
    time = datetime.datetime.now()
    checktime = time.strftime('%Y-%m-%d')
    try:
        quote_page = "http://www.urlvoid.com/scan/" + url + "/"
        page = urllib.request.urlopen(quote_page)
        soup = BeautifulSoup(page, "html.parser")
        span_tag = soup.find_all('span')
        datalist = []
        Secure = "True"
        for i in range(23, 99):
            if (i % 2 == 0):
                datalist.append(span_tag[i].text)
        for data in datalist:
            if (data != " Nothing Found"):
                Secure = "False"
        print(url, "is updating...")
        sql = "UPDATE LIST set SECURITY = ? where URL = ?"
        self.c.execute(sql, (Secure, url,))
        self.conn.commit()

        sql = "UPDATE LIST set LASTCHECKTIME = ? where URL = ?"
        self.c.execute(sql, (checktime, url,))
        self.conn.commit()
    except:
        DeleteData(self, url)

def DeleteData(self, url):
    try:
        sql = "DELETE from List where URL = ?;"
        self.c.execute(sql, (url,))
        self.conn.commit()
    except:
        print("data has not existed")
    print(url, "have been deleted!")

def PrintAll(self):
    for data in self.c.execute('SELECT * FROM List ORDER BY URL'):
        print(data)

def UpdateAll(self):
    datalist = []
    self.conn = sqlite3.connect('ProxyDB.db', check_same_thread=False)
    self.c = self.conn.cursor()

    for data in self.c.execute('SELECT * FROM List ORDER BY URL'):
        datalist.append(str(data[0]))
    for url in datalist:
        UpdateData(self, url)
    print("Updating has completed")
    self.conn.close()
    timer = Timer(UpdateTime, UpdateAll, (self,))
    timer.start()

#-----------------------------------------------------------------------------#
class ProxyRun:
    def __init__(self):
        self.num = 0
        Default = ["https://tw.yahoo.com/", "https://www.youtube.com/watch?v=zOEISgh7k_g",
                   "https://www.gamer.com.tw/", "https://technews.tw/", "https://zh-tw.facebook.com/"]
        self.conn = sqlite3.connect('ProxyDB.db', check_same_thread=False)
        self.c = self.conn.cursor()
        self.timer = Timer(UpdateTime, UpdateAll, (self,))
        for url in Default:
            try:
                NewData(self, url)
            except:
                print(url, " have existed ")

        try:
            self.c.execute('''CREATE TABLE List
                    (URL TEXT  PRIMARY KEY     NOT NULL,
                    SECURITY           TEXT    NOT NULL,
                    LASTCHECKTIME            TEXT     NOT NULL);''')
            print("Table created successfully!")
        except:
            print("table already exist!")
        self.conn.close()
        self.timer.start()

    def request(self, flow: mitmproxy.http.HTTPFlow):
        self.num = self.num + 1
        #flow.request.headers["Strict-Cookie"] = "on"
        #flow.request.headers["Proxy-Mode"] = "Pass"
        if(flow.request.headers["Strict-Cookie"] == "on"):
            flow.request.cookies = ""
        if(flow.request.headers["Proxy-Mode"] == "Block"):
            flow.intercept()
        if(flow.request.headers["Proxy-Mode"] == "default"):
            #default事件#
            flow.intercept()

    #    flow.intercept()

    def response(self, flow: mitmproxy.http.HTTPFlow):
        self.num = self.num + 1
        #if(flow.request.headers["Strict-Cookie"] == "on"):
        #    flow.request.cookies = ""
        #if(flow.request.headers["Proxy-Mode"] == "Block"):
        #    flow.intercept()

addons = [
    ProxyRun()
]