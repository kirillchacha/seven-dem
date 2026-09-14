import "./main.min.js";
import "./common.min.js";
import "./settext.min.js";
//#region src/components/layout/videofullscreen/videofullscreen.js
var requestFullscreen = (element) => {
	const request = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
	return request ? Promise.resolve(request.call(element)) : Promise.reject(/* @__PURE__ */ new Error("no Fullscreen API"));
};
var exitFullscreen = () => {
	const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
	exit && exit.call(document);
};
var getFullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
function openFullscreen(container) {
	const video = container.querySelector("video");
	requestFullscreen(container).then(() => {
		video && video.play().catch(() => null);
	}).catch(() => {
		if (video && video.webkitEnterFullscreen) {
			video.play().catch(() => null);
			video.webkitEnterFullscreen();
		}
	});
}
function videoFullscreen() {
	document.addEventListener("click", (e) => {
		const container = e.target.closest("[data-fls-videofullscreen]");
		if (!container) return;
		getFullscreenElement() === container ? exitFullscreen() : openFullscreen(container);
	});
	const onChange = () => {
		if (getFullscreenElement()) return;
		document.querySelectorAll("[data-fls-videofullscreen] video").forEach((video) => video.pause());
	};
	document.addEventListener("fullscreenchange", onChange);
	document.addEventListener("webkitfullscreenchange", onChange);
}
document.querySelector("[data-fls-videofullscreen]") && window.addEventListener("load", videoFullscreen);
//#endregion
//#region src/components/effects/textreveal/textreveal.js
var WORD_CLASS = "textreveal__word";
function splitWords(element) {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	const textNodes = [];
	while (walker.nextNode()) textNodes.push(walker.currentNode);
	const words = [];
	textNodes.forEach((node) => {
		const fragment = document.createDocumentFragment();
		node.textContent.split(/(\s+)/).forEach((part) => {
			if (!part) return;
			if (!part.trim()) {
				fragment.append(document.createTextNode(part));
				return;
			}
			const word = document.createElement("span");
			word.className = WORD_CLASS;
			word.textContent = part;
			words.push(word);
			fragment.append(word);
		});
		node.replaceWith(fragment);
	});
	return words;
}
function textReveal() {
	const items = document.querySelectorAll("[data-fls-textreveal]");
	if (!items.length) return;
	items.forEach((item) => {
		splitWords(item).forEach((word, index) => word.style.setProperty("--word-index", index));
	});
}
document.querySelector("[data-fls-textreveal]") && textReveal();
//#endregion
