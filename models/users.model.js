const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Users = sequelize.define('Users', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ActiveCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RoleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    FirstName: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: true,
    },
    LastName: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: true,
    },
    Password: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: true,
    },
    Mobile: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: false,
    },
    IsActivateNumber: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    IsBan: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
    // Prevent Sequelize from pluralizing the table name (optional)
    freezeTableName: true,
    // Disable automatic timestamps (optional)
    timestamps: false,
  });


  return Users;
};
