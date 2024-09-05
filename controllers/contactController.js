const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const prisma = new PrismaClient();

const FRESHSALES_DOMAIN = process.env.FRESHSALES_DOMAIN;
const FRESHSALES_API_KEY = process.env.FRESHSALES_API_KEY;

// 1. Create Contact
const createContact = async (req, res) => {
  const { first_name, last_name, email, mobile_number, data_store } = req.body;

  try {
    if (!first_name || !last_name || !email || !mobile_number || !data_store) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (data_store === "CRM") {
      try {
        const response = await axios.post(
          `https://${FRESHSALES_DOMAIN}/api/contacts`,
          {
            contact: { first_name, last_name, email, mobile_number },
          },
          {
            headers: {
              Authorization: `Token token=${FRESHSALES_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        return res.status(201).json(response.data);
      } catch (error) {
        console.error(
          "Error response from Freshsales API:",
          error.response?.data || error.message
        );
        return res
          .status(error.response?.status || 500)
          .json({ message: "Error creating contact in CRM" });
      }
    } else if (data_store === "DATABASE") {
      try {
        const newContact = await prisma.contactDetails.create({
          data: { first_name, last_name, email, mobile_number },
        });
        return res.status(201).json(newContact);
      } catch (error) {
        console.error("Error with database operation:", error.message);
        return res
          .status(500)
          .json({ message: "Error creating contact in database" });
      }
    } else {
      return res.status(400).json({ message: "Invalid data_store value" });
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res
      .status(500)
      .json({ message: "Unexpected error creating contact" });
  }
};

const getAllContacts = async (req, res) => {
  const { data_store } = req.body;

  try {
    if (data_store === "CRM") {
      try {
        const response = await axios.get(
          `https://${FRESHSALES_DOMAIN}.freshsales.io/api/contacts`,
          {
            headers: {
              Authorization: `Token token=${FRESHSALES_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        return res.status(200).json(response.data);
      } catch (error) {
        console.error(
          "Error response from Freshsales API:",
          error.response?.data || error.message
        );
        return res
          .status(error.response?.status || 500)
          .json({ message: "Error fetching contacts from CRM" });
      }
    } else if (data_store === "DATABASE") {
      try {
        const contacts = await prisma.contactDetails.findMany(); // Fetch all contacts
        return res.status(200).json(contacts);
      } catch (error) {
        console.error("Error with database operation:", error.message);
        return res
          .status(500)
          .json({ message: "Error fetching contacts from database" });
      }
    } else {
      return res.status(400).json({ message: "Invalid data_store value" });
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res
      .status(500)
      .json({ message: "Unexpected error fetching contacts" });
  }
};

// 2. Get Contact
const getContact = async (req, res) => {
  const { id } = req.params;
  const { data_store } = req.body;

  try {
    if (data_store === "CRM") {
      const response = await axios.get(
        `https://${FRESHSALES_DOMAIN}.freshsales.io/api/contacts/${id}`,
        {
          headers: {
            Authorization: `Token token=${FRESHSALES_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.status(200).json(response.data);
    } else if (data_store === "DATABASE") {
      const contact = await prisma.contactDetails.findUnique({
        where: { id: parseInt(id) }, // Change 'contact_id' to 'id' or the correct field name
      });
      if (!contact)
        return res.status(404).json({ message: "Contact not found" });
      return res.status(200).json(contact);
    } else {
      return res.status(400).json({ message: "Invalid data_store value" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching contact" });
  }
};


// 3. Update Contact
const updateContact = async (req, res) => {
  const { id } = req.params;
  const { new_email, new_mobile_number, data_store } = req.body;


  try {
    if (data_store === "CRM") {
      const response = await axios.put(
        `https://${FRESHSALES_DOMAIN}.freshsales.io/api/contacts/${id}`,
        {
          contact: { email: new_email, mobile_number: new_mobile_number },
        },
        {
          headers: {
            Authorization: `Token token=${FRESHSALES_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.status(200).json(response.data);
    } else if (data_store === "DATABASE") {
      const updatedContact = await prisma.contactDetails.update({
        where: { id: parseInt(id) },
        data: { email: new_email, mobile_number: new_mobile_number },
      });
      return res.status(200).json(updatedContact);
    } else {
      return res.status(400).json({ message: "Invalid data_store value" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating contact" });
  }
};



// 4. Delete Contact
const deleteContact = async (req, res) => {
  const { id } = req.params;
  const { data_store } = req.body;

  try {
    if (data_store === "CRM") {
      await axios.delete(
        `https://${FRESHSALES_DOMAIN}.freshsales.io/api/contacts/${id}`,
        {
          headers: {
            Authorization: `Token token=${FRESHSALES_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res
        .status(200)
        .json({ message: "Contact deleted successfully from CRM" });
    } else if (data_store === "DATABASE") {
      await prisma.contactDetails.delete({
        where: { id: parseInt(id) },
      });
      return res
        .status(200)
        .json({ message: "Contact deleted successfully from Database" });
    } else {
      return res.status(400).json({ message: "Invalid data_store value" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting contact" });
  }
};

module.exports = {
  createContact,
  getContact,
  updateContact,
  deleteContact,
  getAllContacts,
};
