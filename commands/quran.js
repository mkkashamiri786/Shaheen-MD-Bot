const axios = require('axios');

async function quranCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['📖', '✨', '🕌'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // Agar surah:ayah nahi diya
        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆📖 𝐐𝐔𝐑𝐀𝐍 𝐕𝐄𝐑𝐒𝐄
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .quran <surah:ayah>
┆♛ .quran 2:255

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .quran 2:255 (Ayat al-Kursi)
┆♛ .quran 1:1 (Al-Fatiha)
┆♛ .quran 18:10

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        // Format check: surah:ayah
        const parts = q.trim().split(':');
        if (parts.length !== 2) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆❌ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐅𝐎𝐑𝐌𝐀𝐓
╰━━━━━━━━━━━━━━━━⊷

⚠️ Format: surah:ayah

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .quran 2:255
┆♛ .quran 18:10

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const surah = parseInt(parts[0]);
        const ayah = parseInt(parts[1]);

        if (isNaN(surah) || isNaN(ayah)) {
            throw new Error('Invalid numbers');
        }

        // ✅ Al-Quran Cloud API (Free, No Key)
        // Arabic + English translation
        const [arabicRes, englishRes] = await Promise.all([
            axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-uthmani`, { timeout: 30000 }),
            axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.sahih`, { timeout: 30000 })
        ]);

        const arabicData = arabicRes.data.data;
        const englishData = englishRes.data.data;

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆📖 𝐐𝐔𝐑𝐀𝐍 𝐕𝐄𝐑𝐒𝐄
╰━━━━━━━━━━━━━━━━⊷

🕌 *𝐒𝐔𝐑𝐀𝐇:* ${arabicData.surah.englishName}
📖 *𝐒𝐔𝐑𝐀𝐇 𝐍𝐎:* ${arabicData.surah.number}
🔢 *𝐀𝐘𝐀𝐇:* ${arabicData.numberInSurah}

━━━━━━━━━━━━━━━━━━━━━━
*𝐀𝐑𝐀𝐁𝐈𝐂:*
${arabicData.text}

━━━━━━━━━━━━━━━━━━━━━━
*𝐄𝐍𝐆𝐋𝐈𝐒𝐇:*
${englishData.text}

━━━━━━━━━━━━━━━━━━━━━━
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('Quran Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Verse not found.
┆Check surah:ayah.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = quranCommand;