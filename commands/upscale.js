const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function upscaleCommand(sock, from, msg, q) {
    try {
        const loadEmojis = ['🖼️', '✨', '🔍'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = msg.message?.imageMessage || quoted?.imageMessage;

        if (!imageMessage) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🖼️ 𝐔𝐏𝐒𝐂𝐀𝐋𝐄
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ Image reply karke .upscale

📊 *𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒:*
┆• 2x-4x HD
┆• Quality boost
┆• AI enhancement

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝐘 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: `up_${Date.now()}.jpg` });

        const uploadRes = await axios.post(
            'https://catbox.moe/user/api.php',
            form,
            { headers: form.getHeaders(), timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity }
        );

        const imageUrl = uploadRes.data.trim();

        const upscaleUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=2000&h=2000&fit=inside&output=jpg&q=95&sharp=1`;

        await sock.sendMessage(from, {
            image: { url: upscaleUrl },
            caption: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🖼️ 𝐔𝐏𝐒𝐂𝐀𝐋𝐄𝐃
╰━━━━━━━━━━━━━━━━⊷

✅ *STATUS:* Success
📐 *MODE:* 2x HD
🎨 *QUALITY:* Enhanced

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Upscale failed.' }, { quoted: msg });
    }
}
module.exports = upscaleCommand;