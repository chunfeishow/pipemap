/*框架初始化配置*/
var Default_Paths = {
    "jquery": 'libs/jquery/jquery.min',
    "bootstrap": "libs/bootstrap/bootstrap.min",
    "rqtext": 'libs/requirejs/text',
    "leaflet": "libs/leaflet/leaflet",
    "core/dcins": "core/core.namespace",
    "core/app": "core/core.application",
   'backend':'backend/sql',

    'suijs': 'libs/sm/sm.min',   //'//g.alicdn.com/msui/sm/0.6.2/js/sm.min',   ,
    'zepto': 'libs/sm/zepto.min',    //'//g.alicdn.com/sj/lib/zepto/zepto.min',,
    'moxie':'libs/plupload/moxie',
    'plupload':'libs/plupload/plupload.min',

    'sqlite':'libs/sqlite/sqlite',
    'form':'backend/form',
    'layer':'libs/layer_mobile/layer'
 



};

var Default_Shims = {
    "bootstrap": { deps: ['jquery'] },
    'bootstrap-table-lang': { deps: ['bootstrap-table'], exports: '$.fn.bootstrapTable.defaults' },
    "suijs": { deps: ['zepto'] },
};

// 合并子页面配置
for (var item in Project_Paths) {
    Default_Paths[item] = Project_Paths[item];
}
for (var item in Project_Shim) {
    Default_Shims[item] = Project_Shim[item];
}

// 基础配置
var Base_ParamConfig = {
    /**
     * 默认Js文件版本，消除文件缓存
     * @property {String} jsVersionId
     */
    jsVersionId: "2017060601",

    /**
     * 默认登陆页面
     * @property {String} defaultLoginPage
     */
    defaultLoginPage: "module/nav/nav.html",

    /**
     * 页面标题
     * @property {String} title
     */
    title: '综合管线数据外业采集系统',



};

require.config({
    urlArgs: "t=" + Base_ParamConfig.jsVersionId,
    paths: Default_Paths,
    shim: Default_Shims,
    map: {
        '*': {
            'css': 'libs/requirejs/css.min'
        }
    }
});

//*****************************加载后执行***********************************//
require(["jquery", "bootstrap", "core/app"], function() {
    var config = requirejs.s.contexts._.config.config; // 页面定义的require.config
    $(function() {
        DCI.Config = config;
        DCI.app = new DCI.Application();
        DCI.app.init();
    });
});
//*****************************加载后执行***********************************//