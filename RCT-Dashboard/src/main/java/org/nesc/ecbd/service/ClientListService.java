package org.nesc.ecbd.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.StringUtils;
import org.nesc.ecbd.cache.AppCache;
import org.nesc.ecbd.config.InitConfig;
import org.nesc.ecbd.entity.RedisInfo;
import org.nesc.ecbd.utils.ElasticSearchUtil;
import org.nesc.ecbd.utils.RedisUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

@Service
public class ClientListService {
	private static final Logger LOG = LoggerFactory.getLogger(ClientListService.class);
	//private ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor();
	private ScheduledExecutorService service=  Executors.unconfigurableScheduledExecutorService(new ScheduledThreadPoolExecutor(1));
	@Autowired
	RedisInfoService redisInfoService;
	@Autowired
	InitConfig initConfig;

	public Map<String, String> getClientList(Long id) {
		RedisInfo redisInfo = redisInfoService.selectById(id);
		String redisHost = redisInfo.getAddress().split(":")[0];
		String port = redisInfo.getAddress().split(":")[1];
		Map<String, String> maps = new HashMap<>();
		RedisUtil redisUtil = null;
		try {
			if(StringUtils.isNotBlank(redisInfo.getPassword())) {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port),redisInfo.getPassword());
			}else {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
			}
			maps = redisUtil.clientList();
		} catch (NumberFormatException e) {
			LOG.error("client list has error.", e);
		} finally {
			if (redisUtil != null) {
				redisUtil.close();
			}
		}
		return maps;
	}

	public void gc() {
		if (!service.isShutdown()) {
			service.shutdown();
		}
			
	}

	public Boolean isRunning(String id) {
		return AppCache.taskList.containsKey(id);
	}

	public JSONObject canCeled(String id) {
		JSONObject json = new JSONObject();
		try {
			if (AppCache.taskList.containsKey(id)) {
				Map<ScheduledFuture<?>, String> tasks = AppCache.taskList.get(String.valueOf(id));
				tasks.forEach((k,v)->{
					ScheduledFuture<?> task = k;
					task.cancel(true);
					if (task.isCancelled()) {
						json.put("status", "CANCELED");
					}
				});
				AppCache.taskList.remove(String.valueOf(id));
				
			}
		} catch (Exception e) {
			// TODO: handle exception
			json.put("status", "FAILD");
		}

		return json;
	}

	public JSONObject executeJob(String internal, String timer,String timerUtil, Long id) {
		JSONObject json = new JSONObject();
		long endTimer = System.currentTimeMillis()+(Long.parseLong(timer)*Long.parseLong(timerUtil))*1000;
		Runnable runnable = new Runnable() {
			@Override
			public void run() {
				json.put("msg", "job is Running");
				if(System.currentTimeMillis()>= endTimer) {
					AppCache.taskList.get(String.valueOf(id)).forEach((k,v)->{
						ScheduledFuture<?> future = k;
						json.put("msg", "job  over");
						json.put("status", "DONE");
						future.cancel(true);
						AppCache.taskList.remove(String.valueOf(id));
					});
				}else {
					List<Map<String,Object>> maps = clientSearch(String.valueOf(id), "");
					Set<JSONObject> documents = new HashSet<>();
					maps.forEach(res->{
						Map<String,Object> result = (Map<String,Object>)res;
						result.put("TimeStamp", System.currentTimeMillis()); 
						result.put("id", result.get("age")+String.valueOf(id)); 
						JSONObject jsons = JSONObject.parseObject(JSON.toJSONString(result));
						documents.add(jsons);
					});
						SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
						String index = initConfig.getClientIndex() + "-" + sdf.format(new Date());
						try {
							if (documents.size() <= 0) {
								return;
							}
							if(initConfig.isElasticsearchEnable()) {
								ElasticSearchUtil.bulkIndexDocumentByID(index, "rct-clientlist", documents);
							}	
							
						} catch (Exception e) {
							// LOG.error("slowlogToES error .", e);
						}
						
					}
				}
				
		};
		if (service.isShutdown()) {
			service = Executors.unconfigurableScheduledExecutorService(new ScheduledThreadPoolExecutor(1));
		}
		ScheduledFuture<?> task = service.scheduleAtFixedRate(runnable, 0, Long.parseLong(internal), TimeUnit.SECONDS);
		Map<ScheduledFuture<?>,String> map = new HashMap<>();
		JSONObject obj = new JSONObject();
		obj.put("internal", internal);
		obj.put("timer", timer);
		obj.put("timerUtil", timerUtil);
		map.put(task,obj.toJSONString() );
		AppCache.taskList.put(String.valueOf(id), map);
		return json;
	}

	public List<Map.Entry<String, Integer>> statistics(Long id, int group) {
		Map<String, String> clientList = getClientList(id);		
		Map<String, Integer> tm = new TreeMap<String, Integer>();		 
	    clientList.forEach((host,string)->{	    	
	    	String[] str = string.split("\n");	    	
	    	switch(group) {
	    	   case 0:tm.put(host, str.length);break;
	    	   case 1:
	    		   for(String msg:str) {
	    			String[] res = msg.split(" ");
	   	    		String ip = res[1].split("=")[1].split(":")[0];	 
	   	    		if(tm.containsKey(ip)) {
	   	    			int count = tm.get(ip);
	   	    			tm.remove(ip);
	   	    			tm.put(ip, count+1);
	   	    		}else {
	   	    			tm.put(ip, 1);
	   	    		}
	    		   }
	    		  break;
	    	}	    	
	    });	   
		List<Map.Entry<String, Integer>> list = new ArrayList<Map.Entry<String, Integer>>(tm.entrySet());
		Collections.sort(list, new Comparator<Map.Entry<String, Integer>>() {

			@Override
			public int compare(Entry<String, Integer> o1, Entry<String, Integer> o2) {
				int res = o1.getValue() - o2.getValue();
				if (res > 0) {
					return -1;
				}else if (res < 0) {
					return 1;
				}					
				return 0;
			}
		});
		return list;
	}
	
	public List<Map<String, Object>> clientSearch(String id,String hosts) {
		List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
		Map<String, String> clientList = getClientList(Long.valueOf(id));
		clientList.forEach((host,msg)->{
			String[] str = null;
			if((null != hosts) && (!"".equals(hosts))) {
				if(host.equalsIgnoreCase(hosts)) {
					str = msg.split("\n");					
				}else {
					return;
				}
			}else {
				str = msg.split("\n");
			}
			for (String mesg : str) {
				String[] res = mesg.split(" ");
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("host", host);
				map.put("conIp", res[1].split("=")[1]);
				map.put("age", Integer.parseInt(res[4].split("=")[1]) / 60);
				map.put("idle", Integer.parseInt(res[5].split("=")[1]) / 60);
				map.put("command", res[res.length - 1].split("=")[1]);
				result.add(map);
			}
			
		});
		return result;
	}
}