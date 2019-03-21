/*!
 * Cropper v0.9.1
 * https://github.com/fengyuanchen/cropper
 *
 * Copyright (c) 2014-2015 Fengyuan Chen and contributors
 * Released under the MIT license
 *
 * Date: 2015-03-21T04:58:27.265Z
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){function b(a){return"number"==typeof a}function c(a){return"undefined"==typeof a}function d(a,c){var d=[];return b(c)&&d.push(c),d.slice.apply(a,d)}function e(a,b){var c=d(arguments,2);return function(){return a.apply(b,c.concat(d(arguments)))}}function f(a){var b=a.match(/^(https?:)\/\/([^\:\/\?#]+):?(\d*)/i);return b&&(b[1]!==n.protocol||b[2]!==n.hostname||b[3]!==n.port)}function g(a){var b="timestamp="+(new Date).getTime();return a+(-1===a.indexOf("?")?"?":"&")+b}function h(a){return a?"rotate("+a+"deg)":"none"}function i(a,b){var c,d,e=P(a.degree)%180,f=(e>90?180-e:e)*Math.PI/180,g=Q(f),h=R(f),i=a.width,j=a.height,k=a.aspectRatio;return b?(c=i/(h+g/k),d=c/k):(c=i*h+j*g,d=i*g+j*h),{width:c,height:d}}function j(b,c){var d=a("<canvas>")[0],e=d.getContext("2d"),f=c.naturalWidth,g=c.naturalHeight,h=c.rotate,j=i({width:f,height:g,degree:h});return h?(d.width=j.width,d.height=j.height,e.save(),e.translate(j.width/2,j.height/2),e.rotate(h*Math.PI/180),e.drawImage(b,-f/2,-g/2,f,g),e.restore()):(d.width=f,d.height=g,e.drawImage(b,0,0,f,g)),d}function k(b,c){this.$element=a(b),this.options=a.extend({},k.DEFAULTS,a.isPlainObject(c)&&c),this.ready=!1,this.built=!1,this.rotated=!1,this.cropped=!1,this.disabled=!1,this.load()}var l=a(window),m=a(document),n=window.location,o=".cropper",p=/^(e|n|w|s|ne|nw|sw|se|all|crop|move|zoom)$/,q="cropper-modal",r="cropper-hide",s="cropper-hidden",t="cropper-invisible",u="cropper-move",v="cropper-crop",w="cropper-disabled",x="cropper-bg",y="mousedown touchstart",z="mousemove touchmove",A="mouseup mouseleave touchend touchleave touchcancel",B="wheel mousewheel DOMMouseScroll",C="dblclick",D="resize"+o,E="build"+o,F="built"+o,G="dragstart"+o,H="dragmove"+o,I="dragend"+o,J="zoomin"+o,K="zoomout"+o,L=a.isFunction(a("<canvas>")[0].getContext),M=Math.sqrt,N=Math.min,O=Math.max,P=Math.abs,Q=Math.sin,R=Math.cos,S=parseFloat,T={};T.load=function(b){var c,d,e,h=this.options,i=this.$element;b||(i.is("img")?b=i.prop("src"):i.is("canvas")&&L&&(b=i[0].toDataURL())),b&&(d=a.Event(E),i.one(E,h.build).trigger(d),d.isDefaultPrevented()||(h.checkImageOrigin&&f(b)&&(c=" crossOrigin",i.prop("crossOrigin")||(b=g(b))),this.$clone=e=a("<img>"),e.one("load",a.proxy(function(){var a=e.prop("naturalWidth")||e.width(),c=e.prop("naturalHeight")||e.height();this.image={naturalWidth:a,naturalHeight:c,aspectRatio:a/c,rotate:0},this.url=b,this.ready=!0,this.build()},this)).attr({src:b,crossOrigin:c}),e.addClass(r).insertAfter(i)))},T.build=function(){var b,c,d=this.$element,e=this.$clone,f=this.options;this.ready&&(this.built&&this.unbuild(),this.$cropper=b=a(k.TEMPLATE),d.addClass(s),e.removeClass(r),this.$container=d.parent().append(b),this.$canvas=b.find(".cropper-canvas").append(e),this.$dragBox=b.find(".cropper-drag-box"),this.$cropBox=c=b.find(".cropper-crop-box"),this.$viewBox=b.find(".cropper-view-box"),this.addListeners(),this.initPreview(),f.aspectRatio=S(f.aspectRatio)||0/0,f.autoCrop?(this.cropped=!0,f.modal&&this.$dragBox.addClass(q)):c.addClass(s),f.background&&b.addClass(x),f.highlight||c.find(".cropper-face").addClass(t),f.guides||c.find(".cropper-dashed").addClass(s),f.movable||c.find(".cropper-face").data("drag","move"),f.resizable||c.find(".cropper-line, .cropper-point").addClass(s),this.setDragMode(f.dragCrop?"crop":"move"),this.built=!0,this.render(),d.one(F,f.built).trigger(F))},T.unbuild=function(){this.built&&(this.built=!1,this.removeListeners(),this.$preview.empty(),this.$preview=null,this.$viewBox=null,this.$cropBox=null,this.$dragBox=null,this.$canvas=null,this.$container=null,this.$cropper.remove(),this.$cropper=null)},a.extend(T,{render:function(){this.initContainer(),this.initCanvas(),this.initCropBox()},initContainer:function(){var a=this.$element,b=this.$container,c=this.$cropper,d=this.options;c.addClass(s),a.removeClass(s),c.css(this.container={width:O(b.width(),S(d.minContainerWidth)||200),height:O(b.height(),S(d.minContainerHeight)||100)}),a.addClass(s),c.removeClass(s)},initCanvas:function(){var b=this.options,c=this.container,d=c.width,e=c.height,f=this.image,g=f.aspectRatio,h={aspectRatio:g,width:d,height:e,left:0,top:0,minLeft:-d,minTop:-e,maxLeft:d,maxTop:e,minWidth:0,minHeight:0,maxWidth:1/0,maxHeight:1/0};e*g>d?b.strict?h.width=e*g:h.height=d/g:b.strict?h.height=d/g:h.width=e*g,h.oldLeft=h.left=(d-h.width)/2,h.oldTop=h.top=(e-h.height)/2,this.canvas=h,this.limitCanvas(),this.initialImage=a.extend({},f),this.initialCanvas=a.extend({},this.canvas),this.renderCanvas()},limitCanvas:function(){var a=this.options,b=this.container,c=b.width,d=b.height,e=this.canvas,f=e.aspectRatio,g=c,h=d;d*f>c?a.strict?g=d*f:h=c/f:a.strict?h=c/f:g=d*f,a.strict?(e.minWidth=g,e.minHeight=h,e.maxLeft=0,e.maxTop=0,e.minLeft=c-g,e.minTop=d-h):(e.minLeft=-g,e.minTop=-h)},renderCanvas:function(b){var c,d,e,f=this.options,g=this.container,j=this.canvas,k=this.image;this.rotated&&(this.rotated=!1,e=i({width:k.width,height:k.height,degree:k.rotate}),c=e.width/e.height,c!==j.aspectRatio&&(j.left-=(e.width-j.width)/2,j.top-=(e.height-j.height)/2,j.width=e.width,j.height=e.height,j.aspectRatio=c,this.limitCanvas())),(j.width>j.maxWidth||j.width<j.minWidth)&&(j.left=j.oldLeft),(j.height>j.maxHeight||j.height<j.minHeight)&&(j.top=j.oldTop),j.width=N(O(j.width,j.minWidth),j.maxWidth),j.height=N(O(j.height,j.minHeight),j.maxHeight),f.strict?(j.minLeft=g.width-j.width,j.minTop=g.height-j.height):(j.minLeft=-j.width,j.minTop=-j.height),j.oldLeft=j.left=N(O(j.left,j.minLeft),j.maxLeft),j.oldTop=j.top=N(O(j.top,j.minTop),j.maxTop),this.$canvas.css({width:j.width,height:j.height,left:j.left,top:j.top}),k.rotate?(d=i({width:j.width,height:j.height,degree:k.rotate,aspectRatio:k.aspectRatio},!0),a.extend(k,{width:d.width,height:d.height,left:(j.width-d.width)/2,top:(j.height-d.height)/2})):a.extend(k,{width:j.width,height:j.height,left:0,top:0}),this.$clone.css({width:k.width,height:k.height,marginLeft:k.left,marginTop:k.top,transform:h(k.rotate)}),b&&(this.preview(),f.crop&&f.crop.call(this.$element,this.getData()))},initCropBox:function(){var b=this.options,c=this.container,d=this.canvas,e=b.strict,f=b.aspectRatio,g=S(b.minCropBoxWidth)||0,h=S(b.minCropBoxHeight)||0,i=S(b.autoCropArea)||.8,j=c.width,k=c.height,l={width:e?j:d.width,height:e?k:d.height,minWidth:g,minHeight:h,maxWidth:j,maxHeight:k};f&&(k*f>j?(l.height=l.width/f,l.maxHeight=j/f):(l.width=l.height*f,l.maxWidth=k*f),e||(l.height*d.aspectRatio>l.width?(l.height=d.height,l.width=l.height*f):(l.width=d.width,l.height=l.width/f)),g?l.minHeight=l.minWidth/f:h&&(l.minWidth=l.minHeight*f)),l.minWidth=N(l.maxWidth,l.minWidth),l.minHeight=N(l.maxHeight,l.minHeight),l.width=O(l.minWidth,l.width*i),l.height=O(l.minHeight,l.height*i),l.oldLeft=l.left=(j-l.width)/2,l.oldTop=l.top=(k-l.height)/2,this.initialCropBox=a.extend({},l),this.cropBox=l,this.cropped&&this.renderCropBox()},renderCropBox:function(){var a=this.options,b=this.container,c=b.width,d=b.height,e=this.$cropBox,f=this.cropBox;(f.width>f.maxWidth||f.width<f.minWidth)&&(f.left=f.oldLeft),(f.height>f.maxHeight||f.height<f.minHeight)&&(f.top=f.oldTop),f.width=N(O(f.width,f.minWidth),f.maxWidth),f.height=N(O(f.height,f.minHeight),f.maxHeight),f.oldLeft=f.left=N(O(f.left,0),c-f.width),f.oldTop=f.top=N(O(f.top,0),d-f.height),a.movable&&e.find(".cropper-face").data("drag",f.width===c&&f.height===d?"move":"all"),e.css({width:f.width,height:f.height,left:f.left,top:f.top}),this.disabled||(this.preview(),a.crop&&a.crop.call(this.$element,this.getData()))}}),T.initPreview=function(){var b=this.url;this.$preview=a(this.options.preview),this.$viewBox.html('<img src="'+b+'">'),this.$preview.each(function(){var c=a(this);c.data({width:c.width(),height:c.height()}).html('<img src="'+b+'" style="display:block;width:100%;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important;image-orientation: 0deg!important">')})},T.preview=function(){var b=this.image,c=this.canvas,d=this.cropBox,e=b.width,f=b.height,g=d.left-c.left-b.left,i=d.top-c.top-b.top,j=b.rotate;this.cropped&&!this.disabled&&(this.$viewBox.find("img").css({width:e,height:f,marginLeft:-g,marginTop:-i,transform:h(j)}),this.$preview.each(function(){var b=a(this),c=b.data(),k=c.width/d.width,l=c.width,m=d.height*k;m>c.height&&(k=c.height/d.height,l=d.width*k,m=c.height),b.width(l).height(m).find("img").css({width:e*k,height:f*k,marginLeft:-g*k,marginTop:-i*k,transform:h(j)})}))},T.addListeners=function(){var b=this.options;this.$element.on(G,b.dragstart).on(H,b.dragmove).on(I,b.dragend).on(J,b.zoomin).on(K,b.zoomout),this.$cropper.on(y,a.proxy(this.dragstart,this)).on(C,a.proxy(this.dblclick,this)),b.zoomable&&b.mouseWheelZoom&&this.$cropper.on(B,a.proxy(this.wheel,this)),m.on(z,this._dragmove=e(this.dragmove,this)).on(A,this._dragend=e(this.dragend,this)),b.responsive&&l.on(D,this._resize=e(this.resize,this))},T.removeListeners=function(){var a=this.options;this.$element.off(G,a.dragstart).off(H,a.dragmove).off(I,a.dragend).off(J,a.zoomin).off(K,a.zoomout),this.$cropper.off(y,this.dragstart).off(C,this.dblclick),a.zoomable&&a.mouseWheelZoom&&this.$cropper.off(B,this.wheel),m.off(z,this._dragmove).off(A,this._dragend),a.responsive&&l.off(D,this._resize)},a.extend(T,{resize:function(){var b,c,d,e=this.$container,f=this.container;this.disabled||(d=e.width()/f.width,(1!==d||e.height()!==f.height)&&(b=this.getCanvasData(),c=this.getCropBoxData(),this.render(),this.setCanvasData(a.each(b,function(a,c){b[a]=c*d})),this.setCropBoxData(a.each(c,function(a,b){c[a]=b*d}))))},dblclick:function(){this.disabled||this.setDragMode(this.$dragBox.hasClass(v)?"move":"crop")},wheel:function(a){var b=a.originalEvent,c=1;this.disabled||(a.preventDefault(),b.deltaY?c=b.deltaY>0?1:-1:b.wheelDelta?c=-b.wheelDelta/120:b.detail&&(c=b.detail>0?1:-1),this.zoom(.1*c))},dragstart:function(b){var c,d,e,f=this.options,g=b.originalEvent,h=g&&g.touches,i=b;if(!this.disabled){if(h){if(e=h.length,e>1){if(!f.zoomable||!f.touchDragZoom||2!==e)return;i=h[1],this.startX2=i.pageX,this.startY2=i.pageY,c="zoom"}i=h[0]}if(c=c||a(i.target).data("drag"),p.test(c)){if(b.preventDefault(),d=a.Event(G,{originalEvent:g,dragType:c}),this.$element.trigger(d),d.isDefaultPrevented())return;this.dragType=c,this.cropping=!1,this.startX=i.pageX,this.startY=i.pageY,"crop"===c&&(this.cropping=!0,this.$dragBox.addClass(q))}}},dragmove:function(b){var c,d,e=this.options,f=b.originalEvent,g=f&&f.touches,h=b,i=this.dragType;if(!this.disabled){if(g){if(d=g.length,d>1){if(!e.zoomable||!e.touchDragZoom||2!==d)return;h=g[1],this.endX2=h.pageX,this.endY2=h.pageY}h=g[0]}if(i){if(b.preventDefault(),c=a.Event(H,{originalEvent:f,dragType:i}),this.$element.trigger(c),c.isDefaultPrevented())return;this.endX=h.pageX,this.endY=h.pageY,this.change()}}},dragend:function(b){var c,d=this.dragType;if(!this.disabled&&d){if(b.preventDefault(),c=a.Event(I,{originalEvent:b.originalEvent,dragType:d}),this.$element.trigger(c),c.isDefaultPrevented())return;this.cropping&&(this.cropping=!1,this.$dragBox.toggleClass(q,this.cropped&&this.options.modal)),this.dragType=""}}}),a.extend(T,{reset:function(){this.disabled||(this.image=a.extend({},this.initialImage),this.canvas=a.extend({},this.initialCanvas),this.renderCanvas(),this.cropped&&(this.cropBox=a.extend({},this.initialCropBox),this.renderCropBox()))},clear:function(){this.cropped&&!this.disabled&&(a.extend(this.cropBox,{left:0,top:0,width:0,height:0}),this.renderCropBox(),this.cropped=!1,this.$dragBox.removeClass(q),this.$cropBox.addClass(s))},destroy:function(){var a=this.$element;this.ready||this.$clone.off("load").remove(),this.unbuild(),a.removeClass(s).removeData("cropper")},replace:function(a){this.ready&&!this.disabled&&a&&this.load(a)},enable:function(){this.built&&(this.disabled=!1,this.$cropper.removeClass(w))},disable:function(){this.built&&(this.disabled=!0,this.$cropper.addClass(w))},move:function(a,c){var d=this.canvas;this.built&&!this.disabled&&b(a)&&b(c)&&(d.left+=a,d.top+=c,this.renderCanvas(!0))},zoom:function(b){var c,d,e,f=this.canvas;if(b=S(b),b&&this.built&&!this.disabled&&this.options.zoomable){if(c=a.Event(b>0?J:K),this.$element.trigger(c),c.isDefaultPrevented())return;b=-1>=b?1/(1-b):1>=b?1+b:b,d=f.width*b,e=f.height*b,f.left-=(d-f.width)/2,f.top-=(e-f.height)/2,f.width=d,f.height=e,this.renderCanvas(!0),this.setDragMode("move")}},rotate:function(a){var b=this.image;a=S(a),a&&this.built&&!this.disabled&&this.options.rotatable&&(b.rotate=(b.rotate+a)%360,this.rotated=!0,this.renderCanvas(!0))},getData:function(){var b,c,d=this.cropBox,e=this.canvas,f=this.image,g=f.rotate;return this.built&&this.cropped?(c={x:d.left-e.left,y:d.top-e.top,width:d.width,height:d.height},b=f.width/f.naturalWidth,a.each(c,function(a,d){d/=b,c[a]=d})):c={x:0,y:0,width:0,height:0},c.rotate=g,c},getContainerData:function(){return this.built?this.container:{}},getImageData:function(){return this.ready?this.image:{}},getCanvasData:function(){var a,b=this.canvas;return this.built&&(a={left:b.left,top:b.top,width:b.width,height:b.height}),a||{}},setCanvasData:function(c){var d=this.canvas,e=d.aspectRatio;this.built&&!this.disabled&&a.isPlainObject(c)&&(b(c.left)&&(d.left=c.left),b(c.top)&&(d.top=c.top),b(c.width)?(d.width=c.width,d.height=c.width/e):b(c.height)&&(d.height=c.height,d.width=c.height*e),this.renderCanvas(!0))},getCropBoxData:function(){var a,b=this.cropBox;return this.built&&this.cropped&&(a={left:b.left,top:b.top,width:b.width,height:b.height}),a||{}},setCropBoxData:function(c){var d=this.cropBox,e=this.options.aspectRatio;this.built&&this.cropped&&!this.disabled&&a.isPlainObject(c)&&(b(c.left)&&(d.left=c.left),b(c.top)&&(d.top=c.top),e?b(c.width)?(d.width=c.width,d.height=d.width/e):b(c.height)&&(d.height=c.height,d.width=d.height*e):(b(c.width)&&(d.width=c.width),b(c.height)&&(d.height=c.height)),this.renderCropBox())},getCroppedCanvas:function(b){var c,d,e,f,g,h,i,k,l,m,n;if(this.built&&this.cropped&&L)return a.isPlainObject(b)||(b={}),n=this.getData(),c=n.width,d=n.height,k=c/d,a.isPlainObject(b)&&(g=b.width,h=b.height,g?(h=g/k,i=g/c):h&&(g=h*k,i=h/d)),e=g||c,f=h||d,l=a("<canvas>")[0],l.width=e,l.height=f,m=l.getContext("2d"),b.fillColor&&(m.fillStyle=b.fillColor,m.fillRect(0,0,e,f)),m.drawImage.apply(m,function(){var a,b,e,f,g,h,k=j(this.$clone[0],this.image),l=k.width,m=k.height,o=[k],p=n.x,q=n.y;return-c>=p||p>l?p=a=e=g=0:0>=p?(e=-p,p=0,a=g=N(l,c+p)):l>=p&&(e=0,a=g=N(c,l-p)),0>=a||-d>=q||q>m?q=b=f=h=0:0>=q?(f=-q,q=0,b=h=N(m,d+q)):m>=q&&(f=0,b=h=N(d,m-q)),o.push(p,q,a,b),i&&(e*=i,f*=i,g*=i,h*=i),g>0&&h>0&&o.push(e,f,g,h),o}.call(this)),l},setAspectRatio:function(a){var b=this.options;this.disabled||c(a)||(b.aspectRatio=S(a)||0/0,this.built&&this.initCropBox())},setDragMode:function(a){var b=this.$dragBox,c=!1,d=!1;if(this.ready&&!this.disabled){switch(a){case"crop":this.options.dragCrop?(c=!0,b.data("drag",a)):d=!0;break;case"move":d=!0,b.data("drag",a);break;default:b.removeData("drag")}b.toggleClass(v,c).toggleClass(u,d)}}}),T.change=function(){var a,b=this.dragType,c=this.canvas,d=this.container,e=d.width,f=d.height,g=this.cropBox,h=g.width,i=g.height,j=g.left,k=g.top,l=j+h,m=k+i,n=!0,o=this.options.aspectRatio,p={x:this.endX-this.startX,y:this.endY-this.startY};switch(o&&(p.X=p.y*o,p.Y=p.x/o),b){case"all":j+=p.x,k+=p.y;break;case"e":if(p.x>=0&&(l>=e||o&&(0>=k||m>=f))){n=!1;break}h+=p.x,o&&(i=h/o,k-=p.Y/2),0>h&&(b="w",h=0);break;case"n":if(p.y<=0&&(0>=k||o&&(0>=j||l>=e))){n=!1;break}i-=p.y,k+=p.y,o&&(h=i*o,j+=p.X/2),0>i&&(b="s",i=0);break;case"w":if(p.x<=0&&(0>=j||o&&(0>=k||m>=f))){n=!1;break}h-=p.x,j+=p.x,o&&(i=h/o,k+=p.Y/2),0>h&&(b="e",h=0);break;case"s":if(p.y>=0&&(m>=f||o&&(0>=j||l>=e))){n=!1;break}i+=p.y,o&&(h=i*o,j-=p.X/2),0>i&&(b="n",i=0);break;case"ne":if(o){if(p.y<=0&&(0>=k||l>=e)){n=!1;break}i-=p.y,k+=p.y,h=i*o}else p.x>=0?e>l?h+=p.x:p.y<=0&&0>=k&&(n=!1):h+=p.x,p.y<=0?k>0&&(i-=p.y,k+=p.y):(i-=p.y,k+=p.y);0>h&&0>i?(b="sw",i=0,h=0):0>h?(b="nw",h=0):0>i&&(b="se",i=0);break;case"nw":if(o){if(p.y<=0&&(0>=k||0>=j)){n=!1;break}i-=p.y,k+=p.y,h=i*o,j+=p.X}else p.x<=0?j>0?(h-=p.x,j+=p.x):p.y<=0&&0>=k&&(n=!1):(h-=p.x,j+=p.x),p.y<=0?k>0&&(i-=p.y,k+=p.y):(i-=p.y,k+=p.y);0>h&&0>i?(b="se",i=0,h=0):0>h?(b="ne",h=0):0>i&&(b="sw",i=0);break;case"sw":if(o){if(p.x<=0&&(0>=j||m>=f)){n=!1;break}h-=p.x,j+=p.x,i=h/o}else p.x<=0?j>0?(h-=p.x,j+=p.x):p.y>=0&&m>=f&&(n=!1):(h-=p.x,j+=p.x),p.y>=0?f>m&&(i+=p.y):i+=p.y;0>h&&0>i?(b="ne",i=0,h=0):0>h?(b="se",h=0):0>i&&(b="nw",i=0);break;case"se":if(o){if(p.x>=0&&(l>=e||m>=f)){n=!1;break}h+=p.x,i=h/o}else p.x>=0?e>l?h+=p.x:p.y>=0&&m>=f&&(n=!1):h+=p.x,p.y>=0?f>m&&(i+=p.y):i+=p.y;0>h&&0>i?(b="nw",i=0,h=0):0>h?(b="sw",h=0):0>i&&(b="ne",i=0);break;case"move":c.left+=p.x,c.top+=p.y,this.renderCanvas(!0),n=!1;break;case"zoom":this.zoom(function(a,b,c,d){var e=M(a*a+b*b),f=M(c*c+d*d);return(f-e)/e}(P(this.startX-this.startX2),P(this.startY-this.startY2),P(this.endX-this.endX2),P(this.endY-this.endY2))),this.startX2=this.endX2,this.startY2=this.endY2,n=!1;break;case"crop":p.x&&p.y&&(a=this.$cropper.offset(),j=this.startX-a.left,k=this.startY-a.top,h=g.minWidth,i=g.minHeight,p.x>0?p.y>0?b="se":(b="ne",k-=i):p.y>0?(b="sw",j-=h):(b="nw",j-=h,k-=i),this.cropped||(this.cropped=!0,this.$cropBox.removeClass(s)))}n&&(g.width=h,g.height=i,g.left=j,g.top=k,this.dragType=b,this.renderCropBox()),this.startX=this.endX,this.startY=this.endY},a.extend(k.prototype,T),k.DEFAULTS={aspectRatio:0/0,autoCropArea:.8,crop:null,preview:"",strict:!0,responsive:!0,checkImageOrigin:!0,modal:!0,guides:!0,highlight:!0,background:!0,autoCrop:!0,dragCrop:!0,movable:!0,resizable:!0,rotatable:!0,zoomable:!0,touchDragZoom:!0,mouseWheelZoom:!0,minCropBoxWidth:0,minCropBoxHeight:0,minContainerWidth:200,minContainerHeight:100,build:null,built:null,dragstart:null,dragmove:null,dragend:null,zoomin:null,zoomout:null},k.setDefaults=function(b){a.extend(k.DEFAULTS,b)},k.TEMPLATE=function(a,b){return b=b.split(","),a.replace(/\d+/g,function(a){return b[a]})}('<0 6="5-container"><0 6="5-canvas"></0><0 6="5-2-9" 3-2="move"></0><0 6="5-crop-9"><1 6="5-view-9"></1><1 6="5-8 8-h"></1><1 6="5-8 8-v"></1><1 6="5-face" 3-2="all"></1><1 6="5-7 7-e" 3-2="e"></1><1 6="5-7 7-n" 3-2="n"></1><1 6="5-7 7-w" 3-2="w"></1><1 6="5-7 7-s" 3-2="s"></1><1 6="5-4 4-e" 3-2="e"></1><1 6="5-4 4-n" 3-2="n"></1><1 6="5-4 4-w" 3-2="w"></1><1 6="5-4 4-s" 3-2="s"></1><1 6="5-4 4-ne" 3-2="ne"></1><1 6="5-4 4-nw" 3-2="nw"></1><1 6="5-4 4-sw" 3-2="sw"></1><1 6="5-4 4-se" 3-2="se"></1></0></0>',"div,span,drag,data,point,cropper,class,line,dashed,box"),k.other=a.fn.cropper,a.fn.cropper=function(b){var e,f=d(arguments,1);return this.each(function(){var c,d=a(this),g=d.data("cropper");g||d.data("cropper",g=new k(this,b)),"string"==typeof b&&a.isFunction(c=g[b])&&(e=c.apply(g,f))}),c(e)?this:e},a.fn.cropper.Constructor=k,a.fn.cropper.setDefaults=k.setDefaults,a.fn.cropper.noConflict=function(){return a.fn.cropper=k.other,this}});