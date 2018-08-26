//setting basic
(function($) {
    $.settingBasic = {
        cfg: {
            panelInited:false,
            needReset: true
        },

        init: function(options) {
            $("#setting_basic").bind("loadpanel",function(e) {
                $.settingBasic.panelInit();
                
                if(!$.ckj.user.id) { 
                    if(e.data.goBack){
                        //$.vv.log('e.data.goBack::'+e.data.goBack);
                        window.setTimeout(function(){$.ui.goBack()}, 50); //>>> avoid loadpanel event runing before the first loadpanel 
                        return;
                    }
                    $.ui.loadContent('#user_login', false, false, $.ckj.cfg.formTrans);
                    return;
                }

                if($.settingBasic.cfg.needReset) {
                    $.vv.tip({icon:'loading'}); 
                    $.cleanUpContent($('#JsettingBasicForm').get(0), false, true);
                    $.settingBasic.cfg.needReset = false;
                    $.ajax({
                        url: $.ckj.cfg.mapi + '/?m=user&a=index',
                        type:'GET',
                        dataType: "json",
                        success: function(r){
                            $.vv.tip({close:true}); 
                            if(r.status == 0) {
                                //console.log(r.data);
                                var user = r.data;
                                $.settingBasic.resetForm(user);
                                if(user['intro']) {
                                    var intro = $('#JsettingBasicForm textarea[name=intro]').get(0);
                                    if(intro.scrollHeight > 80) intro.style.height=intro.scrollHeight + 'px';
                                }
                                $.minicity( "#JuserSetProv", "#JuserSetCity", user['province'], user['city']);
                            } else {
                                $.settingBasic.resetForm({});
                                $.vv.tip({content:r.msg, icon:'error'}); 
                            }
                        },
                        error: function(xhr, why) {
                            if(why != 'panelhided') $.vv.tip({icon:'error', content:$.vv.ajaxErrMsg(why ? why : xhr.status), time:3000});
                            $.settingBasic.cfg.needReset = true;
                        }
                    });
                }
            });
            
            $("#setting_basic").bind("unloadpanel",function(e) {
                var sheet = $.ui.actionsheet();
                if(sheet){sheet.hide();}
            });
            
            $.ckj.hooks.logout.push(function(){
                $.vv.log('------------setting_basic hooks.logout---------');
                if($.settingBasic)$.settingBasic.cfg.needReset = true;
            });
        },
        
        panelInit: function() {
            if( $.settingBasic.cfg.panelInited === true ) return;

            $.query('#setting_basic').attr('scrollTgt', '#setting_basic').addClass('scroll_nobar');
            $.settingBasic.basicFormInit($.query('#JsettingBasicForm'), '#setting_basic');
            $.vv.ui.onPressed('#setting_basic');
            
            $.ckj.hooks.logout.push(function(){
                if($.settingBasic)
                    $.settingBasic.cfg.needReset = true;
            });

            $.settingBasic.cfg.panelInited = true;
        },
        
        resetForm:function(data) {
            $.cleanUpContent($('#JsettingBasicForm').get(0), false, true);
            if(!$.isFunction($.settingBasic.dotRenderBasicSettingFrm)) {
                $.settingBasic.dotRenderBasicSettingFrm = doT.template(document.getElementById('JdotSettingBasic').text);
            } 
            $('#JsettingBasicForm').html($.settingBasic.dotRenderBasicSettingFrm(data));
            
            $.settingBasic.upSettingPic($('#setting_basic #JuserSetAvatar'));

            $.settingBasic.cfg.needReset = false;
        },
        
        basicFormInit: function(form, ctx) {
            var uploading = false;
            //upload setting
            form.submit(function(e){
                e.preventDefault(); e.stopPropagation();
                var f = $('#JsettingBasicForm');

                if(uploading) return;
                else uploading = true;
                $.vv.tip({icon:'loading'});

                $.ajax({
                    url: $.ckj.cfg.mapi + form.attr('action'),
                    type:'post',
                    data:form.serialize(),
                    dataType: "json",
                    success: function(r){
                        $.vv.tip({close:true}); 
                        if(r.status == 0){
                            $.settingBasic.cfg.needReset = true;
                            $.vv.tip({content:r.msg, icon:'success'}); 
                            window.setTimeout(function(){$.ui.goBack();}, 2000);
                        } else {
                            $.vv.tip({content:r.msg, icon:'error'}); 
                        }
                        uploading = false;
                    },
                    error: function(xhr, why) {
                        if(why != 'panelhided') $.vv.tip({icon:'error', content:$.vv.ajaxErrMsg(why ? why : xhr.status), time:3000});
                        uploading = false;
                    }
               });
            });
        },
        
        upSettingPic: function(ele, type){
            type = type || 'attach';
            //console.log('>>>>>>>>>>>>>>upSettingPic:: '+$(ele).next('input').attr('id'));
            $(ele).uploader({
                actionUrl: $.ckj.cfg.mapi + '/?m=user&a=upload_avatar',
                btnId: $(ele).attr('id'),
                upFileName:'avatar',
                ctx:'#afui',
                progressBox: $(ele).closest('.J_upImgWrap').find('.J_preview'),
                onSubmit: function(){
                    $.vv.tip({icon:'loading'});
                },
                onComplete: function(r) {
                    $(this.upBtnEl).find('img').attr('src', r.data+'?rnd='+(new Date()).getTime());
                    $.vv.tip({close:true});
                    $.ckj.refresh.avatar=true;
                    if(window.cache)window.cache.clear(null, null);
                },
                onError: function(msg){
                     $.vv.tip({content:msg, icon:'error'});
                }
            });
        }
    };
    $.settingBasic.init();
})(af);

