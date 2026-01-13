addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // Pastikan request method POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 })
    }

    const reqData = await request.json()
    let { url } = reqData

    if (!url) {
      return new Response(JSON.stringify({ error: "URL tidak diberikan" }), { status: 400 })
    }

    // --- Ambil Video ID dari short link atau URL panjang ---
    const videoID = getVideoID(url)
    if (!videoID) {
      return new Response(JSON.stringify({ error: "URL tidak valid" }), { status: 400 })
    }

    // --- Panggil backend asli dengan videoID ---
    const backendURL = `https://util.y5s.co/v1/ytb/transcripts?v=${videoID}&lang=en`
    const backendResponse = await fetch(backendURL)
    const backendData = await backendResponse.json()

    // --- Kirim balik response ke front-end ---
    return new Response(JSON.stringify(backendData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

// Fungsi ambil Video ID
function getVideoID(url) {
  // Short link youtu.be
  let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  // URL panjang www.youtube.com
  match = url.match(/v=([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  return null
}
