package org.nesc.ecbd.utils;

import java.io.Closeable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import redis.clients.jedis.HostAndPort;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisCluster;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.exceptions.JedisConnectionException;
import redis.clients.jedis.util.JedisClusterCRC16;
import redis.clients.jedis.util.Slowlog;

/**
 * 
 * @author td20
 *
 */
public class RedisUtil implements Closeable {
	public JedisCluster jc = null;
	public Jedis jedis = null;
	/**
	 * -1:不确定 0: 非集群 1：集群
	 */
	public int mode = -1;
	HostAndPort hostAndPort = null;
	private String password = null;

	public RedisUtil(String host, int port) {
		hostAndPort = new HostAndPort(host, port);
		jedis = new Jedis(host, port);
	}

	public RedisUtil(String host, int port, String password) {
		hostAndPort = new HostAndPort(host, port);
		this.password = password;
		jedis = new Jedis(host, port);
		if (StringUtils.isNotBlank(password)) {
			jedis.auth(password);
		}
	}

	public boolean clusterEnabled() {
		String info = jedis.info("cluster");
		String str = info.split(":")[1];
		int status = Integer.parseInt(str.trim());
		if (status == 1) {
			if (jc == null) {
				if (StringUtils.isNotBlank(password)) {
					jc = new JedisCluster(hostAndPort, 2000, 2000, 5, password, new JedisPoolConfig());
				} else {
					jc = new JedisCluster(hostAndPort);
				}
			}
			return true;
		} else {
			return false;
		}
	}

	/**
	 * ClusterNodes master
	 * 
	 * @return
	 */
	public Map<String, JedisPool> clusterNodes() {
		Map<String, JedisPool> nodes = jc.getClusterNodes();
		return nodes;
	}

	/**
	 * 获取该Redis所有节点IP信息
	 * 
	 * @return
	 */
	public Map<String, String> nodesIP() {
		Map<String, String> nodesIP = new HashMap<>();
		if (clusterEnabled()) {
			nodesIP = this.clusterNodesIP();
		} else {
			nodesIP = this.standAloneNodesIP();
		}
		return nodesIP;
	}

	/**
	 * 获取该stand alone Redis所有节点IP信息
	 * 
	 * @return
	 */
	public Map<String, String> standAloneNodesIP() {
		Map<String, String> nodesIPs = new HashMap<>();
		List<String> nodesList = this.standAloneRedisNodes();
		for(String node : nodesList) {
			String host = node.split(":")[0];
			nodesIPs.put(host, host);
		}
		return nodesIPs;
	}

	/**
	 * 获取该RedisCluster所有节点IP信息
	 * 
	 * @return
	 */
	public Map<String, String> clusterNodesIP() {
		Map<String, JedisPool> nodes = jc.getClusterNodes();
		Map<String, String> clusterNodesIP = new HashMap<>();
		nodes.forEach((k, v) -> {
			String host = k.split(":")[0];
			clusterNodesIP.put(host, host);
		});
		return clusterNodesIP;
	}
	
	/**
	 * 所有Master对应slave 信息 <k,v> 
	 * k=master ip:port v=[{slave ip:port},{slave ip:port}]
	 * @return
	 */
	public Map<String, List<String>> nodesMap() {
		Map<String, List<String>> nodes = new HashMap<>();
		if (clusterEnabled()) {
			nodes = this.clusterNodesMap();
		} else {
			nodes = this.standAloneNodesMap();
		}
		return nodes;
	}
	
