module.exports = async (sock, from, msg) => {
    try {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, {
                text: '❌ Yeh command sirf groups mein kaam karti hai.'
            }, { quoted: msg });
        }

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = contextInfo?.mentionedJid || [];
        const sender = contextInfo?.participant || msg.key.participant;

        if (!mentioned.length) {
            return await sock.sendMessage(from, {
                text: '⚠️ Kisi member ko mention karke .kick likhein.'
            }, { quoted: msg });
        }

        const groupMetadata = await sock.groupMetadata(from);

        const normalize = (id) => id.split(':')[0].split('@')[0];

        const botId = normalize(sock.user.id);
        const senderId = normalize(sender);

        const botParticipant = groupMetadata.participants.find(
            p => normalize(p.id) === botId
        );
        const senderParticipant = groupMetadata.participants.find(
            p => normalize(p.id) === senderId
        );

        // 1. Bot admin check
        if (!botParticipant?.admin) {
            return await sock.sendMessage(from, {
                text: '❌ Bot ko group admin banayein.'
            }, { quoted: msg });
        }

        // 2. Sender admin check
        if (!senderParticipant?.admin) {
            return await sock.sendMessage(from, {
                text: '❌ Sirf group admin kick kar sakte hain.'
            }, { quoted: msg });
        }

        // 3. Bot khud ko kick na kare
        const filtered = mentioned.filter(m => normalize(m) !== botId);
        if (!filtered.length) {
            return await sock.sendMessage(from, {
                text: '❌ Bot khud ko kick nahi kar sakta.'
            }, { quoted: msg });
        }

        // 4. Admin ko kick na kare
        const admins = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => normalize(p.id));

        const toKick = filtered.filter(m => !admins.includes(normalize(m)));
        if (!toKick.length) {
            return await sock.sendMessage(from, {
                text: '❌ Admin ko kick nahi kar sakte.'
            }, { quoted: msg });
        }

        await sock.groupParticipantsUpdate(from, toKick, 'remove');

        await sock.sendMessage(from, {
            text: `✅ ${toKick.length} member(s) successfully removed from the group.\n\n> 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐊𝐢𝐜𝐤𝐞𝐝 𝐁𝐲 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (error) {
        await sock.sendMessage(from, {
            text: '❌ Kick Error: ' + error.message
        }, { quoted: msg });
    }
};