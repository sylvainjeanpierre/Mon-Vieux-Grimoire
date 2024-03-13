const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getBooks);

router.get("/:id", bookCtrl.getOneBook);

router.post("/", auth, multer, bookCtrl.createBook);

router.put("/:id", auth, multer, bookCtrl.updateOneBook);

router.delete("/:id", auth, bookCtrl.deleteOneBook);

module.exports = router;
