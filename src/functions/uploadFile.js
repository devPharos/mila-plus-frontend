import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "~/services/firebase";
import { v4 as uuidv4 } from "uuid";

export default async function uploadFile(file, path = "") {
  let files = {};
  const fileUuid = uuidv4();
  const nameSplit = file.name.split(".");
  const type = nameSplit[nameSplit.length - 1];

  const storage = getStorage(app);
  const local = path
    ? path + "/" + fileUuid + "." + type
    : fileUuid + "." + type;
  const imageRef = ref(storage, local);
  await uploadBytes(imageRef, file).then(async (snapshot) => {
    await getDownloadURL(snapshot.ref).then((downloadURL) => {
      files = {
        url: downloadURL,
        name: fileUuid + "." + type,
        size: file.size,
      };
    });
  });
  return files;
}

export function organizeMultiAndSingleFiles(documents, path = "") {
  return documents.map(async (document) => {
    if (document.file_id) {
      if (typeof document.file_id.length === "undefined") {
        const { name, type } = document.file_id;
        let myPromise = await uploadFile(document.file_id, path);
        return Promise.all([myPromise]).then((files) => {
          const { name: key } = files[0];
          return {
            ...files[0],
            key,
            name: name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            type,
            document_id: document.document_id,
          };
        });
      } else {
        return Array.from(document.file_id)
          .sort((a, b) => a.size > b.size)
          .map(async (file) => {
            const { name, type } = file;
            let myPromise = await uploadFile(file, path);
            return Promise.all([myPromise]).then((files) => {
              const { name: key } = files[0];
              return {
                ...files[0],
                key,
                name: name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                type,
                document_id: document.document_id,
              };
            });
          });
      }
    }
  });
}
