package org.nesc.ecbd.entity;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年3月22日 下午2:46:03
 * @version:1.0
 * @description:
 */
public class SlowlogInfo {
	private String key;
	private long cost;
	private int count;
	private String command;
	
	public SlowlogInfo(String key,int cost) {
		this.key = key;
		this.cost = cost;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public long getCost() {
		return cost;
	}

	public void setCost(long cost) {
		this.cost = cost;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}

}
