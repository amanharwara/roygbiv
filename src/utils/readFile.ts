export async function readFile(file: File): Promise<Uint8Array> {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  return new Promise((resolve) => {
    reader.onload = (event) => {
      resolve(new Uint8Array(event.target.result as ArrayBuffer));
    };
  });
}
