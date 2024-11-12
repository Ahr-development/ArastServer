




const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DesignCategory = sequelize.define('DesignCategory', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        SubCategoryId: {
            type: DataTypes.INTEGER,
        },
        CategoryName: {
            type: DataTypes.STRING(255), 
        },
  
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return DesignCategory;
};
