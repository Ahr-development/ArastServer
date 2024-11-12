





const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DesignType = sequelize.define('DesignType', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        DesignTypeCategoryId: {
            type: DataTypes.INTEGER,
        },
        DesignName: {
            type: DataTypes.STRING(255), // Adjust max length as needed
            allowNull: false,
        },
        DesignWidth: {
            type: DataTypes.INTEGER,
        },
        DesignHeight: {
            type: DataTypes.INTEGER,
        },
        DesignCategoryPhoto: {
            type: DataTypes.STRING(255), // Adjust max length as needed
            allowNull: false,
        },
        DesignBackgroundColor: {
            type: DataTypes.STRING(255), // Adjust max length as needed
            allowNull: false,
        },
        DesignIcon: {
            type: DataTypes.STRING(255), // Adjust max length as needed
            allowNull: true,
        },
        UseInMainPage: {
            type: DataTypes.BOOLEAN, // Adjust max length as needed
            allowNull: true,
        },


    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return DesignType;
};
