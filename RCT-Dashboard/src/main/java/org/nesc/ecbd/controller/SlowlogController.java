package org.nesc.ecbd.controller;

import java.util.List;
import java.util.Map;

import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import org.nesc.ecbd.common.BaseController;
import org.nesc.ecbd.common.RestResponse;
import org.nesc.ecbd.entity.SlowlogEntity;
import org.nesc.ecbd.service.RedisInfoService;
import org.nesc.ecbd.service.ScheduleTaskService;
import org.nesc.ecbd.service.SlowlogScheduleJob;
import org.nesc.ecbd.service.SlowlogService;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年3月24日 下午2:55:26
 * @version:1.0
 * @description:
 */
@RestController
@RequestMapping("/slowlog")
public class SlowlogController extends BaseController {
	private static final Logger LOG = LoggerFactory.getLogger(SlowlogController.class);
	@Autowired
	SlowlogService slowlogService;

	@Autowired
	RedisInfoService redisInfoService;

	@Autowired
	ScheduleTaskService taskService;

	@RequestMapping(value = { "", "/" }, method = RequestMethod.POST)
	@ResponseBody
	public RestResponse addSlowlog(@RequestBody SlowlogEntity slowlogEntity) {

		if (slowlogService.insert(slowlogEntity)) {
			JSONObject data = new JSONObject();
			data.put("id", slowlogEntity.getId());
			if (slowlogEntity.getAutoAnalyze()) {
				try {
					taskService.addTask(slowlogEntity, SlowlogScheduleJob.class);
				} catch (SchedulerException e) {
					LOG.error("schedule job add faild!message:{}", e.getMessage());
				}
			}

			return SUCCESS("add success!", data);

		} else {
			return ERROR("add faild!");
		}
	}

	/**
	 * 停止slowlog定时分析任务
	 * @param slowlogEntity
	 * @return
	 */
	@RequestMapping(value = { "", "/" }, method = RequestMethod.PUT)
	@ResponseBody
	public RestResponse UpdateSlowlog(@RequestBody SlowlogEntity slowlogEntity) {

		if (slowlogService.update(slowlogEntity)) {
			try {
				taskService.delTask("slow" + String.valueOf(slowlogEntity.getId()));
				if(slowlogEntity.getAutoAnalyze()) {
					taskService.addTask(slowlogEntity, SlowlogScheduleJob.class);
				}
			} catch (SchedulerException e) {
				LOG.error("schedule job delete faild!message:{}", e.getMessage());
			}
			return SUCCESS("update success!");
		} else {
			return ERROR("update faild!");
		}
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
	public RestResponse deleteClusterInfo(@PathVariable("id") Long id) {
		boolean delete = slowlogService.delete(id);
		if (delete) {
			try {
				taskService.delTask("slow" + String.valueOf(id));
			} catch (SchedulerException e) {
				LOG.error("schedule job delete faild!message:{}", e.getMessage());
			}
			return SUCCESS("delete success!");
		} else {
			return ERROR("delete faild!");
		}

	}

	@RequestMapping(value = "statistics/{pid}", method = RequestMethod.GET)
	public RestResponse slowlogAnalyze(@PathVariable("pid") Long pid) {
		return SUCCESS_DATA(slowlogService.slowlogStatistic(pid));
	}


	@RequestMapping(value = "monitor/status/{id}", method = RequestMethod.GET)
	@ResponseBody
	public RestResponse getJobStatus(@PathVariable String id) throws SchedulerException {
		return SUCCESS_DATA(taskService.getJobStatus("slow" + id));
	}

	@RequestMapping(value = "slow_search")
	@ResponseBody
	public RestResponse searchAll(@RequestParam String id,@RequestParam(required = false) String host) {
		List<Map<String, Object>> results = slowlogService.slowlogSearch(id,host);
		return SUCCESS_DATA(results);
	}

	@RequestMapping(value = "pid/{pid}", method = RequestMethod.GET)
	@ResponseBody
	public RestResponse searchSlowlogJob(@PathVariable("pid") Long pid) {
		SlowlogEntity results = slowlogService.searchSlowlogJob(pid);
		return SUCCESS_DATA(results);
	}
}
