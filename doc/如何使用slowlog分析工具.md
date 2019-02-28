## Slowlog模块介绍

### Slowlog List
   用于统计各个redis客户端在什么时间执行了什么命令以及执行的时间等信息。
### Statistics
   统计了slowlog执行的命令的占比
### Monitors
   该模块对slowlog的信息进行收集将数据写入Eleasticsearch中
#### 页面参数说明：
1.  **Address**:显示对应集群的Address
2.  **Schedule**:任务调度的cron表达式
3.  **Status**：调度任务执行的状态（NORMAL:任务正在运行;NONE:任务已经被取消）
 只有在填写了schedule cron表达式后，打开switch开关，任务便可调度执行，再次点击switch可取消掉该定时任务
