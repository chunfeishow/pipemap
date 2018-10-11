/**
 * 数据库综合类
 * @module backend
 * @class DCI.Backend
 * @constructor initialize
 */
define(["core/dcins",'sqlite' ], function() {
    var db = new DB('PipeCollect', '1.0.0','', 1024*1024*2);
    DCI.Backend = L.Class.extend({
        // db:new DB('PipeCollect', '1.0.0','', 1024*1024*2),
        initialize: function() {


            db.CreateTable("ProjectList", "id integer primary key autoincrement , name char(50),updatatime date, uploadtime date,ctime date,ismeasure int,projectID int");
            //  物探点录入信息表A（适用于排水管线）
            db.CreateTable("PipePointA", "id integer primary key autoincrement , name char(50),Lon double,Lat double,H double,WTID char(10), GXCZ char(10),TZD char(10),FSW char(10),GJ char(10),MS double,GS int, MSND int,LJFX char(10),BZ char(50),ismeasure int,projectID int");
            //  物探点录入信息表B（适用于非排水管线）
            db.CreateTable("PipePointB", "id integer primary key autoincrement , name char(50),Lon double,Lat double,H double,WTID char(10), GXCZ char(10),TZD char(10),FSW char(10),GJ char(10),JFFF char(20),DSFF char(20),TC double,JZH double,GD chauble,LJFX char(10),BZ char(50),ismeasure int,projectID int");
            //  辅助表A（排水）
            db.CreateTable("metadataA", "id integer primary key autoincrement , name char(50),GXLX char(20), CQ char(10),GCBH char(50),TFBH char(20),CZR char(20),JLR char(20), RQ data,JHR char(10),JHRQ data,JCR char(10), JCRQ data,updatatime date, uploadtime date");
            //  辅助表B（适用于非排水）
            db.CreateTable("metadataB", "id integer primary key autoincrement , name char(50),GXLX char(20), CQ char(10),GCBH char(50),TFBH char(20),CZR char(20),JLR char(20), RQ data,JHR char(10),JHRQ data,JCR char(10), JCRQ data,updatatime date, uploadtime date");




        },
        _bind:function(){
            console.log(1);

        },
//      init:function(){
//      	// 创建工程表
//	        db.CreateTable("ProjectList", "id integer primary key autoincrement , name char(50),updatatime date, uploadtime date,ctime date,ismeasure int");
//	        //  物探点录入信息表A（适用于排水管线）
//	        db.CreateTable("PipePointA", "id integer primary key autoincrement , name char(50),Lon double,Lat double,H double,WTID char(10), GXCZ char(10),TZD char(10),FSW char(10),GJ char(10),MS double,GS int, MSND int,LJFX char(10),BZ char(50),ismeasure inte");
//          //  物探点录入信息表B（适用于非排水管线）
//	        db.CreateTable("PipePointB", "id integer primary key autoincrement , name char(50),Lon double,Lat double,H double,WTID char(10), GXCZ char(10),TZD char(10),FSW char(10),GJ char(10),JFFF char(20),DSFF char(20),TC double,JZH double,GD double,LJFX char(10),BZ char(50),ismeasure int");
//	        //  辅助表A（排水）
//	        db.CreateTable("metadataA", "id integer primary key autoincrement , name char(50),GXLX char(20), CQ char(10),GCBH char(50),TFBH char(20),CZR char(20),JLR char(20), RQ data,JHR char(10),JHRQ data,JCR char(10), JCRQ data,updatatime date, uploadtime date");
//	        //  辅助表B（适用于非排水）
//	        db.CreateTable("metadataB", "id integer primary key autoincrement , name char(50),GXLX char(20), CQ char(10),GCBH char(50),TFBH char(20),CZR char(20),JLR char(20), RQ data,JHR char(10),JHRQ data,JCR char(10), JCRQ data,updatatime date, uploadtime date");
//          this._bind();
//      },
//
        /**
         * 辅助表操作
         * 新增辅助表
         * {
         */
        addPro:function(table,data,callback){
            if(callback){
                db.insert(table,data,callback);
            }else {
                db.insert(table,data);
            }
        },

        /**
         * 更新辅助表
         */
        updatePro:function(table,data,where,param,callback){

            db.update(table,data,where,param,callback);

        },

        /**
         * 删除辅助表数据
         */
        deletePro:function(table,colomun,value){
            db.toDelete(table,colomun +" =?",[value]);
        },

        /**
         * 查询辅助表数据
         * @param
         */
        queryPro:function(table,colomun,value){
            db.fetchAll('select * from '+table +' where '+colomun+' = '+'"'+value+'"',function(ret){return ret});
        },

        /**
         * 查询辅助表数据
         * @param {Function} callback 执行数据库语句之后的回调函数 返回信息
         */
        queryAllPro:function(table,callback){
            db.fetchAll('select * from '+table ,callback);
        },


        /**
         * 管点表操作
         * 新增管点表数据
         */
        addPoint:function(table,data,callback){
            if(callback){
                db.insert(table,data,callback);
            }else {
                db.insert(table,data);
            }
        },

        /**
         * 更新管点表
         */
        updatePoint:function(table,data,where,param,callback){

            db.update(table,data,where,param,callback);

        },

        /**
         * 删除管点表数据
         */
        deletePoint:function(table,colomun,value){
            db.toDelete(table,colomun +" =?",value);
        },

        /**
         * 查询管点表数据
         */
        queryPoint:function(table,colomun,value,callback){
            db.fetchAll('select * from '+table +' where '+colomun+' = '+value,callback);
        },

        /**
         * 查询管点表数据
         */
        queryAllPoint:function(table,callback){
            db.fetchAll('select * from '+table ,callback);
        }
    })
    return DCI.Backend;
})