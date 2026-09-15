//#region src/components/custom/authform/authform.js
document.addEventListener("click", (e) => {
	const eye = e.target.closest("[data-fls-authform-eye]");
	if (!eye) return;
	const input = eye.parentElement.querySelector("input");
	const show = input.type === "password";
	input.type = show ? "text" : "password";
	eye.setAttribute("aria-pressed", String(show));
	eye.setAttribute("aria-label", show ? "Сховати пароль" : "Показати пароль");
});
//#endregion
