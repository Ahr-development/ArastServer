


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DesignTypesCategory = sequelize.define('DesignTypesCategory', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        DesignTypeCategoryName: {
            type: DataTypes.STRING, 
        },
        DesignTypeCategoryImage: {
            type: DataTypes.STRING, 
        },
        DesignTypeCategoryDescription: {
            type: DataTypes.STRING, 
        },
   
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return DesignTypesCategory;
};

