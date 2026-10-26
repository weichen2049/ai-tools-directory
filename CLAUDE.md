# 项目约定

## 目标与结构
- 本项目维护优质 AI 工具目录，一级分类为通用 AI 工具、AI 生图、AI 生视频。
- README.md 是当前公开目录入口；data/catalog.json 是分类与产品记录的唯一数据源。
- 当前只有分类骨架，tools 数组为空；不得编造已收录产品或评测结果。
- examples/imago/ 是上游固定版本源码，来源见 examples/imago.upstream.json。保留上游 LICENSE、版权及说明。
- 目录与生图示例分别维护；不把示例描述为本项目原创或已上线服务。

## 内容维护
- 每个产品记录包含 id、name、url、summary、primaryCategoryId、subcategoryIds、pricing、recommendation、verifiedAt。
- id 唯一；一个主分类，可有多个能力标签。免费、中文、开源属于筛选属性。
- 收录前核对官网、当前功能、价格与链接；不把营销声明当作实测。
- 添加产品时同步更新 README 展示，分类结构与 catalog.json 保持一致。

## 开发与发布
- 当前仅交付目录与源码，未安装、运行或验收 Imago 的生图、支付链路。
- 后续运行示例前先核对依赖、模型适配器及所需服务；不要直接视作可上线版本。
- 密钥存 Keychain，运行时注入；不写入代码、配置、Git 或日志。
- 本目录是独立 Git 仓库；Git 写操作前确认仓库根目录为本目录，不操作父仓库。
- 默认 main；后续 push 与部署必须按用户当次授权执行。