	/**
	 * 获取standAlone master对应的slave信息 <k,v> k=master ip:port v=[{slave
	 * ip:port},{slave ip:port}]
	 * @return
	 */
	public Map<String, List<String>> standAloneNodesMap() {
		Map<String, List<String>> nodes = new HashMap<>();
		String res = jedis.info("Replication");
		String[] resArr = res.split("\n");
		// master or slave
		String role = resArr[1].split(":")[1];
		
		// slave前提下的master信息
		String masterHost = "";
		String masterPort = "";
		
		int flag = 0;
		
		if("slave".equals(role.trim())) {
			masterHost = resArr[2].split(":")[1].trim();
			masterPort = resArr[3].split(":")[1].trim();
			jedis = new Jedis(masterHost,Integer.parseInt(masterPort));
			if (StringUtils.isNotBlank(password)) {
				jedis.auth(password);
			}
			res= jedis.info("Replication");
			resArr = res.split("\n");
			flag = 1;
		}
		List<String> slaves = new ArrayList<>();
		for(String str : resArr) {
			if(str.contains("ip") && str.contains("port")) {
				String[] hostAndportArr = str.split(":")[1].split(",");
				String host = hostAndportArr[0].substring(hostAndportArr[0].indexOf("=")+1);;
				String port = hostAndportArr[1].substring(hostAndportArr[1].indexOf("=")+1);
				slaves.add(host+":"+port);
				if(flag == 0) {
					nodes.put(this.hostAndPort.getHost()+":"+this.hostAndPort.getPort(), slaves);
				} else {
					nodes.put(masterHost+":"+masterPort, slaves);
				}
			}
		}
		return nodes;
	}

	/**
	 * 获取该RedisCluster所有Master对应slave 信息 <k,v> k=master ip:port v=[{slave
	 * ip:port},{slave ip:port}]
	 * 
	 * @return
	 */
	public Map<String, List<String>> clusterNodesMap() {

		Map<String, JedisPool> nodes = jc.getClusterNodes();
		Map<String, List<String>> clusterNodes = new HashMap<>();

		String nodesStr = "";
		for (String key : nodes.keySet()) {
			JedisPool jedisPool = nodes.get(key);
			Jedis jedis = jedisPool.getResource();
			nodesStr = jedis.clusterNodes();
			jedis.close();
			break;
		}

		String[] nodesArray = nodesStr.split("\n");
		List<RedisNode> redisNodes = new ArrayList<>();

		Map<String, String> temp = new HashMap<>();
		for (String node : nodesArray) {
			if (node.indexOf("fail") > 0) {
				continue;
			}
			RedisNode redisNode = new RedisNode();
			String[] detail = node.split(" ");
			if (node.contains("master")) {
				temp.put(detail[0], detail[1]);
				redisNode.setRole(0);
				redisNode.setPid("0");
			} else {
				redisNode.setRole(1);
				redisNode.setPid(detail[3]);
			}

			redisNode.setHostAndPort(detail[1]);
			redisNode.setId(detail[0]);
			redisNodes.add(redisNode);

		}

		for (RedisNode node : redisNodes) {
			if (node.getRole() == 0) {
				continue;
			}
			if (temp.containsKey(node.getPid())) {
				String key = temp.get(node.getPid());
				if (clusterNodes.containsKey(key)) {
                    List<String> slaves = clusterNodes.get(key);
                    List<String> slaves2 = new ArrayList<>();
                    slaves.add(node.getHostAndPort());
                    key = key.split("@")[0];
                    for (int i = 0;i<slaves.size();i++){
                        slaves2.add(slaves.get(i).split("@")[0]);
                    }
                    clusterNodes.put(key, slaves2);
				} else {
                    List<String> slaves = new ArrayList<>();
                    List<String> slaves2 = new ArrayList<>();
                    slaves.add(node.getHostAndPort());
                    key = key.split("@")[0];
                    for (int i = 0;i<slaves.size();i++){
                        slaves2.add(slaves.get(i).split("@")[0]);
                    }
                    clusterNodes.put(key, slaves2);
				}
			}
		}
		return clusterNodes;
	}

	/**
	 * 获取slowlogs信息
	 * 
	 * @return
	 */
	public Map<String, List<Slowlog>> slowlogs() {
		Map<String, List<Slowlog>> mapSlowlog = new HashMap<>();
		if (clusterEnabled()) {
			mapSlowlog = this.clusterSlowlogs();
		} else {
			mapSlowlog = this.standAloneSlowlogs();
		}
		return mapSlowlog;
	}

