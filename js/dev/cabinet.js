//#region src/components/custom/cabinet/cabinet.js
document.addEventListener("click", (e) => {
	const eye = e.target.closest("[data-fls-cabinet-eye]");
	if (!eye) return;
	const input = eye.parentElement.querySelector("input");
	const show = input.type === "password";
	input.type = show ? "text" : "password";
	eye.setAttribute("aria-pressed", String(show));
	eye.setAttribute("aria-label", show ? "Сховати пароль" : "Показати пароль");
});
document.addEventListener("focusin", (e) => {
	const way = e.target.closest("[data-fls-cabinet-way]");
	if (!way || e.target.type === "radio") return;
	way.querySelector("input[type=\"radio\"]").checked = true;
});
document.addEventListener("input", (e) => {
	const input = e.target.closest("[data-fls-cabinet-date]");
	if (!input) return;
	const digits = input.value.replace(/\D/g, "").slice(0, 8);
	input.value = [
		digits.slice(0, 2),
		digits.slice(2, 4),
		digits.slice(4)
	].filter(Boolean).join(".");
});
//#endregion
