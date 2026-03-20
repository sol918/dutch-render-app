import { GeometryParams, GreyVolumeImage, AvailableWidth } from "@/types";
import { IMAGE_LIBRARY, AVAILABLE_WIDTHS } from "@/config/image-library";

/**
 * Find the nearest available width to the user-selected width.
 */
export function findNearestWidth(targetWidth: number): AvailableWidth {
  let nearest = AVAILABLE_WIDTHS[0];
  let minDiff = Math.abs(targetWidth - nearest);

  for (const w of AVAILABLE_WIDTHS) {
    const diff = Math.abs(targetWidth - w);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = w;
    }
  }

  return nearest;
}

/**
 * Select the best matching grey-volume image for the given geometry parameters.
 *
 * Matching rules:
 * - Exact match on numberOfHouses, crossGables, stepping
 * - Nearest available width
 */
export function selectBaseImage(params: GeometryParams): GreyVolumeImage {
  const nearestWidth = findNearestWidth(params.width);

  const match = IMAGE_LIBRARY.find(
    (img) =>
      img.numberOfHouses === params.numberOfHouses &&
      img.width === nearestWidth &&
      img.crossGables === params.crossGables &&
      img.stepping === params.stepping
  );

  if (!match) {
    // Fallback: should never happen with complete library, but handle gracefully
    throw new Error(
      `No matching base image found for: ${JSON.stringify(params)} (nearest width: ${nearestWidth})`
    );
  }

  return match;
}
