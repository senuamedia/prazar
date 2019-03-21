/*
 *****************************************************
 *	CUSTOM JS DOCUMENT                              *
 *	Single window load event                        *
 *   "use strict" mode on                            *
 *****************************************************
 */
$(window).on("load", function() {

    //force to reload page hen browser back btn
   window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted || 
    ( typeof window.performance != "undefined" && window.performance.navigation.type === 2 );
	
    if ( historyTraversal ) {
       // Handle page restore.
        window.location.reload();
     }
   });
	 
	 
    "use strict";

    var preLoader = $('.preloader');
    var MixItUp1 = $('#MixItUp1');
    var fancybox = $('.fancybox');
    var fancybox = $('.fancybox');
    var faqsAccordion = $('#faqs-accordion');
    var waTabBtn = $('.wa-tabs .womens_btn');
    var waTabBtn1 = $('#wa-tabs1 .mens_btn');
    var waTabContainer = $('.wa-tabs .womens_tab');
    var waTabContainer1 = $('#wa-tabs1 .mens_tab');
    var cartPopup = $('#cart');
    var minicart = $(".mini-cart-wrapper");
    var uiTrigger = $('[js-ui-menu-trigger]');
    var priceShow = $('#price_show');
    var price_show_on_store = $('#price_show_on_store');
    var sliderHandle = $('.ui-slider-handle');
    var itemFav = $('[js-item-fav]')
    var priceRangeFilter = $('.price-range-filter')
   
    var off_tag2 = $(".off_tag2,.off_tag3");
    var bodys = $("body");
    var quickView = $(".quickView");
    var modalBackdrop = $(".modal_backdrop");
    var closeModal = $(".close-modal");
    var thumbs = $(".icon-images").find("a");
    var dp = $(".display-img");
    var jsPriceSlider = $(".js-price-slider");
	var tpBanner= jQuery('.fullwidthbanner');

    // ============================================
    // PreLoader On window Load
    // =============================================
	if (preLoader.length) {
        preLoader.addClass('loaderout');
	}

    //============================================
    // MixItUp settings
    //============================================

    if (MixItUp1.length) {
        MixItUp1.mixItUp({
            selectors: {
                filter: '.filter-1'
            }
        });
    }
	
    //=========================================
    // Tabs
    //=========================================			

    if (waTabBtn.length) {
        waTabBtn.on('click', function(e) {
            e.preventDefault();
            var target = $($(this).attr('href'));
            waTabBtn.removeClass('active-btn');
            $(this).addClass('active-btn');
            waTabContainer.fadeOut(0);
            waTabContainer.removeClass('active-tab');
            $(target).fadeIn(500);
            $(target).addClass('active-tab');
        });

    }
    if (waTabBtn1.length) {
        waTabBtn1.on('click', function(e) {
            e.preventDefault();
            var target = $($(this).attr('href'));
            waTabBtn1.removeClass('active-btn');
            $(this).addClass('active-btn');
            waTabContainer1.fadeOut(0);
            waTabContainer1.removeClass('active-tab');
            $(target).fadeIn(500);
            $(target).addClass('active-tab');
        });

    }

	/*logout btn on mobile*/
	  var newWindowWidth = $(window).width();
	
	 if (newWindowWidth < 768){
          $(".u_icon").click(function(event){
			 
            event.preventDefault();
           });
      }
    
   /*logout btn on mobile*/


    //========================================
    // Accordion 
    //======================================== 	

    if (faqsAccordion.length) {
        faqsAccordion.accordion();
    }
    //========================================
    // LightBox / Fancybox
    //======================================== 	

    if (fancybox.length) {
        fancybox.fancybox();
    }

    //***************************************
    // Map initialization function Calling
    //****************************************

    initMap();

    //minicart.hide();
    cartPopup.on("click", function() {
        minicart.fadeToggle("fast").removeClass('shop_hide');
    });
	
	
    //***************************************
    // All Owl Carousel function Calling
    //****************************************

    owlCarouselInit();
	
       	/* ---------------------	
			Main Slider Calling
    /* --------------------- */
    if(tpBanner.length) {
        // Hone page one Revolution Slider Initialize			

    homePageSliderInit();

    }

    /*******************Price Range***************/
    if (priceShow.length) {

        var formatCurrency = function(num) {
            return (num == 0) ? '$' + num : '$' + num + 'k';
        }
       
        jsPriceSlider.slider({
            range: true,
            min: 0,
            max: 300,
            values: [0, 250],
            slide: function(event, ui) {
                $(ui.handle).attr('data-value', formatCurrency(ui.value));
                priceShow.html(formatCurrency(ui.values[0]) + "  -  " + formatCurrency(ui.values[1]));
            }
        });
    }

	/*******************Price Range on store page***************/
    if (price_show_on_store.length) {

        var formatCurrency = function(num) {
            return (num == 0) ? '$' + num : '$' + num + 'k';
        }
       
        jsPriceSlider.slider({
            range: true,
            min: 0,
            max: 300,
            values: [0, 250],
            slide: function(event, ui) {
                $(ui.handle).attr('data-value', formatCurrency(ui.value));
                priceShow.html(formatCurrency(ui.values[0]) + "  -  " + formatCurrency(ui.values[1]));
            }
        });
    }

	
    /*****************Product Popup*****************/

    off_tag2.on('click', function() {
        bodys.addClass('modal-open');
        bodys.css("padding-right", 0);
        quickView.fadeIn(400);
        modalBackdrop.fadeIn(400);
        return false;
    });

    // CLOSE MODEL 
    closeModal.on('click', function() {
        quickView.fadeOut(400);
        bodys.removeClass('modal-open');
        modalBackdrop.fadeOut(400);
        return false;
    });

    /*****************Quick view*****************/
    /*set image on thumb image click to display image*/
	
	
   /* thumbs.click(function(event) {
		event.preventDefault();
		alert("hi");
      //  var src = $(this).attr("href");
        //dp.attr("src", src);
    });
	*/
	
	$(".pro_single_thumb").on("click",function(){
		
		event.preventDefault();
		
		var arrrow_no=parseInt($(this).attr("thumb-no"));
		
		var next_img_src=$(this).attr("src");
		
		 dp.attr("src", next_img_src);
		 
		 $(".zoomContainer .zoomLens").css('background-image',  'url(' + next_img_src + ')');
		 $(".right-arr").attr("arr-no",arrrow_no);
		 $(".left-arr").attr("arr-no",arrrow_no);
		
	});

	
	/*set image on arrow click*/
	$(".right-arr").on("click",function(){
		event.preventDefault();
		var arr_no = parseInt($(this).attr("arr-no"));
		arr_no=arr_no+1;
         var next_img_src=$(".icon-images").find(".thumb_img"+arr_no).attr("src");
		 
		 if(next_img_src!=undefined){
			 
		   dp.attr("src", next_img_src);
		 
		   $(".zoomContainer .zoomLens").css('background-image',  'url(' + next_img_src + ')');
		   $(this).attr("arr-no",arr_no);
		   $(".left-arr").attr("arr-no",arr_no);
		   
		 }else{
			 $(this).attr("arr-no",1);
			 $('.left-arr').attr("arr-no",1);
			  var next_img_src=$(".icon-images").find(".thumb_img1").attr("src");
			  
			   dp.attr("src", next_img_src);
		 
		   $(".zoomContainer .zoomLens").css('background-image',  'url(' + next_img_src + ')');
		 }
	});
	
	
	/*set image on arrow click*/
	$(".left-arr").on("click",function(){
		event.preventDefault();
		var arr_no = parseInt($(this).attr("arr-no"));
		arr_no=arr_no-1;
         var next_img_src=$(".icon-images").find(".thumb_img"+arr_no).attr("src");
		 
		 if(next_img_src!=undefined){
			 
		  dp.attr("src", next_img_src);
		 
		   $(".zoomContainer .zoomLens").css('background-image',  'url(' + next_img_src + ')');
		   $(this).attr("arr-no",arr_no);
		   $(".right-arr").attr("arr-no",arr_no);
		 }else{
			 var total = $(".icon-images a").length;
			 $(this).attr("arr-no",total);
			 $('.right-arr').attr("arr-no",total);
			 var next_img_src=$(".icon-images").find(".thumb_img"+total).attr("src");
			 dp.attr("src", next_img_src);
		 
		   $(".zoomContainer .zoomLens").css('background-image',  'url(' + next_img_src + ')');
		 }
	});
	
	
	/*social share js*/
   var url = $("#url_to_share").val();
   var text = $("#msg_to_share").val();
    
    $("#share_btns_jsshare").jsSocials({
        url: url,
        text: text,
        showLabel: false,
        showCount: false,
        shares: ["twitter", "facebook", "pinterest"]
    });
	

	/*shop page filters */

	var shop_page_count = 0;
	var call_ajax_shop = 1;
	
	if (priceShow.length) {

        var formatCurrency = function(num) {
            return (num == 0) ? '$' + num : '$' + num;
        }
		var min_value = parseInt($("#min_price").val());
		var max_value = parseInt($("#max_price").val());
		var max_price_for_filter = max_value;
        var min_price_for_filter = min_value;
		priceShow.html(formatCurrency(min_value) + "  -  " + formatCurrency(max_value));
        jsPriceSlider.slider({
            range: true,
            min: min_value,
            max: max_value,
            values: [min_value, max_value],
            slide: function(event, ui) {
				 max_price_for_filter = parseInt(ui.values[1]);
                 min_price_for_filter = parseInt(ui.values[0]);
				 $(ui.handle).attr('data-value', ui.value);
				 priceShow.html(formatCurrency(ui.values[0]) + "  -  " + formatCurrency(ui.values[1]));
            },
            stop: function(event, ui) {
				var delivery_type = $("input[name=radio]:checked").val();
				var delivery_region = $(".show_location_regions").val();
				max_price_for_filter = parseInt(ui.values[1]);
                min_price_for_filter = parseInt(ui.values[0]);
				if(delivery_type == "" || delivery_type == null){
					delivery_type = "all";
				}		
				if(delivery_type == "international"){
					$(".show_location").show();
				}else{
					$(".show_location").hide();
				}
				var sale = "no";
				var personlized = "no";
				var gift = "no";
				if($('input.sale_features').is(':checked')){
					sale = "yes";
				}
				if($('input.personlized_features').is(':checked')){
					personlized = "yes";
				}
				if($('input.gift_features').is(':checked')){
					gift = "yes";
				}
				var order_by = $(".order_by").val();
				//price_filter
				var min_price = ui.values[0];
				if(min_price == undefined){
					min_price = $("#min_price").val();
				}
				var max_price = ui.values[1];
				if(max_price == undefined){
					max_price = $("#max_price").val();
				}
				shop_page_count = 0;
				call_ajax_shop = 1;
				var cat_id = $("#cat_id").val();
				var sub_cat_id = $("#sub_cat_id").val();
				var sub_sub_cat_id = $("#sub_sub_cat_id").val();
				var base_url=$('#base_url_input').val();
				$.ajax({
				  url: base_url+'get_products_shop',        
				  type: 'POST',
				  dataType: "html",
				  data: {delivery_type: delivery_type,delivery_region:delivery_region,sale:sale,personlized:personlized,gift:gift,order_by:order_by,min_price:min_price,max_price:max_price,cat_id:cat_id,sub_cat_id:sub_cat_id,sub_sub_cat_id:sub_sub_cat_id,shop_page_count:shop_page_count},
				  success: function(data) {
					  $("#product_main_container_to_append").html(data);
				  }
				});
            }
        });
    }
	
	
	/*shop page filters*/
	
	$(".sale_features , .personlized_features , .gift_features , .show_location_regions , .delivery , .order_by").change(function(){
		
		var delivery_type = $("input[name=radio]:checked").val();
		var delivery_region = $(".show_location_regions").val();
		if(delivery_type == "" || delivery_type == null){
			delivery_type = "all";
		}		
		if(delivery_type == "international"){
			$(".show_location").show();
		}else{
			$(".show_location").hide();
		}
		var sale = "no";
		var personlized = "no";
		var gift = "no";
		if($('input.sale_features').is(':checked')){
			sale = "yes";
		}
		if($('input.personlized_features').is(':checked')){
			personlized = "yes";
		}
		if($('input.gift_features').is(':checked')){
			gift = "yes";
		}
		var order_by = $(".order_by").val();
		//price_filter
		var min_price = min_price_for_filter;
		if(min_price == undefined){
			min_price = $("#min_price").val();
		}
		var max_price = max_price_for_filter;
		if(max_price == undefined){
			max_price = $("#max_price").val();
		}
		shop_page_count = 0;
		call_ajax_shop = 1;
		var cat_id = $("#cat_id").val();
		var sub_cat_id = $("#sub_cat_id").val();
		var sub_sub_cat_id = $("#sub_sub_cat_id").val();
		var base_url=$('#base_url_input').val();
		$.ajax({
		  url: base_url+'get_products_shop',        
		  type: 'POST',
		  dataType: "html",
		  data: {delivery_type: delivery_type,delivery_region:delivery_region,sale:sale,personlized:personlized,gift:gift,order_by:order_by,min_price:min_price,max_price:max_price,cat_id:cat_id,sub_cat_id:sub_cat_id,sub_sub_cat_id:sub_sub_cat_id,shop_page_count:shop_page_count},
		  success: function(data) {
			  $("#product_main_container_to_append").html(data);
		  }
		});
	});
	
	
	  /*shop page pagination*/
	  
	$(window).scroll(function(){
        if ($(document).scrollTop() + $(window).height() <= $(document).height() ) {
			
            if($("#shop_page_val").val() != undefined){
                loadMoreData_shop_page();    
            }
			
			if($("#store_page_val").val() != undefined){
                loadMoreData_store_page();    
            }
			
			
        }
    });
    
	/*shop page pagination function*/
    function loadMoreData_shop_page(){
		
		
        if(call_ajax_shop == 1){
			
            var delivery_type = $("input[name=radio]:checked").val();
            var delivery_region = $(".show_location_regions").val();
            if(delivery_type == "" || delivery_type == null){
                delivery_type = "all";
            }        
            if(delivery_type == "international"){
                $(".show_location").show();
            }else{
                $(".show_location").hide();
            }
            var sale = "no";
            var personlized = "no";
            var gift = "no";
            if($('input.sale_features').is(':checked')){
                sale = "yes";
            }
            if($('input.personlized_features').is(':checked')){
                personlized = "yes";
            }
            if($('input.gift_features').is(':checked')){
                gift = "yes";
            }
            var order_by = $(".order_by").val();
            //price_filter
            var min_price = min_price_for_filter;
            if(min_price == undefined){
                min_price = $("#min_price").val();
            }
            var max_price = max_price_for_filter;
            if(max_price == undefined){
                max_price = $("#max_price").val();
            }
            shop_page_count = shop_page_count+1;
            var cat_id = $("#cat_id").val();
            var sub_cat_id = $("#sub_cat_id").val();
			var sub_sub_cat_id = $("#sub_sub_cat_id").val();
            var base_url=$('#base_url_input').val();
            $.ajax({
              url: base_url+'get_products_shop',        
              type: 'POST',
              dataType: "html",
              data: {delivery_type: delivery_type,delivery_region:delivery_region,sale:sale,personlized:personlized,gift:gift,order_by:order_by,min_price:min_price,max_price:max_price,cat_id:cat_id,sub_cat_id:sub_cat_id,sub_cat_id:sub_cat_id,shop_page_count:shop_page_count},
              success: function(data) {//console.log(data);
                  if(data != "" && data != undefined && data != null && data != '<div class="col-md-12"><h2>Oh no! We didn’t find what you were looking for</h2></div>'){
                        $("#product_main_container_to_append").append(data);
                  }else{
                      call_ajax_shop = 0;
                  }                  
              }
            });
        }
    }
	
	
	
	var store_page_count = 0;
	var call_ajax_store = 1;
	
	/* store page pagination function */
	
	function loadMoreData_store_page(){
		
		
        if(call_ajax_store == 1){
	         
            var order_by = $(".order_by_store").val();
			if(order_by == null || order_by == undefined){
				order_by = "none";
			}
            //price_filter
            var min_price = min_price_for_filter;
            if(min_price == undefined){
                min_price = $("#min_price").val();
            }
            var max_price = max_price_for_filter;
            if(max_price == undefined){
                max_price = $("#max_price").val();
            }
            store_page_count = store_page_count+1;
                var store_slug = $("#store_slug").val();
				var sub_cat_slug = $("#sub_cat_slug").val();
				var cat_slug = $("#cat_slug").val();
				var base_url=$('#base_url_input').val();
            $.ajax({
                  url: base_url+'get_products_store',        
				  type: 'POST',
				  dataType: "html",
				  data: {order_by:order_by,min_price:min_price,max_price:max_price,store_slug:store_slug,cat_slug:cat_slug,sub_cat_slug:sub_cat_slug,store_page_count:store_page_count},
              success: function(data) {
                  if(data != "" && data != undefined && data != null && data != '<div class="col-md-12"><h2>Oh no! We didn’t find what you were looking for</h2></div>'){
                        $("#product_main_container_to_append").append(data);
                  }else{
                      call_ajax_store = 0;
                  }                  
              }
            });
        }
    }
	
	
	/***** store page price filter *****/

	
	if (price_show_on_store.length) {

        var formatCurrency = function(num) {
            return (num == 0) ? '$' + num : '$' + num;
        }
		var min_value = parseInt($("#min_price").val());
		var max_value = parseInt($("#max_price").val());
		var max_price_for_filter_store = max_value;
        var min_price_for_filter_store = min_value;
		price_show_on_store.html(formatCurrency(min_value) + "  -  " + formatCurrency(max_value));
        jsPriceSlider.slider({
            range: true,
            min: min_value,
            max: max_value,
            values: [min_value, max_value],
            slide: function(event, ui) {
				 max_price_for_filter_store = parseInt(ui.values[1]);
                 min_price_for_filter_store = parseInt(ui.values[0]);
				 $(ui.handle).attr('data-value', ui.value);
				 priceShow.html(formatCurrency(ui.values[0]) + "  -  " + formatCurrency(ui.values[1]));
            },
            stop: function(event, ui) {
				
				max_price_for_filter_store = parseInt(ui.values[1]);
                min_price_for_filter_store = parseInt(ui.values[0]);
				
				var order_by = $(".order_by_store").val();
				if(order_by == null || order_by == undefined){
					order_by = "none";
				}
				//price_filter
				var min_price = ui.values[0];
				if(min_price == undefined){
					min_price = $("#min_price").val();
				}
				var max_price = ui.values[1];
				if(max_price == undefined){
					max_price = $("#max_price").val();
				}
				$("#price_show_on_store").html("$"+min_price+" - "+"$"+max_price);
				store_page_count = 0;
				call_ajax_store = 1;
				var store_slug = $("#store_slug").val();
				var sub_cat_slug = $("#sub_cat_slug").val();
				var cat_slug = $("#cat_slug").val();
				var base_url=$('#base_url_input').val();
				$.ajax({
				  url: base_url+'get_products_store',        
				  type: 'POST',
				  dataType: "html",
				  data: {order_by:order_by,min_price:min_price,max_price:max_price,store_slug:store_slug,cat_slug:cat_slug,sub_cat_slug:sub_cat_slug,store_page_count:store_page_count},
				  success: function(data) {
					  $("#product_main_container_to_append").html(data);
				  }
				});
            }
        });
    }
	
	/** store page order by **/
	
	$(".order_by_store").change(function(){
		
		var order_by = $(this).val();
		
		var min_price = min_price_for_filter_store;
		if(min_price == undefined){
			min_price = $("#min_price").val();
		}
		var max_price = max_price_for_filter_store;
		if(max_price == undefined){
			max_price = $("#max_price").val();
		}
		
		store_page_count = 0;
		call_ajax_store = 1;
		var store_slug = $("#store_slug").val();
		var sub_cat_slug = $("#sub_cat_slug").val();
		var cat_slug = $("#cat_slug").val();
		var base_url=$('#base_url_input').val();
		$.ajax({
		  url: base_url+'get_products_store',        
		  type: 'POST',
		  dataType: "html",
		  data: {order_by:order_by,min_price:min_price,max_price:max_price,store_slug:store_slug,cat_slug:cat_slug,sub_cat_slug:sub_cat_slug,store_page_count:store_page_count},
		  success: function(data) {
			  $("#product_main_container_to_append").html(data);
		  }
		});
		
	});
	
	
	/*add to wish list*/
   $(".add_to_wishlist").click(function(){
		var id = $(this).attr("data-id");
		var base_url=$('#base_url_input').val();
		$.ajax({
		  url: base_url+'add_to_wishlist',        
		  type: 'POST',
		  dataType: "html",
		  data: {id},
		  success: function(data) {
			  if(data == 1){
				  toastr.success('Product is added to your wishlist.');
			  }else if(data == 2){
				  toastr.info('The Product is already added to your wishlist.');
			  }else{
				  toastr.error('Some error occured, please try again later.');
			  }
		  }
		});
	});
	


	
	
	/*add to cart from product single page*/
	
	$(".add_to_cart_btn").click(function(){
		
		var product_type = $("#product_type").val();
		
		var custom_text = "";
		
		var is_customizable = $("#is_customizable").val();
		
		var custom_txt_price = $("#custom_txt_price").val();
		
		if(is_customizable==1){
			
			$(".custom_text").each(function(e){
				
				var a=$(this).val();
				
				var label=$(this).attr("label-data");
				
				if(a== undefined || a==""){
					custom_text = custom_text+""+label+"##~";
				}else{
					custom_text = custom_text+""+label+"##"+a+"~";
				}
			});
			
			custom_text = custom_text.replace(/(^~)|(~$)/g, "");
			
	    }
	  
		var is_user_logged_in = $("#is_user_logged_in").val();
		var prd_id = $("#prd_id").val();
		var quantity = parseInt($("#quantity").val());
		var quantity_remaining = parseInt($("#quantity_remaining").val());
		var sale_price = $("#price").attr('data-val');
		var flag = true;
		var variation_json = {};
		
		
		if(product_type == 2){  // 2 = variable and 1 = single
			$(".select_variations").each(function() {
				
				var parent_this = this;
				var variation_name = $(parent_this).attr("data-variation-name");
				var field_type = $(parent_this).attr("data-field-type");
				var variation_value = "";
				
				
				if(field_type == "checkbox"){
					$("input[type=radio]",parent_this).each(function(){
						
						if($(this).is(':checked')){
							variation_value = $(this).val();
						}
					});
					if(variation_value == ""){
						toastr.error('Please select '+variation_name+' variation.');
						flag = false;
					}else{
						variation_json[variation_name] = variation_value;
					}
				}
				
				if(field_type == "radio"){
					$("input[type=radio]",parent_this).each(function(){
						
						if($(this).is(':checked')){
							variation_value = $(this).val();
						}
					});
					
					//alert(variation_value);
					
					if(variation_value == ""){
						toastr.error('Please select '+variation_name+' variation.');
						flag = false;
					}else{
						variation_json[variation_name] = variation_value;
					}
				}
				
				if(field_type == "dropdown"){
					variation_value = $("select",parent_this).val();
					if(variation_value == ""){
						toastr.error('Please select '+variation_name+' variation.');
						flag = false;
					}else{
						variation_json[variation_name] = variation_value;
					}
				}
			});
		}	
		if(quantity < 1){
			toastr.error('Please enter quantity.');
			flag = false;
		}	
		if(quantity > quantity_remaining){
			toastr.error('You can not add item into cart more then available quantity.');
			flag = false;
		}
		if(flag){
			if(is_user_logged_in == 1){
				var base_url=$('#base_url_input').val();
				$.ajax({
					  url: base_url+'add_product_to_cart',        
					  type: 'POST',
					  dataType: "text",
					  data: {prd_id:prd_id,sale_price:sale_price,is_customizable:is_customizable,custom_text:custom_text,product_type:product_type,variation_json:JSON.stringify(variation_json),quantity:quantity},
					  success: function(data) {
						  toastr.success('Product added to cart.');
						  if(data == "200"){
							  var current_cart_count = parseInt($("#cart_count_number").text());
							  var new_cout = current_cart_count + 1;
							  $("#cart_count_number").text(new_cout)
						  }
					  }
				});
			}else{
				var cookie_data = decodeURIComponent(document.cookie);

				if(cookie_data != "" && cookie_data != undefined){
					console.log("A");
					var prod_arr=[];
					while (cookie_data.charAt(0) == ' ') {
						cookie_data = cookie_data.substring(1);
					}
					if (cookie_data.indexOf("cart_items=") == 0) {
						
						//console.log(cookie_data.substring("cart_items=".length, cookie_data.length));
						var cookie_item_arr = cookie_data.substring("cart_items=".length, cookie_data.length);console.log("B");
						prod_arr = JSON.parse(cookie_item_arr);
					}
				}else{
					var prod_arr = [];
				}
				
				var push_in_array = 1;
				var single_prod_data = {prd_id:prd_id,sale_price:sale_price,is_customizable:is_customizable,custom_text:custom_text,product_type:product_type,variation_json:variation_json,quantity:quantity};
				for(var i = 0;i<prod_arr.length;i++){
					var saved_prd_id = prod_arr[i].prd_id;
					var saved_variation_str = JSON.stringify(prod_arr[i].variation_json);
					var crr_prd_id = prd_id;
					var variation_jsonsss = JSON.stringify(variation_json);
					console.log(saved_prd_id+" == "+crr_prd_id+" && "+ saved_variation_str+" == "+variation_jsonsss);
					if(saved_prd_id == crr_prd_id && saved_variation_str == variation_jsonsss){
						push_in_array = 0;
					}
					//console.log(push_in_array);
				}
				//console.log(push_in_array);
				if(push_in_array == 1){
					prod_arr.push(single_prod_data);
					
					document.cookie = "cart_items="+JSON.stringify(prod_arr);
					var current_cart_count = parseInt($("#cart_count_number").text());
					var new_cout = current_cart_count + 1;
					$("#cart_count_number").text(new_cout);
				}
				
				//console.log(prod_arr);
				toastr.success('Product added to cart.');				
			}
		}
	});
	
	
	$(".allow_customize_btn").on("change",function(){
		var product_price = parseFloat($("#price").attr("data-val"));
		var custom_txt_price = parseFloat($("#custom_txt_price").val());
		if($(this).prop( "checked" )){
			$(".customization_fields_div").show();
		/*	$("#price").attr("data-val",product_price+custom_txt_price);
			var added_price=product_price+custom_txt_price;
			$("#price").text("$"+added_price);*/
		}else{
			$(".customization_fields_div").hide();
			/*$("#price").attr("data-val",product_price-custom_txt_price);
			var added_price=product_price-custom_txt_price;
			$("#price").text("$"+added_price);*/
		}
	});
	
	$(".custom_text").on("blur",function(){
		var done = 0;
		
		var product_price = parseFloat($("#price").attr("data-val"));
		var custom_txt_price = parseFloat($("#custom_txt_price").val());
		var check_is_checked=0;
		 
		$(".custom_text").each(function(){
			
			var check_val=$(this).val();
		   
			
			if(check_val != "" && check_val != undefined){
				if(done == 0){
					if($("#price_added_cstm").val() != 1){
						$("#price_added_cstm").val(1);
						$("#price").attr("data-val",product_price+custom_txt_price);
						var added_price=product_price+custom_txt_price;
						$("#price").text("$"+added_price);
						check_is_checked=1;
					}
					done = 1;
				}
								
			}else {
				if(done == 0){
					if($("#price_added_cstm").val() == 1){
						$("#price_added_cstm").val(0);
						$("#price").attr("data-val",product_price-custom_txt_price);
						var added_price=product_price-custom_txt_price;
						$("#price").text("$"+added_price);
						done = 1;
					} 
				}
			}
		});
	
		//console.log("checked val "+check_is_checked);	
		
	});
	
	
	/*add to cart variable product*/
	
	
	$("body").on("click",".add_variant_pro_cart",function(){
		
		var product_slug=$(this).attr("data-slug");
		
		var base_url=$('#base_url_input').val();
		 swal({
           title: "Choices, choices..",
           text: "This product has some variations which need to be defined before you can add to cart.",
           type: "warning",
           showCancelButton: true,
           confirmButtonClass: "btn-warning",
           confirmButtonText: "Continue",
           closeOnConfirm: false
      },
      function(){
       
                  window.location.href=base_url+"product_datail?p="+product_slug;
              
          });
	});
	
	
	
	/*add to cart from other place single product */
	
	$("body").on("click",".add_to_cart_other",function(){
		
		
		var shopping_cart_page = $("#shopping_cart_page").val();
		
		var is_user_logged_in = $("#is_user_logged_in").val();
		var prd_id = $(this).attr('data-id');
		var sale_price = $(this).attr('data-sale-price');
		var is_customizable = $(this).attr('data-is-customize');
		var variation_json = {};
		var custom_text="";
		var product_type=1;
		
		
		if(is_user_logged_in == 1){
				var base_url=$('#base_url_input').val();
				$.ajax({
					  url: base_url+'add_product_to_cart',        
					  type: 'POST',
					  dataType: "text",
					  data: {prd_id:prd_id,sale_price:sale_price,is_customizable:is_customizable,custom_text:custom_text,product_type:product_type,variation_json:JSON.stringify(variation_json),quantity:1},
					  success: function(data) {
						  
						  toastr.success('Product added to cart.');
						  if(data == "200"){
							  var current_cart_count = parseInt($("#cart_count_number").text());
							  var new_cout = current_cart_count + 1;
							  $("#cart_count_number").text(new_cout);
							  
							  if(shopping_cart_page!= undefined){
								 if(shopping_cart_page!= undefined){
					
					                 setTimeout(function(){
                                         location. reload(true);
                                     }, 1000); 
					
					
				                  }
							  }
							  
						  }
					  }
				});
			}else{
				
				var cookie_data = decodeURIComponent(document.cookie);
				
				if(cookie_data != "" && cookie_data != undefined){
					var prod_arr=[];
					while (cookie_data.charAt(0) == ' ') {
						cookie_data = cookie_data.substring(1);
					}
					if (cookie_data.indexOf("cart_items=") == 0) {
						
						var cookie_item_arr = cookie_data.substring("cart_items=".length, cookie_data.length);
						prod_arr = JSON.parse(cookie_item_arr);
					}
				}else{
					var prod_arr = [];
				}
				
				var push_in_array = 1;
				var single_prod_data = {prd_id:prd_id,sale_price:sale_price,is_customizable:is_customizable,custom_text:custom_text,product_type:product_type,variation_json:variation_json,quantity:1};
				for(var i = 0;i<prod_arr.length;i++){
					var saved_prd_id = prod_arr[i].prd_id;
					var saved_variation_str = JSON.stringify(prod_arr[i].variation_json);
					var crr_prd_id = prd_id;
					var variation_jsonsss = JSON.stringify(variation_json);
					console.log(saved_prd_id+" == "+crr_prd_id+" && "+ saved_variation_str+" == "+variation_jsonsss);
					if(saved_prd_id == crr_prd_id && saved_variation_str == variation_jsonsss){
						push_in_array = 0;
					}
					
				}
				
				if(push_in_array == 1){
					prod_arr.push(single_prod_data);
					console.log(prod_arr);
					document.cookie = "cart_items="+JSON.stringify(prod_arr);
					var current_cart_count = parseInt($("#cart_count_number").text());
					var new_cout = current_cart_count + 1;
					$("#cart_count_number").text(new_cout);
				}
				
				toastr.success('Product added to cart.');	

                if(shopping_cart_page!= undefined){
					
					 setTimeout(function(){
                          location. reload(true);
                       }, 1000); 
					
					
				 }

				
			}
	});
	
	
	/*add to cart from wish list single btn*/
	
	$(".add_to_cart_btn_wishlist_single").click(function(){
		
		var this_ref = this;
		var product_type = $(this).parent("td").parent("tr").attr("data-type");
		var is_customizable = $(this).parent("td").parent("tr").attr("data_is_customizable");
		var customization_data = "";
		var prd_id = $(this).attr("data-id");
		var quantity = $(this).parent("td").prev("td").children(".quantity_field").val();
		var sale_price = $(this).parent("td").parent("tr").attr("data-pr");
		var flag = true;
		var variation_json = {};	
		if(quantity < 1){
			toastr.error('Please enter quantity.');
			flag = false;
		}	
		if(flag){
			var base_url=$('#base_url_input').val();
			$.ajax({
				  url: base_url+'add_product_to_cart',        
				  type: 'POST',
				  dataType: "text",
				  data: {prd_id:prd_id,sale_price:sale_price,is_customizable:is_customizable,custom_text:customization_data,product_type:product_type,variation_json:JSON.stringify(variation_json),quantity:quantity},
				  success: function(data) {
					  toastr.success('Product added to cart.');
					  $(this_ref).parent("td").next("td").children("a.remove_wishlist_temp").trigger("click");
					  var current_cart_count = parseInt($("#cart_count_number").text());
					  var new_cout = current_cart_count + 1;
					  $("#cart_count_number").text(new_cout);
					  
					  
					   $(this_ref).parent("td").parent("tr").attr("data-in-cart",1);
					  
					  
					  $(this_ref).text('ADDED IN CART');
					  $(this_ref).removeClass('add_to_cart_btn_wishlist_single');
					  $(this_ref).addClass('added_in_cart');
					  
				  }
			});			
		}
	});
	
	
	/*add all to cart from  wish list*/
	
	$(".add_all_cart").click(function(){
		
		var arr = [];
		
		var is_variable=0;
		
		var click_time=parseInt($(this).attr("data-click-time"));
		
		var flag = true;
		
		$(".table_body_wishlist_table tr").each(function(i){
			
			if($(this).attr("data-type") == 1){
				
				var quantity = $(this).children("td").find(".quantity_field").val();
				if(quantity < 1){
					flag = false
				}
				
				var quantity_remain = $(this).children("td").find(".quantity_remain_field").val();
				
				var check_in_cart=parseInt($(this).attr("data-in-cart"));
				
				
				if(quantity_remain > 0 && check_in_cart == 0){
					
					var obj = {index:i+1,prd_id:$(this).attr("data-id"),is_customizable:$(this).attr("data_is_customizable"),sale_price:$(this).attr("data-pr"),product_type:$(this).attr("data-type"),quantity:quantity};
				    arr.push(obj);
				}
				
			}else{
				
				is_variable=1
			}
		});
		
		  if(is_variable==1){
		     $(this).attr("data-click-time","2");
		   }else{
			   $(this).attr("data-click-time","1");
		   }
		   
		if(flag){
			
			var base_url=$('#base_url_input').val();
			var new_cout = 0;
			
			if(arr.length>0){
				
				$.ajax({
					  url: base_url+'add_multiple_product_to_cart',        
					  type: 'POST',
					  dataType: "text",
					  data: {json_str:JSON.stringify(arr)},
					  success: function(data) {
						  
						  for(var i = 0;i<arr.length;i++){
							  var child = arr[i].index;
							 $(".table_body_wishlist_table tr:nth-child("+child+")").children("td").children("a.remove_wishlist_temp").trigger("click"); 
							 new_cout++;
						  }
						  
						  var current_cart_count = parseInt($("#cart_count_number").text());
						  new_cout = current_cart_count + new_cout;
						  $("#cart_count_number").text(new_cout);
						  
							
						   toastr.success('Products added to cart.');
											  
					  }
				});	

		      }
             
			  if(click_time==2){
				  
				    toastr.info('This product has some variations which need to be defined before you can add to cart.');
			   }
			
		}else{
			toastr.error('Please enter quantity.');
		}
		
		
		
	});
	
	
	
	/*remove from wish list temp*/
	$(".remove_wishlist_temp").click(function(){
		var id = $(this).attr("data-id");
		var thisss = $(this);
		var base_url=$('#base_url_input').val();
		
		$.ajax({
		  url: base_url+'remove_from_wishlist',        
		  type: 'POST',
		  data: {id},
		  success: function(data) {
			  thisss.parent().parent().remove();
			  if($(".prod_tr").length <= 0){
				  $(".add_all_div").remove();
				  $(".table_body_wishlist_table").html('<tr><td colspan="6">Data Not found</td></tr>');
			  }
		 
			  
		  }
		});
		
	});
	
	/*remove from wish list*/
	$(".remove_from_wishlist").click(function(){
		var id = $(this).attr("data-id");
		var thisss = $(this);
		var base_url=$('#base_url_input').val();
		
		swal({
        title: "Are you sure ?",
        text: "You want to remove this item from wish list",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes",
        closeOnConfirm: true
      },
      function(){
		
		$.ajax({
		  url: base_url+'remove_from_wishlist',        
		  type: 'POST',
		  data: {id},
		  success: function(data) {
			  thisss.parent().parent().remove();
			  if($(".prod_tr").length <= 0){
				  $(".add_all_div").remove();
				  $(".table_body_wishlist_table").html('<tr><td colspan="6">Data Not found</td></tr>');
			  }
			  
			  //swal("Submitted", "Item removed from wish list.", "success");
             
			  toastr.success('Item removed from wish list.');
		  }
		  });
		});
	});
	
	
	
	/*change quantity from cart page*/
	
	
	$(".quantity_field").change(function(e){
		
		var quantity = parseFloat($(this).val());
		var row_reff = $(this).parent("td").parent("tr");
		var shp_price = parseFloat(row_reff.children("td").find(".item_ship_price").attr("item_ship_price"));
		var single_prd_price = parseFloat(row_reff.children("td").find(".item_price").attr("item_price"));
		var total_price_old = parseFloat(row_reff.children("td").find(".item_total_price").attr("item_total_price"));
		var gft_price = 0;
		var is_gft_available = parseFloat(row_reff.children("td.gift_wrap_td").attr("is_gift_wrap"));
		var cart_full_total = parseFloat($("#cart_full_total").attr("cart_full_total"));
		var cart_ship_total = parseFloat($("#cart_ship_total").attr("cart_ship_total"));
		var cart_sub_total = parseFloat($("#cart_sub_total").attr("cart_sub_total"));
		if(is_gft_available == 1){
			if(row_reff.children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").is(':checked')){
				
				
				gft_price = parseFloat(row_reff.children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").val());
				
				gft_price=gft_price*quantity;
				
			}
		}
		
		var promo_code_id =row_reff.attr('code_id');
		var promo_code_value =row_reff.attr('code_value');
		
		if(promo_code_value && promo_code_id){
			
			promo_code_value=parseInt(promo_code_value);
			
			 var discount_price=(single_prd_price*promo_code_value)/100;
			 
			 
			 single_prd_price=single_prd_price-discount_price ;
			
		}
		
		var new_total_price = parseFloat((quantity*single_prd_price)+gft_price+(quantity*shp_price));
		cart_sub_total = 0;
		cart_ship_total = 0;
		$("tbody.cart_body tr").each(function(inde){
			var row_item_price = parseFloat($(this).find(".item_price").attr("item_price"));
			var row_shiping = parseFloat($(this).find(".item_ship_price").attr("item_ship_price"));
			var row_quantity = parseFloat($(this).find(".quantity_field").val()) ;
			var is_gft_available = parseFloat($(this).children("td.gift_wrap_td").attr("is_gift_wrap"));
			var gft_price = 0;
			if(is_gft_available == 1){
				if($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").is(':checked')){
				
					
					gft_price = parseFloat($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").val());
					
					gft_price=gft_price*row_quantity;
					
				}
			}
			var row_total = row_item_price*row_quantity+gft_price+(row_shiping*row_quantity);
			cart_sub_total = cart_sub_total+(row_total - (row_shiping*row_quantity));
			cart_ship_total = cart_ship_total + (row_shiping*row_quantity);
		});		
		
		new_total_price=new_total_price.toFixed(2);
		
		row_reff.children("td").find(".item_total_price").attr("item_total_price",new_total_price);
		row_reff.children("td").find(".item_total_price").text("$"+new_total_price);
		cart_full_total = cart_sub_total + cart_ship_total;
		
		 cart_full_total =cart_full_total.toFixed(2);
		 cart_ship_total =cart_ship_total.toFixed(2);
		 cart_sub_total  =cart_sub_total.toFixed(2);
		 
		$("#cart_full_total").attr("cart_full_total",cart_full_total);
		$("#cart_ship_total").attr("cart_ship_total",cart_ship_total);
		$("#cart_sub_total").attr("cart_sub_total",cart_sub_total);
		$("#cart_full_total").text("$"+cart_full_total);
		$("#cart_ship_total").text("$"+cart_ship_total);
		$("#cart_sub_total").text("$"+cart_sub_total);
	});
	
	
	
	/*gift wrap check box option on shopping cart page*/
	
	$(".item_ship_price").change(function(){
		
		
		var row_reff = $(this).parent("td").parent("tr");
		
		var quantity = parseInt(row_reff.children("td").find(".quantity_field").val());
		
		var single_prd_price = parseFloat(row_reff.children("td").find(".item_price").attr("item_price"));
		
		var is_gft_available = parseFloat(row_reff.children("td.gift_wrap_td").attr("is_gift_wrap"));
		
	
	
		var shipping_price_type_arr = $(this).val().split("#");
		
		var new_shipping_price = parseFloat(shipping_price_type_arr[0]);
		
		
		
		if(shipping_price_type_arr[1] == 's'){
			$(this).attr("data_shipping_type","standard");
		}else if(shipping_price_type_arr[1] == 'e'){
			$(this).attr("data_shipping_type","express");
		}else if(shipping_price_type_arr[1] == 'i'){
			$(this).attr("data_shipping_type","international");
		}
	
		
		$(this).attr("item_ship_price",new_shipping_price.toFixed(2));
		
		
		var gft_price = 0;
		
		if(row_reff.children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").is(':checked')){
				
				
				gft_price = parseFloat(row_reff.children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").val());
				
				gft_price=gft_price*quantity;
				
			}
			
		
		
		var item_total_price = (single_prd_price*quantity)+ (new_shipping_price*quantity) + gft_price ;
		
		item_total_price =item_total_price.toFixed(2);
		
		row_reff.children("td").find(".item_total_price").attr("item_total_price",item_total_price);
		row_reff.children("td").find(".item_total_price").text("$"+item_total_price);
		
		
		
		var cart_sub_total = 0;
		var cart_ship_total = 0;
		var cart_full_total=0;
		
		
		$("tbody.cart_body tr").each(function(inde){
			
			var row_item_price = parseFloat($(this).find(".item_price").attr("item_price"));
			var row_shiping = parseFloat($(this).find(".item_ship_price").attr("item_ship_price"));
			var row_quantity = parseFloat($(this).find(".quantity_field").val()) ;
			var is_gft_available = parseFloat($(this).children("td.gift_wrap_td").attr("is_gift_wrap"));
			var gft_price = 0;
			if(is_gft_available == 1){
				if($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").is(':checked')){
				
					
					gft_price = parseFloat($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").val());
					
					gft_price=gft_price*row_quantity;
					
				}
			}
		
			var row_total = row_item_price*row_quantity+gft_price+(row_shiping*row_quantity);
			cart_sub_total = cart_sub_total+(row_total - (row_shiping*row_quantity));
			cart_ship_total = cart_ship_total + (row_shiping*row_quantity);
		});	
		
		cart_full_total = cart_sub_total+ cart_ship_total;
	
		
		$("#cart_full_total").attr("cart_full_total",cart_full_total.toFixed(2));
		$("#cart_ship_total").attr("cart_ship_total",cart_ship_total.toFixed(2));
		$("#cart_sub_total").attr("cart_sub_total",cart_sub_total.toFixed(2));
		$("#cart_full_total").text("$"+cart_full_total.toFixed(2));
		$("#cart_ship_total").text("$"+cart_ship_total.toFixed(2));
	    $("#cart_sub_total").text("$"+cart_sub_total.toFixed(2));
		
		
	});
	
	$(".gift_wrap_cb").change(function(){
		
		var gft_price = 0;
		
		var row_reff = $(this).parent("div").parent("td").parent("tr");
		
		var quantity = parseInt(row_reff.children("td").find(".quantity_field").val());
		
		var single_prd_price = parseFloat(row_reff.children("td").find(".item_price").attr("item_price"));
		
		var shp_price = parseFloat(row_reff.children("td").find(".item_ship_price").attr("item_ship_price"));
		
	
		
		if($(this).is(":checked")){
			
			  gft_price = parseFloat($(this).val())
		}
		
		var item_total_price = (single_prd_price*quantity)+ (shp_price*quantity) + (gft_price*quantity) ;
		
		item_total_price =item_total_price.toFixed(2);
		
		row_reff.children("td").find(".item_total_price").attr("item_total_price",item_total_price);
		row_reff.children("td").find(".item_total_price").text("$"+item_total_price);
		
	    var cart_sub_total = 0;
		var cart_ship_total = 0;
		var cart_full_total=0;
		
		
		$("tbody.cart_body tr").each(function(inde){
			
			var row_item_price = parseFloat($(this).find(".item_price").attr("item_price"));
			var row_shiping = parseFloat($(this).find(".item_ship_price").attr("item_ship_price"));
			var row_quantity = parseFloat($(this).find(".quantity_field").val()) ;
			var is_gft_available = parseFloat($(this).children("td.gift_wrap_td").attr("is_gift_wrap"));
			var gft_price = 0;
			
			if(is_gft_available == 1){
				if($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").is(':checked')){
				
					
					gft_price = parseFloat($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").val());
					
					gft_price=gft_price*row_quantity;
					
				}
			}
		
			var row_total = row_item_price*row_quantity+gft_price+(row_shiping*row_quantity);
			cart_sub_total = cart_sub_total+(row_total - (row_shiping*row_quantity));
			cart_ship_total = cart_ship_total + (row_shiping*row_quantity);
		});	
		
		cart_full_total = cart_sub_total+ cart_ship_total;
		
		$("#cart_full_total").attr("cart_full_total",cart_full_total.toFixed(2));
		$("#cart_ship_total").attr("cart_ship_total",cart_ship_total.toFixed(2));
		$("#cart_sub_total").attr("cart_sub_total",cart_sub_total.toFixed(2));
		$("#cart_full_total").text("$"+cart_full_total.toFixed(2));
		$("#cart_ship_total").text("$"+cart_ship_total.toFixed(2));
		$("#cart_sub_total").text("$"+cart_sub_total.toFixed(2));
	});	
	
	
	/*add special request in checkout */
	
	var thiss_for_special_request = "";
	
	$(".add_request_btn").click(function(){
		thiss_for_special_request = $(this);
		var req_txt=thiss_for_special_request.parent("td").parent("tr").attr("add_request");
		$(".wv_request_textarea").val(req_txt);
	});
	
	$(".save_request").click(function(){
		
		var req_txt = $(".wv_request_textarea").val();
		
		if(req_txt != ""){
			
		thiss_for_special_request.parent("td").parent("tr").attr("add_request",req_txt);
		 $('#myModal').modal('toggle');
		 
		 swal("Saved","Request saved successfully", "success");
		 
		 $(thiss_for_special_request).text("Added");
		 
		 
		 //toastr.success('request saved successfully');
			
		}else{
			
			toastr.error('please enter special request');
			
		}
		
	});
	
	/*remove special request*/
	
	$(".cancel_request").click(function(){
		
		$(this).parent(".modal-body").children('.wv_request_textarea').val("");
		thiss_for_special_request.parent("td").parent("tr").attr("add_request","");
		 
		 swal("Canceled","Request canceled successfully", "success");
		 
		 $(thiss_for_special_request).text("Add");
		 
	});
	
	
	
	/*return policy pop up on cart page*/
	 
	 $('.openPopupReturnPolicy').on('click',function(){
		
        var dataURL = $(this).attr('data-href');
        $('.modal-body1').load(dataURL,function(){
            $('#return_policy_pop_up').modal({show:true});
        });
    });  
	
	/*delivery info pop up on cart page*/
	 
	 $('.openPopupDeliveryInfo').on('click',function(){
		
        var dataURL = $(this).attr('data-href');
        $('.modal-body2').load(dataURL,function(){
            $('#delivery_info_pop_up').modal({show:true});
        });
    });  
	
	/*$(".modal").on("hidden.bs.modal", function(){
        $(".modal-body").html("");
     }); */
	
	
	/*remove product from cart */
	
	$('body').on('keyup', '.autoHeightTextarea', function () {
		if(this.scrollHeight <= 84){
			$(this).css('height', '42px');
		}else{
			$(this).css('height', 'auto');	
		}        
        $(this).height(this.scrollHeight);
    });
	var allow_to_remove = 1;
	$(".remove_prd_from_cart_page").click(function(){
		if(allow_to_remove == 1){
			allow_to_remove = 0;
			var is_user_logged_in = $("#is_user_logged_in").val();
			if(is_user_logged_in == 1){
				
				var base_url=$('#base_url_input').val();
				var row = $(this).parent("td").parent("tr");
				var cart_item_id = row.attr("cart_item_id");
				$.ajax({
					  url: base_url+'remove_prd_from_cart_page',        
					  type: 'POST',
					  dataType: "text",
					  data: {cart_item_id:cart_item_id},
					  success: function(data) {
						  
						  var cart_count= $("#cart_count_number").text();
						
						  var cart_count= parseInt(cart_count);
						 
						  cart_count=cart_count-1;
						  if(cart_count < 0){
							  cart_count = 0;
						  }  	
						  $("#cart_count_number").text(cart_count);
						  
						   toastr.success('Product removed from cart');
						  
						   setTimeout(function(){
							  location.reload(true);
						   }, 1000); 
					  }
				});
			}else{
				
				var row = $(this).parent("td").parent("tr");
				var pid = row.attr("pid");
				var cart_item_id = row.attr("cart_item_id");
				var variation_data = row.attr("variation_data");
				var total_price = parseFloat(row.children("td").children(".item_total_price").attr("item_total_price"));
				var ship_price = parseFloat(row.children("td").children(".item_ship_price").attr("item_ship_price"));
				var cookie_data_arr = [];
				var new_cookie_data_arr = [];
				var cookie_data = decodeURIComponent(document.cookie);
				
				if(cookie_data != "" && cookie_data != undefined){
					while (cookie_data.charAt(0) == ' ') {
						cookie_data = cookie_data.substring(1);
					}
					if (cookie_data.indexOf("cart_items=") == 0) {
						var cookie_item_arr = cookie_data.substring("cart_items=".length, cookie_data.length);
						cookie_data_arr = JSON.parse(cookie_item_arr);
					}
				}
				var j = 0;
				
				
				
				for(var i = 0;i<cookie_data_arr.length;i++){
					
					var saved_prd_id = cookie_data_arr[i].prd_id;
					var saved_variation_str = JSON.stringify(cookie_data_arr[i].variation_json);
					
					//console.log(saved_prd_id+" = "+pid+" && "+saved_variation_str+" == "+variation_data);
					
					if(saved_prd_id == pid && saved_variation_str == variation_data){
						
					}else{
						
						new_cookie_data_arr.push(cookie_data_arr[i]);
					}
				}
				if(new_cookie_data_arr.length > 0){
					document.cookie = "cart_items="+JSON.stringify(new_cookie_data_arr);
				}else{
					document.cookie = "cart_items=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
					
				}
				
				 var cart_count= $("#cart_count_number").text();
						  
						  var cart_count= parseInt(cart_count);
						 
						  cart_count=cart_count-1;
						  if(cart_count < 0){
							  cart_count = 0;
						  }  	
						  $("#cart_count_number").text(cart_count);
						  toastr.success('Product removed from cart');
						  
						  setTimeout(function(){
							  location. reload(true);
						   }, 1000); 
						  
			}
		}
	});
	
	
	/*apply coupon code*/
	
	$(".apply_coupon_code").click(function(){
		
		var is_user_login = $("#is_user_logged_in").val();
		
		if(is_user_login == 1){
			
			var code = $(".cpn_code_fld").val();
			
			if(code != ''){
				
				var store_id_str = "";
				
				$(".cart_body tr").each(function(){
					
					store_id_str = store_id_str+""+$(this).attr("store_id")+",";
					
				});
				
				store_id_str = store_id_str.replace(/,\s*$/, "");
		
				
				
				var base_url=$('#base_url_input').val();
				
				$.ajax({
					  url: base_url+'get_promocode_details_apply',        
					  type: 'POST',
					  
					  data: {code:code,store_id_str:store_id_str},
					  success: function(data) {
						 
							if(data.length <= 0){
								toastr.error('Invalid coupon code.');	
							}else{
								$(".cart_body tr").each(function(ii){
									var crr_row_store_id = $(this).attr("store_id");
									//data = JSON.parse(data);
									for(var i = 0;i<data.length;i++){
										//console.log(data[i].store_id+" == "+crr_row_store_id);
										if(data[i].store_id == crr_row_store_id){
											$(this).attr("code_id",data[i].id);
											$(this).attr("code_name",data[i].code);
											$(this).attr("code_value",data[i].discount_percentage);
											
											
											var shp_price = parseFloat($(this).children("td").find(".item_ship_price").attr("item_ship_price"));
											var quantity = parseFloat($(this).children("td").find(".quantity_field").val());
											var single_prd_price = parseFloat($(this).children("td").find(".item_price").attr("item_price"));
											var total_price_old = parseFloat($(this).children("td").find(".item_total_price").attr("item_total_price"));
											var gft_price = 0;
											var is_gft_available = parseFloat($(this).children("td.gift_wrap_td").attr("is_gift_wrap"));
											var cart_full_total = parseFloat($("#cart_full_total").attr("cart_full_total"));
											var cart_ship_total = parseFloat($("#cart_ship_total").attr("cart_ship_total"));
											var cart_sub_total = parseFloat($("#cart_sub_total").attr("cart_sub_total"));
											
											if(is_gft_available == 1){
												if($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").is(':checked')){
													gft_price = parseFloat($(this).children("td.gift_wrap_td").children("div").find(".gift_wrap_cb").val());
												}
											}
											
											var new_total_price = parseFloat(((quantity*single_prd_price)-((quantity*single_prd_price*data[i].discount_percentage)/100)) + gft_price + shp_price);
											new_total_price = new_total_price.toFixed(2);
											
											cart_sub_total = parseFloat(cart_sub_total) - parseFloat(total_price_old);
											cart_sub_total = parseFloat(cart_sub_total) + parseFloat(new_total_price);
											$(this).children("td").find(".item_total_price").attr("item_total_price",new_total_price);
											$(this).children("td").find(".item_total_price").text("$"+new_total_price);
											cart_full_total = parseFloat(cart_sub_total) + parseFloat(cart_ship_total);
											
											
											cart_full_total=cart_full_total.toFixed(2);
											cart_ship_total=cart_ship_total.toFixed(2);
											cart_sub_total=cart_sub_total.toFixed(2);
											
											$("#cart_full_total").attr("cart_full_total",cart_full_total);
											$("#cart_ship_total").attr("cart_ship_total",cart_ship_total);
											$("#cart_sub_total").attr("cart_sub_total",cart_sub_total);
											$("#cart_full_total").text("$"+cart_full_total);
											$("#cart_ship_total").text("$"+cart_ship_total);
											$("#cart_sub_total").text("$"+cart_sub_total);
											
											$(".cpn_code_fld").attr("readonly",true);
											$(".apply_coupon_code").hide();
											$(".remove_code").show();
										}
									}
								});
								
								console.log("coupon code applied");
								
								toastr.success('Discount code applied successfully');
							}
					  }
				});
			}else{
				toastr.error('Please enter coupon code.');	
			}			
		}else{
			toastr.error('Please login to apply coupon code.');	
		}
	});
	
	
	/*remove coupon code*/
	$('.remove_code').click(function(){
		
		
	});
	
	
	
	
	/*checkout proceed btn from shopping cart page  */
	

	
	$(".checkout_proceed").click(function(){
		var final_json = [];
		var flag = true;
		$(".cart_body tr").each(function(){
			var pid = $(this).attr("pid");
			var store_id = $(this).attr("store_id");
			var ship_region = $(this).attr("overseas_ship_regions");
			var cart_item_id = $(this).attr("cart_item_id");
			var customization_data = $(this).attr("customization_data");
			var is_customizable = $(this).attr("is_customizable");
			var variation_data = $(this).attr("variation_data");
			var is_variable = $(this).attr("is_variable");
			var add_request = $(this).attr("add_request");
			var quantity_remaining = parseInt($(this).attr("quantity_remaining"));
			var code_id = $(this).attr("code_id");
			var code_name = $(this).attr("code_name");
			var code_value = $(this).attr("code_value");
			var minimum_purcahse_amt_for_free_ship = $(this).attr("minimum_purcahse_amt_for_free_ship");
			var single_item_price = $(this).children("td").find(".item_price").attr("item_price");
			var quantity = parseInt($(this).children("td").find(".quantity_field").val());
			var item_ship_price = $(this).children("td").find(".item_ship_price").attr("item_ship_price");
			var item_ship_type = $(this).children("td").find(".item_ship_price").attr("data_shipping_type");
			var item_total_price = $(this).children("td").find(".item_total_price").attr("item_total_price");
			var is_gift_wrap = 0;
			var gift_wrap_price = 0;			
			var item_name = $(this).children("td").find(".item_name").text();
			
			if(quantity_remaining >= quantity){
				if($(this).children("td").children("div").find(".gift_wrap_cb").is(":checked")){
					is_gift_wrap = 1;
					gift_wrap_price = $(this).children("td").children("div").find(".gift_wrap_cb").val(); 
				}
				if(quantity_remaining > 0){
					var obj = {pid:pid,item_name:item_name,ship_region:ship_region,store_id:store_id,cart_item_id:cart_item_id,customization_data:customization_data,is_customizable:is_customizable,variation_data:variation_data,is_variable:is_variable,add_request:add_request,quantity_remaining:quantity_remaining,code_id:code_id,code_name:code_name,code_value:code_value,minimum_purcahse_amt_for_free_ship:minimum_purcahse_amt_for_free_ship,single_item_price:single_item_price,quantity:quantity,item_ship_price:item_ship_price,item_ship_type:item_ship_type,item_total_price:item_total_price,is_gift_wrap:is_gift_wrap,gift_wrap_price:gift_wrap_price};
					final_json.push(obj);
				}
			}else{
				flag = false;
			}			
		});
		if(final_json.length > 0){
			if(flag){
				var total_international = 0;
				$(".item_ship_price").each(function(){
					if($(this).attr("data_shipping_type") == "international"){
						total_international = total_international + 1;
					}
				});
				
				var cart_ship_total = parseFloat($("#cart_ship_total").attr("cart_ship_total"));
				var cart_full_total = parseFloat($("#cart_full_total").attr("cart_full_total"));
				
				for(var i = 0;i<final_json.length;i++){
					
					var minimum_purcahse_amt_for_free_ship = final_json[i].minimum_purcahse_amt_for_free_ship;
					
					var total_store_amount = undefined;
					for(var j = 0;j<final_json.length;j++){
						if(i!=j && final_json[i].store_id == final_json[j].store_id){
							if(final_json[i].item_ship_type == final_json[j].item_ship_type && final_json[j].item_ship_type == "standard"){
								if(total_store_amount == undefined)total_store_amount=parseFloat(final_json[i].single_item_price)*parseFloat(final_json[i].quantity);
								total_store_amount=parseFloat(total_store_amount)+(parseFloat(final_json[j].single_item_price)*parseFloat(final_json[j].quantity));
							}
						}
					}
					if(total_store_amount == undefined){
						if(final_json[i].item_ship_type == "standard"){
							total_store_amount = parseFloat(final_json[i].single_item_price)*parseFloat(final_json[i].quantity);
						}
					}
					if(total_store_amount >= minimum_purcahse_amt_for_free_ship && minimum_purcahse_amt_for_free_ship > 0){
						
						var old_ship_price = final_json[i].item_ship_price;
						cart_ship_total = cart_ship_total - old_ship_price;
						cart_full_total = cart_full_total - old_ship_price; 
						final_json[i].item_ship_price = 0;
					}		
				}
				if(total_international > 0){
					if($(".item_ship_price").length == total_international){
						var json_obj = {prd_data:final_json,cart_sub_total:$("#cart_sub_total").attr("cart_sub_total"),cart_ship_total:cart_ship_total,cart_full_total:cart_full_total};
						var date = new Date();
						date.setTime(date.getTime()+(1200*1000));
						var expires = "; expires="+date.toGMTString();
						document.cookie = "checkout_items="+JSON.stringify(json_obj)+expires;
						var base_url=$('#base_url_input').val();
						window.location = base_url+"checkout";
					}else{
						toastr.error('Please select all product for overseas shipping or unselect overseas shipping option.');	
					}
				}else{
					var json_obj = {prd_data:final_json,cart_sub_total:$("#cart_sub_total").attr("cart_sub_total"),cart_ship_total:cart_ship_total,cart_full_total:cart_full_total};
					var date = new Date();
					date.setTime(date.getTime()+(1200*1000));
					var expires = "; expires="+date.toGMTString();
					document.cookie = "checkout_items="+JSON.stringify(json_obj)+expires;
					var base_url=$('#base_url_input').val();
					window.location = base_url+"checkout";
				}
			}else{
				toastr.error('Product quantity can not be added more then of its available quantity in cart.');	
			}			
		}else{
			if(flag){
				location. reload(true);
			}else{
				toastr.error('Product quantity can not be added more then of its available quantity in cart.');	
			}
		}		
	});
	

	/*get user address*/
	$(".users_addresses").change(function(){
		var id = $(this).val();
		var base_url=$('#base_url_input').val();
		$.ajax({
			  url: base_url+'get_address_by_id',        
			  type: 'POST',
			  dataType: "text",
			  data: {id:id},
			  success: function(data) {
				  data = JSON.parse(data);
				  if(data.status == 200){
					  var fname = data.data.fname;
					  var lname = data.data.lname;
					  var cname = data.data.company_name;
					  var phn = data.data.phone_no;
					  var street = data.data.address_line_1;
					  var street2 = data.data.address_line_2;
					  var city = data.data.city;
					  var postal = data.data.postal_code;
					  var state = data.data.state;
					  var all_state = data.data.all_states;
					  var country = data.data.country;
					  $(".shpping_fname").val(fname);
					  $(".shpping_lname").val(lname);
					  $(".shpping_cname").val(cname);
					  $(".shpping_phn").val(phn);
					  $(".shpping_street").val(street);
					  $(".shpping_street2").val(street2);
					  $(".shpping_city").val(city);
					  $(".shpping_postcode").val(postal);
					  
					 // console.log("user country "+country);
					 // console.log("users all state "+all_state);
					  
					  $(".shpping_country option").removeAttr("selected");
					  $(".shpping_country option").each(function(){
						  
						 // console.log(" this country "+$(this).attr("value"));
						 // console.log(" selected country "+country);
						  if($(this).attr("value") == country){
							  
							  $(this).prop("selected",true);
						  }
					  });
					  
					  var state_option_html = "";
					  for(var i = 0;i<all_state.length;i++){
						  if(all_state[i].name != state){
							  state_option_html = state_option_html+"<option value='"+all_state[i].name+"'>"+all_state[i].name+"</option>";  
						  }else{
							  state_option_html = state_option_html+"<option value='"+all_state[i].name+"' selected>"+all_state[i].name+"</option>";
						  }
					  }
					  $(".shpping_state").html(state_option_html);
				  }
			  }
		});
	});
	
	
	
	/*use shipp address as bill checkout page */
	
	$(".use_ship_as_bil").change(function(){
		
		if($(this).is(":checked")){
			
			
			$(".billing_fname").val($(".shpping_fname").val());
			$(".billing_lname").val($(".shpping_lname").val());
			$(".billing_cname").val($(".shpping_cname").val());
			$(".billing_phn").val($(".shpping_phn").val());
			$(".billing_street").val($(".shpping_street").val());
			$(".billing_street2").val($(".shpping_street2").val());
			$(".billing_city").val($(".shpping_city").val());
			$(".billing_postcode").val($(".shpping_postcode").val());
			$(".billing_country option").each(function(){
				if($(this).attr("value") == $(".shpping_country").val()){
					$(this).attr("selected",1);
				}
			});
			$(".billing_state").html($(".shpping_state").html());
			
		}else{
			
			
			
			$(".billing_fname").val("");
			$(".billing_lname").val("");
			$(".billing_cname").val("");
			$(".billing_phn").val("");
			$(".billing_street").val("");
			$(".billing_street2").val("");
			$(".billing_city").val("");
			$(".billing_postcode").val("");
			$(".billing_country option").each(function(){
				
				console.log("option attr"+$(this).attr("value"));
				
				if($(this).attr("value") == ''){
					$(this).attr("selected",1);
				}else{
					$(this).removeAttr("selected");
				}
				
			});
			
			$(".billing_state").html("<option value=''>State</option>");
		}
	});
	
	$(".shpping_country").change(function(){
		var country = $(this).val();
		var base_url=$('#base_url_input').val();
		$.ajax({
			  url: base_url+'get_state_by_country',        
			  type: 'POST',
			  dataType: "html",
			  data: {country:country},
			  success: function(data) {
				  $(".shpping_state").html(data);
			  }
		});
	});
	
	$(".billing_country").change(function(){
		var country = $(this).val();
		var base_url=$('#base_url_input').val();
		$.ajax({
			  url: base_url+'get_state_by_country',        
			  type: 'POST',
			  dataType: "html",
			  data: {country:country},
			  success: function(data) {
				  $(".billing_state").html(data);
			  }
		});
	});
	
	$(".download_invoice").click(function(){
		
		$("#area_to_get_pdf").show();
		var worker = html2pdf();
		var opt = {
		  image:        { type: 'jpeg', quality: 1 },
		  html2canvas:  { scale: 2 },
		};
		var worker = html2pdf().set(opt).from(document.getElementById("area_to_get_pdf")).toCanvas().save();
		
		setTimeout(
		function() {
		  $("#area_to_get_pdf").hide();
		}, 10);
	});
	
	
	
	
	
	
	/*variation change option */
	$(".radio_variation").change(function(){
		$(this).parent().parent().parent().children("li").children("label").removeClass("active");
		$(this).parent().addClass("active");
	});
	
	
	/* hover on heart icon*/
	$(".add_clr_hover i").hover(
         function () {
			 $(this).removeClass("fa-heart-o");
			 $(this).css("color","#c75866");
             $(this).addClass("fa-heart");
			 
         },
     function () {
		 $(this).css("color","");
         $(this).removeClass("fa-heart");
         $(this).addClass("fa-heart-o");
        }
);
	
	
	
}); // End of the window load event


/*******************************************
	Main Slider
*******************************************/

	function homePageSliderInit() {
	
		"use strict";
		var tpBanner= jQuery('.fullwidthbanner');
	
		tpBanner.show().revolution({
            dottedOverlay: "none",
            delay: 9000,
            startwidth: 1920,
            startheight: 700,
            hideThumbs: 200,

            thumbWidth: 100,
            thumbHeight: 50,
            thumbAmount: 2,

            simplifyAll: "off",
            navigation: {
                keyboardNavigation: "on",
                keyboard_direction: "horizontal",
                mouseScrollNavigation: "off",
                onHoverStop: "off",
                touch: {
                    touchenabled: "on",
                    swipe_threshold: 75,
                    swipe_min_touches: 1,
                    swipe_direction: "horizontal",
                    drag_block_vertical: false
                },
                arrows: {
                    style: "gyges",
                    enable: true,
                    hide_onmobile: false,
                    hide_onleave: false,
                    tmp: '',
                    left: {
                        h_align: "left",
                        v_align: "center",
                        h_offset: 10,
                        v_offset: 0
                    },
                    right: {
                        h_align: "right",
                        v_align: "center",
                        h_offset: 10,
                        v_offset: 0
                    }
                }
            },
            navigationType: "bullet",
            navigationArrows: "solo",
            navigationStyle: "preview4",

            touchenabled: "on",
            onHoverStop: "on",
            nextSlideOnWindowFocus: "off",

            swipe_threshold: 75,
            swipe_velocity: 0.7,
            swipe_min_touches: 1,
            swipe_max_touches: 1,
            drag_block_vertical: false,

            keyboardNavigation: "off",

            navigationHAlign: "center",
            navigationVAlign: "bottom",
            navigationHOffset: 0,
            navigationVOffset: 20,

            soloArrowLeftHalign: "left",
            soloArrowLeftValign: "center",
            soloArrowLeftHOffset: 20,
            soloArrowLeftVOffset: 0,

            soloArrowRightHalign: "right",
            soloArrowRightValign: "center",
            soloArrowRightHOffset: 20,
            soloArrowRightVOffset: 0,

            shadow: 0,
            fullWidth: "on",
            fullScreen: "off",

            spinner: "spinner0",

            stopLoop: "off",
            stopAfterLoops: -1,
            stopAtSlide: -1,

            hideTimerBar: "on",

            shuffle: "off",

            autoHeight: "off",
            forceFullWidth: "off",

            hideThumbsOnMobile: "off",
            hideNavDelayOnMobile: 1500,
            hideBulletsOnMobile: "off",
            hideArrowsOnMobile: "off",
            hideThumbsUnderResolution: 0,

            hideSliderAtLimit: 0,
            hideCaptionAtLimit: 0,
            hideAllCaptionAtLilmit: 0,
            startWithSlide: 0,
            videoJsPath: "rs-plugin/videojs/",
            fullScreenOffsetContainer: ""
        });
	}

//***************************************
// Contact Page Map
//****************************************  

	function initMap() {
		"use strict";

		var mapDiv = $('#gmap_canvas');

		if (mapDiv.length) {
			var myOptions = {
				zoom: 10,
				center: new google.maps.LatLng(-37.81614570000001, 144.95570680000003),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);
			var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(-37.81614570000001, 144.95570680000003)
			});
			var infowindow = new google.maps.InfoWindow({
				content: '<strong>Envato</strong><br>Envato, King Street, Melbourne, Victoria<br>'
			});
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map, marker);
			});

			infowindow.open(map, marker);
		}

	}

