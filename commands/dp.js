function contentOf(msg) {
    let m = msg?.message || {};
    for (let i = 0; i < 6 && m; i++) {
        if (m.ephemeralMessage?.message) { m = m.ephemeralMessage.message; continue; }
        if (m.viewOnceMessageV2?.message) { m = m.viewOnceMessageV2.message; continue; }
        if (m.viewOnceMessage?.message) { m = m.viewOnceMessage.message; continue; }
        break;
    }
    return m || {};
}

function contextOf(msg) {
    const m = contentOf(msg);
    return m.extendedTextMessage?.contextInfo || 
           m.imageMessage?.contextInfo || 
           m.videoMessage?.contextInfo || 
           m.documentMessage?.contextInfo || 
           m.audioMessage?.contextInfo || {};
}

async function resolveNumber(sock, value) {
    const n = String(value || '').replace(/[^0-9]/g, '');
    if (n.length < 7) return null;
    const candidates = await sock.onWhatsApp(n).catch(() => []);
    return candidates?.find(x => x?.exists)?.jid || 
           candidates?.[0]?.jid || 
           `${n}@s.whatsapp.net`;
}

async function dpCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🔍', '📥', '🖼️'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        const ctx = contextOf(msg);
        let target = (ctx.mentionedJid || ctx.mentionedJids || [])[0] || ctx.participant;
        
        if (!target && ctx.quotedMessage && ctx.remoteJid) {
            target = ctx.participant || ctx.remoteJid;
        }
        if (!target && q) {
            target = await resolveNumber(sock, q);
        }

        if (!target) {
            const helpText = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆🖼️ 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐏𝐈𝐂𝐓𝐔𝐑𝐄
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .dp <𝐍𝐔𝐌𝐁𝐄𝐑>
┆♛ .dp <@𝐌𝐄𝐍𝐓𝐈𝐎𝐍>
┆♛ .dp <𝐑𝐄𝐏𝐋𝐘>

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .dp 923xxxxxxxxx
┆♛ .dp @username

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;
            return sock.sendMessage(from, { text: helpText }, { quoted: msg });
        }

        target = String(target).replace(/:\d+(?=@)/, '');
        
        let pp;
        try { 
            pp = await sock.profilePictureUrl(target, 'image'); 
        } catch { 
            try { 
                pp = await sock.profilePictureUrl(target, 'preview'); 
            } catch {} 
        }

        if (!pp) throw Error('profile picture unavailable');

        const number = target.split('@')[0];

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆🖼️ 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐏𝐈𝐂𝐓𝐔𝐑𝐄
╰━━━━━━━━━━━━━━━━⊷

👤 *𝐍𝐔𝐌𝐁𝐄𝐑:* @${number}
✅ *𝐒𝐓𝐀𝐓𝐔𝐒:* Downloaded
⚡ *𝐒𝐎𝐔𝐑𝐂𝐄:* WhatsApp Server

╭━━━━━━━━━━━━━━━━⊷
┆❖ 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐏𝐈𝐂𝐓𝐔𝐑𝐄
┆   𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘
╰━━━━━━━━━━━━━━━━⊷
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, {
            image: { url: pp },
            caption,
            mentions: [target]
        }, { quoted: msg });

    } catch {
        const errorText = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐍𝐎𝐓 𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄
╰━━━━━━━━━━━━━━━━⊷

⚠️ *𝐄𝐑𝐑𝐎𝐑:*
┆Profile picture is not
┆available for this user
┆or number.

💡 *𝐑𝐄𝐀𝐒𝐎𝐍:*
┆• User ne DP hide ki hai
┆• Ya number invalid hai

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;
        return sock.sendMessage(from, { text: errorText }, { quoted: msg });
    }
}

module.exports = dpCommand;