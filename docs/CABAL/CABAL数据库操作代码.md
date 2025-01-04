在查询分析器里执行指令

调出技能代码

```sql
SELECT Data from cabal_skilllist_table where CharacterIdx= x
```


（角色ID）
注释SELECT Data字段名 from cabal_skilllist_table表名 where CharacterIdx字段序号= x（角色ID）

写入技能代码
UPDATE cabal_skilllist_table SET Data = 0x技能代码 WHERE CharacterIdx = x（x是角色ID）
9300012200天堂之怒
9200012300狂风暴雪
B400012400昊天神辉

### 注册SQL语句:

```sql
exec dbo.cabal_tool_registerAccount '账号','密码'
```
### 更改MagicKey
```sql
USE [Account];
UPDATE dbo.cabal_client_version_table
SET MagicKey = 543957823;
```

### 在所有存储过程中查找一个关键字

```sql
select a.text,b.name,b.xtype from dbo.syscomments a,dbo.sysobjects b

   where a.id=b.id and PATINDEX('%关键字%', a.text)>0 order by xtype
```