/* ---------------------	
	All owl Carousels 
/* --------------------- */
	function owlCarouselInit() {

    "use strict";

    //==========================================
    // owl carousels settings
    //===========================================

    var home1MainSlider = $('#home1-main-slider');
    var testimonialSection1 = $('#testimonial-section1');
    var testimonialSection2 = $('#testimonial-section2');
    var testimonialSidebar = $('#testimonial-sidebar');
    var waProductSidebar = $('#wa-product-sidebar');
    var serviceCarousel1 = $('#service-carousel1');
    var processCarousel = $('#process-carousel');
    var blogCarousel = $("#blog-carousel");
    var womenCarousel = $("#women-carousel");
    var womenLatest = $("#women-latest");
    var womenBest = $("#women-best");
    var womenPopular = $("#women-popular");
    var menCarousel = $("#men-carousel");
    var menLatest = $("#men-latest");
    var menBest = $("#men-best");
    var menPopular = $("#men-popular");
    var womenSingleCarousel = $("#women-single-carousel");
    var womenSingleCarousel1 = $("#women-single-carousel1");
    var singleProductOwlCarousel = $("#singleProductOwlCarousel");
    var womenSingleCarousel2 = $("#women-single-carousel2");
    var homeBlogCarousel = $("#home-blog-carousel");
    var waPartnerCarousel = $('.wa-partner-carousel');


    if (home1MainSlider.length) {
        home1MainSlider.owlCarousel({
            autoPlay: true,
            items: 1,
            singleItem: true,
            navigation: true,
            pagination: true,

        });
    }

    if (testimonialSection1.length) {
        testimonialSection1.owlCarousel({
            autoPlay: true,
            items: 1,
            singleItem: true,
            navigation: true,
            pagination: false,

        });
    }

    if (testimonialSection2.length) {
        testimonialSection2.owlCarousel({
            autoPlay: false,
            items: 3,
            navigation: true,
            pagination: false,
            temsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3]

        });
    }

    if (testimonialSidebar.length) {
        testimonialSidebar.owlCarousel({
            autoPlay: true,
            items: 1,
            singleItem: true,
            navigation: false,
            pagination: true,

        });
    }

    if (waProductSidebar.length) {
        waProductSidebar.owlCarousel({
            autoPlay: true,
            items: 1,
            singleItem: true,
            navigation: false,
            pagination: true,

        });
    }

    if (serviceCarousel1.length) {
        serviceCarousel1.owlCarousel({
            autoPlay: false,
            items: 3,
            navigation: true,
            pagination: false,
            temsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3]

        });
    }

    if (processCarousel.length) {
        processCarousel.owlCarousel({
            autoPlay: false,
            items: 3,
            navigation: true,
            pagination: false,
            temsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3]

        });
    }

    if (blogCarousel.length) {
        blogCarousel.owlCarousel({
            autoPlay: false,
            items: 3,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (womenCarousel.length) {
        womenCarousel.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (womenLatest.length) {
        womenLatest.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (womenBest.length) {
        womenBest.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (womenPopular.length) {
        womenPopular.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (menCarousel.length) {
        menCarousel.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (menLatest.length) {
        menLatest.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (menBest.length) {
        menBest.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (menPopular.length) {
        menPopular.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (womenSingleCarousel.length) {
        womenSingleCarousel.owlCarousel({
            autoPlay: false,
            items: 3,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (womenSingleCarousel1.length) {
        womenSingleCarousel1.owlCarousel({
            autoPlay: false,
            items: 6,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
	if (singleProductOwlCarousel.length) {
        singleProductOwlCarousel.owlCarousel({
            autoPlay: true,
            items: 1,
            itemsMobile: [767,1],
            navigation: true,
            pagination: false,
			

        });
    }
	if (womenSingleCarousel2.length) {
        womenSingleCarousel2.owlCarousel({
            autoPlay: false,
            items: 6,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3],
            navigation: true,
            pagination: false

        });
    }
    if (homeBlogCarousel.length) {
        homeBlogCarousel.owlCarousel({
            autoPlay: false,
            items: 3,
            navigation: true,
            pagination: false,
            itemsDesktop: [1199, 3],
            itemsDesktopSmall: [979, 3]

        });
    }

    if (waPartnerCarousel.length) {
        waPartnerCarousel.owlCarousel({
            autoPlay: false,
            items: 4,
            itemsDesktop: [1199, 4],
            itemsDesktopSmall: [979, 3],
            margin: 5,
            navigation: true,
            pagination: false

        });
    }
	}


/********  Other pages js start here *******/


     

$(document).ready(function() {
	
	var base_url=$('#base_url_input').val();
	
	
	/* set image selected count*/
	$('body').on("change",'.FilUploader_all', function(){
            
			var file_selected=$(this);
			var total_files=file_selected[0].files.length;
            $(this).parent().find('span').html(total_files+" file selected");
			
     });
	
	
	/* set image selected name */
	$('body').on("change",'.FilesUploader', function(){
            $(this).parent().find('span').html($(this).val());
     });
	
	
    /******** Sell with us page js *********/
	
	/* set image selected count sell with us */
	$('body').on("change",'.FilUploader', function(){
		
            var file_selected=$(this);
			var total_files=file_selected[0].files.length;
		
		     
		   $(this).parent().find('p').remove();
			
		    var remove_img='<i class="fa fa-times-circle remove_sell_image" aria-hidden="true"></i>';
			
            $(this).parent().find('.total_imgs').val(total_files);
            $(this).parent().find('span').html(total_files+" file selected "+remove_img);
			
     });
	
	
	
	
	/* set image selected count on sell with us*/
	$('body').on("change",'.FilUploader_sell', function(){
            
			var file_selected=$(this);
			
			$(this).parent().find('p').remove();
			
			var total_files=file_selected[0].files.length;
		    if(total_files >=2){
				 $(this).parent().find('p').html("");
			}
			
			var remove_img='<i class="fa fa-times-circle remove_sell_image" aria-hidden="true"></i>'
			
		     $(this).parent().find('.total_imgs').val(total_files);
			 
             $(this).parent().find('span').html(total_files+" file selected "+remove_img);
			
     });
	
	
	/*remove selected file sell with us */
	
	$('body').on("click",'.remove_sell_image', function(){
         
		
		     $(this).parent().parent().find("input:file[name='product_image']").val("");
		 
		     $(this).parent().parent().find('.total_imgs').val(0);
			 
             $(this).parent('span').html('No file selected');
			
     });
	
	
	
    $('.url_submission').addClass('active');
	
    $('input[type=radio][name=url_type]').change(function() {
        if(this.value=='url'){
            $('.manual_submission').removeClass('active');
            $('.url_submission').addClass('active');
        }
        if(this.value=='manual'){
            $('.url_submission').removeClass('active');
            $('.manual_submission').addClass('active');
        }
    });

	
	var i=0;
    $( "#add_product" ).click(function() {
		
		if(i<4){
			
		 $.ajax({
          url: base_url+'get_all_category',        
          type: 'POST',
          success: function(data) {
			  
             var obj = JSON.parse(data);          

			  var opt_html = "";
			  
for (var key in obj.data) {
    opt_html = opt_html+"<option value='"+obj.data[key].cat_id+"'>"+obj.data[key].cat_name+"</option>";
}
			  var image_name_counter=i+1;
			  
			   var add_div='<div class="outer_div"><div class="col-md-6 padL0"><input type="text" class="wv_form_focus" placeholder="Product Name" id="product_name'+image_name_counter+'" name="product_name"></div><div class="col-md-6 pic_upload padR0"><p class="absolute_p">You can upload max 3 images, min 1 image per product</p><div class="upload-btn"><span>No file selected</span><label for="file-upload'+image_name_counter+'">Choose File</label><input name="product_image" type="file" id="file-upload'+image_name_counter+'" accept="image/*" class="FilUploader_sell FilUploader'+image_name_counter+'" multiple><input type="hidden" class="total_imgs" name="total_imgs" value="0" /></div></div><div class="col-md-6 padL0"><select class="wv_form_focus" placeholder="Category" id="product_category" name="product_category">'+opt_html+'</select></div><div class="col-md-6 padR0"><input type="text" class="wv_form_focus" placeholder="Link" id="link" name="link"></div><div class="col-md-12 padR0 padL0"> <input type="text" class="wv_form_focus" placeholder="Category Suggestion"  name="cat_sug" > </div><div class="col-md-12 padLR0"><textarea type="text" class="wv_form_focus sell_textarea" placeholder="Description" id="description" name="description"></textarea></div><a href="javascript:void(0);" class="remove_this_block"><i class="fa fa-times-circle" aria-hidden="true"></i></a></div>';
			  
			  
       $('.manual_submission').append(add_div);
		  
			  i++;
          }
        }); 
	}
       
    });
	
	
	/*remove sell with us form add product box */
	$("body").on("click",".remove_this_block",function(){
		$(this).parent(".outer_div").remove();
		i--;
	});
	
	
	 /* validate sell with form */
	$("#sale_with_us_form").on("click",function(){
		
	  	var flag=true;
		
		var submit_type = $("input[name='url_type']:checked").val();
		
		if(submit_type=='manual'){
			
		  for(var k=0;k<=i;k++){
			  
			/* file validation start here */
			  
		    if(k==0){
		          var file = $('body .FilUploader').prop("files");
			    }else{
			      var file = $('body .FilUploader'+k+'').prop("files");
		        }
		
			   if(file.length<1 || file.length >3){
				
				if(k==0){
					$('body .FilUploader').nextAll('p:first').remove();
				    $('body .FilUploader').after( "<p style='color:red'>please choose min 1 and max 3 product image files</p>" );
					
				  }else{
					  
					  $('body .FilUploader'+i+'').nextAll('p:first').remove();
					  
				     $('body .FilUploader'+i+'').after( "<p style='color:red'>please choose min 1 and max 3 product image files</p>" );
					  
				  }
				
				 console.log("length error in "+i);
			     flag=false;
				
			 }
		
		     for(var j=0;j<file.length;j++){
			  
		      var fileType = file[j]["type"];
			 
              var ValidImageTypes = ["image/gif", "image/jpeg", "image/png","image/jpg"];
              if ($.inArray(fileType, ValidImageTypes) < 0) {
                
				  if(k==0){
					  
					 $('body .FilUploader').nextAll('p:first').remove();
					  
				    $('body .FilUploader').after( "<p style='color:red'>please choose valid files</p>" );
				  }else{
					  
					  $('body .FilUploader'+i+'').nextAll('p:first').remove(); 
					  
				     $('body .FilUploader'+i+'').after( "<p style='color:red'>please choose valid files</p>" );
				  }
				   
  
			      flag=false;
				  
               }else{
				   
		           console.log("valid file "+i);
			       
		        }
			  
			  
		   }
			  
			 /* product name validation start here */
			   if(k==0){
				   var product_name=$('body #product_name');
				  }else{
				      var product_name=$('body #product_name'+k);
				  }
			  
			  if(product_name.val()==''){
				  $(product_name)[0].setCustomValidity('please fill out product name');
			   }else{
			   
			       $(product_name)[0].setCustomValidity('');
			   }
			  
	   }
			
			
		 }else{
		
			var web_url=$('#website_url').val();
		    
			if(web_url == ''){
				
			   $('#website_url')[0].setCustomValidity('please fill out website url');
				 
			  }else{
			  
			   // var filter = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

			  
			   
			  var filter = /^(?:(http|https):\/\/)?(?:(www).)?([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)$/;
			   
			 
			   
			   
					if (filter.test(web_url)) {
						 $('#website_url')[0].setCustomValidity('');
					}
					else {
						$('#website_url')[0].setCustomValidity('enter valid url');
					}
			  }
			
		}
		
		 if(!flag){
			return false;
			
		 }else{
		   return true;
		 }
		
		
	});
	
	
	/* three step form validation for terms check*/
	$("#three_step_form").on("click",function(){
	
	var flag=true;
	
		if($("#grey2").prop('checked') == true){
			$(".err").html("");
			flag=true;
		}else{
		   $(".err").html("Please accept terms and conditions");
			flag= false;
		}
		
		if($("#grey3").prop('checked') == true){
			$(".err2").html("");
			flag= true;
		}else{
		   $(".err2").html("Please accept terms and conditions");
			flag= false;
		}
		
		if(flag){
			return true;
		}else{
			
			return false;
		}
		
		
	});
	
	
	
	/* check image file upload validity */
	/*$(".FilUploader").change(function () {
	 
	    var file = this.files[0];
        var fileType = file["type"];
        var ValidImageTypes = ["image/gif", "image/jpeg", "image/png","image/jpg"];
        if ($.inArray(fileType, ValidImageTypes) < 0) {
            console.log("invalid file "+i);
			//$(this)[0].setCustomValidity('invalide file selected');
        }else{
		     console.log("valid file "+i);
			//$(this)[0].setCustomValidity('');
		 }
		 
	  
       
    }); */
	
	
	/* check both password matched validity*/   
	$('.newpassword').change(function(){
		if($('.newpassword').val() != $('.cpassword').val()) {
			$('.cpassword')[0].setCustomValidity("Passwords Don't Match");
	  	} else {
			$('.cpassword')[0].setCustomValidity('');
		}
	});  
    $('.cpassword').keyup(function(){
		if($('.newpassword').val() != $('.cpassword').val()) {
			$('.cpassword')[0].setCustomValidity("Passwords Don't Match");
	  	} else {
			$('.cpassword')[0].setCustomValidity('');
		}
	});
	
	
	/* check both emails validity*/   
	$('.email_address').change(function(){
		if($('.email_address').val() != $('.cemail_address').val()) {
			$('.cemail_address')[0].setCustomValidity("Email Don't Match");
	  	} else {
			$('.cemail_address')[0].setCustomValidity('');
		}
	});  
    $('.cemail_address').keyup(function(){
		if($('.email_address').val() != $('.cemail_address').val()) {
			$('.cemail_address')[0].setCustomValidity("Email Don't Match");
	  	} else {
			$('.cemail_address')[0].setCustomValidity('');
		}
	});
	
	
/***** vendor signup three step form js *****/	
	
 function validateEmail(sEmail) {
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    if (filter.test(sEmail)) {
        return true;
    }
    else {
        return false;
    }
  }

  $(".cancel_order").click(function(){
	  var href = $(this).attr("data-href");
	  swal({
			title: 'Are you sure you want to cancel this order?',
			type: 'warning',
			text:'',
			showCancelButton: true,
			confirmButtonClass: "btn-info click_on_continue",
			confirmButtonText: "Yes",
			closeOnConfirm: true
		 },function(is_confirm){
			 if(is_confirm){
				window.location=base_url+""+href; 
			 }
	   });
  })
	
	
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$(".next").click(function(){
	
	var step=$(this).attr("step");
	
	var country= $("select[name='country']").val();
	var store_name= $("input[name='store_name']").val();
	var add= $("input[name='add']").val();
	var add1= $("input[name='add1']").val();
	var email= $("input[name='email']").val();
	var phone= $("input[name='phone']").val();
	var logo_file= $("#file-upload2").val();
	var banner_file= $("#file-upload1").val();
	
	var bank_name= $("input[name='bank_name']").val();
	var accout_no= $("input[name='accout_no']").val();
	var bank_address= $("input[name='bank_address']").val();
	
	var paypal_email= $("input[name='paypal_email']").val();
	
	
	
  if(step==1){
	
	if(country==""){
		$("select[name='country']").next('.err').text("please fill out this field");
		return false;
	 }else{
	   $("select[name='country']").next('.err').text("");
	 }
	
	if(store_name==""){
		$("input[name='store_name']").next('.err').text("please fill out this field");
		return false;
	 }else{
	   $("input[name='store_name']").next('.err').text("");
	 }
	if(add==""){
		$("input[name='add']").next('.err').text("please fill out this field");
		return false;
	 }else{
	   $("input[name='add']").next('.err').text("");
	 }
	
	/*if(add1==""){
		$("input[name='add1']").next('.err').text("please fill out this field");
		return false;
	 }else{
	     $("input[name='add1']").next('.err').text("");
	 }*/
	
	if(email==""){
		$("input[name='email']").next('.err').text("please fill out this field");
		return false;
	 }else{
		
		 
		if(!validateEmail(email)){
			 $("input[name='email']").next('.err').text("please fill valid email address");
			  return false;
		  }else{
		     $("input[name='email']").next('.err').text("");
		 }
	 }
	
	if(phone==""){
		$("input[name='phone']").next('.err').text("please fill out this field");
		return false;
	 }else{
	 
		  $("input[name='phone']").next('.err').text("");
	 }
	
	if(logo_file!=""){
		
		
		 var ext = logo_file.split('.').pop().toLowerCase(); 
		
		 var allow = new Array('gif','png','jpg','jpeg'); 
		 if($.inArray(ext, allow) == -1){
		    $("#file-upload").next('.err').text("please choose valid image file");
			 return false;
		 }else{
		     $("#file-upload").next('.err').text("");
		 }
		 
	 }
	 
	 
	 if(banner_file!=""){
		
		 var ext = banner_file.split('.').pop().toLowerCase(); 
		
		 var allow = new Array('gif','png','jpg','jpeg'); 
		 if($.inArray(ext, allow) == -1){
		    $("#file-upload1").next('.err').text("please choose valid image file");
			 return false;
		 }else{
			     
			    $("#file-upload1").next('.err').text("");
		     
		 }
		 
	 }
	 
	 
	 
  }
	
	if(step==2){
		
	/*
	  if(bank_name==""){
		$("input[name='bank_name']").next('.err').text("please fill out this field");
		return false;
	  }else{
	   $("input[name='bank_name']").next('.err').text("");
	  }
	
	 if(accout_no==""){
		$("input[name='accout_no']").next('.err').text("please fill out this field");
		return false;
	  }else{
	   $("input[name='accout_no']").next('.err').text("");
	  }
		
		
	 if(bank_address==""){
		$("input[name='bank_address']").next('.err').text("please fill out this field");
		return false;
	  }else{
	   $("input[name='bank_address']").next('.err').text("");
	  } */
		
		
	if(paypal_email==""){
		$("input[name='paypal_email']").next('.err').text("please fill out this field");
		return false;
	 }else{
		
		 
		if(!validateEmail(paypal_email)){
			 $("input[name='paypal_email']").next('.err').text("please fill valid email address");
			  return false;
		  }else{
		     $("input[name='paypal_email']").next('.err').text("");
		 }
	 }
		
		
		
	}
	
    if(animating) return false;
     animating = true;
    
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
    
    //activate next step on progressbar using the index of next_fs
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
    
    //show the next fieldset
    next_fs.show(); 
	
	$("html,body").animate({ scrollTop: 250 }, 2000);
	
    //hide the current fieldset with style
    current_fs.animate({opacity: 0}, {
        step: function(now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now"
            //1. scale current_fs down to 80%
            scale = 1 - (1 - now) * 0.2;
            //2. bring next_fs from the right(50%)
            left = (now * 50)+"%";
            //3. increase opacity of next_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({
        'transform': 'scale('+scale+')'
      });
            next_fs.css({'left': left, 'opacity': opacity});
        }, 
        duration: 800, 
        complete: function(){
            current_fs.hide();
            animating = false;
        }, 
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
	
	
});

$(".previous").click(function(){
    if(animating) return false;
    animating = true;
    
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();
    
	$("html,body").animate({ scrollTop: 250 }, 2000);
	
	
    //de-activate current step on progressbar
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
    
    //show the previous fieldset
    previous_fs.show(); 
    //hide the current fieldset with style
    current_fs.animate({opacity: 0}, {
        step: function(now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now"
            //1. scale previous_fs from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            //2. take current_fs to the right(50%) - from 0%
            left = ((1-now) * 50)+"%";
            //3. increase opacity of previous_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({'left': left});
            previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
        }, 
        duration: 800, 
        complete: function(){
            current_fs.hide();
            animating = false;
        }, 
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
	
	$("body").scrollTop();
});


/*check vendor store banner image */	

$("#file-upload1").on("change",function(event) {
 
   var this_refrence=$(this);
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
				
				var remove_img='<i class="fa fa-times-circle remove_banner_image" aria-hidden="true"></i>';
				
				$("#file-upload1").parent().find('span').html("selected file dimension "+width+"X"+height+" Px "+remove_img);
			    $("#file-upload1").next('.err').text("");
				
				
				
				/*
				$("#vendor_step_one_btn").removeAttr("title");
				$("#vendor_step_one_btn").removeAttr("disabled");
				 */
				
		   }else{
			        var remove_img='<i class="fa fa-times-circle remove_banner_image" aria-hidden="true"></i>';
			   
			        $("#file-upload1").parent().find('span').html("selected file dimension "+width+"X"+height+" Px "+remove_img);
			   
			        $("#file-upload1").next('.err').text("Image dimension  must be 850x350 Px ");
					
					
					this_refrence.val("");
					
					/*
			        $("#vendor_step_one_btn").attr("title", "Please check all fields are filled");
			        $("#vendor_step_one_btn").attr("disabled", true);
					*/
				   
		   }
			
		}; 
	}
	
  
});	
	

/*check vendor store logo image */	

$("#file-upload2").on("change",function(event) {
 
   var this_refrence=$(this);
   
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
		  
        if (height >= 100 && height <= 800 && width >= 100 && width <= 800) {  //check image daimentions
				
				if(height == width){
					
					 $(this).parent().find('p').remove();
			
		             var remove_img='<i class="fa fa-times-circle remove_logo_image" aria-hidden="true"></i>';
				
				    $("#file-upload2").parent().find('span').html("selected file dimension "+width+"X"+height+" Px " +remove_img);
				
			        $("#file-upload2").next('.err').text("");
				
				
				}else{
					
					
					var remove_img='<i class="fa fa-times-circle remove_logo_image" aria-hidden="true"></i>';
			   
			        $("#file-upload2").parent().find('span').html("selected file dimension "+width+"X"+height+" Px " + remove_img);
			   
			        $("#file-upload2").next('.err').text("Logo must be square with max height and width of 800px and min height and width of 100px");
					
					this_refrence.val("");
					
				}
				
				
		   }else{
			   
			        var remove_img='<i class="fa fa-times-circle remove_logo_image" aria-hidden="true"></i>';
			   
			        $("#file-upload2").parent().find('span').html("selected file dimension "+width+"X"+height+" Px " + remove_img);
			   
			        $("#file-upload2").next('.err').text("Logo must be square with max height and width of 800px and min height and width of 100px");
					
					this_refrence.val("");
				 
		   }
			
		}; 
	}
	
  
});	
	
/*Remove logo selected image*/
	
$("body").on("click",".remove_logo_image",function(){
	
	$(this).parent("span").text("No file selected");
	$("#file-upload2").next('.err').text("");
	$("#file-upload2").val("");
	
});	
	
/*Remove banner selected image*/
	
$("body").on("click",".remove_banner_image",function(){
	
	$(this).parent("span").text("No file selected");
	$("#file-upload1").next('.err').text("");
	$("#file-upload1").val("");
	
});	
	
	
	
/******* checkout page ********/
	
$(".email_detail_div").hide();
    $(function () {
        $("#grey2").click(function () {
            if ($(this).is(":checked")) {
                $(".email_detail_div").show(300);
            } else {
                $(".email_detail_div").hide(300);
            }
        });
    });	
	
	
/****** product single page js ******/	

  $('.SeeMore2').click(function(){
		var $this = $(this);
		$this.toggleClass('SeeMore2');
		if($this.hasClass('SeeMore2')){
			$this.text('Read More');			
		} else {
			$this.text('Read Less');
		}
	});

    // Instantiate EasyZoom instances
        var $easyzoom = $('.easyzoom').easyZoom();

        // Setup thumbnails example
        var api1 = $easyzoom.filter('.easyzoom--with-thumbnails').data('easyZoom');

        $('.thumbnails').on('click', 'a', function(e) {
            var $this = $(this);

            e.preventDefault();

            // Use EasyZoom's `swap` method
            api1.swap($this.data('standard'), $this.attr('href'));
        });

        // Setup toggles example
        var api2 = $easyzoom.filter('.easyzoom--with-toggle').data('easyZoom');

        $('.toggle').on('click', function() {
            var $this = $(this);

            if ($this.data("active") === true) {
                $this.text("Switch on").data("active", false);
                api2.teardown();
            } else {
                $this.text("Switch off").data("active", true);
                api2._init();
            }
        });	
	
	
/******** vendor add product js ********/

// get sub category by category	
$('#primary_cat').on('change', function() {
 
	var cat_id=this.value;
	var cat_id1=$('#secondry_cat').val();
	
	 $.ajax({
          url: base_url+'api/web/getsubcatBycatId',        
          type: 'POST',
		  data:{cat_id:cat_id,cat_id1:cat_id1},
          success: function(data) {
			  
		      var obj = JSON.parse(data);          
			  var opt_html = "";
			  
              for (var key in obj.data) {
                  opt_html = opt_html+"<option value='"+obj.data[key].id+"'>"+obj.data[key].name+"</option>";
               }
			 
			// var add_div='<div class="col-md-12 padL0 padR0 form-group"><h3>Sub category</h3><select class="wv_form_focus" id="sub_cat" name="sub_cat" multiple >'+opt_html+'</select></div>';
			 
		    $('#subcat_div').css("display","block");  
			  
            $('#sub_cat').html(opt_html);
		  
          }
        }); 
	
});	
	
// get sub category by category	
$('#secondry_cat').on('change', function() {
 
	var cat_id1=$('#primary_cat').val();
	
	var cat_id2=this.value;
	
	 $.ajax({
          url: base_url+'api/web/getsubcatBycatId',        
          type: 'POST',
		  data:{cat_id:cat_id1,cat_id1:cat_id2},
          success: function(data) {
			  
		      var obj = JSON.parse(data);          
			  var opt_html = "";
			  
              for (var key in obj.data) {
                  opt_html = opt_html+"<option value='"+obj.data[key].id+"'>"+obj.data[key].name+"</option>";
               }
			 
			// var add_div='<div class="col-md-12 padL0 padR0 form-group"><h3>Sub category</h3><select class="wv_form_focus" id="sub_cat" name="sub_cat" multiple >'+opt_html+'</select></div>';
			 
           $('#subcat_div').css("display","block");  
			  
            $('#sub_cat').html(opt_html);
		  
          }
        }); 
	
});	
		
	
 /*get sub sub category on chnage */	
$('#sub_cat').on('change', function() {
 
	
	var sub_cat_ids="";
	
	  $.each($("#sub_cat option:selected"), function(){            
            sub_cat_ids += $(this).val()+",";
        });
	
	sub_cat_ids = sub_cat_ids.replace(/,\s*$/, "");
	
	
	 $.ajax({
          url: base_url+'api/web/getsubsubcatBysubcatId',        
          type: 'POST',
		  data:{sub_cat_id:sub_cat_ids},
          success: function(data) {
			  
		      var obj = JSON.parse(data);          
			  var opt_html = "";
			  
              for (var key in obj.data) {
                  opt_html = opt_html+"<option value='"+obj.data[key].id+"'>"+obj.data[key].name+"</option>";
               }
			   
			  $('#subsubcat_div').css("display","block");  
			  
              $('#subsub_cat').html(opt_html);
		  
          }
        }); 
	
});		
	
	
	
/*set project  status on click later and live btn*/
/*$('.add_product_form').on("click",function(){
	
	 var project_status = $(this).attr("data");
	$("#project_status").val(project_status);
});
	
*/	
 
// validate add product form  

$(".add_product_form").on("click",function(e){
	
	
	//e.preventDefault();
	
	 var temp= true;
	
	
     var sub_cat=$("#sub_cat").val();
	
	  if(sub_cat == null){
		  toastr.error('Please choose sub category');
		 var temp= false;
	  }
	
	
	 var subsub_cat=$("#subsub_cat").val();
	
	  if(subsub_cat == null){
		  toastr.error('Please choose sub of sub category');
		 var temp= false;
	  }
	
	
	 var file1 = $('#cropped_img_ext1').val();
	 var file2 = $('#cropped_img_ext2').val();
	 var file3 = $('#cropped_img_ext3').val();
	 var file4 = $('#cropped_img_ext4').val();
	 var file5 = $('#cropped_img_ext5').val();
	
	if(!file1 && !file2 && !file3 && !file4 && !file5){
		toastr.error('min 1 product image is required');
		temp = false;
	}
	
	var is_on_sale = $("input[type=radio][name=is_on_sale]:checked").val();
	
	if(is_on_sale == 1){
		var regular_price = $("#regular_price_id").val();
		var sell_price_id = $("#sell_price_id").val();
		var max_val = 0;
		var min_val = 0;
		
		var maximum = parseFloat((regular_price * 5)/100);
		var minimum = parseFloat((regular_price * 50)/100);
		
		max_val = parseFloat(regular_price) - maximum ;
			
		min_val = minimum ;
		
		if(sell_price_id > max_val || sell_price_id < min_val){
			toastr.error('Sale price must be greater then 5% of regular price or less then 50% of regular price');
			temp=false;
		}
	}
	
	var is_customized=$('input[name=customized]:checked').val(); 
	var customized_price = $("input[type=number][name=customized_price]");
	
	var cst_txt_lbl = $(".first_cst_label");
	
	if(is_customized == 1){
		
		if(customized_price.val() == ""){
			 toastr.error('please fill custom text option');
		     temp = false;
			
			
		}
		
	   if(cst_txt_lbl.val() == ""){
		   toastr.error('Please fill out custom input label');
		   temp = false;
	   }
	
	}
	
	var ship_over_option=$('input[name=ship_overseas]:checked').val(); 

	var ship_oveseas_price = $("#overseas_ship_input_id");
	
	if(ship_over_option==1){
		
		if ($("[name=ship_region]:checkbox:checked").length == 0){
             toastr.error('Please select ship region');
			 temp = false;
			
        }
        
		if(ship_oveseas_price.val() == ""){
			
		     toastr.error('please fill ship overseas price');
			 temp = false;
		}
		
		
	 }
	
	
	 var product_name= $("input[type=text][name=product_name]");
	
	
	
	var product_description=$(".product_desc");
	var desc = product_description.val();
	desc = desc.replace(/<[^>]*>/g, '');
	desc = desc.replace(/\&nbsp;/g, '');
	for (index = 0; index < desc.length; ++index) {
		desc[index] = desc[index].replace(/\&nbsp;/g, '');
	}
	desc = desc.trim();
	if(desc == ""){
		
		toastr.error('Product description must be set');
		temp = false;
	}
	
	var gift_option=$('input[name=gift_wrap]:checked').val();
	
	var gift_price=$("input[type=number][name=gift_price]");
	
	if(gift_option==1){
		
		if(gift_price.val() == ""){
	     
		   toastr.error('please fill out gift price');
		   temp = false;
		  
		}
	 }
	 
	 
	 var express_type=$('input[name=express_type]:checked').val();
	
	var express_price=$("input[type=number][name=express_delivery_price]");
	
	if(express_type==1){
		
		if(express_price.val() == ""){
	     
		   toastr.error('please fill out express delivery price');
		   temp = false;
		  
		}
	 }
	
	
		if(!temp){
			return false;
			
		}
});



 /*variant button click on add product*/
 $('#add_prod_var_btn').on("click",function(){
	
	
	
	swal({
		title: 'You have not saved your product',
		type: 'warning',
		text:'Your product must be saved before adding variants.',
		showCancelButton: true,
		confirmButtonClass: "btn-info click_on_continue",
		confirmButtonText: "Save and continue",
		closeOnConfirm: true
     },function(is_confirm){
	
	    if(!is_confirm){
			
			$("#continue_inpt_hidn").val(0);
		}else{
			
			
			
			if($("#add_product_name").val() == ''){
				
				toastr.error('Product name is required');
				$('#add_product_name').focus();
				
			}else if($("#primary_cat").val() == ''){
				
				toastr.error('Plase choose product category');
				$('#primary_cat').focus();
			}
			
			else if($("#regular_price_id").val() == ''){
				
				toastr.error('Product regular price is requird');
				$('#regular_price_id').focus();
			}
			else if($("#add_product_gender").val() == ''){
				
				toastr.error('Please choose gender');
				
				$('#add_product_gender').focus();
			}
			
			else if($("#add_product_stock").val() == ''){
				
				toastr.error('Quantity of stock is required');
				
				$('#add_product_stock').focus();
			}
			else if($("#price_ship_input_id").val() == ''){
				
				toastr.error('Price of shipping is required');
				
				$('#price_ship_input_id').focus();
			}
			
			else if($("#add_product_ships_within").val() == ''){
				
				toastr.error('Please choose ships within');
				
				$('#add_product_ships_within').focus();
			}
			else{
				
				$("#continue_inpt_hidn").val(1);
				
				$( "#later_sub" ).trigger( "click" );
			}
			
		
			
		}
	
   });	
	
	
});
 




/*set project  status on click later and live btn*/
/*$('.edit_product_form').on("click",function(){
	
	 var project_status = $(this).attr("data");
	 $("#project_status").val(project_status);
	
});
*/

 // validate edit product form and submit 
	
$(".edit_product_form").on("click",function(e){

	//e.preventDefault();
	
    var flag=true;
	
	
	 var sub_cat=$("#sub_cat").val();
	
	  if(sub_cat == null){
		  toastr.error('Please choose sub category');
		 var flag= false;
	  }
	
	
	 var subsub_cat=$("#subsub_cat").val();
	
	  if(subsub_cat == null){
		  toastr.error('Please choose sub of sub category');
		 var flag= false;
	  }
	
	
	
	var total_previous_images=$("#total_images").val();
	
	/* other form element validation */
	
	var is_on_sale = $("input[type=radio][name=is_on_sale]:checked").val();
	
	if(is_on_sale == 1){
		
		var regular_price = $("#regular_price_id").val();
		var sell_price_id = $("#sell_price_id").val();
		var max_val = 0;
		var min_val = 0;
		
		var maximum = parseFloat((regular_price * 5)/100);
		var minimum = parseFloat((regular_price * 50)/100);
		
		max_val = parseFloat(regular_price) - maximum ;
			
		min_val = minimum ;
		
		
		if(sell_price_id > max_val || sell_price_id < min_val){
			toastr.error('Sale price must be between 5% and 50% off of the regular price');
			flag=false;
		}
		
	}
	
	var is_customized=$('input[name=customized]:checked').val(); 
	var customized_price = $("input[type=number][name=customized_price]");
	
	var cst_txt_lbl = $(".first_cst_label");
	
	if(is_customized == 1){
		
		if(customized_price.val() == ""){
			
			toastr.error('please fill custom Text Option');
			flag=false;
		}
		
	   if(cst_txt_lbl.val() == ""){
		   toastr.error('Please fill out custom input label');
		   flag = false;
	   }
	
	}
	
	var product_description=$(".product_desc");
	var desc = product_description.val();
	desc = desc.replace(/<[^>]*>/g, '');
	desc = desc.replace(/\&nbsp;/g, '');
	for (index = 0; index < desc.length; ++index) {
		desc[index] = desc[index].replace(/\&nbsp;/g, '');
	}
	desc = desc.trim();
	if(desc == ""){
		
		//product_description[0].setCustomValidity('Product description must be set');
		toastr.error('Product description must be set');
		flag = false;
		
	}
	
	
	var ship_over_option=$("input[type=radio][name=ship_overseas_edit]:checked").val();
	var ship_oveseas_price = $("#overseas_ship_input_id");
	
	if(ship_over_option==1){
		
		if ($("[name=ship_region_edit]:checkbox:checked").length == 0){
             toastr.error('Please select ship region');
			 flag=false;
        }
		
		
		if(ship_oveseas_price.val() == ""){
			
			
		    toastr.error("please fill ship overseas price");
			flag=false;
		}
		
	 }
	
	
	
	
	var express_type_edit=$("input[type=radio][name=express_type_edit]:checked").val();
	var express_delivery_price = $("#express_delivery_input_id_edit");
	
	if(express_type_edit==1){
		
		
		if(express_delivery_price.val() == ""){
			
			
		    toastr.error("please fill out express delivery price");
			flag=false;
		}
		
	 }
	

	
	
	/* return false when image error */
	if(!flag){
		
		   return false;
		   
	       }
	
});	
	
	
	 /*variant button click on edit product*/
 
 $('#edit_prod_var_btn').on("click",function(){
	
	
	var pro_saved_status=$("#product_status").val();
	
	swal({
		title: 'You have not saved your product',
		type: 'warning',
		text:'Your product must be saved before adding variants.',
		showCancelButton: true,
		confirmButtonClass: "btn-info click_on_continue",
		confirmButtonText: "Save and continue",
		closeOnConfirm: true
     },function(is_confirm){
	
	    if(!is_confirm){
			
			$("#continue_inpt_hidn").val(0);
		}else{
			
			
			if($("#edit_product_name").val() == ''){
				
				toastr.error('Product name is required');
				$('#edit_product_name').focus();
				
			}else if($("#primary_cat").val() == ''){
				
				toastr.error('Plase choose product category');
				$('#primary_cat').focus();
			}
			
			else if($("#regular_price_id").val() == ''){
				
				toastr.error('Product regular price is requird');
				$('#regular_price_id').focus();
			}
			else if($("#edit_product_gender").val() == ''){
				
				toastr.error('Please choose gender');
				
				$('#edit_product_gender').focus();
			}
			
			else if($("#edit_product_stock").val() == ''){
				
				toastr.error('Quantity of stock is required');
				
				$('#edit_product_stock').focus();
			}
			else if($("#price_ship_input_id").val() == ''){
				
				toastr.error('Price of shipping is required');
				
				$('#price_ship_input_id').focus();
			}
			
			else if($("#edit_product_ships_within").val() == ''){
				
				toastr.error('Please choose ships within');
				
				$('#edit_product_ships_within').focus();
			}else{
				
			   if(pro_saved_status == 0){
				
				$("#continue_inpt_hidn").val(1);
				
				$("#edit_save_later_pro").trigger( "click" );
			   }else{
				
				$("#continue_inpt_hidn").val(1);
				
				$("#edit_list_pro").trigger("click");
			  }
		  }
			
		}
	
   });	
	
	
});
 
	
	
// Disable add edit product form elements 	
$("input[type=radio][name=gift_wrap]").on("change",function(){
	
   var gift_option =$(this).val();
	if(gift_option==0){
	  $("input[type=number][name=gift_price]").attr("disabled","disabled");
	
	}else{
	  $("input[type=number][name=gift_price]").removeAttr("disabled");
	}
	
 });
	
	
$("input[type=radio][name=gift_wrap_edit]").on("change",function(){
	
   var gift_option =$(this).val();
	if(gift_option==0){
	  $("input[type=number][name=gift_price_edit]").attr("disabled","disabled");
	 
	}else{
	  $("input[type=number][name=gift_price_edit]").removeAttr("disabled");
	  
	}
	
 });	
	
	
// Disable add edit product form elements 	
$("input[type=radio][name=ship_overseas]").on("change",function(){
	
   var ship_region =$(this).val();
	if(ship_region==0){
		
	  $(".check-colr").prop("disabled",true);
	  $(".check-colr").next("label").css("cursor","not-allowed");
	  
	  $('#overseas_ship_input_id').attr("disabled",true);
	}else{
	  $(".check-colr").prop("disabled",false);
	  $(".check-colr").next("label").css("cursor","pointer");
	  $('#overseas_ship_input_id').removeAttr("disabled");
	}
	
 });
	
	
// Disable edit product form elements 	
$("input[type=radio][name=ship_overseas_edit]").on("change",function(){
	
   var ship_region =$(this).val();
	if(ship_region==0){
		
	  $(".check-colr").prop("disabled",true);
	  $(".check-colr").next("label").css("cursor","not-allowed");
	  $('#overseas_ship_input_id').attr("disabled",true);
	  
	}else{
	  $(".check-colr").prop("disabled",false);
	  $(".check-colr").next("label").css("cursor","pointer");
	  $('#overseas_ship_input_id').removeAttr("disabled");
	}
	
 });	
 
 
 // Disable edit product form elements 	
$("input[type=radio][name=express_type]").on("change",function(){
	
   var ship_region =$(this).val();
	if(ship_region==0){
		
	  $('#express_delivery_input_id').attr("disabled",true);
	  
	}else{
	  $('#express_delivery_input_id').removeAttr("disabled");
	}
	
 }); 
 // Disable edit product form elements 	
$("input[type=radio][name=express_type_edit]").on("change",function(){
	
   var ship_region =$(this).val();
	if(ship_region==0){
		
	  $('#express_delivery_input_id_edit').attr("disabled",true);
	  
	}else{
	  $('#express_delivery_input_id_edit').removeAttr("disabled");
	}
	
 });

 

//check width add/edit product

$("#width_input").on("blur",function(){
	var wet=$(this).val();
	var check=$.isNumeric(wet);
	
	if(!check){
		 toastr.error('please insert valid width');
		  setTimeout(function(){
			
                $("#width_input").val("");
              }, 1500); 
	  }else{
		  
		 var wieght=$("#weight_input").val();
	     var width=$(this).val();
	     var height=$("#height_input").val();
		
		wieght=wieght*1000 ;
		width=width*10 ;
		height=height*10 ;
		/*
		if(wieght<=500 && width<=220 && height<=355){
		
			$("#is_free_delivery_hidden").val(1);
			$("#price_ship_input_id").attr("disabled",true);
		}else{
			
			$("#is_free_delivery_hidden").val(0);
			
			$("#price_ship_input_id").removeAttr("disabled");
			
		} */
		  
	  }
});

//check height_input add/edit product

$("#height_input").on("blur",function(){
	var wet=$(this).val();
	var check=$.isNumeric(wet);
	
	if(!check){
		 toastr.error('please insert valid height');
		  setTimeout(function(){
			
                $("#height_input").val("");
              }, 1500); 
	}else{
		
		
		var wieght=$("#weight_input").val();
	    var width=$("#width_input").val();
	    var height=$(this).val();
		
		wieght=wieght*1000 ;
		width=width*10 ;
		height=height*10 ;
		/*
		if(wieght<=500 && width<=220 && height<=355){
		
			$("#is_free_delivery_hidden").val(1);
			
			$("#price_ship_input_id").attr("disabled",true);
		}else{
			
			$("#is_free_delivery_hidden").val(0);
			$("#price_ship_input_id").removeAttr("disabled");
		}
		*/
		
	}
});

//check weight_input add/edit product
$("#weight_input").on("blur",function(){
	var wet=$(this).val();
	var check=$.isNumeric(wet);
	
	if(!check){
		 toastr.error('please insert valid weight');
		  setTimeout(function(){
			
                $("#weight_input").val("");
              }, 1500); 
	}else{
		
		var wieght=$(this).val();
	    var width=$("#width_input").val();
	    var height=$("#height_input").val();
		
		wieght=wieght*1000 ;
		width=width*10 ;
		height=height*10 ;
		/*
		if(wieght<=500 && width<=220 && height<=355){
		
			$("#is_free_delivery_hidden").val(1);
			$("#price_ship_input_id").attr("disabled",true);
			
		}else{
			
			$("#is_free_delivery_hidden").val(0);
			
			$("#price_ship_input_id").removeAttr("disabled");
		}
		*/
	}
});


/* show hide sell price div on product add/edit*/

$("#regular_price_id").on("blur",function(){
		
		var regular_price=$(this).val();
		
		
		if($("input[type=radio][name=is_on_sale]:checked").val() == 1){
			
			var max_val = 0;
			var min_val = 0;
			var maximum = parseFloat((regular_price * 5)/100);
			var minimum = parseFloat((regular_price * 50)/100);
			
			
			max_val = parseFloat(regular_price) - maximum ;
			
			min_val = minimum ;
			
			$("#sell_price_id").val(max_val);
			$("#sell_price_id").attr("min",min_val);
			$("#sell_price_id").attr("max",max_val);
		}else{
			$("#sell_price_id").val(regular_price);
			$("#sell_price_id").attr("min",regular_price);
			$("#sell_price_id").attr("max",regular_price);
		}
	});
	
	
$("#sell_price_id").on("blur",function(){
		
		var regular_price=$("#regular_price_id").val();
		
		
		if($("input[type=radio][name=is_on_sale]:checked").val() == 1){
			
			var max_val = 0;
			var min_val = 0;
			var maximum = parseFloat((regular_price * 5)/100);
			var minimum = parseFloat((regular_price * 50)/100);
			
			
			max_val = parseFloat(regular_price) - maximum ;
			
			min_val = minimum ;
			
			//$("#sell_price_id").val(max_val);
			$("#sell_price_id").attr("min",min_val);
			$("#sell_price_id").attr("max",max_val);
		}else{
			$("#sell_price_id").val(regular_price);
			$("#sell_price_id").attr("min",regular_price);
			$("#sell_price_id").attr("max",regular_price);
		}
	});	
	
	

 $("input[type=radio][name=is_on_sale]").on("change",function(){
	 
	  var is_on_sale =$(this).val();
	  
	  if(is_on_sale==1){
		  
		  $('#sell_price_div_pro').removeClass('hide_div');
		  var regular_price = $("#regular_price_id").val();
		  var max_val = 0;
			var min_val = 0;
			min_val = parseInt((regular_price * 5)/100);
			max_val = parseInt((regular_price * 50)/100);
		  $("#sell_price_id").val("");
			$("#sell_price_id").attr("min",min_val);
			$("#sell_price_id").attr("max",max_val);
	  }else{
		  var regular_price = $("#regular_price_id").val();
		  $('#sell_price_div_pro').addClass('hide_div');
		  $("#sell_price_id").val(regular_price);
			$("#sell_price_id").attr("min",regular_price);
			$("#sell_price_id").attr("max",regular_price);
		  
	  }
	 
 });

 
  
 /* show hide custmized box product add edit*/

 $("input[type=radio][name=customized]").on("change",function(){
	 
	  var customized =$(this).val();
	  
	  if(customized==1){
		  
		  $('#custom_inpt_lbls_div').removeClass('hide_div');
		  $('#cstm_price_div').removeClass('hide_div');
		  
	  }else{
		  
		  $('#custom_inpt_lbls_div').addClass('hide_div');
		  $('#cstm_price_div').addClass('hide_div');
		  
	  }
	 
 });
 
 
 
 /*add custom input label option */
 $("body").on("click","#add_custom_opt",function(){
	 
	var total_labels=$("#total_lables").val();
	 
	total_labels=parseInt(total_labels);
	 
	 
	 if(total_labels == 5){
		 return ;
	 }
	 
	total_labels=total_labels+1;
	
	$("#total_lables").val(total_labels);
	
	 
	 var apped_option='<div class="label_div"> <div class="col-md-10 padL0 padR0 form-group label_headings"> <h3>Input Label</h3> <input class="wv_form_focus" maxlength="50" type="text" placeholder="Custom Text:" name="cst_txt_lbl"> </div><div class="col-md-2 padL0 padR0 form-group form-plus-add"> <h1 class="remove_custom_opt">-</h1> </div></div>';
	 
	 
	 $("#custom_inpt_lbls_div").append(apped_option);
	 
	 var counter_label=1;
	 
	 $("body div.label_div div.label_headings").each(function(e){
		 
		 $(this).find("h3").text("Input Label #"+counter_label);
		 counter_label = counter_label+1;
	 });
	 
	 
 });
 
 
 /*remove custom input label option */
 
  $("body").on("click",".remove_custom_opt",function(){
	  
	  $label_div=$(this).parents(".label_div");
	  
	  $label_div.remove();
	  
	  var total_labels=$("#total_lables").val();
	 
	 total_labels=parseInt(total_labels);
	 
	total_labels=total_labels-1;
	
	$("#total_lables").val(total_labels);
	  
	 var counter_label=1;
	 
	 $("body div.label_div div.label_headings").each(function(e){
		 console.log(counter_label);
		 $(this).find("h3").text("Input Label #"+counter_label);
		 counter_label = counter_label+1;
	 });  
	  
  });
 
 
 /* show hide custmized box product add edit*/

 $("input[type=radio][name=is_variable]").on("change",function(){
	 
	  var is_variable =$(this).val();
	  
	  if(is_variable==2){
		  
		  $('.add_pr_varint_btn_div').removeClass('hide_div');
		  
	  }else{
		  
		  $('.add_pr_varint_btn_div').addClass('hide_div');
		  
	  }
	 
 });
 
 


 
 

 
 
	
/* Add Product Variant By vendor js start here */	

    $(".varianttype_select_box").on("change",function(){
		
		   var varaint_val=$(this).val();
		
		   if(varaint_val==""){
			   return;
		     }
		
		//show submit button 
		 $(".var_sav-btn").removeClass("hide_div");
		
		   var varaint_id = $('option:selected', this).attr('variant_id');
		   
		   var variant_type = $('option:selected', this).attr('variant_type');
		
		   variant_type=parseInt(variant_type);
		
		   $('option:selected', this).attr('disabled',"disabled"); //disabled selected options 
		
		    var count_of_varints=$("#count_of_variants").val();
	  
	       count_of_varints=parseInt(count_of_varints);
		   
		   if(count_of_varints==5){
			   swal("warning","Maximum 5 variants can be add per product","warning");
			   return ;
		    }
		   
	       count_of_varints=count_of_varints+1;
	  
	       $("#count_of_variants").val(count_of_varints);
		
		
		
         $.ajax({
          url:base_url+'api/web/getVariantsOptions',        
          type: 'POST',
          data: {varaint_id: varaint_id},
          success: function(data) {
			  
              var obj = JSON.parse(data);              
			  var all_options=obj.data;
			  var options ="";
			  
			   for(var j=0;j<all_options.length;j++){
				   var id=varaint_id+j;
			        options +='<li class="ui-state-default" style="border-color:'+all_options[j].value+'"> <input type="checkbox" value="'+all_options[j].value+'" class="grey" name="varaint_val" id="'+id+'"> <label for="'+id+'">'+all_options[j].value+'</label><span class="remo_var_op">X</span></li>';
			    }
			  
			   if(variant_type == 1){
			    var read_only="";
			   }else{
			      var read_only="readonly";
			   }
			  
			  
			if(varaint_val == 'color' && variant_type == 0){
			
				  var varaint_box_html='<div class="col-md-12 variant_option1 padLR0 marB30 variant_box_div scroll'+varaint_id+'"><input type="hidden" class="pro_variant_id_class" name="pro_variant_id" value="0"><input type="hidden" name="variant_id" value="'+varaint_id+'" /><input type="hidden" name="variant_val_number" class="variant_val_number"  value="0" /><div class="variant_delete"> <a><i pro_varaint_id="0" variant_id="'+varaint_id+'" class="w-del fa fa-trash-o variant_delete_btn" aria-hidden="true"></i></a></div><div class="col-md-4 variant-left"><div class="col-md-12 form-group padLR0"><h3>Variant display Type</h3> <select class="wv_form_focus" name="display_type"><option value="dropdown" disabled>Dropdown</option><option value="radio" disabled>Radio</option><option value="checkbox">Checkbox</option> </select></div><div class="col-md-12 form-group padLR0"><h3>Variant Title</h3> <input class="wv_form_focus" type="text" value="'+varaint_val+'" name="variant_name" placeholder="" '+read_only+'></div></div><div class="col-md-6 col-md-offset-1 variant-right"><h3>Variant Values</h3><div class="variant pre_check"><ul class="wv_widget sortable_options" id="'+varaint_id+'">'+options+'</ul></div><h3>Enter New Variant Values</h3> <div id="clpkr"  class="input-group colorpicker-component"><input style="margin-bottom:0px" type="text" class="option_val_field" maxlength="50" placeholder="choose color code" value="#DD0F20" ><span class="input-group-addon"><i></i></span></div><span class="err" style="color:red"></span><div class="variant_btn"> <a class="bth_A addVariantValueField"  >Add</a></div></div></div> <script>$( function() {$( "body .sortable_options" ).sortable();$( "body .sortable_options" ).disableSelection();} );$("#clpkr").colorpicker(); </script>';
				
				
			}else{
				if(varaint_val == "custom" || varaint_val == "Custom"){
					var varaint_box_html='<div class="col-md-12 variant_option1 padLR0 marB30 variant_box_div scroll'+varaint_id+'"><input type="hidden" class="pro_variant_id_class" name="pro_variant_id" value="0"><input type="hidden" name="variant_id" value="'+varaint_id+'" /><input type="hidden" name="variant_val_number" class="variant_val_number"  value="0" /><div class="variant_delete"> <a><i pro_varaint_id="0" variant_id="'+varaint_id+'" class="w-del fa fa-trash-o variant_delete_btn" aria-hidden="true"></i></a></div><div class="col-md-4 variant-left"><div class="col-md-12 form-group padLR0"><h3>Variant display Type</h3> <select class="wv_form_focus" name="display_type"><option value="dropdown">Dropdown</option><option value="radio">Radio</option><option value="checkbox" disabled>Checkbox</option> </select></div><div class="col-md-12 form-group padLR0"><h3>Variant Title</h3> <input class="wv_form_focus" type="text" value="" name="variant_name" placeholder="" '+read_only+'></div></div><div class="col-md-6 col-md-offset-1 variant-right"><h3>Variant Values</h3><div class="variant pre_check"><ul class="wv_widget sortable_options" id="'+varaint_id+'">'+options+'</ul></div><h3>Enter New Variant Values</h3> <input  type="text" class="option_val_field" maxlength="50" placeholder="" ><span class="err" style="color:red"></span><div class="variant_btn"> <a class="bth_A addVariantValueField"  >Add</a></div></div></div> <script>$( function() {$( "body .sortable_options" ).sortable();$( "body .sortable_options" ).disableSelection();} );</script>';
				}else{
					var varaint_box_html='<div class="col-md-12 variant_option1 padLR0 marB30 variant_box_div scroll'+varaint_id+'"><input type="hidden" class="pro_variant_id_class" name="pro_variant_id" value="0"><input type="hidden" name="variant_id" value="'+varaint_id+'" /><input type="hidden" name="variant_val_number" class="variant_val_number"  value="0" /><div class="variant_delete"> <a><i pro_varaint_id="0" variant_id="'+varaint_id+'" class="w-del fa fa-trash-o variant_delete_btn" aria-hidden="true"></i></a></div><div class="col-md-4 variant-left"><div class="col-md-12 form-group padLR0"><h3>Variant display Type</h3> <select class="wv_form_focus" name="display_type"><option value="dropdown">Dropdown</option><option value="radio">Radio</option><option value="checkbox" disabled>Checkbox</option> </select></div><div class="col-md-12 form-group padLR0"><h3>Variant Title</h3> <input class="wv_form_focus" type="text" value="'+varaint_val+'" name="variant_name" placeholder="" '+read_only+'></div></div><div class="col-md-6 col-md-offset-1 variant-right"><h3>Variant Values</h3><div class="variant pre_check"><ul class="wv_widget sortable_options" id="'+varaint_id+'">'+options+'</ul></div><h3>Enter New Variant Values</h3> <input  type="text" class="option_val_field" maxlength="50" placeholder="" ><span class="err" style="color:red"></span><div class="variant_btn"> <a class="bth_A addVariantValueField"  >Add</a></div></div></div> <script>$( function() {$( "body .sortable_options" ).sortable();$( "body .sortable_options" ).disableSelection();} );</script>';
				}				
			}
			  
		 
		
	       $(".var_sav-btn").before(varaint_box_html);
		
           $('html, body').animate({'scrollTop' : $(".scroll"+varaint_id).position().top});
			  
          }
        });        
       
	});
	
// add option value 
$("body").on("click",".addVariantValueField",function(){
	
   var now_timestamp =$.now();
   now_timestamp=now_timestamp+1;
	
   var option_val=$(this).parents('.variant-right').find(".option_val_field").val();
	
	  
	   $(this).parents('.variant-right').find(".option_val_field").next(".err").text("");
	  
	   if(option_val==""){
		   $(this).parents('.variant-right').find(".option_val_field").next(".err").text("please enter option value");
		   return;
	   }
	
	
	
 var option_html='<li class="ui-state-default" style="border-color:'+option_val+'"> <input value="'+option_val+'" type="checkbox" class="grey" name="varaint_val" id="'+now_timestamp+'" checked> <label for="'+now_timestamp+'" >'+option_val+'</label><span class="remo_var_op" opt-id="0">X</span></li>';
	
	/* set option */
	 $(this).parents('.variant-right').find(".wv_widget").append(option_html); 
	/* empty input field */
	$(this).parents('.variant-right').find(".option_val_field").val("");
	
	/*increase variant val no.*/
	
	    var $count_val=$(this).parents('.variant_box_div').find(".variant_val_number");
	    var currentVal = parseInt($count_val.val());
	    $count_val.val(currentVal + 1);
	
});
	
	
//variant values options delete 

  $("body").on("click",".remo_var_op",function(){
		
		var $count_val=$(this).parents('.variant_box_div').find(".variant_val_number");
	    var currentVal = parseInt($count_val.val());
	    $count_val.val(currentVal - 1);
		
		
		$(this).parent("li").remove();
		
		var option_val_id=parseInt($(this).attr("opt-id"));
		
		if(option_val_id > 0){
			$.ajax({
			  url:base_url+'deleteProducVariantValue',        
			  type: 'POST',
			  data: {pro_varaint_val_id: option_val_id},
			  success: function(data) {
				  //console.log(data);
				 
			  }
			});  
		
		}
		
  });
	
//variant delete box	
$("body").on("click",".variant_delete_btn",function(){
	  
	  var pro_varaint_id= $(this).attr('pro_varaint_id');
	  
	  var variant_id= $(this).attr('variant_id');
	  
	  var count_of_varints=$("#count_of_variants").val();
	  
	  count_of_varints=parseInt(count_of_varints);
	  
	  count_of_varints=count_of_varints-1;
	  
	  $("#count_of_variants").val(count_of_varints);
	  
	  
	  $(this).closest(".variant_box_div").remove();
	  
	  
	  $.ajax({
          url:base_url+'deleteProducVariant',        
          type: 'POST',
          data: {pro_varaint_id: pro_varaint_id,count_of_varints:count_of_varints},
          success: function(data) {
			  
			  $(".varianttype_select_box option[variant_id=" + variant_id + "]").removeAttr('disabled');
			  
          }
        });    
	  
	  
 
});
	
	
//increase decrease the val of checkbox count 
	
$("body").on("change","input[type='checkbox'][name=varaint_val]",function(){
	  
 if(this.checked) {  //add
        
	    var $count_val=$(this).parents('.variant_box_div').find(".variant_val_number");
	    var currentVal = parseInt($count_val.val());
	    $count_val.val(currentVal + 1);
	    
    }else{ //minus
	  
		 var $count_val=$(this).parents('.variant_box_div').find(".variant_val_number");
	     var currentVal = parseInt($count_val.val());
	     $count_val.val(currentVal - 1);
		
	}
});	
	
// varaint add form validations	
$(".variant_sub_btn").on("click",function(){
	
	var return_flag=false;
	
	$("[name^=variant_id]").each(function () {
        
		var variant_id =$(this).val();
		
		var sThisVal=0;
		
		var flag=false;
		
		$("#"+variant_id).next(".err").remove();
		
		//find ul li variant options to check at least one checked
		$("#"+variant_id).find("[name^=varaint_val]").each(function () {
		
		 sThisVal = (this.checked ? "1" : "0");
			
         if(sThisVal==1){
	          flag=true;
	       }
		
         })
			
	 if(!flag){
		   
			$("#"+variant_id).after("<span class='err' style='color:red'>At least 1 option required</span>");
			
		     return_flag=true;
		     
		}else{
			
			 $("#"+variant_id).next(".err").remove();
			 
		}
   });
	
	
	$("[name^=variant_name]").each(function () {
        
		if($(this).val() == undefined || $(this).val()=="" ){
			
		    $(this).after("<span class='err' style='color:red'>field is required</span>");
			
			return_flag=true;
			 
			
		 }else{
		     $(this).next(".err").remove();
			 
		 }
		
   });
	
	
	
    /* final return  */
	if(return_flag){
	   return false;
	  }else{
	  return true;
	}
	
	
});
	
	
	
/*message to vendor button*/	
	
	
/*	
$("#msg_to_vendor_btn_pop").on("click",function(e) {
	
	
swal({
  title: 'You are not logged in',
  type: 'info',
  text:'',
  showCancelButton: true,
  confirmButtonClass: "btn-info",
  confirmButtonText: "Login",
  closeOnConfirm: true
},function(){
	
	 window.location.href=base_url+"login";
	
});	

});		
*/


 /* subscribe form slider */
	   
  $("#subscribe_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	  
	  swal({
        title: "",
        text: "Subscribe to our newsletter",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes",
        closeOnConfirm: true
      },
      function(){
		  
        $.ajax({
          url: base_url+'subscribe',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			               
              swal("Submitted", data.message, "success");
              setTimeout(function(){
                 window.location.reload();
              }, 4000); 
          }
        });        
      }); 
	  
	
});  
		
	
	/* customer save personal details form  */   
  $("#customer_personl_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'user_save_personal_detail',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			   
			  if(data.status==201){
			       swal("Warning", data.message, "error");
			   }else{
			     swal("Submitted", data.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"user_dashboard";
               }, 2000); 
			  }
			  
          }
        });        
     
	
});	
	
	
  /* customer add ship address form  */   
  $("#add_address_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'user_addship_address',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			               
              swal("Submitted", data.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"user_dashboard";
              }, 2000); 
          }
        });        
     
	
});
	
 /* customer edit ship address form  */   
  $(".edit_address_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'user_editship_address',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			               
              swal("Submitted", data.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"user_dashboard";
              }, 2000); 
          }
        });        
     
	
});	
	
