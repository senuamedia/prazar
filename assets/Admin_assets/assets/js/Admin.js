/* ADMIN  JS FILE FOR ADMIN ACTIVITY By @pp*/
var base_url=$('#base_url_value').val();

/* For Category delete */
function categoryDelete(id,name){

    if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete Category = "+name,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/category_delete',        
          type: 'POST',
          data: {id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+'prazar_admin/categories';
              }, 2000);
          }
        });        
      });     
    }    
  } 

/* For Sub Category delete */
function sub_category_delete(id,name){

    if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete Sub Category = "+name,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url: base_url+'admin/sub_category_delete',        
          type: 'POST',
          data: {id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"admin/sub_categories";
              }, 2000);
          }
        });        
      });     
    }    
  } 

/* For potential vendor delete */
function vendorRequestdelete(vendor_id){

    if(vendor_id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete this request ",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/vendore_request_delete',        
          type: 'POST',
          data: {vendor_id: vendor_id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+'prazar_admin/potential_vendors';
              }, 2000);
          }
        });        
      });     
    }    
  } 


/* For Category delete */
function categoryDelete(id,name){

    if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete Category = "+name,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/category_delete',        
          type: 'POST',
          data: {id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+'prazar_admin/categories';
              }, 2000);
          }
        });        
      });     
    }    
  } 


/* For delete slider by admin  */
function homeBannerDelete(id){

    if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete this item",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/delete_slider',        
          type: 'POST',
          data: {slider_id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+'prazar_admin/home_page_managemant';
              }, 2000);
          }
        });        
      });     
    }    
  } 



/* delete sub category */
function deleteSubCat(id){
	
 var x = 1;
 var remove_box="remove_subcat"+id;

	
  if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete this item",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/sub_category_delete',        
          type: 'POST',
          data: {id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
			  
              $("#"+remove_box).parent('div').remove(); x--;
          }
        });        
      });     
    }  
	
	
	return false;
	
}

// delete popular product 

function popularProductDelete(pro_slug){
	
	
  if(pro_slug!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete this item",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/delete_popular_product',        
          type: 'POST',
          data: {pro_slug: pro_slug},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
			   setTimeout(function(){
                   window.location.href=base_url+'prazar_admin/home_page_managemant';
               }, 3000); 
              
          }
        });        
      });     
    }  
	
	
	return false;
	
}


/* delete footer link */
function deleteFooterLink(id){
	
  if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete this item",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/delete_footer_link',        
          type: 'POST',
          data: {id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
			  
              setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/footer_managemant';
                            }, 3000); 
          }
        });        
      });     
    }  
	
	
	return false;
	
}


/* delete customer account link */
function customerDelete(id){
	
  if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete this customer account",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: true
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/delete_custmer_account',        
          type: 'POST',
          data: {user_id: id},
		  beforeSend: function(){
			$(".delete_overlay").css({"display":"block"});
		},
          success: function(data) {
			   $(".delete_overlay").css({"display":"none"});
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
			  
              setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/customers';
                            }, 3000); 
          }
        });        
      });     
    }  
	
	
	return false;
	
}




/* delete vendor account */
function vendorDelete(id){
	
  if(id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to delete this vendor account",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: true
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/delete_custmer_account',        
          type: 'POST',
          data: {user_id: id},
		  beforeSend: function(){
			$(".delete_overlay").css({"display":"block"});
		},
          success: function(data) {
			  
			  $(".delete_overlay").css({"display":"none"});
			  
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
			  
              setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/vendors';
                            }, 3000); 
          }
        });        
      });     
    }  
	
	
	return false;
	
}

