import MSG_TYPE from "../static/js/common.js";
export default (function () {
    let e = function (e, t, r) {
        var o, c;
        o = (() => {
            let r =
                "https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id=" +
                e + "%26uc&prodversion=" + navigator.userAgent.split("Chrome/")[1].split(" ")[0];
            if (chrome.downloads) chrome.downloads.download({
                url: r,
                filename: t || e,
                conflictAction: "overwrite",
                saveAs: !0
            }, function (e) {
                chrome.runtime.lastError && alert("抱歉，下载失败！错误信息：" + chrome.runtime.lastError.message)
            });
            else {
                let o = document.createElement("a");
                o.href = r, o.download = t || e + ".crx", (document.body || document.documentElement).appendChild(
                    o), o.click(), o.remove()
            }
        }), c = (() => {
            r ? r() : alert("抱歉，下载失败！")
        }), Promise.race([fetch("https://clients2.google.com/service/update2/crx"), new Promise(function (e,
            t) {
            setTimeout(() => t(new Error("request timeout")), 2e3)
        })]).then(e => {
            o && o()
        }).catch(() => {
            c && c()
        })
    };
    return {
        downloadCrx: function (t) {
            if (0 === t.url.indexOf("https://chrome.google.com/webstore/detail/")) r = (() => {
                alert("下载失败，可能是当前网络无法访问Google站点！")
            }), chrome.tabs.query({
                active: !0,
                currentWindow: !0
            }, function (t) {
                let o = t[0],
                    c = o.url.split("/")[6].split("?")[0],
                    n = o.title.split(" - Chrome")[0] + ".crx";
                n = n.replace(/[&\/\\:"*<>|?]/g, ""), e(c, n, r)
            });
            else if (confirm("下载最新版【FeHelper.JSON】并分享给其他小伙伴儿，走你~~~")) {
                let t = MSG_TYPE.STABLE_EXTENSION_ID,
                    r = chrome.runtime.getManifest().name + "-latestVersion.crx";
                e(t, r, () => {
                    chrome.tabs.create({
                        url: MSG_TYPE.DOWNLOAD_FROM_GITHUB
                    })
                })
            }
            var r
        }
    }
}());