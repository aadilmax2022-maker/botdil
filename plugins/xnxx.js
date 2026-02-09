const { Module } = require('../main');
const axios = require('axios');
const fileType = require('file-type');

const USE_AD_THUMB = (process.env.AD_PREVIEW || "true").toLowerCase() !== "false";

Module({
    pattern: 'xsearch ?(.*)',
    isPrivate: true,
    desc: 'Search xnxx videos by query',
    type: 'search'
}, async (message, match) => {
    const query = match[1]?.trim();
    if (!query) {
        return await message.sendReply(
            'Provide a search query!\nExample:\nxsearch Big Boobs'
        );
    }

    await message.sendReply('🔎 Searching videos...');

    try {
        const api = `https://api-aswin-sparky.koyeb.app/api/search/xnxx?search=${encodeURIComponent(query)}`;
        const { data } = await axios.get(api);

        if (!data?.status || !data.result?.status || !Array.isArray(data.result.result)) {
            let msg = '❌ Failed to fetch search results. Try again later!';
            if (data?.message) msg += `\n_API message: ${data.message}_`;
            return await message.sendReply(msg);
        }

        const results = data.result.result;
        if (results.length === 0) {
            return await message.sendReply('No videos found for your query!');
        }

        let reply = `*Search Results for:* ${query}\n\n`;
        results.slice(0, 10).forEach((v, i) => {
            reply += `*${i + 1}. ${v.title}*\n${v.info.replace(/\n/g, ' ').trim()}\n[Link](${v.link})\n\n`;
        });
        reply += 'Reply with the number to download, e.g. xvideo <link>';

        await message.sendReply(reply);
    } catch (err) {
        console.error('XNXX Search Plugin Error:', err);
        return await message.sendReply('⚠ Failed to search. Try again later!');
    }
});

Module({
    pattern: 'xvideo ?(.*)',
    isPrivate: true,
    desc: 'Download xnxx video by URL with ad preview',
    type: 'downloader'
}, async (message, match) => {
    const url = match[1]?.trim();
    if (!url) {
        return await message.sendReply(
            'Provide a valid xnxx/xvideos URL!\nExample:\nxvideo https://www.xvideos.com/videoXXXXX/title'
        );
    }

    await message.sendReply('⏳ Fetching video details...');

    try {
        const api = `https://api-aswin-sparky.koyeb.app/api/downloader/xnxx?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);

        if (!data?.status || !data.data?.files) {
            let msg = '❌ Failed to fetch video. Try another link!';
            if (data?.message) msg += `\n_API message: ${data.message}_`;
            return await message.sendReply(msg);
        }

        const videoData = data.data;
        const videoUrl = videoData.files.high || videoData.files.low;
        if (!videoUrl) return await message.sendReply('❌ No downloadable video found!');

        const title = videoData.title || 'xnxx_video';
        const duration = videoData.duration || 'Unknown';
        const caption = `*${title}*\n\n_Duration:_ ${duration} sec`;

        const customThumbUrl = "https://i.ibb.co/G4Yk3Qfy/temp.jpg";  // Custom branding
        const videoThumbUrl = videoData.image;

        async function getValidThumbnail(url) {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');
                const type = await fileType.fromBuffer(buffer);
                if (!type || !type.mime.startsWith('image/')) return null;
                return buffer;
            } catch {
                return null;
            }
        }

        const customThumb = USE_AD_THUMB ? await getValidThumbnail(customThumbUrl) : undefined;
        const videoThumb = await getValidThumbnail(videoThumbUrl);

        let fileSize = 0;
        try {
            const head = await axios.head(videoUrl);
            fileSize = parseInt(head.headers['content-length'] || "0");
        } catch { }

        const maxSize = 64 * 1024 * 1024;
        if (fileSize && fileSize > maxSize) {
            return await message.sendReply(
                `⚠ _*File too large for WhatsApp.*_\n*Download manually:*\n${videoUrl}`
            );
        }

        await message.client.sendMessage(
            message.jid,
            {
                document: { url: videoUrl },
                mimetype: 'video/mp4',
                fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 32)}.mp4`,
                caption: caption,
                jpegThumbnail: videoThumb || undefined,
                contextInfo: {
                    externalAdReply: {
                        title: 'xᴠɪᴅᴇᴏ',
                        body: 'ᴄʀᴇᴀᴛᴇ ʙʏ xᴇᴏɴ',
                        mediaUrl: videoUrl,
                        sourceUrl: videoUrl,
                        thumbnail: customThumb || undefined,
                        mediaType: 2,
                        renderLargerThumbnail: false
                    }
                }
            },
            { quoted: message.data }
        );

    } catch (err) {
        console.error('XNXX Plugin Error:', err);
        return await message.sendReply('⚠ Failed to download or send the video. Try again later!');
    }
});
