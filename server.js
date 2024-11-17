const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const Login = require("./models/login");
const Employee = require("./models/employee");

const app = express();
app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG and PNG files are allowed"), false);
    }
    cb(null, true);
  },
});
mongoose
  .connect("mongodb://localhost:27017/yourDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log(error));
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Login.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.status(200).json({ msg: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
app.get("/logins", async (req, res) => {
  try {
    const logins = await Login.find();
    console.log("Fetched logins:", logins);
    res.status(200).json(logins);
  } catch (err) {
    console.error("Error fetching logins:", err);
    res.status(500).json({ msg: "Server error. Failed to fetch logins." });
  }
});
app.get("/logins/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const login = await Login.findById(id);
    if (!login) {
      return res.status(404).send("Login not found");
    }
    res.json(login);
  } catch (err) {
    console.error("Error fetching login data:", err);
    res.status(500).send("Error fetching login data");
  }
});
app.post("/create-employee", upload.single("img"), async (req, res) => {
  const { name, email, mobile, designation, gender, courses } = req.body;
  const img = req.file ? req.file.filename : null;

  try {
    if (
      !name ||
      !email ||
      !mobile ||
      !designation ||
      !gender ||
      !courses ||
      !img
    ) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    const newEmployee = new Employee({
      name,
      email,
      mobile,
      designation,
      gender,
      courses: courses.split(","),
      img,
    });

    await newEmployee.save();
    res.status(201).json({ msg: "Employee created successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error. Failed to create employee." });
  }
});
app.delete("/employees/:id", async (req, res) => {
  const employeeId = req.params.id;
  try {
    const result = await Employee.deleteOne({ _id: employeeId });
    if (result.deletedCount > 0) {
      res.status(200).json({ msg: "Employee deleted successfully" });
    } else {
      res.status(404).json({ msg: "Employee not found" });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ msg: "Failed to delete employee" });
  }
});
app.put("/employees/:id", upload.single("img"), async (req, res) => {
  const employeeId = req.params.id;
  const updatedData = req.body;
  const img = req.file ? req.file.filename : null;

  if (img) updatedData.img = img;

  try {
    const result = await Employee.updateOne(
      { _id: employeeId },
      { $set: updatedData }
    );
    if (result.nModified > 0) {
      res.status(200).json({ msg: "Employee updated successfully" });
    } else {
      res.status(404).json({ msg: "Employee not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ msg: "Failed to update employee" });
  }
});
app.listen(5001, () => console.log("Server running on http://localhost:5000"));
