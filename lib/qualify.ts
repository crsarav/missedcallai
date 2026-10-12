export function qualifyReasons(shop: {
  stars: number;
  reviews: number;
  franchise: boolean;
  claims247: boolean;
}): string[] {
  const reasons: string[] = [];
  if (shop.stars < 4) reasons.push("Below 4.0 stars");
  if (shop.reviews < 15) reasons.push("Fewer than 15 reviews");
  if (shop.reviews > 300) reasons.push("More than 300 reviews");
  if (shop.franchise) reasons.push("Franchise");
  if (shop.claims247) reasons.push("Claims 24/7 live answering");
  return reasons;
}

export function isQualified(shop: {
  stars: number;
  reviews: number;
  franchise: boolean;
  claims247: boolean;
}) {
  return qualifyReasons(shop).length === 0;
}
