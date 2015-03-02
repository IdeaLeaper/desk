App.controller("search",
function(page, argv) {
	
	$(page).find(".app-input").val(argv.text);
	
	function ref(p, mode, s) {
		/* 处理没有指定页码的情况 */
		if (!p) {
			p = 1
		};
		$(page).find(".w-text").text($(page).find(".app-input").val());
		var w = plus.nativeUI.showWaiting("正在获取百科...");
		if(searchTag==false){
			var useurl='http://' + localStorage.service 
			+ '/api/get_search_results/?include=custom_fields,title,excerpt&search=' 
			+ encodeURIComponent(s) 
			+ "&page=" + p 
			+ "&china=" + localStorage.china;
		}else{
			var useurl='http://' + localStorage.service 
			+ '/api/get_tag_posts/?include=custom_fields,title,excerpt&slug='
			+ encodeURIComponent(s) 
			+ "&page=" + p 
			+ "&china=" + localStorage.china;
		}
		
		$.ajax({
			type: 'GET',
			url: useurl,
			dataType: 'json',
			cache: false,
			timeout: 20000,
			context: $('body'),
			success: function(data) {
				var compound = "";
				
				if(data.status=="ok"){
				/* 组合页面元素 */
				for (var i = 0; i <= data.posts.length -1 ; i++) {
					var excerpt = without(data.posts[i].excerpt) + "...";
					var n = excerpt.search("继续阅读");
					
					if (n != -1) {
						excerpt=excerpt.substr(0, n);
					}
					
					var title=without(data.posts[i].title);
					
					if (mode == 1) {
						var id = i + searcharr.posts.length;
					} else {
						var id = i;
					}
					
					if (data.posts[i]["custom_fields"].image) {
						var img=data.posts[i]["custom_fields"].image[0] + "?imageView2/1/w/"+$(window).width()+"/h/180";
						compound+='<div class="card listClick" id='+id+'>'
						+'<div class="card-img">'
						+'<img src="'+img+'" />'
						+'<div class="card-img-title">'+title+'</div>'
						+'</div>'
						+'<div class="card-content">'+excerpt+'</div>'
						+'</div>';
					}else{
						compound+='<div class="card listClick" id='+id+'>'
						+'<div class="card-title">'+title+'</div>'
						+'<div class="card-content">'+excerpt+'</div>'
						+'</div>';
					}
				}
				}
				
				/* 处理未找到的情况 */
				if(data.status=="error"||data.posts.length==0){
					compound="<div style='height:20px;'></div><div style='text-align:center;color:#9E9E9E;padding:15px;font-size:18px;'>未找到相关内容</div>";
				}
				
				/* 根据模式来决定是刷新还是加载更多 */
				if (mode == 1) {
					searcharr.posts = searcharr.posts.concat(data.posts);
					$(page).find(".postsList").html($(page).find(".postsList").html() + compound);
				} else {
					searcharr = data;
					$(page).find(".postsList").html(compound);
				}
				
				/* 注册列表点击事件 */
				$(page).find('.listClick').on("click",
				function() {
					App.load("view", {
						id: this.id,
						obj: searcharr
					});
				});
				
				/* 设置状态为已经加载 */
				search_loaded = true;

				
				/* 加载更多处理 */
				spN = p;
				$(page).find(".loadmore").hide();
				if (spN < data.pages) {
					$(page).find(".loadmore").show();
				}
				w.close();
			},
			error: function(xhr, type) {
				w.close();
				plus.nativeUI.toast("网络错误");
			}
		});
	}

	/* 注册按钮点击事件 */
	$(page).find('.app-button').on("click",
	function() {
		/* 注册加载更多点击事件 */
		if (this.id == "loadmore") {
			ref(spN + 1, 1,argv.text);
			
		/* 注册百科\标签切换事件 */
		}else if(this.id=="baike"){
			$(page).find(".s-baike").removeClass("r");
			$(page).find(".s-baike").addClass("y");
			$(page).find(".s-tag").removeClass("y");
			$(page).find(".s-tag").addClass("r");
			searchTag=false;
			ref(1,0,$(page).find(".app-input").val());
		}else if(this.id=="tag"){
			$(page).find(".s-baike").removeClass("y");
			$(page).find(".s-baike").addClass("r");
			$(page).find(".s-tag").removeClass("r");
			$(page).find(".s-tag").addClass("y");
			searchTag=true;
			ref(1,0,$(page).find(".app-input").val());
		}
	});
	
	/* 注册搜索栏键盘事件 */
	$(page).find(".app-input").on('keydown',
	function() {
		if (event.keyCode == 13) {
			if ($(page).find(".app-input").val().trim() != "") {
				ref(1,0,$(page).find(".app-input").val());
			}
		}
	});
	
	
	/* 强制刷新以及缓存控制 */
	$(page).on('appLayout',
	function() {
		/* 如果未加载则刷新 */
		if (!search_loaded) {
			ref(1,0,$(page).find(".app-input").val());
		}
	});
	
	$(page).on('appDestroy',
	function() {
		search_loaded=false;
	});

});