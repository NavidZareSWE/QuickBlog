import multer from "multer";
// Returns a StorageEngine implementation configured to store files on the local file system.
/*
There are two options available, destination and filename. They are both functions that determine where the file should be stored.
If no destination is given, the operating system's default directory for temporary files is used.
filename is used to determine what the file should be named inside the folder. If no filename is given, each file will be given a random name that doesn't include any file extension.
Source: https://github.com/expressjs/multer
*/
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage,
});
export default upload;
