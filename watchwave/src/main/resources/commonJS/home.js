function loadPlayer(ele){
const folderId = ele.getAttribute("data-folderId");
window.location.href = "/play?movieTitle=" + folderId;
}