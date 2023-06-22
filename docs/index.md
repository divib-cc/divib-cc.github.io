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

如果出现`fatal: unable to access 'xxxxx': Recv failure: Connection was reset`
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```
原因：git在拉取或者提交项目时，中间会有git的http和https代理，但是我们本地环境本身就有SSL协议了，所以取消git的https代理即可，不行再取消http的代理。
解决办法：在项目文件夹的命令行窗口执行下面代码，取消git本身的https代理，使用自己本机的代理。

4. 设置windows环境变量GIT_USER
不设是会遇到以下报错
`Error: Please set the GIT_USER environment variable, or explicitly specify USE_SSH instead!`
我的电脑--属性--高级系统设置--环境变量--用户变量--新建
```bash
变量名:GIT_USER
变量值:divib-cc # github用户名
```

### 分支

git 在存储文件时，每一次代码代码的提交都会创建一个与之对应的节点，git 就是通过一个一个的节点来记录代码的状态的。节点会构成一个树状结构，树状结构就意味着这个树会存在分支，默认情况下仓库只有一个分支，命名为 master。在使用 git 时，可以创建多个分支，分支与分支之间相互独立，在一个分支上修改代码不会影响其他的分支。

```bash
git branch # 查看当前分支
git branch <branch name> # 创建新的分支
git branch -d <branch name> # 删除分支
git switch <branch name> # 切换分支
git switch -c <branch name> # 创建并切换分支
git merge <branch name> # 和并分支
```
### 远程仓库（remote）

目前我对于 git 所有操作都是在本地进行的。在开发中显然不能这样的，这时我们就需要一个远程的 git 仓库。远程的 git 仓库和本地的本质没有什么区别，不同点在于远程的仓库可以被多人同时访问使用，方便我们协同开发。在实际工作中，git 的服务器通常由公司搭建内部使用或是购买一些公共的私有 git 服务器。我们学习阶段，直接使用一些开放的公共 git 仓库。目前我们常用的库有两个：GitHub 和 Gitee（码云）

将本地库上传 git：

```bash
git remote add origin https://github.com/lilichao/git-demo.git
# git remote add <remote name> <url>

git branch -M main
# 修改分支的名字的为main

git push -u origin main
# git push 将代码上传服务器上
```

将本地库上传 gitee：

```bash
git remote add gitee https://gitee.com/ymhold/vue-course.git
git push -u gitee main
```

### 远程库的操作的命令

```bash
git remote # 列出当前的关联的远程库
git remote add <远程库名> <url> # 关联远程仓库
git remote remove <远程库名>  # 删除远程库
git push -u <远程库名> <分支名> # 向远程库推送代码，并和当前分支关联
git push <远程库> <本地分支>:<远程分支>
git clone <url> # 从远程库下载代码

git push # 如果本地的版本低于远程库，push默认是推不上去
git fetch # 要想推送成功，必须先确保本地库和远程库的版本一致，fetch它会从远程仓库下载所有代码，但是它不会将代码和当前分支自动合并
    # 使用fetch拉取代码后，必须要手动对代码进行合并
git pull  # 从服务器上拉取代码并自动合并

```

注意：推送代码之前，一定要先从远程库中拉取最新的代码
