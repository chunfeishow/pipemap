/**
 * 系统全局对象类
 * @module core/app
 * @class DCI.Application
 * @constructor initialize
 */
define("core/app", ["core/dcins",'backend','form'], function () {
    DCI.Application = L.Class.extend({
        /**
         * 初始化：程序入口
         * @constructor initialize
         */
        initialize: function() {
            try {
                this.backend = new DCI.Backend();
                this.form=new DCI.Form();
            } catch (e) {
                console.error(e.message);
            }
        },

        /**
         * 初始化界面
         * @method init
         */
        init: function () {
            if (DCI.Config['jsname']) {
                require([DCI.Config['jsname']], function(Controller) {
                    var controller = new Controller();
                    controller[DCI.Config['actionname']] != undefined && controller[DCI.Config['actionname']]();
                }, function(e) {
                    // 捕获模块加载错误
                    console.error(e);
                });
            }
        },

    });

    return DCI.Application;
});