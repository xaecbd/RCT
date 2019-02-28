package org.nesc.ecbd.service;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.nesc.ecbd.cache.AppCache;
import org.nesc.ecbd.config.InitConfig;
import org.nesc.ecbd.entity.AnalyzeInstance;
import org.nesc.ecbd.entity.AnalyzeStatus;
import org.nesc.ecbd.entity.RDBAnalyze;
import org.nesc.ecbd.entity.ScheduleDetail;
import org.nesc.ecbd.entity.ScheduleInfo;
import org.nesc.ecbd.mapper.RDBAnalyzeMapper;
import org.nesc.ecbd.thread.AnalyzerStatusThread;
import org.nesc.ecbd.util.EurekaUtil;
import org.nesc.ecbd.utils.RedisInfoTool;
import org.nesc.ecbd.utils.RedisUtil;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import redis.clients.jedis.Jedis;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年10月11日 下午1:34:01
 * @version:1.0
 * @description:RDB文件分析service
 */
@Service
public class RDBAnalyzeService {
	private static final Logger LOG = LoggerFactory.getLogger(RDBAnalyzeService.class);
	@Autowired
	InitConfig config;

	@Autowired
	RDBAnalyzeMapper rdbAnalyzeMapper;

	@Autowired
	RDBAnalyzeService rdbAnalyzeService;

	@Autowired
	RestTemplate restTemplate;

	@Autowired
	RDBAnalyzeResultService rdbAnalyzeResultService;

	@Autowired
	ScheduleTaskService taskService;

