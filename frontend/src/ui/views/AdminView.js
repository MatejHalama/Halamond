import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { addActionButton } from "../builder/components/button.js";

export function AdminView({ viewState, handlers }) {
  const { reports, categories, capabilities } = viewState;
  const {
    onBackToList,
    onDismissReport,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
  } = handlers;

  const root = createSection("admin-view");

  if (onBackToList) {
    root.appendChild(
      addActionButton(onBackToList, "← Inzeráty", "button--secondary"),
    );
  }

  root.appendChild(createTitle(1, "Admin panel"));

  const reportsSection = createSection("admin-reports");
  reportsSection.appendChild(createTitle(2, `Hlášení (${reports.length})`));

  if (reports.length === 0) {
    reportsSection.appendChild(createText(["Žádná hlášení."]));
  } else {
    reports.forEach((report) => {
      const card = document.createElement("div");
      card.className = "report-card";

      const reporter = report.reporterUser?.Username ?? `#${report.reporter}`;
      const meta = document.createElement("div");
      meta.className = "report-meta";

      const subject = report.reportedListingRel
        ? `Inzerát: ${report.reportedListingRel.Title}`
        : report.reportedUserRel
          ? `Uživatel: ${report.reportedUserRel.Username}`
          : "-";

      meta.textContent = `${reporter} → ${subject} · ${new Date(report.Createdat).toLocaleDateString("cs-CZ")}`;
      card.appendChild(meta);

      const text = document.createElement("p");
      text.className = "report-text";
      text.textContent = report.Text;
      card.appendChild(text);

      const dismissBtn = addActionButton(null, "Vyřešit", "button--success");
      dismissBtn.addEventListener("click", async () => {
        dismissBtn.disabled = true;
        await onDismissReport(report.ReportID);
      });
      card.appendChild(dismissBtn);

      reportsSection.appendChild(card);
    });
  }

  root.appendChild(reportsSection);

  if (
    capabilities.canManageCategories &&
    onCreateCategory &&
    onUpdateCategory &&
    onDeleteCategory
  ) {
    root.appendChild(
      buildCategorySection(
        categories ?? [],
        onCreateCategory,
        onUpdateCategory,
        onDeleteCategory,
      ),
    );
  }

  return root;
}

function buildTree(cats) {
  const byId = {};
  cats.forEach((c) => (byId[c.CategoryID] = { ...c, children: [] }));
  const roots = [];
  cats.forEach((c) => {
    if (c.parentCategory == null) roots.push(byId[c.CategoryID]);
    else if (byId[c.parentCategory])
      byId[c.parentCategory].children.push(byId[c.CategoryID]);
    else roots.push(byId[c.CategoryID]); // orphan is treated as root
  });
  const sort = (nodes) => {
    nodes.sort((a, b) => a.Name.localeCompare(b.Name, "cs"));
    nodes.forEach((n) => sort(n.children));
    return nodes;
  };
  return sort(roots);
}

function flattenTree(roots, depth = 0) {
  const items = [];
  roots.forEach((node) => {
    items.push({ cat: node, depth });
    flattenTree(node.children, depth + 1).forEach((i) => items.push(i));
  });
  return items;
}

function getDescendantIds(categoryId, allCats) {
  const ids = new Set();
  const queue = [categoryId];
  while (queue.length) {
    const id = queue.shift();
    allCats.forEach((c) => {
      if (c.parentCategory === id) {
        ids.add(c.CategoryID);
        queue.push(c.CategoryID);
      }
    });
  }
  return ids;
}

function populateParentSelect(select, cats, selectedId = null) {
  const items = flattenTree(buildTree(cats));
  items.forEach(({ cat, depth }) => {
    const opt = document.createElement("option");
    opt.value = cat.CategoryID;
    opt.textContent = "  ".repeat(depth) + (depth > 0 ? "└─ " : "") + cat.Name;
    if (cat.CategoryID === selectedId) opt.selected = true;
    select.appendChild(opt);
  });
}

