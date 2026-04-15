export function LoadingView()
{
  const root = document.createElement("div");

  const h1 = document.createElement("h1");
  h1.textContent = "Načítání…";

  root.appendChild(h1);
  return root;
}
