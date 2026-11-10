const axios = require('axios');

async function apiCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🔌', '⚡', '📊'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔌 𝐀𝐏𝐈 𝐓𝐄𝐒𝐓𝐄𝐑
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .api <API URL>

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .api https://api.github.com/users/octocat
┆♛ .api https://api.alquran.cloud/v1/ayah/2:255

📊 *𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒:*
┆• Response Time
┆• Status Code
┆• Data Preview
┆• Size

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        let url = q.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // ✅ Response time measure karo
        const startTime = Date.now();
        
        const res = await axios.get(url, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (AmanBot/1.0)'
            }
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // ✅ Response size calculate karo
        const responseStr = JSON.stringify(res.data);
        const sizeBytes = Buffer.byteLength(responseStr, 'utf8');
        const sizeKB = (sizeBytes / 1024).toFixed(2);

        // ✅ Data preview (first 1000 chars)
        let dataPreview = responseStr;
        if (dataPreview.length > 1000) {
            dataPreview = dataPreview.substring(0, 1000) + '...';
        }

        // Pretty print karo (agar JSON hai to)
        try {
            const jsonStr = JSON.stringify(res.data, null, 2);
            dataPreview = jsonStr.substring(0, 1500);
            if (jsonStr.length > 1500) dataPreview += '\n...';
        } catch (e) {}

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆🔌 𝐀𝐏𝐈 𝐓𝐄𝐒𝐓𝐄𝐑
╰━━━━━━━━━━━━━━━━⊷

🌐 *𝐔𝐑𝐋:*
┆${url.substring(0, 80)}${url.length > 80 ? '...' : ''}

━━━━━━━━━━━━━━━━━━━━━━
📊 *𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄:*

┆✅ *Status:* ${res.status} ${res.statusText || ''}
┆⚡ *Time:* ${responseTime}ms
┆📦 *Size:* ${sizeKB} KB
┆🔒 *Type:* ${res.headers['content-type'] || 'unknown'}

━━━━━━━━━━━━━━━━━━━━━━
📝 *𝐃𝐀𝐓𝐀 𝐏𝐑𝐄𝐕𝐈𝐄𝐖:*
\`\`\`
${dataPreview}
\`\`\`

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('API Error:', e.message);
        
        let errorMsg = '❌ API request failed';
        if (e.response) {
            errorMsg = `❌ API returned ${e.response.status}: ${e.response.statusText}`;
        } else if (e.code === 'ECONNABORTED') {
            errorMsg = '❌ Request timeout (30s)';
        } else if (e.code === 'ENOTFOUND') {
            errorMsg = '❌ Invalid URL / DNS failed';
        }

        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡 𝗧𝗢𝗢𝗟𝗦𖤝︎𓆪
┆❌ 𝐀𝐏𝐈 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ ${errorMsg}

💡 *𝐓𝐑𝐘:*
┆• Valid URL dein
┆• Public API use karein

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = apiCommand;