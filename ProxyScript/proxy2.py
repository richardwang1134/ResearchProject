from mitmproxy import http
from mitmproxy import ctx
import sqlite3
import datetime
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
from threading import Timer
import time



class ProxyRun:

    def __init__(self):
        self.dict = {}
        self.getDBData()


    def getDBData(self):
        conn = sqlite3.connect('C:\\SQLiteDB\\proxy.sqlite')
        table = conn.cursor().execute('SELECT * FROM List')
        for row in table:
            domain = row[0]
            self.dict[domain] = row
        
    

addons = [
    ProxyRun()
]
