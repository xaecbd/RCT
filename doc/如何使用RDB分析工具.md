## Add a New RDB analysis configuration
Only after you have created the Redis node can you go to the RCT tool navigation page.
1.  Click to navigate RDB Analyze
2.  If no RDB information has been added, the information can be improved in the box that pops up on the page, or click the Add button below to Add
3. Click edit to modify the RDB information
4. If the RDB information has been improved, click to open the switch, then the RDB is directly on and off the timing task
5. Click Analyze, then it will Analyze the RDB information manually. The status of the analysis can be viewed in status, and the progress status of the RDB analysis task can be viewed in real time through the link after status

## RDB Add page parameters
1.  **Automatic Analyze**：Whether to turn on timed tasks
2.  **Schedule**：Cron expression (after completion, you can click the icon on the right side to check the execution time of the timed expression)
3.  **Analyzer**:Profiler (report generation, filter key, prefix key)
4.  **Data Path**:RDB file directory (eg: / opt/app/redis/9002/dump.rdb, data path for/opt/app/redis)
5.  **Prefixes**:The prefix for a key can be null, but prefixes must be filled in when the prefix key in the analyzer is selected
6.  **Report**：Generate report or not
7.  **Mail**：The recipient after the report is generated, the platform will send the report as an attachment to the recipient. If there are multiple recipients, please use. separated
## RDB home page parameters
The parameters of the RDB home page are basically the same as those of the add page. I won't repeat them here. The only difference is:
Status：Analyze the progress status of the RDB file, including success, the analysis in progress and failure. When the status is the status being analyzed, click the following link to enter the real-time analysis page to view the real-time status.

## Introduction to analyzer
1.Generate reports：Analyze the data in the RDB file and write the results to the database. If the Report is configured, the results will be sent to the user in the form of an Excel Report
2.According to the filter key：When analyzing the RDB file, export the corresponding key according to the filter and write the data to EleasticSearch
3.According to the prefix key：When analyzing the RDB file, the corresponding key was exported according to the prefixed key, and the data was written to EleasticSearch