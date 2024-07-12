const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('project', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
    },
    place: {
      type: DataTypes.TEXT,
    },
    title: {
      type: DataTypes.STRING,
    },
    area: {
      type: DataTypes.INTEGER,
    },
    rooms: {
      type: DataTypes.INTEGER,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    }
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};
