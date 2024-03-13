const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getBooks);

router.get("/bestrating", bookCtrl.getTopRatedBooks);

router.get("/:id", bookCtrl.getOneBook);

router.post("/", auth, multer, bookCtrl.createBook);

router.post("/:id/rating", bookCtrl.addRate);

router.put("/:id", auth, multer, bookCtrl.updateOneBook);

router.delete("/:id", auth, bookCtrl.deleteOneBook);

module.exports = router;
