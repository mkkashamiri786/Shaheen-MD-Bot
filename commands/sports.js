module.exports = async (sock, from, msg) => {
    try {
        await sock.sendMessage(from, {
            react: {
                text: '🏏',
                key: msg.key
            }
        });

        await sock.sendMessage(from, {
            image: {
                url: 'https://i.postimg.cc/VLqnPCkT/2719095-splash.png'
            },
            caption: `
╭━━━〔 🏏 SHAHEEN SPORTS TV 〕━━━┈⊷
┃
┃ 👋 WELCOME TO SHAHEEN SPORTS TV
┃
┃ 🏏 Cricket Updates
┃ ⚽ Football Updates
┃ 🏆 Live Sports News
┃ 📺 Sports Entertainment
┃ 🔥 Latest Sports Content
┃
┃ 🌐 OUR OFFICIAL WEBSITE
┃
┃ https://shaheensportstv.blogspot.com
┃
╰━━━━━━━━━━━━━━━━━━━━━━┈⊷

> 𝐏ᴏᴡᴇʀᴇᴅ 𝐁ʏ 𝐒𝐇𝐀𝐇𝐄𝐄𝐍 𝐓𝐕 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑𝐒
            `
        }, { quoted: msg });

        await sock.sendMessage(from, {
            text: '🏏 *VISIT SHAHEEN SPORTS TV*\n\nhttps://shaheensportstv.blogspot.com'
        }, { quoted: msg });

    } catch (error) {
        await sock.sendMessage(from, {
            text: '❌ Sports Error: ' + error.message
        }, { quoted: msg });
    }
};
