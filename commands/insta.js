const axios = require('axios');

async function instaCommand(sock, from, msg, q) {
    if (!q) return await sock.sendMessage(from, { text: "❌ Please provide an Instagram URL." }, { quoted: msg });
    
    try {
        const loadEmojis = ['📥', '⏳', '📸'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }
        
        // Updated to the new API as requested
        const res = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(q)}`);
        
        if (res.data.status && res.data.data && res.data.data.length > 0) {
            for (let item of res.data.data) {
                if (item.type === 'video') {
                    await sock.sendMessage(from, { video: { url: item.url }, caption: "✅ Instagram Video" });
                } else {
                    await sock.sendMessage(from, { image: { url: item.url }, caption: "✅ Instagram Image" });
                }
            }
        } else {
            throw new Error("No media found");
        }
    } catch (e) {
        console.error('Instagram download error:', e);
        await sock.sendMessage(from, { text: "❌ Error downloading Instagram content. Make sure the link is public." }, { quoted: msg });
    }
}

module.exports = instaCommand;
