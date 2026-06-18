function renderYoutubePreview() {
  const preview = document.querySelector("[data-youtube-preview]");
  if (preview && !preview.querySelector("video")) preview.setAttribute("role", "button");

  const carousel = document.querySelector("[data-video-carousel]");
  if (!carousel) return;

  const videos = Array.from(carousel.querySelectorAll("[data-production-video]"));
  const prevButton = carousel.querySelector("[data-video-prev]");
  const nextButton = carousel.querySelector("[data-video-next]");
  const currentNode = carousel.querySelector("[data-video-current]");
  const totalNode = carousel.querySelector("[data-video-total]");
  if (!videos.length || !prevButton || !nextButton) return;

  let activeIndex = videos.findIndex((video) => !video.hidden);
  if (activeIndex < 0) activeIndex = 0;
  if (totalNode) totalNode.textContent = String(videos.length);

  const showVideo = (nextIndex) => {
    activeIndex = (nextIndex + videos.length) % videos.length;
    videos.forEach((video, index) => {
      const isActive = index === activeIndex;
      video.hidden = !isActive;
      video.classList.toggle("active", isActive);
      if (!isActive) video.pause();
    });
    if (currentNode) currentNode.textContent = String(activeIndex + 1);
  };

  prevButton.addEventListener("click", () => showVideo(activeIndex - 1));
  nextButton.addEventListener("click", () => showVideo(activeIndex + 1));
  showVideo(activeIndex);
}

function openYoutubeChannel() {
  window.open("https://www.youtube.com/", "_blank", "noopener");
}
