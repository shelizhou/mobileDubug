var HTTP = require("http"),
    PORT = process.argv[2] || 8089,
    QUERYSTRING = require('querystring'),
    URL = require("url"),
    PATH = require("path"),
    FS = require("fs"),
    OS = require('os'),
    // COLORS = require("colors/safe"), 	

    SERVER = HTTP.createServer(function(req, res) {
        // console.log(req);
        var pathname = __dirname + URL.parse(req.url).pathname;
        if (PATH.extname(pathname) == "") {
            pathname += "/";
        }
        if (pathname.charAt(pathname.length - 1) == "/") {
            pathname += "index.html";
        }
    	if (req.url != '/sendDate') {
	        PATH.exists(pathname, function(exists) {
	            if (exists) {
	                switch (PATH.extname(pathname)) {
	                    case ".html":
	                        res.writeHead(200, {
	                            "Content-Type": "text/html"
	                        });
	                        break;
	                    case ".htm":
	                        res.writeHead(200, {
	                            "Content-Type": "text/html"
	                        });
	                        break;
	                    case ".js":
	                        res.writeHead(200, {
	                            "Content-Type": "text/javascript"
	                        });
	                        break;
	                    case ".css":
	                        res.writeHead(200, {
	                            "Content-Type": "text/css"
	                        });
	                        break;
	                    case ".gif":
	                        res.writeHead(200, {
	                            "Content-Type": "image/gif"
	                        });
	                        break;
	                    case ".jpg":
	                        res.writeHead(200, {
	                            "Content-Type": "image/jpeg"
	                        });
	                        break;
	                    case ".png":
	                        res.writeHead(200, {
	                            "Content-Type": "image/png"
	                        });
	                        break;
	                    default:
	                        res.writeHead(200, {
	                            "Content-Type": "application/octet-stream"
	                        });
	                }

	                FS.readFile(pathname, function(err, data) {
	                    res.end(data);
	                });
	            } else {
	                res.writeHead(404, {
	                    "Content-Type": "text/html"
	                });
	                res.end("<h1>404 Not Found</h1>");
	            }
	        });
		}

    }).listen(PORT, "0.0.0.0");
 
SERVER.on('request', function(req, res) {
    // console.log(req);
    if (req.url == '/sendDate') {
        var info = '';
        req.addListener('data', function(chunk) {
            info += chunk;
        }).addListener('end', function() {
            info = QUERYSTRING.parse(info);
            // console.log( COLORS.green(JSON.stringify(info)) );
            console.log("-----------" + new Date() + "---------- say:");
            console.log(info);

            setTimeout(function(){
    		    res.end("none");
    		}, parseInt(info.__delaytime__) );
        });
        
    }

});

var IPv4;
for (var i = 0; i < OS.networkInterfaces().en0.length; i++) {
    if (OS.networkInterfaces().en0[i].family == 'IPv4') {
        IPv4 = OS.networkInterfaces().en0[i].address;
    }
}
console.log("Server running at http://" + IPv4 + ":" + PORT + "/");
console.log("MDbugjs: <script data-debug='1' src='http://" + IPv4 + ":" + PORT + "/debug.js'></script>");

