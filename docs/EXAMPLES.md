# 双面字示例 / Dual-view examples

[在线体验 / Live demo](https://yueb1ng.github.io/zibian/) · [STL 样品 / Sample STL](../frontend/prototype-v2/public/demo.stl) · [导出说明 / Export guide](STL导出.md)

以下为浏览器中的 **Arimo 开源版网格渲染**，不是实物照片。两个方向显示同一个 LOVE / HOME 模型。

These are browser renders of the open Arimo edition, not physical-print photographs. Both views show the same LOVE / HOME mesh.

| 第一面 / Front | 第二面 / Side |
| --- | --- |
| ![LOVE front view](front.png) | ![HOME side view](side.png) |

## 复现 / Reproduce

1. 打开在线体验或按 README 启动本机网站 / Open the demo or start locally using the README
2. 保留 LOVE 与 HOME，点击「看另一面」对准两面 / Keep LOVE and HOME and align both faces
3. 点击「导出 STL」，在切片器中按毫米导入 / Export STL and import as millimetres in your slicer

样品在 `frontend/prototype-v2/public/demo.stl`。[元数据](sample-model.json) 和 [几何检查](geometry-checks.json) 记录尺寸、三角面与连通性。

The sample is in `frontend/prototype-v2/public/demo.stl`. Metadata and geometry reports record dimensions, triangle counts and connectivity.

| 示例 / Example | 预期 / Expected result |
| --- | --- |
| LOVE / HOME | 默认样品约 140.33 × 142.86 × 32.80 mm，3,836 个三角面 / Default sample, 3,836 triangles |
| MARS / HOME | 修改后导出 `zibian_MARS_HOME.stl`，网格随输入变化 / Editing changes the exported mesh |
| A&/B / 2026 | 文件名 `zibian_AANDSLASHB_2026.stl` / Filename normalizes special characters |
| 中文 / HOME | 不支持的字形会报错，不下载旧模型 / Unsupported glyphs are rejected without stale exports |

## 样品与打印 / Sample and printing

日常使用无需 Python 或 OpenSCAD。开发者安装前端依赖后，可从根目录重新生成样品：

Python and OpenSCAD are not required for normal use. After installing frontend dependencies, regenerate the default sample from the repository root:

```sh
node scripts/generate_sample.mjs
```

命令更新样品与元数据，耗时随机器变化。STL 没有单位和颜色，按毫米导入，检查底座接触、分离笔画、支撑与尺寸后切片。网格封闭和单连通不代表真实打印已验收。

This updates the sample and metadata; timing varies. STL has no unit or colour metadata. Check millimetres, base contact, disconnected strokes, supports and size before slicing. Watertight connected geometry is not proof of a successful print.

## 在线版范围 / Demo scope

在线版从本仓库通过 GitHub Pages 构建，字形与生成逻辑和源码一致，独立于早期 Tahoma 体验版。价格、地址、支付与订单是流程演示，没有真实交易。模型在浏览器计算，页面加载仍需网络获取静态资源。

The demo is built from this repository on GitHub Pages with the same open glyph bank and generation code. It is separate from the earlier Tahoma preview. Price, address, payment and order flows have no real transactions. Geometry runs locally after static assets load over the network.
