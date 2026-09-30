import "./main.min.js";
import "./common.min.js";
/* empty css              */
import "./productrelated.min.js";
import "./shopcard.min.js";
import "./popup.min.js";
import "./spollers.min.js";
//#region src/components/custom/productgallery/productgallery.js
document.addEventListener("click", (e) => {
	const swatch = e.target.closest(".productgallery__swatch");
	if (!swatch) return;
	const section = swatch.closest("[data-fls-productgallery]");
	swatch.closest(".productgallery__swatches").querySelectorAll(".productgallery__swatch").forEach((item) => {
		const isActive = item === swatch;
		item.classList.toggle("productgallery__swatch--active", isActive);
		item.setAttribute("aria-checked", String(isActive));
	});
	const name = section.querySelector("[data-productgallery-color-name]");
	if (name) name.textContent = swatch.getAttribute("aria-label");
	const color = swatch.dataset.productgalleryColor;
	const photos = [...section.querySelectorAll("[data-productgallery-media] [data-productgallery-photo]")];
	if (photos.some((photo) => photo.dataset.productgalleryPhoto === color)) photos.forEach((photo) => photo.classList.toggle("--active", photo.dataset.productgalleryPhoto === color));
});
//#endregion
//#region src/components/custom/productreviewform/productreviewform.js
document.addEventListener("input", (e) => {
	const comment = e.target.closest("[data-productreviewform-comment]");
	if (!comment) return;
	const counter = comment.closest("form").querySelector("[data-productreviewform-counter]");
	if (!counter) return;
	counter.textContent = `${comment.maxLength - comment.value.length} символів залишилось`;
});
document.addEventListener("change", (e) => {
	const input = e.target.closest("[data-productreviewform-file]");
	if (!input) return;
	const slot = input.closest(".productreviewform__slot");
	const file = input.files && input.files[0];
	if (slot.dataset.previewUrl) URL.revokeObjectURL(slot.dataset.previewUrl);
	if (file) {
		const url = URL.createObjectURL(file);
		slot.dataset.previewUrl = url;
		slot.style.backgroundImage = `url("${url}")`;
	} else {
		delete slot.dataset.previewUrl;
		slot.style.backgroundImage = "";
	}
	slot.classList.toggle("productreviewform__slot--filled", Boolean(file));
});
document.addEventListener("submit", (e) => {
	if (e.target.matches(".productreviewform__form")) e.preventDefault();
});
//#endregion
