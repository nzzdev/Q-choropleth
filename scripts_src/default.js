export default class Choropleth {
  constructor(element, data = {}) {
    console.log("begin constructor");
    if (element) {
      this.element = element;
      this.data = data;
      this.width = this.data.width;
      this.isMethodBoxVisible = false;

      if (!this.width) {
        console.log("no width given");
        this.width = this.element.getBoundingClientRect().width;
        console.log("got width: " + this.width);
        this.addResizeEventListenerToContainer();
        console.log("resize event listener added");
        this.callRenderingInfo();
        console.log("rendering info called");
      } else if (this.data.choroplethType === "numerical") {
        console.log("width given or calculated, setting up method box");
        this.setupMethodBox();
      }
    }
  }

  addResizeEventListenerToContainer() {
    window.addEventListener(
      "resize",
      debounce(() => {
        requestAnimationFrame(() => {
          const newWidth = this.element.getBoundingClientRect().width;
          if (newWidth !== this.width) {
            this.width = newWidth;
            this.callRenderingInfo();
          }
        });
      }, 250)
    );
  }

  callRenderingInfo() {
    let toolRuntimeConfig = this.data.toolRuntimeConfig;
    toolRuntimeConfig.size = {
      width: [
        {
          comparison: "=",
          value: this.width,
        },
      ],
    };

    fetch(`${toolRuntimeConfig.toolBaseUrl}/rendering-info/web`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ item: this.data.item, toolRuntimeConfig }),
    })
      .then((response) => {
        console.log("response: " + response);
        if (!response) {
          return {};
        }
        return response.json();
      })
      .then((renderingInfo) => {
        console.log("proceed with rendering Info");
        if (renderingInfo.markup) {
          this.element.innerHTML = renderingInfo.markup;
          if (this.data.choroplethType === "numerical") {
            this.setupMethodBox();
          }
        }
      });
  }

  setupMethodBox() {
    this.prepareMethodBoxElements();
    this.setVisibilityOfElements();
    this.addEventListenerToMethodBoxToggle();
    this.addEventListenerToMethodBoxArticleLink();
  }

  prepareMethodBoxElements() {
    console.log("prepare method box elements");
    this.methodBoxToggleElement = this.element.querySelector(
      `.q-choropleth-methods-link`
    );
    this.methodBoxContainerElement = this.element.querySelector(
      ".q-choropleth-methods-container"
    );
    this.methodBoxOpenIcon = this.element.querySelector(
      ".q-choropleth-methods-link-icon-plus"
    );
    this.methodBoxCloseIcon = this.element.querySelector(
      ".q-choropleth-methods-link-icon-close"
    );
    this.methodBoxArticleLink = this.element.querySelector(
      ".q-choropleth-methods-article-container"
    );
  }

  setVisibilityOfElements() {
    console.log("set visibility");
    if (this.isMethodBoxVisible) {
      console.log("method box visible");
      this.methodBoxContainerElement.classList.remove("hidden");
      this.methodBoxOpenIcon.classList.add("hidden");
      this.methodBoxCloseIcon.classList.remove("hidden");
    } else {
      console.log("method box not visible");
      this.methodBoxContainerElement.classList.add("hidden");
      console.log("container element hidden");
      this.methodBoxCloseIcon.classList.add("hidden");
      console.log("close icon hidden");
      this.methodBoxOpenIcon.classList.remove("hidden");
      console.log("open icon visible");
    }
  }

  addEventListenerToMethodBoxToggle() {
    console.log("add event listener toggle");
    if (this.methodBoxToggleElement) {
      this.methodBoxToggleElement.addEventListener("click", (event) => {
        this.handleClickOnMethodBoxToogle(event);
      });
    }
  }

  handleClickOnMethodBoxToogle(event) {
    console.log("handle toggle click");
    const eventDetail = {
      eventInfo: {
        componentName: "q-choropleth",
        eventAction: this.isMethodBoxVisible
          ? "close-methods-box"
          : "open-methods-box",
        eventNonInteractive: false,
      },
    };

    this.isMethodBoxVisible = !this.isMethodBoxVisible;
    this.setVisibilityOfElements();

    const trackingEvent = new CustomEvent("q-tracking-event", {
      bubbles: true,
      detail: eventDetail,
    });
    event.target.dispatchEvent(trackingEvent);
  }

  addEventListenerToMethodBoxArticleLink() {
    console.log("add event listener to article link");
    if (this.methodBoxArticleLink) {
      this.methodBoxArticleLink.addEventListener("click", (event) => {
        this.handleClickOnMethodBoxArticleLink(event);
      });
    }
  }

  handleClickOnMethodBoxArticleLink(event) {
    console.log("handle click on article link");
    const eventDetail = {
      eventInfo: {
        componentName: "q-choropleth",
        eventAction: "open-method-box-article-link",
        eventNonInteractive: false,
      },
    };

    const trackingEvent = new CustomEvent("q-tracking-event", {
      bubbles: true,
      detail: eventDetail,
    });
    event.target.dispatchEvent(trackingEvent);
  }
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