/* Document ready function start here */

 $(document).ready(function() {
	  
	/* For Add More  fields for sub category*/
	  
    var max_fields      = 7; //maximum input boxes allowed
    var wrapper         = $(".subSubCategoryDiv"); //Fields wrapper
    var add_button      = $(".add_history_button"); //Add button ID
	
	var mainDivSubCategoriesButton = $(".mainDivSubCategoriesButton");
    
    var x = 1; //initlal text box count
    //$(add_button).click(function(e){ //on add input button click
	$('body').on('click', '.add_history_button', function(e){
        e.preventDefault();
        if(x < max_fields){ //max input box allowed
            x++; //text box increament
			
            //$(wrapper).append(' <div><div class="form-group subSubcateButtonInput" data-plugin="formMaterial" ><input type="text" class="form-control empty" name="sub_catrgory"  required><button class="remove_field rem_his_botton"> <input type="hidden" name="subcat_ids" value="0" class="subSubcateInput" /><i class="icon wb-close" aria-hidden="true"></i></button></div></div>'); //add input box
            $(this).parents('.subSubCategoryDiv').append(' <div class="form-group subSubcateButtonInput clearfix" data-plugin="formMaterial">	<button class="remove_field exp_desc_botton" type="button" data-sub-sub-id="0"><i class="icon wb-close" aria-hidden="true"></i> </button> <div class="subSubcateInput"><input type="text" class="form-control empty" name="subsub_catrgory" required><input type="hidden" class="form-control empty" name="subsub_cat_id"  value="0"></div></div> '); //add input box
			
			var total_sub_sub = $(this).parents(".subSubCategoryDiv").find(".total_sub_sub").val();
			
			total_sub_sub = parseInt(total_sub_sub);
			
			$(this).parents(".subSubCategoryDiv").find(".total_sub_sub").val(total_sub_sub+1);
			
			 $('.subSubCategoryDiv').sortable();
			
        }
    });
	$('.mainDivSubCategoriesButton').on('click', function(){
		$('.mainDivSubCategories').append('<div class="div_exp_description subcateDiv input_history_wrap"><div class="subCategoryDivRemove" data-sub-cat-id="0"><i class="icon wb-close" aria-hidden="true"></i></div><div class="row"><div class="col-sm-6"><label class="floating-label">Sub Category Name</label><div class="form-group " data-plugin="formMaterial" style="border: 1px solid lightgray;"><div><input type="text" class="form-control empty" name="sub_catrgory" required><input type="hidden" class="form-control empty" value="0" name="sub_catrgory_id" ></div> </div></div><div class="col-sm-6"><label class="floating-label">Sub sub Category Name</label> <div class="subSubCategoryDiv"><input type="hidden" name="total_sub_sub_cat" class="total_sub_sub" value="1"/><div class="form-group subSubcateButtonInput clearfix" data-plugin="formMaterial"> <button class="add_history_button exp_desc_botton" type="button"><i class="icon wb-plus-circle" aria-hidden="true"></i> </button><div class="subSubcateInput"><input type="text" class="form-control empty" name="subsub_catrgory" required><input type="hidden" class="form-control empty" name="subsub_cat_id"  value="0"></div></div> </div></div></div></div>');
		// $('.subcateDiv').sortable();
	});
    
	  /* remove text sub sub category box */
   
    $('body').on("click",".remove_field", function(e){ 
        e.preventDefault(); 
		
		var this_ref = $(this);
		var subsubcat_id = $(this).attr("data-sub-sub-id");
		
		if(subsubcat_id > 0){
			
			swal({
			title: "Are you sure?",
			text: "You want to remove this item",
			type: "warning",
			showCancelButton: true,
			confirmButtonClass: "btn-warning",
			confirmButtonText: "Yes!",
			closeOnConfirm: true
		  },
		  function(){
			  
			  var subsubcat_id = $(this_ref).attr("data-sub-sub-id");
          
			$.ajax({
			  url:base_url+'prazar_admin/subsub_category_delete',        
			  type: 'POST',
			  data: {id: subsubcat_id},
			 
			  success: function(data) {
				  console.log(data);
				  var obj = JSON.parse(data);              
				
				    var total_sub_sub = $(this_ref).parents(".subSubCategoryDiv").find(".total_sub_sub").val();
			
			        total_sub_sub = parseInt(total_sub_sub);
			
			       $(this_ref).parents(".subSubCategoryDiv").find(".total_sub_sub").val(total_sub_sub-1);
		
		           $(this_ref).parent('.subSubcateButtonInput ').remove();
			       x--;
				  
			  }
			});        
		 });
			
			
		}else{
			
			
			 var total_sub_sub = $(this).parents(".subSubCategoryDiv").find(".total_sub_sub").val();
			
			total_sub_sub = parseInt(total_sub_sub);
			
			$(this).parents(".subSubCategoryDiv").find(".total_sub_sub").val(total_sub_sub-1);
		
		    $(this).parent('.subSubcateButtonInput ').remove();
			x--;
			
		}
			
		
		
		
		
		   
		
		  
		
    });
	  
	
	/*remove sub category box*/
	
	 $('body').on("click",".subCategoryDivRemove", function(e){
		 
		var main_cat_id = $("#main_cat_id").val();
		var this_ref = $(this); 
		
	  if(main_cat_id > 0){
			 
			 
		swal({
			title: "Are you sure?",
			text: "You want to remove this item",
			type: "warning",
			showCancelButton: true,
			confirmButtonClass: "btn-warning",
			confirmButtonText: "Yes!",
			closeOnConfirm: true
		  },
		  function(){
			  
           var sub_cat_id = $(this_ref).attr("data-sub-cat-id");
		  
			$.ajax({
			  url:base_url+'prazar_admin/sub_category_delete',        
			  type: 'POST',
			  data: {id: sub_cat_id},
			 
			  success: function(data) {
				  console.log(data);
				  var obj = JSON.parse(data);              
				
				   $(this_ref).parent('.div_exp_description.subcateDiv').remove();
				  
			  }
			});        
			});
			 
			 
			 
		 }else{
			 $(this).parent('.div_exp_description.subcateDiv').remove();
		 }
		 
		
		
	});
	
	
	/* check admin password validity*/   
	$('#admin_password').change(function(){
		if($('#admin_password').val() != $('#admin_cpassword').val()) {
			$('#admin_cpassword')[0].setCustomValidity("Passwords Don't Match");
	  	} else {
			$('#admin_cpassword')[0].setCustomValidity('');
		}
	});  
    $('#admin_cpassword').keyup(function(){
		if($('#admin_password').val() != $('#admin_cpassword').val()) {
			$('#admin_cpassword')[0].setCustomValidity("Passwords Don't Match");
	  	} else {
			$('#admin_cpassword')[0].setCustomValidity('');
		}
	});
	
	  
/* For potential vendor approve disapprove */
   
 $('.vendor_aprove').change(function(){
		
	 var status=$(this).val();
	 var vendor_id = $(this).next('.vendor_id').val();
	 var status_type="";
	 
	 if(status==1){
	   status_type="Approve";
	 }else if(status==2){
	   status_type="Reject";
	 }else if(status==3){
	   status_type="international selling";
	 }else{
	   vendor_id="";
	 }
	 
	 if(vendor_id!=""){  
      swal({
        title: "Are you sure?",
        text: "You Want to "+status_type+" this request",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes!",
        closeOnConfirm: true
      },
      function(){

        $.ajax({
          url:base_url+'prazar_admin/vendor_aprove',        
          type: 'POST',
          data: {vendor_id: vendor_id,aprove_status:status},
		  beforeSend: function(){
			$(".delete_overlay").css({"display":"block"});
		  },
          success: function(data) {
			  
			  $(".delete_overlay").css({"display":"none"});
			  
			  
              var obj = JSON.parse(data);              
              swal("Updated!", obj.message, "success");
			  
			  
			  
             /* setTimeout(function(){
                  window.location.href=base_url+'prazar_admin/potential_vendors';
              }, 2000); */
          }
        });        
      });     
    } 
	 
	});	  
	  
	  
/* show image preview */  
function readURL(input) {

  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $('.show_image').attr('src', e.target.result);
      $('.show_image').css("display","inline-block");
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$(".choose_image").change(function() {
  readURL(this);
});

 
	  
/* search input autocomplete products */
	  
	$(".search-box").keyup(function(){
		
		var keyword=$(this).val()
		
		 if( keyword.length < 4 ) return;
		
		
	$.ajax({
		type: "POST",
	    url:base_url+'prazar_admin/get_products_by_search',     
		data:{keyword:keyword},
		beforeSend: function(){
			$(".search-box").css("background","#FFF url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		},
		success: function(data){
			
			var obj=JSON.parse(data);
			var suggetions="";
			
			for(var i=0;i<obj.data.length;i++){
				
			  var pro_name=obj.data[i]["product_name"];
			  var pro_slug=obj.data[i]["slug"];
				
			  pro_name=pro_name.replace(/^\s+/," ");
			  pro_slug=pro_slug.replace(/^\s+/," ");
				
				var onclick="selectProduct('"+pro_name+"','"+pro_slug+"')";
				
			  suggetions += '<li onclick="'+onclick+'">'+pro_name+'</li>';
				
			}
			
			var html='<ul id="product-list">'+suggetions+'</ul>';
			
			
			$(".suggesstion-box").show();
			$(".suggesstion-box").html(html);
			$(".search-box").css("background","#FFF");
		}
		});
	});  
	  
	  
	/*change slider image add*/  
	  
	  $("#slider_image").on("change",function(e) {
		  
		  $('#image_err').text("");
		  
	  });
 
  /* add slider */
	   
  $("#add_slider_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	  
	var choose_image = $("#slider_image")[0].files[0];
	   
    var reader = new FileReader();
	//Read the contents of Image File.
    reader.readAsDataURL(choose_image);
    reader.onload = function (ef) {
    //Initiate the JavaScript Image object.
    var image = new Image();
    //Set the Base64 string return from FileReader as source.
    image.src = ef.target.result;
    image.onload = function () {
		//Determine the Height and Width.
		var height = this.height;
		var width = this.width;
		   
        if (height == 790 && width == 1900) {  //check image daimentions
				
			    $('#image_err').empty();
			
			    //send ajax reuest to submit form
			
					$.ajax({
						url: base_url+'prazar_admin/add_slider',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
			              $(".slider_save_btn").css("background","#FFF url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		                 },
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							$("#success_msg").text(msg);
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/home_page_managemant';
                            }, 3000); 
							
							
						},
					});
		   }else{
			   
			   $('#image_err').text("Image size should be  1900px X 790px Width  and height");
			  
		   }
			
		}; 
	}
	  
	
});  
	  
	
 $(".slider_image").on("change",function(e) {
		  
		  var no_of_slide= $(this).attr("data-id");
		 
		  $('.image_err'+no_of_slide).text("");
		  
	  });


	
//edit slider 	  
	  
 $(".add_slider_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var this_ref= $(this);
	var no_of_slide= $(this).attr("data-id");
	 
	var formData = new FormData($(this)[0]);  
	  
	var choose_image = $(".slider_image")[0].files[0];
	 
	 if(choose_image){
	 
     var reader = new FileReader();
	//Read the contents of Image File.
    reader.readAsDataURL(choose_image);
    reader.onload = function (ef) {
    //Initiate the JavaScript Image object.
    var image = new Image();
    //Set the Base64 string return from FileReader as source.
    image.src = ef.target.result;
    image.onload = function () {
		//Determine the Height and Width.
		var height = this.height;
		var width = this.width;
		   
        if (height == 790 && width == 1900) {  //check image daimentions
				
			    $('#image_err').empty();
			
			    //send ajax reuest to submit form
			
					$.ajax({
						url: base_url+'prazar_admin/edit_slider',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
			              $(".slider_save_btn").css("background","#FFF url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		                 },
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							$("#success_msg").text(msg);
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/home_page_managemant';
                            }, 3000); 
							
							
						},
					});
		   }else{
			  
			  
			   $('.image_err'+no_of_slide).text("Image size should be  1900px X 790px Width  and height");
			  
		   }
			
		}; 
	}
		 
		 
	 }else{
	  
		       $.ajax({
			            url: base_url+'prazar_admin/edit_slider',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
			              $(".slider_save_btn").css("background","#FFF url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		                 },
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							$("#success_msg").text(msg);
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/home_page_managemant';
                            }, 3000); 
							
							
						},
					});
		 
	 }
	
	
});  
	 

