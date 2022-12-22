const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const sequelize = require("./utils/database");
const auth = require("./middleware/authenticatrion");
const User = require("./models/user");
const Employee = require("./models/employee");

const app = express();

app.use(cors());
app.use(bodyParser.json);
app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

      // Validate user input
      if (!(email && password && first_name && last_name)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});


//get list of all employees
app.get("/employees", async (req, res, next) => {
  const employees = await Employee.findAll();
  res.json({ employees: employees });
});

//get employees profile
app.get("/employees/:id", async (req, res, next) => {
  const employee = await Employee.findOne({ where: { id: req.params.id } });
  if (!employee) {
    return res.json({ message: "employee not found" });
  }
  return res.json({ employee: employee });
});

// add employee
app.post("/employees", async (req, res, next) => {
  try {
    const data = req.body;
    const employee = await Employee.create({
      ...data,
      post: "Assistant manager",
      salary: 50000,
    });
    return res.status(201).json({ employee: employee });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
});


sequelize
  .sync()
  .then((res) => {
    //console.log(res)
    app.listen(4000);
  })
  .catch((err) => console.log(err));
