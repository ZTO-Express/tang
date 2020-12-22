# Tang 贡献指南

Hi，你好！非常感谢你有兴趣为 Tang 的发展作出贡献。在提交你的贡献之前，请务必花点时间阅读下面的贡献指南。

## Issue 创建指南

Issue 一般分为 Bug 修复和新功能需求，如果是新功能

## 分支说明

目前项目主要包含如下 4 类分支：

| 分支类型 | 分支描述     | 分支命名规范           |
| :------- | :----------- | :--------------------- |
| master   | 稳定发布分支 | master                 |
| develop  | 开发分支     | develop                |
| hotfix   | 热修复分支   | hotfix/[issue#number]  |
| feature  | 功能分支     | feature/[issue#number] |

其中 master 和 develop 为长期分支，feature 和 hotfix 为短期分支。

- 开发时，我们从当前的 develop 分支签出代码(我们推荐一次提交对应一个 issue，团队外成员可以先 fork 项目)。
- 根据 issue 的特点将分支命名为 feature/[issue#number]或者 hotfix/[issue#number]。
- 完成工作后提交合并请求(提交前先 pull develop 分支以检查是否存在冲突)。
- 完成合并请求后短期分支将会被删除。

_TBD: 是否需要 release 分支，bugfix 分支。_

_TBD: 提交合并时，使用 rebase 还是 merge。[git rebase vs merge](https://zhuanlan.zhihu.com/p/103084402)_

## Pull Request 约定

在初期我们希望提 Pull Request 的流程尽量简洁，同时便于协作。下面是 Pull Request 的简单约定：

- master 是最新的稳定版本的发布分支的快照。开发人员应当在自己的专有的分支上完成开发，不要直接提交 PR 到 master 分支。
- 尽量一次提交对应一个 issue 或者 feature。
- 保证从哪个分支签出的代码，合并的时候合并回同一个分支。
- 不要提交临时文件或本地开发环境文件（如：dist, .vscode 等）。
- 提交代码之前，请确保通过所有单元测试。
- 如果添加了新的功能：
  - 如果可以，请尽量提供相应的单元测试
  - 提供有说服力的原因说明为什么需要此功能。最好可以先提一个 issue，等认可后再开始进行开发。
- 如果修复了一个 bug:
  - 如果你正在解决一个 bug，在你的 PR 标题开始新增 fix(#xxx, [#xxxx])以方便生成更好的发布日志。（如：fix(#3): PR 以及 COMMIT 规范）。
  - 在 PR 中提交详细的 bug 描述，最好能有截图，如果有动图最完美了。
  - 如果可以，请提交对应的测试用例覆盖此次修改，已确保在后期的迭代中不会对此修改照成影响。

## Commit 约定

此提交规范参考了由 **[Angluar 团队 Commit 规范](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)** 衍生的 **[Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)**。

长话短说，提交消息必须满足如下正则：

```
/^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types)(\(.+\))?: .{1,50}/
```

实例 1: 常用提交消息，包含任务编号

```
feat(#224): 新增vue代码生成功能
```

实例 2: 常用提交消息，包含范围说明

```
feat(vue): 新增vue typescript请求接口生成
```

实例 3: 完整的提交消息

```
feat(vue): 新增vue代码生成功能

vue typescript api请求接口生成插件，接收通过tang插件框架获取的接口文档描述，转换为typescript请求接口。

BREAKING CHANGE: 兼容vscode扩展，所有接口实现支持promise调用。

修正 #234, #345, 关闭 #123
```

**完整的消息格式**

一个提交消息包含消息头，消息体和脚注。消息头包含类型、范围和主题：

```
<类型>[(issue编号或范围说明（可选）)]: <主题>

[消息体（可选）]

[脚注（可选）]

```

消息头是必须的，但头部的编号或范围说明是可选的。消息体和脚注都是可选的。

**消息类型**

提交类型一般有一下几种，可根据需求进行扩展

- WIP 工作中的提交（此提交一般不能进行 PR，功能完成后修改成其他类型或 squash 后再进行提交合并）
- feat 新功能(feature)
- fix 修补 bug
- docs 文档
- test 测试
- chore 杂项 （构建工具、辅助工具的变动）
- refactor 重构（代码优化，不影响功能）
- style 代码风格调整（不影响代码功能）
- perf 性能优化
- revert 撤销提交
  - 回滚的提交需要以 revert: 开头，后面跟随回滚提交的头。在消息体中，描述为："此提交回滚了\<hash>"，\<hash>为回滚的提交的 hash 值。

**issue 编号或范围说明**

主要用于表示修改代码的位置范围或关联 issue 编号。提倡使用关联 issue 编号，以方便生成 changelog 时关联 issue 的链接，方便问题的跟踪。但这不是强制的，你也可以在这里提供此次修改的范围，比如: component, utils, build 等等。

**标题**

标题包含此次提交说明的简明描述，一般不要超过 50 个字。

- 使用简明、扼要、确定的表达，表明此次修改的完整性和确定性。
- 不需要在结尾加句号（本质上这是个标题）

**消息体**

类似标题，使用简明、扼要、确定的表达。消息体应当包含此次提交的原因，以及和之前版本的差异。

**脚注**

如果有破坏性的调整，应当在脚注中说明，并注明影响范围。如果完成的 issue 的修正，脚注还应包含修正或关闭的 issue 编号。

破坏性的修改，应当在脚注中以"BREAKING CHANGE:"为开头，接下的的一个空格后面的描述即为破坏性修改的描述。