	/**
	 * 执行RDB分析任务
	 * 
	 * @param id
	 * @return { status：true/false, message:"...." }
	 */
	public JSONObject allocationRDBAnalyzeJob(Long id, int[] analyzer) {
		JSONObject responseResult = new JSONObject();

		// 校验是否有任务在运行。
		boolean flag = ifRDBAnalyzeIsRunning(id);
		if (flag) {
			responseResult.put("status", Boolean.FALSE);
			responseResult.put("message", "There is a task in progress!");
			return responseResult;
		}
		JSONArray tempArray = new JSONArray();

		RDBAnalyze rdbAnalyze = rdbAnalyzeService.selectById(id);
		Long pid = rdbAnalyzeService.selectPidById(id);
		rdbAnalyze.setPid(pid);
		String redisHost = rdbAnalyze.getRedisInfo().getAddress().split(":")[0];
		String port = rdbAnalyze.getRedisInfo().getAddress().split(":")[1];

		RedisUtil redisUtil = null;
		Map<String, String> clusterNodesIP = new HashMap<>();
		Map<String, Set<String>> generateRule = new HashMap<>();
		try {

			if (config.isDevEnable()) {
				clusterNodesIP.put(InetAddress.getLocalHost().getHostAddress(), config.getDevRDBPort());
				Set<String> set = new HashSet<>();
				set.add(config.getDevRDBPort());
				generateRule.put(InetAddress.getLocalHost().getHostAddress(), set);
			} else {
				if (StringUtils.isNotBlank(rdbAnalyze.getRedisInfo().getPassword())) {
					redisUtil = new RedisUtil(redisHost, Integer.parseInt(port),
							rdbAnalyze.getRedisInfo().getPassword());
				} else {
					redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
				}
				clusterNodesIP = redisUtil.nodesIP();
				generateRule = RedisInfoTool.generateAnalyzeRule(redisUtil.nodesMap());
			}

		} catch (Exception e1) {
			responseResult.put("status", Boolean.FALSE);
			responseResult.put("message", e1.getMessage());
			return responseResult;
		} finally {
			if (null != redisUtil) {
				redisUtil.close();
			}
		}

		long scheduleID = System.currentTimeMillis();

		List<AnalyzeInstance> analyzeInstances = EurekaUtil.getRegisterNodes();

		Map<String, AnalyzeInstance> analyzeInstancesMap = new HashMap<>(analyzeInstances.size());
		// 本次场景只会一个host一个AnalyzeInstance
		for (AnalyzeInstance instance : analyzeInstances) {
			analyzeInstancesMap.put(instance.getHost(), instance);
		}

		List<AnalyzeInstance> needAnalyzeInstances = new ArrayList<>();

		// 如果存在某个节点不存活，则拒绝执行本次任务
		for (String host : clusterNodesIP.keySet()) {
			AnalyzeInstance analyzeInstance = analyzeInstancesMap.get(host);
			if (analyzeInstance == null) {
				LOG.error("analyzeInstance inactive. ip:{}", host);
				responseResult.put("status", false);
				responseResult.put("message", host + " analyzeInstance inactive!");
				return responseResult;
			}
			needAnalyzeInstances.add(analyzeInstance);
		}

		for (String host : clusterNodesIP.keySet()) {

			// 处理无RDB备份策略情况
			if ((!config.isDevEnable()) && config.isRdbGenerateEnable()) {
				Set<String> ports = generateRule.get(host);
				ports.forEach(p -> {
					Jedis jedis = null;
					try {
						jedis = new Jedis(host, Integer.parseInt(p));
						if (StringUtils.isNotBlank(rdbAnalyze.getRedisInfo().getPassword())) {
							jedis.auth(rdbAnalyze.getRedisInfo().getPassword());
						}
						List<String> configs = jedis.configGet("save");
						// 如果没有配置RDB持久化策略，那么使用命令生成RDB文件
						if (configs != null && configs.size() == 2) {
							// 处理save为空场景
							if (StringUtils.isBlank(configs.get(1))) {
								rdbBgsave(jedis,host,p);
							}
						} else if (configs == null || configs.size() == 0) {
							rdbBgsave(jedis,host,p);
						}
					} catch (Exception e) {
						LOG.error("rdb generate error.", e);
					} finally {
						if (jedis != null) {
							jedis.close();
						}
					}
				});
			}

			AnalyzeInstance analyzeInstance = analyzeInstancesMap.get(host);

			String url = "http://" + host + ":" + analyzeInstance.getPort() + "/receivedSchedule";

			// String url = "http://127.0.0.1:8082/receivedSchedule";
			ScheduleInfo scheduleInfo = new ScheduleInfo(scheduleID, rdbAnalyze.getDataPath(), rdbAnalyze.getPrefixes(),
					generateRule.get(host), analyzer);
			HttpHeaders headers = new HttpHeaders();
			headers.add("Content-Type", "application/json");
			HttpEntity<ScheduleInfo> httpEntity = new HttpEntity<ScheduleInfo>(scheduleInfo, headers);
			JSONObject scheduleResult = new JSONObject();
			scheduleResult.put("host", host);
			scheduleResult.put("ports", generateRule.get(host));
			scheduleResult.put("scheduleID", scheduleID);
			scheduleResult.put("analyzerTypes", analyzer);
			scheduleResult.put("port", analyzeInstance.getPort());
			try {
				ResponseEntity<String> executeResult = restTemplate.postForEntity(url, httpEntity, String.class);
				JSONObject responseMessage = JSONObject.parseObject(executeResult.getBody());

				if (!responseMessage.getBooleanValue("checked")) {
					LOG.error("allocation {} scheduleJob response error. responseMessage:{}",
							analyzeInstance.toString(), responseMessage.toJSONString());
					scheduleResult.put("status", false);
					responseResult.put("message", "allocation " + analyzeInstance.getHost()
							+ " scheduleJob response error:" + responseMessage.toJSONString());
					return responseResult;
				} else {
					scheduleResult.put("status", true);
				}

			} catch (RestClientException e) {
				LOG.error("allocation {} scheduleJob fail. ", analyzeInstance.toString(), e);
				return responseResult;
			}

			tempArray.add(scheduleResult);
		}
		AppCache.scheduleProcess.put(id, scheduleID);

		List<ScheduleDetail> scheduleDetails = new ArrayList<>();
		for (int i = 0; i < tempArray.size(); i++) {
			JSONObject json = tempArray.getJSONObject(i);
			String host = json.getString("host");
			boolean scheduleStatus = json.getBooleanValue("status");
			@SuppressWarnings("unchecked")
			Set<String> ports = (Set<String>) json.get("ports");
			for (String instancePort : ports) {
				String instance = host + ":" + instancePort;
				ScheduleDetail scheduleDetail = new ScheduleDetail(scheduleID, instance, scheduleStatus,
						AnalyzeStatus.CHECKING);
				scheduleDetails.add(scheduleDetail);
			}
		}
		AppCache.scheduleDetailMap.put(id, scheduleDetails);

		// 启动状态监听线程，检查各个分析器分析状态和进程，分析完毕后，写数据库，发送邮件
		Thread analyzerStatusThread = new Thread(new AnalyzerStatusThread(needAnalyzeInstances, restTemplate,
				rdbAnalyze, config.getEmail(), rdbAnalyzeResultService));
		analyzerStatusThread.start();
		if (!config.isDevEnable()) {
			for (Entry<String, Set<String>> map : generateRule.entrySet()) {
				String ip = map.getKey();
				for (String ports : map.getValue()) {
					Jedis jedis = null;
					try {
						jedis = new Jedis(ip, Integer.parseInt(ports));
						AppCache.keyCountMap.put(ip + ":" + ports, Float.parseFloat(String.valueOf(jedis.dbSize())));
					} catch (Exception e) {
						LOG.error("jedis get db size has error!", e);
					} finally {
						if (jedis != null) {
							jedis.close();
						}
					}
				}
			}
		}

		responseResult.put("status", true);
		return responseResult;
	}

