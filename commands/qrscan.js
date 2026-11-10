const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function qrscanCommand(sock, from, msg, q) {
    try {
        const loadEmojis = ['🔍', '📱', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = msg.message?.imageMessage || quoted?.imageMessage;

        if (!imageMessage) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔍 𝐐𝐑 𝐒𝐂𝐀𝐍
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ QR image reply karke
┆♛ .qrscan bhejein

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const form = new FormData();
        form.append('file', buffer, { filename: 'qr.jpg' });

        const res = await axios.post(
            'https://api.qrserver.com/v1/read-qr-code/',
            form,
            { headers: form.getHeaders(), timeout: 60000 }
        );

        const data = res.data[0]?.symbol[0];

        if (!data || !data.data) {
            throw new Error('No QR detected');
        }

        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔍 𝐐𝐑 𝐑𝐄𝐒𝐔𝐋𝐓
╰━━━━━━━━━━━━━━━━⊷

📝 *𝐃𝐀𝐓𝐀:*
┆${data.data}

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        console.log(e.message);
        await sock.sendMessage(from, { text: '❌ No QR found.' }, { quoted: msg });
    }
}
module.exports = qrscanCommand;