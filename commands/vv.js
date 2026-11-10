const {
    downloadContentFromMessage,
    jidNormalizedUser
} = require('@whiskeysockets/baileys');

async function vvCommand(sock, from, msg, q) {
    try {
        // Loading reaction
        await sock.sendMessage(from, {
            react: {
                text: '⏳',
                key: msg.key
            }
        });

        // Quoted message
        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(from, {
                text: '⚠️ Kisi normal image, video ya audio par reply karke .vv likhein.'
            }, { quoted: msg });
        }

        // Normal media only
        let mediaType = null;
        let mediaMessage = null;

        for (const type of ['imageMessage', 'videoMessage', 'audioMessage']) {
            if (quoted[type]) {
                mediaType = type.replace('Message', '');
                mediaMessage = quoted[type];
                break;
            }
        }

        if (!mediaType || mediaMessage?.viewOnce) {
            return sock.sendMessage(from, {
                text: '❌ Supported normal media nahi mili.'
            }, { quoted: msg });
        }

        // Download media
        const stream = await downloadContentFromMessage(
            mediaMessage,
            mediaType
        );

        const chunks = [];

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        if (!buffer.length) {
            throw new Error('Empty media buffer');
        }

        // Owner DM
        const ownerDM = jidNormalizedUser(sock.user.id);

        let mediaPayload;

        if (mediaType === 'image') {
            mediaPayload = { image: buffer };
        } else if (mediaType === 'video') {
            mediaPayload = { video: buffer };
        } else {
            mediaPayload = {
                audio: buffer,
                mimetype: mediaMessage.mimetype || 'audio/mpeg'
            };
        }

        await sock.sendMessage(ownerDM, mediaPayload);

        // Success reaction
        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: msg.key
            }
        });

    } catch (error) {
        console.error('VV Command Error:', error);

        await sock.sendMessage(from, {
            text: '❌ VV Command Error: ' + error.message
        }, { quoted: msg });
    }
}

module.exports = vvCommand;