import CrxDownloader from "./crx-download.js";
import Awesome from "../dynamic/awesome.js";
export default (function () {
    let e = {},
        t = {
            "download-crx": {
                icon: "♥",
                text: "插件下载分享",
                onClick: function (e, t) {
                    CrxDownloader.downloadCrx(t)
                }
            },
            "fehelper-setting": {
                icon: "❂",
                text: "FeHelper设置",
                onClick: function (e, t) {
                    chrome.runtime.openOptionsPage()
                }
            }
        },
        n = (t, n) => {
            n && n.forEach && n.forEach(n => {
                chrome.contextMenus.create({
                    title: n.icon + "  " + n.text,
                    contexts: n.contexts || ["all"],
                    parentId: e.contextMenuId,
                    onclick: n.onClick || function (e, n) {
                        chrome.DynamicToolRunner({
                            query: `tool=${t}`
                        })
                    }
                })
            })
        },
        o = function () {
            chrome.contextMenus.create({
                type: "separator",
                parentId: e.contextMenuId
            })
        },
        r = function () {
            e.contextMenuId && (chrome.contextMenus.remove(e.contextMenuId), e.contextMenuId = null)
        };
    return {
        manage: function (c) {
            c.getOptions(c => {
                "false" !== String(c.OPT_ITEM_CONTEXTMENUS) ? function () {
                    r(), e.contextMenuId = chrome.contextMenus.create({
                        title: "FeHelper",
                        contexts: ["page", "selection", "editable", "link", "image"],
                        documentUrlPatterns: ["http://*/*", "https://*/*", "file://*/*"]
                    }), Awesome.getInstalledTools().then(e => {
                        let t = Object.keys(e).filter(t => e[t].installed && e[t].menu),
                            r = t.filter(t => "devtools" !== t && !e[t].hasOwnProperty(
                                "_devTool")),
                            c = t.filter(t => "devtools" === t || e[t].hasOwnProperty(
                                "_devTool"));
                        r.forEach(t => n(t, e[t].menuConfig)), c.length && o(), c.forEach(t =>
                            n(t, e[t].menuConfig))
                    });
                    let c = ["download-crx", "fehelper-setting"],
                        l = c.map(e => Awesome.menuMgr(e, "get"));
                    Promise.all(l).then(e => {
                        "1" === String(e[0]) || String(e[1]), o(), "1" === String(e[0]) &&
                            n(c[0], [t[c[0]]]), "0" !== String(e[1]) && n(c[1], [t[c[1]]])
                    })
                }() : r()
            })
        }
    }
}());