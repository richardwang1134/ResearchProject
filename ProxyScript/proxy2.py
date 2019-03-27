from mitmproxy import http
from mitmproxy import ctx
from bs4 import BeautifulSoup
from threading import Timer
import sqlite3
import datetime
import urllib.request
import urllib.parse
import time

def exception(msg):
    print('EXCEPTION:')
    print('          '+msg)

#隔一段時間同步
#URLVOID
#Cookie

class ProxyRun:


    def __init__(self):
        self.data = {}
        self.synchronize()

    def synchronize(self):

        print(' - - - - - sync start - - - - -')

        def getDBData():
            data={}
            conn = sqlite3.connect('C:\\SQLiteDB\\proxy.sqlite')
            table = conn.cursor().execute('SELECT * FROM List')
            for row in table:
                domain = row[0]
                data[domain] = {}
                data[domain]['EDITTIME'] = row[1]
                data[domain]['TRIGGERTIME'] = row[2]
                data[domain]['TAG'] = row[3]
                data[domain]['SECURITY'] = row[4]
            return data
        dbData = getDBData()

        def getNewData(pxData,dbData):
            def dbDelete(domain):
                sql = "DELETE from List where DOMAINNAME = ?;"
                conn.cursor().execute(sql, (domain,))
                conn.commit()
            newData = {}
            for key in pxData:
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
                    del dbData[key]
                elif pxData[key]['TAG']!='delete':
                    newData[key] = pxData[key]
            for key in dbData:
                if dbData[key]['TAG']=='delete':
                    dbDelete(key)
                else:
                    newData[key] = dbData[key]
            return newData
        self.data = getNewData(self.data,dbData)

        def printData(data):
            for domain in data:
                print(domain)
                for key in data[domain]:
                    print('        ','%-12s'%key,data[domain][key])
        printData(self.data)

        print(' - - - - - sync complete - - - - -')
        

    def request(self, flow: http.HTTPFlow):

        def getHost(url):
            i = url.find("//")+2
            j = url.find("/",i)
            if i < 0:
                print('EXCEPTION : getHost(invalid url)')
                return ""
            if j < 0:
                j = len(url)
            host = url[i:j]
            return host
        host = getHost(flow.request.url)

        mode = flow.request.headers.get('Proxy-Mode')

        if mode == 'Block':
            response = http.HTTPResponse.make(200)

        if mode == 'Default':
            def checkData():
                if self.data.get(host):
                    return self.data[host].get('SECURITY')
                else:
                    return 'NotFound'
            mode = 'CheckData:'+checkData()

        if mode == 'CheckData:Block':
            response = http.HTTPResponse.make(200,{"Proxy-Message": "block-dynamic"})

        if mode == 'CheckData:NotFound':
            def checkURLVoid():
                return 'Pass'
            result = checkURLVoid()
            mode = mode + ' -> CheckURLVoid:' + result
            def addToData():
                now = int(time.time())
                newData = {}
                newData['EDITTIME'] = now
                newData['TRIGGERTIME'] = now
                newData['TAG'] = 'dynamic'
                newData['SECURITY'] = result
                self.data[host] = newData
            addToData()
            
        if mode == 'CheckData:NotFound -> CheckURLVoid:Block':
            response = http.HTTPResponse.make(200,{"Proxy-Message": "Block"})
        
        if mode:
            print(host+' -> '+mode)

            

            

            
                


        




            




addons = [
    ProxyRun()
]
