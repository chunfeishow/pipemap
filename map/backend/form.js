define(["core/dcins" ], function() {

    DCI.Form = L.Class.extend({

        initialize: function() {

        },
        required:function(form){
           var inputs= form.find('input[data-required="required"]');
           var flag=true;
           for(var i=0;i<inputs.length;i++){
               if(inputs.eq(i).val().trim()==""){
                   flag=false;
                   inputs.eq(i).css('border','1px solid red');
               }

           }
           if(flag){
               inputs.css('border','none');
           }
            return flag;
        }


    })
    return DCI.Form;
})