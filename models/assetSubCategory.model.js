


const { DataTypes } = require("sequelize");

module.exports = AssetSubCategory;

function AssetSubCategory(sequelize) {
  const attributes = {
    Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },

    SubCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    CategoryId: {
        type: DataTypes.INTEGER,
    },
    
    Photo: {
      type: DataTypes.INTEGER,
  },
  };

  const options = {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
  };
  return sequelize.define("AssetSubCategory", attributes, options);
}