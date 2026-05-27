let data = [];
let isAdmin = false;
let editingId = null; 

const ADMIN_USER = "Aphidet";
const ADMIN_PASS = "281251";

const overlay = document.getElementById("overlay");
const user = document.getElementById("user");
const pass = document.getElementById("pass");
const adminForm = document.getElementById("adminForm");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const assetId = document.getElementById("assetId");
const assetName = document.getElementById("assetName");
const assetDept = document.getElementById("assetDept");
const assetStatus = document.getElementById("assetStatus");
const search = document.getElementById("search");
const table = document.getElementById("table");
const totalCount = document.getElementById("totalCount");
const okCount = document.getElementById("okCount");
const repairCount = document.getElementById("repairCount");
const soldCount = document.getElementById("soldCount");

const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// ระบบจัดเก็บข้อมูล LocalStorage (ไม่ใช้ Firebase)
function saveData() {
  localStorage.setItem("npuAssets", JSON.stringify(data));
}

function loadData() {
  const storedData = localStorage.getItem("npuAssets");
  if (storedData) {
    data = JSON.parse(storedData);
  } else {
    data = [];
  }
  render(data);
}

window.openLogin = () => overlay.classList.add("show");
window.closeLogin = () => overlay.classList.remove("show");

window.login = () => {
  if (user.value.trim() === ADMIN_USER && pass.value.trim() === ADMIN_PASS) {
    isAdmin = true;
    adminForm.style.display = "block";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    window.closeLogin();
    render(data);
    alert("เข้าสู่ระบบสำเร็จ");
  } else {
    alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }
};

window.logout = () => {
  isAdmin = false;
  adminForm.style.display = "none";
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  user.value = "";
  pass.value = "";
  cancelEdit(); 
  render(data);
};

window.cancelEdit = () => {
  editingId = null;
  assetId.value = "";
  assetName.value = "";
  assetDept.value = "";
  assetStatus.value = "พร้อมใช้งาน";
  assetId.disabled = false; 
  
  formTitle.innerText = "เพิ่มข้อมูลครุภัณฑ์";
  saveBtn.innerText = "💾 บันทึกข้อมูล";
  cancelEditBtn.style.display = "none";
};

window.addItem = () => {
  if (!isAdmin) {
    alert("เฉพาะแอดมินเท่านั้น");
    return;
  }

  const id = assetId.value.trim();
  const name = assetName.value.trim();
  const dept = assetDept.value.trim();
  const status = assetStatus.value;

  if (!id || !name || !dept) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  if (editingId) {
    // โหมดแก้ไขข้อมูล
    const index = data.findIndex(x => x.id === editingId);
    if (index !== -1) {
      data[index].id = id;
      data[index].name = name;
      data[index].dept = dept;
      data[index].status = status;
    }
    // ✅ เอา alert อัปเดตสำเร็จออกแล้ว
    cancelEdit(); 
      
  } else {
    // โหมดเพิ่มข้อมูลใหม่
    const exists = data.some(x => x.id === id);
    if (exists) {
      alert("รหัสครุภัณฑ์นี้มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น");
      return;
    }
    data.push({
      id, 
      name, 
      dept, 
      status,
      date: new Date().toLocaleDateString("th-TH")
    });
    // ✅ เอา alert เพิ่มสำเร็จออกแล้ว
    cancelEdit(); 
  }

  // บันทึกลงเครื่องและรีเฟรชตารางทันที
  saveData();
  render(data);
};

window.searchItem = () => {
  const k = search.value.toLowerCase();
  render(data.filter(x =>
    String(x.id || "").toLowerCase().includes(k) ||
    String(x.name || "").toLowerCase().includes(k) ||
    String(x.dept || "").toLowerCase().includes(k)
  ));
};

window.deleteItem = (id) => {
  if (!isAdmin) return;
  if(!confirm("คุณต้องการลบรายการนี้ใช่ไหม?")) return;
  
  data = data.filter(x => x.id !== id);
  
  if(editingId === id) {
    cancelEdit();
  }
  
  saveData();
  render(data);
  // ✅ เอา alert ลบสำเร็จออกแล้วด้วยเพื่อความรวดเร็ว
};

window.editItem = (id) => {
  if (!isAdmin) return;
  const item = data.find(x => x.id === id);
  if (!item) return;

  editingId = id; 

  assetId.value = item.id || "";
  assetName.value = item.name || "";
  assetDept.value = item.dept || "";
  assetStatus.value = item.status || "พร้อมใช้งาน";

  assetId.disabled = true; 
  formTitle.innerText = "แก้ไขข้อมูลครุภัณฑ์";
  saveBtn.innerText = "🔄 อัปเดตข้อมูล";
  cancelEditBtn.style.display = "inline-block"; 

  adminForm.scrollIntoView({ behavior: 'smooth' });
};

function badge(status) {
  if (status === "พร้อมใช้งาน") return `<span class="badge green">🟢 พร้อมใช้งาน</span>`;
  if (status === "กำลังซ่อม") return `<span class="badge orange">🟠 กำลังซ่อม</span>`;
  return `<span class="badge red">🔴 จำหน่ายแล้ว</span>`;
}

function render(list) {
  table.innerHTML = "";
  let ok = 0, repair = 0, sold = 0;

  list.forEach((x) => {
    if (x.status === "พร้อมใช้งาน") ok++;
    if (x.status === "กำลังซ่อม") repair++;
    if (x.status === "จำหน่ายแล้ว") sold++;

    table.innerHTML += `
      <tr>
        <td>${x.id || ""}</td>
        <td>${x.name || ""}</td>
        <td>${x.dept || ""}</td>
        <td>${badge(x.status)}</td>
        <td>${x.date || ""}</td>
        <td>
          ${
            isAdmin
              ? `<div class="action-btns">
                  <button class="edit-btn" onclick="editItem('${x.id}')">✏️</button>
                  <button class="delete-btn" onclick="deleteItem('${x.id}')">🗑️</button>
                </div>`
              : `<span style="color:#888">ผู้ใช้งานทั่วไป</span>`
          }
        </td>
      </tr>
    `;
  });

  totalCount.innerText = list.length;
  okCount.innerText = ok;
  repairCount.innerText = repair;
  soldCount.innerText = sold;
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (overlay.classList.contains("show")) {
    if (document.activeElement === user || document.activeElement === pass) window.login();
    return;
  }
  if (
    document.activeElement === assetId ||
    document.activeElement === assetName ||
    document.activeElement === assetDept ||
    document.activeElement === assetStatus
  ) {
    window.addItem();
  }
});

// โหลดข้อมูลตอนเปิดเว็บ
loadData();