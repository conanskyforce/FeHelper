import MSG_TYPE from "../static/js/common.js";
import Settings from "../options/settings.js";
import Menu from "./menu.js";
import Awesome from "../dynamic/awesome.js";
let BgPageInstance = function () {
    let FeJson = {
            notifyTimeoutId: -1
        },
        blacklist = [/^https:\/\/chrome\.google\.com/],
        notifyText = function (e) {
            let t = "FeJson-notify-id";
            if (clearTimeout(FeJson.notifyTimeoutId), e.closeImmediately) return chrome.notifications.clear(t);
            e.icon || (e.icon = "static/img/fe-48.png"), e.title || (e.title = "温馨提示"), chrome.notifications.create(
                t, {
                    type: "basic",
                    title: e.title,
                    iconUrl: chrome.runtime.getURL(e.icon),
                    message: e.message
                }), FeJson.notifyTimeoutId = setTimeout(() => {
                chrome.notifications.clear(t)
            }, parseInt(e.autoClose || 3e3, 10))
        },
        injectScriptIfTabExists = function (e, t, n) {
            chrome.tabs.query({
                currentWindow: !0
            }, o => {
                o.some(o => o.id === e && (Settings.getOptions(o => {
                    t.code = "try{" + t.code + "}catch(e){};", t.hasOwnProperty("allFrames") ||
                        (t.allFrames = "true" === String(o.CONTENT_SCRIPT_ALLOW_ALL_FRAMES)),
                        chrome.tabs.executeScript(e, t, function () {
                            n && n.apply(this, arguments)
                        })
                }), !0))
            })
        };
    chrome.DynamicToolRunner = async function (e) {
        let t = e.tool || MSG_TYPE.DYNAMIC_TOOL,
            n = e.withContent,
            o = e.query,
            i = null;
        if (e.noPage) return t = new URL(`http://f.h?${o}`).searchParams.get("tool").replace(/-/g, ""),
            void chrome.tabs.query({
                active: !0,
                currentWindow: !0
            }, e => {
                e.some(e => {
                    if (/^(http(s)?|file):\/\//.test(e.url) && blacklist.every(t => !t.test(
                            e.url))) {
                        let n =
                            `window['${t}NoPage'] && window['${t}NoPage'](${JSON.stringify(e)});`;
                        return injectScriptIfTabExists(e.id, {
                            code: n
                        }), !0
                    }
                    return !1
                }) || notifyText({
                    message: "抱歉，此工具无法在当前页面使用！"
                })
            });
        let r = function (e, t) {
            return function (n) {
                setTimeout(function () {
                    chrome.tabs.query({
                        active: !0,
                        currentWindow: !0
                    }, o => {
                        o && o.length && chrome.tabs.sendMessage(n.id, {
                            type: MSG_TYPE.TAB_CREATED_OR_UPDATED,
                            content: t,
                            event: e,
                            fromTab: i
                        })
                    })
                }, 300)
            }
        };
        if (t === MSG_TYPE.JSON_FORMAT) {
            await Awesome.detectInstall(t, !1, !0) && (t = MSG_TYPE.DYNAMIC_TOOL, o = "tool=json-format")
        }
        chrome.tabs.query({
            currentWindow: !0
        }, function (e) {
            i = e.filter(e => e.active)[0], Settings.getOptions(i => {
                let s, c = !1;
                if ("true" === String(i.FORBID_OPEN_IN_NEW_TAB)) {
                    let n = new RegExp("^chrome.*\\/" + t + "\\/index.html" + (o ? "\\?" +
                        o : "") + "$", "i");
                    for (let t = 0, o = e.length; t < o; t++)
                        if (n.test(e[t].url)) {
                            c = !0, s = e[t].id;
                            break
                        }
                }
                c ? chrome.tabs.update(s, {
                    highlighted: !0
                }, r(t, n)) : chrome.tabs.create({
                    url: `/${t}/index.html${o?"?"+o:""}`,
                    active: !0
                }, r(t, n))
            })
        })
    };
    let _animateTips = e => {
            setTimeout(() => {
                chrome.browserAction.setBadgeText({
                    text: e
                }), setTimeout(() => {
                    chrome.browserAction.setBadgeText({
                        text: ""
                    })
                }, 2e3)
            }, 3e3)
        },
        browserActionClickedHandler = function (e, t, n) {
            chrome.DynamicToolRunner({
                tool: MSG_TYPE.JSON_FORMAT
            })
        },
        _updateBrowserAction = function (e, t, n) {
            if (n ? Menu.manage(Settings) : (Awesome.getInstalledTools().then(e => {
                    Object.keys(e).length ? chrome.browserAction.setPopup({
                        popup: "/popup/index.html"
                    }) : (chrome.browserAction.setPopup({
                            popup: ""
                        }), chrome.browserAction.onClicked.hasListener(browserActionClickedHandler) ||
                        chrome.browserAction.onClicked.addListener(browserActionClickedHandler))
                }), _animateTips("offload" === e ? "-1" : "+1")), t) {
                let t = "";
                switch (e) {
                    case "install":
                        t = "工具已「安装」成功，并已添加到弹出下拉列表，点击FeHelper图标可正常使用！";
                        break;
                    case "upgrade":
                        t = "工具已「更新」成功，点击FeHelper图标可正常使用！";
                        break;
                    case "offload":
                        t = "工具已「卸载」成功，并已从弹出下拉列表中移除！";
                        break;
                    case "menu-install":
                        t = "已将此工具快捷方式加入到「右键菜单」中！";
                        break;
                    case "menu-offload":
                        t = "已将此工具快捷方式从「右键菜单」中移除！";
                        break;
                    default:
                        t = "恭喜，操作成功！"
                }
                notifyText({
                    message: t,
                    autoClose: 2500
                })
            }
        },
        _captureVisibleTab = function (e) {
            chrome.tabs.captureVisibleTab(null, {
                format: "png",
                quality: 100
            }, t => {
                e && e(t)
            })
        },
        _injectContentScripts = function (e) {
            let t = (e, t) =>
                `window['${e.replace(/-/g,"")}ContentScriptCssInject']=()=>{let style=document.createElement('style');\n                    style.textContent=unescape('${escape(t)}');document.head.appendChild(style);}`;
            Settings.getOptions(n => {
                n.JSON_PAGE_FORMAT && "false" !== String(n.JSON_PAGE_FORMAT) && (Awesome.getContentScript(
                    "json-format", !0).then(n => {
                    n && n.length ? injectScriptIfTabExists(e, {
                        code: t("json-format", n)
                    }) : fetch("../json-format/content-script.css").then(e => e.text()).then(
                        n => {
                            injectScriptIfTabExists(e, {
                                code: t("json-format", n)
                            })
                        })
                }), Awesome.getContentScript("json-format").then(t => {
                    let n =
                        "window.JsonAutoFormat && window.JsonAutoFormat.format({JSON_PAGE_FORMAT: true});";
                    t ? injectScriptIfTabExists(e, {
                        code: `${t};${n}`
                    }) : fetch("../json-format/content-script.js").then(e => e.text()).then(
                        t => {
                            injectScriptIfTabExists(e, {
                                code: `${t};${n}`
                            })
                        })
                }))
            }), Awesome.getInstalledTools().then(n => {
                let o = Object.keys(n).filter(e => "json-format" !== e && n[e].contentScript),
                    i = o.map(e => Awesome.getContentScript(e, !0));
                Promise.all(i).then(n => {
                    let i = [];
                    n.forEach((e, n) => {
                        e && e.length && i.push(t(o[n], e))
                    }), injectScriptIfTabExists(e, {
                        code: i.join(";")
                    })
                });
                let r = o.map(e => Awesome.getContentScript(e));
                Promise.all(r).then(t => {
                    let n = [];
                    t.forEach((e, t) => {
                        let i = `window['${o[t].replace(/-/g,"")}ContentScript']`;
                        n.push(`(()=>{ ${e} ; let func=${i};func&&func();})()`)
                    }), injectScriptIfTabExists(e, {
                        code: n.join(";")
                    })
                })
            })
        },
        _addExtensionListener = function () {
            _updateBrowserAction(),
            chrome.runtime.onMessage.addListener(function (request, sender, callback) {
                if (chrome.runtime.lastError) return console.log(chrome.runtime.lastError), !0;

                if (request.type === MSG_TYPE.DYNAMIC_TOOL_INSTALL_OR_OFFLOAD)
                  _updateBrowserAction(request.action, request.showTips, request.menuOnly), callback && callback();

                else if (request.type === MSG_TYPE.CAPTURE_VISIBLE_PAGE)
                  _captureVisibleTab(callback);

                else if (request.type === MSG_TYPE.OPEN_DYNAMIC_TOOL)
                  chrome.DynamicToolRunner(request), callback && callback();

                else if (request.type === MSG_TYPE.OPEN_PAGE)
                  chrome.DynamicToolRunner({ tool: request.page }), callback && callback();
                else if (request.type === MSG_TYPE.DYNAMIC_ANY_THING) {
                    let func = eval(request.func);
                    func && func(request.params, callback)
                } else callback && callback();
                return !0
            }), chrome.tabs.onUpdated.addListener(function (e, t, n) {
                "complete" === String(t.status).toLowerCase() && /^(http(s)?|file):\/\//.test(n.url) &&
                    blacklist.every(e => !e.test(n.url)) && (injectScriptIfTabExists(e, {
                        code: `window.__FH_TAB_ID__=${e};`
                    }), _injectContentScripts(e))
            }), chrome.runtime.onInstalled.addListener(({
                reason: e,
                previousVersion: t
            }) => {
                switch (e) {
                    case "install":
                        chrome.runtime.openOptionsPage();
                        break;
                    case "update":
                        _animateTips("+++1"), "2019.12.2415" === t && notifyText({
                            message: "历尽千辛万苦，FeHelper已升级到最新版本，可以到插件设置页去安装旧版功能了！",
                            autoClose: 5e3
                        });
                        let n = e => parseInt(e.split(/\./).map(e => e.padStart(4, "0")).join(""), 10);
                        n(t) < n("2020.02.1413") && (Awesome.makeStorageUnlimited(), setTimeout(() =>
                            chrome.runtime.reload(), 5e3))
                }
            }), chrome.runtime.setUninstallURL(chrome.runtime.getManifest().homepage_url)
        },
        _checkUpdate = function () {
            setTimeout(() => {
                chrome.runtime.requestUpdateCheck(e => {
                    "update_available" === e && chrome.runtime.reload()
                })
            }, 3e4)
        },
        _init = function () {
            _checkUpdate(),
            _addExtensionListener(),
            Menu.manage(Settings),
            setTimeout(() => {
                Awesome.gcLocalFiles()
            }, 1e4)
        };
    return {
        pageCapture: _captureVisibleTab,
        init: _init
    }
}();
BgPageInstance.init();