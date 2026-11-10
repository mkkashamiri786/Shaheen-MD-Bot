module.exports = async (sock, from, msg) => {
    try {
        const contextInfo =
            msg.message?.extendedTextMessage?.contextInfo;

        if (!contextInfo?.stanzaId) {
            return await sock.sendMessage(from, {
                text: '❌ Kisi message, image, video ya URL par reply karke .delete likhein.'
            }, { quoted: msg });
        }

        const participant = contextInfo.participant;

        const quotedKey = {
            remoteJid: from,
            id: contextInfo.stanzaId,
            fromMe: participant
                ? participant.split('@')[0] ===
                  sock.user.id.split(':')[0].split('@')[0]
                : false,
            ...(participant ? { participant } : {})
        };

        await sock.sendMessage(from, {
            delete: quotedKey
        });

    } catch (error) {
        await sock.sendMessage(from, {
            text: '❌ Delete Error: ' + error.message
        }, { quoted: msg });
    }
};