	/**
	 * 获取非集群 所有节点 slowlog 信息
	 * 
	 * @return
	 */
	public Map<String, List<Slowlog>> standAloneSlowlogs() {
		Map<String, List<Slowlog>> mapSlowlog = new HashMap<>();
		List<String> nodesList = this.standAloneRedisNodes();
		Jedis jedis = null;
		for(String node : nodesList) {
			try {
				String host = node.split(":")[0];
				String port = node.split(":")[1];
				jedis = new Jedis(host,Integer.parseInt(port));
				if (StringUtils.isNotBlank(password)) {
					jedis.auth(password);
				}
				List<Slowlog> slowlog = jedis.slowlogGet(128);
				mapSlowlog.put(node, slowlog);
			} catch (JedisConnectionException e) {
				e.printStackTrace();
			} finally {
				if (jedis != null) {
					jedis.close();
				}
			}
		}
		return mapSlowlog;
	}

	/**
	 * 获取cluster 所有节点 slowlog 信息
	 * 
	 * @return
	 */
	public Map<String, List<Slowlog>> clusterSlowlogs() {
		Map<String, JedisPool> nodesMap = this.clusterNodes();
		Map<String, List<Slowlog>> mapSlowlog = new HashMap<>();
		// 获取所有master 中的slowlog
		for (String node : nodesMap.keySet()) {
			JedisPool jedisPool = nodesMap.get(node);
			Jedis jedis = null;
			try {
				jedis = jedisPool.getResource();
				List<Slowlog> slowlog = jedis.slowlogGet(128);
				mapSlowlog.put(node, slowlog);
			} catch (JedisConnectionException e) {
				String host = node.split(":")[0];
				String port = node.split(":")[1];
				jedis = new Jedis(host, Integer.parseInt(port));
				if (StringUtils.isNotBlank(password)) {
					jedis.auth(password);
				}
				List<Slowlog> slowlog = jedis.slowlogGet();
				mapSlowlog.put(node, slowlog);
			} finally {
				if (jedis != null) {
					jedis.close();
				}
			}
		}

		// 获取slave 中的slowlog
		Map<String, List<String>> clusterNodes = clusterNodesMap();
		for (String marter : clusterNodes.keySet()) {
			List<String> slaves = clusterNodes.get(marter);
			for (String slave : slaves) {
				Jedis jedis = null;
				try {
					String host = slave.split(":")[0];
					String port = slave.split(":")[1];
					jedis = new Jedis(host, Integer.parseInt(port));
					if (StringUtils.isNotBlank(password)) {
						jedis.auth(password);
					}
					List<Slowlog> slowlog = jedis.slowlogGet(128);
					mapSlowlog.put(slave, slowlog);
				} catch (JedisConnectionException e) {
					e.printStackTrace();
				} finally {
					if (jedis != null) {
						jedis.close();
					}
				}
			}
		}
		return mapSlowlog;
	}

	/**
	 * 获取 redis节点信息 ip:port
	 * 
	 * @return
	 */
	public List<String> redisNodes() {
		List<String> allNodes = new ArrayList<>();
		if (clusterEnabled()) {
			allNodes = this.clusterRedisNodes();
		} else {
			allNodes = this.standAloneRedisNodes();
		}
		return allNodes;
	}

