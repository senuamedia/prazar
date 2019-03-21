$(document).ready(function() {

    "use strict";
	
	function getBase64(file) {
		
		var reciver_id_check = $(".content_chat").attr("data-reciver");
		
		if(reciver_id_check=="" || reciver_id_check == 0){
				
				swal("Warning","please select receiver to start chat", "warning");
				return;
				
			}
		
		
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			var file_date = reader.result;
			var conversation_jd = $(".content_chat").attr("conversation_id");
			var reciver_id = $(".content_chat").attr("data-reciver");
			var file_name = document.getElementById("f1").files[0].name;
			var tmp = file_name.split(".");
			var file_type = "";
			if(tmp[1] == "jpg" || tmp[1] == "JPG" || tmp[1] == "jpeg" || tmp[1] == "JPEG" || tmp[1] == "png" || tmp[1] == "PMG" || tmp[1] == "gif" || tmp[1] == "GIF"){
				file_type = 1;
			}else{
				file_type = 2;
			}
			socket.emit("send_msg_file",{reciver_id:reciver_id,user_id:user_id,file_date:file_date,file_name:file_name,file_type:file_type,ext:tmp[1],conversation_jd:conversation_jd});
		};
		reader.onerror = function (error) {
			console.log('Error: ', error);
		};
	}
	
	if(document.getElementById("pg")){
		
		
		$('#msg_box').animate({scrollTop: $('#msg_box').prop("scrollHeight")}, 500);
		var base_url=$('#base_url_input').val();
		var socket =io.connect(base_url); //socket connection
		
		var user_id = $("#lui").val();
		var send_btn=$("#send_msg_btn");
		var message=$("#msg_input");
		
		socket.emit("join_chat",user_id);
		socket.on("join_chat",function(data){
			console.log("join chat :- "+data);
		})
		
		
		/*send msg on enter*/
		message.on("keyup",function(event){
			
			event.preventDefault();
			if (event.keyCode === 13) {
			   send_btn.click();
			}
		});
		
		/*send msg on click send btn*/
		send_btn.on("click",function(){
			
			var actual_msg=message.val();
			
			actual_msg=actual_msg.trim(actual_msg);
			
			
			if(actual_msg==''){
				swal("Warning","please enter message", "warning");
				return;
			}
			
			
			var conversation_jd = $(".content_chat").attr("conversation_id");
			var reciver_id = $(".content_chat").attr("data-reciver");
			
			
			if(reciver_id=="" || reciver_id == 0){
				
				swal("Warning","please select receiver to start chat", "warning");
				return;
				
			}
			
			
			socket.emit("send_msg",{reciver_id:reciver_id,user_id:user_id,message:actual_msg,conversation_jd:conversation_jd});
			
			
			var new_msg='<li class="replies"><p>'+actual_msg+'</p></li>';
			
			$('#msg_box').append(new_msg);///
			
			$('#msg_box').animate({scrollTop: $('#msg_box').prop("scrollHeight")}, 500);
			
			$("#msg_input").val("");
			$("#f1").val("");
			
		});
		
		$("#f1").change(function(e){
			getBase64(document.getElementById("f1").files[0]);	
		});
		
		socket.on("success_send",function(data){console.log(data);
			if(data != 200){
				// remove appended sent msg from list
				$('#msg_box li:last').remove();
			}
		});
		
		socket.on("success_send_img",function(data){console.log(data);
			if(data.status == 200){
				if(data.message_type == 1){
					var new_msg='<li class="replies"><a href="'+data.file_path+'" target="_blank"><img src="'+data.file_path+'"></img></a></li>';
				}else{
					var new_msg='<li class="replies"><a href="'+data.file_path+'" target="_blank">'+data.message+'</a></li>';
				}
				$('#msg_box').append(new_msg);///
			
				$('#msg_box').animate({scrollTop: $('#msg_box').prop("scrollHeight")}, 500);
				
				$("#msg_input").val("");
				$("#f1").val("");
			}
		});
		
		socket.on("recive_message",function(data){console.log(data);
			var conversation_jd = data.conversation_jd;
			var message = data.message;
			var file_path = data.file_path;
			var message_type = data.message_type;
			if($(".content_chat").attr("conversation_id") == conversation_jd){
				// append message and emit to mark msg as read and move chat head to top with read mark
				
				if(message_type==0){
					var msgg='<p>'+message+'</p>';
				}else if(message_type==1){
					
					var msgg='<a href="'+base_url+file_path+'" target="_blank"><img src="'+file_path+'"></img></a>';
				}else{
					var msgg='<a href="'+base_url+'messages/'+message+'" target="_blank">'+message+'</a>';
				}
				
				var new_msg='<li class="sent">'+msgg+'<li>';
				
				
				$('#msg_box').append(new_msg);
			
			    $('#msg_box').animate({scrollTop: $('#msg_box').prop("scrollHeight")}, 500);
			
				
			}else{
				$("#conversation_box li").each(function(){
					if($(this).attr("data-cid") == conversation_jd){
						if(!$(this).hasClass("active")){
							$(this).addClass("recive_new_message");
						}
					}
				});			    
			}
		});
		
	}
	
});	