import { downloadTrack, getTitle, search, uploadToCloudinary } from './helpers/youtube-dl.helper';
import EnvConfig from './config/environment.config';
import { BOT_DOWNLOADING, BOT_WELCOME_MESSAGE, LOGO_BOT_URL, MAX_YOUTUBE_SEARCH_RESULTS } from './constants';

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

let searchResults: any = null;

const bot = new TelegramBot(EnvConfig.TELEGRAM_TOKEN, { polling: true, filepath: false, });

bot.onText(/\/start/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, BOT_WELCOME_MESSAGE);
});

bot.on('message', async (msg: any) => {

    const chatId = msg.chat.id;
    const query = msg.text;

    if (!query) {
        return;
    }

    searchResults = await search({
        q: query,
        part: 'snippet',
        type: 'video',
        key: EnvConfig.YOUTUBE_API_KEY,
        maxResults: MAX_YOUTUBE_SEARCH_RESULTS
    });

    if (!searchResults.items || searchResults.items.length === 0) {
        bot.sendMessage(chatId, 'No results found');
        throw new Error('No results found');
    }

    // Create buttons for each search result item
    const buttons = searchResults.items.map((item: any) => ({
        text: item.snippet.title,
        callback_data: item.id.videoId
    }));

    const pageSize = MAX_YOUTUBE_SEARCH_RESULTS;
    let page = 0;
    while (page * pageSize < buttons.length) {

        const keyboard = {
            inline_keyboard: [
                ...buttons.slice(page * pageSize, (page + 1) * pageSize).map((button: any) => ([button])),
                [
                    { text: 'Next', callback_data: `next:${page + 1}` }
                ]
            ]
        };
        await bot.sendPhoto(chatId, LOGO_BOT_URL, { caption: `Page ${page + 1}`, reply_markup: keyboard });
        page++;
    }
});


bot.on('callback_query', async (query: any) => {
    const chatId = query.message.chat.id;
    const data = query.data.split(':');

    const action = data[0];

    const title = await getTitle(action, searchResults);

    if (action === 'next') {

        // TODO Handle Next

    } else {

        const videoId = data[0];

        bot.sendMessage(chatId, `${BOT_DOWNLOADING} ${title}`);
        const path = `${EnvConfig.UPLOAD_PATH}/${title}.mp3`;

        const fileOptions = {
            filename: `${title}.mp3`,
            contentType: 'audio/mpeg',
        };

        const sendAudioToChat = (chatId: any, audioUrl: string) => {
            const fileOptions = {
                filename: `${title}.mp3`,
                contentType: 'audio/mpeg',
            };

            // Send the audio to the chat using the Cloudinary URL
            bot.sendAudio(chatId, audioUrl, {}, fileOptions);
        };

        const onDownloadComplete = async (localFilePath: string) => {

            try {
                const audioUrl = await uploadToCloudinary(localFilePath, 'audio/mpeg');
                sendAudioToChat(chatId, audioUrl);

            } catch (error) {
                console.log('Error:', error);

            }
        };


        await downloadTrack(videoId, path, onDownloadComplete);

        // await downloadTrack(videoId, path, () => {
        //     bot.sendAudio(chatId, path, {}, fileOptions);
        // });
    }
});