/*customer shipping address cancel  */
	

	
	
/* customer shipp address show hide from checkout */	
 $('.shipp_add_show').change(function() {
	 
        if(this.checked) {
           var show_status=1;
        }else{
		  var show_status=0;
		}
      
	 var address_id= $(this).attr('data-atr');
	 
  
	 swal({
        title: "Are you sure?",
        text: "",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes",
        closeOnConfirm: false
      },
      function(){
        $.ajax({
          url: base_url+'user_ship_address_status',        
          type: 'POST',
          data: {address_id:address_id,show_status:show_status},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Success!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"user_dashboard";
              }, 1000); 
          }
        });        
      });
	 
});	
	
	
 /* customer save billing address form  */   
  $("#bill_address_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'user_bill_address',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			               
              swal("Submitted", data.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"user_dashboard";
              }, 2000); 
          }
        });        
     
	
});	
	
	
/***********  get states by country ***************/
	$(".country_select_box").on("change",function(){
		
		var country_name=$(this).val();
		 $.ajax({
          url:base_url+'api/web/getStatesByCountry',        
          type: 'POST',
          data: {country_name: country_name},
          success: function(data) {
			  
			 var obj=JSON.parse(data);
			 var option_html="";
			  for(var j=0;j<obj.data.length;j++){
				  
			     option_html +="<option value='"+obj.data[j].name+"'>"+obj.data[j].name+"</option>";
				  
			   }
			  
			  $(".states_select_box").html(option_html);
          }
        });  
		
	});
	
	
		
