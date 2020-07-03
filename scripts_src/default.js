export default class Choropleth {
  constructor(element, data = {}) {
    if (element) {
      this.element = element;
      this.data = data;
      this.width =
        this.data.width || this.element.getBoundingClientRect().width;
      this.requestId = this.data.requestId;
      this.isMethodBoxVisible = false;
      if (this.data.choroplethType === "numerical") {
        this.prepareMethodBoxElements();
        this.addEventListenerToMethodBoxLink();
        this.addEventListenerToMethodBoxArticleLink();
      }
    }
  }

  prepareMethodBoxElements() {
    this.methodBoxLinkElement = this.element.querySelector(
      `.q-choropleth-methods-link-text`
    );
    this.methodBoxContainerElement = this.element.querySelector(
      ".q-choropleth-methods-container"
    );
    this.methodBoxOpenIcon = this.element.querySelector(
      ".q-choropleth-methods-plus"
    );
    this.methodBoxCloseIcon = this.element.querySelector(
      ".q-choropleth-methods-close"
    );
    this.methodBoxArticleLink = this.element.querySelector(
      ".q-choropleth-methods-article-container"
    );
  }

  addEventListenerToMethodBoxLink() {
    if (this.methodBoxLinkElement) {
      this.methodBoxLinkElement.addEventListener("click", (event) => {
        this.handleClickOnMethodBoxLink(event);
      });
    }
  }

  handleClickOnMethodBoxLink(event) {
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
    if (this.isMethodBoxVisible) {
      this.methodBoxContainerElement.classList.remove("hidden");
      this.methodBoxOpenIcon.classList.add("hidden");
      this.methodBoxCloseIcon.classList.remove("hidden");
    } else {
      this.methodBoxContainerElement.classList.add("hidden");
      this.methodBoxCloseIcon.classList.add("hidden");
      this.methodBoxOpenIcon.classList.remove("hidden");
    }

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
