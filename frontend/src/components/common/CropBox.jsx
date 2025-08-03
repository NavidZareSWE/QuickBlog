class CropBox {
  constructor({
    imageBox = ".imageBox",
    thumbBox = ".thumbBox",
    spinner = ".spinner",
    imgSrc = "avatar.png",
  } = {}) {
    this.imageBox =
      typeof imageBox === "string" ? document.querySelector(imageBox) : null;
    if (!this.imageBox) this.imageBox = document.querySelector(imageBox);

    this.thumbBox =
      typeof thumbBox === "string" ? document.querySelector(thumbBox) : null;
    if (!this.thumbBox)
      this.thumbBox = this.imageBox?.querySelector(".thumbBox");

    this.spinner =
      typeof spinner === "string" ? document.querySelector(spinner) : null;
    if (!this.spinner) this.spinner = this.imageBox?.querySelector(".spinner");

    this.imgSrc = imgSrc;

    if (!this.imageBox) {
      throw new Error("ImageBox element not found");
    }
    this.init();
  }

  #state = {};
  #ratio = 1;
  #image = new Image();
  #isInitialized = false;
  // Magnetic properties
  #magneticThreshold = 7;
  #isSnapped = false;
  #snappedEdges = { top: false, bottom: false, left: false, right: false };
  #dragStartPos = { x: 0, y: 0 };
  #minimumDragDistanceToBreak = 10;

  #throttleDelay = 16; // Approximately 60fps (1000ms / 60 ≈ 16ms)
  #lastThrottleTime = 0;
  #throttledUpdate = null;

  // Initialize the CropBox
  async init() {
    if (this.#isInitialized) return;

    try {
      await this.#loadImage();
      this.#isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize CropBox:", error);
      throw error;
    }
  }

  #throttle(fn, delay = this.#throttleDelay) {
    return (...args) => {
      const now = performance.now();
      if (now - this.#lastThrottleTime >= delay) {
        fn.apply(this, args);
        this.#lastThrottleTime = now;
      }
    };
  }

  //private methods are automatically bound
  // Load image with Promise support
  #loadImage() {
    return new Promise((resolve, reject) => {
      if (this.spinner) this.spinner.style.display = "block";

      this.#image.onload = () => {
        if (this.spinner) this.spinner.style.display = "none";
        this.#handleImageLoad();
        resolve();
      };

      this.#image.onerror = () => {
        if (this.spinner) this.spinner.style.display = "none";
        reject(new Error(`Failed to load image: ${this.imgSrc}`));
      };

      this.#image.src = this.imgSrc;
    });
  }

  // Handle image load event
  #handleImageLoad() {
    this.#setBackground();
    this.#attachEventListeners();
  }

  // Attach event listeners
  #attachEventListeners() {
    this.imageBox.addEventListener(
      "mousedown",
      this.#handleMouseDown.bind(this),
    );
    this.imageBox.addEventListener(
      "mousemove",
      this.#handleMouseMove.bind(this),
    );
    document.addEventListener("mouseup", this.#handleMouseUp.bind(this));

    // Handle both wheel events for cross-browser compatibility
    this.imageBox.addEventListener("wheel", this.#handleWheel.bind(this));
    this.imageBox.addEventListener(
      "DOMMouseScroll",
      this.#handleWheel.bind(this),
    ); // Firefox
  }

  // Remove event listeners
  #detachEventListeners() {
    this.imageBox.removeEventListener(
      "mousedown",
      this.#handleMouseDown.bind(this),
    );
    this.imageBox.removeEventListener(
      "mousemove",
      this.#handleMouseMove.bind(this),
    );
    document.removeEventListener("mouseup", this.#handleMouseUp.bind(this));
    this.imageBox.removeEventListener("wheel", this.#handleWheel.bind(this));
    this.imageBox.removeEventListener(
      "DOMMouseScroll",
      this.#handleWheel.bind(this),
    );
  }

  // Set background image and positioning
  #setBackground() {
    const w = parseInt(this.#image.width) * this.#ratio;
    const h = parseInt(this.#image.height) * this.#ratio;
    const pw = (this.imageBox.clientWidth - w) / 2;
    const ph = (this.imageBox.clientHeight - h) / 2;

    this.imageBox.style.backgroundImage = `url(${this.#image.src})`;
    this.imageBox.style.backgroundSize = `${w}px ${h}px`;
    this.imageBox.style.backgroundPosition = `${pw}px ${ph}px`;
    this.imageBox.style.backgroundRepeat = "no-repeat";
  }

  // Event handlers
  #handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    this.#state.dragable = true;
    this.#state.mouseX = e.clientX;
    this.#state.mouseY = e.clientY;

    this.#dragStartPos = {
      x: e.clientX,
      y: e.clientY,
    };
  }

  #handleMouseMove(e) {
    if (!this.#state.dragable) return;

    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX - this.#state.mouseX;
    const y = e.clientY - this.#state.mouseY;

    const shouldBreakSnap =
      this.#isSnapped && this.shouldBreakMagneticSnap(e.clientX, e.clientY);
    // Initialize throttled update function if not already set
    if (!this.#throttledUpdate) {
      this.#throttledUpdate = this.#throttle((x, y) => {
        const resistanceFactor = 0.2;
        const resistedX = x * resistanceFactor;
        const resistedY = y * resistanceFactor;

        const bg = this.imageBox.style.backgroundPosition.split(" ");
        const bgX = resistedX + parseInt(bg[0]);
        const bgY = resistedY + parseInt(bg[1]);

        this.imageBox.style.backgroundPosition = `${bgX}px ${bgY}px`;
      });
    }

    if (this.#isSnapped && !shouldBreakSnap) {
      // Use throttled update instead of direct DOM manipulation
      this.#throttle(x, y);
    } else {
      if (shouldBreakSnap) {
        this.#isSnapped = false;
        this.#snappedEdges = {
          top: false,
          bottom: false,
          left: false,
          right: false,
        };
        this.thumbBox.style.boxShadow = "0 0 0 1000px rgba(0, 0, 0, 0.5)";
      }

      const bg = this.imageBox.style.backgroundPosition.split(" ");
      const bgX = x + parseInt(bg[0]);
      const bgY = y + parseInt(bg[1]);

      this.imageBox.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }

    this.#state.mouseX = e.clientX;
    this.#state.mouseY = e.clientY;
    if (!this.#isSnapped) this.applyMagneticSnap();
  }

  #handleMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    this.#state.dragable = false;
  }

  #handleWheel(e) {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY || e.detail || e.wheelDelta;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;

    this.#ratio *= zoomFactor;
    this.#setBackground();
  }

  getDataURL() {
    if (!this.#isInitialized) {
      throw new Error("CropBox not initialized");
    }

    const el = this.imageBox;
    const width = this.thumbBox.clientWidth;
    const height = this.thumbBox.clientHeight;
    const canvas = document.createElement("canvas");
    const dim = el.style.backgroundPosition.split(" ");
    const size = el.style.backgroundSize.split(" ");
    const dx = parseInt(dim[0]) - el.clientWidth / 2 + width / 2;
    const dy = parseInt(dim[1]) - el.clientHeight / 2 + height / 2;
    const dw = parseInt(size[0]);
    const dh = parseInt(size[1]);
    const sh = parseInt(this.#image.height);
    const sw = parseInt(this.#image.width);

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(this.#image, 0, 0, sw, sh, dx, dy, dw, dh);

    return canvas.toDataURL("image/png");
  }

  async getBlob() {
    const imageData = this.getDataURL();
    const b64 = imageData.replace("data:image/png;base64,", "");
    const binary = atob(b64);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: "image/png" });
  }

  zoomIn() {
    this.#ratio *= 1.1;
    this.#setBackground();
  }

  zoomOut() {
    this.#ratio *= 0.9;
    this.#setBackground();
  }

  setZoom(ratio) {
    this.#ratio = Math.max(0.1, ratio);
    this.#setBackground();
  }

  resetZoom() {
    this.#ratio = 1;
    this.#setBackground();
  }

  async changeImage(newSrc) {
    this.imgSrc = newSrc;
    await this.#loadImage();
  }

  getRatio() {
    return this.#ratio;
  }
  setRatio(ratio) {
    this.#ratio = ratio;
    this.#setBackground();
  }

  getImageDimensions() {
    return {
      width: this.#image.width,
      height: this.#image.height,
      naturalWidth: this.#image.naturalWidth,
      naturalHeight: this.#image.naturalHeight,
    };
  }

  getImageBoundaries() {
    const bg = this.imageBox.style.backgroundPosition.split(" ");
    const size = this.imageBox.style.backgroundSize.split(" ");

    const bgX = parseInt(bg[0]) || 0;
    const bgY = parseInt(bg[1]) || 0;
    const imgWidth = parseInt(size[0]) || 0;
    const imgHeight = parseInt(size[1]) || 0;

    return {
      left: bgX,
      top: bgY,
      right: bgX + imgWidth,
      bottom: bgY + imgHeight,
      width: this.#image.width,
      height: this.#image.height,
    };
  }

  getThumbBoxBoundaries() {
    if (!this.thumbBox)
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

    const rect = this.thumbBox.getBoundingClientRect();
    const containerRect = this.imageBox.getBoundingClientRect();

    const relativeLeft = rect.left - containerRect.left;
    const relativeTop = rect.top - containerRect.top;

    return {
      left: relativeLeft,
      top: relativeTop,
      right: relativeLeft + this.thumbBox.clientWidth,
      bottom: relativeTop + this.thumbBox.clientHeight,
      width: this.thumbBox.clientWidth,
      height: this.thumbBox.clientHeight,
    };
  }
  checkMagneticSnap() {
    const imageBounds = this.getImageBoundaries();
    const thumbBounds = this.getThumbBoxBoundaries();

    const distances = {
      top: Math.abs(thumbBounds.top - imageBounds.top),
      bottom: Math.abs(thumbBounds.bottom - imageBounds.bottom),
      left: Math.abs(thumbBounds.left - imageBounds.left),
      right: Math.abs(thumbBounds.right - imageBounds.right),
    };

    const shouldSnap = {
      top:
        distances.top < this.#magneticThreshold &&
        thumbBounds.left < imageBounds.right &&
        thumbBounds.right > imageBounds.left,
      bottom:
        distances.bottom < this.#magneticThreshold &&
        thumbBounds.left < imageBounds.right &&
        thumbBounds.right > imageBounds.left,
      left:
        distances.left < this.#magneticThreshold &&
        thumbBounds.top < imageBounds.bottom &&
        thumbBounds.bottom > imageBounds.top,
      right:
        distances.right < this.#magneticThreshold &&
        thumbBounds.top < imageBounds.bottom &&
        thumbBounds.bottom > imageBounds.top,
    };

    return { distances, shouldSnap, imageBounds, thumbBounds };
  }

  shouldBreakMagneticSnap(currentX, currentY) {
    const dragDistance = Math.sqrt(
      Math.pow(currentX - this.#dragStartPos.x, 2) +
        Math.pow(currentY - this.#dragStartPos.y, 2),
    );

    return dragDistance >= this.#minimumDragDistanceToBreak;
  }

  setMagneticThreshold(threshold) {
    this.#magneticThreshold = Math.max(0, threshold);
  }

  setMinimumDragDistance(distance) {
    this.#minimumDragDistanceToBreak = Math.max(0, distance);
  }
  getMagneticSettings() {
    return {
      threshold: this.#magneticThreshold,
      minimumDragDistanceToBreak: this.#minimumDragDistanceToBreak,
      isSnapped: this.#isSnapped,
      snappedEdges: { ...this.#snappedEdges },
    };
  }
  applyMagneticSnap() {
    const { distances, shouldSnap, imageBounds, thumbBounds } =
      this.checkMagneticSnap();

    let bgX =
      parseInt(this.imageBox.style.backgroundPosition.split(" ")[0]) || 0;
    let bgY =
      parseInt(this.imageBox.style.backgroundPosition.split(" ")[1]) || 0;

    this.#isSnapped = false;
    this.#snappedEdges = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };

    if (shouldSnap.top) {
      bgY = thumbBounds.top - imageBounds.top + bgY;
      this.#isSnapped = true;
      this.#snappedEdges.top = true;
    } else if (shouldSnap.bottom) {
      bgY = thumbBounds.bottom - imageBounds.bottom + bgY;
      this.#isSnapped = true;
      this.#snappedEdges.bottom = true;
    }

    if (shouldSnap.left) {
      bgX = thumbBounds.left - imageBounds.left + bgX;
      this.#isSnapped = true;
      this.#snappedEdges.left = true;
    } else if (shouldSnap.right) {
      bgX = thumbBounds.right - imageBounds.right + bgX;
      this.#isSnapped = true;
      this.#snappedEdges.right = true;
    }

    if (this.#isSnapped) {
      this.imageBox.style.backgroundPosition = `${bgX}px ${bgY}px`;
      this.thumbBox.style.boxShadow = "0 0 0 1000px rgba(0, 0, 0, 0.7)"; // Visual feedback for snap
    } else {
      this.thumbBox.style.boxShadow = "0 0 0 1000px rgba(0, 0, 0, 0.5)"; // Default shadow
    }
  }

  destroy() {
    this.#detachEventListeners();
    this.#state = {};
    this.#ratio = 1;
    this.#isInitialized = false;
    this.#isSnapped = false;
    this.#snappedEdges = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };
    this.#throttledUpdate = null;
    this.#lastThrottleTime = 0;
  }
}

export default CropBox;
