async function privateCommand(sock, from, msg, isAdmin, session) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ." }, { quoted: msg });
    
    session.isPublic = false;
    await sock.sendMessage(from, { text: "🔐 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ ᴘʀɪᴠᴀᴛᴇ ᴍᴏᴅᴇ. ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ɪᴛ." }, { quoted: msg });
}

module.exports = privateCommand;
