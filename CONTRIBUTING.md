# 参与贡献 / Contributing

欢迎可复现的问题、文档修正、字形和 STL 导出改进。先搜索已有 Issue 和 PR；较大的模型算法或功能变更先开 Issue 对齐范围。

Reproducible reports, documentation fixes, glyph and STL export improvements are welcome. Search existing issues and PRs; discuss larger geometry or feature changes first.

## 本机检查 / Local checks

```sh
cd frontend
npm ci
npm run build:studio
cd ..
node tests/geometry.mjs
```

浏览器导出回归需在另一终端运行 `npm run dev:studio`，再从根目录执行：

For browser export regression, keep the dev server running in another terminal, then run from the repository root:

```sh
node tests/stl-export.mjs http://127.0.0.1:8877/
```

在 frontend 运行 `npx playwright install chromium`，或通过 `BROWSER_PATH` 指定浏览器。文档修正无需重新安装 Python 或 OpenSCAD。

Install Chromium through Playwright inside frontend, or set BROWSER_PATH to an existing browser. Documentation fixes do not require Python or OpenSCAD.

## 几何问题 / Geometry reports

提供两面文字、浏览器版本、下载文件名、预期方向与截图。说明发生在预览、生成、下载、切片还是打印；显示旋转不能证明实物尺寸。

Include both words, browser/version, exported filename, expected direction and a screenshot. Distinguish preview, generation, download, slicing and printing. Display rotation does not establish physical dimensions.

## 提交说明 / Pull requests

遵循 [项目约定](AGENTS.md)，同步中英文 README，保留已认可的几何与交互。MIT 代码与 OFL 字体分别保留许可，不引入 Tahoma 字体或字形。

Follow project conventions and update both README languages. Preserve approved geometry and interaction. Keep MIT code and OFL font licensing separate; do not add Tahoma assets.

说明具体触发条件、改动结果与实际执行的检查。网格通过不代表实际打印成功，真机和打印验收只写有证据的结果。

Describe the trigger, result and checks performed. Passing geometry checks does not establish successful physical printing.
