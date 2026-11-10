const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// BG REMOVE API KEY
const API_KEY = 'JkDShdmdQWdPr9kyemba6mUd';

function unwrapMessage(message) {
    let content = message?.message || {};

    while (
        content.ephemeralMessage ||
        content.viewOnceMessage ||
        content.viewOnceMessageV2
    ) {
        content =
            content.ephemeralMessage?.message ||
            content.viewOnceMessage?.message ||
            content.viewOnceMessageV2?.message ||
            content;
    }

    return content;
}

async function bgremoveCommand(sock, chatId, message) {
    try {
        const content = unwrapMessage(message);
        const contextInfo =
            content.extendedTextMessage?.contextInfo ||
            content.imageMessage?.contextInfo ||
            content.videoMessage?.contextInfo;

        if (!contextInfo?.quotedMessage) {
            return await sock.sendMessage(chatId, {
                text: `╭━━━〔 ⚠️ 𝐖ᴀʀɴɪɴɢ 〕━━━┈⊷
┃
┃ Reply to an image!
┃
┃ Command: .bgremove
┃
╰━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: message });
        }

        const quotedContent = contextInfo.quotedMessage;

        const imageMessage =
            quotedContent.imageMessage ||
            quotedContent.viewOnceMessage?.message?.imageMessage ||
            quotedContent.viewOnceMessageV2?.message?.imageMessage ||
            quotedContent.ephemeralMessage?.message?.imageMessage;

        if (!imageMessage) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please reply to an image, not text or video.'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: '⏳ Removing image background...\nPlease wait!'
        }, { quoted: message });

        const quoted = {
            key: {
                remoteJid: chatId,
                id: contextInfo.stanzaId,
                participant: contextInfo.participant
            },
            message: quotedContent
        };

        const imageBuffer = await downloadMediaMessage(
            quoted,
            'buffer',
            {}
        );

        const form = new FormData();

        form.append('image_file', imageBuffer, {
            filename: 'image.png',
            contentType: 'image/png'
        });

        form.append('size', 'auto');

        const response = await axios.post(
            'https://api.remove.bg/v1.0/removebg',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'X-Api-Key': API_KEY
                },
                responseType: 'arraybuffer',
                timeout: 120000,
                maxBodyLength: Infinity
            }
        );

        const resultBuffer = Buffer.from(response.data);

        await sock.sendMessage(chatId, {
            image: resultBuffer,
            mimetype: 'image/png',
            fileName: 'Shaheen-BG-Removed.png',
            caption: `╭━━━〔 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧 〕━━━┈⊷
┃
┃ ✅ Background Removed!
┃
┃ 🖼️ Format: PNG
┃ ✨ Transparent Background
┃ 🤖 Tool: BG REMOVE
┃ 👑 Powered By 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧 
┃
╰━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: message });

    } catch (error) {
        let errorMessage = error.message;

        if (error.response?.data) {
            try {
                const data = Buffer.from(error.response.data).toString();
                errorMessage = JSON.parse(data)?.errors?.[0]?.title || data;
            } catch (_) {}
        }

        console.error('BGREMOVE ERROR:', errorMessage);

        await sock.sendMessage(chatId, {
            text: `❌ BG Remove Failed!\n\nError: ${errorMessage}`
        }, { quoted: message });
    }
}

module.exports = bgremoveCommand;