/***********  get cities by states ***************/
/*
	$(".states_select_box").on("change",function(){
		
		var state_name=$(this).val();
		 $.ajax({
          url:base_url+'api/web/getCitiesByStates',        
          type: 'POST',
          data: {state_name: state_name},
          success: function(data) {
			  
			 var obj=JSON.parse(data);
			 var option_html="";
			  for(var j=0;j<obj.data.length;j++){
				  
			     option_html +="<option value='"+obj.data[j].name+"'>"+obj.data[j].name+"</option>";
				  
			   }
			  
			  $(".cities_select_box").html(option_html);
          }
        });  
		
	});
	*/
	
	
	/*customer append all related states */
	$(".customer_edit_add_btn").on("click",function(){
		
		var no_of_id=$(this).attr('data-no');
		
		var country_name=$("#edit_ship_add_country"+no_of_id).val();
		var state_name=$("#edit_ship_add_state"+no_of_id).val();
		
		$.ajax({
          url:base_url+'api/web/getStatesByCountryAndState',        
          type: 'POST',
          data: {country_name: country_name,state_name:state_name},
          success: function(data) {
			  
			 var obj=JSON.parse(data);
			 
			 var option_html="<option value='"+state_name+"' selected='selected'>"+state_name+"</option>";
		 
			  for(var j=0;j<obj.data.length;j++){
				 
					  option_html +="<option value='"+obj.data[j].name+"' >"+obj.data[j].name+"</option>"; 
				 
			   }
			 
			  
			  $("#edit_ship_add_state"+no_of_id).html(option_html);
          }
        });  
		
	});
	
	
	
 /* contact us form submit form  */   
  $("#contact-us-form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'contact_us_submit',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
	$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			               
              swal("Submitted", data.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"contact_us";
              }, 3000); 
          }
        });        
     
	
});	
	

	
 /* Checkout page login form submit*/ 
 
  $("#checkout_login_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'checkout_page_login_check',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
	$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			          
                if(data.status==201){
					
						$(".submit-btn").css({"background-image":"url()","background-repeat":"no-repeat","background-position":"center"});
					
					    swal("Warning", data.message, "warning");
				}else{
					
					$(".submit-btn").css({"background-image":"url()","background-repeat":"no-repeat","background-position":"center"});
					
					    swal("success", data.message, "success");
					
					 var current_url=window.location.href;
			         var url=current_url.split("#");
			 
		  
					  setTimeout(function(){
						 window.location.href=url[0];
						
					  }, 2000);  
				}
					  
             
              
          }
        });        
     
	
});		
	
	
/*checkout sign up form */	
	
  $("#checkout_register_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'checkout_page_signup_check',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
	$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			          
                if(data.status==201){
					
						$(".submit-btn").css({"background-image":"url()","background-repeat":"no-repeat","background-position":"center"});
					
					    swal("Warning", data.message, "warning");
				}else{
					
					$(".submit-btn").css({"background-image":"url()","background-repeat":"no-repeat","background-position":"center"});
					
					    swal("success", data.message, "success");
					
					
					setTimeout(function(){
                       window.location.href=base_url+"checkout";
                     }, 2000); 
				}
					  
             
              
          }
        });        
     
	
});	
	

	
/******** vendor dahsboard *******/	


 /*vendor upload store logo */
	   
  $("#file-uploadlogo").on("change",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($("#vendor_manage_store_form")[0]);  
	  
	var file = this.files[0];
    var fileType = file["type"];
	
	var reader = new FileReader();
	
    var ValidImageTypes = ["image/jpeg","image/JPEG", "image/png","image/PNG","image/jpg","image/JPG",];
     if ($.inArray(fileType, ValidImageTypes) < 0) {
			
			  toastr.error('Invalid file selected');
			 
        }else{
			reader.onload = function (e) {
		        
				
				     var img = new Image();      
                    img.src = e.target.result;

                    img.onload = function () {
                        var w = parseInt(this.width);
                        var h = parseInt(this.height);
				
				
				if(h >= 100 && h <= 800 && w >= 100 && w <= 800){
					
				  if(w == h){
				
                      $("#store_logo_pre").attr("src", e.target.result);
				  
						$.ajax({
							url: base_url+'store_logo_upload',        
							type: 'POST',
							data: formData,
							processData: false,
							contentType: false,
							dataType: "json",
							beforeSend: function(){
							$(this).css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
							},
							success: function(data) {
								 
                             if(data.status==200){
								 
							 setTimeout(function(){
								 
								 swal("Uploaded", data.message, "success");
							   // window.location.href=base_url;
							  }, 1000); 
								 
								 
							 }else{
								 
								 swal("Error", data.message, "warning");
								 
							    /*setTimeout(function(){
							        window.location.href=base_url;
							     }, 2000); */
							 }
	 
							 
							 }
						}); 
						
					}else{
						 toastr.error('Logo must be square with max height and width of 800px and min height and width of 100px');
						
					}
					
				  }else{
					  
					toastr.error('Logo must be square with max height and width of 800px and min height and width of 100px');
					
				  }
					
						
			       }
				  
               }
			   
          reader.readAsDataURL(file);
			
		}
	
	
}); 


