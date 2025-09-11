const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("month-year");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const prevYearBtn = document.getElementById("prevYear");
const nextYearBtn = document.getElementById("nextYear");

const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");
const editoriasBtn = document.getElementById("editoriasBtn");
const editoriasMenu = document.getElementById("editoriasMenu");
const clearFiltersBtn = document.getElementById("clearFilters");

const colorFilters = document.querySelectorAll(".colorFilter");
const statusFilters = document.querySelectorAll(".statusFilter");

// Backup JSON
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

let currentDate = new Date();
let posts = JSON.parse(localStorage.getItem("calendarPosts")) || {};
let selectedDate = null;
let selectedPostIndex = null;

// Modal principal
const modal = document.getElementById("postModal");
const closeModalBtn = document.getElementById("closeModal");
const savePostBtn = document.getElementById("savePost");
const deletePostBtn = document.getElementById("deletePost");
const postTextEl = document.getElementById("postText");
const postPublishedEl = document.getElementById("postPublished");
const editoriaButtons = document.querySelectorAll(".editoria-btn");
const openCommentsBtn = document.getElementById("openComments");

// Modal de comentários
const commentsModal = document.getElementById("commentsModal");
const closeCommentsBtn = document.getElementById("closeComments");
const postCommentsEl = document.getElementById("postComments");

let selectedColor = "#3498DB";

// Toggle menus
filterBtn.onclick = () => { filterMenu.style.display = filterMenu.style.display==="block"?"none":"block"; };
editoriasBtn.onclick = () => { editoriasMenu.style.display = editoriasMenu.style.display==="block"?"none":"block"; };

// Fechar menus ao clicar fora
document.addEventListener("click", e => {
  if (!filterMenu.contains(e.target) && e.target!==filterBtn) filterMenu.style.display="none";
  if (!editoriasMenu.contains(e.target) && e.target!==editoriasBtn) editoriasMenu.style.display="none";
});

// Selecionar cor pelo botão da editoria
editoriaButtons.forEach(btn=>{
  btn.onclick = ()=>{
    selectedColor = btn.dataset.color;
    editoriaButtons.forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
  };
});

// LocalStorage
function savePosts(){ localStorage.setItem("calendarPosts", JSON.stringify(posts)); }

// Render calendar
function renderCalendar(){
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1,0).getDate();
  monthYearEl.textContent = `${currentDate.toLocaleDateString("pt-BR",{month:"long"})} ${year}`;
  calendarEl.innerHTML="";

  for(let i=0;i<firstDay;i++) calendarEl.appendChild(document.createElement("div"));

  for(let day=1;day<=daysInMonth;day++){
    const cell=document.createElement("div");
    cell.classList.add("day");
    const number=document.createElement("div");
    number.classList.add("day-number");
    number.textContent=day;
    cell.appendChild(number);

    const dateKey=`${year}-${month}-${day}`;
    if(posts[dateKey]){
      posts[dateKey].forEach((post,index)=>{
        const postEl=document.createElement("div");
        postEl.classList.add("post",post.published?"published":"planned");

        if(post.color && post.color.toUpperCase()==="#556B2F") post.color="#3E6B2F";

        postEl.style.backgroundColor=post.color || "#3498DB";
        postEl.textContent=post.text || "";
        postEl.style.color=(post.color||"").toUpperCase()==="#F1C40F"?"#000":"#fff";

        const statusKey = post.published ? "published" : "planned";
        const colorChecked = Array.from(colorFilters).find(f=>f.dataset.color===(post.color||""))?.checked ?? true;
        const statusChecked = Array.from(statusFilters).find(f=>f.dataset.status===statusKey)?.checked ?? true;
        if(!colorChecked || !statusChecked) postEl.style.display="none";

        postEl.addEventListener("click", e=>{
          e.stopPropagation();
          if(e.shiftKey){
            post.published = !post.published;
            savePosts();
            renderCalendar();
          } else {
            openModal(dateKey,index);
          }
        });

        postEl.draggable=true;
        postEl.addEventListener("dragstart",e=>{
          e.dataTransfer.setData("text/plain",JSON.stringify({dateKey,index}));
        });

        cell.appendChild(postEl);
      });
    }

    cell.addEventListener("click",()=>openModal(dateKey));

    cell.addEventListener("dragover",e=>e.preventDefault());
    cell.addEventListener("drop",e=>{
      e.preventDefault();
      const data=JSON.parse(e.dataTransfer.getData("text/plain"));
      if(data.dateKey===dateKey && data.index!=null) return;
      const movedPost=posts[data.dateKey][data.index];
      if(!posts[dateKey]) posts[dateKey]=[];
      if(posts[dateKey].length>=4){ alert("Máximo de 4 posts por dia!"); return; }
      posts[dateKey].push(movedPost);
      posts[data.dateKey].splice(data.index,1);
      if(posts[data.dateKey].length===0) delete posts[data.dateKey];
      savePosts(); renderCalendar();
    });

    calendarEl.appendChild(cell);
  }
}

