async function renderSocialLinks() {
  const response = await fetch("/data/social-links.json");
  const links = await response.json();
  const icons = {
    youtube: "/assets/images/icons/youtube.svg",
    facebook: "/assets/images/icons/facebook.svg",
    instagram: "/assets/images/icons/instagram.svg",
    tiktok: "/assets/images/icons/tiktok.svg",
    linkedin: "/assets/images/icons/linkedin.svg"
  };
  const labels = {
    instagram: "CUPGE on Instagram",
    facebook: "CUPGE on Facebook",
    linkedin: "CUPGE representative on LinkedIn"
  };
  const html = Object.entries(links).map(([platform, url]) => {
    const href = url || "#contacts";
    const label = labels[platform] || platform;
    const externalAttrs = url ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a class="social-link" href="${href}"${externalAttrs} aria-label="${label}" title="${label}"><img src="${icons[platform]}" alt=""></a>`;
  }).join("");
  document.querySelectorAll(".social-list").forEach((node) => {
    node.innerHTML = html;
  });
}
