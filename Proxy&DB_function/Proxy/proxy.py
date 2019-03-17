import mitmproxy.http
from mitmproxy import ctx

class Test:
    def __init__(self):
        self.num = 0

    def request(self, flow: mitmproxy.http.HTTPFlow):
        flow.request.headers["Proxy-Mode"] = "Block"
    def response(self, flow: mitmproxy.http.HTTPFlow):
        self.num = self.num + 1
        #判斷header及http cookie內容
        if(flow.request.headers["Proxy-Mode"] == "NoCookie"):
            flow.response._set_cookies("")
            print("Delete SetCookieValue!")
        #elif(flow.request.headers["Proxy-Mode"] == "Block"):
            #flow.response.data = ""
         #   print("Block")
addons = [
    Test()
]