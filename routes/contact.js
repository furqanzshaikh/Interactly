const express = require("express");
const { createContact, getContact, updateContact, deleteContact, getAllContacts } = require("../controllers/contactController");
const router = express.Router();



router.post("/add-contact", createContact );
router.get("/get-contact/:id",  getContact);
router.get("/get-contact",  getAllContacts);
router.put("/update-contact/:id",  updateContact);
router.delete("/delete-contact/:id",  deleteContact);

module.exports = router;
