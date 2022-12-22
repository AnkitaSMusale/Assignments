const Sequelize = require('sequelize');
const sequelize = require('../util/database');

//id ,first_name, last_name, email, password 

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    first_name: Sequelize.STRING,
    last_name : Sequelize.STRING,
    email: {
       type:  Sequelize.STRING,
       allowNull: false,
       unique: true
    },
    password: Sequelize.STRING,
    token: Sequelize.STRING
})

module.exports = User;