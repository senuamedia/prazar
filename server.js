var express = require("express");
var app = express(); // test code farid
var router = express.Router();
var session = require('express-session');
var path = require("path");
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var server = require('https');
var swig = require('swig');
var fs = require('fs');
var flash = require('connect-flash-plus');
var forceSsl = require('express-force-ssl');
var crypto = require('crypto');
var config = require('./config.json');
var userService = require("./services/service");
var helpers = require("./helpers/helpers");
var cookieParser = require('cookie-parser');
var sess;
var moment = require('moment');
moment().format();
var uniqid = require('uniqid');

var base64 = require('file-base64');

var mysql = require("mysql");

/**** set default time zone  *****/

//process.env.TZ = 'Asia/Kolkata';


/* Set path for static assets */

app.use("/", express.static(path.join(__dirname, 'assets/')));
app.use("/", express.static(path.join(__dirname, 'assets/*')));

app.use(express.static(path.join(__dirname, 'uploads/')));
app.use(express.static(path.join(__dirname, 'uploads/*')));


/* Set headers */
app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(cookieParser());




/* set the middleware to load assets according to route */
app.use("/prazar_admin", express.static(path.join(__dirname, 'assets/')));
app.use("/prazar_admin", express.static(path.join(__dirname, 'assets/*')));

app.use("/prazar_admin/update_category", express.static(path.join(__dirname, 'assets/')));
app.use("/prazar_admin/update_category", express.static(path.join(__dirname, 'assets/*')));
app.use("/prazar_admin/edit_sub_category/:a/:b", express.static(path.join(__dirname, 'assets/')));
app.use("/prazar_admin/edit_sub_category/:a/:b", express.static(path.join(__dirname, 'assets/*')));

/* Session and request handlling setting */


app.use(flash());
app.use(forceSsl);
app.use(fileUpload());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));
//app.use(session({ secret: config.secret, resave: true, saveUninitialized: true ,cookie: { maxAge: 30000 }}));



/* set local storage data */
app.use(function(req, res, next) {


    var final_cat = [];
    var sql = "select * from categories where is_active=1 and is_deleted=0 order by order_by asc";

    userService.runQuery(sql).then(function(result) {

        if (result.length > 0) {

            var count = 0;



            var callback = function(flag, index, result_callback) {

                count++;
                result[index]['sub_cat'] = result_callback;

                final_cat[index] = result[index];

                if (count >= result.length) {
                    userService.runQuery("select * from sub_sub_categories where is_active = 1 order by order_by asc").then(function(re_ssc) {
						
                        for (var i = 0; i < final_cat.length; i++) {
                            for (var j = 0; j < final_cat[i]['sub_cat'].length; j++) {
                                var k = 0;
                                final_cat[i]['sub_cat'][j]['sub_sub_cat'] = [];
                                for (var z = 0; z < re_ssc.length; z++) {
                                    if (re_ssc[z]['sub_cat_id'] == final_cat[i]['sub_cat'][j]['id']) {
                                        final_cat[i]['sub_cat'][j]['sub_sub_cat'][k] = re_ssc[z];
                                        k++;
                                    }
                                }
                            }
                        }

                        res.locals.categories = final_cat;

                        /* cart count */

                        var cart_count = 0;
                        if (req.cookies == undefined) {
                            cart_count = 0;
                        } else if (req.cookies.cart_items == undefined) {
                            cart_count = 0;
                        } else {

                            cart_count = JSON.parse(req.cookies.cart_items).length;
                        }

                        res.locals.cookie_cart_count = cart_count;
                        if (req.session && req.session.userdata) {
                            var login_user_id = req.session.userdata.user_id;
                            var sql_get_unread_mesage = "select count(id) as total_unread from messages where to_user_id = " + login_user_id + " and is_read = 0";
                            userService.runQuery(sql_get_unread_mesage).then(function(res_unread_msg) {

                                res.locals.unread_msg_count = res_unread_msg[0].total_unread;
                                if (req.session.userdata.user_role == 'vendor') {
                                    var sql_pending_return_requ = "select count(id) as total from order_products where product_id in (select product_id from product where vendor_id = " + login_user_id + ") and is_return = 1";
                                    userService.runQuery(sql_pending_return_requ).then(function(re_prr) {
                                        res.locals.pending_return_request = re_prr[0].total;
                                        next();
                                    }).catch(function(er_prr) {
                                        console.log(er_prr);
                                        next();
                                    });
                                } else if (req.session.userdata.user_role == 'consumer') {
                                    var sql_updated_return_requ = "select count(id) as total from order_products where order_id in (select id from orders where customer_id = " + login_user_id + ") and is_return != 1 and is_return != 0";
                                    userService.runQuery(sql_updated_return_requ).then(function(re_urr) {
                                        res.locals.updated_return_request = re_urr[0].total;
                                        next();
                                    }).catch(function(er_prr) {
                                        console.log(er_prr);
                                        next();
                                    });
                                } else {
                                    next();
                                }
                            }).catch(function(er_unread_msg) {
                                console.log(er_unread_msg);
                                next();
                            });

                        } else {
                            next();
                        }

                    }).catch(function(er_ssc) {
                        res.locals.categories = [];
                        next();
                    });

                }

            }



            for (var i = 0; i < result.length; i++) {

                var cat_id = result[i]['cat_id'];
                var sql2 = "select * from sub_categories where cat_id='" + cat_id + "' and is_active=1 order by order_by asc";
                userService.runQueryCallback(sql2, i, callback);

            }


        } else {
            res.locals.categories = [];
            next();
        }


    }).catch(function(err) {
        console.log(err);
    });

});