$(".close-model").on("click",function(e){
	
	window.location.reload();
});

	 
  //blue background section edit  
	  
  $("#blue_section_form").on("submit",function(e) {
	  
	 e.preventDefault(); 
	 
	 var formData = new FormData($(this)[0]);   
	  
	          $.ajax({
		               url: base_url+'prazar_admin/edit_blue_section',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
			              $(".blu_save_btn").css("background","#FFF url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		                 },
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							$("#blu_success_msg").text(msg);
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/home_page_managemant';
                            }, 3000); 
							
							
						},
		     }); 
	  
  });   
	  
// add popular product 
	  
	$("#add_popular_form").on("submit",function(e) {
	  
	 e.preventDefault(); 
	 
	 var formData = new FormData($(this)[0]);   
	  
	          $.ajax({
		               url: base_url+'prazar_admin/add_popular_product',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
			              $(".popular_save_btn").css("background","#FFF url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		                 },
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							$("#blu_success_msg").text(msg);
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/home_page_managemant';
                            }, 3000); 
							
						},
		           }); 
	  
  });   
	  
	 
/* search input autocomplete products */
	  
	$(".search-box-store").keyup(function(){
		
		var keyword=$(this).val()
		
		 if( keyword.length < 3 ) return;
		
		
	$.ajax({
		type: "POST",
	    url:base_url+'prazar_admin/get_stores_by_search',     
		data:{keyword:keyword},
		beforeSend: function(){
			$(".search-box-store").css("background","#FFF url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		},
		success: function(data){
			
			var obj=JSON.parse(data);
			var suggetions="";
			
			for(var i=0;i<obj.data.length;i++){
				
			  var store_name=obj.data[i]["store_name"];
			  var store_slug=obj.data[i]["store_slug"];
				
			  store_name=store_name.replace(/^\s+/," ");
			  store_slug=store_slug.replace(/^\s+/," ");
				
				var onclick="selectStore('"+store_name+"','"+store_slug+"')";
				
			   suggetions += '<li onclick="'+onclick+'">'+store_name+'</li>';
				
			}
			
			var html='<ul id="store-list">'+suggetions+'</ul>';
			
			
			$(".suggesstion-box").show();
			$(".suggesstion-box").html(html);
			$(".search-box-store").css("background","#FFF");
		}
		});
	});  	  
	  
	
	  
 //edit cta form 
	  
 $(".edit_cta_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	  
	var choose_image = $(".cta_image")[0].files[0];
	 
	 if(choose_image){
	 
     var reader = new FileReader();
	//Read the contents of Image File.
    reader.readAsDataURL(choose_image);
    reader.onload = function (ef) {
    //Initiate the JavaScript Image object.
    var image = new Image();
    //Set the Base64 string return from FileReader as source.
    image.src = ef.target.result;
    image.onload = function () {
		//Determine the Height and Width.
		var height = this.height;
		var width = this.width;
		   
        if (height == 365 && width == 640) {  //check image daimentions
				
			    $('#cta_image_err').empty();
			
			    //send ajax reuest to submit form
			
					$.ajax({
						url: base_url+'prazar_admin/edit_cta',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
			              $(".cta_save_btn").css("url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		                 },
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							$("#success_msg_store").text(msg);
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/home_page_managemant';
                            }, 3000); 
							
							
						},
					});
		   }else{
			   
			   $('#cta_image_err').text("Image size should be  640px X 365px Width  and height");
			  
		   }
			
		}; 
	}
		 
		 
	 }else{
	  
		       $.ajax({
			            url: base_url+'prazar_admin/edit_cta',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
			              $(".cta_save_btn").css("url(/Admin_assets/assets/images/LoaderIcon.gif) no-repeat 165px");
		                 },
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							$("#success_msg_store").text(msg);
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/home_page_managemant';
                            }, 3000); 
							
							
						},
					});
		 
	 }
	
	
});    
	  
