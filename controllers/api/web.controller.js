var config = require("../../config.json");
var express = require("express");
var router = express.Router();
var userService = require("../../services/service");
var crypto = require('crypto');
var randomstring = require("randomstring");
var nodemailer = require('nodemailer');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var dateFormat = require('dateformat');
var helpers = require("../../helpers/helpers");
var uniqid = require('uniqid');

var mysql = require("mysql");

router.post("/authenticate",authenticate);
router.post("/getsubcatBycatId",getsubcatBycatId);
router.post("/getsubsubcatBysubcatId",getsubsubcatBysubcatId);
router.post("/getVariantsOptions",getVariantsOptions);
router.post("/getStatesByCountry",getStatesByCountry);
router.post("/getCitiesByStates",getCitiesByStates);
router.post("/getStatesByCountryAndState",getStatesByCountryAndState);


module.exports = router;

function authenticate(req,res){
	
    var email = req.body.email;
    var pass = String(req.body.pass);
	
   
    var sql = "select * from users where email = "+mysql.escape(email)+" and password != '' and is_deleted = 0";

    userService.runQuery(sql).then(function(result){
		
        if (result.length > 0) {
			
			 var db_password=result[0]['password'];
			 var pass_arr = db_password.split(";");
			 
			 var salt_str=pass_arr[0];
			
		 helpers.hashPassword1(pass,salt_str,function(err,hashed_pass){
			
		if(hashed_pass==db_password){	 
			 
            var user_id = result[0].user_id;
            var role = result[0].role;
            var is_active = result[0].is_active;
			
			var is_admin= role & 0100 ;
			
			
            if(is_active == 0){
				
             var error_obj={msg:'Account deactivated',email:email}
                req.flash('error',error_obj);
			    res.redirect('/prazar_admin');
				
            }else if(!is_admin){
				
				var error_obj={msg:'Your not auth user',email:email}
                req.flash('error',error_obj);
			    res.redirect('/prazar_admin');
				
            }else{
			
				/* Login Successfull */
				req.session.admindata = result[0];
			    res.redirect('/prazar_admin/dashboard');
				
			}
		 }else{
		    
			     var error_obj={msg:'Invalid password',email:email}
                 req.flash('error',error_obj);
			     res.redirect('/prazar_admin');
		  }	
			
		  });
           
        }else{
			
			 var error_obj={msg:'Invalid username',email:email}
             req.flash('error',error_obj);
			 res.redirect('/prazar_admin');
        }
    }).catch(function (err) {
		
             var error_obj={msg:'Internal server error',email:email}
             req.flash('error',error_obj);
			 res.redirect('/prazar_admin');
    });
	   

	
    
}

function getsubcatBycatId(req,res){
	
	
    var cat_id = req.body.cat_id;
    var cat_id1 = req.body.cat_id1 ? req.body.cat_id1 :0;
   
    cat_id=mysql.escape(cat_id);
    cat_id1=mysql.escape(cat_id1);
  
   
	var ids=[cat_id,cat_id1];
	
	var data={status:500,message:"internal server error",data:[]};
	
    var sql = "select * from sub_categories where cat_id in("+ids+") and is_active =1";
    
    userService.runQuery(sql).then(function(result){
		
            data.message="sub category found";
			data.status=200;
			data.data=result;
		    res.send(JSON.stringify(data));  
		
    }).catch(function (err) {
		
             res.send(JSON.stringify(data));
    });
	   
	
	
    
}



function getsubsubcatBysubcatId(req,res){
	
	
    var sub_cat_ids = req.body.sub_cat_id;
   
    
   
    //sub_cat_ids=mysql.escape(sub_cat_ids);
   
	var data={status:500,message:"internal server error",data:[]};
	
    var sql = "select * from sub_sub_categories where sub_cat_id in("+sub_cat_ids+") and is_active =1";
   
    userService.runQuery(sql).then(function(result){
		
            data.message="sub sub category found";
			data.status=200;
			data.data=result;
		    res.send(JSON.stringify(data));  
		
    }).catch(function (err) {
		
             res.send(JSON.stringify(data));
    });
	   
	
	
    
}




function getVariantsOptions(req,res){
	
    var varaint_id = req.body.varaint_id;
    
   
    var sql = "select * from variant_value where variant_id = "+mysql.escape(varaint_id)+" ";

    userService.runQuery(sql).then(function(result){
		
		var response={status:200,msg:"sucess",data:result};
		res.send(JSON.stringify(response));
       
    }).catch(function (err) {
		
             var response={status:500,msg:"error",data:[]};
		     res.send(JSON.stringify(response));
    });
	   

}


function getStatesByCountry(req,res){
	
    var country_name = req.body.country_name;
    
   
    var sql = "select * from states where country_id in (select id from countries where name="+mysql.escape(country_name)+")";

    userService.runQuery(sql).then(function(result){
		
		var response={status:200,msg:"success",data:result};
		res.send(JSON.stringify(response));
       
    }).catch(function (err) {
		
             var response={status:500,msg:"error",data:[]};
		     res.send(JSON.stringify(response));
    });
	   

}


function getCitiesByStates(req,res){
	
    var state_name = req.body.state_name;
    
   
    var sql = "select * from cities where state_id in (select id from states where name="+mysql.escape(state_name)+")";

    userService.runQuery(sql).then(function(result){
		
		var response={status:200,msg:"success",data:result};
		res.send(JSON.stringify(response));
       
    }).catch(function (err) {
		
             var response={status:500,msg:"error",data:[]};
		     res.send(JSON.stringify(response));
    });
	   

}

function getStatesByCountryAndState(req,res){
	
    var country_name = req.body.country_name;
    var state_name = req.body.state_name;
    
   
    var sql = "select * from states where name!="+mysql.escape(state_name)+" and country_id in (select id from countries where name="+mysql.escape(country_name)+")";

	
	
    userService.runQuery(sql).then(function(result){
		
		var response={status:200,msg:"sucess",data:result};
		res.send(JSON.stringify(response));
       
    }).catch(function (err) {
		
             var response={status:500,msg:"error",data:[]};
		     res.send(JSON.stringify(response));
    });
	   

}
