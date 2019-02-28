package org.nesc.ecbd.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.nesc.ecbd.cache.AppCache;
import org.nesc.ecbd.common.BaseController;
import org.nesc.ecbd.common.RestResponse;
import org.nesc.ecbd.config.InitConfig;
import org.nesc.ecbd.config.InitConfig.User;
import org.nesc.ecbd.entity.AnalyzerConstant;
import org.nesc.ecbd.service.RDBAnalyzeService;
import org.nesc.ecbd.service.ScheduleTaskService;
import org.nesc.ecbd.util.EurekaUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年3月22日 上午9:57:31
 * @version:1.0
 * @description:
 */
@RestController
@RequestMapping("/")
public class IndexController extends BaseController {
	@Autowired
	RDBAnalyzeService rdbAnalyzeService;

	@Autowired
	InitConfig initConfig;
	
	@Autowired
	ScheduleTaskService taskService;

	/**
	 * 测试corn表达式
	 * 
	 * @param body
	 * @return
	 */
	@RequestMapping(value = "test_corn", method = RequestMethod.POST)
	@ResponseBody
	public RestResponse testCorn(@RequestBody Map<String, String> body) {
		String schedule = body.get("schedule");
		List<String> list = taskService.getRecentTriggerTime(schedule);
		return SUCCESS_DATA(list);
	}

	/**
	 * 手动增加rdbAnalyzeID 与scheduleID 映射关系
	 * 
	 * @return
	 */
	@RequestMapping(value = "addScheduleProcess", method = RequestMethod.POST)
	@ResponseBody
	public RestResponse addScheduleProcess(@RequestBody JSONObject body) {
		String rdbAnalyzeID = body.getString("rdbAnalyzeID");
		String scheduleID = body.getString("scheduleID");
		AppCache.scheduleProcess.put(Long.valueOf(rdbAnalyzeID), Long.valueOf(scheduleID));
		return SUCCESS();
	}

	/**
	 * 获取注册节点信息
	 * 
	 * @return
	 */
	@RequestMapping("cacheAnalyzes")
	@ResponseBody
	public RestResponse cacheAnalyzeInstances() {
		return SUCCESS_DATA(EurekaUtil.getRegisterNodes());
	}

	@RequestMapping("analyzer/{id}")
	public RestResponse getAnalyzer(@PathVariable String id) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("label", "Report");
		map.put("value", AnalyzerConstant.DEFAULT_ANALYZER);
		// map.put("disabled", true);
		Map<String, Object> maps = new HashMap<String, Object>();
		maps.put("label", "ExportKeyByFilter");
		maps.put("value", AnalyzerConstant.EXPORT_KEY_BY_FILTER_ANALYZER);
		/*
		 * if(id.equals("5")){ maps.put("disabled", true); }
		 */

		Map<String, Object> mapes = new HashMap<String, Object>();
		mapes.put("label", "ExportKeyByPrefix");
		mapes.put("value", AnalyzerConstant.EXPORT_KEY_BY_PREFIX_ANALYZER);
		/*
		 * if(id.equals("6")){ mapes.put("disabled", true); }
		 */
		list.add(map);
		list.add(maps);
		list.add(mapes);
		return SUCCESS_DATA(list);

	}

	@RequestMapping(value = "login")
	@ResponseBody
	public RestResponse login(@RequestBody User user) {
		User configUser = initConfig.getUser();
		if (configUser.getUserName().equals(user.getUserName())
				&& configUser.getPassword().equals(user.getPassword())) {
			return SUCCESS();
		} else {
			return ERROR("acount or password is incorrect!");
		}
	}
}