	public JSONObject canceRDBAnalyze(String instance) {
		JSONObject result = new JSONObject();
		if (null == instance || "".equals(instance)) {
			LOG.warn("instance is null!");
			result.put("canceled", false);
			return result;
		}
		RDBAnalyze rdbAnalyze = getRDBAnalyzeByPid(Long.valueOf(instance));
		String[] hostAndPort = rdbAnalyze.getRedisInfo().getAddress().split(":");
		List<AnalyzeInstance> analyzeInstances = EurekaUtil.getRegisterNodes();
		AnalyzeInstance analyzeInstance = null;
		for (AnalyzeInstance analyze : analyzeInstances) {
			if (hostAndPort[0].equals(analyze.getHost())) {
				analyzeInstance = analyze;
				break;
			}
		}
		if (null == analyzeInstance) {
			LOG.warn("analyzeInstance is null!");
			result.put("canceled", false);
			return result;
		}
		// String url = "http://127.0.0.1:8082/cancel";
		String url = "http://" + analyzeInstance.getHost() + ":" + analyzeInstance.getPort() + "/cancel";
		try {
			ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
			result = JSONObject.parseObject(responseEntity.getBody());
			if (null == result) {
				LOG.warn("URL :" + url + " no response");
				result = new JSONObject();
				result.put("canceled", false);
				return result;
			}
		} catch (Exception e) {
			LOG.error("canceledInstance is failed!", e);
			result = new JSONObject();
			result.put("canceled", false);
			return result;
		}
		return result;
	}

	public boolean update(RDBAnalyze rdbAnalyze) {
		int result = rdbAnalyzeMapper.updateRdbAnalyze(rdbAnalyze);
		return checkResult(result);
	}

	public RDBAnalyze selectById(Long id) {
		RDBAnalyze rdbAnalyze = rdbAnalyzeMapper.getRDBAnalyzeById(id);
		return rdbAnalyze;
	}

	public boolean add(RDBAnalyze rdbAnalyze) {
		rdbAnalyze.setRedisInfo(null);
		int result = rdbAnalyzeMapper.insert(rdbAnalyze);
		return checkResult(result);
	}

	public List<RDBAnalyze> list() {
		List<RDBAnalyze> results = rdbAnalyzeMapper.queryList();
		return results;
	}

	public boolean checkResult(Integer result) {
		if (result > 0) {
			return true;
		} else {
			return false;
		}
	}

	public RDBAnalyze getRDBAnalyzeByPid(Long pid) {
		RDBAnalyze rdbAnalyze = rdbAnalyzeMapper.getRDBAnalyzeByPid(pid);
		return rdbAnalyze;
	}

	public RDBAnalyze getRDBAnalyzeById(Long pid) {
		RDBAnalyze rdbAnalyze = rdbAnalyzeMapper.getRDBAnalyzeById(pid);
		return rdbAnalyze;
	}

	/**
	 *
	 * @param  rdbAnalyzeID
	 * @return boolean true: has task running false: no task running
	 */
	public boolean ifRDBAnalyzeIsRunning(Long id) {
		// Long id = getRedisIDBasePID(pid);
		List<ScheduleDetail> scheduleDetail = AppCache.scheduleDetailMap.get(id);
		// default no task running
		boolean result = false;
		if (scheduleDetail != null && scheduleDetail.size() > 0) {
			for (ScheduleDetail scheduleDetails : scheduleDetail) {
				AnalyzeStatus stautStatus = scheduleDetails.getStatus();
				if ((!stautStatus.equals(AnalyzeStatus.DONE)) && (!stautStatus.equals(AnalyzeStatus.CANCELED))
						&& (!stautStatus.equals(AnalyzeStatus.ERROR))) {
					result = true;
					break;
				}
			}
		}
		return result;
	}

	/**
	 * get Redis Id Base
	 * 
	 * @param pid table:rdb_analyze,
	 * @return rdb_analyze.id
	 */
	public Long getRedisIDBasePID(Long pid) {
		if (null == pid) {
			return null;
		}
		return rdbAnalyzeMapper.getRDBAnalyzeIdByPid(pid);
	}

	public boolean updateRdbAnalyze(RDBAnalyze rdbAnalyze) {
		return checkResult(rdbAnalyzeMapper.updateRdbAnalyze(rdbAnalyze));
	}

	public void updateJob(RDBAnalyze rdbAnalyze) {
		try {
			taskService.addTask(rdbAnalyze, RDBScheduleJob.class);
		} catch (SchedulerException e) {
			LOG.warn("schedule job update faild!message:{}", e.getMessage());
		}
	}
	
	public void rdbBgsave(Jedis jedis,String host,String port) {
		Long currentTime = System.currentTimeMillis();
		Long oldLastsave = jedis.lastsave();
		LOG.info("RCT start to generate redis rdb file.{}:{}", host, port);
		jedis.bgsave();
		boolean isCheck = true;
		while(isCheck) {
			try {
				//等待5s，查看rdb文件是否生成完毕！
				Thread.sleep(5000);
			} catch (Exception e) {
				e.printStackTrace();
			}
			Long lastsave = jedis.lastsave();
			if(!lastsave.equals(oldLastsave)) {
				isCheck = false;
			}
		}
		LOG.info("RCT generate redis rdb file success. cost time:{} ms", (System.currentTimeMillis()-currentTime));
	}

	/**
	 * 根据id查询pid
	 * 
	 * @param id
	 * @return
	 */
	public Long selectPidById(Long id) {
		if (null == id) {
			return null;
		}
		return rdbAnalyzeMapper.selectPidById(id);
	}
}
