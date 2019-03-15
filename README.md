#Research Project

# Outline

    This project can protect users from a part of malicious web attacks.
    
    It consists of 3 parts

        A. List Manage System
        B. Proxy
        C. Chrome extension
        
        
    The List Manage System will maintain a list that recorded good domains and bad domains.

    The Proxy will block requests that send to bad domains.
    If the request target not in the list, the proxy will do some analyses to decide if the domain is good or bad, and add it to the list.

    The extension provide user to customize which domain is bad or good, and notify user when request blocked by proxy.

# Environment setting

    A. List Manage System

        Put files that under the 'ManagementWebsite' folder into your web server, for example: xampp/htdoc.

        (recommand)Set php.ini session.cookie_samesite = Strict

        Put files that under the 'SQLiteDB' to 'C:\SQLiteDB\proxy.sqlite'(default) or any private directory.

        Edit path '$SQLiteDB' in 'main.php' if you changed the path of the database.

        

    B. Proxy

        Make sure your have installed python3

        Install beautiful soup
        (cmd: pip install BeautifulSoup4)

        Install mitmproxy

        Edit path if you changed the path of the database.

        Run mitmproxy under folder 'ProxyScript'
        (cmd: mitweb -s script.py)

    C. Extension

        Just install it on Chrome.

# Usage

    A. List Manage System

        CSV format: 
                col 1      | col 2 | col 3
        row 1   DOMAINNAME |  TAG  | TYPE
        row 1   AAA        | static| pass
