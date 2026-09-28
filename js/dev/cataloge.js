import "./main.min.js";
/* empty css                */
import { a as dataMediaQueries, d as slideDown, p as slideUp, s as getHash, u as setHash } from "./common.min.js";
import { a as getSlideTransformEl, i as elementTransitionEnd, t as Swiper } from "./swiper.min.js";
import "./popup.min.js";
import "./spollers.min.js";
import "./faqpin.min.js";
//#region node_modules/swiper/modules/autoplay.mjs
var Autoplay = ({ swiper, extendParams, on, emit, params }) => {
	swiper.autoplay = {
		running: false,
		paused: false,
		timeLeft: 0
	};
	extendParams({ autoplay: {
		enabled: false,
		delay: 3e3,
		waitForTransition: true,
		disableOnInteraction: false,
		stopOnLastSlide: false,
		reverseDirection: false,
		pauseOnMouseEnter: false
	} });
	function getParams() {
		return swiper.params.autoplay;
	}
	const initialAutoplayDelay = typeof params.autoplay === "object" && params.autoplay && typeof params.autoplay.delay === "number" ? params.autoplay.delay : 3e3;
	let timeout;
	let raf;
	let autoplayDelayTotal = initialAutoplayDelay;
	let autoplayDelayCurrent = initialAutoplayDelay;
	let autoplayTimeLeft = 0;
	let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
	let wasPaused = false;
	let isTouched = false;
	let pausedByTouch = false;
	let touchStartTimeout;
	let pausedByInteraction = false;
	let pausedByPointerEnter = false;
	function onTransitionEnd(e) {
		if (!swiper || swiper.destroyed || !swiper.wrapperEl) return;
		if (e.target !== swiper.wrapperEl) return;
		swiper.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
		const detail = e.detail;
		if (pausedByPointerEnter || detail && detail.bySwiperTouchMove) return;
		resume();
	}
	const calcTimeLeft = () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (swiper.autoplay.paused) wasPaused = true;
		else if (wasPaused) {
			autoplayDelayCurrent = autoplayTimeLeft;
			wasPaused = false;
		}
		const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
		swiper.autoplay.timeLeft = timeLeft;
		emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
		raf = requestAnimationFrame(() => {
			calcTimeLeft();
		});
	};
	const getSlideDelay = () => {
		let activeSlideEl;
		const virtualEnabled = !!swiper.params.virtual?.enabled;
		if (swiper.virtual && virtualEnabled) activeSlideEl = swiper.slides.find((slideEl) => slideEl.classList.contains("swiper-slide-active"));
		else activeSlideEl = swiper.slides[swiper.activeIndex];
		if (!activeSlideEl) return void 0;
		const attr = activeSlideEl.getAttribute("data-swiper-autoplay");
		if (attr == null) return void 0;
		return parseInt(attr, 10);
	};
	const getTotalDelay = () => {
		let totalDelay = getParams().delay;
		const currentSlideDelay = getSlideDelay();
		if (typeof currentSlideDelay === "number" && !Number.isNaN(currentSlideDelay) && currentSlideDelay > 0) totalDelay = currentSlideDelay;
		return totalDelay;
	};
	const run = (delayForce) => {
		if (swiper.destroyed || !swiper.autoplay.running) return 0;
		if (raf !== void 0) cancelAnimationFrame(raf);
		calcTimeLeft();
		let delay = delayForce;
		if (typeof delay === "undefined") {
			delay = getTotalDelay();
			autoplayDelayTotal = delay;
			autoplayDelayCurrent = delay;
		}
		autoplayTimeLeft = delay;
		const speed = swiper.params.speed;
		const proceed = () => {
			if (!swiper || swiper.destroyed) return;
			const autoplayParams = getParams();
			if (autoplayParams.reverseDirection) {
				if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
					swiper.slidePrev(speed, true, true);
					emit("autoplay");
				} else if (!autoplayParams.stopOnLastSlide) {
					swiper.slideTo(swiper.slides.length - 1, speed, true, true);
					emit("autoplay");
				}
			} else if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
				swiper.slideNext(speed, true, true);
				emit("autoplay");
			} else if (!autoplayParams.stopOnLastSlide) {
				swiper.slideTo(0, speed, true, true);
				emit("autoplay");
			}
			if (swiper.params.cssMode) {
				autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
				requestAnimationFrame(() => {
					run();
				});
			}
		};
		if (delay > 0) {
			if (timeout !== void 0) clearTimeout(timeout);
			timeout = setTimeout(() => {
				proceed();
			}, delay);
		} else requestAnimationFrame(() => {
			proceed();
		});
		return delay;
	};
	const start = () => {
		autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
		swiper.autoplay.running = true;
		run();
		emit("autoplayStart");
		return true;
	};
	const stop = () => {
		swiper.autoplay.running = false;
		if (timeout !== void 0) clearTimeout(timeout);
		if (raf !== void 0) cancelAnimationFrame(raf);
		emit("autoplayStop");
		return true;
	};
	const pause = (internal, reset) => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (timeout !== void 0) clearTimeout(timeout);
		if (!internal) pausedByInteraction = true;
		const proceed = () => {
			emit("autoplayPause");
			if (getParams().waitForTransition) swiper.wrapperEl.addEventListener("transitionend", onTransitionEnd);
			else resume();
		};
		swiper.autoplay.paused = true;
		if (reset) {
			proceed();
			return;
		}
		autoplayTimeLeft = (autoplayTimeLeft || getParams().delay) - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
		if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) return;
		if (autoplayTimeLeft < 0) autoplayTimeLeft = 0;
		proceed();
	};
	const resume = () => {
		if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running) return;
		autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
		if (pausedByInteraction) {
			pausedByInteraction = false;
			run(autoplayTimeLeft);
		} else run();
		swiper.autoplay.paused = false;
		emit("autoplayResume");
	};
	const onVisibilityChange = () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (document.visibilityState === "hidden") {
			pausedByInteraction = true;
			pause(true);
		}
		if (document.visibilityState === "visible") resume();
	};
	const onPointerEnter = (e) => {
		if (e.pointerType !== "mouse") return;
		pausedByInteraction = true;
		pausedByPointerEnter = true;
		if (swiper.animating || swiper.autoplay.paused) return;
		pause(true);
	};
	const onPointerLeave = (e) => {
		if (e.pointerType !== "mouse") return;
		pausedByPointerEnter = false;
		if (swiper.autoplay.paused) resume();
	};
	const attachMouseEvents = () => {
		if (getParams().pauseOnMouseEnter) {
			swiper.el.addEventListener("pointerenter", onPointerEnter);
			swiper.el.addEventListener("pointerleave", onPointerLeave);
		}
	};
	const detachMouseEvents = () => {
		if (swiper.el && typeof swiper.el !== "string") {
			swiper.el.removeEventListener("pointerenter", onPointerEnter);
			swiper.el.removeEventListener("pointerleave", onPointerLeave);
		}
	};
	const attachDocumentEvents = () => {
		document.addEventListener("visibilitychange", onVisibilityChange);
	};
	const detachDocumentEvents = () => {
		document.removeEventListener("visibilitychange", onVisibilityChange);
	};
	on("init", () => {
		if (getParams().enabled) {
			attachMouseEvents();
			attachDocumentEvents();
			start();
		}
	});
	on("destroy", () => {
		detachMouseEvents();
		detachDocumentEvents();
		if (swiper.autoplay.running) stop();
	});
	on("_freeModeStaticRelease", () => {
		if (pausedByTouch || pausedByInteraction) resume();
	});
	on("_freeModeNoMomentumRelease", () => {
		if (!getParams().disableOnInteraction) pause(true, true);
		else stop();
	});
	on("beforeTransitionStart", (_s, _speed, internal) => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (internal || !getParams().disableOnInteraction) pause(true, true);
		else stop();
	});
	on("sliderFirstMove", () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (getParams().disableOnInteraction) {
			stop();
			return;
		}
		isTouched = true;
		pausedByTouch = false;
		pausedByInteraction = false;
		touchStartTimeout = setTimeout(() => {
			pausedByInteraction = true;
			pausedByTouch = true;
			pause(true);
		}, 200);
	});
	on("touchEnd", () => {
		if (swiper.destroyed || !swiper.autoplay.running || !isTouched) return;
		if (touchStartTimeout !== void 0) clearTimeout(touchStartTimeout);
		if (timeout !== void 0) clearTimeout(timeout);
		if (getParams().disableOnInteraction) {
			pausedByTouch = false;
			isTouched = false;
			return;
		}
		if (pausedByTouch && swiper.params.cssMode) resume();
		pausedByTouch = false;
		isTouched = false;
	});
	on("slideChange", () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (swiper.autoplay.paused) {
			autoplayTimeLeft = getTotalDelay();
			autoplayDelayTotal = getTotalDelay();
		}
	});
	Object.assign(swiper.autoplay, {
		start,
		stop,
		pause,
		resume
	});
};
//#endregion
//#region node_modules/swiper/shared/effect-init.mjs
function effectInit(params) {
	const { effect, swiper, on, setTranslate, setTransition, overwriteParams, perspective, recreateShadows, getEffectParams } = params;
	on("beforeInit", () => {
		if (swiper.params.effect !== effect) return;
		swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
		if (perspective && perspective()) swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
		const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
		Object.assign(swiper.params, overwriteParamsResult);
		Object.assign(swiper.originalParams, overwriteParamsResult);
	});
	on("setTranslate _virtualUpdated", () => {
		if (swiper.params.effect !== effect) return;
		setTranslate();
	});
	on("setTransition", (_s, duration) => {
		if (swiper.params.effect !== effect) return;
		setTransition(duration);
	});
	on("transitionEnd", () => {
		if (swiper.params.effect !== effect) return;
		if (recreateShadows) {
			const effectParams = getEffectParams ? getEffectParams() : void 0;
			if (!effectParams || !effectParams.slideShadows) return;
			swiper.slides.forEach((slideEl) => {
				slideEl.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((shadowEl) => shadowEl.remove());
			});
			recreateShadows();
		}
	});
	let requireUpdateOnVirtual = false;
	on("virtualUpdate", () => {
		if (swiper.params.effect !== effect) return;
		if (!swiper.slides.length) requireUpdateOnVirtual = true;
		requestAnimationFrame(() => {
			if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
				setTranslate();
				requireUpdateOnVirtual = false;
			}
		});
	});
}
//#endregion
//#region node_modules/swiper/shared/effect-target.mjs
function effectTarget(_effectParams, slideEl) {
	const transformEl = getSlideTransformEl(slideEl);
	if (transformEl !== slideEl) {
		transformEl.style.backfaceVisibility = "hidden";
		transformEl.style.setProperty("-webkit-backface-visibility", "hidden");
	}
	return transformEl;
}
//#endregion
//#region node_modules/swiper/shared/effect-virtual-transition-end.mjs
function effectVirtualTransitionEnd({ swiper, duration, transformElements, allSlides }) {
	const { activeIndex } = swiper;
	const getSlide = (el) => {
		if (!el.parentElement) return swiper.slides.find((slideEl) => slideEl.shadowRoot && slideEl.shadowRoot === el.parentNode);
		if (el.parentElement instanceof HTMLElement) return el.parentElement;
	};
	if (swiper.params.virtualTranslate && duration !== 0) {
		let eventTriggered = false;
		let transitionEndTarget;
		if (allSlides) transitionEndTarget = transformElements;
		else transitionEndTarget = transformElements.filter((transformEl) => {
			const el = transformEl.classList.contains("swiper-slide-transform") ? getSlide(transformEl) : transformEl;
			return !!el && swiper.getSlideIndex(el) === activeIndex;
		});
		transitionEndTarget.forEach((el) => {
			elementTransitionEnd(el, () => {
				if (eventTriggered) return;
				if (!swiper || swiper.destroyed) return;
				eventTriggered = true;
				swiper.animating = false;
				const evt = new CustomEvent("transitionend", {
					bubbles: true,
					cancelable: true
				});
				swiper.wrapperEl.dispatchEvent(evt);
			});
		});
	}
}
//#endregion
//#region node_modules/swiper/modules/effect-fade.mjs
var EffectFade = ({ swiper, extendParams, on }) => {
	extendParams({ fadeEffect: {
		crossFade: false,
		mode: "default"
	} });
	let outInDuration = 0;
	function getParams() {
		return swiper.params.fadeEffect;
	}
	function getMode() {
		const params = getParams();
		if (params.mode === "default" && params.crossFade) return "cross-fade";
		return params.mode;
	}
	const setTranslate = () => {
		const { slides } = swiper;
		const params = getParams();
		const mode = getMode();
		const outInTransition = mode === "out-in" && outInDuration > 0;
		const duration = outInDuration;
		outInDuration = 0;
		const targetEls = [];
		const incomingEls = [];
		let hasFadingOut = false;
		for (let i = 0; i < slides.length; i += 1) {
			const slideEl = slides[i];
			let tx = -(slideEl.swiperSlideOffset ?? 0);
			if (!swiper.params.virtualTranslate) tx -= swiper.translate;
			let ty = 0;
			if (!swiper.isHorizontal()) {
				ty = tx;
				tx = 0;
			}
			const slideProgress = slideEl.progress ?? 0;
			let slideOpacity;
			if (mode === "cross-fade") slideOpacity = Math.max(1 - Math.abs(slideProgress), 0);
			else if (mode === "out-in") slideOpacity = Math.max(1 - 2 * Math.abs(slideProgress), 0);
			else slideOpacity = 1 + Math.min(Math.max(slideProgress, -1), 0);
			const targetEl = effectTarget(params, slideEl);
			if (outInTransition) {
				const prevOpacity = parseFloat(targetEl.style.opacity);
				if (slideOpacity === 0 && prevOpacity > 0) hasFadingOut = true;
				if (slideOpacity > 0) incomingEls.push(targetEl);
				targetEls.push(targetEl);
			}
			targetEl.style.opacity = String(slideOpacity);
			targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
		}
		if (outInTransition) {
			targetEls.forEach((el) => {
				const delayed = hasFadingOut && incomingEls.includes(el);
				el.style.transitionDuration = `${duration / 2}ms`;
				el.style.transitionDelay = delayed ? `${duration / 2}ms` : "0ms";
			});
			effectVirtualTransitionEnd({
				swiper,
				duration,
				transformElements: incomingEls,
				allSlides: true
			});
		}
	};
	const setTransition = (duration) => {
		const mode = getMode();
		const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
		transformElements.forEach((el) => {
			el.style.transitionDuration = `${duration}ms`;
			if (mode === "out-in" && duration === 0) el.style.transitionDelay = "";
		});
		if (mode === "out-in" && duration > 0 && !swiper.params.cssMode) {
			outInDuration = duration;
			return;
		}
		effectVirtualTransitionEnd({
			swiper,
			duration,
			transformElements,
			allSlides: true
		});
	};
	effectInit({
		effect: "fade",
		swiper,
		on,
		setTranslate,
		setTransition,
		overwriteParams: () => ({
			slidesPerView: 1,
			slidesPerGroup: 1,
			watchSlidesProgress: true,
			spaceBetween: 0,
			virtualTranslate: !swiper.params.cssMode
		})
	});
};
//#endregion
//#region src/components/layout/fadeslider/fadeslider.js
function initFadeSliders() {
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	document.querySelectorAll("[data-fls-fadeslider]").forEach((slider) => {
		if (slider.swiper) return;
		const delay = parseInt(slider.dataset.flsFadeslider, 10) || 4e3;
		new Swiper(slider, {
			modules: [Autoplay, EffectFade],
			effect: "fade",
			fadeEffect: { crossFade: true },
			rewind: true,
			speed: 1e3,
			allowTouchMove: false,
			autoplay: reduceMotion ? false : {
				delay,
				disableOnInteraction: false
			}
		});
	});
}
window.addEventListener("load", initFadeSliders);
document.addEventListener("shopify:section:load", initFadeSliders);
//#endregion
//#region src/components/layout/tabs/tabs.js
function tabs() {
	const tabs = document.querySelectorAll("[data-fls-tabs]");
	let tabsActiveHash = [];
	if (tabs.length > 0) {
		const hash = getHash();
		if (hash && hash.startsWith("tab-")) tabsActiveHash = hash.replace("tab-", "").split("-");
		tabs.forEach((tabsBlock, index) => {
			tabsBlock.classList.add("--tab-init");
			tabsBlock.setAttribute("data-fls-tabs-index", index);
			tabsBlock.addEventListener("click", setTabsAction);
			initTabs(tabsBlock);
		});
		let mdQueriesArray = dataMediaQueries(tabs, "flsTabs");
		if (mdQueriesArray && mdQueriesArray.length) mdQueriesArray.forEach((mdQueriesItem) => {
			mdQueriesItem.matchMedia.addEventListener("change", function() {
				setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
			});
			setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
		});
	}
	function setTitlePosition(tabsMediaArray, matchMedia) {
		tabsMediaArray.forEach((tabsMediaItem) => {
			tabsMediaItem = tabsMediaItem.item;
			let tabsTitles = tabsMediaItem.querySelector("[data-fls-tabs-titles]");
			let tabsTitleItems = tabsMediaItem.querySelectorAll("[data-fls-tabs-title]");
			let tabsContent = tabsMediaItem.querySelector("[data-fls-tabs-body]");
			let tabsContentItems = tabsMediaItem.querySelectorAll("[data-fls-tabs-item]");
			tabsTitleItems = Array.from(tabsTitleItems).filter((item) => item.closest("[data-fls-tabs]") === tabsMediaItem);
			tabsContentItems = Array.from(tabsContentItems).filter((item) => item.closest("[data-fls-tabs]") === tabsMediaItem);
			tabsContentItems.forEach((tabsContentItem, index) => {
				if (matchMedia.matches) {
					tabsContent.append(tabsTitleItems[index]);
					tabsContent.append(tabsContentItem);
					tabsMediaItem.classList.add("--tab-spoller");
				} else {
					tabsTitles.append(tabsTitleItems[index]);
					tabsMediaItem.classList.remove("--tab-spoller");
				}
			});
		});
	}
	function initTabs(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll("[data-fls-tabs-titles]>*");
		let tabsContent = tabsBlock.querySelectorAll("[data-fls-tabs-body]>*");
		const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
		const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;
		if (tabsActiveHashBlock) {
			const tabsActiveTitle = tabsBlock.querySelector("[data-fls-tabs-titles]>.--tab-active");
			tabsActiveTitle && tabsActiveTitle.classList.remove("--tab-active");
		}
		if (tabsContent.length) tabsContent.forEach((tabsContentItem, index) => {
			tabsTitles[index].setAttribute("data-fls-tabs-title", "");
			tabsContentItem.setAttribute("data-fls-tabs-item", "");
			if (tabsActiveHashBlock && index == tabsActiveHash[1]) tabsTitles[index].classList.add("--tab-active");
			tabsContentItem.hidden = !tabsTitles[index].classList.contains("--tab-active");
		});
	}
	function setTabsStatus(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll("[data-fls-tabs-title]");
		let tabsContent = tabsBlock.querySelectorAll("[data-fls-tabs-item]");
		const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
		function isTabsAnamate(tabsBlock) {
			if (tabsBlock.hasAttribute("data-fls-tabs-animate")) return tabsBlock.dataset.flsTabsAnimate > 0 ? Number(tabsBlock.dataset.flsTabsAnimate) : 500;
		}
		const tabsBlockAnimate = isTabsAnamate(tabsBlock);
		if (tabsContent.length > 0) {
			const isHash = tabsBlock.hasAttribute("data-fls-tabs-hash");
			tabsContent = Array.from(tabsContent).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock);
			tabsTitles = Array.from(tabsTitles).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock);
			tabsContent.forEach((tabsContentItem, index) => {
				if (tabsTitles[index].classList.contains("--tab-active")) {
					if (tabsBlockAnimate) slideDown(tabsContentItem, tabsBlockAnimate);
					else tabsContentItem.hidden = false;
					if (isHash && !tabsContentItem.closest(".popup")) setHash(`tab-${tabsBlockIndex}-${index}`);
				} else if (tabsBlockAnimate) slideUp(tabsContentItem, tabsBlockAnimate);
				else tabsContentItem.hidden = true;
			});
		}
	}
	function setTabsAction(e) {
		const el = e.target;
		if (el.closest("[data-fls-tabs-title]")) {
			const tabTitle = el.closest("[data-fls-tabs-title]");
			const tabsBlock = tabTitle.closest("[data-fls-tabs]");
			if (!tabTitle.classList.contains("--tab-active") && !tabsBlock.querySelector(".--slide")) {
				let tabActiveTitle = tabsBlock.querySelectorAll("[data-fls-tabs-title].--tab-active");
				tabActiveTitle.length && (tabActiveTitle = Array.from(tabActiveTitle).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock));
				tabActiveTitle.length && tabActiveTitle[0].classList.remove("--tab-active");
				tabTitle.classList.add("--tab-active");
				setTabsStatus(tabsBlock);
			}
			e.preventDefault();
		}
	}
}
window.addEventListener("load", tabs);
//#endregion
//#region src/components/custom/catalogfeatured/catalogfeatured.js
function selectColor(media, color) {
	media.querySelectorAll("[data-catalogfeatured-photo]").forEach((photo) => {
		photo.classList.toggle("--active", photo.dataset.catalogfeaturedPhoto === color);
	});
	media.querySelectorAll("[data-catalogfeatured-color]").forEach((option) => {
		option.setAttribute("aria-checked", String(option.dataset.catalogfeaturedColor === color));
	});
}
function initFeaturedColors() {
	document.querySelectorAll("[data-catalogfeatured-media]").forEach((media) => {
		if (media.hasAttribute("data-catalogfeatured-ready")) return;
		const photoColors = [...media.querySelectorAll("[data-catalogfeatured-photo]")].map((photo) => photo.dataset.catalogfeaturedPhoto);
		const options = [...media.querySelectorAll("[data-catalogfeatured-color]")];
		options.forEach((option) => {
			if (photoColors.includes(option.dataset.catalogfeaturedColor)) return;
			option.disabled = true;
			option.title = "Фото цього кольору ще немає";
		});
		const first = options.find((option) => !option.disabled);
		if (first) selectColor(media, first.dataset.catalogfeaturedColor);
		media.setAttribute("data-catalogfeatured-ready", "");
	});
}
document.addEventListener("click", (e) => {
	const option = e.target.closest("[data-catalogfeatured-color]");
	if (!option || option.disabled) return;
	selectColor(option.closest("[data-catalogfeatured-media]"), option.dataset.catalogfeaturedColor);
});
initFeaturedColors();
//#endregion
//#region src/components/custom/catalogfilters/catalogfilters.js
var priceFormat = new Intl.NumberFormat("uk-UA");
function initCatalogFilters() {
	document.querySelectorAll("[data-fls-catalogfilters]").forEach((drawer) => {
		const form = drawer.querySelector("[data-catalogfilters-form]");
		if (!form || form.hasAttribute("data-catalogfilters-ready")) return;
		form.setAttribute("data-catalogfilters-ready", "");
		const count = drawer.querySelector("[data-catalogfilters-count]");
		const range = drawer.querySelector("[data-catalogfilters-range]");
		const minInput = drawer.querySelector("[data-catalogfilters-min]");
		const maxInput = drawer.querySelector("[data-catalogfilters-max]");
		const minLabel = drawer.querySelector("[data-catalogfilters-min-label]");
		const maxLabel = drawer.querySelector("[data-catalogfilters-max-label]");
		const hasRange = range && minInput && maxInput;
		const percent = (input) => (input.value - input.min) / (input.max - input.min) * 100;
		const money = (input) => `${priceFormat.format(input.value)} ₴`;
		const syncRange = (changed) => {
			if (!hasRange) return;
			if (Number(minInput.value) > Number(maxInput.value)) {
				if (changed === minInput) minInput.value = maxInput.value;
				else maxInput.value = minInput.value;
			}
			minInput.style.zIndex = changed === minInput ? 2 : 1;
			maxInput.style.zIndex = changed === minInput ? 1 : 2;
			range.style.setProperty("--from", `${percent(minInput)}%`);
			range.style.setProperty("--to", `${percent(maxInput)}%`);
			if (minLabel) minLabel.textContent = money(minInput);
			if (maxLabel) maxLabel.textContent = money(maxInput);
		};
		const updateCount = () => {
			if (!count) return;
			const total = form.querySelectorAll("input[type=\"checkbox\"]:checked").length + (hasRange && (minInput.value !== minInput.min || maxInput.value !== maxInput.max) ? 1 : 0);
			count.textContent = total ? `(${total})` : "";
		};
		form.addEventListener("input", (e) => {
			if (e.target === minInput || e.target === maxInput) syncRange(e.target);
			updateCount();
		});
		form.addEventListener("click", (e) => {
			const reset = e.target.closest("[data-catalogfilters-reset]");
			if (reset) {
				reset.closest("[data-catalogfilters-group]")?.querySelectorAll("input[type=\"checkbox\"]").forEach((input) => input.checked = false);
				updateCount();
				return;
			}
			if (e.target.closest("[data-catalogfilters-clear]")) {
				form.querySelectorAll("input[type=\"checkbox\"]").forEach((input) => input.checked = false);
				if (hasRange) {
					minInput.value = minInput.min;
					maxInput.value = maxInput.max;
					syncRange(maxInput);
				}
				updateCount();
			}
		});
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			window.flsPopup?.close();
		});
		syncRange(maxInput);
		updateCount();
	});
}
initCatalogFilters();
//#endregion
