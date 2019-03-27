def getHostDomain(url):

    i = url.find("//")+2
    j = url.find("/",i)
    if i < 0:
        print('EXCEPTION : getHost(invalid url)')
        return ""
    if j < 0:
        j = len(url)
    host = url[i:j]

    i = host.index('.')+1
    if i < 0:
        print('EXCEPTION : getDomain(invalid host)')
        return ""
    domain = host[i:]
    return (host,domain)


print(getHostDomain('https://www.google.com/12312'))