/********** footer management **********/	  
	
// update footer links	  
 $(".edit_footer_link_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 
		       $.ajax({
			            url: base_url+'prazar_admin/edit_footer_link',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
										$(".footer_link_btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
						},
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							  swal("Updated", msg, "success");
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/footer_managemant';
                            }, 3000); 
							
							
						},
					});
		 
                 });    	  
	  
	 
// Add footer link	 
 $(".add_footer_link_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 
		       $.ajax({
			            url: base_url+'prazar_admin/add_footer_link',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
										$(".footer_link_btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
						},
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							  swal("Added", msg, "success");
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/footer_managemant';
                            }, 3000); 
							
							
						},
					});
		 
     }); 	 
	 
	 
/********** customer management   ****************/	 
	 
// set new password of customer	 
 $(".edit_customer_pass_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 
		       $.ajax({
			            url: base_url+'prazar_admin/update_customer_pass',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
										$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
						},
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							  swal("Success", msg, "success");
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/customers';
                            }, 3000); 
							
							
						},
					});
		 
     }); 
	 
	 
// active inactive  customer	 
 $(".edit_customer_status_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 

      swal({
        title: "Are you sure?",
        text: "You Want to change status",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes!",
        closeOnConfirm: true
      },
      function(){
	 
		       $.ajax({
			            url: base_url+'prazar_admin/update_customer_status',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
										$(".submit-btn1").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
						},
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							  swal("Success", msg, "success");
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/customers';
                            }, 3000); 
							
							
						}
					});
				
	  });  
	 
	 
      });
	 
	 
 // customer filter by 	  
 $("#customer_show_by").on("change",function(e) {
	  
	  var filter_val= $(this).val();
	
	 if(filter_val==0){
		 window.location.href=base_url+'prazar_admin/customers';
		 return;
	  }
	 
		$.ajax({
		url: base_url+'prazar_admin/customer_filter',
		type: 'POST',
		data: {filter_val:filter_val},
		success: function (data) {
           console.log(data);
			var obj=JSON.parse(data);
		    var msg=obj.message;
			var customers_html="";
			
			var customers=obj.customers;
			
			if(customers.length==0){
			    customers_html='<tr><td colspan="9">data not found</td></tr>';
			 }
			
           for(var j=0;j<customers.length;j++){
			   
			   var cond1="";
			    var cond2="";
			   if(customers[j].is_active==1){
			   cond1='<span class="badge badge-success" >Active</span>';
			   cond2=' <option value="0">Block Account</option><option value="0">Suspend Account</option> ';
			   }else{
			     cond1='<span class="badge badge-danger" >block/suspended</span>';
				 cond2='<option value="1">Activat Account</option>';
			   }
			   
			 
			   
		      customers_html +='<tr><td>'+(j+1)+'</td><td>'+customers[j].name+'</td><td>'+customers[j].email+'</td><td>'+customers[j].address_line_1+'</td><td>$'+customers[j].total_purches+'</td><td>'+customers[j].order_no+'</td><td>'+customers[j].total_orders+'</td><td> '+cond1+'</td><td> <button class="btn btn-primary btn-sm employer_delete openPopup" data-href="'+base_url+'prazar_admin/getsingle_customer?user_id='+customers[j].user_id+'" data-toggle="modal" type="button" id="openpopup'+j+'">Edit</button> <a href="javascript:void(0)" onclick="customerDelete('+customers[j].user_id+')" class="btn btn-danger btn-sm employer_delete">Delete </a></td></tr><div class="modal fade modal-3d-slit" id="exampleNifty3dSlit'+j+'" aria-hidden="true" aria-labelledby="exampleModalTitle" role="dialog" ><div class="modal-dialog modal-simple"><div class="modal-content"><div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"> <span aria-hidden="true">×</span> </button><h4 class="modal-title">Edit '+customers[j].name+' Account</h4></div><div class="modal-body"> <span id="success_msg" style="color:green"></span><div class="row"><div class="col-lg-12"><form method="POST" class="edit_customer_pass_form" > <input type="hidden" class="form-control title" name="user_id" value="'+customers[j].user_id+'"> <input type="hidden" class="form-control title" name="email" value="'+customers[j].email+'"><div class="form-group form-material floating" data-plugin="formMaterial"> <input type="text" class="form-control title" name="new_pass" required> <label class="floating-label">New Password</label></div><div class="form-group form-material floating" data-plugin="formMaterial"> <button type="submit" class="btn btn-primary submit-btn" >Reset Password</button></div></form><hr/><form method="POST" class="edit_customer_status_form" > <label class="floating-label">Select Action</label> <br/> <select name="customer_status" required><option value="">select...</option> '+cond2+' </select> <input type="hidden" class="form-control title" name="user_id" value="'+customers[j].user_id+'"> <input type="hidden" class="form-control title" name="email" value="'+customers[j].email+'"><div class="form-group form-material floating" data-plugin="formMaterial"> <label class="floating-label">Reason</label> <br/><textarea rows="4" cols="20" name="reason" required></textarea></div><div class="form-group form-material floating" data-plugin="formMaterial"> <button type="submit" class="btn btn-primary submit-btn1" >Submit</button></div></form></div></div></div><div class="modal-footer"> <button type="button"  class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
		   }

			
			$('#customers_table_body').html(customers_html);
			$('.paginat_row').hide();
			
		},
		}); 
	  
  }); 
	 
	
	/*customer filter model open*/
	
	$('body').on('click',".openPopup",function(){
		
        var dataURL = $(this).attr('data-href');
        $('.modal-body').load(dataURL,function(){
            $('#customer_filter_model').modal({show:true});
        });
    });  
	 
	 
