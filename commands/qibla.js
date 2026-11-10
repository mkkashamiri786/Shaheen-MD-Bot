const axios = require('axios');

// Kaaba coordinates
const KAABA_LAT = 21.422511;
const KAABA_LNG = 39.826150;

// Qibla direction calculate karo (Haversine bearing formula)
function calculateQibla(lat, lng) {
    const lat1 = lat * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const dLng = (KAABA_LNG - lng) * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return bearing;
}

// Compass direction nikaalo
function compassDirection(bearing) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return dirs[index];
}

// Distance calculate karo (Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function qiblaCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🧭', '🕋', '📍'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // Agar coordinates nahi diye
        if (!q) {
            return await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆🧭 𝐐𝐈𝐁𝐋𝐀 𝐃𝐈𝐑𝐄𝐂𝐓𝐈𝐎𝐍
╰━━━━━━━━━━━━━━━━⊷

📌 *𝐔𝐒𝐀𝐆𝐄:*
┆♛ .qibla <lat,lng>
┆♛ .qibla 24.8607,67.0011

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .qibla 24.8607,67.0011 (Karachi)
┆♛ .qibla 31.5204,74.3587 (Lahore)

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
            }, { quoted: msg });
        }

        // Coordinates parse karo
        const parts = q.trim().split(',');
        if (parts.length !== 2) {
            throw new Error('Invalid coordinates');
        }

        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());

        if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Invalid numbers');
        }

        // Qibla direction calculate karo
        const qiblaAngle = calculateQibla(lat, lng);
        const direction = compassDirection(qiblaAngle);
        const distance = calculateDistance(lat, lng, KAABA_LAT, KAABA_LNG);

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆🧭 𝐐𝐈𝐁𝐋𝐀 𝐃𝐈𝐑𝐄𝐂𝐓𝐈𝐎𝐍
╰━━━━━━━━━━━━━━━━⊷

📍 *𝐘𝐎𝐔𝐑 𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍:*
┆Latitude: ${lat}
┆Longitude: ${lng}

━━━━━━━━━━━━━━━━━━━━━━
🕋 *𝐐𝐈𝐁𝐋𝐀:*
┆Angle: ${qiblaAngle.toFixed(2)}°
┆Direction: ${direction}

📏 *𝐃𝐈𝐒𝐓𝐀𝐍𝐂𝐄 𝐓𝐎 𝐊𝐀𝐀𝐁𝐀:*
┆${distance.toFixed(2)} km

━━━━━━━━━━━━━━━━━━━━━━
💡 *𝐍𝐎𝐓𝐄:*
┆Compass se ${direction} direction
┆mein Kaaba hai.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('Qibla Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Invalid coordinates.
┆Format: lat,lng

💡 *𝐄𝐗𝐀𝐌𝐏𝐋𝐄:*
┆♛ .qibla 24.8607,67.0011

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = qiblaCommand;