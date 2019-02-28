package org.nesc.ecbd.mapper;

import java.util.List;

import org.apache.ibatis.annotations.*;
import org.apache.ibatis.mapping.FetchType;
import org.nesc.ecbd.common.SuperMapper;
import org.nesc.ecbd.entity.RDBAnalyze;

/**
 * @author：Truman.P.Du
 * @createDate: 2019年1月18日 上午10:35:05
 * @version:1.0
 * @description:
 */
public interface RDBAnalyzeMapper extends SuperMapper<RDBAnalyze> {
	@Select("select * from rdb_analyze where id = #{id}")
	@Results({ @Result(id = true, column = "id", property = "id"),
			@Result(column = "auto_analyze", property = "autoAnalyze"),
			@Result(column = "schedule", property = "schedule"), @Result(column = "dataPath", property = "dataPath"),
			@Result(column = "prefixes", property = "prefixes"), @Result(column = "is_report", property = "report"),
			@Result(column = "mailTo", property = "mailTo"), @Result(column = "analyzer", property = "analyzer"),
			@Result(column = "pid", property = "redisInfo", one = @One(select = "org.nesc.ecbd.mapper.RedisInfoMapper.queryById", fetchType = FetchType.EAGER)) })
	RDBAnalyze getRDBAnalyzeById(Long id);
	
	
	@Select("select * from rdb_analyze")
	@Results({ @Result(id = true, column = "id", property = "id"),
			@Result(column = "auto_analyze", property = "autoAnalyze"),
			@Result(column = "schedule", property = "schedule"), @Result(column = "dataPath", property = "dataPath"),
			@Result(column = "prefixes", property = "prefixes"), @Result(column = "is_report", property = "report"),
			@Result(column = "mailTo", property = "mailTo"), @Result(column = "analyzer", property = "analyzer"),
			@Result(column = "pid", property = "redisInfo", one = @One(select = "org.nesc.ecbd.mapper.RedisInfoMapper.queryById", fetchType = FetchType.EAGER)) })
	List<RDBAnalyze> queryList();
	
	
	@Select("select * from rdb_analyze where pid = #{pid}")
	@Results({ @Result(id = true, column = "id", property = "id"),
			@Result(column = "auto_analyze", property = "autoAnalyze"),
			@Result(column = "schedule", property = "schedule"), @Result(column = "dataPath", property = "dataPath"),
			@Result(column = "prefixes", property = "prefixes"), @Result(column = "is_report", property = "report"),
			@Result(column = "mailTo", property = "mailTo"), @Result(column = "analyzer", property = "analyzer"),
			@Result(column = "pid", property = "redisInfo", one = @One(select = "org.nesc.ecbd.mapper.RedisInfoMapper.queryById", fetchType = FetchType.EAGER)) })
	RDBAnalyze getRDBAnalyzeByPid(Long pid);

	@Select("select id from rdb_analyze where pid = #{pid}")
	Long getRDBAnalyzeIdByPid(Long pid);

	@UpdateProvider(type = RDBAnalyzeProvider.class, method = "updateRdbAnalyze")
	Integer updateRdbAnalyze(@Param("rdbAnalyze") RDBAnalyze rdbAnalyze);

	@Select("select pid from rdb_analyze where id=#{id}")
	Long selectPidById(Long id);
}
