define("leaflet/ChineseTmsProviders", ["leaflet", "leaflet/wmts"], function (L) {
    L.TileLayer.ChinaProvider = L.TileLayer.WMTS.extend({

        initialize: function (type, options) { // (type, Object)
            var providers = L.TileLayer.ChinaProvider.providers;

            var parts = type.split('.');

            var providerName = parts[0];
            var mapName = parts[1];
            var mapType = parts[2];

            if (providerName == "TianDiTu") {
                L.Util.extend(options, providers[providerName][mapName][mapType]["options"]);
                var url = providers[providerName][mapName][mapType]["url"];
            } else if (providerName == "Tencent") {
                L.Util.extend(this, providers[providerName][mapName][mapType]);
                var url = "";
            } else { }


            L.TileLayer.WMTS.prototype.initialize.call(this, url, options);
        }
    });

    L.TileLayer.ChinaProvider.providers = {
        TianDiTu: {
            Normal: {
                Map: {
                    url: "http://t0.tianditu.com/vec_c/wmts",
                    options: {
                        tileSize: 256,
                        layer: 'vec',
                        style: "default",
                        tilematrixSet: "c",
                        format: "tile",
                    }
                },
                Annotion: {
                    url: "http://t0.tianditu.com/cva_c/wmts",
                    options: {
                        tileSize: 256,
                        layer: 'cva',
                        style: "default",
                        tilematrixSet: "c",
                        format: "tile",
                    }
                }
            },
            Satellite: {
                Map: {
                    url: "http://t0.tianditu.com/img_c/wmts",
                    options: {
                        tileSize: 256,
                        layer: 'img',
                        style: "default",
                        tilematrixSet: "c",
                        format: "tile",
                    }
                },
                Annotion: {
                    url: "http://t0.tianditu.com/cia_c/wmts",
                    options: {
                        tileSize: 256,
                        layer: 'cia',
                        style: "default",
                        tilematrixSet: "c",
                        format: "tile",
                    }
                }
            },

            Terrain: {}
        },
        Tencent: {
            Normal: {
                Map: {
                    _subDomains: new Array("rt0", "rt1", "rt2", "rt3"),
                    getTileUrl: function (tilePoint) {
                        var level = tilePoint.z, col = tilePoint.y, row = tilePoint.x;
                        var subdomain = this._subDomains[(level + col + row) % this._subDomains.length];
                        col = parseInt(Math.pow(2, level).toString()) - 1 - col;
                        return "http://" + subdomain + ".map.gtimg.com/tile?z=" + level + "&x=" + row + "&y=" + col + "&styleid=0&scene=0&version=112&times=1";
                    }
                },
                Annotion: {
                    _subDomains: new Array("rt0", "rt1", "rt2", "rt3"),
                    getTileUrl: function (tilePoint) {
                        var level = tilePoint.z, col = tilePoint.y, row = tilePoint.x;
                        var subdomain = this._subDomains[(level + col + row) % this._subDomains.length];
                        col = parseInt(Math.pow(2, level).toString()) - 1 - col;
                        return "http://" + subdomain + ".map.gtimg.com/tile?z=" + level + "&x=" + row + "&y=" + col + "&styleid=2&version=110";
                    },
                }
            },
            Satellite: {
                Map: {
                    _subDomains: new Array("p0", "p1", "p2", "p3"),
                    getTileUrl: function (tilePoint) {
                        var level = tilePoint.z, col = tilePoint.y, row = tilePoint.x;
                        var subdomain = this._subDomains[(level + col + row) % this._subDomains.length];
                        col = parseInt(Math.pow(2, level).toString()) - 1 - col;
                        return "http://" + subdomain + ".map.gtimg.com/sateTiles/" + level.toString() + "/" + Math.floor(row / 16.0).toString() + "/" + Math.floor(col / 16.0).toString() + "/" + row.toString() + "_" + col.toString() + ".jpg";
                    },
                    //options: {}
                },
                Annotion: {
                    _subDomains: new Array("rt0", "rt1", "rt2", "rt3"),
                    getTileUrl: function (tilePoint) {
                        var level = tilePoint.z, col = tilePoint.y, row = tilePoint.x;
                        var subdomain = this._subDomains[(level + col + row) % this._subDomains.length];
                        col = parseInt(Math.pow(2, level).toString()) - 1 - col;
                        return "http://" + subdomain + ".map.gtimg.com/tile?z=" + level + "&x=" + row + "&y=" + col + "&styleid=2&version=110";
                    },
                    //optons:{}
                }
            },

            Terrain: {
                Map: {
                    _subDomains: new Array("p0", "p1", "p2", "p3"),
                    getTileUrl: function (tilePoint) {
                        var level = tilePoint.z, col = tilePoint.y, row = tilePoint.x;
                        var subdomain = this._subDomains[(level + col + row) % this._subDomains.length];
                        col = parseInt(Math.pow(2, level).toString()) - 1 - col;
                        return "http://" + subdomain + ".map.gtimg.com/demTiles/" + level.toString() + "/" + Math.floor(row / 16.0).toString() + "/" + Math.floor(col / 16.0).toString() + "/" + row.toString() + "_" + col.toString() + ".jpg";
                    }
                },
                Annotion: {
                    _subDomains: new Array("rt0", "rt1", "rt2", "rt3"),
                    getTileUrl: function (tilePoint) {
                        var level = tilePoint.z, col = tilePoint.y, row = tilePoint.x;
                        var subdomain = this._subDomains[(level + col + row) % this._subDomains.length];
                        col = parseInt(Math.pow(2, level).toString()) - 1 - col;
                        return "http://" + subdomain + ".map.gtimg.com/tile?z=" + level + "&x=" + row + "&y=" + col + "&type=vector&styleid=3&version=110";
                    }
                }
            }
        },
    };

    L.tileLayer.chinaProvider = function (type, options) {
        return new L.TileLayer.ChinaProvider(type, options);
    };
});