	public List<String> standAloneRedisNodes() {
		List<String> allNodes = new ArrayList<>();
		String res = jedis.info("Replication");
		String[] resArr = res.split("\n");
		// master or slave
		String role = resArr[1].split(":")[1];
		
		if("slave".equals(role.trim())){
			String masterHost = resArr[2].split(":")[1].trim();
			String masterPort = resArr[3].split(":")[1].trim();
			allNodes.add(masterHost+":"+masterPort);
			jedis = new Jedis(masterHost,Integer.parseInt(masterPort));
			if (StringUtils.isNotBlank(password)) {
				jedis.auth(password);
			}
			res= jedis.info("Replication");
			resArr = res.split("\n");
		}
		
		for(String str : resArr) {
			if(str.contains("ip") && str.contains("port")) {
				String[] hostAndportArr = str.split(":")[1].split(",");
				String host = hostAndportArr[0].substring(hostAndportArr[0].indexOf("=")+1);;
				String port = hostAndportArr[1].substring(hostAndportArr[1].indexOf("=")+1);
				
				if(!allNodes.contains(host+":"+port)) {
					allNodes.add(host+":"+port);
				}
				
				if(!allNodes.contains(host+":"+this.hostAndPort.getPort())) {
					allNodes.add(host+":"+this.hostAndPort.getPort());
				}
			}
		}
		return allNodes;
	}

	public List<String> clusterRedisNodes() {
		List<String> allNodes = new ArrayList<>();
		try {
			Map<String, JedisPool> nodesMap = clusterNodes();
			Map<String, List<String>> clusterNodes = clusterNodesMap();
			clusterNodes.forEach((k, v) -> {
				List<String> list = (List<String>) v;
				list.forEach(node -> {
					allNodes.add(node);
				});
			});
			nodesMap.forEach((k, v) -> {
				if (!allNodes.contains(k)) {
					allNodes.add(k);
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
		return allNodes;
	}

	/**
	 * 获取redis 所有节点 client 信息
	 * 
	 * @return
	 */
	public Map<String, String> clientList() {
		Map<String, String> mapClient = new HashMap<>();

		if (clusterEnabled()) {
			mapClient = clusterClientList();
		} else {
			mapClient = standAloneClientList();
		}

		return mapClient;
	}

	/**
	 * 获取非集群模式clientList
	 * 
	 * @return
	 */
	public Map<String, String> standAloneClientList() {
		Map<String, String> mapClient = new HashMap<>();
		List<String> nodesList = this.standAloneRedisNodes();
		Jedis jedis = null;
		for(String node : nodesList) {
			try {
				String host = node.split(":")[0];
				String port = node.split(":")[1];
				jedis = new Jedis(host,Integer.parseInt(port));
				if (StringUtils.isNotBlank(password)) {
					jedis.auth(password);
				}
				mapClient.put(node, jedis.clientList());
			} catch (JedisConnectionException e) {
				e.printStackTrace();
			} finally {
				if (jedis != null) {
					jedis.close();
				}
			}
		}
		return mapClient;
	}

	/**
	 * 获取集群模式clientList
	 * 
	 * @return
	 */
	public Map<String, String> clusterClientList() {
		Map<String, String> mapClient = new HashMap<>();
		Map<String, JedisPool> nodesMap = this.clusterNodes();
		for (String node : nodesMap.keySet()) {
			JedisPool jedisPool = nodesMap.get(node);
			try {
				Jedis jedis = jedisPool.getResource();
				mapClient.put(node, jedis.clientList());
			} catch (Exception e) {
				e.printStackTrace();
			} finally {
				if (jedis != null) {
					jedis.close();
				}
			}
		}

		return mapClient;
	}

	/**
	 * 计算key所在slot
	 * 
	 * @param key
	 * @return
	 */
	public static int getSlotByKey(String key) {
		return JedisClusterCRC16.getSlot(key);
	}

	class RedisNode {
		private String id;
		private String pid;
		private String hostAndPort;
		// 0:master 1:slave
		private int role;

		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public String getPid() {
			return pid;
		}

		public void setPid(String pid) {
			this.pid = pid;
		}

		public String getHostAndPort() {
			return hostAndPort;
		}

		public void setHostAndPort(String hostAndPort) {
			this.hostAndPort = hostAndPort;
		}

		public int getRole() {
			return role;
		}

		public void setRole(int role) {
			this.role = role;
		}
	}

	@Override
	public void close() {
		if (jc != null) {
			jc.close();
		}

		if (jedis != null) {
			jedis.close();
		}
	}

	public static void main(String[] args) throws Exception {

	}
}