/*vendor upload store Banner */
	   
  $("#file-uploadbanner").on("change",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($("#vendor_manage_store_form")[0]);  
	  
	var file = this.files[0];
    var fileType = file["type"];
	
	var reader = new FileReader();
	
    var ValidImageTypes = ["image/jpeg","image/JPEG", "image/png","image/PNG","image/jpg","image/JPG",];
     if ($.inArray(fileType, ValidImageTypes) < 0) {
			
			  toastr.error('Invalid file selected');
			 
        }else{
			reader.onload = function (e) {
		        
				    var img = new Image();      
                    img.src = e.target.result;

                    img.onload = function () {
                        var w = parseInt(this.width);
                        var h = parseInt(this.height);
			    
			          if(w ==850 &&  h ==350){
						  
						 $("#store_banner_pre").attr("src", e.target.result);
				  
						$.ajax({
							url: base_url+'store_banner_upload',        
							type: 'POST',
							data: formData,
							processData: false,
							contentType: false,
							dataType: "json",
							beforeSend: function(){
							$(this).css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
							},
							success: function(data) {
								 
                             if(data.status==200){
							 
							 setTimeout(function(){
								 
								 swal("Uploaded", data.message, "success");
							   // window.location.href=base_url;
							  }, 1000); 
								 
								 
							 }else{
								 
								 swal("Error", data.message, "warning");
								 
							    /*setTimeout(function(){
							        window.location.href=base_url;
							     }, 2000); */
							 }
	 
							 
							 }
						}); 
						 
			              
					  }else{
						 
						  toastr.error('Image dimension must be width(850 px) and height (350 px) ');
						 
					  }
			      
				};
			 
				  
               }
			   
          reader.readAsDataURL(file);
			
		}
	
	
}); 



