import { createDiv } from "../builder/components/div.js";
import { canGoBack, submitButton } from "../builder/components/button.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { createInput } from "../builder/components/input.js";
import { createElement } from "../builder/createElement.js";

export function ListingAdministrationView({ viewState, handlers }) {
  const { listing, categories, capabilities } = viewState;
  const { canUpdateListing, canBackToList, canUploadPicture } = capabilities;
  const { onUpdate, onBackToList, onUploadPicture, onDeletePicture } = handlers;

  const root = createDiv();
  root.appendChild(canGoBack(canBackToList, onBackToList));
  const container = createDiv("listing-admin-form");

  if (!listing) {
    container.appendChild(createText("Listing was not found"));
    root.appendChild(container);
    return root;
  }

  container.appendChild(
    createTitle(1, `Úprava: ${listing.Title ?? listing.ListingID}`),
  );

  if (canUpdateListing && onUpdate) {
    let titleInput = createInput("", {
      type: "text",
      value: listing.Title,
      placeholder: "Název inzerátu",
      name: "listingTitle",
      id: "listingTitleInput",
    });
    let descriptionInput = createInput("", {
      type: "text",
      value: listing.Description ?? "",
      placeholder: "Popis...",
      name: "listingDescription",
      id: "listingDescriptionInput",
    });
    let priceInput = createInput("", {
      type: "number",
      value: listing.Price,
      placeholder: "Cena (Kč)",
      min: 0,
      name: "listingPrice",
      id: "listingPriceInput",
    });

    const categorySelect = createElement("select", { id: "listingCategory" });
    const emptyOpt = createElement("option", { value: "" });
    emptyOpt.textContent = "Vyberte kategorii";
    categorySelect.appendChild(emptyOpt);
    (categories ?? []).forEach((cat) => {
      const opt = createElement("option", { value: cat.CategoryID });
      const indent = "  ".repeat(cat.depth ?? 0);
      opt.textContent = indent + (cat.depth > 0 ? "└─ " : "") + cat.Name;
      opt.selected = listing.belongsTo === cat.CategoryID;
      categorySelect.appendChild(opt);
    });

    const formData = createDiv("", [
      titleInput,
      descriptionInput,
      priceInput,
      categorySelect,
      submitButton("Save", () =>
        onUpdate({
          title: document.getElementById("listingTitleInput").value,
          description: document.getElementById("listingDescriptionInput").value,
          price: document.getElementById("listingPriceInput").value,
          categoryId: document.getElementById("listingCategory").value,
        }),
      ),
    ]);
    container.appendChild(formData);
  }

  /**
   * Cancel
   */

  root.appendChild(container);

  if (canUploadPicture && onUploadPicture && onDeletePicture) {
    const pictureSection = createDiv("listing-admin-pictures");
    const picTitle = document.createElement("h2");
    picTitle.textContent = "Fotografie";
    pictureSection.appendChild(picTitle);

    const pictures = Array.isArray(listing.pictures) ? listing.pictures : [];
    if (pictures.length === 0) {
      pictureSection.appendChild(createText("Zatím žádné fotografie."));
    } else {
      const grid = createDiv("listing-admin-pic-grid");
      const API_BASE = "http://localhost:3000";
      pictures.forEach((pic) => {
        const src = pic.Path?.startsWith("http")
          ? pic.Path
          : API_BASE + pic.Path;
        const wrapper = createDiv("listing-admin-pic-wrapper");

        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.className = "listing-admin-pic";
        img.loading = "lazy";

        const delBtn = document.createElement("button");
        delBtn.className = "button button--danger listing-admin-pic-del";
        delBtn.textContent = "×";
        delBtn.title = "Smazat";
        delBtn.addEventListener("click", () => {
          delBtn.disabled = true;
          onDeletePicture(pic.PictureID);
        });

        wrapper.appendChild(img);
        wrapper.appendChild(delBtn);
        grid.appendChild(wrapper);
      });
      pictureSection.appendChild(grid);
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.classList.add("hidden");

    const uploadBtn = document.createElement("button");
    uploadBtn.className = "button button--secondary mt-15";
    uploadBtn.textContent = "Nahrát obrázek";
    uploadBtn.type = "button";
    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      uploadBtn.disabled = true;
      uploadBtn.textContent = "Nahrávám…";
      onUploadPicture(file).then(() => {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Nahrát obrázek";
        fileInput.value = "";
      });
    });

    pictureSection.appendChild(fileInput);
    pictureSection.appendChild(uploadBtn);
    root.appendChild(pictureSection);
  }

  return root;
}
