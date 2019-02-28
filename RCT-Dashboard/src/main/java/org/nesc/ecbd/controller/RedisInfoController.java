package org.nesc.ecbd.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import org.nesc.ecbd.common.BaseController;
import org.nesc.ecbd.common.RestResponse;
import org.nesc.ecbd.entity.RedisInfo;
import org.nesc.ecbd.service.RedisInfoService;

/**
 * 
 * @author Jacob Cao
 * 
 *         2019年1月17日
 */
@RestController
@RequestMapping("/redis")
public class RedisInfoController extends BaseController {
	@Autowired
	RedisInfoService redisInfoService;

	// query all
	@RequestMapping(value = { "", "/" }, method = RequestMethod.GET)
	@ResponseBody
	public RestResponse listRedisInfo() {
		List<RedisInfo> redisList = redisInfoService.getTotalData();
		return SUCCESS(null,redisList);
	}

	// query one
	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	@ResponseBody
	public RestResponse queryRedisInfo(@PathVariable("id") Long id) {
		RedisInfo redisInfo = redisInfoService.selectById(id);
		return SUCCESS_DATA(redisInfo);
	}

	// delete
	@RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
	@ResponseBody
	public RestResponse deleteRedisInfo(@PathVariable("id") Long id) {
		if (redisInfoService.delete(id)) {
			return SUCCESS("delete success!");
		} else {
			return ERROR("delete fail!");
		}
	}

	// update
	@RequestMapping(value = { "", "/" }, method = RequestMethod.PUT)
	@ResponseBody
	public RestResponse updateRedisInfo(@RequestBody RedisInfo redisInfo) {

		try {
			if (redisInfoService.update(redisInfo)) {
				return SUCCESS("update success!");
			} else {
				return SUCCESS("update fail!");
			}
		} catch (Exception e) {
			return ERROR(e.getMessage());
		}
	}

	// add
	@RequestMapping(value = { "", "/" }, method = RequestMethod.POST)
	@ResponseBody
	public RestResponse addRedisInfo(@RequestBody RedisInfo redisInfo) {
		redisInfo.setCreateDate(new Date());

		try {
			if (redisInfoService.add(redisInfo)) {
				return SUCCESS("add success!");
			} else {
				return SUCCESS("add fail!");
			}
		} catch (Exception e) {
			return ERROR(e.getMessage());
		}
	}

	@RequestMapping(value = "query_nodes/{id}", method = RequestMethod.GET)
	@ResponseBody
	public RestResponse getRedisNodes(@PathVariable String id) {
		List<Map<String, Object>> selectResult = new ArrayList<Map<String, Object>>();
		List<String> nodes = redisInfoService.getRedisNodes(Long.valueOf(id));
		Map<String, Object> mapes = new HashMap<String, Object>();
		mapes.put("value", "ALL");
		mapes.put("label", "ALL");
		selectResult.add(mapes);
		nodes.forEach(node -> {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("value", node);
			map.put("label", node);
			selectResult.add(map);
		});
		return SUCCESS_DATA(selectResult);
	}
}
