import { GreyVolumeImage, AvailableWidth, NumberOfHouses } from "@/types";

// Available discrete values in the image library
export const AVAILABLE_WIDTHS: AvailableWidth[] = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
export const AVAILABLE_HOUSES: NumberOfHouses[] = [4, 5, 6, 7, 8];

// Generate the complete image library from the naming convention:
// IDX_{index}_W{width}_H{houses}_DK-{Yes/No}_VP-{Yes/No}.png
function generateLibrary(): GreyVolumeImage[] {
  const images: GreyVolumeImage[] = [];
  let index = 0;

  for (const width of AVAILABLE_WIDTHS) {
    for (const houses of AVAILABLE_HOUSES) {
      for (const crossGables of [false, true]) {
        for (const stepping of [false, true]) {
          const widthStr = width.toFixed(1);
          const dkStr = crossGables ? "Yes" : "No";
          const vpStr = stepping ? "Yes" : "No";
          const fileName = `IDX_${index}_W${widthStr}_H${houses}_DK-${dkStr}_VP-${vpStr}.png`;

          images.push({
            index,
            numberOfHouses: houses,
            width,
            crossGables,
            stepping,
            fileName,
            label: `${houses} woningen, ${widthStr}m${crossGables ? ", dwarskappen" : ""}${stepping ? ", verspringend" : ""}`,
          });

          index++;
        }
      }
    }
  }

  return images;
}

export const IMAGE_LIBRARY: GreyVolumeImage[] = generateLibrary();
