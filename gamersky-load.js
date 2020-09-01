// ==UserScript==
// @name         Gamersky comments photo save
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Gamersky comments photo save!
// @author       Andiest ziu
// @match        *.gamersky.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function insertAfter(newElement,targetElement){
        var parent = targetElement.parentNode;
        // 如果最后的节点是目标元素，则直接添加
        if(parent.lastChild == targetElement){
            parent.appendChild(newElement)
        }else{
            //如果不是，则插入在目标元素的下一个兄弟节点 的前面
            parent.insertBefore(newElement,targetElement.nextSibling)
        }
    }

    var hahadiv = document.createElement("div");
    var commentsCount = 0;
    var result = location.pathname.match(/\/(\d*)\./);
    var article_num = result[1];
    var handle_result = function(photo_list){
        let html = '';
        for(var haha in photo_list){
            if( String(photo_list[haha].img_url).indexOf("http") != -1 ) html += '<div><img src="' + photo_list[haha].img_url + '" title="' + photo_list[haha].title + '" width="100%"/></div>';
        }
        hahadiv.innerHTML += html;
        insertAfter(hahadiv, document.getElementById("SOHUCS"));
    };
    var commit_list = sessionStorage.getItem('commit_list' + article_num);
    var init_count = 0;
    var total_photo_list = [];
    var photo_list = [];
    var pageIndex = 1;
    var max_comment_id = 0;
    var have_load = 1;
    if(commit_list != null ){
        commit_list = JSON.parse(commit_list);
        init_count = commit_list.commentsCount;
        total_photo_list = commit_list.photo_list;
        max_comment_id = commit_list.max_comment_id;
        pageIndex = Math.ceil(init_count / 10);
        handle_result(total_photo_list);
    }else{
        commit_list = {};
    }

    var load_data = function(url){
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(myJson) {
            photo_list = [];
            let list = myJson.result.comments;
            for(var l_i in list){
                if( typeof list[l_i].comment_id == 'undefined' ) continue;
                if( have_load == 0 && max_comment_id >= Number(list[l_i].comment_id)) continue;
                if( Number(list[l_i].comment_id) > max_comment_id) max_comment_id = Number(list[l_i].comment_id);
                let img_list = list[l_i].imageInfes;
                if(typeof img_list == 'undefined'){
                    continue;
                }
                if(img_list.length == 0){
                    continue;
                }
                for(var i in img_list){
                    if(typeof img_list[i].origin != 'undefined'){
                        var tmp = {
                            "title":list[l_i].content,
                            "img_url":img_list[i].origin
                        };
                        photo_list.push(tmp);
                        total_photo_list.push(tmp);
                    }
                }
            }
            //console.log(photo_list);
            // 加载下一页
            commentsCount = Number(myJson.result.commentsCount);
            if(photo_list.length > 0) {
                handle_result(photo_list);
                //保存数据
                commit_list.commentsCount = commentsCount;
                commit_list.photo_list = total_photo_list;
                commit_list.max_comment_id = max_comment_id;
                sessionStorage.setItem('commit_list' + article_num, JSON.stringify(commit_list));
            }
            //开始下一轮
            if( have_load == 1){
                let page_num = Math.ceil(commentsCount / 10);

                //console.log(commentsCount,page_num,pageIndex);
                if(pageIndex <= page_num){
                    pageIndex++;
                }else{
                    pageIndex = 1;
                    have_load = 0;
                }
                var now_time = (new Date()).valueOf();
                var request = {
                    "articleId":article_num,
                    "minPraisesCount":0,
                    "repliesMaxCount":10,
                    "pageIndex":pageIndex,
                    "pageSize":10,
                    "order":
                    "createTimeDESC"
                };
                var url = encodeURI('https://cm.gamersky.com/appapi/GetArticleCommentWithClubStyle?request=' + JSON.stringify(request) + '&_=' + now_time);
                load_data(url);
            }else{
                setTimeout(function(){
                    have_load = 0
                    var now_time = (new Date()).valueOf();
                    var request = {
                        "articleId":article_num,
                        "minPraisesCount":0,
                        "repliesMaxCount":10,
                        "pageIndex":1,
                        "pageSize":10,
                        "order":
                        "createTimeDESC"
                    };
                    var url = encodeURI('https://cm.gamersky.com/appapi/GetArticleCommentWithClubStyle?request=' + JSON.stringify(request) + '&_=' + now_time);
                    load_data(url);
                },1000);
            }
        });
    };

    let now_time = (new Date()).valueOf();
    let num = '18308087865817357132';
    let callback = 'jQuery' + num + '_' + now_time++;

    var request = {
        "articleId":article_num,
        "minPraisesCount":0,
        "repliesMaxCount":10,
        "pageIndex":1,
        "pageSize":10,
        "order":
        "createTimeDESC"
    };
    let url = encodeURI('https://cm.gamersky.com/appapi/GetArticleCommentWithClubStyle?request=' + JSON.stringify(request) + '&_=' + now_time);

    load_data(url);
})();
