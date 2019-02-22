import sqlite3
import datetime
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup

def PrintAll():
    for data in c.execute('SELECT * FROM List ORDER BY URL'):
        print(data)
def NewData(url):
    c.execute("INSERT INTO List(URL,SECURITY,LASTCHECKTIME)  VALUES ('%s', '%s', '%s')" %(url,'False','2019-01-01'))
    conn.commit()
def UpdateData(ShortURL):
    time = datetime.datetime.now()
    checktime = time.strftime('%Y-%m-%d')

    quote_page = "http://www.urlvoid.com/scan/" + ShortURL + "/"
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

    sql = "UPDATE LIST set SECURITY = ? where URL = ?"
    c.execute(sql,(Secure,ShortURL,))
    conn.commit()

    sql = "UPDATE LIST set LASTCHECKTIME = ? where URL = ?"
    c.execute(sql, (checktime, ShortURL,))
    conn.commit()

def DeleteData(url):
    sql = "DELETE from List where URL = ?;"
    c.execute(sql,(url,))
    conn.commit()

def ShortURL(url):
    ShortURL = url.split("/")[2]
    ShortURL = ShortURL.replace("www.", "")
    return ShortURL

#-------------------------------------------------------------------------------------------------#
conn = sqlite3.connect('test.db')
c = conn.cursor()

try:
    c.execute('''CREATE TABLE List
    (URL TEXT  PRIMARY KEY     NOT NULL,
    SECURITY           TEXT    NOT NULL,
    LASTCHECKTIME            TEXT     NOT NULL);''')
    print ("Table created successfully!")
except:
    print("table already exist!")
try:
    NewData(ShortURL("https://tw.yahoo.com/"))
    NewData(ShortURL("https://www.youtube.com/watch?v=zOEISgh7k_g"))
    NewData(ShortURL("https://www.gamer.com.tw/"))
    NewData(ShortURL("https://technews.tw/"))
    NewData(ShortURL("https://zh-tw.facebook.com/"))
except:
    print("data  already exist!")

UpdateData(ShortURL("https://www.youtube.com/watch?v=zOEISgh7k_g"))

PrintAll()
conn.close()


