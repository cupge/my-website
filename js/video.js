function renderYoutubePreview() {
  const preview = document.querySelector("[data-youtube-preview]");
  if (preview && !preview.querySelector("video")) preview.setAttribute("role", "button");

  initProductionModeSwitch();
  initProductionPhotoGallery();

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
    videos[activeIndex].load();
    if (currentNode) currentNode.textContent = String(activeIndex + 1);
  };

  prevButton.addEventListener("click", () => showVideo(activeIndex - 1));
  nextButton.addEventListener("click", () => showVideo(activeIndex + 1));
  showVideo(activeIndex);
}

function initProductionModeSwitch() {
  const buttons = Array.from(document.querySelectorAll("[data-production-mode]"));
  const photoPanel = document.querySelector("[data-production-photo]");
  const videoPanel = document.querySelector("[data-video-panel]");
  if (!buttons.length || !photoPanel || !videoPanel) return;

  const setMode = (mode) => {
    const isPhoto = mode === "photo";
    photoPanel.hidden = !isPhoto;
    videoPanel.hidden = isPhoto;
    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.productionMode === mode);
    });
    if (isPhoto) {
      videoPanel.querySelectorAll("video").forEach((video) => video.pause());
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.productionMode));
  });
  setMode("video");
}

function initProductionPhotoGallery() {
  const panel = document.querySelector("[data-production-photo]");
  if (!panel) return;

  const photos = Array.from(panel.querySelectorAll("[data-production-photo-item]"));
  const prevButton = panel.querySelector("[data-photo-prev]");
  const nextButton = panel.querySelector("[data-photo-next]");
  const fullscreenButton = panel.querySelector("[data-photo-fullscreen]");
  const currentNode = panel.querySelector("[data-photo-current]");
  const totalNode = panel.querySelector("[data-photo-total]");
  if (!photos.length || !prevButton || !nextButton) return;

  let availablePhotos = photos;
  let activeIndex = 0;

  const refreshPhotos = () => {
    availablePhotos = photos.filter((photo) => !photo.dataset.failed);
    if (totalNode) totalNode.textContent = String(availablePhotos.length || photos.length);
  };

  const showPhoto = (nextIndex) => {
    refreshPhotos();
    const galleryPhotos = availablePhotos.length ? availablePhotos : photos;
    activeIndex = (nextIndex + galleryPhotos.length) % galleryPhotos.length;
    photos.forEach((photo) => {
      const isActive = photo === galleryPhotos[activeIndex];
      photo.hidden = !isActive;
      photo.classList.toggle("active", isActive);
    });
    if (currentNode) currentNode.textContent = String(activeIndex + 1);
  };

  photos.forEach((photo) => {
    photo.addEventListener("error", () => {
      photo.dataset.failed = "true";
      photo.hidden = true;
      showPhoto(0);
    }, { once: true });
  });

  prevButton.addEventListener("click", () => showPhoto(activeIndex - 1));
  nextButton.addEventListener("click", () => showPhoto(activeIndex + 1));
  fullscreenButton?.addEventListener("click", () => {
    if (panel.requestFullscreen) {
      panel.requestFullscreen();
      return;
    }
    if (panel.webkitRequestFullscreen) panel.webkitRequestFullscreen();
  });
  showPhoto(activeIndex);
}

async function openYoutubeChannel() {
  let youtubeUrl = "https://www.youtube.com/";
  try {
    const response = await fetch("/data/social-links.json");
    const links = await response.json();
    if (links.youtube) youtubeUrl = links.youtube;
  } catch (error) {
    console.warn("CupGe YouTube link could not be loaded.", error);
  }
  window.open(youtubeUrl, "_blank", "noopener");
}
