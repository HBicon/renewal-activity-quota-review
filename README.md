# 门店换新活动参与次数限制

需求 ID：`REQ-20261110-001`

当前版本：`PRD v1.0`，包含日/自然周/月三周期次数按需配置、门店总量留空时柜机/App 入口独立执行、9 项次数至少填写 1 项、旧版 CSV 兼容、活跃规则活动唯一占用、冻结与已参与合并计数、执行中初始化、参与详情和订单明细。

## 文档

- [产品需求文档](./prd.md)
- [评审与发布记录](./review-record.md)
- [配置菜单交互原型](./prototype/index.html)
- 评审入口：`index.html`

## 本地预览

在本目录启动静态服务：

```bash
python3 -m http.server 8807
```

访问：<http://127.0.0.1:8807/>

## 发布

仓库内已包含 `.github/workflows/pages.yml`，推送 `main` 后通过 GitHub Actions 部署 GitHub Pages。站点只包含静态文件，不连接真实活动、订单或退款系统。
