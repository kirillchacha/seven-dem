//#region src/components/custom/shopcard/shopcard.js
function selectColor(card, color) {
	const media = card.querySelector("[data-shopcard-media]");
	const photos = [...media.querySelectorAll("[data-shopcard-photo]")];
	if (photos.some((photo) => photo.dataset.shopcardPhoto === color)) photos.forEach((photo) => photo.classList.toggle("--active", photo.dataset.shopcardPhoto === color));
	media.querySelectorAll("[data-shopcard-color]").forEach((option) => {
		option.setAttribute("aria-checked", String(option.dataset.shopcardColor === color));
	});
	card.dataset.color = color;
}
function renderQty(card) {
	const qty = Number(card.dataset.qty) || 0;
	const min = Math.max(1, Number(card.dataset.min) || 1);
	const price = Number(card.dataset.price) || 0;
	const priceEl = card.querySelector("[data-shopcard-price]");
	card.querySelector("[data-shopcard-add]").hidden = qty > 0;
	card.querySelector("[data-shopcard-stepper]").hidden = qty === 0;
	card.querySelector("[data-shopcard-qty]").textContent = qty;
	card.querySelector("[data-shopcard-minus]").disabled = qty <= min;
	if (qty > 0) priceEl.textContent = `${qty} шт · ${qty * price}₴`;
	else priceEl.innerHTML = card.shopcardPrice;
}
function initCards() {
	document.querySelectorAll("[data-shopcard-card]:not([data-shopcard-ready])").forEach((card) => {
		const media = card.querySelector("[data-shopcard-media]");
		const options = [...media.querySelectorAll("[data-shopcard-color]")];
		const start = options.find((o) => o.dataset.shopcardColor === media.dataset.shopcardMedia) || options[0];
		if (start) selectColor(card, start.dataset.shopcardColor);
		card.shopcardPrice = card.querySelector("[data-shopcard-price]").innerHTML;
		card.setAttribute("data-shopcard-ready", "");
		renderQty(card);
	});
}
document.addEventListener("click", (e) => {
	const option = e.target.closest("[data-shopcard-color]");
	if (option) {
		selectColor(option.closest("[data-shopcard-card]"), option.dataset.shopcardColor);
		return;
	}
	const control = e.target.closest("[data-shopcard-add], [data-shopcard-plus], [data-shopcard-minus]");
	if (!control) return;
	const card = control.closest("[data-shopcard-card]");
	const qty = Number(card.dataset.qty) || 0;
	const min = Math.max(1, Number(card.dataset.min) || 1);
	let next = qty + 1;
	if (control.hasAttribute("data-shopcard-add")) next = min;
	if (control.hasAttribute("data-shopcard-minus")) next = Math.max(min, qty - 1);
	card.dataset.qty = next;
	renderQty(card);
	if (qty === 0) card.querySelector("[data-shopcard-plus]").focus();
});
initCards();
//#endregion
