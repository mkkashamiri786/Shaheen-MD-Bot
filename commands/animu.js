const axios = require('axios');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const runFFmpeg = promisify(execFile);

const ANIMU_BASE = 'https://api.some-random-api.com/animu';

const SUPPORTED = [
    'nom',
    'poke',
    'cry',
    'kiss',
    'pat',
    'hug',
    'wink',
    'face-palm',
    'quote'
];

function normalizeType(type = '') {
    const lower = type.toLowerCase().trim();

    if (['facepalm', 'face_palm'].includes(lower)) {
        return 'face-palm';
    }

    if (['animu-quote', 'animuquote'].includes(lower)) {
        return 'quote';
    }

    return lower;
}

function getMessageText(msg) {
    const m = msg.message || {};

    return (
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        m.documentMessage?.caption ||
        ''
    );
}

async function react(sock, chatId, msg, emoji) {
    try {
        await sock.sendMessage(chatId, {
            react: {
                text: emoji,
                key: msg.key
            }
        });
    } catch (e) {
        console.error('Reaction error:', e.message);
    }
}

async function reply(sock, chatId, msg, text) {
    return sock.sendMessage(
        chatId,
        { text },
        { quoted: msg }
    );
}

async function fetchAnime(type) {
    const response = await axios.get(
        `${ANIMU_BASE}/${encodeURIComponent(type)}`,
        {
            timeout: 20000,
            maxRedirects: 3,
            maxContentLength: 10 * 1024 * 1024,
            headers: {
                'User-Agent': '𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧'
            }
        }
    );

    return response.data;
}

async function downloadMedia(url) {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid media URL');
    }

    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxRedirects: 3,
        maxContentLength: 10 * 1024 * 1024,
        headers: {
            'User-Agent': '𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧'
        }
    });

    const buffer = Buffer.from(response.data);
    const contentType = (
        response.headers['content-type'] || ''
    ).toLowerCase();

    const isGif =
        contentType.includes('image/gif') ||
        buffer.subarray(0, 6).toString().startsWith('GIF8');

    const isImage =
        contentType.startsWith('image/') ||
        buffer.subarray(0, 4).toString() === 'RIFF';

    if (!isImage) {
        throw new Error('API did not return a valid image');
    }

    return { buffer, isGif };
}

async function convertToSticker(buffer, isAnimated) {
    const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), 'shaheen-animu-')
    );

    const input = path.join(tempDir, 'input.bin');
    const output = path.join(tempDir, 'output.webp');

    try {
        await fs.writeFile(input, buffer);

        const filters = isAnimated
            ? 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0,fps=15'
            : 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0';

        const ffmpegArgs = [
            '-y',
            '-i', input,
            '-vf', filters,
            '-vcodec', 'libwebp',
            '-preset', 'default',
            '-loop', '0',
            '-an',
            '-vsync', '0',
            '-pix_fmt', 'yuva420p',
            '-quality', isAnimated ? '55' : '75',
            '-compression_level', '6',
            output
        ];

        await runFFmpeg('ffmpeg', ffmpegArgs, {
            timeout: 60000,
            maxBuffer: 5 * 1024 * 1024
        });

        const sticker = await fs.readFile(output);

        if (!sticker.length) {
            throw new Error('Empty sticker output');
        }

        return sticker;

    } finally {
        await fs.remove(tempDir);
    }
}

async function sendAnime(sock, chatId, msg, type) {
    try {
        await react(sock, chatId, msg, '⏳');

        const data = await fetchAnime(type);

        // Anime quote
        if (data.quote) {
            await reply(sock, chatId, msg, data.quote);
            await react(sock, chatId, msg, '✅');
            return;
        }

        const mediaUrl = data.link;

        if (!mediaUrl) {
            throw new Error('No anime media received');
        }

        const { buffer, isGif } = await downloadMedia(mediaUrl);

        // Convert image/GIF into WebP sticker
        try {
            const stickerBuffer = await convertToSticker(
                buffer,
                isGif
            );

            await sock.sendMessage(chatId, {
                sticker: stickerBuffer,
                mimetype: 'image/webp',
                packname: 'SHAHEEN TV',
                author: '𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧'
            }, {
                quoted: msg
            });

            await react(sock, chatId, msg, '✅');
            return;

        } catch (stickerError) {
            console.error(
                'Sticker conversion failed:',
                stickerError.message
            );
        }

        // Fallback: Send original image
        await sock.sendMessage(chatId, {
            image: buffer,
            caption: `✨ Anime: ${type}\n\nPowered by 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, {
            quoted: msg
        });

        await react(sock, chatId, msg, '✅');

    } catch (error) {
        console.error('Animu Error:', error);

        await reply(
            sock,
            chatId,
            msg,
            '*❌ Failed to fetch anime.*\nPlease try again later.'
        );

        await react(sock, chatId, msg, '❌');
    }
}

async function animuCommand(
    sock,
    chatId,
    msg,
    command = 'animu',
    args = []
) {
    try {
        let type = '';

        if (Array.isArray(args) && args.length) {
            type = args[0];
        } else {
            const text = getMessageText(msg);
            const parts = text.trim().split(/\s+/);

            // Remove command prefix
            if (parts.length > 1) {
                type = parts[1];
            }
        }

        if (command !== 'animu' && command !== 'anime') {
            type = command;
        }

        type = normalizeType(type);

        if (!type) {
            return reply(
                sock,
                chatId,
                msg,
                `*「 SHAHEEN ANIME 」*\n\n` +
                `Usage: .animu <type>\n\n` +
                `Available Commands:\n` +
                SUPPORTED.map(x => `• ${x}`).join('\n') +
                `\n\nExample: .animu hug`
            );
        }

        if (!SUPPORTED.includes(type)) {
            return reply(
                sock,
                chatId,
                msg,
                `❌ Unsupported anime type: ${type}\n\n` +
                `Available: ${SUPPORTED.join(', ')}`
            );
        }

        await sendAnime(sock, chatId, msg, type);

    } catch (error) {
        console.error('Animu Command Error:', error);

        await reply(
            sock,
            chatId,
            msg,
            '❌ An unexpected error occurred.'
        );
    }
}

module.exports = animuCommand;
