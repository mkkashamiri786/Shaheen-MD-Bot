const axios = require('axios');

async function hajjCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🕋', '🤲', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆🕋 𝐇𝐀𝐉𝐉 𝐈𝐍𝐅𝐎
╰━━━━━━━━━━━━━━━━⊷

📖 *𝐇𝐀𝐉𝐉 𝐊𝐘𝐀 𝐇𝐀𝐈𝐍?*

Hajj Islam ka 5th pillar hai. Har musalman par zindagi mein 
kam az kam ek baar Hajj karna farz hai, agar wo financially 
aur physically capable ho.

━━━━━━━━━━━━━━━━━━━━━━
🕋 *𝐇𝐀𝐉𝐉 𝐊𝐄 𝐀𝐑𝐊𝐀𝐍 (Pillars):*

┆1️⃣ *Ihram* — Niyat aur special dress
┆2️⃣ *Tawaf* — Kaaba ke 7 chakkar
┆3️⃣ *Sa\'i* — Safa aur Marwa ke beech 7 chakkar
┆4️⃣ *Wuquf* — Arafat mein rukna (9 Zil-Hajj)
┆5️⃣ *Halq/Taqsir* — Baal katwana
┆6️⃣ *Qurbani* — Janwar ki qurbani

━━━━━━━━━━━━━━━━━━━━━━
📅 *𝐇𝐀𝐉𝐉 𝐊𝐄 𝐌𝐀𝐇𝐈𝐍𝐄:*

┆🌙 *Zil-Hajj:* 8th, 9th, 10th
┆📍 *Maqam:* Makkah, Arafat, Mina, Muzdalifah

━━━━━━━━━━━━━━━━━━━━━━
🕌 *𝐓𝐘𝐏𝐄𝐒 𝐎𝐅 𝐇𝐀𝐉𝐉:*

┆♛ *Hajj al-Tamattu* — Umrah pehle, phir Hajj
┆♛ *Hajj al-Qiran* — Umrah aur Hajj ek saath
┆♛ *Hajj al-Ifrad* — Sirf Hajj

━━━━━━━━━━━━━━━━━━━━━━
🤲 *𝐃𝐔𝐀 𝐅𝐎𝐑 𝐇𝐀𝐉𝐉:*

اللَّهُمَّ حَجَّ بَيْتِكَ الْحَرَامِ

*Allahumma hajj baytika al-haram*
"O Allah, grant us the pilgrimage to Your Sacred House."

━━━━━━━━━━━━━━━━━━━━━━
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('Hajj Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Kuch masla ho gaya.
┆Dobara try karein.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = hajjCommand;