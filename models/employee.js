const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Employee = sequelize.define("employee", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  salary: {
    type: Sequelize.INTEGER,
  },
  post: {
    type: Sequelize.ENUM("Manager", "Assistant manager"),
  },
});
module.exports = Employee;
