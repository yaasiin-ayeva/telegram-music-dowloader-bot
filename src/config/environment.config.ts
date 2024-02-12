
require('dotenv').config();

const EnvConfig = {
    PORT: process.env.PORT || 3000,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    UPLOAD_PATH: process.env.UPLOAD_PATH,
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

export default EnvConfig