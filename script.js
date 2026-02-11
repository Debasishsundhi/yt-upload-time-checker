const API_KEY = "AIzaSyA8yQd4P5vuwJRRgMYrqhWUtQs-HxaqYqA";

/* ---------- HELPERS ---------- */

// Video detect: URL, Shorts URL, ya direct 11-char ID
function isVideo(input) {
  return (
    input.includes("youtu.be") ||
    input.includes("watch?v=") ||
    input.includes("/shorts/") ||
    input.length === 11
  );
}

// Video ID extract
function extractVideoId(input) {
  if (input.length === 11) return input;

  if (input.includes("youtu.be")) {
    return input.split("/").pop().split("?")[0];
  }

  if (input.includes("watch?v=")) {
    return input.split("watch?v=")[1].split("&")[0];
  }

  if (input.includes("/shorts/")) {
    return input.split("/shorts/")[1].split("?")[0];
  }
}

// Channel ID extract
function extractChannelId(input) {
  if (input.includes("youtube.com/channel/")) {
    return input.split("/channel/")[1];
  }
  return input;
}

// UTC → IST format (Day + Date + Time + AM/PM + Seconds)
function formatIST(date) {
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

/* ---------- MAIN ---------- */

async function analyze() {
  const input = document.getElementById("channelId").value.trim();
  const resultDiv = document.getElementById("result");

  if (!input) {
    alert("Enter Channel or Video details");
    return;
  }

  resultDiv.innerHTML = "Loading...";

  /* ===== VIDEO ===== */
  if (isVideo(input)) {
    const videoId = extractVideoId(input);

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      resultDiv.innerHTML = "Video not found.";
      return;
    }

    const video = data.items[0];
    const published = new Date(video.snippet.publishedAt);

    resultDiv.innerHTML = `
      <div class="video-card">

        <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">
          <img 
            src="${video.snippet.thumbnails.high.url}" 
            alt="Video Thumbnail"
            class="thumbnail"
          >
        </a>

        <div class="video-title">
          ${video.snippet.title}
        </div>

        <div class="video-time">
          ${formatIST(published)}
        </div>

      </div>
    `;
    return;
  }

  /* ===== CHANNEL ===== */
  const channelId = extractChannelId(input);

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=5&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    resultDiv.innerHTML = "No videos found. Check Channel ID.";
    return;
  }

  let output = "<h3>Latest Channel Uploads</h3>";

  data.items.forEach(item => {
    const published = new Date(item.snippet.publishedAt);

    output += `
      <div class="video-card">

        <a href="https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank">
          <img 
            src="${item.snippet.thumbnails.medium.url}" 
            class="thumbnail"
          >
        </a>

        <div class="video-title">
          ${item.snippet.title}
        </div>

        <div class="video-time">
          ${formatIST(published)}
        </div>

      </div>
    `;
  });

  resultDiv.innerHTML = output;
}

/* ---------- BUTTONS ---------- */

function clearData() {
  document.getElementById("channelId").value = "";
  document.getElementById("result").innerHTML = "";
}

function refreshPage() {
  location.reload();
}