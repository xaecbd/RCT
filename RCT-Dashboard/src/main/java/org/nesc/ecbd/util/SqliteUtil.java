/**
 * 
 */
package org.nesc.ecbd.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Hulva Luva.H
 * @since 2018年3月30日
 * 
 *        用于在程序启动时检查 sqlite 数据库
 *
 */
public class SqliteUtil {
	private final static Logger LOG = LoggerFactory.getLogger(SqliteUtil.class);
	protected static Connection conn = null;

	public static void connect(String dbUrl) {
		if (conn != null) {
			return;
		}
		try {
			Class.forName("org.sqlite.JDBC");
			conn = DriverManager.getConnection(dbUrl);
		} catch (ClassNotFoundException | SQLException e) {
			LOG.error("Sqlite connect error " + e);
		}
	}

	public static boolean tableExists(String tableName) {
		ResultSet rs = null;
		try (Statement stmt = conn.createStatement();) {
			String sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "';";
			LOG.info("Checking if Table '{}' exists", tableName);
			rs = stmt.executeQuery(sql);
			boolean exists = false;
			while (rs.next()) {
				if (rs.getString("name").equals(tableName)) {
					exists = true;
					break;
				}
			}
			return exists;
		} catch (SQLException ex) {
			LOG.error("Sqlite check exists table error " + ex);
		} finally {
			if (rs != null) {
				try {
					rs.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
		return false;
	}

	public static void createTable(String sql) {
		try (Statement stmt = conn.createStatement();) {
			LOG.info("Creating Table: " + sql);
			stmt.executeUpdate(sql);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public static void close() {
		try {
			if (conn != null) {
				conn.close();
				conn = null;
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		try {
			SqliteUtil.create();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static void create() throws Exception {
		SqliteUtil.connect("jdbc:sqlite:db/data.db");
		// ----------------
		if (!SqliteUtil.tableExists("redis_info")) {
			StringBuilder sb = new StringBuilder();
			sb.append("CREATE TABLE ");
			sb.append("'").append("redis_info").append("'");
			sb.append(" (");
			sb.append("id integer PRIMARY KEY autoincrement,");
			sb.append("name varchar(255),");
			sb.append("address varchar(255),");
			sb.append("password varchar(255),");
			sb.append("mode integer,");
			sb.append("create_date Date");
			sb.append(");");
			SqliteUtil.createTable(sb.toString());
		}

		if (!SqliteUtil.tableExists("rdb_analyze")) {
			StringBuilder sb = new StringBuilder();
			sb.append("CREATE TABLE ");
			sb.append("'").append("rdb_analyze").append("'");
			sb.append(" (");
			sb.append("id integer PRIMARY KEY autoincrement,");
			sb.append("auto_analyze integer,");
			sb.append("schedule varchar(255),");
			sb.append("dataPath varchar(255),");
			sb.append("prefixes varchar(255),");
			sb.append("is_report integer,");
			sb.append("mailTo varchar(255),");
			sb.append("analyzer varchar(255),");
			sb.append("pid integer");
			sb.append(");");
			SqliteUtil.createTable(sb.toString());
		}

		if (!SqliteUtil.tableExists("slowlog")) {
			StringBuilder sb = new StringBuilder();
			sb.append("CREATE TABLE ");
			sb.append("'").append("slowlog").append("'");
			sb.append(" (");
			sb.append("id integer PRIMARY KEY autoincrement,");
			sb.append("auto_analyze integer,");
			sb.append("schedule varchar(255),");
			sb.append("pid integer");
			sb.append(");");
			SqliteUtil.createTable(sb.toString());
		}

		if (!SqliteUtil.tableExists("rdb_analyze_result")) {
			StringBuilder sb = new StringBuilder();
			sb.append("CREATE TABLE ");
			sb.append("'").append("rdb_analyze_result").append("'");
			sb.append(" (");
			sb.append("id integer PRIMARY KEY autoincrement,");
			sb.append("schedule_id integer,");
			sb.append("redis_info_id integer,");
			sb.append("result varchar(1024)");
			sb.append(");");
			SqliteUtil.createTable(sb.toString());
		}
		
		SqliteUtil.close();
	}

}
