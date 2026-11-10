const axios = require('axios');

async function islamicdateCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🌙', '📅', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // ✅ Aladhan API for Hijri date
        const res = await axios.get('https://api.aladhan.com/v1/gToH', { timeout: 30000 });
        const data = res.data.data;

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆🌙 𝐈𝐒𝐋𝐀𝐌𝐈𝐂 𝐃𝐀𝐓𝐄
╰━━━━━━━━━━━━━━━━⊷

📅 *𝐆𝐑𝐄𝐆𝐎𝐑𝐈𝐀𝐍:*
┆${data.gregorian.date}
┆${data.gregorian.weekday.en}, ${data.gregorian.month.en} ${data.gregorian.year}

🌙 *𝐇𝐈𝐉𝐑𝐈:*
┆${data.hijri.date}
┆${data.hijri.weekday.ar}, ${data.hijri.month.ar} ${data.hijri.year}

━━━━━━━━━━━━━━━━━━━━━━
🕌 *𝐈𝐒𝐋𝐀𝐌𝐈𝐂 𝐌𝐎𝐍𝐓𝐇:*
┆${data.hijri.month.en} (${data.hijri.month.number})

📿 *𝐃𝐀𝐘:* ${data.hijri.day}
📖 *𝐘𝐄𝐀𝐑:* ${data.hijri.year} AH

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('Islamic Date Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Date load nahi ho saki.
┆Dobara try karein.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = islamicdateCommand;