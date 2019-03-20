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
        self.edittime = ""
        self.triggertime = ""
        self.tag = ""

def ShortURL(url):
    try:
         ShortURL = url.split("/")[2]
    except:
        return url
    ShortURL = ShortURL.replace("www.", "")
    return ShortURL

def Test():
        c.execute(
            "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                'Test1', 'False', 0, 0, 'delete'))
        conn.commit()
        c.execute(
            "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                'Test2', 'False', 0, 0, 'delete'))
        conn.commit()
        c.execute(
            "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                'Test3', 'False', 0, 0, 'static'))
        conn.commit()
        c.execute(
            "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                'Test4', 'False', 0, 0, 'static'))
        conn.commit()
        c.execute(
            "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                'Test5', 'False', 0, 0, 'dynamic'))
        conn.commit()
        c.execute(
            "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                'Test6', 'False', 0, 0, 'dynamic'))
        conn.commit()
        c.execute(
            "INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
                'Test7', 'False', 0, 0, 'dynamic'))
        conn.commit()

def NewData(url):
    shorturl = ShortURL(url)
    now = int(time.time())
    c.execute("INSERT INTO List(DOMAINNAME,SECURITY,EDITTIME,TRIGGERTIME,TAG)  VALUES ('%s', '%s', '%d','%d','%s')" % (
    shorturl, 'True', now,now,'dynamic'))
    conn.commit()

def UpdateData(url):
    now = int(time.time())
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
        sql = "UPDATE LIST set SECURITY = ? where DOMAINNAME = ?"
        c.execute(sql, (Secure, url,))
        conn.commit()

        sql = "UPDATE LIST set EDITTIME = ? where DOMAINNAME = ?"
        c.execute(sql, (now, url,))
        conn.commit()
    except:
        DeleteData(url)

def DeleteData(url):
    try:
        sql = "DELETE from List where DOMAINNAME = ?;"
        c.execute(sql, (url,))
        conn.commit()
    except:
        print("data has not existed")
    print(url, "have been deleted!")

def PrintAll():
    for data in c.execute('SELECT * FROM List ORDER BY DOMAINNAME'):
        print(data)

def UpdateAll():
    datalist = []
    conn = sqlite3.connect('C:\\Users\\user\\Desktop\\ProxyDB.db', check_same_thread=False)
    c = conn.cursor()

    for data in c.execute('SELECT * FROM List WHERE TAG = "dynamic" '):
        datalist.append(str(data[0]))
    for url in datalist:
        UpdateData(url)
    print("Updating has completed")
    conn.close()
    timer = Timer(UpdateTime, UpdateAll)
    timer.start()

UpdateTime = 86400

conn = sqlite3.connect('C:\\Users\\user\\Desktop\\ProxyDB.db', check_same_thread = False)
c = conn.cursor()

try:
    c.execute('''CREATE TABLE List
    (DOMAINNAME TEXT  PRIMARY KEY     NOT NULL,
    SECURITY           TEXT    NOT NULL,
    EDITTIME            INTEGER     NOT NULL,
    TRIGGERTIME            INTEGER     NOT NULL,
    TAG            TEXT     NOT NULL);''')
    print ("Table created successfully!")
except:
    print("table already exist!")

UpdateAll()






