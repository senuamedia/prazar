var config = require("../config.json");
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var os = require('os');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var fs = require('fs');
var sharp = require('sharp');
var compress_images = require('compress-images');

var base64 = require('file-base64');


/* for create thumnail */
var thumb = require('node-thumbnail').thumb;
var moment = require('moment');
moment().format();

function hashPassword(password,callback) {
	
crypto.pbkdf2(password,'prazar_salt',100000, 64, 'sha512', (err, derivedKey) => {
     if (err){
	      return callback(err);
	 } 
	var hashed= derivedKey.toString('hex');
	callback(null, hashed);
});
	

}

function hashPassword1(password,salt_string,callback) {
	
crypto.pbkdf2(password,salt_string,100000, 64, 'sha512', (err, derivedKey) => {
     if (err){
	      return callback(err);
	 } 
	
	var hashed= derivedKey.toString('hex');
	
	hashed=salt_string+";"+hashed;
	
	callback(null, hashed);
});
	

}


function getUtcTimestamp(){

//var utc_timestamp=Math.floor((new Date()).getTime() / 1000);
var utc_timestamp=moment.utc( new Date() ).valueOf();
return utc_timestamp;
}

function sendMail(email,html_message,text_msg,subject,callBack){ 
	

var from_email=config.smtp_auth_email;
var email_password=config.smtp_auth_pass;
var smtp_host=config.smtp_host;

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host: smtp_host,
    auth: {
        user: from_email,
        pass: email_password
    }
});

// setup email data with unicode symbols
var mailOptions = {
    from: from_email, // sender address
    to: email, // list of receivers
    subject:subject, // Subject line
    text: text_msg, // plain text body 
    html: html_message // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
		//console.log(error);
		callBack(true,'email not sent',error);
    }else{
		//console.log(info);
		
		callBack(false,'email sent',info);
	}
});

}


function sendMailSales(email,html_message,text_msg,subject,callBack){ 
	

var from_email=config.smtp_sales_auth_email;
var email_password=config.smtp_sales_auth_pass;
var smtp_host=config.smtp_sales_host;

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host: smtp_host,
    auth: {
        user: from_email,
        pass: email_password
    }
});

// setup email data with unicode symbols
var mailOptions = {
    from: from_email, // sender address
    to: email, // list of receivers
    subject:subject, // Subject line
    text: text_msg, // plain text body 
    html: html_message // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
		callBack(true,'email not sent',error);
    }else{
		callBack(false,'email sent',info);
	}
});

}


function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function todayDate() {
    var d = new Date(),
        month = (d.getMonth() + 1),
        day = d.getDate(),
        year = d.getFullYear();
	var hour = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();
    if (month < 10 || !month){ month = '0' + month;}
    if (day < 10 || !day){ day = '0' + day;}
	if (hour < 10 || !hour){ hour = '0' + hour;}
    if (min < 10 || !min){ min = '0' + min;}
    if (sec < 10 || !sec){ sec = '0' + sec;}

   return year+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
}


