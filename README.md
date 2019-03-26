# Outline

    This project can protect users from a part of malicious web attacks.
    
    It consists of 3 parts :

        A. List Manage System

        B. Proxy

        C. Chrome extension
        
        
    The List Manage System will maintain a list that recorded good domains and bad domains.

    The Proxy will block requests that is sent to bad domains.

    If the request target is not in the list, the proxy will do some analyses to decide wheather the domain is secure or not, and add it to the list.

    The extension provide user to customize which web domain is secure or malicious, and notify user when request blocked by proxy.

# Environment setting

    A. List Manage System

        1. Put files that under the 'ManagementWebsite' folder into your web server, for example: xampp/htdoc.

        2. Set php.ini session.cookie_samesite = Strict (recommand)

        3. Put files that under the 'SQLiteDB' to 'C:\SQLiteDB\proxy.sqlite'(default) or any private directory.

        4. Edit path '$SQLiteDB' in 'main.php' if you changed the path of the database.


    B. Proxy

        1. Make sure your have installed python3 (check 'precompiled stadard libeary')

        2. Install mitmproxy (pip3 install mitmproxy)
        Install beautiful soup 4 (under pip folder cmd: pip install BeautifulSoup4)

        pip install pysqlite3

        3. 

        4. Edit the path if you changed the path of the database.

        5. Run mitmproxy under folder 'ProxyScript' (cmd: mitmweb -s proxy.py)

        6. Set certificate of mitmproxy (optional)

    C. Extension

        Just install it on Chrome.

# Usage

    A. List Manage System

        import CSV format: 

                col 1      | col 2 | col 3
        row 1   DOMAINNAME |  TAG  | TYPE
        row 1   AAA        | static| pass
