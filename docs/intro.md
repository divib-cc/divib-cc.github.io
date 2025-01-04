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




### 找不到 SSH 密钥文件：
你运行 ls ~/.ssh/id_rsa.pub 时，提示路径不存在。这意味着在你的用户目录下没有找到 SSH 公钥文件。需要生成新的 SSH 密钥。

1. 生成 SSH 密钥
如果你尚未创建 SSH 密钥，可以按以下步骤生成新的 SSH 密钥并将其添加到 GitHub：

生成 SSH 密钥
打开 PowerShell 或 Git Bash。

运行以下命令以生成 SSH 密钥对（公钥和私钥）：

```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```
其中，your-email@example.com 替换为你在 GitHub 上的电子邮件地址。默认情况下，它会提示你将密钥保存在 C:\Users\your-username\.ssh\id_rsa，直接按 Enter 键确认。

生成过程中会询问是否为密钥设置密码，可以选择设置或留空。

完成后，公钥会保存在 C:\Users\your-username\.ssh\id_rsa.pub，私钥保存在 
```bash
C:\Users\your-username\.ssh\id_rsa。
```

添加 SSH 公钥到 GitHub
打开生成的公钥文件：

```bash
cat ~/.ssh/id_rsa.pub
```
或者用文件浏览器打开 C:\Users\your-username\.ssh\id_rsa.pub，然后复制其内容。

登录到 GitHub。

点击右上角的头像 -> Settings。

在左侧导航栏中选择 SSH and GPG keys，然后点击 New SSH key。

在 Title 框中输入一个名称（例如：My PC），将刚才复制的 SSH 公钥粘贴到 Key 框中，然后点击 Add SSH key。

测试 SSH 连接
使用以下命令来验证是否成功添加了 SSH 密钥：

```bash
ssh -T git@github.com
```
如果一切正常，GitHub 会显示一条消息，确认你已经成功认证

如果返回类似以下的信息，则说明 SSH 配置正常：

```bash
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```



### git文档
git文档地址:https://gitee.com/ymhold/vue-course