### 1. 安装 docker 和 git
>
- Ubuntu/Debian使用以下代码
```bash
apt update && apt install git docker-compose
```
- RedHat/CentOS/Fedora使用以下代码
```bash
yum update && yum install git docker-compose
```

### 2. 获取项目
```bash
git clone https://github.com/artem-alekseev/cabal_server.git
```

### 3. 进入目录
```bash
cd cabal_server/
```

### 4. 复制.env.example 为.env
```bash
cp .env.example .env
```

### 5. 查看获取服务器 IP 地址
```bash
ip addr
```

### 6. 编辑 .env 文件
```js
DB_PASSWORD=password_from_db //数据库密码使用特殊符号、数字和大写符号的强密码
CONNECT_IP=192.168.1.1 // 服务器IP
EXP_RATE=100 // 升级经验（例如 5 表示 5 倍）
SEXP_RATE=100 // 技能经验
CEXP_RATE=100 // 制造经验
DROP_RATE=2 // 掉落率（超过 5 不好）
ALZ_RATE=100 // 金币 掉落率
BALZ_RATE=100 // 金币堆 掉落率
PEXP_RATE=100 // 宠物经验
WEXP_RATE=100 // 战争经验
ITEMS_PER_DROP=2 // 物品掉落数量
```

### 7. 构建 docker 容器
```bash
docker-compose build
```

### 8. 启动 mssql 数据库容器
```bash
docker-compose up -d mssql
```

### 9. 还原数据库
```bash
docker-compose exec mssql sh restoredb.sh
```

### 10. 启动数据库代理
```bash
docker-compose up -d global_db_agent auth_db_agent cash_db_agent event_db_agent pc_bang_db_agent db_agent_01 rock_and_roll_its
```

### 11. Up Global Mgr 服务器
```bash
docker-compose up -d global_mgr_svr
```
> 等待 30 秒左右

### 12. Up 其他服务
```bash
docker-compose up -d party_svr_01 chat_node_01 event_mgr_svr login_svr_01 agent_shop_01
```
### 13. 启动频道
> - Premium
```bash
docker-compose up -d world_svr_01_01
```
- War
```bash
docker-compose up -d world_svr_01_02
```
- M War
```bash
docker-compose up -d world_svr_01_03 world_svr_01_04 world_svr_01_05 world_svr_01_06 world_svr_01_07
```
