package org.nesc.ecbd.entity;

import com.baomidou.mybatisplus.annotations.TableField;
import com.baomidou.mybatisplus.annotations.TableId;
import com.baomidou.mybatisplus.annotations.TableName;
import com.baomidou.mybatisplus.enums.IdType;

@TableName("slowlog")
public class SlowlogEntity {
	@TableId(value = "id", type = IdType.AUTO)
	private Long id;
	private Long pid;
	@TableField(value="auto_analyze")
	private Boolean autoAnalyze;
	private String schedule;

	public Boolean getAutoAnalyze() {
		return autoAnalyze;
	}

	public void setAutoAnalyze(Boolean autoAnalyze) {
		this.autoAnalyze = autoAnalyze;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getSchedule() {
		return schedule;
	}

	public void setSchedule(String schedule) {
		this.schedule = schedule;
	}

	public Long getPid() {
		return pid;
	}

	public void setPid(Long pid) {
		this.pid = pid;
	}
	
	
}
