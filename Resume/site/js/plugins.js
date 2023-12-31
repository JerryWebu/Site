// SmoothScroll v0.9.9
// Licensed under the terms of the MIT license.

// People involved
// - Balazs Galambosi: maintainer (CHANGELOG.txt)
// - Patrick Brunner (patrickb1991@gmail.com)
// - Michael Herf: ssc_pulse Algorithm

function ssc_init() {
    if (!document.body) return;
    var e = document.body;
    var t = document.documentElement;
    var n = window.innerHeight;
    var r = e.scrollHeight;
    ssc_root = document.compatMode.indexOf("CSS") >= 0 ? t : e;
    ssc_activeElement = e;
    ssc_initdone = true;
    if (top != self) {
        ssc_frame = true
    } else if (r > n && (e.offsetHeight <= n || t.offsetHeight <= n)) {
        ssc_root.style.height = "auto";
        if (ssc_root.offsetHeight <= n) {
            var i = document.createElement("div");
            i.style.clear = "both";
            e.appendChild(i)
        }
    }
    if (!ssc_fixedback) {
        e.style.backgroundAttachment = "scroll";
        t.style.backgroundAttachment = "scroll"
    }
    if (ssc_keyboardsupport) {
        ssc_addEvent("keydown", ssc_keydown)
    }
}

function ssc_scrollArray(e, t, n, r) {
    r || (r = 1e3);
    ssc_directionCheck(t, n);
    ssc_que.push({
        x: t,
        y: n,
        lastX: t < 0 ? .99 : -.99,
        lastY: n < 0 ? .99 : -.99,
        start: +(new Date)
    });
    if (ssc_pending) {
        return
    }
    var i = function() {
        var s = +(new Date);
        var o = 0;
        var u = 0;
        for (var a = 0; a < ssc_que.length; a++) {
            var f = ssc_que[a];
            var l = s - f.start;
            var c = l >= ssc_animtime;
            var h = c ? 1 : l / ssc_animtime;
            if (ssc_pulseAlgorithm) {
                h = ssc_pulse(h)
            }
            var p = f.x * h - f.lastX >> 0;
            var d = f.y * h - f.lastY >> 0;
            o += p;
            u += d;
            f.lastX += p;
            f.lastY += d;
            if (c) {
                ssc_que.splice(a, 1);
                a--
            }
        }
        if (t) {
            var v = e.scrollLeft;
            e.scrollLeft += o;
            if (o && e.scrollLeft === v) {
                t = 0
            }
        }
        if (n) {
            var m = e.scrollTop;
            e.scrollTop += u;
            if (u && e.scrollTop === m) {
                n = 0
            }
        }
        if (!t && !n) {
            ssc_que = []
        }
        if (ssc_que.length) {
            setTimeout(i, r / ssc_framerate + 1)
        } else {
            ssc_pending = false
        }
    };
    setTimeout(i, 0);
    ssc_pending = true
}

function ssc_wheel(e) {
    if (!ssc_initdone) {
        ssc_init()
    }
    var t = e.target;
    var n = ssc_overflowingAncestor(t);
    if (!n || e.defaultPrevented || ssc_isNodeName(ssc_activeElement, "embed") || ssc_isNodeName(t, "embed") && /\.pdf/i.test(t.src)) {
        return true
    }
    var r = e.wheelDeltaX || 0;
    var i = e.wheelDeltaY || 0;
    if (!r && !i) {
        i = e.wheelDelta || 0
    }
    if (Math.abs(r) > 1.2) {
        r *= ssc_stepsize / 120
    }
    if (Math.abs(i) > 1.2) {
        i *= ssc_stepsize / 120
    }
    ssc_scrollArray(n, -r, -i);
    e.preventDefault()
}

function ssc_keydown(e) {
    var t = e.target;
    var n = e.ctrlKey || e.altKey || e.metaKey;
    if (/input|textarea|embed/i.test(t.nodeName) || t.isContentEditable || e.defaultPrevented || n) {
        return true
    }
    if (ssc_isNodeName(t, "button") && e.keyCode === ssc_key.spacebar) {
        return true
    }
    var r, i = 0,
        s = 0;
    var o = ssc_overflowingAncestor(ssc_activeElement);
    var u = o.clientHeight;
    if (o == document.body) {
        u = window.innerHeight
    }
    switch (e.keyCode) {
        case ssc_key.up:
            s = -ssc_arrowscroll;
            break;
        case ssc_key.down:
            s = ssc_arrowscroll;
            break;
        case ssc_key.spacebar:
            r = e.shiftKey ? 1 : -1;
            s = -r * u * .9;
            break;
        case ssc_key.pageup:
            s = -u * .9;
            break;
        case ssc_key.pagedown:
            s = u * .9;
            break;
        case ssc_key.home:
            s = -o.scrollTop;
            break;
        case ssc_key.end:
            var a = o.scrollHeight - o.scrollTop - u;
            s = a > 0 ? a + 10 : 0;
            break;
        case ssc_key.left:
            i = -ssc_arrowscroll;
            break;
        case ssc_key.right:
            i = ssc_arrowscroll;
            break;
        default:
            return true
    }
    ssc_scrollArray(o, i, s);
    e.preventDefault()
}

function ssc_mousedown(e) {
    ssc_activeElement = e.target
}

function ssc_setCache(e, t) {
    for (var n = e.length; n--;) ssc_cache[ssc_uniqueID(e[n])] = t;
    return t
}

function ssc_overflowingAncestor(e) {
    var t = [];
    var n = ssc_root.scrollHeight;
    do {
        var r = ssc_cache[ssc_uniqueID(e)];
        if (r) {
            return ssc_setCache(t, r)
        }
        t.push(e);
        if (n === e.scrollHeight) {
            if (!ssc_frame || ssc_root.clientHeight + 10 < n) {
                return ssc_setCache(t, document.body)
            }
        } else if (e.clientHeight + 10 < e.scrollHeight) {
            overflow = getComputedStyle(e, "").getPropertyValue("overflow");
            if (overflow === "scroll" || overflow === "auto") {
                return ssc_setCache(t, e)
            }
        }
    } while (e = e.parentNode)
}

function ssc_addEvent(e, t, n) {
    window.addEventListener(e, t, n || false)
}

function ssc_removeEvent(e, t, n) {
    window.removeEventListener(e, t, n || false)
}

function ssc_isNodeName(e, t) {
    return e.nodeName.toLowerCase() === t.toLowerCase()
}

function ssc_directionCheck(e, t) {
    e = e > 0 ? 1 : -1;
    t = t > 0 ? 1 : -1;
    if (ssc_direction.x !== e || ssc_direction.y !== t) {
        ssc_direction.x = e;
        ssc_direction.y = t;
        ssc_que = []
    }
}

function ssc_pulse_(e) {
    var t, n, r;
    e = e * ssc_pulseScale;
    if (e < 1) {
        t = e - (1 - Math.exp(-e))
    } else {
        n = Math.exp(-1);
        e -= 1;
        r = 1 - Math.exp(-e);
        t = n + r * (1 - n)
    }
    return t * ssc_pulseNormalize
}

