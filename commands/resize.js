const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ✅ Default size (jab koi dimension na de)
const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 720;

async function resizeCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🖼️', '📐', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // Image check
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = msg.message?.imageMessage || quoted?.imageMessage;

        if (!imageMessage) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🖼️ 𝐈𝐌𝐀𝐆𝐄 𝐑𝐄𝐒𝐈𝐙𝐄𝐑
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*

┆♛ *𝐀𝐮𝐭𝐨 𝐑𝐞𝐬𝐢𝐳𝐞:*
┆   Image reply → .resize

┆♛ *𝐂𝐮𝐬𝐭𝐨𝐦 𝐒𝐢𝐳𝐞:*
┆   Image reply → .resize 500 500

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .resize (auto 720x720)
┆♛ .resize 1280 720

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        // Dimensions check
        const args = (q || '').trim().split(/\s+/).filter(Boolean);
        
        let width = DEFAULT_WIDTH;
        let height = DEFAULT_HEIGHT;
        let isCustom = false;

        // ✅ Agar user ne dimensions di hain to use karo
        if (args.length >= 2) {
            const w = parseInt(args[0]);
            const h = parseInt(args[1]);
            
            if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0 && w <= 4096 && h <= 4096) {
                width = w;
                height = h;
                isCustom = true;
            }
        }

        // Image download
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Upload to Catbox
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, {
            filename: `resize_${Date.now()}.jpg`
        });

        const uploadRes = await axios.post(
            'https://catbox.moe/user/api.php',
            form,
            {
                headers: form.getHeaders(),
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        const imageUrl = uploadRes.data.trim();

        if (!imageUrl || !imageUrl.startsWith('http')) {
            throw new Error('Upload failed');
        }

        // Resize via weserv.nl
        const resizedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=${width}&h=${height}&fit=cover&output=jpg&q=90`;

        // Download resized
        const resizedRes = await axios.get(resizedUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        const resizedBuffer = Buffer.from(resizedRes.data);

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🖼️ 𝐑𝐄𝐒𝐈𝐙𝐄𝐃 𝐈𝐌𝐀𝐆𝐄
╰━━━━━━━━━━━━━━━━⊷

📐 *𝐖𝐈𝐃𝐓𝐇:* ${width}px
📏 *𝐇𝐄𝐈𝐆𝐇𝐓:* ${height}px
🎨 *𝐅𝐎𝐑𝐌𝐀𝐓:* JPG
⚡ *𝐐𝐔𝐀𝐋𝐈𝐓𝐘:* High
🔧 *𝐌𝐎𝐃𝐄:* ${isCustom ? 'Custom' : 'Auto'}

╭━━━━━━━━━━━━━━━━⊷
┆✅ 𝐈𝐌𝐀𝐆𝐄 𝐑𝐄𝐒𝐈𝐙𝐄𝐃
╰━━━━━━━━━━━━━━━━⊷
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, {
            image: resizedBuffer,
            caption
        }, { quoted: msg });

    } catch (e) {
        console.log('Resize Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆❌ 𝐑𝐄𝐒𝐈𝐙𝐄 𝐅𝐀𝐈𝐋𝐄𝐃
╰━━━━━━━━━━━━━━━━⊷

⚠️ Image resize nahi ho saki.
┆Dobara try karein.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = resizeCommand;