# Zihan Zhu Portfolio

这是用于 GitHub + Cloudflare Pages 的完整源码部署包，整理于 2026-10-08。
网站内容、图片、视频、论文附件和动效与原作品集一致。

## 文件内容

```text
.
├── .gitignore          Git 忽略规则
├── .nvmrc              Node.js 22 版本配置
├── README.md           本说明
├── index.html          页面入口
├── package.json        依赖与构建命令
├── package-lock.json   固定依赖版本
├── vite.config.js      Vite 配置
├── src/                React 源码、内容、样式和资源清单
└── public/             头像、视频、项目图片、论文与海报
```

不包含 `node_modules/`、`dist/`、`.git/`、测试截图、登录配置、CV、成绩单、推荐信或其他申请材料。项目页使用的论文和海报附件已包含在 `public/assets/evidence/` 中，不需要另外提供原始申请文件夹。

## 创建 GitHub 仓库

1. 打开 [创建仓库页面](https://github.com/new)，确认账号为 `charzzh9`。
2. 仓库名称建议为 `zihan-portfolio`；若已被占用，可以换一个名称。
3. 建议先选择 **Private**。私有源码仓库仍可用于 Cloudflare 部署，但网站发布后是否公开是另一项设置。
4. 保持仓库为空，不额外生成 README、`.gitignore` 或 License。
5. 创建后，选择 **uploading an existing file**，或 **Add file > Upload files**。
6. 上传本文件夹里面的所有内容，保持 `src/`、`public/` 的目录结构；不要把外层 `zihan-portfolio-github/` 作为一级目录上传。
7. 提交到 `main` 分支。

macOS Finder 中按 `Command + Shift + .` 可以显示 `.gitignore` 和 `.nvmrc`，上传时不要漏掉它们。
如果网页拖拽漏掉了隐藏文件，可以在 GitHub 使用 **Add file > Create new file**，分别按这两个文件的原名和内容补齐。

上传完成后，仓库首页应直接显示 `package.json`、`index.html`、`src/` 和 `public/`。
不要只上传 ZIP 文件；Cloudflare 不会自动把仓库里的 ZIP 当作源码解压构建。

[GitHub 官方上传说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## Cloudflare Pages 配置

后续创建 **Pages** 项目，选择 **Connect to Git**，不要选择 Direct Upload，也不要误建为需要后台入口的 Worker。
为 Cloudflare GitHub App 授权时，选择 **Only select repositories**，只授权这个作品集仓库。

| 配置项 | 填写内容 |
| --- | --- |
| 仓库 | 你创建的作品集仓库 |
| 生产分支 | `main` |
| 框架 | Vite；也可手动填写下方构建配置 |
| 根目录 | 留空，使用仓库根目录 |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| Node.js | `.nvmrc` 中指定的 `22` |

Cloudflare 会安装依赖并生成 `dist/`，因此不需要把本地 `node_modules/` 或 `dist/` 上传到 GitHub。
连接成功后，向生产分支提交更新将触发自动构建部署。

[Cloudflare Git 集成说明](https://developers.cloudflare.com/pages/get-started/git-integration/)
[Cloudflare 构建版本配置](https://developers.cloudflare.com/pages/configuration/build-image/)

## 本地预览与更新

使用 Node.js 22.12 或更高的 Node 22 版本，在本文件夹内执行：

```sh
npm ci
npm run dev
```

正式构建检查：

```sh
npm run build
npm run preview
```

部署包是整理时的独立副本，后续修改原预览目录不会自动同步到这个文件夹或 GitHub。
后续应以连接到 Cloudflare 的 GitHub 仓库为部署来源，并将修改提交到该仓库。

## 公开发布前确认

- 确认论文、团队海报、决赛材料和照片允许公开分享，尤其是尚未正式发表的研究材料。
- 检查联系方式及外部主页链接。
- 确认网站无需登录即可供招生老师访问，并测试目标地区的实际访问情况。

截至本部署包整理完成，仅准备本地文件，尚未创建远程 GitHub 仓库或发布网站。