function uploadNewfile1(files,path,filenewname,callback) {
	
	var originalfilename=filenewname;
	
	
	filenewname="./uploads/temp/"+filenewname;
	
	files.mv(filenewname, function(err)  
        {  if(err){
			//console.log(filenewname+"  : "+err);
                callback(true,"");
		}
		else{
		
		  var name_arr=originalfilename.split(".");
		 
		  var INPUT_path_to_your_images ='uploads/temp/**/'+name_arr[0]+'.{jpg,JPG,jpeg,JPEG,png,svg,gif}';
		  
          var OUTPUT_path = path;
		
		  compress_images(INPUT_path_to_your_images, OUTPUT_path, {compress_force: false, statistic: true, autoupdate: true}, false,{jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
                                                {png: {engine: 'pngquant', command: ['--quality=20-50']}},
                                                {svg: {engine: 'svgo', command: '--multipass'}},
                                                {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(){
													
											   var filePath = appDir+"/uploads/temp/"+originalfilename;
											   
			                                     console.log("deleted file path "+filePath);
													 
			                                      if (fs.existsSync(filePath)) {
                
                                                      fs.unlinkSync(filePath);
                                                    }
          });
		  
		  callback(false,originalfilename);
		
		}
		
      });  
  
}


function uploadNewfile(files,path,filenewname,callback) {
	
	var originalfilename=filenewname;
	
	filenewname="."+path+filenewname;
	
	files.mv(filenewname, function(err)  
        {  if(err){
			//console.log(filenewname+"  : "+err);
                callback(true,"");
		}
		else
			callback(false,originalfilename);
        });  
  
}

function uploadFileWithThumb(files,path,filenewname,width,callback) {
	
	var originalfilename=filenewname;
	
	filenewname="."+path+filenewname;
	
	files.mv(filenewname, function(err)  
        {  if(err){
                callback(true,"");
		}else{
			
			
			
			var sourcefile = appDir+path+originalfilename;
			var destination = appDir+path;
			
			thumb({
                 source: sourcefile,
                 destination: destination,
                 concurrency: os.cpus().length,
				 prefix: 't',
                 suffix: '',
                 width: width,
				 overwrite: false,
                 basename: undefined
 				 
                 }, function(files, err, stdout, stderr) {
                   // console.log('All done!');
				    fs.unlinkSync(sourcefile)
               });
			   
		    
				callback(false,"t"+originalfilename);
				
		     }
        });  
  
};


function uploadFileWithSharp(files,path,filenewname,width,height,callback) {
	
	var originalfilename=filenewname;
	
	filenewname="./"+path+filenewname;
	
	files.mv(filenewname, function(err)  
        {  if(err){
                callback(true,"");
		}else{
			
		// send callback firstly	
		callback(false,"c"+originalfilename);	
				
         var imagePath = path+originalfilename;
         var outputImagePath = path+"c"+originalfilename; 
		
	   sharp(imagePath).resize(height, width, {kernel: sharp.kernel.nearest}).crop(sharp.gravity.center).toFile(outputImagePath).then( (ImageResult) => {
		   
		 console.log(ImageResult);  
        
		
		if (fs.existsSync(filenewname)) {
         
			 fs.unlink('path/file.txt', (err) => {
			
			console.log('file was deleted');
			});
		 
		 
       }
		 
       })
		
		}	
   });
  
  
}




function base64Encode(data){
 data=data.toString();
var buff = new Buffer.from(data);  
var base64data = buff.toString('base64');
return base64data;
}

function base64Decode(data){
	data=data.toString();
var buff1 = new Buffer.from(data, 'base64');  
var text = buff1.toString('ascii');
	return text;
}


function uploadImageBase64(file_data,path,filenewname,callback) {
	
	 var main_data = file_data.split("base64,");
	
	 var originalfilename=filenewname;
	
	
	  base64.decode(main_data[1],path+filenewname, function(err, output) {
         
		
		 
		 if(err==null){
			 
			 callback(false,originalfilename);
		 }else{
			 
			 callback(true,"");
			 
		 }
        
      }); 
	
	 
  
}


function testbase64(file_data,path,filenewname,callback){
	
	//console.log(file_data);
	var main_data = file_data.split(";base64,");
	
	 var originalfilename=filenewname;
	
	fs.writeFile(path+filenewname, main_data[1], {encoding: 'base64'}, function(err) {
                              console.log(err+' File created');
							   callback(false,originalfilename);
                             });
	
}


function saveImageFromByte(filename,path,data,callback){
	
	 var originalfilename=filename;
	
  var myBuffer = new Buffer(data.length);
  for (var i = 0; i < data.length; i++) {
      myBuffer[i] = data[i];
  }
  console.log("my buffer "+myBuffer);
  fs.writeFile(path+filename, myBuffer,"binary", function(err) {
      if(err) {
          console.log(err);
		   callback(true,"");
      } else {
          console.log("The file was saved!");
		   callback(false,originalfilename);
      }
  });
  
  
  
  
}



function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
       return true;
   }


function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


function findAndReplace(string, target, replacement) {
 			var i = 0, length = string.length;
 
 			for (i; i < length; i++) {
				for(var j=0;j<target.length;j++){
					string = string.replace(target[j], replacement);	
				}
			}
 
           return string;
 
}


function toTimestamp(strDate){
 var datum = Date.parse(strDate);
 return datum;
}

function utcTimestampToLocalDate(utc_timestamp,formate){
 return moment(new Date(new Date(utc_timestamp).toString())).local().format(formate);//'YYYY-MM-DD HH:mm:ss'
}


exports.htmlEntities = htmlEntities;
exports.isEmpty = isEmpty;
exports.base64Encode = base64Encode;
exports.base64Decode = base64Decode;
exports.uploadFileWithThumb = uploadFileWithThumb;
exports.uploadNewfile = uploadNewfile;
exports.uploadNewfile1 = uploadNewfile1;
exports.todayDate = todayDate;
exports.randomString = randomString;
exports.sendMail = sendMail;
exports.sendMailSales = sendMailSales;
exports.getUtcTimestamp = getUtcTimestamp;
exports.hashPassword = hashPassword;
exports.hashPassword1 = hashPassword1;
exports.findAndReplace = findAndReplace;
exports.toTimestamp = toTimestamp;
exports.utcTimestampToLocalDate = utcTimestampToLocalDate;
exports.uploadImageBase64 = uploadImageBase64;
exports.testbase64 = testbase64;
exports.saveImageFromByte = saveImageFromByte;
exports.uploadFileWithSharp = uploadFileWithSharp;
