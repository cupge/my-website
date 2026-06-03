function renderYoutubePreview() {
  const preview = document.querySelector("[data-youtube-preview]");
  if (preview && !preview.querySelector("video")) preview.setAttribute("role", "button");
}

function openYoutubeChannel() {
  window.open("https://www.youtube.com/", "_blank", "noopener");
}
