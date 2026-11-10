const axios = require('axios');
const yts = require('yt-search');
const { toAudio } = require('../lib/converter');

const API_TIMEOUT = 45000;
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    Accept: 'application/json, text/plain, */*'
};

function isYoutubeUrl(value) {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(value);
}

function getYoutubeThumbnail(url) {
    const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/i);
    return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function getText(message) {
    const content = message.message?.ephemeralMessage?.message || message.message?.viewOnceMessage?.message || message.message?.viewOnceMessageV2?.message || message.message || {};
    return (content.conversation || content.extendedTextMessage?.text || content.imageMessage?.caption || content.videoMessage?.caption || '').trim();
}

function parseElite(data) {
    const item = data?.download || data?.result || data;
    const url = item?.downloadUrl || item?.url || data?.downloadURL;
    if (!data?.status && !data?.success) throw new Error('API ne success response nahi diya');
    if (!url || typeof url !== 'string') throw new Error('API response mein audio URL nahi hai');
    return { url, title: item?.title || data?.title };
}

async function requestAudio(youtubeUrl) {
    const endpoint = `https://eliteprotech-apis.zone.id/download/ytmp3?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
    const response = await axios.get(endpoint, { timeout: API_TIMEOUT, headers: HEADERS });
    return parseElite(response.data);
}

async function downloadMedia(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: 80 * 1024 * 1024,
        headers: { 'User-Agent': HEADERS['User-Agent'], Accept: '*/*' }
    });
    const buffer = Buffer.from(response.data);
    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    if (!buffer.length || contentType.includes('application/json') || contentType.includes('text/html')) {
        throw new Error('API ne audio file ki bajaye error response diya');
    }
    return buffer;
}

async function songCommand(sock, chatId, message) {
    try {
        const query = getText(message).replace(/^\.song\s*/i, '').trim();
        if (!query) {
            await sock.sendMessage(chatId, { text: 'Istemaal: .song <song name ya YouTube link>' }, { quoted: message });
            return;
        }

        let video;
        if (isYoutubeUrl(query)) {
            video = { url: query, title: 'YouTube Audio', thumbnail: getYoutubeThumbnail(query) };
        } else {
            const result = await yts(query);
            if (!result?.videos?.length) {
                await sock.sendMessage(chatId, { text: 'Is naam ka koi YouTube result nahi mila.' }, { quoted: message });
                return;
            }
            video = result.videos[0];
        }

        // Download shuru hone se pehle song ka poster bhejna.
        if (video.thumbnail) {
            await sock.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: `🎵 *${video.title}*\n\n⏳ Is song ka audio download ho raha hai...`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: `⏳ Audio download ho rahi hai: *${video.title}*` }, { quoted: message });
        }
        const audioInfo = await requestAudio(video.url);
        let audioBuffer = await downloadMedia(audioInfo.url);

        const header = audioBuffer.slice(0, 12).toString('ascii');
        const isMp3 = audioBuffer.slice(0, 3).toString('ascii') === 'ID3' || audioBuffer[0] === 0xff;
        if (!isMp3) {
            const ext = header.startsWith('OggS') ? 'ogg' : (header.includes('ftyp') ? 'm4a' : 'webm');
            audioBuffer = await toAudio(audioBuffer, ext);
        }

        const safeTitle = String(audioInfo.title || video.title || 'song').replace(/[^\w\s-]/g, '').trim().slice(0, 80) || 'song';
        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`,
            ptt: false
        }, { quoted: message });
    } catch (error) {
        console.error('Song command error:', error.response?.data || error.message);
        await sock.sendMessage(chatId, { text: `❌ Song download nahi ho saki: ${error.message}` }, { quoted: message });
    }
}

module.exports = songCommand;

// Tested API: eliteprotech-apis.zone.id returned HTTP 200 with download.downloadUrl.
// Dead/invalid APIs removed: api.yupra.my.id, api.alyachan.pro, api.vreden.my.id, and Okatsu deployment.
// Media is downloaded into a Buffer before WhatsApp send, so expired API links do not break the command.
