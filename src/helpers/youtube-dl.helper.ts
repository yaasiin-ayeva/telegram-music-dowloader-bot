import EnvConfig from "../config/environment.config";
import { YOUTUBE_DL_BASE } from "../constants";
import YoutubeApiSearchParams from "../interfaces/youtube-api-search-params.interface";

const ytdl = require('ytdl-core');
import axios from 'axios';
const fs = require('fs');

const cloudinary = require('cloudinary');

cloudinary.v2.config({
    cloud_name: EnvConfig.CLOUDINARY_NAME,
    api_key: EnvConfig.CLOUDINARY_API_KEY,
    api_secret: EnvConfig.CLOUDINARY_API_SECRET,
    secure: true,
});

const search = async (params: YoutubeApiSearchParams) => {

    const results = await axios.get(YOUTUBE_DL_BASE, {
        params
    });

    return results.data;
}

// const downloadTrack = async (videoId: string, path: string, callback: any) => {
//     const stream = ytdl(videoId, { filter: 'audioonly' });
//     const file = fs.createWriteStream(path);
//     stream.pipe(file);

//     stream.on('finish', () => {
//         callback();
//     });

//     stream.on('error', (error: any) => {
//         console.error(error);
//     });

//     return stream;
// }


const uploadToCloudinary = async (localFilePath: string, mimeType: string) => {
    
    const result = await cloudinary.uploader.upload(localFilePath, mimeType, {
        resource_type: 'raw',
        folder: 'TelegramBot',
        mime_type: mimeType 
    });

    return result.secure_url; // Returns the public URL of the uploaded file on Cloudinary
};

const getTrackInfoFromId = async (videoId: string) => {
    return await ytdl.getBasicInfo(videoId);
}

const getTrackTitleFromId = async (videoId: string) => {
    const info = await getTrackInfoFromId(videoId);
    return info.videoDetails.title;
}

async function getTitle(action: string, searchResults: any) {
    let _title = '';

    if (searchResults && searchResults.items) {
        searchResults.items.forEach((item: any) => {
            if (item.id.videoId === action) {
                _title = item.snippet.title;
            }
        });
    } else {
        _title = await getTrackTitleFromId(action);    // TODO: IMPROVE
    }
    return _title;
}

const downloadTrack = async (videoId: string, path: string, callback: any) => {
    const stream = ytdl(videoId, { filter: 'audioonly' });
    const file = fs.createWriteStream(path);
    stream.pipe(file);

    stream.on('finish', () => {
        callback(path); // Pass the local file path to the callback
    });

    stream.on('error', (error: any) => {
        console.error(error);
    });

    return stream;
}

export { search, downloadTrack, getTitle, uploadToCloudinary };