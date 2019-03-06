## Slowlog module introduction

### Slowlog List
   It is used for statistics of what commands were executed by each Redis client at what time and when.
### Statistics
  I count the percentage of commands executed by slowlog
### Monitors
   This module collects slowlog information and writes the data to Eleasticsearch
#### Page parameter description：
1.  **Address**:Displays the Address of the corresponding cluster
2.  **Schedule**:Cron expression for task scheduling
3.  **Status**：Schedule the status of task execution (NORMAL: the task is running; NONE: the task has been canceled)
 Only after filling in the schedule cron expression, turn on the switch and the task can be scheduled for execution. Click the switch again to cancel the timed task