const axios = require('axios');

async function prayerCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🕌', '⏰', '🌙'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // Agar city nahi diya
        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆🕌 𝐏𝐑𝐀𝐘𝐄𝐑 𝐓𝐈𝐌𝐄𝐒
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .prayer <city>
┆♛ .prayer Karachi

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .prayer Karachi
┆♛ .prayer Lahore
┆♛ .prayer Islamabad

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const city = q.trim();
        const country = 'Pakistan'; // Default country

        // ✅ Aladhan API (Free, No Key)
        const res = await axios.get(
            `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=1`,
            { timeout: 30000 }
        );

        const data = res.data.data;
        const timings = data.timings;
        const date = data.date;

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆🕌 𝐏𝐑𝐀𝐘𝐄𝐑 𝐓𝐈𝐌𝐄𝐒
╰━━━━━━━━━━━━━━━━⊷

📍 *𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍:* ${city}, ${country}
📅 *𝐃𝐀𝐓𝐄:* ${date.readable}
🌙 *𝐇𝐈𝐉𝐑𝐈:* ${date.hijri.date}

━━━━━━━━━━━━━━━━━━━━━━
🕐 *𝐓𝐈𝐌𝐄𝐒:*

┆🌅 *Fajr:* ${timings.Fajr}
┆🌄 *Sunrise:* ${timings.Sunrise}
┆☀️ *Dhuhr:* ${timings.Dhuhr}
┆🌤️ *Asr:* ${timings.Asr}
┆🌇 *Maghrib:* ${timings.Maghrib}
┆🌙 *Isha:* ${timings.Isha}

━━━━━━━━━━━━━━━━━━━━━━
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('Prayer Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ City not found.
┆Check spelling.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = prayerCommand;