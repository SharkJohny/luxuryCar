/**
 * Returns Shoptet page data without assuming that the legacy `shoptetData`
 * global already exists. Shoptet can expose `dataLayer` first on some loads.
 */
export function getShoptetContext() {
  const legacy =
    typeof window !== "undefined" &&
    window.shoptetData &&
    typeof window.shoptetData === "object"
      ? window.shoptetData
      : {};

  const layerEntry =
    typeof window !== "undefined" && Array.isArray(window.dataLayer)
      ? window.dataLayer.find((entry) => entry && entry.shoptet)
      : null;
  const layer = layerEntry?.shoptet || {};

  const bodyProductId =
    typeof document !== "undefined"
      ? document.body?.className.match(/(?:^|\s)id-(\d+)(?:\s|$)/)?.[1]
      : null;

  return {
    projectId: legacy.projectId ?? layer.projectId ?? null,
    language:
      legacy.language ??
      layer.language ??
      (typeof document !== "undefined" ? document.documentElement.lang : "") ??
      "",
    productId: Number(
      legacy.product?.id ?? layer.product?.id ?? bodyProductId ?? 0,
    ),
    cartInfo: legacy.cartInfo ?? layer.cartInfo ?? null,
  };
}
