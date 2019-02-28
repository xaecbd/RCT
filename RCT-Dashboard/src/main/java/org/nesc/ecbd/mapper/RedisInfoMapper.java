package org.nesc.ecbd.mapper;

import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.nesc.ecbd.common.SuperMapper;
import org.nesc.ecbd.entity.RedisInfo;

/**
 * 
 * @author Jacob Cao
 * 
 *         2019年1月17日
 */
public interface RedisInfoMapper extends SuperMapper<RedisInfo> {
	@Select("select * from redis_info where id = #{id}")
	@Results({ @Result(id = true, column = "id", property = "id"), @Result(column = "name", property = "name"),
			@Result(column = "address", property = "address"), @Result(column = "password", property = "password"),
			@Result(column = "mode", property = "mode"), @Result(column = "create_date", property = "createDate") })
	public RedisInfo queryById(Long id);
}
