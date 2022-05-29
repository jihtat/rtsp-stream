import fs from "fs";
import path from "path";

export function deleteFilesByExtension(
  folder: string,
  extension: string,
  ageInMinutes: number
) {
  const files = fs
    .readdirSync(folder, { withFileTypes: true })
    .filter((folderElement) => {
      const { birthtime } = fs.statSync(folder + folderElement.name);

      const fileAgeInMinutes = (Date.now() - birthtime.getTime()) / 60000;

      if (!folderElement.isFile()) {
        return false;
      }
      return (
        path.extname(folderElement.name) === extension && fileAgeInMinutes >= 1
      );
    })
    .map((folderElement) => folderElement.name);

  if (files.length > 0) {
    for (let f of files) {
      let file = folder + f;

      try {
        fs.unlinkSync(file);
        console.log("DELETED " + file);
      } catch (err) {
        throw new Error(err as string);
      }
    }
  }
}
