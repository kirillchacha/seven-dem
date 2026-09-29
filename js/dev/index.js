import "./main.min.js";
import { l as isMobile } from "./common.min.js";
import { t as Swiper } from "./swiper.min.js";
import "./spollers.min.js";
import "./marqueepin.min.js";
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
		const farScale = parseFloat(el.dataset.flsHeroSliderFarScale);
		const scaleFor = (progress) => Number.isNaN(farScale) ? clamp(1 - progress * .08, .82, 1) : progress <= 1 ? 1 - progress * .08 : clamp(.92 - (progress - 1) * (.92 - farScale), farScale - .1, .92);
		const applyFanTransform = (swiper) => {
			swiper.slides.forEach((slideEl) => {
				const inner = slideEl.querySelector(".hero__slide-inner");
				if (!inner) return;
				const progress = Math.abs(slideEl.progress);
				const scale = scaleFor(progress);
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
//#region src/components/custom/catalogscart/catalogscart.js
function selectColor(media, color) {
	media.querySelectorAll("[data-catalogscart-photo]").forEach((photo) => {
		photo.classList.toggle("--active", photo.dataset.catalogscartPhoto === color);
	});
	media.querySelectorAll("[data-catalogscart-color]").forEach((option) => {
		option.setAttribute("aria-checked", String(option.dataset.catalogscartColor === color));
	});
}
function renderQty(card) {
	const qty = Number(card.dataset.qty) || 0;
	const price = Number(card.dataset.price) || 0;
	card.querySelector("[data-catalogscart-add]").hidden = qty > 0;
	card.querySelector("[data-catalogscart-stepper]").hidden = qty === 0;
	card.querySelector("[data-catalogscart-qty]").textContent = qty;
	card.querySelector("[data-catalogscart-price]").textContent = qty > 0 ? `${qty} шт · ${qty * price}₴` : `${price}₴`;
}
function initCards() {
	document.querySelectorAll("[data-catalogscart-card]").forEach((card) => {
		const media = card.querySelector("[data-catalogscart-media]");
		const photoColors = [...media.querySelectorAll("[data-catalogscart-photo]")].map((photo) => photo.dataset.catalogscartPhoto);
		const options = [...media.querySelectorAll("[data-catalogscart-color]")];
		options.forEach((option) => {
			if (photoColors.includes(option.dataset.catalogscartColor)) return;
			option.disabled = true;
			option.title = "Фото цього кольору ще немає";
		});
		const start = options.find((o) => !o.disabled && o.dataset.catalogscartColor === media.dataset.catalogscartMedia) || options.find((o) => !o.disabled);
		if (start) selectColor(media, start.dataset.catalogscartColor);
		media.setAttribute("data-catalogscart-ready", "");
		renderQty(card);
	});
}
document.addEventListener("click", (e) => {
	const option = e.target.closest("[data-catalogscart-color]");
	if (option && !option.disabled) {
		selectColor(option.closest("[data-catalogscart-media]"), option.dataset.catalogscartColor);
		return;
	}
	const control = e.target.closest("[data-catalogscart-add], [data-catalogscart-plus], [data-catalogscart-minus]");
	if (!control) return;
	const card = control.closest("[data-catalogscart-card]");
	const qty = Number(card.dataset.qty) || 0;
	const next = control.hasAttribute("data-catalogscart-minus") ? Math.max(0, qty - 1) : qty + 1;
	card.dataset.qty = next;
	renderQty(card);
	if (next === 1 && qty === 0) card.querySelector("[data-catalogscart-plus]").focus();
	if (next === 0) card.querySelector("[data-catalogscart-add]").focus();
});
initCards();
//#endregion
//#region src/components/custom/beforeandafter/beforeandafter.js
function select(section, index) {
	const tabs = [...section.querySelectorAll("[data-beforeandafter-tab]")];
	if (!tabs[index]) return;
	tabs.forEach((tab, i) => tab.setAttribute("aria-selected", String(i === index)));
	section.querySelectorAll("[data-beforeandafter-panel]").forEach((panel) => {
		panel.classList.toggle("--active", Number(panel.dataset.beforeandafterPanel) === index);
	});
	section.querySelector("[data-beforeandafter-prev]").disabled = index === 0;
	section.querySelector("[data-beforeandafter-next]").disabled = index === tabs.length - 1;
}
function current(section) {
	const tabs = [...section.querySelectorAll("[data-beforeandafter-tab]")];
	return Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
}
document.addEventListener("click", (e) => {
	const section = e.target.closest("[data-fls-beforeandafter]");
	if (!section) return;
	const tab = e.target.closest("[data-beforeandafter-tab]");
	if (tab) return select(section, Number(tab.dataset.beforeandafterTab));
	if (e.target.closest("[data-beforeandafter-prev]")) return select(section, current(section) - 1);
	if (e.target.closest("[data-beforeandafter-next]")) return select(section, current(section) + 1);
});
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