function ssc_pulse(e) {
    if (e >= 1) return 1;
    if (e <= 0) return 0;
    if (ssc_pulseNormalize == 1) {
        ssc_pulseNormalize /= ssc_pulse_(1)
    }
    return ssc_pulse_(e)
}
var ssc_framerate = 250;
var ssc_animtime = 900;
var ssc_stepsize = 150;
var ssc_pulseAlgorithm = true;
var ssc_pulseScale = 6;
var ssc_pulseNormalize = 1;
var ssc_keyboardsupport = true;
var ssc_arrowscroll = 50;
var ssc_frame = false;
var ssc_direction = {
    x: 0,
    y: 0
};
var ssc_initdone = false;
var ssc_fixedback = true;
var ssc_root = document.documentElement;
var ssc_activeElement;
var ssc_key = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    spacebar: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36
};
var ssc_que = [];
var ssc_pending = false;
var ssc_cache = {};
setInterval(function() {
    ssc_cache = {}
}, 10 * 1e3);
var ssc_uniqueID = function() {
    var e = 0;
    return function(t) {
        return t.ssc_uniqueID || (t.ssc_uniqueID = e++)
    }
}();
var ischrome = /chrome/.test(navigator.userAgent.toLowerCase());
if (ischrome) {
    ssc_addEvent("mousedown", ssc_mousedown);
    ssc_addEvent("mousewheel", ssc_wheel);
    ssc_addEvent("load", ssc_init)
}
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 */
jQuery.easing.jswing = jQuery.easing.swing;
jQuery.extend(jQuery.easing, {
    def: "easeOutQuad",
    swing: function(e, f, a, h, g) {
        return jQuery.easing[jQuery.easing.def](e, f, a, h, g)
    },
    easeInQuad: function(e, f, a, h, g) {
        return h * (f /= g) * f + a
    },
    easeOutQuad: function(e, f, a, h, g) {
        return -h * (f /= g) * (f - 2) + a
    },
    easeInOutQuad: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f + a
        }
        return -h / 2 * ((--f) * (f - 2) - 1) + a
    },
    easeInCubic: function(e, f, a, h, g) {
        return h * (f /= g) * f * f + a
    },
    easeOutCubic: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f + 1) + a
    },
    easeInOutCubic: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f + 2) + a
    },
    easeInQuart: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f + a
    },
    easeOutQuart: function(e, f, a, h, g) {
        return -h * ((f = f / g - 1) * f * f * f - 1) + a
    },
    easeInOutQuart: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f + a
        }
        return -h / 2 * ((f -= 2) * f * f * f - 2) + a
    },
    easeInQuint: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f * f + a
    },
    easeOutQuint: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f * f * f + 1) + a
    },
    easeInOutQuint: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f * f * f + 2) + a
    },
    easeInSine: function(e, f, a, h, g) {
        return -h * Math.cos(f / g * (Math.PI / 2)) + h + a
    },
    easeOutSine: function(e, f, a, h, g) {
        return h * Math.sin(f / g * (Math.PI / 2)) + a
    },
    easeInOutSine: function(e, f, a, h, g) {
        return -h / 2 * (Math.cos(Math.PI * f / g) - 1) + a
    },
    easeInExpo: function(e, f, a, h, g) {
        return (f == 0) ? a : h * Math.pow(2, 10 * (f / g - 1)) + a
    },
    easeOutExpo: function(e, f, a, h, g) {
        return (f == g) ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a
    },
    easeInOutExpo: function(e, f, a, h, g) {
        if (f == 0) {
            return a
        }
        if (f == g) {
            return a + h
        }
        if ((f /= g / 2) < 1) {
            return h / 2 * Math.pow(2, 10 * (f - 1)) + a
        }
        return h / 2 * (-Math.pow(2, -10 * --f) + 2) + a
    },
    easeInCirc: function(e, f, a, h, g) {
        return -h * (Math.sqrt(1 - (f /= g) * f) - 1) + a
    },
    easeOutCirc: function(e, f, a, h, g) {
        return h * Math.sqrt(1 - (f = f / g - 1) * f) + a
    },
    easeInOutCirc: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return -h / 2 * (Math.sqrt(1 - f * f) - 1) + a
        }
        return h / 2 * (Math.sqrt(1 - (f -= 2) * f) + 1) + a
    },
    easeInElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k) == 1) {
            return e + l
        }
        if (!j) {
            j = k * 0.3
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        return -(g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
    },
    easeOutElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k) == 1) {
            return e + l
        }
        if (!j) {
            j = k * 0.3
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        return g * Math.pow(2, -10 * h) * Math.sin((h * k - i) * (2 * Math.PI) / j) + l + e
    },
    easeInOutElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k / 2) == 2) {
            return e + l
        }
        if (!j) {
            j = k * (0.3 * 1.5)
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        if (h < 1) {
            return -0.5 * (g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
        }
        return g * Math.pow(2, -10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j) * 0.5 + l + e
    },
    easeInBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * (f /= h) * f * ((g + 1) * f - g) + a
    },
    easeOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a
    },
    easeInOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        if ((f /= h / 2) < 1) {
            return i / 2 * (f * f * (((g *= (1.525)) + 1) * f - g)) + a
        }
        return i / 2 * ((f -= 2) * f * (((g *= (1.525)) + 1) * f + g) + 2) + a
    },
    easeInBounce: function(e, f, a, h, g) {
        return h - jQuery.easing.easeOutBounce(e, g - f, 0, h, g) + a
    },
    easeOutBounce: function(e, f, a, h, g) {
        if ((f /= g) < (1 / 2.75)) {
            return h * (7.5625 * f * f) + a
        } else {
            if (f < (2 / 2.75)) {
                return h * (7.5625 * (f -= (1.5 / 2.75)) * f + 0.75) + a
            } else {
                if (f < (2.5 / 2.75)) {
                    return h * (7.5625 * (f -= (2.25 / 2.75)) * f + 0.9375) + a
                } else {
                    return h * (7.5625 * (f -= (2.625 / 2.75)) * f + 0.984375) + a
                }
            }
        }
    },
    easeInOutBounce: function(e, f, a, h, g) {
        if (f < g / 2) {
            return jQuery.easing.easeInBounce(e, f * 2, 0, h, g) * 0.5 + a
        }
        return jQuery.easing.easeOutBounce(e, f * 2 - g, 0, h, g) * 0.5 + h * 0.5 + a
    }
});
/**

/*
* MIXITUP - A CSS3 and JQuery Filter & Sort Plugin
* Version: 1.5.4
* License: Creative Commons Attribution-NoDerivs 3.0 Unported - CC BY-ND 3.0
* http://creativecommons.org/licenses/by-nd/3.0/
* This software may be used freely on commercial and non-commercial projects with attribution to the author/copyright holder.
* Author: Patrick Kunka
* Copyright 2012-2013 Patrick Kunka, Barrel LLC, All Rights Reserved
* 
* http://mixitup.io
*/
(function(e) {
    function q(c, b, g, d, a) {
        function k() {
            l.unbind("webkitTransitionEnd transitionend otransitionend oTransitionEnd");
            b && w(b, g, d, a);
            a.startOrder = [];
            a.newOrder = [];
            a.origSort = [];
            a.checkSort = [];
            r.removeStyle(a.prefix + "filter, filter, " + a.prefix + "transform, transform, opacity, display").css(a.clean).removeAttr("data-checksum");
            window.atob || r.css({
                display: "none",
                opacity: "0"
            });
            l.removeStyle(a.prefix + "transition, transition, " + a.prefix + "perspective, perspective, " + a.prefix + "perspective-origin, perspective-origin, " +
                (a.resizeContainer ? "height" : ""));
            "list" == a.layoutMode ? (n.css({
                display: a.targetDisplayList,
                opacity: "1"
            }), a.origDisplay = a.targetDisplayList) : (n.css({
                display: a.targetDisplayGrid,
                opacity: "1"
            }), a.origDisplay = a.targetDisplayGrid);
            a.origLayout = a.layoutMode;
            setTimeout(function() {
                r.removeStyle(a.prefix + "transition, transition");
                a.mixing = !1;
                if ("function" == typeof a.onMixEnd) {
                    var b = a.onMixEnd.call(this, a);
                    a = b ? b : a
                }
            })
        }
        clearInterval(a.failsafe);
        a.mixing = !0;
        a.filter = c;
        if ("function" == typeof a.onMixStart) {
            var f = a.onMixStart.call(this,
                a);
            a = f ? f : a
        }
        for (var h = a.transitionSpeed, f = 0; 2 > f; f++) {
            var j = 0 == f ? j = a.prefix : "";
            a.transition[j + "transition"] = "all " + h + "ms linear";
            a.transition[j + "transform"] = j + "translate3d(0,0,0)";
            a.perspective[j + "perspective"] = a.perspectiveDistance + "px";
            a.perspective[j + "perspective-origin"] = a.perspectiveOrigin
        }
        var s = a.targetSelector,
            r = d.find(s);
        r.each(function() {
            this.data = {}
        });
        var l = r.parent();
        l.css(a.perspective);
        a.easingFallback = "ease-in-out";
        "smooth" == a.easing && (a.easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)");
        "snap" == a.easing && (a.easing = "cubic-bezier(0.77, 0, 0.175, 1)");
        "windback" == a.easing && (a.easing = "cubic-bezier(0.175, 0.885, 0.320, 1.275)", a.easingFallback = "cubic-bezier(0.175, 0.885, 0.320, 1)");
        "windup" == a.easing && (a.easing = "cubic-bezier(0.6, -0.28, 0.735, 0.045)", a.easingFallback = "cubic-bezier(0.6, 0.28, 0.735, 0.045)");
        f = "list" == a.layoutMode && null != a.listEffects ? a.listEffects : a.effects;
        Array.prototype.indexOf && (a.fade = -1 < f.indexOf("fade") ? "0" : "", a.scale = -1 < f.indexOf("scale") ? "scale(.01)" : "", a.rotateZ = -1 < f.indexOf("rotateZ") ? "rotate(180deg)" : "", a.rotateY = -1 < f.indexOf("rotateY") ? "rotateY(90deg)" : "", a.rotateX = -1 < f.indexOf("rotateX") ? "rotateX(90deg)" : "", a.blur = -1 < f.indexOf("blur") ? "blur(8px)" : "", a.grayscale = -1 < f.indexOf("grayscale") ? "grayscale(100%)" : "");
        var n = e(),
            t = e(),
            u = [],
            q = !1;
        "string" === typeof c ? u = y(c) : (q = !0, e.each(c, function(a) {
            u[a] = y(this)
        }));
        "or" == a.filterLogic ? ("" == u[0] && u.shift(), 1 > u.length ? t = t.add(d.find(s + ":visible")) : r.each(function() {
            var a = e(this);
            if (q) {
                var b = 0;
                e.each(u, function() {
                    this.length ?
                        a.is("." + this.join(", .")) && b++ : 0 < b && b++
                });
                b == u.length ? n = n.add(a) : t = t.add(a)
            } else a.is("." + u.join(", .")) ? n = n.add(a) : t = t.add(a)
        })) : (n = n.add(l.find(s + "." + u.join("."))), t = t.add(l.find(s + ":not(." + u.join(".") + "):visible")));
        c = n.length;
        var v = e(),
            p = e(),
            m = e();
        t.each(function() {
            var a = e(this);
            "none" != a.css("display") && (v = v.add(a), m = m.add(a))
        });
        if (n.filter(":visible").length == c && !v.length && !b) {
            if (a.origLayout == a.layoutMode) return k(), !1;
            if (1 == n.length) return "list" == a.layoutMode ? (d.addClass(a.listClass), d.removeClass(a.gridClass),
                m.css("display", a.targetDisplayList)) : (d.addClass(a.gridClass), d.removeClass(a.listClass), m.css("display", a.targetDisplayGrid)), k(), !1
        }
        a.origHeight = l.height();
        if (n.length) {
            d.removeClass(a.failClass);
            n.each(function() {
                var a = e(this);
                "none" == a.css("display") ? p = p.add(a) : m = m.add(a)
            });
            if (a.origLayout != a.layoutMode && !1 == a.animateGridList) return "list" == a.layoutMode ? (d.addClass(a.listClass), d.removeClass(a.gridClass), m.css("display", a.targetDisplayList)) : (d.addClass(a.gridClass), d.removeClass(a.listClass),
                m.css("display", a.targetDisplayGrid)), k(), !1;
            if (!window.atob) return k(), !1;
            r.css(a.clean);
            m.each(function() {
                this.data.origPos = e(this).offset()
            });
            "list" == a.layoutMode ? (d.addClass(a.listClass), d.removeClass(a.gridClass), p.css("display", a.targetDisplayList)) : (d.addClass(a.gridClass), d.removeClass(a.listClass), p.css("display", a.targetDisplayGrid));
            p.each(function() {
                this.data.showInterPos = e(this).offset()
            });
            v.each(function() {
                this.data.hideInterPos = e(this).offset()
            });
            m.each(function() {
                this.data.preInterPos =
                    e(this).offset()
            });
            "list" == a.layoutMode ? m.css("display", a.targetDisplayList) : m.css("display", a.targetDisplayGrid);
            b && w(b, g, d, a);
            if (c = b) a: if (c = a.origSort, f = a.checkSort, c.length != f.length) c = !1;
                else {
                    for (j = 0; j < f.length; j++)
                        if (c[j].compare && !c[j].compare(f[j]) || c[j] !== f[j]) {
                            c = !1;
                            break a
                        }
                    c = !0
                }
            if (c) return k(), !1;
            v.hide();
            p.each(function() {
                this.data.finalPos = e(this).offset()
            });
            m.each(function() {
                this.data.finalPrePos = e(this).offset()
            });
            a.newHeight = l.height();
            b && w("reset", null, d, a);
            p.hide();
            m.css("display",
                a.origDisplay);
            "block" == a.origDisplay ? (d.addClass(a.listClass), p.css("display", a.targetDisplayList)) : (d.removeClass(a.listClass), p.css("display", a.targetDisplayGrid));
            a.resizeContainer && l.css("height", a.origHeight + "px");
            c = {};
            for (f = 0; 2 > f; f++) j = 0 == f ? j = a.prefix : "", c[j + "transform"] = a.scale + " " + a.rotateX + " " + a.rotateY + " " + a.rotateZ, c[j + "filter"] = a.blur + " " + a.grayscale;
            p.css(c);
            m.each(function() {
                var b = this.data,
                    c = e(this);
                c.hasClass("mix_tohide") ? (b.preTX = b.origPos.left - b.hideInterPos.left, b.preTY = b.origPos.top -
                    b.hideInterPos.top) : (b.preTX = b.origPos.left - b.preInterPos.left, b.preTY = b.origPos.top - b.preInterPos.top);
                for (var d = {}, f = 0; 2 > f; f++) {
                    var j = 0 == f ? j = a.prefix : "";
                    d[j + "transform"] = "translate(" + b.preTX + "px," + b.preTY + "px)"
                }
                c.css(d)
            });
            "list" == a.layoutMode ? (d.addClass(a.listClass), d.removeClass(a.gridClass)) : (d.addClass(a.gridClass), d.removeClass(a.listClass));
            setTimeout(function() {
                if (a.resizeContainer) {
                    for (var b = {}, c = 0; 2 > c; c++) {
                        var d = 0 == c ? d = a.prefix : "";
                        b[d + "transition"] = "all " + h + "ms ease-in-out";
                        b.height = a.newHeight +
                            "px"
                    }
                    l.css(b)
                }
                v.css("opacity", a.fade);
                p.css("opacity", 1);
                p.each(function() {
                    var b = this.data;
                    b.tX = b.finalPos.left - b.showInterPos.left;
                    b.tY = b.finalPos.top - b.showInterPos.top;
                    for (var c = {}, d = 0; 2 > d; d++) {
                        var f = 0 == d ? f = a.prefix : "";
                        c[f + "transition-property"] = f + "transform, " + f + "filter, opacity";
                        c[f + "transition-timing-function"] = a.easing + ", linear, linear";
                        c[f + "transition-duration"] = h + "ms";
                        c[f + "transition-delay"] = "0";
                        c[f + "transform"] = "translate(" + b.tX + "px," + b.tY + "px)";
                        c[f + "filter"] = "none"
                    }
                    e(this).css("-webkit-transition",
                        "all " + h + "ms " + a.easingFallback).css(c)
                });
                m.each(function() {
                    var b = this.data;
                    b.tX = 0 != b.finalPrePos.left ? b.finalPrePos.left - b.preInterPos.left : 0;
                    b.tY = 0 != b.finalPrePos.left ? b.finalPrePos.top - b.preInterPos.top : 0;
                    for (var c = {}, d = 0; 2 > d; d++) {
                        var f = 0 == d ? f = a.prefix : "";
                        c[f + "transition"] = "all " + h + "ms " + a.easing;
                        c[f + "transform"] = "translate(" + b.tX + "px," + b.tY + "px)"
                    }
                    e(this).css("-webkit-transition", "all " + h + "ms " + a.easingFallback).css(c)
                });
                b = {};
                for (c = 0; 2 > c; c++) d = 0 == c ? d = a.prefix : "", b[d + "transition"] = "all " + h + "ms " +
                    a.easing + ", " + d + "filter " + h + "ms linear, opacity " + h + "ms linear", b[d + "transform"] = a.scale + " " + a.rotateX + " " + a.rotateY + " " + a.rotateZ, b[d + "filter"] = a.blur + " " + a.grayscale, b.opacity = a.fade;
                v.css(b);
                l.bind("webkitTransitionEnd transitionend otransitionend oTransitionEnd", function(b) {
                    if (-1 < b.originalEvent.propertyName.indexOf("transform") || -1 < b.originalEvent.propertyName.indexOf("opacity")) - 1 < s.indexOf(".") ? e(b.target).hasClass(s.replace(".", "")) && k() : e(b.target).is(s) && k()
                })
            }, 10);
            a.failsafe = setTimeout(function() {
                a.mixing &&
                    k()
            }, h + 400)
        } else {
            a.resizeContainer && l.css("height", a.origHeight + "px");
            if (!window.atob) return k(), !1;
            v = t;
            setTimeout(function() {
                l.css(a.perspective);
                if (a.resizeContainer) {
                    for (var b = {}, c = 0; 2 > c; c++) {
                        var e = 0 == c ? e = a.prefix : "";
                        b[e + "transition"] = "height " + h + "ms ease-in-out";
                        b.height = a.minHeight + "px"
                    }
                    l.css(b)
                }
                r.css(a.transition);
                if (t.length) {
                    b = {};
                    for (c = 0; 2 > c; c++) e = 0 == c ? e = a.prefix : "", b[e + "transform"] = a.scale + " " + a.rotateX + " " + a.rotateY + " " + a.rotateZ, b[e + "filter"] = a.blur + " " + a.grayscale, b.opacity = a.fade;
                    v.css(b);
                    l.bind("webkitTransitionEnd transitionend otransitionend oTransitionEnd", function(b) {
                        if (-1 < b.originalEvent.propertyName.indexOf("transform") || -1 < b.originalEvent.propertyName.indexOf("opacity")) d.addClass(a.failClass), k()
                    })
                } else a.mixing = !1
            }, 10)
        }
    }

    function w(c, b, g, d) {
        function a(b, a) {
            var d = isNaN(1 * b.attr(c)) ? b.attr(c).toLowerCase() : 1 * b.attr(c),
                e = isNaN(1 * a.attr(c)) ? a.attr(c).toLowerCase() : 1 * a.attr(c);
            return d < e ? -1 : d > e ? 1 : 0
        }

        function k(a) {
            "asc" == b ? f.prepend(a).prepend(" ") : f.append(a).append(" ")
        }
        g.find(d.targetSelector).wrapAll('<div class="mix_sorter"/>');
        var f = g.find(".mix_sorter");
        d.origSort.length || f.find(d.targetSelector + ":visible").each(function() {
            e(this).wrap("<s/>");
            d.origSort.push(e(this).parent().html().replace(/\s+/g, ""));
            e(this).unwrap()
        });
        f.empty();
        if ("reset" == c) e.each(d.startOrder, function() {
            f.append(this).append(" ")
        });
        else if ("default" == c) e.each(d.origOrder, function() {
            k(this)
        });
        else if ("random" == c) {
            if (!d.newOrder.length) {
                for (var h = d.startOrder.slice(), j = h.length, s = j; s--;) {
                    var r = parseInt(Math.random() * j),
                        l = h[s];
                    h[s] = h[r];
                    h[r] = l
                }
                d.newOrder =
                    h
            }
            e.each(d.newOrder, function() {
                f.append(this).append(" ")
            })
        } else if ("custom" == c) e.each(b, function() {
            k(this)
        });
        else {
            if ("undefined" === typeof d.origOrder[0].attr(c)) return console.log("No such attribute found. Terminating"), !1;
            d.newOrder.length || (e.each(d.origOrder, function() {
                d.newOrder.push(e(this))
            }), d.newOrder.sort(a));
            e.each(d.newOrder, function() {
                k(this)
            })
        }
        d.checkSort = [];
        f.find(d.targetSelector + ":visible").each(function(b) {
            var a = e(this);
            0 == b && a.attr("data-checksum", "1");
            a.wrap("<s/>");
            d.checkSort.push(a.parent().html().replace(/\s+/g,
                ""));
            a.unwrap()
        });
        g.find(d.targetSelector).unwrap()
    }

    function y(c) {
        c = c.replace(/\s{2,}/g, " ");
        var b = c.split(" ");
        e.each(b, function(c) {
            "all" == this && (b[c] = "mix_all")
        });
        "" == b[0] && b.shift();
        return b
    }
    var x = {
        init: function(c) {
            return this.each(function() {
                var b = {
                    targetSelector: ".mix",
                    filterSelector: ".filter",
                    sortSelector: ".sort",
                    buttonEvent: "click",
                    effects: ["fade", "scale"],
                    listEffects: null,
                    easing: "smooth",
                    layoutMode: "grid",
                    targetDisplayGrid: "inline-block",
                    targetDisplayList: "block",
                    listClass: "",
                    gridClass: "",
                    transitionSpeed: 600,
                    showOnLoad: "all",
                    sortOnLoad: !1,
                    multiFilter: !1,
                    filterLogic: "or",
                    resizeContainer: !0,
                    minHeight: 0,
                    failClass: "fail",
                    perspectiveDistance: "3000",
                    perspectiveOrigin: "50% 50%",
                    animateGridList: !0,
                    onMixLoad: null,
                    onMixStart: null,
                    onMixEnd: null,
                    container: null,
                    origOrder: [],
                    startOrder: [],
                    newOrder: [],
                    origSort: [],
                    checkSort: [],
                    filter: "",
                    mixing: !1,
                    origDisplay: "",
                    origLayout: "",
                    origHeight: 0,
                    newHeight: 0,
                    isTouch: !1,
                    resetDelay: 0,
                    failsafe: null,
                    prefix: "",
                    easingFallback: "ease-in-out",
                    transition: {},
                    perspective: {},
                    clean: {},
                    fade: "1",
                    scale: "",
                    rotateX: "",
                    rotateY: "",
                    rotateZ: "",
                    blur: "",
                    grayscale: ""
                };
                c && e.extend(b, c);
                this.config = b;
                e.support.touch = "ontouchend" in document;
                e.support.touch && (b.isTouch = !0, b.resetDelay = 350);
                b.container = e(this);
                var g = b.container,
                    d;
                a: {
                    d = g[0];
                    for (var a = ["Webkit", "Moz", "O", "ms"], k = 0; k < a.length; k++)
                        if (a[k] + "Transition" in d.style) {
                            d = a[k];
                            break a
                        }
                    d = "transition" in d.style ? "" : !1
                }
                b.prefix = d;
                b.prefix = b.prefix ? "-" + b.prefix.toLowerCase() + "-" : "";
                g.find(b.targetSelector).each(function() {
                    b.origOrder.push(e(this))
                });
                if (b.sortOnLoad) {
                    var f;
                    e.isArray(b.sortOnLoad) ? (d = b.sortOnLoad[0], f = b.sortOnLoad[1], e(b.sortSelector + "[data-sort=" + b.sortOnLoad[0] + "][data-order=" + b.sortOnLoad[1] + "]").addClass("active")) : (e(b.sortSelector + "[data-sort=" + b.sortOnLoad + "]").addClass("active"), d = b.sortOnLoad, b.sortOnLoad = "desc");
                    w(d, f, g, b)
                }
                for (f = 0; 2 > f; f++) d = 0 == f ? d = b.prefix : "", b.transition[d + "transition"] = "all " + b.transitionSpeed + "ms ease-in-out", b.perspective[d + "perspective"] = b.perspectiveDistance + "px", b.perspective[d + "perspective-origin"] =
                    b.perspectiveOrigin;
                for (f = 0; 2 > f; f++) d = 0 == f ? d = b.prefix : "", b.clean[d + "transition"] = "none";
                "list" == b.layoutMode ? (g.addClass(b.listClass), b.origDisplay = b.targetDisplayList) : (g.addClass(b.gridClass), b.origDisplay = b.targetDisplayGrid);
                b.origLayout = b.layoutMode;
                f = b.showOnLoad.split(" ");
                e.each(f, function() {
                    e(b.filterSelector + '[data-filter="' + this + '"]').addClass("active")
                });
                g.find(b.targetSelector).addClass("mix_all");
                "all" == f[0] && (f[0] = "mix_all", b.showOnLoad = "mix_all");
                var h = e();
                e.each(f, function() {
                    h = h.add(e("." +
                        this))
                });
                h.each(function() {
                    var a = e(this);
                    "list" == b.layoutMode ? a.css("display", b.targetDisplayList) : a.css("display", b.targetDisplayGrid);
                    a.css(b.transition)
                });
                setTimeout(function() {
                    b.mixing = !0;
                    h.css("opacity", "1");
                    setTimeout(function() {
                        "list" == b.layoutMode ? h.removeStyle(b.prefix + "transition, transition").css({
                            display: b.targetDisplayList,
                            opacity: 1
                        }) : h.removeStyle(b.prefix + "transition, transition").css({
                            display: b.targetDisplayGrid,
                            opacity: 1
                        });
                        b.mixing = !1;
                        if ("function" == typeof b.onMixLoad) {
                            var a = b.onMixLoad.call(this,
                                b);
                            b = a ? a : b
                        }
                    }, b.transitionSpeed)
                }, 10);
                b.filter = b.showOnLoad;
                e(b.sortSelector).bind(b.buttonEvent, function() {
                    if (!b.mixing) {
                        var a = e(this),
                            c = a.attr("data-sort"),
                            d = a.attr("data-order");
                        if (a.hasClass("active")) {
                            if ("random" != c) return !1
                        } else e(b.sortSelector).removeClass("active"), a.addClass("active");
                        g.find(b.targetSelector).each(function() {
                            b.startOrder.push(e(this))
                        });
                        q(b.filter, c, d, g, b)
                    }
                });
                e(b.filterSelector).bind(b.buttonEvent, function() {
                    if (!b.mixing) {
                        var a = e(this);
                        if (!1 == b.multiFilter) e(b.filterSelector).removeClass("active"),
                            a.addClass("active"), b.filter = a.attr("data-filter"), e(b.filterSelector + '[data-filter="' + b.filter + '"]').addClass("active");
                        else {
                            var c = a.attr("data-filter");
                            a.hasClass("active") ? (a.removeClass("active"), b.filter = b.filter.replace(RegExp("(\\s|^)" + c), "")) : (a.addClass("active"), b.filter = b.filter + " " + c)
                        }
                        q(b.filter, null, null, g, b)
                    }
                })
            })
        },
        toGrid: function() {
            return this.each(function() {
                var c = this.config;
                "grid" != c.layoutMode && (c.layoutMode = "grid", q(c.filter, null, null, e(this), c))
            })
        },
        toList: function() {
            return this.each(function() {
                var c =
                    this.config;
                "list" != c.layoutMode && (c.layoutMode = "list", q(c.filter, null, null, e(this), c))
            })
        },
        filter: function(c) {
            return this.each(function() {
                var b = this.config;
                b.mixing || (e(b.filterSelector).removeClass("active"), e(b.filterSelector + '[data-filter="' + c + '"]').addClass("active"), q(c, null, null, e(this), b))
            })
        },
        sort: function(c) {
            return this.each(function() {
                var b = this.config,
                    g = e(this);
                if (!b.mixing) {
                    e(b.sortSelector).removeClass("active");
                    if (e.isArray(c)) {
                        var d = c[0],
                            a = c[1];
                        e(b.sortSelector + '[data-sort="' + c[0] + '"][data-order="' +
                            c[1] + '"]').addClass("active")
                    } else e(b.sortSelector + '[data-sort="' + c + '"]').addClass("active"), d = c, a = "desc";
                    g.find(b.targetSelector).each(function() {
                        b.startOrder.push(e(this))
                    });
                    q(b.filter, d, a, g, b)
                }
            })
        },
        multimix: function(c) {
            return this.each(function() {
                var b = this.config,
                    g = e(this);
                multiOut = {
                    filter: b.filter,
                    sort: null,
                    order: "desc",
                    layoutMode: b.layoutMode
                };
                e.extend(multiOut, c);
                b.mixing || (e(b.filterSelector).add(b.sortSelector).removeClass("active"), e(b.filterSelector + '[data-filter="' + multiOut.filter + '"]').addClass("active"),
                    "undefined" !== typeof multiOut.sort && (e(b.sortSelector + '[data-sort="' + multiOut.sort + '"][data-order="' + multiOut.order + '"]').addClass("active"), g.find(b.targetSelector).each(function() {
                        b.startOrder.push(e(this))
                    })), b.layoutMode = multiOut.layoutMode, q(multiOut.filter, multiOut.sort, multiOut.order, g, b))
            })
        },
        remix: function(c) {
            return this.each(function() {
                var b = this.config,
                    g = e(this);
                b.origOrder = [];
                g.find(b.targetSelector).each(function() {
                    var c = e(this);
                    c.addClass("mix_all");
                    b.origOrder.push(c)
                });
                !b.mixing && "undefined" !==
                    typeof c && (e(b.filterSelector).removeClass("active"), e(b.filterSelector + '[data-filter="' + c + '"]').addClass("active"), q(c, null, null, g, b))
            })
        }
    };
    e.fn.mixitup = function(c, b) {
        if (x[c]) return x[c].apply(this, Array.prototype.slice.call(arguments, 1));
        if ("object" === typeof c || !c) return x.init.apply(this, arguments)
    };
    e.fn.removeStyle = function(c) {
        return this.each(function() {
            var b = e(this);
            c = c.replace(/\s+/g, "");
            var g = c.split(",");
            e.each(g, function() {
                var c = RegExp(this.toString() + "[^;]+;?", "g");
                b.attr("style", function(a,
                    b) {
                    if (b) return b.replace(c, "")
                })
            })
        })
    }
})(jQuery);
/*
 * Swiper 2.1 - Mobile Touch Slider
 * http://www.idangero.us/sliders/swiper/
 *
 * Copyright 2012-2013, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under GPL & MIT
 *
 * Updated on: August 22, 2013
 */
