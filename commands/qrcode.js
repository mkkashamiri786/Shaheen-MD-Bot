async function qrcodeCommand(sock, from, msg, q) {
    try {
        const loadEmojis = ['📱', '🔳', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆📱 𝐐𝐑 𝐂𝐎𝐃𝐄 𝐆𝐄𝐍
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .qrcode <text or url>

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .qrcode Hello
┆♛ .qrcode https://google.com

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(q)}`;

        await sock.sendMessage(from, {
            image: { url: qrUrl },
            caption: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆📱 𝐐𝐑 𝐂𝐎𝐃𝐄
╰━━━━━━━━━━━━━━━━⊷

📝 *𝐓𝐄𝐗𝐓:* ${q}
📐 *𝐒𝐈𝐙𝐄:* 500x500

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        console.log(e.message);
    }
}
module.exports = qrcodeCommand;