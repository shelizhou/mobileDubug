# 移动端的调试输出

## 如何使用
- 启动server.js

	```
		node server.js
	```

- 启动成功后将会看到控制台输出 MDbug的脚本引用

	```
		MDbugjs: <script data-debug='1' src='http://10.200.193.131:8089/dubug.js'></script>
	```

   复制到你要调试的运行环境中
   
- 调用

	```
		MDebug([1,2,3,4]);
	```

   控制台会出现这样结果:

   ```
		-----------Thu Dec 11 2014 16:09:41 GMT+0800 (CST)---------- say:
		{ __onlyValue__: '1,2,3,4  --->Array', __delaytime__: '0' }
   ```

## 接口

- MDebug(data, fn, delaytime)
	- data: 要传的值，可以是js任何类型的变量 --必参
	- fn: 回调，返回成功后执行 
	- delaytime: 延时多久时间后才返回，单位毫秒 
	

- MDebug.getES(ele, styleName)
	- ele: 元素ID、或原生dom对象、或jquery对象 --必参
	- styleName: 元素的css属性 