var Swiper = function(f, b) {
    function g(a) {
        return document.querySelectorAll ? document.querySelectorAll(a) : jQuery(a)
    }

    function h() {
        var c = y - l;
        b.freeMode && (c = y - l);
        b.slidesPerView > a.slides.length && (c = 0);
        0 > c && (c = 0);
        return c
    }

    function n() {
        function c(c) {
            var d = new Image;
            d.onload = function() {
                a.imagesLoaded++;
                if (a.imagesLoaded == a.imagesToLoad.length && (a.reInit(), b.onImagesReady)) b.onImagesReady(a)
            };
            d.src = c
        }
        a.browser.ie10 ? (a.h.addEventListener(a.wrapper, a.touchEvents.touchStart, z, !1), a.h.addEventListener(document, a.touchEvents.touchMove,
            A, !1), a.h.addEventListener(document, a.touchEvents.touchEnd, B, !1)) : (a.support.touch && (a.h.addEventListener(a.wrapper, "touchstart", z, !1), a.h.addEventListener(a.wrapper, "touchmove", A, !1), a.h.addEventListener(a.wrapper, "touchend", B, !1)), b.simulateTouch && (a.h.addEventListener(a.wrapper, "mousedown", z, !1), a.h.addEventListener(document, "mousemove", A, !1), a.h.addEventListener(document, "mouseup", B, !1)));
        b.autoResize && a.h.addEventListener(window, "resize", a.resizeFix, !1);
        t();
        a._wheelEvent = !1;
        if (b.mousewheelControl) {
            void 0 !==
                document.onmousewheel && (a._wheelEvent = "mousewheel");
            try {
                WheelEvent("wheel"), a._wheelEvent = "wheel"
            } catch (d) {}
            a._wheelEvent || (a._wheelEvent = "DOMMouseScroll");
            a._wheelEvent && a.h.addEventListener(a.container, a._wheelEvent, N, !1)
        }
        b.keyboardControl && a.h.addEventListener(document, "keydown", O, !1);
        if (b.updateOnImagesReady) {
            document.querySelectorAll ? a.imagesToLoad = a.container.querySelectorAll("img") : window.jQuery && (a.imagesToLoad = g(a.container).find("img"));
            for (var e = 0; e < a.imagesToLoad.length; e++) c(a.imagesToLoad[e].getAttribute("src"))
        }
    }

    function t() {
        if (b.preventLinks) {
            var c = [];
            document.querySelectorAll ? c = a.container.querySelectorAll("a") : window.jQuery && (c = g(a.container).find("a"));
            for (var d = 0; d < c.length; d++) a.h.addEventListener(c[d], "click", P, !1)
        }
        if (b.releaseFormElements)
            for (c = document.querySelectorAll ? a.container.querySelectorAll("input, textarea, select") : g(a.container).find("input, textarea, select"), d = 0; d < c.length; d++) a.h.addEventListener(c[d], a.touchEvents.touchStart, Q, !0);
        if (b.onSlideClick)
            for (d = 0; d < a.slides.length; d++) a.h.addEventListener(a.slides[d],
                "click", R, !1);
        if (b.onSlideTouch)
            for (d = 0; d < a.slides.length; d++) a.h.addEventListener(a.slides[d], a.touchEvents.touchStart, S, !1)
    }

    function v() {
        if (b.onSlideClick)
            for (var c = 0; c < a.slides.length; c++) a.h.removeEventListener(a.slides[c], "click", R, !1);
        if (b.onSlideTouch)
            for (c = 0; c < a.slides.length; c++) a.h.removeEventListener(a.slides[c], a.touchEvents.touchStart, S, !1);
        if (b.releaseFormElements)
            for (var d = document.querySelectorAll ? a.container.querySelectorAll("input, textarea, select") : g(a.container).find("input, textarea, select"),
                    c = 0; c < d.length; c++) a.h.removeEventListener(d[c], a.touchEvents.touchStart, Q, !0);
        if (b.preventLinks)
            for (d = [], document.querySelectorAll ? d = a.container.querySelectorAll("a") : window.jQuery && (d = g(a.container).find("a")), c = 0; c < d.length; c++) a.h.removeEventListener(d[c], "click", P, !1)
    }

    function O(c) {
        var b = c.keyCode || c.charCode;
        if (37 == b || 39 == b || 38 == b || 40 == b) {
            for (var e = !1, f = a.h.getOffset(a.container), h = a.h.windowScroll().left, g = a.h.windowScroll().top, m = a.h.windowWidth(), l = a.h.windowHeight(), f = [
                    [f.left, f.top],
                    [f.left +
                        a.width, f.top
                    ],
                    [f.left, f.top + a.height],
                    [f.left + a.width, f.top + a.height]
                ], p = 0; p < f.length; p++) {
                var r = f[p];
                r[0] >= h && (r[0] <= h + m && r[1] >= g && r[1] <= g + l) && (e = !0)
            }
            if (!e) return
        }
        if (k) {
            if (37 == b || 39 == b) c.preventDefault ? c.preventDefault() : c.returnValue = !1;
            39 == b && a.swipeNext();
            37 == b && a.swipePrev()
        } else {
            if (38 == b || 40 == b) c.preventDefault ? c.preventDefault() : c.returnValue = !1;
            40 == b && a.swipeNext();
            38 == b && a.swipePrev()
        }
    }

    function N(c) {
        var d = a._wheelEvent,
            e;
        c.detail ? e = -c.detail : "mousewheel" == d ? e = c.wheelDelta : "DOMMouseScroll" ==
            d ? e = -c.detail : "wheel" == d && (e = Math.abs(c.deltaX) > Math.abs(c.deltaY) ? -c.deltaX : -c.deltaY);
        b.freeMode ? (k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y"), k ? (d = a.getWrapperTranslate("x") + e, e = a.getWrapperTranslate("y"), 0 < d && (d = 0), d < -h() && (d = -h())) : (d = a.getWrapperTranslate("x"), e = a.getWrapperTranslate("y") + e, 0 < e && (e = 0), e < -h() && (e = -h())), a.setWrapperTransition(0), a.setWrapperTranslate(d, e, 0), k ? a.updateActiveSlide(d) : a.updateActiveSlide(e)) : 0 > e ? a.swipeNext() : a.swipePrev();
        b.autoplay && a.stopAutoplay();
        c.preventDefault ? c.preventDefault() : c.returnValue = !1;
        return !1
    }

    function T(a) {
        for (var d = !1; !d;) - 1 < a.className.indexOf(b.slideClass) && (d = a), a = a.parentElement;
        return d
    }

    function R(c) {
        a.allowSlideClick && (c.target ? (a.clickedSlide = this, a.clickedSlideIndex = a.slides.indexOf(this)) : (a.clickedSlide = T(c.srcElement), a.clickedSlideIndex = a.slides.indexOf(a.clickedSlide)), b.onSlideClick(a))
    }

    function S(c) {
        a.clickedSlide = c.target ? this : T(c.srcElement);
        a.clickedSlideIndex = a.slides.indexOf(a.clickedSlide);
        b.onSlideTouch(a)
    }

    function P(b) {
        if (!a.allowLinks) return b.preventDefault ? b.preventDefault() : b.returnValue = !1, !1
    }

    function Q(a) {
        a.stopPropagation ? a.stopPropagation() : a.returnValue = !1;
        return !1
    }

    function z(c) {
        b.preventLinks && (a.allowLinks = !0);
        if (a.isTouched || b.onlyExternal) return !1;
        var d;
        if (d = b.noSwiping)
            if (d = c.target || c.srcElement) {
                d = c.target || c.srcElement;
                var e = !1;
                do -1 < d.className.indexOf(b.noSwipingClass) && (e = !0), d = d.parentElement; while (!e && d.parentElement && -1 == d.className.indexOf(b.wrapperClass));
                !e && (-1 < d.className.indexOf(b.wrapperClass) &&
                    -1 < d.className.indexOf(b.noSwipingClass)) && (e = !0);
                d = e
            }
        if (d) return !1;
        G = !1;
        a.isTouched = !0;
        u = "touchstart" == c.type;
        if (!u || 1 == c.targetTouches.length) {
            b.loop && a.fixLoop();
            a.callPlugins("onTouchStartBegin");
            u || (c.preventDefault ? c.preventDefault() : c.returnValue = !1);
            d = u ? c.targetTouches[0].pageX : c.pageX || c.clientX;
            c = u ? c.targetTouches[0].pageY : c.pageY || c.clientY;
            a.touches.startX = a.touches.currentX = d;
            a.touches.startY = a.touches.currentY = c;
            a.touches.start = a.touches.current = k ? d : c;
            a.setWrapperTransition(0);
            a.positions.start =
                a.positions.current = k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y");
            k ? a.setWrapperTranslate(a.positions.start, 0, 0) : a.setWrapperTranslate(0, a.positions.start, 0);
            a.times.start = (new Date).getTime();
            x = void 0;
            0 < b.moveStartThreshold && (M = !1);
            if (b.onTouchStart) b.onTouchStart(a);
            a.callPlugins("onTouchStartEnd")
        }
    }

    function A(c) {
        if (a.isTouched && !b.onlyExternal && (!u || "mousemove" != c.type)) {
            var d = u ? c.targetTouches[0].pageX : c.pageX || c.clientX,
                e = u ? c.targetTouches[0].pageY : c.pageY || c.clientY;
            "undefined" ===
            typeof x && k && (x = !!(x || Math.abs(e - a.touches.startY) > Math.abs(d - a.touches.startX)));
            "undefined" !== typeof x || k || (x = !!(x || Math.abs(e - a.touches.startY) < Math.abs(d - a.touches.startX)));
            if (x) a.isTouched = !1;
            else if (c.assignedToSwiper) a.isTouched = !1;
            else if (c.assignedToSwiper = !0, a.isMoved = !0, b.preventLinks && (a.allowLinks = !1), b.onSlideClick && (a.allowSlideClick = !1), b.autoplay && a.stopAutoplay(), !u || 1 == c.touches.length) {
                a.callPlugins("onTouchMoveStart");
                c.preventDefault ? c.preventDefault() : c.returnValue = !1;
                a.touches.current =
                    k ? d : e;
                a.positions.current = (a.touches.current - a.touches.start) * b.touchRatio + a.positions.start;
                if (0 < a.positions.current && b.onResistanceBefore) b.onResistanceBefore(a, a.positions.current);
                if (a.positions.current < -h() && b.onResistanceAfter) b.onResistanceAfter(a, Math.abs(a.positions.current + h()));
                b.resistance && "100%" != b.resistance && (0 < a.positions.current && (c = 1 - a.positions.current / l / 2, a.positions.current = 0.5 > c ? l / 2 : a.positions.current * c), a.positions.current < -h() && (d = (a.touches.current - a.touches.start) * b.touchRatio +
                    (h() + a.positions.start), c = (l + d) / l, d = a.positions.current - d * (1 - c) / 2, e = -h() - l / 2, a.positions.current = d < e || 0 >= c ? e : d));
                b.resistance && "100%" == b.resistance && (0 < a.positions.current && (!b.freeMode || b.freeModeFluid) && (a.positions.current = 0), a.positions.current < -h() && (!b.freeMode || b.freeModeFluid) && (a.positions.current = -h()));
                if (b.followFinger) {
                    b.moveStartThreshold ? Math.abs(a.touches.current - a.touches.start) > b.moveStartThreshold || M ? (M = !0, k ? a.setWrapperTranslate(a.positions.current, 0, 0) : a.setWrapperTranslate(0,
                        a.positions.current, 0)) : a.positions.current = a.positions.start : k ? a.setWrapperTranslate(a.positions.current, 0, 0) : a.setWrapperTranslate(0, a.positions.current, 0);
                    (b.freeMode || b.watchActiveIndex) && a.updateActiveSlide(a.positions.current);
                    b.grabCursor && (a.container.style.cursor = "move", a.container.style.cursor = "grabbing", a.container.style.cursor = "-moz-grabbin", a.container.style.cursor = "-webkit-grabbing");
                    D || (D = a.touches.current);
                    H || (H = (new Date).getTime());
                    a.velocity = (a.touches.current - D) / ((new Date).getTime() -
                        H) / 2;
                    2 > Math.abs(a.touches.current - D) && (a.velocity = 0);
                    D = a.touches.current;
                    H = (new Date).getTime();
                    a.callPlugins("onTouchMoveEnd");
                    if (b.onTouchMove) b.onTouchMove(a);
                    return !1
                }
            }
        }
    }

    function B(c) {
        x && a.swipeReset();
        if (!b.onlyExternal && a.isTouched) {
            a.isTouched = !1;
            b.grabCursor && (a.container.style.cursor = "move", a.container.style.cursor = "grab", a.container.style.cursor = "-moz-grab", a.container.style.cursor = "-webkit-grab");
            a.positions.current || 0 === a.positions.current || (a.positions.current = a.positions.start);
            b.followFinger &&
                (k ? a.setWrapperTranslate(a.positions.current, 0, 0) : a.setWrapperTranslate(0, a.positions.current, 0));
            a.times.end = (new Date).getTime();
            a.touches.diff = a.touches.current - a.touches.start;
            a.touches.abs = Math.abs(a.touches.diff);
            a.positions.diff = a.positions.current - a.positions.start;
            a.positions.abs = Math.abs(a.positions.diff);
            var d = a.positions.diff,
                e = a.positions.abs;
            c = a.times.end - a.times.start;
            5 > e && (300 > c && !1 == a.allowLinks) && (b.freeMode || 0 == e || a.swipeReset(), b.preventLinks && (a.allowLinks = !0), b.onSlideClick &&
                (a.allowSlideClick = !0));
            setTimeout(function() {
                b.preventLinks && (a.allowLinks = !0);
                b.onSlideClick && (a.allowSlideClick = !0)
            }, 100);
            if (a.isMoved) {
                a.isMoved = !1;
                var f = h();
                if (0 < a.positions.current) a.swipeReset();
                else if (a.positions.current < -f) a.swipeReset();
                else if (b.freeMode) {
                    if (b.freeModeFluid) {
                        var e = 1E3 * b.momentumRatio,
                            d = a.positions.current + a.velocity * e,
                            g = !1,
                            F, m = 20 * Math.abs(a.velocity) * b.momentumBounceRatio;
                        d < -f && (b.momentumBounce && a.support.transitions ? (d + f < -m && (d = -f - m), F = -f, G = g = !0) : d = -f);
                        0 < d && (b.momentumBounce &&
                            a.support.transitions ? (d > m && (d = m), F = 0, G = g = !0) : d = 0);
                        0 != a.velocity && (e = Math.abs((d - a.positions.current) / a.velocity));
                        k ? a.setWrapperTranslate(d, 0, 0) : a.setWrapperTranslate(0, d, 0);
                        a.setWrapperTransition(e);
                        b.momentumBounce && g && a.wrapperTransitionEnd(function() {
                            if (G) {
                                if (b.onMomentumBounce) b.onMomentumBounce(a);
                                k ? a.setWrapperTranslate(F, 0, 0) : a.setWrapperTranslate(0, F, 0);
                                a.setWrapperTransition(300)
                            }
                        });
                        a.updateActiveSlide(d)
                    }(!b.freeModeFluid || 300 <= c) && a.updateActiveSlide(a.positions.current)
                } else {
                    E = 0 > d ? "toNext" :
                        "toPrev";
                    "toNext" == E && 300 >= c && (30 > e || !b.shortSwipes ? a.swipeReset() : a.swipeNext(!0));
                    "toPrev" == E && 300 >= c && (30 > e || !b.shortSwipes ? a.swipeReset() : a.swipePrev(!0));
                    f = 0;
                    if ("auto" == b.slidesPerView) {
                        for (var d = Math.abs(k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y")), q = g = 0; q < a.slides.length; q++)
                            if (m = k ? a.slides[q].getWidth(!0) : a.slides[q].getHeight(!0), g += m, g > d) {
                                f = m;
                                break
                            }
                        f > l && (f = l)
                    } else f = p * b.slidesPerView;
                    "toNext" == E && 300 < c && (e >= 0.5 * f ? a.swipeNext(!0) : a.swipeReset());
                    "toPrev" == E && 300 < c && (e >= 0.5 * f ?
                        a.swipePrev(!0) : a.swipeReset())
                }
                if (b.onTouchEnd) b.onTouchEnd(a);
                a.callPlugins("onTouchEnd")
            } else {
                a.isMoved = !1;
                if (b.onTouchEnd) b.onTouchEnd(a);
                a.callPlugins("onTouchEnd");
                a.swipeReset()
            }
        }
    }

    function I(c, d, e) {
        function f() {
            g += m;
            if (p = "toNext" == l ? g > c : g < c) k ? a.setWrapperTranslate(Math.round(g), 0) : a.setWrapperTranslate(0, Math.round(g)), a._DOMAnimating = !0, window.setTimeout(function() {
                f()
            }, 1E3 / 60);
            else {
                if (b.onSlideChangeEnd) b.onSlideChangeEnd(a);
                k ? a.setWrapperTranslate(c, 0) : a.setWrapperTranslate(0, c);
                a._DOMAnimating = !1
            }
        }
        if (a.support.transitions || !b.DOMAnimation) {
            k ? a.setWrapperTranslate(c, 0, 0) : a.setWrapperTranslate(0, c, 0);
            var h = "to" == d && 0 <= e.speed ? e.speed : b.speed;
            a.setWrapperTransition(h)
        } else {
            var g = k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y"),
                h = "to" == d && 0 <= e.speed ? e.speed : b.speed,
                m = Math.ceil((c - g) / h * (1E3 / 60)),
                l = g > c ? "toNext" : "toPrev",
                p = "toNext" == l ? g > c : g < c;
            if (a._DOMAnimating) return;
            f()
        }
        a.updateActiveSlide(c);
        if (b.onSlideNext && "next" == d) b.onSlideNext(a, c);
        if (b.onSlidePrev && "prev" == d) b.onSlidePrev(a, c);
        if (b.onSlideReset && "reset" == d) b.onSlideReset(a, c);
        ("next" == d || "prev" == d || "to" == d && !0 == e.runCallbacks) && W()
    }

    function W() {
        a.callPlugins("onSlideChangeStart");
        if (b.onSlideChangeStart)
            if (b.queueStartCallbacks && a.support.transitions) {
                if (a._queueStartCallbacks) return;
                a._queueStartCallbacks = !0;
                b.onSlideChangeStart(a);
                a.wrapperTransitionEnd(function() {
                    a._queueStartCallbacks = !1
                })
            } else b.onSlideChangeStart(a);
        b.onSlideChangeEnd && (a.support.transitions ? b.queueEndCallbacks ? a._queueEndCallbacks || (a._queueEndCallbacks = !0, a.wrapperTransitionEnd(b.onSlideChangeEnd)) : a.wrapperTransitionEnd(b.onSlideChangeEnd) : b.DOMAnimation || setTimeout(function() {
            b.onSlideChangeEnd(a)
        }, 10))
    }

    function U() {
        for (var b = a.paginationButtons, d = 0; d < b.length; d++) a.h.removeEventListener(b[d], "click", V, !1)
    }

    function V(b) {
        var d;
        b = b.target || b.srcElement;
        for (var e = a.paginationButtons, f = 0; f < e.length; f++) b === e[f] && (d = f);
        a.swipeTo(d)
    }
    if (document.body.__defineGetter__ && HTMLElement) {
        var s = HTMLElement.prototype;
        s.__defineGetter__ && s.__defineGetter__("outerHTML",
            function() {
                return (new XMLSerializer).serializeToString(this)
            })
    }
    window.getComputedStyle || (window.getComputedStyle = function(a, b) {
        this.el = a;
        this.getPropertyValue = function(b) {
            var d = /(\-([a-z]){1})/g;
            "float" === b && (b = "styleFloat");
            d.test(b) && (b = b.replace(d, function(a, b, c) {
                return c.toUpperCase()
            }));
            return a.currentStyle[b] ? a.currentStyle[b] : null
        };
        return this
    });
    Array.prototype.indexOf || (Array.prototype.indexOf = function(a, b) {
        for (var e = b || 0, f = this.length; e < f; e++)
            if (this[e] === a) return e;
        return -1
    });
    if ((document.querySelectorAll ||
            window.jQuery) && "undefined" !== typeof f && (f.nodeType || 0 !== g(f).length)) {
        var a = this;
        a.touches = {
            start: 0,
            startX: 0,
            startY: 0,
            current: 0,
            currentX: 0,
            currentY: 0,
            diff: 0,
            abs: 0
        };
        a.positions = {
            start: 0,
            abs: 0,
            diff: 0,
            current: 0
        };
        a.times = {
            start: 0,
            end: 0
        };
        a.id = (new Date).getTime();
        a.container = f.nodeType ? f : g(f)[0];
        a.isTouched = !1;
        a.isMoved = !1;
        a.activeIndex = 0;
        a.activeLoaderIndex = 0;
        a.activeLoopIndex = 0;
        a.previousIndex = null;
        a.velocity = 0;
        a.snapGrid = [];
        a.slidesGrid = [];
        a.imagesToLoad = [];
        a.imagesLoaded = 0;
        a.wrapperLeft = 0;
        a.wrapperRight =
            0;
        a.wrapperTop = 0;
        a.wrapperBottom = 0;
        var J, p, y, E, x, l, s = {
            mode: "horizontal",
            touchRatio: 1,
            speed: 300,
            freeMode: !1,
            freeModeFluid: !1,
            momentumRatio: 1,
            momentumBounce: !0,
            momentumBounceRatio: 1,
            slidesPerView: 1,
            slidesPerGroup: 1,
            simulateTouch: !0,
            followFinger: !0,
            shortSwipes: !0,
            moveStartThreshold: !1,
            autoplay: !1,
            onlyExternal: !1,
            createPagination: !0,
            pagination: !1,
            paginationElement: "span",
            paginationClickable: !1,
            paginationAsRange: !0,
            resistance: !0,
            scrollContainer: !1,
            preventLinks: !0,
            noSwiping: !1,
            noSwipingClass: "swiper-no-swiping",
            initialSlide: 0,
            keyboardControl: !1,
            mousewheelControl: !1,
            mousewheelDebounce: 600,
            useCSS3Transforms: !0,
            loop: !1,
            loopAdditionalSlides: 0,
            calculateHeight: !1,
            updateOnImagesReady: !0,
            releaseFormElements: !0,
            watchActiveIndex: !1,
            visibilityFullFit: !1,
            offsetPxBefore: 0,
            offsetPxAfter: 0,
            offsetSlidesBefore: 0,
            offsetSlidesAfter: 0,
            centeredSlides: !1,
            queueStartCallbacks: !1,
            queueEndCallbacks: !1,
            autoResize: !0,
            resizeReInit: !1,
            DOMAnimation: !0,
            loader: {
                slides: [],
                slidesHTMLType: "inner",
                surroundGroups: 1,
                logic: "reload",
                loadAllSlides: !1
            },
            slideElement: "div",
            slideClass: "swiper-slide",
            slideActiveClass: "swiper-slide-active",
            slideVisibleClass: "swiper-slide-visible",
            wrapperClass: "swiper-wrapper",
            paginationElementClass: "swiper-pagination-switch",
            paginationActiveClass: "swiper-active-switch",
            paginationVisibleClass: "swiper-visible-switch"
        };
        b = b || {};
        for (var q in s)
            if (q in b && "object" === typeof b[q])
                for (var C in s[q]) C in b[q] || (b[q][C] = s[q][C]);
            else q in b || (b[q] = s[q]);
        a.params = b;
        b.scrollContainer && (b.freeMode = !0, b.freeModeFluid = !0);
        b.loop && (b.resistance =
            "100%");
        var k = "horizontal" === b.mode;
        a.touchEvents = {
            touchStart: a.support.touch || !b.simulateTouch ? "touchstart" : a.browser.ie10 ? "MSPointerDown" : "mousedown",
            touchMove: a.support.touch || !b.simulateTouch ? "touchmove" : a.browser.ie10 ? "MSPointerMove" : "mousemove",
            touchEnd: a.support.touch || !b.simulateTouch ? "touchend" : a.browser.ie10 ? "MSPointerUp" : "mouseup"
        };
        for (q = a.container.childNodes.length - 1; 0 <= q; q--)
            if (a.container.childNodes[q].className)
                for (C = a.container.childNodes[q].className.split(" "), s = 0; s < C.length; s++) C[s] ===
                    b.wrapperClass && (J = a.container.childNodes[q]);
        a.wrapper = J;
        a._extendSwiperSlide = function(c) {
            c.append = function() {
                b.loop ? (c.insertAfter(a.slides.length - a.loopedSlides), a.removeLoopedSlides(), a.calcSlides(), a.createLoop()) : a.wrapper.appendChild(c);
                a.reInit();
                return c
            };
            c.prepend = function() {
                b.loop ? (a.wrapper.insertBefore(c, a.slides[a.loopedSlides]), a.removeLoopedSlides(), a.calcSlides(), a.createLoop()) : a.wrapper.insertBefore(c, a.wrapper.firstChild);
                a.reInit();
                return c
            };
            c.insertAfter = function(d) {
                if ("undefined" ===
                    typeof d) return !1;
                b.loop ? (d = a.slides[d + 1 + a.loopedSlides], a.wrapper.insertBefore(c, d), a.removeLoopedSlides(), a.calcSlides(), a.createLoop()) : (d = a.slides[d + 1], a.wrapper.insertBefore(c, d));
                a.reInit();
                return c
            };
            c.clone = function() {
                return a._extendSwiperSlide(c.cloneNode(!0))
            };
            c.remove = function() {
                a.wrapper.removeChild(c);
                a.reInit()
            };
            c.html = function(a) {
                if ("undefined" === typeof a) return c.innerHTML;
                c.innerHTML = a;
                return c
            };
            c.index = function() {
                for (var b, e = a.slides.length - 1; 0 <= e; e--) c === a.slides[e] && (b = e);
                return b
            };
            c.isActive = function() {
                return c.index() === a.activeIndex ? !0 : !1
            };
            c.swiperSlideDataStorage || (c.swiperSlideDataStorage = {});
            c.getData = function(a) {
                return c.swiperSlideDataStorage[a]
            };
            c.setData = function(a, b) {
                c.swiperSlideDataStorage[a] = b;
                return c
            };
            c.data = function(a, b) {
                return b ? (c.setAttribute("data-" + a, b), c) : c.getAttribute("data-" + a)
            };
            c.getWidth = function(b) {
                return a.h.getWidth(c, b)
            };
            c.getHeight = function(b) {
                return a.h.getHeight(c, b)
            };
            c.getOffset = function() {
                return a.h.getOffset(c)
            };
            return c
        };
        a.calcSlides = function(c) {
            var d =
                a.slides ? a.slides.length : !1;
            a.slides = [];
            a.displaySlides = [];
            for (var e = 0; e < a.wrapper.childNodes.length; e++)
                if (a.wrapper.childNodes[e].className)
                    for (var f = a.wrapper.childNodes[e].className.split(" "), g = 0; g < f.length; g++) f[g] === b.slideClass && a.slides.push(a.wrapper.childNodes[e]);
            for (e = a.slides.length - 1; 0 <= e; e--) a._extendSwiperSlide(a.slides[e]);
            d && (d !== a.slides.length || c) && (v(), t(), a.updateActiveSlide(), b.createPagination && a.params.pagination && a.createPagination(), a.callPlugins("numberOfSlidesChanged"))
        };
        a.createSlide = function(c, d, e) {
            d = d || a.params.slideClass;
            e = e || b.slideElement;
            e = document.createElement(e);
            e.innerHTML = c || "";
            e.className = d;
            return a._extendSwiperSlide(e)
        };
        a.appendSlide = function(b, d, e) {
            if (b) return b.nodeType ? a._extendSwiperSlide(b).append() : a.createSlide(b, d, e).append()
        };
        a.prependSlide = function(b, d, e) {
            if (b) return b.nodeType ? a._extendSwiperSlide(b).prepend() : a.createSlide(b, d, e).prepend()
        };
        a.insertSlideAfter = function(b, d, e, f) {
            return "undefined" === typeof b ? !1 : d.nodeType ? a._extendSwiperSlide(d).insertAfter(b) :
                a.createSlide(d, e, f).insertAfter(b)
        };
        a.removeSlide = function(c) {
            if (a.slides[c]) {
                if (b.loop) {
                    if (!a.slides[c + a.loopedSlides]) return !1;
                    a.slides[c + a.loopedSlides].remove();
                    a.removeLoopedSlides();
                    a.calcSlides();
                    a.createLoop()
                } else a.slides[c].remove();
                return !0
            }
            return !1
        };
        a.removeLastSlide = function() {
            return 0 < a.slides.length ? (b.loop ? (a.slides[a.slides.length - 1 - a.loopedSlides].remove(), a.removeLoopedSlides(), a.calcSlides(), a.createLoop()) : a.slides[a.slides.length - 1].remove(), !0) : !1
        };
        a.removeAllSlides = function() {
            for (var b =
                    a.slides.length - 1; 0 <= b; b--) a.slides[b].remove()
        };
        a.getSlide = function(b) {
            return a.slides[b]
        };
        a.getLastSlide = function() {
            return a.slides[a.slides.length - 1]
        };
        a.getFirstSlide = function() {
            return a.slides[0]
        };
        a.activeSlide = function() {
            return a.slides[a.activeIndex]
        };
        var K = [],
            L;
        for (L in a.plugins) b[L] && (q = a.plugins[L](a, b[L])) && K.push(q);
        a.callPlugins = function(a, b) {
            b || (b = {});
            for (var e = 0; e < K.length; e++)
                if (a in K[e]) K[e][a](b)
        };
        a.browser.ie10 && !b.onlyExternal && (k ? a.wrapper.classList.add("swiper-wp8-horizontal") :
            a.wrapper.classList.add("swiper-wp8-vertical"));
        b.freeMode && (a.container.className += " swiper-free-mode");
        a.initialized = !1;
        a.init = function(c, d) {
            var e = a.h.getWidth(a.container),
                f = a.h.getHeight(a.container);
            if (e !== a.width || f !== a.height || c) {
                a.width = e;
                a.height = f;
                l = k ? e : f;
                e = a.wrapper;
                c && a.calcSlides(d);
                if ("auto" === b.slidesPerView) {
                    var g = 0,
                        h = 0;
                    0 < b.slidesOffset && (e.style.paddingLeft = "", e.style.paddingRight = "", e.style.paddingTop = "", e.style.paddingBottom = "");
                    e.style.width = "";
                    e.style.height = "";
                    0 < b.offsetPxBefore &&
                        (k ? a.wrapperLeft = b.offsetPxBefore : a.wrapperTop = b.offsetPxBefore);
                    0 < b.offsetPxAfter && (k ? a.wrapperRight = b.offsetPxAfter : a.wrapperBottom = b.offsetPxAfter);
                    b.centeredSlides && (k ? (a.wrapperLeft = (l - this.slides[0].getWidth(!0)) / 2, a.wrapperRight = (l - a.slides[a.slides.length - 1].getWidth(!0)) / 2) : (a.wrapperTop = (l - a.slides[0].getHeight(!0)) / 2, a.wrapperBottom = (l - a.slides[a.slides.length - 1].getHeight(!0)) / 2));
                    k ? (0 <= a.wrapperLeft && (e.style.paddingLeft = a.wrapperLeft + "px"), 0 <= a.wrapperRight && (e.style.paddingRight = a.wrapperRight +
                        "px")) : (0 <= a.wrapperTop && (e.style.paddingTop = a.wrapperTop + "px"), 0 <= a.wrapperBottom && (e.style.paddingBottom = a.wrapperBottom + "px"));
                    var m = 0,
                        q = 0;
                    a.snapGrid = [];
                    a.slidesGrid = [];
                    for (var n = 0, r = 0; r < a.slides.length; r++) {
                        var f = a.slides[r].getWidth(!0),
                            s = a.slides[r].getHeight(!0);
                        b.calculateHeight && (n = Math.max(n, s));
                        var t = k ? f : s;
                        if (b.centeredSlides) {
                            var u = r === a.slides.length - 1 ? 0 : a.slides[r + 1].getWidth(!0),
                                w = r === a.slides.length - 1 ? 0 : a.slides[r + 1].getHeight(!0),
                                u = k ? u : w;
                            if (t > l) {
                                for (w = 0; w <= Math.floor(t / (l + a.wrapperLeft)); w++) 0 ===
                                    w ? a.snapGrid.push(m + a.wrapperLeft) : a.snapGrid.push(m + a.wrapperLeft + l * w);
                                a.slidesGrid.push(m + a.wrapperLeft)
                            } else a.snapGrid.push(q), a.slidesGrid.push(q);
                            q += t / 2 + u / 2
                        } else {
                            if (t > l)
                                for (w = 0; w <= Math.floor(t / l); w++) a.snapGrid.push(m + l * w);
                            else a.snapGrid.push(m);
                            a.slidesGrid.push(m)
                        }
                        m += t;
                        g += f;
                        h += s
                    }
                    b.calculateHeight && (a.height = n);
                    k ? (y = g + a.wrapperRight + a.wrapperLeft, e.style.width = g + "px", e.style.height = a.height + "px") : (y = h + a.wrapperTop + a.wrapperBottom, e.style.width = a.width + "px", e.style.height = h + "px")
                } else if (b.scrollContainer) e.style.width =
                    "", e.style.height = "", n = a.slides[0].getWidth(!0), g = a.slides[0].getHeight(!0), y = k ? n : g, e.style.width = n + "px", e.style.height = g + "px", p = k ? n : g;
                else {
                    if (b.calculateHeight) {
                        g = n = 0;
                        k || (a.container.style.height = "");
                        e.style.height = "";
                        for (r = 0; r < a.slides.length; r++) a.slides[r].style.height = "", n = Math.max(a.slides[r].getHeight(!0), n), k || (g += a.slides[r].getHeight(!0));
                        s = n;
                        a.height = s;
                        k ? g = s : (l = s, a.container.style.height = l + "px")
                    } else s = k ? a.height : a.height / b.slidesPerView, g = k ? a.height : a.slides.length * s;
                    f = k ? a.width / b.slidesPerView :
                        a.width;
                    n = k ? a.slides.length * f : a.width;
                    p = k ? f : s;
                    0 < b.offsetSlidesBefore && (k ? a.wrapperLeft = p * b.offsetSlidesBefore : a.wrapperTop = p * b.offsetSlidesBefore);
                    0 < b.offsetSlidesAfter && (k ? a.wrapperRight = p * b.offsetSlidesAfter : a.wrapperBottom = p * b.offsetSlidesAfter);
                    0 < b.offsetPxBefore && (k ? a.wrapperLeft = b.offsetPxBefore : a.wrapperTop = b.offsetPxBefore);
                    0 < b.offsetPxAfter && (k ? a.wrapperRight = b.offsetPxAfter : a.wrapperBottom = b.offsetPxAfter);
                    b.centeredSlides && (k ? (a.wrapperLeft = (l - p) / 2, a.wrapperRight = (l - p) / 2) : (a.wrapperTop =
                        (l - p) / 2, a.wrapperBottom = (l - p) / 2));
                    k ? (0 < a.wrapperLeft && (e.style.paddingLeft = a.wrapperLeft + "px"), 0 < a.wrapperRight && (e.style.paddingRight = a.wrapperRight + "px")) : (0 < a.wrapperTop && (e.style.paddingTop = a.wrapperTop + "px"), 0 < a.wrapperBottom && (e.style.paddingBottom = a.wrapperBottom + "px"));
                    y = k ? n + a.wrapperRight + a.wrapperLeft : g + a.wrapperTop + a.wrapperBottom;
                    e.style.width = n + "px";
                    e.style.height = g + "px";
                    m = 0;
                    a.snapGrid = [];
                    a.slidesGrid = [];
                    for (r = 0; r < a.slides.length; r++) a.snapGrid.push(m), a.slidesGrid.push(m), m += p, a.slides[r].style.width =
                        f + "px", a.slides[r].style.height = s + "px"
                }
                if (a.initialized) {
                    if (a.callPlugins("onInit"), b.onFirstInit) b.onInit(a)
                } else if (a.callPlugins("onFirstInit"), b.onFirstInit) b.onFirstInit(a);
                a.initialized = !0
            }
        };
        a.reInit = function(b) {
            a.init(!0, b)
        };
        a.resizeFix = function(c) {
            a.callPlugins("beforeResizeFix");
            a.init(b.resizeReInit || c);
            if (!b.freeMode) b.loop ? a.swipeTo(a.activeLoopIndex, 0, !1) : a.swipeTo(a.activeIndex, 0, !1);
            else if ((k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y")) < -h()) {
                c = k ? -h() : 0;
                var d = k ? 0 : -h();
                a.setWrapperTransition(0);
                a.setWrapperTranslate(c, d, 0)
            }
            a.callPlugins("afterResizeFix")
        };
        a.destroy = function(c) {
            a.browser.ie10 ? (a.h.removeEventListener(a.wrapper, a.touchEvents.touchStart, z, !1), a.h.removeEventListener(document, a.touchEvents.touchMove, A, !1), a.h.removeEventListener(document, a.touchEvents.touchEnd, B, !1)) : (a.support.touch && (a.h.removeEventListener(a.wrapper, "touchstart", z, !1), a.h.removeEventListener(a.wrapper, "touchmove", A, !1), a.h.removeEventListener(a.wrapper, "touchend", B, !1)), b.simulateTouch && (a.h.removeEventListener(a.wrapper,
                "mousedown", z, !1), a.h.removeEventListener(document, "mousemove", A, !1), a.h.removeEventListener(document, "mouseup", B, !1)));
            b.autoResize && a.h.removeEventListener(window, "resize", a.resizeFix, !1);
            v();
            b.paginationClickable && U();
            b.mousewheelControl && a._wheelEvent && a.h.removeEventListener(a.container, a._wheelEvent, N, !1);
            b.keyboardControl && a.h.removeEventListener(document, "keydown", O, !1);
            b.autoplay && a.stopAutoplay();
            a.callPlugins("onDestroy");
            a = null
        };
        b.grabCursor && (a.container.style.cursor = "move", a.container.style.cursor =
            "grab", a.container.style.cursor = "-moz-grab", a.container.style.cursor = "-webkit-grab");
        a.allowSlideClick = !0;
        a.allowLinks = !0;
        var u = !1,
            M, G = !0,
            D, H;
        a.swipeNext = function(c) {
            !c && b.loop && a.fixLoop();
            a.callPlugins("onSwipeNext");
            var d = c = k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y");
            if ("auto" == b.slidesPerView)
                for (var e = 0; e < a.snapGrid.length; e++) {
                    if (-c >= a.snapGrid[e] && -c < a.snapGrid[e + 1]) {
                        d = -a.snapGrid[e + 1];
                        break
                    }
                } else d = p * b.slidesPerGroup, d = -(Math.floor(Math.abs(c) / Math.floor(d)) * d + d);
            d < -h() && (d = -h());
            if (d == c) return !1;
            I(d, "next");
            return !0
        };
        a.swipePrev = function(c) {
            !c && b.loop && a.fixLoop();
            !c && b.autoplay && a.stopAutoplay();
            a.callPlugins("onSwipePrev");
            c = Math.ceil(k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y"));
            var d;
            if ("auto" == b.slidesPerView) {
                d = 0;
                for (var e = 1; e < a.snapGrid.length; e++) {
                    if (-c == a.snapGrid[e]) {
                        d = -a.snapGrid[e - 1];
                        break
                    }
                    if (-c > a.snapGrid[e] && -c < a.snapGrid[e + 1]) {
                        d = -a.snapGrid[e];
                        break
                    }
                }
            } else d = p * b.slidesPerGroup, d *= -(Math.ceil(-c / d) - 1);
            0 < d && (d = 0);
            if (d == c) return !1;
            I(d, "prev");
            return !0
        };
        a.swipeReset = function() {
            a.callPlugins("onSwipeReset");
            var c = k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y"),
                d = p * b.slidesPerGroup;
            h();
            if ("auto" == b.slidesPerView) {
                for (var e = d = 0; e < a.snapGrid.length; e++) {
                    if (-c === a.snapGrid[e]) return;
                    if (-c >= a.snapGrid[e] && -c < a.snapGrid[e + 1]) {
                        d = 0 < a.positions.diff ? -a.snapGrid[e + 1] : -a.snapGrid[e];
                        break
                    }
                } - c >= a.snapGrid[a.snapGrid.length - 1] && (d = -a.snapGrid[a.snapGrid.length - 1]);
                c <= -h() && (d = -h())
            } else d = 0 > c ? Math.round(c / d) * d : 0;
            b.scrollContainer && (d = 0 > c ? c : 0);
            d < -h() &&
                (d = -h());
            b.scrollContainer && l > p && (d = 0);
            if (d == c) return !1;
            I(d, "reset");
            return !0
        };
        a.swipeTo = function(c, d, e) {
            c = parseInt(c, 10);
            a.callPlugins("onSwipeTo", {
                index: c,
                speed: d
            });
            b.loop && (c += a.loopedSlides);
            var f = k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y");
            if (!(c > a.slides.length - 1 || 0 > c)) {
                var g;
                g = "auto" == b.slidesPerView ? -a.slidesGrid[c] : -c * p;
                g < -h() && (g = -h());
                if (g == f) return !1;
                I(g, "to", {
                    index: c,
                    speed: d,
                    runCallbacks: !1 === e ? !1 : !0
                });
                return !0
            }
        };
        a._queueStartCallbacks = !1;
        a._queueEndCallbacks = !1;
        a.updateActiveSlide =
            function(c) {
                if (a.initialized && 0 != a.slides.length) {
                    a.previousIndex = a.activeIndex;
                    0 < c && (c = 0);
                    "undefined" == typeof c && (c = k ? a.getWrapperTranslate("x") : a.getWrapperTranslate("y"));
                    if ("auto" == b.slidesPerView) {
                        if (a.activeIndex = a.slidesGrid.indexOf(-c), 0 > a.activeIndex) {
                            for (var d = 0; d < a.slidesGrid.length - 1 && !(-c > a.slidesGrid[d] && -c < a.slidesGrid[d + 1]); d++);
                            var e = Math.abs(a.slidesGrid[d] + c),
                                f = Math.abs(a.slidesGrid[d + 1] + c);
                            a.activeIndex = e <= f ? d : d + 1
                        }
                    } else a.activeIndex = b.visibilityFullFit ? Math.ceil(-c / p) : Math.round(-c /
                        p);
                    a.activeIndex == a.slides.length && (a.activeIndex = a.slides.length - 1);
                    0 > a.activeIndex && (a.activeIndex = 0);
                    if (a.slides[a.activeIndex]) {
                        a.calcVisibleSlides(c);
                        e = RegExp("\\s*" + b.slideActiveClass);
                        f = RegExp("\\s*" + b.slideVisibleClass);
                        for (d = 0; d < a.slides.length; d++) a.slides[d].className = a.slides[d].className.replace(e, "").replace(f, ""), 0 <= a.visibleSlides.indexOf(a.slides[d]) && (a.slides[d].className += " " + b.slideVisibleClass);
                        a.slides[a.activeIndex].className += " " + b.slideActiveClass;
                        b.loop ? (d = a.loopedSlides,
                            a.activeLoopIndex = a.activeIndex - d, a.activeLoopIndex >= a.slides.length - 2 * d && (a.activeLoopIndex = a.slides.length - 2 * d - a.activeLoopIndex), 0 > a.activeLoopIndex && (a.activeLoopIndex = a.slides.length - 2 * d + a.activeLoopIndex)) : a.activeLoopIndex = a.activeIndex;
                        b.pagination && a.updatePagination(c)
                    }
                }
            };
        a.createPagination = function(c) {
            b.paginationClickable && a.paginationButtons && U();
            var d = "",
                e = a.slides.length;
            b.loop && (e -= 2 * a.loopedSlides);
            for (var f = 0; f < e; f++) d += "<" + b.paginationElement + ' class="' + b.paginationElementClass +
                '"></' + b.paginationElement + ">";
            a.paginationContainer = b.pagination.nodeType ? b.pagination : g(b.pagination)[0];
            a.paginationContainer.innerHTML = d;
            a.paginationButtons = [];
            document.querySelectorAll ? a.paginationButtons = a.paginationContainer.querySelectorAll("." + b.paginationElementClass) : window.jQuery && (a.paginationButtons = g(a.paginationContainer).find("." + b.paginationElementClass));
            c || a.updatePagination();
            a.callPlugins("onCreatePagination");
            if (b.paginationClickable)
                for (c = a.paginationButtons, d = 0; d < c.length; d++) a.h.addEventListener(c[d],
                    "click", V, !1)
        };
        a.updatePagination = function(c) {
            if (b.pagination && !(1 > a.slides.length)) {
                if (document.querySelectorAll) var d = a.paginationContainer.querySelectorAll("." + b.paginationActiveClass);
                else window.jQuery && (d = g(a.paginationContainer).find("." + b.paginationActiveClass));
                if (d && (d = a.paginationButtons, 0 != d.length)) {
                    for (var e = 0; e < d.length; e++) d[e].className = b.paginationElementClass;
                    var f = b.loop ? a.loopedSlides : 0;
                    if (b.paginationAsRange) {
                        a.visibleSlides || a.calcVisibleSlides(c);
                        c = [];
                        for (e = 0; e < a.visibleSlides.length; e++) {
                            var h =
                                a.slides.indexOf(a.visibleSlides[e]) - f;
                            b.loop && 0 > h && (h = a.slides.length - 2 * a.loopedSlides + h);
                            b.loop && h >= a.slides.length - 2 * a.loopedSlides && (h = a.slides.length - 2 * a.loopedSlides - h, h = Math.abs(h));
                            c.push(h)
                        }
                        for (e = 0; e < c.length; e++) d[c[e]] && (d[c[e]].className += " " + b.paginationVisibleClass);
                        b.loop ? d[a.activeLoopIndex].className += " " + b.paginationActiveClass : d[a.activeIndex].className += " " + b.paginationActiveClass
                    } else b.loop ? d[a.activeLoopIndex].className += " " + b.paginationActiveClass + " " + b.paginationVisibleClass :
                        d[a.activeIndex].className += " " + b.paginationActiveClass + " " + b.paginationVisibleClass
                }
            }
        };
        a.calcVisibleSlides = function(c) {
            var d = [],
                e = 0,
                f = 0,
                g = 0;
            k && 0 < a.wrapperLeft && (c += a.wrapperLeft);
            !k && 0 < a.wrapperTop && (c += a.wrapperTop);
            for (var h = 0; h < a.slides.length; h++) {
                var e = e + f,
                    f = "auto" == b.slidesPerView ? k ? a.h.getWidth(a.slides[h], !0) : a.h.getHeight(a.slides[h], !0) : p,
                    g = e + f,
                    m = !1;
                b.visibilityFullFit ? (e >= -c && g <= -c + l && (m = !0), e <= -c && g >= -c + l && (m = !0)) : (g > -c && g <= -c + l && (m = !0), e >= -c && e < -c + l && (m = !0), e < -c && g > -c + l && (m = !0));
                m &&
                    d.push(a.slides[h])
            }
            0 == d.length && (d = [a.slides[a.activeIndex]]);
            a.visibleSlides = d
        };
        a.autoPlayIntervalId = void 0;
        a.startAutoplay = function() {
            if ("undefined" !== typeof a.autoPlayIntervalId) return !1;
            b.autoplay && !b.loop && (a.autoPlayIntervalId = setInterval(function() {
                a.swipeNext(!0) || a.swipeTo(0)
            }, b.autoplay));
            b.autoplay && b.loop && (a.autoPlayIntervalId = setInterval(function() {
                a.swipeNext()
            }, b.autoplay));
            a.callPlugins("onAutoplayStart")
        };
        a.stopAutoplay = function() {
            a.autoPlayIntervalId && clearInterval(a.autoPlayIntervalId);
            a.autoPlayIntervalId = void 0;
            a.callPlugins("onAutoplayStop")
        };
        a.loopCreated = !1;
        a.removeLoopedSlides = function() {
            if (a.loopCreated)
                for (var b = 0; b < a.slides.length; b++) !0 === a.slides[b].getData("looped") && a.wrapper.removeChild(a.slides[b])
        };
        a.createLoop = function() {
            if (0 != a.slides.length) {
                a.loopedSlides = b.slidesPerView + b.loopAdditionalSlides;
                for (var c = "", d = "", e = 0; e < a.loopedSlides; e++) c += a.slides[e].outerHTML;
                for (e = a.slides.length - a.loopedSlides; e < a.slides.length; e++) d += a.slides[e].outerHTML;
                J.innerHTML = d + J.innerHTML +
                    c;
                a.loopCreated = !0;
                a.calcSlides();
                for (e = 0; e < a.slides.length; e++)(e < a.loopedSlides || e >= a.slides.length - a.loopedSlides) && a.slides[e].setData("looped", !0);
                a.callPlugins("onCreateLoop")
            }
        };
        a.fixLoop = function() {
            if (a.activeIndex < a.loopedSlides) {
                var c = a.slides.length - 3 * a.loopedSlides + a.activeIndex;
                a.swipeTo(c, 0, !1)
            } else a.activeIndex > a.slides.length - 2 * b.slidesPerView && (c = -a.slides.length + a.activeIndex + a.loopedSlides, a.swipeTo(c, 0, !1))
        };
        a.loadSlides = function() {
            var c = "";
            a.activeLoaderIndex = 0;
            for (var d = b.loader.slides,
                    e = b.loader.loadAllSlides ? d.length : b.slidesPerView * (1 + b.loader.surroundGroups), f = 0; f < e; f++) c = "outer" == b.loader.slidesHTMLType ? c + d[f] : c + ("<" + b.slideElement + ' class="' + b.slideClass + '" data-swiperindex="' + f + '">' + d[f] + "</" + b.slideElement + ">");
            a.wrapper.innerHTML = c;
            a.calcSlides(!0);
            b.loader.loadAllSlides || a.wrapperTransitionEnd(a.reloadSlides, !0)
        };
        a.reloadSlides = function() {
            var c = b.loader.slides,
                d = parseInt(a.activeSlide().data("swiperindex"), 10);
            if (!(0 > d || d > c.length - 1)) {
                a.activeLoaderIndex = d;
                var e = Math.max(0,
                        d - b.slidesPerView * b.loader.surroundGroups),
                    f = Math.min(d + b.slidesPerView * (1 + b.loader.surroundGroups) - 1, c.length - 1);
                0 < d && (d = -p * (d - e), k ? a.setWrapperTranslate(d, 0, 0) : a.setWrapperTranslate(0, d, 0), a.setWrapperTransition(0));
                if ("reload" === b.loader.logic) {
                    for (var g = a.wrapper.innerHTML = "", d = e; d <= f; d++) g += "outer" == b.loader.slidesHTMLType ? c[d] : "<" + b.slideElement + ' class="' + b.slideClass + '" data-swiperindex="' + d + '">' + c[d] + "</" + b.slideElement + ">";
                    a.wrapper.innerHTML = g
                } else {
                    for (var g = 1E3, h = 0, d = 0; d < a.slides.length; d++) {
                        var l =
                            a.slides[d].data("swiperindex");
                        l < e || l > f ? a.wrapper.removeChild(a.slides[d]) : (g = Math.min(l, g), h = Math.max(l, h))
                    }
                    for (d = e; d <= f; d++) d < g && (e = document.createElement(b.slideElement), e.className = b.slideClass, e.setAttribute("data-swiperindex", d), e.innerHTML = c[d], a.wrapper.insertBefore(e, a.wrapper.firstChild)), d > h && (e = document.createElement(b.slideElement), e.className = b.slideClass, e.setAttribute("data-swiperindex", d), e.innerHTML = c[d], a.wrapper.appendChild(e))
                }
                a.reInit(!0)
            }
        };
        a.calcSlides();
        0 < b.loader.slides.length &&
            0 == a.slides.length && a.loadSlides();
        b.loop && a.createLoop();
        a.init();
        n();
        b.pagination && b.createPagination && a.createPagination(!0);
        b.loop || 0 < b.initialSlide ? a.swipeTo(b.initialSlide, 0, !1) : a.updateActiveSlide(0);
        b.autoplay && a.startAutoplay()
    }
};
Swiper.prototype = {
    plugins: {},
    wrapperTransitionEnd: function(f, b) {
        function g() {
            f(h);
            h.params.queueEndCallbacks && (h._queueEndCallbacks = !1);
            if (!b)
                for (var v = 0; v < t.length; v++) h.h.removeEventListener(n, t[v], g, !1)
        }
        var h = this,
            n = h.wrapper,
            t = ["webkitTransitionEnd", "transitionend", "oTransitionEnd", "MSTransitionEnd", "msTransitionEnd"];
        if (f)
            for (var v = 0; v < t.length; v++) h.h.addEventListener(n, t[v], g, !1)
    },
    getWrapperTranslate: function(f) {
        var b = this.wrapper,
            g, h, n = window.WebKitCSSMatrix ? new WebKitCSSMatrix(window.getComputedStyle(b,
                null).webkitTransform) : window.getComputedStyle(b, null).MozTransform || window.getComputedStyle(b, null).OTransform || window.getComputedStyle(b, null).MsTransform || window.getComputedStyle(b, null).msTransform || window.getComputedStyle(b, null).transform || window.getComputedStyle(b, null).getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
        g = n.toString().split(",");
        this.params.useCSS3Transforms ? ("x" == f && (h = 16 == g.length ? parseFloat(g[12]) : window.WebKitCSSMatrix ? n.m41 : parseFloat(g[4])), "y" ==
            f && (h = 16 == g.length ? parseFloat(g[13]) : window.WebKitCSSMatrix ? n.m42 : parseFloat(g[5]))) : ("x" == f && (h = parseFloat(b.style.left, 10) || 0), "y" == f && (h = parseFloat(b.style.top, 10) || 0));
        return h || 0
    },
    setWrapperTranslate: function(f, b, g) {
        var h = this.wrapper.style;
        f = f || 0;
        b = b || 0;
        g = g || 0;
        this.params.useCSS3Transforms ? this.support.transforms3d ? h.webkitTransform = h.MsTransform = h.msTransform = h.MozTransform = h.OTransform = h.transform = "translate3d(" + f + "px, " + b + "px, " + g + "px)" : (h.webkitTransform = h.MsTransform = h.msTransform = h.MozTransform =
            h.OTransform = h.transform = "translate(" + f + "px, " + b + "px)", this.support.transforms || (h.left = f + "px", h.top = b + "px")) : (h.left = f + "px", h.top = b + "px");
        this.callPlugins("onSetWrapperTransform", {
            x: f,
            y: b,
            z: g
        })
    },
    setWrapperTransition: function(f) {
        var b = this.wrapper.style;
        b.webkitTransitionDuration = b.MsTransitionDuration = b.msTransitionDuration = b.MozTransitionDuration = b.OTransitionDuration = b.transitionDuration = f / 1E3 + "s";
        this.callPlugins("onSetWrapperTransition", {
            duration: f
        })
    },
    h: {
        getWidth: function(f, b) {
            var g = window.getComputedStyle(f,
                    null).getPropertyValue("width"),
                h = parseFloat(g);
            if (isNaN(h) || 0 < g.indexOf("%")) h = f.offsetWidth - parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-left")) - parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-right"));
            b && (h += parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-left")) + parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-right")));
            return h
        },
        getHeight: function(f, b) {
            if (b) return f.offsetHeight;
            var g = window.getComputedStyle(f,
                    null).getPropertyValue("height"),
                h = parseFloat(g);
            if (isNaN(h) || 0 < g.indexOf("%")) h = f.offsetHeight - parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-top")) - parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-bottom"));
            b && (h += parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-top")) + parseFloat(window.getComputedStyle(f, null).getPropertyValue("padding-bottom")));
            return h
        },
        getOffset: function(f) {
            var b = f.getBoundingClientRect(),
                g = document.body,
                h = f.clientTop ||
                g.clientTop || 0,
                g = f.clientLeft || g.clientLeft || 0,
                n = window.pageYOffset || f.scrollTop;
            f = window.pageXOffset || f.scrollLeft;
            document.documentElement && !window.pageYOffset && (n = document.documentElement.scrollTop, f = document.documentElement.scrollLeft);
            return {
                top: b.top + n - h,
                left: b.left + f - g
            }
        },
        windowWidth: function() {
            if (window.innerWidth) return window.innerWidth;
            if (document.documentElement && document.documentElement.clientWidth) return document.documentElement.clientWidth
        },
        windowHeight: function() {
            if (window.innerHeight) return window.innerHeight;
            if (document.documentElement && document.documentElement.clientHeight) return document.documentElement.clientHeight
        },
        windowScroll: function() {
            if ("undefined" != typeof pageYOffset) return {
                left: window.pageXOffset,
                top: window.pageYOffset
            };
            if (document.documentElement) return {
                left: document.documentElement.scrollLeft,
                top: document.documentElement.scrollTop
            }
        },
        addEventListener: function(f, b, g, h) {
            f.addEventListener ? f.addEventListener(b, g, h) : f.attachEvent && f.attachEvent("on" + b, g)
        },
        removeEventListener: function(f, b, g, h) {
            f.removeEventListener ?
                f.removeEventListener(b, g, h) : f.detachEvent && f.detachEvent("on" + b, g)
        }
    },
    setTransform: function(f, b) {
        var g = f.style;
        g.webkitTransform = g.MsTransform = g.msTransform = g.MozTransform = g.OTransform = g.transform = b
    },
    setTranslate: function(f, b) {
        var g = f.style,
            h = b.x || 0,
            n = b.y || 0,
            t = b.z || 0;
        g.webkitTransform = g.MsTransform = g.msTransform = g.MozTransform = g.OTransform = g.transform = this.support.transforms3d ? "translate3d(" + h + "px," + n + "px," + t + "px)" : "translate(" + h + "px," + n + "px)";
        this.support.transforms || (g.left = h + "px", g.top = n + "px")
    },
    setTransition: function(f, b) {
        var g = f.style;
        g.webkitTransitionDuration = g.MsTransitionDuration = g.msTransitionDuration = g.MozTransitionDuration = g.OTransitionDuration = g.transitionDuration = b + "ms"
    },
    support: {
        touch: window.Modernizr && !0 === Modernizr.touch || function() {
            return !!("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch)
        }(),
        transforms3d: window.Modernizr && !0 === Modernizr.csstransforms3d || function() {
            var f = document.createElement("div");
            return "webkitPerspective" in f.style || "MozPerspective" in
                f.style || "OPerspective" in f.style || "MsPerspective" in f.style || "perspective" in f.style
        }(),
        transforms: window.Modernizr && !0 === Modernizr.csstransforms || function() {
            var f = document.createElement("div").style;
            return "transform" in f || "WebkitTransform" in f || "MozTransform" in f || "msTransform" in f || "MsTransform" in f || "OTransform" in f
        }(),
        transitions: window.Modernizr && !0 === Modernizr.csstransitions || function() {
            var f = document.createElement("div").style;
            return "transition" in f || "WebkitTransition" in f || "MozTransition" in
                f || "msTransition" in f || "MsTransition" in f || "OTransition" in f
        }()
    },
    browser: {
        ie8: function() {
            var f = -1;
            "Microsoft Internet Explorer" == navigator.appName && null != /MSIE ([0-9]{1,}[.0-9]{0,})/.exec(navigator.userAgent) && (f = parseFloat(RegExp.$1));
            return -1 != f && 9 > f
        }(),
        ie10: window.navigator.msPointerEnabled
    }
};
(window.jQuery || window.Zepto) && function(f) {
    f.fn.swiper = function(b) {
        b = new Swiper(f(this)[0], b);
        f(this).data("swiper", b);
        return b
    }
}(window.jQuery || window.Zepto);
"undefined" !== typeof module && (module.exports = Swiper);
/*global jQuery */
/*!	
 * Lettering.JS 0.6.1
 *
 * Copyright 2010, Dave Rupert http://daverupert.com
 * Released under the WTFPL license 
 * http://sam.zoy.org/wtfpl/
 *
 * Thanks to Paul Irish - http://paulirish.com - for the feedback.
 *
 * Date: Mon Sep 20 17:14:00 2010 -0600
 */
(function($) {
    function injector(t, splitter, klass, after) {
        var a = t.text().split(splitter),
            inject = '';
        if (a.length) {
            $(a).each(function(i, item) {
                inject += '<span class="' + klass + (i + 1) + '">' + item + '</span>' + after
            });
            t.empty().append(inject)
        }
    }
    var methods = {
        init: function() {
            return this.each(function() {
                injector($(this), '', 'char', '')
            })
        },
        words: function() {
            return this.each(function() {
                injector($(this), ' ', 'word', ' ')
            })
        },
        lines: function() {
            return this.each(function() {
                var r = "eefec303079ad17405c889e092e105b0";
                injector($(this).children("br").replaceWith(r).end(), r, 'line', '')
            })
        }
    };
    $.fn.lettering = function(method) {
        if (method && methods[method]) {
            return methods[method].apply(this, [].slice.call(arguments, 1))
        } else if (method === 'letters' || !method) {
            return methods.init.apply(this, [].slice.call(arguments, 0))
        }
        $.error('Method ' + method + ' does not exist on jQuery.lettering');
        return this
    }
})(jQuery);
/*
 * textillate.js
 * http://jschr.github.com/textillate
 * MIT licensed
 *
 * Copyright (C) 2012-2013 Jordan Schroter
 */

(function($) {
    "use strict";

    function isInEffect(effect) {
        return /In/.test(effect) || $.inArray(effect, $.fn.textillate.defaults.inEffects) >= 0;
    };

    function isOutEffect(effect) {
        return /Out/.test(effect) || $.inArray(effect, $.fn.textillate.defaults.outEffects) >= 0;
    };

    // custom get data api method
    function getData(node) {
        var attrs = node.attributes || [],
            data = {};

        if (!attrs.length) return data;

        $.each(attrs, function(i, attr) {
            if (/^data-in-*/.test(attr.nodeName)) {
                data.in = data.in || {};
                data.in[attr.nodeName.replace(/data-in-/, '')] = attr.nodeValue;
            } else if (/^data-out-*/.test(attr.nodeName)) {
                data.out = data.out || {};
                data.out[attr.nodeName.replace(/data-out-/, '')] = attr.nodeValue;
            } else if (/^data-*/.test(attr.nodeName)) {
                data[attr.nodeName] = attr.nodeValue;
            }
        })

        return data;
    }

    function shuffle(o) {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    function animate($c, effect, cb) {
        $c.addClass('animated ' + effect)
            .css('visibility', 'visible')
            .show();

        $c.one('animationend webkitAnimationEnd oAnimationEnd', function() {
            $c.removeClass('animated ' + effect);
            cb && cb();
        });
    }

    function animateChars($chars, options, cb) {
        var that = this,
            count = $chars.length;

        if (!count) {
            cb && cb();
            return;
        }

        if (options.shuffle) $chars = shuffle($chars);
        if (options.reverse) $chars = $chars.toArray().reverse();

        $.each($chars, function(i, c) {
            var $char = $(c);

            function complete() {
                if (isInEffect(options.effect)) {
                    $char.css('visibility', 'visible');
                } else if (isOutEffect(options.effect)) {
                    $char.css('visibility', 'hidden');
                }
                count -= 1;
                if (!count && cb) cb();
            }

            var delay = options.sync ? options.delay : options.delay * i * options.delayScale;

            $char.text() ?
                setTimeout(function() {
                    animate($char, options.effect, complete)
                }, delay) :
                complete();
        });
    };

    var Textillate = function(element, options) {
        var base = this,
            $element = $(element);

        base.init = function() {
            base.$texts = $element.find(options.selector);

            if (!base.$texts.length) {
                base.$texts = $('<ul class="texts"><li>' + $element.html() + '</li></ul>');
                $element.html(base.$texts);
            }

            base.$texts.hide();

            base.$current = $('<span>')
                .text(base.$texts.find(':first-child').html())
                .prependTo($element);

            if (isInEffect(options.effect)) {
                base.$current.css('visibility', 'hidden');
            } else if (isOutEffect(options.effect)) {
                base.$current.css('visibility', 'visible');
            }

            base.setOptions(options);

            setTimeout(function() {
                base.options.autoStart && base.start();
            }, base.options.initialDelay)
        };

        base.setOptions = function(options) {
            base.options = options;
        };

        base.triggerEvent = function(name) {
            var e = $.Event(name + '.tlt');
            $element.trigger(e, base);
            return e;
        };

        base.in = function(index, cb) {
            index = index || 0;

            var $elem = base.$texts.find(':nth-child(' + (index + 1) + ')'),
                options = $.extend({}, base.options, getData($elem)),
                $chars;

            $elem.addClass('current');

            base.triggerEvent('inAnimationBegin');

            base.$current
                .text($elem.html())
                .lettering('words');

            base.$current.find('[class^="word"]')
                .css({
                    'display': 'inline-block',
                    // fix for poor ios performance
                    '-webkit-transform': 'translate3d(0,0,0)',
                    '-moz-transform': 'translate3d(0,0,0)',
                    '-o-transform': 'translate3d(0,0,0)',
                    'transform': 'translate3d(0,0,0)'
                })
                .each(function() {
                    $(this).lettering()
                });

            $chars = base.$current
                .find('[class^="char"]')
                .css('display', 'inline-block');

            if (isInEffect(options.in.effect)) {
                $chars.css('visibility', 'hidden');
            } else if (isOutEffect(options.in.effect)) {
                $chars.css('visibility', 'visible');
            }

            base.currentIndex = index;

            animateChars($chars, options.in, function() {
                base.triggerEvent('inAnimationEnd');
                if (options.in.callback) options.in.callback();
                if (cb) cb(base);
            });
        };

        base.out = function(cb) {
            var $elem = base.$texts.find(':nth-child(' + (base.currentIndex + 1) + ')'),
                $chars = base.$current.find('[class^="char"]'),
                options = $.extend({}, base.options, getData($elem));

            base.triggerEvent('outAnimationBegin');

            animateChars($chars, options.out, function() {
                $elem.removeClass('current');
                base.triggerEvent('outAnimationEnd');
                if (options.out.callback) options.out.callback();
                if (cb) cb(base);
            });
        };

        base.start = function(index) {
            base.triggerEvent('start');

            (function run(index) {
                base.in(index, function() {
                    var length = base.$texts.children().length;

                    index += 1;

                    if (!base.options.loop && index >= length) {
                        if (base.options.callback) base.options.callback();
                        base.triggerEvent('end');
                    } else {
                        index = index % length;

                        setTimeout(function() {
                            base.out(function() {
                                run(index)
                            });
                        }, base.options.minDisplayTime);
                    }
                });
            }(index || 0));
        };

        base.init();
    }

    $.fn.textillate = function(settings, args) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('textillate'),
                options = $.extend(true, {}, $.fn.textillate.defaults, getData(this), typeof settings == 'object' && settings);

            if (!data) {
                $this.data('textillate', (data = new Textillate(this, options)));
            } else if (typeof settings == 'string') {
                data[settings].apply(data, [].concat(args));
            } else {
                data.setOptions.call(data, options);
            }
        })
    };

    $.fn.textillate.defaults = {
        selector: '.texts',
        loop: false,
        minDisplayTime: 2000,
        initialDelay: 0,
        in: {
            effect: 'fadeInLeftBig',
            delayScale: 1.5,
            delay: 50,
            sync: false,
            reverse: false,
            shuffle: false,
            callback: function() {}
        },
        out: {
            effect: 'hinge',
            delayScale: 1.5,
            delay: 50,
            sync: false,
            reverse: false,
            shuffle: false,
            callback: function() {}
        },
        autoStart: true,
        inEffects: [],
        outEffects: ['hinge'],
        callback: function() {}
    };

}(jQuery));
// jquery.tweet.js - See http://tweet.seaofclouds.com/ or https://github.com/seaofclouds/tweet for more info
// Copyright (c) 2008-2012 Todd Matthews & Steve Purcell
// Modified by Stan Scates for https://github.com/StanScates/Tweet.js-Mod

