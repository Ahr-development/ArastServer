







const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserDesign = sequelize.define('UserDesign', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.INTEGER,
        },
        DesignTypeId: {
            type: DataTypes.INTEGER,
        },
        DesignName: {
            type: DataTypes.STRING(100), // Adjust max length as needed
            allowNull: false,
        },
        DesignDateTime: {
            type: DataTypes.STRING(255), // Adjust max length as needed
            allowNull: false,
        },
        DesignPersianDateTime: {
            type: DataTypes.STRING(100), // Adjust max length as needed
            allowNull: false,
        },
        DesignLink: {
            type: DataTypes.STRING(255), // Adjust max length as needed
            allowNull: false,
        },
        OriginalWidth: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        OriginalHeight: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        DesignReady: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        DesignPhoto: {
            type: DataTypes.STRING,
            allowNull: true
        },
        DesignParentFileLink: {
            type: DataTypes.STRING(255), 
            allowNull: true

        },
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return UserDesign;
};
