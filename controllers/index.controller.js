var express = require("express");
var router = express.Router();
var request = require("request");
var config = require("../config.json");
var path = require('path');
var appDir = path.dirname(require.main.filename);
var helpers = require("../helpers/helpers");
var userService = require("../services/service");
var fs = require('fs');
var mysql = require("mysql");
var uniqid = require('uniqid');
var moment = require('moment');
moment().format();

var https = require('https');
 
// email = email.replace(/'/g, "''");

/* website main page */
router.get("/",siteVisit,function (req, res, next) {
	
 
 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,insta_data:[]};

 data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
 data.meta_desc="Find the best Austrlian brands and designers at Prazar";
 
 data.og_img="front_assets/img/prazar.png";
 data.og_url=config.siteUrl;
 data.og_type="website";

 
 
 /*customer registration msg*/	
data.register_success=req.flash('reg_success');
 
 
 /*get instagran feeds*/
 var insta_access_token=config.insat_acess_token;
 
 request.get('https://api.instagram.com/v1/users/self/media/recent/?count=5&access_token='+insta_access_token+'',function(error, response, body){
		
		//console.log('body:', body);
		
		body =JSON.parse(body);
		
		data.insta_data=body.data;
	
 /* 2 cta section slider */
 var cta_banner_sql = "select * from cta_banners  order by id asc limit 2";
	
   userService.runQuery(cta_banner_sql).then(function(result_cta){
	
	data.cta_banners=result_cta;	
	
 var sql = "select * from home_page_banners where is_active=1 and is_deleted=0 order by id desc";
	
   userService.runQuery(sql).then(function(result){
		 
	   data.sliders=result;
	   
	 var sql_blue = "select * from homepage_content ";
	
   userService.runQuery(sql_blue).then(function(result_blue){  
	   
	    if(result_blue.length >0){
				
			   data.blue_section=result_blue[0];
				
			}else{
				
			     data.blue_section={};
			 }
	   
	   
	    //get popular products
		 
		  var sql_products = "select product.product_name,product.product_id,product.slug,product.sale_price , product.quantity,product.product_type,product.is_customizable,store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product.slug in (select product_slug from popular_products where is_active = 1 and is_deleted=0 order by id desc )and product.is_active=1 and product.is_deleted=0  limit 6 ";
		 
     userService.runQuery(sql_products).then(function(result_pop){
		 
		 if(result_pop.length>0){
		 
			 var count=0;
			 
			 var callback_ratings=function(flag,index,result_rating){
			 
			     count++;
			     if(result_rating[0].average_rates == null){
				   result_rating[0].average_rates = 0;
			     }
				 
				 result_pop[index]['ratings'] = result_rating[0];
				 
				 if(count>=result_pop.length){
				 
					 data.populars_pro=result_pop;
					 
					  //final second
		             res.render('front/index',{title: "Home - The home of Australia's finest brands - Prazar",base_url:config.siteUrl,data:data});
					 
				  }
				 
			  }
			 
			 var callback_image=function(flag,index,result_img){
			 
				     result_pop[index]['images']= result_img;
				 
				     var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+result_pop[index].product_id;
				 
			userService.runQueryCallback(sql_ratings,index,callback_ratings);
				 
				 
			      }
			 
			 
			 for(var i=0;i<result_pop.length;i++){
			         
				        var product_id = result_pop[i]['product_id'];
						
						var get_product_images = "select * from product_images where product_id = "+product_id+" limit 1";
						userService.runQueryCallback(get_product_images,i,callback_image);
				 
			    }
			 
			 
		  }else{
			  
		     data.populars_pro=[];
			  
	        //final first
		    res.render('front/index',{title: "Home - The home of Australia's finest brands - Prazar ",base_url:config.siteUrl,data:data}); 
			  
		  }
		 
	
		 
	}).catch(function (err3) { console.log(err3);
				   
		 data.error="internal server error";
	     res.render('front/index',{title: 'Prazar Home ',base_url:config.siteUrl,data:data}); 

    });
	   
	
	  }).catch(function (err1){ 
	  data.error="internal server error";
	  res.render('front/index',{title: 'Prazar Home ',base_url:config.siteUrl,data:data});
   });	 
	   
	   
	}).catch(function (err){ 
	  data.error="internal server error";
	  res.render('front/index',{title: 'Prazar Home ',base_url:config.siteUrl,data:data});
   });	
	
	}).catch(function (err0){ 
	  data.error="internal server error";
	  res.render('front/index',{title: 'Prazar Home ',base_url:config.siteUrl,data:data});
   });
	
	});
	
		 
});

/* Login page */
router.all("/login",function (req, res, next) {
	
	 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,error:"",categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
   
     data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
     data.meta_desc="Login to your Prazar dashboard and start shopping Australia's favourite brands";
   
     data.og_img="front_assets/img/prazar.png";
	  
	  data.og_url=config.siteUrl+"login";
      data.og_type="website";
	  
	  
    if (req.session && req.session.userdata) {
         res.redirect("/");
		 return ;
      }
   
   
     // set remember me data
     if(req.cookies.remember_me_data!=undefined){
	   data.remembe_data=req.cookies.remember_me_data;
     }
  
   
	if(req.body.sub){ //post method
		
		var email=req.body.email;
		var remember_me=req.body.remember_me?req.body.remember_me:"";
		var password=String(req.body.password);
		
	    var sql = "select * from users where email="+mysql.escape(email)+"";
      
         userService.runQuery(sql).then(function(result){
			 
		 if(result.length>0){
		
		    var is_active=parseInt(result[0].is_active);
			
		     if(is_active==0){
				 
				 
				 data.error="Your account was blocked";
				 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
				 
				 return;
			 }
		
		    var is_deleted=parseInt(result[0].is_deleted);
			
		    if(is_deleted==1){
				 
				 
				 data.error="Your account was deleted";
				 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
				 
				 return;
			 }
		
		
			 var db_password=result[0]['password'];
			 var pass_arr = db_password.split(";");
			 
			 var salt_str=pass_arr[0];
			 
		helpers.hashPassword1(password,salt_str,function(err,hashed_pass){	 
			 		
		 if(hashed_pass==db_password){

              //remember me data
              if(remember_me!=""){
					var options = {
					maxAge: 1000*60*60*24*5, // would expire after 5 days
					httpOnly: true, // The cookie only accessible by the web server
					signed: false // Indicates if the cookie should be signed
					}
				 
				 var cookie_data={email:email,pass:password,remember:"yes"};
				 
				 if(req.cookies.remember_me_data==undefined){
					 res.cookie('remember_me_data',cookie_data,options);
				 }
				 
		       }else{
				   res.clearCookie("remember_me_data");
			   }

		   
			if(req.cookies.cart_items != undefined){   //check cart items in cookies
			
				var items = JSON.parse(req.cookies.cart_items); 
				
				var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ";
				
				var sql_ins_part="";
				
				var j = 0;
				
				var caallback =function(flag,index,call_result){
				   
				       j++;
				   
					   if(call_result.length == 0){
						   
						var variation_json_str = JSON.stringify(items[index].variation_json);
						var quantity = items[index].quantity;
						var product_type = items[index].product_type;
						var is_customizable = items[index].is_customizable;
						var sale_price = items[index].sale_price;
						var prd_id = items[index].prd_id;
						
						var uid = result[0].user_id;
						var customization_data = items[index].custom_text;
						
						var today_time=helpers.getUtcTimestamp();
					   
					    sql_ins_part += " ('"+uid+"','"+prd_id+"','"+quantity+"','"+today_time+"','"+is_customizable+"','"+customization_data+"','"+product_type+"','"+variation_json_str+"'),";
						
					  }
				  
				  //loop end
				  if(j>=items.length){
                       
					   if(sql_ins_part ==""){
							
							var full_sql_insert="select count(id) as total from cart_items ";
						}else{
							 sql_ins_part = sql_ins_part.substring(0, sql_ins_part.length - 1);
						     var full_sql_insert = sql_ins+sql_ins_part;
						}
					   
				
				      userService.runQuery(full_sql_insert).then(function(r){
				  
								var role = result[0].role;
								var user_id = result[0].user_id;
								var cart_count = 0; 			
								var isConsumer= role & 0001 ;	 
								var isVendor= role & 0010 ;	 
										
										 
								if(isConsumer){ //consumer role
								userService.runQuery("select count(id) as cart_count from cart_items where customer_id = "+user_id).then(function(re){
									var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:re[0].cart_count};
									req.session.userdata=session_data;
									if(req.cookies.checkout_items != undefined){ 
										
										res.redirect("/");
										
									}else{
										res.redirect("/");
									}
								}).catch(function(er){
									 data.error="internal server error";
									 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
								});


								}else if(isVendor){ //vendor role


								var sql1 = "select store_id from store where vendor_id="+user_id+"";

								userService.runQuery(sql1).then(function(result1){ 
								 
								  var store_id=result1[0]['store_id'];
								 
								  var session_data={user_id:user_id,
													user_role:"vendor",
													role:0010,
													email:email,
													store_id:store_id,
													cart_count:0
												   };
								  req.session.userdata=session_data;
								  res.redirect("/vendor_dashboard");
								 
								}).catch(function (err1){ 
								  data.error="internal server error";
								  res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
								});


								}else{ // admin role

								 data.error="internal server error";
								 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
								}
								
								
							 }).catch(function(e){console.log(e);
								 
								 
							 });
								
							}
				  
			    }
				
				//console.log(" item length "+ items.length);
				// loop trough items
				for(var i = 0;i<items.length;i++){
					
					var variation_json_str = JSON.stringify(items[i].variation_json);
					var quantity = items[i].quantity;
					var product_type = items[i].product_type;
					var is_customizable = items[i].is_customizable;
					var sale_price = items[i].sale_price;
					var prd_id = items[i].prd_id;
					
					var uid = result[0].user_id;
					var customization_data = items[i].custom_text;
					
					var today_time=helpers.getUtcTimestamp();
					
					var sql_chk = "select * from cart_items where customer_id = "+uid+" and product_id = "+prd_id+" and is_customizable = "+is_customizable+" and customization_data = '"+customization_data+"' and is_variable = "+product_type+" and variation_data = '"+variation_json_str+"'";
					console.log("sql_chk  "+sql_chk);
					userService.runQueryCallback(sql_chk,i,caallback);
					
				}  
				
				res.clearCookie('cart_items');
				
			}else{
				
				var role = result[0].role;
				var user_id = result[0].user_id;
				var cart_count = 0; 
				
				var isConsumer= role & 0001 ;	 
				var isVendor= role & 0010 ;	 
				
				 
				if(isConsumer){ //consumer role
					userService.runQuery("select count(id) as cart_count from cart_items where customer_id = "+user_id).then(function(re){
						var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:re[0].cart_count};
						req.session.userdata=session_data;
						if(req.cookies.checkout_items != undefined){ 
							
							res.redirect("/");
						}else{
							res.redirect("/");
						}
					}).catch(function(er){
						 data.error="internal server error";
						 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
					});
					
					
				}else if(isVendor){ //vendor role
					
					
				var sql1 = "select store_id from store where vendor_id="+user_id+"";
		   
				 userService.runQuery(sql1).then(function(result1){ 
					 
					  var store_id=result1[0]['store_id'];
					 
					  var session_data={user_id:user_id,
										user_role:"vendor",
										role:0010,
										email:email,
										store_id:store_id,
										cart_count:0
									   };
					  req.session.userdata=session_data;
					  res.redirect("/vendor_dashboard");
					 
				 }).catch(function (err1){ 
					  data.error="internal server error";
					  res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
				 });
				
					
				}else{ // admin role
					
					 data.error="internal server error";
					 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
				}
			}
            
			 
		 }else{ //invalid password
				  
			     data.error="Invalid Password";
				 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
			 }
		
			});
			 
			 
			 }else{
			      
				 data.error="Invalid Email";
				 res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
				 
			 }
			 
		 
		 }).catch(function (err){ console.log(err);

		res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});

	    });
			
		
	
	}else{  //get method
	
		res.render('front/login',{title: "Login Shop Australia's finest brands Prazar",base_url:config.siteUrl,data:data});
		
	 }
	
    
});


/*checkout page login check*/

router.post('/checkout_page_login_check',function(req,res) {


var email=req.body.email_id ;
var pass=req.body.pass ;

var today_time=helpers.getUtcTimestamp();

 var password=String(pass);


var sql = "select * from users where email="+mysql.escape(email)+"";

   userService.runQuery(sql).then(function(result){
 
   if(result.length>0){
   
   
var is_active=parseInt(result[0].is_active);

     if(is_active==0){
 
  var response ={status:201,message:"Your account was blocked",data:[]};	 
                  res.send(JSON.stringify(response));
 
return;
}

    var is_deleted=parseInt(result[0].is_deleted);
    if(is_deleted==1){
 
var response ={status:201,message:"Your account was deleted",data:[]};	 
                  res.send(JSON.stringify(response));
 
return;
}


var db_password=result[0]['password'];
var pass_arr = db_password.split(";");
 
var salt_str=pass_arr[0];
 
     helpers.hashPassword1(password,salt_str,function(err,hashed_pass){
 
                if(hashed_pass==db_password){

        
var role = result[0].role;
var user_id = result[0].user_id;
var cart_count = 0; 
var isConsumer= role & 0001 ;	 

if(isConsumer){	

      //logged in
       var session_data={user_id:user_id,user_role:"consumer",role:role,email:email,cart_count:cart_count};

     	

if(req.cookies.cart_items != undefined){   //check cart items in cookies

var items = JSON.parse(req.cookies.cart_items); 

var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ";

var sql_ins_part="";

var j = 0;

var caallback =function(flag,index,call_result){

j++;

if(call_result.length == 0){

var variation_json_str = JSON.stringify(items[index].variation_json);
var quantity = items[index].quantity;
var product_type = items[index].product_type;
var is_customizable = items[index].is_customizable;
var sale_price = items[index].sale_price;
var prd_id = items[index].prd_id;

var uid = result[0].user_id;
var customization_data = items[index].custom_text;

var today_time=helpers.getUtcTimestamp();

sql_ins_part += " ('"+uid+"','"+prd_id+"','"+quantity+"','"+today_time+"','"+is_customizable+"','"+customization_data+"','"+product_type+"','"+variation_json_str+"'),";

}

//loop end
if(j>=items.length){

                   if(sql_ins_part ==""){
							
							var full_sql_insert="select count(id) as total from cart_items ";
						}else{
							 sql_ins_part = sql_ins_part.substring(0, sql_ins_part.length - 1);
						     var full_sql_insert = sql_ins+sql_ins_part;
						}


userService.runQuery(full_sql_insert).then(function(r){


userService.runQuery("select count(id) as cart_count from cart_items where customer_id = "+user_id).then(function(re){
var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:re[0].cart_count};
req.session.userdata=session_data;
if(req.cookies.checkout_items != undefined){ 

  req.session.userdata=session_data;


var response ={status:200,message:"Logged in successful",data:[]};
 
                                         res.send(JSON.stringify(response));

}else{

  req.session.userdata=session_data;
var response ={status:200,message:"Logged in successful",data:[]};
 
                                        res.send(JSON.stringify(response));
}
}).catch(function(er){
  var response ={status:201,message:"Some error occurred please try again",data:[]};
 
                                      res.send(JSON.stringify(response));
});

}).catch(function(e){

var response ={status:201,message:"Some error occurred please try again",data:[]};
 
                                     res.send(JSON.stringify(response));
});

}

}

// loop trough items
for(var i = 0;i<items.length;i++){

var variation_json_str = JSON.stringify(items[i].variation_json);
var quantity = items[i].quantity;
var product_type = items[i].product_type;
var is_customizable = items[i].is_customizable;
var sale_price = items[i].sale_price;
var prd_id = items[i].prd_id;

var uid = result[0].user_id;
var customization_data = items[i].custom_text;

var today_time=helpers.getUtcTimestamp();

var sql_chk = "select * from cart_items where customer_id = "+uid+" and product_id = "+prd_id+" and is_customizable = "+is_customizable+" and customization_data = '"+customization_data+"' and is_variable = "+product_type+" and variation_data = '"+variation_json_str+"'";

userService.runQueryCallback(sql_chk,i,caallback);

}  

res.clearCookie('cart_items');

}else{
  req.session.userdata=session_data;
var response ={status:200,message:"Logged in successful",data:[]};
 
                                    res.send(JSON.stringify(response));

}
 
  //////////////
 
 
}else{

var response ={status:201,message:"please login with consumer",data:[]};
                            res.send(JSON.stringify(response));
}	

}else{

var response ={status:201,message:"Incorrect password",data:[]};
 
                    res.send(JSON.stringify(response));
}

     });
   
    }else{

  var response ={status:201,message:"Incorrect email",data:[]};
 
                  res.send(JSON.stringify(response));
}
   
}).catch(function (err1){ console.log(err1);

      var response ={status:201,message:"Some error occurred please try again",data:[]};
 
                  res.send(JSON.stringify(response));
   
   });

   
});

/* checkout  page signup check */

router.all("/checkout_page_signup_check",function (req, res, next) {
	
        var newsletter=req.body.newsletter ? req.body.newsletter :0;
	    var email=req.body.email_id;
	    var name=req.body.uname;
	    var last_name=req.body.last_name;
		var password=String(req.body.pass);
		var role=0001;
	 
	    var fullname = name+" "+last_name;
		
	    var today_time=helpers.getUtcTimestamp();
	 
	     var sql = "select user_id from users where email="+mysql.escape(email)+" and is_deleted=0";
      
         userService.runQuery(sql).then(function(result){
			 
		 if(result.length==0){
		
		 var salt_str= uniqid();
			
		 helpers.hashPassword1(password,salt_str,function(err,hashed_pass){	 
			 		
		  var sql1 = "INSERT INTO `users`(`name`,`fname`,`lname`, `email`, `password`, `role`, `registered_on`) VALUES ("+mysql.escape(fullname)+","+mysql.escape(name)+","+mysql.escape(last_name)+","+mysql.escape(email)+",'"+hashed_pass+"',"+role+","+today_time+")";
      
           userService.runQuery(sql1).then(function(result1){
		   
			    var user_id=result1.insertId;
				
			    var session_data={user_id:user_id,user_role:"consumer",role:role,email:email,cart_count:0};
				
				
				
			    var sql3 = "INSERT INTO `customers`(`user_id`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `country`, `phone_no`) VALUES ("+user_id+",'','','','','','','')";
      
           userService.runQuery(sql3).then(function(result3){
			   
			      if(newsletter==0){
				     //final 1
					 
					   if(req.cookies.cart_items != undefined){   //check cart items in cookies
			
				var items = JSON.parse(req.cookies.cart_items); 
				
				var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ";
				
				var sql_ins_part="";
				
				var j = 0;
				
				var caallback =function(flag,index,call_result){
				   
				       j++;
				   
					   if(call_result.length == 0){
						   
						var variation_json_str = JSON.stringify(items[index].variation_json);
						var quantity = items[index].quantity;
						var product_type = items[index].product_type;
						var is_customizable = items[index].is_customizable;
						var sale_price = items[index].sale_price;
						var prd_id = items[index].prd_id;
						
						var uid = user_id;
						var customization_data = items[index].custom_text;
						
						var today_time=helpers.getUtcTimestamp();
					   
					    sql_ins_part += " ('"+uid+"',"+mysql.escape(prd_id)+","+mysql.escape(quantity)+",'"+today_time+"',"+mysql.escape(is_customizable)+","+mysql.escape(customization_data)+","+mysql.escape(product_type)+","+mysql.escape(variation_json_str)+"),";
						
					  }
				  
				  //loop end
				  if(j>=items.length){

				        if(sql_ins_part ==""){
							
							var full_sql_insert="select count(id) as total from cart_items ";
						}else{
							 sql_ins_part = sql_ins_part.substring(0, sql_ins_part.length - 1);
						     var full_sql_insert = sql_ins+sql_ins_part;
						}
				  
				      userService.runQuery(full_sql_insert).then(function(r){
				  
								
								userService.runQuery("select count(id) as cart_count from cart_items where customer_id = "+user_id).then(function(re){
									var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:re[0].cart_count};
									req.session.userdata=session_data;
									if(req.cookies.checkout_items != undefined){ 
										
										  req.session.userdata=session_data;
					   
				                         var response ={status:200,message:"Sign up successfully",data:[]};
							  
                                       res.send(JSON.stringify(response));
										
									}else{
										  req.session.userdata=session_data;
					   
				                          var response ={status:200,message:"Sign up successfully",data:[]};
							  
                                        res.send(JSON.stringify(response));
									}
								}).catch(function(er){
									 var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                                     res.send(JSON.stringify(response));
								});
								
								
							 }).catch(function(e){
								 
								 
								  var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                                  res.send(JSON.stringify(response));
							 });
								
							}
				  
			    }
				
				// loop trough items
				for(var i = 0;i<items.length;i++){
					
					var variation_json_str = JSON.stringify(items[i].variation_json);
					var quantity = items[i].quantity;
					var product_type = items[i].product_type;
					var is_customizable = items[i].is_customizable;
					var sale_price = items[i].sale_price;
					var prd_id = items[i].prd_id;
					
					var uid = user_id;
					var customization_data = items[i].custom_text;
					
					var today_time=helpers.getUtcTimestamp();
					
					var sql_chk = "select * from cart_items where customer_id = "+uid+" and product_id = "+mysql.escape(prd_id)+" and is_customizable = "+mysql.escape(is_customizable)+" and customization_data = "+mysql.escape(customization_data)+" and is_variable = "+mysql.escape(product_type)+" and variation_data = "+mysql.escape(variation_json_str)+"";
					
					userService.runQueryCallback(sql_chk,i,caallback);
					
				}  
				
				res.clearCookie('cart_items');
				
			}else{
				
				
				      req.session.userdata=session_data;
					   
				      var response ={status:200,message:"Sign up successfully",data:[]};
							  
                      res.send(JSON.stringify(response));
				
			}
				   
			      }else{
				   
				   
				   var today_time=helpers.getUtcTimestamp();
				   
				    var sql2 = " INSERT INTO `subscribers`(`email`, `entry_time`) VALUES ("+mysql.escape(email)+","+today_time+")";
      
                   userService.runQuery(sql2).then(function(result2){
				     //final 2
					   
					   if(req.cookies.cart_items != undefined){   //check cart items in cookies
			
				var items = JSON.parse(req.cookies.cart_items); 
				
				var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ";
				
				var sql_ins_part="";
				
				var j = 0;
				
				var caallback =function(flag,index,call_result){
				   
				       j++;
				   
					   if(call_result.length == 0){
						   
						var variation_json_str = JSON.stringify(items[index].variation_json);
						var quantity = items[index].quantity;
						var product_type = items[index].product_type;
						var is_customizable = items[index].is_customizable;
						var sale_price = items[index].sale_price;
						var prd_id = items[index].prd_id;
						
						var uid = user_id;
						var customization_data = items[index].custom_text;
						
						var today_time=helpers.getUtcTimestamp();
					   
					    sql_ins_part += " ('"+uid+"',"+mysql.escape(prd_id)+","+mysql.escape(quantity)+",'"+today_time+"',"+mysql.escape(is_customizable)+","+mysql.escape(customization_data)+","+mysql.escape(product_type)+","+mysql.escape(variation_json_str)+"),";
						
					  }
				  
				  //loop end
				  if(j>=items.length){

				        sql_ins_part = sql_ins_part.substring(0, sql_ins_part.length - 1);
						var full_sql_insert = sql_ins+sql_ins_part;
				  
				      userService.runQuery(full_sql_insert).then(function(r){
				  
								
								userService.runQuery("select count(id) as cart_count from cart_items where customer_id = "+user_id).then(function(re){
									var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:re[0].cart_count};
									req.session.userdata=session_data;
									if(req.cookies.checkout_items != undefined){ 
										
										  req.session.userdata=session_data;
					   
				                         var response ={status:200,message:"Sign up successfully",data:[]};
							  
                                       res.send(JSON.stringify(response));
										
									}else{
										  req.session.userdata=session_data;
					   
				                          var response ={status:200,message:"Sign up successfully",data:[]};
							  
                                        res.send(JSON.stringify(response));
									}
								}).catch(function(er){
									 var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                                     res.send(JSON.stringify(response));
								});
								
								
							 }).catch(function(e){
								 
								 
								  var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                                  res.send(JSON.stringify(response));
							 });
								
							}
				  
			    }
				
				// loop trough items
				for(var i = 0;i<items.length;i++){
					
					var variation_json_str = JSON.stringify(items[i].variation_json);
					var quantity = items[i].quantity;
					var product_type = items[i].product_type;
					var is_customizable = items[i].is_customizable;
					var sale_price = items[i].sale_price;
					var prd_id = items[i].prd_id;
					
					var uid = user_id;
					var customization_data = items[i].custom_text;
					
					var today_time=helpers.getUtcTimestamp();
					
					var sql_chk = "select * from cart_items where customer_id = "+uid+" and product_id = "+mysql.escape(prd_id)+" and is_customizable = "+mysql.escape(is_customizable)+" and customization_data = "+mysql.escape(customization_data)+" and is_variable = "+mysql.escape(product_type)+" and variation_data = "+mysql.escape(variation_json_str)+"";
					
					userService.runQueryCallback(sql_chk,i,caallback);
					
				}  
				
				res.clearCookie('cart_items');
				
			}else{
				
				
				      req.session.userdata=session_data;
					   
				      var response ={status:200,message:"Sign up successfully",data:[]};
							  
                      res.send(JSON.stringify(response));
				
			}
				
			     }).catch(function (err2){ console.log(err2);

			      var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                  res.send(JSON.stringify(response));
				 		 
	             });  
				   
			 }
			
		 }).catch(function (err3){ console.log(err3);

			      var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                  res.send(JSON.stringify(response));
				 		 
	          });								   
										   
			   
		   }).catch(function (err1){ console.log(err1);

			      var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                  res.send(JSON.stringify(response));
				 		 
	          });
			
			});
			 
			 }else{
			      
				
				 var response ={status:201,message:"Email is already used please use another email",data:[]};
							  
                 res.send(JSON.stringify(response));
				 
			 }
			 
		 
		 }).catch(function (err){ console.log(err);

		          var response ={status:201,message:"Some error occurred please try again",data:[]};
							  
                  res.send(JSON.stringify(response));
			 
								 
	    });
			
	
});



/*check promo code */
router.post("/get_promocode_details_apply",function (req, res, next) {
	
	var code = req.body.code;
	var store_id_str = req.body.store_id_str;
	var data = [];
	var user_id = req.session.userdata.user_id;

	var sql = "select * from promo_code where code = "+mysql.escape(code)+" and store_id in ("+store_id_str+") and is_active=1 and is_deleted=0";

	userService.runQuery(sql).then(function(r){

		if(r.length > 0){
			
			var re1 = r;
			var j = 0;
			var count = 0;
			
		 var callback = function(falg,index,re){
				
				count++
				if(re.length <= 0){
					data[j] = re1[index];
					j++;
				}
				
				if(count >= re1.length){
					res.send(data);
				}
				
			}
			
			for(var i = 0;i<r.length;i++){
				
				var sql_chk = "select id from customers_used_promocodes where code_id = "+r[i].id+" and customer_id = "+user_id;
				
				userService.runQueryCallback(sql_chk,i,callback);
			}
		}else{
			res.send(data);	
		}
	}).catch(function(e){
		res.send(data);
	});	
});

/* forgot password page */
router.all("/forgot_password",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	if(req.body.sub){ //post method
	
		 var email=req.body.email;
		 var sql = "select user_id,name from users where email="+mysql.escape(email)+" and is_deleted=0";
         userService.runQuery(sql).then(function(result){ 
		 
		   if(result.length>0){
			   
			   var user_id =result[0]['user_id'];
			   var user_name =result[0]['name'];
			   var new_pass=helpers.randomString(10,'$pass');
			   var salt_str=uniqid();
			  
			   helpers.hashPassword1(new_pass,salt_str,function(err,hashed_pass){
			   
				   var sql1 = "update users set password='"+hashed_pass+"' where user_id="+user_id+"";
       
                   userService.runQuery(sql1).then(function(result1){
					   
					  // var message="Hello  \n  "+user_name+"  \n  your new passord is "+new_pass+"  please login with new password \n Thanks prazar.com";
                        
                       var message='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css">  *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:22px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+user_name+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you for contacting Prazar.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">your new password is '+new_pass+'  please login with new password</p> <p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can also login by clicking on the link below;<br/> </p><a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';						
					   
					   var subject="Prazar- Password Recovery";
					   
					  helpers.sendMail(email,message,"",subject,function(flag,msg,send_res){
					  
						  if(flag){
						  
							 data.message="Some error occurred mail not sent";
			   res.render('front/forgot_password',{title: 'Prazar- Forgot Password',base_url:config.siteUrl,data:data});
							  
						  }else{
						  
						      data.message="Please check your email.";
		                     res.render('front/forgot_password',{title: 'Prazar- Forgot Password',base_url:config.siteUrl,data:data});
							  
						  }
					  
					  }); 
			   
				   }).catch(function (err1) { 
		   
		              data.message="Some error occurred please try again";
			   
			   res.render('front/forgot_password',{title: 'Prazar Forgot Password',base_url:config.siteUrl,data:data});
		
                  });   
			   
			   });
			   
			   
		   }else{
		 
			   data.message="Email not found please check email";
			   
			   res.render('front/forgot_password',{title: 'Prazar Forgot Password',base_url:config.siteUrl,data:data});
		   }
		 }).catch(function (err){ console.log(err);

			   data.message="Some error occurred please try again";																															
		       res.render('front/forgot_password',{title: 'Prazar Forgot Password',base_url:config.siteUrl,data:data});
				 		 
	          }); 
		
	}else{  //get method
     res.render('front/forgot_password',{title: 'Prazar Forgot Password',base_url:config.siteUrl,data:data});
	}
});


/* sign up page */
router.all("/sign_up",function (req, res, next) {

  
var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,insta_data:[]};
 data.meta_keyword="";
 data.meta_desc="";
 data.og_img="front_assets/img/prazar.png";

 if (req.session && req.session.userdata) {
         res.redirect("/");
		 return ;
      }


 if(req.body.sub){ //post method

    var newsletter=req.body.newsletter ? req.body.newsletter :0;
    var email=req.body.email;
    var fname=helpers.htmlEntities(req.body.first_name);
    var lname=helpers.htmlEntities(req.body.last_name);
    var password=String(req.body.Password);
    var role=0001;
 
    var fullname=fname+" "+lname;
 
    var today_time=helpers.getUtcTimestamp();
 
     var sql = "select user_id from users where email="+mysql.escape(email)+" and is_deleted=0";
      
         userService.runQuery(sql).then(function(result){
 
if(result.length==0){

var salt_str= uniqid();

helpers.hashPassword1(password,salt_str,function(err,hashed_pass){	 

  var sql1 = "INSERT INTO `users`(`fname`,`lname`,`name`, `email`, `password`, `role`, `registered_on`) VALUES ("+mysql.escape(fname)+","+mysql.escape(lname)+","+mysql.escape(fullname)+","+mysql.escape(email)+",'"+hashed_pass+"',"+role+","+today_time+")";
      
           userService.runQuery(sql1).then(function(result1){
   
    var user_id=result1.insertId;
    var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:0};
req.session.userdata=session_data;

    var sql3 = "INSERT INTO `customers`(`user_id`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `country`, `phone_no`) VALUES ("+user_id+",'','','','','','','')";
      
           userService.runQuery(sql3).then(function(result3){
   
      if(newsletter==0){
 
  //final 1
 
if(req.cookies.cart_items != undefined){   //check cart items in cookies

var items = JSON.parse(req.cookies.cart_items); 

var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ";

var sql_ins_part="";

var j = 0;

var caallback =function(flag,index,call_result){

j++;

if(call_result.length == 0){
   
var variation_json_str = JSON.stringify(items[index].variation_json);
var quantity = items[index].quantity;
var product_type = items[index].product_type;
var is_customizable = items[index].is_customizable;
var sale_price = items[index].sale_price;
var prd_id = items[index].prd_id;

var uid = user_id;
var customization_data = items[index].custom_text;

var today_time=helpers.getUtcTimestamp();

sql_ins_part += " ('"+uid+"','"+prd_id+"','"+quantity+"','"+today_time+"','"+is_customizable+"','"+customization_data+"','"+product_type+"','"+variation_json_str+"'),";

}

//loop end
if(j>=items.length){

 if(sql_ins_part ==""){
							
							var full_sql_insert="select count(id) as total from cart_items ";
						}else{
							 sql_ins_part = sql_ins_part.substring(0, sql_ins_part.length - 1);
						     var full_sql_insert = sql_ins+sql_ins_part;
						}

userService.runQuery(full_sql_insert).then(function(r){


userService.runQuery("select count(id) as cart_count from cart_items where customer_id = "+user_id).then(function(re){
var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:re[0].cart_count};
req.session.userdata=session_data;
if(req.cookies.checkout_items != undefined){ 

req.flash('reg_success',"Your account was created successfully");

res.redirect("/");

}else{
req.flash('reg_success',"Your account was created successfully");

res.redirect("/");
}
}).catch(function(er){
  data.error="Some error occurred please try again";	
  res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
});


}).catch(function(e){
 
 
  data.error="Some error occurred please try again";	
res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
});

}

}

// loop trough items
for(var i = 0;i<items.length;i++){

var variation_json_str = JSON.stringify(items[i].variation_json);
var quantity = items[i].quantity;
var product_type = items[i].product_type;
var is_customizable = items[i].is_customizable;
var sale_price = items[i].sale_price;
var prd_id = items[i].prd_id;

var uid = user_id;
var customization_data = items[i].custom_text;

var today_time=helpers.getUtcTimestamp();

var sql_chk = "select * from cart_items where customer_id = "+uid+" and product_id = "+prd_id+" and is_customizable = "+is_customizable+" and customization_data = '"+customization_data+"' and is_variable = "+product_type+" and variation_data = '"+variation_json_str+"'";

userService.runQueryCallback(sql_chk,i,caallback);

}  

res.clearCookie('cart_items');

}else{


   req.flash('reg_success',"Account is created successfully");

   res.redirect("/");

}

   
      }else{
 
  var today_time=helpers.getUtcTimestamp();
   
    var sql2 = " INSERT INTO `subscribers`(`email`, `entry_time`) VALUES ("+mysql.escape(email)+","+today_time+")";
      
                   userService.runQuery(sql2).then(function(result2){
   
     //final 2
   if(req.cookies.cart_items != undefined){   //check cart items in cookies

var items = JSON.parse(req.cookies.cart_items); 

var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ";

var sql_ins_part="";

var j = 0;

var caallback =function(flag,index,call_result){

j++;

if(call_result.length == 0){
   
var variation_json_str = JSON.stringify(items[index].variation_json);
var quantity = items[index].quantity;
var product_type = items[index].product_type;
var is_customizable = items[index].is_customizable;
var sale_price = items[index].sale_price;
var prd_id = items[index].prd_id;

var uid = user_id;
var customization_data = items[index].custom_text;

var today_time=helpers.getUtcTimestamp();

sql_ins_part += " ('"+uid+"','"+prd_id+"','"+quantity+"','"+today_time+"','"+is_customizable+"','"+customization_data+"','"+product_type+"','"+variation_json_str+"'),";

}

//loop end
if(j>=items.length){

sql_ins_part = sql_ins_part.substring(0, sql_ins_part.length - 1);
var full_sql_insert = sql_ins+sql_ins_part;

userService.runQuery(full_sql_insert).then(function(r){


userService.runQuery("select count(id) as cart_count from cart_items where customer_id = "+user_id).then(function(re){
var session_data={user_id:user_id,user_role:"consumer",role:0001,email:email,cart_count:re[0].cart_count};
req.session.userdata=session_data;
if(req.cookies.checkout_items != undefined){ 

req.flash('reg_success',"Account is created successfully");

res.redirect("/");

}else{
req.flash('reg_success',"Account is created successfully");

res.redirect("/");
}
}).catch(function(er){
  data.error="Some error occurred please try again";	
  res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
});


}).catch(function(e){
 
 
  data.error="Some error occurred please try again";	
res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
});

}

}

// loop trough items
for(var i = 0;i<items.length;i++){

var variation_json_str = JSON.stringify(items[i].variation_json);
var quantity = items[i].quantity;
var product_type = items[i].product_type;
var is_customizable = items[i].is_customizable;
var sale_price = items[i].sale_price;
var prd_id = items[i].prd_id;

var uid = user_id;
var customization_data = items[i].custom_text;

var today_time=helpers.getUtcTimestamp();

var sql_chk = "select * from cart_items where customer_id = "+uid+" and product_id = "+prd_id+" and is_customizable = "+is_customizable+" and customization_data = '"+customization_data+"' and is_variable = "+product_type+" and variation_data = '"+variation_json_str+"'";

userService.runQueryCallback(sql_chk,i,caallback);

}  

res.clearCookie('cart_items');

}else{


   req.flash('reg_success',"Account is created successfully");

   res.redirect("/");

}

     }).catch(function (err2){ console.log(err2);

      data.error="Some error occurred please try again";	
          res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
 
             });  
   
}

}).catch(function (err3){ console.log(err3);

   data.error="Some error occurred please try again";	
       res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
 
          });	   
   
   
   }).catch(function (err1){ console.log(err1);

   data.error="Some error occurred please try again";	
       res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
 
          });

});
 
}else{
      
data.error="Email is already used please use another email";
res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
 
}
 
 
}).catch(function (err){ console.log(err);

data.error="Some error occurred please try again";	 
res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
 
 
    });


 
}else{ //get method

res.render('front/sign_up',{title: 'Prazar Sign Up ',base_url:config.siteUrl,data:data});
}
});


/*add to wish list*/
router.all("/add_to_wishlist",function (req, res, next) {
	
	var id = req.body.id;
	var user_id = req.session.userdata.user_id;
	var today_time=helpers.getUtcTimestamp();
	var sql_chk = "select * from wishlist where customer_id = "+user_id+" and product_id = "+mysql.escape(id)+"";
	userService.runQuery(sql_chk).then(function(r){
		if(r.length > 0){
			res.send('2');
		}else{
			var sql_ins = "INSERT INTO `wishlist`( `customer_id`, `product_id`, `added_on`) VALUES ('"+user_id+"',"+mysql.escape(id)+",'"+today_time+"')";
			userService.runQuery(sql_ins).then(function(r1){
				res.send('1');
			}).catch(function(e1){console.log(e1);
				res.send('3');
			});
		}
	}).catch(function(e){console.log(e);
		res.send('3');
	});
  
});

/*remove from wish list*/
router.all("/remove_from_wishlist",function (req, res, next) {
	
	var id = req.body.id;
	var user_id = req.session.userdata.user_id;
	var sql_chk = "delete  from wishlist where id = "+mysql.escape(id)+" and customer_id="+user_id+"";
	userService.runQuery(sql_chk).then(function(r){
		res.send('3');
	}).catch(function(e){console.log(e);
		res.send('3');
	});
  
});


/* Shop  page */
router.all("/shop",function (req, res, next) {
	

	var cat_slug = req.query.c ? req.query.c : '';
	var sub_cat_slug = req.query.sc ? req.query.sc : '';
	var sub_sub_cat_slug = req.query.ssc ? req.query.ssc : '';
	var page = req.body.page ? req.body.page : 0;
	var start_frm = page*12;
	if(cat_slug == ""){
		res.redirect("/");
	}else{
		var cat_id = 0;
		var sub_cat_id = 0;
		var sub_sub_cat_id = 0;
		var data_array = [];
		var count = 0;
		var cat_name="";
		var sub_cat_name="";
		var cat_banner="";
		
		var callback_ratings = function(falg,index,result){
			count++;
			if(result[0].average_rates == null){
				result[0].average_rates = 0;
			}
			data_array[index]['ratings'] = result;
			if(count>=data_array.length){
				
				var get_cat = "select * from categories where cat_id = "+cat_id;
				userService.runQuery(get_cat).then(function(selected_cat_data){
					var get_all_subcat = "select * from sub_categories where cat_id = "+cat_id+" and is_active=1";
					userService.runQuery(get_all_subcat).then(function(all_sub_cats){
						
						var sql_get_locations = "select * from overseas_regions where is_active = 1 and is_deleted = 0";
						userService.runQuery(sql_get_locations).then(function(loc_res){							
							if(sub_cat_id == 0){
								var min_max_price = "select min(sale_price) as min_price , max(sale_price) as max_price from product where product_id in (select product_id from product_category where cat_id = "+cat_id+" and is_main_cat = 1) and product.is_active = 1 and product.is_deleted = 0";
							}else if(sub_sub_cat_slug == ""){
								var min_max_price = "select min(sale_price) as min_price , max(sale_price) as max_price from product where product_id in (select product_id from product_category where cat_id = "+sub_cat_id+" and is_main_cat = 0 and is_sub_sub_cat = 0) and product.is_active = 1 and product.is_deleted = 0";
							}else{
								var min_max_price = "select min(sale_price) as min_price , max(sale_price) as max_price from product where product_id in (select product_id from product_category where cat_id = "+sub_cat_id+" and is_main_cat = 0 and is_sub_sub_cat = 1) and product.is_active = 1 and product.is_deleted = 0";
							}
							userService.runQuery(min_max_price).then(function(mmprice_res){
								var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:data_array,cat_id:cat_id,sub_cat_id:sub_cat_id,sub_sub_cat_id:sub_sub_cat_id,cat_slug:cat_slug,sub_cat_slug:sub_cat_slug,sub_sub_cat_slug:sub_sub_cat_slug,cat_details:selected_cat_data,all_sub_cats:all_sub_cats,all_locations:loc_res,mmprice_res:mmprice_res,cookie_cart_count:res.locals.cookie_cart_count};
								
								 data.meta_keywords="Category";
	                             data.meta_desc="Shop the finest Australian "+cat_name+" "+sub_cat_name+" brands at Prazar ";
								
								data.og_img="categories/"+cat_banner;
								data.og_url=config.siteUrl+"shop?c="+cat_slug+"&sc="+sub_cat_slug;
                                 data.og_type="website";
								 
								if(sub_cat_name !=""){
									sub_cat_name=sub_cat_name+" -";
								}
								
								res.render('front/shop',{title:""+cat_name+" - "+sub_cat_name+" Australia Brands - Prazar",base_url:config.siteUrl,data:data});
								
							}).catch(function(mmprice_er){
								res.redirect("/");
							});	
						}).catch(function(er_loc){
							res.redirect("/");
						});
					}).catch(function(err_get_subcat){
						res.redirect("/");
					});
				}).catch(function(err_get_cat){
					res.redirect("/");
				});
		    }
		}
		var callback_image = function(falg,index,result){
			data_array[index]['images'] = result;
			var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+data_array[index].product_id;
			userService.runQueryCallback(sql_ratings,index,callback_ratings);
		}
		var callback = function(falg,index,result){
			if(result.length > 0){
				sub_cat_id = result[0].id;
				sub_cat_name=result[0].name;
			}
			if(sub_cat_id == 0){
				var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id = "+cat_id+" and is_main_cat = 1) and product.is_active = 1 and product.is_deleted = 0 limit "+start_frm+" , 12";
			}else if(sub_sub_cat_slug == ""){
				var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id = "+sub_cat_id+" and is_main_cat = 0 and is_sub_sub_cat = 0) and product.is_active = 1 and product.is_deleted = 0 limit "+start_frm+" , 12";
			}else{
				var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id = "+sub_cat_id+" and is_main_cat = 0 and is_sub_sub_cat = 1) and product.is_active = 1 and product.is_deleted = 0 limit "+start_frm+" , 12";
				sub_sub_cat_id = sub_cat_id;
			}
			
			
			userService.runQuery(sql).then(function(all_prod){
				if(all_prod.length > 0){
					for(var i = 0;i<all_prod.length;i++){
						data_array[i] = all_prod[i];
						var product_id = all_prod[i].product_id;
						var get_product_images = "select * from product_images where product_id = "+product_id;
						userService.runQueryCallback(get_product_images,i,callback_image);
					}
				}else{
					var get_cat = "select * from categories where cat_id = "+cat_id;
					userService.runQuery(get_cat).then(function(selected_cat_data){
						
						var get_all_subcat = "select * from sub_categories where cat_id = "+cat_id+" and is_active=1";
						userService.runQuery(get_all_subcat).then(function(all_sub_cats){
							var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:data_array,cat_id:cat_id,sub_cat_id:sub_cat_id,sub_sub_cat_id:sub_sub_cat_id,cat_slug:cat_slug,sub_cat_slug:sub_cat_slug,sub_sub_cat_slug:sub_sub_cat_slug,cat_details:selected_cat_data,all_sub_cats:all_sub_cats,cookie_cart_count:res.locals.cookie_cart_count};
							
							      data.meta_keywords="Category";
	                              data.meta_desc="Shop the finest Australian "+cat_name+" "+sub_cat_name+" brands at Prazar ";
					
                                 data.og_img="categories/"+cat_banner;
								 
								 data.og_url=config.siteUrl+"shop?c="+cat_slug+"&sc="+sub_cat_slug;
                                 data.og_type="website";
								 
								 
								 if(sub_cat_name !=""){
									 sub_cat_name=sub_cat_name+" -";
								 }
								 
								res.render('front/shop',{title: ""+cat_name+" - "+sub_cat_name+" Australia Brands - Prazar",base_url:config.siteUrl,data:data});
							
						}).catch(function(err_get_subcat){
							res.redirect("/");
						});
					}).catch(function(err_get_cat){
						res.redirect("/");
					});
				}				
			}).catch(function(err){
				res.redirect("/");
			});
		}
		
		
		userService.runQuery("select cat_id,cat_name,cat_banner_image from categories where cat_slug = "+mysql.escape(cat_slug)+"").then(function(r_cid){
			if(r_cid.length > 0){
				cat_id = r_cid[0].cat_id;
				cat_name = r_cid[0].cat_name;
				cat_banner = r_cid[0].cat_banner_image;
				sub_cat_id = 0;
				if(sub_cat_slug != ""){
					if(sub_sub_cat_slug == ""){
						userService.runQueryCallback("select id,name from sub_categories where is_active=1 and su_cat_bslug = "+mysql.escape(sub_cat_slug)+"",0,callback);
					}else{
						userService.runQueryCallback("select id,name from sub_sub_categories where is_active=1 and  sub_sub_cat_bslug = "+mysql.escape(sub_sub_cat_slug)+"",0,callback);
					}
				}else{
					callback(true,0,[]);
				}
			}else{
				res.redirect("/");
			}
		}).catch(function(e){
			res.redirect("/");
		});
	}  
});


/*shop page filters */

router.all("/get_products_shop",function (req, res, next) {
	
	var delivery_type =  req.body.delivery_type;
	var delivery_region = req.body.delivery_region;
	var sale = req.body.sale;
	var personlized = req.body.personlized;
	var gift = req.body.gift;
	var order_by = req.body.order_by;
	var min_price = req.body.min_price;
	var max_price = req.body.max_price;
	var cat_id = req.body.cat_id;
	var sub_cat_id = req.body.sub_cat_id;
	var sub_sub_cat_id = req.body.sub_sub_cat_id;
	var shop_page_count = req.body.shop_page_count;
	
	var start_frm = shop_page_count*12;
	var data_array = [];
	var count = 0;
	var where1 = "";
	var where2 = "";
	var where3 = "";
	var where4 = "";
	var where5 = "";
	var where6 = "";
	if(delivery_type == "international"){
		if(delivery_region == "all"){
			where1 = " and product.is_shipped_overseas = 1";
		}else{
			where1 = " and product.is_shipped_overseas = 1 and product.ship_region like '%"+delivery_region+"%'";
			//where1 = " and product.is_shipped_overseas = 1";
		}
	}else if(delivery_type == "instant"){
		where1 = " and product.is_free_delivery = 1";
	}else if(delivery_type == "express"){
		where2 = " and product.is_express_delivery = 1";
	} 
	if(sale != "no" && personlized != "no" && gift != "no"){//console.log("a");
		where3 = " and (product.price > product.sale_price or product.is_customizable = 1 or product.is_gift_wrap = 1)";
	}else if(sale == "no" && personlized != "no" && gift != "no"){//console.log("b");
		where3 = " and (product.is_customizable = 1 or product.is_gift_wrap = 1)";
	}else if(sale != "no" && personlized == "no" && gift != "no"){//console.log("c");
		where3 = " and (product.price > product.sale_price or product.is_gift_wrap = 1)";
	}else if(sale != "no" && personlized != "no" && gift == "no"){//console.log("d");
		where3 = " and (product.price > product.sale_price or product.is_customizable = 1)";
	}else if(sale != "no"){//console.log("e");
		where3 = " and product.price > product.sale_price";
	}else if(personlized != "no"){//console.log("f");
		where4 = " and product.is_customizable = 1";
	}else if(gift != "no"){//console.log("g");
		where5 = " and product.is_gift_wrap = 1";
	}
	if(parseInt(min_price) < parseInt(max_price)){
		where6 = " and product.sale_price between "+mysql.escape(min_price)+" and "+mysql.escape(max_price)+"";	
	}else{
		where6 = " and product.sale_price = "+mysql.escape(min_price)+"";
	}
	
	var order = "";
	
	
	if(order_by != "none"){
		var order_by_arr = order_by.split("_");
		if(order_by_arr[0] == "date"){
			order = " order by added_on "+order_by_arr[1]+"";
		}else if(order_by_arr[0] == "price"){
			order = " order by sale_price "+order_by_arr[1]+"";
		}else if(order_by_arr[0] == "order"){
			order = " order by number_of_order "+order_by_arr[1]+"";
		}else if(order_by_arr[0] == "name"){
			order = " order by product_name "+order_by_arr[1]+"";
		}
	}	
	
	if(sub_cat_id == 0){
		var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id = "+mysql.escape(cat_id)+" and is_main_cat = 1)"+where1+where2+where3+where4+where5+where6+" and product.is_active = 1 and product.is_deleted = 0 "+order+" limit "+start_frm+" , 12";
	}else{
		if(sub_sub_cat_id == 0){
			var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id = "+mysql.escape(sub_cat_id)+" and is_main_cat = 0 and is_sub_sub_cat = 0)"+where1+where2+where3+where4+where5+where6+" and product.is_active = 1 and product.is_deleted = 0 "+order+" limit "+start_frm+" , 12";
		}else{
			var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id = "+mysql.escape(sub_cat_id)+" and is_main_cat = 0 and is_sub_sub_cat = 1)"+where1+where2+where3+where4+where5+where6+" and product.is_active = 1 and product.is_deleted = 0 "+order+" limit "+start_frm+" , 12";
		}
	}
	
	
	
	var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		data_array[index]['ratings'] = result;
		if(count>=data_array.length){
			var html = '';
			for(var i = 0;i<data_array.length;i++){
				html = html+'<div class="col-md-3 col-sm-6 col-xs-6 wv_clear marB30" ><div class="wa-theme-design-block"><figure class="dark-theme"><a class="pro_img_anchr" href="/product_datail?p='+data_array[i].slug+'"><img src="./products/'+data_array[i].images[0].image_url+'" alt=""></a>';
				if(data_array[i].quantity == 0){
					html = html+'<div class="out_stock_div"><span>out of stock</span></div><!--<div class="ribbon"><span>New</span></div>-->';
				}else{
					
					var product_type=data_array[i].product_type;
					
					if(product_type==2){
						
						html = html+'<span class="block-sticker-tag1 add_variant_pro_cart" data-id="'+data_array[i].product_id+'" data-slug="'+data_array[i].slug+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
					}else{
						
						html = html+'<span class="block-sticker-tag1 add_to_cart_other" data-id="'+data_array[i].product_id+'" data-sale-price="'+data_array[i].sale_price+'" data-is-customize="'+data_array[i].is_customizable+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
						
						
					}
					
				}
				
				html = html+'<span class="block-sticker-tag2" data-id="'+data_array[i].product_id+'"><span class="off_tag1"><strong><i class="fa fa-heart-o" aria-hidden="true"></i></strong></span></span><span class="block-sticker-tag3"><a class="off_tag1 btn-action btn-quickview" href="/product_datail?p='+data_array[i].slug+'"><strong><i class="fa fa-eye" aria-hidden="true"></i></strong></a></span></figure><div class="block-caption1"><h4><a href="/product_datail?p='+data_array[i].slug+'">'+data_array[i].product_name+'</a></h4><div class="col-xs-12 col-sm-12 col-md-12 text_left"><a href="/store?ss='+data_array[i].store_slug+'"><span class="price-text-color ">By '+data_array[i].store_name+'</span></a></div><div class="col-xs-12 col-sm-12 col-md-12 review_right"><ul class="wv_rating star_ratings_ajax">';
				if(data_array[i].ratings[0].average_rates == 0){
					html = html+'<li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 0 && data_array[i].ratings[0].average_rates < 1){
					html = html+'<li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 1){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 1 && data_array[i].ratings[0].average_rates < 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 2 && data_array[i].ratings[0].average_rates < 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 3 && data_array[i].ratings[0].average_rates < 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 4 && data_array[i].ratings[0].average_rates < 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
				}
				
				
				
				html = html+'<li><span class="review">('+data_array[i].ratings[0].total_rates+')</span></li></ul></div><div class="clear"></div><div class="price col-md-12"><span class="sell-price">AU $'+data_array[i].sale_price.toFixed(2)+'</span>';
				if(data_array[i].sale_price < data_array[i].price){
					html = html+'<span class="actual-price">'+data_array[i].price.toFixed(2)+'</span>';
				}
				html = html+'</div></div></div><div class="clear"></div></div>';
			}
			res.send(html);
		}
	}
	
	var callback_image = function(falg,index,result){
		data_array[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+data_array[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	
	userService.runQuery(sql).then(function(all_prod){
		if(all_prod.length > 0){
			for(var i = 0;i<all_prod.length;i++){
				data_array[i] = all_prod[i];
				var product_id = all_prod[i].product_id;
				var get_product_images = "select * from product_images where product_id = "+product_id;
				userService.runQueryCallback(get_product_images,i,callback_image);
			}
		}else{
			var html = '<div class="col-md-12"><h2>Oh no! We didn’t find what you were looking for</h2></div>';
			res.send(html);
		}				
	}).catch(function(err){
		res.send(html);
	});
	
});


/* Store single  page */
router.all("/store",function (req, res, next) {
	
	 var store_slug=req.query.ss ? req.query.ss: "";
	 
	 if(store_slug==""){
		 res.redirect("/");
		 return;
	 }
	 
	 var cat_slug = req.query.c ? req.query.c : 0;
	 var sub_cat_slug = req.query.sc ? req.query.sc : 0;
	
	 
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	  data.meta_keywords="";
 
      data.meta_desc="";
 
      data.og_img="front_assets/img/prazar.png";
	  data.og_url=config.siteUrl+"store?ss="+store_slug;
      data.og_type="website";
	 
	data.store_slug=store_slug;
	data.cat_slug=cat_slug;
	data.sub_cat_slug=sub_cat_slug;
	 
	 //get store detail
	 var sql1 = "select store.*,avg(store_ratings.ratings) as average_rates,count(store_ratings.id) as total_rates from store left join store_ratings on store.store_id=store_ratings.store_id where store.store_slug="+mysql.escape(store_slug)+"";
      
     userService.runQuery(sql1).then(function(result1){
		
		  data.store_detail=result1[0];
     
	      // get products of store with filters
	 
	      if(cat_slug==0 && sub_cat_slug==0){
			  
			  var sql_products = "select product.*, store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where store.store_slug="+mysql.escape(store_slug)+" and product.is_active=1 and is_deleted=0 limit 12";
			  
			  
		  }else if(cat_slug!=0 && sub_cat_slug==0){
			  
			   var sql_products = "select product.*, store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where store.store_slug="+mysql.escape(store_slug)+" and product.is_active=1 and is_deleted=0 and product_id in (select product_id from product_category where cat_id = (select cat_id from categories where cat_slug = "+mysql.escape(cat_slug)+") and is_main_cat = 1) limit 12 ";
			
			  
		  }else{
			  
			   var sql_products = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where store.store_slug="+mysql.escape(store_slug)+" and product.is_active=1 and is_deleted=0 and product_id in (select product_id from product_category where cat_id = (select cat_id from sub_categories where su_cat_bslug = "+mysql.escape(sub_cat_slug)+") and is_main_cat = 0 and is_sub_sub_cat = 0) limit 12";
			  
		  }
	 
	
	 
     userService.runQuery(sql_products).then(function(result_pop){
		 
		
		 
		 if(result_pop.length>0){
		 
			 var count=0;
			 
			 var callback_ratings=function(flag,index,result_rating){
			 
			     count++;
			     if(result_rating[0].average_rates == null){
				   result_rating[0].average_rates = 0;
			     }
				 
				 result_pop[index]['ratings'] = result_rating[0];
				 
				 if(count>=result_pop.length){
				 
					 data.product_data=result_pop;
					 
					 
					 if(cat_slug==0 && sub_cat_slug==0){
						  var min_max_price = "select min(sale_price) as min_price , max(sale_price) as max_price from product where store_id =  (select store_id from store where store_slug = "+mysql.escape(store_slug)+")";							  
						  
					  }else if(cat_slug!=0 && sub_cat_slug==0){
						  var min_max_price = "select min(sale_price) as min_price , max(sale_price) as max_price from product where store_id =  (select store_id from store where store_slug = "+mysql.escape(store_slug)+") and product_id in (select product_id from product_category where cat_id = (select cat_id from categories where cat_slug = "+mysql.escape(cat_slug)+") and is_main_cat = 1)";		
					  }else{
						  var min_max_price = "select min(sale_price) as min_price , max(sale_price) as max_price from product where store_id =  (select store_id from store where store_slug = "+mysql.escape(store_slug)+") and product_id in (select product_id from product_category where cat_id = (select cat_id from sub_categories where su_cat_bslug = "+mysql.escape(sub_cat_slug)+") and is_main_cat = 0)";		
						  						  
					  }
					  
					//  console.log("query "+min_max_price);
					  
					  userService.runQuery(min_max_price).then(function(mmprice_res){
							data.min_max_price=mmprice_res;
							//final second
							res.render('front/store',{title: 'Prazar Storefront ',base_url:config.siteUrl,data:data});
						}).catch(function(mmprice_er){ console.log(mmprice_er);
							res.redirect("/");
						});	
					
					  
		            
					 
				  }
				 
			  }
			 
			 var callback_image=function(flag,index,result_img){
			 
				     result_pop[index]['images']= result_img;
				 
				     var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+result_pop[index].product_id;
				 
			userService.runQueryCallback(sql_ratings,index,callback_ratings);
				 
				 
			      }
			 
			 for(var i=0;i<result_pop.length;i++){
			         
				        var product_id = result_pop[i]['product_id'];
						
						var get_product_images = "select * from product_images where product_id = "+product_id+" limit 1";
						userService.runQueryCallback(get_product_images,i,callback_image);
				 
			    }
			 
		  }else{
			  
		       data.product_data=[];
			   data.min_max_price=[];
			  //final first
	          res.render('front/store',{title: 'Prazar Storefront ',base_url:config.siteUrl,data:data});
			  
		  }
		
		 
	}).catch(function (err3) { console.log(err3);

		res.render('front/store',{title: 'Prazar Storefront ',base_url:config.siteUrl,data:data});
  
   });	 
	
     }).catch(function (err){ console.log(err);

		  res.render('front/store',{title: 'Prazar Storefront ',base_url:config.siteUrl,data:data});
			 
								 
	    });
  
});


/*store  page filters */

router.all("/get_products_store",function (req, res, next) {
	
	var order_by = req.body.order_by;
	var min_price = req.body.min_price;
	var max_price = req.body.max_price;
	var store_slug = req.body.store_slug;
	var cat_slug = req.body.cat_slug;
	var sub_cat_slug = req.body.sub_cat_slug;
	var store_page_count = req.body.store_page_count;
	
	var start_frm = store_page_count*12;
	var data_array = [];
	var count = 0;
	
	var where6 = "";
	
	if(min_price !=undefined && max_price !=undefined){
		
		if(parseInt(min_price) < parseInt(max_price)){
			where6 = " and product.sale_price between "+mysql.escape(min_price)+" and "+mysql.escape(max_price)+"";	
		}else{
			where6 = " and product.sale_price = "+min_price;
		}
	}
	var order = "";
	if(order_by != "none"){
		var order_by_arr = order_by.split("_");
		if(order_by_arr[0] == "date"){
			order = " order by added_on "+order_by_arr[1]+"";
		}else if(order_by_arr[0] == "price"){
			order = " order by sale_price "+order_by_arr[1]+"";
		}else if(order_by_arr[0] == "order"){
			order = " order by number_of_order "+order_by_arr[1]+"";
		}else if(order_by_arr[0] == "name"){
			order = " order by product_name "+order_by_arr[1]+"";
		}
	}	
	
	
	    if(cat_slug==0 && sub_cat_slug==0){
			  
			  var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where store.store_slug="+mysql.escape(store_slug)+" and product.is_active=1 and is_deleted=0 "+where6+" "+order+" limit "+start_frm+",12";
			  
			  
		  }else if(cat_slug!=0 && sub_cat_slug==0){
			  
			   var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where store.store_slug="+mysql.escape(store_slug)+" and product.is_active=1 and is_deleted=0 and product_id in (select product_id from product_category where cat_id = (select cat_id from categories where cat_slug = "+mysql.escape(cat_slug)+") and is_main_cat = 1) "+where6+" "+order+" limit "+start_frm+",12";
			
			  
		  }else{
			  
			   var sql = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where store.store_slug="+mysql.escape(store_slug)+" and product.is_active=1 and is_deleted=0 and product_id in (select product_id from product_category where cat_id = (select cat_id from sub_categories where su_cat_bslug = "+mysql.escape(sub_cat_slug)+") and is_main_cat = 0 and is_sub_sub_cat = 0) "+where6+" "+order+" limit "+start_frm+",12";
			  
		  }
	
	
	
	var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		data_array[index]['ratings'] = result;
		if(count>=data_array.length){
			var html = '';
			for(var i = 0;i<data_array.length;i++){
				html = html+'<div class="col-md-3 col-sm-6 col-xs-6 wv_clear marB30" ><div class="wa-theme-design-block"><figure class="dark-theme"><a class="pro_img_anchr" href="/product_datail?p='+data_array[i].slug+'"><img src="./products/'+data_array[i].images[0].image_url+'" alt=""></a>';
				if(data_array[i].quantity == 0){
					html = html+'<div class="out_stock_div"><span>out of stock</span></div><!--<div class="ribbon"><span>New</span></div>-->';
				}else{
					
					var product_type=data_array[i].product_type;
					
					if(product_type==2){
					
						html = html+'<span class="block-sticker-tag1 add_variant_pro_cart" data-id="'+data_array[i].product_id+'" data-slug="'+data_array[i].slug+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
					}else{
						
						html = html+'<span class="block-sticker-tag1 add_to_cart_other" data-id="'+data_array[i].product_id+'" data-sale-price="'+data_array[i].sale_price+'" data-is-customize="'+data_array[i].is_customizable+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
						
						
					}
				}
				html = html+'<span class="block-sticker-tag2" data-id="'+data_array[i].product_id+'"><span class="off_tag1"><strong><i class="fa fa-heart-o" aria-hidden="true"></i></strong></span></span><span class="block-sticker-tag3"><a class="off_tag1 btn-action btn-quickview" href="/product_datail?p='+data_array[i].slug+'"><strong><i class="fa fa-eye" aria-hidden="true"></i></strong></a></span></figure><div class="block-caption1"><h4><a href="/product_datail?p='+data_array[i].slug+'">'+data_array[i].product_name+'</a></h4><div class="col-xs-12 col-sm-12 col-md-12 text_left"><a href="/store?ss='+data_array[i].store_slug+'"><span class="price-text-color ">By '+data_array[i].store_name+'</span></a></div><div class="col-xs-12 col-sm-12 col-md-12 review_right"><ul class="wv_rating star_ratings_ajax">';
				if(data_array[i].ratings[0].average_rates == 0){
					html = html+'<li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 0 && data_array[i].ratings[0].average_rates < 1){
					html = html+'<li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 1){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 1 && data_array[i].ratings[0].average_rates < 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 2 && data_array[i].ratings[0].average_rates < 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 3 && data_array[i].ratings[0].average_rates < 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates > 4 && data_array[i].ratings[0].average_rates < 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li>';
				}else if(data_array[i].ratings[0].average_rates == 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
				}
				
				
				
				
				html = html+'<li><span class="review">('+data_array[i].ratings[0].total_rates+')</span></li></ul></div><div class="clear"></div><div class="price col-md-12"><span class="sell-price">AU $'+data_array[i].sale_price.toFixed(2)+'</span>';
				if(data_array[i].sale_price < data_array[i].price){
					html = html+'<span class="actual-price">'+data_array[i].price.toFixed(2)+'</span>';
				}
				html = html+'</div></div></div><div class="clear"></div></div>';
			}
			res.send(html);
		}
	}
	
	var callback_image = function(falg,index,result){
		data_array[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+data_array[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	
	userService.runQuery(sql).then(function(all_prod){
		if(all_prod.length > 0){
			for(var i = 0;i<all_prod.length;i++){
				data_array[i] = all_prod[i];
				var product_id = all_prod[i].product_id;
				var get_product_images = "select * from product_images where product_id = "+product_id;
				userService.runQueryCallback(get_product_images,i,callback_image);
			}
		}else{
			var html = '<div class="col-md-12"><h2>Oh no! We didn’t find what you were looking for</h2></div>';
			res.send(html);
		}				
	}).catch(function(err){ console.log(err);
		//res.redirect("/");
		var html = '<div class="col-md-12"><h2>Oh no! We didn’t find what you were looking for</h2></div>';
		res.send(html);
	});
	
});

/* GETTING PRODUCTS RATINGS STARTS */

router.post("/get_product_ratings_reviews",function (req, res, next) {
	var product_id = req.body.product_id;
	var page = req.body.page;
	page = page * 10;
	var html = "";
	var data_array = [];
	var count = 0;
	var callback = function(falg,index,result){
		count++;
		var initials = result[0].fname.charAt(0)+""+result[0].lname.charAt(0);
		var name = result[0].fname+" "+result[0].lname;
		data_array[index]['initials'] = initials;
		data_array[index]['name'] = name;
		if(count >= data_array.length){
			for(var i = 0;i<data_array.length;i++){
				html = html+'<div class="col-md-12 pop_wrap"><div class="col-md-1 pop_profile_left"><span>'+data_array[i]['initials']+'</span></div><div class="col-md-11 pop_profile_right"><h1 style="margin:0;font-size:29px;">'+data_array[i]['name']+'</h1><ul class="wv_rating"><ul class="wv_rating">';
				
				if(data_array[i].ratings == 0){ 
					html = html+'<li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings > 0 && data_array[i].ratings < 1){
					html = html+'<li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings == 1){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings > 1 && data_array[i].ratings < 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings == 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings > 2 && data_array[i].ratings < 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings == 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings > 3 && data_array[i].ratings < 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings == 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(data_array[i].ratings > 4 && data_array[i].ratings < 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li>';
				}else if(data_array[i].ratings == 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';	
				}				
				html = html+'</ul></div><div class="col-md-12 pop_para"><p>'+data_array[i].reviews+'</p></div></div>';
			}
			res.send(html);
		}
	}
	
	var sql = "select * from product_ratings where product_id = "+product_id+" order by added_on DESC limit "+page+", 10";
	userService.runQuery(sql).then(function(re){
		if(re.length > 0){
			data_array = re;
			for(var i=0;i<re.length;i++){
				var user_id = re[i]['customer_id'];
				var sql_get_customer = "select fname,lname from users where user_id = "+user_id;
				userService.runQueryCallback(sql_get_customer,i,callback);
			}
		}else{
			res.send("");	
		}		
	}).catch(function(err){
		console.log(err);
		res.send("");
	})
});

/* GETTING PRODUCTS RATINGS ENDS */

/* Product single  page */
router.all("/product_datail",function (req, res, next) {
	
	var prod_slug = req.query.p ? req.query.p : '';
	var data = [];
	var count = 0;
	var count1 = 0;
	var count2 = 0;
	var pid = 0;
	var vid = 0;
	var data_variations = [];
	var data_related_products = [];
	var data_products_by_marchent = [];
	
	var pro_name="";
	var pro_img="";
	
	if(prod_slug == ""){
		res.redirect("/shop");
	}else{
		
		var callback_marchent_prod_ratings = function(falg,index,result){
			count2++;
			if(result[0].average_rates == null){
				result[0].average_rates = 0;
			}
			data_products_by_marchent[index]['ratings'] = result;
			if(count2 >= data_products_by_marchent.length){
				data[0].products_by_marchent = data_products_by_marchent;
				var data_to_send ={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,data:data[0],cookie_cart_count:res.locals.cookie_cart_count,vendor_id:vid};
				
				 data_to_send.meta_keywords="";
	                                         data_to_send.meta_desc="Check out "+pro_name+" from the finest Australian brands at Prazar ";
											 data_to_send.og_img="products/"+pro_img;
											 data_to_send.og_url=config.siteUrl+"product_datail?p="+prod_slug;
                                             data_to_send.og_type="product";
				                            res.render('front/product_datail',{title:""+pro_name+" - Australia Brands - Prazar",base_url:config.siteUrl,data:data_to_send});
			}
		}
		
		var callback_marchent_prod_img = function(falg,index,result){
			data_products_by_marchent[index]['images'] = result;
			var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+data_products_by_marchent[index].product_id;
			userService.runQueryCallback(sql_ratings,index,callback_marchent_prod_ratings);
		}
		
		var callback_releted_prod_ratings = function(falg,index,result){
			count1++;
			if(result[0].average_rates == null){
				result[0].average_rates = 0;
			}
			data_related_products[index]['ratings'] = result;
			if(count1 >= data_related_products.length){
				data[0].related_products = data_related_products;
				var sql_product_by_seller = "select product.* , store.store_name,store.store_slug,store.state ,store.country , store.minimum_purcahse_amt_for_free_ship from product inner join store on product.store_id = store.store_id where product.vendor_id = "+vid+" and product.product_id != "+pid+" and product.is_active = 1 and product.is_deleted = 0 limit 12";
				userService.runQuery(sql_product_by_seller).then(function(r){
					if(r.length > 0){
						data_products_by_marchent = r;
						for(var i = 0;i<r.length;i++){
							var rpid = r[i].product_id;
							var sql_images = "select * from product_images where product_id = "+rpid;
							userService.runQueryCallback(sql_images,i,callback_marchent_prod_img);
						}
					}else{
						data[0].products_by_marchent = data_products_by_marchent;
						var data_to_send ={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,data:data[0],cookie_cart_count:res.locals.cookie_cart_count,vendor_id:vid};
						
						   data_to_send.meta_keywords="";
	                                         data_to_send.meta_desc="Check out "+pro_name+" from the finest Australian brands at Prazar ";
											 data_to_send.og_img="products/"+pro_img;
											 data_to_send.og_url=config.siteUrl+"product_datail?p="+prod_slug;
                                             data_to_send.og_type="product";
				                            res.render('front/product_datail',{title:""+pro_name+" - Australia Brands - Prazar",base_url:config.siteUrl,data:data_to_send});
					}
				}).catch(function(er){ console.log(er);
					res.redirect("/");
				});
			}
		}
		var callback_releted_prod_img = function(falg,index,result){
			data_related_products[index]['images'] = result;
			var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+data_related_products[index].product_id;
			userService.runQueryCallback(sql_ratings,index,callback_releted_prod_ratings);
		}
		var callback = function(falg,index,result){
			
			count++;
			data_variations[index]['variant_values'] = result;
			if(count>=data_variations.length){
				data[0].variants = data_variations;
				var sql_related_prods = "select product.* ,store.store_name ,store.store_slug,store.state ,store.country , store.minimum_purcahse_amt_for_free_ship from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id in (select cat_id from product_category where product_id = "+pid+") and product.product_id != "+pid+") and product.is_active = 1 and product.is_deleted = 0 limit 12";
				userService.runQuery(sql_related_prods).then(function(r){
					if(r.length > 0){
						data_related_products = r;
						for(var i = 0;i<r.length;i++){
							var rpid = r[i].product_id;
							var sql_images = "select * from product_images where product_id = "+rpid;
							userService.runQueryCallback(sql_images,i,callback_releted_prod_img);
						}
					}else{
						var sql_product_by_seller = "select product.* , store.store_name ,store.store_slug,store.state ,store.country , store.minimum_purcahse_amt_for_free_ship from product inner join store on product.store_id = store.store_id where product.vendor_id = "+vid+" and product.product_id != "+pid+" and product.is_active = 1 and product.is_deleted = 0 limit 12";
						userService.runQuery(sql_product_by_seller).then(function(r){
							if(r.length > 0){
								data_products_by_marchent = r;
								for(var i = 0;i<r.length;i++){
									var rpid = r[i].product_id;
									var sql_images = "select * from product_images where product_id = "+rpid;
									userService.runQueryCallback(sql_images,i,callback_marchent_prod_img);
								}
							}else{
								data[0].products_by_marchent = data_products_by_marchent;
								var data_to_send ={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,data:data[0],cookie_cart_count:res.locals.cookie_cart_count,vendor_id:vid};
								
								  data_to_send.meta_keywords="";
	                                         data_to_send.meta_desc="Check out "+pro_name+" from the finest Australian brands at Prazar ";
											 data_to_send.og_img="products/"+pro_img;
											 data_to_send.og_url=config.siteUrl+"product_datail?p="+prod_slug;
                                             data_to_send.og_type="product";
				                            res.render('front/product_datail',{title:""+pro_name+" - Australia Brands - Prazar",base_url:config.siteUrl,data:data_to_send});
							}							
						}).catch(function(er){ console.log(er);
							res.redirect("/");
						});
					}
				}).catch(function(er1){ console.log(er1);
					res.redirect("/");
				});
			}
		}
		
		
		/*entry point*/
		
		var sql_product = "select product.* ,store.store_name,store.store_slug,store.state ,store.country , store.minimum_purcahse_amt_for_free_ship from product inner join store on product.store_id = store.store_id where product.slug = "+mysql.escape(prod_slug)+"";
		
		userService.runQuery(sql_product).then(function(r){
			
			var string_labels=r[0]['custome_input_label'];
			var string_labels_arr=string_labels.split(",");
			
			pro_name=r[0]['product_name'];
			
			r[0].custome_input_label=string_labels_arr;
			
			data[0] = r[0];
			pid = r[0].product_id;
			vid = r[0].vendor_id;
			pro_name = r[0].product_name;
			
			var sql_prd_img = "select * from product_images where product_id = "+pid;
			userService.runQuery(sql_prd_img).then(function(ri){
				
				data[0].images = ri;
				
				pro_img=ri[0].image_url;
				
				var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+pid;
				userService.runQuery(sql_ratings).then(function(rr){
					
					if(rr[0].average_rates == null){
						rr[0].average_rates = 0;
					}
					data[0].ratings = rr;
					
					var sql_variations = "select * from product_variants where product_id = "+pid;
					userService.runQuery(sql_variations).then(function(r1){
						if(r1.length > 0){
							data_variations = r1;
							for(var i = 0;i<r1.length;i++){
								var product_Variants_id = r1[i].product_Variants_id;	
								var sql_variations_value = "select * from product_variant_values where product_variant_id = "+product_Variants_id;
								userService.runQueryCallback(sql_variations_value,i,callback);
							}
						}else{
							data[0].variants = data_variations;
							var sql_related_prods = "select product.* , store.store_name,store.store_slug,store.state ,store.country , store.minimum_purcahse_amt_for_free_ship from product inner join store on product.store_id = store.store_id where product_id in (select product_id from product_category where cat_id in (select cat_id from product_category where product_id = "+pid+") and product.product_id != "+pid+") and product.is_active = 1 and product.is_deleted = 0 limit 12";
							userService.runQuery(sql_related_prods).then(function(r){
								if(r.length > 0){
									data_related_products = r;
									for(var i = 0;i<r.length;i++){
										var rpid = r[i].product_id;
										var sql_images = "select * from product_images where product_id = "+rpid;
										userService.runQueryCallback(sql_images,i,callback_releted_prod_img);
									}
								}else{
									data[0].related_products = data_related_products;
									var sql_product_by_seller = "select product.* , store.store_name,store.store_slug,store.state ,store.country , store.minimum_purcahse_amt_for_free_ship from product inner join store on product.store_id = store.store_id where product.vendor_id = "+vid+" and product.product_id != "+pid+" and product.is_active = 1 and product.is_deleted = 0 limit 12";
									userService.runQuery(sql_product_by_seller).then(function(r){
										if(r.length > 0){
											data_products_by_marchent = r;
											for(var i = 0;i<r.length;i++){
												var rpid = r[i].product_id;
												var sql_images = "select * from product_images where product_id = "+rpid;
												userService.runQueryCallback(sql_images,i,callback_marchent_prod_img);
											}
										}else{
											data[0].products_by_marchent = data_products_by_marchent;
											var data_to_send ={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,data:data[0],cookie_cart_count:res.locals.cookie_cart_count,vendor_id:vid};
											
											 data_to_send.meta_keywords="";
	                                         data_to_send.meta_desc="Check out "+pro_name+" from the finest Australian brands at Prazar ";
											 data_to_send.og_img="products/"+pro_img;
											 data_to_send.og_url=config.siteUrl+"product_datail?p="+prod_slug;
                                             data_to_send.og_type="product";
				                            res.render('front/product_datail',{title:""+pro_name+" - Australia Brands - Prazar",base_url:config.siteUrl,data:data_to_send});
											
										}
									}).catch(function(er){ console.log(er);
										res.redirect("/");
									});
								}						
							}).catch(function(er11){ console.log(er11);
								res.redirect("/");
							});
						}
					}).catch(function(e1){console.log(e1);
						res.redirect("/");
					});
				}).catch(function(er111){ console.log(er111);
					res.redirect("/");
				});
			}).catch(function(ei){ console.log(ei);
				res.redirect("/");
			});
		}).catch(function(e){ console.log(e);
			res.redirect("/");
		});
	}
  
});


/* Wishlist page */

router.all("/wishlist",function (req, res, next) {
    
    var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
    data.meta_desc="Save and share all the amazing items you find on Prazar to your personalized wishlist";
	
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"wishlist";
    data.og_type="website";
	
     if(req.session.userdata != undefined){
		 
        var user_id= req.session.userdata.user_id;
         
       //  var sql="select wishlist.id,wishlist.product_id,product.slug,product.product_name,product.sale_price,product.product_type,product.is_customizable,store.store_name,product.quantity_remaining from wishlist inner join product on wishlist.product_id=product.product_id inner join store on product.store_id=store.store_id where wishlist.customer_id='"+user_id+"' and wishlist.product_id not in (select product_id from  cart_items where customer_id="+user_id+") order by wishlist.added_on desc limit 25";
        
		var sql="select wishlist.id,wishlist.product_id,product.slug,product.product_name,product.sale_price,product.product_type,product.is_customizable,store.store_name,product.quantity_remaining from wishlist inner join product on wishlist.product_id=product.product_id inner join store on product.store_id=store.store_id where wishlist.customer_id='"+user_id+"' order by wishlist.added_on desc limit 25";
		
		
         userService.runQuery(sql).then(function(result){
        
             if(result.length>0){
            
                 var count=0;
                 var count1=0;
                 var final_result=[];
				 
                var callback_rate =function(flag,index,callback_result){
                     count1++;
                     if(callback_result[0].average_rates == null){
                        callback_result[0].average_rates = 0;
                     }
                     result[index]['average_rates'] = callback_result[0]['average_rates'];
                     result[index]['total_rates'] = callback_result[0]['total_rates'];
                     final_result.push(result[index]);
                     if(count1>=result.length){
                         data.wishlist=final_result;
						 
						
						 
						 /* FOR ADDING IN SHARED TABLE STARTS */
						 userService.runQuery("delete from shared_wishlist where user_id = "+user_id).then(function(rd){
							 var code = helpers.randomString(3,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
							 code = user_id+"_-"+code+""+user_id;
							 var sql_first_part = "insert into shared_wishlist (user_id,code,product_id) values ";
							 var str_ins = "";
							 for(var i=0;i<data.wishlist.length;i++){
								 str_ins = str_ins+"("+user_id+",'"+code+"',"+data.wishlist[i].product_id+"),";
							 }
							 str_ins = str_ins.substring(0, str_ins.length - 1);
							 var full_sql = sql_first_part+str_ins;
							 userService.runQuery(full_sql).then(function(rrr){
								  var shared_wishlist_url = config.siteUrl+"shared_wishlist?c="+code;
								  res.render('front/wishlist',{title: "Wishlist - List your favourite items - Prazar",base_url:config.siteUrl,data:data,shared_wishlist_url:shared_wishlist_url});
							 }).catch(function(eee){
								  res.render('front/wishlist',{title: "Wishlist - List your favourite items - Prazar",base_url:config.siteUrl,data:data});
							 });
						 }).catch(function(ed){
							 res.render('front/wishlist',{title: "Wishlist - List your favourite items - Prazar",base_url:config.siteUrl,data:data});
						 });
						 /* FOR ADDING IN SHARED TABLE ENDS */
                         //res.render('front/wishlist',{title: 'Prazar- wishlist',base_url:config.siteUrl,data:data});
                     }
                 }
				 
				 
				 
                 var callback =function(flag,index,callback_result){
                
                        count++;
						
						if(callback_result.length > 0){
							
							result[index]['is_in_cart']=1;
							
						}else{
							
							result[index]['is_in_cart']=0;
						}
						
						
                                         
                     if(count>=result.length){
                    
                        for(var i = 0;i<result.length;i++){
                            var pid = result[i]['product_id'];
                            var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+pid;
                            userService.runQueryCallback(sql_ratings,i,callback_rate);
                        }
                        
                        
                      }
                    
                  }
                
				
				 var callback_check_cart=function(flag,index,callback_result){
					 
					 
					  if(callback_result.length>0){
                           result[index]['image_url']=callback_result[0]['image_url'];
                       }else{
                         result[index]['image_url']="";
                       } 
					 
					 
					 var product_id= result[index]['product_id'];
					 
                     var sql="select product_id from cart_items where product_id="+product_id+" and customer_id="+user_id+" limit 1";
                    
					
					
                     userService.runQueryCallback(sql,index,callback);
					 
				 }
				
				
				
				//loop trough the results
                 for(var i=0;i<result.length;i++){
                
                     var product_id= result[i]['product_id'];
                     var sql="select image_url from product_images where product_id="+product_id+" limit 1";
                    
                     userService.runQueryCallback(sql,i,callback_check_cart);
                    
                  }
                
              }else{
                  
                  data.wishlist=result;
                  res.render('front/wishlist',{title: "Wishlist - List your favourite items - Prazar",base_url:config.siteUrl,data:data});
              
              }
            
            
            
         }).catch(function (err){  console.log(err);
                
            res.render('front/wishlist',{title: "Wishlist - List your favourite items - Prazar",base_url:config.siteUrl,data:data});
                
         });
        
        
    }else{
        res.redirect("/login");
    }
 
});


router.get("/shared_wishlist",function (req, res, next) {
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
    var id_srt = req.query.c;
    if(id_srt == undefined){
        res.redirect("/");
    }else{
        var tmp = id_srt.split("_-");
        var id_1 = tmp[0];
        var id_2 = tmp[1].substring(3);
        if(id_1 == id_2){
            var sql="select shared_wishlist.id,shared_wishlist.product_id,product.slug,product.product_name,product.sale_price,product.product_type,product.is_customizable,store.store_name from shared_wishlist inner join product on shared_wishlist.product_id=product.product_id inner join store on product.store_id=store.store_id where shared_wishlist.user_id="+mysql.escape(id_2)+"";
       
             userService.runQuery(sql).then(function(result){
            
                 if(result.length>0){
                
                     var count=0;
                     var count1=0;
                     var final_result=[];
                     var callback_rate =function(flag,index,callback_result){
                         count1++;
                         if(callback_result[0].average_rates == null){
                            callback_result[0].average_rates = 0;
                         }
                         result[index]['average_rates'] = callback_result[0]['average_rates'];
                         result[index]['total_rates'] = callback_result[0]['total_rates'];
                         final_result.push(result[index]);
                         if(count1>=result.length){
                             data.wishlist=final_result;
                             var shared_wishlist_url = config.siteUrl+"shared_wishlist?c="+id_srt;
                             res.render('front/shared_wishlist',{title: 'Prazar wishlist',base_url:config.siteUrl,data:data,shared_wishlist_url:shared_wishlist_url});
                         }
                     }
                     var callback =function(flag,index,callback_result){
                    
                            count++;
                           if(callback_result.length>0){
                               result[index]['image_url']=callback_result[0]['image_url'];
                           }else{
                             result[index]['image_url']="";
                           }                    
                         if(count>=result.length){
                        
                            for(var i = 0;i<result.length;i++){
                                var pid = result[i]['product_id'];
                                var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+pid;
                                userService.runQueryCallback(sql_ratings,i,callback_rate);
                            }
                            
                            
                          }
                        
                      }
                    
                     for(var i=0;i<result.length;i++){
                    
                         var product_id= result[i]['product_id'];
                         var sql="select image_url from product_images where product_id="+product_id+" limit 1";
                        
                         userService.runQueryCallback(sql,i,callback);
                        
                      }
                    
                  }else{
                      
                      data.wishlist=result;
                      res.render('front/shared_wishlist',{title: 'Prazar wishlist',base_url:config.siteUrl,data:data});
                  
                  }
                
                
                
             }).catch(function (err){  console.log(err);
                    
                res.render('front/shared_wishlist',{title: 'Prazar wishlist',base_url:config.siteUrl,data:data});
                    
             });
        }else{
            res.redirect("/");
        }
    }
});

router.post("/add_multiple_product_to_cart",function (req, res, next) {
	
    var user_id = req.session.userdata.user_id;
    var json_obj = JSON.parse(req.body.json_str);
    var count1 = 0;
    var callback_insert = function(flag,index,data){
		count1++;
        if(count1 >= json_obj.length){
            req.session.userdata.cart_count = req.session.userdata.cart_count+json_obj.length;
            res.send("400");
        }
    }
	
	 var count = 0;
	
    var callback = function(flag,index,data){
        count++
        if(data.length<=0){
            var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ('"+user_id+"',"+mysql.escape(json_obj[index].prd_id)+","+mysql.escape(json_obj[index].quantity)+",'"+today_time+"',"+mysql.escape(json_obj[index].is_customizable)+",'',"+mysql.escape(json_obj[index].product_type)+",'')";
            userService.runQueryCallback(sql_ins,i,callback_insert);
        }else{
            if(count >= json_obj.length){
                res.send("400");
            }
        }
    }
	
    for(var i = 0;i<json_obj.length;i++){
        var pid = json_obj[i].prd_id;
        var saleprice = json_obj[i].sale_price;
        var iscustomizable = json_obj[i].is_customizable;
        var customization_data = "";
        var product_type = json_obj[i].product_type;
        var variation_json = "";
        var quantity = json_obj[i].quantity;
        var today_time=helpers.getUtcTimestamp();
		
      //  var sql_chk = "select * from cart_items where customer_id = "+user_id+" and product_id = "+pid+" and is_customizable = "+iscustomizable+" and customization_data = '"+customization_data+"' and is_variable = "+product_type+" and variation_data = '"+variation_json+"'";
	  
	  var sql_chk = "select * from cart_items where customer_id = "+user_id+" and product_id = "+mysql.escape(pid)+"";
	  
        userService.runQueryCallback(sql_chk,i,callback);
    }
});



/*add product to cart*/

router.post("/add_product_to_cart",function (req, res, next) {
    
    if(req.session.userdata != undefined){
		
        var user_id = req.session.userdata.user_id;
        var user_role = req.session.userdata.user_role;
		
        var prd_id = req.body.prd_id;
        var sale_price = req.body.sale_price;
        var is_customizable = req.body.is_customizable;
        var customization_data = req.body.custom_text ? req.body.custom_text : '';
        var product_type = req.body.product_type;
        var variation_json = req.body.variation_json;
        var quantity = req.body.quantity;
        var today_time=helpers.getUtcTimestamp();
        if(variation_json == "{}"){
            variation_json = "";
        }
		
		
		/*check role is consumer*/
		if(user_role != 'consumer'){
			
			res.send("400");
			return;
		}
		
        var sql_chk = "select * from cart_items where customer_id = "+user_id+" and product_id = "+mysql.escape(prd_id)+" and is_customizable = "+mysql.escape(is_customizable)+" and customization_data = "+mysql.escape(customization_data)+" and is_variable = "+mysql.escape(product_type)+" and variation_data = "+mysql.escape(variation_json)+"";
        userService.runQuery(sql_chk).then(function(re){
            if(re.length > 0){
                res.send("400");    
            }else{
                var sql_ins = "INSERT INTO `cart_items`(`customer_id`, `product_id`, `quantity`, `added_on`, `is_customizable`, `customization_data`, `is_variable`, `variation_data`) VALUES ('"+user_id+"',"+mysql.escape(prd_id)+","+mysql.escape(quantity)+",'"+today_time+"',"+mysql.escape(is_customizable)+","+mysql.escape(customization_data)+","+mysql.escape(product_type)+","+mysql.escape(variation_json)+")";
                userService.runQuery(sql_ins).then(function(r){
					
					 req.session.userdata.cart_count = req.session.userdata.cart_count+1;
						 
                     res.send("200");
					
					
					/*remove from wish list if exist*/
					
					/* var sql_remove = "delete from wishlist where customer_id="+user_id+" and product_id="+mysql.escape(prd_id)+"";
					 
                userService.runQuery(sql_remove).then(function(res_remove){
					  
					
					}).catch(function(errr){console.log(errr);
                    res.send("500");    
                }); */
					
                   
                }).catch(function(e){console.log(e);
                    res.send("500");    
                });
            }            
        }).catch(function(er){console.log(er);
            res.send("500");
        });
    }else{
        res.send("500");
    }
 
});



/* cart page */
router.all("/shopping_cart",function (req, res, next) {
	
	
	
	var data_array = [];
	var related_pro_array = [];
	var product_ids=[];
	
	var count = 0;
	var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		
		 data_array[index]['ratings'] = result;	
		
         product_ids.push(data_array[index]['product_id']);
		
		if(count >= data_array.length){
			
			//get related products
			var sql_products = "select product.* , store.store_name,store.store_slug from product inner join store on product.store_id = store.store_id where product.is_active=1 and is_deleted=0 and product.product_id in(select product_id from product_category where cat_id in (select cat_id from product_category where product_id in ('"+product_ids+"'))) and product.product_id not in('"+product_ids+"') limit 12";
			
		
		
		   userService.runQuery(sql_products).then(function(result5){
			   
			   if(result5.length>0){
				    
				    var count1=0;
			 
			 var callback_ratings1=function(flag,index,result_rating){
			 
			     count1++;
			     if(result_rating[0].average_rates == null){
				   result_rating[0].average_rates = 0;
			     }
				 
				 result5[index]['ratings'] = result_rating;
				 
				 if(count1>=result5.length){
					
					var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,data:data_array,related_roducts:result5};
				
				
				         data.meta_keywords="";
	                     data.meta_desc="Quick checkout process with Prazar";
				          
                          data.og_img="front_assets/img/prazar.png";
						  data.og_url=config.siteUrl+"shopping_cart";
                         data.og_type="website";
					  //final second
		              res.render('front/shopping_cart',{title: "Shopping - cart Australian brands - Prazar",base_url:config.siteUrl,data:data});
				   
					 
				  }
				 
			  }
			 
			 var callback_image1=function(flag,index,result_img){
			 
				     result5[index]['images']= result_img;
				 
				     var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+result5[index].product_id;
				 
			         userService.runQueryCallback(sql_ratings,index,callback_ratings1);
				 
				 
			      }
			 
			 //loop through result
			 for(var i=0;i<result5.length;i++){
			         
				        var product_id = result5[i]['product_id'];
						
						var get_product_images = "select * from product_images where product_id = "+product_id+" limit 1";
						userService.runQueryCallback(get_product_images,i,callback_image1);
				 
			    }
				   
				   
				
				   
			    }else{
				   
				   
				   var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,data:data_array,related_roducts:related_pro_array};
				   	
				    data.meta_keywords="";
	                data.meta_desc="Quick checkout process with Prazar";
				   
                     data.og_img="front_assets/img/prazar.png";
					 data.og_url=config.siteUrl+"shopping_cart";
                     data.og_type="website";
					 
					 
					  //final first
		              res.render('front/shopping_cart',{title: "Shopping - cart Australian brands - Prazar",base_url:config.siteUrl,data:data});
				   
				   
			    }
			   
			   
		    }).catch(function(e5){
			  res.redirect("/login");
		    });
			
			
			
		}
	}
	var callback_image = function(falg,index,result){
		data_array[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+data_array[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	function get_product_rate_and_image(prd_arr){
		
		data_array = prd_arr;
		
		for(var i=0;i<prd_arr.length;i++){
			
			/*customize text calculate */
			
			var custom_price_to_add=0;
			
			if(prd_arr[i].customization_data !=""){
				
				var custom_str=prd_arr[i].customization_data;
				var customize_price=prd_arr[i].customize_price;
				
				var arr_custom=custom_str.split('~');
				
				for(j=0;j<arr_custom.length;j++){
					var strr=arr_custom[j];
					var str_ar=strr.split('##');
					
					if(str_ar[1]!=""){
						custom_price_to_add=customize_price;
					}
				}
			}
			
			
			
			data_array[i].sale_price=data_array[i].sale_price+custom_price_to_add;
			
			var product_id = prd_arr[i].product_id;
			var sql_images = "select * from product_images where product_id = "+product_id;
			userService.runQueryCallback(sql_images,i,callback_image);
		}
	}
	
	if(req.session.userdata != undefined){
		
		var user_id = req.session.userdata.user_id;
		var get_products = "select cart_items.id as cart_item_id , cart_items.quantity, cart_items.customization_data, cart_items.variation_data , product.product_id, product.vendor_id, product.store_id, product.product_type, product.primary_category, product.sku,product.slug, product.product_name, product.product_description, product.product_short_description, product.price, product.sale_price, product.gender, product.quantity_soled, product.quantity_remaining, product.is_customizable, product.is_shipped_overseas, product.ship_region, product.is_gift_wrap, product.gift_price, product.is_express_delivery, product.product_width, product.product_height, product.product_weight, product.is_free_delivery, product.ship_price, product.ship_with_in, product.number_of_order, product.specification, product.delivery_returns, product.added_on, product.is_active, product.is_deleted , store.store_name , store.minimum_purcahse_amt_for_free_ship ,product.customize_price , product.express_delivery_price , product.ship_overseas_price from cart_items inner join product on cart_items.product_id = product.product_id inner join store on product.store_id = store.store_id where cart_items.customer_id = "+user_id;
		userService.runQuery(get_products).then(function(r){
			
			if(r.length>0){
				for(var i=0;i<r.length;i++){
					var customizable_str = r[i].customization_data;
					var arr_tmp_1 = customizable_str.split("~");
					var user_select_customizable_option = 0;
					for(var j=0;j<arr_tmp_1.length;j++){
						var tmp_arr_2 = arr_tmp_1[j].split("##");
						if(tmp_arr_2[1] != "" && tmp_arr_2[1] != null && tmp_arr_2[1] != undefined){
							user_select_customizable_option = 1;
						}
					}
					r[i].user_select_customizable_option = user_select_customizable_option;
					//console.log(r[i])
					if(r[i]['is_free_delivery'] == 1){
						var standard_shipping = 0;
						var standard_price = 0;
					}else{
						var standard_shipping = 1;
						var standard_price = r[i]['ship_price'];
					}
					
					if(r[i]['is_express_delivery'] == 1){
						var express_delivery = 1;
						var express_price = r[i]['express_delivery_price'];
					}else{
						var express_delivery = 0;
						var express_price = 0;
					}
					
					if(r[i]['is_shipped_overseas'] == 1){
						var overseas_delivery = 1;
						var overseas_price = r[i]['ship_overseas_price'];
					}else{
						var overseas_delivery = 0;
						var overseas_price = 0;
					}
					
					r[i]['standard_shipping'] = standard_shipping;
					r[i]['standard_price'] = standard_price;
					r[i]['express_delivery'] = express_delivery;
					r[i]['express_price'] = express_price;
					r[i]['overseas_delivery'] = overseas_delivery;
					r[i]['overseas_price'] = overseas_price;
					
				}
				for(var i = 0;i<r.length;i++){
					for(var j = 0;j<r.length;j++){
						if(i!=j && r[i].store_id ==	r[j].store_id){
							if(!r[i].total_store_amount)r[i].total_store_amount=r[i].sale_price*r[i].quantity;
							 r[i].total_store_amount=r[i].total_store_amount+(r[j].sale_price*r[j].quantity);
						}
					}	
					if(!r[i].total_store_amount){
						r[i].total_store_amount = r[i].sale_price*r[i].quantity;
					}		
				}
				get_product_rate_and_image(r);
			}else{
				
				var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,data:data_array,related_roducts:related_pro_array};
				
			            data.meta_keywords="";
	                    data.meta_desc="Quick checkout process with Prazar";
				
                        data.og_img="front_assets/img/prazar.png";
					  
		              res.render('front/shopping_cart',{title: "Shopping - cart Australian brands - Prazar",base_url:config.siteUrl,data:data});
			}
			
			
		}).catch(function(e){console.log(e);
			res.redirect("/login");
		});
	}else{
		
		
		if(req.cookies.cart_items != undefined){
         			
			var items = JSON.parse(req.cookies.cart_items); 
			if(items.length > 0){
				var j = 0;
				var sub_data = [];
				var c = 0;
				var callback = function(falg,index,result){
					c++;
					var cart_item = sub_data[index].cart_item_id;
					var quantity = sub_data[index].quantity;
					var variation_data = sub_data[index].variation_data;
					var customization_data = sub_data[index].customization_data;
					sub_data[index] = result[0];
					sub_data[index]['cart_item_id'] = cart_item;
					sub_data[index]['quantity'] = quantity;
					sub_data[index]['variation_data'] = variation_data;
					sub_data[index]['customization_data'] = customization_data;
					
					if(sub_data[index]['is_free_delivery'] == 1){
						var standard_shipping = 0;
						var standard_price = 0;
					}else{
						var standard_shipping = 1;
						var standard_price = sub_data[index]['ship_price'];
					}
					
					if(sub_data[index]['is_express_delivery'] == 1){
						var express_delivery = 1;
						var express_price = sub_data[index]['express_delivery_price'];
					}else{
						var express_delivery = 0;
						var express_price = 0;
					}
					
					if(sub_data[index]['is_shipped_overseas'] == 1){
						var overseas_delivery = 1;
						var overseas_price = sub_data[index]['ship_overseas_price'];
					}else{
						var overseas_delivery = 0;
						var overseas_price = 0;
					}
					
					sub_data[index]['standard_shipping'] = standard_shipping;
					sub_data[index]['standard_price'] = standard_price;
					sub_data[index]['express_delivery'] = express_delivery;
					sub_data[index]['express_price'] = express_price;
					sub_data[index]['overseas_delivery'] = overseas_delivery;
					sub_data[index]['overseas_price'] = overseas_price;
					
					var customizable_str = sub_data[index]['customization_data'];
					var arr_tmp_1 = customizable_str.split("~");
					var user_select_customizable_option = 0;
					for(var j=0;j<arr_tmp_1.length;j++){
						var tmp_arr_2 = arr_tmp_1[j].split("##");
						if(tmp_arr_2[1] != "" && tmp_arr_2[1] != null && tmp_arr_2[1] != undefined){
							user_select_customizable_option = 1;
						}
					}
					sub_data[index]['user_select_customizable_option'] = user_select_customizable_option;
					var temp_final=[];
					if(c >= items.length){//console.log(sub_data);
						for(var i = 0;i<sub_data.length;i++){
							for(var j = 0;j<sub_data.length;j++){
								if(i!=j && sub_data[i].store_id ==	sub_data[j].store_id){
									if(!sub_data[i].total_store_amount)sub_data[i].total_store_amount=sub_data[i].sale_price*sub_data[i].quantity;
									 sub_data[i].total_store_amount=sub_data[i].total_store_amount+(sub_data[j].sale_price*sub_data[j].quantity);
								}
							}	
							if(!sub_data[i].total_store_amount){
								sub_data[i].total_store_amount = sub_data[i].sale_price*sub_data[i].quantity;
							}
						}
						get_product_rate_and_image(sub_data);
					}
				}
				
				//entry point
				for(var i = 0;i<items.length;i++){
					
					var variation_json_str = JSON.stringify(items[i].variation_json);
					var quantity = items[i].quantity;
					var customization_data = items[i].custom_text;
					if(items[i].product_id == undefined){
						items[i].product_id = items[i].prd_id;
					}
					
					var obj = {cart_item_id:0,quantity:quantity,variation_data:variation_json_str,customization_data:customization_data};
					sub_data.push(obj);
					var sql = "select product.* , store.store_name , store.minimum_purcahse_amt_for_free_ship from product inner join store on product.store_id = store.store_id where product_id = "+items[i].prd_id;
					userService.runQueryCallback(sql,i,callback);
				}
			}else{
				var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,data:data_array,related_roducts:related_pro_array}; //console.log(JSON.stringify(data));
				
                         data.meta_keywords="";
	                     data.meta_desc="Quick checkout process with Prazar";
				         
                         data.og_img="front_assets/img/prazar.png";
					  //final second
		              res.render('front/shopping_cart',{title: "Shopping - cart Australian brands - Prazar",base_url:config.siteUrl,data:data});
				
			}
		}else{
			
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,data:data_array,related_roducts:related_pro_array}; //console.log(JSON.stringify(data));	
			
			 data.meta_keywords="";
	         data.meta_desc="Quick checkout process with Prazar";
			
             data.og_img="front_assets/img/prazar.png";	
			 
					  //final second
		              res.render('front/shopping_cart',{title: "Shopping - cart Australian brands - Prazar",base_url:config.siteUrl,data:data});
		}		
	}
});


router.all("/remove_prd_from_cart_page",function (req, res, next) {
	
	var cart_item_id = req.body.cart_item_id;
	var user_id = req.session.userdata.user_id;
	var sql = "DELETE FROM `cart_items` WHERE `id` = "+mysql.escape(cart_item_id)+" and customer_id="+user_id+"";
	userService.runQuery(sql).then(function(r){
		
		var cart_count=parseInt(req.session.userdata.cart_count);
		
		req.session.userdata.cart_count=cart_count-1;
		
		res.send("400");
		
	}).catch(function(e){
		res.send("500");
	});
});


/* checkout */
router.all("/checkout",function (req, res, next) {
	
	
	if(req.cookies.checkout_items != undefined){ 
		var items = JSON.parse(req.cookies.checkout_items);
		
		
		
		for(var i=0;i<items.prd_data.length;i++){
			
			items.prd_data[i].gift_wrap_price=parseFloat(items.prd_data[i].gift_wrap_price);
			items.prd_data[i].single_item_price=parseFloat(items.prd_data[i].single_item_price);
			items.prd_data[i].item_ship_price=parseFloat(items.prd_data[i].item_ship_price);
			
		}
		
		//console.log(items.prd_data);
		
		var total_ship_price = parseFloat(items.cart_ship_total);
		var total_cart_price = parseFloat(items.cart_full_total);
		var cart_sub_total = parseFloat(items.cart_sub_total);
		var product_length = items.prd_data.length;
		cart_sub_total = cart_sub_total.toFixed(2); 
		total_ship_price = total_ship_price.toFixed(2); 
		total_cart_price = total_cart_price.toFixed(2); 
		var final_data = {prd_list:items.prd_data,product_length:product_length,total_ship_price:total_ship_price,total_cart_price:total_cart_price,cart_sub_total:cart_sub_total};
		var user_address = [];//console.log(final_data);
		if(req.session.userdata != undefined){
			var user_id = req.session.userdata.user_id;
			var sql = "select * from customer_shipping_address where customer_id = "+user_id+" and is_active = 1 and is_deleted = 0 and is_show = 1";
			userService.runQuery(sql).then(function(r){
				var user_address = r;
				var sql2 = "select * from countries";
				userService.runQuery(sql2).then(function(r2){
					var country = r2;
					var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,data:final_data,country:country,user_address:user_address};
					
					
                    data.og_img="front_assets/img/prazar.png";
					
					res.render('front/checkout',{title: 'Checkout - prazar',base_url:config.siteUrl,data:data});
				}).catch(function(e){console.log(e);
					res.redirect("/shopping_cart");
				});
			}).catch(function(e1){console.log(e1);
				res.redirect("/shopping_cart");
			});
		}else{
			var sql2 = "select * from countries";
			userService.runQuery(sql2).then(function(r){
				var country = r;
				var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,data:final_data,country:country,user_address:user_address};
				
                data.og_img="front_assets/img/prazar.png";
				
				res.render('front/checkout',{title: 'Checkout - prazar',base_url:config.siteUrl,data:data});
			}).catch(function(e){console.log(e);
				res.redirect("/shopping_cart");
			});
		}
	}else{
		res.redirect("/shopping_cart");
	}
  
});

router.post("/get_address_by_id",function (req, res, next) {
	var id = req.body.id;
	var sql = "select * from customer_shipping_address where id = "+mysql.escape(id)+"";
	userService.runQuery(sql).then(function(r){
		var country = r[0].country;
		var sql_get_all_state = "select name from states where country_id = (select id from countries where name = '"+country+"')";
		userService.runQuery(sql_get_all_state).then(function(r1){
			r[0].all_states = r1;
			res.send({data:r[0],status:200});
		}).catch(function(er){
			res.send({data:{},status:201});
		});		
	}).catch(function(e){
		res.send({data:{},status:201});
	})
});

router.post("/get_state_by_country",function (req, res, next) {
	var country = req.body.country;
	var sql = "select * from states where country_id = (select id from countries where name = "+mysql.escape(country)+")";
	userService.runQuery(sql).then(function(r){
		var str = "";
		for(var i = 0;i<r.length;i++){
			str = str+"<option value='"+r[i].name+"'>"+r[i].name+"</option>";
		}
		res.send(str);
	}).catch(function(e){
		res.send("");
	})
});

/*
router.post("/place_order_ajax",function (req, res, next) {
	
	if(req.cookies.checkout_items != undefined){ 
	
		var shpping_fname = req.body.shpping_fname;
		var shpping_lname = req.body.shpping_lname;
		var shpping_cname = req.body.shpping_cname;
		var shpping_phn = req.body.shpping_phn;
		var shpping_street = req.body.shpping_street;
		var shpping_street2 = req.body.shpping_street2;
		var shpping_city = req.body.shpping_city;
		var shpping_postcode = req.body.shpping_postcode;
		var shpping_country = req.body.shpping_country;
		var shpping_state = req.body.shpping_state;
		var billing_fname = req.body.billing_fname;
		var billing_lname = req.body.billing_lname;
		var billing_cname = req.body.billing_cname;
		var billing_phn = req.body.billing_phn;
		var billing_street = req.body.billing_street;
		var billing_street2 = req.body.billing_street2;
		var billing_city = req.body.billing_city;
		var billing_postcode = req.body.billing_postcode;
		var billing_country = req.body.billing_country;
		var billing_state = req.body.billing_state;
		var user_id = req.session.userdata.user_id;
		var today_time=helpers.getUtcTimestamp();
	
		var items = JSON.parse(req.cookies.checkout_items);
		var total_ship_price = parseFloat(items.cart_ship_total);
		var total_cart_price = parseFloat(items.cart_full_total);
		var cart_sub_total = parseFloat(items.cart_sub_total);
		var gift_wrap_price = 0;
		var prd_list = items.prd_data;
		var is_coupon_applied_to_cart = 0;
		var code_id_arr = [];
		var count = 0;
		var cart_items_id_str = "";
		
		var order_unique_id = 0;
		
		function update_product_quantity(){
			var cb_count = 0;
			var callback2 = function(flag,index,results){
				cb_count++;
				if(cb_count >= prd_list.length){
					res.clearCookie('cart_items');
					res.clearCookie('checkout_items');
					res.send("200");
				}
			}
			for(var i = 0;i<prd_list.length;i++){
				var quantity = parseInt(prd_list[i].quantity);
				var pid = parseInt(prd_list[i].pid);
				var sql = "UPDATE `product` SET `quantity_soled`= (quantity_soled + "+quantity+") ,`quantity_remaining`=(quantity_remaining - "+quantity+") WHERE `product_id` = "+pid;
				userService.runQueryCallback(sql,i,callback2);
			}
		}
		
		for(var i = 0;i<prd_list.length;i++){
			if(prd_list[i].is_gift_wrap == 1){
				gift_wrap_price = parseFloat(gift_wrap_price) + parseFloat(prd_list[i].gift_wrap_price);
			}
			if(prd_list[i].code_id != "" && prd_list[i].code_id != undefined){
				is_coupon_applied_to_cart = 1;
				code_id_arr.push(prd_list[i].code_id);
			}
			cart_items_id_str = cart_items_id_str + prd_list[i].cart_item_id+",";
		}
		cart_items_id_str = cart_items_id_str.replace(/,\s*$/, "");
		cart_sub_total = cart_sub_total - gift_wrap_price;
		
		var callback = function(flag,index,results){
			count++;
			if(count >= code_id_arr.length){
				update_product_quantity();
			}
		}
		var order_no = 1001;
		var sql_order_no = "select max(order_no) as last_on from orders";
		userService.runQuery(sql_order_no).then(function(ro){
			var last_on = parseInt(ro[0].last_on);
			if(last_on == undefined || last_on == null || last_on == ""){
				order_no = 1001;
			}else{
				order_no = last_on + 1;
			}
			var insert_order = "INSERT INTO `orders`(`customer_id`, `order_no`, `shipping_tracking_no`, `order_date`, `shipping_date`, `payment_date`, `order_status`, `order_payment_type`, `sub_total`, `shipping_total`, `gift_wrap_total`, `order_total`, `is_paid`, `ship_fullname`, `ship_company`, `ship_phone`, `ship_addr1`, `ship_add2`, `ship_city`, `ship_state`, `ship_country`, `ship_zip_code`, `bill_fullname`, `bill_company`, `bill_phone`, `bill_addr1`, `bill_addr2`, `bill_city`, `bill_state`, `bill_country`, `bill_zip_code`, `is_coupon_applied_to_cart`) VALUES ('"+user_id+"','"+order_no+"','','"+today_time+"','','"+today_time+"','0','1','"+cart_sub_total+"','"+total_ship_price+"','"+gift_wrap_price+"','"+total_cart_price+"','1',"+mysql.escape(shpping_fname)+" "+mysql.escape(shpping_lname)+","+mysql.escape(shpping_cname)+","+mysql.escape(shpping_phn)+","+mysql.escape(shpping_street)+","+mysql.escape(shpping_street2)+","+mysql.escape(shpping_city)+","+mysql.escape(shpping_state)+","+mysql.escape(billing_country)+","+mysql.escape(shpping_postcode)+","+mysql.escape(billing_fname+" "+billing_lname)+","+mysql.escape(billing_cname)+","+mysql.escape(billing_phn)+","+mysql.escape(billing_street)+","+mysql.escape(billing_street2)+","+mysql.escape(billing_city)+","+mysql.escape(billing_state)+","+mysql.escape(billing_country)+","+mysql.escape(billing_postcode)+",'"+is_coupon_applied_to_cart+"')";
			userService.runQuery(insert_order).then(function(r){
				order_unique_id = r.insertId;
				var insert_items_str = "";
				for(var i = 0;i<prd_list.length;i++){
					insert_items_str = insert_items_str+"('"+order_unique_id+"','"+prd_list[i].pid+"','"+prd_list[i].is_customizable+"','"+prd_list[i].customization_data+"','"+prd_list[i].single_item_price+"','"+prd_list[i].quantity+"','"+prd_list[i].is_variable+"','"+(prd_list[i].variation_data)+"','"+prd_list[i].add_request+"','"+prd_list[i].code_id+"','"+prd_list[i].code_name+"','"+prd_list[i].code_value+"','"+prd_list[i].is_gift_wrap+"','"+prd_list[i].gift_wrap_price+"','"+prd_list[i].item_ship_price+"','"+prd_list[i].item_total_price+"'),";
				}
				insert_items_str = insert_items_str.replace(/,\s*$/, "");
				var sql_inset_items = "INSERT INTO `order_products`(`order_id`, `product_id`, `is_customizable`, `customization_data`, `unit_price`, `quantity`, `is_variable`, `variation_data`, `add_request`, `code_id`, `code_name`, `code_value`, `is_gift_wrap`, `gift_wrap_price`, `item_ship_price`, `item_total_price`) VALUES "+insert_items_str;
				userService.runQuery(sql_inset_items).then(function(ri){
					var delete_cart_data = "DELETE FROM `cart_items` WHERE `id` in ("+cart_items_id_str+")";
					
					userService.runQuery(delete_cart_data).then(function(ed){
						if(code_id_arr.length > 0){
							for(var j=0;j<code_id_arr.length;j++){
								var sql_ins_code = "INSERT INTO `customers_used_promocodes`(`code_id`, `customer_id`, `redeemed_on`) VALUES ('"+code_id_arr[i]+"','"+user_id+"','"+today_time+"')";
								userService.runQueryCallback(sql_ins_code,i,callback);
							}
						}else{
							update_product_quantity();
						}		
					}).catch(function(rd){console.log(rd);
						res.send("500");
					});
				}).catch(function(ei){console.log(ei);
					res.send("500");
				});
			}).catch(function(e){console.log(e);
				res.send("500");
			})
		}).catch(function(eo){
			res.send("500");
		});
	}else{console.log("not logged in");
		res.send("500");
	}
});

*/


router.all("/thankyou",function (req, res, next) {
	
    var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
    data.og_img="front_assets/img/prazar.png";
	
    res.render('front/thankyou',{title: 'Prazar Buy With Us ',base_url:config.siteUrl,data:data});
  
});


/* sell with us page */
router.all("/sell_with_us",function (req, res, next) {
	
	 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
    data.og_img="front_assets/img/prazar.png";
	
   /* from submit condition */	
	if(req.body.sub){
		
		var fname=helpers.htmlEntities(req.body.first_name);
		var lname=helpers.htmlEntities(req.body.last_name);
		var e_mail=req.body.e_mail;
		var phone=helpers.htmlEntities(req.body.phone_number);
		var business_name=helpers.htmlEntities(req.body.business_name);
		var business_location=helpers.htmlEntities(req.body.address_line1);
		var about_you=helpers.htmlEntities(req.body.about_you);
		var url_type=helpers.htmlEntities(req.body.url_type);

		var website_url=req.body.website_url ? req.body.website_url : "" ;
		
		
		var business_location2=req.body.address_line2 ? req.body.address_line2 : "" ;
		
		var country=req.body.country;
		var state=req.body.state;
		var city=helpers.htmlEntities(req.body.city);
		var zip_code=helpers.htmlEntities(req.body.zip_code);
		
		var product_name=req.body.product_name;
		var total_imgs=req.body.total_imgs;
		var product_category=req.body.product_category ;
		var link=req.body.link;
		var description=req.body.description ;
		
		//console.log("descriptions "+description);
		
		var cat_sug=req.body.cat_sug ;
		
		var lat=req.body.lat ? req.body.lat : 0;
		var lng=req.body.lng ? req.body.lng : 0;
		
		var fullname=fname+" "+lname;
		
		fullname=fullname.replace(/'/g, "''");
		about_you=about_you.replace(/'/g, '"');
		business_name=business_name.replace(/'/g, "''");
		business_location2=business_location2.replace(/'/g, "''");
		zip_code=zip_code.replace(/'/g, "''");
		city=city.replace(/'/g, "''");
		
		if(business_location2!=""){
			
			business_location2=helpers.htmlEntities(business_location2);
		}
		
		
		
		var today_time=helpers.getUtcTimestamp();
		
		var sql1 = "select user_id from users where email="+mysql.escape(e_mail)+" and is_deleted=0";
       
         userService.runQuery(sql1).then(function(result1){ 
		 
			 /* email already exist */
			 
			 if(result1.length>0){
			   
			    var sql_country = "select * from countries";
       
                userService.runQuery(sql_country).then(function(country_results){
			   
			   
				 data.error="email address already in used";
				 data.form_data=req.body;
			
	             data.categories=res.locals.categories ;
		         data.countries=country_results;
				 
				 
				 res.render('front/sell_with_us',{title: 'Prazar Sell With us ',base_url:config.siteUrl,data:data});
				 
				}).catch(function (err_countrieis) {  console.log(err_countrieis)

			      data.error="Internal server error";

			       res.render('front/sell_with_us',{title: 'Prazar Sell With us ',base_url:config.siteUrl,data:data});

		       }); 
				 
			 }else{
			 
				 
				var sql2 = "INSERT INTO `users`(`name`,`fname`,`lname`, `email`, `password`, `role`, `registered_on`, `is_active`, `is_deleted`, `is_requested`, `is_approve`, `verify_code`) VALUES ("+mysql.escape(fullname)+","+mysql.escape(fname)+","+mysql.escape(lname)+","+mysql.escape(e_mail)+",'',0010,'"+today_time+"',0,0,1,0,'')";
       
         userService.runQuery(sql2).then(function(result2){ 
		 
			 var user_id=result2.insertId;
			 
			 /* submit type condition */
			 
			 //create slug
			 var business_name_slug=business_name;
			 
			 business_name_slug=business_name_slug+user_id;
			 
	         var target=" &=%?~+";
	         var replacement="-";
			 
	         var store_slug =helpers.findAndReplace(business_name_slug, target, replacement);
			 
			
			 	var sql3 = "INSERT INTO `store`(`vendor_id`, `store_name`,`store_slug`, `contact_name`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `country`, `phone_no`, `fax_no`, `email`, `store_logo`, `lat`, `lng`, `description`, `site_url`) VALUES ("+user_id+","+mysql.escape(business_name)+",'"+store_slug+"','',"+mysql.escape(business_location)+","+mysql.escape(business_location2)+","+mysql.escape(city)+","+mysql.escape(state)+","+mysql.escape(zip_code)+","+mysql.escape(country)+","+mysql.escape(phone)+",'','','',"+mysql.escape(lat)+","+mysql.escape(lng)+","+mysql.escape(about_you)+","+mysql.escape(website_url)+")";
				  
      	 userService.runQuery(sql3).then(function(result3){	
			 

		 }).catch(function (err3) {  console.log(err3)

			data.error="Internal server error";

			res.render('front/sell_with_us',{title: 'Prazar Sell With us ',base_url:config.siteUrl,data:data});

		  }); 
			 
			 
	   if(url_type=='url'){
		   
			/* success first*/
		   
			  var subject="Prazar- Seller Application";
		
			  var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" > <div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"> <h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1> <font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+fullname+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thanks for taking the time to fill out our new sellers form.<br>Your application is now under consideration and we will get back to you within the next 24 hours. <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table> </div></td></tr></table> </center> </body></html>';
			 
			   helpers.sendMail(e_mail,htmlmsg,"",subject,function(flag,msg,info){
				 
			    res.redirect("/sell_with_us_done?yes=true");
				
				sendSellWithUsEmailToAdmin();
				 
			 });
				  
				  
		 }else{ /* manual submission condition*/
			  
		 
			 /* check single product to upload */
			    if(Array.isArray(product_name)){
					
			    var counter=0;
			   
			    var callback2 =function(flag,index,callback_result){
			       
				   
				   var product_id=callback_result.insertId;
				   
				 
					  if(index==0){
						  
						    var total_images= parseInt(total_imgs[index]);
						  
						    var img_counter=0;
						  
					   }else{
						   
						     var total_images= parseInt(total_imgs[index]);
						     var total_images_old= parseInt(total_imgs[index-1]);
						 
						     var img_counter=total_images+total_images_old-2;
							 
						      total_images=total_images+img_counter;
					   }
				   
				   
				   
				   var callback_image=function(flag,filename){
					      
					   
					  if(!flag){
						     
							var sql7 = "INSERT INTO `vendor_product_images`(`product_id`, `image_path`) VALUES ('"+product_id+"','"+filename+"')";
       
                          userService.runQuery(sql7).then(function(result7){  
		 
		 
		                   }).catch(function (err7){ console.log(err7)
		   
		                       data.error="Internal server error";
			 
		                       res.render('front/sell_with_us',{title: 'Prazar- Sell With us',base_url:config.siteUrl,data:data});
		
                           });
							 
						}else{
							
							console.log("failed to upload file");
						}
						  
					 }
					
				  
				  
				  var  Files = req.files.product_image;
				  
				 
				  
				  for(var i=img_counter;i<total_images;i++){
					  
					  
				      var file_name = Files[i].name;
					  
					 // console.log("file name with index "+file_name+" -"+i);
                      var filenewname = helpers.getUtcTimestamp();
                      var file_ext = "";
		
                     if (file_name != null && file_name != undefined) {
					  
                        var temp = file_name.lastIndexOf('.');
                        file_ext = (temp < 0) ? '' : file_name.substr(temp);
					  
                       }

                      filenewname = i+filenewname + file_ext;
				
					  //helpers.uploadNewfile1(Files[i],"uploads/vendor_products/",filenewname,callback_image);
					  helpers.uploadNewfile(Files[i],"/uploads/vendor_products/",filenewname,callback_image); 	
				     }
				   
				   /* main call back end condition */
			       counter++;
				   if(counter>=product_name.length){
					   
				          /* success third*/
			 
							var subject="Prazar- Seller Application";
							

                        var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" > <div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"> <h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1> <font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+fullname+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thanks for taking the time to fill out our new sellers form.<br>Your application is now under consideration and we will get back to you within the next 24 hours. <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table> </div></td></tr></table> </center> </body></html>';
							
							
						    helpers.sendMail(e_mail,htmlmsg,"",subject,function(flag,msg,info){

							res.redirect("/sell_with_us_done?yes=true");	
                            sendSellWithUsEmailToAdmin();
							
						 });
				    }
				   
			     }
					
				    for(var j=0;j<product_name.length;j++){
				  
						var pro_link=link[j] ? link[j] :"";
						var cat_suge=cat_sug[j] ? cat_sug[j] :"";
						var product_desc=description[j] ? description[j] :"";
						
						pro_link=pro_link.replace(/'/g, "''");
						
					   cat_suge=cat_suge.replace(/'/g, "''");
					   
					   product_desc=product_desc.replace(/'/g, "''");
					
					  var sql6 = "INSERT INTO `vendor_products`( `vendor_id`, `name`, `category`, `link`, `description`, `is_active`,`suggest_cat`) VALUES ("+user_id+",'"+product_name[j].replace(/'/g, "''")+"','"+product_category[j]+"',"+mysql.escape(pro_link)+",'"+mysql.escape(product_desc)+"',1,"+mysql.escape(cat_suge)+")";
						
						
                	  userService.runQueryCallback(sql6,j,callback2);
					  
				    }
			
			     }else{  // single product
					 
					 
					  var  Files = req.files.product_image;
					 
					  var product_desc=description ? description :"";
					  
					  var  cat_suge=cat_sug ? cat_sug :"";
					 
					  product_desc=product_desc.replace(/'/g, "''");
					  product_name=product_name.replace(/'/g, "''");
					  cat_suge=cat_suge.replace(/'/g, "''");
					 
					   var sql4 = "INSERT INTO `vendor_products`( `vendor_id`, `name`, `category`, `link`, `description`, `is_active`,`suggest_cat`) VALUES ("+user_id+","+mysql.escape(product_name)+",'"+product_category+"','"+link+"',"+mysql.escape(product_desc)+",1,"+mysql.escape(cat_suge)+")";
       
                userService.runQuery(sql4).then(function(result4){
				
					var pro_id=result4.insertId ;
					
				 var callback=function(flag,filename){
					      
					  if(!flag){
						     
						var sql5 = "INSERT INTO `vendor_product_images`(`product_id`, `image_path`) VALUES ('"+pro_id+"','"+filename+"')";
       
                          userService.runQuery(sql5).then(function(result5){  
		 
		 
		                   }).catch(function (err5){ console.log(err5)
		   
		                       data.error="Internal server error";
			 
		                       res.render('front/sell_with_us',{title: 'Prazar- Sell With us',base_url:config.siteUrl,data:data});
		
                           });
							 
						}
						  
					   }
					
					
				if(Array.isArray(Files)){  //check images single or multi
						
					for(var i=0;i<Files.length;i++){
					  
					  
				      var file_name = Files[i].name;
					  
                      var filenewname = helpers.getUtcTimestamp();
                      var file_ext = "";
		
                     if (file_name != null && file_name != undefined) {
					  
                        var temp = file_name.lastIndexOf('.');
                        file_ext = (temp < 0) ? '' : file_name.substr(temp);
					  
                       }

                      filenewname = i+filenewname + file_ext;
					  
				  
					  //helpers.uploadNewfile1(Files[i],"uploads/vendor_products/",filenewname,callback);
					   helpers.uploadNewfile(Files[i],"/uploads/vendor_products/",filenewname,callback); 
					  
				      }
						
						
					}else{
						
						var file_name = Files.name;
					  
                        var filenewname = helpers.getUtcTimestamp();
                        var file_ext = "";
		
                      if (file_name != null && file_name != undefined) {
					  
                        var temp = file_name.lastIndexOf('.');
                        file_ext = (temp < 0) ? '' : file_name.substr(temp);
					  
                       }

                      filenewname = filenewname + file_ext;
					  
					 // helpers.uploadNewfile1(Files,"uploads/vendor_products/",filenewname,callback);
					  helpers.uploadNewfile(Files,"/uploads/vendor_products/",filenewname,callback); 	
					}
					
				
					
				 /* success second*/
			 
			    var subject="Prazar- Seller Application";
			  
			 
			 
			 var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" > <div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"> <h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1> <font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+fullname+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thanks for taking the time to fill out our new sellers form.<br>Your application is now under consideration and we will get back to you within the next 24 hours. <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table> </div></td></tr></table> </center> </body></html>';
			 
			 
			 helpers.sendMail(e_mail,htmlmsg,"",subject,function(flag,msg,info){
			 
			    res.redirect("/sell_with_us_done?yes=true");	
			    sendSellWithUsEmailToAdmin();
			 });
				 
					
				
				}).catch(function (err4) {  console.log(err4)
		   
		               data.error="Internal server error";
			 
		               res.render('front/sell_with_us',{title: 'Prazar- Sell With us ',base_url:config.siteUrl,data:data});
		
                   }); 
			   
		  }
			  
		}
			

       function sendSellWithUsEmailToAdmin(){
			
			//send email to admin
			
		   var subject1="Prazar- Sell With Us Request";
		 
		   var htmlmsg='<html><head><title>Sell With Us Request</title></head><body><div><p>Hi <br/> One new sell with us request recieved</p></div></body></html>';
			
            

     			
		   var reciver_email=config.contact_email;	 
		 
		  helpers.sendMail(reciver_email,htmlmsg,"",subject1,function(flag,msg,send_res){
			  
			  
		  });
			
			
		}

			
		 }).catch(function (err2) {  console.log(err2)
		   
		    data.error="Internal server error";
			 
		    res.render('front/sell_with_us',{title: 'Prazar Sell With us ',base_url:config.siteUrl,data:data});
		
          });  
				 
				 
	   }
		 
      }).catch(function (err1) {  console.log(err1)
		   
		    data.error="Internal server error";
			 
		    res.render('front/sell_with_us',{title: 'Prazar Sell With us ',base_url:config.siteUrl,data:data});
		
     });   
		
  }else{
	
	  /* get condition */
	  
         var sql_country = "select * from countries";
       
         userService.runQuery(sql_country).then(function(country_result){

		 //get all category
	  
	      data.categories=res.locals.categories ;
		  data.countries=country_result;

		  res.render('front/sell_with_us',{title: 'Prazar Sell With us ',base_url:config.siteUrl,data:data});
		 
		 
		 }).catch(function (err_country) {  console.log(err_country)
		   
		    data.error="Internal server error";
			 
		    res.render('front/sell_with_us',{title: 'Prazar Sell With us ',base_url:config.siteUrl,data:data});
		
        });   

			 
	 }
	
});

/* sell with us thankyou */

router.get("/sell_with_us_done",function (req, res, next) {
	
	 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	var yes = req.query.yes ; 
	
	if(yes){
		
   	   
       res.render('front/sellus_thankyou',{title: 'Prazar Home ',base_url:config.siteUrl,data:data});
		
	}else{
	
		res.redirect("/");
	}
});

/* vendor create account password */

router.all("/create_password",function (req, res, next) {
	
    var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	var email = req.query.email; 
	var code = req.query.code; 
	
	
   /*post condition */
  if(req.body.sub){
	
	  var email=req.body.email;
	  var pass=String(req.body.pass);
	  
	  pass= pass.trim();
	  
	  var salt_str= uniqid();
  
	helpers.hashPassword1(pass,salt_str,function(err,hashed_pass){
		
	    var sql1 = "update users set password='"+hashed_pass+"' where  email="+mysql.escape(email)+"";
       
         userService.runQuery(sql1).then(function(result1){
		 
			res.redirect("/vendor_signup?email="+email+"&code="+code+"");
		 
		 }).catch(function (err1){ 
		    
			
       res.render('front/vendor_creat_pass',{title: 'Prazar create password ',base_url:config.siteUrl,data:data}); 
			 
       });
  });
	  
	  
   }else{ /*get condition */
	
	  if(email && code){
		
		
		
   	    var sql = "select user_id from users where is_approve=1 and email="+mysql.escape(email)+" and verify_code="+mysql.escape(code)+"";
       
         userService.runQuery(sql).then(function(result){
		 
			 if(result.length>0){
				 
			      data.email=email;
				 
				 res.render('front/vendor_creat_pass',{title: 'Prazar create password ',base_url:config.siteUrl,data:data}); 
				 
			 }else{
			 
				 res.redirect("/");
			 }
		 
		 }).catch(function (err){ 
		    
			
       res.render('front/vendor_creat_pass',{title: 'Prazar create password ',base_url:config.siteUrl,data:data}); 
			 
       });	
		
		
	}else{
		res.redirect("/");
	  }
  }
	
});

/* vendor create store and sign up */
router.all("/vendor_signup",function (req, res, next) {
	
	 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
    data.og_img="front_assets/img/prazar.png";
	
	var email = req.query.email; 
	var code = req.query.code; 

//post condition
 if(req.body.submit){
	 
	 var vendor_id=req.body.vendor_id;
	 var store_id=req.body.store_id;
	 var country=req.body.country;
	 var store_name=helpers.htmlEntities(req.body.store_name);
	 var add=helpers.htmlEntities(req.body.add);
	 var add1=req.body.add1 ? helpers.htmlEntities(req.body.add1):"";
	 var email=helpers.htmlEntities(req.body.email);
	 var phone=req.body.phone;
	 var bank_name= "";//helpers.htmlEntities(req.body.bank_name);
	 var accout_no= "";//req.body.accout_no ;
	 var bank_address=""; //helpers.htmlEntities(req.body.bank_address);
	 var paypal_email=helpers.htmlEntities(req.body.paypal_email);
	 
	 var Files= req.files.logo_file;
	 var Files1= req.files.banner_file;
	 
	 var today_time=helpers.getUtcTimestamp();
	 
	  var sql2 = "update users set is_active=1,verify_code='' where user_id="+mysql.escape(vendor_id)+"";
       
         userService.runQuery(sql2).then(function(result2){
			 
			 
			  var callback_image=function(flag,file_name){
				  
					 var sql3 = "update store set store_name="+mysql.escape(store_name)+",address_line_1="+mysql.escape(add)+",address_line_2="+mysql.escape(add1)+",country="+mysql.escape(country)+",phone_no="+mysql.escape(phone)+",email="+mysql.escape(email)+", store_logo='"+file_name+"',paypal_email="+mysql.escape(paypal_email)+" where store_id="+mysql.escape(store_id)+"";
					  
					 userService.runQuery(sql3).then(function(result3){ 

						  var sql4 = "INSERT INTO `store_bank_details`(`store_id`, `bank_name`, `branch_name`, `account_no`, `ifsc_code`, `account_holder_name`, `added_on`) VALUES ("+mysql.escape(store_id)+","+mysql.escape(bank_name)+",'',"+mysql.escape(accout_no)+",'','','"+today_time+"')";
					  
					 userService.runQuery(sql4).then(function(result4){ 
                        

						var callback_image_banner=function(flag1,file_name1){
							
							
		                var sql5 = "update store set store_banner="+mysql.escape(file_name1)+"  where store_id="+mysql.escape(store_id)+"";
					  
					     userService.runQuery(sql5).then(function(result5){ 
					 
					      //final go to vendor dashboard
						 
						  var session_data={user_id:vendor_id,
											user_role:"vendor",
											role:0010,
											email:email,
											store_id:store_id,
											cart_count:0
										   }
										   
						  req.session.userdata = session_data;
						
						  res.redirect("/vendor_dashboard");
					      
					 
					      }).catch(function (err5){ console.log(err5);

							res.render('front/vendor_signup',{title: 'Prazar create store ',base_url:config.siteUrl,data:data}); 

							 });
							
						
							
						};
						 
						 if(!Files1){
							 
							 callback_image_banner(false,"");
							 
							 
						 }else{
							 
							  var file_name1 = Files1.name;
				              var filenewname = helpers.getUtcTimestamp();
                              var file_ext = "";
                              if (file_name1 != null && file_name1 != undefined) {
                                var temp = file_name1.lastIndexOf('.');
                                file_ext = (temp < 0) ? '' : file_name1.substr(temp);
                              }

                        filenewname = filenewname + file_ext;
				
					    helpers.uploadNewfile(Files1,"/uploads/store_logo/",filenewname,callback_image_banner);
						 
						 }
						 
						

					}).catch(function (err4){ console.log(err4);

							res.render('front/vendor_signup',{title: 'Prazar create store ',base_url:config.siteUrl,data:data}); 

							 });
					
				}).catch(function (err3){ console.log(err3);

							res.render('front/vendor_signup',{title: 'Prazar create store ',base_url:config.siteUrl,data:data}); 

							 });
					  
			   }
			 
			       if(!Files){
					   
					   callback_image(false,"");
					   
					   
				   }else{
					   
					   
					 var file_name = Files.name;
				     var filenewname = helpers.getUtcTimestamp();
                     var file_ext = "";
                     if (file_name != null && file_name != undefined) {
                        var temp = file_name.lastIndexOf('.');
                        file_ext = (temp < 0) ? '' : file_name.substr(temp);
                       }

                      filenewname = filenewname + file_ext;
				
					  helpers.uploadNewfile(Files,"/uploads/store_logo/",filenewname,callback_image);
					   
					   
				   }
			  
		 
		 }).catch(function (err2){ console.log(err2);
		    
                res.render('front/vendor_signup',{title: 'Prazar create store ',base_url:config.siteUrl,data:data}); 
			 
          });
	 
		
	}else{  // get condition
	
	  if(email && code){
		
   	    var sql = "select users.*,store.store_id,store.store_name ,store.address_line_1,store.address_line_2,store.lat,store.lng,store.phone_no,store.country,store.state from users inner join store on users.user_id=store.vendor_id where users.is_approve=1 and users.email="+mysql.escape(email)+" and users.verify_code="+mysql.escape(code)+"";
       
         userService.runQuery(sql).then(function(result){
		 
			 if(result.length>0){
				 
				 var sql1 = "select * from countries where sortname='AU'";
       
         userService.runQuery(sql1).then(function(result1){
			 
			 
			     data.vendor_details=result[0];
			     data.countries=result1;
				 
				 res.render('front/vendor_signup',{title: 'Prazar create store ',base_url:config.siteUrl,data:data}); 
			 
			 
				 }).catch(function (err1){  console.log(err1);
		    
                res.render('front/vendor_signup',{title: 'Prazar create store ',base_url:config.siteUrl,data:data}); 
			 
              });
				 
			     
				 
			 }else{
			 
				 res.redirect("/");
			 }
		 
		 }).catch(function (err){ console.log(err);
		    
          res.render('front/vendor_signup',{title: 'Prazar create store ',base_url:config.siteUrl,data:data}); 
			 
       });	
		
		
	}else{
		res.redirect("/");
	  }
 }
	
});

/*users orders*/
router.get('/user_orders',checkLoginConsumer,function(req, res) {
    
    
    var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
    
	data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
    data.meta_desc="View all of your recent orders and transactions on Prazar";
	
	
    data.og_img="front_assets/img/prazar.png";
	
	data.og_url=config.siteUrl+"user_orders";
    data.og_type="website";
	
    var user_id=req.session.userdata.user_id;
    
    var sql="select * from orders where customer_id = "+user_id+" order by order_date desc limit 20";
    userService.runQuery(sql).then(function(re){
        for(var i =0;i<re.length;i++){
            re[i].order_time = helpers.utcTimestampToLocalDate(re[i].order_date,"hh:mm A");
            re[i].order_date = helpers.utcTimestampToLocalDate(re[i].order_date,"DD-MM-YY");
        }
        data.product_details = re;
        res.render('front/user_orders',{title: "My orders - Prazar orders - Prazar",base_url:config.siteUrl,data:data});
    }).catch(function(er){
        res.redirect("/");
    });
    
    
    
});


router.get('/order_single',checkLoginConsumer,function(req, res) {
    
    
    var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
    data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"order_single";
    data.og_type="website";
	
    if(req.query.oi == undefined || req.query.oi == ""){
        res.redirect("/user_orders");
    }else{
        var user_id=req.session.userdata.user_id;
        var order_id = req.query.oi;
        var count = 0;
        var main_data = [];
        var items_details = [];
        
        var callback = function(flag,index,result){
			
            count++;
            items_details[index].product_image = result[0].image_url;
			
            if(count>= items_details.length){
                main_data[0].items_details = items_details;
				var gift_wrap_price = 0;
				for(var i = 0;i<items_details.length;i++){
					gift_wrap_price = gift_wrap_price + parseFloat(items_details[i].gift_wrap_price*items_details[i].quantity);
					 var today_time = helpers.getUtcTimestamp(); 
					 var show_return_button = "no";
					 if(items_details[i].shipping_date > 0){
						 var date_diff = today_time - items_details[i].shipping_date;
						 //console.log(today_time);
						 //console.log(items_details[i].shipping_date);
						 //console.log(date_diff);
						 var day = parseInt(date_diff/(3600 * 24*1000));
						// console.log(" day "+day);
						 if(day >= 0 && day <= 30){//console.log("a")
							 show_return_button = "yes";
						 }else{//console.log("b")
							 show_return_button = "no";
						 }
					 }
					 main_data[0].items_details[i].show_return_button = show_return_button;
				}				
                data.order_data = main_data[0];//console.log(main_data[0]);
				data.order_data.gift_wrap_price = gift_wrap_price;
                res.render('front/order_single',{title: 'Prazar customer dashboard',base_url:config.siteUrl,data:data});
            }
        }
             

       var callbackOne=function(flag,index,store_result){
		   
		                items_details[index]['store_name'] = store_result[0].store_name ;
						
		                var pid = items_details[index].product_id;
                        var sql_img = "select image_url from product_images where product_id = "+pid+" limit 1";
                        userService.runQueryCallback(sql_img,index,callback);
	   }
			 
        var sql = "select * from orders where customer_id = "+user_id+" and order_no = "+mysql.escape(order_id)+"";
        userService.runQuery(sql).then(function(r){
            main_data = r;
            for(var i =0;i<main_data.length;i++){
                main_data[i].order_time = helpers.utcTimestampToLocalDate(main_data[i].order_date,"hh:mm A");
                main_data[i].order_date = helpers.utcTimestampToLocalDate(main_data[i].order_date,"DD-MM-YY");
             }
            if(r.length > 0){
                var order_id = r[0].id;
                var sql2 = "select order_products.* , product.product_name , product.vendor_id  from order_products inner join product on order_products.product_id = product.product_id where order_products.order_id = "+order_id;
                userService.runQuery(sql2).then(function(r1){
					
                    items_details = r1;
					
                    for(var i =0;i<r1.length;i++){
						
						r1[i].return_request_date = helpers.utcTimestampToLocalDate(r1[i].return_request_date,"DD-MM-YY");
						r1[i].return_action_date = helpers.utcTimestampToLocalDate(r1[i].return_action_date,"DD-MM-YY");
						
                        if(r1[i].code_value > 0 ){
                            r1[i].product_price_sub_total = parseFloat(r1[i].quantity) * (parseFloat(r1[i].unit_price - ((parseFloat(r1[i].code_value) * parseFloat(r1[i].unit_price)) / 100 )));
                        }else{
                            r1[i].product_price_sub_total = parseFloat(r1[i].quantity) * parseFloat(r1[i].unit_price);
                        }
						
						
						/*customization*/
				
						  if(r1[i]['is_customizable']==1 && r1[i]['customization_data'] !=""){
							  var custom_data="";
									
								var customize_data=r1[i]['customization_data'];	
									
								var	customize_arr=customize_data.split("~");
								
								for(var k=0;k<customize_arr.length;k++){
									
									var arrr=customize_arr[k].split("##");
									
									if(arrr[1] !=""){
										custom_data +="<p>"+arrr[0]+"  : "+arrr[1]+"</p>";
									}
									
								 }
								 
								 
								 r1[i]['customization_data']=custom_data;
								 
									
							}else{
								
								r1[i]['customization_data']="";
							}
						
						
						
						
						/*variations*/
						
						if(r1[i]['is_variable']==2){
							//console.log(" vari "+r1[i]['variation_data']);
							var variationdata=JSON.parse(r1[i]['variation_data']);
							var variations="";
							
								for (var k in variationdata){
								 if (variationdata.hasOwnProperty(k)) {
									 if(k=='color'){
										variations += " "+k+" :- <span style='height:15px;width: 15px;display:inline-block;background:"+variationdata[k]+";border-radius: 50px;position:relative;top:4px;'></span><br/>";
									 }else{
										 variations += " "+k+" :- "+variationdata[k]+"<br/>";
									 }
									
								  }
								}
								
								r1[i]['variation_data']="<p class='show_variants'>"+variations+"</p>";
						}
						
						
						
                        var pid = r1[i].product_id;
                        var sql_store = "select store_name from store where store_id =(select store_id from product where product_id = "+pid+") limit 1";
                        userService.runQueryCallback(sql_store,i,callbackOne);
                    }
                }).catch(function(e1){console.log(e1);
                    res.redirect("/user_orders");
                });
            }else{
                res.redirect("/user_orders");
            }
        }).catch(function(e){console.log(e1);
            res.redirect("/user_orders");
        })
        
    }
});

/*customer chat messages */
router.all('/users_messages',checkLoginConsumer,function(req, res) {
   
    var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
    data.meta_desc="Access the Prazar messaging tool to view messages and contact sellers";
	
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"users_messages";
    data.og_type="website";
	
    var user_id = req.session.userdata.user_id;
     var to_user_id = req.query.ritkn;
     var all_conversations = [];
     var crr_chat_data = {conversation_id:0,reciver_id:to_user_id,msg_data:[]};
     var count = 0;
     var count_final = 0;
    
	
	data.to_user_id_check=to_user_id;
	
	
	 var callback_final=function(flag,index,results_stor){
		 
		 count_final++;
		 
		 if(count_final >= all_conversations.length){
		 
             if(to_user_id != undefined){
                 var conversation_id = 0;
                 userService.runQuery("select id from conversation where (from_id = "+user_id+" and  to_id = "+to_user_id+") or from_id = "+mysql.escape(to_user_id)+" and to_id = "+user_id+" order by last_msg_on desc").then(function(rr){
                     if(rr.length > 0){
                         crr_chat_data.conversation_id = rr[0].id;
                         var sql_get_msg = "select * from messages where conversation_jd = "+crr_chat_data.conversation_id+" order by send_on desc limit 1500";
                         userService.runQuery(sql_get_msg).then(function(r){
                            
                             crr_chat_data.msg_data = r.reverse();
                             data.all_conversations = all_conversations;
                             data.crr_chat_data = crr_chat_data;
							 userService.runQuery("update messages set is_read = 1 where conversation_jd = "+crr_chat_data.conversation_id+" and to_user_id = "+user_id).then(function(r1){
								 res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
							 }).catch(function(e1){
								 res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
							 });
                         }).catch(function(e){
                             data.all_conversations = all_conversations;
                             data.crr_chat_data = crr_chat_data;
                             res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
                            
                         });
                     }else{
                         data.all_conversations = all_conversations;
                         data.crr_chat_data = crr_chat_data;
                         res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
                         
                     }
                 }).catch(function(er){
                     data.all_conversations = all_conversations;
                     data.crr_chat_data = crr_chat_data;
                     res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
                     
                 })
             }else{
                 data.all_conversations = all_conversations;
                 data.crr_chat_data = crr_chat_data;
                 res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
             }        
         }
		 
		 
		 
	 };
	
	
     var callback = function(flag,index,results){
		 
         count++;
		 
		 if(results.length>0){
			 
			 var check_vendr_id=results[0].user_id;
			 
			 if(check_vendr_id>1){
				 
				var sql_store_name="select store_name from store where vendor_id="+check_vendr_id+"";
	
	           userService.runQuery(sql_store_name).then(function(store_re){
		
		              all_conversations[index].to_user_name = store_re[0].store_name;
				 
				  var tmp = all_conversations[index].to_user_name.split(" ");
				 if(tmp.length > 1){
					 var fst = tmp[0].charAt(0).toUpperCase();
					 var snd = tmp[1].charAt(0).toUpperCase();
					 all_conversations[index].to_user_initials = fst+""+snd;
					 
					 callback_final(false,index,all_conversations);
					 
				 }else{
					 var fst = tmp[0].charAt(0).toUpperCase();
					 all_conversations[index].to_user_initials = fst;
					 
					 callback_final(false,index,all_conversations);
					 
				 }
	           });
				 
				 
			 }else{
				 
				  all_conversations[index].to_user_name = results[0].name;
				 
				  var tmp = all_conversations[index].to_user_name.split(" ");
				 if(tmp.length > 1){
					 var fst = tmp[0].charAt(0).toUpperCase();
					 var snd = tmp[1].charAt(0).toUpperCase();
					 all_conversations[index].to_user_initials = fst+""+snd;
					 
					 callback_final(false,index,all_conversations);
					 
				 }else{
					 var fst = tmp[0].charAt(0).toUpperCase();
					 all_conversations[index].to_user_initials = fst;
					 
					 callback_final(false,index,all_conversations);
					 
				 }
			 }
			
			 
		 }else{
			 
			 callback_final(false,index,all_conversations);
		 }
     	
         
     }
    
	var sql_check="select id from conversation where (from_id = "+user_id+" and  to_id ="+mysql.escape(to_user_id)+") or from_id ="+mysql.escape(to_user_id)+" and to_id = "+user_id+"";
	
	userService.runQuery(sql_check).then(function(rchek){
	
     if(rchek.length>0){
		 
		getAllConversation();
		 
	 }else{  //first time conversation
		 
		if(to_user_id!=undefined && to_user_id!="" && to_user_id!=0){
		 
		 
		 var insert_q="INSERT INTO `conversation`(`from_id`, `to_id`) VALUES ('"+user_id+"',"+mysql.escape(to_user_id)+")";
		 userService.runQuery(insert_q).then(function(reinsert){
			 
			 
			 getAllConversation();
			 
			 
		   }).catch(function(e2){console.log(e2);
            data.all_conversations = all_conversations;
             data.crr_chat_data = crr_chat_data;
            res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
         
           });
		}else{
			
			getAllConversation();
			
		}	 
		 
	 }
	
    
	function getAllConversation(){
		
		
		  userService.runQuery("select * from  conversation where from_id = "+user_id+" or to_id = "+user_id+" order by last_msg_on desc limit 20").then(function(r){
			  
         if(r.length>0){
             all_conversations = r;
             for(var i =0;i<r.length;i++){
                
                 if(user_id == r[i].from_id){
                     all_conversations[i].to_user_id = r[i].to_id; 
                 }else{
                     all_conversations[i].to_user_id = r[i].from_id; 
                 }
                 var sql = "select name,role,user_id from users where user_id = "+all_conversations[i].to_user_id;
                 userService.runQueryCallback(sql,i,callback);            
             }
         }else{
             data.all_conversations = all_conversations;
             data.crr_chat_data = crr_chat_data;
             res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
         }
        
     }).catch(function(e){console.log(e);
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
         
     });
	 
	}
	
	
	
   }).catch(function(e1){console.log(e1);
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('front/messages',{title: "My messages - Contact sellers - Prazar",base_url:config.siteUrl,data:data});
         
     });
   
});



/************** vendor dashbord managenment  ****************/


router.all('/vendor_dashboard',checkLoginVendor,function(req, res) {
	
	var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request};
	
	data.store_save=req.flash('store_save');
	
	var page= req.query.page ? req.query.page :0;
    var limit=20;
	
	var promo_success= req.query.promo_success ? req.query.promo_success :"";
	
	if(promo_success!=""){
		
		req.query.promo_success="";
		
		if(promo_success=="yes"){
			data.promo_msg="Promo code added successfully";
		}else{
		   data.promo_msg="Promo code not added";
		}
	}
	
  var today_time=helpers.getUtcTimestamp();
	
 /* promo code submit */
  if(req.body.promo_sub){
		 
	      var promo_status=req.body.promo_status;
	      var promo_code=req.body.promo_code;
	      var discount=req.body.discount;
	      var store_id=req.body.store_id;
	    
	     var sql4 = "INSERT INTO `promo_code`(`store_id`, `code`, `discount_percentage`, `valid_from`, `valid_to`, `created_on`, `is_active`) VALUES ("+mysql.escape(store_id)+","+mysql.escape(promo_code)+","+mysql.escape(discount)+",0,0,"+today_time+","+mysql.escape(promo_status)+")";
	  
         userService.runQuery(sql4).then(function(result4){
		  
			 
			 res.redirect("/vendor_dashboard?promo_success=yes");
			 
		 }).catch(function (err4){ console.log(err4);
		    
            res.redirect("/vendor_dashboard?promo_success=no");
			 
          });
	     
	  
		 
		 
   }else if(req.body.store_sub){  //store submit
		 
	      var desc=req.body.desc;
	      var store_name=req.body.store_name;
	      var country=req.body.country;
	      var state=req.body.state;
	      var address=req.body.address_line1;
	      var lat=req.body.lat;
	      var lng=req.body.lng;
	      var discount=req.body.discount;
	      var store_id=req.body.store_id1;
	      var address2=req.body.address_line2 ? req.body.address_line2 :"";
	      var zip_code=req.body.zip_code ? req.body.zip_code :"";
	      var city=req.body.city ? req.body.city :"";
	      var minimum_purcahse_amt_for_free_ship=req.body.minimum_purcahse_amt_for_free_ship ? req.body.minimum_purcahse_amt_for_free_ship :0;
	   
	      var logo_old_name=req.body.logo_old_name;
	   
	     // var Files=req.files.store_logo; 
	    
	      var filenewname="";
	   
	      desc=desc.replace(/'/g, "''");
	      store_name=store_name.replace(/'/g, "''");
	      address=address.replace(/'/g, "''");
	      address2=address2.replace(/'/g, "''");
	      zip_code=zip_code.replace(/'/g, "''");
	      city=city.replace(/'/g, "''");
	   
	   
	     /* var callback_image=function(flag,file_name){
		 
			 
			 // remove old file after new file upload
			 if(logo_old_name!=undefined && logo_old_name!=""){
				 
                var filePath = appDir+"/uploads/"+logo_old_name; 
			
			    if (fs.existsSync(filePath)) {
                
                    fs.unlinkSync(filePath);
                 }
			 }
			 
		 } */
	   
	   /* if(Files){
			 
			 var file_name = Files.name;
			 filenewname = helpers.getUtcTimestamp();
             var file_ext = "";
              if (file_name != null && file_name != undefined) {
                      var temp = file_name.lastIndexOf('.');
                      file_ext = (temp < 0) ? '' : file_name.substr(temp);
                  }

                  filenewname = filenewname + file_ext;
			 
			      helpers.uploadNewfile(Files,"/uploads/store_logo/",filenewname,callback_image);
			 
		    } */
	   
	    if(filenewname==""){
			
		   filenewname=logo_old_name;
			
		 }
	   
	       var sql5 = "update store set address_line_1="+mysql.escape(address)+",description="+mysql.escape(desc)+",country="+mysql.escape(country)+",state="+mysql.escape(state)+",lat="+mysql.escape(lat)+",lng="+mysql.escape(lng)+", store_logo='"+filenewname+"' ,store_name="+mysql.escape(store_name)+",postal_code="+mysql.escape(zip_code)+",address_line_2="+mysql.escape(address2)+",city="+mysql.escape(city)+" , minimum_purcahse_amt_for_free_ship = "+mysql.escape(minimum_purcahse_amt_for_free_ship)+" where store_id="+store_id+"";
		   
			
	  
		userService.runQuery(sql5).then(function(result5){ 
		
		 req.flash('store_save',"Saved successfully");
		 res.redirect("/vendor_dashboard");
		
		}).catch(function (err5){ console.log(err5);
		    
             res.render('front/vendor_dashboard',{title: 'Prazar vendor Dashboard',base_url:config.siteUrl,data:data});
			 
          });
	   
	   
		
	   
	}else{ // get condition
	
	 /* get states of Australia */
	    var sql = "select * from states where country_id=13";
         userService.runQuery(sql).then(function(result){
			 
			 data.states=result;
			 var vendor_id=req.session.userdata.user_id;
			 
			 /* get store details */
			 
			   var sql1 = "select users.*,store.store_id,store.store_name ,store.address_line_1,store.address_line_2,store.lat,store.lng,store.description,store.country,store.state,store.store_logo,store.store_banner,store.city,store.postal_code, store.minimum_purcahse_amt_for_free_ship from users inner join store on users.user_id=store.vendor_id where users.is_approve=1 and users.user_id="+mysql.escape(vendor_id)+"";
			 
         userService.runQuery(sql1).then(function(result1){
			 
			 data.store_detail=result1[0];
			 
			 var store_id=result1[0]['store_id'];
			 
			 var sql_total = "select count(id) as total from promo_code where store_id="+mysql.escape(store_id)+" and is_deleted=0";
	        userService.runQuery(sql_total).then(function(result2){

              data.total=result2[0]['total']; 	
              data.total_pages = Math.ceil(data.total /limit);   
	          data.page=page;
				
	          page=page*limit; 
				
			var sql3 = "select * from promo_code where store_id="+mysql.escape(store_id)+" and is_deleted=0 limit "+page+","+limit+"";
				
	       userService.runQuery(sql3).then(function(result3){	
				
			   data.promo_codes=result3;
			  
			   /*final result*/
			   
			   res.render('front/vendor_dashboard',{title: 'Prazar vendor Dashboard',base_url:config.siteUrl,data:data});
			   
				
			}).catch(function (err3){ console.log(err3);
		    
             res.render('front/vendor_dashboard',{title: 'Prazar vendor Dashboard',base_url:config.siteUrl,data:data});
			 
          });	
				
			   
			 }).catch(function (err2){ console.log(err2);
		    
             res.render('front/vendor_dashboard',{title: 'Prazar vendor Dashboard',base_url:config.siteUrl,data:data});
			 
          });
			 
		 }).catch(function (err1){ console.log(err1);
		    
             res.render('front/vendor_dashboard',{title: 'Prazar vendor Dashboard',base_url:config.siteUrl,data:data});
			 
          });
			 
			 
		 
		 }).catch(function (err){ console.log(err);
		    
             res.render('front/vendor_dashboard',{title: 'Prazar vendor Dashboard',base_url:config.siteUrl,data:data});
			 
          });
	
}	
  
	
});



/* vendor upload store logo */

router.post('/store_logo_upload',checkLoginVendor,function(req, res) {
	
	
	var vendor_id=req.session.userdata.user_id;
	//var logo_old_name=req.body.logo_old_name;
	var logo_old_name="";
	
    var Files=req.files.store_logo; 
	
	
	
	  var callback_image=function(flag,file_name){
		 
		 
			   var sql = "update store set store_logo='"+file_name+"' where vendor_id="+vendor_id+"";
			   
			  userService.runQuery(sql).then(function(result){
					   
				  var response ={status:200,message:"Store Logo uploaded successfully",data:[]};
				  
					res.send(JSON.stringify(response)); 
					
					 /* remove old file after new file upload*/
						 if(logo_old_name!=undefined && logo_old_name!=""){
							 
							var filePath = appDir+"/uploads/"+logo_old_name; 
						
							if (fs.existsSync(filePath)) {
							
								fs.unlinkSync(filePath);
							 }
						 }
					
					

			  }).catch(function (err){ console.log(err);
				  
					var response ={status:500,message:"some error occurred please try again",data:[]};
				  
					res.send(JSON.stringify(response));
			  });
		 
			
			 
		 }
	
    if(Files){
			 
			 var file_name = Files.name;
			 var filenewname = helpers.getUtcTimestamp();
             var file_ext = "";
              if (file_name != null && file_name != undefined) {
                      var temp = file_name.lastIndexOf('.');
                      file_ext = (temp < 0) ? '' : file_name.substr(temp);
                  }

                  filenewname = filenewname + file_ext;
			 
			      //find old logo name
			      var sql_find = "select store_logo from store where vendor_id="+vendor_id+"";
			   
			     userService.runQuery(sql_find).then(function(result_find){
					 
					 if(result_find.length > 0){
						 logo_old_name=result_find[0]['store_logo'];
					 }
			 
			       //upload new logo ;
			      helpers.uploadNewfile(Files,"/uploads/store_logo/",filenewname,callback_image);
				  
				  
				  }).catch(function (err1){ console.log(err1);
				  
					var response ={status:500,message:"some error occurred please try again",data:[]};
				  
					res.send(JSON.stringify(response));
			  }); 
				  
			 
    }else{
	
	   var response ={status:500,message:"Please select file",data:[]};
		  
	   res.send(JSON.stringify(response));
    } 
	
});




/* vendor upload store banner */

router.post('/store_banner_upload',checkLoginVendor,function(req, res) {
	
	
	var vendor_id=req.session.userdata.user_id;
	//var logo_old_name=req.body.banner_old_name;
	var logo_old_name="";
	
    var Files=req.files.store_banner; 
	
	
	  var callback_image=function(flag,file_name){
		 
		 
			   var sql = "update store set store_banner='"+file_name+"' where vendor_id="+vendor_id+"";
			   
			  userService.runQuery(sql).then(function(result){
					   
				  var response ={status:200,message:"Store Banner uploaded successfully",data:[]};
				  
					res.send(JSON.stringify(response)); 
					
					 /* remove old file after new file upload*/
						 if(logo_old_name!=undefined && logo_old_name!=""){
							 
							var filePath = appDir+"/uploads/"+logo_old_name; 
						
							if (fs.existsSync(filePath)) {
							
								fs.unlinkSync(filePath);
							 }
						 }
					
					

			  }).catch(function (err){ console.log(err);
				  
					var response ={status:500,message:"some error occurred please try again",data:[]};
				  
					res.send(JSON.stringify(response));
			  });
		 
			
			 
		 }
	
    if(Files){
			 
			 var file_name = Files.name;
			 var filenewname = helpers.getUtcTimestamp();
             var file_ext = "";
              if (file_name != null && file_name != undefined) {
                      var temp = file_name.lastIndexOf('.');
                      file_ext = (temp < 0) ? '' : file_name.substr(temp);
                  }

                  filenewname = filenewname + file_ext;
			 
			 //find old file name
			 var sql_select = "select store_banner from store where vendor_id="+vendor_id+"";
			   
			  userService.runQuery(sql_select).then(function(result_old){
			 
			      if(result_old.length >0){
					  logo_old_name=result_old[0]['store_banner'];

				  }
			 
			       //upload new file
			      helpers.uploadNewfile(Files,"/uploads/store_logo/",filenewname,callback_image);
				  
			 }).catch(function (err1){ console.log(err1);
				  
					var response ={status:500,message:"some error occurred please try again",data:[]};
				  
					res.send(JSON.stringify(response));
			  });
			 
    }else{
	
	   var response ={status:500,message:"Please select file",data:[]};
		  
	   res.send(JSON.stringify(response));
    } 
	
});




/* vendor vendor_update_promo_code */

router.post('/vendor_update_promo_code',checkLoginVendor,function(req, res) {
	
	var promo_id=req.body.promo_id;
	var promo_status=req.body.promo_status;
	var promo_code=req.body.promo_code;
	var discount=req.body.discount;
	
	var vendor_id=req.session.userdata.user_id;
	
    var sql = "update promo_code set code="+mysql.escape(promo_code)+",discount_percentage="+mysql.escape(discount)+",is_active="+mysql.escape(promo_status)+" where id="+mysql.escape(promo_id)+" and store_id=(select store_id from store where vendor_id="+vendor_id+")";
       
      userService.runQuery(sql).then(function(result){
			   
		  var response ={status:200,message:"Promo code updated successfully",data:[]};
		  
		    res.send(JSON.stringify(response)); 
	
	  }).catch(function (err){ console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
   
});



/* vendor delete promo code */

router.post('/vendor_delete_promocode',checkLoginVendor,function(req, res) {
	
	var promo_id=req.body.promo_id;
	var vendor_id=req.session.userdata.user_id;
	
    var sql = "update promo_code set is_deleted=1 where id="+mysql.escape(promo_id)+" and store_id=(select store_id from store where vendor_id="+vendor_id+")";
       
      userService.runQuery(sql).then(function(result){
			   
		  var response ={status:200,message:"Promo code deleted successfully",data:[]};
		  
		    res.send(JSON.stringify(response)); 
	
	  }).catch(function (err){ console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
   
});


/* vendor manage products */
router.all('/vendor_manage_product',checkLoginVendor,function(req, res) {
	
    var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request};
	var page= req.query.page ? req.query.page :0;
    var limit=20;
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"vendor_manage_product";
    data.og_type="website";
	var final_result=[];
	
	var vendor_id=req.session.userdata.user_id;
	
	var sql = "select count(product_id) as total from product where vendor_id="+vendor_id+" and is_deleted=0";
	        userService.runQuery(sql).then(function(result){

              data.total=result[0]['total']; 	
              data.total_pages = Math.ceil(data.total /limit);   
	          data.page=page;
	          page=page*limit; 
				
			var sql1 = "select product.product_id,product.product_type, product.product_name,product.is_active,product.primary_category,product.quantity_remaining,product.quantity,categories.cat_name from product inner join categories on product.primary_category=categories.cat_id where product.vendor_id="+vendor_id+" and product.is_deleted=0 order by product_id desc limit "+page+","+limit+"";
				
	       userService.runQuery(sql1).then(function(result1){	
				
			   if(result1.length==0){
				 
				   data.products=[];
				   
				   //final first
               res.render('front/vendor_products',{title: 'Prazar vendor Manage Products',base_url:config.siteUrl,data:data});
				   
				   
			   }else{
			   
				  
				   
				   var count=0;
				   
				   var results_sub=[];
				   var callback=function(flag,index,results){
				    
					   count++;
					   
					   result1[index]['sub_cat']=results;
					   
					   results_sub[index]=result1[index];
					   
					   if(count>=result1.length){
						   
					       var count1=0
					   
						   var callback_final=function(flag,index,results2){
							   
						      count1++;
							   
						   if(results2.length>0){
						     results_sub[index]['image_name']=results2[0]['image_url'];
						   }else{
						     results_sub[index]['image_name']="";
						   }
							  
							  
							  final_result[index]=results_sub[index];   
							   
							   
							  if(count1>=results_sub.length){
								  
								  //final
								  
								  data.products=final_result;
								  
								  res.render('front/vendor_products',{title: 'Prazar vendor Manage Products',base_url:config.siteUrl,data:data});
								  
								  
							   } 
							  
						    }
						   
						   
						   /* get image of every project */
						   for(var j=0; j<results_sub.length; j++){
						   
							  var product_id=results_sub[j]['product_id'];
						
					  var sql3 = "select product_images.image_url from product_images inner join product on product.product_id=product_images.product_id where product_images.product_id="+product_id+" limit 1";
						
						   
                	     userService.runQueryCallback(sql3,j,callback_final);
							   
							   
							   
						   }
						   
					   }
					   
				   }
				   
				   /* get sub categories name of product */
				   
				   	for(var i=0;i<result1.length;i++){
						
						var product_id=result1[i]['product_id'];
						
					  var sql2 = "select sub_categories.name from product_category inner join sub_categories on product_category.cat_id=sub_categories.id where product_category.product_id="+product_id+" and product_category.is_main_cat=0 and product_category.is_sub_sub_cat =0";
						
                	  userService.runQueryCallback(sql2,i,callback);
						
					}
			   }
				
			}).catch(function (err1){ console.log(err1);
		    
               res.render('front/vendor_products',{title: 'Prazar vendor Manage Products',base_url:config.siteUrl,data:data});
			 
          });	
				
			   
			 }).catch(function (err){ console.log(err);
		    
           res.render('front/vendor_products',{title: 'Prazar vendor Manage Products',base_url:config.siteUrl,data:data});
			 
          });
	
	
	
});


/* vendor add product */
router.all('/vendor_add_product',checkLoginVendor,function(req, res) {
	

	var post_msg =req.flash('message');
	
    var data={req_path:req.path,
			  userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,
			  categories:res.locals.categories,
			  message:post_msg
			 };
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"vendor_add_product";
    data.og_type="website";
	
	if(req.body.live_sub || req.body.later_sub){  /** post method **/
		
		
		var vendor_id=req.session.userdata.user_id;
		var store_id=req.session.userdata.store_id;
		var product_name=req.body.product_name;
		var cat1=req.body.cat1;
		var cat2=req.body.cat2 ? req.body.cat2 : 0;
		var sub_cat=req.body.sub_cat ? req.body.sub_cat : 0 ;
		var subsub_cat=req.body.subsub_cat ? req.body.subsub_cat : 0 ;
		var desc=req.body.desc;
		var price=parseFloat(req.body.price);
		var sale_price=req.body.sale_price ? parseFloat(req.body.sale_price): 0;
		var gender=req.body.gender;
		var stock_quantity=req.body.stock_quantity;
		var gift_wrap=req.body.gift_wrap;
		var gift_price=req.body.gift_price ? req.body.gift_price:0;
		var ship_overseas=req.body.ship_overseas ? req.body.ship_overseas  :0;
		var ship_region=req.body.ship_region ? req.body.ship_region :"";
		var ship_overseas_price=req.body.ship_overseas_price ? req.body.ship_overseas_price :0;
		var express_delivery_price=req.body.express_delivery_price ? req.body.express_delivery_price :0;
		var express_type=req.body.express_type;
		var width=req.body.width ? req.body.width :"";
		var height=req.body.height ? req.body.height : "";
		var weight=req.body.weight ? req.body.weight :"";
		var length=req.body.length ? req.body.length :"";
		var is_free_delivery=req.body.is_free_delivery ;
		var ship_price=req.body.ship_price ? req.body.ship_price :0;
		var ship_within=req.body.ship_within ? req.body.ship_within : "";
		var specification=req.body.specification ? req.body.specification :"";
		var delivery_returns=req.body.delivery_returns ? req.body.delivery_returns :"";
		
		var customized=req.body.customized;
		var cst_txt_lbl=req.body.cst_txt_lbl ? req.body.cst_txt_lbl : "";
		var customized_price=req.body.customized_price ? req.body.customized_price : 0;
		
		var cst_txt_lbl_str="";
		
		if(Array.isArray(cst_txt_lbl)){			
			for(var i=0;i<cst_txt_lbl.length;i++){
				cst_txt_lbl_str  = cst_txt_lbl_str+cst_txt_lbl[i]+",";
			}
			cst_txt_lbl_str = cst_txt_lbl_str.replace(/,\s*$/, "");
			cst_txt_lbl = cst_txt_lbl_str;
		}
		
		var ship_region_str="";
		
		if(Array.isArray(ship_region)){			
			for(var i=0;i<ship_region.length;i++){
				ship_region_str  = ship_region_str+ship_region[i]+",";
			}
			ship_region_str = ship_region_str.replace(/,\s*$/, "");
			ship_region = ship_region_str;
		}
		
		
		var is_on_sale=req.body.is_on_sale;
		
		var continue_to_variant=req.body.continue_to_variant;
		
		var Files1=req.files.pro_image1;
	    var Files2=req.files.pro_image2;
	    var Files3=req.files.pro_image3;
	    var Files4=req.files.pro_image4;
	    var Files5=req.files.pro_image5;
		
		var Files_ext1=req.body.cropped_img_ext1;
		var Files_ext2=req.body.cropped_img_ext2;
		var Files_ext3=req.body.cropped_img_ext3;
		var Files_ext4=req.body.cropped_img_ext4;
		var Files_ext5=req.body.cropped_img_ext5;
		
		
		var image_width1=req.body.image_width1;
		var image_width2=req.body.image_width2;
		var image_width3=req.body.image_width3;
		var image_width4=req.body.image_width4;
		var image_width5=req.body.image_width5;
		
		var today_time=helpers.getUtcTimestamp();
		
	
		desc=desc.replace(/'/g, "''");
		product_name=product_name.replace(/'/g, "''");
		width=width.replace(/'/g, "''");
		weight=weight.replace(/'/g, "''");
		height=height.replace(/'/g, "''");
		length=length.replace(/'/g, "''");
		specification=specification.replace(/'/g, "''");
		delivery_returns=delivery_returns.replace(/'/g, "''");
		
		if(req.body.live_sub){
			var pro_status=1;
		}else{
			var pro_status=0;
		}
		
        //check at least 1 image is required
		
		if(Files1 == undefined && Files2 == undefined && Files3 == undefined && Files4 == undefined && Files5 == undefined){
			 
		    req.flash('message',"Minimum 1 product image is required");
			res.redirect("/vendor_add_product");
			
			return;
		}
		
		
		if(sale_price == 0){
			
			sale_price=price;
		}
		
		if(sale_price>price){
			
			sale_price=price;
		}
		
		if(ship_overseas == 0){
			ship_region=="";
		}
		
		
		if(ship_price == 0){
			
			is_free_delivery = 1 ;
			
		}
		
		
		var sql1="INSERT INTO `product`(`vendor_id`,`store_id`, `product_type`, `primary_category`, `sku`, `product_name`, `product_description`, `product_short_description`, `price`, `sale_price`, `gender`, `quantity`, `quantity_soled`, `quantity_remaining`, `is_customizable`, `is_shipped_overseas`, `ship_region`, `is_gift_wrap`, `gift_price`, `is_express_delivery`, `product_width`, `product_height`, `product_weight`, `is_free_delivery`,`ship_price`, `ship_with_in`,`specification`,`delivery_returns`, `added_on`,`is_active`,`is_on_sale`,`ship_overseas_price`,`express_delivery_price`,`customize_price`,`custome_input_label`,`product_length`) VALUES ("+vendor_id+","+store_id+",'1',"+mysql.escape(cat1)+",0,"+mysql.escape(product_name)+","+mysql.escape(desc)+","+mysql.escape(desc)+","+mysql.escape(price)+","+mysql.escape(sale_price)+","+mysql.escape(gender)+","+mysql.escape(stock_quantity)+",0,"+mysql.escape(stock_quantity)+","+mysql.escape(customized)+","+mysql.escape(ship_overseas)+","+mysql.escape(ship_region)+","+mysql.escape(gift_wrap)+","+mysql.escape(gift_price)+","+mysql.escape(express_type)+","+mysql.escape(width)+","+mysql.escape(height)+","+mysql.escape(weight)+","+mysql.escape(is_free_delivery)+","+mysql.escape(ship_price)+","+mysql.escape(ship_within)+","+mysql.escape(specification)+","+mysql.escape(delivery_returns)+",'"+today_time+"',"+mysql.escape(pro_status)+","+mysql.escape(is_on_sale)+","+mysql.escape(ship_overseas_price)+","+mysql.escape(express_delivery_price)+","+mysql.escape(customized_price)+","+mysql.escape(cst_txt_lbl)+","+mysql.escape(length)+")";
		
		
		 userService.runQuery(sql1).then(function(result1){
		 
		  var product_id=result1.insertId;
			  
		  product_name=product_name+product_id;
	      var target=" &=%?~+";
	      var replacement="-";
			 
	      var product_slug =helpers.findAndReplace(product_name, target, replacement);
			 var sq_slug = "update product set slug = '"+product_slug+"' where product_id = "+product_id;
			 userService.runQuery(sq_slug).then(function(re_slug){
				 
			 	var sql2="INSERT INTO `product_category`(`product_id`, `cat_id`, `is_main_cat`,`is_sub_sub_cat`) VALUES ("+product_id+","+cat1+",1,0)"; 
			 
				 if(cat2>0){
					if(customized == 1){
						if(cat2 == 7 || cat1 == 7){
							sql2 +=",("+product_id+","+mysql.escape(cat2)+",1,0)";
						}else{
							sql2 +=",("+product_id+","+mysql.escape(cat2)+",1,0),("+product_id+",7,1,0)";
						}					
					}else{
						sql2 +=",("+product_id+","+mysql.escape(cat2)+",1,0)";
					}
					 
				  }else{
					 if(customized == 1){
						if(cat1 == 7){
						}else{
							sql2 +=",("+product_id+",7,1,0)";
						}					
					} 
				  }

				 if(Array.isArray(sub_cat)){

					 for(var i=0;i<sub_cat.length;i++){

						 sql2 +=",("+product_id+","+mysql.escape(sub_cat[i])+",0,0)";
					 }

				 }else if(sub_cat==0){
				 
				 }else{

					 sql2 +=",("+product_id+","+mysql.escape(sub_cat)+",0,0)";
				 }

				 
				 /* sub sub category */
				 
				  if(Array.isArray(subsub_cat)){

					 for(var i=0;i<subsub_cat.length;i++){

						 sql2 +=",("+product_id+","+mysql.escape(subsub_cat[i])+",0,1)";
					 }

				 }else if(subsub_cat==0){
				 
				 }else{

					 sql2 +=",("+product_id+","+mysql.escape(subsub_cat)+",0,1)";
				 }
				 
				 

			 userService.runQuery(sql2).then(function(result2){


				 var sql3="INSERT INTO `product_images`(`product_id`, `image_url`) VALUES";

				 /* product images upload  */

				

				 var callback_image=function(flag,filename){

				
					     sql3 ="INSERT INTO `product_images` (`product_id`, `image_url`) VALUES ("+product_id+",'"+filename+"')";

						 userService.runQuery(sql3).then(function(result3){ 

						   }).catch(function (err3){  console.log(err3);

						   })


				  }
				  
                  //image1
				  if(Files1!="" && Files1 != undefined){
					   
                     var filenewname= helpers.getUtcTimestamp()+"1."+Files_ext1
				    
					  image_width1 = parseInt(image_width1);
					
			         helpers.uploadFileWithSharp(Files1,"uploads/products/",filenewname,image_width1,image_width1,callback_image); 
					  
					  
				  }
				  //image2
				  if(Files2!="" && Files2 != undefined){
					  
					   var filenewname= helpers.getUtcTimestamp()+"2."+Files_ext2;
				    
					image_width2 = parseInt(image_width2);
					
			           helpers.uploadFileWithSharp(Files2,"uploads/products/",filenewname,image_width2,image_width2,callback_image); 
					  
				  }
				  //image3
				  if(Files3!="" && Files3 != undefined){
					  
					  var filenewname= helpers.getUtcTimestamp()+"3."+Files_ext3;
					  
				      image_width3 = parseInt(image_width3);
					  
			          helpers.uploadFileWithSharp(Files3,"uploads/products/",filenewname,image_width3,image_width3,callback_image); 
					  
				  }
				  //image4
				  if(Files4!="" && Files4 != undefined){
					  
					  var filenewname= helpers.getUtcTimestamp()+"4."+Files_ext4
				    
					 image_width4 = parseInt(image_width4);   
					
			           helpers.uploadFileWithSharp(Files4,"uploads/products/",filenewname,image_width4,image_width4,callback_image); 

			      
					  
				  }
				  
				  //image5
				  if(Files5!="" && Files5 != undefined){
					  
				      var filenewname= helpers.getUtcTimestamp()+"5."+Files_ext5
				    
					  image_width5 = parseInt(image_width5);
					
					
					  helpers.uploadFileWithSharp(Files5,"uploads/products/",filenewname,image_width5,image_width5,callback_image); 
					  
				  }
				  
				  
				  //final result
				  req.flash('message',"Product saved successfully");

				  if(continue_to_variant == 1){
					  
					  res.redirect("/vendor_add_product_variant?product_no="+product_id);
					  
					  
				  }else{
					    res.redirect("/vendor_add_product");
				  }
				 
				

			  }).catch(function (err2){  console.log(err2);
					req.flash('message',"Some error occurred please try again");		
					res.redirect("/vendor_add_product");

			 });
			 }).catch(function(err_slug){
			 	req.flash('message',"Some error occurred please try again");		
                res.redirect("/vendor_add_product");
			 });
			 
		 
			 
			 
		 }).catch(function (err1){  console.log(err1);
		    
				req.flash('message',"Some error occurred please try again");				  
                res.redirect("/vendor_add_product");
			 
         });
		
		
	}else{ /** get method **/
	
	  /* get Australia regions*/
	  var sql = "select * from overseas_regions where is_active=1 and is_deleted=0";
       
      userService.runQuery(sql).then(function(result){
		 
		     data.states=result;
		  
			 res.render('front/vendor_add_product',{title: 'Prazar vendor Add Product',base_url:config.siteUrl,data:data});	
			 
			 
		 }).catch(function (err){  
		    
               res.render('front/vendor_add_product',{title: 'Prazar vendor Add Product',base_url:config.siteUrl,data:data});	
			 
              });
	
	}
   
	
});

router.post('/add_product',checkLoginVendor,function(req,res){
	

		var vendor_id=req.session.userdata.user_id;
		var store_id=req.session.userdata.store_id;
		var product_name=req.body.product_name;
		var cat1=req.body.cat1;
		var cat2=req.body.cat2 ? req.body.cat2 : 0;
		var sub_cat=req.body.sub_cat ? req.body.sub_cat : 0 ;
		var desc=req.body.desc;
		var price=parseFloat(req.body.price);
		var sale_price=req.body.sale_price ? parseFloat(req.body.sale_price): 0;
		var gender=req.body.gender;
		var stock_quantity=req.body.stock_quantity;
		var gift_wrap=req.body.gift_wrap;
		var gift_price=req.body.gift_price ? req.body.gift_price:0;
		var ship_overseas=req.body.ship_overseas ? req.body.ship_overseas  :0;
		var ship_region=req.body.ship_region ? req.body.ship_region :"";
		var ship_overseas_price=req.body.ship_overseas_price ? req.body.ship_overseas_price :0;
		var express_delivery_price=req.body.express_delivery_price ? req.body.express_delivery_price :0;
		var express_type=req.body.express_type;
		var width=req.body.width ? req.body.width :"";
		var height=req.body.height ? req.body.height : "";
		var weight=req.body.weight ? req.body.weight :"";
		var length=req.body.length ? req.body.length :"";
		var is_free_delivery=req.body.is_free_delivery ;
		var ship_price=req.body.ship_price ? req.body.ship_price :0;
		var ship_within=req.body.ship_within ? req.body.ship_within : "";
		var specification=req.body.specification ? req.body.specification :"";
		var delivery_returns=req.body.delivery_returns ? req.body.delivery_returns :"";
		
		var customized=req.body.customized;
		var cst_txt_lbl=req.body.cst_txt_lbl ? req.body.cst_txt_lbl : "";
		var customized_price=req.body.customized_price ? req.body.customized_price : 0;
		
		var cst_txt_lbl_str="";
		
		if(Array.isArray(cst_txt_lbl)){			
			for(var i=0;i<cst_txt_lbl.length;i++){
				cst_txt_lbl_str  = cst_txt_lbl_str+cst_txt_lbl[i]+",";
			}
			cst_txt_lbl_str = cst_txt_lbl_str.replace(/,\s*$/, "");
			cst_txt_lbl = cst_txt_lbl_str;
		}
		
		var ship_region_str="";
		
		if(Array.isArray(ship_region)){			
			for(var i=0;i<ship_region.length;i++){
				ship_region_str  = ship_region_str+ship_region[i]+",";
			}
			ship_region_str = ship_region_str.replace(/,\s*$/, "");
			ship_region = ship_region_str;
		}
		
		
		var is_on_sale=req.body.is_on_sale;
		
		var continue_to_variant=req.body.continue_to_variant;
		
		
		var Files1=req.files.img1;
		var Files2=req.files.img2;
		var Files3=req.files.img3;
		var Files4=req.files.img4;
		var Files5=req.files.img5;
		
		var Files_ext1=req.body.cropped_img_ext1;
		var Files_ext2=req.body.cropped_img_ext2;
		var Files_ext3=req.body.cropped_img_ext3;
		var Files_ext4=req.body.cropped_img_ext4;
		var Files_ext5=req.body.cropped_img_ext5;
		
		var today_time=helpers.getUtcTimestamp();
		
		desc=desc.replace(/'/g, "''");
		product_name=product_name.replace(/'/g, "''");
		width=width.replace(/'/g, "''");
		weight=weight.replace(/'/g, "''");
		height=height.replace(/'/g, "''");
		length=length.replace(/'/g, "''");
		specification=specification.replace(/'/g, "''");
		delivery_returns=delivery_returns.replace(/'/g, "''");
		
		
		var pro_status=req.body.project_status;
		
		
        //check at least 1 image is required
		
		if(Files_ext1=="" && Files_ext2=="" && Files_ext3=="" && Files_ext4=="" && Files_ext5==""){
			 
		    req.flash('message',"Minimum 1 product image is required");
			res.redirect("/vendor_add_product");
			
			return;
		}
		
		
		if(sale_price == 0){
			
			sale_price=price;
		}
		
		if(sale_price>price){
			
			sale_price=price;
		}
		
		if(ship_overseas == 0){
			ship_region=="";
		}
		
		if(ship_price == 0){
			
			is_free_delivery = 1 ;
			
		}
		
		
		var sql1="INSERT INTO `product`(`vendor_id`,`store_id`, `product_type`, `primary_category`, `sku`, `product_name`, `product_description`, `product_short_description`, `price`, `sale_price`, `gender`, `quantity`, `quantity_soled`, `quantity_remaining`, `is_customizable`, `is_shipped_overseas`, `ship_region`, `is_gift_wrap`, `gift_price`, `is_express_delivery`, `product_width`, `product_height`, `product_weight`, `is_free_delivery`,`ship_price`, `ship_with_in`,`specification`,`delivery_returns`, `added_on`,`is_active`,`is_on_sale`,`ship_overseas_price`,`express_delivery_price`,`customize_price`,`custome_input_label`,`product_length`) VALUES ("+vendor_id+","+store_id+",'1',"+mysql.escape(cat1)+",0,"+mysql.escape(product_name)+","+mysql.escape(desc)+","+mysql.escape(desc)+","+mysql.escape(price)+","+mysql.escape(sale_price)+","+mysql.escape(gender)+","+mysql.escape(stock_quantity)+",0,"+mysql.escape(stock_quantity)+","+mysql.escape(customized)+","+mysql.escape(ship_overseas)+","+mysql.escape(ship_region)+","+mysql.escape(gift_wrap)+","+mysql.escape(gift_price)+","+mysql.escape(express_type)+","+mysql.escape(width)+","+mysql.escape(height)+","+mysql.escape(weight)+","+mysql.escape(is_free_delivery)+","+mysql.escape(ship_price)+","+mysql.escape(ship_within)+","+mysql.escape(specification)+","+mysql.escape(delivery_returns)+",'"+today_time+"',"+mysql.escape(pro_status)+","+mysql.escape(is_on_sale)+","+mysql.escape(ship_overseas_price)+","+mysql.escape(express_delivery_price)+","+mysql.escape(customized_price)+","+mysql.escape(cst_txt_lbl)+","+mysql.escape(length)+")";
		
		 userService.runQuery(sql1).then(function(result1){
		 
		  var product_id=result1.insertId;
			  
		  product_name=product_name+product_id;
	      var target=" &=%?~+";
	      var replacement="-";
			 
	      var product_slug =helpers.findAndReplace(product_name, target, replacement);
			 var sq_slug = "update product set slug = '"+product_slug+"' where product_id = "+product_id;
			 userService.runQuery(sq_slug).then(function(re_slug){
			 	var sql2="INSERT INTO `product_category`(`product_id`, `cat_id`, `is_main_cat`) VALUES ("+product_id+","+cat1+",1)"; 
			 
				 if(cat2>0){
					if(customized == 1){
						if(cat2 == 7 || cat1 == 7){
							sql2 +=",("+product_id+","+mysql.escape(cat2)+",1)";
						}else{
							sql2 +=",("+product_id+","+mysql.escape(cat2)+",1),("+product_id+",7,1)";
						}					
					}else{
						sql2 +=",("+product_id+","+mysql.escape(cat2)+",1)";
					}
					 
				  }else{
					 if(customized == 1){
						if(cat1 == 7){
						}else{
							sql2 +=",("+product_id+",7,1)";
						}					
					} 
				  }

				 if(Array.isArray(sub_cat)){

					 for(var i=0;i<sub_cat.length;i++){

						 sql2 +=",("+product_id+","+mysql.escape(sub_cat[i])+",0)";
					 }

				 }else if(sub_cat==0){
				 
				 }else{

					 sql2 +=",("+product_id+","+mysql.escape(sub_cat)+",0)";
				 }

				 

			 userService.runQuery(sql2).then(function(result2){


				 var sql3="INSERT INTO `product_images`(`product_id`, `image_url`) VALUES";

				 /* product images upload  */

				

				 var callback_image=function(flag,filename){

				
					     sql3 ="INSERT INTO `product_images` (`product_id`, `image_url`) VALUES ("+product_id+",'"+filename+"')";

						 userService.runQuery(sql3).then(function(result3){ 

						   }).catch(function (err3){  console.log(err3);

						   })


				  }
				  
                 if(Files1!="" && Files1 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"1."+Files_ext1
				    
					 helpers.uploadNewfile(Files1,"/uploads/products/",filenewname,callback_image); 
					
			         // helpers.testbase64(Files1,"uploads/products/",filenewname,callback_image);
			         
					
					 
				  }
				  //image2
				 
				 if(Files2!="" && Files2 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"2."+Files_ext2
				    
					 helpers.uploadNewfile(Files2,"/uploads/products/",filenewname,callback_image); 
					
					
			         // helpers.uploadImageBase64(Files2,"uploads/products/",filenewname,callback_image);
					  
				  }
				 
				  //image3
				 
				 if(Files3!="" && Files3 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"3."+Files_ext3
				    
					 helpers.uploadNewfile(Files3,"/uploads/products/",filenewname,callback_image); 
					
			         // helpers.uploadImageBase64(Files3,"uploads/products/",filenewname,callback_image);
					  
				  }
				 
				 
				  //image4
				
				if(Files4!="" && Files4 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"4."+Files_ext4
				    
					
					helpers.uploadNewfile(Files4,"/uploads/products/",filenewname,callback_image); 
					
			         // helpers.uploadImageBase64(Files4,"uploads/products/",filenewname,callback_image);
					  
				  }
				
				
				  
				  //image5
				 
				  if(Files5!="" && Files5 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"5."+Files_ext5;
					 
				     helpers.uploadNewfile(Files5,"/uploads/products/",filenewname,callback_image);
					 
			         // helpers.uploadImageBase64(Files5,"uploads/products/",filenewname,callback_image);
					  
				  }
			 
				 var res_data = "";
				  
				  //final result
				  req.flash('message',"Product saved successfully");

				  if(continue_to_variant == 1){
					  
					   res_data = "vendor_add_product_variant?product_no="+product_id;
					  
					  var response ={status:200,message:"Product added successfully",data:res_data};
							  
		               res.send(JSON.stringify(response));
					  
					  
				  }else{
					  
					  
					   var response ={status:200,message:"Product added successfully",data:res_data};
							  
		               res.send(JSON.stringify(response));
				  }
				 
				

			  }).catch(function (err2){  console.log(err2);
					var response ={status:500,message:"some error occurred",data:[]};
							  
		         res.send(JSON.stringify(response));

			 });
			 }).catch(function(err_slug){
			 	var response ={status:500,message:"some error occurred",data:[]};
							  
		         res.send(JSON.stringify(response));
			 });
			 
		 
			 
			 
		 }).catch(function (err1){  console.log(err1);
		    
				var response ={status:500,message:"some error occurred",data:[]};
							  
		         res.send(JSON.stringify(response));
			 
         });
			
	
	
});

/* vendor edit product */
router.all('/vendor_edit_product',checkLoginVendor,function(req, res) {

var product_id =req.query.product_no ? req.query.product_no :0;

var vendor_id=req.session.userdata.user_id;

/* check product id exist */
if(product_id ==0){
    res.redirect("/vendor_manage_product");
return;
}

var post_msg =req.flash('message');

    var data={req_path:req.path,
  userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,
  categories:res.locals.categories,
  message:post_msg,
  product_id:product_id
};

data.meta_keywords="";
 
    data.meta_desc="";

    data.og_img="front_assets/img/prazar.png";
data.og_url=config.siteUrl+"vendor_edit_product";
    data.og_type="website";


if(req.body.live_sub || req.body.later_sub){  /** post method **/

var vendor_id=req.session.userdata.user_id;
var product_name=req.body.product_name_edit;

var cat1=req.body.cat1_edit;
var cat2=req.body.cat2_edit ? req.body.cat2_edit : 0;
var sub_cat=req.body.sub_cat_edit ? req.body.sub_cat_edit :0 ;
var subsub_cat=req.body.subsub_cat_edit ? req.body.subsub_cat_edit :0 ;
var desc=req.body.desc_edit;
var price=parseFloat(req.body.price_edit);
var sale_price=req.body.sale_price_edit ? parseFloat(req.body.sale_price_edit) : 0;
var gender=req.body.gender_edit;
var stock_quantity=req.body.stock_quantity_edit;
var gift_wrap=req.body.gift_wrap_edit;
var gift_price=req.body.gift_price_edit ? req.body.gift_price_edit:0;
var ship_overseas=req.body.ship_overseas_edit ? req.body.ship_overseas_edit :0;
var ship_overseas_price=req.body.ship_overseas_price ? req.body.ship_overseas_price :0;
var express_delivery_price=req.body.express_delivery_price ? req.body.express_delivery_price :0;
var ship_region=req.body.ship_region_edit ? req.body.ship_region_edit :"";
var express_type=req.body.express_type_edit;
var width=req.body.width_edit ? req.body.width_edit :"";
var height=req.body.height_edit ? req.body.height_edit : "";
var weight=req.body.weight_edit ? req.body.weight_edit :"";
var length=req.body.length_edit ? req.body.length_edit :"";
var ship_price=req.body.ship_price_edit ? req.body.ship_price_edit :0;
var ship_within=req.body.ship_within_edit ? req.body.ship_within_edit : "";
var today_time=helpers.getUtcTimestamp();

var is_free_delivery=req.body.is_free_delivery ;
var specification=req.body.specification ? req.body.specification :"";
var delivery_returns=req.body.delivery_returns ? req.body.delivery_returns :"";

var customized=req.body.customized;


var cst_txt_lbl=req.body.cst_txt_lbl ? req.body.cst_txt_lbl : "";
var customized_price=req.body.customized_price ? req.body.customized_price : 0;

var is_on_sale=req.body.is_on_sale;

var continue_to_variant=req.body.continue_to_variant;

var continue_inpt_hidn_type=req.body.continue_inpt_hidn_type;

var is_variable=req.body.continue_inpt_hidn_type;

    var Files1=req.files.pro_image1;
    var Files2=req.files.pro_image2;
    var Files3=req.files.pro_image3;
    var Files4=req.files.pro_image4;
    var Files5=req.files.pro_image5;

var Files_ext1=req.body.cropped_img_ext1;
var Files_ext2=req.body.cropped_img_ext2;
var Files_ext3=req.body.cropped_img_ext3;
var Files_ext4=req.body.cropped_img_ext4;
var Files_ext5=req.body.cropped_img_ext5;


var image_width1=req.body.image_width1;
var image_width2=req.body.image_width2;
var image_width3=req.body.image_width3;
var image_width4=req.body.image_width4;
var image_width5=req.body.image_width5;


desc=desc.replace(/'/g, "''");
product_name=product_name.replace(/'/g, "''");
specification=specification.replace(/'/g, "''");
delivery_returns=delivery_returns.replace(/'/g, "''");


var product_token_id=req.body.post_tok;

product_token_id=helpers.base64Decode(product_token_id);


if(req.body.live_sub){
var pro_status=1;
}else{
var pro_status=0;
}

if(sale_price==0){

sale_price=price;
}

if(sale_price>price){

sale_price=price;
}


var ship_region_str="";

if(Array.isArray(ship_region)){	
for(var i=0;i<ship_region.length;i++){
ship_region_str  = ship_region_str+ship_region[i]+",";
}
ship_region_str = ship_region_str.replace(/,\s*$/, "");
ship_region = ship_region_str;
}



if(ship_overseas == 0){
ship_region=="";
}

var cst_txt_lbl_str="";
if(Array.isArray(cst_txt_lbl)){	
for(var i=0;i<cst_txt_lbl.length;i++){
cst_txt_lbl_str  = cst_txt_lbl_str+cst_txt_lbl[i]+",";
}
cst_txt_lbl_str = cst_txt_lbl_str.replace(/,\s*$/, "");
cst_txt_lbl = cst_txt_lbl_str;
}


if(customized == 0){

cst_txt_lbl="";
}


if(ship_price == 0){

is_free_delivery = 1 ;

}


var sql1="UPDATE `product` SET `primary_category`="+mysql.escape(cat1)+",`sku`=0,`product_name`="+mysql.escape(product_name)+",`product_description`="+mysql.escape(desc)+",`product_short_description`="+mysql.escape(desc)+",`price`="+mysql.escape(price)+",`sale_price`="+mysql.escape(sale_price)+",`gender`="+mysql.escape(gender)+",`quantity`="+mysql.escape(stock_quantity)+",`quantity_remaining`="+mysql.escape(stock_quantity)+",`is_shipped_overseas`="+mysql.escape(ship_overseas)+",`ship_region`="+mysql.escape(ship_region)+",`is_gift_wrap`="+mysql.escape(gift_wrap)+",`gift_price`="+mysql.escape(gift_price)+",`is_express_delivery`="+mysql.escape(express_type)+",`product_width`="+mysql.escape(width)+",`product_height`="+mysql.escape(height)+",`product_weight`="+mysql.escape(weight)+",`ship_price`="+mysql.escape(ship_price)+",`ship_with_in`="+mysql.escape(ship_within)+",`added_on`='"+today_time+"',`is_active`="+mysql.escape(pro_status)+" ,`specification`="+mysql.escape(specification)+",`delivery_returns`="+mysql.escape(delivery_returns)+",is_customizable="+mysql.escape(customized)+",is_free_delivery="+mysql.escape(is_free_delivery)+",is_on_sale="+mysql.escape(is_on_sale)+",ship_overseas_price="+mysql.escape(ship_overseas_price)+",`express_delivery_price`="+mysql.escape(express_delivery_price)+",product_type="+mysql.escape(is_variable)+",customize_price="+mysql.escape(customized_price)+",custome_input_label="+mysql.escape(cst_txt_lbl)+",product_length="+mysql.escape(length)+" WHERE product_id="+mysql.escape(product_token_id)+"";

userService.runQuery(sql1).then(function(result1){
 
var sql8="delete from product_category where product_id="+mysql.escape(product_token_id)+"";

userService.runQuery(sql8).then(function(result8){ 
 
//////////////////////////////////////////////
 
var sql2="INSERT INTO `product_category`(`product_id`, `cat_id`, `is_main_cat`,`is_sub_sub_cat`) VALUES ("+mysql.escape(product_id)+","+mysql.escape(cat1)+",1,0)"; 
 
if(cat2>0){
if(customized == 1){
if(cat2 == 7 || cat1 == 7){
sql2 +=",("+product_id+","+cat2+",1,0)";
}else{
sql2 +=",("+product_id+",7,1,0),("+product_id+","+cat2+",1,0)";
}	
}else{
sql2 +=",("+product_id+","+cat2+",1,0)";
}
 
  }else{
if(customized == 1){
if(cat1 == 7){
}else{
sql2 +=",("+product_id+",7,1,0)";
}	
} 
  }
 
if(Array.isArray(sub_cat)){
 
for(var i=0;i<sub_cat.length;i++){

sql2 +=",("+product_id+","+sub_cat[i]+",0,0)";
}
 
}else if(sub_cat==0){
 
}else{
 
sql2 +=",("+product_id+","+sub_cat+",0,0)";
}
 
  /* sub sub category */
				 
  if(Array.isArray(subsub_cat)){

	 for(var i=0;i<subsub_cat.length;i++){

		 sql2 +=",("+product_id+","+mysql.escape(subsub_cat[i])+",0,1)";
	 }

 }else if(subsub_cat==0){
 
 }else{

	 sql2 +=",("+product_id+","+mysql.escape(subsub_cat)+",0,1)";
 }
 
 
userService.runQuery(sql2).then(function(result2){
 
/* check image is choose are not */
 
var callback_image=function(flag,filename){


     sql3 ="INSERT INTO `product_images` (`product_id`, `image_url`) VALUES ("+mysql.escape(product_id)+",'"+filename+"')";

userService.runQuery(sql3).then(function(result3){ 

   }).catch(function (err3){  console.log(err3);

   })


  }
 
 
           
  if(Files1!="" && Files1 != undefined){
   
                     var filenewname= helpers.getUtcTimestamp()+"1."+Files_ext1;
 
    image_width1 = parseInt(image_width1);

          helpers.uploadFileWithSharp(Files1,"uploads/products/",filenewname,image_width1,image_width1,callback_image); 
 
  }
  //image2
 
if(Files2!="" && Files2 != undefined){
   
                     var filenewname= helpers.getUtcTimestamp()+"2."+Files_ext2;
    
image_width2 = parseInt(image_width2);

          helpers.uploadFileWithSharp(Files2,"uploads/products/",filenewname,image_width2,image_width2,callback_image); 
 
  }
 
  //image3
 
if(Files3!="" && Files3 != undefined){
   
                     var filenewname= helpers.getUtcTimestamp()+"3."+Files_ext3;
 
    image_width3 = parseInt(image_width3);


          helpers.uploadFileWithSharp(Files3,"uploads/products/",filenewname,image_width3,image_width3,callback_image); 
 
  }
 
 
  //image4

if(Files4!="" && Files4 != undefined){
   
                     var filenewname= helpers.getUtcTimestamp()+"4."+Files_ext4
    
image_width4 = parseInt(image_width4);

           helpers.uploadFileWithSharp(Files4,"uploads/products/",filenewname,image_width4,image_width4,callback_image); 
 
  }


 
  //image5
 
  if(Files5!="" && Files5 != undefined){
   
                     var filenewname= helpers.getUtcTimestamp()+"5."+Files_ext5
    
image_width5 = parseInt(image_width5);

           helpers.uploadFileWithSharp(Files5,"uploads/products/",filenewname,image_width5,image_width5,callback_image); 
 
  }
 
 
// final first

req.flash('message',"Product updated successfully");

    
  if(is_variable == 1){
   var sql_del="delete from product_variants where product_id="+mysql.escape(product_token_id)+"";
  }else{
   var sql_del="delete from product_variants where product_id=0";
  }
   

        userService.runQuery(sql_del).then(function(result_del){

if(continue_to_variant == 1){

if(continue_inpt_hidn_type==1){ //redirect to add/edit variant


res.redirect("/vendor_add_product_variant?product_no="+product_id);
}else{

res.redirect("/vendor_edit_product_variant?product_no="+product_id);
}

}else{

res.redirect("/vendor_edit_product?product_no="+product_id);
}

 
    }).catch(function (err_del){  console.log(err_del);
    


              res.redirect("/vendor_edit_product?product_no="+product_id);
 
            }) 


 
  }).catch(function (err2){  console.log(err2);
    
                res.redirect("/vendor_edit_product?product_no="+product_id);
 
         }) 
 
 
}).catch(function (err8){   console.log(err8);

                res.redirect("/vendor_edit_product?product_no="+product_id);
 
      }) 
 
}).catch(function (err1){  console.log(err1);
    
                res.redirect("/vendor_edit_product?product_no=="+product_id);
 
         });


}else{ /** get method **/

  /* get Australia regions*/
  var sql = "select * from overseas_regions where is_active=1 and is_deleted=0";
       
      userService.runQuery(sql).then(function(result){ 
 
  data.states=result;
 
   /* get product details */	 
  var sql4 = "select * from product where product_id="+mysql.escape(product_id)+" and vendor_id="+vendor_id+"";
      userService.runQuery(sql4).then(function(result4){
 
 
if(result4.length==0){
 
res.redirect("/vendor_manage_product");
     return;
 
}
 
 
  var region_arr=result4[0]['ship_region'];
  var custome_input_label_arr=result4[0]['custome_input_label'];
 
  var region_string=region_arr.split(",");
  var custome_input_label_string=custome_input_label_arr.split(",");
 
  result4[0]['ship_region']=region_string;
  result4[0]['custome_input_label']=custome_input_label_string;
 
 
 
      data.product_details=result4[0];
 

 
     
  /* get product images */	 
  var sql5 = "select * from product_images where product_id="+mysql.escape(product_id)+"";
      userService.runQuery(sql5).then(function(result5){
 
data.products_images=result5;
data.pro_images_arr=[];
 
var remain_imag=5-result5.length;
 
for(var i=0;i<remain_imag;i++){
 
var count=1+i;
data.pro_images_arr.push(count);
 
}

 
   /* get product sub categories */	 
  var sql6 = "select sub_categories.id,sub_categories.name from product_category inner join sub_categories on product_category.cat_id=sub_categories.id where product_category.product_id="+mysql.escape(product_id)+" and product_category.is_main_cat=0 and sub_categories.is_active=1";
 
      userService.runQuery(sql6).then(function(result6){ 
 
     data.product_cats=result6;
 
  /* get product secondary category */	 
  var sql7= "select cat_id as secondry_cat from product_category where product_id="+mysql.escape(product_id)+" and is_main_cat=1 order by id desc limit 1";
 
  userService.runQuery(sql7).then(function(result7){ 
 
  data.secondry_cat=0
 
  if(result7.length>0){
    data.secondry_cat=result7[0]['secondry_cat'];
  }
 
 
/* get all UNselected  sub category of product */
 
  var sql8= "select id,name from sub_categories where is_active = 1 and cat_id in("+data.secondry_cat+","+result4[0].primary_category+")";
 
      userService.runQuery(sql8).then(function(result8){ 
 
       data.all_subcates = result8 ;
 
 
  /*get sub sub category of product*/
  
  var sql9= "select sub_sub_categories.id,sub_sub_categories.name from product_category inner join sub_sub_categories  on product_category.cat_id=sub_sub_categories.id where product_category.product_id="+mysql.escape(product_id)+" and product_category.is_main_cat=0 and is_sub_sub_cat = 1 and sub_sub_categories.is_active =1";
 
   userService.runQuery(sql9).then(function(result9){ 
 
 
      data.selected_sub_sub_cats = result9 ;
 
 
  /*get unselected  sub sub category of product*/
  
  var sub_categories = [];
  for(var i=0;i<result6.length;i++){
	  sub_categories.push(result6[i].id);
  }
  
 
  var sql10= "select * from sub_sub_categories where is_active=1 and sub_cat_id in ("+sub_categories+")";
 
   userService.runQuery(sql10).then(function(result10){ 
 
 
     data.all_sub_sub_cats = result10 ;
 
    //final result send to view
 
     var encoded_pro_id=helpers.base64Encode(product_id);
 
     data.encoded_pro_id=encoded_pro_id;
 
    res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	

	
	
  }).catch(function (err10){  console.log(err10);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
  });
	

  }).catch(function (err9){  console.log(err9);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
  });


}).catch(function (err8){  console.log(err8);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
         });

  }).catch(function (err7){  console.log(err7);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
         });
 
 
}).catch(function (err6){  console.log(err6);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
         });
 
 
  }).catch(function (err5){  console.log(err5);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
         });
 
 
}).catch(function (err4){  console.log(err4);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
         });
 
 
}).catch(function (err){  console.log(err);
    
               res.render('front/vendor_edit_product',{title: 'Prazar vendor Edit Product',base_url:config.siteUrl,data:data});	
 
         });

}
   

});

router.post('/edit_product',checkLoginVendor,function(req,res){
	
	
	
	
		var vendor_id=req.session.userdata.user_id;
		var product_name=req.body.product_name_edit;
	
		var cat1=req.body.cat1_edit;
		var cat2=req.body.cat2_edit ? req.body.cat2_edit : 0;
		var sub_cat=req.body.sub_cat_edit ? req.body.sub_cat_edit :0 ;
		var desc=req.body.desc_edit;
		var price=parseFloat(req.body.price_edit);
		var sale_price=req.body.sale_price_edit ? parseFloat(req.body.sale_price_edit) : 0;
		var gender=req.body.gender_edit;
		var stock_quantity=req.body.stock_quantity_edit;
		var gift_wrap=req.body.gift_wrap_edit;
		var gift_price=req.body.gift_price_edit ? req.body.gift_price_edit:0;
		var ship_overseas=req.body.ship_overseas_edit ? req.body.ship_overseas_edit :0;
		var ship_overseas_price=req.body.ship_overseas_price ? req.body.ship_overseas_price :0;
		var express_delivery_price=req.body.express_delivery_price ? req.body.express_delivery_price :0;
		var ship_region=req.body.ship_region_edit ? req.body.ship_region_edit :"";
		var express_type=req.body.express_type_edit;
		var width=req.body.width_edit ? req.body.width_edit :"";
		var height=req.body.height_edit ? req.body.height_edit : "";
		var weight=req.body.weight_edit ? req.body.weight_edit :"";
		var length=req.body.length_edit ? req.body.length_edit :"";
		var ship_price=req.body.ship_price_edit ? req.body.ship_price_edit :0;
		var ship_within=req.body.ship_within_edit ? req.body.ship_within_edit : "";
		var today_time=helpers.getUtcTimestamp();
		
		var is_free_delivery=req.body.is_free_delivery ;
		var specification=req.body.specification ? req.body.specification :"";
		var delivery_returns=req.body.delivery_returns ? req.body.delivery_returns :"";
		
		var customized=req.body.customized;
		
		
		var cst_txt_lbl=req.body.cst_txt_lbl ? req.body.cst_txt_lbl : "";
		var customized_price=req.body.customized_price ? req.body.customized_price : 0;
		
		var is_on_sale=req.body.is_on_sale;
		
		var continue_to_variant=req.body.continue_to_variant;
		
		var continue_inpt_hidn_type=req.body.continue_inpt_hidn_type;
		
		var is_variable=req.body.is_variable;
		
	    var Files1=req.files.img1;
		var Files2=req.files.img2;
		var Files3=req.files.img3;
		var Files4=req.files.img4;
		var Files5=req.files.img5;
		
		var Files_ext1=req.body.cropped_img_ext1;
		var Files_ext2=req.body.cropped_img_ext2;
		var Files_ext3=req.body.cropped_img_ext3;
		var Files_ext4=req.body.cropped_img_ext4;
		var Files_ext5=req.body.cropped_img_ext5;
	
		
		
		desc=desc.replace(/'/g, "''");
		product_name=product_name.replace(/'/g, "''");
		specification=specification.replace(/'/g, "''");
		delivery_returns=delivery_returns.replace(/'/g, "''");
		
		
		var product_token_id=req.body.post_tok;
		
		product_token_id=helpers.base64Decode(product_token_id);
		
		var product_id=product_token_id;
		
		var pro_status=req.body.project_status;
		
		
		if(sale_price==0){
			
			sale_price=price;
		}
		
		if(sale_price>price){
			//console.log(sale_price+" > "+price);
			sale_price=price;
		}
		
		
		var ship_region_str="";
		
		if(Array.isArray(ship_region)){			
			for(var i=0;i<ship_region.length;i++){
				ship_region_str  = ship_region_str+ship_region[i]+",";
			}
			ship_region_str = ship_region_str.replace(/,\s*$/, "");
			ship_region = ship_region_str;
		}
		
		
		
		if(ship_overseas == 0){
			ship_region=="";
		}
		
		var cst_txt_lbl_str="";
		if(Array.isArray(cst_txt_lbl)){			
			for(var i=0;i<cst_txt_lbl.length;i++){
				cst_txt_lbl_str  = cst_txt_lbl_str+cst_txt_lbl[i]+",";
			}
			cst_txt_lbl_str = cst_txt_lbl_str.replace(/,\s*$/, "");
			cst_txt_lbl = cst_txt_lbl_str;
		}
		
		
		
		if(customized == 0){
			
			cst_txt_lbl="";
		}
		
		
		if(ship_price == 0){
			
			is_free_delivery = 1 ;
			
		}
		
		
		var sql1="UPDATE `product` SET `primary_category`="+mysql.escape(cat1)+",`sku`=0,`product_name`="+mysql.escape(product_name)+",`product_description`="+mysql.escape(desc)+",`product_short_description`="+mysql.escape(desc)+",`price`="+mysql.escape(price)+",`sale_price`="+mysql.escape(sale_price)+",`gender`="+mysql.escape(gender)+",`quantity`="+mysql.escape(stock_quantity)+",`quantity_remaining`="+mysql.escape(stock_quantity)+",`is_shipped_overseas`="+mysql.escape(ship_overseas)+",`ship_region`="+mysql.escape(ship_region)+",`is_gift_wrap`="+mysql.escape(gift_wrap)+",`gift_price`="+mysql.escape(gift_price)+",`is_express_delivery`="+mysql.escape(express_type)+",`product_width`="+mysql.escape(width)+",`product_height`="+mysql.escape(height)+",`product_weight`="+mysql.escape(weight)+",`ship_price`="+mysql.escape(ship_price)+",`ship_with_in`="+mysql.escape(ship_within)+",`added_on`='"+today_time+"',`is_active`="+mysql.escape(pro_status)+" ,`specification`="+mysql.escape(specification)+",`delivery_returns`="+mysql.escape(delivery_returns)+",is_customizable="+mysql.escape(customized)+",is_free_delivery="+mysql.escape(is_free_delivery)+",is_on_sale="+mysql.escape(is_on_sale)+",ship_overseas_price="+mysql.escape(ship_overseas_price)+",`express_delivery_price`="+mysql.escape(express_delivery_price)+",product_type="+mysql.escape(is_variable)+",customize_price="+mysql.escape(customized_price)+",custome_input_label="+mysql.escape(cst_txt_lbl)+",product_length="+mysql.escape(length)+" WHERE product_id="+mysql.escape(product_token_id)+"";
		
	 userService.runQuery(sql1).then(function(result1){
			 
		var sql8="delete from product_category where product_id="+mysql.escape(product_token_id)+"";
		
	 userService.runQuery(sql8).then(function(result8){ 
		 
		 //////////////////////////////////////////////
		 
		var sql2="INSERT INTO `product_category`(`product_id`, `cat_id`, `is_main_cat`) VALUES ("+mysql.escape(product_token_id)+","+mysql.escape(cat1)+",1)"; 
			 
			 if(cat2>0){
				if(customized == 1){
					if(cat2 == 7 || cat1 == 7){
						sql2 +=",("+product_id+","+cat2+",1)";
					}else{
						sql2 +=",("+product_id+",7,1),("+product_id+","+cat2+",1)";
					}					
				}else{
					sql2 +=",("+product_id+","+cat2+",1)";
				}
				 
			  }else{
				 if(customized == 1){
					if(cat1 == 7){
					}else{
						sql2 +=",("+product_id+",7,1)";
					}					
				} 
			  }
			 
			 if(Array.isArray(sub_cat)){
			 
				 for(var i=0;i<sub_cat.length;i++){
					
					 sql2 +=",("+product_id+","+sub_cat[i]+",0)";
				 }
				 
			 }else if(sub_cat==0){
			 
			 }else{
			 
				 sql2 +=",("+product_id+","+sub_cat+",0)";
			 }
			 
		 userService.runQuery(sql2).then(function(result2){
		 
			 /* check image is choose are not */
			 
			 var callback_image=function(flag,filename){
               
					     sql3 ="INSERT INTO `product_images` (`product_id`, `image_url`) VALUES ("+mysql.escape(product_id)+",'"+filename+"')";

						 userService.runQuery(sql3).then(function(result3){ 

						   }).catch(function (err3){  console.log(err3);

						   })


				  }
				  
				
           
				  if(Files1!="" && Files1 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"1."+Files_ext1
				    
					 helpers.uploadFileWithSharp(Files1,"uploads/products/",filenewname,800,800,callback_image); 
					 
					 //helpers.uploadNewfile(Files1,"/uploads/products/",filenewname,callback_image); 
					
			         // helpers.testbase64(Files1,"uploads/products/",filenewname,callback_image);
			         
					
					 
				  }
				  //image2
				 
				 if(Files2!="" && Files2 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"2."+Files_ext2
				    
					 helpers.uploadNewfile(Files2,"/uploads/products/",filenewname,callback_image); 
					
					
			         // helpers.uploadImageBase64(Files2,"uploads/products/",filenewname,callback_image);
					  
				  }
				 
				  //image3
				 
				 if(Files3!="" && Files3 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"3."+Files_ext3
				    
					 helpers.uploadNewfile(Files3,"/uploads/products/",filenewname,callback_image); 
					
			         // helpers.uploadImageBase64(Files3,"uploads/products/",filenewname,callback_image);
					  
				  }
				 
				 
				  //image4
				
				if(Files4!="" && Files4 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"4."+Files_ext4
				    
					
					helpers.uploadNewfile(Files4,"/uploads/products/",filenewname,callback_image); 
					
			         // helpers.uploadImageBase64(Files4,"uploads/products/",filenewname,callback_image);
					  
				  }
				
				
				  
				  //image5
				 
				  if(Files5!="" && Files5 != undefined){
					   
                     var filenewname = helpers.getUtcTimestamp()+"5."+Files_ext5;
					 
				     helpers.uploadNewfile(Files5,"/uploads/products/",filenewname,callback_image);
					 
			         // helpers.uploadImageBase64(Files5,"uploads/products/",filenewname,callback_image);
					  
				  }
			 
			 
				// final first
				
				req.flash('message',"Product updated successfully");
			
			    
			  if(is_variable == 1){
				   var sql_del="delete from product_variants where product_id="+mysql.escape(product_token_id)+"";
			  }else{
				   var sql_del="delete from product_variants where product_id=0";
			  }
			   
			
		        userService.runQuery(sql_del).then(function(result_del){
				
				var res_data = "";
				
				if(continue_to_variant == 1){ 
				
					if(continue_inpt_hidn_type==1){ //redirect to add/edit variant
					
					      res_data = "vendor_add_product_variant?product_no="+product_id;
					
					        var response ={status:200,message:"Product updated successfully",data:res_data};
							  
		                    res.send(JSON.stringify(response));
					
						
						
						//res.redirect("/vendor_add_product_variant?product_no="+product_id);
					}else{
						
						
						    res_data = "vendor_edit_product_variant?product_no="+product_id;
						
							var response ={status:200,message:"Product updated successfully",data:res_data};
							  
		                     res.send(JSON.stringify(response));	
							 
						//res.redirect("/vendor_edit_product_variant?product_no="+product_id);
					}
					
				}else{
					       var response ={status:200,message:"Product updated successfully",data:res_data};
							  
		                   res.send(JSON.stringify(response));
						   
					       //res.redirect("/vendor_edit_product?product_no="+product_id);
				}
				
					 
		    }).catch(function (err_del){  console.log(err_del);
		    
			                var response ={status:500,message:"Some error occurred please try later",data:[]};
							  
		                     res.send(JSON.stringify(response));
			
              // res.redirect("/vendor_edit_product?product_no="+product_id);
			 
            }) 
			
			
			 
		  }).catch(function (err2){  console.log(err2);
		    	             var response ={status:500,message:"Some error occurred please try later",data:[]};
							  
		                     res.send(JSON.stringify(response));
                //res.redirect("/vendor_edit_product?product_no="+product_id);
			 
         }) 
			 
		 
	 }).catch(function (err8){   console.log(err8);
		    	  var response ={status:500,message:"Some error occurred please try later",data:[]};
							  
		                     res.send(JSON.stringify(response));
              //  res.redirect("/vendor_edit_product?product_no="+product_id);
			 
      }) 
			 
		 }).catch(function (err1){  console.log(err1);
		    	  var response ={status:500,message:"Some error occurred please try later",data:[]};
							  
		                     res.send(JSON.stringify(response));
              //  res.redirect("/vendor_edit_product?product_no=="+product_id);
			 
         });
	
});

/** vendor add product variant **/

router.all('/vendor_add_product_variant',checkLoginVendor,function(req, res) {
		
	var product_id =req.query.product_no ? req.query.product_no :0;
	
	var vendor_id=req.session.userdata.user_id;
	
	/* check product id exist */
	if(product_id ==0){
	    res.redirect("/vendor_manage_product");
		return;
	 }
	
	var post_msg =req.flash('message');
	
    var data={req_path:req.path,
			  userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,
			  categories:res.locals.categories,
			  message:post_msg,
			  product_id:product_id
			 };
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"vendor_add_product_variant";
    data.og_type="website";
	
	if(req.body.sub){  /** post method **/
		
		//console.log(JSON.stringify(req.body));
		
     	var vendor_id=req.session.userdata.user_id;
		var variant_id=req.body.variant_id;
		var variant_name=req.body.variant_name;
		var display_type=req.body.display_type;
		var variant_val_number=req.body.variant_val_number;
		var varaint_val=req.body.varaint_val;
		
		var total_variant=1;
		
		
		/* if single variant and single variant value than make array to variant val*/
        if(Array.isArray(varaint_val)){
			
		 }else{
			 
			varaint_val=varaint_val.split(" ");
			
		  }
		
		
		var sql_variant_val_part="";
		
		var sql_variant_val="INSERT INTO `product_variant_values`(`product_variant_id`, `value`,`sku`, `price`, `quantity`) VALUES";
		
		
		var count=0;
		var flag_count=0;
		
		var temp_arr=[];
		
		var callback=function(flag,index,call_result){
		
			      count++;
				  
				  var pro_variant_id=call_result.insertId ; 
				 temp_arr[index] = 	pro_variant_id;	
			    // temp_arr.push(pro_variant_id);
				
				
			     
			     /* check last index of loop */
			    if(count>=total_variant){
					
					//temp_arr.sort();
					
					for(var i=0;i<temp_arr.length;i++){
						 if(Array.isArray(variant_val_number)){
							  for(var j=0;j<variant_val_number[i];j++){
							 
							
								  sql_variant_val_part +="("+mysql.escape(temp_arr[i])+","+mysql.escape(varaint_val[flag_count+j])+",'','0','0'),";
							   }
							   flag_count += parseInt(variant_val_number[i]);
						  }else{
							  for(var j=0;j<variant_val_number;j++){
						 
							
								  sql_variant_val_part +="("+mysql.escape(temp_arr[i])+","+mysql.escape(varaint_val[j])+",'','0','0'),";
							   }
						  }
					}
					
			       //  console.log("part "+sql_variant_val_part);
					 
					sql_variant_val_part = sql_variant_val_part.replace(/,\s*$/, "");
		            sql_variant_val=sql_variant_val+sql_variant_val_part;
					
					/* insert products variants */
					userService.runQuery(sql_variant_val).then(function(val_result){ 
						
						
						
						var sql_update="update product set product_type=2 where product_id="+mysql.escape(product_id)+"";
						
						/* update products have variants */
						userService.runQuery(sql_update).then(function(update_result){
							
							
							//final insert variations
							req.flash('message','Variants saved successfully');
							res.redirect("/vendor_edit_product_variant?product_no="+product_id);
							
						
					}).catch(function (updateerr){ console.log(updateerr);
                            res.render('front/vendor_add_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
                     });
						
					}).catch(function (valerr){ console.log(valerr);
                            res.render('front/vendor_add_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
                     });
					
			      }
			
			
		    }
		
		/******* entry point**********/
		
		/* check how many variant of products */	
		if(Array.isArray(variant_id)){
		   
			/*set length of variants */
			total_variant=variant_id.length;
			
			for(var i=0;i<variant_id.length;i++){
				
				var display_type_var=display_type[i];
				
				if(variant_name[i]=='color'){
					
					display_type_var="checkbox";
				}
				
				
			     var sql_variant="INSERT INTO `product_variants`(`product_id`,`variant_id`, `variant_name`, `display_type`) VALUES ("+mysql.escape(product_id)+","+mysql.escape(variant_id[i])+","+mysql.escape(variant_name[i])+","+mysql.escape(display_type_var)+")";
				
				userService.runQueryCallback(sql_variant,i,callback);
				
			 }
			
		   }else{
		    
			   if(variant_name=='color'){
					
					display_type="checkbox";
				}
			   
			   
			   
			   var sql_variant="INSERT INTO `product_variants`(`product_id`,`variant_id`, `variant_name`, `display_type`) VALUES ("+mysql.escape(product_id)+","+mysql.escape(variant_id)+","+mysql.escape(variant_name)+","+mysql.escape(display_type)+")";
			   
			    userService.runQueryCallback(sql_variant,0,callback);
			   
		  }
		
		
		//desc=desc.replace(/'/g, "''");
		
		
	}else{ /** get method **/
	
		
		
	  /* get system variants */
	  var sql = "select * from variants";
       
      userService.runQuery(sql).then(function(result){ 
		 
		  data.variants=result;
	 
	   /* get product details */	  
	  var sql4 = "select * from product where product_id="+mysql.escape(product_id)+" and vendor_id="+vendor_id+"";
      userService.runQuery(sql4).then(function(result4){
		 
		 
		 if(result4.length==0){
			 res.redirect("/vendor_manage_product");
		    return;
		 }
		 
		 
	   data.product_name=result4[0]['product_name'];
		  
	  res.render('front/vendor_add_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
			 
		 }).catch(function (err4){  console.log(err4);
		    
               res.render('front/vendor_add_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
         });
		  
			 
		 }).catch(function (err){  console.log(err);
		    
               res.render('front/vendor_add_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
         });
	
	}
   
	
});

router.all('/vendor_edit_product_variant',checkLoginVendor,function(req, res) {
		
	var product_id =req.query.product_no ? req.query.product_no :0;
	
	var vendor_id=req.session.userdata.user_id;
	
	
	/* check product id exist */
	if(product_id ==0){
	    res.redirect("/vendor_manage_product");
		return;
	 }
	
	var post_msg =req.flash('message');
	
    var data={req_path:req.path,
			  userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,
			  categories:res.locals.categories,
			  message:post_msg,
			  product_id:product_id
			 };
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"vendor_edit_product_variant";
    data.og_type="website";
	
	if(req.body.sub){  /** post method **/
		
		//console.log(JSON.stringify(req.body));
		
     	var vendor_id=req.session.userdata.user_id;
		var variant_id=req.body.variant_id;
		var variant_type=req.body.variant_type;
		var variant_name=req.body.variant_name;
		
		var display_type=req.body.display_type;
		var variant_val_number=req.body.variant_val_number;
		var varaint_val=req.body.varaint_val;
		var product_variant_id=req.body.pro_variant_id;
		
		var total_variant=1;
		
		
		var product_token_id=req.body.post_tok;
		
		product_token_id=helpers.base64Decode(product_token_id);
		
		/* if single variant and single variant value than make array to variant val*/
        if(Array.isArray(varaint_val)){
		 }else{
			 if(varaint_val!= "" && varaint_val != undefined && varaint_val  != null){
				varaint_val=varaint_val.split(" ");
			 }else{
				 varaint_val = '';
			 }
		  }
		
		console.log("variants values array "+varaint_val);
		
		
		/* if single product variant id variant and single variant id than make array to product variant id*/
		
        if(Array.isArray(product_variant_id)){
		 }else{
			 if(product_variant_id != undefined && product_variant_id != "" && product_variant_id != null){
				product_variant_id=product_variant_id.split(" ");
			 }else{
				 product_variant_id = "";
			 }
		  }
		
		
		var sql_variant_val_part="";
		
		var sql_variant_val="INSERT INTO `product_variant_values`(`product_variant_id`, `value`, `sku`, `price`, `quantity`) VALUES";
		
		
		var count=0;
		var flag_count=0;
		var temp_arr=[];
		
		var callback=function(flag,index,call_result){
		          
				  
			      count++;
				  
				 var pro_variant_id=call_result.insertId ;
				 
				temp_arr[index] = 	pro_variant_id;	
				 
				  
				 
			     
			     /* check last index of loop */
				 
			    if(count>=total_variant){
			         
					 //temp_arr.sort();
				 
					 for(var i=0 ;i<temp_arr.length;i++){
						  if(Array.isArray(variant_val_number)){
							  for(var j=0;j<variant_val_number[i];j++){
							 
							
								  sql_variant_val_part +="("+mysql.escape(temp_arr[i])+","+mysql.escape(varaint_val[flag_count+j])+",'','0','0'),";
							   }
							   flag_count += parseInt(variant_val_number[i]);
						  }else{
							  for(var j=0;j<variant_val_number;j++){
						 
							
								  sql_variant_val_part +="("+mysql.escape(temp_arr[i])+","+mysql.escape(varaint_val[j])+",'','0','0'),";
							   }
						  }
						  
			
			          
						  
					 }
					 
					 
					sql_variant_val_part = sql_variant_val_part.replace(/,\s*$/, "");
		            sql_variant_val=sql_variant_val+sql_variant_val_part;
					
					
					
					/* insert products variants */
					userService.runQuery(sql_variant_val).then(function(val_result){ 
						 
						var sql_update="update product set product_type=2 where product_id="+mysql.escape(product_token_id)+" and vendor_id="+vendor_id+"";
						
						/* update products have variants */
						userService.runQuery(sql_update).then(function(update_result){
							
							
							//final insert variations
							req.flash('message','Variants saved successfully');
							res.redirect("/vendor_edit_product_variant?product_no="+product_token_id);
							
						
					}).catch(function (updateerr){ console.log(updateerr);
                            res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
                     });
						
					}).catch(function (valerr){ console.log(valerr);
                            res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
                     });
					
			      }
			
			
		    }
		
		/******* entry point**********/
		
		
		/* remove previous variants values*/
		
		 var sql_pre_vr = "select product_Variants_id from product_variants where product_id="+mysql.escape(product_id)+"";
		 
          userService.runQuery(sql_pre_vr).then(function(res_pre_var){
		
		    var all_pro_var_ids=[];
		    for(var i=0;i<res_pre_var.length;i++){
			   
			   all_pro_var_ids.push(res_pre_var[i]['product_Variants_id']);
		    }
		   
		   if(all_pro_var_ids.length == 0){
			   all_pro_var_ids=[0];
		   }
		  
		 var sql_delete="delete from  product_variant_values where product_variant_id in("+all_pro_var_ids+")";
						
	     userService.runQuery(sql_delete).then(function(delete_result){
							
		var sql_delete1="delete from  product_variants where product_Variants_id in("+all_pro_var_ids+")";
						
	     userService.runQuery(sql_delete1).then(function(delete_result1){

         /* check how many variant of products */	
		  if(Array.isArray(variant_id)){
		  
			/*set length of variants */
			total_variant=variant_id.length;
			
			for(var i=0;i<variant_id.length;i++){
				
					 if(variant_name[i]=='color'){
					
					     display_type[i]="checkbox";
				     }
					 
					
					
					 var sql_variant="INSERT INTO `product_variants`(`product_id`, `variant_name`, `display_type`,`variant_id`) VALUES ("+mysql.escape(product_id)+","+mysql.escape(variant_name[i])+","+mysql.escape(display_type[i])+","+mysql.escape(variant_id[i])+")";
				
				
				userService.runQueryCallback(sql_variant,i,callback);
				
			 }
			
		   }else{   //single variant
		   	
						 if(variant_name=='color'){
					
					        display_type="checkbox";
				         }
						 
						
						  var sql_variant="INSERT INTO `product_variants`(`product_id`, `variant_name`, `display_type`,`variant_id`) VALUES ("+mysql.escape(product_id)+","+mysql.escape(variant_name)+","+mysql.escape(display_type)+","+mysql.escape(variant_id)+")";
					   
					if(variant_name != undefined){
						userService.runQueryCallback(sql_variant,0,callback);
					}else{
						 res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
					}
					 
				
		    }
			
						
		}).catch(function (deleteerr){ console.log(deleteerr);
                   res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
          });
		 	
			}).catch(function (deleteerr1){ console.log(deleteerr);
                   res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
          });
			
		}).catch(function (pre_err){ console.log(pre_err);
            res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor add variant Product',base_url:config.siteUrl,data:data});	
			 
        });
		
		
		
		//desc=desc.replace(/'/g, "''");
		
		
	}else{ /** get method **/
	
		
		
	  /* get system variants */
	  var sql = "select * from variants";
       
      userService.runQuery(sql).then(function(result){ 
		 
		  data.variants=result;
	 
	   /* get product details */	  
	  var sql4 = "select * from product where product_id="+mysql.escape(product_id)+" and vendor_id="+vendor_id+"";
      userService.runQuery(sql4).then(function(result4){
		 
		 if(result4.length==0){
			 
			 res.redirect("/vendor_manage_product");
		     return;
		 }
	 
	   data.product_name=result4[0]['product_name'];
		  
		var sql5 = "select * from product_variants where product_id="+mysql.escape(product_id)+"";
      userService.runQuery(sql5).then(function(result5){

        if(result5.length>0){
			
		 var count=0;
		 var pro_variants_final=[];
		 var callback=function(flag,index,res_variant){
			 
			     result5[index]['variant_vals']=res_variant;
			     pro_variants_final[index]=result5[index];
				 
			     count++;
			     if(count>=result5.length){
					 
					  //final 1
					 
					 data.pro_variants=pro_variants_final;
					 
					 var encoded_pro_id=helpers.base64Encode(product_id);
					 
		             data.encoded_pro_id=encoded_pro_id;
					 
					 res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor edit variant Product',base_url:config.siteUrl,data:data});
					 
				 }
		    }
			
         for(var i=0;i<result5.length;i++){
			 product_variant_id=result5[i]['product_Variants_id'];
			 var sql_variant="select * from product_variant_values where product_variant_id="+product_variant_id+"";
			 
			 userService.runQueryCallback(sql_variant,i,callback);
		 }
		 
		}else{
			
			//final 2
			 var encoded_pro_id=helpers.base64Encode(product_id);
		     data.encoded_pro_id=encoded_pro_id;
			
			 data.pro_variants=[];
			 res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor edit variant Product',base_url:config.siteUrl,data:data});
	  
		}
		  
	 
		 }).catch(function (err5){ console.log(err5);
		    
               res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor edit variant Product',base_url:config.siteUrl,data:data});	
			 
         });	 
			 
		 }).catch(function (err4){  console.log(err4);
		    
               res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor edit variant Product',base_url:config.siteUrl,data:data});	
			 
         });
		  
			 
		 }).catch(function (err){  console.log(err);
		    
               res.render('front/vendor_edit_product_variant',{title: 'Prazar vendor edit variant Product',base_url:config.siteUrl,data:data});	
			 
         });
	
	}
   
	
});


/* vendor delete product variant */
router.post('/deleteProducVariant',checkLoginVendor,function(req, res) {
	
	var pro_varaint_id=req.body.pro_varaint_id;
	var count_of_varints=req.body.count_of_varints;
	
	var vendor_id=req.session.userdata.user_id;
	
	if(count_of_varints == 0){
		var is_vriable=1;
	}else{
		var is_vriable=2;
	}
	
	
	var sql3 = "select product_id from product_variants where product_Variants_id="+mysql.escape(pro_varaint_id)+"";
       
     userService.runQuery(sql3).then(function(result3){
	
	if(result3.length>0){
		
	       var product_id = result3[0]['product_id'];
	
	       var sql4 = "select product_id from product where product_id="+product_id+" and vendor_id="+vendor_id+"";
       
     userService.runQuery(sql4).then(function(result4){
	
	         if(result4.length==0){
				 
				       var response ={status:200,message:"Product variant can not be deleted ",data:[]};
					   res.send(JSON.stringify(response));
					   return ;
			 }
	
	
			var sql = "delete from product_variants where product_Variants_id="+mysql.escape(pro_varaint_id)+"";
			   
			  userService.runQuery(sql).then(function(result){
					   
			var sql1 = "delete from product_variant_values where product_variant_id="+mysql.escape(pro_varaint_id)+"";
			   
			  userService.runQuery(sql1).then(function(result1){
					
					var sql11 = "update product set product_type="+is_vriable+" where product_id="+product_id+"";
			   
			  userService.runQuery(sql11).then(function(result11){
					
					
					 var response ={status:200,message:"Product variant deleted successfully",data:[]};
					   res.send(JSON.stringify(response));
					
					
					 }).catch(function (err11){  console.log(err11);
					
				  var response ={status:500,message:"error",data:[]};
				  
				  res.send(JSON.stringify(response));
				  
				  });
				
				  
				 }).catch(function (err1){  console.log(err1);
					
				  var response ={status:500,message:"error",data:[]};
				  
				  res.send(JSON.stringify(response));
				  
				  });
		   
				 }).catch(function (err){  console.log(err);
				  
					var response ={status:500,message:"error",data:[]};
				  
					res.send(JSON.stringify(response));
				 });
				 
			}).catch(function (err4){  console.log(err4);
				  
					var response ={status:500,message:"error",data:[]};
				  
					res.send(JSON.stringify(response));
			});
		 
	    }else{
		  
		  var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
		  
	    }
		 
       }).catch(function (err3){  console.log(err3);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
         });   
   
});



/* vendor delete product variant value */

router.post('/deleteProducVariantValue',checkLoginVendor,function(req, res) {
	
	var pro_varaint_val_id=req.body.pro_varaint_val_id;
	
	var vendor_id=req.session.userdata.user_id;
	
	sql_check="SELECT id from product_variant_values where id="+mysql.escape(pro_varaint_val_id)+" and product_variant_id in (select product_Variants_id from product_variants where product_id in(select product_id from product where vendor_id="+vendor_id+"))";
	
	 userService.runQuery(sql_check).then(function(result4){
		
		//console.log("length of result "+result4.length);
		
		
         if(result4.length == 0){
			 
			   var response ={status:404,message:"success",data:[]};
		       res.send(JSON.stringify(response));
			   return;
		 }
		
	  var sql3 = "delete from product_variant_values where id="+mysql.escape(pro_varaint_val_id)+"";
       
     userService.runQuery(sql3).then(function(result3){
	
	        var response ={status:200,message:"success",data:[]};
		  
		    res.send(JSON.stringify(response));
		 
       }).catch(function (err3){  console.log(err3);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });   
	  
	  }).catch(function (err4){  console.log(err4);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });   
   
});



/* vendor delete product */
router.post('/vendor_delete_product',checkLoginVendor,function(req, res) {
	
	var product_id=req.body.product_id;
	var vendor_id=req.session.userdata.user_id;
	
	var sql1 = "select product_id from product  where product_id="+mysql.escape(product_id)+" and vendor_id="+mysql.escape(vendor_id)+"";
      
      userService.runQuery(sql1).then(function(result2){
	
	 if(result2.length==0){
		 
		  var response ={status:500,message:"Product can not be deleted ",data:[]};
		  res.send(JSON.stringify(response));
		 
		 return ;
	 }
	
    var sql = "update product set is_deleted=1 where product_id="+mysql.escape(product_id)+" ";
       
      userService.runQuery(sql).then(function(result){
			   
	var sql1 = "select * from product_images where product_id="+mysql.escape(product_id)+"";
       
      userService.runQuery(sql1).then(function(result1){
			
		  if(result1.length >0){
		  
			  /* remove old file after*/ 
			 for(var i=0;i<result1.length;i++){ 
			  
               var filePath = appDir+"/uploads/products/"+result1[i]['image_url']; 
			
			   if (fs.existsSync(filePath)) {
                   fs.unlinkSync(filePath);
                }
			}
			   var response ={status:200,message:"Product deleted successfully",data:[]};
		       res.send(JSON.stringify(response));
			  
		   }else{
		   
			     var response ={status:200,message:"Product deleted successfully",data:[]};
		         res.send(JSON.stringify(response));
		   }
		  
		  
		 }).catch(function (err1){  console.log(err1);
		    
		  var response ={status:500,message:"error",data:[]};
		  
		  res.send(JSON.stringify(response));
		  
          });
   
		 }).catch(function (err){  console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
         });
		 
		 }).catch(function (err2){  console.log(err2);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
         });
   
});

/* vendor delete product image */
router.post('/delete_product_image',checkLoginVendor,function(req, res) {
	
	var image_id=req.body.image_id;
	
	var vendor_id=req.session.userdata.user_id;
	
	
	var sql1 = "select * from product_images where id="+mysql.escape(image_id)+"";
       
      userService.runQuery(sql1).then(function(result1){
			
		  if(result1.length >0){
		  
		       var product_id=result1[0]['product_id'];
		  
		       var sql3 = "select product_id from product where product_id="+product_id+" and vendor_id="+vendor_id+"";
       
             userService.runQuery(sql3).then(function(result3){
		  
		      if(result3.length==0){
				  
				  var response ={status:200,message:"Image can not be deleted",data:[]};
		          res.send(JSON.stringify(response));
				  
				  return ;
			  }
		  
		  
		  
			  /* remove file from folder */
			  
               var filePath = appDir+"/uploads/products/"+result1[0]['image_url']; 
			
			   if (fs.existsSync(filePath)) {
                   fs.unlinkSync(filePath);
                }
			
			  var sql2 = "delete from product_images where id="+mysql.escape(image_id)+"";
       
             userService.runQuery(sql2).then(function(result2){
	      
				 var response ={status:200,message:"Image deleted successfully",data:[]};
		          res.send(JSON.stringify(response));
				 
				 
	             }).catch(function (err2){  console.log(err2);
										  
		           var response ={status:500,message:"error",data:[]};
		  
		          res.send(JSON.stringify(response));
		  
                 });
			  
			  
			   }).catch(function (err3){  console.log(err3);
										  
		           var response ={status:500,message:"error",data:[]};
		  
		          res.send(JSON.stringify(response));
		  
                 });
			  
			  
		   }else{
		   
			     var response ={status:200,message:"Image deleted successfully",data:[]};
		         res.send(JSON.stringify(response));
		   }
		  
		  
		 }).catch(function (err1){  console.log(err1);
		    
		  var response ={status:500,message:"error",data:[]};
		  
		  res.send(JSON.stringify(response));
		  
          });
   
         
   
});


router.get('/vendor_help_section',checkLoginVendor,function(req, res) {
	
 var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories};

 data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
    data.og_url=config.siteUrl+"vendor_help_section";
    data.og_type="website";
 
	res.render('front/vendor_help_section',{title: 'Prazar vendor help section',base_url:config.siteUrl,data:data});	
	
});

/*vendor messages*/

router.all('/vendor_messages',checkLoginVendor,function(req, res) {
   
    var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	
	data.og_url=config.siteUrl+"vendor_messages";
    data.og_type="website";
	
	
     var user_id = req.session.userdata.user_id;
     var to_user_id = req.query.ritkn;
     var all_conversations = [];
     var crr_chat_data = {conversation_id:0,reciver_id:to_user_id,msg_data:[]};
     var count = 0;
    
     var callback = function(flag,index,results){
         count++;
         if(results.length>0){
			 
			  all_conversations[index].to_user_name = results[0].name;
		 
         var tmp = all_conversations[index].to_user_name.split(" ");
         if(tmp.length > 1){
             var fst = tmp[0].charAt(0).toUpperCase();
             var snd = tmp[1].charAt(0).toUpperCase();
             all_conversations[index].to_user_initials = fst+""+snd;
         }else{
             var fst = tmp[0].charAt(0).toUpperCase();
             all_conversations[index].to_user_initials = fst;
         }
			 
			 
		 }
		 
         if(count >= all_conversations.length){
             if(to_user_id != undefined){
                 var conversation_id = 0;
                 userService.runQuery("select id from conversation where (from_id = "+user_id+" and  to_id = "+mysql.escape(to_user_id)+") or from_id = "+mysql.escape(to_user_id)+" and to_id = "+user_id+" order by last_msg_on desc").then(function(rr){
                     if(rr.length > 0){
                         crr_chat_data.conversation_id = rr[0].id;
                         var sql_get_msg = "select * from messages where conversation_jd = "+crr_chat_data.conversation_id+" order by send_on desc limit 1500";
                         userService.runQuery(sql_get_msg).then(function(r){
                            
                             crr_chat_data.msg_data = r.reverse();
                             data.all_conversations = all_conversations;
                             data.crr_chat_data = crr_chat_data;
							 userService.runQuery("update messages set is_read = 1 where conversation_jd = "+crr_chat_data.conversation_id+" and to_user_id = "+user_id).then(function(r1){
								 res.render('front/vendor_message',{title: 'Prazar vendor dashboard',base_url:config.siteUrl,data:data});
							 }).catch(function(e1){
								 res.render('front/vendor_message',{title: 'Prazar vendor dashboard',base_url:config.siteUrl,data:data});
							 });
                         }).catch(function(e){
                             data.all_conversations = all_conversations;
                             data.crr_chat_data = crr_chat_data;
                             res.render('front/vendor_message',{title: 'Prazar vendor dashboard',base_url:config.siteUrl,data:data});
                            
                         });
                     }else{
                         data.all_conversations = all_conversations;
                         data.crr_chat_data = crr_chat_data;
                         res.render('front/vendor_message',{title: 'Prazar vendor dashboard',base_url:config.siteUrl,data:data});
                         
                     }
                 }).catch(function(er){
                     data.all_conversations = all_conversations;
                     data.crr_chat_data = crr_chat_data;
                     res.render('front/vendor_message',{title: 'Prazar vendor dashboard',base_url:config.siteUrl,data:data});
                     
                 })
             }else{
                 data.all_conversations = all_conversations;
                 data.crr_chat_data = crr_chat_data;
                 res.render('front/vendor_message',{title: 'Prazar vendor dashboard',base_url:config.siteUrl,data:data});
             }        
         }
     }
    
	var sql_check="select id from conversation where (from_id = "+user_id+" and  to_id ="+mysql.escape(to_user_id)+") or from_id ="+mysql.escape(to_user_id)+" and to_id = "+user_id+"";
	
	userService.runQuery(sql_check).then(function(rchek){
	
     if(rchek.length>0){
		 
		getAllConversation();
		 
	 }else{  //first time conversation
		 
		 if(to_user_id!=undefined && to_user_id!="" && to_user_id!=0){
		 
		 
		 var insert_q="INSERT INTO `conversation`(`from_id`, `to_id`) VALUES ('"+user_id+"',"+mysql.escape(to_user_id)+")";
		 userService.runQuery(insert_q).then(function(reinsert){
			 
			 
			 getAllConversation();
			 
			 
		   }).catch(function(e2){console.log(e2);
            data.all_conversations = all_conversations;
             data.crr_chat_data = crr_chat_data;
            res.render('front/vendor_message',{title: 'Prazar customer dashboard',base_url:config.siteUrl,data:data});
         
           });
		}else{
			
			getAllConversation();
			
		}	 
		 
	 }
	
    
	function getAllConversation(){
		
		
		  userService.runQuery("select * from  conversation where from_id = "+user_id+" or to_id = "+user_id+" order by last_msg_on desc limit 20").then(function(r){
         if(r.length>0){
             all_conversations = r;
             for(var i =0;i<r.length;i++){
                
                 if(user_id == r[i].from_id){
                     all_conversations[i].to_user_id = r[i].to_id; 
                 }else{
                     all_conversations[i].to_user_id = r[i].from_id; 
                 }
                 var sql = "select name from users where user_id = "+all_conversations[i].to_user_id;
                 userService.runQueryCallback(sql,i,callback);            
             }
         }else{console.log("c");
             data.all_conversations = all_conversations;
             data.crr_chat_data = crr_chat_data;
             res.render('front/vendor_message',{title: 'Prazar customer dashboard',base_url:config.siteUrl,data:data});
         }
        
     }).catch(function(e){console.log(e);
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('front/vendor_message',{title: 'Prazar customer dashboard',base_url:config.siteUrl,data:data});
         
     });
	 
	}
	
	
	
   }).catch(function(e1){console.log(e1);
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('front/vendor_message',{title: 'Prazar customer dashboard',base_url:config.siteUrl,data:data});
         
     });
   
});

/* vendor my account */
router.all('/vendor_my_account',checkLoginVendor,function(req, res) {
	
 var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories};

 data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
    data.og_url=config.siteUrl+"vendor_my_account";
    data.og_type="website";
 
 data.message=req.flash('message');	
	
 var vendor_id=req.session.userdata.user_id;	
	
	
  if(req.body.sub){ // post method
	
		
	var fname= req.body.fname;
	var lname= req.body.lname;
	var phone_no= req.body.phone_no;
	var company_name= req.body.company_name;
	var address= req.body.address;
	var db_user_pass= req.body.db_userp;
	var old_pass= req.body.old_pass ? req.body.old_pass :"";
	var new_pass= req.body.new_pass ? req.body.new_pass :"";
	
	var fullname=fname+" "+lname;
   
	 
	  
	 old_pass=String(old_pass);
	 new_pass=String(new_pass); 
	  
	
	var callback_final=function(flag,index,call_result){
	
	   if(call_result.length>0){
		   
	         var sql = "update vendor_account_detail set phone_no="+mysql.escape(phone_no)+",company_name="+mysql.escape(company_name)+",address="+mysql.escape(address)+" where user_id="+vendor_id+"";
	     }else{
	   
			 var sql="INSERT INTO `vendor_account_detail`(`user_id`, `company_name`, `phone_no`, `country`, `state`, `city`, `address`) VALUES ("+vendor_id+","+mysql.escape(company_name)+","+mysql.escape(phone_no)+",'','','',"+mysql.escape(address)+")";
	    }
		
       
         userService.runQuery(sql).then(function(result){
			
		  var sql1="UPDATE `users` SET `name`="+mysql.escape(fullname)+",`fname`="+mysql.escape(fname)+",`lname`="+mysql.escape(lname)+" WHERE user_id ="+vendor_id+"";
			 
		 userService.runQuery(sql1).then(function(result1){ 
			         //////
		            req.flash('message',"Details Updated successfully");				  
					res.redirect("/vendor_my_account");
      
			 }).catch(function (err3){  console.log(err3);
		         
					req.flash('message',"internal server error");				  
					res.redirect("/vendor_my_account");				  
           });	
	  		  
				  
         }).catch(function (err0){ console.log(err0);
		   req.flash('message',"internal server error");				  
		   res.redirect("/vendor_my_account");	
       });	

		
	}
	
	
	
	var callback=function(flag,index,call_back_result){
	
		  var sql_check="select user_id from vendor_account_detail where user_id="+vendor_id+"";
		
		   userService.runQueryCallback(sql_check,0,callback_final);
		
       }
	
	
	/* entry point */
	if(new_pass!=""){
		
		
		 var pass_arr = db_user_pass.split(";");	 
	     var salt_str=pass_arr[0];
			 
		   helpers.hashPassword1(old_pass,salt_str,function(err,hashed_pass){
		
			 
			   
			   if(db_user_pass==hashed_pass){
			        
				   
				    new_pass= new_pass.trim();
	  
	                var salt_str1= uniqid();
  
	                 helpers.hashPassword1(new_pass,salt_str1,function(err,hashed_pass1){
						 
						 
						 var sql_pass="update users set password='"+hashed_pass1+"' where user_id="+vendor_id+"";
						 
						 userService.runQueryCallback(sql_pass,0,callback);
	
	                 });
				   
				   
			    }else{
					
				   ////
			        req.flash('message',"Old Password Not Matched");				  
					res.redirect("/vendor_my_account");	
				
				}
			   
		
		   });
		
	  }else{
		  
		  var blank_arr=[];
		  
		  callback(false,0,blank_arr);
	 
	  }
		
		
	
	}else{ // get method
	
	
	     var sql = "select users.name,users.fname,users.lname,users.email,users.password,vendor_account_detail.* from users left join vendor_account_detail on users.user_id=vendor_account_detail.user_id where users.user_id="+vendor_id+"";
	
         userService.runQuery(sql).then(function(result){ 
		 
			  var detail=result[0];
			 
			  data.account_detail=detail;
			 
			 
	     var sql1 = "select store.store_name,store.phone_no as phn_no,store.paypal_email,store_bank_details.* from store left join store_bank_details on store.store_id=store_bank_details.store_id where store.vendor_id="+vendor_id+"";
	
         userService.runQuery(sql1).then(function(result1){ 
			 
			 data.bank_detail=result1[0];
			 
			 res.render('front/vendor_my_account',{title: 'Prazar vendor My account',base_url:config.siteUrl,data:data});	
		 
			}).catch(function (err1){ console.log(err1);
		    res.render('front/vendor_my_account',{title: 'Prazar vendor My account',base_url:config.siteUrl,data:data});	
       }); 
			 
			 
		 }).catch(function (err){ console.log(err);
		    res.render('front/vendor_my_account',{title: 'Prazar vendor My account',base_url:config.siteUrl,data:data});	
       });
	
  }
	
	
});

/* vendor bank detail update */
router.post('/vendor_bank_detail_save',checkLoginVendor,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	
	var user_id=req.session.userdata.user_id;		
	var table_id= req.body.bank_id;
	var bank_name= "";//req.body.bank_name;
	var account_no= "";//req.body.account_no;
	var ifsc_code= "" ; //req.body.ifsc_code;
	var bank_address= ""; //req.body.bank_address;
	var paypal_email= req.body.paypal_email;
	
	bank_address = bank_address.replace(/'/g, "''");
	bank_name = bank_name.replace(/'/g, "''");
	
	var sql1="UPDATE `store` SET `paypal_email`="+mysql.escape(paypal_email)+"  WHERE vendor_id="+user_id+"";
			 
	userService.runQuery(sql1).then(function(result1){ 
			
	var sql1="UPDATE `store_bank_details` SET `bank_name`="+mysql.escape(bank_name)+",`account_no`="+mysql.escape(account_no)+",`ifsc_code`="+mysql.escape(ifsc_code)+",`bank_address`="+mysql.escape(bank_address)+" WHERE id="+mysql.escape(table_id)+"";
			 
	userService.runQuery(sql1).then(function(result1){ 
			
		    data.message="paypal Details Saved Successfully";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
	}).catch(function (err2){  console.log(err2);
							 
		    res.send(JSON.stringify(data));
    });	
	}).catch(function (err1){  console.log(err21);
							 
		    res.send(JSON.stringify(data));
    });	  		  

});

/* vendor delete product */

router.post('/vendor_delete_account',checkLoginVendor,function(req, res) {
	
	var user_id=req.session.userdata.user_id;
	
    var sql = "update users set is_deleted=1,email=CONCAT(email,'del') where user_id="+mysql.escape(user_id)+"";
       
      userService.runQuery(sql).then(function(result){
		  
	var sql1 = "update product set is_active=0, is_deleted=1 where vendor_id="+mysql.escape(user_id)+"";
       
      userService.runQuery(sql1).then(function(result1){
		  
		  var response ={status:200,message:"Account deleted successfully",data:[]};
		  req.session.destroy();
		  res.send(JSON.stringify(response)); 
	
	}).catch(function (err1){ console.log(err1);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
	
	  }).catch(function (err){ console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
   
});

/* vendor order tracking */

router.all('/vendor_order_tracking',checkLoginVendor,function(req, res) {
	
   var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories};
   
   data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
    data.og_url=config.siteUrl+"vendor_order_tracking";
    data.og_type="website";
   
     var user_id=req.session.userdata.user_id;
	 var page = req.query.page ? req.query.page : 0;  
     var limit=20;
     var final_result=[];
	
	
   var sql_total = "SELECT orders.`id`  FROM `orders` inner join order_products on order_products.order_id=orders.id inner join product on product.product_id=order_products.product_id where order_products.order_status != 3 and order_products.order_status != 4 and product.vendor_id="+user_id+" group by orders.id";
   
   

	 userService.runQuery(sql_total).then(function(result){

      data.total=result.length; 		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	  data.limit=limit;
		
	  page=page*limit; 
		 
	  if (data.total <= limit) {
		 data.total_pages = 0;
		}
		 
		 
	  var sql_data = "SELECT orders.`id`,orders.`ship_fullname`, orders.`order_no`, orders.`order_date`, orders.`order_status`, orders.`order_total`, orders.`is_paid`, count(order_products.`id`) as order_products_count ,users.name as ordered_by FROM `orders` inner join order_products on order_products.order_id=orders.id inner join product on product.product_id=order_products.product_id inner join users on orders.customer_id = users.user_id where order_products.order_status != 3 and order_products.order_status != 4 and product.vendor_id="+user_id+"  group by orders.id order by orders.order_no desc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_data).then(function(result2){
	  
		 
	   data.show_str=""; 	
	   //data.show_str="showing "+page+" to "+ (result2.length+page) +" of "+data.total+" entries"; 	
		  
	   if(result2.length>0){
			  
		    
		   
		   var count=0;	
		   var ind=0;	
		   	  
		   var callback=function(flag,index,result_call){
			 
			   var fulfillment_status=0;
			   var vendor_order_total=0; 
			   
			   for(var j=0;j<result_call.length;j++){
			   
			       
			   
				   if(j==0){
				   
					   fulfillment_status=result_call[j]['order_status'];
					   
				   }else{
				   
					   if(fulfillment_status>result_call[j]['order_status']){
					   
						   fulfillment_status=result_call[j]['order_status'];
					   }
					   
				   }
				   
				    vendor_order_total += parseFloat(result_call[j]['item_total_price']);
				   
			     }
			   
			   result2[index]['fulfill_status']=fulfillment_status;
			   result2[index]['order_total']=vendor_order_total;
			   
			    if(fulfillment_status != 3 && fulfillment_status != 4){
			      final_result[ind]=result2[index];
				  ind++;
			   }
			   
			    count++;
			   
			  
			   
			   
			   if(count>=result2.length){
				   // final result first
				   var tmp = 0;
				   for(var i=0;i<final_result.length;i++){
					   for(var j=0;j<final_result.length-i-1;j++){
							if(final_result[j]['order_no']<final_result[j+1]['order_no'])
							{
								temp=final_result[j];
								final_result[j]=final_result[j+1];
								final_result[j+1]=temp;
							}
					   }
				   }
				   
				   // final_result['order_total_actual']=order_total_actual;
				 // console.log(final_result);
			        data.orders=final_result;
				   
		res.render('front/vendor_order_tracking',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});
			    }
			   
		   } 
		  
		  
		  //loop
		  for(var i=0;i<result2.length;i++){
			  
			  var time_stamp=parseInt(result2[i]['order_date']);
			  //console.log(result2[i]['order_no']);
			  result2[i]['order_date']=helpers.utcTimestampToLocalDate(time_stamp,'DD-MM-YYYY HH:mm');
		      
			  var order_id=result2[i]['id'];
			  
			  var sql_status="select order_products.product_id,order_products.order_status ,order_products.item_total_price  from order_products inner join product on product.product_id=order_products.product_id where product.vendor_id="+user_id+" and order_products.order_id="+order_id+"";
				 
			userService.runQueryCallback(sql_status,i,callback);
			  
			  
		   }
		  
	  }else{
	     
		   // final result second
		   data.orders=[];
		res.render('front/vendor_order_tracking',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});
	  
	     }
          

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	    res.render('front/vendor_order_tracking',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	    res.render('front/vendor_order_tracking',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});	

   });
	
	
});

/* vendor order detail */

router.all('/vendor_order_detail',checkLoginVendor,function(req, res) {
	
	
	var fulfillment_status=0;
	var order_total=0;
	var ship_total=0;
	var gift_total=0;
	
   var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,invoice_total:order_total,invoice_ship_total:ship_total,invoice_gift_total:gift_total};
   
   
   data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
   
	var tmp_success = req.flash("message_success")
	var tmp_err = req.flash("message_err")
	data.message_success = tmp_success[0];
	data.message_err = tmp_err[0];
   var user_id=req.session.userdata.user_id;
   var final_result=[];
	
   var order_no =req.query.order_no ? req.query.order_no :"";
	if(order_no==""){
	  res.redirect("/vendor_dashboard");
	}
	
	
	
	var sql_data = "SELECT users.name, orders.id,orders.ship_fullname,orders.order_no,orders.order_date, orders.order_total,orders.is_paid,orders.gift_wrap_total,orders.sub_total,orders.shipping_total,orders.ship_addr1,orders.ship_city,orders.ship_state,orders.ship_country,orders.ship_zip_code FROM orders inner join users on orders.customer_id=users.user_id where orders.order_no="+mysql.escape(order_no)+"";

	  userService.runQuery(sql_data).then(function(result2){
	    
		       var time_stamp=parseInt(result2[0]['order_date']);
			   result2[0]['order_date']=helpers.utcTimestampToLocalDate(time_stamp,'DD-MM-YYYY HH:mm A');
		       
		      result2[0].fullfill_status=fulfillment_status;
		  
		      data.order_detail=result2[0];
		   
		    var order_id=result2[0]['id'];
		  //order products
		  var sql_products = "SELECT order_products.*,product.product_name,orders.customer_id FROM `order_products`  inner join product on product.product_id=order_products.product_id inner join orders on orders.id=order_products.order_id where product.vendor_id="+user_id+" and order_products.order_id="+order_id+"";

	  userService.runQuery(sql_products).then(function(result3){
		  
		  var count=0;
		  
		  var callback_image=function(flag,index,result_img){
			 
				     result3[index]['images']= result_img[0];
				    
			         final_result[index]=result3[index];
			  
				     count++;
			  
			          /* fullfill status */
				      if(index==0){
				   
					     fulfillment_status= result3[index]['order_status'];
					   
				       }else{
				   
					    if(fulfillment_status> result3[index]['order_status']){
					   
						   fulfillment_status= result3[index]['order_status'];
					    }
					   
				      }
			  
			  
				    if(count>=result3.length){
						
					   //final result
						
						data.order_detail.fullfill_status=fulfillment_status;
						
                        data.invoice_total=order_total;
						data.invoice_ship_total=ship_total;
						data.invoice_gift_total=gift_total;

						
						data.order_products=final_result;//console.log(data);
						res.render('front/vendor_order_detail',{title: 'Prazar vendor order detail',base_url:config.siteUrl,data:data});	
					}
				 
			      }
			 
			 /* find images*/
			 for(var i=0;i<result3.length;i++){
			         
					
                result3[i].return_request_date = helpers.utcTimestampToLocalDate(result3[i].return_request_date,"DD-MM-YY");
                result3[i].return_action_date = helpers.utcTimestampToLocalDate(result3[i].return_action_date,"DD-MM-YY");
					
				/*customization*/
				
				  if(result3[i]['is_customizable']==1 && result3[i]['customization_data'] !=""){
					  var custom_data="";
							
						var customize_data=result3[i]['customization_data'];	
							
						var	customize_arr=customize_data.split("~");
						
						for(var k=0;k<customize_arr.length;k++){
							
							var arrr=customize_arr[k].split("##");
							
							if(arrr[1] !=""){
								custom_data +="<p>"+arrr[0]+" : "+arrr[1]+"</p>";
							}
							
						 }
						 
						 
						 result3[i]['customization_data']=custom_data;
						 
							
					}else{
						
						result3[i]['customization_data']="";
					}
					     
					 
					 
					 
					 
					 /*variations*/
						
						if(result3[i]['is_variable']==2){
							
							var variationdata=JSON.parse(result3[i]['variation_data']);
							var variations="";
							
								for (var k in variationdata){
								 if (variationdata.hasOwnProperty(k)) {
									 if(k=='color'){
										variations += " "+k+" :- <span style='height:15px;width: 15px;display:inline-block;background:"+variationdata[k]+";border-radius: 50px;position:relative;top:4px;'></span><br/>";
									 }else{
										 variations += " "+k+" :- "+variationdata[k]+"<br/>";
									 }
									
								  }
								}
								
								result3[i]['variation_data']="<p class='show_variants'>"+variations+"</p>";
						}
					 
					 
					 
				       /* total price calculate*/
						if(result3[i].code_value > 0 ){
						result3[i].price_total = parseFloat(result3[i].quantity) * (parseFloat(result3[i].unit_price - ((parseFloat(result3[i].code_value) * parseFloat(result3[i].unit_price)) / 100 )));
						}else{
						result3[i].price_total = parseFloat(result3[i].quantity) * parseFloat(result3[i].unit_price);
						}
				 
				       
				   
				        var product_id = result3[i]['product_id'];
				 
						var get_product_images = "select * from product_images where product_id = "+product_id+" limit 1";
				 
				       
					   /*invoice calculate*/
					   
					   var total_item_pric =parseFloat(result3[i]['item_total_price']);
					   var item_ship_price =parseFloat(result3[i]['item_ship_price']);
					   var gift_wrap_price =parseFloat(result3[i]['gift_wrap_price']);
					   
					   gift_wrap_price=gift_wrap_price*result3[i]['quantity'];
					   
					    order_total = order_total+total_item_pric;
	                    ship_total =ship_total+item_ship_price;
	                    gift_total =gift_total+gift_wrap_price;
				 
				 
				 
						userService.runQueryCallback(get_product_images,i,callback_image);
				 
			    }
		  
		  
		 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	   res.render('front/vendor_order_detail',{title: 'Prazar vendor order detail',base_url:config.siteUrl,data:data});	

   });  
		  
	  }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('front/vendor_order_detail',{title: 'Prazar vendor order detail',base_url:config.siteUrl,data:data});	

   });
	
	
	
});

/* vendor delete product */

router.post('/vendor_change_order_status',checkLoginVendor,function(req, res) {
	
	var user_id=req.session.userdata.user_id;
	var table_id=req.body.table_id;
	var order_status=req.body.order_status;
	var track_no=req.body.track_no ? req.body.track_no :"";
	var shipping_company_name=req.body.shipping_company_name ? req.body.shipping_company_name :"";

	var ship_date=helpers.getUtcTimestamp();
	
	var shipped_date=0;
	
	if(order_status==3){
	    shipped_date=ship_date;
	 }
	
	
	
    var sql = "update order_products set order_status="+mysql.escape(order_status)+",shipping_tracking_number="+mysql.escape(track_no)+",shipping_company_name="+mysql.escape(shipping_company_name)+",shipping_date= "+shipped_date+" where id="+mysql.escape(table_id)+"";
       
      userService.runQuery(sql).then(function(result){
			   
		  var response ={status:200,message:"Product order Status updated successfully",data:[]};
		  
		  res.send(JSON.stringify(response)); 
	
	  }).catch(function (err){ console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
   
});


/* vendor order history */

router.all('/vendor_order_history',checkLoginVendor,function(req, res) {
	
   var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories};
   
   
   data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
    data.og_url=config.siteUrl+"vendor_order_history";
    data.og_type="website";
   var user_id=req.session.userdata.user_id;
	 var page = req.query.page ? req.query.page : 0;  
     var limit=20;
     var final_result=[];
	
	
    var sql_total = "SELECT orders.`id`  FROM `orders` inner join order_products on order_products.order_id=orders.id inner join product on product.product_id=order_products.product_id where (order_products.order_status = 3 or order_products.order_status = 4) and product.vendor_id="+user_id+" group by orders.id";

	 userService.runQuery(sql_total).then(function(result){

      data.total=result.length; 		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	  data.limit=limit;
		 
	  page=page*limit; 
		 
		if(data.total <= limit){
			data.total_pages=0;
		} 
		 
	  var sql_data = "SELECT orders.`id`,orders.`ship_fullname`, orders.`order_no`, orders.`order_date`, orders.`order_status`, orders.`order_total`, orders.`is_paid`, count(order_products.`id`) as order_products_count, order_products.is_return,users.name as customer_name FROM `orders` inner join order_products on order_products.order_id=orders.id inner join product on product.product_id=order_products.product_id inner join users on orders.customer_id = users.user_id where (order_products.order_status = 3 or order_products.order_status = 4) and product.vendor_id="+user_id+" group by orders.id order by orders.order_no desc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_data).then(function(result2){
		  
	   if(result2.length>0){
		   
		   var count=0;	
		   var ind = 0;	
           	   
		   var callback=function(flag,index,result_call){
			 
			   var fulfillment_status=0;	
			   var vendor_order_total=0; 
			   
			  
			   
			   for(var j=0;j<result_call.length;j++){
			    
				   if(j==0){
				   
					   fulfillment_status=result_call[j]['order_status'];
					   
				   }else{
				   
						   fulfillment_status=result_call[j]['order_status'];
						
				   }
				   
				   vendor_order_total += parseFloat(result_call[j]['item_total_price']);
				   
				 
			     }
			   
			    result2[index]['fulfill_status']=fulfillment_status;
			    result2[index]['order_total']=vendor_order_total;
				
				
				
			   if(fulfillment_status == 3 || fulfillment_status == 4){
			      final_result[ind]=result2[index];
				  ind++;
			   }
			   
			    count++;
			   
			   if(count>=result2.length){
				  
				    //data.show_str="showing "+page+" to "+ (final_result.length) +" of "+data.total+" entries"; 
				    data.show_str=""; 
				   var tmp = 0;
				   for(var i=0;i<final_result.length;i++){
					   for(var j=0;j<final_result.length-i-1;j++){
							if(final_result[j]['order_no']<final_result[j+1]['order_no'])
							{
								temp=final_result[j];
								final_result[j]=final_result[j+1];
								final_result[j+1]=temp;
							}
					   }
				   }
				   // final result first
			        data.orders=final_result;
					
		res.render('front/vendor_order_history',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});
			    }
			   
		   } 
		  
		  
		  //loop
		  for(var i=0;i<result2.length;i++){
			 
			  var time_stamp=parseInt(result2[i]['order_date']);
			  
			  result2[i]['order_date']=helpers.utcTimestampToLocalDate(time_stamp,'DD-MM-YYYY HH:mm');
		      
			  var order_id=result2[i]['id'];
			  
			  var sql_status="select order_products.order_id,order_products.product_id,order_products.order_status,order_products.item_total_price from order_products inner join product on product.product_id=order_products.product_id where product.vendor_id="+user_id+" and (order_products.order_status=3 or order_products.order_status=4) and order_products.order_id="+order_id+"";
				 
			userService.runQueryCallback(sql_status,i,callback);
			  
			  
		   }
		  
	  }else{
	     
		   // final result second
		  
		  data.show_str="showing "+page+" to "+ (final_result.length+page) +" of "+0+" entries"; 	
		   data.orders=[];
		res.render('front/vendor_order_history',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});
	  
	     }
          

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	    res.render('front/vendor_order_history',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	    res.render('front/vendor_order_history',{title: 'Prazar vendor order tracking',base_url:config.siteUrl,data:data});	

   });
	
	
});



/* vendor transaction history */


router.all('/vendor_transaction_history',checkLoginVendor,function(req, res) {
	
   var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories};
   
    data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
   
    data.og_url=config.siteUrl+"vendor_transaction_history";
    data.og_type="website";
   
   
   var user_id=req.session.userdata.user_id;
	 var page = req.query.page ? req.query.page : 0;  
     var limit=20;
     var final_result=[];
	
	
   var sql_total = "SELECT transections.amount FROM `orders` inner join transections on orders.id=transections.order_id inner join product on product.product_id=transections.product_id WHERE transections.vendor_id="+user_id+"";

	 userService.runQuery(sql_total).then(function(result){

      data.total=result.length; 		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	  data.limit=limit;
		 
	  page=page*limit; 
	  
	  if(data.total <= limit){
		  data.total_pages =0;
	  }
	  
	  var sql_data = "SELECT users.name,transections.amount,transections.transaction_type,transections.commision_amount, orders.order_no,orders.order_date,orders.transection_id,orders.ship_fullname ,product.product_name FROM `orders` inner join transections on orders.id=transections.order_id inner join product on product.product_id=transections.product_id inner join users on orders.customer_id=users.user_id  WHERE transections.vendor_id="+user_id+"  order by orders.order_no desc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_data).then(function(result2){
	 
		 
	   data.show_str="showing "+page+" to "+ (result2.length+page) +" of "+data.total+" entries"; 	
		  
	   if(result2.length>0){
			  
	
	
		  
		  //loop
		  for(var i=0;i<result2.length;i++){
			  
			  var time_stamp=parseInt(result2[i]['order_date']);
			  
			  result2[i]['order_date']=helpers.utcTimestampToLocalDate(time_stamp,'DD-MM-YYYY HH:mm');
		      
			  var order_id=result2[i]['id'];
		   }
		  
		//  console.log(result2);
		  //final second
         data.transactions=result2;
		 
		 res.render('front/vendor_transaction_history',{title: 'Prazar vendor sale history',base_url:config.siteUrl,data:data});
		  
		  
	  }else{
	     
		   // final result second
		   data.transactions=[];
		res.render('front/vendor_transaction_history',{title: 'Prazar vendor sale history',base_url:config.siteUrl,data:data});
	  
	     }
          

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	    res.render('front/vendor_transaction_history',{title: 'Prazar vendor sale history',base_url:config.siteUrl,data:data});

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('front/vendor_transaction_history',{title: 'Prazar vendor sale history',base_url:config.siteUrl,data:data});

   });
	
	
});


/* vendor refund success*/
router.all('/refunded',checkLoginVendor,function(req, res) {
	
	var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"refunded";
    data.og_type="website";
	var order_product_id=req.query.opi;
	
	if(order_product_id){
	
	 var sql = "SELECT orders.ship_fullname,orders.order_no,orders.transection_id,transections.*,store.paypal_email,order_products.quantity,product.product_name,orders.customer_id FROM `order_products` inner join orders on orders.id=order_products.order_id inner join transections on order_products.order_id=transections.order_id inner join store on transections.vendor_id=store.vendor_id inner join product on product.product_id=order_products.product_id WHERE order_products.id="+mysql.escape(order_product_id)+" and (transections.transaction_type=1 or transections.transaction_type=2)";

	 userService.runQuery(sql).then(function(result){
		 
		 
		 if(result.length == 0){
			 
			 res.redirect("/vendor_dashboard");
		 }
		 
		 var customer_id=result[0].customer_id;
		 
		 var sql_customer="select name from users where user_id='"+customer_id+"'";
		 
		  userService.runQuery(sql_customer).then(function(result_customer){
			 
          result[0].ship_fullname=result_customer[0]['name'];
			 
		  result[0].transaction_date = helpers.utcTimestampToLocalDate(result[0].transaction_date,"DD-MM-YY HH:mm A");
		 
		  var vendor_amount=parseFloat(result[0]['amount']);
		  var commision_amount=parseFloat(result[0]['commision_amount']);
		   
		  var refund_amt= vendor_amount+commision_amount;
		   
		  result[0].refunded_amt=refund_amt;
		   
		  data.refund_detail=result[0];
		 
		 res.render('front/vendor_refund_success.html',{title: 'Prazar vendor refunded',base_url:config.siteUrl,data:data});
		 
		}).catch(function (err1) { console.log(err1);
          res.render('front/vendor_refund_success.html',{title: 'Prazar vendor refunded',base_url:config.siteUrl,data:data});
        
       }); 
		 
		 
	   }).catch(function (err) { console.log(err);
          res.render('front/vendor_refund_success.html',{title: 'Prazar vendor refunded',base_url:config.siteUrl,data:data});
        
       });

	
		
	}else{
		
		res.redirect("/vendor_dashboard");
	}
	
	
});


/* vendor refund payment*/

router.post('/vendor_refund',checkLoginVendor,function(req, res) {
	
	var Paypal = require('paypal-adaptive');
 
    var data={status:500,message:"internal server error",data:[]};
	
    var today_time=helpers.getUtcTimestamp();
	
	var order_product_id=req.body.or_pro_id;
	var pro_id=req.body.pro_id;
	
	 var sql = "SELECT orders.ship_fullname,orders.order_no,orders.customer_id,orders.transection_id,transections.*,store.paypal_email,order_products.quantity,order_products.return_reason_type,order_products.item_ship_price FROM `order_products` inner join orders on orders.id=order_products.order_id inner join transections on order_products.id=transections.order_product_id inner join store on transections.vendor_id=store.vendor_id WHERE order_products.id="+mysql.escape(order_product_id)+" and transections.transaction_type=0";

	 userService.runQuery(sql).then(function(result){

       if(result.length>0){
		   
		   
		   var return_reason_type=result[0]['return_reason_type'];
		   var item_ship_price=parseFloat(result[0]['item_ship_price']);
		   var transection_id=result[0]['transection_id'];
		   var pro_quantity=result[0]['quantity'];
		   var order_id=result[0]['order_id'];
		   var vendor_id=result[0]['vendor_id'];
		   var customer_id=result[0]['customer_id'];
		   var product_id=result[0]['product_id'];
		   var paypal_email=result[0]['paypal_email'];
		   var order_no=result[0]['order_no'];
		   var vendor_amount=parseFloat(result[0]['amount']);
		   var commision_amount=parseFloat(result[0]['commision_amount']);
		   var refund_amt= vendor_amount+commision_amount;
		   
		  // console.log("item_ship_price "+item_ship_price);
		  // console.log("total order amnt  "+refund_amt);
		  // console.log("amount to be refund  "+(refund_amt-item_ship_price));
		  // console.log("amount of admin  "+commision_amount);
		  // console.log("amount of vendor_amount  "+vendor_amount);
		  
		   if(return_reason_type == 2){  // change of mind
			  
			   refund_amt=refund_amt-item_ship_price;
			   
			  var admin_percent = (commision_amount*100)/(vendor_amount+commision_amount);
			
			  var admin_ship_price = (item_ship_price*admin_percent)/100;
			  var vendor_ship_price =item_ship_price-admin_ship_price;
			  vendor_amount=vendor_amount-vendor_ship_price;
			  
			  vendor_amount = vendor_amount.toFixed(2);
			  
			// console.log("admin_percent "+admin_percent);
		     //console.log("admin_ship_price  "+admin_ship_price);
		     //console.log("vendor_ship_price "+vendor_ship_price);
		     
		   }else{
			   vendor_amount = vendor_amount.toFixed(2);
		   }
		   
		   refund_amt = refund_amt.toFixed(2);
		  
		   
		  // console.log("vendor_amount "+vendor_amount);
		 
		   var paypalSdk = new Paypal({
					userId:config.paypal_user_id,
					password:config.paypal_password,
					signature:config.paypal_signature,
					sandbox:true //defaults to false
				});

				var payload = {
				requestEnvelope: {
					errorLanguage:  'en_US'
				},
				currencyCode:   'AUD',
				receiverList: {
					receiver:[{email:config.paypal_primary_reciever,amount:refund_amt,primary:'true'},
					{email:paypal_email,amount:vendor_amount,primary:'false'}]
				   },
				 payKey:transection_id  
				};
			 
			 
				paypalSdk.refund(payload, function (err, response) {
					
				if (err) {
					
					    // err to refund
				        console.log("refund err"+err);
					  
				        console.log(JSON.stringify(response));
				        
					  	data.message="Paypal server error refund not created ";
						
					    res.send(JSON.stringify(data)); 	
						
						
				}else {
					
				  console.log("refund response "+JSON.stringify(response));
				  
				  var refund_status=response.refundInfoList.refundInfo[0].refundStatus;
				  
				   if(refund_status == 'REFUNDED'){  //success refund from paypal
					   
					   
					     //update status of order product
					    var sql1 = "update order_products set is_return=2,order_status=4 where id="+order_product_id;

						userService.runQuery(sql1).then(function(result1){
							 
						//insert in to transecton for refund 
					    var sql2 = "INSERT INTO `transections`(`order_product_id`,`order_id`,`vendor_id`, `customer_id`, `product_id`, `amount`, `commision_amount`, `transaction_type`,`transaction_date`) VALUES ('"+order_product_id+"','"+order_id+"','"+vendor_id+"','"+customer_id+"','"+product_id+"','"+refund_amt+"','0','1',"+today_time+")"

						 userService.runQuery(sql2).then(function(result2){
							
                            
						//update inventory 
					    var sql3 = "update product set quantity=quantity+"+pro_quantity+",quantity_soled=quantity_soled-"+pro_quantity+",quantity_remaining=quantity_remaining+"+pro_quantity+" where product_id="+product_id;

					
						
						 userService.runQuery(sql3).then(function(result3){
							 
							 /*** START PROCESSED MAIL***/
							 
							 
							 
			var sql2="select store.store_name,users.email from store inner join users on store.vendor_id = users.user_id where store.store_id = (select store_id from product where product_id = (select product_id from order_products where id="+mysql.escape(order_product_id)+"))";
				 
			
		    userService.runQuery(sql2).then(function(result2){
				
				if(result2.length>0){
					
					var store_name=result2[0]['store_name'];
					var store_email=result2[0]['email'];
					
					var subject="Prazar- Refund Declined";
					
                    var url=config.siteUrl+"login"; 
					
					var product_sql = "select product.product_name,order_products.product_id, order_products.unit_price, order_products.quantity,orders.customer_id,orders.order_no,orders.order_date,orders.ship_fullname,orders.ship_addr1,orders.ship_city,orders.ship_state,orders.ship_country,orders.ship_zip_code from order_products inner join orders on order_products.order_id = orders.id inner join product on order_products.product_id =  product.product_id where order_products.id = "+order_product_id;
					
					userService.runQuery(product_sql).then(function(result3){
						var customer_id = result3[0]['customer_id'];
						var order_no = result3[0]['order_no'];
						var order_date = helpers.utcTimestampToLocalDate(result3[0]['order_date'],"DD-MM-YY");
						var product_name = result3[0]['product_name'];
						var unit_price = result3[0]['unit_price'];
						var quantity = result3[0]['quantity'];
						var product_id = result3[0]['product_id'];
						var ship_fullname = result3[0]['ship_fullname'];
						var shipping_address = result3[0]['ship_addr1']+", "+result3[0]['ship_city']+", "+result3[0]['ship_state']+", "+result3[0]['ship_country']+", "+result3[0]['ship_zip_code'];
						var sql_product_img = "select image_url from product_images where product_id = "+product_id+" limit 1";
						userService.runQuery(sql_product_img).then(function(result4){
							var image_url = result4[0]['image_url'];
							
							var sql_customer_data = "select * from users where user_id = "+customer_id;
							userService.runQuery(sql_customer_data).then(function(result5){
								var customer_name = result5[0]['name'];
								var customer_email = result5[0]['email'];
								
								
								var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style><!--[if (gte mso 9)|(IE)]> <style type="text/css"> table{border-collapse: collapse !important;}</style><![endif]--> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > </table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/img/logo.png" alt="prazar" width="168" height="48" style="border-width:0;max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > </table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr class="blankElement"> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr class="orderConfirmation"> <td align="center"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>RETURNS REQUEST PROCESSED </strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Hi '+customer_name+'</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Your recent return request relating to order number '+order_no+' has been processed by the vendor. <br/>Please refer to the returns section My Orders Tab on your Prazar dashboard for more information.<br/>or by clicking on the link below. </p><br><a target="_blank" href="'+config.siteUrl+'order_single?oi='+order_no+'">Click here</a><br><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can also access this by clicking on the link below.</p><br><a href="'+config.siteUrl+'login" target="_blank">'+config.siteUrl+'login</a><br><p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">If the issue still cannot be resolved please contact us at info@prazar.com.au <br> Please see details of your return request below.</p> </td></tr><tr> <td> <table class="shippingHeader" cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td> <p style="margin: 0; padding-bottom: 4px;"><strong>STATUS: </strong>PROCESSED</p><p style="margin: 0; padding-bottom: 4px;"><strong>DATE PLACED: </strong>'+order_date+'</p><p><strong>ORDER NUMBER: </strong>'+order_no+' </p><p><strong>CONTACT NAME: </strong>'+ship_fullname+' </p></td><td style="text-align: right;"> <p><strong>SHIPPING ADDRESS</strong> <br>'+shipping_address+' </p></td></tr></table> </td></tr><tr> <td> <div class="table-responsive productListMain"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr class="productShopName"> <td colspan="6">by The '+store_name+'</td></tr><tr class="productList"> <td> <img src="'+config.siteUrl+'products/'+image_url+'" style="width: 50px; height: 50px"> </td><td> <strong>'+product_name+'</strong> </td><td style="min-width: 60px">Qty: '+quantity+'</td><td>$'+unit_price+'</td></tr></table> </div></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%" class="footerMain"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
									
								helpers.sendMailSales(customer_email,htmlmsg,"",subject,function(flag1,msg1,send_res1){ 

								});
								
							}).catch(function(er5){
								res.send(JSON.stringify(data));
							});
							
						}).catch(function(er4){
							res.send(JSON.stringify(data));
						})
						
					}).catch(function(er3){
						res.send(JSON.stringify(data));
					});
			
			
				}
				}).catch(function(ee){
					 res.send(JSON.stringify(data));
				});
							 
							 
							 /*** END PROCESSED MAIL***/
							 
						  var refund_status_msg=response.refundInfoList.refundInfo[0].refundStatus; 
							 
							//final success
					        data.status=200;
					        data.message=refund_status_msg;
					        data.data=response;
					        data.data.order_product_id=order_product_id
					        res.send(JSON.stringify(data));
							 
							 
						 }).catch(function (err3) { console.log(err3);

							 res.send(JSON.stringify(data));
						});
							 
							 
						 }).catch(function (err2) { console.log(err2);

							 res.send(JSON.stringify(data));
						});
							 
							 
							 
						 }).catch(function (err1) { console.log(err1);

							 res.send(JSON.stringify(data));
						});
						
					  
					   
					   
				   }else{   //failed refund from paypal
					   
					  
					   var refund_status_msg=response.refundInfoList.refundInfo[1].refundStatus;      
					   data.status=201;
					   data.message=refund_status_msg;
					   data.data=response;
					   res.send(JSON.stringify(data));
					   
				   }
				  
				
				}
				});
		   
		   
	   }else{
		   
		    res.send(JSON.stringify(data));
		   
	     }

	 }).catch(function (err) { console.log(err);

         res.send(JSON.stringify(data));
   });
	
		
	
});

/* ORDER CANCELLED BY VENDOR */
router.all('/cancel_order',checkLoginVendor,function(req, res) {
	
	var Paypal = require('paypal-adaptive');
 
    var data={status:500,message:"internal server error",data:[]};
	
    var today_time=helpers.getUtcTimestamp();
	
	var order_product_id=req.query.or_pro;
	var pro_id=req.query.pro;
	var ono=req.query.ono;
	
	 var sql = "SELECT orders.ship_fullname,orders.order_no,orders.customer_id,orders.transection_id,transections.*,store.paypal_email,order_products.quantity FROM `order_products` inner join orders on orders.id=order_products.order_id inner join transections on order_products.id=transections.order_product_id inner join store on transections.vendor_id=store.vendor_id WHERE order_products.id="+mysql.escape(order_product_id)+" and transections.transaction_type=0";

	 console.log("sql  -- "+sql);
	 
	 userService.runQuery(sql).then(function(result){

       if(result.length>0){
		   
		   
		   var transection_id=result[0]['transection_id'];
		   var pro_quantity=result[0]['quantity'];
		   var order_id=result[0]['order_id'];
		   var vendor_id=result[0]['vendor_id'];
		   var customer_id=result[0]['customer_id'];
		   var product_id=result[0]['product_id'];
		   var paypal_email=result[0]['paypal_email'];
		   var order_no=result[0]['order_no'];
		   var vendor_amount=parseFloat(result[0]['amount']);
		   var commision_amount=parseFloat(result[0]['commision_amount']);
		   
		   var refund_amt= vendor_amount+commision_amount;
		   
		   refund_amt = refund_amt.toFixed(2);
		   vendor_amount = vendor_amount.toFixed(2);
		   
		   var paypalSdk = new Paypal({
					userId:config.paypal_user_id,
					password:config.paypal_password,
					signature:config.paypal_signature,
					sandbox:true //defaults to false
				});

				var payload = {
				requestEnvelope: {
					errorLanguage:  'en_US'
				},
				currencyCode:   'AUD',
				receiverList: {
					receiver:[{email:config.paypal_primary_reciever,amount:refund_amt,primary:'true'},
					{email:paypal_email,amount:vendor_amount,primary:'false'}]
				   },
				 payKey:transection_id  
				};
			 
			 
				paypalSdk.refund(payload, function (err, response) {
					
				if (err) {
					
					    // err to refund
				        console.log("refund err"+err);
					  
				        console.log(JSON.stringify(response));
				        
					  	data.message="Paypal server error refund not created ";
						
					    res.redirect("/vendor_order_detail?order_no="+ono);	
						
						
				}else {
					
				  console.log("refund response "+JSON.stringify(response));
				  
				  var refund_status=response.refundInfoList.refundInfo[0].refundStatus;
				  
				   if(refund_status == 'REFUNDED'){  //success refund from paypal
					   
					   
					     //update status of order product
					    var sql1 = "update order_products set is_return=4,order_status=4 where id="+mysql.escape(order_product_id)+"";

						userService.runQuery(sql1).then(function(result1){
							 
						//insert in to transecton for refund 
					    var sql2 = "INSERT INTO `transections`(`order_product_id`,`order_id`,`vendor_id`, `customer_id`, `product_id`, `amount`, `commision_amount`, `transaction_type`,`transaction_date`) VALUES ("+mysql.escape(order_product_id)+",'"+order_id+"','"+vendor_id+"','"+customer_id+"','"+product_id+"','"+refund_amt+"','0','2',"+today_time+")"

						 userService.runQuery(sql2).then(function(result2){
							
                            
						//update inventory 
					    var sql3 = "update product set quantity=quantity+"+pro_quantity+",quantity_soled=quantity_soled-"+pro_quantity+",quantity_remaining=quantity_remaining+"+pro_quantity+" where product_id="+product_id;

					
						
						 userService.runQuery(sql3).then(function(result3){
							 
						  var refund_status_msg=response.refundInfoList.refundInfo[0].refundStatus; 
							 
							//final success
					        data.status=200;
					        data.message=refund_status_msg;
					        data.data=response;
					        data.data.order_product_id=order_product_id;
							req.flash('message_success',refund_status_msg);
							res.redirect("/vendor_order_detail?order_no="+ono);
							 
						 }).catch(function (err3) { console.log(err3);
							req.flash('message_err',"Some thing went wrong, please try again later");
							 res.redirect("/vendor_order_detail?order_no="+ono);
						});
							 
							 
						 }).catch(function (err2) { console.log(err2);
							req.flash('message_err',"Some thing went wrong, please try again later");
							 res.redirect("/vendor_order_detail?order_no="+ono);
						});
							 
							 
							 
						 }).catch(function (err1) { console.log(err1);
							req.flash('message_err',"Some thing went wrong, please try again later");
							 res.redirect("/vendor_order_detail?order_no="+ono);
						});
						
					  
					   
					   
				   }else{   //failed refund from paypal
					   
					  
					   var refund_status_msg=response.refundInfoList.refundInfo[1].refundStatus;      
					   data.status=201;
					   data.message=refund_status_msg;
					   data.data=response;
					   req.flash('message_err',refund_status_msg);
					   res.redirect("/vendor_order_detail?order_no="+ono);
					   
				   }
				  
				
				}
				});
		   
		   
	   }else{
		   req.flash('message_err',"Some thing went wrong, please try again later");
			res.redirect("/vendor_order_detail?order_no="+ono);
		   
	     }

	 }).catch(function (err) { console.log(err);
		req.flash('message_err',"Some thing went wrong, please try again later");	
         res.redirect("/vendor_order_detail?order_no="+ono);
   });
	
		
	
});


router.post('/vendor_refund_cancel',checkLoginVendor,function(req, res) {
	
	var data={status:500,message:"internal server error",data:[]};
	
    var today_time=helpers.getUtcTimestamp();
	
	var order_pro_id=req.body.or_pro_id;
	var pro_id=req.body.pro_id;
	var cancel_reason=req.body.cancel_reason;
	
	cancel_reason=helpers.htmlEntities(cancel_reason) ;
	cancel_reason = cancel_reason.replace(/'/g, "''");
	
	
	 //update
	var sql1="UPDATE `order_products` SET `is_return`='3',`cancel_reason`="+mysql.escape(cancel_reason)+",return_action_date="+today_time+" where id ="+mysql.escape(order_pro_id)+"";
				 
			
		userService.runQuery(sql1).then(function(result1){ 
		
			
			
			var sql2="select store.store_name,users.email from store inner join users on store.vendor_id = users.user_id where store.store_id = (select store_id from product where product_id = (select product_id from order_products where id="+mysql.escape(order_pro_id)+"))";
				 
			
		    userService.runQuery(sql2).then(function(result2){
				
				if(result2.length>0){
					
					var store_name=result2[0]['store_name'];
					var store_email=result2[0]['email'];
					
					var subject="Prazar- Refund Declined";
					
                    var url=config.siteUrl+"login"; 
					
					var product_sql = "select product.product_name,order_products.product_id, order_products.unit_price, order_products.quantity,orders.customer_id,orders.order_no,orders.order_date,orders.ship_fullname,orders.ship_addr1,orders.ship_city,orders.ship_state,orders.ship_country,orders.ship_zip_code from order_products inner join orders on order_products.order_id = orders.id inner join product on order_products.product_id =  product.product_id where order_products.id = "+order_pro_id;
					
					userService.runQuery(product_sql).then(function(result3){
						var customer_id = result3[0]['customer_id'];
						var order_no = result3[0]['order_no'];
						var order_date = helpers.utcTimestampToLocalDate(result3[0]['order_date'],"DD-MM-YY");
						var product_name = result3[0]['product_name'];
						var unit_price = result3[0]['unit_price'];
						var quantity = result3[0]['quantity'];
						var product_id = result3[0]['product_id'];
						var ship_fullname = result3[0]['ship_fullname'];
						var shipping_address = result3[0]['ship_addr1']+", "+result3[0]['ship_city']+", "+result3[0]['ship_state']+", "+result3[0]['ship_country']+", "+result3[0]['ship_zip_code'];
						var sql_product_img = "select image_url from product_images where product_id = "+product_id+" limit 1";
						userService.runQuery(sql_product_img).then(function(result4){
							var image_url = result4[0]['image_url'];
							
							var sql_customer_data = "select * from users where user_id = "+customer_id;
							userService.runQuery(sql_customer_data).then(function(result5){
								var customer_name = result5[0]['name'];
								var customer_email = result5[0]['email'];
								
								
								var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style><!--[if (gte mso 9)|(IE)]> <style type="text/css"> table{border-collapse: collapse !important;}</style><![endif]--> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > </table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/img/logo.png" alt="prazar" width="168" height="48" style="border-width:0;max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > </table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr class="blankElement"> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr class="orderConfirmation"> <td align="center"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>RETURNS REQUEST DECLINED </strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Hi '+customer_name+'</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Your recent return request relating to order number '+order_no+' has been declined by the vendor. <br/>Please refer to the returns section My Orders Tab on your Prazar dashboard for more information.<br/>or by clicking on the link below. </p><br><a target="_blank" href="'+config.siteUrl+'order_single?oi='+order_no+'">Click here</a><br><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can also access this by clicking on the link below.</p><br><a href="'+config.siteUrl+'login" target="_blank">'+config.siteUrl+'login</a><br><p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">If the issue still cannot be resolved please contact us at info@prazar.com.au <br> Please see details of your return request below.</p> </td></tr><tr> <td> <table class="shippingHeader" cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td> <p style="margin: 0; padding-bottom: 4px;"><strong>STATUS: </strong>DECLINED</p><p style="margin: 0; padding-bottom: 4px;"><strong>DATE PLACED: </strong>'+order_date+'</p><p><strong>ORDER NUMBER: </strong>'+order_no+' </p><p><strong>CONTACT NAME: </strong>'+ship_fullname+' </p></td><td style="text-align: right;"> <p><strong>SHIPPING ADDRESS</strong> <br>'+shipping_address+' </p></td></tr></table> </td></tr><tr> <td> <div class="table-responsive productListMain"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr class="productShopName"> <td colspan="6">by The '+store_name+'</td></tr><tr class="productList"> <td> <img src="'+config.siteUrl+'products/'+image_url+'" style="width: 50px; height: 50px"> </td><td> <strong>'+product_name+'</strong> </td><td style="min-width: 60px">Qty: '+quantity+'</td><td>$'+unit_price+'</td></tr></table> </div></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%" class="footerMain"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
									
								helpers.sendMailSales(customer_email,htmlmsg,"",subject,function(flag1,msg1,send_res1){ 

								});
								
							}).catch(function(er5){
								res.send(JSON.stringify(data));
							});
							
						}).catch(function(er4){
							res.send(JSON.stringify(data));
						})
						
					}).catch(function(er3){
						res.send(JSON.stringify(data));
					});
			
			
				}
				}).catch(function(ee){
					 res.send(JSON.stringify(data));
				});
				data.message="return item request canceled successfully";
				data.status=200;
				data.data=[];
				res.send(JSON.stringify(data));  
				
			 }).catch(function (err2){  
		       res.send(JSON.stringify(data));
           });	
	
	
});


router.post('/vendor_refund_accept',checkLoginVendor,function(req, res) {
	
	var data={status:500,message:"internal server error",data:[]};
	
    var today_time=helpers.getUtcTimestamp();
	
	var order_pro_id=req.body.or_pro_id;
	var pro_id=req.body.pro_id;
	var cancel_reason=req.body.cancel_reason;
	
	cancel_reason=helpers.htmlEntities(cancel_reason) ;
	cancel_reason = cancel_reason.replace(/'/g, "''");
	
	
	 //update
	var sql1="UPDATE `order_products` SET `is_return`='5',`cancel_reason`="+mysql.escape(cancel_reason)+",return_action_date="+today_time+" where id ="+mysql.escape(order_pro_id)+"";
				 
			
		userService.runQuery(sql1).then(function(result1){ 
		
		
		
			
			var sql2="select store.store_name,users.email from store inner join users on store.vendor_id = users.user_id where store.store_id = (select store_id from product where product_id = (select product_id from order_products where id="+mysql.escape(order_pro_id)+"))";
				 
			
		    userService.runQuery(sql2).then(function(result2){
				
				if(result2.length>0){
					
					var store_name=result2[0]['store_name'];
					var store_email=result2[0]['email'];
					
					var subject="Prazar- Refund Approved";
					
                    var url=config.siteUrl+"login"; 
					
					var product_sql = "select product.product_name,order_products.product_id, order_products.unit_price, order_products.quantity,orders.customer_id,orders.order_no,orders.order_date,orders.ship_fullname,orders.ship_addr1,orders.ship_city,orders.ship_state,orders.ship_country,orders.ship_zip_code from order_products inner join orders on order_products.order_id = orders.id inner join product on order_products.product_id =  product.product_id where order_products.id = "+order_pro_id;
					
					userService.runQuery(product_sql).then(function(result3){
						var customer_id = result3[0]['customer_id'];
						var order_no = result3[0]['order_no'];
						var order_date = helpers.utcTimestampToLocalDate(result3[0]['order_date'],"DD-MM-YY");
						var product_name = result3[0]['product_name'];
						var unit_price = result3[0]['unit_price'];
						var quantity = result3[0]['quantity'];
						var product_id = result3[0]['product_id'];
						var ship_fullname = result3[0]['ship_fullname'];
						var shipping_address = result3[0]['ship_addr1']+", "+result3[0]['ship_city']+", "+result3[0]['ship_state']+", "+result3[0]['ship_country']+", "+result3[0]['ship_zip_code'];
						var sql_product_img = "select image_url from product_images where product_id = "+product_id+" limit 1";
						userService.runQuery(sql_product_img).then(function(result4){
							var image_url = result4[0]['image_url'];
							
							var sql_customer_data = "select * from users where user_id = "+customer_id;
							userService.runQuery(sql_customer_data).then(function(result5){
								var customer_name = result5[0]['name'];
								var customer_email = result5[0]['email'];
								
								
								var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style><!--[if (gte mso 9)|(IE)]> <style type="text/css"> table{border-collapse: collapse !important;}</style><![endif]--> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > </table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/img/logo.png" alt="prazar" width="168" height="48" style="border-width:0;max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > </table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr class="blankElement"> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr class="orderConfirmation"> <td align="center"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>RETURNS REQUEST APPROVED </strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Hi '+customer_name+'</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Your recent return request relating to order number '+order_no+' has been approved by the vendor. <br/>Please refer to the returns section My Orders Tab on your Prazar dashboard for more information.<br/>or by clicking on the link below. </p><br><a target="_blank" href="'+config.siteUrl+'order_single?oi='+order_no+'">Click here</a><br><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can also access this by clicking on the link below.</p><br><a href="'+config.siteUrl+'login" target="_blank">'+config.siteUrl+'login</a><br><p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">If the issue still cannot be resolved please contact us at info@prazar.com.au <br> Please see details of your return request below.</p> </td></tr><tr> <td> <table class="shippingHeader" cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td> <p style="margin: 0; padding-bottom: 4px;"><strong>STATUS: </strong>APPROVED</p><p style="margin: 0; padding-bottom: 4px;"><strong>DATE PLACED: </strong>'+order_date+'</p><p><strong>ORDER NUMBER: </strong>'+order_no+' </p><p><strong>CONTACT NAME: </strong>'+ship_fullname+' </p></td><td style="text-align: right;"> <p><strong>SHIPPING ADDRESS</strong> <br>'+shipping_address+' </p></td></tr></table> </td></tr><tr> <td> <div class="table-responsive productListMain"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr class="productShopName"> <td colspan="6">by The '+store_name+'</td></tr><tr class="productList"> <td> <img src="'+config.siteUrl+'products/'+image_url+'" style="width: 50px; height: 50px"> </td><td> <strong>'+product_name+'</strong> </td><td style="min-width: 60px">Qty: '+quantity+'</td><td>$'+unit_price+'</td></tr></table> </div></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%" class="footerMain"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
									
								helpers.sendMailSales(customer_email,htmlmsg,"",subject,function(flag1,msg1,send_res1){ 

								});
								
							}).catch(function(er5){
								res.send(JSON.stringify(data));
							});
							
						}).catch(function(er4){
							res.send(JSON.stringify(data));
						})
						
					}).catch(function(er3){
						res.send(JSON.stringify(data));
					});
			
			
				}
				}).catch(function(ee){
					 res.send(JSON.stringify(data));
				});
		
		
			
		    data.message="return item request accepted successfully ";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
			 }).catch(function (err2){  console.log(err2);
		       res.send(JSON.stringify(data));
           });	
	
	
});


//testing to refund

router.all("/test",function (req, res, next) {
	
                var Paypal = require('paypal-adaptive');
 

				var paypalSdk = new Paypal({
					userId:config.paypal_user_id,
					password:config.paypal_password,
					signature:config.paypal_signature,
					sandbox:true //defaults to false
				});

				var payload = {
				requestEnvelope: {
					errorLanguage:  'en_US'
				},
				currencyCode:   'AUD',
				receiverList: {
					receiver:[{email:config.paypal_primary_reciever,amount:20,primary:'true'},
					{email:'farid.webvillee@gmail.com',amount:16.6,primary:'false'}]
				   },
				 payKey:'AP-0J33542244705924V'  
				};
			 
			 
				paypalSdk.refund(payload, function (err, response) {
				if (err) {
					
				      console.log("ttttttttt"+err);
					  
				      console.log(response);
				        
					 res.send(JSON.stringify(response)); 	
						
						
				} else {
					
				   console.log(response);
				  
				   res.send(JSON.stringify(response));
				
				}
				});
			
});



/* vendor logout */
router.get('/vendor_logout',checkLoginVendor,function(req, res) {
	
  req.session.destroy();
  res.redirect("/");
	
});

/********** consumer dashboard work ***********/

/* consumer dashboard */
router.all('/user_dashboard',checkLoginConsumer,function(req, res) {
	
	//check user visited dashboard once;
	
	var visited = 0;
	if(req.session.userdata.is_visited != undefined){
		visited =1 ;
	}
	
	 var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count,visited:0};
	
	 if(visited == 1){
		 data.visited = 1;
	 }
	 
	//set session user visited dashboard ;
	req.session.userdata.is_visited = "yes";
	
	
	data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
    data.meta_desc="Login to your Prazar account to update your details";

    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"user_dashboard";
    data.og_type="website";
	
	
	 var user_id=req.session.userdata.user_id;
	 
	 
	 var today_time = new Date();
	 var seven_day_ago_time=today_time.setDate(today_time.getDate()-7)
       
	   // get ordered product for review
	    
       var sql =  "SELECT orders.`id` as order_id,orders.`order_date`,product.product_name,product.product_id,store.store_name FROM `orders` inner join order_products on order_products.order_id=orders.id inner join product on product.product_id=order_products.product_id inner join store on product.store_id=store.store_id where orders.customer_id="+user_id+" and product.product_id not in(select product_id from  product_ratings where customer_id='"+user_id+"') and orders.`order_date` <= "+seven_day_ago_time+" group by product.product_id order by orders.id desc ";
		 
		
		 //var sql =  "SELECT orders.`id` as order_id,orders.`order_date`,product.product_name,product.product_id,store.store_name FROM `orders` inner join order_products on order_products.order_id=orders.id inner join product on product.product_id=order_products.product_id inner join store on product.store_id=store.store_id where orders.customer_id="+user_id+" and product.product_id not in(select product_id from  product_ratings where customer_id='"+user_id+"') group by product.product_id order by orders.id desc ";
		
		
		
         userService.runQuery(sql).then(function(order_res){ 
	 
	       data.orders=order_res;
	       
	    // get countries
	     var sql = "select * from countries";
         userService.runQuery(sql).then(function(result){ 
			 
			 data.countries=result;
			 
	    // get customer_details
	     var sql1 = "select users.name,users.fname,users.lname,users.password,users.email,customers.* from users left join customers on users.user_id=customers.user_id where users.user_id="+user_id+"";
			 
         userService.runQuery(sql1).then(function(result1){ 
			 
			 var detail=result1[0];
		 
			 data.user_details=detail;
			 
		 // get billing address details 
	     var sql2 = "select * from customer_billing_address where customer_id="+user_id+"";
			 
         userService.runQuery(sql2).then(function(result2){ 
			 
			 if(result2.length>0){
				  data.billing_add=result2[0];
			 }else{
			     data.billing_add={};
			 }
		
		 // get shipping  addressess  
	     var sql3 = "select * from customer_shipping_address where customer_id="+user_id+" and is_deleted=0 and is_active=1";
			 
         userService.runQuery(sql3).then(function(result3){ 
			 
			 data.shipping_add=result3;
			
			if(data.orders.length>0){
				
				var count=0;
				
				var callback_image=function(flag,index,call_result){
					
					data.orders[index]['image_url']=call_result[0]['image_url'];
					data.orders[index]['order_date'] = helpers.utcTimestampToLocalDate(data.orders[index]['order_date']," DD-MM-YY HH:mm ");
                   
					count++;
					if(count>=data.orders.length){
						
						//console.log(JSON.stringify(data.orders));
						// final 2
			           res.render('front/user_dashboard',{title: "My Account - Discover Australia's best brands - Prazar ",base_url:config.siteUrl,data:data});
					}
					
				}
				
				
				
				for(var i=0; i<data.orders.length;i++){
				  var product_id = data.orders[i].product_id;
				  var get_product_images = "select * from product_images where product_id = "+product_id+" limit 1";
				  userService.runQueryCallback(get_product_images,i,callback_image);
			   }
				
				
				
			}else{
				
				// final 1
			  res.render('front/user_dashboard',{title: "My Account - Discover Australia's best brands - Prazar ",base_url:config.siteUrl,data:data});
				
			}
			
			 
			 
         }).catch(function (err3){ console.log(err3);
		    res.render('front/user_dashboard',{title: "My Account - Discover Australia's best brands - Prazar ",base_url:config.siteUrl,data:data});
       });
			 
         }).catch(function (err2){ console.log(err2);
		    res.render('front/user_dashboard',{title: "My Account - Discover Australia's best brands - Prazar ",base_url:config.siteUrl,data:data});
       });
			 
         }).catch(function (err1){ console.log(err1);
		    res.render('front/user_dashboard',{title: "My Account - Discover Australia's best brands - Prazar ",base_url:config.siteUrl,data:data});
       });
			 
         }).catch(function (err){ console.log(err);
		    res.render('front/user_dashboard',{title: "My Account - Discover Australia's best brands - Prazar ",base_url:config.siteUrl,data:data});
       });	

	 }).catch(function (err0){ console.log(err0);
		    res.render('front/user_dashboard',{title: "My Account - Discover Australia's best brands - Prazar ",base_url:config.siteUrl,data:data});
       });	

});

/* customer logout */
router.get('/user_logout',checkLoginConsumer,function(req, res) {
	
  req.session.destroy();
  res.redirect("/");
	
});

/* customer add shipping address */
router.post('/user_addship_address',checkLoginConsumer,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	var user_id=req.session.userdata.user_id;		
	var location= req.body.location;
	var fname= req.body.fname;
	var lname= req.body.lname;
	var company_name= req.body.company_name;
	var phone_no= req.body.phone_no;
	var add1= req.body.add1;
	var add2= req.body.add2 ? req.body.add2 :"";
	var city= req.body.city ;
	var state= req.body.state ;
	var country= req.body.country ;
	var postal_code= req.body.postal_code ;
	
	  var sql = "select id,location from customer_shipping_address where customer_id="+user_id+" and location="+mysql.escape(location)+" and is_deleted=0 and is_active=1";
       
         userService.runQuery(sql).then(function(result){
			 
			 if(result.length>0){
				var  address_id=result[0]['id'];
			   //update
				 var sql1="UPDATE `customer_shipping_address` SET `location`="+mysql.escape(location)+",`fname`="+mysql.escape(fname)+",`lname`="+mysql.escape(lname)+",`company_name`="+mysql.escape(company_name)+",`address_line_1`="+mysql.escape(add1)+",`address_line_2`="+mysql.escape(add2)+",`city`="+mysql.escape(city)+",`state`="+mysql.escape(state)+",`postal_code`='"+postal_code+"',`country`="+mysql.escape(country)+",`phone_no`="+mysql.escape(phone_no)+" WHERE id ="+address_id+"";
				 
			 }else{
			   //insert
				 var sql1="INSERT INTO `customer_shipping_address`(`customer_id`, `location`, `fname`, `lname`, `company_name`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `country`, `phone_no`) VALUES ('"+user_id+"',"+mysql.escape(location)+","+mysql.escape(fname)+","+mysql.escape(lname)+","+mysql.escape(company_name)+","+mysql.escape(add1)+","+mysql.escape(add2)+","+mysql.escape(city)+","+mysql.escape(state)+",'"+postal_code+"',"+mysql.escape(country)+","+mysql.escape(phone_no)+")";
			 }
			 
		userService.runQuery(sql1).then(function(result1){ 
			
		    data.message="Shipping address saved successfully";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
			 }).catch(function (err2){  console.log(err2);
		    res.send(JSON.stringify(data));
           });	
	  		  
				  
         }).catch(function (err1){ console.log(err1);
		    res.send(JSON.stringify(data));
       });	

});


/* customer edit shipping address */
router.post('/user_editship_address',checkLoginConsumer,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	var user_id=req.session.userdata.user_id;		
	var location= req.body.location;
	var fname= req.body.fname;
	var lname= req.body.lname;
	var company_name= req.body.company_name;
	var phone_no= req.body.phone_no;
	var add1= req.body.add1;
	var add2= req.body.add2 ? req.body.add2 :"";
	var city= req.body.city ;
	var state= req.body.state ;
	var country= req.body.country ;
	var postal_code= req.body.postal_code ;
	
	var address_id= req.body.add_id ;
	
	 //update
	var sql1="UPDATE `customer_shipping_address` SET `location`="+mysql.escape(location)+",`fname`="+mysql.escape(fname)+",`lname`="+mysql.escape(lname)+",`company_name`="+mysql.escape(company_name)+",`address_line_1`="+mysql.escape(add1)+",`address_line_2`="+mysql.escape(add2)+",`city`="+mysql.escape(city)+",`state`="+mysql.escape(state)+",`postal_code`='"+postal_code+"',`country`="+mysql.escape(country)+",`phone_no`="+mysql.escape(phone_no)+" WHERE id ="+address_id+" and customer_id="+user_id+"";
				 
			
		userService.runQuery(sql1).then(function(result1){ 
			
		    data.message="Shipping address updated successfully";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
			 }).catch(function (err2){  console.log(err2);
		    res.send(JSON.stringify(data));
           });	
	  		

});


/* customer show hide shipp address */

router.post('/user_ship_address_status',checkLoginConsumer,function(req, res) {

     var data={status:500,message:"internal server error",data:[]};

	var add_id=req.body.address_id;
	var show_status=req.body.show_status;
	var user_id=req.session.userdata.user_id;
	
	  var sql = "update customer_shipping_address set is_show="+mysql.escape(show_status)+" where id="+mysql.escape(add_id)+" and customer_id="+user_id+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="status updated successfully";
			data.status=200;
			data.data=result;
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ console.log(err1);
		    res.send(JSON.stringify(data));
       });	

});

/* customer delete shipp address */

router.post('/user_ship_address_delete',checkLoginConsumer,function(req, res) {

	var add_id=req.body.address_id;
	var user_id=req.session.userdata.user_id;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update customer_shipping_address set is_deleted=1,is_active=0 where id="+mysql.escape(add_id)+" and customer_id="+user_id+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="address deleted successfully";
			data.status=200;
			data.data=result;
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});


/* customer add shipping address */
router.post('/user_bill_address',checkLoginConsumer,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	var user_id=req.session.userdata.user_id;		
	var fname= req.body.fname;
	var lname= req.body.lname;
	var company_name= req.body.company_name;
	var phone_no= req.body.phone_no;
	var add1= req.body.add1;
	var add2= req.body.add2 ? req.body.add2 :"";
	var city= req.body.city ;
	var state= req.body.state ;
	var country= req.body.country ;
	var postal_code= req.body.postal_code ;
	
	  var sql = "select id from customer_billing_address where customer_id="+user_id+"";
       
         userService.runQuery(sql).then(function(result){
			 
			 if(result.length>0){
				var  address_id=result[0]['id'];
			   //update
				 var sql1="UPDATE `customer_billing_address` SET `fname`="+mysql.escape(fname)+",`lname`="+mysql.escape(lname)+",`company_name`="+mysql.escape(company_name)+",`address_line_1`="+mysql.escape(add1)+",`address_line_2`="+mysql.escape(add2)+",`city`="+mysql.escape(city)+",`state`="+mysql.escape(state)+",`postal_code`="+mysql.escape(postal_code)+",`country`="+mysql.escape(country)+",`phone_no`="+mysql.escape(phone_no)+" WHERE id ="+address_id+"";
				 
			 }else{
			   //insert
				 var sql1="INSERT INTO `customer_billing_address`(`customer_id`,`fname`, `lname`, `company_name`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `country`, `phone_no`) VALUES ('"+user_id+"',"+mysql.escape(fname)+","+mysql.escape(lname)+","+mysql.escape(company_name)+","+mysql.escape(add1)+","+mysql.escape(add2)+","+mysql.escape(city)+","+mysql.escape(state)+","+mysql.escape(postal_code)+","+mysql.escape(country)+","+mysql.escape(phone_no)+")";
			 }
			 
		userService.runQuery(sql1).then(function(result1){ 
			
		    data.message="Billing address saved successfully";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
			 }).catch(function (err2){  console.log(err2);
		    res.send(JSON.stringify(data));
           });	
	  		  
				  
         }).catch(function (err1){ console.log(err1);
		    res.send(JSON.stringify(data));
       });	

});

/* customer save personal details */
router.post('/user_save_personal_detail',checkLoginConsumer,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	var user_id=req.session.userdata.user_id;		
	var fname= req.body.fname;
	var lname= req.body.lname;
	var phone_no= req.body.phone_no?req.body.phone_no:"";
	var db_user_pass= req.body.db_userp;
	var old_pass= req.body.old_pass ? req.body.old_pass :"";;
	var new_pass= req.body.new_pass ? req.body.new_pass :"";
	
	var fullname=fname+" "+lname;
   
	old_pass=String(old_pass);
	new_pass=String(new_pass);
	
	
	var callback_final=function(flag,index,call_result){
	
	   if(call_result.length>0){
	         var sql = "update customers set phone_no="+mysql.escape(phone_no)+" where user_id="+user_id+"";
	     }else{
	   
			 var sql="INSERT INTO `customers`(`user_id`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `country`, `phone_no`) VALUES ("+user_id+",'','','','','','',"+mysql.escape(phone_no)+")";
	    }
		
       
         userService.runQuery(sql).then(function(result){
			
		  var sql1="UPDATE `users` SET `name`="+mysql.escape(fullname)+",`fname`="+mysql.escape(fname)+",`lname`="+mysql.escape(lname)+" WHERE user_id ="+user_id+"";
			 
		 userService.runQuery(sql1).then(function(result1){ 
			
		    data.message="Details updated successfully";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
			 }).catch(function (err3){  console.log(err3);
		    res.send(JSON.stringify(data));
           });	
	  		  
				  
         }).catch(function (err0){ console.log(err0);
		    res.send(JSON.stringify(data));
       });	

		
	}
	
	
	
	var callback=function(flag,index,call_back_result){
	
		  var sql_check="select customer_id from customers where user_id="+user_id+"";
		
		   userService.runQueryCallback(sql_check,0,callback_final);
		
       }
	
	
	/* entry point */
	if(new_pass!=""){
		
		
		 var pass_arr = db_user_pass.split(";");	 
	     var salt_str=pass_arr[0];
			 
		   helpers.hashPassword1(old_pass,salt_str,function(err,hashed_pass){
		
			   if(db_user_pass==hashed_pass){
			        
				   
				    new_pass= new_pass.trim();
	  
	                var salt_str1= uniqid();
  
	                 helpers.hashPassword1(new_pass,salt_str1,function(err,hashed_pass1){
						 
						 
						 var sql_pass="update users set password='"+hashed_pass1+"' where user_id="+user_id+"";
						 
						 userService.runQueryCallback(sql_pass,0,callback);
	
	                 });
				   
				   
			    }else{
					
				    data.message="Old Password Not Matched";
			        data.status=201;
			        data.data=[];
		           res.send(JSON.stringify(data)); 
				
				}
			   
		
		   });
		
	  }else{
		  
		  var blank_arr=[];
		  
		  callback(false,0,blank_arr);
	 
	  }
	

});



/* customer give rate and review */

router.post('/customer_rate',checkLoginConsumer,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	var user_id=req.session.userdata.user_id;		
	
	var product_id= req.body.product_id;
	var rate= req.body.rate;
	var review= req.body.review;
	
    review=helpers.htmlEntities(review) ;
	review = review.replace(/'/g, "''");
	
	var today_time=helpers.getUtcTimestamp();
	
	
	  var sql = "select id from product_ratings where customer_id="+user_id+" and product_id="+mysql.escape(product_id)+" ";
       
         userService.runQuery(sql).then(function(result){
			 
			 if(result.length>0){
				var  id=result[0]['id'];
			   //update
			   
			   
			   
				 var sql1="UPDATE `product_ratings` SET `ratings`="+mysql.escape(rate)+",`reviews`="+mysql.escape(review)+",`added_on`="+today_time+" WHERE id="+id+"";
				 
			 }else{
			   //insert
				 var sql1="INSERT INTO `product_ratings`(`product_id`, `customer_id`, `ratings`, `reviews`, `added_on`) VALUES ("+mysql.escape(product_id)+","+mysql.escape(user_id)+","+mysql.escape(rate)+","+mysql.escape(review)+",'"+today_time+"')";
			 }
			 
		userService.runQuery(sql1).then(function(result1){ 
			
		    data.message="Review successfully submitted";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
			 }).catch(function (err2){  console.log(err2);
		    res.send(JSON.stringify(data));
           });	
	  		  
				  
         }).catch(function (err1){ console.log(err1);
		    res.send(JSON.stringify(data));
       });	

});




/* customer return item request*/

router.post('/return_item_request',checkLoginConsumer,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	var user_id=req.session.userdata.user_id;		
	var order_pro_id= req.body.or_pro_id;
	var reason= req.body.reason;
	var return_reason_type= req.body.return_reason_type;
	var customer_email=req.session.userdata.email;
	reason=helpers.htmlEntities(reason) ;
	reason = reason.replace(/'/g, "''");
	
	var today_time=helpers.getUtcTimestamp();
	 //update
	var sql1="UPDATE `order_products` SET `is_return`='1',`return_reason`="+mysql.escape(reason)+",`return_reason_type`="+mysql.escape(return_reason_type)+",return_request_date="+today_time+" where id ="+mysql.escape(order_pro_id)+"";
				 
			
		userService.runQuery(sql1).then(function(result1){ 
			
			
			var sql2="select store.store_name,users.email from store inner join users on store.vendor_id = users.user_id where store.store_id = (select store_id from product where product_id = (select product_id from order_products where id="+mysql.escape(order_pro_id)+"))";
				 
			
		    userService.runQuery(sql2).then(function(result2){
				
				if(result2.length>0){
					
					var store_name=result2[0]['store_name'];
					var store_email=result2[0]['email'];
					
					var subject="Prazar- Returns Request";
					
                    var url=config.siteUrl+"login"; 
					
					var product_sql = "select product.product_name,order_products.product_id, order_products.unit_price, order_products.quantity,orders.order_no,orders.order_date,orders.ship_fullname,orders.ship_addr1,orders.ship_city,orders.ship_state,orders.ship_country,orders.ship_zip_code from order_products inner join orders on order_products.order_id = orders.id inner join product on order_products.product_id =  product.product_id where order_products.id = "+order_pro_id;
					
					userService.runQuery(product_sql).then(function(result3){
						var order_no = result3[0]['order_no'];
						var order_date = result3[0]['order_date'];//dd/mm/yy
						var product_name = result3[0]['product_name'];
						var unit_price = result3[0]['unit_price'];
						var quantity = result3[0]['quantity'];
						var product_id = result3[0]['product_id'];
						var ship_fullname = result3[0]['ship_fullname'];
						var shipping_address = result3[0]['ship_addr1']+", "+result3[0]['ship_city']+", "+result3[0]['ship_state']+", "+result3[0]['ship_country']+", "+result3[0]['ship_zip_code'];
						var sql_product_img = "select image_url from product_images where product_id = "+product_id+" limit 1";
						userService.runQuery(sql_product_img).then(function(result4){
							var image_url = result4[0]['image_url'];
							var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style><!--[if (gte mso 9)|(IE)]> <style type="text/css"> table{border-collapse: collapse !important;}</style><![endif]--> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > </table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/img/logo.png" alt="prazar" width="168" height="48" style="border-width:0;max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > </table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr class="blankElement"> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr class="orderConfirmation"> <td align="center"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>RETURNS REQUEST </strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Hi '+store_name+'</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You have received a product return request relating to order number '+order_no+' <br/>Please respond to the request via the order tracking tab on your Prazar seller dashboard,<br/>Alternatively you can also access your dashboard via the link below. </p><br><a target="_blank" href="'+config.siteUrl+'vendor_order_detail?order_no='+order_no+'">Click here</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Please see details of the return request below. </p></td></tr><tr> <td> <table class="shippingHeader" cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td> <p style="margin: 0; padding-bottom: 4px;"><strong>DATE PLACED: </strong>'+order_date+'</p><p><strong>ORDER NUMBER: </strong>'+order_no+' </p><p><strong>CONTACT NAME: </strong>'+ship_fullname+' </p></td><td style="text-align: right;"> <p><strong>SHIPPING ADDRESS</strong> <br>'+shipping_address+' </p></td></tr></table> </td></tr><tr> <td> <div class="table-responsive productListMain"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr class="productShopName"> <td colspan="6">by The '+store_name+'</td></tr><tr class="productList"> <td> <img src="'+config.siteUrl+'products/'+image_url+'" style="width: 50px; height: 50px"> </td><td> <strong>'+product_name+'</strong> </td><td style="min-width: 60px">Qty: '+quantity+'</td><td>$'+unit_price+'</td></tr></table> </div></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%" class="footerMain"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
								
							helpers.sendMailSales(store_email,htmlmsg,"",subject,function(flag1,msg1,send_res1){ 

							});
						}).catch(function(er4){
							res.send(JSON.stringify(data));
						})
						
					}).catch(function(er3){
						res.send(JSON.stringify(data));
					});
				}
				
			  }).catch(function (err2){  console.log(err2);
		       res.send(JSON.stringify(data));
             });
			
			
			
			//final result
		    data.message="return item request submitted successfully";
			data.status=200;
			data.data=[];
		    res.send(JSON.stringify(data));  
      
			 }).catch(function (err1){  console.log(err1);
		       res.send(JSON.stringify(data));
           });	
		   
	  		

});


/* customer refund success*/
router.all('/customer_refund_detail',checkLoginConsumer,function(req, res) {
	
	 var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"customer_refund_detail";
    data.og_type="website";
	
	var order_product_id=req.query.opi;
	
	if(order_product_id){
		
	
	
	 var sql = "SELECT orders.ship_fullname,orders.order_no,orders.transection_id,transections.*,store.paypal_email,order_products.quantity,product.product_name FROM `order_products` inner join orders on orders.id=order_products.order_id inner join transections on order_products.order_id=transections.order_id inner join store on transections.vendor_id=store.vendor_id inner join product on product.product_id=order_products.product_id WHERE order_products.id="+mysql.escape(order_product_id)+" and (transections.transaction_type=1 or transections.transaction_type=2)";

	 userService.runQuery(sql).then(function(result){
		 
		 result[0].transaction_date = helpers.utcTimestampToLocalDate(result[0].transaction_date,"DD-MM-YY HH:mm:ss");
		 
		  var vendor_amount=parseFloat(result[0]['amount']);
		  var commision_amount=parseFloat(result[0]['commision_amount']);
		   
		  var refund_amt= vendor_amount+commision_amount;
		   
		  result[0].refunded_amt=refund_amt;
		   
		  data.refund_detail=result[0];
		 
		 res.render('front/user_refund_success.html',{title: 'Prazar customer  refund recieved',base_url:config.siteUrl,data:data});
		 
	   }).catch(function (err) { console.log(err);
         res.render('front/user_refund_success.html',{title: 'Prazar customer  refund recieved',base_url:config.siteUrl,data:data});
        
       });

	
		
	}else{
		
		res.redirect("/user_dashboard");
	}
	
	
});


/* vendor delete product */

router.post('/customer_delete_account',checkLoginConsumer,function(req, res) {
	
	var user_id=req.session.userdata.user_id;
	
    var sql = "update users set is_deleted=1,email=CONCAT(email, 'del') where user_id="+mysql.escape(user_id)+"";
       
      userService.runQuery(sql).then(function(result){
		  
	  
		  var response ={status:200,message:"Account deleted successfully",data:[]};
		  req.session.destroy();
		  res.send(JSON.stringify(response)); 
	

	  }).catch(function (err){ console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
   
});



/* customer get shipping address for same*/

router.post('/customer_get_shipp_add',checkLoginConsumer,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	var user_id=req.session.userdata.user_id;		
	
	 //update
	var sql1="select * from customer_shipping_address where customer_id="+user_id+" and is_active=1 and is_deleted=0 and is_show=1 limit 1 ";
				 
			
		userService.runQuery(sql1).then(function(result1){ 
			
			if(result1.length==0){
				
			    data.message="address found";
			    data.status=201;
			    data.data=[];
		        res.send(JSON.stringify(data)); 
				
				
			}else{
				
		    data.message="address found";
			data.status=200;
			data.data=result1[0];
		    res.send(JSON.stringify(data));  
				
				
			}
			
			
		   
      
			 }).catch(function (err2){  console.log(err2);
		       res.send(JSON.stringify(data));
           });	
	  		

});

/* get all category */
router.post('/get_all_category',function(req, res) {

    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "select * from categories where is_deleted=0 and is_active=1";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="category deleted successfully";
			data.status=200;
			data.data=result;
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});


/*get search suggestion*/

router.post('/get_search_suggestions',function(req, res) {

    
	var keyword = req.body.SearchInputVal;
			
		var sql = "select distinct product_name from product where product_name like '%"+keyword+"%' and is_active = 1 and is_deleted = 0 limit 50";
       
        userService.runQuery(sql).then(function(result){
			var data="";
			if(result.length > 0){
				var data = '';
				for(var i=0;i<result.length;i++){
					data = data+'<li><a href="javascript:void(0);" class="select_this_to_search">'+result[i].product_name+'</a></li>';
				}
				 res.send(data);
			 }else{
				 res.send(data);
			 }
      
         }).catch(function (err1){ 
		    res.send("");
       });	

});


/*get search results*/

router.all('/search_results',function(req, res) {
     var all_prod = [];
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	  data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
     data.meta_desc="Unique gifts for them and you, there’s always something special at Prazar";
 
     data.og_img="front_assets/img/prazar.png";
	 data.og_url=config.siteUrl+"search_results";
    data.og_type="website";
     var count = 0
     var search_keyword = req.query.search_keyword;
	 
	 var sql =  "(select product.* , store.store_name , store.store_slug from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.product_name like '%"+search_keyword+"%' limit 0 , 50) union all (select product.* , store.store_name , store.store_slug from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.store_id in (select store_id from store where store_name like '%"+search_keyword+"%') limit 0 , 50 ) union all (select product.* , store.store_name , store.store_slug from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.store_id in (select store_id from store where address_line_1 like '%"+search_keyword+"%' or city like '%"+search_keyword+"%' or state like '%"+search_keyword+"%') limit 0 , 50) union all (select product.* , store.store_name , store.store_slug from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.store_id in (select store_id from store where postal_code = "+mysql.escape(search_keyword)+") limit 0 , 50 )  limit 0 , 50";

	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count,search_keyword:search_keyword};
			
			res.render('front/search_result',{title: "Search results - Australian brands - Prazar",base_url:config.siteUrl,data:data});						
		}
	}
	 
	 var callback_image = function(falg,index,result){
		all_prod[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+all_prod[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	 
	 userService.runQuery(sql).then(function(re){
		 all_prod = re;
		 if(all_prod.length > 0){
			all_prod = re;
			for(var i = 0;i<all_prod.length;i++){
				var product_id = all_prod[i].product_id;
				var get_product_images = "select * from product_images where product_id = "+product_id;
				userService.runQueryCallback(get_product_images,i,callback_image);
			}
		}else{
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count,search_keyword:search_keyword};
			res.render('front/search_result',{title: "Search results - Australian brands - Prazar",base_url:config.siteUrl,data:data});
		}
	 }).catch(function(er){console.log(er);
		 res.redirect("/");
	 });
    
     
        
    
});


/*search page pagination*/
router.all('/search_page_pagination',function(req, res) {
     var all_prod = [];
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
     var count = 0
     var skw = req.body.skw;
     var page = req.body.page;
	 page = page*50;
	 
	 var sql =  "(select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.product_name like '%"+skw+"%' limit "+page+" , 50) union all (select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.store_id in (select store_id from store where store_name like '%"+skw+"%') limit "+page+" , 50 ) union all (select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.store_id in (select store_id from store where address_line_1 like '%"+skw+"%' or city like '%"+skw+"%'  or state like '%"+skw+"%') limit "+page+" , 50) union all (select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.store_id in (select store_id from store where postal_code = "+mysql.escape(skw)+") limit "+page+" , 50 )  limit "+page+" , 50";
	 
	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var html = "";
			for(var i = 0;i<all_prod.length;i++){
				html = html+'<div class="col-md-4 col-sm-6 wv_product_width col-xs-6 wv_clear marB30" ><div class="wa-theme-design-block"><figure class="dark-theme"><img src="./products/'+all_prod[i].images[0].image_url+'" alt="Women Thumbnail">';
				if(all_prod[i].quantity == 0){
					html = html+'<div class="out_stock_div"><span>out of stock</span></div><!--<div class="ribbon"><span>New</span></div>-->';
				}else{
					
					
					var product_type=all_prod[i].product_type;
					
					if(product_type==2){
						
						html = html+'<span class="block-sticker-tag1 add_variant_pro_cart" data-id="'+all_prod[i].product_id+'" data-slug="'+all_prod[i].slug+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
					}else{
						
						html = html+'<span class="block-sticker-tag1 add_to_cart_other" data-id="'+all_prod[i].product_id+'" data-sale-price="'+all_prod[i].sale_price+'" data-is-customize="'+all_prod[i].is_customizable+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
						
						
					}
					
					
				}
				html = html+'<span class="block-sticker-tag2" data-id="'+all_prod[i].product_id+'"><span class="off_tag1"><strong><i class="fa fa-heart-o" aria-hidden="true"></i></strong></span></span><span class="block-sticker-tag3"><a class="off_tag1 btn-action btn-quickview" href="/product_datail?p='+all_prod[i].slug+'"><strong><i class="fa fa-eye" aria-hidden="true"></i></strong></a></span></figure><div class="block-caption1"><h4><a href="/product_datail?p='+all_prod[i].slug+'">'+all_prod[i].product_name+'</a></h4><div class="col-xs-12 col-sm-12 col-md-12 text_left"><span class="price-text-color ">By '+all_prod[i].store_name+'</span></div><div class="col-xs-12 col-sm-12 col-md-12 review_right"><ul class="wv_rating star_ratings_ajax">';
				if(all_prod[i].ratings[0].average_rates == 0){
					html = html+'<li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 0 && all_prod[i].ratings[0].average_rates < 1){
					html = html+'<li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 1){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 1 && all_prod[i].ratings[0].average_rates < 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 2 && all_prod[i].ratings[0].average_rates < 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 3 && all_prod[i].ratings[0].average_rates < 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 4 && all_prod[i].ratings[0].average_rates < 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
				}
				
				
				
				html = html+'<li><span class="review">('+all_prod[i].ratings[0].total_rates+')</span></li></ul></div><div class="clear"></div><div class="price col-md-12"><span class="sell-price">AU $'+all_prod[i].sale_price.toFixed(2)+'</span></div></div></div><div class="clear"></div></div>';
			}
			
			res.send(html);
		}
	}
	 
	 var callback_image = function(falg,index,result){
		all_prod[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+all_prod[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	 
	 if(skw != "" && skw != undefined){
		 userService.runQuery(sql).then(function(re){
			 all_prod = re;
			 if(all_prod.length > 0){
				all_prod = re;
				for(var i = 0;i<all_prod.length;i++){
					var product_id = all_prod[i].product_id;
					var get_product_images = "select * from product_images where product_id = "+product_id;
					userService.runQueryCallback(get_product_images,i,callback_image);
				}
			}else{
				res.send("");
			}
		 }).catch(function(er){
			 res.send("");
		 });  
	 }else{
		 res.send("");
	 }     
    
});


/*sale products page*/

router.all('/sale_products',function(req, res) {
	
     
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	 data.meta_keywords="";
	 data.meta_desc="Find the best deals on unique Australian brands at Prazar";
	 
     data.og_img="front_assets/img/prazar.png";
	 
	 data.og_url=config.siteUrl+"sale_products";
     data.og_type="website";
	 
	 var all_prod = [];
     var count = 0
   
	 
	 var sql =  "select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.is_on_sale = 1 order by product.product_id desc limit 0 , 50";

	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count};
			res.render('front/sale_products',{title: "Sale - Australian brands - Prazar",base_url:config.siteUrl,data:data});						
		}
	}
	 
	 var callback_image = function(falg,index,result){
		all_prod[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+all_prod[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	 
	 userService.runQuery(sql).then(function(re){
		 all_prod = re;
		 if(all_prod.length > 0){
			all_prod = re;
			for(var i = 0;i<all_prod.length;i++){
				var product_id = all_prod[i].product_id;
				var get_product_images = "select * from product_images where product_id = "+product_id;
				userService.runQueryCallback(get_product_images,i,callback_image);
			}
		}else{
			
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count};
			res.render('front/sale_products',{title: "Sale - Australian brands - Prazar",base_url:config.siteUrl,data:data});
		}
	 }).catch(function(er){console.log(er);
		 res.redirect("/");
	 });
    
     
        
    
});


/*sale page pagination*/
router.all('/sale_page_pagination',function(req, res) {
	
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	 var all_prod = [];
     var count = 0
     var page = req.body.page;
	 page = page*50;
	 
	 var sql =  "select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 and product.is_on_sale = 1 order by product.product_id desc limit "+page+",50 ";
	 
	
	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var html = "";
			for(var i = 0;i<all_prod.length;i++){
				html = html+'<div class="col-md-4 col-sm-6 wv_product_width col-xs-6 wv_clear marB30" ><div class="wa-theme-design-block"><figure class="dark-theme"><img src="./products/'+all_prod[i].images[0].image_url+'" alt="Women Thumbnail">';
				if(all_prod[i].quantity == 0){
					html = html+'<div class="out_stock_div"><span>out of stock</span></div><!--<div class="ribbon"><span>New</span></div>-->';
				}else{
					
					
					var product_type=all_prod[i].product_type;
					
					if(product_type==2){
						
						html = html+'<span class="block-sticker-tag1 add_variant_pro_cart" data-id="'+all_prod[i].product_id+'" data-slug="'+all_prod[i].slug+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
					}else{
						
						html = html+'<span class="block-sticker-tag1 add_to_cart_other" data-id="'+all_prod[i].product_id+'" data-sale-price="'+all_prod[i].sale_price+'" data-is-customize="'+all_prod[i].is_customizable+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
						
						
					}
					
					
				}
				html = html+'<span class="block-sticker-tag2" data-id="'+all_prod[i].product_id+'"><span class="off_tag1"><strong><i class="fa fa-heart-o" aria-hidden="true"></i></strong></span></span><span class="block-sticker-tag3"><a class="off_tag1 btn-action btn-quickview" href="/product_datail?p='+all_prod[i].slug+'"><strong><i class="fa fa-eye" aria-hidden="true"></i></strong></a></span></figure><div class="block-caption1"><h4><a href="/product_datail?p='+all_prod[i].slug+'">'+all_prod[i].product_name+'</a></h4><div class="col-xs-12 col-sm-12 col-md-12 text_left"><span class="price-text-color ">By '+all_prod[i].store_name+'</span></div><div class="col-xs-12 col-sm-12 col-md-12 review_right"><ul class="wv_rating star_ratings_ajax">';
				if(all_prod[i].ratings[0].average_rates == 0){
					html = html+'<li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 0 && all_prod[i].ratings[0].average_rates < 1){
					html = html+'<li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 1){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 1 && all_prod[i].ratings[0].average_rates < 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 2 && all_prod[i].ratings[0].average_rates < 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 3 && all_prod[i].ratings[0].average_rates < 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 4 && all_prod[i].ratings[0].average_rates < 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
				}
				
				
				
				html = html+'<li><span class="review">('+all_prod[i].ratings[0].total_rates+')</span></li></ul></div><div class="clear"></div><div class="price col-md-12"><span class="sell-price">AU $'+all_prod[i].sale_price.toFixed(2)+'</span></div></div></div><div class="clear"></div></div>';
			}
			
			res.send(html);
		}
	}
	 
	 var callback_image = function(falg,index,result){
		all_prod[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+all_prod[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	 
	 
		 userService.runQuery(sql).then(function(re){
			 all_prod = re;
			 if(all_prod.length > 0){
				all_prod = re;
				for(var i = 0;i<all_prod.length;i++){
					var product_id = all_prod[i].product_id;
					var get_product_images = "select * from product_images where product_id = "+product_id;
					userService.runQueryCallback(get_product_images,i,callback_image);
				}
			}else{
				res.send("");
			}
		 }).catch(function(er){
			 res.send("");
		 });  
	     
    
});




/*All vendors list  (brands) results*/

router.all('/vendors',function(req, res) {
	
     var all_prod = [];
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	  data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
     data.meta_desc="Unique gifts for them and you, there’s always something special at Prazar";
 
     data.og_img="front_assets/img/prazar.png";
	 data.og_url=config.siteUrl+"vendors";
     data.og_type="website";
     var count = 0
     
	 
	 var sql =  "select store.*,users.name from store inner join users on store.vendor_id = users.user_id where users.is_active=1 and users.is_deleted=0 order by store.store_id asc limit 0 , 50";
	 
	
	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,store_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count};
			
			res.render('front/vendors',{title: "Vendors - Australian brands - Prazar",base_url:config.siteUrl,data:data});						
		}
	}
	 
	
	 
	 userService.runQuery(sql).then(function(re){
		 all_prod = re;
		 if(all_prod.length > 0){
			all_prod = re;
			for(var i = 0;i<all_prod.length;i++){
				
				var store_id = all_prod[i].store_id;
				
				var limited_desc = all_prod[i].description.substr(0, 50);
				
				all_prod[i].description = limited_desc ;
				
				var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from store_ratings where store_id = "+store_id;
		        userService.runQueryCallback(sql_ratings,i,callback_ratings);
				
			}
		}else{
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count,search_keyword:search_keyword};
			res.render('front/search_result',{title: "Search results - Australian brands - Prazar",base_url:config.siteUrl,data:data});
		}
	 }).catch(function(er){console.log(er);
		 res.redirect("/");
	 });
    
     
        
    
});


/*search page pagination*/
router.all('/vendors_page_pagination',function(req, res) {
     var all_prod = [];
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
     var count = 0
     
     var page = req.body.page;
	 page = page*50;
	 
	 var sql =  "select store.*,users.name from store inner join users on store.vendor_id = users.user_id where users.is_active=1 and users.is_deleted=0 order by store.store_id asc limit "+page+" , 50";
	 
	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var html = "";
			for(var i = 0;i<all_prod.length;i++){
				var store_logo_path="/front_assets/img/store_logo_placeholder.png";
				if(all_prod[i].store_logo != ""){
					
					store_logo_path ="store_logo/"+all_prod[i].store_logo;
				}
				
				html = html+'<div class="col-md-4 col-sm-6 wv_product_width col-xs-6 wv_clear marB30" ><div class="wa-theme-design-block"><figure class="dark-theme"><a class="pro_img_anchr" href="/store?ss='+all_prod[i].store_slug+'"><img src="'+store_logo_path+'" alt="'+all_prod[i].store_name+'"></a>';
				
				html = html+'</figure><div class="block-caption1"><h4><a href="/store?ss='+all_prod[i].store_slug+'">'+all_prod[i].store_name+'</a></h4><div class="col-xs-12 col-sm-12 col-md-12 text_left"><span class="price-text-color storeDSC" >'+all_prod[i].state+'</span></div><div class="col-xs-12 col-sm-12 col-md-12 review_right"><ul class="wv_rating star_ratings_ajax">';
				if(all_prod[i].ratings[0].average_rates == 0){
					html = html+'<li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 0 && all_prod[i].ratings[0].average_rates < 1){
					html = html+'<li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 1){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 1 && all_prod[i].ratings[0].average_rates < 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 2 && all_prod[i].ratings[0].average_rates < 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 3 && all_prod[i].ratings[0].average_rates < 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 4 && all_prod[i].ratings[0].average_rates < 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
				}
				
				
				
				html = html+'<li><span class="review">('+all_prod[i].ratings[0].total_rates+')</span></li></ul></div><div class="clear"></div></div></div><div class="clear"></div></div>';
			}
			
			res.send(html);
		}
	}
	 
	
	 
	 
		 userService.runQuery(sql).then(function(re){
			 all_prod = re;
			 if(all_prod.length > 0){
				all_prod = re;
				for(var i = 0;i<all_prod.length;i++){
					var store_id = all_prod[i].store_id;
					var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from store_ratings where store_id = "+store_id;
		            userService.runQueryCallback(sql_ratings,i,callback_ratings);
				}
			}else{
				res.send("");
			}
		 }).catch(function(er){
			 res.send("");
		 });  
	     
    
});

/*get new_arrivals products*/

router.all('/new_arrivals',function(req, res) {
	
     var all_prod = [];
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	  data.meta_keywords="Autralian brands, gifts, online marketplace, sell online, buy australian brands, gift ideas, personalised gifts, gift ideas for men, gift ideas for women";
 
     data.meta_desc="Unique gifts for them and you, there’s always something special at Prazar";
 
     data.og_img="front_assets/img/prazar.png";
	 data.og_url=config.siteUrl+"new_arrivals";
     data.og_type="website";
     var count = 0
    
	 var sql =  "select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 order by product.product_id desc limit 0,50";

	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count};
			
			res.render('front/new_arrivals',{title: "New arrivals - Australian brands - Prazar",base_url:config.siteUrl,data:data});						
		}
	}
	 
	 var callback_image = function(falg,index,result){
		all_prod[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+all_prod[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	 
	 userService.runQuery(sql).then(function(re){
		 all_prod = re;
		 if(all_prod.length > 0){
			all_prod = re;
			for(var i = 0;i<all_prod.length;i++){
				var product_id = all_prod[i].product_id;
				var get_product_images = "select * from product_images where product_id = "+product_id;
				userService.runQueryCallback(get_product_images,i,callback_image);
			}
		}else{
			var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,product_data:all_prod,cookie_cart_count:res.locals.cookie_cart_count,search_keyword:search_keyword};
			res.render('front/new_arrivals',{title: "Search results - Australian brands - Prazar",base_url:config.siteUrl,data:data});
		}
	 }).catch(function(er){console.log(er);
		 res.redirect("/");
	 });
    
     
        
    
});


/*new_arrivals page pagination*/
router.all('/new_arrivals_page_pagination',function(req, res) {
     var all_prod = [];
     var data={req_path:req.path,userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
     var count = 0
    
     var page = req.body.page;
	 page = page*50;
	 
	 var sql =  "select product.* , store.store_name from product inner join store on product.store_id = store.store_id where product.is_active=1 and product.is_deleted=0 order by product.product_id desc limit "+page+",50";
	 
	 var callback_ratings = function(falg,index,result){
		count++;
		if(result[0].average_rates == null){
			result[0].average_rates = 0;
		}
		all_prod[index]['ratings'] = result;
		if(count>=all_prod.length){
			var html = "";
			for(var i = 0;i<all_prod.length;i++){
				html = html+'<div class="col-md-4 col-sm-6 wv_product_width col-xs-6 wv_clear marB30" ><div class="wa-theme-design-block"><figure class="dark-theme"><img src="./products/'+all_prod[i].images[0].image_url+'" alt="Women Thumbnail">';
				if(all_prod[i].quantity == 0){
					html = html+'<div class="out_stock_div"><span>out of stock</span></div><!--<div class="ribbon"><span>New</span></div>-->';
				}else{
					
					
					var product_type=all_prod[i].product_type;
					
					if(product_type==2){
						
						html = html+'<span class="block-sticker-tag1 add_variant_pro_cart" data-id="'+all_prod[i].product_id+'" data-slug="'+all_prod[i].slug+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
					}else{
						
						html = html+'<span class="block-sticker-tag1 add_to_cart_other" data-id="'+all_prod[i].product_id+'" data-sale-price="'+all_prod[i].sale_price+'" data-is-customize="'+all_prod[i].is_customizable+'"><span class="off_tag"><strong><i class="fa fa-shopping-bag" aria-hidden="true"></i></strong></span></span><!--<div class="ribbon"><span>New</span></div>-->';
						
						
					}
					
					
				}
				html = html+'<span class="block-sticker-tag2" data-id="'+all_prod[i].product_id+'"><span class="off_tag1"><strong><i class="fa fa-heart-o" aria-hidden="true"></i></strong></span></span><span class="block-sticker-tag3"><a class="off_tag1 btn-action btn-quickview" href="/product_datail?p='+all_prod[i].slug+'"><strong><i class="fa fa-eye" aria-hidden="true"></i></strong></a></span></figure><div class="block-caption1"><h4><a href="/product_datail?p='+all_prod[i].slug+'">'+all_prod[i].product_name+'</a></h4><div class="col-xs-12 col-sm-12 col-md-12 text_left"><span class="price-text-color ">By '+all_prod[i].store_name+'</span></div><div class="col-xs-12 col-sm-12 col-md-12 review_right"><ul class="wv_rating star_ratings_ajax">';
				if(all_prod[i].ratings[0].average_rates == 0){
					html = html+'<li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 0 && all_prod[i].ratings[0].average_rates < 1){
					html = html+'<li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 1){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 1 && all_prod[i].ratings[0].average_rates < 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 2){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 2 && all_prod[i].ratings[0].average_rates < 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 3){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 3 && all_prod[i].ratings[0].average_rates < 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 4){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates > 4 && all_prod[i].ratings[0].average_rates < 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star-half-o"></i></li>';
				}else if(all_prod[i].ratings[0].average_rates == 5){
					html = html+'<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
				}
				
				
			
				html = html+'<li><span class="review">('+all_prod[i].ratings[0].total_rates+')</span></li></ul></div><div class="clear"></div><div class="price col-md-12"><span class="sell-price">AU $'+all_prod[i].sale_price.toFixed(2)+'</span></div></div></div><div class="clear"></div></div>';
			}
			
			res.send(html);
		}
	}
	 
	 var callback_image = function(falg,index,result){
		all_prod[index]['images'] = result;
		var sql_ratings = "select avg(ratings) as average_rates , count(id) as total_rates from product_ratings where product_id = "+all_prod[index].product_id;
		userService.runQueryCallback(sql_ratings,index,callback_ratings);
	}
	 
		 userService.runQuery(sql).then(function(re){
			 all_prod = re;
			 if(all_prod.length > 0){
				all_prod = re;
				for(var i = 0;i<all_prod.length;i++){
					var product_id = all_prod[i].product_id;
					var get_product_images = "select * from product_images where product_id = "+product_id;
					userService.runQueryCallback(get_product_images,i,callback_image);
				}
			}else{
				res.send("");
			}
		 }).catch(function(er){
			 res.send("");
		 });  
	     
    
});


/************* website static pages *************/
/* contact us page */
router.all("/contact_us",function (req, res, next) {
	
    var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"contact_us";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='contact_us' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	 res.render('front/contact_us',{title: 'Contact Us - prazar',base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	     res.render('front/contact_us',{title: 'Contact us - prazar',base_url:config.siteUrl,data:data});
	  });
	
	
    
  
});

/* conatct us submit */
router.post('/contact_us_submit',function(req,res) {
	
	
	var inquiry_type=req.body.inquiry_type ;
	var fullname=helpers.htmlEntities(req.body.fullname) ;
	var email=req.body.email ;
	var subject=helpers.htmlEntities(req.body.subject) ;
	var mssg=helpers.htmlEntities(req.body.contact_message) ;
	var is_news_letter=req.body.is_news_letter ? req.body.is_news_letter: 0;
	
	var today_time=helpers.getUtcTimestamp();
	
	fullname = fullname.replace(/'/g, "''");
	email = email.replace(/'/g, "''");
	subject = subject.replace(/'/g, "''");
	mssg = mssg.replace(/'/g, "''");
   	
	
	 var callaback=function(flag,index,call_result){
	 
		 
		   var subject1="Prazar- Contact Us";
		 
		   var htmlmsg='<html><head><title>Prazar Contact Us</title></head><body><div><p><b>Enquiry Type</b>: '+inquiry_type+'</p><p><b>Name</b>: '+fullname+'</p><p><b>Email</b>: '+email+'</p><p><b>Subject</b>: '+subject+'</p><p>Message: '+mssg+'</p></div></body></html>';
			
            

     			
		   var reciver_email=config.contact_email;	 
		 
		  helpers.sendMail(reciver_email,htmlmsg,"",subject1,function(flag,msg,send_res){
					  
						 if(flag){
						  
							 var response ={status:500,message:"error to send email",data:[]};
		  
		                      res.send(JSON.stringify(response));
							  
						  }else{
						   
									var subject2="Prazar- Contact Us Confirmation";
                                    var url=config.siteUrl+"login"; 
									

									 var htmlmsg2='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css">  *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:22px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+fullname+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you for contacting Prazar.<br>We will aim to get back to you within 24 hours.<br/><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">If your enquiry relates to a recent order, or you need some more information about a specific product we recommend that you contact the vendor directly.<br/> </p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">To contact vendors simply login via the link below and head to orders, contact seller or if an order has not yet been placed simply head to the product page and click contact seller.<br><br><br></p> <p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can also login by clicking on the link below;<br/> </p><a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
									var reciver_email2=email;	 

									helpers.sendMail(reciver_email2,htmlmsg2,"",subject2,function(flag1,msg1,send_res1){ 

									}); 
						   
						       //final success response
						      var response ={status:200,message:"Thanks for getting in touch, we’ll aim to get back to you within 24 hours",data:[]};
							  
		                     res.send(JSON.stringify(response));
							  
						  }
					  
		 }); 
		 
	  }
	
	if(is_news_letter==1){
			
		var sql1 = "INSERT INTO `subscribers`(`email`, `is_active`,`entry_time`) VALUES ("+mysql.escape(email)+",1,"+today_time+")";
		
		userService.runQueryCallback(sql1,0,callaback);
			   
	   }else{
			  var arr=[];
		   
		     callaback(false,0,arr);
	  }
				   

   
});


/* about us page */
router.all("/about_us",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	 data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	 data.og_url=config.siteUrl+"about_us";
     data.og_type="website";
	 
    res.render('front/about_us',{title: 'About Us - prazar',base_url:config.siteUrl,data:data});
  
});


/* gift vouchers  */
router.all("/gift_vouchers",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"gift_vouchers";
    data.og_type="website";
	
	var sql = "select * from page_contents where page_key='gift_vouchers' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
	res.render('front/gift_vouchers',{title: 'Gift Vouchers - prazar',base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		res.render('front/gift_vouchers',{title: 'Prazar Gift Vouchers',base_url:config.siteUrl,data:data});
	  });
	
	
    
  
});


/* our story */
router.all("/our_story",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"our_story";
    data.og_type="website";
	
	var sql = "select * from page_contents where page_key='our_story'";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
	 res.render('front/our_story',{title: 'Our Story - prazar',base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		res.render('front/our_story',{title: 'Prazar- Our Story',base_url:config.siteUrl,data:data});
	  });
	
	
    
  
});


/* privacy policy */
router.all("/privacy_policy",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"privacy_policy";
    data.og_type="website";
	
	var sql = "select * from page_contents where page_key='privacy_policy'";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
	 res.render('front/privacy_policy',{title: 'Privacy Policy - prazar',base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		res.render('front/privacy_policy',{title: 'Privacy Policy - prazar',base_url:config.siteUrl,data:data});
	  });
	
	
    
  
});


/* how-it-works */
router.all("/how_it_works",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"how_it_works";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='how_it_works' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/how_it_works',{title: 'How It Works - Prazar',base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		 res.render('front/how_it_works',{title: 'Prazar- How It Works',base_url:config.siteUrl,data:data});
	  });
	
	
});


/* wheres_my_order */
router.all("/wheres_my_order",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"wheres_my_order";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='Wheres_my_order' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	res.render('front/wheres_my_order',{title: "Where's my Order - prazar",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		res.render('front/wheres_my_order',{title: "Where's my Order - Prazar",base_url:config.siteUrl,data:data});
	  });
	
	
     
  
});


/* returns */
router.all("/returns",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"returns";
    data.og_type="website";
	 var sql = "select * from page_contents where page_key='returns' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	res.render('front/returns',{title: "Returns - Prazar",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		res.render('front/returns',{title: "Prazar- Returns",base_url:config.siteUrl,data:data});
	  });
	
	
     
  
});


/* delivery */
router.all("/delivery",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"delivery";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='delivery' ";
       
      userService.runQuery(sql).then(function(result1){
		  
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	 res.render('front/delivery',{title: "Delivery - Prazar",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		res.render('front/delivery',{title: "Delivery - Prazar",base_url:config.siteUrl,data:data});
	  });
	
     
  
});


/* why join  */
router.all("/why_join",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"why_join";
    data.og_type="website";
	
	var sql = "select * from page_contents where page_key='why_join'";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
	 res.render('front/why_join',{title: "Why Join - Prazar",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		 res.render('front/why_join',{title: "Prazar- Why Join",base_url:config.siteUrl,data:data});
	  });
	
	
	
    
  
});


/* why_shop_with_us  */
router.all("/why_shop_with_us",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"why_shop_with_us";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='why_shop_with_us' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/why_shop_with_us',{title: "Why Shop With us - prazar",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		  res.render('front/why_shop_with_us',{title: "Why Shop With us - prazar",base_url:config.siteUrl,data:data});
	  });
	
     
  
});

/*terms and condition page*/
router.all("/terms_conditions",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"terms_conditions";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='terms_conditions' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/terms_conditions',{title: "Prazar- terms & conditions",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		  res.render('front/terms_conditions',{title: "Prazar- terms & conditions",base_url:config.siteUrl,data:data});
	  });
	
     
  
});


/*privacy and cookies page*/
router.all("/privacy_cookies",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	
	data.og_url=config.siteUrl+"privacy_cookies";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='privacy_cookies' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/privacy_cookies',{title: "Prazar- privacy & cookies",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		  res.render('front/privacy_cookies',{title: "Prazar- privacy & cookies",base_url:config.siteUrl,data:data});
	  });
	
     
  
});


/*faq page*/
router.all("/faq",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	
	data.og_url=config.siteUrl+"faq";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='faq' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/faq',{title: "Prazar- FAQ",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		  res.render('front/faq',{title: "Prazar- FAQ",base_url:config.siteUrl,data:data});
	  });
	
     
  
});


/*work_with_us page*/
router.all("/work_with_us",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	
	data.og_url=config.siteUrl+"work_with_us";
    data.og_type="website";
	
	 var sql = "select * from page_contents where page_key='work_with_us' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/work_with_us',{title: "Prazar- Work with us",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		  res.render('front/work_with_us',{title: "Prazar- work with us",base_url:config.siteUrl,data:data});
	  });
	
  
});



/* affiliates page */

router.all("/affiliates",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	data.og_url=config.siteUrl+"affiliates";
    data.og_type="website";
	
	
	 var sql = "select * from page_contents where page_key='affiliates' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/affiliates',{title: "Prazar- Affiliates",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		  res.render('front/affiliates',{title: "Prazar- Affiliates",base_url:config.siteUrl,data:data});
	  });
	
  
});


/* customer_contact page */

router.all("/customer_contact",function (req, res, next) {
	
     var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
	
	data.og_url=config.siteUrl+"customer_contact";
    data.og_type="website";
	
	
	 var sql = "select * from page_contents where page_key='customer_contact' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    data.content=result1[0];
		}else{
		   data.content={};
		}  
	  
		  
	  res.render('front/customer_contact',{title: "Prazar- Customer Contact",base_url:config.siteUrl,data:data});
	  
	  
	  }).catch(function(err){
	  
		  res.render('front/customer_contact',{title: "Prazar- Customer Contact",base_url:config.siteUrl,data:data});
	  });
	
  
});

/*get return policy pop up data */
router.all("/get_return_policy_data",function (req, res, next) {
	
  
	 var sql = "select * from page_contents where page_key='returns' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    var data_content=result1[0]['page_content'];
			res.send(data_content+'<span class="wv_button_prazar" data-dismiss="modal">Close</span>');
		}else{
		   res.send('<span class="wv_button_prazar" data-dismiss="modal">Close</span>');
		}  
	
	  
	  }).catch(function(err){
	  
		  res.send("");
	  });
	
});


/*get return policy pop up data */
router.all("/get_delivery_info_data",function (req, res, next) {
	
  
	 var sql = "select * from page_contents where page_key='delivery' ";
       
      userService.runQuery(sql).then(function(result1){
		if(result1.length>0){
			
		    var data_content=result1[0]['page_content'];
			res.send(data_content+'<span class="wv_button_prazar" data-dismiss="modal">Close</span>');
		}else{
		   res.send('<span class="wv_button_prazar" data-dismiss="modal">Close</span>');
		}  
	
	  
	  }).catch(function(err){
	  
		  res.send("");
	  });
	
});


/*********** subscribe news letter ***************/
router.post('/subscribe',function(req,res) {
	
	
	var subscribe_email=req.body.subscribe_email ? req.body.subscribe_email: "";
	var today_time=helpers.getUtcTimestamp();
	
    var sql = "select id from subscribers where email="+mysql.escape(subscribe_email)+" and is_deleted=0";
       
      userService.runQuery(sql).then(function(result1){
			   
			   if(result1.length==0){
				   
				   var sql1 = "INSERT INTO `subscribers`(`email`, `is_active`,`entry_time`) VALUES ("+mysql.escape(subscribe_email)+",0,"+today_time+")";
           
	   
                   userService.runQuery(sql1).then(function(result){
				   
				   var insert_id=result.insertId
				   
				   var token=subscribe_email+"-tok-"+insert_id
				   
				   
				   var subject="Prazar- Subscribe News letter";
			     
				   
				  
				  var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css">  *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:22px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+subscribe_email+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you for contacting Prazar.</p><p class="lead"><strong>please conform your email for newsletter .</p><hr><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px "> <a class="btn btn-primary btn-sm" href="'+config.siteUrl+'subscribe_success?tok='+token+'" role="button">Confirm</a></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can also login by clicking on the link below;<br/> </p><a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
				  
				  
				   
				   helpers.sendMail(subscribe_email,htmlmsg,"",subject,function(flag,msg,send_res){
					  
						 if(flag){
						  
							 var response ={status:500,message:"error to send email",data:[]};
		  
		                      res.send(JSON.stringify(response));
							  
						  }else{
						   
						      var response ={status:200,message:"Thanks for joining the Prazar community! Keep an eye out for our awesome emails hitting your inbox soon",data:[]};
							  
		                     res.send(JSON.stringify(response));
							  
						  }
					  
					  }); 
				   
				   
				   }).catch(function (err1){ console.log(err1);
		  
		             var response ={status:500,message:"error",data:[]};
		  
		             res.send(JSON.stringify(response));
                  });
				   
				   
			   }else{
				   
				     var response ={status:200,message:"Thanks for joining the Prazar community! Keep an eye out for our awesome emails hitting your inbox soon",data:[]};
		  
		            res.send(JSON.stringify(response)); 
	
			   }
			   
		   
	  }).catch(function (err){ console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
   
});

router.get("/subscribe_success",function (req, res, next) {
	
	 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	var tok = req.query.tok ; 
	
	if(tok){
		
   	    var tok_arr = tok.split("-");
		
	    var email=tok_arr[0];
	    var table_id=tok_arr[2];
	    
	   var sql = "update subscribers set is_active=1 where id="+table_id+"";
       
      userService.runQuery(sql).then(function(result){
		  
       res.render('front/subscribe_thankyou',{title: 'Prazar- Subscribtion confirmed ',base_url:config.siteUrl,data:data});
	   
	   
	   }).catch(function (err){ console.log(err);
		  
		    var response ={status:500,message:"error",data:[]};
		  
		    res.send(JSON.stringify(response));
      });
		
	}else{
	
		res.redirect("/");
	}
});



/********** payment process *******/
router.all("/order_cancel",checkLoginConsumer,function (req, res, next) {
	
	 res.clearCookie('order_detail');
	 res.clearCookie('checkout_items');
	
	 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	 
	
	res.render('front/order_cancel',{title: 'Prazar- Cancel Order',base_url:config.siteUrl,data:data});
	
	
});

router.all("/order_success",checkLoginConsumer,function (req, res, next) {
	
	 var data={userdata:req.session.userdata,unread_msg_count:res.locals.unread_msg_count,pending_return_request:res.locals.pending_return_request,updated_return_request:res.locals.updated_return_request,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	
	
	data.meta_keywords="";
 
    data.meta_desc="";
	
    data.og_img="front_assets/img/prazar.png";
    data.og_url=config.siteUrl+"order_success";
    data.og_type="website";
	
	var gift_wrap_total=0;
	var today_time=helpers.getUtcTimestamp();
	
	if(req.cookies.checkout_items != undefined && req.cookies.order_detail != undefined){
		
		var order_items = JSON.parse(req.cookies.checkout_items); 
		var all_products=order_items.prd_data;
	    var cart_full_total=order_items.cart_full_total;
	    var cart_sub_total=order_items.cart_sub_total;
	    var cart_ship_total=order_items.cart_ship_total;
		var customer_email=req.session.userdata.email;//new email template code
		var customer_details=JSON.parse(req.cookies.order_detail);
		
		//clear the customer cart 
		 var sql_delete_cart = "delete from cart_items where customer_id="+mysql.escape(customer_details.customer_id)+"";
       
        userService.runQuery(sql_delete_cart).then(function(result3){
		
		//find last order no ; 
		 var sql = "select max(order_no) as last_order_no from orders ";
       
        userService.runQuery(sql).then(function(result1){
		  
		  if(result1[0]['last_order_no']== null || result1[0]['last_order_no']==""){
			  
			  var last_order_no=1000;
			  
		  }else{
			  
			   var last_order_no=parseInt(result1[0]['last_order_no']);
			  
		   }
		  
		  
		  var order_no=last_order_no+1;
		  
		  var customer_id =customer_details.customer_id;
		  var shpping_fname =customer_details.shpping_fname;
		  var shpping_lname =customer_details.shpping_lname;
		  var shpping_cname =customer_details.shpping_cname;
		  var shpping_phn =customer_details.shpping_phn;
		  var shpping_street =customer_details.shpping_street;
		  var shpping_street2 =customer_details.shpping_street2;
		  var shpping_city =customer_details.shpping_city;
		  var shpping_postcode =customer_details.shpping_postcode;
		  var shpping_country =customer_details.shpping_country;
		  var shpping_state =customer_details.shpping_state;
		  var billing_fname =customer_details.billing_fname;
		  var billing_lname =customer_details.billing_lname;
		  var billing_cname =customer_details.billing_cname;
		  var billing_phn =customer_details.billing_phn;
		  var billing_street =customer_details.billing_street;
		  var billing_street2 =customer_details.billing_street2;
		  var billing_city =customer_details.billing_city;
		  var billing_postcode =customer_details.billing_postcode;
		  var billing_country =customer_details.billing_country;
		  var billing_state =customer_details.billing_state;
		  var transection_id =customer_details.transection_id;
		  
		  var shipfullname=shpping_fname+" "+shpping_lname;
		  var billfullname=billing_fname+" "+billing_lname;
		  
		  var shipping_full_address = shpping_street+","+shpping_city+","+shpping_state+","+shpping_country+","+shpping_postcode
		  
		  
		  /*gift price calculation */
		  
		  for(var i=0;i<all_products.length;i++){
			      var gift_price= all_products[i]['gift_wrap_price'];
				 gift_wrap_total += parseFloat(gift_price);
		    }
		  
		   var sql1 = "INSERT INTO `orders`(`customer_id`, `order_no`, `shipping_tracking_no`, `order_date`, `payment_date`, `order_status`, `sub_total`, `shipping_total`, `gift_wrap_total`, `order_total`, `is_paid`, `ship_fullname`, `ship_company`, `ship_phone`, `ship_addr1`, `ship_add2`, `ship_city`, `ship_state`, `ship_country`, `ship_zip_code`, `bill_fullname`, `bill_company`, `bill_phone`, `bill_addr1`, `bill_addr2`, `bill_city`, `bill_state`, `bill_country`, `bill_zip_code`, `is_coupon_applied_to_cart`,`transection_id`) VALUES ("+mysql.escape(customer_id)+",'"+order_no+"','','"+today_time+"','"+today_time+"',0,"+mysql.escape(cart_sub_total)+","+mysql.escape(cart_ship_total)+","+mysql.escape(gift_wrap_total)+","+mysql.escape(cart_full_total)+",1,"+mysql.escape(shipfullname)+","+mysql.escape(shpping_cname)+","+mysql.escape(shpping_phn)+","+mysql.escape(shpping_street)+","+mysql.escape(shpping_street2)+","+mysql.escape(shpping_city)+","+mysql.escape(shpping_state)+","+mysql.escape(shpping_country)+","+mysql.escape(shpping_postcode)+","+mysql.escape(billfullname)+","+mysql.escape(billing_cname)+","+mysql.escape(billing_phn)+","+mysql.escape(billing_street)+","+mysql.escape(billing_street2)+","+mysql.escape(billing_city)+","+mysql.escape(billing_state)+","+mysql.escape(billing_country)+","+mysql.escape(billing_postcode)+",0,"+mysql.escape(transection_id)+")";
       
          userService.runQuery(sql1).then(function(results2){
		  
		   var order_id= results2.insertId;
		   
		   var count1=0;
		   
		   var callback2=function(flag,index,insert_result){
			   
			    count1++;  
			  
			    var order_product_id=insert_result.insertId;
			  
			  
			    all_products[index]['order_product_id']=order_product_id;
			  
			  
			  if(count1>=all_products.length){
				   
				    // call the transaction insert function 
					
				    transectionInsert();
					
			   }
		   }
		   
		   //loop through the all order products .
		   
		   for(var i=0;i<all_products.length;i++){
		
				  var product_id= all_products[i]['pid'];
				  var store_id= all_products[i]['store_id'];
				  var customization_data= all_products[i]['customization_data'];
				  var is_customizable= all_products[i]['is_customizable'];
				  var variation_data= all_products[i]['variation_data'];
				  var is_variable= all_products[i]['is_variable'];
				  var add_request= all_products[i]['add_request'];
				  var quantity= all_products[i]['quantity'];
				  var item_total_price= all_products[i]['item_total_price'];
				  var single_item_price= all_products[i]['single_item_price'];
				  var is_gift_wrap= all_products[i]['is_gift_wrap'];
				  var gift_wrap_price= all_products[i]['gift_wrap_price'];
				  var item_ship_price= all_products[i]['item_ship_price'];
				  var item_ship_type= all_products[i]['item_ship_type'];
				  if(item_ship_type == "express"){
					  item_ship_type = "Express Delivery";
				  }else if(item_ship_type == "standard"){
					  item_ship_type = "Standard Shipping";
				  }else{
					  item_ship_type = "International Shipping";
				  }
				  var code_id= all_products[i]['code_id'];
				  var code_name= all_products[i]['code_name'];
				  var code_value= all_products[i]['code_value'];
				 
				  if(code_id == ""){
					 code_id=0;
				 }
				 
				 if(code_value == ""){
					 code_value=0;
				 }
				 
				
				 
				 
				 
				 var sql_product="INSERT INTO `order_products`( `order_id`, `product_id`, `is_customizable`, `customization_data`, `unit_price`, `quantity`, `is_variable`, `variation_data`, `add_request`, `code_id`, `code_name`, `code_value`, `is_gift_wrap`, `gift_wrap_price`, `item_ship_price`, `item_sub_total_price`, `item_total_price`, `order_status`, `shipping_tracking_number`, `shipping_date`,`shipping_type`) VALUES ('"+order_id+"','"+product_id+"','"+is_customizable+"','"+customization_data+"','"+single_item_price+"','"+quantity+"','"+is_variable+"','"+variation_data+"','"+add_request+"','"+code_id+"','"+code_name+"','"+code_value+"','"+is_gift_wrap+"','"+gift_wrap_price+"','"+item_ship_price+"','"+item_total_price+"','"+item_total_price+"',0,'',0,'"+item_ship_type+"')";
				 

				 userService.runQueryCallback(sql_product,i,callback2);
		 
	       } 
		   
		  //transaction insert function code 
		   
		  function transectionInsert(){
			   
			var count=0;
			
			var vendors_emails=[];
			
			var callback=function(flag,index,callbak_res){
				
				 count++;
				 
				 var vendor_detail=callbak_res[0];  
				 var comminision_per= parseInt(vendor_detail.prazar_commision);
				 var vendor_id= vendor_detail.vendor_id;
				 var store_id= vendor_detail.store_id;
				 
				 var vendor_email=vendor_detail.email;
				 
				 vendors_emails.push(vendor_email);
				 
				 all_products[index]['vendor_detail']=vendor_detail; //new email template code
				 
				 var product_id= all_products[index]['pid'];
				 
				 var item_price= parseFloat(all_products[index]['item_total_price']);
				 
				 var admin_commision= (item_price*comminision_per)/100;
				 
				 var vendor_amt= item_price-admin_commision;
				 
				 var quantity= parseInt(all_products[index]['quantity']);
				 
				 var order_product_id= all_products[index]['order_product_id'];
				  
				  
				  
				 //insert in to transection table
				 var sql_insert="INSERT INTO `transections`(`order_product_id`,`order_id`, `vendor_id`, `customer_id`, `product_id`, `amount`, `commision_amount`,`transaction_date`) VALUES ('"+order_product_id+"','"+order_id+"','"+vendor_id+"','"+customer_id+"','"+product_id+"','"+vendor_amt+"','"+admin_commision+"',"+today_time+")";
				 
				  userService.runQuery(sql_insert).then(function(results4){ 
				  
				      console.log("success transection insert");
					  
				   }).catch(function(err4){ console.log(err4);});
				 
				 //manage inventory
				  var sql_insert1="update product set quantity=quantity-"+quantity+",quantity_soled=quantity_soled+"+quantity+",quantity_remaining=quantity_remaining-"+quantity+" where product_id="+product_id;
				  
				  userService.runQuery(sql_insert1).then(function(results5){ 
				  
				      console.log("success inventory update");
					  
				   }).catch(function(err5){ console.log(err5); });
				 
				 
				 // final result condition
				   if(count>=all_products.length){
					  
					  
					    //send mail to customer function calling
					   confirmEmailToCustomer(); //new email template code
					  
					    console.log("final success order");
					   
					    var url=config.siteUrl+"/login";
						
						var subject="Prazar new order received";
						
						function onlyUnique(value, index, self){ 
                                        return self.indexOf(value) === index;
                                  }
        
                        var unique_vendors = vendors_emails.filter(onlyUnique);
	                     
						unique_vendors= unique_vendors.toString();
						 
						 console.log("unique vendors "+unique_vendors);
						 
					   /*send mails to vendors for new order */
					   
					   
					   
					   var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css">  *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShop" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:22px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">New Order Received !<br>You have received new order! <br> Order no is '+order_no+' <br/><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can login using the link below<br/> </p><a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
					   
					   
					  helpers.sendMailSales(unique_vendors,htmlmsg,"",subject,function(flag,msg,info){
							 
							  console.log("mail sent to vendors");
						 });
					   
					   
					   
						//clear cookies
                         res.clearCookie('order_detail');
	                     res.clearCookie('checkout_items');
				         
		                //set 0 cart count
		                 req.session.userdata.cart_count=0;
						
				         res.render('front/order_success',{title: 'Prazar- success Order',base_url:config.siteUrl,data:data});
				   }
			   }
			
			
			for(var i=0;i<all_products.length;i++){
				
				var product_id= all_products[i]['pid'];
				var store_id= all_products[i]['store_id'];
				 
				 var sql_vendor="SELECT store.store_id, store.vendor_id,store.store_name,store.prazar_commision,store.paypal_email,users.email FROM store inner join users on users.user_id=store.vendor_id WHERE store.store_id="+store_id;
				 
				 userService.runQueryCallback(sql_vendor,i,callback);
				 
			}
					   
			   
		  }
		  
		  
		     /*send mail to customer*/
		  function confirmEmailToCustomer(){  //new email template code
			  
			  var counter=0;
			  var mail_order_products="";
			  var sub_total=0;
			  var order_total=0;
			  var ship_total=0;
			var callback_image = function(falg,index,result){
				
				      counter++;
				
				        if(result.length >0){
							all_products[index]['images'] = result[0]['image_url'];
						}else{
							all_products[index]['images'] = '';
						}
						
						
						sub_total+=parseFloat(all_products[index].single_item_price)*parseFloat(all_products[index].quantity)+parseFloat(all_products[index].gift_wrap_price);
						
						ship_total +=parseFloat(all_products[index].item_ship_price);
						
						
						mail_order_products +='<tr class="productShopName"> <td colspan="6">by The '+all_products[index].vendor_detail.store_name+'</td></tr><tr class="productList"> <td> <img src="'+config.siteUrl+'products/'+all_products[index].images+'" style="width: 50px; height: 50px"> </td><td> <strong>'+all_products[index].item_name+'</strong> <p></p></td><td style="min-width: 60px">Qty: '+all_products[index].quantity+'</td><td>$'+all_products[index].single_item_price+'</td></tr>';
						
						
						//loop end for send mail
						if(counter >=all_products.length){
							
							var sql_user="select name from users where user_id="+customer_id+"";
							 userService.runQuery(sql_user).then(function(results_user){ 
							 
							 var customer_name=results_user[0].name;
							 
				             console.log("email temp "+ JSON.stringify(all_products));
				             
							 var order_date= helpers.utcTimestampToLocalDate(today_time,"DD-MM-YY");
				            
							 var subject="Prazar Order Confirmation";
							 
							 
							 order_total=sub_total+ship_total;
							 
							 order_total=order_total.toFixed(2);
							 
							 var  htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}/*****************/ .productList td{padding: 8px; vertical-align: top;}.productListMain .productList td{border-bottom: 1px solid #ebebeb;}.productListMain .productList td p{margin-bottom: 0; padding-bottom: 0;}.productShopName td{padding-top: 20px;}.productTotal table{padding: 0 50px 30px;}.productTotal table p{margin: 0; padding-bottom: 5px;}.productListMain table{padding: 0 50px 25px;}table.shippingHeader{padding: 0 50px;}.orderConfirmation > td{padding: 50px 50px 20px;}/*****************/ .table-responsive{overflow-y: auto;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}.orderConfirmation > td{padding: 50px 20px 20px;}table.shippingHeader{padding: 0 20px;}.productListMain table{padding: 0 20px 25px;}.productTotal table{padding: 0 20px 30px;}.footerMain{padding: 0 15px;}.topHeaderLogo .contents img{max-width: 100% !important;}.topHeaderAccount .contents h1{font-size: 13px !important; margin: 0 !important; max-height: 100% !important; padding: 0 11px 0 0 !important;}.topHeaderShopNow .contents font a{font-size: 12px; padding: 0 13px; white-space: nowrap;}.topHeader .topHeaderShopNow .contents td{height: auto; padding: 7px 0;}.topHeaderLogo .contents img{max-width: 100% !important; padding-top: 17px !important;}.shippingHeader td{vertical-align: top;}.blankElement{display: none;}}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column topHeader" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column topHeaderShopNow" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column topHeaderLogo" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="'+config.siteUrl+'" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column topHeaderAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:22px;" alt=""><a href="'+config.siteUrl+'login" style="color:#474b53; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ;text-decoration: none;">My Account</a></h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr class="blankElement"> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr class="orderConfirmation"> <td align="center"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>ORDER CONFIRMATION </strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Hi '+customer_name+'</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you for shopping with Prazar, your order has now been received. Unless stated otherwise the vendor(s) will endeavour to send your order(s) out as soon as possible. Details of your order can be seen below<br/> </p><p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr><tr> <td> <table class="shippingHeader" cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td> <p style="margin: 0; padding-bottom: 4px;"><strong>DATE PLACED: </strong>'+order_date+'</p><p><strong>ORDER NUMBER: </strong>'+order_no+' </p></td><td style="text-align: right;"> <p><strong>SHIPPING ADDRESS</strong> <br>'+shipping_full_address+' </p></td></tr></table> </td></tr><tr> <td> <div class="table-responsive productListMain"> <table cellpadding="0" cellspacing="0" border="0" width="100%">'+mail_order_products+'</table> </div></td></tr><tr class="productTotal"> <td> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td><p><strong>Sub Total:</strong></p></td><td><p style="text-align: right;">$'+sub_total+'</p></td></tr><tr> <td><p><strong>Delivery:</strong></p></td><td><p style="text-align: right;">$'+ship_total+'</p></td></tr><tr> <td><p><strong>Total:</strong></p></td><td><p style="text-align: right;">$'+order_total+'</p></td></tr></table> </td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%" class="footerMain"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="https://www.facebook.com/prazarau/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="https://www.instagram.com/prazar_official/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="https://www.pinterest.ph/prazar2018/" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
							 
							  //send mail function
							  helpers.sendMailSales(customer_email,htmlmsg,"",subject,function(flag,msg,info){
							 
							      console.log("mail sent to customer");
						       });
					  
				            }).catch(function(err5){ console.log(err5); });
							
							
						}
						
						
					}
			  
			  
			  
			  
			  for(var i=0;i<all_products.length;i++){
			      var product_id=all_products[i].pid;
				  var get_product_images = "select * from product_images where product_id = "+product_id;
				  
				userService.runQueryCallback(get_product_images,i,callback_image);
				  
			  }
			
			  
		  }
		  
		  
		  
		  }).catch(function(err1){ console.log(err1);
	  
		     res.render('front/order_success',{title: 'Prazar- success Order',base_url:config.siteUrl,data:data});
	     });
		  
		  
	     }).catch(function(err2){ console.log(err2);
	  
		     res.render('front/order_success',{title: 'Prazar- success Order',base_url:config.siteUrl,data:data});
	     });
		
		
		 }).catch(function(err3){ console.log(err3);
	  
		     res.render('front/order_success',{title: 'Prazar- success Order',base_url:config.siteUrl,data:data});
	     });
		
	  }else{
		   //cookies not found
		  res.render('front/order_success',{title: 'Prazar- success Order',base_url:config.siteUrl,data:data});
	  }
});

router.all("/payment_process",checkLoginConsumer,function (req, res, next) {
	
 	
var Paypal = require('paypal-adaptive');
 
var customer_id=req.session.userdata.user_id; 
 
 var data={status:500,message:"internal server error",payment_url:"",transection_id:""};

 if(req.cookies.checkout_items != undefined){ 
			
	var items = JSON.parse(req.cookies.checkout_items); 

	var all_products=items.prd_data;
	
	var cart_full_total=items.cart_full_total;
	
	
	var paypal_recievers=[];
	
	var count1=0;
	
	var admin_total_commission = 0; 
	
	var all_product_new=[];
	
	var callback1=function(flag,index,callbak_res){
		
		  count1++;
		 
		 var vendor_detail=callbak_res[0]; 
		 
		 all_products[index]['vendor_details']=vendor_detail;
		 
		 all_product_new[index]=all_products[index];
		 
		   if(count1>=all_products.length){
			   
			 // get unique receivers
			 final_products = uniqueRecievers();
			 
			 
			 var count=0;
	
			 var callback=function(flag,index,callbak_res){
				  
				 
				 var paypal_email= final_products[index].vendor_details.paypal_email;
				 
				 
				 var comminision_per= parseInt(final_products[index].vendor_details.prazar_commision);
				 console.log("current com "+comminision_per);
				
				comminision_per = comminision_per-3 ;
				 
				console.log("after com "+comminision_per);
				 
				 var item_price= parseFloat(final_products[index]['item_total_price']);
				 
				 var admin_commision= (item_price*comminision_per)/100;
				 
				 
				 admin_total_commission += parseFloat(admin_commision);
				 
				 var vendor_amt= item_price-admin_commision;
				 
				  vendor_amt= vendor_amt.toFixed(2);
				 
				 var recievers={email:paypal_email,amount:vendor_amt,primary:'false'};
				 
				 paypal_recievers.push(recievers);
				 
				 
				 count++;
				 
				   if(count>=final_products.length){
					   
					   admin_total_commission = admin_total_commission.toFixed(2);
					   
					  var admin_rciver = {email:config.paypal_primary_reciever,amount:admin_total_commission,primary:'false'}
					   
					 
					  paypal_recievers.push(admin_rciver);
					 
					 console.log("receivers "+JSON.stringify(paypal_recievers));
					 
						var paypalSdk = new Paypal({
							userId:config.paypal_user_id,
							password:config.paypal_password,
							signature:config.paypal_signature,
							sandbox:true //defaults to false
							
						});

						var payload = {
						requestEnvelope: {
							errorLanguage:  'en_US'
						},
						actionType:     'PAY',
						currencyCode:   'AUD',
						feesPayer:      'EACHRECEIVER',
						memo:           'Online Purches Products',
						cancelUrl:      config.siteUrl+'shopping_cart', //order_cancel
						returnUrl:      config.siteUrl+'order_success',
						receiverList: {
							receiver:paypal_recievers
						   }
						};
					 
					 
						paypalSdk.pay(payload, function (err, response) {
						if (err) {
							
							  console.log("ttttttttt"+err);
							  
							  console.log(response);
								
							 res.send(JSON.stringify(data)); 	
								
								
						} else {
							
							data.status=200;
							data.message="success";
							data.payment_url=response.paymentApprovalUrl;
							data.transection_id=response.payKey;
							
						   console.log(response);
						  
						   res.send(JSON.stringify(data));
						
						}
						});
					 
				   }
			   }
			 
			 
			 
			 //get all reciever for recive payments
			 
			
			 
			 for(var i=0;i<final_products.length;i++){
		           console.log("hiiii");
			       callback(false,i,[]);
		 
	          }
			 
			 
			}
	}
	
	
	
	function uniqueRecievers(){
		
		var all_product_final=[];
		
		
		for(var i=0;i<all_product_new.length;i++){
			
			var flag=true;
			
			for(var j=0;j<all_product_final.length;j++){
				
				
				
				if(all_product_new[i].vendor_details.paypal_email==all_product_final[j].vendor_details.paypal_email){
					
					
		             var item_price1= parseFloat(all_product_new[i]['item_total_price']);
		             var item_price2= parseFloat(all_product_final[j]['item_total_price']);
		 
					 var item_total_price=item_price1+item_price2
					
					all_product_final[j]['item_total_price']=item_total_price;
					console.log("lllllll" +JSON.stringify(all_product_final));
					flag=false;
					continue ; 
				}
				
				
			}
			
			if(flag){
			  all_product_final.push(all_product_new[i]);
			}
			
		}
		
		return all_product_final;
		
	  }
	
	
	
	for(var i=0;i<all_products.length;i++){
		
		
		var product_id= all_products[i]['pid'];
		var store_id= all_products[i]['store_id'];
		 
		 var sql_vendor="SELECT store_id, vendor_id,store_name,prazar_commision,paypal_email FROM store WHERE store_id="+store_id;
		 
		 userService.runQueryCallback(sql_vendor,i,callback1);
		 
		 
	}
	
 }else{
	//no data for order
	res.send(JSON.stringify(data));  
	
  }
 
 
	
});



/******** middleware function to check vendor is logged in ************/
function checkLoginVendor(req, res, next) {
	
  if (req.session && req.session.userdata && req.session.userdata.user_role=='vendor') {
    return next();
  } else {
	  
	   console.log("you need to be logged in first wirh vendor ");
      res.redirect('/');
  }
}


/************ middleware function to check user/customer is logged in ********/
function checkLoginConsumer(req, res, next) {
	
  if (req.session && req.session.userdata && req.session.userdata.user_role=='consumer') {
    return next();
  } else {
	  
	  console.log("you need to be logged in first with consumer ");
      res.redirect('/');
  }
}


/************ middleware function to site visiter ********/
function siteVisit(req, res, next) {
	
  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  var today_time=helpers.getUtcTimestamp();
  var sql="select id from site_visiters where ip_address="+mysql.escape(ip)+"";
	
   userService.runQuery(sql).then(function(result){
		  
      if(result.length == 0){
		  
		  var sql1="INSERT INTO `site_visiters`(`ip_address`, `visited_on`) VALUES ("+mysql.escape(ip)+",'"+today_time+"')";
	
          userService.runQuery(sql1).then(function(result1){
			  return next();
			  
          }).catch(function (err1){ console.log(err1);
		  
		      return next();
        });
		  
		  
	    }else{
			
			
			 return next();
	    }
	   
	   
	   }).catch(function (err){ console.log(err);
		  
		      return next();
      });
	
	
 
}

module.exports = router;