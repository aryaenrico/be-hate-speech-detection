const multer = require("multer");
const path = require("path");



const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../datasetData");

    cb(null, dir);
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname);
  },
});

function Filter(req, file, cb) {
  if (
    file.mimetype ==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("format file tidak didukung"));
  }
}

module.exports = multer({ storage: Storage, fileFilter: Filter });
