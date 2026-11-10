async function publicCommand(sock, from, msg, isAdmin, session) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ." }, { quoted: msg });
    
    session.isPublic = true;
    await sock.sendMessage(from, { text: "🌍 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ ᴘᴜʙʟɪᴄ ᴍᴏᴅᴇ. ᴇᴠᴇʀʏᴏɴᴇ ᴄᴀɴ ᴜsᴇ ɪᴛ." }, { quoted: msg });
}

module.exports = publicCommand;
