
define(['plupload','suijs','moxie'], function (plupload) {
    var Controller = L.Class.extend({
        projectArray:[],//保存已有项目

        initialize:function(){

            this._initProject();
            this.upLoad();
            this._bind();
            this._default();
            this._initSelect();
            this.searchProject();

        },
       _default:function(){
            console.log(this.getTime());
            console.log($('.time'));
            $('.time,#updatatime').val(this.getTime());

       },
        _bind:function(){
            var _this=this;
            $('.tab-item').on('click',function(){
                $('.tab-item').removeClass('active');
                $(this).addClass('active');
            })
            $('#project-list').on('click','li',function(){
                var index=$(this).index();
                var table=$(this).attr('data-index');
                var data=_this.projectArray[index];
                $('#projectId').val(data['id']);
                $('#index').val(index);
                $('#tag').val('edit');
                for(var key in data){
                    if(key=="GXLX"){
                        $('#'+key+' option').removeAttr('selected');
                        $('#'+key+' option[value="'+data[key]+'"]').prop('selected','true');
                    }
                    else{
                        $('#'+key).val(data[key]);
                    }
                }
                //设置滚动条到顶部
                $('.content').eq(0).scrollTop(-10);
                //设置打开工程的属性
                $('.openProject').attr('href','../mapList/mapList.html?projectId='+data['id'])
            })

            /*保存*/
            $('#save').on('click',function(){
                var data={'name':'', 'GXLX': '' ,'CQ':'','GCBH':'','TFBH':'','CZR':'','JLR':'','RQ':'','JHR':'','JHRQ':'','JCR':'','JCRQ':'','updatatime':'','uploadtime':''}
                for(var key in data){
                   data[key]= $('#'+key).val();
                }
                var flag=DCI.app.form.required($('#showProject'));

                if($('#tag').val()=="new"){
                    //新增
                    if(flag){
                       DCI.app.backend.addPro('metadataA',data,function(dataObj){
                           if(dataObj==0){
                               Zepto.toast('插入失败');
                               return false;
                           }
                           Zepto.toast('插入成功');
                           //项目数组增加一个
                           _this.projectArray.push(data);
                           //页面增加一行
                           var str=_this.addProject(data['name']);
                           $('#project-list').append(str);
                       });

                   }
                   else{
                       Zepto.toast('请输入必填值');
                   }
                }
                if($('#tag').val()=="edit"){
                    if(flag){
                        //编辑
                        DCI.app.backend.updatePro('metadataA',data,'id=?',[$('#projectId').val()],function(dataObj){
                            console.log(dataObj)
                            if(dataObj==0){
                                Zepto.toast('修改失败');
                                return;
                            }
                            Zepto.toast('修改成功');
                            data['id']=$('#projectId').val();
                            //项目数组进行修改
                            _this.projectArray[$('#index').val()]=data;
                            //列表也要换
                            $('#project-list li').eq($('#index').val()).replaceWith(_this.addProject(data['name']));
                        })

                    }
                    else{
                        Zepto.toast('请输入必填值');
                    }

                }
            })

            /**新增按钮**/
            $('#create').on('click',function(){
                $('#showProject input').val('');
                $('#tag').val('new');
                $('.time,#updatatime').val(_this.getTime());

            })

            /*删除工程*/
            $('#removeProject').on('click',function(){
                var index=$('#index').val();
                var projectId=$('#projectId').val();
                _this.projectArray.splice(index,1);
                $('#project-list li').eq(index).remove();
                DCI.app.backend.deletePro('metadataA','id',projectId);

                // $('#page-2').removeClass('page-current');
                // $('#page-1').addClass('page-current');
                Zepto.router.back()
                Zepto.toast('删除成功');
                console.log( _this.projectArray);

            })

        },

        /*上传文件upLoad
          *@param {String} id 上传按钮的id
          *@param {String} u 后台的地址
          */
        upLoad: function () {
            var _this = this;
            this.uploader = new plupload.Uploader({ //实例化一个plupload上传对象
                browse_button: 'file',
                // url: _this.pUrl + 'api/SysParam/UploadLogoFile',
                flash_swf_url: '../libs/plupload/js/Moxie.swf',
                silverlight_xap_url: '../libs/plupload/js/Moxie.swf',
                filters: {
                    mime_types: [ //只允许上传图片文件和rar压缩文件
                        { title: "图片文件", extensions: "jpg,gif,png,bmp,jpeg" },
                        //{ title: "RAR压缩文件", extensions: "zip" }
                    ],
                    ////max_file_size: '100kb', //最大只能上传100kb的文件
                    //prevent_duplicates: true //不允许队列中存在重复文件
                },
                // multipart_params: { 'typeId': 2 }
            });
            this.uploader.init(); //初始化

            //图片上传成功触发
            this.uploader.bind('FileUploaded', function (uploader, files, data) {
                var data = eval("(" + data.response + ")");
                console.log(data);
                if (data.type == 1) {
                    $('#logoName img').attr('src', _this.pUrl + data.value);
                    DCI.app.toastr.success('上传成功,请重新刷新页面');

                }
                else {
                    DCI.app.toastr.error('上传失败');
                }
            });

        },

        /*展示已有的工程*/
        _initProject:function(){
            var _this=this;
            //A排水表
            DCI.app.backend.queryAllPro('metadataA',function(data){
                console.log(data);
                for(var i=0;i<data.length;i++){
                    _this.projectArray.push(data[i]);
                  var str= _this.addProject(data[i].name);
                  $('#project-list').append(str);
                }
            });
         },
        /*添加工程*/
        addProject:function(name){
            var str=`<li class="item-content" data-index="A" >
                            <div class="item-inner">
                            <div class="item-title"><a href="#page-2">${name}</a></div>
                            </div>
                            </li>`;
           return str;
        },





        //获取当前时间
        getTime:function(){
            var myDate = new Date();
            //获取当前年
            var year=myDate.getFullYear();
            //获取当前月
            var month=myDate.getMonth()+1;
            //获取当前日
            var date=myDate.getDate();
            var h=myDate.getHours();       //获取当前小时数(0-23)
            var m=myDate.getMinutes();     //获取当前分钟数(0-59)
            var s=myDate.getSeconds();

            var now=year+'-'+this.correntNumber(month)+"-"+this.correntNumber(date);
            return now;
        },

        correntNumber:function(number){
            return number < 10 ? '0' + number: number;

        },
        /*加载下拉列表*/
        _initSelect:function(){
            //非排水
            var arr1=['排水','雨水','污水','雨污合流','排水'];

            //排水
            var arr=['给水','燃气','通信','电力','热力','工业','石油','综合','管沟','垃圾真空'];
            for(var i=0;i<arr.length;i++){
                $('#GXLX').append(`<option data-index="0" value="${arr[i]}">${arr[i]}</option>`);
            }


            for(var i=0;i<arr1.length;i++){
                $('#GXLX').append(`<option data-index="1" value="${arr1[i]}">${arr1[i]}</option>`);
            }



        },

        /*查询已有工程*/
        searchProject:function(){

        },


    })
    return Controller
})


