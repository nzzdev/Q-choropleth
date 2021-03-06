export default class Choropleth {
  constructor(element, data = {}) {
    if (element) {
      this.element = element;
      this.data = data;
      this.width = this.data.width;
      this.isMethodBoxVisible = false;

      if (!this.width) {
        this.width = this.element.getBoundingClientRect().width;
        this.addResizeEventListenerToContainer();
        this.callRenderingInfo();
      } else if (this.data.choroplethType === "numerical") {
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
        if (!response) {
          return {};
        }
        return response.json();
      })
      .then((renderingInfo) => {
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
    if (this.isMethodBoxVisible) {
      if (this.methodBoxContainerElement) {
        this.methodBoxContainerElement.classList.remove("hidden");
      }
      if (this.methodBoxOpenIcon) {
        this.methodBoxOpenIcon.classList.add("hidden");
      }
      if (this.methodBoxCloseIcon) {
        this.methodBoxCloseIcon.classList.remove("hidden");
      }
    } else {
      if (this.methodBoxContainerElement) {
        this.methodBoxContainerElement.classList.add("hidden");
      }
      if (this.methodBoxCloseIcon) {
        this.methodBoxCloseIcon.classList.add("hidden");
      }
      if (this.methodBoxOpenIcon) {
        this.methodBoxOpenIcon.classList.remove("hidden");
      }
    }
  }

  addEventListenerToMethodBoxToggle() {
    if (this.methodBoxToggleElement) {
      this.methodBoxToggleElement.addEventListener("click", (event) => {
        this.handleClickOnMethodBoxToogle(event);
      });
    }
  }

  handleClickOnMethodBoxToogle(event) {
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
    if (this.methodBoxArticleLink) {
      this.methodBoxArticleLink.addEventListener("click", (event) => {
        this.handleClickOnMethodBoxArticleLink(event);
      });
    }
  }

  handleClickOnMethodBoxArticleLink(event) {
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
