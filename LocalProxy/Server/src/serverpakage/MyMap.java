package serverpakage;

import java.util.HashMap;
import java.util.Map;

/*
 * MyMap.get : get URL by requestId
 * MyMap.set : replace or add new element <URL,requestId> to the Map
 * MyMap.del : delete element of Map by requestId
 */
public class MyMap {
	private static Map<String,String> map = new HashMap<String,String>();
	public static String get(String requestId) {
		return map.get(requestId);
	}
	public static void set(String requestId,String URL) {
		map.put(requestId, URL);
	}
	public static void del(String requestId) {
		map.remove(requestId);
	}
}