// simplified city dropbox
 ;(function($){
    $.minicity = function(pn, cn, pv, cv) {
        var pb = $(pn),
            cb = $(cn);

        var init_p = function(pv, pb){
            for (var pd = ["\u5317\u4eac", "\u4e0a\u6d77", "\u91cd\u5e86", "\u5b89\u5fbd", "\u798f\u5efa", "\u7518\u8083", "\u5e7f\u4e1c", "\u5e7f\u897f", "\u8d35\u5dde", "\u6d77\u5357", "\u6cb3\u5317", "\u9ed1\u9f99\u6c5f", "\u6cb3\u5357", "\u9999\u6e2f", "\u6e56\u5317", "\u6e56\u5357", "\u6c5f\u82cf", "\u6c5f\u897f", "\u5409\u6797", "\u8fbd\u5b81", "\u6fb3\u95e8", "\u5185\u8499\u53e4", "\u5b81\u590f", "\u9752\u6d77", "\u5c71\u4e1c", "\u5c71\u897f", "\u9655\u897f", "\u56db\u5ddd", "\u53f0\u6e7e", "\u5929\u6d25", "\u65b0\u7586", "\u897f\u85cf", "\u4e91\u5357", "\u6d59\u6c5f", "\u6d77\u5916"], i = 0; i < pd.length; i++) {
                var op = $('<option value="'+pd[i]+'">'+pd[i]+'</option>');
                if (op.val() == pv) {
                    op.attr('selected', true);
                }
                op.appendTo(pb);
            }
        }
        
        var init_c = function(pv, cv, cb){
            pb.css('width', (13*pv.length+24)+'px');
            switch (pv) {
                case "\u5b89\u5fbd":
                    pv = ["\u5408\u80a5(*)", "\u5408\u80a5", "\u5b89\u5e86", "\u5b89\u5e86", "\u868c\u57e0", "\u868c\u57e0", "\u4eb3\u5dde", "\u4eb3\u5dde", "\u5de2\u6e56", "\u5de2\u6e56", "\u6ec1\u5dde", "\u6ec1\u5dde", "\u961c\u9633", "\u961c\u9633", "\u8d35\u6c60", "\u8d35\u6c60", "\u6dee\u5317", "\u6dee\u5317", "\u6dee\u5316", "\u6dee\u5316", "\u6dee\u5357", "\u6dee\u5357", "\u9ec4\u5c71", "\u9ec4\u5c71", "\u4e5d\u534e\u5c71", "\u4e5d\u534e\u5c71", "\u516d\u5b89", "\u516d\u5b89", "\u9a6c\u978d\u5c71", "\u9a6c\u978d\u5c71", "\u5bbf\u5dde", "\u5bbf\u5dde", "\u94dc\u9675", "\u94dc\u9675", "\u5c6f\u6eaa", "\u5c6f\u6eaa", "\u829c\u6e56", "\u829c\u6e56", "\u5ba3\u57ce", "\u5ba3\u57ce"];
                    break;
                case "\u5317\u4eac":
                    pv = ["\u4e1c\u57ce", "\u4e1c\u57ce", "\u897f\u57ce", "\u897f\u57ce", "\u5d07\u6587", "\u5d07\u6587", "\u5ba3\u6b66", "\u5ba3\u6b66", "\u671d\u9633", "\u671d\u9633", "\u4e30\u53f0", "\u4e30\u53f0", "\u77f3\u666f\u5c71", "\u77f3\u666f\u5c71", "\u6d77\u6dc0", "\u6d77\u6dc0", "\u95e8\u5934\u6c9f", "\u95e8\u5934\u6c9f", "\u623f\u5c71", "\u623f\u5c71", "\u901a\u5dde", "\u901a\u5dde", "\u987a\u4e49", "\u987a\u4e49", "\u660c\u5e73", "\u660c\u5e73", "\u5927\u5174", "\u5927\u5174", "\u5e73\u8c37", "\u5e73\u8c37", "\u6000\u67d4", "\u6000\u67d4", "\u5bc6\u4e91", "\u5bc6\u4e91", "\u5ef6\u5e86", "\u5ef6\u5e86"];
                    break;
                case "\u91cd\u5e86":
                    pv = ["\u4e07\u5dde", "\u4e07\u5dde", "\u6daa\u9675", "\u6daa\u9675", "\u6e1d\u4e2d", "\u6e1d\u4e2d", "\u5927\u6e21\u53e3", "\u5927\u6e21\u53e3", "\u6c5f\u5317", "\u6c5f\u5317", "\u6c99\u576a\u575d", "\u6c99\u576a\u575d", "\u4e5d\u9f99\u5761", "\u4e5d\u9f99\u5761", "\u5357\u5cb8", "\u5357\u5cb8", "\u5317\u789a", "\u5317\u789a", "\u4e07\u76db", "\u4e07\u76db", "\u53cc\u6322", "\u53cc\u6322", "\u6e1d\u5317", "\u6e1d\u5317", "\u5df4\u5357", "\u5df4\u5357", "\u9ed4\u6c5f", "\u9ed4\u6c5f", "\u957f\u5bff", "\u957f\u5bff", "\u7da6\u6c5f", "\u7da6\u6c5f", "\u6f7c\u5357", "\u6f7c\u5357", "\u94dc\u6881", "\u94dc\u6881", "\u5927\u8db3", "\u5927\u8db3", "\u8363\u660c", "\u8363\u660c", "\u58c1\u5c71", "\u58c1\u5c71", "\u6881\u5e73", "\u6881\u5e73", "\u57ce\u53e3", "\u57ce\u53e3", "\u4e30\u90fd", "\u4e30\u90fd", "\u57ab\u6c5f", "\u57ab\u6c5f", "\u6b66\u9686", "\u6b66\u9686", "\u5fe0\u53bf", "\u5fe0\u53bf", "\u5f00\u53bf", "\u5f00\u53bf", "\u4e91\u9633", "\u4e91\u9633", "\u5949\u8282", "\u5949\u8282", "\u5deb\u5c71", "\u5deb\u5c71", "\u5deb\u6eaa", "\u5deb\u6eaa", "\u77f3\u67f1", "\u77f3\u67f1", "\u79c0\u5c71", "\u79c0\u5c71", "\u9149\u9633", "\u9149\u9633", "\u5f6d\u6c34", "\u5f6d\u6c34", "\u6c5f\u6d25", "\u6c5f\u6d25", "\u5408\u5ddd", "\u5408\u5ddd", "\u6c38\u5ddd", "\u6c38\u5ddd", "\u5357\u5ddd", "\u5357\u5ddd"];
                    break;
                case "\u798f\u5efa":
                    pv = ["\u798f\u5dde(*)", "\u798f\u5dde", "\u798f\u5b89", "\u798f\u5b89", "\u9f99\u5ca9", "\u9f99\u5ca9", "\u5357\u5e73", "\u5357\u5e73", "\u5b81\u5fb7", "\u5b81\u5fb7", "\u8386\u7530", "\u8386\u7530", "\u6cc9\u5dde", "\u6cc9\u5dde", "\u4e09\u660e", "\u4e09\u660e", "\u90b5\u6b66", "\u90b5\u6b66", "\u77f3\u72ee", "\u77f3\u72ee", "\u6c38\u5b89", "\u6c38\u5b89", "\u6b66\u5937\u5c71", "\u6b66\u5937\u5c71", "\u53a6\u95e8", "\u53a6\u95e8", "\u6f33\u5dde", "\u6f33\u5dde"];
                    break;
                case "\u7518\u8083":
                    pv = ["\u5170\u5dde(*)", "\u5170\u5dde", "\u767d\u94f6", "\u767d\u94f6", "\u5b9a\u897f", "\u5b9a\u897f", "\u6566\u714c", "\u6566\u714c", "\u7518\u5357", "\u7518\u5357", "\u91d1\u660c", "\u91d1\u660c", "\u9152\u6cc9", "\u9152\u6cc9", "\u4e34\u590f", "\u4e34\u590f", "\u5e73\u51c9", "\u5e73\u51c9", "\u5929\u6c34", "\u5929\u6c34", "\u6b66\u90fd", "\u6b66\u90fd", "\u6b66\u5a01", "\u6b66\u5a01", "\u897f\u5cf0", "\u897f\u5cf0", "\u5f20\u6396", "\u5f20\u6396"];
                    break;
                case "\u5e7f\u4e1c":
                    pv = ["\u5e7f\u5dde(*)", "\u5e7f\u5dde", "\u6f6e\u9633", "\u6f6e\u9633", "\u6f6e\u5dde", "\u6f6e\u5dde", "\u6f84\u6d77", "\u6f84\u6d77", "\u4e1c\u839e", "\u4e1c\u839e", "\u4f5b\u5c71", "\u4f5b\u5c71", "\u6cb3\u6e90", "\u6cb3\u6e90", "\u60e0\u5dde", "\u60e0\u5dde", "\u6c5f\u95e8", "\u6c5f\u95e8", "\u63ed\u9633", "\u63ed\u9633", "\u5f00\u5e73", "\u5f00\u5e73", "\u8302\u540d", "\u8302\u540d", "\u6885\u5dde", "\u6885\u5dde", "\u6e05\u8fdc", "\u6e05\u8fdc", "\u6c55\u5934", "\u6c55\u5934", "\u6c55\u5c3e", "\u6c55\u5c3e", "\u97f6\u5173", "\u97f6\u5173", "\u6df1\u5733", "\u6df1\u5733", "\u987a\u5fb7", "\u987a\u5fb7", "\u9633\u6c5f", "\u9633\u6c5f", "\u82f1\u5fb7", "\u82f1\u5fb7", "\u4e91\u6d6e", "\u4e91\u6d6e", "\u589e\u57ce", "\u589e\u57ce", "\u6e5b\u6c5f", "\u6e5b\u6c5f", "\u8087\u5e86", "\u8087\u5e86", "\u4e2d\u5c71", "\u4e2d\u5c71", "\u73e0\u6d77", "\u73e0\u6d77"];
                    break;
                case "\u5e7f\u897f":
                    pv = ["\u5357\u5b81(*)", "\u5357\u5b81", "\u767e\u8272", "\u767e\u8272", "\u5317\u6d77", "\u5317\u6d77", "\u6842\u6797", "\u6842\u6797", "\u9632\u57ce\u6e2f", "\u9632\u57ce\u6e2f", "\u6cb3\u6c60", "\u6cb3\u6c60", "\u8d3a\u5dde", "\u8d3a\u5dde", "\u67f3\u5dde", "\u67f3\u5dde", "\u94a6\u5dde", "\u94a6\u5dde", "\u68a7\u5dde", "\u68a7\u5dde", "\u7389\u6797", "\u7389\u6797"];
                    break;
                case "\u8d35\u5dde":
                    pv = ["\u8d35\u9633(*)", "\u8d35\u9633", "\u5b89\u987a", "\u5b89\u987a", "\u6bd5\u8282", "\u6bd5\u8282", "\u90fd\u5300", "\u90fd\u5300", "\u51ef\u91cc", "\u51ef\u91cc", "\u516d\u76d8\u6c34", "\u516d\u76d8\u6c34", "\u94dc\u4ec1", "\u94dc\u4ec1", "\u5174\u4e49", "\u5174\u4e49", "\u7389\u5c4f", "\u7389\u5c4f", "\u9075\u4e49", "\u9075\u4e49"];
                    break;
                case "\u6d77\u5357":
                    pv = ["\u6d77\u53e3(*)", "\u6d77\u53e3", "\u510b\u53bf", "\u510b\u53bf", "\u9675\u6c34", "\u9675\u6c34", "\u743c\u6d77", "\u743c\u6d77", "\u4e09\u4e9a", "\u4e09\u4e9a", "\u901a\u4ec0", "\u901a\u4ec0", "\u4e07\u5b81", "\u4e07\u5b81"];
                    break;
                case "\u6cb3\u5317":
                    pv = ["\u77f3\u5bb6\u5e84(*)", "\u77f3\u5bb6\u5e84", "\u4fdd\u5b9a", "\u4fdd\u5b9a", "\u5317\u6234\u6cb3", "\u5317\u6234\u6cb3", "\u6ca7\u5dde", "\u6ca7\u5dde", "\u627f\u5fb7", "\u627f\u5fb7", "\u4e30\u6da6", "\u4e30\u6da6", "\u90af\u90f8", "\u90af\u90f8", "\u8861\u6c34", "\u8861\u6c34", "\u5eca\u574a", "\u5eca\u574a", "\u5357\u6234\u6cb3", "\u5357\u6234\u6cb3", "\u79e6\u7687\u5c9b", "\u79e6\u7687\u5c9b", "\u5510\u5c71", "\u5510\u5c71", "\u65b0\u57ce", "\u65b0\u57ce", "\u90a2\u53f0", "\u90a2\u53f0", "\u5f20\u5bb6\u53e3", "\u5f20\u5bb6\u53e3"];
                    break;
                case "\u9ed1\u9f99\u6c5f":
                    pv = ["\u54c8\u5c14\u6ee8(*)", "\u54c8\u5c14\u6ee8", "\u5317\u5b89", "\u5317\u5b89", "\u5927\u5e86", "\u5927\u5e86", "\u5927\u5174\u5b89\u5cad", "\u5927\u5174\u5b89\u5cad", "\u9e64\u5c97", "\u9e64\u5c97", "\u9ed1\u6cb3", "\u9ed1\u6cb3", "\u4f73\u6728\u65af", "\u4f73\u6728\u65af", "\u9e21\u897f", "\u9e21\u897f", "\u7261\u4e39\u6c5f", "\u7261\u4e39\u6c5f", "\u9f50\u9f50\u54c8\u5c14", "\u9f50\u9f50\u54c8\u5c14", "\u4e03\u53f0\u6cb3", "\u4e03\u53f0\u6cb3", "\u53cc\u9e2d\u5c71", "\u53cc\u9e2d\u5c71", "\u7ee5\u5316", "\u7ee5\u5316", "\u4f0a\u6625", "\u4f0a\u6625"];
                    break;
                case "\u6cb3\u5357":
                    pv = ["\u90d1\u5dde(*)", "\u90d1\u5dde", "\u5b89\u9633", "\u5b89\u9633", "\u9e64\u58c1", "\u9e64\u58c1", "\u6f62\u5ddd", "\u6f62\u5ddd", "\u7126\u4f5c", "\u7126\u4f5c", "\u6d4e\u6e90", "\u6d4e\u6e90", "\u5f00\u5c01", "\u5f00\u5c01", "\u6f2f\u6cb3", "\u6f2f\u6cb3", "\u6d1b\u9633", "\u6d1b\u9633", "\u5357\u9633", "\u5357\u9633", "\u5e73\u9876\u5c71", "\u5e73\u9876\u5c71", "\u6fee\u9633", "\u6fee\u9633", "\u4e09\u95e8\u5ce1", "\u4e09\u95e8\u5ce1", "\u5546\u4e18", "\u5546\u4e18", "\u65b0\u4e61", "\u65b0\u4e61", "\u4fe1\u9633", "\u4fe1\u9633", "\u8bb8\u660c", "\u8bb8\u660c", "\u5468\u53e3", "\u5468\u53e3", "\u9a7b\u9a6c\u5e97", "\u9a7b\u9a6c\u5e97"];
                    break;
                case "\u9999\u6e2f":
                    pv = ["\u9999\u6e2f", "\u9999\u6e2f", "\u4e5d\u9f99", "\u4e5d\u9f99", "\u65b0\u754c", "\u65b0\u754c"];
                    break;
                case "\u6e56\u5317":
                    pv = ["\u6b66\u6c49(*)", "\u6b66\u6c49", "\u6069\u65bd", "\u6069\u65bd", "\u9102\u5dde", "\u9102\u5dde", "\u9ec4\u5188", "\u9ec4\u5188", "\u9ec4\u77f3", "\u9ec4\u77f3", "\u8346\u95e8", "\u8346\u95e8", "\u8346\u5dde", "\u8346\u5dde", "\u6f5c\u6c5f", "\u6f5c\u6c5f", "\u5341\u5830", "\u5341\u5830", "\u968f\u5dde", "\u968f\u5dde", "\u6b66\u7a74", "\u6b66\u7a74", "\u4ed9\u6843", "\u4ed9\u6843", "\u54b8\u5b81", "\u54b8\u5b81", "\u8944\u9633", "\u8944\u9633", "\u8944\u6a0a", "\u8944\u6a0a", "\u5b5d\u611f", "\u5b5d\u611f", "\u5b9c\u660c", "\u5b9c\u660c"];
                    break;
                case "\u6e56\u5357":
                    pv = ["\u957f\u6c99(*)", "\u957f\u6c99", "\u5e38\u5fb7", "\u5e38\u5fb7", "\u90f4\u5dde", "\u90f4\u5dde", "\u8861\u9633", "\u8861\u9633", "\u6000\u5316", "\u6000\u5316", "\u5409\u9996", "\u5409\u9996", "\u5a04\u5e95", "\u5a04\u5e95", "\u90b5\u9633", "\u90b5\u9633", "\u6e58\u6f6d", "\u6e58\u6f6d", "\u76ca\u9633", "\u76ca\u9633", "\u5cb3\u9633", "\u5cb3\u9633", "\u6c38\u5dde", "\u6c38\u5dde", "\u5f20\u5bb6\u754c", "\u5f20\u5bb6\u754c", "\u682a\u6d32", "\u682a\u6d32"];
                    break;
                case "\u6c5f\u82cf":
                    pv = ["\u5357\u4eac(*)", "\u5357\u4eac", "\u5e38\u719f", "\u5e38\u719f", "\u5e38\u5dde", "\u5e38\u5dde", "\u6d77\u95e8", "\u6d77\u95e8", "\u6dee\u5b89", "\u6dee\u5b89", "\u6c5f\u90fd", "\u6c5f\u90fd", "\u6c5f\u9634", "\u6c5f\u9634", "\u6606\u5c71", "\u6606\u5c71", "\u8fde\u4e91\u6e2f", "\u8fde\u4e91\u6e2f", "\u5357\u901a", "\u5357\u901a", "\u542f\u4e1c", "\u542f\u4e1c", "\u6cad\u9633", "\u6cad\u9633", "\u5bbf\u8fc1", "\u5bbf\u8fc1", "\u82cf\u5dde", "\u82cf\u5dde", "\u592a\u4ed3", "\u592a\u4ed3", "\u6cf0\u5dde", "\u6cf0\u5dde", "\u540c\u91cc", "\u540c\u91cc", "\u65e0\u9521", "\u65e0\u9521", "\u5f90\u5dde", "\u5f90\u5dde", "\u76d0\u57ce", "\u76d0\u57ce", "\u626c\u5dde", "\u626c\u5dde", "\u5b9c\u5174", "\u5b9c\u5174", "\u4eea\u5f81", "\u4eea\u5f81", "\u5f20\u5bb6\u6e2f", "\u5f20\u5bb6\u6e2f", "\u9547\u6c5f", "\u9547\u6c5f", "\u5468\u5e84", "\u5468\u5e84"];
                    break;
                case "\u6c5f\u897f":
                    pv = ["\u5357\u660c(*)", "\u5357\u660c", "\u629a\u5dde", "\u629a\u5dde", "\u8d63\u5dde", "\u8d63\u5dde", "\u5409\u5b89", "\u5409\u5b89", "\u666f\u5fb7\u9547", "\u666f\u5fb7\u9547", "\u4e95\u5188\u5c71", "\u4e95\u5188\u5c71", "\u4e5d\u6c5f", "\u4e5d\u6c5f", "\u5e90\u5c71", "\u5e90\u5c71", "\u840d\u4e61", "\u840d\u4e61", "\u4e0a\u9976", "\u4e0a\u9976", "\u65b0\u4f59", "\u65b0\u4f59", "\u5b9c\u6625", "\u5b9c\u6625", "\u9e70\u6f6d", "\u9e70\u6f6d"];
                    break;
                case "\u5409\u6797":
                    pv = ["\u957f\u6625(*)", "\u957f\u6625", "\u767d\u57ce", "\u767d\u57ce", "\u767d\u5c71", "\u767d\u5c71", "\u73f2\u6625", "\u73f2\u6625", "\u8fbd\u6e90", "\u8fbd\u6e90", "\u6885\u6cb3", "\u6885\u6cb3", "\u5409\u6797", "\u5409\u6797", "\u56db\u5e73", "\u56db\u5e73", "\u677e\u539f", "\u677e\u539f", "\u901a\u5316", "\u901a\u5316", "\u5ef6\u5409", "\u5ef6\u5409"];
                    break;
                case "\u8fbd\u5b81":
                    pv = ["\u6c88\u9633(*)", "\u6c88\u9633", "\u978d\u5c71", "\u978d\u5c71", "\u672c\u6eaa", "\u672c\u6eaa", "\u671d\u9633", "\u671d\u9633", "\u5927\u8fde", "\u5927\u8fde", "\u4e39\u4e1c", "\u4e39\u4e1c", "\u629a\u987a", "\u629a\u987a", "\u961c\u65b0", "\u961c\u65b0", "\u846b\u82a6\u5c9b", "\u846b\u82a6\u5c9b", "\u9526\u5dde", "\u9526\u5dde", "\u8fbd\u9633", "\u8fbd\u9633", "\u76d8\u9526", "\u76d8\u9526", "\u94c1\u5cad", "\u94c1\u5cad", "\u8425\u53e3", "\u8425\u53e3"];
                    break;
                case "\u6fb3\u95e8":
                    pv = ["\u6fb3\u95e8", "\u6fb3\u95e8"];
                    break;
                case "\u5185\u8499\u53e4":
                    pv = ["\u547c\u548c\u6d69\u7279(*)", "\u547c\u548c\u6d69\u7279", "\u963f\u62c9\u5584\u76df", "\u963f\u62c9\u5584\u76df", "\u5305\u5934", "\u5305\u5934", "\u8d64\u5cf0", "\u8d64\u5cf0", "\u4e1c\u80dc", "\u4e1c\u80dc", "\u6d77\u62c9\u5c14", "\u6d77\u62c9\u5c14", "\u96c6\u5b81", "\u96c6\u5b81", "\u4e34\u6cb3", "\u4e34\u6cb3", "\u901a\u8fbd", "\u901a\u8fbd", "\u4e4c\u6d77", "\u4e4c\u6d77", "\u4e4c\u5170\u6d69\u7279", "\u4e4c\u5170\u6d69\u7279", "\u9521\u6797\u6d69\u7279", "\u9521\u6797\u6d69\u7279"];
                    break;
                case "\u5b81\u590f":
                    pv = ["\u94f6\u5ddd(*)", "\u94f6\u5ddd", "\u56fa\u6e90", "\u56fa\u6e90", "\u77f3\u5634\u5c71", "\u77f3\u5634\u5c71", "\u5434\u5fe0", "\u5434\u5fe0"];
                    break;
                case "\u9752\u6d77":
                    pv = ["\u897f\u5b81(*)", "\u897f\u5b81", "\u5fb7\u4ee4\u54c8", "\u5fb7\u4ee4\u54c8", "\u683c\u5c14\u6728", "\u683c\u5c14\u6728", "\u5171\u548c", "\u5171\u548c", "\u6d77\u4e1c", "\u6d77\u4e1c", "\u6d77\u664f", "\u6d77\u664f", "\u739b\u6c81", "\u739b\u6c81", "\u540c\u4ec1", "\u540c\u4ec1", "\u7389\u6811", "\u7389\u6811"];
                    break;
                case "\u5c71\u4e1c":
                    pv = ["\u6d4e\u5357(*)", "\u6d4e\u5357", "\u6ee8\u5dde", "\u6ee8\u5dde", "\u5156\u5dde", "\u5156\u5dde", "\u5fb7\u5dde", "\u5fb7\u5dde", "\u4e1c\u8425", "\u4e1c\u8425", "\u83cf\u6cfd", "\u83cf\u6cfd", "\u6d4e\u5b81", "\u6d4e\u5b81", "\u83b1\u829c", "\u83b1\u829c", "\u804a\u57ce", "\u804a\u57ce", "\u4e34\u6c82", "\u4e34\u6c82", "\u84ec\u83b1", "\u84ec\u83b1", "\u9752\u5c9b", "\u9752\u5c9b", "\u66f2\u961c", "\u66f2\u961c", "\u65e5\u7167", "\u65e5\u7167", "\u6cf0\u5b89", "\u6cf0\u5b89", "\u6f4d\u574a", "\u6f4d\u574a", "\u5a01\u6d77", "\u5a01\u6d77", "\u70df\u53f0", "\u70df\u53f0", "\u67a3\u5e84", "\u67a3\u5e84", "\u6dc4\u535a", "\u6dc4\u535a"];
                    break;
                case "\u4e0a\u6d77":
                    pv = ["\u5d07\u660e", "\u5d07\u660e", "\u9ec4\u6d66", "\u9ec4\u6d66", "\u5362\u6e7e", "\u5362\u6e7e", "\u5f90\u6c47", "\u5f90\u6c47", "\u957f\u5b81", "\u957f\u5b81", "\u9759\u5b89", "\u9759\u5b89", "\u666e\u9640", "\u666e\u9640", "\u95f8\u5317", "\u95f8\u5317", "\u8679\u53e3", "\u8679\u53e3", "\u6768\u6d66", "\u6768\u6d66", "\u95f5\u884c", "\u95f5\u884c", "\u5b9d\u5c71", "\u5b9d\u5c71", "\u5609\u5b9a", "\u5609\u5b9a", "\u6d66\u4e1c", "\u6d66\u4e1c", "\u91d1\u5c71", "\u91d1\u5c71", "\u677e\u6c5f", "\u677e\u6c5f", "\u9752\u6d66", "\u9752\u6d66", "\u5357\u6c47", "\u5357\u6c47", "\u5949\u8d24", "\u5949\u8d24"];
                    break;
                case "\u5c71\u897f":
                    pv = ["\u592a\u539f(*)", "\u592a\u539f", "\u957f\u6cbb", "\u957f\u6cbb", "\u5927\u540c", "\u5927\u540c", "\u5019\u9a6c", "\u5019\u9a6c", "\u664b\u57ce", "\u664b\u57ce", "\u664b\u4e2d", "\u664b\u4e2d", "\u79bb\u77f3", "\u79bb\u77f3", "\u4e34\u6c7e", "\u4e34\u6c7e", "\u5b81\u6b66", "\u5b81\u6b66", "\u6714\u5dde", "\u6714\u5dde", "\u5ffb\u5dde", "\u5ffb\u5dde", "\u9633\u6cc9", "\u9633\u6cc9", "\u6986\u6b21", "\u6986\u6b21", "\u8fd0\u57ce", "\u8fd0\u57ce"];
                    break;
                case "\u9655\u897f":
                    pv = ["\u897f\u5b89(*)", "\u897f\u5b89", "\u5b89\u5eb7", "\u5b89\u5eb7", "\u5b9d\u9e21", "\u5b9d\u9e21", "\u6c49\u4e2d", "\u6c49\u4e2d", "\u6e2d\u5357", "\u6e2d\u5357", "\u5546\u5dde", "\u5546\u5dde", "\u7ee5\u5fb7", "\u7ee5\u5fb7", "\u94dc\u5ddd", "\u94dc\u5ddd", "\u54b8\u9633", "\u54b8\u9633", "\u5ef6\u5b89", "\u5ef6\u5b89", "\u6986\u6797", "\u6986\u6797"];
                    break;
                case "\u56db\u5ddd":
                    pv = ["\u6210\u90fd(*)", "\u6210\u90fd", "\u5df4\u4e2d", "\u5df4\u4e2d", "\u8fbe\u5ddd", "\u8fbe\u5ddd", "\u5fb7\u9633", "\u5fb7\u9633", "\u90fd\u6c5f\u5830", "\u90fd\u6c5f\u5830", "\u5ce8\u7709\u5c71", "\u5ce8\u7709\u5c71", "\u6daa\u9675", "\u6daa\u9675", "\u5e7f\u5b89", "\u5e7f\u5b89", "\u5e7f\u5143", "\u5e7f\u5143", "\u4e5d\u5be8\u6c9f", "\u4e5d\u5be8\u6c9f", "\u5eb7\u5b9a", "\u5eb7\u5b9a", "\u4e50\u5c71", "\u4e50\u5c71", "\u6cf8\u5dde", "\u6cf8\u5dde", "\u9a6c\u5c14\u5eb7", "\u9a6c\u5c14\u5eb7", "\u7ef5\u9633", "\u7ef5\u9633", "\u7709\u5c71", "\u7709\u5c71", "\u5357\u5145", "\u5357\u5145", "\u5185\u6c5f", "\u5185\u6c5f", "\u6500\u679d\u82b1", "\u6500\u679d\u82b1", "\u9042\u5b81", "\u9042\u5b81", "\u6c76\u5ddd", "\u6c76\u5ddd", "\u897f\u660c", "\u897f\u660c", "\u96c5\u5b89", "\u96c5\u5b89", "\u5b9c\u5bbe", "\u5b9c\u5bbe", "\u81ea\u8d21", "\u81ea\u8d21", "\u8d44\u9633", "\u8d44\u9633"];
                    break;
                case "\u53f0\u6e7e":
                    pv = ["\u53f0\u5317(*)", "\u53f0\u5317", "\u57fa\u9686", "\u57fa\u9686", "\u53f0\u5357", "\u53f0\u5357", "\u53f0\u4e2d", "\u53f0\u4e2d", "\u9ad8\u96c4", "\u9ad8\u96c4", "\u5c4f\u4e1c", "\u5c4f\u4e1c", "\u5357\u6295", "\u5357\u6295", "\u4e91\u6797", "\u4e91\u6797", "\u65b0\u7af9", "\u65b0\u7af9", "\u5f70\u5316", "\u5f70\u5316", "\u82d7\u6817", "\u82d7\u6817", "\u5609\u4e49", "\u5609\u4e49", "\u82b1\u83b2", "\u82b1\u83b2", "\u6843\u56ed", "\u6843\u56ed", "\u5b9c\u5170", "\u5b9c\u5170", "\u53f0\u4e1c", "\u53f0\u4e1c", "\u91d1\u95e8", "\u91d1\u95e8", "\u9a6c\u7956", "\u9a6c\u7956", "\u6f8e\u6e56", "\u6f8e\u6e56"];
                    break;
                case "\u5929\u6d25":
                    pv = ["\u5929\u6d25", "\u5929\u6d25", "\u548c\u5e73", "\u548c\u5e73", "\u4e1c\u4e3d", "\u4e1c\u4e3d", "\u6cb3\u4e1c", "\u6cb3\u4e1c", "\u897f\u9752", "\u897f\u9752", "\u6cb3\u897f", "\u6cb3\u897f", "\u6d25\u5357", "\u6d25\u5357", "\u5357\u5f00", "\u5357\u5f00", "\u5317\u8fb0", "\u5317\u8fb0", "\u6cb3\u5317", "\u6cb3\u5317", "\u6b66\u6e05", "\u6b66\u6e05", "\u7ea2\u6322", "\u7ea2\u6322", "\u5858\u6cbd", "\u5858\u6cbd", "\u6c49\u6cbd", "\u6c49\u6cbd", "\u5927\u6e2f", "\u5927\u6e2f", "\u5b81\u6cb3", "\u5b81\u6cb3", "\u9759\u6d77", "\u9759\u6d77", "\u5b9d\u577b", "\u5b9d\u577b", "\u84df\u53bf", "\u84df\u53bf"];
                    break;
                case "\u65b0\u7586":
                    pv = ["\u4e4c\u9c81\u6728\u9f50(*)", "\u4e4c\u9c81\u6728\u9f50", "\u963f\u514b\u82cf", "\u963f\u514b\u82cf", "\u963f\u52d2\u6cf0", "\u963f\u52d2\u6cf0", "\u963f\u56fe\u4ec0", "\u963f\u56fe\u4ec0", "\u535a\u4e50", "\u535a\u4e50", "\u660c\u5409", "\u660c\u5409", "\u4e1c\u5c71", "\u4e1c\u5c71", "\u54c8\u5bc6", "\u54c8\u5bc6", "\u548c\u7530", "\u548c\u7530", "\u5580\u4ec0", "\u5580\u4ec0", "\u514b\u62c9\u739b\u4f9d", "\u514b\u62c9\u739b\u4f9d", "\u5e93\u8f66", "\u5e93\u8f66", "\u5e93\u5c14\u52d2", "\u5e93\u5c14\u52d2", "\u594e\u5c6f", "\u594e\u5c6f", "\u77f3\u6cb3\u5b50", "\u77f3\u6cb3\u5b50", "\u5854\u57ce", "\u5854\u57ce", "\u5410\u9c81\u756a", "\u5410\u9c81\u756a", "\u4f0a\u5b81", "\u4f0a\u5b81"];
                    break;
                case "\u897f\u85cf":
                    pv = ["\u62c9\u8428(*)", "\u62c9\u8428", "\u963f\u91cc", "\u963f\u91cc", "\u660c\u90fd", "\u660c\u90fd", "\u6797\u829d", "\u6797\u829d", "\u90a3\u66f2", "\u90a3\u66f2", "\u65e5\u5580\u5219", "\u65e5\u5580\u5219", "\u5c71\u5357", "\u5c71\u5357"];
                    break;
                case "\u4e91\u5357":
                    pv = ["\u6606\u660e(*)", "\u6606\u660e", "\u5927\u7406", "\u5927\u7406", "\u4fdd\u5c71", "\u4fdd\u5c71", "\u695a\u96c4", "\u695a\u96c4", "\u5927\u7406", "\u5927\u7406", "\u4e1c\u5ddd", "\u4e1c\u5ddd", "\u4e2a\u65e7", "\u4e2a\u65e7", "\u666f\u6d2a", "\u666f\u6d2a", "\u5f00\u8fdc", "\u5f00\u8fdc", "\u4e34\u6ca7", "\u4e34\u6ca7", "\u4e3d\u6c5f", "\u4e3d\u6c5f", "\u516d\u5e93", "\u516d\u5e93", "\u6f5e\u897f", "\u6f5e\u897f", "\u66f2\u9756", "\u66f2\u9756", "\u601d\u8305", "\u601d\u8305", "\u6587\u5c71", "\u6587\u5c71", "\u897f\u53cc\u7248\u7eb3", "\u897f\u53cc\u7248\u7eb3", "\u7389\u6eaa", "\u7389\u6eaa", "\u4e2d\u7538", "\u4e2d\u7538", "\u662d\u901a", "\u662d\u901a"];
                    break;
                case "\u6d59\u6c5f":
                    pv = ["\u676d\u5dde(*)", "\u676d\u5dde", "\u5b89\u5409", "\u5b89\u5409", "\u6148\u6eaa", "\u6148\u6eaa", "\u5b9a\u6d77", "\u5b9a\u6d77", "\u5949\u5316", "\u5949\u5316", "\u6d77\u76d0", "\u6d77\u76d0", "\u9ec4\u5ca9", "\u9ec4\u5ca9", "\u6e56\u5dde", "\u6e56\u5dde", "\u5609\u5174", "\u5609\u5174", "\u91d1\u534e", "\u91d1\u534e", "\u4e34\u5b89", "\u4e34\u5b89", "\u4e34\u6d77", "\u4e34\u6d77", "\u4e3d\u6c34", "\u4e3d\u6c34", "\u5b81\u6ce2", "\u5b81\u6ce2", "\u74ef\u6d77", "\u74ef\u6d77", "\u5e73\u6e56", "\u5e73\u6e56", "\u5343\u5c9b\u6e56", "\u5343\u5c9b\u6e56", "\u8862\u5dde", "\u8862\u5dde", "\u6c5f\u5c71", "\u6c5f\u5c71", "\u745e\u5b89", "\u745e\u5b89", "\u7ecd\u5174", "\u7ecd\u5174", "\u5d4a\u5dde", "\u5d4a\u5dde", "\u53f0\u5dde", "\u53f0\u5dde", "\u6e29\u5cad", "\u6e29\u5cad", "\u6e29\u5dde", "\u6e29\u5dde", "\u4f59\u59da", "\u4f59\u59da", "\u821f\u5c71", "\u821f\u5c71"];
                    break;
                case "\u6d77\u5916":
                    pv = ["\u6b27\u6d32", "\u6b27\u6d32", "\u5317\u7f8e", "\u5317\u7f8e", "\u5357\u7f8e", "\u5357\u7f8e", "\u4e9a\u6d32", "\u4e9a\u6d32", "\u975e\u6d32", "\u975e\u6d32", "\u5927\u6d0b\u6d32", "\u5927\u6d0b\u6d32"];
                    break;
                default:
                    pv = ["", ""]
            }
            cb.find('option').remove();
            for (var i = 0; i < pv.length / 2; i++) {
                var op = $('<option value="'+pv[i * 2 + 1]+'">'+pv[i * 2]+'</option>');
                if (op.val() == cv) {
                    op.attr('selected', true);
                }
                op.appendTo(cb);
            }
        }

        init_p(pv, pb);
        init_c(pb.val(), cv, cb);
        pb.change(function(){init_c(pb.val(), '', cb);});
    }
})(af);