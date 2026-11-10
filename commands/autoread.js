/**
 * Autoread Command - Automatically read all messages
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

// ============================================
// INIT CONFIG
// ============================================
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// ============================================
// AUTOREAD COMMAND
// ============================================
async function autoreadCommand(sock, from, msg, isOwner, session, args) {
    if (!isOwner) {
        const notOwner = `╭━─────────────────━╮
│
│  ❌ *ACCESS DENIED*
│  
│  Sirf bot owner hi yeh command use kar sakta hai.
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        return await sock.sendMessage(from, { text: notOwner }, { quoted: msg });
    }

    const action = args && args[0] ? args[0].toLowerCase() : '';
    const config = initConfig();

    if (action === 'on') {
        config.enabled = true;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        const onText = `╭━─────────────────━╮
│
│  ✅ *AUTO-READ: ON*
│  
│  👀 Bot ab har message ko
│  automatically read kar lega (blue tick).
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        return await sock.sendMessage(from, { text: onText }, { quoted: msg });
    }

    if (action === 'off') {
        config.enabled = false;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        const offText = `╭━─────────────────━╮
│
│  ❌ *AUTO-READ: OFF*
│  
│  👀 Bot ab messages read nahi karega.
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        return await sock.sendMessage(from, { text: offText }, { quoted: msg });
    }

    // No argument — show current status
    const status = config.enabled ? '✅ ON' : '❌ OFF';

    const usageText = `╭━─────────────────━╮
│
│  👀 *AUTO-READ SETTINGS*
│  
│  📌 *Current:* ${status}
│  
│  💡 *Usage:*
│  • .autoread on
│  • .autoread off
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

    await sock.sendMessage(from, { text: usageText }, { quoted: msg });
}

// ============================================
// CHECK IF AUTOREAD ENABLED
// ============================================
function isAutoreadEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autoread status:', error);
        return false;
    }
}

// ============================================
// HANDLE AUTOREAD (Background)
// ============================================
async function handleAutoread(sock, message) {
    try {
        if (!isAutoreadEnabled()) return false;

        // Sirf incoming messages read karo (apne nahi)
        if (message.key.fromMe) return false;

        // Message read karo
        const key = {
            remoteJid: message.key.remoteJid,
            id: message.key.id,
            participant: message.key.participant
        };

        await sock.readMessages([key]);
        return true;

    } catch (error) {
        console.error('Autoread error:', error.message);
        return false;
    }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    autoreadCommand,
    handleAutoread,
    isAutoreadEnabled
};