var articles = [];

var pushMessageType =  "MULTI_ARTICLE";

var expandNo = -1;

var addArticleInPushMessages=false;

$(function() {
	_initialPage();
	_initEvent();
});

function _initialPage() {
	
	
	initPushMessageContainer();
	
	$("#editor").wysiwyg();
}

function initPushMessageContainer(){
	$.ajax("../../pushMessage/MULTI_ARTICLE/preview").done(function(result){
		$("#pushMessageContainer").append($("#pushMessageTemplate").render(result));
});
}



function _initEvent() {

	initAddEvent();

	initSaveBtnEvent();
	
	initUpdateArticleBtnBtnEvent();
	
	initCancelBtnEvent();
	
	initSingleMaterialsEvnent();

	initCoverBtnEvent();

	initCoverEvent();
	
	initPreviewEvent();
	
//	initExpandPreviewEvent();

}

function initAddEvent() {

	$("#addItem").mouseover(function() {
		$("#addIcon").hide();
		$("#multiAdd").show();
	}).mouseout(function() {
		$("#addIcon").show();
		$("#multiAdd").hide();
	});

	$("#multiAdd").click(function() {
		getArticleList();
		$("#addDialog").modal("show");
	});

}

function getArticleList(){
	
	$.ajax({
		type : "post",
		url : "../../material/article/list",
		success : function(data) {
			$("#alreadySingleMaterials").empty();
			$("#singleMaterials").html($("#singleArticleAddTemplate").render(data));
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus);
			console.log(XMLHttpRequest.status);
			console.log(XMLHttpRequest.responseText);
		}
	});	
}


function initSaveBtnEvent() {
	$("#saveBtn").click(function() {
		
		if(addArticleInPushMessages ==  false){
			//增加pushMessageTask
			addPushMessageTask();
		}else{
//			//增加某一个task的article
			var pushMessageTaskId =  $("#addDialog").data("pushMessageTaskId");
			 var msgs= $("#alreadySingleMaterials").find(".singleArticle").map(function(){
				 return $(this).data("id");
			 }).get().join(",");
			 var data = {pushMessageTaskId : pushMessageTaskId,msgs: msgs};
			 $.ajax({
						url : "../../pushMessage/update/msgs/",
						data : data,
						success : function() {
							location.reload();
						}
					})
		}
		
		
	})
}

function addPushMessageTask(){

	var pushMessageTask =  {};
	pushMessageTask.type = "MULTI_ARTICLE";
	pushMessageTask.msg = articles.join(",");
	pushMessageTask.scheduledTime = new Date();
	$.ajax({
		type : "post",
		url : "../../pushMessage/add",
		data : JSON.stringify(pushMessageTask),
		contentType : "application/json",
		success : function(data) {
			location.reload();
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus);
			console.log(XMLHttpRequest.status);
			console.log(XMLHttpRequest.responseText);
		}
	});
}

function initUpdateArticleBtnBtnEvent(){
	$("#updateArticleBtn").click(function(){
		
		var url; 
		var formData =  new FormData();
		var id = $("#editDailog").data("id");
		var title = $("#editDailog #title").val();
		var content = $("#editDailog #editor").html();
		
		
		formData.append("id",id);
		formData.append("title",title);
		formData.append("content",content);
		//no new cover image uploaded ,do nothing
		if($("#editDailog #cover").get(0).files.length!=0){
			formData.append("cover",$("#editDailog #cover").get(0).files[0]);
			url = "../../material/article/update";
		}else{
			url= "../../material/article/noCover/update";
		}
		//upload
		$.ajax({
			type: "post",
			url: url,
			contentType: false,
			data: formData,
			processData: false,
			success: function (data){
				var url = "../../pushMessage/MULTI_ARTICLE/preview/"+$("#addDialog").data("pushMessageTaskId");
				$.ajax(url).done(function(data){
					$("#singleMaterials").html($("#singleArticleEditTemplate").render(data));
//					$("#addDialog").modal("show").data("pushMessageTaskId",id);
					$("#editDailog").modal("hide");
					doClearWork();
				})
			}
		})
		
	});
}

function initCancelBtnEvent(){
	$("#cancleBtn").click(function(){
		doClearWork();
	});
}

