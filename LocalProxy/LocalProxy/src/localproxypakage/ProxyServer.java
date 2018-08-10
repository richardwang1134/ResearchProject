package localproxypakage;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.KeyStore;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLServerSocketFactory;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;


public class ProxyServer {
	private int port = 8000;
     
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
        	ExecutorService executor = Executors.newCachedThreadPool();
            SSLServerSocketFactory sslServerSocketFactory = sslContext.getServerSocketFactory();
            SSLServerSocket sslServerSocket = (SSLServerSocket) sslServerSocketFactory.createServerSocket(this.port);
            System.out.println("SSL server started");
            while(true){
                SSLSocket sslSocket = (SSLSocket) sslServerSocket.accept();
                InputStream is = sslSocket.getInputStream();
        		BufferedReader bf = new BufferedReader(new InputStreamReader(is));
        		String line = "123";
        		while((line = bf.readLine()) != null){
    			    System.out.println("Input : "+line);
    			    if(line.trim().isEmpty()){
    			        break;
    			    }
    			}
        		HandlerThread thread = new HandlerThread(sslSocket);
                executor.execute(thread);
            }
        } catch (Exception ex){
            ex.printStackTrace();
        }
    }
	
}