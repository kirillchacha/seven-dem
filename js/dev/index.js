import "./main.min.js";
import { c as isMobile } from "./common.min.js";
import { t as Swiper } from "./spollers.min.js";
import "./settext.min.js";
import "./faqpin.min.js";
//#region src/components/layout/heroslider/heroslider.js
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
var CENTER_FADE_RANGE = .4;
var HeroSlider = class {
	constructor(props) {
		let defaultConfig = {
			init: true,
			logging: true
		};
		this.config = Object.assign(defaultConfig, props);
		if (this.config.init) {
			const sliders = document.querySelectorAll("[data-fls-hero-slider]");
			if (sliders.length > 0) {
				this.setLogging(`Прокинувся, бачу елементів: ${sliders.length}`);
				sliders.forEach((el) => this.sliderInit(el));
			} else this.setLogging(`Прокинувся, не бачу елементів`);
		}
	}
	sliderInit(el) {
		const mockupPhoto = (el.closest(".hero__gallery") || document).querySelector("[data-fls-hero-mockup-photo]");
		const applyFanTransform = (swiper) => {
			swiper.slides.forEach((slideEl) => {
				const inner = slideEl.querySelector(".hero__slide-inner");
				if (!inner) return;
				const progress = Math.abs(slideEl.progress);
				const scale = clamp(1 - progress * .08, .82, 1);
				const rotation = clamp(-slideEl.progress * 22, -32, 32);
				const perspective = slideEl.swiperSlideSize * 2.5;
				const offset = Math.sign(slideEl.progress) * Math.max(0, progress - 1) * slideEl.swiperSlideSize * .25;
				inner.style.transform = `translateX(${offset}px) perspective(${perspective}px) rotateY(${rotation}deg) scale(${scale})`;
				inner.style.opacity = clamp(progress / CENTER_FADE_RANGE, 0, 1);
				slideEl.style.zIndex = Math.round((1 - clamp(progress, 0, 1)) * 100);
			});
		};
		const syncMockupPhoto = (swiper) => {
			if (!mockupPhoto) return;
			const activeImage = swiper.slides[swiper.activeIndex]?.querySelector(".hero__slide-image");
			if (activeImage) mockupPhoto.src = activeImage.currentSrc || activeImage.src;
		};
		const swiper = new Swiper(el, {
			slidesPerView: "auto",
			centeredSlides: true,
			spaceBetween: 32,
			loop: true,
			speed: 600,
			grabCursor: true,
			watchSlidesProgress: true,
			simulateTouch: true,
			on: {
				progress: applyFanTransform,
				setTranslate: applyFanTransform,
				slideChange: syncMockupPhoto
			}
		});
		applyFanTransform(swiper);
		syncMockupPhoto(swiper);
	}
	setLogging(message) {
		if (this.config.logging) {}
	}
};
new HeroSlider({});
//#endregion
//#region src/components/effects/marquee/marquee.js
var marquee = () => {
	const $marqueeArray = document.querySelectorAll("[data-fls-marquee]");
	const ATTR_NAMES = {
		wrapper: "data-fls-marquee-wrapper",
		inner: "data-fls-marquee-inner",
		item: "data-fls-marquee-item"
	};
	if (!$marqueeArray.length) return;
	const { head } = document;
	const debounce = (delay, fn) => {
		let timerId;
		return (...args) => {
			if (timerId) clearTimeout(timerId);
			timerId = setTimeout(() => {
				fn(...args);
				timerId = null;
			}, delay);
		};
	};
	const onWindowWidthResize = (cb) => {
		if (!cb && !isFunction(cb)) return;
		let prevWidth = 0;
		const handleResize = () => {
			const currentWidth = window.innerWidth;
			if (prevWidth !== currentWidth) {
				prevWidth = currentWidth;
				cb();
			}
		};
		window.addEventListener("resize", debounce(50, handleResize));
		handleResize();
	};
	const buildMarquee = (marqueeNode) => {
		if (!marqueeNode) return;
		const $marquee = marqueeNode;
		const $childElements = $marquee.children;
		if (!$childElements.length) return;
		Array.from($childElements).forEach(($childItem) => $childItem.setAttribute(ATTR_NAMES.item, ""));
		$marquee.innerHTML = `<div ${ATTR_NAMES.inner}>${$marquee.innerHTML}</div>`;
	};
	const getElSize = ($el, isVertical) => {
		if (isVertical) return $el.offsetHeight;
		return $el.offsetWidth;
	};
	$marqueeArray.forEach(($wrapper) => {
		if (!$wrapper) return;
		buildMarquee($wrapper);
		const $marqueeInner = $wrapper.firstElementChild;
		let cacheArray = [];
		if (!$marqueeInner) return;
		const dataMarqueeSpace = parseFloat($wrapper.getAttribute("data-fls-marquee-space"));
		const $items = $wrapper.querySelectorAll(`[${ATTR_NAMES.item}]`);
		const speed = parseFloat($wrapper.getAttribute("data-fls-marquee-speed")) / 10 || 100;
		const isMousePaused = $wrapper.hasAttribute("data-fls-marquee-pause");
		const direction = $wrapper.getAttribute("data-fls-marquee-direction");
		const isVertical = direction === "bottom" || direction === "top";
		const animName = `marqueeAnimation-${Math.floor(Math.random() * 1e7)}`;
		let spaceBetweenItem = parseFloat(window.getComputedStyle($items[0])?.getPropertyValue("margin-right"));
		let spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
		let startPosition = parseFloat($wrapper.getAttribute("data-fls-marquee-start")) || 0;
		let sumSize = 0;
		let firstScreenVisibleSize = 0;
		let initialSizeElements = 0;
		let initialElementsLength = $marqueeInner.children.length;
		let index = 0;
		let counterDuplicateElements = 0;
		const initEvents = () => {
			if (startPosition) $marqueeInner.addEventListener("animationiteration", onChangeStartPosition);
			if (!isMousePaused) return;
			$marqueeInner.removeEventListener("mouseenter", onChangePaused);
			$marqueeInner.removeEventListener("mouseleave", onChangePaused);
			$marqueeInner.addEventListener("mouseenter", onChangePaused);
			$marqueeInner.addEventListener("mouseleave", onChangePaused);
		};
		const onChangeStartPosition = () => {
			startPosition = 0;
			$marqueeInner.removeEventListener("animationiteration", onChangeStartPosition);
			onResize();
		};
		const setBaseStyles = (firstScreenVisibleSize) => {
			let baseStyle = "display: flex; flex-wrap: nowrap;";
			if (isVertical) {
				baseStyle += `
				flex-direction: column;
				position: relative;
				will-change: transform;`;
				if (direction === "bottom") baseStyle += `top: -${firstScreenVisibleSize}px;`;
			} else {
				baseStyle += `
				position: relative;
				will-change: transform;`;
				if (direction === "right") baseStyle += `inset-inline-start: -${firstScreenVisibleSize}px;;`;
			}
			$marqueeInner.style.cssText = baseStyle;
		};
		const setdirectionAnim = (totalWidth) => {
			switch (direction) {
				case "right":
				case "bottom": return totalWidth;
				default: return -totalWidth;
			}
		};
		const animation = () => {
			const keyFrameCss = `@keyframes ${animName} {
					 0% {
						 transform: translate${isVertical ? "Y" : "X"}(${!isVertical && window.stateRtl ? -startPosition : startPosition}%);
					 }
					 100% {
						 transform: translate${isVertical ? "Y" : "X"}(${setdirectionAnim(!isVertical && window.stateRtl ? -firstScreenVisibleSize : firstScreenVisibleSize)}px);
					 }
				 }`;
			const $style = document.createElement("style");
			$style.classList.add(animName);
			$style.innerHTML = keyFrameCss;
			head.append($style);
			$marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + startPosition * firstScreenVisibleSize / 100) / speed}s infinite linear`;
		};
		const addDublicateElements = () => {
			sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;
			const $parentNodeWidth = getElSize($wrapper, isVertical);
			let $childrenEl = Array.from($marqueeInner.children);
			if (!$childrenEl.length) return;
			if (!cacheArray.length) cacheArray = $childrenEl.map(($item) => $item);
			else $childrenEl = [...cacheArray];
			$marqueeInner.style.display = "flex";
			if (isVertical) $marqueeInner.style.flexDirection = "column";
			$marqueeInner.innerHTML = "";
			$childrenEl.forEach(($item) => {
				$marqueeInner.append($item);
			});
			$childrenEl.forEach(($item) => {
				if (isVertical) $item.style.marginBottom = `${spaceBetween}px`;
				else {
					$item.style.marginRight = `${spaceBetween}px`;
					$item.style.flexShrink = 0;
				}
				const sizeEl = getElSize($item, isVertical);
				sumSize += sizeEl + spaceBetween;
				firstScreenVisibleSize += sizeEl + spaceBetween;
				initialSizeElements += sizeEl + spaceBetween;
				counterDuplicateElements += 1;
				return sizeEl;
			});
			const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;
			for (; sumSize < $multiplyWidth; index += 1) {
				if (!$childrenEl[index]) index = 0;
				const $cloneNone = $childrenEl[index].cloneNode(true);
				const $lastElement = $marqueeInner.children[index];
				$marqueeInner.append($cloneNone);
				sumSize += getElSize($lastElement, isVertical) + spaceBetween;
				if (firstScreenVisibleSize < $parentNodeWidth || counterDuplicateElements % initialElementsLength !== 0) {
					counterDuplicateElements += 1;
					firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
				}
			}
			setBaseStyles(firstScreenVisibleSize);
		};
		const correctSpaceBetween = () => {
			if (spaceBetweenItem) {
				$items.forEach(($item) => $item.style.removeProperty("margin-right"));
				spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue("margin-right"));
				spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
			}
		};
		const init = () => {
			correctSpaceBetween();
			addDublicateElements();
			animation();
			initEvents();
		};
		const onResize = () => {
			head.querySelector(`.${animName}`)?.remove();
			init();
		};
		const onChangePaused = (e) => {
			const { type, target } = e;
			target.style.animationPlayState = type === "mouseenter" ? "paused" : "running";
		};
		onWindowWidthResize(onResize);
	});
};
marquee();
//#endregion
//#region src/components/layout/beforeafter/beforeafter.js
var BeforeAfter = class {
	constructor(props) {
		let defaultConfig = {
			init: true,
			logging: true
		};
		this.config = Object.assign(defaultConfig, props);
		if (this.config.init) {
			const beforeAfterItems = document.querySelectorAll("[data-fls-beforeafter]");
			if (beforeAfterItems.length > 0) {
				this.setLogging(`Прокинувся, бачу елементів: ${beforeAfterItems.length}`);
				this.beforeAfterInit(beforeAfterItems);
			} else this.setLogging(`Прокинувся, не бачу елементів`);
		}
	}
	beforeAfterInit(beforeAfterItems) {
		beforeAfterItems.forEach((beforeAfter) => {
			if (beforeAfter) {
				this.beforeAfterClasses(beforeAfter);
				this.beforeAfterItemInit(beforeAfter);
			}
		});
	}
	beforeAfterClasses(beforeAfter) {
		beforeAfter.querySelector("[data-fls-beforeafter-arrow]");
		beforeAfter.addEventListener("mouseover", function(e) {
			const targetElement = e.target;
			if (!targetElement.hasAttribute("data-fls-beforeafter-arrow")) {
				if (targetElement.closest("[data-fls-beforeafter-before]")) {
					beforeAfter.classList.remove("-right");
					beforeAfter.classList.add("-left");
				} else {
					beforeAfter.classList.add("-right");
					beforeAfter.classList.remove("-left");
				}
			}
		});
		beforeAfter.addEventListener("mouseleave", function() {
			beforeAfter.classList.remove("-left");
			beforeAfter.classList.remove("-right");
		});
	}
	beforeAfterItemInit(beforeAfter) {
		const beforeAfterArrow = beforeAfter.querySelector("[data-fls-beforeafter-arrow]");
		const afterItem = beforeAfter.querySelector("[data-fls-beforeafter-after]");
		const beforeAfterArrowWidth = parseFloat(window.getComputedStyle(beforeAfterArrow).getPropertyValue("width"));
		let beforeAfterSizes = {};
		if (beforeAfterArrow) isMobile.any() ? beforeAfterArrow.addEventListener("touchstart", beforeAfterDrag) : beforeAfterArrow.addEventListener("mousedown", beforeAfterDrag);
		function beforeAfterDrag(e) {
			beforeAfterSizes = {
				width: beforeAfter.offsetWidth,
				left: beforeAfter.getBoundingClientRect().left - scrollX
			};
			if (isMobile.any()) {
				document.addEventListener("touchmove", beforeAfterArrowMove);
				document.addEventListener("touchend", function(e) {
					document.removeEventListener("touchmove", beforeAfterArrowMove);
				}, { "once": true });
			} else {
				document.addEventListener("mousemove", beforeAfterArrowMove);
				document.addEventListener("mouseup", function(e) {
					document.removeEventListener("mousemove", beforeAfterArrowMove);
				}, { "once": true });
			}
			document.addEventListener("dragstart", function(e) {
				e.preventDefault();
			}, { "once": true });
		}
		function beforeAfterArrowMove(e) {
			const posLeft = e.type === "touchmove" ? e.touches[0].clientX - beforeAfterSizes.left : e.clientX - beforeAfterSizes.left;
			if (posLeft <= beforeAfterSizes.width && posLeft > 0) {
				const way = posLeft / beforeAfterSizes.width * 100;
				beforeAfterArrow.style.cssText = `left:calc(${way}% - ${beforeAfterArrowWidth}px)`;
				afterItem.style.cssText = `width: ${100 - way}%`;
			} else if (posLeft >= beforeAfterSizes.width) {
				beforeAfterArrow.style.cssText = `left: calc(100% - ${beforeAfterArrowWidth}px)`;
				afterItem.style.cssText = `width: 0%`;
			} else if (posLeft <= 0) {
				beforeAfterArrow.style.cssText = `left: 0%`;
				afterItem.style.cssText = `width: 100%`;
			}
		}
	}
	setLogging(message) {
		if (this.config.logging) {}
	}
};
new BeforeAfter({});
//#endregion
//#region src/components/effects/parallax/parallax.js
var Parallax = class Parallax {
	constructor(elements) {
		if (elements.length) this.elements = Array.from(elements).map((el) => new Parallax.Each(el, this.options));
	}
	destroyEvents() {
		this.elements.forEach((el) => {
			el.destroyEvents();
		});
	}
	setEvents() {
		this.elements.forEach((el) => {
			el.setEvents();
		});
	}
};
Parallax.Each = class {
	constructor(parent) {
		this.parent = parent;
		this.elements = this.parent.querySelectorAll("[data-fls-parallax]");
		this.animation = this.animationFrame.bind(this);
		this.offset = 0;
		this.value = 0;
		this.smooth = parent.dataset.flsParallaxSmooth ? Number(parent.dataset.flsParallaxSmooth) : 15;
		this.setEvents();
	}
	setEvents() {
		this.animationID = window.requestAnimationFrame(this.animation);
	}
	destroyEvents() {
		window.cancelAnimationFrame(this.animationID);
	}
	animationFrame() {
		const topToWindow = this.parent.getBoundingClientRect().top;
		const heightParent = this.parent.offsetHeight;
		const heightWindow = window.innerHeight;
		const positionParent = {
			top: topToWindow - heightWindow,
			bottom: topToWindow + heightParent
		};
		const centerPoint = this.parent.dataset.flsParallaxCenter ? this.parent.dataset.flsParallaxCenter : "center";
		if (positionParent.top < 30 && positionParent.bottom > -30) switch (centerPoint) {
			case "top":
				this.offset = -1 * topToWindow;
				break;
			case "center":
				this.offset = heightWindow / 2 - (topToWindow + heightParent / 2);
				break;
			case "bottom": this.offset = heightWindow - (topToWindow + heightParent);
		}
		this.value += (this.offset - this.value) / this.smooth;
		this.animationID = window.requestAnimationFrame(this.animation);
		this.elements.forEach((el) => {
			const parameters = {
				axis: el.dataset.axis ? el.dataset.axis : "v",
				direction: el.dataset.flsParallaxDirection ? el.dataset.flsParallaxDirection + "1" : "-1",
				coefficient: el.dataset.flsParallaxCoefficient ? Number(el.dataset.flsParallaxCoefficient) : 5,
				additionalProperties: el.dataset.flsParallaxProperties ? el.dataset.flsParallaxProperties : ""
			};
			this.parameters(el, parameters);
		});
	}
	parameters(el, parameters) {
		if (parameters.axis == "v") el.style.transform = `translate3D(0, ${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0) ${parameters.additionalProperties}`;
		else if (parameters.axis == "h") el.style.transform = `translate3D(${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0,0) ${parameters.additionalProperties}`;
	}
};
if (document.querySelector("[data-fls-parallax-parent]")) new Parallax(document.querySelectorAll("[data-fls-parallax-parent]"));
//#endregion