/*************** vendor management *************/	 

	 
	// set new password of vendor	 
 $(".edit_vendor_pass_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 
		       $.ajax({
			            url: base_url+'prazar_admin/update_customer_pass',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
										$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
						},
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							  swal("Success", msg, "success");
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/vendors';
                            }, 3000); 
							
							
						},
					});
		 
     });  
	 
	 
// set new commision of vendor	 
 $(".edit_vendor_commision_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 
		       $.ajax({
			            url: base_url+'prazar_admin/update_vendor_commision',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
										$(".submit-btn2").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
						},
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							  swal("Success", msg, "success");
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/vendors';
                            }, 3000); 
							
							
						},
					});
		 
     }); 
	 
	 
	 
	 
	// active inactive  vendor	 
 $(".edit_vendor_status_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 

      swal({
        title: "Are you sure?",
        text: "You Want to change status",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes!",
        closeOnConfirm: true
      },
      function(){
	 
		       $.ajax({
			            url: base_url+'prazar_admin/update_customer_status',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function(){
										$(".submit-btn1").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
						},
						success: function (data) {
							
							var obj=JSON.parse(data);
							var msg=obj.message;
							
							  swal("Success", msg, "success");
							
							 setTimeout(function(){
                              window.location.href=base_url+'prazar_admin/vendors';
                            }, 3000); 
							
							
						}
					});
				
	  });  
	 
	 
      }); 
	 
	 
	 /*get vendor categories*/
	 
	 $('.openPopupCat').on('click',function(){
		
        var dataURL = $(this).attr('data-href');
        $('.modal-body-cat').load(dataURL,function(){
            $('#exampleNifty3dSlitcat').modal({show:true});
        });
    });  
	 
	 /*get vendor orders*/
	 
	 $('.openPopupOrder').on('click',function(){
		
        var dataURL = $(this).attr('data-href');
        $('.modal-body-order-nos').load(dataURL,function(){
            $('#exampleNifty3dSlitOrder').modal({show:true});
        });
    });
	 
	 
	 /*get vendor categories*/
	 
	 $('.openPopupSuggestedCat').on('click',function(){
		
        var dataURL = $(this).attr('data-href');
        $('.modal-body').load(dataURL,function(){
            $('#suggested_cat_popup').modal({show:true});
        });
    }); 
	 
	


	 /*get customers orders*/
	 
	 $('.openPopupOrderCustomer').on('click',function(){
		
        var dataURL = $(this).attr('data-href');
        $('.modal-body-order-nos').load(dataURL,function(){
            $('#exampleNifty3dSlitOrder').modal({show:true});
        });
    });
	 
