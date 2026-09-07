import "./main.min.js";
import "./common.min.js";
//#region src/components/custom/companyintro/companyintro.js
var titles = [...document.querySelectorAll(".companyintro__title")].map((title) => {
	const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
	const nodes = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);
	const words = [];
	nodes.forEach((node) => {
		const fragment = document.createDocumentFragment();
		node.textContent.split(/(\s+)/).forEach((part) => {
			if (!part.trim()) {
				fragment.append(document.createTextNode(part));
				return;
			}
			const word = document.createElement("span");
			word.className = "companyintro__word";
			word.textContent = part;
			words.push(word);
			fragment.append(word);
		});
		node.replaceWith(fragment);
	});
	return {
		title,
		words
	};
});
if (titles.length) {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	let frame = 0;
	const update = () => {
		frame = 0;
		const height = window.innerHeight;
		titles.forEach(({ title, words }) => {
			const rect = title.getBoundingClientRect();
			const progress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (height * .85 - rect.top) / (height * .5 + rect.height)));
			words.forEach((word, index) => {
				const fill = Math.max(0, Math.min(1, progress * words.length - index));
				word.style.setProperty("--word-fill", `${fill * 100}%`);
			});
		});
	};
	const scheduleUpdate = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};
	window.addEventListener("scroll", scheduleUpdate, { passive: true });
	window.addEventListener("resize", scheduleUpdate);
	window.addEventListener("load", scheduleUpdate);
	reducedMotion.addEventListener("change", scheduleUpdate);
	new ResizeObserver(scheduleUpdate).observe(document.body);
	document.fonts.ready.then(scheduleUpdate);
	update();
}
//#endregion
