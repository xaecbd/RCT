package org.nesc.ecbd.utils;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年10月11日 下午1:28:10
 * @version:1.0
 * @description:redis 相关信息计算工具
 */
public class RedisInfoTool {

	/**
	 * 根据<master:slaves>获取执行分析任务ports规则
	 * 即获取其中一个slave,尽量保持均衡在不同机器上
	 * 
	 * @param clusterNodesMap
	 * @return <ip:ports>
	 */
	public static Map<String, Set<String>> generateAnalyzeRule(Map<String, List<String>> clusterNodesMap) {
		
		// 通过该map存储不同IP分配的数量，按照规则，优先分配数量最小的IP
		Map<String, Integer> staticsResult = new HashMap<>();
		Map<String, Set<String>> generateRule = new HashMap<>();

		// 此处排序是为了将slave数量最小的优先分配
		List<Map.Entry<String, List<String>>> sortList = new LinkedList<>(clusterNodesMap.entrySet());
		Collections.sort(sortList, new Comparator<Entry<String, List<String>>>() {
			@Override
			public int compare(Entry<String, List<String>> o1, Entry<String, List<String>> o2) {
				return o1.getValue().size() - o2.getValue().size();
			}
		});

		for (Entry<String, List<String>> entry : sortList) {
			List<String> slaves = entry.getValue();
			boolean isSelected = false;
			String tempPort = null;
			String tempIP = null;
			int num = 0;
			for (String slave : slaves) {
				String ip = slave.split(":")[0];
				String port = slave.split(":")[1];
				// 统计组里面不存在的IP优先分配
				if (!staticsResult.containsKey(ip)) {
					staticsResult.put(ip, 1);
					Set<String> generatePorts = generateRule.get(ip);
					if (generatePorts == null) {
						generatePorts = new HashSet<>();
					}
					generatePorts.add(port);
					generateRule.put(ip, generatePorts);
					isSelected = true;
					break;
				} else {
					// 此处是为了求出被使用最少的IP
					Integer staticsNum = staticsResult.get(ip);
					if (num == 0) {
						num = staticsNum;
						tempPort = port;
						tempIP = ip;
						continue;
					}
					if (staticsNum < num) {
						tempPort = port;
						tempIP = ip;
						num = staticsNum;
					}
				}

			}

			// 如果上面未分配,则选择staticsResult中数值最小的那个slave
			if (!isSelected) {
				if (slaves != null && slaves.size() > 0) {
					if (tempPort != null) {
						Set<String> generatePorts = generateRule.get(tempIP);
						if (generatePorts == null) {
							generatePorts = new HashSet<>();
						}
						generatePorts.add(tempPort);
						generateRule.put(tempIP, generatePorts);
						staticsResult.put(tempIP, staticsResult.get(tempIP) + 1);
					}
				}
			}
		}
		return generateRule;
	}
}
