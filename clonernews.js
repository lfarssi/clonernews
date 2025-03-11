const API_BASE = "https://hacker-news.firebaseio.com/v0/";
const API_SUFFIX = ".json?print=pretty";

const state = {
  start: 0,
  end: 10,
  totalItems: 0,
  currentEndpoint: "newstories", 
  updatesCount: 0,
  maxItem: 0,
};

async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    // console.log(response);
    
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

function updateNotification() {
  const updateEl = document.getElementById("update");
  updateEl.textContent = `Update (${state.updatesCount})`;
  updateEl.style.color = state.updatesCount > 0 ? "red" : "black";
}

async function checkForUpdates() {
  const newMax = await fetchJSON(`${API_BASE}maxitem${API_SUFFIX}`);
  // console.log(newMax);
  
  if (state.maxItem !== 0 && newMax !== state.maxItem) {
    state.updatesCount++;
    updateNotification();
  }
  state.maxItem = newMax;
}
setInterval(checkForUpdates, 1000);

async function fetchItems() {
  state.updatesCount = 0;
  updateNotification();

  const url = `${API_BASE}${state.currentEndpoint}${API_SUFFIX}`;
  const ids = await fetchJSON(url);
  if (!ids) return;

  state.totalItems = ids.length;
  const container = document.getElementById("items-container");
  container.innerHTML = "";

  const pageIds = ids.slice(state.start, state.end);
  for (const id of pageIds) {
    const item = await fetchJSON(`${API_BASE}item/${id}${API_SUFFIX}`);
    console.log(item);
    console.log(createItemElement(item));
    
    if (item) {
      container.appendChild(createItemElement(item));
    }
  }
}

async function fetchComments(itemId) {
  const item = await fetchJSON(`${API_BASE}item/${itemId}${API_SUFFIX}`);
  if (!item) return;

  const container = document.getElementById("items-container");
  container.innerHTML = "";
  container.appendChild(createItemElement(item));

  if (item.kids && item.kids.length > 0) {
    for (const commentId of item.kids) {
      const comment = await fetchJSON(`${API_BASE}item/${commentId}${API_SUFFIX}`);
      if (comment) {
        container.appendChild(createItemElement(comment, true));
      }
    }
  }
}

function createItemElement(item, isComment = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "new";

  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.textContent = item.title;
  wrapper.appendChild(titleEl);

  const authorEl = document.createElement("div");
  authorEl.className = "author";
  authorEl.textContent = item.by;
  wrapper.appendChild(authorEl);

  const timeEl = document.createElement("div");
  timeEl.className = "time";
  timeEl.textContent = new Date(item.time * 1000).toLocaleString();
  wrapper.appendChild(timeEl);

  if (item.url) {
    const urlEl = document.createElement("a");
    urlEl.className = "url";
    urlEl.textContent = "Read More...";
    urlEl.href = item.url;
    urlEl.target = "_blank";
    wrapper.appendChild(urlEl);
  }

  if (item.text) {
    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.innerHTML = item.text;
    wrapper.appendChild(textEl);
  }

  const subDiv = document.createElement("div");
  subDiv.className = "subDiv";

  const scoreEl = document.createElement("div");
  scoreEl.className = "score";
  scoreEl.textContent = `Score (${item.score})`;
  subDiv.appendChild(scoreEl);

  const typeEl = document.createElement("div");
  typeEl.className = "type";
  typeEl.textContent = item.url ? item.type : (item.type === "story" ? "ask" : item.type);
  subDiv.appendChild(typeEl);

  if (item.kids) {
    const commentLink = document.createElement("a");
    commentLink.className = "comments";
    commentLink.style.cursor = "pointer";
    commentLink.style.color = "blue";
    commentLink.textContent = `Comment (${item.kids.length})`;
    commentLink.addEventListener("click", () => fetchComments(item.id));
    subDiv.appendChild(commentLink);
  }
  wrapper.appendChild(subDiv);

  return wrapper;
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedJob = debounce(() => {
  state.start = 0;
  state.end = 10;
  state.currentEndpoint = "jobstories";
  fetchItems();
}, 1000);

const debouncedNewStories = debounce(() => {
  state.start = 0;
  state.end = 10;
  state.currentEndpoint = "newstories";
  fetchItems();
}, 1000);

const debouncedNext = debounce(() => {
  if (state.end < state.totalItems) {
    state.start += 10;
    state.end += 10;
    fetchItems();
  }
}, 1000);

const debouncedPrev = debounce(() => {
  if (state.start > 0) {
    state.start -= 10;
    state.end -= 10;
    fetchItems();
  }
}, 1000);

const debouncedPoll = debounce(async () => {
  const pollIds = [
    41881367, 41852211, 41741393, 41717934, 41610428, 41603177,
    41550697, 41483187, 41314418, 41106263, 41062175, 41045565,
    41010066, 40861796, 40854152, 40775332, 40689515, 40685752,
    40418682, 40336656,
  ];
  const container = document.getElementById("items-container");
  container.innerHTML = "";
  for (const id of pollIds) {
    const item = await fetchJSON(`${API_BASE}item/${id}${API_SUFFIX}`);
    if (item) {
      const pollEl = document.createElement("div");
      pollEl.className = "new";
      const titleEl = document.createElement("div");
      titleEl.textContent = item.title;
      titleEl.style.color = "blue";
      pollEl.appendChild(titleEl);
      if (item.text) {
        const textEl = document.createElement("div");
        textEl.innerHTML = item.text;
        pollEl.appendChild(textEl);
      }
      if (item.parts) {
        const partsEl = document.createElement("div");
        for (const partId of item.parts) {
          const part = await fetchJSON(`${API_BASE}item/${partId}${API_SUFFIX}`);
          if (part) {
            const partEl = document.createElement("div");
            partEl.textContent = `* ${part.text}`;
            partsEl.appendChild(partEl);
          }
        }
        pollEl.appendChild(partsEl);
      }
      container.appendChild(pollEl);
    }
  }
}, 1000);

document.getElementById("job").addEventListener("click", debouncedJob);
document.getElementById("NewStories").addEventListener("click", debouncedNewStories);
document.getElementById("next-button").addEventListener("click", debouncedNext);
document.getElementById("prev-button").addEventListener("click", debouncedPrev);
document.getElementById("Poll").addEventListener("click", debouncedPoll);

fetchItems();
