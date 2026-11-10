async function base64Command(sock, from, msg, q) {
    try {
        const loadEmojis = ['🔐', '📝', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔐 𝐁𝐀𝐒𝐄𝟔𝟒
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .base64 encode <text>
┆♛ .base64 decode <base64>

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .base64 encode Hello
┆♛ .base64 decode SGVsbG8=

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const args = q.trim().split(' ');
        const mode = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        if (!text) {
            return await sock.sendMessage(from, { text: '❌ Provide text.' }, { quoted: msg });
        }

        let result;
        if (mode === 'encode') {
            result = Buffer.from(text).toString('base64');
        } else if (mode === 'decode') {
            result = Buffer.from(text, 'base64').toString('utf-8');
        } else {
            return await sock.sendMessage(from, { text: '❌ Use: encode or decode' }, { quoted: msg });
        }

        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔐 𝐁𝐀𝐒𝐄𝟔𝟒
╰━━━━━━━━━━━━━━━━⊷

📝 *INPUT:*
┆${text}

━━━━━━━━━━━━━━━━━━━━━━
🔐 *${mode.toUpperCase()}:*
┆${result}

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Invalid input.' }, { quoted: msg });
    }
}
module.exports = base64Command;