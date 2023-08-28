export const readFileAsImage = (file: File) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject();
      return;
    }
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject();
    };
  });
};
