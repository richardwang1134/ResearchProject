package localproxypakage;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.net.Socket;
import java.util.stream.Collectors;

import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;

public class BrowserSocket {
	private SSLSocket socket;
	private BufferedReader bufferedReader;
	private BufferedWriter bufferedWriter;
	String id  = null;
	String url = null;

	public BrowserSocket(SSLSocket socket) throws IOException {
		this.socket = socket;
		InputStream is = socket.getInputStream();
		SSLSession sslSession = socket.getSession();
        System.out.println("SSLSession :");
        System.out.println("\tProtocol : "+sslSession.getProtocol());
        System.out.println("\tCipher suite : "+sslSession.getCipherSuite());
		bufferedReader = new BufferedReader(new InputStreamReader(is));
		bufferedWriter = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF8"));
	}
	public BrowserRequest receive(){
		BrowserRequest browserRequest = new BrowserRequest();
		String line = "line";
        try {
			while((line = bufferedReader.readLine()) != null){
			    System.out.println("Inut : "+line);
			    if(line.trim().isEmpty()){
			        break;
			    }
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return browserRequest;
		/*String line = "line";
		int beginIndex,endIndex;
		try {
			while(line!=null && !line.equals("")) {	
				Printer.printThread(line);
				line = bufferedReader.readLine();
				Printer.printThread(line);
				if(line.contains("/request1")) {
					browserRequest.type = "1";
					beginIndex = line.indexOf("/request1")+10;
					endIndex = line.indexOf("/",beginIndex);
					if(beginIndex>0 && endIndex >0) {
						browserRequest.id = line.substring(beginIndex,endIndex);
					}
					beginIndex = line.indexOf("/",endIndex)+1;
					endIndex = line.indexOf(" ",beginIndex);
					if(beginIndex>0 && endIndex >0) {
						browserRequest.url = line.substring(beginIndex,endIndex);
					}
					break;
				}else if(line.contains("/request2")){
					browserRequest.type = "2";
					beginIndex = line.indexOf("/request2")+10;
					endIndex = line.indexOf(" ",beginIndex);
					if(beginIndex>0 && endIndex >0) {
						browserRequest.id = line.substring(beginIndex,endIndex);
					}
				}
			}
			return browserRequest;
		}catch(Exception e) {	
			Printer.printException("BrowserSocket.receive", e.getMessage());
			return null;
		}*/
	}
	public void sendHeader(String header) throws IOException {
		bufferedWriter.write(header);
	}
	public void sendBody(BufferedReader bufferedReader) throws IOException {
		String line;
		while(true) {
			line = bufferedReader.readLine();
			if(line==null) break;
			bufferedWriter.write(line + "\r\n");
		}
		bufferedWriter.write("\r\n");
		bufferedWriter.close();
	}

	@SuppressWarnings({ "resource", "null" })
	public void sendChunkedBody(BufferedReader bufferedReader){
		try {
			String line;
			while(true) {
				line = bufferedReader.readLine();
				if(line==null) break;
				bufferedWriter.write(
					Integer.toHexString(line.length()+2) + "\r\n"
					+ line + "\r\n"
					+ "\r\n");
			}
			bufferedWriter.write("0\r\n\r\n");
			bufferedWriter.close();
		}catch(Exception e) {
			Printer.printException("BrowserSocket.sendChunkedBody", e.getMessage());
		}
		
	}

	public void close() throws IOException {
		socket.close();
	}

}
