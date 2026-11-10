/**
 * AutoForward Command - Channel posts ko groups mein auto forward
 *
 * Commands:
 *   .autoforward on        — Forwarding ON
 *   .autoforward off       — Forwarding OFF
 *   .autoforward add       — Current group list mein add (group mein use karein)
 *   .autoforward del <#>   — List ka number delete kare (1 se start)
 *   .autoforward list      — Saari groups ki list dekhein
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'autoforward.json');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================
// INIT CONFIG
// ============================================
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false, groups: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const FOOTER = '╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧';

// ============================================
// AUTOFORWARD COMMAND
// ============================================
async function autoforwardCommand(sock, from, msg, isAdmin, session, args) {
    // ===== OWNER CHECK =====
    const sender = msg.key.participant || msg.key.remoteJid;
    const botNumber = ((sock.user && sock.user.id) || '').split(':')[0] + '@s.whatsapp.net';
    const isOwner = msg.key.fromMe || sender.split('@')[0] === botNumber.split('@')[0];

    if (!isOwner) {
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ❌ *ACCESS DENIED*
│  
│  Sirf bot owner hi yeh command use kar sakta hai.
│ 
├━─────────────────━╯
${FOOTER}`
        }, { quoted: msg });
    }

    const action = args && args[0] ? args[0].toLowerCase() : '';
    const config = initConfig();

    // ===== ON =====
    if (action === 'on') {
        config.enabled = true;
        saveConfig(config);
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ✅ *AUTOFORWARD: ON*
│  
│  📢 Ab aapki *channel posts*
│  ${config.groups.length} groups mein auto forward hongi.
│  
│  ➕ Group add: .autoforward add
│  (group mein jaake likhein)
│ 
├━─────────────────━╯
${FOOTER}`
        }, { quoted: msg });
    }

    // ===== OFF =====
    if (action === 'off') {
        config.enabled = false;
        saveConfig(config);
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ❌ *AUTOFORWARD: OFF*
│  
│  📢 Auto forward band ho gaya.
│  Groups ki list save rehti hai.
│ 
├━─────────────────━╯
${FOOTER}`
        }, { quoted: msg });
    }

    // ===== ADD (current group) =====
    if (action === 'add') {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, {
                text: `╭━─────────────────━╮
│
│  ⚠️ *GROUP MEIN USE KAREIN*
│  
│  Pehle us group mein jayein
│  jahan forward karna hai,
│  phir likhein: .autoforward add
│ 
├━─────────────────━╯
${FOOTER}`
                }, { quoted: msg });
        }
        if (config.groups.includes(from)) {
            return await sock.sendMessage(from, {
                text: `╭━─────────────────━╮
│
│  ⚠️ *PEHLE SE ADDED*
│  
│  Yeh group list mein maujood hai.
│ 
├━─────────────────━╯
${FOOTER}`
                }, { quoted: msg });
        }
        config.groups.push(from);
        saveConfig(config);
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ✅ *GROUP ADDED!*
│  
│  📢 Yeh group list mein add ho gaya.
│  📊 Total groups: ${config.groups.length}
│  
│  👀 List dekhein: .autoforward list
│ 
├━─────────────────━╯
${FOOTER}`
            }, { quoted: msg });
    }

    // ===== DEL =====
    if (action === 'del' || action === 'remove' || action === 'delete') {
        const idx = parseInt(args[1]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= config.groups.length) {
            return await sock.sendMessage(from, {
                text: `╭━─────────────────━╮
│
│  ⚠️ *SAHI NUMBER DALEIN*
│  
│  Pehle list dekhein: .autoforward list
│  Phir likhein: .autoforward del 1
│ 
├━─────────────────━╯
${FOOTER}`
                }, { quoted: msg });
        }
        const removed = config.groups.splice(idx, 1);
        saveConfig(config);
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  🗑️ *GROUP REMOVED*
│  
│  ➖ ${removed[0].split('@')[0]}
│  📊 Baqi groups: ${config.groups.length}
│ 
├━─────────────────━╯
${FOOTER}`
            }, { quoted: msg });
    }

    // ===== LIST =====
    if (action === 'list') {
        if (!config.groups.length) {
            return await sock.sendMessage(from, {
                text: `╭━─────────────────━╮
│
│  📭 *LIST KHALI HAI*
│  
│  Group add karne ke liye
│  group mein jake likhein:
│  .autoforward add
│ 
├━─────────────────━╯
${FOOTER}`
                }, { quoted: msg });
        }
        // Group names nikaalne ki koshish
        let listText = '';
        for (let i = 0; i < config.groups.length; i++) {
            let name = config.groups[i].split('@')[0];
            try {
                const meta = await sock.groupMetadata(config.groups[i]);
                if (meta && meta.subject) name = meta.subject;
            } catch (e) {}
            listText += `│  ${i + 1}. ${name}\n`;
        }
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  📋 *FORWARD GROUPS (${config.groups.length})*
│  
${listText}│  
│  🗑️ Delete: .autoforward del <number>
│ 
├━─────────────────━╯
${FOOTER}`
            }, { quoted: msg });
    }

    // ===== STATUS / USAGE =====
    const status = config.enabled ? '✅ ON' : '❌ OFF';
    const usageText = `╭━─────────────────━╮
│
│  📢 *AUTOFORWARD SETTINGS*
│  
│  📌 *Status:* ${status}
│  📊 *Groups:* ${config.groups.length}
│  
│  💡 *Usage:*
│  • .autoforward on
│  • .autoforward off
│  • .autoforward add (group mein)
│  • .autoforward del 1
│  • .autoforward list
│ 
├━─────────────────━╯
${FOOTER}`;
    await sock.sendMessage(from, { text: usageText }, { quoted: msg });
}

// ============================================
// HANDLE AUTOFORWARD (Background — index.js se call hota hai)
// ============================================
async function handleAutoforward(sock, message, channelJid) {
    try {
        const config = initConfig();
        if (!config.enabled || !config.groups.length) return false;

        const from = message.key.remoteJid;

        // Sirf apne channel ki posts
        if (from !== channelJid) return false;

        // Sirf wohi session forward kare jisne post ki
        // (warna har connected session se duplicate forward honge)
        if (!message.key.fromMe) return false;

        // Sirf asli posts (text/photo/video) — reactions/updates skip
        const m = message.message || {};
        const isRealPost = m.imageMessage || m.videoMessage || m.conversation || m.extendedTextMessage;
        const isReactionOrUpdate = m.reactionMessage || m.protocolMessage;
        if (!isRealPost || isReactionOrUpdate) return false;

        console.log(`[autoforward] Channel post → ${config.groups.length} groups`);

        let okCount = 0;
        for (const groupJid of config.groups) {
            try {
                await sock.sendMessage(groupJid, { forward: message });
                okCount++;
            } catch (e) {
                console.log(`[autoforward] Fail: ${groupJid} - ${e.message}`);
            }
            // Rate limit se bachne ke liye 2-5 sec gap
            await sleep(2000 + Math.floor(Math.random() * 3000));
        }
        console.log(`[autoforward] Done: ${okCount}/${config.groups.length} groups`);
        return true;

    } catch (error) {
        console.error('Autoforward error:', error.message);
        return false;
    }
}

// ============================================
// EXPORTS
// ============================================
module.exports = autoforwardCommand;
module.exports.autoforwardCommand = autoforwardCommand;
module.exports.handleAutoforward = handleAutoforward;
