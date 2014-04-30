var fadein = "@-moz-keyframes fadein {\
  from { opacity: 0; }\
  to   { opacity: 1; }\
}\
@-webkit-keyframes fadein {\
  from { opacity: 0; }\
  to   { opacity: 1; }\
}\
@keyframes fadein {\
  from { opacity: 0; }\
  to   { opacity: 1; }\
}\
html {\
     -moz-animation: fadein ease-in 1000ms;\
  -webkit-animation: fadein ease-in 1000ms;\
          animation: fadein ease-in 1000ms;\
}";

var fadeout = "@-moz-keyframes fadeout {\
  from { opacity: 1; }\
  to   { opacity: 0; }\
}\
@-webkit-keyframes fadeout {\
  from { opacity: 1; }\
  to   { opacity: 0; }\
}\
@keyframes fadeout {\
  from { opacity: 1; }\
  to   { opacity: 0; }\
}\
html {\
     -moz-animation: fadeout ease-in-out 500ms;\
  -webkit-animation: fadeout ease-in-out 500ms;\
          animation: fadeout ease-in-out 500ms;\
  opacity: 0;\
}";


var addStyle = function(style){
    if (document && document.head) {
        var styleTag = document.createElement("style");
        styleTag.setAttribute("type","text/css");
        styleTag.textContent = style;
        document.head.appendChild(styleTag);
    }
}

addStyle(fadein);
window.addEventListener("beforeunload",function() { addStyle(fadeout); }, false);

