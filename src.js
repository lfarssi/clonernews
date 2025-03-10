const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0/';
const API = ".json?print=pretty";
let start = 0;
let end = 10;
let data = [];
let dataFilter = [];
let askData = [];
let selectedValue = "topstories";

document.getElementById("categoriesSelector").addEventListener("change", function () {
    selectedValue = this.value;

    start = 0;
    end = 10;
    askfetchJSON();
});

async function fetchJSON() {
    try {
        const response = await fetch(API_BASE_URL + selectedValue + API);
        if (!response.ok) throw new Error('Network response was not ok');
        data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

async function askfetchJSON() {
    // document.getElementById("loading").style.display = "block";
    let f = await fetchJSON()

    const promises = f.slice(start, end).map(async (id) => {
        const response = await fetch(API_BASE_URL + "item/" + id + API);
        return await response.json();
    });

    askData = await Promise.all(promises);
    dataFilter = askData

    storyData()

    // }
    // );

    // askData = (await Promise.all(promises)).filter(item => item !== null);
    // document.getElementById("loading").style.display = "none";
}

const container = document.querySelector("#tableT tbody");

function storyData() {
    container.innerHTML = "";
    // const jobPosts = dataFilter.filter(element => element.type === "job");
    // console.log(jobPosts);
    dataFilter.forEach(element => {
    let commentsLink = 'N/A';
    if (element.kids && element.kids.length > 0) {
        commentsLink = `<a href="comment.html?id=${element.kids}" target="_blank">${element.kids.length} comment${element.kids.length > 1 ? 's' : ''}</a>`;
    }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${element.by || 'N/A'}</td>
            <td>${element.title || 'N/A'}</td>
            <td>${element.text || 'N/A'}</td>
            <td>${element.type || 'N/A'}</td>
  <td>${commentsLink}</td>  
        `;
        container.appendChild(tr);
    });
    addCommentLinkListeners();
}
function addCommentLinkListeners() {
    const commentLinks = container.querySelectorAll('a[href^="comment.html"]');
    commentLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const storyId = new URLSearchParams(this.href.split('?')[1]).get('id');
            // You can either navigate to the comments page:
            window.location.href = `comment.html?id=${storyId}`;
            // Or open it in a new tab:
            // window.open(`comment.html?id=${storyId}`, '_blank');
        });
    });
}

document.getElementById("prev").addEventListener("click", () => {
    if (start > 0) {
        start -= 10;
        end -= 10;
        askfetchJSON();
    }
});

document.getElementById("next").addEventListener("click", () => {
    if (end < data.length) {
        start += 10;
        end += 10;
        askfetchJSON();
    }
});

askfetchJSON();