/* show image preview */  
function readURL1(input) {

  if (input.files && input.files[0]) {
    var reader = new FileReader();
     
    reader.onload = function(e) {
		
     $('.show_image1').attr('src', e.target.result);
	 $('.show_image1').css("display","inline-block");
	  
	 var image = new Image();
    
    image.src = e.target.result;
    image.onload = function () {
		//Determine the Height and Width.
		var height = this.height;
		var width = this.width;
		  
        if (height == 350 && width == 850) {  //check image daimentions
				
			    $('#banner_err').empty();
			    $(".add_cat_sub_btn").removeAttr("disabled");
				
		   }else{
			   
			   $('#banner_err').text("Image size should be  850px X 350px Width and height");
			  
			   $(".add_cat_sub_btn").attr("disabled",true);
		   }
			
		};
	  
	  
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$(".choose_image1").change(function() {
  readURL1(this);
}); 
	 
	 
	 
	 
 /*category add form*/
	 
/*	   
  $(".add_cat_sub_btn").on("click",function() {
	  
   var choose_image = $(".choose_image1")[0].files[0];
   if(choose_image){  
    var reader = new FileReader();
	//Read the contents of Image File.
    reader.readAsDataURL(choose_image);
    reader.onload = function (ef) {
    //Initiate the JavaScript Image object.
    var image = new Image();
    //Set the Base64 string return from FileReader as source.
    image.src = ef.target.result;
    image.onload = function () {
		//Determine the Height and Width.
		var height = this.height;
		var width = this.width;
		  
        if (height == 350 && width == 850) {  //check image daimentions
				
			    $('#banner_err').empty();
				
			  //$( ".add_cat_from" ).submit();
			  
		   }else{
			   
			   $('#banner_err').text("Image size should be  850px X 350px Width and height");
			  			 
			   return false;
		   }
			
		}; 
	}
	  
  }
  
});  */
	
	
	
   /*category image on change*/
	    
  $(".banner_img_cat").on("change",function(event) {

	 
   var choose_image = $(this)[0].files[0];
     
    var reader = new FileReader();
	//Read the contents of Image File.
    reader.readAsDataURL(choose_image);
    reader.onload = function (ef) {
    //Initiate the JavaScript Image object.
    var image = new Image();
    //Set the Base64 string return from FileReader as source.
    image.src = ef.target.result;
    image.onload = function () {
		//Determine the Height and Width.
		var height = this.height;
		var width = this.width;
		  
        if (height == 350 && width == 850) {  //check image daimentions
				
			    $('#banner_err').empty();
				$(".cat_update_btn").prop("disabled", false);
			 
		   }else{
			     
			       $('#banner_err').text("Image size should be  850px X 350px Width and height");
			  		
				$(".cat_update_btn").prop("disabled", true);	
		   }
			
		}; 
	}
	  
  
  
});
	
	

/*category edit form*/
	    
  $(".banner_img_cat").on("change",function(event) {

	 
   var choose_image = $(this)[0].files[0];
     
    var reader = new FileReader();
	//Read the contents of Image File.
    reader.readAsDataURL(choose_image);
    reader.onload = function (ef) {
    //Initiate the JavaScript Image object.
    var image = new Image();
    //Set the Base64 string return from FileReader as source.
    image.src = ef.target.result;
    image.onload = function () {
		//Determine the Height and Width.
		var height = this.height;
		var width = this.width;
		  
        if (height == 350 && width == 850) {  //check image daimentions
				
			    $('#banner_err').empty();
				$(".cat_update_btn").prop("disabled", false);
			 
		   }else{
			     
			       $('#banner_err').text("Image size should be  850px X 350px Width and height");
			  		
				$(".cat_update_btn").prop("disabled", true);	
		   }
			
		}; 
	}
	  
  
  
});  

/*check length of products*/

$('#check_popular_pro').on("click",function(){
	
	swal("warning","Maximum 6 products can be added you have to remove any one from list to add more","warning");
	
});
	
	 
});





 /* set selected value of search */
  function selectProduct(pro_name,pro_slug) {

	   $(".search-box").val(pro_name);
	   $(".searched_pro_name").val(pro_name);
	   $(".searched_pro_slug").val(pro_slug);
	   $(".suggesstion-box").hide();
	}
	  

/* set selected value of search store */
  function selectStore(store_name,store_slug) {

	   $(".search-box-store").val(store_name);
	   $(".searched_store_name").val(store_name);
	   $(".searched_store_slug").val(store_slug);
	   $(".suggesstion-box").hide();
	}

	
/*code by farid */

$(document).ready(function(){
        $("#all_vendor_list").change(function(){
            var vid = $(this).val();
            var base_url=$('#base_url_value').val();
            if(vid != ""){
                $.ajax({
                    url: base_url+'prazar_admin/get_conversation_by_vendor_id',
                    type: 'POST',
                    data: {vid:vid},
                    dataType:'html',
                    success: function (data) {
                        $("#all_customers").html(data);
                    }
                });
            }
        });
        
        $("#all_customers").change(function(){
            var cid = $(this).val();
            var vid = $("#all_vendor_list").val();console.log(vid);
            var base_url=$('#base_url_value').val();
            if(cid != ""){
                $.ajax({
                    url: base_url+'prazar_admin/get_messages_by_cid',
                    type: 'POST',
                    data: {cid:cid,vid:vid},
                    dataType:'html',
                    success: function (data) {
                        $("#msg_box").html(data);
                    }
                });
            }else{
                $("#msg_box").html("");
            }
        });
		
		/*new sub category section*/
		   $("#sub_cat_drp").change(function(){ 
            
			var cat_id = $("#cat_id").val();
			var sub_cat_id = $(this).val();
			
			if(sub_cat_id == ""){
				sub_cat_id = 0;
			}
			
			window.location.href = base_url+'prazar_admin/edit_sub_category/'+cat_id+'/'+sub_cat_id;
			
			 
          });
		
		/*table sortable for categories*/
	
       $('.categories_sort').sortable({
        update: function(event, ui) { 
             $(this).children().each(function(index) {
				 
				 console.log("jgsad"+$(this).attr("cat_id"));
				 //console.log("index "+(index+1));
				 
				 var cat_id = $(this).attr("cat_id");
				 
				 var indexx= index+1;
				  $.ajax({
                    url: base_url+'prazar_admin/sort_categories',
                    type: 'POST',
                    data: {cat_id:cat_id,indexx:indexx},
                    dataType:'json',
                    success: function (data) {
                        console.log("data "+data);
                    }
                });
			  
          });
			
        },
        start: function(event, ui) { 
            console.log('start: ' + ui.item.index())
        }
    });
		
		
		/*sub sub category sortable */
		
		 $('.mainDivSubCategories').sortable();
		 $('.subSubCategoryDiv').sortable();
		
		
		
    });
	

	