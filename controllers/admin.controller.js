var express = require("express");
var router = express.Router();
var request = require("request");
var config = require("../config.json");
var path = require('path');
var appDir = path.dirname(require.main.filename);
var helpers = require("../helpers/helpers");
var userService = require("../services/service");
var uniqid = require('uniqid');
var mysql = require("mysql");

/* Admin login page */
router.get("/",function (req, res, next) {
	
  if (req.session && req.session.admindata) {
	  
     res.redirect('/prazar_admin/dashboard');
	  
   } else {
	  
	
	 var error;
	 var data;
	
     var flash_obj=req.flash('error');
	
	if(flash_obj.length>0){
	    error= flash_obj[0].msg;
		data=flash_obj[0].email;
	  }
	
    res.render('admin/login',{title: 'Prazar Admin Login',base_url:config.siteUrl,message:error,data:data});
	  
  }
	
});

/* Admin forgot password page */
router.get("/forgot_password",function (req, res, next) {
	
  if (req.session && req.session.admindata) {
	  
     res.redirect('/prazar_admin/dashboard');
	  
   } else {
	  
	
	 var error;
	 var data;
	
     var flash_obj=req.flash('error');
	
	if(flash_obj.length>0){
	    error= flash_obj[0].msg;
		data=flash_obj[0].email;
	  }
	
    res.render('admin/forgot',{title: 'Prazar Admin Forgot Password',base_url:config.siteUrl,message:error,data:data});
	  
  }
	
});

router.post("/forgot_password",function (req, res, next) {
	
  if (req.session && req.session.admindata) {
	  
     res.redirect('/prazar_admin/dashboard');
	  
   } else {
	  
	var email= req.body.email;   
	var data={req_path:req.path,error:"",success:""};
	
	   
	    var sql = "select user_id from users where email="+mysql.escape(email)+"";
       
         userService.runQuery(sql).then(function(result){
		
		   
		   if(result.length>0){
		   
			   var user_id =result[0]['user_id'];
			   var new_pass= helpers.randomString(10,'$pass'); 
			   var salt_str=uniqid();
			   
			   helpers.hashPassword1(new_pass,salt_str,function(err,hashed_pass){
			   
				   var sql1 = "update users set password='"+hashed_pass+"' where user_id="+user_id+"";
       
                   userService.runQuery(sql1).then(function(result1){
					   
					   var message="Hello  \n  prazar admin  \n  your new passord is "+new_pass+"  please login with new password \n Thanks prazar.com";
					   var subject="Prazar admin password recovery";
					   
					  helpers.sendMail(email,message,"",subject,function(flag,msg,send_res){
					  
						  if(flag){
						  
							  data.error="internal server error email did not send";
		                      res.render('admin/forgot',{title: 'Prazar Admin Forgot Password',base_url:config.siteUrl,data:data});
							  
						  }else{
						  
						      data.success="Your password has been send to your email please check";
		                      res.render('admin/forgot',{title:'Prazar Admin Forgot Password',base_url:config.siteUrl,data:data});
							  
						  }
					  
					  }); 
			   
				   }).catch(function (err) { 
		   
		              data.error="Internal server error";
		   
		              res.render('admin/forgot',{title:'Prazar Admin Forgot Password',base_url:config.siteUrl,data:data});
		
                  });   
			   
			   });
			   
			   
		   }else{
		   
			   data.error="Email was not found";
		       res.render('admin/forgot',{title: 'Prazar Admin Forgot Password',base_url:config.siteUrl,data:data});
		   
		   }
		   
      
         }).catch(function (err1) { 
		   
		    data.error="Internal server error";
		   
		   res.render('admin/forgot',{title: 'Prazar Admin Forgot Password',base_url:config.siteUrl,data:data});
		
       });   
	   
	   
	  
  }
	
});

/* middleware function to check user is logged in */
function requiresLogin(req, res, next) {
	
  if (req.session && req.session.admindata) {
    return next();
  } else {
	  
	  console.log("you need to be logged in first");
      res.redirect('/prazar_admin');
  }
}

/* Admin dashboard page */

router.all('/dashboard',requiresLogin,function(req, res) {
	
	
	var data={req_path:"/dashboard"};
	
	var s_date=req.query.start_date ? req.query.start_date :"";
	var e_date=req.query.end_date ? req.query.end_date : "";
	
	data.start_date=s_date;
	data.end_date=e_date;
	
	var sql_part="";
	var sql_part1="";
	var sql_part2="";
	var sql_part3="";
	var sql_part4="";
	var sql_part5="";
	var sql_part6="";
	var sql_part7="";
	
	
	if(s_date != "" && e_date!=""){
	
		var s_time=helpers.toTimestamp(s_date);
		var e_time=helpers.toTimestamp(e_date);
		
		 sql_part=" and registered_on between '"+s_time+"' and '"+e_time+"'";
		 sql_part1=" and registered_on between '"+s_time+"' and '"+e_time+"'";
		 sql_part2=" where visited_on between '"+s_time+"' and '"+e_time+"'";
		 sql_part3=" and added_on between '"+s_time+"' and '"+e_time+"'";
		// sql_part4=" and added_on between '"+s_time+"' and '"+e_time+"'";
		 sql_part5=" and added_on between '"+s_time+"' and '"+e_time+"'";
		 sql_part6=" where order_date between '"+s_time+"' and '"+e_time+"'";
		 sql_part7=" where transaction_date between '"+s_time+"' and '"+e_time+"'";
		
	 }
	
	  //customers
	  var sql = "select count(user_id) as total from users where role=1 and is_active=1 and is_deleted=0"+sql_part;
       
      userService.runQuery(sql).then(function(result){
		  
		  data.customers=result[0]['total'];
	 //vendors
	  var sql1 = "select count(user_id) as total from users where role=10 and is_active=1 and is_deleted=0"+sql_part1;
       
    userService.runQuery(sql1).then(function(result1){
		
		data.vendors=result1[0]['total'];
		//visitor
	 var sql2 = "select count(id) as total from site_visiters"+sql_part2;
       
         userService.runQuery(sql2).then(function(result2){
			 
			data.visitors=result2[0]['total'];
	//products	
	var sql3 = "select count(product_id) as total from product where is_deleted=0"+sql_part3;
       
         userService.runQuery(sql3).then(function(result3){
			 
			data.products=result3[0]['total']; 
			 
	//sub categories 	
	 var sql4 = "select count(id) as total from sub_categories where is_active=1";
       
         userService.runQuery(sql4).then(function(result4){
			 
		data.sub_cates=result4[0]['total']; 
			 
		//categories	 
		var sql5 = "select count(cat_id) as total from categories where is_active=1 and is_deleted=0"+sql_part5;
       
         userService.runQuery(sql5).then(function(result5){
		
		data.categories=result5[0]['total']; 	 
		// orders	 
		var sql6 = "select count(id) as total from orders"+sql_part6;
       
         userService.runQuery(sql6).then(function(result6){
			 
			data.orders=result6[0]['total'];  
		//transections
		var sql7 = "select count(id) as total from transections"+sql_part7;
       
         userService.runQuery(sql7).then(function(result7){
			 
		  data.transections=result7[0]['total']; 
		  
		  /*charts data*/
		  
		   var date = new Date();
  
           var current_month=date.getMonth();
       
           current_month=current_month+1;
		 
		  var counts_customrs =[0,0,0,0,0,0,0,0,0,0,0,0];
		  var counts_vendors =[0,0,0,0,0,0,0,0,0,0,0,0];
		  var counts_visitor =[0,0,0,0,0,0,0,0,0,0,0,0];
		  var counts_products =[0,0,0,0,0,0,0,0,0,0,0,0];
		  var counts_sub_categories =[0,0,0,0,0,0,0,0,0,0,0,0];
		  var counts_categories =[0,0,0,0,0,0,0,0,0,0,0,0];
		  var counts_orders =[0,0,0,0,0,0,0,0,0,0,0,0];
		  var counts_transections =[0,0,0,0,0,0,0,0,0,0,0,0];
         
		  var count=0;
		  
		  var callback_final= function(flag,index,result_callback){
			  
			    count++;
				
				var toatl_value1=result_callback[0]['total'];
				var toatl_value2=result_callback[1]['total'];
				var toatl_value3=result_callback[2]['total'];
				var toatl_value4=result_callback[3]['total'];
				var toatl_value5=result_callback[4]['total'];
				var toatl_value6=result_callback[5]['total'];
				var toatl_value7=result_callback[6]['total'];
				var toatl_value8=result_callback[7]['total'];
				
				counts_customrs[index]=toatl_value1;
				counts_vendors[index]=toatl_value2;
				counts_visitor[index]=toatl_value3;
				counts_products[index]=toatl_value4;
				counts_sub_categories[index]=toatl_value5;
				counts_categories[index]=toatl_value6;
				counts_orders[index]=toatl_value7;
				counts_transections[index]=toatl_value8;
				
				if(count>=current_month){
					
					data.counts_customers=counts_customrs;
					data.counts_vendors=counts_vendors;
					data.counts_visitor=counts_visitor;
					data.counts_products=counts_products;
					data.counts_sub_categories=counts_sub_categories;
					data.counts_categories=counts_categories;
					data.counts_orders=counts_orders;
					data.counts_transections=counts_transections;
					
				   //final response
			       res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
			 
				}
				
		    }
		 
		   /*get chart data up tom current month*/
	    	for(var i=0;i<current_month;i++){
				
				var firstDay = new Date(date.getFullYear(),i, 1);
				var lastDay = new Date(date.getFullYear(), i + 1, 0);
				
				var toUTC = new Date(firstDay).toUTCString();
				var toUTC1 = new Date(lastDay).toUTCString();

				var first_utc = Date.parse(toUTC);
				var last_utc = Date.parse(toUTC1);
				 
			
				   
		       var sql8 = "select count(user_id) as total from users where role=1 and is_active=1 and is_deleted=0 and registered_on between '"+first_utc+"' and '"+last_utc+"' union all select count(user_id) as total from users where role=10 and is_active=1 and is_deleted=0 and registered_on between '"+first_utc+"' and '"+last_utc+"' union all select count(id) as total from site_visiters where visited_on between '"+first_utc+"' and '"+last_utc+"' union all select count(product_id) as total from product where is_deleted=0 and added_on between '"+first_utc+"' and '"+last_utc+"' union all select count(id) as total from sub_categories where is_active=1 union all select count(cat_id) as total from categories where is_active=1 and is_deleted=0 and added_on between '"+first_utc+"' and '"+last_utc+"' union all select count(id) as total from orders where order_date between '"+first_utc+"' and '"+last_utc+"' union all select count(id) as total from transections where transaction_date between '"+first_utc+"' and '"+last_utc+"'";
				
				
				
				   userService.runQueryCallback(sql8,i,callback_final);
				 
	          }
		  
		 
		
         }).catch(function (err7) { console.log(err7);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       }); 
			 
		         
         }).catch(function (err6) { console.log(err6);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       }); 
			 
		         
         }).catch(function (err5) { console.log(err5);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       });	 
			 
		         
         }).catch(function (err4) { console.log(err4);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       });
		         
         }).catch(function (err3) { console.log(err3);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       });
		         
         }).catch(function (err2) { console.log(err2);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       });   
			 
			 
			 
         }).catch(function (err1) { console.log(err1);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       });
		         
         }).catch(function (err) { console.log(err);
		    data.error="Internal server error";
		    res.render('admin/index',{title: 'Prazar Admin Dashboard',base_url:config.siteUrl,data:data});
       });
	
	
 
	
});


/* Admin change password  page */

