# cabalmain_1288_地址

### XOR密钥地址

```asm
0042FB90  |.  83F0 57       xor eax,0x57
0042FBA2  |.  83F0 67       xor eax,0x67
0042FBB4  |.  83F0 65       xor eax,0x65
0042FBC5  |.  35 92000000   xor eax,0x92
```



### 双击启动地址

`0040D98C`

```asm
0040D98C  |. /0F84 66010000 je cabalmai.0040DAF8
```
`0040DAF8`是开启双击启动
```asm
0040D98C  |. /0F84 5A020000 je cabalmai.0040DBEC
```

`0040DBEC`是关闭双击启动，会调用开启同目录下的`/Cabal.exe`程序，所以不能把主程序名改成`Cabal.exe`，那样会死循环。

更改地址在

```asm
007DED70  5C 43 61 62 61 6C 2E 65 78 65 00 00 68 75 73 6B  \Cabal.exe..husky
```