function buildCategorySection(
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
) {
  const section = createSection("admin-categories");
  section.appendChild(createTitle(2, "Správa kategorií"));

  const list = document.createElement("div");
  list.className = "category-list";

  const renderList = (cats) => {
    list.innerHTML = "";
    const items = flattenTree(buildTree(cats));

    items.forEach(({ cat, depth }) => {
      const row = document.createElement("div");
      row.className = "category-row";
      row.dataset.id = cat.CategoryID;

      const nameSpan = document.createElement("span");
      nameSpan.className = "category-row__name";
      if (depth > 0) nameSpan.style.paddingLeft = `${depth * 1.25}rem`;
      nameSpan.textContent = (depth > 0 ? "└─ " : "") + cat.Name;

      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "category-row__input";
      editInput.value = cat.Name;
      editInput.style.display = "none";
      if (depth > 0) editInput.style.marginLeft = `${depth * 1.25}rem`;

      const editParentSelect = document.createElement("select");
      editParentSelect.className = "category-parent-select";
      editParentSelect.style.display = "none";
      const noneOptEdit = document.createElement("option");
      noneOptEdit.value = "";
      noneOptEdit.textContent = "- bez rodiče -";
      editParentSelect.appendChild(noneOptEdit);
      const descendants = getDescendantIds(cat.CategoryID, cats);
      const validParents = cats.filter(
        (c) =>
          c.CategoryID !== cat.CategoryID && !descendants.has(c.CategoryID),
      );
      populateParentSelect(editParentSelect, validParents, cat.parentCategory);

      const rowError = document.createElement("span");
      rowError.className = "category-row__error";

      const editBtn = document.createElement("button");
      editBtn.className = "button button--secondary admin-action";
      editBtn.textContent = "Upravit";
      editBtn.addEventListener("click", () => {
        const editing = editInput.style.display !== "none";
        if (editing) {
          const newName = editInput.value.trim();
          if (!newName) {
            editInput.classList.add("input--error");
            editInput.focus();
            return;
          }
          editInput.classList.remove("input--error");
          const newParentId = editParentSelect.value
            ? parseInt(editParentSelect.value)
            : null;
          const nameChanged = newName !== cat.Name;
          const parentChanged = newParentId !== (cat.parentCategory ?? null);
          if (nameChanged || parentChanged) {
            editBtn.disabled = true;
            onUpdateCategory(cat.CategoryID, newName, newParentId).then(() => {
              editBtn.disabled = false;
            });
          }
          editInput.style.display = "none";
          editParentSelect.style.display = "none";
          nameSpan.style.display = "";
          editBtn.textContent = "Upravit";
        } else {
          rowError.textContent = "";
          editInput.style.display = "";
          editParentSelect.style.display = "";
          nameSpan.style.display = "none";
          editBtn.textContent = "Uložit";
          editInput.focus();
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "button button--danger admin-action";
      deleteBtn.textContent = "Smazat";
      deleteBtn.addEventListener("click", () => {
        if (!confirm(`Opravdu smazat kategorii "${cat.Name}"?`)) return;
        deleteBtn.disabled = true;
        rowError.textContent = "";
        onDeleteCategory(cat.CategoryID).then((result) => {
          if (result?.status === "SUCCESS") {
            row.remove();
          } else {
            deleteBtn.disabled = false;
            rowError.textContent = result?.reason ?? "Chyba";
          }
        });
      });

      row.appendChild(nameSpan);
      row.appendChild(editInput);
      row.appendChild(editParentSelect);
      row.appendChild(editBtn);
      row.appendChild(deleteBtn);
      row.appendChild(rowError);
      list.appendChild(row);
    });
  };

  renderList(categories);
  section.appendChild(list);

  const newForm = document.createElement("div");
  newForm.className = "category-new-form";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Název nové kategorie";
  nameInput.className = "category-new-input";

  const parentSelect = document.createElement("select");
  parentSelect.className = "category-parent-select";
  const noneOpt = document.createElement("option");
  noneOpt.value = "";
  noneOpt.textContent = "- bez rodiče -";
  parentSelect.appendChild(noneOpt);
  populateParentSelect(parentSelect, categories);

  const addBtn = document.createElement("button");
  addBtn.className = "button button--primary admin-action";
  addBtn.textContent = "Přidat kategorii";
  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) return;
    const parentId = parentSelect.value ? parseInt(parentSelect.value) : null;
    addBtn.disabled = true;
    onCreateCategory(name, parentId).then((result) => {
      addBtn.disabled = false;
      if (result?.status === "SUCCESS") {
        nameInput.value = "";
      }
    });
  });

  newForm.appendChild(nameInput);
  newForm.appendChild(parentSelect);
  newForm.appendChild(addBtn);
  section.appendChild(newForm);

  return section;
}
