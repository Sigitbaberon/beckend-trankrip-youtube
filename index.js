export default {
  async fetch(request) {
    // --- Handle preflight OPTIONS ---
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 })
      }

      const reqData = await request.json()
      let { url } = reqData

      if (!url) {
        return new Response(JSON.stringify({ error: "URL tidak diberikan" }), { status: 400 })
      }

      // Ambil Video ID
      const videoID = getVideoID(url)
      if (!videoID) {
        return new Response(JSON.stringify({ error: "URL tidak valid" }), { status: 400 })
      }

      // Panggil backend asli
      const backendURL = `https://util.y5s.co/v1/ytb/transcripts?v=${videoID}&lang=en`
      const backendResponse = await fetch(backendURL)
      const backendData = await backendResponse.json()

      // Kirim balik ke front-end dengan header CORS
      return new Response(JSON.stringify(backendData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }
  }
}

// --- Helper ambil Video ID ---
function getVideoID(url) {
  let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  match = url.match(/v=([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  return null
        }
