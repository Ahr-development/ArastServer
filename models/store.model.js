







const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Store = sequelize.define('Store', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.INTEGER,
        },
        StoreName: {
            type: DataTypes.STRING(255), // Adjust max length as needed
        },
        StoreUserName: {
            type: DataTypes.STRING(255), // Adjust max length as needed
        },
        StoreDescription: {
            type: DataTypes.STRING(255), // Adjust max length as needed
        },
        StoreBanner: {
            type: DataTypes.STRING(255), // Adjust max length as needed
        },
        StoreProfile: {
            type: DataTypes.STRING(255), // Adjust max length as needed
        },
        StoreDateJoin: {
            type: DataTypes.STRING(255), // Adjust max length as needed
        },
        StoreDesignNumber: {
            type: DataTypes.INTEGER,
        },

    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return Store;
};
