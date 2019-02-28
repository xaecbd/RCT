package org.nesc.ecbd.entity;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年4月7日 下午4:41:16
 * @version:1.0
 * @description:
 */
public class AnalyzeInstance {
  private String host;
  private int port;

  public AnalyzeInstance(String host, int port) {
    super();
    this.host = host;
    this.port = port;
  }

  public String getHost() {
    return host;
  }

  public void setHost(String host) {
    this.host = host;
  }

  public int getPort() {
    return port;
  }

  public void setPort(int port) {
    this.port = port;
  }

  @Override
  public String toString() {
    return "AnalyzeInstance [host=" + host + ", port=" + port + "]";
  }
}
