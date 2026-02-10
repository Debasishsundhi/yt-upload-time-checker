const API_KEY = "AIzaSyA8yQd4P5vuwJRRgMYrqhWUtQs-HxaqYqA";

/* ---------- Helpers ---------- */

function isVideoUrl(input) {
  return input.includes("youtu.be") || input.includes("watch?v=");
}

function extractVideoId(url) {
  if (url.includes("youtu.be")) {
    return url.split("/").pop().split("?")[0];
  }
  if (url.includes("watch?v=")) {
    return url.split("watch?v=")[1].split("&")[0];
  }
}

function extractChannelId(input) {
  if (input.includes("youtube.com/channel/")) {
    return input.split("/channel/")[1];
  }
  return input;
}

function formatIST(date) {
  // UTC → IST
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);

  return date.toLocaleString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

/* ---------- Main ---------- */

async function analyze() {
  const input = document.getElementById("channelId").value.trim();

  if (!input) {
    alert("Enter Channel or Video URL");
    return;
  }

  /* ===== VIDEO CHECK ===== */
  if (isVideoUrl(input)) {
    const videoId = extractVideoId(input);

    const url =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      document.getElementById("result").innerHTML =
        "Video not found. Check the link.";
      return;
    }

    const video = data.items[0];
    const published = new Date(video.snippet.publishedAt);

    document.getElementById("result").innerHTML = `
      <h3>Video Published Time</h3>
      <p><b>${video.snippet.title}</b></p>
      <p>${formatIST(published)}</p>
    `;
    return;
  }

  /* ===== CHANNEL CHECK ===== */
  const channelId = extractChannelId(input);

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=5&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    document.getElementById("result").innerHTML =
      "No videos found. Check Channel ID.";
    return;
  }

  let output = "<h3>Latest Channel Uploads</h3>";

  data.items.forEach(item => {
    const published = new Date(item.snippet.publishedAt);
    output += `
      <p>
        <b>${item.snippet.title}</b><br>
        Published: ${formatIST(published)}
      </p>
      <hr>
    `;
  });

  document.getElementById("result").innerHTML = output;
}

/* ---------- Buttons ---------- */

function clearData() {
  document.getElementById("channelId").value = "";
  document.getElementById("result").innerHTML = "";
}

function refreshPage() {
  location.reload();
}