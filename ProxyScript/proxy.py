from mitmproxy import http
from mitmproxy import ctx
from bs4 import BeautifulSoup
from threading import Timer
import sqlite3
import datetime
import urllib.request
import urllib.parse
import time


class ProxyRun:


    def __init__(self):
        self.data = {}
        self.synchronize()

    def synchronize(self):

        def getDBData():
            data={}
            conn = sqlite3.connect('C:\\SQLiteDB\\proxy.sqlite')
            table = conn.cursor().execute('SELECT * FROM list')
            for row in table:
                domain = row[0]
                data[domain] = {}
                data[domain]['EDITTIME'] = row[1]
                data[domain]['TRIGGERTIME'] = row[2]
                data[domain]['TAG'] = row[3]
                data[domain]['SECURITY'] = row[4]
            conn.close()
            return data
        dbData = getDBData()

        def getNewData(pxData,dbData):
            def dbDelete(domain):
                conn = sqlite3.connect('C:\\SQLiteDB\\proxy.sqlite')
                sql = "DELETE from list where DOMAINNAME = ?;"
                conn.cursor().execute(sql, (domain,))
                conn.commit()
                conn.close()
            def dbInsert(domain,data):
                conn = sqlite3.connect('C:\\SQLiteDB\\proxy.sqlite')
                sql =   """
                INSERT OR REPLACE INTO list
                (DOMAINNAME,EDITTIME,TRIGGERTIME,TAG,SECURITY)
                VALUES
                (?,?,?,?,?);
                """
                conn.cursor().execute(
                    sql,
                    (
                        domain,
                        data['EDITTIME'],
                        data['TRIGGERTIME'],
                        data['TAG'],
                        data['SECURITY']
                    ))
                conn.commit()
                conn.close()
            
            newData = {}
            for key in pxData:
                if dbData.get(key):
                    if dbData[key]['TAG']=='delete':
                        dbDelete(key)
                        del dbData[key]
                    elif dbData[key]['TAG']=='static':
                        newData[key] = dbData[key]
                        del dbData[key]
                    elif dbData[key]['TAG']=='dynamic':
                        if pxData[key]['TAG']=='delete':
                            dbDelete(key)
                        else:
                            newData[key] = pxData[key]
                            dbInsert(key,pxData[key])
                        del dbData[key]
                elif pxData[key]['TAG']!='delete':
                    newData[key] = pxData[key]
                    dbInsert(key,pxData[key])

            for key in dbData:
                if dbData[key]['TAG']=='delete':
                    dbDelete(key)
                else:
                    newData[key] = dbData[key]
            return newData
        self.data = getNewData(self.data,dbData)

        def printData(data):
            f = open('sync.txt','a')
            print(time.asctime(time.localtime(time.time())),file=f)
            print('- - - - - - - - - - - - - - - - - -\n',file=f)
            for domain in data:
                print(domain,file=f)
                for key in data[domain]:
                    print('        ','%-12s'%key,data[domain][key],file=f)
            print('\n- - - - - - - - - - - - - - - - - -\n\n',file=f)
            f.close()
        printData(self.data)
        print('sync complete')
        timer = Timer(60, self.synchronize)
        timer.start()
        
        

    def request(self, flow: http.HTTPFlow):

        mode = flow.request.headers.get('Proxy-Mode')
        referer = flow.request.headers.get('referer')

        def getHost(url):
            i = url.find("//")+2
            j = url.find("/",i)
            if i < 0:
                print('EXCEPTION : getHost(invalid url)')
                return ""
            if j < 0:
                j = len(url)
            return url[i:j]
        def getDomain(host):
            n = host.count('.')
            if n <= 1:
                return host
            i = host.index('.')+1
            if i < 0:
                print('EXCEPTION : getDomain(invalid host)')
                return ""
            return host[i:]

        host = getHost(flow.request.url)
        domain = getDomain(host)

        now = int(time.time())

        if mode == 'Block':
            flow.response = http.HTTPResponse.make(200)

        if mode == 'Default':
            if self.data.get(host):
                mode = 'CheckData:'+self.data[host].get('SECURITY')
            if self.data.get(domain) and not self.data.get(host):
                mode = 'CheckData:'+self.data[domain].get('SECURITY')
                host = domain
            if not self.data.get(domain) and not self.data.get(host):
                mode = 'CheckData:notFound'

        if mode == 'CheckData:block':
            flow.response = http.HTTPResponse.make(200,"",{"proxy-message": "block"})
            self.data[host]['TRIGGERTIME'] = now

        if mode == 'CheckData:pass':
            self.data[host]['TRIGGERTIME'] = now

        if mode == 'CheckData:notFound':
            def checkURLVoid(h):
                MIN_DETECTED = 2
                NO_REPORT_RETURN = 'pass'
                url = "http://www.urlvoid.com/scan/" + h + "/"
                page = urllib.request.urlopen(url)
                soup = BeautifulSoup(page, "html.parser")
                targets = soup.select('tbody > tr > td:nth-of-type(2) >span')
                if targets:
                    if int(targets[0].text[0]) > MIN_DETECTED:
                        return 'block'
                    else:
                        return 'pass'
                else:
                    return NO_REPORT_RETURN

            result = checkURLVoid(host)
            mode = mode + ' -> CheckURLVoid:' + result
            newData = {}
            newData['EDITTIME'] = now
            newData['TRIGGERTIME'] = now
            newData['TAG'] = 'dynamic'
            newData['SECURITY'] = result
            self.data[domain] = newData
            
        if mode == 'CheckData:notFound -> CheckURLVoid:block':
            flow.response = http.HTTPResponse.make(200,'',{"proxy-message": "block"})
        
        if mode and mode!='Pass' and mode!='CheckData:pass':
            f = open('request.txt','a')
            t = time.asctime(time.localtime(time.time()))
            print(t+'    '+domain+' -> '+mode,file=f)
            f.close()

        if flow.request.headers.get('strict-cookie')=='on':
            flow.request.cookies = ""
            f = open('request.txt','a')
            t = time.asctime(time.localtime(time.time()))
            print(t+'    '+domain+' -> '+'StrictCookie On',file=f)
            f.close()

addons = [
    ProxyRun()
]