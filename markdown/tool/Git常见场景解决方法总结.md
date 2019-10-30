### 放弃某次merge
假如你merge的时候产生了很大的冲突，想先放弃某次merge，你可以：
1. git merge --abort 或
2. git reset HEAD 或
3. git checkout HEAD

### 在非目的分支上做了修改，想切换回目的分支
+ 还未添加到暂存区/已添加到暂存区还未提交
1. 新建临时分支，`git checkout -b new_branch`，这样改动会被带到新分支。然后把非目的分支的修改用`git checkout .`恢复。
2. 先 `git stash`，然后切换到目的分支(git checkout 【target-branch】)，在目的分支`git stash pop`即可。这种方式最好理解，就是把改动先放到一个临时区域，让git先别管，到了正确的分支再拿出来。

+ 已提交到本地仓库

这种情况就要有reset了，用`git reset HEAD^`撤销最近一次提交，如果有多次提交的话，查找到对应提交id进行reset就行。git默认的是mixed模式，即撤销暂存区，保留工作区。这样你再切分支也还能把改动带过去。当然加--soft也可以，这样能保留暂存区和工作区。

+ 已push到远程仓库
如果很不幸你已经把误修改给push了，你需要用到revert命令，先用`git log`查找到你误提交的commitId，然后`git revert commitId`，产生一次逆向提交，来对冲掉之前的。之后再push到远程就可以了。
### git忽略不提交文件
+ 从未提交过的文件

这种最简单，直接把想忽略的文件加入`.gitignore`中忽略提交即可.

+ 已经推送（push）过的文件

已经推送（push）过的文件，想删除本地文件，并将删除这个操作更新到远程文件，
```js
git rm -r --cached .
git add .
git commit -m 'update .gitignore'
git push -u origin master
```

已经推送（push）过的文件，想从git远程库中删除，并在以后的提交中忽略，但是却还想在本地保留这个文件,可以使用

```js
$git rm --cached pages/index.wxml 
```
已经推送（push）过的文件，想在以后的提交时忽略此文件(即使本地对该文件修改过也不同提交新修改)，并且不删除git远程库中相应文件，可以使用
```js
$git update-index --assume-unchanged pages/index.wxml 
```
如果要忽略的是一个目录,则打开 git bash，cd到 目标目录下
```js
$git update-index --assume-unchanged $(git ls-files | tr '\n' ' ') 
```
### 提交分支代码
+ 在当前分支下，第一次push，
```js
git push --set-upstream origin [branch]
```
这样设置一次之后，后面就直接`git push`即可。
+ 不在当前分支下，
```js
//   git push <远程主机名> <本地分支名>:<远程分支名> 
git push origin feature_abc:feature_abc  
```
### 分支代码操作常用命令
+ 列出所有本地分支
```js
git branch
```
+ 列出所有远程分支
```js
git branch -r
```
+ 列出所有本地分支和远程分支
```js
git branch -a
```
+ 新建一个分支，但依然停留在当前分支
```js
git branch [branch-name]
```
 
+ 新建一个分支，并切换到该分支
```js
git checkout -b [branch]
```
 
+ 新建一个分支，与指定的远程分支建立追踪关系
```js
git branch --track [branch] [remote-branch]
```
 
+ 切换到指定分支，并更新工作区
```js
git checkout [branch-name]
```
+ 切换到上一个分支
```js
git checkout -
```
+ 合并指定分支到当前分支
```js
git merge [branch]
```
+ 删除分支
```js
git branch -d [branch-name]
```
+ 删除远程分支
```js
git push origin --delete [branch-name]
git branch -dr [remote/branch]
```
+ 拉取所有分支代码
```js
git fetch
```
### 最后
+ 这是一篇之前写的笔记，现在迁移了过来...
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/gzh/1571395642.png)