//vendor bank details update	
	
 $("#vendor_bank_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'vendor_bank_detail_save',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			               
              swal("Submitted", data.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"vendor_my_account";
              }, 2000); 
          }
        });        
     
	
});	
	
	
/* vendor edit promo code  form  */   
  $(".edit_promo_form").on("submit",function(e) {
	 
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'vendor_update_promo_code',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			   
			  swal("Submitted", data.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"vendor_dashboard";
               }, 2000); 
			  
          }
        });        
     
	
});	
	
	
// vendor change product order status	
 $(".ve_order_status_select").on("change",function() {
	  
	 var order_status=$(this).val();      
     
	 if(order_status==2){
	     
		  $(".track_no_input").prop('required',true);
	  }else{
	     $('.track_no_input').removeAttr("required");
	  }
	 
	
	 
  });
	
// vendor change order status form 	
	
 $(".vendor_pro_status_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'vendor_change_order_status',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			               
              swal("Submitted", data.message, "success");
			  
			 $(".submit-btn").css({"background-image":"","background-repeat":"","background-position":""});
			  
			  var current_url=window.location.href;
			  var url=current_url.split("#");
			 
		  
              setTimeout(function(){
                 window.location.href=url[0];
				
              }, 2000);  
          }
        });        
     
	
});	
	
	
	$('.process_rfnd_btn').on("click",function(){
		
		$(this).parents('.popup').find(".process_refund_div").show();
	});
	
	
	$('.cncl_process_refund_detail').on("click",function(){
		
		$(this).parents('.popup').find(".process_refund_div").hide();
	});
	
	$('.cancel_rfnd_btn').on("click",function(){
		
		$(this).parents('.popup').find(".cancel_refund_div").show();
	});
	
	
	$('.cncl_cncl_refund_detail').on("click",function(){
		
		$(this).parents('.popup').find(".cancel_refund_div").hide();
	});
	
	$('.accept_rfnd_btn').on("click",function(){
		
		$(this).parents('.popup').find(".accept_refund_div").show();
	});
	
	
	$('.cncl_accept_refund_detail').on("click",function(){
		
		$(this).parents('.popup').find(".accept_refund_div").hide();
	});
	
	
	/* vendor refund to customer*/
	
  $(".refund_vendor_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'vendor_refund',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".process_submit").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			         

              console.log(JSON.stringify(data));
				
              if(data.status== 200){
				  
				   swal("Submitted", data.message, "success");
			  
			      $(".sbt_btn_refund").css({"background-image":"","background-repeat":"","background-position":""});
				  
				  var order_product_id=data.data.order_product_id;
				  
				  setTimeout(function(){
					  
                   window.location.href= base_url+'refunded?opi='+order_product_id;
				
                  }, 3000);
				  
				  
				  
			  }else if(data.status== 201){
				  
				   swal("Submitted", data.message, "warning");
			  
			      $(".sbt_btn_refund").css({"background-image":"","background-repeat":"","background-position":""});
				  
				  
			  }else{
				  
				  
				   swal("Submitted", data.message, "warning");
			  
			      $(".sbt_btn_refund").css({"background-image":"","background-repeat":"","background-position":""});
				  
				  // var current_url=window.location.href;
			      // var url=current_url.split("#");
			 
		  
                 /* setTimeout(function(){
                    window.location.href=url[0];
				
                  }, 2000);  */
				  
			  }

				
			 
          }
        });        
     
	
});	
	

	/* vendor refund cancel*/
	
  $(".vendor_refind_cancel_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'vendor_refund_cancel',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".cancel_btn_refund").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			         

                 swal("Submitted", data.message, "success");
			  
			      $(".cancel_btn_refund").css({"background-image":"","background-repeat":"","background-position":""});
				  
				   var current_url=window.location.href;
			       var url=current_url.split("#");
			 
		  
                  setTimeout(function(){
                    window.location.href=url[0];
				
                  }, 2000); 
				
			 
          }
        });        
     
	
});