function initSingleMaterialsEvnent(){
	//Add
	$("#singleMaterials").on("click",".add.singleArticle",function(){
		
		var selectedArticle =  $(this);
		if(selectedArticle.hasClass("checked")){
			if(addArticleInPushMessages == true){
				$("#alreadySingleMaterials").find(".selected").each(function(index,ele){
					if(selectedArticle.data("id") ==  $(ele).data("id")){
						ele.remove();
					}
				})
			}
			selectedArticle.removeClass("checked");
			removeItem(articles,$(this).data("id"));
			
		}else{
			if(addArticleInPushMessages == true){
				$("#alreadySingleMaterials").append($(this).clone().addClass("selected"));
			}
			articles.push($(this).data("id"));
			$(this).addClass("checked");
		}
	})
	
	
	//Remove
		$("#singleMaterials").on("click",".del",function(){
			
			var pushMessageTaskId = $("#addDialog").data("pushMessageTaskId");
			var singleArticle = $(this).parents(".singleArticle");
			var articleId = singleArticle.data("id");
			var url =  "../../pushMessage/del/"+pushMessageTaskId+"/"+articleId;
			$.ajax(url).done(
					function(data){
						if(data=="del"){
							location.reload();
						}
						singleArticle.remove();
					});
			
		}
	)
		//Edit
	$("#singleMaterials").on("click",".edit",function(event){
		event.stopPropagation();
//		var pushMessageTaskId = $("#addDialog").data("pushMessageTaskId");
		var singleArticle = $(this).parents(".singleArticle");
		var articleId = singleArticle.data("id");
//		var url =  "../../pushMessage/del/"+pushMessageTaskId+"/"+articleId;
		$.ajax("../../material/article/"+articleId).done(function(data){
			$("#editDailog").data("id",data.id);
			$("#editDailog #title").val(data.title);
			$("#editDailog #coverPreview").attr("src","/pic/"+data.cover).show();
			$("#editDailog #editor").html(data.content);
			$("#editDailog").modal("show");
		});
		
	}
)

	
}

function removeItem(articles,item){
	var index =  articles.indexOf(item);
	articles.splice(index,1);
}

function initCoverEvent() {
	$("#cover").change(function() {
		readURL(this);
	});
}

function initCoverBtnEvent() {
	$("#coverBtn").click(function() {
		$("#cover").trigger('click');
	});
}

function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function(e) {
			$('#coverPreview').show().attr('src', e.target.result);
		}

		reader.readAsDataURL(input.files[0]);
	}
}

function initMaterialsContain(cover, title, articleId) {

		$('#materials')
				.prepend(
						$("<div class='col-md-2'/>").data("articleId",
								articleId).append($("<div/>").text(title))
								.append(
										$('<a class="thumbnail"/>').append(
												$("<img/>").attr('src',
														"/pic/"+cover))));
}

function initPreviewEvent(){
	$("#pushMessageContainer").on('mouseover',".preview",function(){
		$(this).find(".glyphicon").show();
	}).on("mouseout",".preview",function(){
		$(this).find(".glyphicon").hide();
	}).on("click",".glyphicon",function(){
		var i =  $(this);
		var preview =$(this).parents(".preview");
		var pushMessageTaskId= preview.attr("id");
		var url  ;
		if(i.hasClass("edit")){
			url = "../../pushMessage/MULTI_ARTICLE/preview/"+pushMessageTaskId;
			$.ajax(url).done(function(data){
				$("#singleMaterials").empty().html($("#singleArticleEditTemplate").render(data));
				$("#alreadySingleMaterials").empty();
				$("#addDialog").modal("show").data("pushMessageTaskId",pushMessageTaskId);
			})
		}else if(i.hasClass("add")){
			url = "../../pushMessage/MULTI_ARTICLE/preview/"+pushMessageTaskId;
			$.ajax(url).done(function(data){
				$("#alreadySingleMaterials").html($("#singleArticleAddTemplate").render(data));
				getArticleMaterials(pushMessageTaskId);
			})
			
			addArticleInPushMessages = true;
			
		}else if (i.hasClass("del")){
			url = "../../pushMessage/delete/MULTI_ARTICLE/"+pushMessageTaskId;
			$.ajax(url).done(function(data){
				//Dialog
				$.ajax(url).done(function(data){
					preview.remove();
				});
			})
		}
	})
	
}


function getArticleMaterials(pushMessageTaskId){
	
	$.ajax({
		type : "post",
		url : "../../material/article/list",
		success : function(data) {
			$("#singleMaterials").empty().append($("#singleArticleAddTemplate").render(data));
			$("#addDialog").modal("show").data("pushMessageTaskId",pushMessageTaskId);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
		}
	});	
}



function initExpandPreviewEvent(){
	$("#expandPushMessage").on("click",".preview",function(){
		
		var articleId = $(this).data("id");
		
		$.ajax("../../material/article/"+articleId).done(function(data){
			console.log(data);
			$("#editDailog").data("id",data.id);
			$("#editDailog #title").val(data.title);
			$("#editDailog #coverPreview").attr("src","/pic/"+data.cover).show();
			$("#editDailog #editor").html(data.content);
			$("#editDailog").modal("show");
		});
		
		
	});
	
}

function pushInMaterialsContain(cover, title, articleId) {

	var reader = new FileReader();
	reader.onload = function(e) {
		$('#materials')
				.prepend(
						$("<div class='col-md-2'/>").data("articleId",
								articleId).append($("<div/>").text(title))
								.append(
										$('<a class="thumbnail"/>').append(
												$("<img/>").attr('src',
														e.target.result))));
	};
	reader.readAsDataURL(cover);
}

function doClearSelectedWork() {
	$("#singleMaterials").find(".checked").removeClass("checked");
}

function doClearWork() {
	$("#title").val("");
	var cover = $("#cover");
	var replacement;
	cover.replaceWith(replacement = cover.clone(true));
	$("#coverPreview").hide();
}