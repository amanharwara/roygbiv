export const readFileAsImage = (file: File) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject();
      return;
    }
    const reader = new FileReader();
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject();
    };
    let url: string;
    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        url = reader.result;
        image.src = url;
      } else {
        reject();
      }
    };
    reader.readAsDataURL(file);
  });
};