router.get('/update_password',requiresLogin,function(req, res) {
	
  var data={req_path:req.path};
	
  res.render('admin/update_password',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
	
});

router.post('/update_password',requiresLogin,function(req, res) {
	
	var data={req_path:req.path,error:"",success:""};
	
	var old_pass=String(req.body.old_password);
	var new_pass=String(req.body.new_password);
	
	var db_pass= req.session.admindata.password;
	var user_id= req.session.admindata.user_id;

	var pass_arr = db_pass.split(";");
    var salt_str=pass_arr[0];
	
	helpers.hashPassword1(old_pass,salt_str,function(err,oldhashed_pass){
	
	helpers.hashPassword1(new_pass,salt_str,function(err,hashed_pass){
		
		
		if(oldhashed_pass!=db_pass){
			
	       data.error="Old password did not matched";
		   res.render('admin/update_password',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
			
	     }else{
		 
		  var sql = "update users set password='"+hashed_pass+"' where user_id="+user_id+"";
       
         userService.runQuery(sql).then(function(result){
		
		   req.session.admindata.password=hashed_pass;
		   
		   data.success="Password Updated successfully";
		   
		   res.render('admin/update_password',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
		   
      
         }).catch(function (err1) { 
		   
		    data.error="Internal server error";
		   
		   res.render('admin/update_password',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
		
       });
			 
	 }
	    
	});
   });
	
});

/* Admin profile page */

router.get('/admin_profile',requiresLogin,function(req, res) {
	
   var data={req_path:req.path,
			 admin_data:{fname:req.session.admindata.fname,lname:req.session.admindata.lname,name:req.session.admindata.name,email:req.session.admindata.email},
			};
	
   res.render('admin/profile',{title: 'Prazar Admin profile',base_url:config.siteUrl,data:data});
	
});

router.post('/admin_profile',requiresLogin,function(req, res) {
	
	var data={};
	var fname=req.body.fname;
	var lname=req.body.lname;
	var user_id= req.session.admindata.user_id;
	
	var fullname=fname+" "+lname;
	
	  var sql = "update users set name="+mysql.escape(fullname)+",fname="+mysql.escape(fname)+",lname="+mysql.escape(lname)+" where user_id="+user_id+"";
       
         userService.runQuery(sql).then(function(result){
		
		    req.session.admindata.name=fullname;
		    req.session.admindata.fname=fname;
		    req.session.admindata.lname=lname;
		   
		    data.success="profile Updated successfully";
		   
			data.req_path=req.path;
			 
			data.admin_data={fname:fname,lname:lname,name:req.session.admindata.name,email:req.session.admindata.email}; 
			 
		    res.render('admin/profile',{title: 'Prazar Admin profile',base_url:config.siteUrl,data:data});  
      
         }).catch(function (err1) { 
		   
		    data.error="Internal server error";
		   
			data.req_path=req.path;
			data.admin_data={name:req.session.admindata.name,email:req.session.admindata.email};
			 
		   res.render('admin/profile',{title: 'Prazar Admin profile',base_url:config.siteUrl,data:data});
		
       });
	
	
});

/* Admin logout */

router.get("/admin_logout",requiresLogin,function(req,res){

 req.session.destroy(function(err) {
	 
 res.redirect('/prazar_admin');
})
	
   
});


/**** Category managemant *****/

router.get('/categories',requiresLogin,function(req, res) {
	
   var page = req.query.page ? req.query.page : 0;  
   var limit=25;
   var data={req_path:"/categories",show_str:"0 to 0 of 0 entries"};
   var results=[];
   var final_result=[];
	
  var sql_total = "select count(cat_id) as total from categories where is_active=1 and is_deleted=0";

	 userService.runQuery(sql_total).then(function(result){

      data.total=result[0]['total']; 	
		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	
	  page=page*limit; 
		 
	  var show_limit=page+limit;
		 
	  data.show_str="showing "+page+" to "+ show_limit+" of "+data.total+" entries"; 	 
		 
		 
	  var sql_data = "select * from  categories where  is_active=1 and is_deleted=0 order by order_by asc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_data).then(function(result2){

		  
		  
		  if(result2.length>0){
		  
			  var count=0;
			  
			  var callback=function(flag,index,result3){
			 
				  result2[index]['sub_cat']=result3;
				  
				  results.push(result2[index]);
				  count++;
				  
				  if(count>=result2.length){
				  
					 var counter=0;
					  
					 var callback_final=function(flag1,index1,result4){
					  
						 result2[index1]['total_products']=result4[0]['total'];
						 
						 final_result.push(result2[index1]);
						 
				         counter++;
						 
						 if(counter>=result2.length){
							 
							 data.categories=final_result;
						 
						     res.render('admin/categories',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data}); 
						 }
					 }
					  
					 
				    for(var j=0;j<result2.length;j++){
					
					 var cat_id=result2[j]['cat_id'];
				 
				     var sql="select count(id) as total  from product_category where cat_id="+cat_id+" and is_main_cat=1";
				 
				      userService.runQueryCallback(sql,j,callback_final);
						
						
					 }
					  
				  }
				  
			  }
			  
			  
			 for(var i=0;i<result2.length;i++){
	  
				 var cat_id=result2[i]['cat_id'];
				 
				 
				 var sql="select * from sub_categories where cat_id="+cat_id+" and is_active=1";
				 
				 userService.runQueryCallback(sql,i,callback);
				 
	          }
			  
		  }else{
				   
		     data.categories=[];   
		  
		    res.render('admin/categories',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});  
				   
		  }
          

	 }).catch(function (err2) { 

		data.error="Internal server error";

	   res.render('admin/categories',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('admin/categories',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});

   });
	
	
 
	
});


//get vendor category 
router.all('/get_suggested_category',requiresLogin,function(req, res) {
	
	
	var final_result=[];		

	  var sql_data = "select DISTINCT suggest_cat from vendor_products where suggest_cat!='' and suggest_cat not in (select cat_name from categories where is_active=1 and is_deleted=0) ";
 
    
	 
	  userService.runQuery(sql_data).then(function(result2){
		  
		  if(result2.length>0){
		  
		    var cates="";
		  
		     for(var i=0;i<result2.length;i++){
				 var cat_no=i+1;
				 cates +="<p>("+cat_no+") "+result2[i]['suggest_cat']+"</p>";
			 }
		  
		     var model_data='<div class="row"> <div class="col-lg-8"> <div class="form-group" data-plugin="formMaterial">'+cates+'</div></div></div>';
		  
		  
		     res.send(model_data);
		  
		  }else{
			  
			  res.send("<p>suggested category not found</p>");
		  }
          

	 }).catch(function (err2) { console.log(err2);

		res.send("");  

   });
		 

			 
});



router.get('/add_category',requiresLogin,function(req, res) {
	
	
  var data={req_path:req.path};
	
  res.render('admin/add_category',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
	
});

router.post('/add_category',requiresLogin,function(req, res) {    
    
 var data={req_path:req.path,success:'',error:''};
    
    var cate_name=req.body.cat_name;
    var sub_catrgory=req.body.sub_catrgory;
    var subsub_catrgory=req.body.subsub_catrgory;
    var total_sub_sub_cat=req.body.total_sub_sub_cat;
    var Files = req.files.image;
    var Files_banner = req.files.image_banner;
    var today_time=helpers.getUtcTimestamp();
    
	
	var fjson=[];
	var cindex=0;
	for(var i=0;i<total_sub_sub_cat.length;i++){
			
			for(var j=0;j<total_sub_sub_cat[i];j++){
				console.log(sub_catrgory[i],subsub_catrgory[cindex]);
				//fjson[cindex].push({sub_catrgory[i],subsub_catrgory[cindex]});
				cindex++;
			}
			
	}
	//console.log(fjson);
	//return;
	
    if(!req.files){
        
        data.error="Please select image file";
        res.render('admin/add_category',{title: 'Prazar Admin category managemant',base_url:config.siteUrl,data:data});
        
    }else{
    
        
        var callback=function(flag,file_name){
            
           if(flag){
              
                  data.error="Internal server error image upload";
                 res.render('admin/add_category',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
              
             }else{
        
                
                
               var sql = "INSERT INTO `categories`(`cat_name`,`cat_slug`, `cat_description`, `cat_image`,`added_on`) VALUES ("+mysql.escape(cate_name)+",'','','"+file_name+"',"+today_time+")";
     
	   
        userService.runQuery(sql).then(function(result){
        
             var cat_id=result.insertId;
            
             
              
              var cat_name=cate_name+cat_id;
              var target=" =&%?~+";
              var replacement="-";
                
              var cat_slug =helpers.findAndReplace(cat_name, target, replacement);
              
              var sql_update_cat_slug = "update categories set cat_slug = "+mysql.escape(cat_slug)+" where cat_id="+cat_id;
              
              userService.runQuery(sql_update_cat_slug).then(function(result111){
            
                   
                    
                         if(Array.isArray(sub_catrgory)){
						
						
						  var call_back3 = function(flag,index,ressss){
							  
						  }
						
						   var call_back2 = function(flag,index,result_insrt){
							   
							   var last_id = result_insrt.insertId ;
							   
							   console.log(index);
							    var cindex=0;
								for(var i=0;i<total_sub_sub_cat.length;i++){
										for(var j=0;j<total_sub_sub_cat[i];j++){
											if(i==index)
											{
												//console.log(sub_catrgory[i],subsub_catrgory[cindex]);
												//code to insert  in database
												 var subsub_cat_name=subsub_catrgory[cindex];
												  var target=" =%?~+";
												  var replacement="-";
													
												  var subsub_cat_slug =helpers.findAndReplace(subsub_cat_name+j, target, replacement);
												   
												   
												 var sql12 = "INSERT INTO `sub_sub_categories`(`sub_cat_id`, `name`, `sub_sub_cat_bslug`, `description`,`order_by`) VALUES ("+last_id+",'"+subsub_cat_name+"','"+subsub_cat_slug+"','',"+j+")";
												 
												 userService.runQueryCallback(sql12,j,call_back3);
												
											}
											cindex++;
										}
								}
	
							   
						   }
						
						
                             for(var i=0; i<sub_catrgory.length;i++){
                                
                                var sub_cat_name=sub_catrgory[i]+cat_id+i;
                                  var target=" =%?~+";
                                  var replacement="-";
                                    
                                  var sub_cat_slug =helpers.findAndReplace(sub_cat_name, target, replacement);
                               
                                 var sql1="insert into sub_categories(cat_id,name,su_cat_bslug,description,order_by) values ('"+cat_id+"',"+mysql.escape(sub_catrgory[i])+","+mysql.escape(sub_cat_slug)+",'',"+i+")";
							 
							   userService.runQueryCallback(sql1,i,call_back2);
							 
                             }
                            
                           
                            
                            }else{
								
								
								var call_back4 = function(flag,index,ressss){
							  
						        }
                        
						          var sub_cat_name=sub_catrgory+cat_id;
                                  var target=" =%?~+";
                                  var replacement="-";
                                    
                                  var sub_cat_slug =helpers.findAndReplace(sub_cat_name, target, replacement);
                               
                                 var sql1="insert into sub_categories(cat_id,name,su_cat_bslug,description,order_by) values ('"+cat_id+"',"+mysql.escape(sub_catrgory)+","+mysql.escape(sub_cat_slug)+",'',0)";
								 
                                 userService.runQuery(sql1).then(function(result22){
								   
								   
								   var sub_cat_id = result22.insertId;
								   
								   var sql_ins2 = ""
								   if(Array.isArray(subsub_catrgory)){
									   
									   for(var i =0 ; i<subsub_catrgory.length;i++ ){
									       var subsub_cat_name=subsub_catrgory[i];
												  var target=" =%?~+";
												  var replacement="-";
													
												  var subsub_cat_slug =helpers.findAndReplace(subsub_cat_name+i, target, replacement);
												   
												   
												 var sql12 = "INSERT INTO `sub_sub_categories`(`sub_cat_id`, `name`, `sub_sub_cat_bslug`, `description`,`order_by`) VALUES ("+sub_cat_id+",'"+subsub_cat_name+"','"+subsub_cat_slug+"','',"+i+")";
												
										     userService.runQueryCallback(sql12,i,call_back4);
								        }
									   
								     }else{
									   
									             var subsub_cat_name=subsub_catrgory;
												  var target=" =%?~+";
												  var replacement="-";
													
												  var subsub_cat_slug =helpers.findAndReplace(subsub_cat_name+"1", target, replacement);
												   
												   
												 var sql12 = "INSERT INTO `sub_sub_categories`(`sub_cat_id`, `name`, `sub_sub_cat_bslug`, `description`,`order_by`) VALUES ("+sub_cat_id+",'"+subsub_cat_name+"','"+subsub_cat_slug+"','',"+0+")";
												
										     userService.runQueryCallback(sql12,0,call_back4);
									   
								    }
								   
								 
							   }).catch(function (err22) { console.log(err22);
          
                                data.error="Internal server error";
                    
                                res.render('admin/add_category',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
                    
                             });
                            
                         }
                        
						
                            var callback1=function(flag,file_name){
								
								
								 var sql_update_cat_slug = "update categories set cat_banner_image = '"+file_name+"' where cat_id="+cat_id;
              
                              userService.runQuery(sql_update_cat_slug).then(function(result2){ 
							  
							            data.success="category added successfully";
                      
                                        res.render('admin/add_category',{title: 'Prazar Admin category management',base_url:config.siteUrl,data:data});
							  
							  
			                       }).catch(function (err3) { console.log(err3);
                      
                                        data.error="Internal server error";
                        
                                        res.render('admin/add_category',{title: 'Prazar Admin category management',base_url:config.siteUrl,data:data});
                        
                                  });
								
								
							}
							
							
							//upload banner image file
							
							var file_name = Files_banner.name;
							var filenewname = helpers.getUtcTimestamp();
							var file_ext = "";

							if (file_name != null && file_name != undefined) {
							var i = file_name.lastIndexOf('.');
							file_ext = (i < 0) ? '' : file_name.substr(i);
							}

							filenewname = filenewname + file_ext;

							helpers.uploadNewfile(Files_banner,"/uploads/categories/",filenewname,callback1);
						    
                            
                      
                  
                
              }).catch(function (err111) { console.log(err111);
          
                   data.error="Internal server error";
                    
                   res.render('admin/add_category',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
                    
              });
              
            
            
            
            
        }).catch(function (err1) { console.log(err1);
          
            data.error="Internal server error";
            
           res.render('admin/add_category',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
            
      });
                
                
            }
        
        }
        
        
       var file_name = Files.name;
       var filenewname = helpers.getUtcTimestamp();
       var file_ext = "";
        
       if (file_name != null && file_name != undefined) {
          var i = file_name.lastIndexOf('.');
          file_ext = (i < 0) ? '' : file_name.substr(i);
       }

       filenewname = filenewname + file_ext;
        
       helpers.uploadFileWithThumb(Files,"/uploads/categories/",filenewname,400,callback);
        
        
        
    }
 
    
});

router.post('/category_delete',requiresLogin,function(req, res) {
	
	
	var cat_id=req.body.id;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update categories set is_deleted=1 where cat_id="+mysql.escape(cat_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="category deleted successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});


/*sort categories*/

router.post('/sort_categories',requiresLogin,function(req, res) {
	
	
	var cat_id=req.body.cat_id;
	var indexx=req.body.indexx;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update categories set order_by="+mysql.escape(indexx)+" where cat_id="+mysql.escape(cat_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="order sorted successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});


router.get('/update_category/:cat_id',requiresLogin,function(req, res) {
	
   var cat_id = req.params.cat_id;
   var data={req_path:"/update_category",cat_detail:""};
 
	/* this flash msg after updated */
     data.error=req.flash('error');
     data.success=req.flash('success');
	
	
   var sql_data = "select * from  categories where cat_id="+mysql.escape(cat_id)+"";

   userService.runQuery(sql_data).then(function(result1){
    
	  var sql_data1 = "select * from sub_categories where cat_id="+mysql.escape(cat_id)+" and is_active=1 order by order_by asc";

      userService.runQuery(sql_data1).then(function(result2){
		  
		  var count = 0 ;
		  var call_back = function(flag,index,subsub_result){
			  
			  count++;
			  
			  result2[index]['subsub_cats'] = subsub_result ;
			  
			  if(count >= result2.length){
				  var final=result=result1[0]['sub_cat']=result2;
		          var finalresult=result1[0];
       
	             
	   
		          data.cat_detail=finalresult;
				  
				   res.render('admin/update_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
			  }
			  
		  }
		   
		  if(result2.length > 0 ){
			  
			  for(var i =0;i<result2.length;i++){
			  
			       var sql2 = "select * from sub_sub_categories where sub_cat_id = "+result2[i].id+" and is_active=1 order by order_by asc";
				  
			       userService.runQueryCallback(sql2,i,call_back);
			  
		      }
		  
			  
		  }else{
			  
			  var final=result=result1[0]['sub_cat']=result2;
		      var finalresult=result1[0];
       
		     data.cat_detail=finalresult;
			 
			  res.render('admin/update_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
			  
		  }
		  
	
  
      }).catch(function (err2) { 

        res.render('admin/update_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
    });
	
  
  }).catch(function (err) { 

      res.render('admin/update_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
   });
	
});

router.post('/update_category',requiresLogin,function(req, res) { 
	
	var cat_id=req.body.cat_id;
	var cate_name=req.body.cat_name;
	var sub_catrgory=req.body.sub_catrgory ? req.body.sub_catrgory :"" ;
	var subcat_ids=req.body.subcat_ids;
	var old_file_name=req.body.old_file_name;
	
	var sub_catrgory_id=req.body.sub_catrgory_id;
	var subsub_catrgory=req.body.subsub_catrgory;
    var total_sub_sub_cat=req.body.total_sub_sub_cat;
    var subsub_cat_id=req.body.subsub_cat_id;
	
	var callbackWithImage=function(flag,file_name){
		
	  if(flag){
		        console.log("error on file");
		        req.flash('error',"Internal server error image upload");
			    res.redirect('/prazar_admin/update_category/'+cat_id);
		         
		     }else{
		
				
				 
		     var sql = "update categories set cat_name="+mysql.escape(cate_name)+",cat_image='"+file_name+"' where cat_id="+mysql.escape(cat_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
			
	       if(Array.isArray(sub_catrgory)){
			   
			
			    var call_back3 = function(flag,index,ressss){
							  
						  }
						
						
						var check_counter = 0 ;
						
						   var call_back2 = function(flag,index,result_insrt){
							   
							   if(result_insrt.insertId){
								    var last_id = result_insrt.insertId ;
								   
							   }else{
								  
								    var last_id = 0 ;
							   }
							 
							    var cindex=0;
								for(var i=0;i<total_sub_sub_cat.length;i++){
										for(var j=0;j<total_sub_sub_cat[i];j++){
											if(i==index)
											{
												
												  var subsub_cat_name=subsub_catrgory[cindex];
												  var subsub_cats_id=subsub_cat_id[cindex];
												  var target=" =%?~+";
												  var replacement="-";
													
												  var subsub_cat_slug =helpers.findAndReplace(subsub_cat_name+j, target, replacement);
												   
												 
												 if(last_id == 0){
													 
													 if(subsub_cats_id >0){
														  var sql12 = "UPDATE `sub_sub_categories` SET `name`='"+subsub_cat_name+"',`sub_sub_cat_bslug`='"+subsub_cat_slug+"',`is_active`=1,`order_by`="+j+" WHERE id = "+mysql.escape(subsub_cats_id)+"";
													 }else{
														 
														 var sql12 = "INSERT INTO `sub_sub_categories`(`sub_cat_id`, `name`, `sub_sub_cat_bslug`, `description`,`order_by`) VALUES ("+sub_catrgory_id[index]+",'"+subsub_cat_name+"','"+subsub_cat_slug+"','',"+j+")";
													 }
													
												 }else{
													 
													  var sql12 = "INSERT INTO `sub_sub_categories`(`sub_cat_id`, `name`, `sub_sub_cat_bslug`, `description`,`order_by`) VALUES ("+last_id+",'"+subsub_cat_name+"','"+subsub_cat_slug+"','',"+j+")";
												 }
												
												 
												 console.log(sql12);
												 
												 
												 userService.runQueryCallback(sql12,j,call_back3);
												
											}
											cindex++;
										}
								}
	
							   
							   
							   /*final result response*/
							   check_counter++ ;
							   
							   if(check_counter >=sub_catrgory.length ){
								    req.flash('success',"Category updated successfully");
			                        res.redirect('/prazar_admin/update_category/'+cat_id);
							   }
							   
							  
							   
						   }
						
						
                             for(var i=0; i<sub_catrgory.length;i++){
								 
                                  var sub_cat_id = sub_catrgory_id[i] ;
							   
                                  var sub_cat_name=sub_catrgory[i]+cat_id+i;
                                  var target=" =%?~+";
                                  var replacement="-";
                                    
                                  var sub_cat_slug =helpers.findAndReplace(sub_cat_name, target, replacement);
                               
								 if(sub_cat_id > 0){
									 
									  var sql3="update sub_categories set name="+mysql.escape(sub_catrgory[i])+" , su_cat_bslug = '"+sub_cat_slug+"' , is_active=1,order_by="+i+" where id="+mysql.escape(sub_cat_id)+"";
									  
								 }else{
									 
									   var sql3="insert into sub_categories(cat_id,name,su_cat_bslug,description,order_by) values ('"+cat_id+"',"+mysql.escape(sub_catrgory[i])+","+mysql.escape(sub_cat_slug)+",'',"+i+")";
								 }
							   
								
							     userService.runQueryCallback(sql3,i,call_back2);
							 
                             }
                            
			   
				
				
			         }else{
			 	            var call_back4 = function(flag,index,ressss){
							  
						        }
                        
						          var sub_cat_id = sub_catrgory_id ;
								   
						          var sub_cat_name=sub_catrgory+cat_id;
                                  var target=" =%?~+";
                                  var replacement="-";
                                    
                                  var sub_cat_slug =helpers.findAndReplace(sub_cat_name, target, replacement);
                               
							   
							      if(sub_cat_id > 0){
									   var sql1="update sub_categories set name="+mysql.escape(sub_catrgory)+",su_cat_bslug = "+mysql.escape(sub_cat_slug)+",is_active='1' where id="+mysql.escape(sub_cat_id)+"";
								  }else{
									   var sql1="insert into sub_categories(cat_id,name,su_cat_bslug,description,order_by) values ('"+cat_id+"',"+mysql.escape(sub_catrgory[i])+","+mysql.escape(sub_cat_slug)+",'',"+i+")";
								  }
							   
								 
								 
								 
                                 userService.runQuery(sql1).then(function(result22){
								   
								    if(result22.insertId){
									  sub_cat_id = result22.insertId ;
									  
								    }
								 
								   if(Array.isArray(subsub_catrgory)){
									   
									   for(var i =0;i<subsub_catrgory.length;i++ ){
										   
										          var subsub_cats_id=subsub_cat_id[i];
									              var subsub_cat_name=subsub_catrgory[i];
												  var target=" =%?~+";
												  var replacement="-";
													
												  var subsub_cat_slug =helpers.findAndReplace(subsub_cat_name+i, target, replacement);
												   
											 
											      if(subsub_cats_id >0){
													   var sql12 = "UPDATE `sub_sub_categories` SET `name`='"+subsub_cat_name+"',`sub_sub_cat_bslug`='"+subsub_cat_slug+"',`is_active`=1,`order_by`="+i+" WHERE id = "+mysql.escape(subsub_cats_id)+"";
												  }else{
													  var sql12 = "INSERT INTO `sub_sub_categories`(`sub_cat_id`, `name`, `sub_sub_cat_bslug`, `description`,`order_by`) VALUES ("+sub_cat_id+",'"+subsub_cat_name+"','"+subsub_cat_slug+"','',"+i+")";
												  }
											 
												 console.log("sub sub " +sql12);
												
										       userService.runQueryCallback(sql12,i,call_back4);
								        }
									   
								     }else{
									              var subsub_cats_id=subsub_cat_id;
									              var subsub_cat_name=subsub_catrgory;
												  var target=" =%?~+";
												  var replacement="-";
													
												  var subsub_cat_slug =helpers.findAndReplace(subsub_cat_name+"1", target, replacement);
												 
												 
												 if(subsub_cats_id >0 ){
													 
													  var sql12 = "UPDATE `sub_sub_categories` SET `name`='"+subsub_cat_name+"',`sub_sub_cat_bslug`='"+subsub_cat_slug+"',`is_active`=1,`order_by`=0 WHERE id = "+mysql.escape(subsub_cats_id)+"";
													  
												 }else{
													 
													 var sql12 = "INSERT INTO `sub_sub_categories`(`sub_cat_id`, `name`, `sub_sub_cat_bslug`, `description`,`order_by`) VALUES ("+sub_cat_id+",'"+subsub_cat_name+"','"+subsub_cat_slug+"','',0)";
												 }
												 
												 
												
										         userService.runQueryCallback(sql12,0,call_back4);
									   
								    }
								   
								   
								   //response
								    req.flash('success',"Category updated successfully");
			
			                        res.redirect('/prazar_admin/update_category/'+cat_id);
								   
								   
								 
							   }).catch(function (err22) { console.log(err22);
          
                                data.error="Internal server error";
                    
                                res.render('admin/add_category',{title: 'Prazar Admin password',base_url:config.siteUrl,data:data});
                    
                             });
				
			
	        }
				 
         }).catch(function (err1) { console.log(err1);
		   
		  req.flash('error',"Internal server error");
			
		  res.redirect('/prazar_admin/update_category/'+cat_id);
		    
			 
       });  
				 
				 
	}
		
  }
		
		
	/* entry point start here */	
		
  if(sub_catrgory.length>0){
	
	
	  var Files = req.files.image_file; //cate image
	  
	  if(!Files){
		  console.log("no file");
		  callbackWithImage(false,old_file_name);
		
		}else{
			 console.log("file exist");
			   
			  var file_name = Files.name;
			
			 var filenewname = helpers.getUtcTimestamp();
             var file_ext = "";
		
           if (file_name != null && file_name != undefined) {
              var i = file_name.lastIndexOf('.');
              file_ext = (i < 0) ? '' : file_name.substr(i);
          }

          filenewname = filenewname + file_ext;
		
		  helpers.uploadFileWithThumb(Files,"/uploads/categories/",filenewname,400,callbackWithImage);
			
		
	   }
	

       var Files1 = req.files.image_banner; //cate banner image
		
       if(Files1){
		  
		  
		 var callbackBanner = function(flag,file_name){
			  
			 var sql = "update categories set cat_banner_image='"+file_name+"' where cat_id="+mysql.escape(cat_id)+"";
       
             userService.runQuery(sql).then(function(result2){
			 
			 }).catch(function (err2) { console.log(err2);
		   
		        req.flash('error',"Internal server error");
			
		        res.redirect('/prazar_admin/update_category/'+cat_id);
		    
			 
            });  
			  
		  }
		  
			var file_name = Files1.name;
			
			 var filenewname = helpers.getUtcTimestamp();
             var file_ext = "";
		
            if (file_name != null && file_name != undefined) {
              var i = file_name.lastIndexOf('.');
              file_ext = (i < 0) ? '' : file_name.substr(i);
             }

            filenewname = filenewname + file_ext;
		
		    helpers.uploadNewfile(Files1,"/uploads/categories/",filenewname,callbackBanner);
			
			
		 }

	
   }else{
   
          req.flash('error',"Please select at least one sub category");
		  res.redirect('/prazar_admin/update_category/'+cat_id);
    }	
   
	
});

router.post('/sub_category_delete',requiresLogin,function(req, res) {
	
	
	var sub_cat_id=req.body.id;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update sub_categories set is_active=0 where id="+mysql.escape(sub_cat_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		 var sql = "update  sub_sub_categories set is_active=0 where sub_cat_id="+mysql.escape(sub_cat_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
			 
		    data.message="sub category deleted successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
	      }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
         });	
	  
	  
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});



router.post('/subsub_category_delete',requiresLogin,function(req, res) {
	
	
	var subsub_cat_id=req.body.id;
	
    var data={status:500,message:"internal server error",data:[]};
			
	 
			 
		 var sql = "update  sub_sub_categories set is_active=0 where id="+mysql.escape(subsub_cat_id)+"";
      
         userService.runQuery(sql).then(function(result){
			 
			 
		    data.message="sub category deleted successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
	      }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
         });	
	  

});




/********* new categories sections ********/


router.all('/edit_sub_category/:cat_id/:sub_cat_id',requiresLogin,function(req, res) {
	
   var cat_id = req.params.cat_id;
   var sub_cat_id = req.params.sub_cat_id;
   var data={req_path:"/edit_sub_category",cat_detail:""};
 
	/* this flash msg after updated */
     data.error=req.flash('error');
     data.success=req.flash('success');
	 data.cat_id = cat_id;
	 data.sub_cat_id = sub_cat_id;
	
   var sql_data = "select * from  categories where cat_id="+mysql.escape(cat_id)+"";

   userService.runQuery(sql_data).then(function(result1){
    
	  var sql_data1 = "select * from sub_categories where cat_id="+mysql.escape(cat_id)+" and is_active=1";

      userService.runQuery(sql_data1).then(function(result2){
		 

        var sql_data3 = "select * from sub_sub_categories where sub_cat_id="+mysql.escape(sub_cat_id)+" and is_active=1";

         userService.runQuery(sql_data3).then(function(result3){
		 
		
		 data.cat_detail=result1[0];
		 data.sub_cates=result2;
		 data.subsub_cates=result3;
		  
	     res.render('admin/add_sub_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
  
  
      }).catch(function (err3) { 

        res.render('admin/add_sub_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
    });
  
      }).catch(function (err2) { 

        res.render('admin/add_sub_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
    });
	
  
  }).catch(function (err) { 

      res.render('admin/add_sub_category',{title: 'Prazar Admin update category',base_url:config.siteUrl,data:data});
   });
	
});



/***** potential vendors managemant  ********/

router.get('/potential_vendors',requiresLogin,function(req, res) {
	
   var page = req.query.page ? req.query.page : 0;  
   var limit=10;
   var data={req_path:"/potential_vendors",show_str:"0 to 0 of 0 entries"};
   var results=[];
   var final_result=[];
	
  var sql_total = "select count(users.user_id) as total from users inner join store on users.user_id=store.vendor_id where users.is_requested=1 and users.is_deleted=0 and is_approve!=1";

	 userService.runQuery(sql_total).then(function(result){

      data.total=result[0]['total']; 	
		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	
	  page=page*limit; 
		 
	  var show_limit=page+limit;
		 
	   
	  var sql_data = "select users.*,store.store_name,store.address_line_1,store.store_id from  users inner join store on users.user_id=store.vendor_id where users.is_requested=1 and users.is_deleted=0 and users.is_approve!=1 order by users.registered_on desc limit "+mysql.escape(page)+","+limit+"";

		
		 
	  userService.runQuery(sql_data).then(function(result2){

		  

		   data.show_str="showing "+page+" to "+ (result2.length+page) +" of "+data.total+" entries"; 
		  
		   data.vendors=result2;
		  
		   res.render('admin/potential_vendors',{title: 'Prazar Admin Potential Vendors',base_url:config.siteUrl,data:data}); 
		  

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	  res.render('admin/potential_vendors',{title: 'Prazar Admin Potential Vendors',base_url:config.siteUrl,data:data}); 

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('admin/potential_vendors',{title: 'Prazar Admin Potential Vendors',base_url:config.siteUrl,data:data}); 

   });
	
	
 
	
});

router.all('/potential_vendor_detail',requiresLogin,function(req, res) {
	
   var data={req_path:"/potential_vendors"};
   var vendor_id = req.query.vendor_id ? req.query.vendor_id : 0;  
    
	  var sql_data = "select users.name,users.email as useremail,store.* from  users inner join store on users.user_id=store.vendor_id where users.user_id="+mysql.escape(vendor_id)+" and users.is_requested=1 and users.is_deleted=0 and users.is_approve!=1 order by users.registered_on desc ";
	  userService.runQuery(sql_data).then(function(result){
	  
		   var site_url="";
		  
		   data.vendor_details=result[0];
		  
		   site_url=result[0]['site_url'];
		  
		  if(site_url!=""){
		  
			  data.vendor_products=[];
			  
		      res.render('admin/potential_vendor_detail',{title: 'Prazar Admin Potential Vendor Detail',base_url:config.siteUrl,data:data}); 
			  
			  
		  }else{
		  
			 var sql_data1 = "select vendor_products.*,categories.cat_name from vendor_products inner join categories on vendor_products.category=categories.cat_id where vendor_products.vendor_id="+mysql.escape(vendor_id)+"";
	  userService.runQuery(sql_data1).then(function(result1){
	  
		      if(result1.length==0){
			  
				  data.vendor_products=[];
				  
				  res.render('admin/potential_vendor_detail',{title: 'Prazar Admin Potential Vendor Detail',base_url:config.siteUrl,data:data}); 
				  
			   }else{
				   
				   var products=[];
				   var count=0;
				   
				   var callback=function(flag,index,callback_result){
				   
					   count++;
					   result1[index]['images']=callback_result;
					   products.push(result1[index]);
					   
					   if(count>=result1.length){
					   
						     data.vendor_products=products;
						   
						     res.render('admin/potential_vendor_detail',{title: 'Prazar Admin Potential Vendor Detail',base_url:config.siteUrl,data:data}); 
						   
					    }
					   
				   }
				   
				   for(var i=0;i<result1.length;i++){
					   var sql="select * from vendor_product_images where product_id="+result1[i]['id']+"";
					   userService.runQueryCallback(sql,i,callback);
				   }
			  
			  }
		  
	      }).catch(function (err1) { console.log(err1);

	      res.render('admin/potential_vendor_detail',{title: 'Prazar Admin Potential Vendor Detail',base_url:config.siteUrl,data:data});  

     });
			  
	}
		  

	 }).catch(function (err) { console.log(err);

	res.render('admin/potential_vendor_detail',{title: 'Prazar Admin Potential Vendor Detail',base_url:config.siteUrl,data:data});  

   });
		 

	
});

router.post('/vendor_aprove',requiresLogin,function(req, res) {
	
	var vendor_id=req.body.vendor_id;
	var aprove_status=req.body.aprove_status;
	var status_txt="";
	
	aprove_status=parseInt(aprove_status);
	
	var subject="";
	
	 if(aprove_status==1){
	   status_txt="Approved";
	   subject = "Prazar- Account Approved";
	 }else if(aprove_status==2){
	   status_txt="Rejected";
	   subject = "Prazar- Account Rejected";
	 }else {
	   status_txt="Prazar- Account International Selling";
	 }
	
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update users set is_approve="+mysql.escape(aprove_status)+" where user_id="+mysql.escape(vendor_id)+"";
       
	   userService.runQuery(sql).then(function(result){
			 
	  var sql1 = "select email,name from users where user_id="+vendor_id+"";
       
         userService.runQuery(sql1).then(function(result1){
			 
			 var email=result1[0]['email'];
			 var username=result1[0]['name'];
			 
			//  var subject="Prazar sell with us request status";
			 
			  var verify_code=helpers.randomString(10,"verify_code");
			 
			   if(aprove_status==1){
				   
				   var url=config.siteUrl+"create_password?email="+email+"&code="+verify_code;
				   
				
				   var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}.table_headerLogo{border-width: 0; height: auto; padding-top: 10px;}@media(max-width: 480px){.contents1{width: 100%;}.contents1{width: 100%;}.table_header .table_headerLogo{max-width: 100px !important; margin-top: 18px;}.table_header .table_headerMyAccount h1{font-size: 13px !important;}table[class=hide], img[class=hide], td[class=hide]{display: none !important;}}</style></head><body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0"> <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0" class="table_header"> <tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;"> <div class="column table_headerShopButton" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;"> <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"> <font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font> </td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0; text-align: center;"><a href="#" target="_blank" style="display: inline-block"> <img src="'+config.siteUrl+'front_assets/images/logo.png" style="max-width: 160px" class="table_headerLogo"/> </a></td></tr></table> </div><div class="column table_headerMyAccount" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"> <h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt="">My Account</h1> <font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font> </td></tr></table> </td></tr></table> </div></td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+username+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you for choosing to sell your products on Prazar – we look forward to working with you!</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">You can complete your account registration by clicking on the link below.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px "><a style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px " href="'+url+'" role="button">Continue to shop creation</a><br/></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Prazar is an online shopping destination that brings Australia’s most exceptional brands together under one roof. Because we work exclusively with a select pool of Aussie designers, competition for our sellers is significantly minimised. We want to see your business do well, so we’ve done away with sign-up and transaction fees. We don’t believe in hidden charges, instead we just take a 17% flat rate commission on each sale.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Listings for our sellers are unlimited, but we do ask that all product images uploaded to Prazar are of the highest quality possible. Photos should be high res, well lit and show the product from various angles. It’s also really important to include interesting and informative item descriptions. If we feel like your listings aren’t quite right, we’ll get in touch to let you know.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Don’t forget to include printed invoices in each of your orders and make sure items are sent out within 1-3 days of the order being placed, unless otherwise stated on the product listing. Please don’t give out personal details like email addresses and phone numbers. Instead, you can communicate with your customers using our onsite messaging system.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Our team of retail and advertising experts is on hand to support you every step of the way, running awesome, targeted marketing campaigns all year long. By driving the right traffic to the site, we make sure we match your products to the right audience.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">We want to make sure you get the most out of Prazar, so if there’s anything you need us to help with, send us an email and we’ll get back to you within 24 hours.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Happy selling!</p><p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div></td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table> </div></td></tr></table> </center></body></html>';
				   
				   
			   }else if(aprove_status==2){
				   
				    var url=config.siteUrl;
				   
				   
			    
				  
				   var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt="">My Account</h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+username+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you for contacting Prazar.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">We’re sure your products are amazing and we really appreciate the effort you put it to your seller application, but unfortunately you do not match the current criteria to sell on Prazar.</p> <p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Feel free to get in touch in the near future as we are constantly expanding and evolving our categories and product ranges.<br/><br/>We hope to hear from you again soon.<br/> </p><p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
				  
				     
			   }else{
				   
				   var url=config.siteUrl;
				   
				 
				    var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt="">My Account</h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+username+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you for contacting Prazar.</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">We’re sure your products are great and we really appreciate the effort you put it to your seller application, but unfortunately Prazar.com.au only accepts vendors based or registered in Australia.</p> <p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">If in the future we decide to launch a Prazar global marketplace we will make sure to be in touch.<br/> </p><a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';
				   
				   
			      }
			 
			 
			   helpers.sendMail(email,htmlmsg,"",subject,function(flag,msg,info){
				 
				    data.message="vendor request has been "+status_txt;
			        data.status=200;
				   
				   
				   if(aprove_status==1){
				   
					    var sql2 = "update users set verify_code='"+verify_code+"' where user_id="+vendor_id+"";
                    
						 userService.runQuery(sql2).then(function(result2){

							 res.send(JSON.stringify(data));
							 
							 
						 }).catch(function (err3){ 
							res.send(JSON.stringify(data));
						  }); 
					   
				     }else{

		              res.send(JSON.stringify(data));  
				   
				     }
				   
			          
				 
			   });
			 
		
      
			  }).catch(function (err2){ 
		    res.send(JSON.stringify(data));
          }); 
			 
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

			 
			 
			 
});

router.post('/vendore_request_delete',requiresLogin,function(req, res) {
	
	
	var vendor_id=req.body.vendor_id;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update users set is_deleted=1 where user_id="+mysql.escape(vendor_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="request deleted successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});


/*********** Home page managemant  **************/

router.all('/home_page_managemant',requiresLogin,function(req, res) {
	
   var page = req.query.page ? req.query.page : 0;  
   var results=[];
   var final_result=[];
   var data={req_path:"/home_page_managemant"};
	
	/* 2 cta section slider */
	 var cta_banner_sql = "select * from cta_banners  order by id asc limit 2";
	
    userService.runQuery(cta_banner_sql).then(function(result_cta){
	
		data.cta_banners=result_cta;
		
	/* banners*/
   var sql_banner = "select * from home_page_banners where is_active =1 and is_deleted=0 order by id asc limit 10";
    userService.runQuery(sql_banner).then(function(result){
		
         data.sliders=result;
		
	 var sql_blue_section = "select * from homepage_content ";	
     userService.runQuery(sql_blue_section).then(function(result_blue){
		
	        if(result_blue.length >0){
				
			   data.blue_section=result_blue[0];
				
			}else{
				
			     data.blue_section={};
			 }
		
		 //get popular products
		 
		  var sql_products = "select product.product_name,product.product_id,product.slug,product.sale_price , store.store_name from product inner join store on product.store_id = store.store_id where product.slug in (select product_slug from popular_products where is_active = 1 and is_deleted=0 order by id desc )  limit 6 ";
		 
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
		            res.render('admin/home_page_manag',{title: 'Prazar Admin Home Page Managment',base_url:config.siteUrl,data:data}); 
					 
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
		  res.render('admin/home_page_manag',{title: 'Prazar Admin Home Page Managment',base_url:config.siteUrl,data:data}); 
			  
		  }
		 
	
		 
	}).catch(function (err3) { console.log(err3);

		data.sliders=[];					   
		data.error="Internal server error";
res.render('admin/home_page_manag',{title: 'Prazar Admin Home Page Managment',base_url:config.siteUrl,data:data}); 

   });	 
		 
		 
	}).catch(function (err2) { console.log(err2);

		data.sliders=[];					   
		data.error="Internal server error";
res.render('admin/home_page_manag',{title: 'Prazar Admin Home Page Managment',base_url:config.siteUrl,data:data}); 

   });

	 }).catch(function (err1) { console.log(err1);

		data.sliders=[];					   
		data.error="Internal server error";
res.render('admin/home_page_manag',{title: 'Prazar Admin Home Page Managment',base_url:config.siteUrl,data:data}); 

   });
	
	}).catch(function (err0) { console.log(err0);

		data.sliders=[];					   
		data.error="Internal server error";
res.render('admin/home_page_manag',{title: 'Prazar Admin Home Page Managment',base_url:config.siteUrl,data:data}); 

   });
	
	
	
});

// delete slider
router.post('/delete_slider',requiresLogin,function(req, res) {
	
	
	var slider_id=req.body.slider_id;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update home_page_banners set is_deleted=1 where id="+mysql.escape(slider_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="slider deleted successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});

//add slider

router.post('/add_slider',requiresLogin,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	
	var pro_name=req.body.pro_name ? req.body.pro_name : "";
	var pro_slug=req.body.pro_slug ? req.body.pro_slug : "" ;
	var heading=req.body.heading ;
	var short_des=req.body.short_description ? req.body.short_description :"";
	var today_time=helpers.getUtcTimestamp();
	var Files = req.files.slider_image;
	
	pro_name=pro_name.replace(/'/g, "''");
	heading=heading.replace(/'/g, "''");
	short_des=short_des.replace(/'/g, "''");
	
		var file_name = Files.name;
     	
        var filenewname = helpers.getUtcTimestamp();
        var file_ext = "";
		
        if (file_name != null && file_name != undefined) {
           var i = file_name.lastIndexOf('.');
           file_ext = (i < 0) ? '' : file_name.substr(i);
        }

         filenewname = filenewname + file_ext;
		
		 helpers.uploadNewfile(Files,"/uploads/sliders/",filenewname,function(flag,original_filename){
		 
			if(flag){
			
				res.send(JSON.stringify(data));
				
			}else{
			
			 var sql = "INSERT INTO `home_page_banners`(`product_name`, `product_slug`, `image`, `heading`, `short_desc`, `added_on`) VALUES ("+mysql.escape(pro_name)+","+mysql.escape(pro_slug)+",'"+original_filename+"',"+mysql.escape(heading)+","+mysql.escape(short_des)+",'"+today_time+"')";
       
             userService.runQuery(sql).then(function(result){
			 
		        data.message="slider Added successfully";
			    data.status=200;
			 
		       res.send(JSON.stringify(data));  
      
             }).catch(function (err1){ console.log(err1);
		        res.send(JSON.stringify(data));
            });
				
				
			} 
		 
		  });
  });

//edit slider

router.post('/edit_slider',requiresLogin,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	
	var pro_name=req.body.pro_name  ? req.body.pro_name :"";
	var pro_slug=req.body.pro_slug ? req.body.pro_slug : "";
	var heading=req.body.heading ;
	var short_des=req.body.short_description ? req.body.short_description:"";
	var old_image=req.body.old_image ;
	var slider_id=req.body.slider_id ;
	var today_time=helpers.getUtcTimestamp();
	var Files = req.files.slider_image;
	
	pro_name=pro_name.replace(/'/g, "''");
	heading=heading.replace(/'/g, "''");
	short_des=short_des.replace(/'/g, "''");
	
	var image_callback=function(flag,original_filename){
			
		   var sql = "update `home_page_banners` set `product_name`="+mysql.escape(pro_name)+", `product_slug`="+mysql.escape(pro_slug)+", `image`='"+original_filename+"', `heading`="+mysql.escape(heading)+", `short_desc`="+mysql.escape(short_des)+", `added_on`='"+today_time+"' where id="+mysql.escape(slider_id)+"";
       
             userService.runQuery(sql).then(function(result){
			 
		        data.message="slider updated successfully";
			    data.status=200;
			 
		       res.send(JSON.stringify(data));  
      
             }).catch(function (err1){ console.log(err1);
		        res.send(JSON.stringify(data));
            });
		           
		 
		  }
	
	
	if(Files){
		
		var file_name = Files.name;
     	
        var filenewname = helpers.getUtcTimestamp();
        var file_ext = "";
		
        if (file_name != null && file_name != undefined) {
           var i = file_name.lastIndexOf('.');
           file_ext = (i < 0) ? '' : file_name.substr(i);
        }

         filenewname = filenewname + file_ext;
		
		 helpers.uploadNewfile(Files,"/uploads/sliders/",filenewname,image_callback);
		
	}else{
	 
	    image_callback(false,old_image);
		
	  }
	
	
  });

// edit blue section

router.post('/edit_blue_section',requiresLogin,function(req, res) {
	
	
	var table_id=req.body.table_id;
	var blue_desc=req.body.blue_desc;
	var blue_heading=req.body.blue_heading;
	
	blue_desc=blue_desc.replace(/'/g, "''");
	blue_heading=blue_heading.replace(/'/g, "''");
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update homepage_content set heading="+mysql.escape(blue_heading)+",description="+mysql.escape(blue_desc)+" where id="+mysql.escape(table_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="content saved successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});

// add popular products 

router.post('/add_popular_product',requiresLogin,function(req, res) {
	
	
	var pro_slug=req.body.pro_slug;
	var today_time=helpers.getUtcTimestamp();
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "INSERT INTO `popular_products`(`product_slug`, `added_on`) VALUES ("+mysql.escape(pro_slug)+",'"+today_time+"')";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="What's trending product saved successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});

// delete popular product
router.post('/delete_popular_product',requiresLogin,function(req, res) {
	
	
	var pro_slug=req.body.pro_slug;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update popular_products set is_deleted=1 where product_slug="+mysql.escape(pro_slug)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="product removed from list";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});

/*** get products by search keywords ***/
router.post('/get_products_by_search',requiresLogin,function(req, res) {
	
	
	var keyword=req.body.keyword;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "select product_id,vendor_id,slug,product_name from product where product_name like '"+keyword+"%' and is_active=1 and is_deleted=0";
      
         userService.runQuery(sql).then(function(result){
			 
		    data.message="products found";
			data.status=200;
			data.data=result;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});

//edit_cta
router.post('/edit_cta',requiresLogin,function(req, res) {
	
    var data={status:500,message:"internal server error",data:[]};
	
	var store_name=req.body.store_name ? req.body.store_name : "" ;
	var store_slug=req.body.store_slug ? req.body.store_slug : "" ;
	var heading=req.body.heading ;
	var old_image=req.body.old_image ;
	var cta_id=req.body.cta_id ;
	var today_time=helpers.getUtcTimestamp();
	var Files = req.files.cta_image;
	
	store_name=store_name.replace(/'/g, "''");
	heading=heading.replace(/'/g, "''");
	
	
	var image_callback=function(flag,original_filename){
			
		   var sql = "update `cta_banners` set `store_name`="+mysql.escape(store_name)+", `store_slug`="+mysql.escape(store_slug)+", `image`='"+original_filename+"', `heading`="+mysql.escape(heading)+",`added_on`='"+today_time+"' where id="+mysql.escape(cta_id)+"";
      
             userService.runQuery(sql).then(function(result){
			 
		        data.message="slider updated successfully";
			    data.status=200;
			 
		       res.send(JSON.stringify(data));  
      
             }).catch(function (err1){ console.log(err1);
		        res.send(JSON.stringify(data));
            });
		           
		 
		  }
	
	
	if(Files){
		
		var file_name = Files.name;
     	
        var filenewname = helpers.getUtcTimestamp();
        var file_ext = "";
		
        if (file_name != null && file_name != undefined) {
           var i = file_name.lastIndexOf('.');
           file_ext = (i < 0) ? '' : file_name.substr(i);
        }

         filenewname = filenewname + file_ext;
		
		 helpers.uploadNewfile(Files,"/uploads/cta/",filenewname,image_callback);
		
	}else{
	 
	    image_callback(false,old_image);
		
	  }
	
	
  });

/*** get products by search keywords ***/
router.post('/get_stores_by_search',requiresLogin,function(req, res) {
	
	
	var keyword=req.body.keyword;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "select store.store_id,store.store_name,store.store_slug from store inner join users on store.vendor_id=users.user_id where store.store_name like '"+keyword+"%' and users.is_active=1 and is_deleted=0 and users.is_approve=1";
      
         userService.runQuery(sql).then(function(result){
			 
		    data.message="stores found";
			data.status=200;
			data.data=result;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});

/************ CMS managemant *************/

router.get('/cms_managemant',requiresLogin,function(req, res) {
	
  var data={req_path:"/cms_managemant"};
	
	
	 var sql = "select * from page_contents where is_active=1 order by id asc ";
	
    userService.runQuery(sql).then(function(result){
	
		data.cms_pages=result;
	
		res.render('admin/cms_managemant',{title: 'Prazar Admin Cms Managemant',base_url:config.siteUrl,data:data});
		
		
	}).catch(function (err0) { console.log(err0);

						   
		data.error="Internal server error";
res.render('admin/cms_managemant',{title: 'Prazar Admin Cms Managemant',base_url:config.siteUrl,data:data});

   });
	
	
});

//cms single page 

router.all('/cms_single',requiresLogin,function(req, res) {
	
     var data={req_path:"/cms_single"};
	
	  data.message=req.flash('message');
	
	 var page_key = req.query.page_key;
	
	if(req.body.sub){  //post method
	 
		var page_heading=req.body.page_heading;
		var page_content=req.body.page_content;
		var page_key_update=req.body.page_key_update;
		
		page_heading=page_heading.replace(/'/g, "''");
		page_content=page_content.replace(/'/g, "''");
		
		
    var sql_update = "update  page_contents set page_heading="+mysql.escape(page_heading)+",page_content="+mysql.escape(page_content)+" where page_key="+mysql.escape(page_key_update)+"";
	
    userService.runQuery(sql_update).then(function(result_update){
		  
	    	
		 req.flash('message','content updated successfully');
		
		 res.redirect("/prazar_admin/cms_single?page_key="+page_key_update);
		
	  }).catch(function (err1) { console.log(err1);

						   
		data.error="Internal server error";
res.render('admin/cms_single',{title: 'Prazar Admin Cms single',base_url:config.siteUrl,data:data});

      });
		
		
	  }else{ //get method
	
		   var sql = "select * from page_contents where page_key="+mysql.escape(page_key)+" ";
	
    userService.runQuery(sql).then(function(result){
		
	    if(result.length>0){
			data.page_detail=result[0];
		 }else{
		   data.page_detail={};
		}
		
	
	res.render('admin/cms_single',{title: 'Prazar Admin Cms single',base_url:config.siteUrl,data:data});
		
		
	}).catch(function (err0) { console.log(err0);

						   
		data.error="Internal server error";
res.render('admin/cms_single',{title: 'Prazar Admin Cms single',base_url:config.siteUrl,data:data});

   });
	
}
	
});

/************ footer managemant *************/

router.get('/footer_managemant',requiresLogin,function(req, res) {
	
  var data={req_path:"/footer_managemant"};
	
	
	 var sql = "select * from footer_pages where is_active=1 and is_deleted=0 order by id asc ";
	
    userService.runQuery(sql).then(function(result){
	
		data.footer_pages=result;
	
		res.render('admin/footer_managemant',{title: 'Prazar Admin Footer Managemant',base_url:config.siteUrl,data:data});
		
		
	}).catch(function (err0) { console.log(err0);

						   
		data.error="Internal server error";
res.render('admin/footer_managemant',{title: 'Prazar Admin Footer Managemant',base_url:config.siteUrl,data:data});

   });
	
	
});


//edit footer links
router.post('/add_footer_link',requiresLogin,function(req, res) {
	
	var category=req.body.category; 
	var heading=req.body.heading;
	var url_link=req.body.url_link;
	
	heading=heading.replace(/'/g, "''");
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "INSERT INTO `footer_pages`(`category`, `label`, `url`, `type`) VALUES ("+mysql.escape(category)+","+mysql.escape(heading)+","+mysql.escape(url_link)+",1)";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="Footer link added successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});


//edit footer links
router.post('/edit_footer_link',requiresLogin,function(req, res) {
	
	
	var table_id=req.body.table_id;
	var url_type=req.body.url_type; // 0=internal link ,1=external
	var heading=req.body.heading;
	var url_link=req.body.url_link;
	
	heading=heading.replace(/'/g, "''");
	
	var sql_part="";
	if(url_type==1){
	  var sql_part=",`url`="+mysql.escape(url_link)+"";
	}
	
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "UPDATE `footer_pages` SET `label`="+mysql.escape(heading)+" "+sql_part+" WHERE id="+mysql.escape(table_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="Updated successfully";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});

//delete footer links

router.post('/delete_footer_link',requiresLogin,function(req, res) {
	
	
	var table_id=req.body.id;
	
    var data={status:500,message:"internal server error",data:[]};
			
	  var sql = "update footer_pages set is_deleted=1 where id="+mysql.escape(table_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
		    data.message="link deleted from list";
			data.status=200;
			 
		    res.send(JSON.stringify(data));  
      
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

});


/**************** customer management  *******************/

router.get('/customers',requiresLogin,function(req, res) {
	
   var page = req.query.page ? req.query.page : 0;  
   var limit=20;
   var data={req_path:"/customers",show_str:"0 to 0 of 0 entries"};
   var final_result=[];
	
	 var start_date = req.query.start_date ? req.query.start_date : "";  
	 var end_date = req.query.end_date ? req.query.end_date : ""; 
	
	data.start_date=start_date;
	data.end_date=end_date;
	
	var date_filter="";
	
	 if(start_date!="" && end_date!=""){
	     
		var s_time=helpers.toTimestamp(start_date);
		var e_time=helpers.toTimestamp(end_date);
		 
		 date_filter=" and registered_on between '"+s_time+"' and '"+e_time+"' ";
	 }
	
   var sql_total = "select count(user_id) as total from users where is_deleted=0 and role=1"+date_filter;

	 userService.runQuery(sql_total).then(function(result){

      data.total=result[0]['total']; 		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	  data.limit=limit;
		 
	  page=page*limit; 
		 
	  var sql_data = "select users.user_id,users.email,users.name,users.is_active,customer_billing_address.address_line_1 from users left join  customer_billing_address on users.user_id=customer_billing_address.customer_id where is_deleted=0 and role=1 "+date_filter+" order by users.user_id desc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_data).then(function(result2){
	  
		 
	      data.show_str="showing "+page+" to "+ (result2.length+page) +" of "+data.total+" entries"; 	
		  
		  if(result2.length>0){
		  
			  var count=0;
			  
			  var callback=function(flag,index,result3){
			   
				  var order_id="";
				  var order_no="";
				  var total_purches=0;
										  
				  if(result3[0]['order_id'] != null ){
					  order_id=result3[0]['order_id'];
				  }
				  
				  if(result3[0]['order_no'] != null ){
					   order_no=result3[0]['order_no'];
				  }
				  if(result3[0]['total_purches'] != null ){
					  total_purches=result3[0]['total_purches'];
				  }
				  total_purches=total_purches.toFixed(2);
				  result2[index]['order_id']=order_id;
				  result2[index]['order_no']=order_no;
				  result2[index]['total_purches']=total_purches;
				  result2[index]['total_orders']=result3[0]['total_orders'];
				  
				  final_result[index]=result2[index];
				  
				  count++;
				  
				  if(count>=result2.length){
				      //final
					  data.customers=final_result;
					  res.render('admin/customers',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});  
				  }
				  
			  }
			  
			  
			 for(var i=0;i<result2.length;i++){
	  
				 var user_id=result2[i]['user_id'];
				 
				 var sql="select id as order_id,order_no, count(id) as total_orders,sum(order_total) as total_purches from orders where customer_id="+user_id+"";
				 
				 userService.runQueryCallback(sql,i,callback);
				 
	          }
			  
		  }else{
				   
		     data.customers=[];   
		  
		    res.render('admin/customers',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});  
				   
		  }
          

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	   res.render('admin/customers',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('admin/customers',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
	
	
});


//customer filter by 
router.post('/customer_filter',requiresLogin,function(req, res) {
	
	var filter_val=req.body.filter_val;
    var data={status:500,message:"internal server error",customers:[]};
	var final_result=[];		
	 var date_filter="";
	if(filter_val==1){ //last month
	
		var d = new Date();
        d.setDate(0); 
	    var last=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
	    var first=(d.getMonth()+1)+"/1/"+d.getFullYear();
    
		var s_time=helpers.toTimestamp(first);
		var e_time=helpers.toTimestamp(last);
		 
		//date_filter=" and registered_on between '"+s_time+"' and '"+e_time+"' ";
		
		
	    }else if(filter_val==2){  //last 6 month
	
	      }else{ //last year
	
	     }

	  var sql_data = "select users.user_id,users.email,users.name,users.is_active,customer_billing_address.address_line_1 from users left join  customer_billing_address on users.user_id=customer_billing_address.customer_id where is_deleted=0 and role=1 "+date_filter+" order by users.user_id desc ";

	  userService.runQuery(sql_data).then(function(result2){
		  
		  if(result2.length>0){
		  
			  var count=0;
			  
			  var callback=function(flag,index,result3){
			   
				  var order_id="";
				  var order_no="";
				  var total_purches=0;
										  
				  if(result3[0]['order_id'] != null ){
					  order_id=result3[0]['order_id'];
				  }
				  
				  if(result3[0]['order_no'] != null ){
					   order_no=result3[0]['order_no'];
				  }
				  if(result3[0]['total_purches'] != null ){
					  total_purches=result3[0]['total_purches'];
				  }
				  
				  result2[index]['order_id']=order_id;
				  result2[index]['order_no']=order_no;
				  result2[index]['total_purches']=total_purches;
				  result2[index]['total_orders']=result3[0]['total_orders'];
				  
				  final_result[index]=result2[index];
				  
				  count++;
				  
				  if(count>=result2.length){
				      
					  data.message="data not found";
			          data.status=200;
					  data.customers=final_result;
				     res.send(JSON.stringify(data));  
				  }
				  
			  }
			  
			  
			 for(var i=0;i<result2.length;i++){
	  
				 var user_id=result2[i]['user_id'];
				 
				 var sql="select id as order_id,order_no, count(id) as total_orders,sum(order_total) as total_purches from orders where customer_id="+user_id+"";
				 
				 userService.runQueryCallback(sql,i,callback);
				 
	          }
			  
		  }else{
				   
		             data.customers=[];   
		  
		            data.message="data not found";
			        data.status=200;
				    res.send(JSON.stringify(data));  
				   
		  }
          

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	   res.render('admin/customers',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
		 

	
			 
});

//get single customer details 
router.all('/getsingle_customer',requiresLogin,function(req, res) {
	
	var user_id=req.query.user_id;
	var final_result=[];		

	  var sql_data = "select users.user_id,users.email,users.name,users.is_active,customer_billing_address.address_line_1 from users left join  customer_billing_address on users.user_id=customer_billing_address.customer_id where is_deleted=0 and role=1 and users.user_id="+mysql.escape(user_id)+" order by users.user_id desc ";

	  userService.runQuery(sql_data).then(function(result2){
		  
		  if(result2.length>0){
		  
			  var count=0;
			  
			  var callback=function(flag,index,result3){
			   
				  var order_id="";
				  var order_no="";
				  var total_purches=0;
										  
				  if(result3[0]['order_id'] != null ){
					  order_id=result3[0]['order_id'];
				  }
				  
				  if(result3[0]['order_no'] != null ){
					   order_no=result3[0]['order_no'];
				  }
				  if(result3[0]['total_purches'] != null ){
					  total_purches=result3[0]['total_purches'];
				  }
				  
				  result2[index]['order_id']=order_id;
				  result2[index]['order_no']=order_no;
				  result2[index]['total_purches']=total_purches;
				  result2[index]['total_orders']=result3[0]['total_orders'];
				  
				  final_result[index]=result2[index];
				  
				  count++;
				  
				  if(count>=result2.length){
				      		
					  if(final_result[0].is_active ==1){
					   var cond='<option value="">select...</option> <option value="0">Block Account</option><option value="0">Suspend Account</option> ';
						  
					  }else{
					  var cond='<option value="">select...</option><option value="1">Activat Account</option>';
						    
					  }
					  
					  
					  var model_data='<div class="row"><div class="col-lg-12"><form method="POST" class="edit_customer_pass_form" > <input type="hidden" class="form-control title" name="user_id" value="'+final_result[0].user_id+'"> <input type="hidden" class="form-control title" name="email" value="'+final_result[0].email+'"><div class="form-group form-material floating" data-plugin="formMaterial"> <input type="text" class="form-control title" name="new_pass" required> <label class="floating-label">New Password</label></div><div class="form-group form-material floating" data-plugin="formMaterial"> <button type="submit" class="btn btn-primary submit-btn" >Reset Password</button></div></form><hr/><form method="POST" class="edit_customer_status_form" > <label class="floating-label">Select Action</label> <br/> <select name="customer_status" required>'+cond+' </select> <input type="hidden" class="form-control title" name="user_id" value="'+final_result[0].user_id+'"> <input type="hidden" class="form-control title" name="email" value="'+final_result[0].email+'"><div class="form-group form-material floating" data-plugin="formMaterial"> <label class="floating-label">Reason</label> <br/><textarea rows="4" cols="20" name="reason" required></textarea></div><div class="form-group form-material floating" data-plugin="formMaterial"> <button type="submit" class="btn btn-primary submit-btn1" >Submit</button></div></form></div></div>';
				     res.send(model_data);  
				  }
				  
			  }
			  
			  
			 for(var i=0;i<result2.length;i++){
	  
				 var user_id=result2[i]['user_id'];
				 
				 var sql="select id as order_id,order_no, count(id) as total_orders,sum(order_total) as total_purches from orders where customer_id="+user_id+"";
				 
				 userService.runQueryCallback(sql,i,callback);
				 
	          }
			  
		  }else{
				   
		            
				    res.send("");  
				   
		  }
          

	 }).catch(function (err2) { console.log(err2);

		res.send("");  

   });
		 

	
			 
});


//delete customer account

router.post('/delete_custmer_account',requiresLogin,function(req, res) {
	
	var user_id=req.body.user_id;
	
	
    var data={status:500,message:"internal server error",data:[]};
			
			
	   var sql = "update users set is_deleted=1 where user_id="+mysql.escape(user_id)+"";
       
         userService.runQuery(sql).then(function(result){
			 
	  var sql1 = "select email,name from users where user_id="+mysql.escape(user_id)+"";
       
         userService.runQuery(sql1).then(function(result1){
			 
		//deactivate vendor all products	 
		 var sql2 = "update product set is_active=0,is_deleted=1 where vendor_id="+mysql.escape(user_id)+"";
       
         userService.runQuery(sql2).then(function(result2){
			 
		//update email of user	 
		 var sql3 = "update users set email=CONCAT(email,'del') where user_id="+mysql.escape(user_id)+"";
       
         userService.runQuery(sql3).then(function(result3){
			 
			 
			 var email=result1[0]['email'];
			 var fullname=result1[0]['name'];
			 
			  var subject="Prazar- delete account by administrator";
			 
		   
			 var url=config.siteUrl;
		
				
           var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt="">My Account</h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+fullname+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Notification !</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">your account is deleted by administrator for some reason <br/><br/>.</p> <a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';

				
		   helpers.sendMail(email,htmlmsg,"",subject,function(flag,msg,info){
				 
				    data.message="account has been deleted";
			        data.status=200;
				    res.send(JSON.stringify(data));  
				 
			   });
			 
			 
			  }).catch(function (err4){ 
		         res.send(JSON.stringify(data));
             }); 
      
	           }).catch(function (err3){ 
		         res.send(JSON.stringify(data));
             }); 
	  
			  }).catch(function (err2){ 
		    res.send(JSON.stringify(data));
          }); 
			 
         }).catch(function (err1){ 
		    res.send(JSON.stringify(data));
       });	

			 
			 
});

// reset customer password
router.post('/update_customer_pass',requiresLogin,function(req, res) {
	
	
    var data={status:500,message:"internal server error",data:[]};
	
	var new_pass=String(req.body.new_pass);
	var user_id=req.body.user_id;
	var email=req.body.email;
	
	var salt_str=uniqid();
	
	helpers.hashPassword1(new_pass,salt_str,function(err,hashed_pass){
		
		 
		  var sql = "update users set password='"+hashed_pass+"' where user_id="+mysql.escape(user_id)+"";
       
         userService.runQuery(sql).then(function(result){
		
		     var subject="Prazar- password reset by administrator";
			 
		   
			 var url=config.siteUrl;
				   
			
				
            var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt="">My Account</h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+email+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Account Notification !</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">your account password is reset by administrator for some reason, your new account password is '+new_pass+'<br/><br/>. You can also login with below link </br/></p> <a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';


				
		   helpers.sendMail(email,htmlmsg,"",subject,function(flag,msg,info){
				 
				    data.message="password reset successfully";
			        data.status=200;
				    res.send(JSON.stringify(data));  
				 
			   });
		   
      
         }).catch(function (err1) { 
		   
		    res.send(JSON.stringify(data));  
		
       });
			 
	
	    
	});
  
	
});

// active inactive  customer account
router.post('/update_customer_status',requiresLogin,function(req, res) {
	
	
    var data={status:500,message:"internal server error",data:[]};
	
	
	var user_id=req.body.user_id;
	var email=req.body.email;
	var customer_status=req.body.customer_status;
	var reason=req.body.reason;
	
		
    var sql1 = "select name from users where user_id="+user_id+"";
       
     userService.runQuery(sql1).then(function(result1){
		 
		 if(result1.length>0){
			var username=result1[0]['name'];
		 }else{
			 var username="";
			 
		 }
			 
	var sql = "update users set is_active="+mysql.escape(customer_status)+" where user_id="+mysql.escape(user_id)+"";
       
         userService.runQuery(sql).then(function(result){
		
		     var subject="Prazar- account status updated by administrator";
			 
		   
			 var url=config.siteUrl;
				   
		
				
             var htmlmsg='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title></title> <style type="text/css"> *{-webkit-font-smoothing: antialiased;}body{Margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;}table{border-spacing: 0; color: #333333; font-family: Arial, sans-serif;}img{border: 0;}.wrapper{width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}.webkit{max-width: 600px;}.outer{Margin: 0 auto; width: 100%; max-width: 600px;}.full-width-image img{width: 100%; max-width: 600px; height: auto;}.inner{padding: 10px;}p{Margin: 0; padding-bottom: 10px;}.h1{font-size: 21px; font-weight: bold; Margin-top: 15px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.h2{font-size: 18px; font-weight: bold; Margin-top: 10px; Margin-bottom: 5px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column .contents{text-align: left; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.one-column p{font-size: 14px; Margin-bottom: 10px; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;}.two-column{text-align: center; font-size: 0;}.two-column .column{width: 100%; max-width: 300px; display: inline-block; vertical-align: top;}.contents{width: 100%;}.two-column .contents{font-size: 14px; text-align: left;}.two-column img{width: 100%; max-width: 280px; height: auto;}.two-column .text{padding-top: 10px;}.three-column{text-align: center; font-size: 0; padding-top: 10px; padding-bottom: 10px;}.three-column .column{width: 100%; max-width: 200px; display: inline-block; vertical-align: top;}.three-column .contents{font-size: 14px; text-align: center;}.three-column img{width: 100%; max-width: 180px; height: auto;}.three-column .text{padding-top: 10px;}.img-align-vertical img{display: inline-block; vertical-align: middle;}@media only screen and (max-device-width: 480px){table[class=hide], img[class=hide], td[class=hide]{display: none !important;}.contents1{width: 100%;}.contents1{width: 100%;}</style> </head> <body style="Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;"> <center class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;"> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f2f0;" bgcolor="#f3f2f0;"> <tr> <td width="100%"> <div class="webkit" style="max-width:600px;Margin:0 auto;"> <table class="outer" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px;"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table border="0" width="100%" cellpadding="0" cellspacing="0" > <tr> <td> <table style="width:100%;" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <center> <table border="0" align="center" width="100%" cellpadding="0" cellspacing="0" style="Margin: 0 auto;"> <tbody> <tr> <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border-bottom: 2px solid #d4d4d4;" bgcolor="#FFFFFF"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f2f0"> <tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:left;font-size:0;" ><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:70%; padding-top: 14px;" > <tr> <td width="100" height="40" align="center" bgcolor="#023a56" style="-moz-border-radius:10px; -webkit-border-radius:10px; border-radius: 50px;"><font style="color:#ffffff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; cursor: pointer;"><a href="'+config.siteUrl+'" style="text-decoration: none; color:#fff;">Shop now</a></font></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%" > <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:20px;"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/logo.png" alt="" width="168" height="48" style="border-width:0; max-width:168px; height:auto; display:block; padding-top: 10px; width: auto;"/></a></td></tr></table> </div><div class="column" style="width:33.3%;max-width:33.3%;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0" cellpadding="0" cellspacing="0" border="0" > <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:0px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="left" valign="top">&nbsp;</td></tr><tr> <td align="right" valign="top"><h1 style="border-width:0; height:auto; max-height:16px; padding-top:8px; padding-left:10px; margin-top: 0px; font-size:14px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; line-height:27px;" alt="">My Account</h1><font style="font-size:11px; text-decoration:none; color:#474b53; font-family: Verdana, Geneva, sans-serif; text-align:left; line-height:16px; padding-bottom:30px"></font></td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td>&nbsp;</td></tr></table> </td></tr></tbody> </table> </center> </td></tr></tbody> </table> </td></tr></table> <table class="one-column" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5; border-top:1px solid #e8e7e5" bgcolor="#FFFFFF"> <tr> <td align="center" style="padding:50px 50px 50px 50px"> <p style="color:#262626; font-size:24px; text-align:center; font-family: Verdana, Geneva, sans-serif"><strong>Hi '+username+'</strong></p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Account Notification !</p><p style="color:#262626; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">'+reason+'</br/></p> <a href="'+config.siteUrl+'login" style="color:#00adff; font-size:16px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">www.prazar.com.au/login</a> <p style="color:#000000; font-size:13px; text-align:center; font-family: Verdana, Geneva, sans-serif; line-height:22px ">Thank you, the Prazar team </p></td></tr></table> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td height="30">&nbsp;</td></tr><tr> <td class="two-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;"><!--[if (gte mso 9)|(IE)]> <table width="100%" style="border-spacing:0" > <tr> <td width="60%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:390px;display:inline-block;vertical-align:top;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="100%" align="left" valign="middle" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <p style="color:#787777; font-size:13px; text-align:left; font-family: Verdana, Geneva, sans-serif"> Please do not reply to this email, if you have any questions please visit the help section on our website or contact us at info@prazar.com.au </p></td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td><td width="40%" valign="top" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" ><![endif]--> <div class="column" style="width:100%;max-width:210px;display:inline-block;vertical-align:top;"> <table width="100%" style="border-spacing:0"> <tr> <td class="inner" style="padding-top:0px;padding-bottom:10px; padding-right:10px;padding-left:10px;"> <table class="contents" style="border-spacing:0; width:100%"> <tr> <td width="32%" align="center" valign="top" style="padding-top:0px"> <table width="150" border="0" cellspacing="0" cellpadding="0"> <tr> <td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/fb.png" alt="facebook" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="34" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/tw.png" alt="twitter" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td><td width="33" align="center"><a href="#" target="_blank"><img src="'+config.siteUrl+'front_assets/images/in.png" alt="linkedin" width="36" height="36" border="0" style="border-width:0; max-width:36px;height:auto; display:block; max-height:36px"/></a></td></tr></table> </td></tr></table> </td></tr></table> </div><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </td></tr><tr> <td height="30">&nbsp;</td></tr></table> </td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--> </div></td></tr></table> </center> </body></html>';

				
		   helpers.sendMail(email,htmlmsg,"",subject,function(flag,msg,info){
				 
				    data.message="account updated successfully";
			        data.status=200;
				    res.send(JSON.stringify(data));  
				 
			   });
		   
      
         }).catch(function (err1) { 
		   
		    res.send(JSON.stringify(data));  
		
       });
	   
	   }).catch(function (err2) { 
		   
		    res.send(JSON.stringify(data));  
		
       });
	
  
	
});

/**************** vendor management  *******************/

router.get('/vendors',requiresLogin,function(req, res) {
	
   var page = req.query.page ? req.query.page : 0;  
   var limit=20;
   var data={req_path:"/vendors",show_str:"0 to 0 of 0 entries"};
   var final_result=[];
	
   var start_date = req.query.start_date ? req.query.start_date : "";  
   var end_date = req.query.end_date ? req.query.end_date : ""; 
	
	data.start_date=start_date;
	data.end_date=end_date;
	
	var date_filter="";
	
	 if(start_date!="" && end_date!=""){
	     
		var s_time=helpers.toTimestamp(start_date);
		var e_time=helpers.toTimestamp(end_date);
		 
		 date_filter=" and registered_on between '"+s_time+"' and '"+e_time+"' ";
	 }
	
   var sql_total = "select count(user_id) as total from users where is_deleted=0 and is_approve=1 and  role=10"+date_filter;

	 userService.runQuery(sql_total).then(function(result){

      data.total=result[0]['total']; 		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	  data.limit=limit;
		 
	  page=page*limit; 
		 
	  var sql_data = "select users.user_id,users.email,users.name,users.is_active,store.store_name,store.store_id,store.store_slug,store.store_logo,store.prazar_commision,store.phone_no from users inner join  store on users.user_id=store.vendor_id where is_deleted=0 and role=10 and is_approve=1 "+date_filter+" order by users.user_id desc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_data).then(function(result2){
	 	 
	      data.show_str="showing "+page+" to "+ (result2.length+page) +" of "+data.total+" entries"; 	
		  
		  if(result2.length>0){
		  
			  var count=0;
			  
			  var callback2=function(flag,index,result4){
				  
				  count++;
				  
				  /*sold amy calculation*/
				  
				  var amt_sold=0;
				  for(var j=0;j<result4.length;j++){
				  
				      if(result4[j].code_value > 0 ){
						amt_sold += parseFloat(result4[j].quantity) * (parseFloat(result4[j].unit_price - ((parseFloat(result4[j].code_value) * parseFloat(result4[j].unit_price)) / 100 )));
						}else{
						amt_sold += parseFloat(result4[j].quantity) * parseFloat(result4[j].unit_price);
						}
					  
					  
				  }
				 
				 
				  result2[index]['amt_sold']= amt_sold.toFixed(2);;
				  
				  final_result[index]=result2[index];
				  
				   if(count>=result2.length){
				      //final
					  
					  data.vendors=final_result;
					  res.render('admin/vendors',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});  
				  }
				  
			  }
			  
			  
			  var callback=function(flag,index,result3){
			   
			
				  result2[index]['total_orders']=result3[0]['total'];
				  result2[index]['pending_orders']=result3[1]['total'];
				  result2[index]['unfullfill_orders']=result3[2]['total'];
				 
				  
				 /* sold amt */
				  
				   var user_id=result2[index]['user_id'];
				  
				  var sql_amt="SELECT order_products.code_value,order_products.quantity,order_products.unit_price,product.product_name FROM `order_products` inner join product on product.product_id=order_products.product_id where product.vendor_id="+user_id+"";
				  
				   userService.runQueryCallback(sql_amt,index,callback2);
				  
			  }
			  
			  
			 for(var i=0;i<result2.length;i++){
	  
				 var user_id=result2[i]['user_id'];
				 
				 var sql_data="select count(id) as total from orders where id in (select order_id from order_products where product_id in (select product_id from product where vendor_id="+user_id+")) union all select count(id) as pending_orders from order_products where order_status=0 and product_id in (select product_id from product where vendor_id="+user_id+") union all select count(id) as unfull_filled_order from order_products where order_status!=0 and order_status!=3 and product_id in (select product_id from product where vendor_id="+user_id+")";
				 
				 userService.runQueryCallback(sql_data,i,callback);
				 
	          }
			  
		  }else{
				
			  
			  //final one
		     data.vendors=[];   
		  
		    res.render('admin/vendors',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});  
				   
		  }
          

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	   res.render('admin/vendors',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('admin/vendors',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
	
	
});



router.get('/international_vendors',requiresLogin,function(req, res) {
	
   var page = req.query.page ? req.query.page : 0;  
   var limit=20;
   var data={req_path:"/international_vendors",show_str:"0 to 0 of 0 entries"};
   var final_result=[];
	
   var start_date = req.query.start_date ? req.query.start_date : "";  
   var end_date = req.query.end_date ? req.query.end_date : ""; 
	
	data.start_date=start_date;
	data.end_date=end_date;
	
	var date_filter="";
	
	 if(start_date!="" && end_date!=""){
	     
		var s_time=helpers.toTimestamp(start_date);
		var e_time=helpers.toTimestamp(end_date);
		 
		 date_filter=" and registered_on between '"+s_time+"' and '"+e_time+"' ";
	 }
	
   var sql_total = "select count(users.user_id) as total from users inner join store on users.user_id=store.vendor_id where users.is_deleted=0 and users.is_approve=1 and users.role=10 and (store.country !='Australia' or store.country !='australia') "+date_filter;

	 userService.runQuery(sql_total).then(function(result){

      data.total=result[0]['total']; 		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	  data.limit=limit;
		 
	  page=page*limit; 
		 
	  var sql_data = "select users.user_id,users.email,users.name,users.is_active,store.store_name,store.store_id,store.store_slug,store.store_logo,store.prazar_commision,store.phone_no from users inner join  store on users.user_id=store.vendor_id where is_deleted=0 and role=10 and is_approve=1 and (store.country !='Australia' or store.country !='australia') "+date_filter+" order by users.user_id desc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_data).then(function(result2){
	 	 
	      data.show_str="showing "+page+" to "+ (result2.length+page) +" of "+data.total+" entries"; 	
		  
		  if(result2.length>0){
		  
			  var count=0;
			  
			  var callback2=function(flag,index,result4){
				  
				  count++;
				  
				  /*sold amy calculation*/
				  
				  var amt_sold=0;
				  for(var j=0;j<result4.length;j++){
				  
				      if(result4[j].code_value > 0 ){
						amt_sold += parseFloat(result4[j].quantity) * (parseFloat(result4[j].unit_price - ((parseFloat(result4[j].code_value) * parseFloat(result4[j].unit_price)) / 100 )));
						}else{
						amt_sold += parseFloat(result4[j].quantity) * parseFloat(result4[j].unit_price);
						}
					  
					  
				  }
				 
				 
				  result2[index]['amt_sold']= amt_sold.toFixed(2);;
				  
				  final_result[index]=result2[index];
				  
				   if(count>=result2.length){
				      //final
					  
					  data.vendors=final_result;
					  res.render('admin/international_vendors',{title: 'Prazar Admin International vendors',base_url:config.siteUrl,data:data});  
				  }
				  
			  }
			  
			  
			  var callback=function(flag,index,result3){
			   
			
				  result2[index]['total_orders']=result3[0]['total'];
				  result2[index]['pending_orders']=result3[1]['total'];
				  result2[index]['unfullfill_orders']=result3[2]['total'];
				 
				  
				 /* sold amt */
				  
				   var user_id=result2[index]['user_id'];
				  
				  var sql_amt="SELECT order_products.code_value,order_products.quantity,order_products.unit_price,product.product_name FROM `order_products` inner join product on product.product_id=order_products.product_id where product.vendor_id="+user_id+"";
				  
				   userService.runQueryCallback(sql_amt,index,callback2);
				  
			  }
			  
			  
			 for(var i=0;i<result2.length;i++){
	  
				 var user_id=result2[i]['user_id'];
				 
				 var sql_data="select count(id) as total from orders where id in (select order_id from order_products where product_id in (select product_id from product where vendor_id="+user_id+")) union all select count(id) as pending_orders from order_products where order_status=0 and product_id in (select product_id from product where vendor_id="+user_id+") union all select count(id) as unfull_filled_order from order_products where order_status!=0 and order_status!=3 and product_id in (select product_id from product where vendor_id="+user_id+")";
				 
				 userService.runQueryCallback(sql_data,i,callback);
				 
	          }
			  
		  }else{
				
			  
			  //final one
		     data.vendors=[];   
		  
		    res.render('admin/international_vendors',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});  
				   
		  }
          

	 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	   res.render('admin/international_vendors',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('admin/international_vendors',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
	
	
});


//get vendor category 
router.all('/get_vendor_category',requiresLogin,function(req, res) {
	
	var vendor_id=req.query.vendor_id;
	var final_result=[];		

	  var sql_data = "select DISTINCT cat_name from categories where cat_id in (select cat_id from product_category where product_id in (select product_id from product where vendor_id="+mysql.escape(vendor_id)+" ))";
 
     
	  userService.runQuery(sql_data).then(function(result2){
		  
		  if(result2.length>0){
		  
		    var cates="";
		  
		     for(var i=0;i<result2.length;i++){
				 
				 cates +="<p>"+result2[i]['cat_name']+"</p>";
			 }
		  
		     var model_data='<div class="row"> <div class="col-lg-8"> <div class="form-group" data-plugin="formMaterial">'+cates+'</div></div></div>';
		  
		  
		     res.send(model_data);
		  
		  }else{
			  
			  res.send("<p>category not found</p>");
		  }
          

	 }).catch(function (err2) { console.log(err2);

		res.send("");  

   });
		 

			 
});



//get vendor orders no 
router.all('/get_vendor_orders_no',requiresLogin,function(req, res) {
	
	var vendor_id=req.query.vendor_id;
	var final_result=[];		

	  var sql_data = "select DISTINCT order_no from orders where id in (select order_id from order_products where product_id in (select product_id from product where vendor_id="+mysql.escape(vendor_id)+" )) order by order_no desc limit 50";
 
     
	  userService.runQuery(sql_data).then(function(result2){
		  
		  if(result2.length>0){
		  
		    var orders="";
		  
		     for(var i=0;i<result2.length;i++){
				 
				 orders +="<p>order No:- "+result2[i]['order_no']+"</p>";
			 }
		  
		     var model_data='<div class="row"> <div class="col-lg-8"> <div class="form-group" data-plugin="formMaterial">'+orders+'</div></div></div>';
		  
		  
		     res.send(model_data);
		  
		  }else{
			  
			  res.send("<p>order No not found</p>");
		  }
          

	 }).catch(function (err2) { console.log(err2);

		res.send("");  

   });
		 

	
			 
});


//get customers orders no 

router.all('/get_customer_orders_no',requiresLogin,function(req, res) {
	
	var customer_id=req.query.customer;
	var final_result=[];		

	  var sql_data = "select  order_no from orders  where customer_id="+mysql.escape(customer_id)+" order by order_no desc limit 500";
 
     
	  userService.runQuery(sql_data).then(function(result2){
		  
		  if(result2.length>0){
		  
		    var orders="";
		  
		     for(var i=0;i<result2.length;i++){
				 
				 orders +="<p>order No:- "+result2[i]['order_no']+"</p>";
			 }
		  
		     var model_data='<div class="row customers_orders_admin"> <div class="col-lg-8"> <div class="form-group" data-plugin="formMaterial">'+orders+'</div></div></div>';
		  
		  
		     res.send(model_data);
		  
		  }else{
			  
			  res.send("<p>order No not found</p>");
		  }
          

	 }).catch(function (err2) { console.log(err2);

		res.send("");  

   });
		 

	
			 
});





// set commision percentage of vendor
router.post('/update_vendor_commision',requiresLogin,function(req, res) {
	
	
    var data={status:500,message:"internal server error",data:[]};
	
	
	var vendor_id=req.body.user_id;
	var commision=req.body.commision;
	
	
		 
	var sql = "update store set prazar_commision="+mysql.escape(commision)+" where vendor_id="+mysql.escape(vendor_id)+"";
       
         userService.runQuery(sql).then(function(result){
		
			        data.message="Commission updated successfully";
			        data.status=200;
				    res.send(JSON.stringify(data));  
			 
			
      
         }).catch(function (err1) { 
		   
		    res.send(JSON.stringify(data));  
		
       });
	
  
	
});


/**************** order management   *******************/

//order history
router.get('/order_history',requiresLogin,function(req, res) {
	
   var page = req.query.page ? req.query.page : 0;  
   var limit=30;
   var data={req_path:"/order_history",show_str:"0 to 0 of 0 entries"};
   var final_result=[];
	 
   var sql_total = "SELECT count(order_products.id) as total FROM `order_products`  inner join product on product.product_id=order_products.product_id inner join users on product.vendor_id=users.user_id where (order_products.order_status >=3 or order_products.order_status = 0)";

	 userService.runQuery(sql_total).then(function(result){

      data.total=result[0]['total']; 		 
      data.total_pages = Math.ceil(data.total /limit);   
	  data.page=page;	 
	  data.limit=limit;
		 
	  page=page*limit; 
		 
	 	  var sql_products = "SELECT order_products.*,product.product_name,users.name as vendor_name,store.store_name FROM `order_products`  inner join product on product.product_id=order_products.product_id inner join users on product.vendor_id=users.user_id inner join store on store.vendor_id= product.vendor_id where (order_products.order_status >=3 or order_products.order_status = 0) order by order_products.id desc limit "+mysql.escape(page)+","+limit+"";

	  userService.runQuery(sql_products).then(function(result3){
		  
		  data.show_str="showing "+page+" to "+ (result3.length+page) +" of "+data.total+" entries"; 	
	  
		  if(result3.length>0){
			  
		  var count=0;
		  
		  var callback_order_date=function(flag,index,result_date){
		  
			  
			   var time_stamp=parseInt(result_date[0]['order_date']);
			  
			  
			  
			  result3[index]['order_date']=helpers.utcTimestampToLocalDate(time_stamp,'DD/MM/YY hh:mm A');
		      
			  result3[index]['customer_name']=result_date[0]['ship_fullname'];
			  result3[index]['order_no']=result_date[0]['order_no'];
			  result3[index]['ordered_by']=result_date[0]['ordered_by'];
			  
			  final_result[index]=result3[index];
			  
			        count++;
			  
				    if(count>=result3.length){
						
					   //final result
							//console.log("order history "+JSON.stringify(final_result));
						data.orders=final_result;
						res.render('admin/order_history',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});	
					}
			  
			  
		   }
		  
		  
		  var callback_image=function(flag,index,result_img){
			 
				     result3[index]['images']= result_img[0];
				    
			         final_result[index]=result3[index];
			  
			          //get order date
			         var order_id = result3[index]['order_id'];
				     var sqldate="select orders.order_date,orders.ship_fullname,orders.order_no,users.name as ordered_by from orders inner join  users on orders.customer_id= users.user_id where orders.id="+order_id;
				 
			         userService.runQueryCallback(sqldate,index,callback_order_date);
			      }
			 
		 /* find images*/
		 for(var i=0;i<result3.length;i++){
			         
				       /* total price calculate*/
						/*if(result3[i].code_value > 0 ){
						result3[i].price_total = parseFloat(result3[i].quantity) * (parseFloat(result3[i].unit_price - ((parseFloat(result3[i].code_value) * parseFloat(result3[i].unit_price)) / 100 )));
						}else{
						result3[i].price_total = parseFloat(result3[i].quantity) * parseFloat(result3[i].unit_price);
						}*/
				 
				  
				        var product_id = result3[i]['product_id'];
				 
						var get_product_images = "select * from product_images where product_id = "+product_id+" limit 1";
				 
						userService.runQueryCallback(get_product_images,i,callback_image);
				 
			    }
			  
		 } else{
		 
		   data.orders=[];
			 
			res.render('admin/order_history',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data}); 
			 
		 }
		  
		 }).catch(function (err2) { console.log(err2);

		data.error="Internal server error";

	  res.render('admin/order_history',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   }); 
		 

	 }).catch(function (err1) { console.log(err1);

		data.error="Internal server error";

	   res.render('admin/order_history',{title: 'Prazar Admin Customers',base_url:config.siteUrl,data:data});

   });
	
	
});


/*code by farid */

router.get('/vendors_messages',requiresLogin,function(req, res) {
	
	 var data={req_path:req.path,userdata:req.session.admindata,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	  
     var user_id = req.session.admindata.user_id;
     var to_user_id = req.query.ritknvnd;
     var all_conversations = [];
     var crr_chat_data = {conversation_id:0,reciver_id:to_user_id,msg_data:[]};
     var count = 0;
     var count_final=0;
	
	var callback_final=function(flag,index,result_store){
		
		count_final++;
		
		if(count_final >= all_conversations.length){
			 
			  console.log("conversations"+JSON.stringify(all_conversations));
			 
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
								 res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
							 }).catch(function(e1){
								 res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
							 });
                             
                         }).catch(function(e){
                             data.all_conversations = all_conversations;
                             data.crr_chat_data = crr_chat_data;
                             res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
                            
                         });
                     }else{
                         data.all_conversations = all_conversations;
                         data.crr_chat_data = crr_chat_data;
                         res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
                         
                     }
                 }).catch(function(er){
                     data.all_conversations = all_conversations;
                     data.crr_chat_data = crr_chat_data;
                     res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
                     
                 })
             }else{
                 data.all_conversations = all_conversations;
                 data.crr_chat_data = crr_chat_data;
                 res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
             }        
         }
		
		
	}
	
	
	
     var callback = function(flag,index,results){
		 
         count++;
		 
         if(results.length>0){
			 
			  var check_vendr_id=results[0].user_id;
			 
			 
			  if(check_vendr_id>1){
				 
				var sql_store_name="select store_name,store_logo from store where vendor_id="+check_vendr_id+"";
	
	            userService.runQuery(sql_store_name).then(function(store_re){
		 
		
		        all_conversations[index].to_user_name = store_re[0].store_name;
		        all_conversations[index].contact_name = results[0].name;
				 
				 
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
            res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         
           });
		}else{
			
			getAllConversation();
			
		}	 
		 
	 }
	
    
	function getAllConversation(){
		
		var sql = "(select * from conversation where from_id = "+user_id+" and to_id in (select user_id from users where role = '10' or role = '11') limit 100) union all (select * from conversation where to_id = "+user_id+" and from_id in (select user_id from users where role = '10' or role = '11') limit 100) limit 100";
		
		  userService.runQuery(sql).then(function(r){
         if(r.length){
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
             res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         }
        
     }).catch(function(e){
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         
     });
	 
	}
	
	
	
   }).catch(function(e1){
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('admin/vendors_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         
     });
});

router.get('/customer_messages',requiresLogin,function(req, res) {
	var data={req_path:req.path,userdata:req.session.admindata,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	  
    var user_id = req.session.admindata.user_id;
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
								 res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
							 }).catch(function(e1){
								 res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
							 });
                         }).catch(function(e){
                             data.all_conversations = all_conversations;
                             data.crr_chat_data = crr_chat_data;
                             res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
                            
                         });
                     }else{
                         data.all_conversations = all_conversations;
                         data.crr_chat_data = crr_chat_data;
                         res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
                         
                     }
                 }).catch(function(er){
                     data.all_conversations = all_conversations;
                     data.crr_chat_data = crr_chat_data;
                     res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
                     
                 })
             }else{
                 data.all_conversations = all_conversations;
                 data.crr_chat_data = crr_chat_data;
                 res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
             }        
         }
     }
    
	var sql_check="select id from conversation where (from_id = "+user_id+" and  to_id ="+mysql.escape(to_user_id)+") or from_id ="+mysql.escape(to_user_id)+" and to_id = "+user_id+"";
	
	
	userService.runQuery(sql_check).then(function(rchek){
	
     if(rchek.length>0){
		 
		getAllConversation();
		 
	 }else{  //first time conversation
		 
		 if(to_user_id!=undefined){
		 
		 
		 var insert_q="INSERT INTO `conversation`(`from_id`, `to_id`) VALUES ('"+user_id+"',"+mysql.escape(to_user_id)+")";
		 userService.runQuery(insert_q).then(function(reinsert){
			 
			 
			 getAllConversation();
			 
			 
		   }).catch(function(e2){console.log(e2);
            data.all_conversations = all_conversations;
             data.crr_chat_data = crr_chat_data;
            res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         
           });
		}else{
			
			getAllConversation();
			
		}	 
		 
	 }
	
    
	function getAllConversation(){
		
		var sql = "(select * from conversation where from_id = "+user_id+" and to_id in (select user_id from users where role = '1' or role = '11') limit 100) union all (select * from conversation where to_id = "+user_id+" and from_id in (select user_id from users where role = '1' or role = '11') limit 100) limit 100";
		
		  userService.runQuery(sql).then(function(r){
         if(r.length){
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
         }else{
             data.all_conversations = all_conversations;
             data.crr_chat_data = crr_chat_data;
             res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         }
        
     }).catch(function(e){
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         
     });
	 
	}
	
	
	
   }).catch(function(e1){
         data.all_conversations = all_conversations;
         data.crr_chat_data = crr_chat_data;
         res.render('admin/customer_message',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
         
     });
});

router.get('/vendor_vs_customers',requiresLogin,function(req, res) {
	var data={req_path:req.path,userdata:req.session.admindata,categories:res.locals.categories,cookie_cart_count:res.locals.cookie_cart_count};
	var sql_get_vendor = "select users.user_id , users.name,store.store_name from users inner join store on users.user_id=store.vendor_id where is_active = 1 and is_deleted = 0 and is_approve = 1 and (role = '10' or role = '11')";
	userService.runQuery(sql_get_vendor).then(function(re){
		data.all_vendors = re;
		res.render('admin/vendor_vs_customers',{title: 'Prazar Admin dashboard',base_url:config.siteUrl,data:data});
	}).catch(function(er){
		res.redirect("/prazar_admin");
	});
});

router.post('/get_conversation_by_vendor_id',requiresLogin,function(req, res) {
	var vid = req.body.vid;
	var sql = "(select conversation.id , users.name , users.user_id from conversation inner join users on conversation.from_id = users.user_id where conversation.to_id = "+mysql.escape(vid)+" and conversation.from_id not in (select user_id from users where role = 111)) union all (select conversation.id , users.name , users.user_id from conversation inner join users on conversation.to_id = users.user_id where conversation.from_id = "+mysql.escape(vid)+" and conversation.to_id not in (select user_id from users where role = 111))";
	
	userService.runQuery(sql).then(function(re){
		var html = "<option value=''>Select Customer</option>"
		for(var i = 0;i<re.length;i++){
			html = html+'<option value="'+re[i].id+'--'+re[i].user_id+'">'+re[i].name+'</option>';
		}
		res.send(html);
	}).catch(function(er){
		res.redirect("/prazar_admin");
	});
});

router.post('/get_messages_by_cid',requiresLogin,function(req, res) {
	var vid = req.body.vid;
	var cid_str = req.body.cid;
	var tmp = cid_str.split("--");
	var cid = tmp[0];
	var uid = tmp[1];
	var sql = "select * from messages where conversation_jd = "+mysql.escape(cid)+" order by send_on desc limit 1500";
	
	userService.runQuery(sql).then(function(rmsg){
		var re = rmsg.reverse()
		var first_uname = "";
		var second_uname = "";
		var first_initial = "";
		var second_initial = "";
		userService.runQuery("select name from users where user_id = "+mysql.escape(vid)+"").then(function(rfn){
			var tt = rfn[0].name.split(" ");
			first_uname = rfn[0].name;
			 if(tt.length > 1){
				 var fst = tt[0].charAt(0).toUpperCase();
				 var snd = tt[1].charAt(0).toUpperCase();
				 first_initial = fst+""+snd;
			 }else{
				 var fst = tt[0].charAt(0).toUpperCase();
				 first_initial = fst;
			 }
			 userService.runQuery("select name from users where user_id = "+mysql.escape(uid)+"").then(function(rsn){
				 var ttt = rsn[0].name.split(" ");
				second_uname = rsn[0].name;
				 if(ttt.length > 1){
					 var fst = ttt[0].charAt(0).toUpperCase();
					 var snd = ttt[1].charAt(0).toUpperCase();
					 second_initial = fst+""+snd;
				 }else{
					 var fst = ttt[0].charAt(0).toUpperCase();
					 second_initial = fst;
				 }
				 var html = "";
				for(var i=0;i<re.length;i++){
					var msg = re[i].message;
					var from_user_id = re[i].from_user_id;
					var to_user_id = re[i].to_user_id;
					var file_path = re[i].file_path;
					var message_type = re[i].message_type;
					if(vid == from_user_id){
						html = html+'<div class="chat chat-left"><div class="chat-avatar"><span>'+first_initial+'</span></div>';
					}else{
						html = html+'<div class="chat"><div class="chat-avatar"><span>'+second_initial+'</span></div>';
					}
					html = html+'<div class="chat-body"><div class="chat-content">';
					if(message_type == 0){
						html = html+'<p>'+msg+'</p>';
					}else if(message_type == 1){
						html = html+'<a href="'+config.siteUrl+''+file_path+'" target="_blank"><img src="'+config.siteUrl+''+file_path+'"></img></a>';
					}else{
						html = html+'<a href="'+config.siteUrl+''+file_path+'" target="_blank">'+msg+'</a>';
					}
					html = html+'</div></div></div>';
				}
				res.send(html);
			 }).catch(function(esn){console.log(esn);
				 res.redirect("/prazar_admin");
			 });
		}).catch(function(efn){console.log(efn);
			res.redirect("/prazar_admin");
		});
	}).catch(function(er){console.log(er);
		res.redirect("/prazar_admin");
	});
});

module.exports = router; 