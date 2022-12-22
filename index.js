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
const Leave = require("./models/leave");

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

//remove employee with authentication
app.delete("/deleteemployees/:id",auth,(req, res) =>{
  const empid = req.params.id;
  console.log(id);
  Employee.destroy({where: { id: empid }})
    .then(() => {
        return res.status(204).json({ success: true, message: "Deleted Successfuly"})
    }).catch(err => {
        console.log(err);
        return res.status(403).json({ success: true, message: "Failed"})
    })
  
})

//promote employee form assistant manager to manager
app.put("/employees/:id/post", async (req, res, next) => {
  const { id } = req.params;
  const employee = await Employee.findOne({
    where: {
      id: id,
    },
  });
  if (!employee) {
    res.status(404).json({ message: "Employee not found" });
  }
  const updatedempolyee = await employee.update({
    post: "Manager",
    manager_id: null,
  });
  res.status(200).json({ employee: updatedempolyee });
});

//update salary of employee
app.put("/employees/:id/salary", async (req, res, next) => {
  try {
    const { salary } = req.body;
    const { id } = req.params;
    const employee = await Employee.findOne({
      where: { id: id },
    });
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
    }
    await employee.update({
      salary: salary,
    });
    res.status(200).json({ employee: employee });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
});

//assign manager using manager id
app.put("/employees/:id/manager", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { manager_id } = req.body;
    const employee = await Employee.findOne({
      where: { id: id },
    });
    console.log(employee);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
    }
    const updatedEmployee = await employee.update({
      manager_id: manager_id,
    });
    return res.status(200).json({ employee: updatedEmployee });
  } catch (err) {
    console.log(err);
  }
});

//leave application
app.post("/employees/:id/leave", async (req, res, next) => {
  const { id } = req.params;
  const { date, reason } = req.body;
  const employee = await this.Employee.findOne({
    where: {
      id: id,
    },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  if (isNaN(Date.parse(date))) {
    return res.status(400).status({ message: "date should be a valid date" });
  }
  const leave = await Leave.create({
    date: date,
    reason: reason,
    employeeid: id,
  });

  res.status(201).json({ message: "leave submitted" });
});

Employee.hasMany(Employee, { foreignKey: "manager_id", as: "employees" });
Employee.belongsTo(Employee, { foreignKey: "manager_id", as: "manager" });

Employee.hasMany(Leave);
Leave.belongsTo(Employee);

User.hasMany(Employee);
Employee.belongsTo(User);

sequelize
  .sync()
  .then((res) => {
    //console.log(res)
    app.listen(4000);
  })
  .catch((err) => console.log(err));
