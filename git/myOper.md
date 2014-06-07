# 我的git操作

# branch

```
git help branch     --->    帮助
git branch      --->    显示本地的分支
git branch -r   --->    显示远程的分支
git branch -a   --->    显示本地和远程的所有分支
git branch myLocalBranchName    --->    创建本地分支
git branch -d | -D branchName    --->    删除分支
git branch -d -r branchName    --->    删除远程的分支
git branch -m | -M oldbranch newbranch --->
     重命名分支，如果newbranch名字分支已经存在，则需要使用-M强制重命名，否则，使用-m进行重命名。
```

# remote

```
git remote      --->    列出已经存在的远程分支
git remote -v | --verbose  --->    列出详细信息，在每一个名字后面列出其远程url
    需要注意的是，如果有子命令，-v | --verbose需要放在git remote与子命令中间。
git remote add name url     --->    在url创建名字为name的仓库
git remote show name --->    
    必须要带name，否则git remote show的作用就是git remote，给出remote name的信息。
```

# pull

```
git pull upStream master
```

# push

```
git push <repository> <refspec>
    <repository>是远程仓库，是push操作的目的地，<repository>可以是一个URL，也可以是远程仓库的名字。
    <refspec>的格式是：+src：dst，其中“+”是可选的，src是想要push的分支的名字，dst是用push更新的远程端的ref的名字。使用空的<src>进行更新会删除远程仓库中的内容。

git push origin master
```