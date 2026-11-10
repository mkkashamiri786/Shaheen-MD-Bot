/**
 * AntiBots Command - Group mein sirf apne bot ko kaam karne dena
 */

const fs = require('fs');
const path = require('path');

// Aapki data folder ke andar save hoga
const configPath = path.join(__dirname, '..', 'data', 'antibots.json');

// ============================================
// INIT CONFIG
// ============================================
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabledGroups: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const FOOTER = '╰➣©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧';

// ============================================
// ANTIBOTS COMMAND
// ============================================
async function antibotsCommand(sock, from, msg, isAdmin, botData, saveBotData, args) {
    // Admin Check
    if (!isAdmin) {
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ❌ *ACCESS DENIED*
│  
│  Sirf group admin hi yeh command use kar sakta hai.
│ 
├━─────────────────━╯
${FOOTER}`
        }, { quoted: msg });
    }

    const action = args && args[0] ? args[0].toLowerCase() : '';
    
    // Agar group nahi hai, toh on/off kaam nahi karega
    if (!from.endsWith('@g.us') && ['on', 'off'].includes(action)) {
        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ⚠️ *GROUP MEIN USE KAREIN*
│  
│  Yeh command sirf groups ke liye hai.
│ 
├━─────────────────━╯
${FOOTER}`
        }, { quoted: msg });
    }

    const config = initConfig();

    // ===== ON =====
    if (action === 'on') {
        if (!config.enabledGroups.includes(from)) {
            config.enabledGroups.push(from);
            saveConfig(config);
        }
        // Sync with main botData
        if (!botData.antibots) botData.antibots = {};
        botData.antibots[from] = true;
        saveBotData();

        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ✅ *ANTI-BOTS: ON*
│  
│  🛡️ Ab is group mein sirf *yeh bot* kaam karega.
│  🤖 Doosre bots ki commands block ho jayengi.
│ 
├━─────────────────━╯
${FOOTER}`
        }, { quoted: msg });
    }

    // ===== OFF =====
    if (action === 'off') {
        const index = config.enabledGroups.indexOf(from);
        if (index > -1) {
            config.enabledGroups.splice(index, 1);
            saveConfig(config);
        }
        // Sync with main botData
        if (botData.antibots && botData.antibots[from]) {
            delete botData.antibots[from];
            saveBotData();
        }

        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  ❌ *ANTI-BOTS: OFF*
│  
│  Ab is group mein doosre bots bhi kaam kar sakte hain.
│ 
├━─────────────────━╯
${FOOTER}`
        }, { quoted: msg });
    }

    // ===== LIST =====
    if (action === 'list') {
        if (!config.enabledGroups.length) {
            return await sock.sendMessage(from, {
                text: `╭━─────────────────━╮
│
│  📭 *LIST KHALI HAI*
│  
│  Kisi bhi group mein jake likhein:
│  .antibots on
│ 
├━─────────────────━╯
${FOOTER}`
            }, { quoted: msg });
        }

        let listText = '';
        for (let i = 0; i < config.enabledGroups.length; i++) {
            let name = config.enabledGroups[i].split('@')[0];
            try {
                const meta = await sock.groupMetadata(config.enabledGroups[i]);
                if (meta && meta.subject) name = meta.subject;
            } catch (e) {}
            listText += `│  ${i + 1}. ${name}\n`;
        }

        return await sock.sendMessage(from, {
            text: `╭━─────────────────━╮
│
│  🛡️ *ACTIVE ANTI-BOTS GROUPS (${config.enabledGroups.length})*
│  
${listText}│  
├━─────────────────━╯
${FOOTER}`
            }, { quoted: msg });
    }

    // ===== STATUS / USAGE =====
    const isEnabled = config.enabledGroups.includes(from);
    const status = isEnabled ? '✅ ON' : '❌ OFF';
    const usageText = `╭━─────────────────━╮
│
│  🛡️ *ANTI-BOTS SETTINGS*
│  
│  📌 *Current Group Status:* ${status}
│  
│  💡 *Usage:*
│  • .antibots on
│  • .antibots off
│  • .antibots list
│ 
├━─────────────────━╯
${FOOTER}`;
    await sock.sendMessage(from, { text: usageText }, { quoted: msg });
}

// ============================================
// EXPORTS
// ============================================
module.exports = antibotsCommand;
module.exports.antibotsCommand = antibotsCommand;