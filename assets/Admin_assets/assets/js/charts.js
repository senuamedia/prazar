$(document).ready(function() {

   /* var date = new Date();
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    

	for(var i=0;i<date.getMonth();i++){
		var firstDay = new Date(date.getFullYear(),i, 1);
        var lastDay = new Date(date.getFullYear(), i + 1, 0);
        console.log(firstDay);
        console.log(lastDay);
		var toUTC = new Date(firstDay).toUTCString();

        console.log(toUTC);
		var unixTimeZero = Date.parse(toUTC);
         console.log(unixTimeZero);
	}
*/


var customers_counts_str=$("#customers_counts").val();
var customers=customers_counts_str.split(",");
   
var vendors_counts_str=$("#counts_vendors").val();
var vendors=vendors_counts_str.split(",");   
   
var visitors_counts_str=$("#counts_visitor").val();
var visitors=visitors_counts_str.split(",");

var products_counts_str=$("#counts_products").val();
var products=products_counts_str.split(",");

var sub_cat_counts_str=$("#counts_sub_categories").val();
var sub_cats=sub_cat_counts_str.split(",");

var categories_counts_str=$("#counts_categories").val();
var categories=categories_counts_str.split(",");

var orders_counts_str=$("#counts_orders").val();
var orders=orders_counts_str.split(",");

var transections_counts_str=$("#counts_transections").val();
var transections=transections_counts_str.split(","); 
   
   
/*charts customer js*/	
var data1 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    customers,
   
  ]
};

var options1 = {
  seriesBarDistance: 10
};

var responsiveOptions1 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart1', data1, options1, responsiveOptions1);



/*charts vendors js*/	
var data2 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    vendors,
   
  ]
};

var options2 = {
  seriesBarDistance: 10
};

var responsiveOptions2 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart2', data2, options2, responsiveOptions2);



/*charts visitors js*/	
var data3 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    visitors,
   
  ]
};

var options3 = {
  seriesBarDistance: 10
};

var responsiveOptions3 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart3', data3, options3, responsiveOptions3);


/*charts products js*/	
var data4 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    products,
   
  ]
};

var options4 = {
  seriesBarDistance: 10
};

var responsiveOptions4 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart4', data4, options4, responsiveOptions4);


/*charts sub categories js*/	
var data5 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    sub_cats,
   
  ]
};

var options5 = {
  seriesBarDistance: 10
};

var responsiveOptions5 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart5', data5, options5, responsiveOptions5);


/*charts categories js*/	
var data6 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    categories,
   
  ]
};

var options6 = {
  seriesBarDistance: 10
};

var responsiveOptions6 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart6', data6, options6, responsiveOptions6);


/*charts orders js*/	
var data7 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    orders,
   
  ]
};

var options7 = {
  seriesBarDistance: 10
};

var responsiveOptions7 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart7', data7, options7, responsiveOptions7);


/*charts transections js*/	
var data8 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    transections,
   
  ]
};

var options8 = {
  seriesBarDistance: 10
};

var responsiveOptions8 = [
  ['screen and (max-width: 640px)', {
    seriesBarDistance: 5,
    axisX: {
      labelInterpolationFnc: function (value) {
        return value[0];
      }
    }
  }]
];

new Chartist.Bar('.ct-chart8', data8, options8, responsiveOptions8);

	
});	