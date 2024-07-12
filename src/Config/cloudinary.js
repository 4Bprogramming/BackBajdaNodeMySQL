const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDNAME,
  api_key: process.env.NEXT_PUBLIC_APIKEY,
  api_secret: process.env.NEXT_PUBLIC_SECRET,
});

module.exports = cloudinary;
