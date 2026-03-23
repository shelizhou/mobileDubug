# mobileDubug

一个用于**移动端页面调试信息上报**的轻量示例工程：

- 浏览器端引入 `debug.js` 后，可通过 `MDebug(...)` 主动上报调试数据。
- `debug.js` 还会监听 `window.onerror`，自动上报 JS 运行时错误。
- Node 服务端（`server.js`）接收上报并打印在终端，便于本地联调定位问题。

## 项目结构

- `server.js`：Node HTTP 服务，负责静态资源托管与 `/sendDate` 接口。
- `debug.js`：前端调试 SDK，提供 `MDebug` 和 `MDebug.getES`，并监听 `window.onerror`。
- `index.html`：演示页面。

## 快速开始

> 运行环境：Node.js（建议 14+，旧版本也可运行）。

1. 启动服务（默认端口 `8089`）：

```bash
node server.js
```

或指定端口：

```bash
node server.js 9000
```

2. 终端会输出类似：

- `Server running at http://<你的IP>:8089/`
- `MDbugjs: <script data-debug='1' src='http://<你的IP>:8089/debug.js'></script>`

3. 在你的页面中引入脚本（`data-debug="1"` 必须保留）：

```html
<script data-debug="1" src="http://<你的IP>:8089/debug.js"></script>
```

4. 页面内主动上报：

```html
<script>
  MDebug({ page: 'home', userId: 'u001', msg: 'hello' });
  MDebug('simple message');
</script>
```

5. 触发错误或调用上报后，在启动 `server.js` 的终端中查看打印内容。

## API

### `MDebug(data, callback?, delaytime?)`

- `data`：任意值；若不是对象会作为 `__onlyValue__` 上报。
- `callback`：请求成功回调。
- `delaytime`：服务端延时返回时间（毫秒），用于模拟慢接口。

示例：

```js
MDebug({ a: 1, b: 'text' }, function (res) {
  console.log(res);
}, 2000);
```

### `MDebug.getES(ele, styleName?)`

读取元素信息并上报，包含：

- `height` / `width`
- `scrollLeft` / `scrollTop`（元素在页面中的坐标）
- `className`
- `style`（可选样式名对应值）

示例：

```js
MDebug.getES('id', 'background-color');
```

## 上报协议说明

前端通过 `POST /sendDate` 发送 `application/x-www-form-urlencoded` 数据，服务端解析后打印并返回文本 `none`。

## 注意事项

- `debug.js` 通过查找 `data-debug="1"` 的 `<script>` 标签来确定上报地址。
- 若页面存在跨域脚本错误，浏览器可能只给出 `Script error.`，堆栈信息受限。
- `server.js` 中读取本机 IP 的逻辑依赖 `en0` 网卡，某些系统/容器中可能需要调整。

## License

本仓库未显式声明 License，如需开源发布，建议补充 `LICENSE` 文件。
