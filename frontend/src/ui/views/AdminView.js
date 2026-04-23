import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { addActionButton } from "../builder/components/button.js";

export function AdminView({ viewState, handlers }) {
  const { reports } = viewState;
  const { onBackToList, onDismissReport } = handlers;

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
          : "—";

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
  return root;
}
