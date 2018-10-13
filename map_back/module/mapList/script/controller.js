define(['suijs','moxie','plupload'], function () {
    var Controller = L.Class.extend({

        clickMarks:[],
        markArr:[],//多线的数组
        clickPoly:[],
        savePoint:[],
        savePointMark:[],
        cliclIng:null,//当前正在编辑的点的标记
        initialize:function(){
            this._initMap();
            this._default();
            this._bind();
            this._initSelect();
        },
        _default:function(){
            var _this=this;
            //请求地址参数
            var href = (decodeURI(window.location.search)).slice(1);
           var href= href.split('=');
           $('.projectID').val(href[1]);

           //排水
            DCI.app.backend.queryPoint('PipePointA','projectID',href[1],function(data){

                for(var i=0;i<data.length;i++){
                    //描绘出点
                   var mark= _this.setMark([data[i].Lng,data[i].Lat],data[i]['WTID'],data[i]);
                    //_this.setText([data[i].Lng,data[i].Lat],data[i]['WTID']);
                    _this.savePoint.push(mark);
                    _this.linkPoint(data[i],data)

                }
                _this._initLJFX(data,$('.LJFX').eq(0));
            });
            //非排水
            DCI.app.backend.queryPoint('PipePointB','projectID',href[1],function(data){
                for(var i=0;i<data.length;i++){
                    //描绘出点
                    var mark=_this.setMark([data[i].Lng,data[i].Lat],data[i]['WTID'],data[i]);
                    //_this.setText([data[i].Lng,data[i].Lat],data[i]['WTID']);
                    _this.savePoint.push(mark);
                }
                _this._initLJFX(data,$('.LJFX').eq(1));
                //对所有的点进行连线，如果有的话

            });
        },
        _bind:function(){
            var _this=this;
            $('#icon_1').on('click',$.proxy(function(){
                $('.tag').val('new');
                $('.ismeasure').val('');
                this._oneMapEvent(1,_this._oneClickMap);
            },this))

            /*方向线事件*/
            $('.direction').on('click',function(){
                //清除地图事件  覆盖物不清除
                //重新设置地图事件
                $('.alert_layer,.alert_layer>div').css('display','none');
                _this.removeMapEvent();
                _this.clickListener = AMap.event.addListener(_this.mapObj, "click", _this._directionEvent.bind(_this));

            })
            $('.go_on').on('click',function(){
                //展示面板
                $('.alert_layer,.alert_layer>.layer_2').css('display','none');
            })

            $('.direction_cancel').on('click',function(){
                //展示对应的面板，清除地图事件 只保留第一个标志点
                $('.alert_layer>.layer_2').css('display','none');
                $('.alert_layer>.layer_1').css('display','block');
                var mark=_this.setMark([ _this.clickMarks[0].getCenter().lng,_this.clickMarks[0].getCenter().lat]);
                _this.clearMark();
                _this.removeMapEvent();
                _this.clickMarks.push(mark);
                //设置地图事件
                _this.clickListener = AMap.event.addListener(_this.mapObj, "click", _this._oneClickMap.bind(_this));
            })

            $('#icon_2').on('click',$.proxy(function(){
                this._oneMapEvent(2,_this._twoClickMap);
            },this))

            $('#icon_3').on('click',$.proxy(function(){
                _this.showDiv(3)
                this._threeClickMap();
            },this))

            $('#icon_4').on('click',$.proxy(function(){
                this._oneMapEvent(4,_this._fourClickMap);
            },this))

            $('#icon_5').on('click',$.proxy(function(){
                this._oneMapEvent(5,_this._fiveClickMap);
            },this))

            $('#icon_6').on('click',$.proxy(function(){
                var number=this.mapObj.getZoom();
                this.mapObj.setZoom(number+1);
            },this));

            $('#icon_7').on('click',$.proxy(function(){
                var number=this.mapObj.getZoom();
                this.mapObj.setZoom(number-1);
            },this))

            $('#icon_8').on('click',$.proxy(function(){
                this.showDiv(8);
            },this));

            $('#icon_9').on('click',$.proxy(function(){
                //.showDiv(8);
                //地图上的覆盖物点击 出现信息编辑
                this.showDiv(9);
                this.EditMark();
                $('.tag').val('edit');
                $('.ismeasure').val('');

            },this))

            /*取消事件*/
            $('.cancel').on('click',function(){
                $('input[type=text]').val('');
                $('input[type=file]').val('');
                $('.alert_layer,.alert_layer>div').css('display','none');
                //清除覆盖物
                if(_this.clickMarks[0]){
                    _this.clickMarks[0].setMap(null);//圆点
                }

                if($('.tag').val()=='edit'){
                    var extData = _this.cliclIng.getExtData();
                    _this.cliclIng.setPosition([extData.Lng,extData.Lat])
                }
            })

            $('.alert_msg').on('change','#msg_1_select ',function(){
                var index=$(this).find('option:selected').attr('data-index');
                console.log(index)
                var value=$(this).find('option:selected').val();
                var optionIndex=$(this).find('option:selected').index();
                _this.changeSelect(index);
                _this.addAttribute(value);

            })

            //确定事件
            $('.sure').on('click',function(){
                _this.saveMarkTable();
                $('input[type=text]').val('');
                $('input[type=file]').val('');
                $('.alert_layer,.alert_layer>div').css('display','none');
//              
            })

        },
        /*地图初始化*/
        _initMap:function(){
            var _this = this;
            this.mapObj = new AMap.Map('container', {
                resizeEnable: true,
                //zoom: 5,
                //center: [107.63, 35.74]
            });
            this.mapObj.plugin('AMap.Geolocation', function () {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    buttonPosition: 'RB',
                    showButton: true,//显示定位按钮 true显示 false不显示
                    showMarker:true,//定位成功时是否在定位位置显示一个Marker
                    showCircle:false,
                    // markerOptions: { animation: 'AMAP_ANIMATION_DROP' }
                });
                _this.mapObj.addControl(geolocation);
                geolocation.getCurrentPosition()
            })
        },

        /*地图事件*/
        _oneMapEvent:function(index,eventMap){
            var _this=this;
            // msg_1显示 layer_1显示  alert_layer alert-msg 样式整理
            this.showDiv(index);
            _this.clickListener = AMap.event.addListener(_this.mapObj, "click", eventMap.bind(_this));
        },

        /**
         * 具体点击事件-第一个  _oneClickMap
         * @private
         */
        _oneClickMap:function(e){
            var _this = this;
            var marker=this.setMark([e.lnglat.lng,e.lnglat.lat]);

            _this.clickMarks[0] = marker;//保存覆盖物
            //点击时候存入坐标到输入框
            $('.Lng').val( e.lnglat.lng);
            $('.Lat').val( e.lnglat.lat);

            /*实现窗口弹出 填写参数*/
            $('.alert_layer>div').css('display','none');
            $('.alert_layer,.layer_1').css('display','block');

            var dataName=$('#msg_1_select').find('option:selected').attr('data-name');
            $('.WTID').val(dataName+_this.pipeName(dataName));




        },

        /**
         * 方向的事件
         */
        _directionEvent:function(e){
            var _this=this;
            var  positionArr=[];
            if(this.clickPoly.length){
                this.clickPoly[0].setMap(null)
            }
            //先存入点
            var mark=this.setMark([e.lnglat.lng,e.lnglat.lat]);
            _this.clickMarks.push(mark);
            for(var i=0,len=this.clickMarks.length;i<len;i++){
                positionArr.push([_this.clickMarks[i].getCenter().lng,_this.clickMarks[i].getCenter().lat]);
            }

            var polyline=this.setPoly(positionArr,'dashed');
            polyline.setMap(_this.mapObj);
            this.clickPoly.push(polyline);

            //展示面板
            $('.alert_layer,.alert_layer>.layer_2').css('display','block');

            // this.mapObj.setFitView();




        },

        /*第二个按钮的点击事件 绘制线条*/
        _twoClickMap:function(e){
            var _this=this;
            //保留折线的二维数组
            this.markArr.push([e.lnglat.lng,e.lnglat.lat]);
            /*清除圆点 只保存最后的圆点*/
            if(this.clickMarks[0]){
                this.clickMarks[0].setMap(null);
            }

            var marker=this.setMark([e.lnglat.lng,e.lnglat.lat]);
            var polyline=this.setPoly(_this.markArr);
            polyline.setMap(_this.mapObj);
            this.clickMarks[0] = marker;
            this.clickPoly.push(polyline) ;
            //地图自适应
            //_this.mapObj.setFitView();
        },

        /**
         * 第三个按钮展示线条事件 线条加点
         * @private
         */
        _threeClickMap:function(e){
            var _this=this;
            var MarkArr=[];//保存在线上点击圆点的位置
            var lineArr = [//折线的二维数组
                [116.368904, 39.913423],
                [116.382122, 39.901176],
                [116.387271, 39.912501],
                [116.388258, 39.904600]
            ];
            var polyline=this.setPoly(lineArr);

            polyline.setMap(_this.mapObj);

            polyline.on('click',function(e){
                //添加圆点
                var marker=_this.setMark([e.lnglat.lng,e.lnglat.lat]);
                MarkArr.push([e.lnglat.lng,e.lnglat.lat]);
                _this.clickMarks.push(marker);
            })
            this.clickPoly[0] = polyline;
            //地图自适应
            _this.mapObj.setFitView();
        },

        /*第四个按钮点击事件 点打钩*/
        _fourClickMap:function(e){
            var _this=this;
            /*展示需要点击的标志点*/
            var marker=this.setMark([e.lnglat.lng,e.lnglat.lat],false);
            marker.on('click',function(){
                var position=this.getCenter() ;
                var text= _this.setText(position);
                _this.clickMarks.push(text);
            });
            this.clickMarks[0] = marker;
        },

        _fiveClickMap:function(e){

        },

        //编辑点
        EditMark:function(){
            var _this=this;
            //给所有的点设计点击事件 设置移动事件
            //当点击之后出现表单 可修改属性
            for(i=0;i<this.savePoint.length;i++){
                //设备点标记是可移动
                this.savePoint[i].setDraggable(true);
                this.savePoint[i].on('click',function(e){
                    //获取自定义属性
                   var exData= this.getExtData();
                    /*实现窗口弹出 填写参数*/
                    $('.alert_layer>div').css('display','none');
                    $('.alert_layer,.layer_1').css('display','block');
                    $(`#msg_1_select option[value=${exData['H']}]`).prop('selected','selected');
                    $('#msg_1_select').trigger('change');
                    //实现赋值
                    _this._initForm(exData);

                    //保存当前正在点击的点
                    _this.cliclIng=this;


                })
                this.savePoint[i].on('dragend',function(e){

                    var exData= this.getExtData();
                    $('.alert_layer>div').css('display','none');
                    $('.alert_layer,.layer_1').css('display','block');
                    $(`#msg_1_select option[value=${exData['H']}]`).prop('selected','selected');
                    $('#msg_1_select').trigger('change');
                    //实现赋值
                    _this._initForm(exData);
                    _this.cliclIng=this;
                });

            }
        },



        /*清除地图事件*/
        removeMapEvent:function(){
            var _this = this;
            if (_this.clickListener) {
                AMap.event.removeListener(_this.clickListener);
            }
        },
        /**
         * 覆盖物点标记
         * position 点标记位置 经纬度
         * bubble 是否冒泡的地图上 默认tuue
         * */
        setMark:function(position,title,extData){
            var _this=this;
            //原点
            // var marker = new AMap.CircleMarker({
            //     center: position,//位置参数
            //     map: _this.mapObj,
            //     radius:'10px',
            //     fillColor:'#fff',
            //     fillOpacity:0,
            //     bubble:bubble !== undefined||bubble!=="" ?bubble:true,//事件冒泡
            //     extData:extData == undefined?false:extData
            // });
            var marker=new AMap.Marker({
                position: position,//[treeNode['X'],treeNode['Y']]
                //title: title,
                map: _this.mapObj,
                label: { offset: new AMap.Pixel(0, 25), content: title },
                animation: 'AMAP_ANIMATION_DROP',
                extData:extData == undefined?false:extData
                //icon: new AMap.Icon({
                //    size: new AMap.Size(28, 36),  //图标大小
                //    image: "../../../../../../" + img,

                //})
                //content: "<div style='position:relative'><img src=../../../../../../" + img + " /> <span style='position:absolute;top:6%;left:32%;font-weight:bold;'>" + 'L' + "</span></div>"
            });

            return marker;
        },

        /**
         * 覆盖物文字
         */
        setText:function(position,text){
            var _this=this;
            var Text = new AMap.Text({
                text:text==undefined?"√":text,
                textAlign: 'center',
                verticalAlign: 'center',
                map: _this.mapObj,
                position: position,
                zIndex: 1000,
                style: {
                    //2
                    'margin-top':'-1.3rem',
                    'margin-left':'1rem',
                    'font-size':'.7rem',
                    'font-weight': 'bolder',
                    'color': '#000',
                    'background-color': 'transparent',
                    'border':'none',

                },

            });
            return Text
        },

        /*
        *覆盖物折线
        * polyArr 折线的二维数组
        * */
        setPoly:function(polyArr,strokeStyle){
            polyline = new AMap.Polyline({
                path: polyArr,          //设置线覆盖物路径
                strokeColor: "#3366FF", //线颜色
                // strokeStyle:'solid',
                strokeOpacity: 1,       //线透明度
                strokeWeight: 5,        //线宽
                strokeDasharray: [10, 5], //补充线样式
                bubble:true,
                zIndex:10000,
                strokeStyle:strokeStyle!=undefined?strokeStyle:'solid'

            });
            return polyline

        },

        /*清空覆盖物*/
        clearMark:function(){
            if (this.clickMarks.length > 0) {
                for(var i=0 , len=this.clickMarks.length;i<len;i++){
                    this.clickMarks[i].setMap(null);
                }
                this.clickMarks=[];
            }
            if(this. clickPoly.length>0){
                for(var i=0 , len=this.clickPoly.length;i<len;i++){
                    this.clickPoly[i].setMap(null);
                }
                this.clickPoly=[];
            }
            for(i=0;i<this.savePoint.length;i++){
                this.savePoint[i].off('click');
                this.savePoint[i].off('dragend');
                this.savePoint[i].setDraggable(false);
            }

            this.markArr=[];
        },
        /**
         * 展示对应的内容快出来
         */
        showDiv:function(index){
            $('.alert_msg>div,.alert_layer,.alert_layer>div').css('display','none');
            $('.alert_msg').css('display','block');
            $('.msg_'+index).css('display','block');

            //地图实现点击事件
            //清空之前所有覆盖物
            //清空之前所有的地图事件
            this.clearMark();
            this.removeMapEvent();
        },

        /*加载下拉列表*/
        _initSelect:function(){
            //非排水
            var arr1=['排水','雨水','污水','雨污合流'];

            //排水
            var arr=['给水','燃气','通信','电力','热力','工业','石油','综合','管沟','垃圾真空'];

            var name=['js','rq','tx','dl','rl','gy','sy','zh','gg','ljzk'];

            var name1=['ps','ys','ws','hs'];
            for(var i=0;i<arr.length;i++){
                $('#msg_1_select').append(`<option data-index="0" data-name="${name[i]}" value="${arr[i]}">${arr[i]}</option>`);
            }
            for(var i=0;i<arr1.length;i++){
                $('#msg_1_select').append(`<option data-index="1" data-name="${name1[i]}" value="${arr1[i]}">${arr1[i]}</option>`);
            }

        },

        /*下拉列表事件*/
        changeSelect:function(index){

            if(index=="1"){
                //非排水显示
                $('.layer_1 ul:eq(0)').css('display','none');
                $('.layer_1 ul:eq(1)').css('display','block');
            }
            else{
                $('.layer_1 ul:eq(0)').css('display','block');
                $('.layer_1 ul:eq(1)').css('display','none');
            }
        },

        /*加载管材 特征 附属物*/

        addAttribute:function(value){
            var attrbute=[
                {'给水':['砼','钢','铸铁','塑料','玻璃钢'],'雨水':['砼','钢','铸铁','塑料','玻璃钢','陶瓷'],'污水':['砼','钢','铸铁','塑料','玻璃钢','陶瓷'],'雨污合流':['砼','钢','铸铁','塑料','玻璃钢','陶瓷'],
                '排水':['砼','钢','铸铁','塑料','玻璃钢','陶瓷'],'燃气':['钢','塑料'],'电力':['铜'],'通信':['铜','光纤'],'石油':['钢','铸铁','塑料'],'热力':['钢','铸铁','塑料'],'工业':['钢','铸铁','塑料']},

                {'给水':['井偏点','弯点','变径','塑料','封头','预留口','放水口','变坡','变质','边点'],'雨水':['边点','弯头','变质','变径','出水口','进水口'],'污水':['边点','弯头','变质','变径','出水口','进水口'],'雨污合流':['边点','弯头','变质','变径','出水口','进水口'],
                   '排水':['边点','弯头','变质','变径','出水口','进水口'], '燃气':['边点','弯头','变径','封头','预留口','放散管','排气管','变质'],'电力':['边点','弯头','变径','上杆','预留口','分支','变孔','上墙','变规格'],'通信':['边点','弯头','变径','上杆','预留口','分支','变孔','上墙','变规格'],'石油':['弯头','变径','封头','预留口','变质'],'热力':['弯头','变径','封头','预留口','变质'],'工业':['弯头','变径','封头','预留口','变质']},

                {'给水':['窨井','消防栓','阀门','水表','水表组'],'雨水':['窨井','雨水篦','阀门','化粪池'],'污水':['窨井','污水篦','阀门','化粪池'],'雨污合流':['窨井','污水篦','阀门','化粪池','雨水篦'],
                    '排水':['窨井','污水篦','阀门','化粪池','雨水篦'], '燃气':['窨井','调压器','阀门','燃气表'],'电力':['窨井','路灯','接线箱','变压器','分线箱','手孔','人孔'],'通信':['窨井','手孔','接线箱','摄像头','人孔'],'石油':['窨井','阀门'],'热力':['窨井','阀门'],'工业':['窨井','阀门']},

                {'给水':['旧管','接旧管','出地','出露','入户','非测区','一井多盖','超大窨井','架空','进墙','定向钻'],'雨水':['旧井','接旧井','暗渠','架空','入户','非测区','一井多盖','超大窨井','压力管'],'污水':['旧井','接旧井','暗渠','架空','入户','非测区','一井多盖','超大窨井','压力管'],'雨污合流':['旧井','接旧井','暗渠','架空','入户','非测区','一井多盖','超大窨井','压力管'],
                    '排水':['旧井','接旧井','暗渠','架空','入户','非测区','一井多盖','超大窨井','压力管'], '燃气':['中压','低压','出地','出露','入户','非测区','旧管','接旧管','架空','定向钻','一井多盖','超大窨井','出地盘管'],'电力':['10KV','10KV/直埋','出地/入户','出露','进墙','非测区','旧管','接旧管','架空','定向钻','一井多盖','超大窨井','电力隧道','综合管沟','380V','110KV','空管'],'通信':['空管','入地','出地','进墙','非测区','旧管','接旧管','架空','定向钻','一井多盖','超大窨井','入户'],'石油':['旧管','接旧管','出地','出露','入户','非测区','一井多盖','超大窨井','架空','进墙','定向钻'],'热力':['旧管','接旧管','出地','出露','入户','非测区','一井多盖','超大窨井','架空','进墙','定向钻'],'工业':['旧管','接旧管','出地','出露','入户','非测区','一井多盖','超大窨井','架空','进墙','定向钻']}
                ];
            $('.GXCZ,.TZD,.FSW,.BZ').html('<option value="无">无</option>')
            var name=['.GXCZ','.TZD', '.FSW', '.BZ'];

            for(var i=0;i<attrbute.length;i++){
                if(attrbute[i][value]){
                    for(var j=0;j<attrbute[i][value].length;j++){
                        $(name[i]).append('<option value="'+attrbute[i][value][j]+'">'+attrbute[i][value][j]+'</option>');
                    }
                }

            }
        },

        /*匹配名字*/
        pipeName:function(name){
            var key=0;
            for(var i=0;i<this.savePoint.length;i++){
                var WTID=(this.savePoint[i].getExtData( ))['WTID'];
                if(WTID.indexOf(name)!==-1){

                    key=WTID.substring(WTID.length-1, WTID.length)
                }
            }
            key=key*1+1;
            return key;
        },
        /*连接方向的点*/
//     _initLJFX:function(data,elem){
//         elem.html('');
//         elem.append('<option value="-1">无</option>');
//         for(var i=0;i<data.length;i++) {
//             elem.append(`<option value="${data[i]['WTID']}">${data[i]['WTID']}</option>`);
//         }
//     },
      linkPoint:function(data,ALLdata){
          // console.log(ALLdata);
          for(var i=0;i<ALLdata.length;i++) {
              if(ALLdata[i]['WTID']==data['LJFX']){
                  var lineArr = [//折线的二维数组
                      [ALLdata[i].Lng,ALLdata[i].Lat],
                      [data.Lng,data.Lat],
                  ];
                  var polyline=this.setPoly(lineArr);
                  polyline.setMap(this.mapObj);

              }
          }

      },
        //对表单进行赋值
        _initForm:function(data){
          console.log(data);
            for(var key in data){
                $('.layer_1 ul:visible').find('.'+key).val(data[key])
            }
        },

        //新增点标记的保存
        saveMarkTable:function(tableData){
            var _this=this;
            //判断哪个表单 也就是排水或非排水
            //把值一个个输进去
            var obj={Lng:'',Lat:'',WTID:'',GXCZ:'',TZD:'',FSW:'',GJ:'',MS:'',GS:'',MSND:'',LJFX:'',BZ:'',projectID:''};
            var obj1={Lng:'',Lat:'',WTID:'',GXCZ:'',TZD:'',FSW:'',GJ:'',JFFF:'',DSFF:'',TC:'',JZH:'',GD:'',LJFX:'',BZ:'',projectID:''};
            var dataObj={};
            var flag=DCI.app.form.required($('.layer_1 ul:visible')) ;
            if(flag){
                var table=$('.layer_1 ul:visible').find('.table').val();
                var tag=$('.layer_1 ul:visible').find('.tag').val();
                if(table=="PipePointA"){
                    //进行添加
                    for(var key in obj){
                        obj[key]=$('.layer_1 ul:visible').find('.'+key).val();
                    }
                    if(tag=="new"){
                        obj['ismeasure']=0;
                    }
                    else if(tag=="edit"){
                        obj['ismeasure']=$('.layer_1 ul:visible').find('.ismeasure').val();
                    }
                    obj['ismeasure']=0;
                    obj['H']=$('#msg_1_select').val();
                    dataObj=obj;
                }
                else{
                    for(var key in obj1){
                        obj1[key]=$('.layer_1 ul:visible').find('.'+key).val();
                    }
                    if(tag=="new"){
                        obj1['ismeasure']=0;
                    }
                    else if(tag=="edit"){
                        obj1['ismeasure']=$('.layer_1 ul:visible').find('.ismeasure').val();
                    }
                    obj1['H']=$('#msg_1_select').val();
                    dataObj=obj1;
                }
                console.log(dataObj);
                if(tag=="new"){
                    DCI.app.backend.addPoint(table,dataObj,function(data){

                        if(data==0){
                            Zepto.toast('新增失败');
                            return;
                        }
                        Zepto.toast('新增成功');
                        if(table=="PipePointA"){
                            $('.LJFX').eq(0).append(`<option value="${dataObj['WTID']}">${dataObj['WTID']}</option>`)
                        }
                        else{
                            $('.LJFX').eq(1).append(`<option value="${dataObj['WTID']}">${dataObj['WTID']}</option>`)
                        }
                        $('.alert_layer,.alert_layer>div').css('display','none');
                        //展示点
                        var mark=_this.setMark([dataObj.Lng,dataObj.Lat],dataObj['WTID'],dataObj);
                        //var mark=_this.setMark([dataObj.Lng,dataObj.Lat],dataObj['WTID'],dataObj);
                        //_this.setText([dataObj.Lng,dataObj.Lat],dataObj['WTID']);

                        //清除覆盖物
                        _this.clickMarks[0].setMap(null);//圆点
                        _this.savePoint.push(mark);
                    });
                }

                else if(tag=="edit"){
                    DCI.app.backend.updatePoint(table,dataObj,'WTID=?',[$('.layer_1 ul:visible').find('.WTID').val()],function(data){
                       if(data==1){
                           $('.alert_layer,.alert_layer>div').css('display','none');
                           _this.savePoint=[];
                           //清除所有覆盖物
                          _this.mapObj.clearMap( );
                           //点重新加载
                           _this._default();
                           //重新赋值事件
                           _this.EditMark();
                           Zepto.toast('需改成功');
                       }
                       else{
                           Zepto.toast('修改失败');
                       }

                    });
                }

            }
        },



    })
    return Controller;
})
