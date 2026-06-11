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
  const html = Object.entries(links).map(([platform, url]) => {
    const href = url || "#contacts";
    return `<a class="social-link" href="${href}" aria-label="${platform}" title="${platform}"><img src="${icons[platform]}" alt=""></a>`;
  }).join("");
  document.querySelectorAll(".social-list").forEach((node) => {
    node.innerHTML = html;
  });
}
