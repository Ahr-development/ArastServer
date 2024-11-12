


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Design = sequelize.define('Design', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        StoreId: {
            type: DataTypes.INTEGER,
        },

        DesignTypeId: {
            type: DataTypes.INTEGER,
        },
        DesignCategoryId: {
            type: DataTypes.INTEGER,
        },
        DesignCollectionId: {
            type: DataTypes.INTEGER,
        },
        DesignLicenceId: {
            type: DataTypes.INTEGER,
        },
        DesignUsed: {
            type: DataTypes.INTEGER,
        },
        DesignName: {
            type: DataTypes.STRING(255), 
        },
        DesignDescription: {
            type: DataTypes.STRING(255), 
        },
        DesignTags: {
            type: DataTypes.STRING(255), 
        },
        DesignLink: {
            type: DataTypes.STRING(255), 
        },
        DesignFile: {
            type: DataTypes.STRING(255), 
        },
        DesignShowImage: {
            type: DataTypes.STRING(255), 
        },
        DesignDateCreated: {
            type: DataTypes.STRING(255), 
        },
        DesignDateOverride: {
            type: DataTypes.STRING(255), 
        },
        DesignColors: {
            type: DataTypes.STRING(255), 
        },
        DesignIsConfirmed: {
            type: DataTypes.BOOLEAN, 
        },
        ReasonReject: {
            type: DataTypes.STRING(255), 
        },
        IsPrivate: {
            type: DataTypes.BOOLEAN, 
        },
  
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return Design;
};