/* vendor refund accept*/
	
  $(".vendor_refind_accept_form").on("submit",function(e) {
	  
	e.preventDefault(); 
	 
	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'vendor_refund_accept',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".cancel_btn_refund").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			         

                 swal("Submitted", data.message, "success");
			  
			      $(".cancel_btn_refund").css({"background-image":"","background-repeat":"","background-position":""});
				  
				   var current_url=window.location.href;
			       var url=current_url.split("#");
			 
		  
                  setTimeout(function(){
                    window.location.href=url[0];
				
                  }, 2000); 
				
			 
          }
        });        
     
	
});







	
    /* customer place order */
   
    $("#place_order_form").on("submit",function(e) {
	 
	    e.preventDefault(); 
	
	    if($(".checkot_term_check").is(":checked")){
			
		}else{
			toastr.error('Please accept terms and conditions');
			return false;
		}
		
	    var shpping_fname = $(".shpping_fname").val();
		var shpping_lname = $(".shpping_lname").val();
		var shpping_cname = $(".shpping_cname").val();
		var shpping_phn = $(".shpping_phn").val();
		var shpping_street = $(".shpping_street").val();
		var shpping_street2 = $(".shpping_street2").val();
		var shpping_city = $(".shpping_city").val();
		var shpping_postcode = $(".shpping_postcode").val();
		var shpping_country = $(".shpping_country").val();
		var shpping_state = $(".shpping_state").val();
		var billing_fname = shpping_fname; //$(".billing_fname").val();
		var billing_lname = shpping_lname; //$(".billing_lname").val();
		var billing_cname = shpping_cname;//$(".billing_cname").val();
		var billing_phn = shpping_phn;//$(".billing_phn").val();
		var billing_street = shpping_street; //$(".billing_street").val();
		var billing_street2 = shpping_street2; //$(".billing_street2").val();
		var billing_city = shpping_city;//$(".billing_city").val();
		var billing_postcode =shpping_postcode; //$(".billing_postcode").val();
		var billing_country = shpping_country;//$(".billing_country").val();
		var billing_state = shpping_state; //$(".billing_state").val();
		var c_order_id = $(".c_order_id").val();
	
	   /*international shipping check*/
	   
	   var shipping_type=$("#shipping_type").val();
	   var is_deliverable = 1;
	   if(shipping_type == 'international'){
	  
	     var continent = $('option:selected', '.shpping_country').attr('continent');
		
	    $('.ordered_pro_list').each(function(e){
		  
		   var item_shipping_regions = $(this).attr('ship_region');
		   var order_item_name = $(this).attr('order_item_name');
		   var arr_shipping = item_shipping_regions.split(",");
		   
		   if(arr_shipping.indexOf(continent) > -1){
			   
		   }else{
			   //toastr.error("Product "+order_item_name+" is not deliverable to "+shpping_country);
			   toastr.error("Unfortunately this product does not ship to "+shpping_country);
			   is_deliverable = 0;
		   }
		   
	     });
	   }else{
		   if(shpping_country != "australia" && shpping_country != "Australia"){
			   toastr.error("You have not selected international shipping. Please go back to the previous page and select the international shipping option.");
			   is_deliverable = 0;
		   }
	   }
	   
	   if(is_deliverable == 0){
		   return false;
	   }
	
	  /*international shipping check*/
	
	   shpping_street2=shpping_street2 ? shpping_street2 :"";
	   billing_street2=billing_street2 ? shpping_street2 :"";

	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'payment_process',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			$(".place_order_btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			    
               
			   var cookie_data = {shpping_fname:shpping_fname,shpping_lname:shpping_lname,shpping_cname:shpping_cname,shpping_phn:shpping_phn,shpping_street:shpping_street,shpping_street2:shpping_street2,shpping_city:shpping_city,shpping_postcode:shpping_postcode,shpping_country:shpping_country,shpping_state:shpping_state,billing_fname:billing_fname,billing_lname:billing_lname,billing_cname:billing_cname,billing_phn:billing_phn,billing_street:billing_street,billing_street2:billing_street2,billing_city:billing_city,billing_postcode:billing_postcode,billing_country:billing_country,billing_state:billing_state,customer_id:c_order_id,transection_id:''}
			   
			
				if(data.status==200){
					
					
					 cookie_data.transection_id=data.transection_id;
					
					 document.cookie = "order_detail="+JSON.stringify(cookie_data);
					 
					  window.location.href=data.payment_url;
					 
					 console.log(data.payment_url);
					 /*
					 $("#paykey").val(data.transection_id);
					 
					 $("#pay-form").attr("action",data.payment_url);
					
					 $("#submitBtn").trigger("click");
					*/
					
					 
					  $(".place_order_btn").css({"background-image":"","background-repeat":"","background-position":""});
					 
				}else{
					
				  swal("Submitted", "An error has occurred, please try again.", "warning");
				  
				   $(".place_order_btn").css({"background-image":"","background-repeat":"","background-position":""});
				}
              
          }
        });        
     
	
	
});		
		
	/* customer send return item request */
	
	$(".return_requet_form").on("submit",function(e) {
	 
	    e.preventDefault(); 
	
	

	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'return_item_request',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			  
			$(".submit-btn").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			
					
					 swal("Submitted",data.message, "success");
					
					
					  $(".submit-btn").css({"background-image":"","background-repeat":"","background-position":""});
				
				      var current_url=window.location.href;
			         var url=current_url.split("#");
			 
		  
                     setTimeout(function(){
                          window.location.href=url[0];
				
                        }, 2000); 
				
				
                 }
        });        
     
	
});	


     /*customer review rating slider*/
			
		  $('#product_1').addClass('active');
          
          $('#next_product').click(function(){
			  
              var slide_id = $(this).data('slide-id');
              $('#product_'+(slide_id-1)).hide();
              $(this).data("slide-id", slide_id+1 );
             
              $('#product_'+slide_id).show();
            });

           $('#prev_product').click(function(){
		   
		       var slide_id = $(this).data('slide-id');
		      
			  $('#product_'+(slide_id+1)).hide();
              $(this).data("slide-id", slide_id-1 );
		    
              $('#product_2').hide();
              $('#product_'+slide_id).show();
            });
			
		   /*customer review rating slider end*/

	/* customer rating */
	 
	  $(".rate_li").on("click",function() {
		 
		 var rateno= $(this).attr('rate_no');
		 
		 $('.rate_val').val(rateno);
		 
		 $(".wv_rating_popup li").removeClass("rated");
		 
		 for(var i=1;i<=rateno;i++){
			 
			 $(".rate_no"+i).addClass('rated');
			 
		 }
		 
		  
	  }); 
	  
	  
	  /*customer submit review form*/
	  
	 var i = 0;
	 $(".customer_rate_review_form").on("submit",function(e) {
	 i++;
	    e.preventDefault(); 
	
	var thiss = $(this);

	var formData = new FormData($(this)[0]);  
	 	  
        $.ajax({
          url: base_url+'customer_rate',        
          type: 'POST',
          data: formData,
		  processData: false,
          contentType: false,
          dataType: "json",
		  beforeSend: function(){
			  
			$(".login_submit").css({"background-image":"url(/Admin_assets/assets/images/LoaderIcon.gif)","background-repeat":"no-repeat","background-position":"center"});
		},
          success: function(data) {
			
					
					 swal("Submitted",data.message, "success");
					 var parent = thiss.parent(".review_form_parent_div");
					 thiss.remove();
					 var new_html = parent.html();
					 if(new_html.trim() == ""){
						$(".close_popup")[0].click(); 
					 }else{
						 $("#next_product")[0].click(); 
					 }
					
					  $(".login_submit").css({"background-image":"","background-repeat":"","background-position":""});
                 }
        });        
     
	
});	
	 
	/*customer check same add*/
