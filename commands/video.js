const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

const API_TIMEOUT = 45000;
// WhatsApp ki practical maximum file limit ke qareeb rakha gaya hai.
// Duration ki koi limit nahi: 40, 50 ya 60 minute ki normal video bhi chalegi.
// Limit sirf WhatsApp/server safety ke liye file size par hai.
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;
const MIN_FREE_DISK_BYTES = 150 * 1024 * 1024;
const TEMP_DIR = path.join(__dirname, '../temp/videos');
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    Accept: 'application/json, text/plain, */*'
};

// ============================================
// MULTI-API LIST — pehli fail ho to agli try hoti hai
// ============================================
const APIS = [
    {
        name: 'EliteProTech',
        build: (u) => `https://eliteprotech-apis.zone.id/download/ytmp4?url=${encodeURIComponent(u)}&format=mp4`
    },
    {
        name: 'GiftedTech',
        build: (u) => `https://api.giftedtech.my.id/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(u)}`
    },
    {
        name: 'DavidCyril',
        build: (u) => `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(u)}`
    },
    {
        name: 'Nyxs',
        build: (u) => `https://api.nyxs.pw/dl/yt-mp4?url=${encodeURIComponent(u)}`
    }
];

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

// ============================================
// API RESPONSE PARSER — alag-alag formats handle karta hai
// (result.url / result.download_url / result.dl / downloadUrl waghera)
// ============================================
function findVideoUrl(obj, depth = 0) {
    if (!obj || depth > 5) return null;
    if (typeof obj === 'string') {
        return /^https?:\/\/\S+\.(mp4|mkv|webm|mov)(\?\S*)?$/i.test(obj) ? obj : null;
    }
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const found = findVideoUrl(item, depth + 1);
            if (found) return found;
        }
        return null;
    }
    if (typeof obj === 'object') {
        const keys = ['download_url', 'downloadUrl', 'dl', 'url', 'link', 'video', 'media'];
        for (const key of keys) {
            if (obj[key] && typeof obj[key] === 'string' && /^https?:\/\//i.test(obj[key])) {
                return obj[key];
            }
        }
        for (const key in obj) {
            const found = findVideoUrl(obj[key], depth + 1);
            if (found) return found;
        }
    }
    return null;
}

function findTitle(data, fallback) {
    return data?.result?.title || data?.title || data?.result?.metadata?.title || fallback;
}

// ============================================
// MULTI-API REQUEST — fail ho to agli API
// ============================================
async function requestVideo(youtubeUrl) {
    const errors = [];

    for (const api of APIS) {
        try {
            const response = await axios.get(api.build(youtubeUrl), { timeout: API_TIMEOUT, headers: HEADERS });
            const videoUrl = findVideoUrl(response.data);
            if (videoUrl) {
                console.log(`[video] API success: ${api.name}`);
                return { url: videoUrl, title: findTitle(response.data, 'YouTube Video') };
            }
            errors.push(`${api.name}: URL nahi mila`);
        } catch (error) {
            console.log(`[video] API fail: ${api.name} - ${error.message}`);
            errors.push(`${api.name}: ${error.code || error.message}`);
        }
    }

    throw new Error('Sab APIs fail ho gayin (' + errors.join(' | ') + ')');
}

// ============================================
// DISK CHECK — statfs na ho to skip (purane Node ke liye)
// ============================================
async function getFreeBytes() {
    try {
        await fsp.mkdir(TEMP_DIR, { recursive: true });
        if (typeof fsp.statfs === 'function') {
            const stats = await fsp.statfs(TEMP_DIR);
            return Number(stats.bavail) * Number(stats.bsize);
        }
        return Infinity;
    } catch (e) {
        return Infinity;
    }
}

async function downloadVideoToDisk(url) {
    await fsp.mkdir(TEMP_DIR, { recursive: true });
    const freeBefore = await getFreeBytes();
    if (freeBefore < MIN_FREE_DISK_BYTES) {
        throw new Error('Server storage mein temporary file ke liye jagah kam hai');
    }

    const filePath = path.join(TEMP_DIR, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.mp4`);
    let written = 0;
    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            timeout: 180000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: { 'User-Agent': HEADERS['User-Agent'], Accept: 'video/mp4,*/*' }
        });
        const contentType = String(response.headers['content-type'] || '').toLowerCase();
        const declaredLength = Number(response.headers['content-length'] || 0);
        if (declaredLength > MAX_VIDEO_BYTES) {
            throw new Error('Video 2GB se bari hai; WhatsApp itni bari file accept nahi karega');
        }
        if (contentType.includes('application/json') || contentType.includes('text/html')) {
            throw new Error('API ne video file ki bajaye error response diya');
        }

        const output = fs.createWriteStream(filePath, { flags: 'wx' });
        response.data.on('data', chunk => {
            written += chunk.length;
            if (written > MAX_VIDEO_BYTES) response.data.destroy(new Error('Video 2GB limit se bari hai'));
            if (freeBefore !== Infinity && written + MIN_FREE_DISK_BYTES > freeBefore) response.data.destroy(new Error('Server storage bharne wali hai'));
        });
        await pipeline(response.data, output);
        if (written < 1024) throw new Error('Downloaded video file khali ya invalid hai');
        return filePath;
    } catch (error) {
        await fsp.rm(filePath, { force: true }).catch(() => {});
        throw error;
    }
}

async function videoCommand(sock, chatId, message) {
    let videoPath;
    try {
        const query = getText(message).replace(/^\.video\s*/i, '').trim();
        if (!query) {
            await sock.sendMessage(chatId, { text: 'Istemaal: .video <video name ya YouTube link>' }, { quoted: message });
            return;
        }

        let video;
        if (isYoutubeUrl(query)) {
            video = { url: query, title: 'YouTube Video', thumbnail: getYoutubeThumbnail(query) };
        } else {
            const result = await yts(query);
            if (!result?.videos?.length) {
                await sock.sendMessage(chatId, { text: 'Is naam ka koi YouTube result nahi mila.' }, { quoted: message });
                return;
            }
            video = result.videos[0];
        }

        // Download shuru hone se pehle video ka YouTube poster bhejna.
        if (video.thumbnail) {
            await sock.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: `🎥 *${video.title}*\n\n⏳ Is video ka download ho raha hai...`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: `⏳ Video download ho rahi hai: *${video.title}*` }, { quoted: message });
        }
        const info = await requestVideo(video.url);
        videoPath = await downloadVideoToDisk(info.url);
        const safeTitle = String(info.title || video.title || 'video').replace(/[^\w\s-]/g, '').trim().slice(0, 80) || 'video';

        await sock.sendMessage(chatId, {
            video: { url: videoPath },
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`,
            caption: `*${safeTitle}*\n\n> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: message });
    } catch (error) {
        console.error('Video command error:', error.response?.data || error.message);
        await sock.sendMessage(chatId, { text: `❌ Video download nahi ho saki: ${error.message}` }, { quoted: message });
    } finally {
        if (videoPath) await fsp.rm(videoPath, { force: true }).catch(() => {});
    }
}

module.exports = videoCommand;

// ============================================
// CHANGES:
// 1. Multi-API fallback — ek API down ho to agli automatic try hoti hai
// 2. Smart parser — alag-alag API response formats handle karta hai
// 3. statfs guard — purane Node versions par crash nahi hoga
// ============================================
