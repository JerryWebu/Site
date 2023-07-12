google.maps.__gjsload__('stats', function(_) {
    var zFa = function(a, b) {
            return new _.HC(a, b)
        },
        AFa = function(a) {
            _.E(this, a, 2)
        },
        BFa = function(a) {
            _.E(this, a, 6)
        },
        CFa = function(a, b, c, d) {
            var e = {};
            e.host = document.location && document.location.host || window.location.host;
            e.v = a.split(".")[1] || a;
            e.fv = a;
            e.r = Math.round(1 / b);
            c && (e.client = c);
            d && (e.key = d);
            return e
        },
        EFa = function(a) {
            var b = document;
            this.token = DFa;
            this.j = a + "/maps/gen_204";
            this.h = b
        },
        UI = function(a, b, c) {
            var d = [];
            _.Dk(a, function(e, f) {
                d.push(f + b + e)
            });
            return d.join(c)
        },
        FFa = function(a) {
            var b = {};
            _.Dk(a, function(c,
                d) {
                b[encodeURIComponent(d)] = encodeURIComponent(c).replace(/%7C/g, "|")
            });
            return UI(b, ":", ",")
        },
        GFa = function(a) {
            if (a instanceof VI || a instanceof WI || a instanceof XI) return a;
            if ("function" == typeof a.next) return new VI(function() {
                return a
            });
            if ("function" == typeof a[_.u(_.x.Symbol, "iterator")]) return new VI(function() {
                return a[_.u(_.x.Symbol, "iterator")]()
            });
            if ("function" == typeof a.kj) return new VI(function() {
                return a.kj()
            });
            throw Error("Not an iterator or iterable.");
        },
        VI = function(a) {
            this.h = a
        },
        WI = function(a) {
            this.h =
                a
        },
        XI = function(a) {
            VI.call(this, function() {
                return a
            });
            this.l = a
        },
        YI = function(a, b) {
            this.j = {};
            this.h = [];
            this.l = this.size = 0;
            var c = arguments.length;
            if (1 < c) {
                if (c % 2) throw Error("Uneven number of arguments");
                for (var d = 0; d < c; d += 2) this.set(arguments[d], arguments[d + 1])
            } else if (a)
                if (a instanceof YI)
                    for (c = a.Pg(), d = 0; d < c.length; d++) this.set(c[d], a.get(c[d]));
                else
                    for (d in a) this.set(d, a[d])
        },
        HFa = function(a, b) {
            return a === b
        },
        $I = function(a) {
            if (a.size != a.h.length) {
                for (var b = 0, c = 0; b < a.h.length;) {
                    var d = a.h[b];
                    ZI(a.j,
                        d) && (a.h[c++] = d);
                    b++
                }
                a.h.length = c
            }
            if (a.size != a.h.length) {
                var e = {};
                for (c = b = 0; b < a.h.length;) d = a.h[b], ZI(e, d) || (a.h[c++] = d, e[d] = 1), b++;
                a.h.length = c
            }
        },
        ZI = function(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b)
        },
        IFa = function(a, b, c, d) {
            var e = _.Id(_.Xf, 0, 1);
            this.o = a;
            this.D = b;
            this.m = e;
            this.j = c;
            this.l = d;
            this.h = new YI;
            this.C = Date.now()
        },
        aJ = function(a, b, c, d, e) {
            this.C = a;
            this.D = b;
            this.o = c;
            this.l = d;
            this.m = e;
            this.j = {};
            this.h = []
        },
        JFa = function(a, b, c) {
            var d = _.Hea;
            this.l = a;
            _.F.bind(this.l, "set_at", this, this.m);
            _.F.bind(this.l, "insert_at", this, this.m);
            this.o = b;
            this.D = d;
            this.C = c;
            this.j = 0;
            this.h = {};
            this.m()
        },
        bJ = function() {
            this.j = _.Jd(_.Xf, 6);
            this.l = _.Jd(_.Xf, 16);
            if (_.ii[35]) {
                var a = _.Vd(_.Xf);
                a = _.Jd(a, 11)
            } else a = _.js;
            this.h = new EFa(a);
            (a = _.Gj) && new JFa(a, (0, _.Ma)(this.h.rm, this.h), !!this.j);
            this.D = _.Jd(_.Wd(_.Xf), 1);
            this.F = {};
            this.o = {};
            this.C = _.Id(_.Xf, 0, 1);
            a = this.m = new BFa;
            var b = _.Jd(_.Wd(_.Xf), 1);
            a.L[1] = b;
            this.j && (this.m.L[2] = this.j);
            this.l && (this.m.L[3] = this.l)
        };
    _.C(AFa, _.D);
    var cJ;
    _.C(BFa, _.D);
    var DFa = Math.round(1E15 * Math.random()).toString(36);
    EFa.prototype.rm = function(a, b) {
        b = b || {};
        var c = Date.now().toString(36);
        b.src = "apiv3";
        b.token = this.token;
        b.ts = c.substr(c.length - 6);
        a.cad = FFa(b);
        a = UI(a, "=", "&");
        a = this.j + "?target=api&" + a;
        _.Ue(new _.Te(this.h), "IMG").src = a;
        (b = _.Oa.__gm_captureCSI) && b(a)
    };
    /*

     Copyright The Closure Library Authors.
     SPDX-License-Identifier: Apache-2.0
    */
    VI.prototype.kj = function() {
        return new WI(this.h())
    };
    VI.prototype[_.u(_.x.Symbol, "iterator")] = function() {
        return new XI(this.h())
    };
    VI.prototype.j = function() {
        return new XI(this.h())
    };
    _.B(WI, _.Ji);
    WI.prototype.next = function() {
        return this.h.next()
    };
    WI.prototype[_.u(_.x.Symbol, "iterator")] = function() {
        return new XI(this.h)
    };
    WI.prototype.j = function() {
        return new XI(this.h)
    };
    _.B(XI, VI);
    XI.prototype.next = function() {
        return this.l.next()
    };
    _.n = YI.prototype;
    _.n.ie = function() {
        $I(this);
        for (var a = [], b = 0; b < this.h.length; b++) a.push(this.j[this.h[b]]);
        return a
    };
    _.n.Pg = function() {
        $I(this);
        return this.h.concat()
    };
    _.n.has = function(a) {
        return ZI(this.j, a)
    };
    _.n.equals = function(a, b) {
        if (this === a) return !0;
        if (this.size != a.size) return !1;
        b = b || HFa;
        $I(this);
        for (var c, d = 0; c = this.h[d]; d++)
            if (!b(this.get(c), a.get(c))) return !1;
        return !0
    };
    _.n.isEmpty = function() {
        return 0 == this.size
    };
    _.n.clear = function() {
        this.j = {};
        this.l = this.size = this.h.length = 0
    };
    _.n.remove = function(a) {
        return this.delete(a)
    };
    _.n.delete = function(a) {
        return ZI(this.j, a) ? (delete this.j[a], --this.size, this.l++, this.h.length > 2 * this.size && $I(this), !0) : !1
    };
    _.n.get = function(a, b) {
        return ZI(this.j, a) ? this.j[a] : b
    };
    _.n.set = function(a, b) {
        ZI(this.j, a) || (this.size += 1, this.h.push(a), this.l++);
        this.j[a] = b
    };
    _.n.forEach = function(a, b) {
        for (var c = this.Pg(), d = 0; d < c.length; d++) {
            var e = c[d],
                f = this.get(e);
            a.call(b, f, e, this)
        }
    };
    _.n.clone = function() {
        return new YI(this)
    };
    _.n.keys = function() {
        return GFa(this.kj(!0)).j()
    };
    _.n.values = function() {
        return GFa(this.kj(!1)).j()
    };
    _.n.entries = function() {
        var a = this;
        return zFa(_.u(this, "keys").call(this), function(b) {
            return [b, a.get(b)]
        })
    };
    _.n.kj = function(a) {
        $I(this);
        var b = 0,
            c = this.l,
            d = this,
            e = new _.Ji;
        e.next = function() {
            if (c != d.l) throw Error("The map has changed since the iterator was created");
            if (b >= d.h.length) return _.ok;
            var f = d.h[b++];
            return {
                value: a ? f : d.j[f],
                done: !1
            }
        };
        return e
    };
    IFa.prototype.F = function(a) {
        var b = this;
        0 === this.h.size && window.setTimeout(function() {
            var d = CFa(b.D, b.m, b.j, b.l);
            d.t = Date.now() - b.C;
            for (var e = b.h, f = {}, g = _.A(_.u(e, "keys").call(e)), h = g.next(); !h.done; h = g.next()) h = h.value, f[h] = e.get(h);
            _.fb(d, f);
            b.h.clear();
            b.o.rm({
                ev: "api_maprft"
            }, d)
        }, 500);
        var c = this.h.get(a, 0) + 1;
        this.h.set(a, c)
    };
    aJ.prototype.F = function(a) {
        this.j[a] || (this.j[a] = !0, this.h.push(a), 2 > this.h.length && _.St(this, this.H, 500))
    };
    aJ.prototype.H = function() {
        for (var a = CFa(this.D, this.o, this.l, this.m), b = 0, c; c = this.h[b]; ++b) a[c] = "1";
        a.hybrid = +_.Mm();
        this.h.length = 0;
        this.C.rm({
            ev: "api_mapft"
        }, a)
    };
    JFa.prototype.m = function() {
        for (var a; a = this.l.removeAt(0);) {
            var b = a.oy;
            a = a.timestamp - this.D;
            ++this.j;
            this.h[b] || (this.h[b] = 0);
            ++this.h[b];
            if (20 <= this.j && !(this.j % 5)) {
                var c = {
                    s: b
                };
                c.sr = this.h[b];
                c.tr = this.j;
                c.te = a;
                c.hc = this.C ? "1" : "0";
                this.o({
                    ev: "api_services"
                }, c)
            }
        }
    };
    bJ.prototype.J = function(a) {
        a = _.lf(a);
        var b = this.F[a];
        b || (b = new aJ(this.h, this.D, this.C, this.j, this.l), this.F[a] = b);
        return b
    };
    bJ.prototype.H = function(a) {
        a = _.lf(a);
        this.o[a] || (this.o[a] = new IFa(this.h, this.D, this.j, this.l));
        return this.o[a]
    };
    bJ.prototype.K = function(a) {
        if (_.ng) {
            var b = this.m.clone(),
                c = Math.floor(Date.now() / 1E3);
            b.L[0] = c;
            c = new AFa(_.Kd(b, 5));
            c.L[0] = Math.round(1 / this.C);
            c.L[1] = a;
            a = this.h;
            c = {
                ev: "api_map_style"
            };
            var d = new _.oh;
            cJ || (cJ = {
                V: "issssm",
                ba: ["is"]
            });
            var e = cJ;
            b = d.ib(b.Fb(), e);
            c.pb = encodeURIComponent(b).replace(/%20/g, "+");
            b = UI(c, "=", "&");
            _.Ue(new _.Te(a.h), "IMG").src = a.j + "?target=api&" + b
        }
    };
    _.Ze("stats", new bJ);
});