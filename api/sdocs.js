const fs = require('fs');
const mime = require("mime");
const marked = require('marked');

module.exports = (req, res) => {

    let vd = {
        path: req.url.substr(1).split('?')[0].trim(),
        dc: {
            coverpage: "",
            sidebar: "",
            navbar: "",
            index: "",
            body: "",
            output: ""
        },
        init: function () {

            vd.dc.coverpage = vd.replaceMdLink(vd.render(vd.read("_coverpage.md", 'utf-8') || ""));
            vd.dc.sidebar = vd.replaceMdLink(vd.render(vd.read("_sidebar.md", 'utf-8') || ""));
            vd.dc.navbar = vd.replaceMdLink(vd.render(vd.read("_navbar.md", 'utf-8') || ""));
            vd.dc.index = vd.read("index.html", 'utf-8') || "";

            let nc = false,
                ua = req.headers["user-agent"].toLowerCase(),
                //文件名
                filename = vd.path.split('/').pop().toLowerCase(),
                //爬虫
                isbot = ["bot", "spider", "daum", "curl", "postman"].filter(key => ua.indexOf(key) > -1).length > 0;

            if (filename == "" || filename == "index" || filename == "index.html") {
                nc = true;
                vd.path = "index.html";
                vd.dc.body = vd.replaceMdLink(vd.render(vd.read('README.md', 'utf-8') || ""));
                vd.dc.ctype = 'text/html; charset=utf-8';
            }

            let hp = function () {
                let tpath = vd.path, tbody = vd.read(tpath);

                if (tbody != null) {
                    vd.dc.output = tbody;
                } else {
                    tpath = vd.path + ".html";
                    tbody = vd.read(tpath, 'utf-8');
                    if (tbody != null) {
                        nc = true;
                        vd.path = tpath;
                        vd.dc.body = tbody;
                        vd.dc.ctype = 'text/html; charset=utf-8';
                    } else {
                        tpath = vd.path + ".md";
                        tbody = vd.read(tpath, 'utf-8');
                        if (tbody != null) {
                            nc = true;
                            vd.path = tpath;
                            vd.dc.body = vd.replaceMdLink(vd.render(tbody));
                            vd.dc.ctype = 'text/html; charset=utf-8';
                        }
                    }
                }
            }

            if (isbot) {
                nc = true;
                hp();
            } else {
                vd.dc.output = vd.read(vd.path);
                if (vd.dc.output == null) {
                    hp();
                }
            }

            if (nc) {
                vd.dc.output = vd.dc.index.replace("{SEO}", vd.dc.coverpage + vd.dc.navbar + vd.dc.sidebar + vd.dc.body);
            }

            res.setHeader('content-type', vd.dc.ctype || mime.getType(vd.path));
            //输出
            res.send(vd.dc.output);
        },

        /**
         * 读取文件内容
         * @param {any} path
         * @param {any} ec
         */
        read: function (path, ec) {
            try {
                return fs.readFileSync(path, ec);
            } catch (e) {
                return null;
            }
        },

        /**
         * 解析Markdown
         * @param {any} markdown
         */
        render: function (markdown) {
            return marked(markdown);
        },

        /**
         * 替换Markdown链接
         * @param {any} html
         */
        replaceMdLink: function (html) {
            return html.replace(/href="(.*.md)"/g, function (a) {
                return a.replace('.md"', '"');
            });
        }
    }

    vd.init();
}