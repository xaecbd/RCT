package org.nesc.ecbd.service;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.nesc.ecbd.entity.RedisInfo;
import org.nesc.ecbd.mapper.RedisInfoMapper;
import org.nesc.ecbd.utils.RedisUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 
 * @author Jacob Cao
 *
 *         2019年1月17日
 */
@Service
public class RedisInfoService {

	private static final Logger LOG = LoggerFactory.getLogger(RedisInfoService.class);

	@Autowired
	RedisInfoMapper redisInfoMapper;

	public List<RedisInfo> getTotalData() {
		return redisInfoMapper.selectList(null);
	}

	public RedisInfo selectById(Long id) {
		return redisInfoMapper.selectById(id);
	}

	public boolean delete(Long id) {
		int result = redisInfoMapper.deleteById(id);
		return checkResult(result);
	}

	public boolean update(RedisInfo redisInfo) throws Exception {
		RedisUtil redisUtil = null;
		try {
			String redisHost = redisInfo.getAddress().split(":")[0];
			String port = redisInfo.getAddress().split(":")[1];
			if(StringUtils.isNotBlank(redisInfo.getPassword())) {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port),redisInfo.getPassword());
			}else {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
			}
			boolean res = redisUtil.clusterEnabled();
			if (res) {
				redisInfo.setMode(1);
			} else {
				redisInfo.setMode(0);
			}
		} catch (Exception e) {
			LOG.error("redis error.", e);
			throw new Exception(e.getMessage()!=null?e.getMessage():"redis connect error.");
		} finally {
			if (redisUtil != null) {
				redisUtil.close();
			}
		}
		int result = redisInfoMapper.updateById(redisInfo);
		return checkResult(result);
	}

	public boolean add(RedisInfo redisInfo) throws Exception {
		RedisUtil redisUtil = null;
		try {
			String redisHost = redisInfo.getAddress().split(":")[0];
			String port = redisInfo.getAddress().split(":")[1];
			if(StringUtils.isNotBlank(redisInfo.getPassword())) {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port),redisInfo.getPassword());
			}else {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
			}
			
			boolean res = redisUtil.clusterEnabled();
			if (res) {
				redisInfo.setMode(1);
			} else {
				redisInfo.setMode(0);
			}
		} catch (Exception e) {
			LOG.error("redis error.", e);
			throw new Exception(e.getMessage()!=null?e.getMessage():"redis connect error.");
		} finally {
			if (redisUtil != null) {
				redisUtil.close();
			}
		}
		int result = redisInfoMapper.insert(redisInfo);
		return checkResult(result);
	}

	public List<String> getRedisNodes(Long id) {
		List<String> allNodes = new ArrayList<>();
		RedisUtil redisUtil = null;
		try {
			RedisInfo redisInfo = this.selectById(id);
			String redisHost = redisInfo.getAddress().split(":")[0];
			String port = redisInfo.getAddress().split(":")[1];
			if(StringUtils.isNotBlank(redisInfo.getPassword())) {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port),redisInfo.getPassword());
			}else {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
			}
			allNodes = redisUtil.redisNodes();
		} catch (Exception e) {
			LOG.error("get redis all node has error.", e);
		} finally {
			if (redisUtil != null) {
				redisUtil.close();
			}
		}

		return allNodes;
	}

	public boolean checkResult(int result) {
		if (result > 0) {
			return true;
		} else {
			return false;
		}
	}

}
