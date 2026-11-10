async function waCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['📱', '🔗', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // 3 scenarios:
        // 1. Reply to message → us user ka link banao
        // 2. @mention → us user ka link
        // 3. Number de → direct link

        let targetNumber = null;
        let customMessage = '';
        let targetName = 'User';

        // Option 1: Number diya (with optional message)
        if (q) {
            const parts = q.trim().split(' ');
            let num = parts[0].replace(/[^0-9]/g, '');
            
            if (num.length >= 10) {
                targetNumber = num;
                // Message bhi hai to le lo
                if (parts.length > 1) {
                    customMessage = parts.slice(1).join(' ');
                }
            }
        }

        // Option 2: Reply to message
        if (!targetNumber) {
            const ctx = msg.message?.extendedTextMessage?.contextInfo;
            if (ctx?.participant) {
                targetNumber = ctx.participant.split('@')[0].split(':')[0];
            }
        }

        // Option 3: Mention
        if (!targetNumber) {
            const ctx = msg.message?.extendedTextMessage?.contextInfo;
            if (ctx?.mentionedJid?.length > 0) {
                targetNumber = ctx.mentionedJid[0].split('@')[0].split(':')[0];
            }
        }

        if (!targetNumber) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆📱 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐋𝐈𝐍𝐊
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .wa <number>
┆♛ .wa <number> <message>
┆♛ .wa @mention
┆♛ .wa (reply karke)

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .wa 923001234567
┆♛ .wa 923001234567 Salam bhai
┆♛ .wa @user

🔗 *𝐎𝐔𝐓𝐏𝐔𝐓:*
┆wa.me link (direct chat)

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        // ✅ Link generate karo
        const baseLink = `https://wa.me/${targetNumber}`;
        const linkWithMessage = customMessage 
            ? `${baseLink}?text=${encodeURIComponent(customMessage)}`
            : baseLink;

        // ✅ User ka profile check karo
        let exists = false;
        try {
            const jid = targetNumber + '@s.whatsapp.net';
            const onWa = await sock.onWhatsApp(jid);
            if (onWa && onWa[0]) exists = onWa[0].exists;
        } catch (e) {}

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆📱 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐋𝐈𝐍𝐊
╰━━━━━━━━━━━━━━━━⊷

📞 *𝐍𝐔𝐌𝐁𝐄𝐑:* +${targetNumber}
${exists ? '✅ WhatsApp Active' : '⚠️ Not on WhatsApp'}

━━━━━━━━━━━━━━━━━━━━━━
🔗 *𝐃𝐈𝐑𝐄𝐂𝐓 𝐋𝐈𝐍𝐊:*

${linkWithMessage}

━━━━━━━━━━━━━━━━━━━━━━
💡 *𝐔𝐒𝐄:*
┆♛ Link copy karein
┆♛ Browser mein kholen
┆♛ Direct chat khul jayegi

${customMessage ? `\n📝 *𝐌𝐄𝐒𝐒𝐀𝐆𝐄:*\n┆${customMessage}` : ''}

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('WA Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Invalid number.
┆Check and try again.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = waCommand;