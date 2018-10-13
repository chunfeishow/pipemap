define("leaflet/CRS2379", ["leaflet"], function (L) {
    if (L.CRS.Earth == null) {
        L.CRS.Earth = L.extend({}, L.CRS, {
            wrapLng: [-180, 180],

            R: 6378137,

            // distane between two geographical points using spherical law of cosines approximation
            distance: function (latlng1, latlng2) {
                var rad = Math.PI / 180,
                    lat1 = latlng1.lat * rad,
                    lat2 = latlng2.lat * rad,
                    a = Math.sin(lat1) * Math.sin(lat2) +
                        Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);

                return this.R * Math.acos(Math.min(a, 1));
            }
        });
    }

    L.Projection.GaussKruger = {

        R: 6378140.0,

        project: function (latlng) {
            //var ProjNo=0; int ZoneWide; ////带宽  
            var longitude1, latitude1, longitude0, latitude0, X0, Y0, xval, yval;
            var a, f, e2, ee, NN, T, C, A, M, iPI;
            iPI = 0.017453292519943299; ////3.1415926535898/180.0;  
            //ZoneWide = 3; ////6度带宽  

            a = 6378140.0; f = 1 / 298.257; //80年西安坐标系参数  
            //ProjNo = (int)(longitude / ZoneWide) ;  
            //longitude0 = ProjNo * ZoneWide + ZoneWide / 2;  
            longitude0 = 117 * iPI;
            latitude0 = 0;

            longitude1 = latlng.lng * iPI; //经度转换为弧度  
            latitude1 = latlng.lat * iPI; //纬度转换为弧度  
            e2 = 2 * f - f * f;
            ee = e2 * (1.0 - e2);
            NN = a / Math.sqrt(1.0 - e2 * Math.sin(latitude1) * Math.sin(latitude1));
            T = Math.tan(latitude1) * Math.tan(latitude1);
            C = ee * Math.cos(latitude1) * Math.cos(latitude1);
            A = (longitude1 - longitude0) * Math.cos(latitude1);
            M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latitude1 - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latitude1) + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latitude1) - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latitude1));
            xval = NN * (A + (1 - T + C) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ee) * A * A * A * A * A / 120);
            yval = M + NN * Math.tan(latitude1) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 + (61 - 58 * T + T * T + 600 * C - 330 * ee) * A * A * A * A * A * A / 720);
            X0 = 500000;
            Y0 = 0;
            xval = xval + X0; yval = yval + Y0;

            return new L.Point(xval, yval);
        },

        unproject: function (point) {
            //int ProjNo; int ZoneWide; ////带宽  

            var longitude1, latitude1, longitude0, X0, Y0, xval, yval;//latitude0,  
            var e1, e2, f, a, ee, NN, T, C, M, D, R, u, fai, iPI;
            iPI = 0.017453292519943299; ////3.1415926535898/180.0;  
            //a = 6378245.0; f = 1.0/298.3; //54年北京坐标系参数  
            a = 6378140.0; f = 1 / 298.257; //80年西安坐标系参数  
            //ZoneWide = 6; ////6度带宽  
            //ProjNo = (int)(X/1000000L) ; //查找带号  
            //longitude0 = (ProjNo-1) * ZoneWide + ZoneWide / 2;  
            longitude0 = 117 * iPI; //中央经线  

            X0 = 500000;
            Y0 = 0;
            xval = point.x - X0; yval = point.y - Y0; //带内大地坐标  
            e2 = 2 * f - f * f;
            e1 = (1.0 - Math.sqrt(1 - e2)) / (1.0 + Math.sqrt(1 - e2));
            ee = e2 / (1 - e2);
            M = yval;
            u = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
            fai = u + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * u) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * u) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * u) + (1097 * e1 * e1 * e1 * e1 / 512) * Math.sin(8 * u);
            C = ee * Math.cos(fai) * Math.cos(fai);
            T = Math.tan(fai) * Math.tan(fai);
            NN = a / Math.sqrt(1.0 - e2 * Math.sin(fai) * Math.sin(fai));
            R = a * (1 - e2) / Math.sqrt((1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin(fai) * Math.sin(fai)));
            D = xval / NN;
            //计算经度(Longitude) 纬度(Latitude)  
            longitude1 = longitude0 + (D - (1 + 2 * T + C) * D * D * D / 6 + (5 - 2 * C + 28 * T - 3 * C * C + 8 * ee + 24 * T * T) * D * D * D * D * D / 120) / Math.cos(fai);
            latitude1 = fai - (NN * Math.tan(fai) / R) * (D * D / 2 - (5 + 3 * T + 10 * C - 4 * C * C - 9 * ee) * D * D * D * D / 24 + (61 + 90 * T + 298 * C + 45 * T * T - 256 * ee - 3 * C * C) * D * D * D * D * D * D / 720);
            //转换为度 DD  

            return new L.LatLng(latitude1 / iPI, longitude1 / iPI);
        },

        bounds: (function () {
            var d = 6378140 * Math.PI;
            return L.bounds([511000, 2711000], [518000, 2721000]);
        })()
    };

    L.CRS.EPSG2379 = L.extend({}, L.CRS.Earth, {
        code: 'EPSG:2379',

        projection: L.Projection.GaussKruger,

        transformation: new L.Transformation(1, 5123200,-1, 10002100),

        scale: function (zoom) {
            switch (zoom) {
                case 0:
                    return 1 / 66.1459656252646;
                case 1:
                    return 1 / 33.0729828126323;
                case 2:
                    return 1 / 16.9333672000677;
                case 3:
                    return 1 / 8.46668360003387;
                case 4:
                    return 1 / 4.23334180001693;
                case 5:
                    return 1 / 2.11667090000847;
                case 6:
                    return 1 / 1.05833545000423;
                case 7:
                    return 1 / 0.529167725002117;
                case 8:
                    return 1 / 0.264583862501058;
                case 9:
                    return 1 / 0.132291931250529;
                case 10:
                    return 1 / 0.0661459656252646;
                default:
                    return 1 / 0.0661459656252646 * Math.pow(2, zoom - 10);
            };
        },

        getScale: function (zoom) {
            switch(zoom){
                case 0:
                    return 250000;
                case 1:
                    return 125000;
                case 2:
                    return 64000;
                case 3:
                    return 32000;
                case 4:
                    return 16000;
                case 5:
                    return 8000;
                case 6:
                    return 4000;
                case 7:
                    return 2000;
                case 8:
                    return 1000;
                case 9:
                    return 500;
                case 10:
                    return 250;
            }
        },
        infinite: false,

        wrapLng: [116, 120],

        wrapLat: [0, 50],

        getSize: function (zoom) {
            var b = this.projection.bounds,
                s,
                min,
                max;

            if (b) {
                s = this.scale(zoom);
                min = this.transformation.transform(b.min, s);
                max = this.transformation.transform(b.max, s);
                return L.point(Math.abs(max.x - min.x), Math.abs(max.y - min.y));
            } else {
                // Backwards compatibility with Leaflet < 0.7  
                s = 256 * Math.pow(2, zoom);
                return L.point(s, s);
            }
        }
    });
    return L.CRS.EPSG2379;
});