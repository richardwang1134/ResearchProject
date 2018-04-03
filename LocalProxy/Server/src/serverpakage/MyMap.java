package serverpakage;

import java.util.HashMap;
import java.util.Map;

public class MyMap {
	private static Map<String,String> map = new HashMap<String,String>();
	public static String get(String rid) {
		return map.get(rid);
	}
	public static void set(String rid,String url) {
		map.put(rid, url);
	}
}
