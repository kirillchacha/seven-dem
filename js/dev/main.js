import { n as bodyLockStatus, r as bodyLockToggle } from "./common.min.js";
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
//#region src/components/layout/dynamic/dynamic.js
var DynamicAdapt = class {
	constructor() {
		this.type = "max";
		this.init();
	}
	init() {
		this.objects = [];
		this.daClassname = "--dynamic";
		this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
		this.nodes.forEach((node) => {
			const dataArray = node.dataset.flsDynamic.trim().split(`,`);
			const object = {};
			object.element = node;
			object.parent = node.parentNode;
			object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
			const parentObjectSelector = dataArray[3] ? dataArray[3].trim() : null;
			const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
			if (objectSelector) {
				if (parentObjectSelector) `${parentObjectSelector}${objectSelector}`;
				const foundDestination = object.destinationParent.querySelector(objectSelector);
				if (foundDestination) object.destination = foundDestination;
			}
			object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
			object.place = dataArray[2] ? dataArray[2].trim() : `last`;
			object.index = this.indexInParent(object.parent, object.element);
			this.objects.push(object);
		});
		this.arraySort(this.objects);
		this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
		this.mediaQueries.forEach((media) => {
			const mediaSplit = media.split(",");
			const matchMedia = window.matchMedia(mediaSplit[0]);
			const mediaBreakpoint = mediaSplit[1];
			const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
			matchMedia.addEventListener("change", () => {
				this.mediaHandler(matchMedia, objectsFilter);
			});
			this.mediaHandler(matchMedia, objectsFilter);
		});
	}
	mediaHandler(matchMedia, objects) {
		if (matchMedia.matches) objects.forEach((object) => {
			if (object.destination) this.moveTo(object.place, object.element, object.destination);
		});
		else objects.forEach(({ parent, element, index }) => {
			if (element.classList.contains(this.daClassname)) this.moveBack(parent, element, index);
		});
	}
	moveTo(place, element, destination) {
		element.classList.add(this.daClassname);
		const index = place === "last" || place === "first" ? place : parseInt(place, 10);
		if (index === "last" || index >= destination.children.length) destination.append(element);
		else if (index === "first") destination.prepend(element);
		else destination.children[index].before(element);
	}
	moveBack(parent, element, index) {
		element.classList.remove(this.daClassname);
		if (parent.children[index] !== void 0) parent.children[index].before(element);
		else parent.append(element);
	}
	indexInParent(parent, element) {
		return [...parent.children].indexOf(element);
	}
	arraySort(arr) {
		if (this.type === "min") arr.sort((a, b) => {
			if (a.breakpoint === b.breakpoint) {
				if (a.place === b.place) return 0;
				if (a.place === "first" || b.place === "last") return -1;
				if (a.place === "last" || b.place === "first") return 1;
				return 0;
			}
			return a.breakpoint - b.breakpoint;
		});
		else {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) return 0;
					if (a.place === "first" || b.place === "last") return 1;
					if (a.place === "last" || b.place === "first") return -1;
					return 0;
				}
				return b.breakpoint - a.breakpoint;
			});
			return;
		}
	}
};
if (document.querySelector("[data-fls-dynamic]")) window.addEventListener("load", () => window.flsDynamic = new DynamicAdapt());
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
