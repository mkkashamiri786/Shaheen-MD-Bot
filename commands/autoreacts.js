/**
 * AutoReacts Command - Automatically react on messages
 * Modes:
 *   .autoreacts on  -> Sab messages par react
 *   .autoreacts me  -> Sirf aapke (owner) posts par react
 *   .autoreacts off -> Band
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'autoreacts.json');

// ============================================
// INIT CONFIG
// ============================================
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false, mode: 'all' }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// ============================================
// EMOJIS LIST
// ============================================
const REACT_EMOJIS = ['❤️', '👍', '🔥', '👏', '😮', '😂', '🙌', '✨', '⭐', '✅', '🤖', '⚡', '🌟', '💯', '🌈', '💎', '👑', '🎉', '🧿', '🍀'];

// ============================================
// AUTOREACTS COMMAND  (.autoreacts on / me / off)
// ============================================
async function autoreactsCommand(sock, from, msg, isAdmin, session, args) {
    // ===== OWNER CHECK =====
    const sender = msg.key.participant || msg.key.remoteJid;
    const botNumber = ((sock.user && sock.user.id) || '').split(':')[0] + '@s.whatsapp.net';
    const isOwner = msg.key.fromMe || sender.split('@')[0] === botNumber.split('@')[0];

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

    // ===== ON (ALL) =====
    if (action === 'on' || action === 'all') {
        config.enabled = true;
        config.mode = 'all';
        saveConfig(config);

        const onText = `╭━─────────────────━╮
│
│  ✅ *AUTO-REACTS: ON*
│  
│  🎭 Bot ab *sab messages* par
│  automatically react karega.
│  
│  👤 Sirf apne posts ke liye: .autoreacts me
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        return await sock.sendMessage(from, { text: onText }, { quoted: msg });
    }

    // ===== ME MODE (sirf owner ke posts par) =====
    if (action === 'me') {
        config.enabled = true;
        config.mode = 'me';
        saveConfig(config);

        const meText = `╭━─────────────────━╮
│
│  👤 *AUTO-REACTS: ME MODE*
│  
│  🎭 Bot ab *sirf aapke posts* par
│  automatically react karega.
│  
│  👥 Sab par react ke liye: .autoreacts on
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        return await sock.sendMessage(from, { text: meText }, { quoted: msg });
    }

    // ===== OFF =====
    if (action === 'off') {
        config.enabled = false;
        saveConfig(config);

        const offText = `╭━─────────────────━╮
│
│  ❌ *AUTO-REACTS: OFF*
│  
│  🎭 Auto react band ho gaya.
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        return await sock.sendMessage(from, { text: offText }, { quoted: msg });
    }

    // ===== STATUS / USAGE =====
    const status = config.enabled ? '✅ ON' : '❌ OFF';
    const modeText = config.mode === 'me' ? '👤 Sirf Aapke Posts' : '👥 Sab Messages';

    const usageText = `╭━─────────────────━╮
│
│  🎭 *AUTO-REACTS SETTINGS*
│  
│  📌 *Status:* ${status}
│  🎯 *Mode:* ${modeText}
│  
│  💡 *Usage:*
│  • .autoreacts on — Sab par react
│  • .autoreacts me — Sirf aapke posts par
│  • .autoreacts off — Band kare
│ 
├━─────────────────━╯
╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

    await sock.sendMessage(from, { text: usageText }, { quoted: msg });
}

// ============================================
// HANDLE AUTOREACT (Background — index.js se call hota hai)
// ============================================
async function handleAutoreact(sock, message) {
    try {
        const config = initConfig();
        if (!config.enabled) return false;

        // Commands (.) par react nahi karna
        const msgContent = message.message?.conversation
            || message.message?.extendedTextMessage?.text
            || message.message?.imageMessage?.caption
            || '';
        if (msgContent.trim().startsWith('.')) return false;

        const isMe = message.key.fromMe;

        // Mode 'me' = sirf owner ke posts par react
        if (config.mode === 'me' && !isMe) return false;

        const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

        await sock.sendMessage(message.key.remoteJid, {
            react: { text: randomEmoji, key: message.key }
        });
        return true;

    } catch (error) {
        console.error('Autoreact error:', error.message);
        return false;
    }
}

// ============================================
// EXPORTS
// ============================================
module.exports = autoreactsCommand;
module.exports.autoreactsCommand = autoreactsCommand;
module.exports.handleAutoreact = handleAutoreact;
