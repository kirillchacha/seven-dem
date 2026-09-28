import "./main.min.js";
import "./common.min.js";
import "./productrelated.min.js";
//#region src/components/custom/cartlist/cartlist.js
var money = new Intl.NumberFormat("uk-UA");
var plural = new Intl.PluralRules("uk-UA");
var WORDS = {
	one: "товар",
	few: "товари",
	many: "товарів",
	other: "товару"
};
var MAX_QTY = 99;
function initCartList(section) {
	const list = section.querySelector("[data-fls-cartlist-list]");
	const empty = section.querySelector("[data-fls-cartlist-empty]");
	const clamp = (value) => Math.min(MAX_QTY, Math.max(1, parseInt(value, 10) || 1));
	function render() {
		const items = [...section.querySelectorAll("[data-fls-cartlist-item]")];
		let count = 0;
		let sum = 0;
		items.forEach((item) => {
			const input = item.querySelector("[data-fls-cartlist-qty]");
			const qty = clamp(input.value);
			const line = qty * Number(item.dataset.price);
			input.value = qty;
			item.querySelector("[data-fls-cartlist-minus]").disabled = qty <= 1;
			item.querySelector("[data-fls-cartlist-plus]").disabled = qty >= MAX_QTY;
			item.querySelector("[data-fls-cartlist-line]").textContent = money.format(line);
			count += qty;
			sum += line;
		});
		section.querySelectorAll("[data-fls-cartlist-count]").forEach((el) => el.textContent = count);
		section.querySelectorAll("[data-fls-cartlist-word]").forEach((el) => el.textContent = WORDS[plural.select(count)]);
		section.querySelectorAll("[data-fls-cartlist-subtotal], [data-fls-cartlist-total]").forEach((el) => el.textContent = money.format(sum));
		list.hidden = !items.length;
		empty.hidden = !!items.length;
	}
	section.addEventListener("click", (e) => {
		const item = e.target.closest("[data-fls-cartlist-item]");
		if (!item) return;
		const input = item.querySelector("[data-fls-cartlist-qty]");
		if (e.target.closest("[data-fls-cartlist-plus]")) input.value = clamp(input.value) + 1;
		else if (e.target.closest("[data-fls-cartlist-minus]")) input.value = clamp(input.value) - 1;
		else if (e.target.closest("[data-fls-cartlist-remove]")) item.remove();
		else return;
		render();
	});
	section.addEventListener("change", (e) => {
		if (e.target.closest("[data-fls-cartlist-qty]")) render();
	});
	render();
}
document.querySelectorAll("[data-fls-cartlist]").forEach(initCartList);
//#endregion
