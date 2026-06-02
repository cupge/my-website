const cupColors = {
  white: ["#f7f7f1", "#d8d8cf", "#111827"],
  kraft: ["#b98a50", "#6f4b27", "#f5f5f5"],
  black: ["#15191c", "#040506", "#c9a24e"],
  colored: ["#9b1f30", "#3f1018", "#f5f5f5"]
};

function getProductName(product) {
  return `${t(`product.${product.group}`)} ${product.volume}ml`;
}
