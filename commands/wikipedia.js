const axios = require('axios');

async function wikiCommand(sock, from, msg, q) {
    try {
        const loadEmojis = ['📚', '🔍', '✨'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈 𝐖𝐈𝐊𝐈𝐏𝐄𝐃𝐈𝐀
┆𝐔𝐒𝐀𝐆𝐄: .wiki <search>
┆𝐄𝐗𝐀𝐌𝐏𝐋𝐄: .wiki Pakistan
╰━━━━━━━━━━━━━━━━⊷
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        const searchRes = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`,
            { timeout: 30000 }
        );

        const data = searchRes.data;

        if (!data || !data.extract) throw new Error('Not found');

        await sock.sendMessage(from, {
            text: `
╭━━━━━━━━━━━━━━━━⊷
├━𓊈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟
┆📚 𝐖𝐈𝐊𝐈𝐏𝐄𝐃𝐈𝐀
╰━━━━━━━━━━━━━━━━⊷
📖 *${data.title}*
━━━━━━━━━━━━━━━━━━━━━━
${data.extract}
━━━━━━━━━━━━━━━━━━━━━━
🔗 ${data.content_urls?.desktop?.page || ''}
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Article not found.' }, { quoted: msg });
    }
}
module.exports = wikiCommand;