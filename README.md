# 字变 Zi Bian

把两组文字变成一件双面立体字摆件。在浏览器里生成、拖动查看、正对两面，并导出可供切片的 STL。

React + Three.js + Motion + Manifold WebAssembly。所有几何计算在浏览器本地完成，不需要生成服务器，不依赖聊天工具或某个托管平台。

![字变 Web 界面](docs/preview.png)

## 本地运行

需要 Node.js 22.12 或更新的受支持版本。

```sh
cd frontend
npm ci
npm run dev:studio
```

打开终端显示的地址，默认 http://127.0.0.1:8877 。若端口占用，可追加 `-- --port 8878`。

```sh
npm run build:studio
npm run preview:studio
```

构建输出为 `frontend/prototype-v2/dist`，可部署到普通静态网站服务。不要直接双击 HTML；Worker、JS 和 WASM 通过 HTTP 加载，公开访问推荐 HTTPS。

## 使用

- 每面支持 1–12 位 A–Z、0–9、&、/，点击下方文字即可修改
- 「预览摆件」打开大图；「看另一面」依次正对两面
- 拖动时靠近读字角度有轻微阻力，松手回到当前选定视角
- 「导出 STL」下载当前文字的原始网格；改字后会先生成，失败不会误下载旧模型
- 完整矩形底座；显示缩放、拖动和旋转不改变实物尺寸

STL 按毫米生成，不保存颜色或单位元数据，切片器导入时按毫米处理。打印前检查独立笔画、连接、尺寸、朝向和支撑。详见 [导出说明](docs/STL导出.md)。

当前价格、收货地址、支付与订单是流程演示，没有真实支付和订单后端。

## 字体与原版差异

开源 Web 版默认使用 **Arimo Regular（SIL OFL 1.1）**，随源码附带字体、许可和生成后的字形库，下载后可直接构建。完整字符轮廓由 OpenSCAD 生成，单字完整高度归一化到 100，再按摆件参数缩放。字形向底座嵌入 0.2 mm，让圆弧底部形成实际连接，避免只在一个点上相切。

此前私人工作区 / 体验版使用 Tahoma。两者的字形、尺寸和排版存在差异；此仓库不宣称与 Tahoma 版本逐顶点相同，也没有包含 Tahoma 字体或字形库。原页面已确认的外观没有被此次开源整理替换。

`original/字变.py` 是项目所有者提供并确认自有的原始算法，原有 Mc_Fly / POV nametag 署名和来源链接完整保留。Web 排布算法保留正交文字交集和矩形底座的生成方式。

## 重新生成字形

日常运行无需 Python 或 OpenSCAD。只在修改字体转换流程时需要它们：

```sh
python -m pip install -r requirements-glyphs.txt
python scripts/export_glyphs.py --openscad /path/to/openscad
node scripts/generate_sample.mjs
```

Windows 可传入 OpenSCAD 的 `.com` 可执行文件。字形、样例和字体缓存都写入项目内。替换字体前确认其许可并重新检查所有文字轮廓和几何，不直接沿用另一字体的字宽表。

## 检查

先在 frontend 安装依赖，再从根目录执行：

```sh
node tests/geometry.mjs
node tests/stl-export.mjs http://127.0.0.1:8877/
```

浏览器测试需要保持本地服务运行；可在 frontend 执行 `npx playwright install chromium`，或通过 `BROWSER_PATH` 指定 Chrome / Edge。Windows 默认使用已安装的 Edge。测试报告和样例下载写在本项目内。

## 范围与许可

这是首个开源 Web 版本。微信小程序、Android / iOS 原生工程后续单独整理；当前不代表已上架、真机保存和实物打印验证完成。

项目代码采用 [MIT](LICENSE)。Arimo 字体及转换字形数据采用 [OFL-1.1](assets/fonts/OFL.txt)，第三方依赖保留原许可，见 [许可范围](LICENSE-STATUS.md)。
