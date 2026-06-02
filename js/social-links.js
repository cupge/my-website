async function renderSocialLinks() {
  const response = await fetch("data/social-links.json");
  const links = await response.json();
  const labels = {
    youtube: "YT",
    facebook: "FB",
    instagram: "IG",
    tiktok: "TT",
    linkedin: "IN"
  };
  const html = Object.entries(links).map(([platform, url]) => {
    const href = url || "#contacts";
    return `<a class="social-link" href="${href}" aria-label="${platform}">${labels[platform]}</a>`;
  }).join("");
  document.querySelectorAll(".social-list").forEach((node) => {
    node.innerHTML = html;
  });
}
