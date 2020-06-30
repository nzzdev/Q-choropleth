export default class Choropleth {
  constructor(element, data = {}) {
    if (element) {
      this.element = element;
      this.data = data;
      this.width =
        this.data.width || this.element.getBoundingClientRect().width;
      this.requestId = this.data.requestId;
      this.isMethodBoxVisible = false;
      this.prepareMethodBoxElements();
      this.addEventListenerToMethodBoxLink();
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
    if (!this.isMethodBoxVisible) {
      this.methodBoxContainerElement.classList.add("hidden");
      this.methodBoxCloseIcon.classList.add("hidden");
    }
  }

  addEventListenerToMethodBoxLink() {
    if (this.methodBoxLinkElement) {
      this.methodBoxLinkElement.addEventListener("click", (event) => {
        this.handleClickOnMethodBoxLink(event);
      });
    }
  }

  handleClickOnMethodBoxLink(event) {
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
  }
}
