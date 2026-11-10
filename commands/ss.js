const axios = require('axios');

async function screenshotCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🌐', '📸', '🖥️'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        if (!q) {
            const helpText = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆🖥️ 𝐖𝐄𝐁𝐒𝐈𝐓𝐄 𝐒𝐂𝐑𝐄𝐄𝐍𝐒𝐇𝐎𝐓
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .screenshot <URL>
┆♛ .ss <URL>
┆♛ .webshot <URL>

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .ss https://google.com
┆♛ .ss https://youtube.com

🎨 *𝐐𝐔𝐀𝐋𝐈𝐓𝐘:*
┆• Resolution: 1280x720 HD
┆• Full Page: Enabled

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;
            return await sock.sendMessage(from, { text: helpText }, { quoted: msg });
        }

        // ✅ API call
        const apiUrl = `https://movanest.xyz/v2/ssweb?url=${encodeURIComponent(q)}&width=1280&height=720&full_page=true`;
        const res = await axios.get(apiUrl, { timeout: 60000 });

        if (!res.data || !res.data.status || !res.data.screenshot) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐀𝐏𝐈 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Screenshot generate nahi hua
┆API se response nahi aaya

💡 *𝐓𝐑𝐘:*
┆• Dobara try karein
┆• URL check karein

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const screenshotUrl = res.data.screenshot;

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆🖥️ 𝐖𝐄𝐁𝐒𝐈𝐓𝐄 𝐒𝐂𝐑𝐄𝐄𝐍𝐒𝐇𝐎𝐓
╰━━━━━━━━━━━━━━━━⊷

🌐 *𝐔𝐑𝐋:* ${q}
📐 *𝐒𝐈𝐙𝐄:* 1280 x 720 (HD)
📄 *𝐌𝐎𝐃𝐄:* Full Page

╭━━━━━━━━━━━━━━━━⊷
┆✅ 𝐒𝐂𝐑𝐄𝐄𝐍𝐒𝐇𝐎𝐓
┆   𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃
╰━━━━━━━━━━━━━━━━⊷
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, {
            image: { url: screenshotUrl },
            caption
        }, { quoted: msg });

    } catch (err) {
        console.error("SCREENSHOT COMMAND ERROR:", err.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Screenshot generate nahi hua
┆API busy ya timeout

💡 *𝐓𝐑𝐘:*
┆• Thori der baad try karein
┆• Valid URL dein

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = screenshotCommand;