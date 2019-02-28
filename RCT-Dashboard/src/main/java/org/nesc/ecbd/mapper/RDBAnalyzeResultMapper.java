package org.nesc.ecbd.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.nesc.ecbd.common.SuperMapper;
import org.nesc.ecbd.entity.RDBAnalyzeResult;

import java.util.List;

/**
 * 
 * @author Jacob Cao
 * 
 * 2019年1月17日
 */
public interface RDBAnalyzeResultMapper extends SuperMapper<RDBAnalyzeResult> {
	@Delete("delete from rdb_analyze_result where schedule_id IN (select min(schedule_id) from rdb_analyze_result)")
	void deleteOld();

	/**
	 * query info from db by id and max schedule_id
	 * @param redisInfoId queryId
	 * @return RDBAnalyzeResult
	 */
	@Select("select * from rdb_analyze_result where schedule_id=(select max(schedule_id) from rdb_analyze_result where redis_info_id = #{redisInfoId})")
	@Results({ @Result(id = true, column = "id", property = "id"),
			@Result(column = "schedule_id", property = "scheduleId"),
			@Result(column = "redis_info_id", property = "redisInfoId"),
			@Result(column = "result", property = "result")})
	RDBAnalyzeResult selectLatestResultByRedisInfoId(Long redisInfoId);

	/**
	 * query all result by redis_info_id
	 * @param redisInfoId queryId
	 * @return List<RDBAnalyzeResult>
	 */
	@Select("select * from rdb_analyze_result where redis_info_id= #{redisInfoId}")
	List<RDBAnalyzeResult> selectAllResultById(Long redisInfoId);

	/**
	 * query all result by redis_info_id
	 * @param redisInfoId queryId
	 * @return List<RDBAnalyzeResult>
	 */
	@Select("select * from rdb_analyze_result where schedule_id != (select max(schedule_id) from rdb_analyze_result where redis_info_id = #{redisInfoId}) and redis_info_id = #{redisInfoId}")
	@Results({ @Result(id = true, column = "id", property = "id"),
			@Result(column = "schedule_id", property = "scheduleId"),
			@Result(column = "redis_info_id", property = "redisInfoId"),
			@Result(column = "result", property = "result")})
	List<RDBAnalyzeResult> selectAllResultByIdExceptLatest(Long redisInfoId);


	@Select("select * from rdb_analyze_result where schedule_id= #{scheduleId} and redis_info_id = #{redisInfoId}")
	RDBAnalyzeResult selectByRedisIdAndSId(Long redisInfoId, Long scheduleId);


}
