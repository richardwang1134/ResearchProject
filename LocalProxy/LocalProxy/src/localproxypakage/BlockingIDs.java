package localproxypakage;

import java.util.HashSet;
import java.util.Set;

/*
 * MyMap.get : get URL by requestId
 * MyMap.set : replace or add new element <URL,requestId> to the Map
 * MyMap.del : delete element of Map by requestId
 */
public class BlockingIDs {
	static Set<String> set = new HashSet<>();
	public static boolean contains(String requestId) {
		return set.contains(requestId);
	}
	public static void add(String requestId) {
		set.add(requestId);
	}
	public static void remove(String requestId) {
		set.remove(requestId);
	}
}
