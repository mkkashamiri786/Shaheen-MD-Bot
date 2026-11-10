const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ═══════════════════════════════════════════════════════════
// 📤 MULTI-API IMAGE UPLOADER
// Har API alag service use karti hai — ek fail ho to dusri
// ═══════════════════════════════════════════════════════════

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, {
        filename: `img_${Date.now()}.jpg`
    });
    
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    
    return { url: res.data.trim(), host: 'Catbox' };
}

async function uploadTo0x0(buffer) {
    const form = new FormData();
    form.append('file', buffer, {
        filename: `img_${Date.now()}.jpg`
    });
    
    const res = await axios.post('https://0x0.st', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    
    return { url: res.data.trim(), host: '0x0.st' };
}

async function uploadToUguu(buffer) {
    const form = new FormData();
    form.append('files[]', buffer, {
        filename: `img_${Date.now()}.jpg`
    });
    
    const res = await axios.post('https://uguu.se/upload.php', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    
    if (res.data && res.data.files && res.data.files[0]) {
        return { url: res.data.files[0].url, host: 'Uguu' };
    }
    throw new Error('Uguu upload failed');
}

async function uploadToTmpfiles(buffer) {
    const form = new FormData();
    form.append('file', buffer, {
        filename: `img_${Date.now()}.jpg`
    });
    
    const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    
    if (res.data && res.data.data && res.data.data.url) {
        // Direct link format
        const directUrl = res.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        return { url: directUrl, host: 'TmpFiles' };
    }
    throw new Error('TmpFiles upload failed');
}

async function uploadToFileio(buffer) {
    const form = new FormData();
    form.append('file', buffer, {
        filename: `img_${Date.now()}.jpg`
    });
    
    const res = await axios.post('https://file.io', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    
    if (res.data && res.data.link) {
        return { url: res.data.link, host: 'File.io' };
    }
    throw new Error('File.io upload failed');
}

async function uploadToTelegraph(buffer) {
    const form = new FormData();
    form.append('file', buffer, {
        filename: `img_${Date.now()}.jpg`
    });
    
    const res = await axios.post('https://telegra.ph/upload', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    
    if (res.data && res.data[0] && res.data[0].src) {
        return { url: 'https://telegra.ph' + res.data[0].src, host: 'Telegraph' };
    }
    throw new Error('Telegraph upload failed');
}

async function uploadToImgBB(buffer, apiKey) {
    const form = new FormData();
    form.append('image', buffer.toString('base64'));
    
    const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        form,
        {
            headers: form.getHeaders(),
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }
    );
    
    if (res.data && res.data.data && res.data.data.url) {
        return { url: res.data.data.url, host: 'ImgBB' };
    }
    throw new Error('ImgBB upload failed');
}

// ═══════════════════════════════════════════════════════════
// 🔄 MULTI-API FALLBACK SYSTEM
// ═══════════════════════════════════════════════════════════

async function uploadImageMultiAPI(buffer) {
    const APIs = [
        { name: 'Catbox', fn: () => uploadToCatbox(buffer) },
        { name: 'Telegraph', fn: () => uploadToTelegraph(buffer) },
        { name: 'Uguu', fn: () => uploadToUguu(buffer) },
        { name: '0x0.st', fn: () => uploadTo0x0(buffer) },
        { name: 'TmpFiles', fn: () => uploadToTmpfiles(buffer) },
        // File.io commented — 1 baar download ke baad delete ho jata hai
        // { name: 'File.io', fn: () => uploadToFileio(buffer) },
    ];

    let lastError = null;

    for (const api of APIs) {
        try {
            console.log(`📤 Trying ${api.name}...`);
            const result = await api.fn();
            
            if (result && result.url && result.url.startsWith('http')) {
                console.log(`✅ ${api.name} success: ${result.url}`);
                return result;
            }
        } catch (err) {
            console.log(`❌ ${api.name} failed: ${err.message}`);
            lastError = err;
        }
    }

    throw new Error(`All APIs failed. Last error: ${lastError?.message || 'Unknown'}`);
}

// ═══════════════════════════════════════════════════════════
// 🎯 MAIN COMMAND
// ═══════════════════════════════════════════════════════════

async function imgtourlCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🖼️', '⏳', '🔗'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // Image check (reply ya direct)
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = msg.message?.imageMessage || quoted?.imageMessage;

        if (!imageMessage) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆🖼️ 𝐈𝐌𝐆 𝐓𝐎 𝐔𝐑𝐋
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ Image ko reply karke
┆♛ .imgtourl bhejein

┆♛ Ya image ke saath
┆♛ .imgtourl likhein

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ Reply to image → .imgtourl

🎯 *𝐎𝐔𝐓𝐏𝐔𝐓:*
┆• Direct image link
┆• Shareable URL
┆• Multiple API fallback

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        // Image download
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Multi-API Upload
        const result = await uploadImageMultiAPI(buffer);

        // ═══════════════════════════════════
        // ✅ Success Message
        // ═══════════════════════════════════
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆🖼️ 𝐈𝐌𝐆 𝐓𝐎 𝐔𝐑𝐋
╰━━━━━━━━━━━━━━━━⊷

✅ *𝐔𝐏𝐋𝐎𝐀𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋*

╭━━━━━━━━━━━━━━━━⊷
┆🔗 *𝐃𝐈𝐑𝐄𝐂𝐓 𝐋𝐈𝐍𝐊:*
╰━━━━━━━━━━━━━━━━⊷

${result.url}

╭━━━━━━━━━━━━━━━━⊷
┆📊 *𝐃𝐄𝐓𝐀𝐈𝐋𝐒:*
┆• Size: ${(buffer.length / 1024).toFixed(2)} KB
┆• Type: Image
┆• Host: ${result.host}
┆• Status: ✅ Live
╰━━━━━━━━━━━━━━━━⊷

💡 *𝐍𝐎𝐓𝐄:*
┆Link copy karke kisi bhi
┆jagah use kar sakte hain!

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });

    } catch (e) {
        console.log('IMGTBOURL Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐔𝐏𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃
╰━━━━━━━━━━━━━━━━⊷

⚠️ Saari APIs fail ho gayi.

💡 *𝐓𝐑𝐘:*
┆• Dobara try karein
┆• Chhoti image bhejein
┆• Different format use karein

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = imgtourlCommand;