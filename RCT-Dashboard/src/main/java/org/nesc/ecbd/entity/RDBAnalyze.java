package org.nesc.ecbd.entity;

import com.baomidou.mybatisplus.annotations.TableField;
import com.baomidou.mybatisplus.annotations.TableId;
import com.baomidou.mybatisplus.annotations.TableName;
import com.baomidou.mybatisplus.enums.IdType;

/**
 * 
 * @author Jacob Cao
 * 
 * 2019年1月17日
 */
@TableName("rdb_analyze")
public class RDBAnalyze {
	@TableId(value="id",type=IdType.AUTO)
	private Long id;
	@TableField(value="auto_analyze")
	private boolean autoAnalyze;
	private String schedule;
	private String dataPath;
	private String prefixes;
	@TableField(value="is_report")
	private boolean report;
	private String mailTo;
	private String analyzer;
	
	private Long pid;
	
	private RedisInfo redisInfo;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Boolean getAutoAnalyze() {
		return autoAnalyze;
	}
	public void setAutoAnalyze(Boolean autoAnalyze) {
		this.autoAnalyze = autoAnalyze;
	}
	public String getSchedule() {
		return schedule;
	}
	public void setSchedule(String schedule) {
		this.schedule = schedule;
	}
	public String getDataPath() {
		return dataPath;
	}
	public void setDataPath(String dataPath) {
		this.dataPath = dataPath;
	}
	public String getPrefixes() {
		return prefixes;
	}
	public void setPrefixes(String prefixes) {
		this.prefixes = prefixes;
	}
	public String getMailTo() {
		return mailTo;
	}
	public void setMailTo(String mailTo) {
		this.mailTo = mailTo;
	}
	public String getAnalyzer() {
		return analyzer;
	}
	public void setAnalyzer(String analyzer) {
		this.analyzer = analyzer;
	}
	public Boolean getReport() {
		return report;
	}
	public void setReport(Boolean report) {
		this.report = report;
	}
	
	public Long getPid() {
		return pid;
	}
	public void setPid(Long pid) {
		this.pid = pid;
	}
	public RedisInfo getRedisInfo() {
		return redisInfo;
	}
	public void setRedisInfo(RedisInfo redisInfo) {
		this.redisInfo = redisInfo;
	}
}