// Modal principal
function openModal(dateKey,postIndex=null){
  selectedDate=dateKey;
  selectedPostIndex=postIndex;

  if(postIndex!==null){
    const post = posts[dateKey][postIndex];
    postTextEl.value = post.text || "";
    postCommentsEl.value = post.comments || "";
    selectedColor = post.color || "#3498DB";
    postPublishedEl.checked = !!post.published;
    editoriaButtons.forEach(b=>{
      b.classList.toggle("selected", b.dataset.color===selectedColor);
    });
    deletePostBtn.style.display="inline-block";
  } else {
    postTextEl.value="";
    postCommentsEl.value="";
    selectedColor="#3498DB";
    postPublishedEl.checked=false;
    editoriaButtons.forEach(b=>{
      b.classList.remove("selected");
      if(b.dataset.color===selectedColor) b.classList.add("selected");
    });
    deletePostBtn.style.display="none";
  }

  modal.style.display="flex";
}

function closeModal(){ modal.style.display="none"; }
function closeComments(){ commentsModal.style.display="none"; }

closeModalBtn.onclick=closeModal;
closeCommentsBtn.onclick=closeComments;

window.onclick=e=>{
  if(e.target===modal) closeModal();
  if(e.target===commentsModal) closeComments();
};

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    if(modal.style.display==="flex") closeModal();
    if(commentsModal.style.display==="flex") closeComments();
  }
});

// Abrir modal de comentários
openCommentsBtn.onclick=()=>{ commentsModal.style.display="flex"; };

// Salvar post
savePostBtn.onclick=()=>{
  const text=postTextEl.value.trim();
  const comments=postCommentsEl.value.trim();
  const published=postPublishedEl.checked;
  if(!text) return;
  if(!posts[selectedDate]) posts[selectedDate]=[];
  if(selectedPostIndex!==null){
    posts[selectedDate][selectedPostIndex]={text,color:selectedColor,published,comments};
  } else {
    if(posts[selectedDate].length>=4){ alert("Máximo de 4 posts por dia!"); return; }
    posts[selectedDate].push({text,color:selectedColor,published,comments});
  }
  savePosts();
  closeModal();
  renderCalendar();
};

// Excluir post
deletePostBtn.onclick=()=>{
  if(selectedPostIndex!==null && confirm("Deseja realmente excluir este post?")){
    posts[selectedDate].splice(selectedPostIndex,1);
    if(posts[selectedDate].length===0) delete posts[selectedDate];
    savePosts();
    closeModal();
    renderCalendar();
  }
};

prevBtn.onclick=()=>{currentDate.setMonth(currentDate.getMonth()-1); renderCalendar();}
nextBtn.onclick=()=>{currentDate.setMonth(currentDate.getMonth()+1); renderCalendar();}
prevYearBtn.onclick=()=>{currentDate.setFullYear(currentDate.getFullYear()-1); renderCalendar();}
nextYearBtn.onclick=()=>{currentDate.setFullYear(currentDate.getFullYear()+1); renderCalendar();}

colorFilters.forEach(f=>f.addEventListener("change",renderCalendar));
statusFilters.forEach(f=>f.addEventListener("change",renderCalendar));
clearFiltersBtn.onclick=()=>{
  colorFilters.forEach(f=>f.checked=true);
  statusFilters.forEach(f=>f.checked=true);
  renderCalendar();
}

function exportBackup(){
  const blob = new Blob([JSON.stringify(posts,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `calendar_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },0);
}

function validateBackupStructure(obj){
  if(typeof obj!=="object" || obj===null || Array.isArray(obj)) return false;
  return Object.values(obj).every(arr=>Array.isArray(arr) && arr.every(p=>p.text && p.color && typeof p.published==="boolean"));
}

function importBackup(file){
  const reader = new FileReader();
  reader.onload=()=>{
    try{
      const data = JSON.parse(reader.result);
      if(!validateBackupStructure(data)) throw new Error("Estrutura inválida");
      const replace = confirm("Importar backup:\n\nOK = SUBSTITUIR posts atuais\nCancelar = MESCLAR com os atuais");
      if(replace) posts = data;
      else {
        for(const [dateKey, arr] of Object.entries(data)){
          if(!posts[dateKey]) posts[dateKey]=[];
          posts[dateKey] = posts[dateKey].concat(arr).slice(0,4);
        }
      }
      savePosts(); renderCalendar(); alert("Importação concluída.");
    } catch(e){ alert("Arquivo inválido. Selecione um JSON exportado deste calendário."); }
    finally{ importFile.value=""; }
  };
  reader.readAsText(file);
}

exportBtn.addEventListener("click", exportBackup);
importBtn.addEventListener("click",()=>importFile.click());
importFile.addEventListener("change",e=>{ if(e.target.files[0]) importBackup(e.target.files[0]); });

renderCalendar();