(function(factory) {
    if (typeof define === 'function' && define.amd) define(['jquery'], factory);
    else factory(jQuery)
}(function($) {
    $.fn.tweet = function(o) {
        var s = $.extend({
            modpath: "./twitter/",
            username: null,
            list_id: null,
            list: null,
            favorites: false,
            query: null,
            avatar_size: null,
            count: 3,
            fetch: null,
            page: 1,
            retweets: true,
            intro_text: null,
            outro_text: null,
            join_text: null,
            auto_join_text_default: "i said,",
            auto_join_text_ed: "i",
            auto_join_text_ing: "i am",
            auto_join_text_reply: "i replied to",
            auto_join_text_url: "i was looking at",
            loading_text: null,
            refresh_interval: null,
            twitter_url: "twitter.com",
            twitter_api_url: "api.twitter.com",
            twitter_search_url: "search.twitter.com",
            template: "{avatar}{time}{join}{text}",
            comparator: function(tweet1, tweet2) {
                return tweet2["tweet_time"] - tweet1["tweet_time"]
            },
            filter: function(tweet) {
                return true
            }
        }, o);
        var url_regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

        function t(template, info) {
            if (typeof template === "string") {
                var result = template;
                for (var key in info) {
                    var val = info[key];
                    result = result.replace(new RegExp('{' + key + '}', 'g'), val === null ? '' : val)
                }
                return result
            } else return template(info)
        }
        $.extend({
            tweet: {
                t: t
            }
        });

        function replacer(regex, replacement) {
            return function() {
                var returning = [];
                this.each(function() {
                    returning.push(this.replace(regex, replacement))
                });
                return $(returning)
            }
        }

        function escapeHTML(s) {
            return s.replace(/</g, "&lt;").replace(/>/g, "^&gt;")
        }
        $.fn.extend({
            linkUser: replacer(/(^|[\W])@(\w+)/gi, "$1<span class=\"at\">@</span><a href=\"http://" + s.twitter_url + "/$2\">$2</a>"),
            linkHash: replacer(/(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi, ' <a href="http://' + s.twitter_search_url + '/search?q=&tag=$1&lang=all' + ((s.username && s.username.length == 1 && !s.list) ? '&from=' + s.username.join("%2BOR%2B") : '') + '" class="tweet_hashtag">#$1</a>'),
            makeHeart: replacer(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>")
        });

        function linkURLs(text, entities) {
            return text.replace(url_regexp, function(match) {
                var url = (/^[a-z]+:/i).test(match) ? match : "http://" + match;
                var text = match;
                for (var i = 0; i < entities.length; ++i) {
                    var entity = entities[i];
                    if (entity.url == url && entity.expanded_url) {
                        url = entity.expanded_url;
                        text = entity.display_url;
                        break
                    }
                }
                return "<a href=\"" + escapeHTML(url) + "\">" + escapeHTML(text) + "</a>"
            })
        }

        function parse_date(date_str) {
            return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'))
        }

        function relative_time(date) {
            var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
            var delta = parseInt((relative_to.getTime() - date) / 1000, 10);
            var r = '';
            if (delta < 1) {
                r = 'just now'
            } else if (delta < 60) {
                r = delta + ' seconds ago'
            } else if (delta < 120) {
                r = 'about a minute ago'
            } else if (delta < (45 * 60)) {
                r = 'about ' + (parseInt(delta / 60, 10)).toString() + ' minutes ago'
            } else if (delta < (2 * 60 * 60)) {
                r = 'about an hour ago'
            } else if (delta < (24 * 60 * 60)) {
                r = 'about ' + (parseInt(delta / 3600, 10)).toString() + ' hours ago'
            } else if (delta < (48 * 60 * 60)) {
                r = 'about a day ago'
            } else {
                r = 'about ' + (parseInt(delta / 86400, 10)).toString() + ' days ago'
            }
            return r
        }

        function build_auto_join_text(text) {
            if (text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
                return s.auto_join_text_reply
            } else if (text.match(url_regexp)) {
                return s.auto_join_text_url
            } else if (text.match(/^((\w+ed)|just) .*/im)) {
                return s.auto_join_text_ed
            } else if (text.match(/^(\w*ing) .*/i)) {
                return s.auto_join_text_ing
            } else {
                return s.auto_join_text_default
            }
        }

        function build_api_request() {
            var modpath = s.modpath,
                count = (s.fetch === null) ? s.count : s.fetch,
                defaults = {
                    include_entities: 1
                };
            if (s.list) {
                return {
                    host: s.twitter_api_url,
                    url: "/1.1/lists/statuses.json",
                    parameters: $.extend({}, defaults, {
                        list_id: s.list_id,
                        slug: s.list,
                        owner_screen_name: s.username,
                        page: s.page,
                        count: count,
                        include_rts: (s.retweets ? 1 : 0)
                    })
                }
            } else if (s.favorites) {
                return {
                    host: s.twitter_api_url,
                    url: "/1.1/favorites/list.json",
                    parameters: $.extend({}, defaults, {
                        list_id: s.list_id,
                        screen_name: s.username,
                        page: s.page,
                        count: count
                    })
                }
            } else if (s.query === null && s.username.length === 1) {
                return {
                    host: s.twitter_api_url,
                    url: "/1.1/statuses/user_timeline.json",
                    parameters: $.extend({}, defaults, {
                        screen_name: s.username,
                        page: s.page,
                        count: count,
                        include_rts: (s.retweets ? 1 : 0)
                    })
                }
            } else {
                var query = (s.query || 'from:' + s.username.join(' OR from:'));
                return {
                    host: s.twitter_search_url,
                    url: "/search.json",
                    parameters: $.extend({}, defaults, {
                        page: s.page,
                        q: query,
                        rpp: count
                    })
                }
            }
        }

        function extract_avatar_url(item, secure) {
            if (secure) {
                return ('user' in item) ? item.user.profile_image_url_https : extract_avatar_url(item, false).replace(/^http:\/\/[a-z0-9]{1,3}\.twimg\.com\//, "https://s3.amazonaws.com/twitter_production/")
            } else {
                return item.profile_image_url || item.user.profile_image_url
            }
        }

        function extract_template_data(item) {
            var o = {};
            o.item = item;
            o.source = item.source;
            o.name = item.from_user_name || item.user.name;
            o.screen_name = item.from_user || item.user.screen_name;
            o.avatar_size = s.avatar_size;
            o.avatar_url = extract_avatar_url(item, (document.location.protocol === 'https:'));
            o.retweet = typeof(item.retweeted_status) != 'undefined';
            o.tweet_time = parse_date(item.created_at);
            o.join_text = s.join_text == "auto" ? build_auto_join_text(item.text) : s.join_text;
            o.tweet_id = item.id_str;
            o.twitter_base = "http://" + s.twitter_url + "/";
            o.user_url = o.twitter_base + o.screen_name;
            o.tweet_url = o.user_url + "/status/" + o.tweet_id;
            o.reply_url = o.twitter_base + "intent/tweet?in_reply_to=" + o.tweet_id;
            o.retweet_url = o.twitter_base + "intent/retweet?tweet_id=" + o.tweet_id;
            o.favorite_url = o.twitter_base + "intent/favorite?tweet_id=" + o.tweet_id;
            o.retweeted_screen_name = o.retweet && item.retweeted_status.user.screen_name;
            o.tweet_relative_time = relative_time(o.tweet_time);
            o.entities = item.entities ? (item.entities.urls || []).concat(item.entities.media || []) : [];
            o.tweet_raw_text = o.retweet ? ('RT @' + o.retweeted_screen_name + ' ' + item.retweeted_status.text) : item.text;
            o.tweet_text = $([linkURLs(o.tweet_raw_text, o.entities)]).linkUser().linkHash()[0];
            o.tweet_text_fancy = $([o.tweet_text]).makeHeart()[0];
            o.user = t('<a class="tweet_user" href="{user_url}">{screen_name}</a>', o);
            o.join = s.join_text ? t(' <span class="tweet_join">{join_text}</span> ', o) : ' ';
            o.avatar = o.avatar_size ? t('<a class="tweet_avatar" href="{user_url}"><img src="{avatar_url}" height="{avatar_size}" width="{avatar_size}" alt="{screen_name}\'s avatar" title="{screen_name}\'s avatar" border="0"/></a>', o) : '';
            o.time = t('<span class="tweet_time"><a href="{tweet_url}" title="view tweet on twitter">{tweet_relative_time}</a></span>', o);
            o.text = t('<span class="tweet_text">{tweet_text_fancy}</span>', o);
            o.reply_action = t('<a class="tweet_action tweet_reply" href="{reply_url}">reply</a>', o);
            o.retweet_action = t('<a class="tweet_action tweet_retweet" href="{retweet_url}">retweet</a>', o);
            o.favorite_action = t('<a class="tweet_action tweet_favorite" href="{favorite_url}">favorite</a>', o);
            return o
        }
        return this.each(function(i, widget) {
            var list = $('<ul class="tweet_list">');
            var intro = '<p class="tweet_intro">' + s.intro_text + '</p>';
            var outro = '<p class="tweet_outro">' + s.outro_text + '</p>';
            var loading = $('<p class="loading">' + s.loading_text + '</p>');
            if (s.username && typeof(s.username) == "string") {
                s.username = [s.username]
            }
            $(widget).unbind("tweet:load").bind("tweet:load", function() {
                if (s.loading_text) $(widget).empty().append(loading);
                $.ajax({
                    dataType: "json",
                    type: "post",
                    async: false,
                    url: s.modpath || "/twitter/",
                    data: {
                        request: build_api_request()
                    },
                    success: function(data, status) {
                        if (data.message) {
                            console.log(data.message)
                        }
                        var response = data.response;
                        $(widget).empty().append(list);
                        if (s.intro_text) list.before(intro);
                        list.empty();
                        if (response.statuses !== undefined) {
                            resp = response.statuses
                        } else if (response.results !== undefined) {
                            resp = response.results
                        } else {
                            resp = response
                        }
                        var tweets = $.map(resp, extract_template_data);
                        tweets = $.grep(tweets, s.filter).sort(s.comparator).slice(0, s.count);
                        list.append($.map(tweets, function(o) {
                            return "<li>" + t(s.template, o) + "</li>"
                        }).join('')).children('li:first').addClass('tweet_first').end().children('li:odd').addClass('tweet_even').end().children('li:even').addClass('tweet_odd');
                        if (s.outro_text) list.after(outro);
                        $(widget).trigger("loaded").trigger((tweets ? "empty" : "full"));
                        if (s.refresh_interval) {
                            window.setTimeout(function() {
                                $(widget).trigger("tweet:load")
                            }, 1000 * s.refresh_interval)
                        }
                    }
                })
            }).trigger("tweet:load")
        })
    }
}));
/*! Magnific Popup - v0.9.9 - 2013-12-27
 * http://dimsemenov.com/plugins/magnific-popup/
 * Copyright (c) 2013 Dmitry Semenov; */
(function(e) {
    var t, n, i, o, r, a, s, l = "Close",
        c = "BeforeClose",
        d = "AfterClose",
        u = "BeforeAppend",
        p = "MarkupParse",
        f = "Open",
        m = "Change",
        g = "mfp",
        h = "." + g,
        v = "mfp-ready",
        C = "mfp-removing",
        y = "mfp-prevent-close",
        w = function() {},
        b = !!window.jQuery,
        I = e(window),
        x = function(e, n) {
            t.ev.on(g + e + h, n)
        },
        k = function(t, n, i, o) {
            var r = document.createElement("div");
            return r.className = "mfp-" + t, i && (r.innerHTML = i), o ? n && n.appendChild(r) : (r = e(r), n && r.appendTo(n)), r
        },
        T = function(n, i) {
            t.ev.triggerHandler(g + n, i), t.st.callbacks && (n = n.charAt(0).toLowerCase() + n.slice(1), t.st.callbacks[n] && t.st.callbacks[n].apply(t, e.isArray(i) ? i : [i]))
        },
        E = function(n) {
            return n === s && t.currTemplate.closeBtn || (t.currTemplate.closeBtn = e(t.st.closeMarkup.replace("%title%", t.st.tClose)), s = n), t.currTemplate.closeBtn
        },
        _ = function() {
            e.magnificPopup.instance || (t = new w, t.init(), e.magnificPopup.instance = t)
        },
        S = function() {
            var e = document.createElement("p").style,
                t = ["ms", "O", "Moz", "Webkit"];
            if (void 0 !== e.transition) return !0;
            for (; t.length;)
                if (t.pop() + "Transition" in e) return !0;
            return !1
        };
    w.prototype = {
        constructor: w,
        init: function() {
            var n = navigator.appVersion;
            t.isIE7 = -1 !== n.indexOf("MSIE 7."), t.isIE8 = -1 !== n.indexOf("MSIE 8."), t.isLowIE = t.isIE7 || t.isIE8, t.isAndroid = /android/gi.test(n), t.isIOS = /iphone|ipad|ipod/gi.test(n), t.supportsTransition = S(), t.probablyMobile = t.isAndroid || t.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent), o = e(document), t.popupsCache = {}
        },
        open: function(n) {
            i || (i = e(document.body));
            var r;
            if (n.isObj === !1) {
                t.items = n.items.toArray(), t.index = 0;
                var s, l = n.items;
                for (r = 0; l.length > r; r++)
                    if (s = l[r], s.parsed && (s = s.el[0]), s === n.el[0]) {
                        t.index = r;
                        break
                    }
            } else t.items = e.isArray(n.items) ? n.items : [n.items], t.index = n.index || 0;
            if (t.isOpen) return t.updateItemHTML(), void 0;
            t.types = [], a = "", t.ev = n.mainEl && n.mainEl.length ? n.mainEl.eq(0) : o, n.key ? (t.popupsCache[n.key] || (t.popupsCache[n.key] = {}), t.currTemplate = t.popupsCache[n.key]) : t.currTemplate = {}, t.st = e.extend(!0, {}, e.magnificPopup.defaults, n), t.fixedContentPos = "auto" === t.st.fixedContentPos ? !t.probablyMobile : t.st.fixedContentPos, t.st.modal && (t.st.closeOnContentClick = !1, t.st.closeOnBgClick = !1, t.st.showCloseBtn = !1, t.st.enableEscapeKey = !1), t.bgOverlay || (t.bgOverlay = k("bg").on("click" + h, function() {
                t.close()
            }), t.wrap = k("wrap").attr("tabindex", -1).on("click" + h, function(e) {
                t._checkIfClose(e.target) && t.close()
            }), t.container = k("container", t.wrap)), t.contentContainer = k("content"), t.st.preloader && (t.preloader = k("preloader", t.container, t.st.tLoading));
            var c = e.magnificPopup.modules;
            for (r = 0; c.length > r; r++) {
                var d = c[r];
                d = d.charAt(0).toUpperCase() + d.slice(1), t["init" + d].call(t)
            }
            T("BeforeOpen"), t.st.showCloseBtn && (t.st.closeBtnInside ? (x(p, function(e, t, n, i) {
                n.close_replaceWith = E(i.type)
            }), a += " mfp-close-btn-in") : t.wrap.append(E())), t.st.alignTop && (a += " mfp-align-top"), t.fixedContentPos ? t.wrap.css({
                overflow: t.st.overflowY,
                overflowX: "hidden",
                overflowY: t.st.overflowY
            }) : t.wrap.css({
                top: I.scrollTop(),
                position: "absolute"
            }), (t.st.fixedBgPos === !1 || "auto" === t.st.fixedBgPos && !t.fixedContentPos) && t.bgOverlay.css({
                height: o.height(),
                position: "absolute"
            }), t.st.enableEscapeKey && o.on("keyup" + h, function(e) {
                27 === e.keyCode && t.close()
            }), I.on("resize" + h, function() {
                t.updateSize()
            }), t.st.closeOnContentClick || (a += " mfp-auto-cursor"), a && t.wrap.addClass(a);
            var u = t.wH = I.height(),
                m = {};
            if (t.fixedContentPos && t._hasScrollBar(u)) {
                var g = t._getScrollbarSize();
                g && (m.marginRight = g)
            }
            t.fixedContentPos && (t.isIE7 ? e("body, html").css("overflow", "hidden") : m.overflow = "hidden");
            var C = t.st.mainClass;
            return t.isIE7 && (C += " mfp-ie7"), C && t._addClassToMFP(C), t.updateItemHTML(), T("BuildControls"), e("html").css(m), t.bgOverlay.add(t.wrap).prependTo(t.st.prependTo || i), t._lastFocusedEl = document.activeElement, setTimeout(function() {
                t.content ? (t._addClassToMFP(v), t._setFocus()) : t.bgOverlay.addClass(v), o.on("focusin" + h, t._onFocusIn)
            }, 16), t.isOpen = !0, t.updateSize(u), T(f), n
        },
        close: function() {
            t.isOpen && (T(c), t.isOpen = !1, t.st.removalDelay && !t.isLowIE && t.supportsTransition ? (t._addClassToMFP(C), setTimeout(function() {
                t._close()
            }, t.st.removalDelay)) : t._close())
        },
        _close: function() {
            T(l);
            var n = C + " " + v + " ";
            if (t.bgOverlay.detach(), t.wrap.detach(), t.container.empty(), t.st.mainClass && (n += t.st.mainClass + " "), t._removeClassFromMFP(n), t.fixedContentPos) {
                var i = {
                    marginRight: ""
                };
                t.isIE7 ? e("body, html").css("overflow", "") : i.overflow = "", e("html").css(i)
            }
            o.off("keyup" + h + " focusin" + h), t.ev.off(h), t.wrap.attr("class", "mfp-wrap").removeAttr("style"), t.bgOverlay.attr("class", "mfp-bg"), t.container.attr("class", "mfp-container"), !t.st.showCloseBtn || t.st.closeBtnInside && t.currTemplate[t.currItem.type] !== !0 || t.currTemplate.closeBtn && t.currTemplate.closeBtn.detach(), t._lastFocusedEl && e(t._lastFocusedEl).focus(), t.currItem = null, t.content = null, t.currTemplate = null, t.prevHeight = 0, T(d)
        },
        updateSize: function(e) {
            if (t.isIOS) {
                var n = document.documentElement.clientWidth / window.innerWidth,
                    i = window.innerHeight * n;
                t.wrap.css("height", i), t.wH = i
            } else t.wH = e || I.height();
            t.fixedContentPos || t.wrap.css("height", t.wH), T("Resize")
        },
        updateItemHTML: function() {
            var n = t.items[t.index];
            t.contentContainer.detach(), t.content && t.content.detach(), n.parsed || (n = t.parseEl(t.index));
            var i = n.type;
            if (T("BeforeChange", [t.currItem ? t.currItem.type : "", i]), t.currItem = n, !t.currTemplate[i]) {
                var o = t.st[i] ? t.st[i].markup : !1;
                T("FirstMarkupParse", o), t.currTemplate[i] = o ? e(o) : !0
            }
            r && r !== n.type && t.container.removeClass("mfp-" + r + "-holder");
            var a = t["get" + i.charAt(0).toUpperCase() + i.slice(1)](n, t.currTemplate[i]);
            t.appendContent(a, i), n.preloaded = !0, T(m, n), r = n.type, t.container.prepend(t.contentContainer), T("AfterChange")
        },
        appendContent: function(e, n) {
            t.content = e, e ? t.st.showCloseBtn && t.st.closeBtnInside && t.currTemplate[n] === !0 ? t.content.find(".mfp-close").length || t.content.append(E()) : t.content = e : t.content = "", T(u), t.container.addClass("mfp-" + n + "-holder"), t.contentContainer.append(t.content)
        },
        parseEl: function(n) {
            var i, o = t.items[n];
            if (o.tagName ? o = {
                    el: e(o)
                } : (i = o.type, o = {
                    data: o,
                    src: o.src
                }), o.el) {
                for (var r = t.types, a = 0; r.length > a; a++)
                    if (o.el.hasClass("mfp-" + r[a])) {
                        i = r[a];
                        break
                    }
                o.src = o.el.attr("data-mfp-src"), o.src || (o.src = o.el.attr("href"))
            }
            return o.type = i || t.st.type || "inline", o.index = n, o.parsed = !0, t.items[n] = o, T("ElementParse", o), t.items[n]
        },
        addGroup: function(e, n) {
            var i = function(i) {
                i.mfpEl = this, t._openClick(i, e, n)
            };
            n || (n = {});
            var o = "click.magnificPopup";
            n.mainEl = e, n.items ? (n.isObj = !0, e.off(o).on(o, i)) : (n.isObj = !1, n.delegate ? e.off(o).on(o, n.delegate, i) : (n.items = e, e.off(o).on(o, i)))
        },
        _openClick: function(n, i, o) {
            var r = void 0 !== o.midClick ? o.midClick : e.magnificPopup.defaults.midClick;
            if (r || 2 !== n.which && !n.ctrlKey && !n.metaKey) {
                var a = void 0 !== o.disableOn ? o.disableOn : e.magnificPopup.defaults.disableOn;
                if (a)
                    if (e.isFunction(a)) {
                        if (!a.call(t)) return !0
                    } else if (a > I.width()) return !0;
                n.type && (n.preventDefault(), t.isOpen && n.stopPropagation()), o.el = e(n.mfpEl), o.delegate && (o.items = i.find(o.delegate)), t.open(o)
            }
        },
        updateStatus: function(e, i) {
            if (t.preloader) {
                n !== e && t.container.removeClass("mfp-s-" + n), i || "loading" !== e || (i = t.st.tLoading);
                var o = {
                    status: e,
                    text: i
                };
                T("UpdateStatus", o), e = o.status, i = o.text, t.preloader.html(i), t.preloader.find("a").on("click", function(e) {
                    e.stopImmediatePropagation()
                }), t.container.addClass("mfp-s-" + e), n = e
            }
        },
        _checkIfClose: function(n) {
            if (!e(n).hasClass(y)) {
                var i = t.st.closeOnContentClick,
                    o = t.st.closeOnBgClick;
                if (i && o) return !0;
                if (!t.content || e(n).hasClass("mfp-close") || t.preloader && n === t.preloader[0]) return !0;
                if (n === t.content[0] || e.contains(t.content[0], n)) {
                    if (i) return !0
                } else if (o && e.contains(document, n)) return !0;
                return !1
            }
        },
        _addClassToMFP: function(e) {
            t.bgOverlay.addClass(e), t.wrap.addClass(e)
        },
        _removeClassFromMFP: function(e) {
            this.bgOverlay.removeClass(e), t.wrap.removeClass(e)
        },
        _hasScrollBar: function(e) {
            return (t.isIE7 ? o.height() : document.body.scrollHeight) > (e || I.height())
        },
        _setFocus: function() {
            (t.st.focus ? t.content.find(t.st.focus).eq(0) : t.wrap).focus()
        },
        _onFocusIn: function(n) {
            return n.target === t.wrap[0] || e.contains(t.wrap[0], n.target) ? void 0 : (t._setFocus(), !1)
        },
        _parseMarkup: function(t, n, i) {
            var o;
            i.data && (n = e.extend(i.data, n)), T(p, [t, n, i]), e.each(n, function(e, n) {
                if (void 0 === n || n === !1) return !0;
                if (o = e.split("_"), o.length > 1) {
                    var i = t.find(h + "-" + o[0]);
                    if (i.length > 0) {
                        var r = o[1];
                        "replaceWith" === r ? i[0] !== n[0] && i.replaceWith(n) : "img" === r ? i.is("img") ? i.attr("src", n) : i.replaceWith('<img src="' + n + '" class="' + i.attr("class") + '" />') : i.attr(o[1], n)
                    }
                } else t.find(h + "-" + e).html(n)
            })
        },
        _getScrollbarSize: function() {
            if (void 0 === t.scrollbarSize) {
                var e = document.createElement("div");
                e.id = "mfp-sbm", e.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;", document.body.appendChild(e), t.scrollbarSize = e.offsetWidth - e.clientWidth, document.body.removeChild(e)
            }
            return t.scrollbarSize
        }
    }, e.magnificPopup = {
        instance: null,
        proto: w.prototype,
        modules: [],
        open: function(t, n) {
            return _(), t = t ? e.extend(!0, {}, t) : {}, t.isObj = !0, t.index = n || 0, this.instance.open(t)
        },
        close: function() {
            return e.magnificPopup.instance && e.magnificPopup.instance.close()
        },
        registerModule: function(t, n) {
            n.options && (e.magnificPopup.defaults[t] = n.options), e.extend(this.proto, n.proto), this.modules.push(t)
        },
        defaults: {
            disableOn: 0,
            key: null,
            midClick: !1,
            mainClass: "",
            preloader: !0,
            focus: "",
            closeOnContentClick: !1,
            closeOnBgClick: !0,
            closeBtnInside: !0,
            showCloseBtn: !0,
            enableEscapeKey: !0,
            modal: !1,
            alignTop: !1,
            removalDelay: 0,
            prependTo: null,
            fixedContentPos: "auto",
            fixedBgPos: "auto",
            overflowY: "auto",
            closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',
            tClose: "Close (Esc)",
            tLoading: "Loading..."
        }
    }, e.fn.magnificPopup = function(n) {
        _();
        var i = e(this);
        if ("string" == typeof n)
            if ("open" === n) {
                var o, r = b ? i.data("magnificPopup") : i[0].magnificPopup,
                    a = parseInt(arguments[1], 10) || 0;
                r.items ? o = r.items[a] : (o = i, r.delegate && (o = o.find(r.delegate)), o = o.eq(a)), t._openClick({
                    mfpEl: o
                }, i, r)
            } else t.isOpen && t[n].apply(t, Array.prototype.slice.call(arguments, 1));
        else n = e.extend(!0, {}, n), b ? i.data("magnificPopup", n) : i[0].magnificPopup = n, t.addGroup(i, n);
        return i
    };
    var P, O, z, M = "inline",
        B = function() {
            z && (O.after(z.addClass(P)).detach(), z = null)
        };
    e.magnificPopup.registerModule(M, {
        options: {
            hiddenClass: "hide",
            markup: "",
            tNotFound: "Content not found"
        },
        proto: {
            initInline: function() {
                t.types.push(M), x(l + "." + M, function() {
                    B()
                })
            },
            getInline: function(n, i) {
                if (B(), n.src) {
                    var o = t.st.inline,
                        r = e(n.src);
                    if (r.length) {
                        var a = r[0].parentNode;
                        a && a.tagName && (O || (P = o.hiddenClass, O = k(P), P = "mfp-" + P), z = r.after(O).detach().removeClass(P)), t.updateStatus("ready")
                    } else t.updateStatus("error", o.tNotFound), r = e("<div>");
                    return n.inlineElement = r, r
                }
                return t.updateStatus("ready"), t._parseMarkup(i, {}, n), i
            }
        }
    });
    var F, H = "ajax",
        L = function() {
            F && i.removeClass(F)
        },
        A = function() {
            L(), t.req && t.req.abort()
        };
    e.magnificPopup.registerModule(H, {
        options: {
            settings: null,
            cursor: "mfp-ajax-cur",
            tError: '<a href="%url%">The content</a> could not be loaded.'
        },
        proto: {
            initAjax: function() {
                t.types.push(H), F = t.st.ajax.cursor, x(l + "." + H, A), x("BeforeChange." + H, A)
            },
            getAjax: function(n) {
                F && i.addClass(F), t.updateStatus("loading");
                var o = e.extend({
                    url: n.src,
                    success: function(i, o, r) {
                        var a = {
                            data: i,
                            xhr: r
                        };
                        T("ParseAjax", a), t.appendContent(e(a.data), H), n.finished = !0, L(), t._setFocus(), setTimeout(function() {
                            t.wrap.addClass(v)
                        }, 16), t.updateStatus("ready"), T("AjaxContentAdded")
                    },
                    error: function() {
                        L(), n.finished = n.loadError = !0, t.updateStatus("error", t.st.ajax.tError.replace("%url%", n.src))
                    }
                }, t.st.ajax.settings);
                return t.req = e.ajax(o), ""
            }
        }
    });
    var j, N = function(n) {
        if (n.data && void 0 !== n.data.title) return n.data.title;
        var i = t.st.image.titleSrc;
        if (i) {
            if (e.isFunction(i)) return i.call(t, n);
            if (n.el) return n.el.attr(i) || ""
        }
        return ""
    };
    e.magnificPopup.registerModule("image", {
        options: {
            markup: '<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',
            cursor: "mfp-zoom-out-cur",
            titleSrc: "title",
            verticalFit: !0,
            tError: '<a href="%url%">The image</a> could not be loaded.'
        },
        proto: {
            initImage: function() {
                var e = t.st.image,
                    n = ".image";
                t.types.push("image"), x(f + n, function() {
                    "image" === t.currItem.type && e.cursor && i.addClass(e.cursor)
                }), x(l + n, function() {
                    e.cursor && i.removeClass(e.cursor), I.off("resize" + h)
                }), x("Resize" + n, t.resizeImage), t.isLowIE && x("AfterChange", t.resizeImage)
            },
            resizeImage: function() {
                var e = t.currItem;
                if (e && e.img && t.st.image.verticalFit) {
                    var n = 0;
                    t.isLowIE && (n = parseInt(e.img.css("padding-top"), 10) + parseInt(e.img.css("padding-bottom"), 10)), e.img.css("max-height", t.wH - n)
                }
            },
            _onImageHasSize: function(e) {
                e.img && (e.hasSize = !0, j && clearInterval(j), e.isCheckingImgSize = !1, T("ImageHasSize", e), e.imgHidden && (t.content && t.content.removeClass("mfp-loading"), e.imgHidden = !1))
            },
            findImageSize: function(e) {
                var n = 0,
                    i = e.img[0],
                    o = function(r) {
                        j && clearInterval(j), j = setInterval(function() {
                            return i.naturalWidth > 0 ? (t._onImageHasSize(e), void 0) : (n > 200 && clearInterval(j), n++, 3 === n ? o(10) : 40 === n ? o(50) : 100 === n && o(500), void 0)
                        }, r)
                    };
                o(1)
            },
            getImage: function(n, i) {
                var o = 0,
                    r = function() {
                        n && (n.img[0].complete ? (n.img.off(".mfploader"), n === t.currItem && (t._onImageHasSize(n), t.updateStatus("ready")), n.hasSize = !0, n.loaded = !0, T("ImageLoadComplete")) : (o++, 200 > o ? setTimeout(r, 100) : a()))
                    },
                    a = function() {
                        n && (n.img.off(".mfploader"), n === t.currItem && (t._onImageHasSize(n), t.updateStatus("error", s.tError.replace("%url%", n.src))), n.hasSize = !0, n.loaded = !0, n.loadError = !0)
                    },
                    s = t.st.image,
                    l = i.find(".mfp-img");
                if (l.length) {
                    var c = document.createElement("img");
                    c.className = "mfp-img", n.img = e(c).on("load.mfploader", r).on("error.mfploader", a), c.src = n.src, l.is("img") && (n.img = n.img.clone()), c = n.img[0], c.naturalWidth > 0 ? n.hasSize = !0 : c.width || (n.hasSize = !1)
                }
                return t._parseMarkup(i, {
                    title: N(n),
                    img_replaceWith: n.img
                }, n), t.resizeImage(), n.hasSize ? (j && clearInterval(j), n.loadError ? (i.addClass("mfp-loading"), t.updateStatus("error", s.tError.replace("%url%", n.src))) : (i.removeClass("mfp-loading"), t.updateStatus("ready")), i) : (t.updateStatus("loading"), n.loading = !0, n.hasSize || (n.imgHidden = !0, i.addClass("mfp-loading"), t.findImageSize(n)), i)
            }
        }
    });
    var W, R = function() {
        return void 0 === W && (W = void 0 !== document.createElement("p").style.MozTransform), W
    };
    e.magnificPopup.registerModule("zoom", {
        options: {
            enabled: !1,
            easing: "ease-in-out",
            duration: 300,
            opener: function(e) {
                return e.is("img") ? e : e.find("img")
            }
        },
        proto: {
            initZoom: function() {
                var e, n = t.st.zoom,
                    i = ".zoom";
                if (n.enabled && t.supportsTransition) {
                    var o, r, a = n.duration,
                        s = function(e) {
                            var t = e.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),
                                i = "all " + n.duration / 1e3 + "s " + n.easing,
                                o = {
                                    position: "fixed",
                                    zIndex: 9999,
                                    left: 0,
                                    top: 0,
                                    "-webkit-backface-visibility": "hidden"
                                },
                                r = "transition";
                            return o["-webkit-" + r] = o["-moz-" + r] = o["-o-" + r] = o[r] = i, t.css(o), t
                        },
                        d = function() {
                            t.content.css("visibility", "visible")
                        };
                    x("BuildControls" + i, function() {
                        if (t._allowZoom()) {
                            if (clearTimeout(o), t.content.css("visibility", "hidden"), e = t._getItemToZoom(), !e) return d(), void 0;
                            r = s(e), r.css(t._getOffset()), t.wrap.append(r), o = setTimeout(function() {
                                r.css(t._getOffset(!0)), o = setTimeout(function() {
                                    d(), setTimeout(function() {
                                        r.remove(), e = r = null, T("ZoomAnimationEnded")
                                    }, 16)
                                }, a)
                            }, 16)
                        }
                    }), x(c + i, function() {
                        if (t._allowZoom()) {
                            if (clearTimeout(o), t.st.removalDelay = a, !e) {
                                if (e = t._getItemToZoom(), !e) return;
                                r = s(e)
                            }
                            r.css(t._getOffset(!0)), t.wrap.append(r), t.content.css("visibility", "hidden"), setTimeout(function() {
                                r.css(t._getOffset())
                            }, 16)
                        }
                    }), x(l + i, function() {
                        t._allowZoom() && (d(), r && r.remove(), e = null)
                    })
                }
            },
            _allowZoom: function() {
                return "image" === t.currItem.type
            },
            _getItemToZoom: function() {
                return t.currItem.hasSize ? t.currItem.img : !1
            },
            _getOffset: function(n) {
                var i;
                i = n ? t.currItem.img : t.st.zoom.opener(t.currItem.el || t.currItem);
                var o = i.offset(),
                    r = parseInt(i.css("padding-top"), 10),
                    a = parseInt(i.css("padding-bottom"), 10);
                o.top -= e(window).scrollTop() - r;
                var s = {
                    width: i.width(),
                    height: (b ? i.innerHeight() : i[0].offsetHeight) - a - r
                };
                return R() ? s["-moz-transform"] = s.transform = "translate(" + o.left + "px," + o.top + "px)" : (s.left = o.left, s.top = o.top), s
            }
        }
    });
    var Z = "iframe",
        q = "//about:blank",
        D = function(e) {
            if (t.currTemplate[Z]) {
                var n = t.currTemplate[Z].find("iframe");
                n.length && (e || (n[0].src = q), t.isIE8 && n.css("display", e ? "block" : "none"))
            }
        };
    e.magnificPopup.registerModule(Z, {
        options: {
            markup: '<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',
            srcAction: "iframe_src",
            patterns: {
                youtube: {
                    index: "youtube.com",
                    id: "v=",
                    src: "//www.youtube.com/embed/%id%?autoplay=1"
                },
                vimeo: {
                    index: "vimeo.com/",
                    id: "/",
                    src: "//player.vimeo.com/video/%id%?autoplay=1"
                },
                gmaps: {
                    index: "//maps.google.",
                    src: "%id%&output=embed"
                }
            }
        },
        proto: {
            initIframe: function() {
                t.types.push(Z), x("BeforeChange", function(e, t, n) {
                    t !== n && (t === Z ? D() : n === Z && D(!0))
                }), x(l + "." + Z, function() {
                    D()
                })
            },
            getIframe: function(n, i) {
                var o = n.src,
                    r = t.st.iframe;
                e.each(r.patterns, function() {
                    return o.indexOf(this.index) > -1 ? (this.id && (o = "string" == typeof this.id ? o.substr(o.lastIndexOf(this.id) + this.id.length, o.length) : this.id.call(this, o)), o = this.src.replace("%id%", o), !1) : void 0
                });
                var a = {};
                return r.srcAction && (a[r.srcAction] = o), t._parseMarkup(i, a, n), t.updateStatus("ready"), i
            }
        }
    });
    var K = function(e) {
            var n = t.items.length;
            return e > n - 1 ? e - n : 0 > e ? n + e : e
        },
        Y = function(e, t, n) {
            return e.replace(/%curr%/gi, t + 1).replace(/%total%/gi, n)
        };
    e.magnificPopup.registerModule("gallery", {
        options: {
            enabled: !1,
            arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
            preload: [0, 2],
            navigateByImgClick: !0,
            arrows: !0,
            tPrev: "Previous (Left arrow key)",
            tNext: "Next (Right arrow key)",
            tCounter: "%curr% of %total%"
        },
        proto: {
            initGallery: function() {
                var n = t.st.gallery,
                    i = ".mfp-gallery",
                    r = Boolean(e.fn.mfpFastClick);
                return t.direction = !0, n && n.enabled ? (a += " mfp-gallery", x(f + i, function() {
                    n.navigateByImgClick && t.wrap.on("click" + i, ".mfp-img", function() {
                        return t.items.length > 1 ? (t.next(), !1) : void 0
                    }), o.on("keydown" + i, function(e) {
                        37 === e.keyCode ? t.prev() : 39 === e.keyCode && t.next()
                    })
                }), x("UpdateStatus" + i, function(e, n) {
                    n.text && (n.text = Y(n.text, t.currItem.index, t.items.length))
                }), x(p + i, function(e, i, o, r) {
                    var a = t.items.length;
                    o.counter = a > 1 ? Y(n.tCounter, r.index, a) : ""
                }), x("BuildControls" + i, function() {
                    if (t.items.length > 1 && n.arrows && !t.arrowLeft) {
                        var i = n.arrowMarkup,
                            o = t.arrowLeft = e(i.replace(/%title%/gi, n.tPrev).replace(/%dir%/gi, "left")).addClass(y),
                            a = t.arrowRight = e(i.replace(/%title%/gi, n.tNext).replace(/%dir%/gi, "right")).addClass(y),
                            s = r ? "mfpFastClick" : "click";
                        o[s](function() {
                            t.prev()
                        }), a[s](function() {
                            t.next()
                        }), t.isIE7 && (k("b", o[0], !1, !0), k("a", o[0], !1, !0), k("b", a[0], !1, !0), k("a", a[0], !1, !0)), t.container.append(o.add(a))
                    }
                }), x(m + i, function() {
                    t._preloadTimeout && clearTimeout(t._preloadTimeout), t._preloadTimeout = setTimeout(function() {
                        t.preloadNearbyImages(), t._preloadTimeout = null
                    }, 16)
                }), x(l + i, function() {
                    o.off(i), t.wrap.off("click" + i), t.arrowLeft && r && t.arrowLeft.add(t.arrowRight).destroyMfpFastClick(), t.arrowRight = t.arrowLeft = null
                }), void 0) : !1
            },
            next: function() {
                t.direction = !0, t.index = K(t.index + 1), t.updateItemHTML()
            },
            prev: function() {
                t.direction = !1, t.index = K(t.index - 1), t.updateItemHTML()
            },
            goTo: function(e) {
                t.direction = e >= t.index, t.index = e, t.updateItemHTML()
            },
            preloadNearbyImages: function() {
                var e, n = t.st.gallery.preload,
                    i = Math.min(n[0], t.items.length),
                    o = Math.min(n[1], t.items.length);
                for (e = 1;
                    (t.direction ? o : i) >= e; e++) t._preloadItem(t.index + e);
                for (e = 1;
                    (t.direction ? i : o) >= e; e++) t._preloadItem(t.index - e)
            },
            _preloadItem: function(n) {
                if (n = K(n), !t.items[n].preloaded) {
                    var i = t.items[n];
                    i.parsed || (i = t.parseEl(n)), T("LazyLoad", i), "image" === i.type && (i.img = e('<img class="mfp-img" />').on("load.mfploader", function() {
                        i.hasSize = !0
                    }).on("error.mfploader", function() {
                        i.hasSize = !0, i.loadError = !0, T("LazyLoadError", i)
                    }).attr("src", i.src)), i.preloaded = !0
                }
            }
        }
    });
    var U = "retina";
    e.magnificPopup.registerModule(U, {
            options: {
                replaceSrc: function(e) {
                    return e.src.replace(/\.\w+$/, function(e) {
                        return "@2x" + e
                    })
                },
                ratio: 1
            },
            proto: {
                initRetina: function() {
                    if (window.devicePixelRatio > 1) {
                        var e = t.st.retina,
                            n = e.ratio;
                        n = isNaN(n) ? n() : n, n > 1 && (x("ImageHasSize." + U, function(e, t) {
                            t.img.css({
                                "max-width": t.img[0].naturalWidth / n,
                                width: "100%"
                            })
                        }), x("ElementParse." + U, function(t, i) {
                            i.src = e.replaceSrc(i, n)
                        }))
                    }
                }
            }
        }),
        function() {
            var t = 1e3,
                n = "ontouchstart" in window,
                i = function() {
                    I.off("touchmove" + r + " touchend" + r)
                },
                o = "mfpFastClick",
                r = "." + o;
            e.fn.mfpFastClick = function(o) {
                return e(this).each(function() {
                    var a, s = e(this);
                    if (n) {
                        var l, c, d, u, p, f;
                        s.on("touchstart" + r, function(e) {
                            u = !1, f = 1, p = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0], c = p.clientX, d = p.clientY, I.on("touchmove" + r, function(e) {
                                p = e.originalEvent ? e.originalEvent.touches : e.touches, f = p.length, p = p[0], (Math.abs(p.clientX - c) > 10 || Math.abs(p.clientY - d) > 10) && (u = !0, i())
                            }).on("touchend" + r, function(e) {
                                i(), u || f > 1 || (a = !0, e.preventDefault(), clearTimeout(l), l = setTimeout(function() {
                                    a = !1
                                }, t), o())
                            })
                        })
                    }
                    s.on("click" + r, function() {
                        a || o()
                    })
                })
            }, e.fn.destroyMfpFastClick = function() {
                e(this).off("touchstart" + r + " click" + r), n && I.off("touchmove" + r + " touchend" + r)
            }
        }(), _()
})(window.jQuery || window.Zepto);
/**
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.6
 */
