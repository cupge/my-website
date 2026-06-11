(function () {
  const params = new URLSearchParams(window.location.search);
  const lang = ["ka", "ru", "en"].includes(params.get("lang")) ? params.get("lang") : "ka";
  const pageMeta = window.CUPGE_PAGE_META || {};
  const meta = pageMeta[lang] || pageMeta.ka || {};

  document.documentElement.lang = lang === "ka" ? "ka-GE" : lang;

  if (meta.title) document.title = meta.title;
  if (meta.description) {
    document.querySelector("meta[name='description']")?.setAttribute("content", meta.description);
    document.querySelector("meta[property='og:description']")?.setAttribute("content", meta.description);
  }
  if (meta.title) document.querySelector("meta[property='og:title']")?.setAttribute("content", meta.title);

  document.querySelectorAll("[data-lang-content]").forEach((node) => {
    node.hidden = node.dataset.langContent !== lang;
  });

  document.querySelectorAll("[data-lang]").forEach((button) => {
    const targetLang = button.dataset.lang;
    button.classList.toggle("active", targetLang === lang);
    button.addEventListener("click", () => {
      const next = targetLang === "ka" ? window.location.pathname : `${window.location.pathname}?lang=${targetLang}`;
      window.location.href = next;
    });
  });
})();
