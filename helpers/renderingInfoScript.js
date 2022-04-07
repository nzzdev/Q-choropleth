function getScript(id, baseMapUrl, context) {
  const functionName = `renderChoropleth${id}`;
  const dataObject = `${id}Data`;
  const breakpoint = 500; // in px
  return `
    if (!window.q_domready) {
      window.q_domready = new Promise(function(resolve) {
        if (document.readyState && (document.readyState === 'interactive' || document.readyState === 'complete')) {
          resolve();
        } else {
          function onReady() {
            resolve();
            document.removeEventListener('DOMContentLoaded', onReady, true);
          }
          document.addEventListener('DOMContentLoaded', onReady, true);
          document.onreadystatechange = function() {
            if (document.readyState === "interactive") {
              resolve();
            }
          }
        }
      });
    }
    var ${dataObject} = {
      element: document.querySelector("#${id}_container")
    };
    function debounce(func){
      var timer;
      return function(event){
        if(timer) clearTimeout(timer);
        timer = setTimeout(func,700,event);
      };
    }
    function ${functionName}() {
      fetch("${baseMapUrl}&isMobile=" + (${dataObject}.width < ${breakpoint}))
        .then(function(response) {
          return response.json();
        })
        .then(function(baseMap) {
          var props = ${JSON.stringify(context)};
          ${dataObject}.element.innerHTML = "";
          props.baseMap = baseMap;
          new window._q_choropleth.Choropleth({
            "target": ${dataObject}.element,
            "props": props
          })
        });
    }
    window.q_domready.then(function() {
      ${dataObject}.width = ${dataObject}.element.getBoundingClientRect().width;
      ${functionName}();
    });
    window.addEventListener('resize', debounce(function() {
      requestAnimationFrame(function() {
        var newWidth = ${dataObject}.element.getBoundingClientRect().width;
        if (newWidth !== ${dataObject}.width) {
          ${dataObject}.width = newWidth;
          ${functionName}();
        }
      });
    }));
  `;
}

module.exports = {
  getScript: getScript,
};