;
(function($) {
    var h = $.scrollTo = function(a, b, c) {
        $(window).scrollTo(a, b, c)
    };
    h.defaults = {
        axis: 'xy',
        duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
        limit: true
    };
    h.window = function(a) {
        return $(window)._scrollable()
    };
    $.fn._scrollable = function() {
        return this.map(function() {
            var a = this,
                isWin = !a.nodeName || $.inArray(a.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;
            if (!isWin) return a;
            var b = (a.contentWindow || a).document || a.ownerDocument || a;
            return /webkit/i.test(navigator.userAgent) || b.compatMode == 'BackCompat' ? b.body : b.documentElement
        })
    };
    $.fn.scrollTo = function(e, f, g) {
        if (typeof f == 'object') {
            g = f;
            f = 0
        }
        if (typeof g == 'function') g = {
            onAfter: g
        };
        if (e == 'max') e = 9e9;
        g = $.extend({}, h.defaults, g);
        f = f || g.duration;
        g.queue = g.queue && g.axis.length > 1;
        if (g.queue) f /= 2;
        g.offset = both(g.offset);
        g.over = both(g.over);
        return this._scrollable().each(function() {
            if (e == null) return;
            var d = this,
                $elem = $(d),
                targ = e,
                toff, attr = {},
                win = $elem.is('html,body');
            switch (typeof targ) {
                case 'number':
                case 'string':
                    if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                        targ = both(targ);
                        break
                    }
                    targ = $(targ, this);
                    if (!targ.length) return;
                case 'object':
                    if (targ.is || targ.style) toff = (targ = $(targ)).offset()
            }
            $.each(g.axis.split(''), function(i, a) {
                var b = a == 'x' ? 'Left' : 'Top',
                    pos = b.toLowerCase(),
                    key = 'scroll' + b,
                    old = d[key],
                    max = h.max(d, a);
                if (toff) {
                    attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);
                    if (g.margin) {
                        attr[key] -= parseInt(targ.css('margin' + b)) || 0;
                        attr[key] -= parseInt(targ.css('border' + b + 'Width')) || 0
                    }
                    attr[key] += g.offset[pos] || 0;
                    if (g.over[pos]) attr[key] += targ[a == 'x' ? 'width' : 'height']() * g.over[pos]
                } else {
                    var c = targ[pos];
                    attr[key] = c.slice && c.slice(-1) == '%' ? parseFloat(c) / 100 * max : c
                }
                if (g.limit && /^\d+$/.test(attr[key])) attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
                if (!i && g.queue) {
                    if (old != attr[key]) animate(g.onAfterFirst);
                    delete attr[key]
                }
            });
            animate(g.onAfter);

            function animate(a) {
                $elem.animate(attr, f, g.easing, a && function() {
                    a.call(this, targ, g)
                })
            }
        }).end()
    };
    h.max = function(a, b) {
        var c = b == 'x' ? 'Width' : 'Height',
            scroll = 'scroll' + c;
        if (!$(a).is('html,body')) return a[scroll] - $(a)[c.toLowerCase()]();
        var d = 'client' + c,
            html = a.ownerDocument.documentElement,
            body = a.ownerDocument.body;
        return Math.max(html[scroll], body[scroll]) - Math.min(html[d], body[d])
    };

    function both(a) {
        return typeof a == 'object' ? a : {
            top: a,
            left: a
        }
    }
})(jQuery);

