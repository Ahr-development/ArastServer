


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DesignCollection = sequelize.define('DesignCollection', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        StoreId: {
            type: DataTypes.INTEGER,
        },

        CollectionName: {
            type: DataTypes.STRING(255), 
        },
        CollectionLink: {
            type: DataTypes.STRING(255), 
        },
        CollectionStatus: {
            type: DataTypes.BOOLEAN, 
        },
        CollectionPhonesAccept: {
            type: DataTypes.STRING(255), 
        },
        CollectionGiftFrom: {
            type: DataTypes.STRING(255), 
        },
        CollectionLogo: {
            type: DataTypes.STRING(255), 
        },
       
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return DesignCollection;
};
