
const axios = require('axios');
const FormData = require('form-data');
const {
    downloadMediaMessage
} = require('@whiskeysockets/baileys');

// IMGBB API KEY
const API_KEY = '8db492efc937a635b90680a9a860dc85';

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

async function urlCommand(sock, chatId, message) {
    try {
        const content = unwrapMessage(message);

        const contextInfo =
            content.extendedTextMessage?.contextInfo ||
            content.imageMessage?.contextInfo;

        if (!contextInfo?.quotedMessage && !content.imageMessage) {
            return await sock.sendMessage(chatId, {
                text: `╭━━━〔 ⚠️ 𝐖ᴀʀɴɪɴɢ 〕━━━┈⊷
┃
┃ Reply to an image!
┃
┃ Command: .url
┃
╰━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: message });
        }

        const quotedContent = contextInfo?.quotedMessage
            ? unwrapMessage({ message: contextInfo.quotedMessage })
            : content;

        const imageMessage = quotedContent.imageMessage;

        if (!imageMessage) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please reply to an image, not text or video.'
            }, { quoted: message });
        }

        if (!API_KEY) {
            throw new Error('ImgBB API key .env mein configure nahi hai.');
        }

        await sock.sendMessage(chatId, {
            text: '⏳ Uploading image...\nPlease wait!'
        }, { quoted: message });

        let imageBuffer;

        if (contextInfo?.quotedMessage) {
            const quoted = {
                key: {
                    remoteJid: chatId,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                },
                message: contextInfo.quotedMessage
            };

            imageBuffer = await downloadMediaMessage(
                quoted,
                'buffer',
                {}
            );
        } else {
            imageBuffer = await downloadMediaMessage(
                message,
                'buffer',
                {}
            );
        }

        const form = new FormData();

        form.append('key', API_KEY);
        form.append('image', imageBuffer.toString('base64'));
        form.append('name', `Shaheen_${Date.now()}`);

        const response = await axios.post(
            'https://api.imgbb.com/1/upload',
            form,
            {
                headers: form.getHeaders(),
                timeout: 120000,
                maxBodyLength: Infinity
            }
        );

        const imageUrl = response.data?.data?.url;

        if (!imageUrl) {
            throw new Error('ImgBB URL return nahi hui.');
        }

        await sock.sendMessage(chatId, {
            text: `╭━━━〔 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧 〕━━━┈⊷
┃
┃ ✅ Image Uploaded Successfully!
┃
┃ 🔗 Image URL:
┃ ${imageUrl}
┃
┃ 📋 Copy Your Image URL
┃ 🖼️ Format: ${imageMessage.mimetype || 'Image'}
┃
┃ 👑 Powered By 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
┃
╰━━━━━━━━━━━━━━━━━━┈⊷`,
            linkPreview: { url: imageUrl }
        }, { quoted: message });

    } catch (error) {
        let errorMessage = error.message;

        if (error.response?.data) {
            errorMessage =
                error.response.data?.error?.message ||
                error.response.data?.data?.error?.message ||
                errorMessage;
        }

        console.error('URL COMMAND ERROR:', errorMessage);

        await sock.sendMessage(chatId, {
            text: `❌ Image Upload Failed!\n\nError: ${errorMessage}`
        }, { quoted: message });
    }
}

module.exports = urlCommand;