package localproxypakage;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.security.KeyStore;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLServerSocketFactory;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;

import com.sun.net.httpserver.HttpsConfigurator;
import com.sun.net.httpserver.HttpsParameters;
import com.sun.net.httpserver.HttpsServer;


public class ProxyServer {
	private int port = 8000;
	private String ipv4 = "127.0.0.1";
     
    public static void main(String[] args){
    	ProxyServer server = new ProxyServer();
        server.run();
    }
     
    ProxyServer(){      
    }
    
    private SSLContext createSSLContext(){
        try{
            KeyStore keyStore = KeyStore.getInstance("JKS");
            keyStore.load(new FileInputStream("kserver.jks"),"123456".toCharArray());
            // Create key manager
            KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance("SunX509");
            keyManagerFactory.init(keyStore, "123456".toCharArray());
            KeyManager[] km = keyManagerFactory.getKeyManagers(); 
            // Create trust manager
            TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance("SunX509");
            trustManagerFactory.init(keyStore);
            TrustManager[] tm = trustManagerFactory.getTrustManagers();
            // Initialize SSLContext
            SSLContext sslContext = SSLContext.getInstance("TLSv1");
            sslContext.init(km,  tm, null);
            return sslContext;
        } catch (Exception ex){
            ex.printStackTrace();
        } 
        return null;
    }
    
    public void run(){
    	SSLContext sslContext = this.createSSLContext(); 
        try{
        	//set socket address
        	InetSocketAddress address = new InetSocketAddress ( ipv4, port );
        	//init and start HTTPS server
        	HttpsServer httpsServer = HttpsServer.create ( address, 0 );
        	httpsServer.setHttpsConfigurator ( new HttpsConfigurator( sslContext )
            {
                public void configure ( HttpsParameters params )
                {
                    try
                    {
                        SSLContext c = SSLContext.getDefault ();
                        SSLEngine engine = c.createSSLEngine ();
                        params.setNeedClientAuth ( false );
                        params.setCipherSuites ( engine.getEnabledCipherSuites () );
                        params.setProtocols ( engine.getEnabledProtocols () );
                        SSLParameters defaultSSLParameters = c.getDefaultSSLParameters ();
                        params.setSSLParameters ( defaultSSLParameters );
                    }
                    catch ( Exception ex )
                    {
                    	Printer.print(ex.getMessage());
                    }
                }
            } );
        	httpsServer.createContext("/request1", new Request1Handler());
        	httpsServer.createContext("/request2", new Request2Handler());
        	httpsServer.setExecutor(Executors.newCachedThreadPool());
        	httpsServer.start();
        	Printer.print("HTTPS Server Started at "+ipv4+":"+port);
        } catch (Exception ex){
            ex.printStackTrace();
        }
    }
	
}