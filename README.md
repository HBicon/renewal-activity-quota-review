# 门店换新活动参与次数限制

需求 ID：`REQ-20261110-001`

## 文档

- [产品需求文档](./prd.md)
- [评审与发布记录](./review-record.md)
- 评审入口：`index.html`

## 本地预览

在本目录启动静态服务：

```bash
python3 -m http.server 8801
```

访问：<http://127.0.0.1:8801/>

## 发布

仓库内已包含 `.github/workflows/pages.yml`，推送 `main` 后通过 GitHub Actions 部署 GitHub Pages。站点只包含静态文件，不连接真实活动、订单或退款系统。
