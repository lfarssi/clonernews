const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0/';
const urlParams = new URLSearchParams(window.location.search);
const storyId = urlParams.get('id').split(",");
console.log(storyId);

async function comment() {
    try {
        const promises = storyId.map(async (id) => {
            const response = await fetch(API_BASE_URL + "item/" + id + ".json");
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        });
        
        return await Promise.all(promises);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

const container = document.querySelector("#tableT tbody");
async function storyData() {
    const dataFilter = await comment();
    console.log(dataFilter);
    
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


storyData()