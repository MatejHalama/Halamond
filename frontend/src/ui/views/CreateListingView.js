import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { addActionButton } from "../builder/components/button.js";
import { createElement } from "../builder/createElement.js";

export function CreateListingView({ viewState, handlers }) {
  const { categories } = viewState;
  const { onBackToList, onSubmitCreate } = handlers;

  const root = createSection("create-listing-view");

  if (onBackToList) {
    root.appendChild(
      addActionButton(onBackToList, "← Zpět", "button--secondary"),
    );
  }

  root.appendChild(createTitle(1, "Nový inzerát"));

  const form = createSection("create-listing-form");

  const titleInput = createElement("input", {
    type: "text",
    id: "newListingTitle",
    placeholder: "Název inzerátu",
  });

  const descInput = createElement("textarea", {
    id: "newListingDesc",
    placeholder: "Popis...",
    rows: "4",
  });

  const priceInput = createElement("input", {
    type: "number",
    id: "newListingPrice",
    placeholder: "Cena (Kč)",
    min: "0",
  });

  const categorySelect = createElement("select", { id: "newListingCategory" });
  const emptyOpt = createElement("option", { value: "" });
  emptyOpt.textContent = "Vyberte kategorii";
  categorySelect.appendChild(emptyOpt);
  (categories ?? []).forEach((cat) => {
    const opt = createElement("option", { value: cat.CategoryID });
    opt.textContent = cat.Name;
    categorySelect.appendChild(opt);
  });

  const errorEl = createElement("p", {});
  errorEl.className = "form-error";

  const submitBtn = addActionButton(
    null,
    "Vytvořit inzerát",
    "button--primary",
  );
  submitBtn.addEventListener("click", async () => {
    const title = document.getElementById("newListingTitle").value.trim();
    const description = document.getElementById("newListingDesc").value.trim();
    const price = document.getElementById("newListingPrice").value;
    const categoryId = document.getElementById("newListingCategory").value;

    errorEl.textContent = "";
    if (!title) {
      errorEl.textContent = "Název je povinný.";
      return;
    }
    if (!price || Number(price) < 0) {
      errorEl.textContent = "Zadejte platnou cenu.";
      return;
    }

    submitBtn.disabled = true;
    const result = await onSubmitCreate({
      title,
      description,
      price: Number(price),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
    });
    if (result?.status === "ERROR") {
      errorEl.textContent = result.reason ?? "Chyba při vytváření.";
      submitBtn.disabled = false;
    }
  });

  form.appendChild(titleInput);
  form.appendChild(descInput);
  form.appendChild(priceInput);
  form.appendChild(categorySelect);
  form.appendChild(errorEl);
  form.appendChild(submitBtn);
  root.appendChild(form);

  return root;
}
