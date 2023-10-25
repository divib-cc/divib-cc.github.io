### 更新脚本
存放位置`/home/cabal/ip.sh`
```bash
#!/bin/sh
#获取WAN口公网IP
wan0=`curl icanhazip.com`
#读取WorldSvr_24_01.ini文件中的IPAddress的IP
wan1=`awk -F '=' '/\[WorldSvr\]/{a=1}a==1&&$1~/IPAddress/{print $2;exit}' /etc/cabal/WorldSvr_24_01.ini`

if [ "$wan0" != "" ]
	then
		if [ "$wan0" == "$wan1" ]
		then echo "WAN0"
		exit
		else echo "WAN1"
		
		sed /etc/cabal/Templates/WorldSvr_24_01.ini \
		-e "s/cip/$wan0/g" \
		> /etc/cabal/WorldSvr_24_01.ini.tmp
		mv /etc/cabal/WorldSvr_24_01.ini.tmp /etc/cabal/WorldSvr_24_01.ini
				
		sed /etc/cabal/Templates/WorldSvr_24_02.ini \
		-e "s/cip/$wan0/g" \
		> /etc/cabal/WorldSvr_24_02.ini.tmp
		mv /etc/cabal/WorldSvr_24_02.ini.tmp /etc/cabal/WorldSvr_24_02.ini
				
		sed /etc/cabal/Templates/WorldSvr_24_41.ini \
		-e "s/cip/$wan0/g" \
		> /etc/cabal/WorldSvr_24_41.ini.tmp
		mv /etc/cabal/WorldSvr_24_41.ini.tmp /etc/cabal/WorldSvr_24_41.ini
				
		sed /etc/cabal/Templates/WorldSvr_24_43.ini \
		-e "s/cip/$wan0/g" \
		> /etc/cabal/WorldSvr_24_43.ini.tmp
		mv /etc/cabal/WorldSvr_24_43.ini.tmp /etc/cabal/WorldSvr_24_43.ini
		
		sleep 5
		/sbin/service cabal restart
		exit
		fi
	else
	exit
fi
```
保存sh文件并给权限

### 定时任务

在/etc/cron.d/copytodb_trc中添加
```bash
* * * * * root /home/cabal/ip.sh > /dev/null 2>&1
```

查看crontab服务状态
```bash
/sbin/service crond status
```

没有的话就安装cron服务
命令行下输入
```bash
sudo apt-get install cron
```

```bash
启动与关闭cron服务
/sbin/service crond start 启动服务
/sbin/service crond stop 关闭服务
/sbin/service crond restart 重启服务
/sbin/service crond reload 重新载入配置
/sbin/service crond status 查看crontab服务状态
```

编辑定时任务
crontab -e
按`i`进入编辑
按`esc`退出编辑
`shift`+`:`输入命令`wq`保存退出
每1分钟运行一次

查看cron任务

```bash
crontab -l
```

查看cron任务

```bash
ps -ef|grep cabal
```
查看cron日志
```bash
tail -f /var/log/cron
```