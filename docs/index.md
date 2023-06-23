### 部署说明

1. 安装 git

2. 初始化配置git用户名和密码

```bash
git config --global user.name "xxxx"
git config --global user.email "xxx@xxx.xxx"
```

2. 拉取github仓库代码

```bash
git clone https://github.com/divib-cc/divib-cc.github.io.git
```

3. 切换分支到`main`
```bash
git switch main
```

4. 设置windows环境变量GIT_USER不设是会遇到以下报错

`Error: Please set the GIT_USER environment variable, or explicitly specify USE_SSH instead!`
我的电脑--属性--高级系统设置--环境变量--用户变量--新建
```bash
变量名:GIT_USER
变量值:divib-cc # github用户名
```
### 可能遇到的问题

`fatal: unable to access 'xxxxx': Recv failure: Connection was reset`

原因：git在拉取或者提交项目时，中间会有git的http和https代理，但是我们本地环境本身就有SSL协议了，所以取消git的https代理即可，不行再取消http的代理。
解决办法：在项目文件夹的命令行窗口执行下面代码，取消git本身的https代理，使用自己本机的代理。

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### git文档
git文档地址:https://gitee.com/ymhold/vue-course