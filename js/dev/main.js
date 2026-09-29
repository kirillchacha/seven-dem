import { m as uniqArray, n as bodyLockStatus, r as bodyLockToggle } from "./common.min.js";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/components/layout/menu/menu.js
function menuInit() {
	document.addEventListener("click", function(e) {
		if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
			bodyLockToggle();
			document.documentElement.toggleAttribute("data-fls-menu-open");
		}
	});
}
document.querySelector("[data-fls-menu]") && window.addEventListener("load", menuInit);
//#endregion
//#region src/components/layout/header/plugins/scroll/scroll.js
function headerScroll() {
	const header = document.querySelector("[data-fls-header-scroll]");
	const headerShow = header.hasAttribute("data-fls-header-scroll-show");
	const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
	const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
	let scrollDirection = 0;
	let timer;
	document.addEventListener("scroll", function(e) {
		const scrollTop = window.scrollY;
		clearTimeout(timer);
		if (scrollTop >= startPoint) {
			!header.classList.contains("--header-scroll") && header.classList.add("--header-scroll");
			if (headerShow) {
				if (scrollTop > scrollDirection) header.classList.contains("--header-show") && header.classList.remove("--header-show");
				else !header.classList.contains("--header-show") && header.classList.add("--header-show");
				timer = setTimeout(() => {
					!header.classList.contains("--header-show") && header.classList.add("--header-show");
				}, headerShowTimer);
			}
		} else {
			header.classList.contains("--header-scroll") && header.classList.remove("--header-scroll");
			if (headerShow) header.classList.contains("--header-show") && header.classList.remove("--header-show");
		}
		scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
	});
}
document.querySelector("[data-fls-header-scroll]") && window.addEventListener("load", headerScroll);
//#endregion
//#region src/components/layout/bookmarks/bookmarks.js
var STORAGE_KEY = "fls-bookmarks";
var Bookmarks = class {
	constructor() {
		this.memory = [];
		this.items = this.read();
		this.plural = new Intl.PluralRules("uk-UA");
		document.addEventListener("click", (e) => this.onClick(e));
		window.addEventListener("storage", (e) => {
			if (e.key !== STORAGE_KEY) return;
			this.items = this.read();
			this.render();
		});
		this.render();
	}
	read() {
		try {
			const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
			return Array.isArray(parsed) ? parsed.filter((item) => item && item.id) : [];
		} catch (e) {
			return this.memory;
		}
	}
	write() {
		this.memory = this.items;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
		} catch (e) {}
	}
	has(id) {
		return this.items.some((item) => item.id === id);
	}
	onClick(e) {
		const toggle = e.target.closest("[data-fls-bookmarks-toggle]");
		if (!toggle) return;
		const id = toggle.dataset.flsBookmarksToggle;
		if (!id) return;
		e.preventDefault();
		this.items = this.has(id) ? this.items.filter((item) => item.id !== id) : [...this.items, this.snapshot(toggle, id)];
		this.write();
		this.render();
		document.dispatchEvent(new CustomEvent("bookmarksChange", { detail: { items: this.items } }));
	}
	snapshot(toggle, id) {
		const card = toggle.closest("[data-fls-bookmarks-card]");
		const img = card ? card.querySelector("img") : null;
		return {
			id,
			title: toggle.dataset.bookmarkTitle || "",
			price: toggle.dataset.bookmarkPrice || "",
			url: toggle.dataset.bookmarkUrl || "",
			image: toggle.dataset.bookmarkImage || (img ? img.currentSrc || img.src : "")
		};
	}
	render() {
		const count = this.items.length;
		document.querySelectorAll("[data-fls-bookmarks-toggle]").forEach((toggle) => {
			const active = this.has(toggle.dataset.flsBookmarksToggle);
			toggle.setAttribute("aria-pressed", String(active));
			toggle.classList.toggle("--bookmarked", active);
		});
		document.querySelectorAll("[data-fls-bookmarks-count]").forEach((el) => {
			el.textContent = count;
			el.hidden = count === 0 && el.dataset.flsBookmarksCount !== "always";
		});
		document.querySelectorAll("[data-fls-bookmarks-plural]").forEach((el) => {
			const [one, few, many] = el.dataset.flsBookmarksPlural.split("|");
			const form = this.plural.select(count);
			el.textContent = form === "one" ? one : form === "few" ? few : many;
		});
		document.querySelectorAll("[data-fls-bookmarks-list]").forEach((list) => this.renderList(list));
	}
	renderList(list) {
		const name = list.dataset.flsBookmarksList;
		const template = document.querySelector(`template[data-fls-bookmarks-template="${name}"]`);
		const empty = document.querySelector(`[data-fls-bookmarks-empty="${name}"]`);
		if (!template) return;
		list.replaceChildren(...this.items.map((item) => this.buildCard(template, item)));
		list.hidden = this.items.length === 0;
		if (empty) empty.hidden = this.items.length > 0;
	}
	buildCard(template, item) {
		const fragment = template.content.cloneNode(true);
		fragment.querySelectorAll("[data-bookmark-text]").forEach((el) => {
			el.textContent = item[el.dataset.bookmarkText] || "";
		});
		fragment.querySelectorAll("[data-bookmark-src]").forEach((el) => {
			const src = item[el.dataset.bookmarkSrc];
			if (src) el.src = src;
			el.alt = item.title;
		});
		fragment.querySelectorAll("[data-bookmark-href]").forEach((el) => {
			el.href = this.safeUrl(item[el.dataset.bookmarkHref]);
		});
		fragment.querySelectorAll("[data-bookmark-label]").forEach((el) => {
			el.setAttribute("aria-label", `${el.dataset.bookmarkLabel}${item.title}`);
		});
		fragment.querySelectorAll("[data-fls-bookmarks-toggle]").forEach((el) => {
			el.dataset.flsBookmarksToggle = item.id;
			el.setAttribute("aria-pressed", "true");
			el.classList.add("--bookmarked");
		});
		return fragment;
	}
	safeUrl(url) {
		if (!url) return "#";
		try {
			const parsed = new URL(url, window.location.href);
			return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "#";
		} catch (e) {
			return "#";
		}
	}
};
if (!window.flsBookmarks) window.flsBookmarks = new Bookmarks();
//#endregion
//#region src/components/effects/watcher/watcher.js
var ScrollWatcher = class {
	constructor(props) {
		let defaultConfig = { logging: true };
		this.config = Object.assign(defaultConfig, props);
		this.observer;
		!document.documentElement.hasAttribute("data-fls-watch") && this.scrollWatcherRun();
	}
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	scrollWatcherRun() {
		document.documentElement.setAttribute("data-fls-watch", "");
		this.scrollWatcherConstructor(document.querySelectorAll("[data-fls-watcher]"));
	}
	scrollWatcherConstructor(items) {
		if (items.length) uniqArray(Array.from(items).map(function(item) {
			if (item.dataset.flsWatcher === "navigator" && !item.dataset.flsWatcherThreshold) {
				let valueOfThreshold;
				if (item.clientHeight > 2) {
					valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
					if (valueOfThreshold > 1) valueOfThreshold = 1;
				} else valueOfThreshold = 1;
				item.setAttribute("data-fls-watcher-threshold", valueOfThreshold.toFixed(2));
			}
			return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px"}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
		})).forEach((uniqParam) => {
			let uniqParamArray = uniqParam.split("|");
			let paramsWatch = {
				root: uniqParamArray[0],
				margin: uniqParamArray[1],
				threshold: uniqParamArray[2]
			};
			let groupItems = Array.from(items).filter(function(item) {
				let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
				let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px";
				let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
				if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
			});
			let configWatcher = this.getScrollWatcherConfig(paramsWatch);
			this.scrollWatcherInit(groupItems, configWatcher);
		});
	}
	getScrollWatcherConfig(paramsWatch) {
		let configWatcher = {};
		if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root);
		else if (paramsWatch.root !== "null") {}
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) return;
		if (paramsWatch.threshold === "prx") {
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1; i += .005) paramsWatch.threshold.push(i);
		} else paramsWatch.threshold = paramsWatch.threshold.split(",");
		configWatcher.threshold = paramsWatch.threshold;
		return configWatcher;
	}
	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	scrollWatcherInit(items, configWatcher) {
		this.scrollWatcherCreate(configWatcher);
		items.forEach((item) => this.observer.observe(item));
	}
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) !targetElement.classList.contains("--watcher-view") && targetElement.classList.add("--watcher-view");
		else targetElement.classList.contains("--watcher-view") && targetElement.classList.remove("--watcher-view");
	}
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
	}
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		this.scrollWatcherIntersecting(entry, targetElement);
		targetElement.hasAttribute("data-fls-watcher-once") && entry.isIntersecting && this.scrollWatcherOff(targetElement, observer);
		document.dispatchEvent(new CustomEvent("watcherCallback", { detail: { entry } }));
	}
};
document.querySelector("[data-fls-watcher]") && window.addEventListener("load", () => new ScrollWatcher({}));
//#endregion
//#region src/components/effects/reveal/reveal.js
function markLoaded() {
	document.documentElement.setAttribute("data-fls-loaded", "");
}
document.readyState === "complete" ? markLoaded() : window.addEventListener("load", markLoaded);
//#endregion
