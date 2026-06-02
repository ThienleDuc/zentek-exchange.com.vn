/**
 * Chuyển đổi file sang dạng base64 string
 * @param file File cần chuyển đổi
 * @returns Promise<string>
 */
export const encodeFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};
