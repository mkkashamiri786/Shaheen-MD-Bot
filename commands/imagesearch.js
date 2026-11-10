const axios = require('axios');
const cheerio = require('cheerio');

async function imagesearchCommand(sock, from, msg, q) {
    try {
        const loadEmojis = ['🔍', '🖼️', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔍 𝐈𝐌𝐀𝐆𝐄 𝐒𝐄𝐀𝐑𝐂𝐇
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .imagesearch <query>

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .imagesearch cat
┆♛ .imagesearch nature

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        // Use picsum or Unsplash-like source
        const seed = encodeURIComponent(q) + Date.now();
        const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;

        await sock.sendMessage(from, {
            image: { url: imageUrl },
            caption: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔍 𝐈𝐌𝐀𝐆𝐄 𝐒𝐄𝐀𝐑𝐂𝐇
╰━━━━━━━━━━━━━━━━⊷

🔎 *QUERY:* ${q}
📐 *SIZE:* 1024x1024

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Search failed.' }, { quoted: msg });
    }
}
module.exports = imagesearchCommand;