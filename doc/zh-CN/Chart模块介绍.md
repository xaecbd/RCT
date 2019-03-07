# Chart模块介绍

Chart模块主要是对RDB分析结果进行可视化展示

在该模块中，显示最新redis中数据分析结果，在time中会保留7次分析结果，通过更改时间，可以切换查看不同时间分析的数据报表。

![avatar](../screenshots/chart模块可视化功能介绍.jpg)

## 1.Key Count By Type
不同类型的数据数量统计汇总
## 2.Key Memory By Type
不同类型的数据内存字节预估统计汇总
## 3.Prefix Keys Count
根据相应的规则统计key前缀的数量信息
## 4.Prefix Keys Memory
根据相应的规则统计key前缀的内存字节信息
## 5.Top 1000 Largest Keys By Perfix
根据前缀规则统计Top 1000 前缀key
## 6.Keys TTL Info
根据前缀统计出设置了TTL和没有设置TTL的数据有多少
## 7.Top 1000 Largest Keys By Type
根据不同的数据结构top出Count和Bytes最大的1000条数据