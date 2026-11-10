const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

const API_TIMEOUT = 45000;
// Movie lambi hoti hai — 2GB tak WhatsApp accept karta hai
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;
const MIN_FREE_DISK_BYTES = 150 * 1024 * 1024;
const MIN_MOVIE_SECONDS = 45 * 60; // 45 minute se kam = movie nahi
const TEMP_DIR = path.join(__dirname, '../temp/movies');
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

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getText(message) {
    const content = message.message?.ephemeralMessage?.message || message.message?.viewOnceMessage?.message || message.message?.viewOnceMessageV2?.message || message.message || {};
    return (content.conversation || content.extendedTextMessage?.text || content.imageMessage?.caption || content.videoMessage?.caption || '').trim();
}

// ============================================
// API RESPONSE PARSER
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
// MULTI-API REQUEST
// ============================================
async function requestVideo(youtubeUrl) {
    const errors = [];

    for (const api of APIS) {
        try {
            const response = await axios.get(api.build(youtubeUrl), { timeout: API_TIMEOUT, headers: HEADERS });
            const videoUrl = findVideoUrl(response.data);
            if (videoUrl) {
                console.log(`[movie] API success: ${api.name}`);
                return { url: videoUrl, title: findTitle(response.data, 'Movie') };
            }
            errors.push(`${api.name}: URL nahi mila`);
        } catch (error) {
            console.log(`[movie] API fail: ${api.name} - ${error.message}`);
            errors.push(`${api.name}: ${error.code || error.message}`);
        }
    }

    throw new Error('Sab APIs fail ho gayin (' + errors.join(' | ') + ')');
}

// ============================================
// DISK CHECK
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
        throw new Error('Server storage mein jagah kam hai');
    }

    const filePath = path.join(TEMP_DIR, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.mp4`);
    let written = 0;
    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            timeout: 300000, // movies lambi — 5 min download timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: { 'User-Agent': HEADERS['User-Agent'], Accept: 'video/mp4,*/*' }
        });
        const contentType = String(response.headers['content-type'] || '').toLowerCase();
        const declaredLength = Number(response.headers['content-length'] || 0);
        if (declaredLength > MAX_VIDEO_BYTES) {
            throw new Error('Movie 2GB se bari hai; WhatsApp itni bari file accept nahi karega');
        }
        if (contentType.includes('application/json') || contentType.includes('text/html')) {
            throw new Error('API ne video file ki bajaye error response diya');
        }

        const output = fs.createWriteStream(filePath, { flags: 'wx' });
        response.data.on('data', chunk => {
            written += chunk.length;
            if (written > MAX_VIDEO_BYTES) response.data.destroy(new Error('Movie 2GB limit se bari hai'));
            if (freeBefore !== Infinity && written + MIN_FREE_DISK_BYTES > freeBefore) response.data.destroy(new Error('Server storage bharne wali hai'));
        });
        await pipeline(response.data, output);
        if (written < 1024) throw new Error('Downloaded file khali ya invalid hai');
        return filePath;
    } catch (error) {
        await fsp.rm(filePath, { force: true }).catch(() => {});
        throw error;
    }
}

// ============================================
// MOVIE COMMAND  (.movie <name>)
// ============================================
async function movieCommand(sock, chatId, message) {
    let videoPath;
    try {
        const query = getText(message).replace(/^\.movie\s*/i, '').trim();
        if (!query) {
            await sock.sendMessage(chatId, { text: 'Istemaal: .movie <movie ka naam>\nMisal: .movie 3 idiots' }, { quoted: message });
            return;
        }

        let movie;
        if (isYoutubeUrl(query)) {
            movie = { url: query, title: 'Movie', thumbnail: getYoutubeThumbnail(query), duration: null };
        } else {
            // "full movie" ke saath search — results zyada relevant aate hain
            const result = await yts(query + ' full movie');
            if (!result?.videos?.length) {
                await sock.sendMessage(chatId, { text: 'Is naam ki koi movie nahi mili.' }, { quoted: message });
                return;
            }
            // Pehle 45+ minute wali videos — asli movies
            let candidates = result.videos.filter(v => v.duration && v.duration.seconds >= MIN_MOVIE_SECONDS);
            // Agar koi lambi na mile to sab mein se sabse lambi utha lo
            if (!candidates.length) candidates = result.videos.slice();
            candidates.sort((a, b) => (b.duration?.seconds || 0) - (a.duration?.seconds || 0));
            movie = candidates[0];
        }

        const durationText = movie.duration ? `\n⏱️ Duration: ${formatDuration(movie.duration.seconds)}` : '';

        // Poster + info bhejo
        if (movie.thumbnail) {
            await sock.sendMessage(chatId, {
                image: { url: movie.thumbnail },
                caption: `🎬 *${movie.title}*${durationText}\n\n⏳ Movie download ho rahi hai...\n⚠️ Lambi movie ho to kuch waqt lega!`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: `⏳ Movie download ho rahi hai: *${movie.title}*` }, { quoted: message });
        }

        const info = await requestVideo(movie.url);
        videoPath = await downloadVideoToDisk(info.url);
        const safeTitle = String(info.title || movie.title || 'movie').replace(/[^\w\s-]/g, '').trim().slice(0, 80) || 'movie';

        await sock.sendMessage(chatId, {
            video: { url: videoPath },
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`,
            caption: `🎬 *${safeTitle}*${durationText}\n\n> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: message });
    } catch (error) {
        console.error('Movie command error:', error.response?.data || error.message);
        await sock.sendMessage(chatId, { text: `❌ Movie download nahi ho saki: ${error.message}` }, { quoted: message });
    } finally {
        if (videoPath) await fsp.rm(videoPath, { force: true }).catch(() => {});
    }
}

module.exports = movieCommand;

// ============================================
// NOTE: YouTube par available movies (free/public)
// download hoti hain. Lambi movies ke liye
// download time zyada lag sakta hai — yeh normal hai.
// ============================================
