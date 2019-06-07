# 贴吧批量 AT

## `get_user.js`

获取贴吧前十页主页的楼主。

## `at.js`

回复帖子的同时 AT 列表中的用户。

## `config.json`

+   `src`：从中获取用户的贴吧列表
+   `users`：用户列表文件名称
+   `wait_sec`：回帖间隔（秒），不建议太快
+   `tid`：帖子号，就是`/p/`后面的数字
+   `tb`：贴吧名称
+   `at_num`：每个回复中 AT 的人数，最大上限为 5

## `cookie`

贴吧 Cookie 的有效部分，格式为`BDUSS=`后跟 192 个字符