/*
 *	jQuery OwlCarousel v1.28
 *  
 *	Copyright (c) 2013 Bartosz Wojciechowski
 *	http://www.owlgraphic.com/owlcarousel
 *
 *	Licensed under MIT
 *
 */
eval(function(p, a, c, k, e, r) {
    e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
    };
    if (!''.replace(/^/, String)) {
        while (c--) r[e(c)] = k[c] || e(c);
        k = [function(e) {
            return r[e]
        }];
        e = function() {
            return '\\w+'
        };
        c = 1
    };
    while (c--)
        if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
    return p
}('"9"!==z 33.3i&&(33.3i=9(f){9 g(){}g.5R=f;n 5Q g});(9(f,g,k){p l={1E:9(a,b){6.$j=f(b);6.7=f.4O({},f.2J.2p.7,6.$j.u(),a);6.2k=a;6.4N()},4N:9(){9 a(a){p d,e="";q("9"===z b.7.2I)b.7.2I.O(6,[a]);1C{1z(d 34 a.i)a.i.5K(d)&&(e+=a.i[d].1N);b.$j.2q(e)}b.3l()}p b=6,e;"9"===z b.7.3q&&b.7.3q.O(6,[b.$j]);"3t"===z b.7.3x?(e=b.7.3x,f.5J(e,a)):b.3l()},3l:9(){6.$j.u("i-4M",6.$j.2j("2b"));6.$j.u("i-4L",6.$j.2j("G"));6.$j.w({29:0});6.28=6.7.r;6.4J();6.5C=0;6.23=15;6.21()},21:9(){q(0===6.$j.1Z().L)n!1;6.1X();6.4F();6.$R=6.$j.1Z();6.C=6.$R.L;6.4E();6.$H=6.$j.Y(".i-1N");6.$F=6.$j.Y(".i-1l");6.3v="V";6.16=0;6.1V=[0];6.m=0;6.4C();6.4B()},4B:9(){6.2S();6.2V();6.4A();6.2Y();6.4z();6.4y();6.2v();6.4s();!1!==6.7.2z&&6.4r(6.7.2z);!0===6.7.Q&&(6.7.Q=54);6.18();6.$j.Y(".i-1l").w("4p","4o");6.$j.2e(":3m")?6.$j.w("29",1):6.3n();6.4Z=!1;6.2h();"9"===z 6.7.3s&&6.7.3s.O(6,[6.$j])},2h:9(){!0===6.7.1T&&6.1T();!0===6.7.1A&&6.1A();6.4l();"9"===z 6.7.3y&&6.7.3y.O(6,[6.$j])},3C:9(){"9"===z 6.7.3D&&6.7.3D.O(6,[6.$j]);6.3n();6.2S();6.2V();6.4j();6.2Y();6.2h();"9"===z 6.7.3H&&6.7.3H.O(6,[6.$j])},4i:9(){p a=6;g.1b(9(){a.3C()},0)},3n:9(){p a=6;q(!1===a.$j.2e(":3m"))a.$j.w({29:0}),g.1d(a.1t),g.1d(a.23);1C n!1;a.23=g.4g(9(){a.$j.2e(":3m")&&(a.4i(),a.$j.4f({29:1},2M),g.1d(a.23))},5z)},4E:9(){6.$R.5x(\'<J G="i-1l">\').4d(\'<J G="i-1N"></J>\');6.$j.Y(".i-1l").4d(\'<J G="i-1l-4c">\');6.1B=6.$j.Y(".i-1l-4c");6.$j.w("4p","4o")},1X:9(){p a=6.$j.1O(6.7.1X),b=6.$j.1O(6.7.2a);a||6.$j.I(6.7.1X);b||6.$j.I(6.7.2a)},2S:9(){p a,b;q(!1===6.7.30)n!1;q(!0===6.7.4b)n 6.7.r=6.28=1,6.7.1k=!1,6.7.1p=!1,6.7.1M=!1,6.7.1J=!1,6.7.1I=!1,6.7.1H=!1;a=f(6.7.4a).1h();a>(6.7.1p[0]||6.28)&&(6.7.r=6.28);q(!1!==6.7.1k)1z(6.7.1k.5f(9(a,b){n a[0]-b[0]}),b=0;b<6.7.1k.L;b+=1)6.7.1k[b][0]<=a&&(6.7.r=6.7.1k[b][1]);1C a<=6.7.1p[0]&&!1!==6.7.1p&&(6.7.r=6.7.1p[1]),a<=6.7.1M[0]&&!1!==6.7.1M&&(6.7.r=6.7.1M[1]),a<=6.7.1J[0]&&!1!==6.7.1J&&(6.7.r=6.7.1J[1]),a<=6.7.1I[0]&&!1!==6.7.1I&&(6.7.r=6.7.1I[1]),a<=6.7.1H[0]&&!1!==6.7.1H&&(6.7.r=6.7.1H[1]);6.7.r>6.C&&!0===6.7.49&&(6.7.r=6.C)},4z:9(){p a=6,b,e;q(!0!==a.7.30)n!1;e=f(g).1h();a.3e=9(){f(g).1h()!==e&&(!1!==a.7.Q&&g.1d(a.1t),g.5c(b),b=g.1b(9(){e=f(g).1h();a.3C()},a.7.48))};f(g).47(a.3e)},4j:9(){6.2u(6.m);!1!==6.7.Q&&6.3k()},46:9(){p a=6,b=0,e=a.C-a.7.r;a.$H.2x(9(c){p d=f(6);d.w({1h:a.K}).u("i-1N",3p(c));q(0===c%a.7.r||c===e)c>e||(b+=1);d.u("i-1G",b)})},45:9(){6.$F.w({1h:6.$H.L*6.K*2,S:0});6.46()},2V:9(){6.44();6.45();6.43();6.3w()},44:9(){6.K=26.4T(6.$j.1h()/6.7.r)},3w:9(){p a=-1*(6.C*6.K-6.7.r*6.K);6.7.r>6.C?6.3A=a=6.B=0:(6.B=6.C-6.7.r,6.3A=a);n a},41:9(){n 0},43:9(){p a=0,b=0,e,c;6.E=[0];6.3F=[];1z(e=0;e<6.C;e+=1)b+=6.K,6.E.3G(-b),!0===6.7.11&&(c=f(6.$H[e]),c=c.u("i-1G"),c!==a&&(6.3F[a]=6.E[e],a=c))},4A:9(){q(!0===6.7.2i||!0===6.7.1v)6.A=f(\'<J G="i-5H"/>\').5F("5w",!6.D.13).5k(6.$j);!0===6.7.1v&&6.3Z();!0===6.7.2i&&6.3V()},3V:9(){p a=6,b=f(\'<J G="i-57"/>\');a.A.1n(b);a.1s=f("<J/>",{"G":"i-1g",2q:a.7.2U[0]||""});a.1r=f("<J/>",{"G":"i-V",2q:a.7.2U[1]||""});b.1n(a.1s).1n(a.1r);b.v("2X.A 1F.A",\'J[G^="i"]\',9(a){a.1e()});b.v("2C.A 2E.A",\'J[G^="i"]\',9(b){b.1e();f(6).1O("i-V")?a.V():a.1g()})},3Z:9(){p a=6;a.1f=f(\'<J G="i-1v"/>\');a.A.1n(a.1f);a.1f.v("2C.A 2E.A",".i-1i",9(b){b.1e();3p(f(6).u("i-1i"))!==a.m&&a.1j(3p(f(6).u("i-1i")),!0)})},3U:9(){p a,b,e,c,d,g;q(!1===6.7.1v)n!1;6.1f.2q("");a=0;b=6.C-6.C%6.7.r;1z(c=0;c<6.C;c+=1)0===c%6.7.r&&(a+=1,b===c&&(e=6.C-6.7.r),d=f("<J/>",{"G":"i-1i"}),g=f("<3R></3R>",{5t:!0===6.7.38?a:"","G":!0===6.7.38?"i-5I":""}),d.1n(g),d.u("i-1i",b===c?e:c),d.u("i-1G",a),6.1f.1n(d));6.2R()},2R:9(){p a=6;q(!1===a.7.1v)n!1;a.1f.Y(".i-1i").2x(9(){f(6).u("i-1G")===f(a.$H[a.m]).u("i-1G")&&(a.1f.Y(".i-1i").X("2f"),f(6).I("2f"))})},3d:9(){q(!1===6.7.2i)n!1;!1===6.7.2g&&(0===6.m&&0===6.B?(6.1s.I("17"),6.1r.I("17")):0===6.m&&0!==6.B?(6.1s.I("17"),6.1r.X("17")):6.m===6.B?(6.1s.X("17"),6.1r.I("17")):0!==6.m&&6.m!==6.B&&(6.1s.X("17"),6.1r.X("17")))},2Y:9(){6.3U();6.3d();6.A&&(6.7.r>=6.C?6.A.3N():6.A.3M())},52:9(){6.A&&6.A.3j()},V:9(a){q(6.1R)n!1;6.m+=!0===6.7.11?6.7.r:1;q(6.m>6.B+(!0===6.7.11?6.7.r-1:0))q(!0===6.7.2g)6.m=0,a="2m";1C n 6.m=6.B,!1;6.1j(6.m,a)},1g:9(a){q(6.1R)n!1;6.m=!0===6.7.11&&0<6.m&&6.m<6.7.r?0:6.m-(!0===6.7.11?6.7.r:1);q(0>6.m)q(!0===6.7.2g)6.m=6.B,a="2m";1C n 6.m=0,!1;6.1j(6.m,a)},1j:9(a,b,e){p c=6;q(c.1R)n!1;"9"===z c.7.1S&&c.7.1S.O(6,[c.$j]);a>=c.B?a=c.B:0>=a&&(a=0);c.m=c.i.m=a;q(!1!==c.7.2z&&"3L"!==e&&1===c.7.r&&!0===c.D.1q)n c.1o(0),!0===c.D.1q?c.1W(c.E[a]):c.1w(c.E[a],1),c.2t(),c.4m(),!1;a=c.E[a];!0===c.D.1q?(c.1Y=!1,!0===b?(c.1o("1y"),g.1b(9(){c.1Y=!0},c.7.1y)):"2m"===b?(c.1o(c.7.2w),g.1b(9(){c.1Y=!0},c.7.2w)):(c.1o("1m"),g.1b(9(){c.1Y=!0},c.7.1m)),c.1W(a)):!0===b?c.1w(a,c.7.1y):"2m"===b?c.1w(a,c.7.2w):c.1w(a,c.7.1m);c.2t()},2u:9(a){"9"===z 6.7.1S&&6.7.1S.O(6,[6.$j]);a>=6.B||-1===a?a=6.B:0>=a&&(a=0);6.1o(0);!0===6.D.1q?6.1W(6.E[a]):6.1w(6.E[a],1);6.m=6.i.m=a;6.2t()},2t:9(){6.1V.3G(6.m);6.16=6.i.16=6.1V[6.1V.L-2];6.1V.59(0);6.16!==6.m&&(6.2R(),6.3d(),6.2h(),!1!==6.7.Q&&6.3k());"9"===z 6.7.3z&&6.16!==6.m&&6.7.3z.O(6,[6.$j])},U:9(){6.3B="U";g.1d(6.1t)},3k:9(){"U"!==6.3B&&6.18()},18:9(){p a=6;a.3B="18";q(!1===a.7.Q)n!1;g.1d(a.1t);a.1t=g.4g(9(){a.V(!0)},a.7.Q)},1o:9(a){"1m"===a?6.$F.w(6.2A(6.7.1m)):"1y"===a?6.$F.w(6.2A(6.7.1y)):"3t"!==z a&&6.$F.w(6.2A(a))},2A:9(a){n{"-24-1a":"2D "+a+"1u 2F","-22-1a":"2D "+a+"1u 2F","-o-1a":"2D "+a+"1u 2F",1a:"2D "+a+"1u 2F"}},4h:9(){n{"-24-1a":"","-22-1a":"","-o-1a":"",1a:""}},3K:9(a){n{"-24-P":"M("+a+"W, t, t)","-22-P":"M("+a+"W, t, t)","-o-P":"M("+a+"W, t, t)","-1u-P":"M("+a+"W, t, t)",P:"M("+a+"W, t,t)"}},1W:9(a){6.$F.w(6.3K(a))},3O:9(a){6.$F.w({S:a})},1w:9(a,b){p e=6;e.2c=!1;e.$F.U(!0,!0).4f({S:a},{4U:b||e.7.1m,3P:9(){e.2c=!0}})},4J:9(){p a=k.53("J");a.2b.3Q="  -22-P:M(t, t, t); -1u-P:M(t, t, t); -o-P:M(t, t, t); -24-P:M(t, t, t); P:M(t, t, t)";a=a.2b.3Q.5a(/M\\(t, t, t\\)/g);6.D={1q:15!==a&&1===a.L,13:"5d"34 g||g.5g.5j}},4y:9(){q(!1!==6.7.1L||!1!==6.7.1K)6.3S(),6.3T()},4F:9(){p a=["s","e","x"];6.12={};!0===6.7.1L&&!0===6.7.1K?a=["2X.i 1F.i","2Q.i 3W.i","2C.i 3X.i 2E.i"]:!1===6.7.1L&&!0===6.7.1K?a=["2X.i","2Q.i","2C.i 3X.i"]:!0===6.7.1L&&!1===6.7.1K&&(a=["1F.i","3W.i","2E.i"]);6.12.3Y=a[0];6.12.2P=a[1];6.12.2O=a[2]},3T:9(){6.$j.v("5l.i",9(a){a.1e()});6.$j.v("1F.40",9(a){n f(a.1c).2e("5y, 5B, 5D, 5E")})},3S:9(){9 a(a){q(Z 0!==a.2l)n{x:a.2l[0].2d,y:a.2l[0].42};q(Z 0===a.2l){q(Z 0!==a.2d)n{x:a.2d,y:a.42};q(Z 0===a.2d)n{x:a.4X,y:a.51}}}9 b(a){"v"===a?(f(k).v(d.12.2P,e),f(k).v(d.12.2O,c)):"N"===a&&(f(k).N(d.12.2P),f(k).N(d.12.2O))}9 e(b){b=b.3u||b||g.3r;d.14=a(b).x-h.3g;d.3f=a(b).y-h.3c;d.T=d.14-h.39;"9"===z d.7.31&&!0!==h.2T&&0!==d.T&&(h.2T=!0,d.7.31.O(d,[d.$j]));(8<d.T||-8>d.T)&&!0===d.D.13&&(Z 0!==b.1e?b.1e():b.5m=!1,h.2B=!0);(10<d.3f||-10>d.3f)&&!1===h.2B&&f(k).N("2Q.i");d.14=26.3w(26.41(d.14,d.T/5),d.3A+d.T/5);!0===d.D.1q?d.1W(d.14):d.3O(d.14)}9 c(a){a=a.3u||a||g.3r;p c;a.1c=a.1c||a.4e;h.2T=!1;!0!==d.D.13&&d.$F.X("2N");d.1Q=0>d.T?d.i.1Q="S":d.i.1Q="2K";0!==d.T&&(c=d.3I(),d.1j(c,!1,"3L"),h.2G===a.1c&&!0!==d.D.13&&(f(a.1c).v("3E.4k",9(a){a.5L();a.5M();a.1e();f(a.1c).N("3E.4k")}),a=f.5N(a.1c,"5P").3E,c=a.4Q(),a.4R(0,0,c)));b("N")}p d=6,h={3g:0,3c:0,4S:0,39:0,2o:15,4P:15,4V:15,2B:15,4W:15,2G:15};d.2c=!0;d.$j.v(d.12.3Y,".i-1l",9(c){c=c.3u||c||g.3r;p e;q(3===c.4Y)n!1;q(!(d.C<=d.7.r)){q(!1===d.2c&&!d.7.3o||!1===d.1Y&&!d.7.3o)n!1;!1!==d.7.Q&&g.1d(d.1t);!0===d.D.13||d.$F.1O("2N")||d.$F.I("2N");d.14=0;d.T=0;f(6).w(d.4h());e=f(6).2o();h.39=e.S;h.3g=a(c).x-e.S;h.3c=a(c).y-e.50;b("v");h.2B=!1;h.2G=c.1c||c.4e}})},3I:9(){p a=6.4n();a>6.B?a=6.m=6.B:0<=6.14&&(6.m=a=0);n a},4n:9(){p a=6,b=!0===a.7.11?a.3F:a.E,e=a.14,c=15;f.2x(b,9(d,g){e-a.K/20>b[d+1]&&e-a.K/20<g&&"S"===a.3h()?(c=g,a.m=!0===a.7.11?f.4q(c,a.E):d):e+a.K/20<g&&e+a.K/20>(b[d+1]||b[d]-a.K)&&"2K"===a.3h()&&(!0===a.7.11?(c=b[d+1]||b[b.L-1],a.m=f.4q(c,a.E)):(c=b[d+1],a.m=d+1))});n a.m},3h:9(){p a;0>6.T?(a="2K",6.3v="V"):(a="S",6.3v="1g");n a},4C:9(){p a=6;a.$j.v("i.V",9(){a.V()});a.$j.v("i.1g",9(){a.1g()});a.$j.v("i.18",9(b,e){a.7.Q=e;a.18();a.3a="18"});a.$j.v("i.U",9(){a.U();a.3a="U"});a.$j.v("i.1j",9(b,e){a.1j(e)});a.$j.v("i.2u",9(b,e){a.2u(e)})},2v:9(){p a=6;!0===a.7.2v&&!0!==a.D.13&&!1!==a.7.Q&&(a.$j.v("55",9(){a.U()}),a.$j.v("56",9(){"U"!==a.3a&&a.18()}))},1T:9(){p a,b,e,c,d;q(!1===6.7.1T)n!1;1z(a=0;a<6.C;a+=1)b=f(6.$H[a]),"19"!==b.u("i-19")&&(e=b.u("i-1N"),c=b.Y(".58"),"3t"!==z c.u("1U")?b.u("i-19","19"):(Z 0===b.u("i-19")&&(c.3N(),b.I("4t").u("i-19","5b")),(d=!0===6.7.4u?e>=6.m:!0)&&e<6.m+6.7.r&&c.L&&6.4v(b,c)))},4v:9(a,b){9 e(){a.u("i-19","19").X("4t");b.5e("u-1U");"4w"===d.7.4x?b.5h(5i):b.3M();"9"===z d.7.32&&d.7.32.O(6,[d.$j])}9 c(){f+=1;d.2Z(b.2W(0))||!0===k?e():2r>=f?g.1b(c,2r):e()}p d=6,f=0,k;"5n"===b.5o("5p")?(b.w("5q-5r","5s("+b.u("1U")+")"),k=!0):b[0].1U=b.u("1U");c()},1A:9(){9 a(){p a=f(e.$H[e.m]).2L();e.1B.w("2L",a+"W");e.1B.1O("1A")||g.1b(9(){e.1B.I("1A")},0)}9 b(){d+=1;e.2Z(c.2W(0))?a():2r>=d?g.1b(b,2r):e.1B.w("2L","")}p e=6,c=f(e.$H[e.m]).Y("5u"),d;Z 0!==c.2W(0)?(d=0,b()):a()},2Z:9(a){n!a.3P||"5v"!==z a.4D&&0===a.4D?!1:!0},4l:9(){p a;!0===6.7.3b&&6.$H.X("2f");6.1x=[];1z(a=6.m;a<6.m+6.7.r;a+=1)6.1x.3G(a),!0===6.7.3b&&f(6.$H[a]).I("2f");6.i.1x=6.1x},4r:9(a){6.4G="i-"+a+"-5A";6.4H="i-"+a+"-34"},4m:9(){p a=6,b=a.4G,e=a.4H,c=a.$H.25(a.m),d=a.$H.25(a.16),f=26.4I(a.E[a.m])+a.E[a.16],g=26.4I(a.E[a.m])+a.K/2;a.1R=!0;a.$F.I("i-1D").w({"-24-P-1D":g+"W","-22-4K-1D":g+"W","4K-1D":g+"W"});d.w({2o:"5G",S:f+"W"}).I(b).v("2y 2n 27 2s",9(){a.36=!0;d.N("2y 2n 27 2s");a.2H(d,b)});c.I(e).v("2y 2n 27 2s",9(){a.37=!0;c.N("2y 2n 27 2s");a.2H(c,e)})},2H:9(a,b){a.w({2o:"",S:""}).X(b);6.36&&6.37&&(6.$F.X("i-1D"),6.1R=6.37=6.36=!1)},4s:9(){6.i={2k:6.2k,5O:6.$j,R:6.$R,H:6.$H,m:6.m,16:6.16,1x:6.1x,13:6.D.13,D:6.D,1Q:6.1Q}},3J:9(){6.$j.N(".i i 1F.40");f(k).N(".i i");f(g).N("47",6.3e)},1P:9(){0!==6.$j.1Z().L&&(6.$F.35(),6.$R.35().35(),6.A&&6.A.3j());6.3J();6.$j.2j("2b",6.$j.u("i-4M")||"").2j("G",6.$j.u("i-4L"))},5S:9(){6.U();g.1d(6.23);6.1P();6.$j.5T()},5U:9(a){a=f.4O({},6.2k,a);6.1P();6.1E(a,6.$j)},5V:9(a,b){p e;q(!a)n!1;q(0===6.$j.1Z().L)n 6.$j.1n(a),6.21(),!1;6.1P();e=Z 0===b||-1===b?-1:b;e>=6.$R.L||-1===e?6.$R.25(-1).5W(a):6.$R.25(e).5X(a);6.21()},5Y:9(a){q(0===6.$j.1Z().L)n!1;a=Z 0===a||-1===a?-1:a;6.1P();6.$R.25(a).3j();6.21()}};f.2J.2p=9(a){n 6.2x(9(){q(!0===f(6).u("i-1E"))n!1;f(6).u("i-1E",!0);p b=33.3i(l);b.1E(a,6);f.u(6,"2p",b)})};f.2J.2p.7={r:5,1k:!1,1p:[5Z,4],1M:[60,3],1J:[61,2],1I:!1,1H:[62,1],4b:!1,49:!1,1m:2M,1y:63,2w:64,Q:!1,2v:!1,2i:!1,2U:["1g","V"],2g:!0,11:!1,1v:!0,38:!1,30:!0,48:2M,4a:g,1X:"i-65",2a:"i-2a",1T:!1,4u:!0,4x:"4w",1A:!1,3x:!1,2I:!1,3o:!0,1L:!0,1K:!0,3b:!1,2z:!1,3D:!1,3H:!1,3q:!1,3s:!1,1S:!1,3z:!1,3y:!1,31:!1,32:!1}})(66,67,68);', 62, 381, '||||||this|options||function|||||||||owl|elem|||currentItem|return||var|if|items||0px|data|on|css|||typeof|owlControls|maximumItem|itemsAmount|browser|positionsInArray|owlWrapper|class|owlItems|addClass|div|itemWidth|length|translate3d|off|apply|transform|autoPlay|userItems|left|newRelativeX|stop|next|px|removeClass|find|void||scrollPerPage|ev_types|isTouch|newPosX|null|prevItem|disabled|play|loaded|transition|setTimeout|target|clearInterval|preventDefault|paginationWrapper|prev|width|page|goTo|itemsCustom|wrapper|slideSpeed|append|swapSpeed|itemsDesktop|support3d|buttonNext|buttonPrev|autoPlayInterval|ms|pagination|css2slide|visibleItems|paginationSpeed|for|autoHeight|wrapperOuter|else|origin|init|mousedown|roundPages|itemsMobile|itemsTabletSmall|itemsTablet|touchDrag|mouseDrag|itemsDesktopSmall|item|hasClass|unWrap|dragDirection|isTransition|beforeMove|lazyLoad|src|prevArr|transition3d|baseClass|isCss3Finish|children||setVars|moz|checkVisible|webkit|eq|Math|MSAnimationEnd|orignalItems|opacity|theme|style|isCssFinish|pageX|is|active|rewindNav|eachMoveUpdate|navigation|attr|userOptions|touches|rewind|oAnimationEnd|position|owlCarousel|html|100|animationend|afterGo|jumpTo|stopOnHover|rewindSpeed|each|webkitAnimationEnd|transitionStyle|addCssSpeed|sliding|touchend|all|mouseup|ease|targetElement|clearTransStyle|jsonSuccess|fn|right|height|200|grabbing|end|move|touchmove|checkPagination|updateItems|dragging|navigationText|calculateAll|get|touchstart|updateControls|completeImg|responsive|startDragging|afterLazyLoad|Object|in|unwrap|endPrev|endCurrent|paginationNumbers|relativePos|hoverStatus|addClassActive|offsetY|checkNavigation|resizer|newPosY|offsetX|moveDirection|create|remove|checkAp|logIn|visible|watchVisibility|dragBeforeAnimFinish|Number|beforeInit|event|afterInit|string|originalEvent|playDirection|max|jsonPath|afterAction|afterMove|maximumPixels|apStatus|updateVars|beforeUpdate|click|pagesInArray|push|afterUpdate|getNewPosition|clearEvents|doTranslate|drag|show|hide|css2move|complete|cssText|span|gestures|disabledEvents|updatePagination|buildButtons|mousemove|touchcancel|start|buildPagination|disableTextSelect|min|pageY|loops|calculateWidth|appendWrapperSizes|appendItemsSizes|resize|responsiveRefreshRate|itemsScaleUp|responsiveBaseWidth|singleItem|outer|wrap|srcElement|animate|setInterval|removeTransition|reload|updatePosition|disable|onVisibleItems|singleItemTransition|closestItem|block|display|inArray|transitionTypes|owlStatus|loading|lazyFollow|lazyPreload|fade|lazyEffect|moveEvents|response|buildControls|onStartup|customEvents|naturalWidth|wrapItems|eventTypes|outClass|inClass|abs|checkBrowser|perspective|originalClasses|originalStyles|loadContent|extend|minSwipe|pop|splice|baseElWidth|round|duration|maxSwipe|dargging|clientX|which|onstartup|top|clientY|destroyControls|createElement|5E3|mouseover|mouseout|buttons|lazyOwl|shift|match|checked|clearTimeout|ontouchstart|removeAttr|sort|navigator|fadeIn|400|msMaxTouchPoints|appendTo|dragstart|returnValue|DIV|prop|tagName|background|image|url|text|img|undefined|clickable|wrapAll|input|500|out|textarea|wrapperWidth|select|option|toggleClass|relative|controls|numbers|getJSON|hasOwnProperty|stopImmediatePropagation|stopPropagation|_data|baseElement|events|new|prototype|destroy|removeData|reinit|addItem|after|before|removeItem|1199|979|768|479|800|1E3|carousel|jQuery|window|document'.split('|'), 0, {}))