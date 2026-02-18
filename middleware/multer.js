import multer from "multer";


const storage = multer.memoryStorage();

export const singleUpload = multer({ storage }).single("file");

export const multipleUpload = multer({ storage }).array("files", 2);

// import multer from "multer";

// const storage = multer.memoryStorage();

// const upload = multer({ storage });

// export { upload };
