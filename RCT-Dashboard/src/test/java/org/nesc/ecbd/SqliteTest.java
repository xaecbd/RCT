package org.nesc.ecbd;

import org.nesc.ecbd.util.SqliteUtil;

/**
 * @author Hulva Luva.H
 * @since 2018年4月17日
 *
 */
public class SqliteTest {

  /**
   * @param args
   */
  public static void main(String[] args) {
    SqliteUtil.connect("jdbc:sqlite:db/data.db");
    if (!SqliteUtil.tableExists("clusterInfo")) {
      StringBuilder sb = new StringBuilder();
      sb.append("CREATE TABLE ");
      sb.append("'").append("clusterInfo").append("'");
      sb.append(" (");
      sb.append("id integer  PRIMARY KEY autoincrement,");
      sb.append("name varchar(255),");
      sb.append("addr varchar(255),");
      sb.append("createDate date,");
      sb.append("autoAnalyze integer,");
      sb.append("schedule varchar(255),");
      sb.append("dataPath varchar(255),");
      sb.append("prefixes varchar(255),");
      sb.append("report integer,");
      sb.append("mailTo varchar(255)");
      sb.append(");");
      SqliteUtil.createTable(sb.toString());
    }
    if (!SqliteUtil.tableExists("email")) {
      StringBuilder sb = new StringBuilder();
      sb.append("CREATE TABLE ");
      sb.append("'").append("email").append("'");
      sb.append(" (");
      sb.append("id integer PRIMARY KEY autoincrement,");
      sb.append("smtp varchar(255),");
      sb.append("fromName varchar(255),");
      sb.append("userName varchar(255),");
      sb.append("password varchar(255),");
      sb.append("subject varchar(255)");
      sb.append(");");
      SqliteUtil.createTable(sb.toString());
    }
    SqliteUtil.close();
  }

}
