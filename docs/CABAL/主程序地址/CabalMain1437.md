#### 相机地图索引表
```
004BA9C3   .  00            db 00           ;  分支 004BA99B 索引表
004BA9C4   .  00            db 00
004BA9C5   .  01            db 01
004BA9C6   .  00            db 00
004BA9C7   .  00            db 00
004BA9C8   .  02            db 02
004BA9C9   .  00            db 00
004BA9CA   .  00            db 00
004BA9CB   .  00            db 00
004BA9CC   .  00            db 00
004BA9CD   .  00            db 00
004BA9CE   .  09            db 09
004BA9CF   .  09            db 09
```

---
#### 飞车速度地址
```erlang
007BDCFC  |.  83F9 0A       cmp ecx,0xA
007BDCFF  |.  75 07         jnz short CabalMai.007BDD08
007BDD01  |>  D905 B4CE9700 fld dword ptr ds:[0x97CEB4]	//滑板600速度
007BDD07  |.  C3            retn
007BDD08  |>  83F9 0C       cmp ecx,0xC
007BDD0B  |.  74 15         je short CabalMai.007BDD22
007BDD0D  |.  83F9 01       cmp ecx,0x1
007BDD10  |.  74 10         je short CabalMai.007BDD22
007BDD12      E8 D3FFFFFF   call CabalMai.007BDCEA
007BDD17  |.  85C0          test eax,eax
007BDD19  |.^ 75 E6         jnz short CabalMai.007BDD01
007BDD1B  |.  D905 B8CE9700 fld dword ptr ds:[0x97CEB8]	//摩托/雪橇700速度
007BDD21  |.  C3            retn
007BDD22      D905 BCCE9700 fld dword ptr ds:[0x97CEBC]	//星际飞车800速度
007BDD28  \.  C3            retn
```

```erlang
0097CEB5    0016            add byte ptr ds:[esi],dl                //16 44十六进制转单浮点=600
0097CEB7    44              inc esp
0097CEB8    0000            add byte ptr ds:[eax],al
0097CEBA    2F              das                                     //2F 44十六进制转单浮点=700
0097CEBB    44              inc esp
0097CEBC    0000            add byte ptr ds:[eax],al
0097CEBE    48              dec eax                                	//48 44十六进制转单浮点=800
0097CEBF    44              inc esp
0097CEC0    F0:EE           lock out dx,al                           ; 不允许锁定前缀
```

浮点转十六进制 在线网址：
[https://www.asciim.cn/hex/float.html](https://www.asciim.cn/hex/float.html)

---
飞车数量
```bash
007956A8      83FE 1A       cmp esi,0x1A #十六进制1A代表十进制26
```

```bash
飞车特效光效
007BE8BD      83F8 19       cmp eax,0x19 #十六进制19代表十进制25
```
---
#### 角色删除等级限制
```bash
0065FAD2  |. /7C 2A         jl short CabalMai.0065FAFE
//jl 0065FAFE  改成=> JMP 0065FAFE
0065FAD2     /EB 2A         jmp short CabalMai.0065FAFE
```
服务器频道WorldSvr_XX_XX添加以下代码
```shell
#Character
CharacterDeleteLimitLevel=100#大于等于100级的角色不能删除
```

#### ech模型加载

```bash
00537FEF  |.  83F8 10       |cmp eax,0x10
00538112  |.  83F8 10       |cmp eax,0x10
```
#### 坐骑姿势代码
```
0046B17E  |.  68 FCA19800   |push CabalMai.0098A1FC                  ;  ASCII "hl"
```
选中地址回车，选中`68 6C`Ctrl+E修改ASCII字符
```
0098A1FC  68 6C 00 00 64 6F 77 6E 00 00 00 00 73 74 6E 64  hl..down....stnd
```
突破姿势关键地址 `007BE48E`
```
007BE48E      E8 ED000000   call CabalMai.007BE580
↓
007BE580  /$  8B88 F0010000 mov ecx,dword ptr ds:[eax+0x1F0]
007BE586  |.  83F9 0A       cmp ecx,0xA
007BE589  |.  75 07         jnz short CabalMai.007BE592
007BE58B  |.  8D82 42010000 lea eax,dword ptr ds:[edx+0x142]
007BE591  |.  C3            retn
007BE592  |>  83F9 18       cmp ecx,0x18
007BE595  |.  74 1C         je short CabalMai.007BE5B3
007BE597  |.  83F9 19       cmp ecx,0x19
007BE59A  |.  74 17         je short CabalMai.007BE5B3
007BE59C  |.  E8 22F7FFFF   call CabalMai.007BDCC3
007BE5A1  |.  85C0          test eax,eax
007BE5A3  |.  75 07         jnz short CabalMai.007BE5AC
007BE5A5  |.  8D82 36010000 lea eax,dword ptr ds:[edx+0x136]
007BE5AB  |.  C3            retn
007BE5AC  |>  8D82 2C010000 lea eax,dword ptr ds:[edx+0x12C]
007BE5B2  |.  C3            retn
007BE5B3  |>  8D82 72010000 lea eax,dword ptr ds:[edx+0x172]
007BE5B9  \.  C3            retn
```

HOOK地址 `0095A2E3`
```
007BE48E      E8 50BE1900   call CabalMai.0095A2E3
↓还有问题
0095A2E3   $  8B88 F0010000 mov ecx,dword ptr ds:[eax+0x1F0]
0095A2E9   .  83F9 0A       cmp ecx,0xA                              ;  Switch (cases A..18)
0095A2EC   .  75 07         jnz short CabalMai.0095A2F5
0095A2EE   .  8D82 42010000 lea eax,dword ptr ds:[edx+0x142]         ;  Case A of switch 0095A2E9
0095A2F4   .  C3            retn
0095A2F5   >  83F9 18       cmp ecx,0x18
0095A2F8   .  74 28         je short CabalMai.0095A322
0095A2FA   .  83F9 0D       cmp ecx,0xD
0095A2FD   .  74 1C         je short CabalMai.0095A31B
0095A2FF   .  83F9 0E       cmp ecx,0xE
0095A302   .  74 17         je short CabalMai.0095A31B
0095A304   .  83F9 19       cmp ecx,0x19                             ;  Default case of switch 0095A2E9
0095A307   .  E8 B739E6FF   call CabalMai.007BDCC3
0095A30C   .  85C0          test eax,eax
0095A30E   .  74 12         je short CabalMai.0095A322
0095A310   .  8D82 36010000 lea eax,dword ptr ds:[edx+0x136]
0095A316   .  C3            retn
0095A317      8D82 2C010000 lea eax,dword ptr ds:[edx+0x12C]
0095A31D   .  C3            retn
0095A31E      8D82 72010000 lea eax,dword ptr ds:[edx+0x172]
0095A324   .  C3            retn
0095A325      90            nop
0095A326      90            nop
0095A327      90            nop
```





