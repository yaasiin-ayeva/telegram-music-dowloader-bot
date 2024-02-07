import axios from 'axios';

// dotenv
require('dotenv').config();

const telegram_token = process.env.TELEGRAM_TOKEN;
const youtube_api_key = process.env.YOUTUBE_API_KEY;

const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const fs = require('fs');

const bot = new TelegramBot(telegram_token, { polling: true });

bot.onText(/\/start/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Bienvenue sur ce bot Telegram ! Pour télécharger une chanson, tapez /music [nom de la chanson] \nExemple: /music 93 Mesures');
});

// Test
/** 
bot.on('message', (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Vous avez envoyé un message texte.');
});
*/

bot.onText(/\/music (.+)/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;
    const query = match[1];

    console.log("Query: " + query);

    // Recherche de vidéos musicales sur YouTube
    const searchResults = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            q: query,
            part: 'snippet',
            type: 'video',
            key: youtube_api_key,
        }
    });

    console.log("Search Results: " + JSON.stringify(searchResults.data));

    if (!searchResults.data.items || searchResults.data.items.length === 0) {
        throw new Error('Aucun résultat trouvé pour la recherche.');
    }

    // Récupération de l'ID de la première vidéo
    const videoId = searchResults.data.items[0].id.videoId;

    // Téléchargement de l'audio
    const audioStream = ytdl('https://www.youtube.com/watch?v=' + videoId, { filter: 'audioonly' });

    // Création d'un flux de fichier pour écrire les données audio
    const fileStream = fs.createWriteStream('audio.mp3');

    // Écoute des événements de fin et d'erreur du flux audio
    audioStream.on('end', () => {
        console.log('Téléchargement audio terminé.');
        // Envoyer l'audio à l'utilisateur
        bot.sendAudio(chatId, 'audio.mp3');
    });

    audioStream.on('error', (err: any) => {
        console.error('Erreur lors du téléchargement audio :', err);
    });

    // Pipe le flux audio vers le flux de fichier
    audioStream.pipe(fileStream);
});