/* Template engine depandencies start here */
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views/', path.join(__dirname + 'views/'));

/* Routing start here */
app.use("/", require("./controllers/index.controller"));
app.use("/prazar_admin/", require("./controllers/admin.controller"));
app.use("/api/web", require("./controllers/api/web.controller"));

/* Bind server on default port of https */


var options = {
    key: fs.readFileSync('privateKey.key'),
    cert: fs.readFileSync('certificate.crt')
};

var Server = server.createServer(options, app);

Server.listen(8089, function() {

    console.log('Server listening at http://' + Server.domain + ':' + Server.defaultPort);
});


var http = require('http');

http.createServer(function(req, res) {

    // return res.redirect('wss://' + req.headers.host + req.url)  

    console.log(req.headers['host'] + req.url);
    console.log(req.headers['host'] + req.url);
    res.writeHead(301, {
        "Location": "https://" + req.headers['host'] + req.url
    });
    res.end();
}).listen(8086);


/* Start Socket connection */

var io = require('socket.io').listen(Server, {
    pingInterval: 10000,
    pingTimeout: 5000
});


io.on('connection', function(socket) {
    console.log('new connection from socket ');
    socket.on('join_chat', function(data) {
        var uid = data;
        socket.join(uid);
        io.sockets.in(uid).emit('join_chat', "success");
    });


    socket.on('send_msg_file', function(data) {
        var reciver_id = data.reciver_id;
        var user_id = data.user_id;
        var file_date = data.file_date;
        var file_name = data.file_name;
        var file_type = data.file_type;
        var ext = data.ext;
        var conversation_jd = data.conversation_jd;
        var message = file_name;
        var today = helpers.getUtcTimestamp();
        var main_data = file_date.split("base64,");


        base64.decode(main_data[1], 'uploads/messages/' + today + '.' + ext, function(err, output) {
            var path = "messages/" + today + '.' + ext;
            var sql_inset_msg = "insert into messages (conversation_jd,from_user_id,to_user_id,message,file_path,message_type,send_on) values (" + mysql.escape(conversation_jd) + " , " + mysql.escape(user_id) + "," + mysql.escape(reciver_id) + " , " + mysql.escape(message) + ",'" + path + "'," + mysql.escape(file_type) + "," + today + ")";
            userService.runQuery(sql_inset_msg).then(function(rim) {
                io.sockets.in(reciver_id).emit("recive_message", {
                    conversation_jd: conversation_jd,
                    message: message,
                    file_path: path,
                    from_user_id: user_id,
                    message_type: file_type
                });
                io.sockets.in(user_id).emit("success_send_img", {
                    status: 200,
                    message: message,
                    file_path: path,
                    message_type: file_type
                });
            }).catch(function(eim) {
                io.sockets.in(user_id).emit("success_send_img", {
                    status: 500
                });
            });
        });
    });

    socket.on('send_msg', function(data) {

        var reciver_id = data.reciver_id;
        var user_id = data.user_id;
        var message = data.message;
        var conversation_jd = data.conversation_jd;
        var today = helpers.getUtcTimestamp();

        message = message.replace(/'/g, "''");

        function insert_message(io) {
            var sql_inset_msg = "insert into messages (conversation_jd,from_user_id,to_user_id,message,file_path,message_type,send_on) values (" + mysql.escape(conversation_jd) + " , " + mysql.escape(user_id) + "," + mysql.escape(reciver_id) + " , " + mysql.escape(message) + ",'',0," + today + ")";
            userService.runQuery(sql_inset_msg).then(function(rim) {
                io.sockets.in(reciver_id).emit("recive_message", {
                    conversation_jd: conversation_jd,
                    message: message,
                    file_path: "",
                    from_user_id: user_id,
                    message_type: 0
                });
                io.sockets.in(user_id).emit("success_send", "200");
            }).catch(function(eim) {
                io.sockets.in(user_id).emit("success_send", "500");
            });
        }

        if (conversation_jd != 0) {
            userService.runQuery("update conversation set last_msg_on = " + today + " where id = " + mysql.escape(conversation_jd) + "").then(function(ri) {
                insert_message(io);
            }).catch(function(ei) {
                io.sockets.in(user_id).emit("success_send", "500");
            });
        } else {
            userService.runQuery("insert into conversation (from_id , to_id , last_msg_on) values (" + mysql.escape(user_id) + " , " + mysql.escape(reciver_id) + " , " + today + ")").then(function(ri) {
                conversation_jd = ri.insertId;
                insert_message(io);
            }).catch(function(ei) {
                io.sockets.in(user_id).emit("success_send", "500");
            });
        }

    });
});