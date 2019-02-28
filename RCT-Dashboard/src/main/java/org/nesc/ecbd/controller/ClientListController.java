package org.nesc.ecbd.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ScheduledFuture;

import org.nesc.ecbd.cache.AppCache;
import org.nesc.ecbd.common.BaseController;
import org.nesc.ecbd.common.RestResponse;
import org.nesc.ecbd.service.ClientListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;

/**
 * @author：Truman.P.Du
 * @createDate: 2019年1月18日 上午10:50:06
 * @version:1.0
 * @description:
 */
@RestController
@RequestMapping("/client_list")
public class ClientListController extends BaseController{
	@Autowired
	ClientListService clientListService;

	@RequestMapping(value = { "monitor/excute" }, method = RequestMethod.POST)
	public RestResponse excuteJob(@RequestBody String internal) {
		JSONObject json = JSONObject.parseObject(internal);
		String interval = json.getString("Interval");
		String timer = json.getString("timer");
		String timerUtil = json.getString("timerUtil");
		Long id = json.getLong("id");
		if (AppCache.taskList.containsKey(String.valueOf(id))) {
			json.put("status", "ISRUNNING");
		} else {
			json = clientListService.executeJob(interval, timer,timerUtil, id);
		}
		return SUCCESS_DATA(json);
	}
	
	@RequestMapping(value = { "monitor/check_job" }, method = RequestMethod.POST)
	public RestResponse checkJob(@RequestParam String id) {
		JSONObject json = new JSONObject();
		if (AppCache.taskList.containsKey(String.valueOf(id))) {
			json.put("status", "ISRUNNING");
			Map<ScheduledFuture<?>,String> map = AppCache.taskList.get(String.valueOf(id));
			map.forEach((k,v)->{
				JSONObject res = JSONObject.parseObject((String)v);
				json.put("data", res);
			});
			
		} 
		return SUCCESS_DATA(json);
	}

	@RequestMapping(value = { "monitor/cancel" }, method = RequestMethod.POST)
	@ResponseBody
	public RestResponse cancalJob(@RequestBody String internal) {
		JSONObject res = new JSONObject();
		JSONObject json = JSONObject.parseObject(internal);
		Long id = json.getLong("id");
		if (clientListService.isRunning(String.valueOf(id))) {
			res = clientListService.canCeled(String.valueOf(id));
		} else {
			res.put("status", "NOTRUNNING");
		}
		return SUCCESS_DATA(res);
	}

	@RequestMapping(value = { "statistics" }, method = RequestMethod.POST)
	@ResponseBody
	public RestResponse statistics(@RequestBody String internal) {
		
		JSONObject json = JSONObject.parseObject(internal);
		Long id = json.getLong("id");

		int groupBy = json.getIntValue("groupBy");
		List<Entry<String, Integer>> maps = clientListService.statistics(id, groupBy);
		List<JSONObject> res = new ArrayList<>(maps.size());
		for (int i = 0; i < maps.size(); i++) {
			JSONObject obj = new JSONObject();
			obj.put("ip", maps.get(i).getKey());
			obj.put("count", maps.get(i).getValue());
			res.add(obj);
		}
		return SUCCESS_DATA(res);
	}

	@RequestMapping(value = "search")
	@ResponseBody
	public RestResponse clientSearch(@RequestParam String id,@RequestParam(required = false) String host) {
		List<Map<String, Object>> result = clientListService.clientSearch(id,host);
		return SUCCESS_DATA(result);
	}
}
