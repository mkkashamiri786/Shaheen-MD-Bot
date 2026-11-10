const axios = require('axios');

async function ageCommand(sock, from, msg, q) {
    try {
        const loadEmojis = ['🎂', '📅', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🎂 𝐀𝐆𝐄 𝐂𝐀𝐋𝐂𝐔𝐋𝐀𝐓𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .age <DD/MM/YYYY>

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .age 15/08/2000
┆♛ .age 01/01/1995

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const parts = q.trim().split('/');
        if (parts.length !== 3) throw new Error('Invalid format');

        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);

        if (isNaN(day) || isNaN(month) || isNaN(year)) throw new Error('Invalid date');

        const today = new Date();
        const dob = new Date(year, month - 1, day);

        if (dob > today) throw new Error('Future date');

        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        let days = today.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.floor((today - dob) / (1000 * 60 * 60 * 24));

        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🎂 𝐀𝐆𝐄 𝐑𝐄𝐒𝐔𝐋𝐓
╰━━━━━━━━━━━━━━━━⊷

📅 *𝐃𝐎𝐁:* ${day}/${month}/${year}
📆 *𝐓𝐎𝐃𝐀𝐘:* ${today.toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━
🎂 *𝐘𝐎𝐔𝐑 𝐀𝐆𝐄:*
┆${years} Years, ${months} Months, ${days} Days

📊 *𝐓𝐎𝐓𝐀𝐋 𝐃𝐀𝐘𝐒:* ${totalDays} days

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Format: .age DD/MM/YYYY' }, { quoted: msg });
    }
}
module.exports = ageCommand;