$("#same_add_check").change(function(){
	
	
		if($(this).is(":checked")){
			
			$.ajax({
             url: base_url+'customer_get_shipp_add',        
             type: 'POST',
             data: {},
             success: function(data) {
              var obj = JSON.parse(data);              
              
			    if(obj.status==200){
					
					
					$(".bil_fname").val(obj.data.fname);
					$(".bil_lname").val(obj.data.lname);
					$(".bil_comp").val(obj.data.company_name);
					$(".bil_phone").val(obj.data.phone_no);
					$(".bil_street").val(obj.data.address_line_1);
					$(".bil_street2").val(obj.data.address_line_2);
					$(".bil_city").val(obj.data.city);
					$(".bil_postcode").val(obj.data.postal_code);
					
					
					var state_op='<option value="'+obj.data.state+'" selected="">'+obj.data.state+'</option>';
					
					if(obj.data.state!=""){
						
						$(".bil_country").val(obj.data.country);
						
						$(".bil_state").append(state_op);
					}
					
					
					
					
				}
                
             }
          }); 
			
		}
		
	});
	
	
	/*show image preview thumbnail*/
	/*
	function readURL(input) {
     
	   var page_type=$("#page_type_pro_image").val();
	   var img_no=parseInt($(input).attr('img_no'));
	   var already_pre=0;
	  
	   var extention=$(input).val().split('.').pop();
	  
	   var reader = new FileReader();
	   
	   reader.onload = function (e) {
		        
                   $("#photo"+img_no).attr("src", e.target.result);
				   
                   $("#cropped_img_ext"+img_no).val(extention);
				   
                    makeCropper(img_no);
                  
               }
			   
       reader.readAsDataURL(input.files[0]);
       
    } */
	
	
	/*convert image in to base64 */
	
	function ImageToBbase64(){
		
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			var file_date = reader.result;
			
		};
		reader.onerror = function (error) {
			console.log('Error: ', error);
		};
		
		
		
	}
	
	
	
	/*** add edit product images js**/
	
	function readURL3(input) {
     
	
	   var page_type=$("#page_type_pro_image").val();
	   var img_no=parseInt($(input).attr('img_no'));
	   
	   var alredy_prev=$(".pro_img_pre"+img_no).attr('src');
	   
	   var extention=$(input).val().split('.').pop();
	
	  
	   var reader = new FileReader();
	   
	   reader.readAsDataURL(input.files[0]);
	   
	   reader.onload = function (e) {
		      
			        var img = new Image();      
                    img.src = e.target.result;

                    img.onload = function () {
                        var w = parseInt(this.width);
                        var h = parseInt(this.height);
			    
			          if(w >=400 && w <= 1000 && h >=400 && h <=1000){
						  
						  
						  
						   $("#photo"+img_no).attr("src", e.target.result);
				   
                           $("#cropped_img_ext"+img_no).val(extention);
				   
				           $("#image_width"+img_no).val(w);
						  
				           if(w==h){
							   
							   	var data_base64 = reader.result;
								
								
								
								//$('#cropped_img'+img_no).val(data_base64);
								
								//var blob_data=  dataURItoBlob(data_base64,img_no);
								
								 if(alredy_prev!=undefined){
									 
									 $(".pro_img_pre"+img_no).attr('src',data_base64);
								 }else{
									 
									  $(".preview_selected_images_add"+img_no).append("<div  class='pro_image_pre img_pr_div"+img_no+"'><img width='70' height='70' class='pro_img_pre"+img_no+"' img_pre_no='"+img_no+"' src='"+data_base64+"'><p style='width:100%'>"+w+" X "+h+" px</p><span img_no="+img_no+" class='glyphicon glyphicon-remove cancel_img_pre'></span></div>");
								 }
								
								console.log("yes square image");
							   
						   }else{
							   
							   makeCropper(img_no,".pro_img_pre"+img_no,alredy_prev,w,h);
							   
						   }
                           
						
						  $("#image_err"+img_no).text("");
			              
					  }else{
						  
						
						 if(alredy_prev!=undefined){
							 
							 $(".pro_img_pre"+img_no).attr('src',e.target.result);
						 }else{
							 
							  $(".preview_selected_images_add"+img_no).append("<div  class='pro_image_pre img_pr_div"+img_no+"'><img width='70' height='70' class='pro_img_pre"+img_no+"' img_pre_no='"+img_no+"' src='"+e.target.result+"'><p style='width:100%'>"+w+" X "+h+" px</p><span img_no="+img_no+" class='glyphicon glyphicon-remove cancel_img_pre'></span></div>");
						 }	
						 
						 $("#image_err"+img_no).text("Image dimension must be width(400 min  X 1000 max) and height (400 min  X 1000 max) PX");
						  
					  }
			        
			          
			  
                    
				};
               }
			   
     
       
    } 
	
	
	
	
/*cropper function*/	
function makeCropper(img_no,id="",alredy_prev="",w="",h="") {
	
  var $image = $("#cropper_container"+img_no+" > img");
  
  $image.cropper("destroy");
  
   var originalData = {};


	    $image.cropper({
			
	      aspectRatio: 1/1,
          autoCropArea: 1, // Center 100%
	      resizable: false,
	      zoomable: true,
	      rotatable: true,
	      multiple: true,
          movable:false,
		  imageSmoothingQuality:'low',
	      built: function(data) {   
            	  
          originalData = $image.cropper("getCroppedCanvas");
		  
          //console.log(originalData.toDataURL());
		  
          //$('#cropped_img'+img_no).val(originalData.toDataURL());
		  
		//var blob_data=  dataURItoBlob(originalData.toDataURL(),img_no);
    
       
		  if(alredy_prev != "" && alredy_prev != null){
			  if(alredy_prev!=undefined){
							 
				$(id).attr("src",originalData.toDataURL());
			 }else{
				 
				  $(".preview_selected_images_add"+img_no).append("<div  class='pro_image_pre img_pr_div"+img_no+"'><img width='70' height='70' class='pro_img_pre"+img_no+"' img_pre_no='"+img_no+"' src='"+originalData.toDataURL()+"'><p style='width:100%'>"+w+" X "+h+" px</p><span img_no="+img_no+" class='glyphicon glyphicon-remove cancel_img_pre'></span></div>");
			 }
		  }else{
			 $(".preview_selected_images_add"+img_no).append("<div  class='pro_image_pre img_pr_div"+img_no+"'><img width='70' height='70' class='pro_img_pre"+img_no+"' img_pre_no='"+img_no+"' src='"+originalData.toDataURL()+"'><p style='width:100%'>"+w+" X "+h+" px</p><span img_no="+img_no+" class='glyphicon glyphicon-remove cancel_img_pre'></span></div>");
		  }
		  
		  
        },
        dragend: function(data) {        
          originalData = $image.cropper("getCroppedCanvas");
          //console.log(originalData.toDataURL());
         // $('#cropped_img'+img_no).val(originalData.toDataURL());
		  if(alredy_prev != "" && alredy_prev != null){
			  if(alredy_prev!=undefined){
							 
				$(id).attr("src",originalData.toDataURL());
			 }else{
				 
				  $(".preview_selected_images_add"+img_no).append("<div  class='pro_image_pre img_pr_div"+img_no+"'><img width='70' height='70' class='pro_img_pre"+img_no+"' img_pre_no='"+img_no+"' src='"+originalData.toDataURL()+"'><p style='width:100%'>"+w+" X "+h+" px</p><span img_no="+img_no+" class='glyphicon glyphicon-remove cancel_img_pre'></span></div>");
			 }
		  }else{
			 $(".preview_selected_images_add"+img_no).append("<div  class='pro_image_pre img_pr_div"+img_no+"'><img width='70' height='70' class='pro_img_pre"+img_no+"' img_pre_no='"+img_no+"' src='"+originalData.toDataURL()+"'><p style='width:100%'>"+w+" X "+h+" px</p><span img_no="+img_no+" class='glyphicon glyphicon-remove cancel_img_pre'></span></div>");
		  }
        }
      }); 
}
	
	
var file_crop_array=[];	
 file_crop_array[0]=null;	
 file_crop_array[1]=null;	
 file_crop_array[2]=null;	
 file_crop_array[3]=null;	
 file_crop_array[4]=null;
 
function dataURItoBlob(dataURI,img_no) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

	var file = new File([ia], "abc.png", {type: mimeString, lastModified: Date.now()});
	//console.log(file);
	file_crop_array[img_no-1]=file;
    return file;
   
   // return new Blob([ia], {type:mimeString});
}	
	

	
	
/*set height the cropper div*/
	var cw = $('.cropper').width();

	$('.cropper').css({
       'height': cw + 'px'
    });
     
	 /***** select product image file from add edit product ******/
    $("body").on("change",".pro_files_class",function () {
		
		
		var page_type=$("#page_type_pro_image").val();
		
		var file = this.files[0];
        var fileType = file["type"];
        var ValidImageTypes = ["image/jpeg","image/JPEG", "image/png","image/PNG","image/jpg","image/JPG",];
        if ($.inArray(fileType, ValidImageTypes) < 0) {
			
			  toastr.error('Invalid file selected');
			  
			  if(page_type=='add_product'){
				   $(".add_product_form").attr("disabled", true);
			  }else{
				  
				   $(".edit_product_form").attr("disabled", true);
			  }
             
			
			  
        }else{
		    
			 if(page_type=='edit_product'){
			
			   $(".edit_product_form").removeAttr("disabled");
			 
			 }
			 
			 readURL3(this);
		 }
		
    });
	

	/**** remove img previous *****/
	
	$('body').on("click",'.cancel_img_pre',function(){
		
		var page_type=$("#page_type_pro_image").val();
		
		var img_no=$(this).attr('img_no');
		
		$("#pro_files"+img_no).parent().find('span').html("No file selected");
        $("#pro_files"+img_no).val("");
		$('.img_pr_div'+img_no).remove();
		
		file_crop_array[img_no] =null;
		
		/*cropper image remove */
		$("#photo"+img_no).attr("src","");
		$("#cropped_img"+img_no).val("");
		$("#cropped_img_ext"+img_no).val("");
		$("#image_width"+img_no).val("");
		
		/*remove image error*/
		$('#image_err'+img_no).text("");
		
		
		/*check image files size are correct*/
		var flag=false;
		$('.pro_files_class').each(function (index, value) { 
             
			 if($(this).val()){
				  flag=true;
			 }
        });
		
		if(flag){
			
			if(page_type=="add_product"){
					//add product btn 
				if(!$('.add_product_form')[0].hasAttribute('disabled')){
				  $(".add_product_form").removeAttr("disabled");
				  $(".add_product_form").removeAttr("title");
				};
			}else{
				
				//edit product btn 
			 if(!$('.edit_product_form')[0].hasAttribute('disabled')){
				  $(".edit_product_form").removeAttr("disabled");
				  $(".edit_product_form").removeAttr("title");
			  };
			  
			}
			
			
		}else{
			
			if(page_type=="add_product"){
			   //add product btn 
			  $(".add_product_form").removeAttr("disabled");
			  $(".add_product_form").removeAttr("title");
			}else{
			//edit product btn 
				$(".edit_product_form").removeAttr("disabled");
				$(".edit_product_form").removeAttr("title");
			}
		}
		
					 
		
	});
	
	var page = -1;
	var call_ajax = 1;
	
	$(".show_ratings_popup").on("click",function(){
		var id = $(this).attr("data-id");
		page = page + 1;
		if(call_ajax == 1){
			$.ajax({
			  url: base_url+'get_product_ratings_reviews',        
			  type: 'POST',
			  data: {product_id: id,page:page},
			  success: function(data) {
				  if(data == ""){
					  call_ajax = 0;
				  }else{
					  if(page == 0){
						  $(".review_append_container").html(data);
					  }else{
						  $(".review_append_container").append(data);
					  }
				  }
			  }
			});
		}
	});
	
	$(".review_append_container").scroll(function(){
        if ($('.review_append_container').height() - $('.review_append_container').scrollTop()  <= $('.review_append_container').height() ) {
			load_more_reviews();	
        }
    });
	
	function load_more_reviews(){
		var id = $(".show_ratings_popup").attr("data-id");
		page = page + 1;
		if(call_ajax == 1){//console.log("dsadas");
			$.ajax({
			  url: base_url+'get_product_ratings_reviews',        
			  type: 'POST',
			  data: {product_id: id,page:page},
			  success: function(data) {
				  if(data == ""){
					  call_ajax = 0;
				  }else{
					  if(page == 0){
						  $(".review_append_container").html(data);
					  }else{
						  $(".review_append_container").append(data);
					  }
				  }
			  }
			});
		}
	}
	
	$(document).ready(function(){
		var url = window.location.href;
		if(url.indexOf("#review_rating_popup") !== -1){
			window.history.replaceState(null, null, "#review_rating_popup");
		}
	});
	
	/***** add more image option on product upload ***/
	$("#add_more_img").on("click",function(){
		
		var total_img=parseInt($("#total_imgs").val());
		
		total_img=total_img+1;
		$("#total_imgs").val(total_img);
		var image_div='<div class="upload-btn"> <span>No file selected</span> <label for="pro_files'+total_img+'">Choose File</label> <input type="file" id="pro_files'+total_img+'"  name="pro_image'+total_img+'" class="FilesUploader pro_files_class" img_no="'+total_img+'" accept="image/*"> </div>';
		
		var crop_image_div='<div class="cropper" id="cropper_container'+total_img+'" style="height:500px"><img id="photo'+total_img+'" class="cropper_photo" src="./front_assets/img/placeholder.png" alt=""/><input type="hidden" name="cropped_img'+total_img+'" id="cropped_img'+total_img+'" value=""/><input type="hidden" name="cropped_img_ext'+total_img+'" id="cropped_img_ext'+total_img+'" value=""/></div>';
		
		
		if(total_img<=5){
			
		  $(".pic_upload").append(image_div);
		  $(".cropper_main_div").append(crop_image_div);
		  
		}
	});
	
	
	
	/*vendor add/edit product sell price change on regular price*/
	
	
	
	
	/*vendor add/edit product check sell price less than regular price  */
	
	
/*	$("#sell_price_id").on("blur",function(){
		
		var sale_price=$(this).val();	
		var regular_price=$("#regular_price_id").val();
		
		sale_price=parseInt(sale_price);
		regular_price=parseInt(regular_price);
		
		if(sale_price>regular_price){
			
			toastr.error('sale price should be less than regular price ');
			setTimeout(function(){
                // $(this).val(regular_price);
              }, 1000); 
			
		}
		
	});
	
	*/
	
});






/*get Instagram feeds */

/*
$("#instagram_div").ready(

function(){
	
	$.ajax({
          url: 'https://api.instagram.com/v1/users/self/media/recent/?count=5&access_token=6897437714.2d42b8e.b76c64bd23324de39721ef81a6b62d6a',        
          type: 'GET',
          success: function(data) {
			  
			    console.log(data);
				
                if(data.meta.code == 200 && data.data.length>0){
					
					var feeds=data.data;
					var feeds_div='';
					
					for(var i=0;i<feeds.length;i++){
						
						feeds_div +='<div class="inner-insta-div"><a href="'+feeds[i].link+'" target="_blank"> <img src="'+feeds[i].images.standard_resolution.url+'"></a></div>'	;				
						
						}
						
						$("#instagram_div").html(feeds_div);
				}         
             
          }
        });
	
}); */



/* add variant product js function */

function addVariantValueField(e){

 var option_val=$(".option_val_field").val();
	
	
 var option_html='<li> <input type="checkbox" class="grey" name="varaint_val" id="grey"> <label        for="grey" value="'+option_val+'">'+option_val+'</label></li>';
	
	$(e).prev(".wv_widget").append(option_html);
	
}


/** delete product by vendor  **/	
function productDelete(id){
	
   var base_url=$('#base_url_input').val();
	
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
          url: base_url+'vendor_delete_product',        
          type: 'POST',
          data: {product_id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"vendor_manage_product";
              }, 1000); 
          }
        });        
      });     
    }    
  }	


/** delete product by vendor  **/	
function deleteProductImg(id,product_id){
	
   var base_url=$('#base_url_input').val();

   var remaining_images=$("#total_images").val();
	
    if(remaining_images == 1){
		 swal("Warning","Minimum one image is required", "warning");
	     return;
    }
   
   
   
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
          url: base_url+'delete_product_image',        
          type: 'POST',
          data: {image_id: id},
          success: function(data) {
			  
              var obj = JSON.parse(data);   
			  
              swal("Deleted!", obj.message, "success");
			  
			   var total_image=$("#total_images").val();
			  
			  total_image=total_image-1;
			  
			  $("#total_images").val(total_image);
			  
			 
			  
              setTimeout(function(){
                  window.location.href=base_url+"vendor_edit_product?product_no="+product_id;
              }, 1000); 
          }
        });        
      });     
    }    
  }

/** delete promo  code by vendor  **/	

function deletePromoCode(id){
	
   var base_url=$('#base_url_input').val();
	
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
          url: base_url+'vendor_delete_promocode',        
          type: 'POST',
          data: {promo_id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"vendor_dashboard";
              }, 1000); 
          }
        });        
      });     
    }    
  }

/* vendor delete account */
function DeleteVendorAccount(){
	
   var base_url=$('#base_url_input').val();
 
      swal({
        title: "Are you sure?",
        text: "you want to permanently delete your account",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){
        $.ajax({
          url: base_url+'vendor_delete_account',        
          type: 'POST',
          data: {},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url;
              }, 3000); 
          }
        });        
      });     
       
  }



/**** customer delete shipping address ***/

/** delete product by vendor  **/	
function deleteCustomerShipAdd(id){
	
   var base_url=$('#base_url_input').val();
	
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
          url: base_url+'user_ship_address_delete',        
          type: 'POST',
          data: {address_id: id},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url+"user_dashboard";
              }, 1000); 
          }
        });        
      });     
    }    
  }	


  
  function deleteCustomerAccount(){
	
   var base_url=$('#base_url_input').val();
	
     
      swal({
        title: "Are you sure?",
        text: "you want to permanently delete your account?",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){
        $.ajax({
          url: base_url+'customer_delete_account',        
          type: 'POST',
          data: {},
          success: function(data) {
              var obj = JSON.parse(data);              
              swal("Deleted!", obj.message, "success");
              setTimeout(function(){
                  window.location.href=base_url;
              }, 1000); 
          }
        });        
      });     
      
  }	
  


/*get autocomplete address suggestion and lat long*/
/*
 var options = {
  types: ['establishment'],
  componentRestrictions: {country: "au"}
 };

var autocomplete = new google.maps.places.Autocomplete($(".auto_location")[0], options);

google.maps.event.addListener(autocomplete, 'place_changed', function() {
	
    var place = autocomplete.getPlace();
    var lat  =place.geometry.location.lat;
    var lng =place.geometry.location.lng;
	
	//set lat,lng in input
    $(".lat").val(lat);
    $(".lng").val(lng);
	
});

var options1 = {};   
var autocomplete1 = new google.maps.places.Autocomplete($(".auto_location1")[0], options1);
google.maps.event.addListener(autocomplete1, 'place_changed', function() {
	
    var place = autocomplete.getPlace();
    var lat  =place.geometry.location.lat;
    var lng =place.geometry.location.lng;
	
	//set lat,lng in input
    $(".lat").val(lat);
    $(".lng").val(lng);
	
}); */

/*get autocomplete address suggestion and lat long end*/



  