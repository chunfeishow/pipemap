define("leaflet/wmts", ["leaflet"], function (L) {
    L.TileLayer.WMTS = L.TileLayer.extend({

        defaultWmtsParams: {
            service: 'WMTS',
            request: 'GetTile',
            version: '1.0.0',
            layer: '',
            style: '',
            tilematrixSet: '',
            format: 'image/jpeg'
        },

        initialize: function (url, options) { // (String, Object)
            this._url = url;
            var wmtsParams = L.extend({}, this.defaultWmtsParams),
            tileSize = options.tileSize || this.options.tileSize;
            if (options.detectRetina && L.Browser.retina) {
                wmtsParams.width = wmtsParams.height = tileSize * 2;
            } else {
                wmtsParams.width = wmtsParams.height = tileSize;
            }
            for (var i in options) {
                // all keys that are not TileLayer options go to WMTS params
                if (!this.options.hasOwnProperty(i) && i != "matrixIds") {
                    wmtsParams[i] = options[i];
                }
            }
            this.wmtsParams = wmtsParams;
            this.matrixIds = options.matrixIds || this.getDefaultMatrix();
            options ? options.declaredClass = 'L.TileLayer.WMTS' : '';
            L.setOptions(this, options);
        },

        onAdd: function (map) {
            L.TileLayer.prototype.onAdd.call(this, map);
        },

        getTileUrl: function (tilePoint, zoom) { // (Point, Number) -> String
            var map = this._map;
            crs = map.options.crs;
            tileSize = this.options.tileSize;
            nwPoint = tilePoint.multiplyBy(tileSize);
            //+/-1 in order to be on the tile
            nwPoint.x += 1;
            nwPoint.y -= 1;
            sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
            nw = crs.project(map.unproject(nwPoint, zoom));
            se = crs.project(map.unproject(sePoint, zoom));
            tilewidth = se.x - nw.x;
            zoom = map.getZoom();
            ident = this.matrixIds[zoom].identifier;
            X0 = this.matrixIds[zoom].topLeftCorner.lng;
            Y0 = this.matrixIds[zoom].topLeftCorner.lat;
            tilecol = Math.floor((nw.x - X0) / tilewidth);
            tilerow = -Math.floor((nw.y - Y0) / tilewidth);
            url = L.Util.template(this._url, { s: this._getSubdomain(tilePoint) });
            return url + L.Util.getParamString(this.wmtsParams, url) + "&tilematrix=" + ident + "&tilerow=" + tilerow + "&tilecol=" + tilecol;
        },

        //用于瓦片偏移情况细调
        //adjustPixelOffset: function (zoom, layerPoint) {
        //    var point = L.point(0, 0);
        //    var scale = this._map.options.crs.scale(zoom);
        //    var offsetPoint = L.point(scale * (point.x - layerPoint.x), scale * (layerPoint.y - point.y));
        //    return offsetPoint;
        //},

        //_getTilePos: function () {
        //    var point = L.TileLayer.prototype._getTilePos.apply(this, arguments);
        //    return point.add(this.adjustPixelOffset(this._map.getZoom(), L.point(100, 0)));
        //},

        setParams: function (params, noRedraw) {
            L.extend(this.wmtsParams, params);
            if (!noRedraw) {
                this.redraw();
            }
            return this;
        },

        getDefaultMatrix: function () {
            /**
             * the matrix3857 represents the projection 
             * for in the IGN WMTS for the google coordinates.
             */
            var matrixIds3857 = new Array(22);
            for (var i = 0; i < 22; i++) {
                matrixIds3857[i] = {
                    identifier: "" + i,
                    topLeftCorner: new L.LatLng(1.00021E7,-5123200.0)
                };
            }
            return matrixIds3857;
        }
    });
    

    L.tileLayer.wmts = function (url, options) {
        return new L.TileLayer.WMTS(url, options);
    };
});
