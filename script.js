/* ===================================
   DAD'S MOBILE REPAIR MANAGER
   CORE FEATURES
=================================== */

// Local Storage Keys

const JOBS_KEY = "repair_jobs";
const LANGUAGE_KEY = "selected_language";
const THEME_KEY = "selected_theme";

/* ===================================
   ELEMENTS
=================================== */

const repairForm = document.getElementById("repairForm");
const repairList = document.getElementById("repairList");
const searchInput = document.getElementById("searchInput");

const totalJobsEl = document.getElementById("totalJobs");
const pendingJobsEl = document.getElementById("pendingJobs");
const completedJobsEl = document.getElementById("completedJobs");

const welcomeModal = document.getElementById("welcomeModal");
const startAppBtn = document.getElementById("startAppBtn");

const themeBtn = document.getElementById("themeBtn");
const languageBtn = document.getElementById("languageBtn");

const toast = document.getElementById("toast");

/* ===================================
   DATA
=================================== */

let repairJobs =
JSON.parse(localStorage.getItem(JOBS_KEY))
|| [];

/* ===================================
   WELCOME SCREEN
=================================== */

startAppBtn.addEventListener("click",()=>{

welcomeModal.style.display="none";

showToast("Welcome Dad ❤️");

});

/* ===================================
   SAVE DATA
=================================== */

function saveJobs(){

localStorage.setItem(
JOBS_KEY,
JSON.stringify(repairJobs)
);

}

/* ===================================
   ADD REPAIR JOB
=================================== */

repairForm.addEventListener("submit",(e)=>{

e.preventDefault();

const customerName =
document.getElementById("customerName").value;

const customerPhone =
document.getElementById("customerPhone").value;

const mobileModel =
document.getElementById("mobileModel").value;

const problemDescription =
document.getElementById("problemDescription").value;

const repairCost =
document.getElementById("repairCost").value;

const deliveryDate =
document.getElementById("deliveryDate").value;

const repairStatus =
document.getElementById("repairStatus").value;

const ticketNumber =
"SRM" + Date.now();

const newJob = {

id: Date.now(),

ticketNumber:
"SRM-" +
Math.floor(
1000 + Math.random() * 9000
),

customerName,

customerPhone,

mobileModel,

problemDescription,

repairCost,

deliveryDate,

repairStatus,

createdAt:new Date().toISOString()

};

repairJobs.push(newJob);

saveJobs();

renderRepairJobs();

updateDashboard();

repairForm.reset();

showToast("Repair Job Added");

});

navigator.serviceWorker.register('service-worker.js');

/* ===================================
   RENDER JOBS
=================================== */

function renderRepairJobs(){

repairList.innerHTML="";

if(repairJobs.length===0){

repairList.innerHTML=`
<p>No Repair Jobs Added Yet.</p>
`;

return;

}

repairJobs.forEach(job=>{

const card =
document.createElement("div");

card.className="repair-card";

card.innerHTML=`

<h3>
📱 ${job.customerName}
</h3>

<p>
<b>Ticket:</b>
${job.ticketNumber}
</p>

<p>
<b>Phone:</b>
${job.customerPhone}
</p>

<p>
<b>Model:</b>
${job.mobileModel}
</p>

<p>
<b>Problem:</b>
${job.problemDescription}
</p>

<p>
<b>Cost:</b>
₹${job.repairCost}
</p>

<p class="status-badge ${job.repairStatus.replace(/\s/g,'')}">
${job.repairStatus}
</p>

<p>
<b>Delivery:</b>
${job.deliveryDate || "Not Set"}
</p>

<button
class="edit-btn"
onclick="editJob(${job.id})">
Edit
</button>

<button
class="delete-btn"
onclick="deleteJob(${job.id})">
Delete
</button>

`;

repairList.appendChild(card);

});

}

function updateDueToday(){

const dueTodayList =
document.getElementById(
"dueTodayList"
);

const dueTodayCount =
document.getElementById(
"dueTodayCount"
);

const today =
new Date()
.toISOString()
.split("T")[0];

const dueJobs =
repairJobs.filter(
job =>
job.deliveryDate === today
);

dueTodayCount.textContent =
dueJobs.length;

if(dueJobs.length===0){

dueTodayList.innerHTML =

"<p>No Deliveries Today</p>";

return;

}

dueTodayList.innerHTML =

dueJobs.map(job =>

`
<div class="repair-card">

<p>
${job.customerName}
</p>

<p>
${job.mobileModel}
</p>

<p>
${job.customerPhone}
</p>

</div>
`

).join("");

}

/* ===================================
   DELETE JOB
=================================== */

function deleteJob(id){

const confirmDelete =
confirm("Delete this repair job?");

if(!confirmDelete) return;

repairJobs =
repairJobs.filter(
job=>job.id!==id
);

saveJobs();

renderRepairJobs();

updateDashboard();

showToast("Job Deleted");

}

window.deleteJob = deleteJob;

/* ===================================
   EDIT JOB
=================================== */

function editJob(id){

const job =
repairJobs.find(
item=>item.id===id
);

if(!job) return;

document.getElementById("customerName").value =
job.customerName;

document.getElementById("customerPhone").value =
job.customerPhone;

document.getElementById("mobileModel").value =
job.mobileModel;

document.getElementById("problemDescription").value =
job.problemDescription;

document.getElementById("repairCost").value =
job.repairCost;

document.getElementById("deliveryDate").value =
job.deliveryDate;

document.getElementById("repairStatus").value =
job.repairStatus;

deleteJob(id);

window.scrollTo({
top:0,
behavior:"smooth"
});

showToast("Editing Job");

}

window.editJob = editJob;

/* ===================================
   DASHBOARD
=================================== */

function updateDashboard(){

const total =
repairJobs.length;

const pending =
repairJobs.filter(job=>

job.repairStatus !==
"Delivered"

).length;

const completed =
repairJobs.filter(job=>

job.repairStatus ===
"Delivered"

).length;

totalJobsEl.textContent =
total;

pendingJobsEl.textContent =
pending;

completedJobsEl.textContent =
completed;

updateDueToday();

}

function showCustomerHistory(phone){

const historyDiv =
document.getElementById(
"customerHistory"
);

const history =
repairJobs.filter(
job =>
job.customerPhone === phone
);

if(history.length===0){

historyDiv.innerHTML = "";

return;

}

historyDiv.innerHTML =

`
<h3>Customer History</h3>

${history.map(job =>

`
<div class="history-card">

<p>
${job.mobileModel}
</p>

<p>
${job.problemDescription}
</p>

<p>
₹${job.repairCost}
</p>

</div>
`

).join("")}

`;

}

/* ===================================
   SEARCH
=================================== */

searchInput.addEventListener(
"keyup",
searchCustomers
);

function searchCustomers(){

const searchValue =
searchInput.value.toLowerCase();

const cards =
document.querySelectorAll(
".repair-card"
);

cards.forEach(card=>{

const text =
card.innerText.toLowerCase();

card.style.display =

text.includes(searchValue)

? "block"

: "none";

});

}

/* ===================================
   THEME
=================================== */

themeBtn.addEventListener(
"click",
toggleTheme
);

function toggleTheme(){

document.body.classList.toggle(
"dark"
);

const darkEnabled =

document.body.classList.contains(
"dark"
);

localStorage.setItem(
THEME_KEY,
darkEnabled
);

themeBtn.textContent =

darkEnabled

? "☀️"

: "🌙";

showToast("Theme Changed");

}

function loadTheme(){

const savedTheme =
localStorage.getItem(THEME_KEY);

if(savedTheme==="true"){

document.body.classList.add(
"dark"
);

themeBtn.textContent="☀️";

}

}

/* ===================================
   LANGUAGE SYSTEM
=================================== */

const translations = {

en:{

repairJobs:"🔧 Repair Jobs",
customers:"👥 Customers",
inventory:"📦 Inventory",
billing:"🧾 Billing",
family:"❤️ Family Corner",

addRepair:"🔧 Add Repair Job",

customerName:"Customer Name",
phoneNumber:"Phone Number",
mobileModel:"Mobile Model",

problem:"Problem Description",

repairCost:"Repair Cost",

pending:"Pending",
underRepair:"Under Repair",
ready:"Ready",
delivered:"Delivered",

search:"Search by Name, Number or Model",

inventoryTitle:"📦 Inventory Manager",

billTitle:"🧾 Bill Generator",

familyTitle:"❤️ Family Corner"

},

te:{

repairJobs:"🔧 రిపేర్ పనులు",
customers:"👥 కస్టమర్లు",
inventory:"📦 విడిభాగాలు",
billing:"🧾 బిల్లు",

family:"❤️ కుటుంబం",

addRepair:"🔧 రిపేర్ జోడించండి",

customerName:"కస్టమర్ పేరు",

phoneNumber:"ఫోన్ నంబర్",

mobileModel:"మొబైల్ మోడల్",

problem:"సమస్య వివరాలు",

repairCost:"రిపేర్ ఖర్చు",

pending:"పెండింగ్",

underRepair:"రిపేర్ జరుగుతోంది",

ready:"సిద్ధంగా ఉంది",

delivered:"డెలివర్ చేయబడింది",

search:"పేరు లేదా నంబర్ ద్వారా వెతకండి",

inventoryTitle:"📦 స్టాక్ మేనేజర్",

billTitle:"🧾 బిల్లు తయారీ",

familyTitle:"❤️ కుటుంబం"

}

};

languageBtn.addEventListener(
"click",
toggleLanguage
);


/* ===================================
   INIT
=================================== */


function initializeApp(){

loadTheme();

loadLanguage();

renderRepairJobs();

updateDashboard();

setupNavigation();

}

initializeApp();


function toggleLanguage(){

let current =

localStorage.getItem(
LANGUAGE_KEY
) || "en";

current =
current==="en"
? "te"
: "en";

localStorage.setItem(
LANGUAGE_KEY,
current
);

applyLanguage(current);

showToast(
current==="te"
?
"తెలుగు మోడ్"
:
"English Mode"
);

}

function loadLanguage(){

const current =

localStorage.getItem(
LANGUAGE_KEY
) || "en";

applyLanguage(current);

}

function applyLanguage(lang){

languageBtn.textContent =

lang==="en"
?
"తెలుగు"
:
"English";

const t =
translations[lang];

document.querySelectorAll(
".menu-btn"
)[0].textContent =
t.repairJobs;

document.querySelectorAll(
".menu-btn"
)[1].textContent =
t.customers;

document.querySelectorAll(
".menu-btn"
)[2].textContent =
t.inventory;

document.querySelectorAll(
".menu-btn"
)[3].textContent =
t.billing;

document.querySelectorAll(
".menu-btn"
)[4].textContent =
t.family;

document.getElementById(
"customerName"
).placeholder =
t.customerName;

document.getElementById(
"customerPhone"
).placeholder =
t.phoneNumber;

document.getElementById(
"mobileModel"
).placeholder =
t.mobileModel;

document.getElementById(
"problemDescription"
).placeholder =
t.problem;

document.getElementById(
"repairCost"
).placeholder =
t.repairCost;

document.getElementById(
"searchInput"
).placeholder =
t.search;

}
/* ===================================
   NAVIGATION
=================================== */

function setupNavigation(){

const buttons =
document.querySelectorAll(
".menu-btn"
);

buttons.forEach(btn=>{

btn.addEventListener(
"click",
()=>{

const target =
btn.dataset.target;

const section =
document.getElementById(
target
);

if(section){

section.scrollIntoView({

behavior:"smooth"

});

}

});

});

}

/* ===================================
   TOAST
=================================== */

function showToast(message){

toast.textContent =
message;

toast.classList.add(
"show"
);

setTimeout(()=>{

toast.classList.remove(
"show"
);

},2500);

}

/* ===================================
   END
=================================== */

console.log(
"Mobile Repair Manager Loaded"
);
/* ===================================
   PART 4
   INVENTORY + EARNINGS + BILLING
=================================== */

/* ===================================
   STORAGE KEYS
=================================== */

const INVENTORY_KEY = "inventory_items";

/* ===================================
   INVENTORY
=================================== */

const inventoryForm =
document.getElementById("inventoryForm");

const inventoryList =
document.getElementById("inventoryList");

let inventoryItems =

JSON.parse(
localStorage.getItem(INVENTORY_KEY)
) || [];

renderInventory();

inventoryForm.addEventListener(
"submit",
(e)=>{

e.preventDefault();

const partName =
document.getElementById("partName")
.value
.trim();

const partQty =
parseInt(
document.getElementById("partQty")
.value
);

if(!partName) return;

inventoryItems.push({

id:Date.now(),

partName,

partQty

});

saveInventory();

renderInventory();

inventoryForm.reset();

showToast("Inventory Added");

});

function saveInventory(){

localStorage.setItem(
INVENTORY_KEY,
JSON.stringify(inventoryItems)
);

}

function renderInventory(){

inventoryList.innerHTML="";

if(inventoryItems.length===0){

inventoryList.innerHTML=
"<p>No Inventory Added.</p>";

return;

}

inventoryItems.forEach(item=>{

const div =
document.createElement("div");

div.className =
item.partQty<=3
?
"inventory-item low-stock"
:
"inventory-item";

div.innerHTML=`

<div>
<b>${item.partName}</b>
</div>

<div>
Qty: ${item.partQty}
</div>

`;

inventoryList.appendChild(div);

});

}

/* ===================================
   EARNINGS
=================================== */

const todayEarningsEl =
document.getElementById(
"todayEarnings"
);

const monthEarningsEl =
document.getElementById(
"monthEarnings"
);

const totalEarningsEl =
document.getElementById(
"totalEarnings"
);

updateEarnings();

function updateEarnings(){

let total = 0;
let today = 0;
let month = 0;

const currentDate =
new Date();

const currentDay =
currentDate.toDateString();

const currentMonth =
currentDate.getMonth();

const currentYear =
currentDate.getFullYear();

repairJobs.forEach(job=>{

const amount =
parseFloat(
job.repairCost || 0
);

if(
job.repairStatus ===
"Delivered"
){

total += amount;

const jobDate =
new Date(
job.createdAt
);

if(
jobDate.toDateString()
=== currentDay
){

today += amount;

}

if(

jobDate.getMonth()
=== currentMonth

&&

jobDate.getFullYear()
=== currentYear

){

month += amount;

}

}

});

todayEarningsEl.textContent =
"₹" + today;

monthEarningsEl.textContent =
"₹" + month;

totalEarningsEl.textContent =
"₹" + total;

}

/* ===================================
   PATCH DASHBOARD UPDATE
=================================== */

const oldDashboard =
updateDashboard;

updateDashboard = function(){

oldDashboard();

updateEarnings();

};

/* ===================================
   BILL GENERATOR
=================================== */

const billForm =
document.getElementById(
"billForm"
);

const billOutput =
document.getElementById(
"billOutput"
);

const downloadBillBtn =
document.getElementById(
"downloadBillBtn"
);

let latestBill = "";

billForm.addEventListener(
"submit",
(e)=>{

e.preventDefault();

const customer =
document.getElementById(
"billCustomer"
).value;

const model =
document.getElementById(
"billModel"
).value;

const repair =
document.getElementById(
"billRepair"
).value;

const amount =
document.getElementById(
"billAmount"
).value;

latestBill =

`
Sri Mobile Repair Center

-----------------------

Customer:
${customer}

Mobile:
${model}

Repair:
${repair}

Amount:
₹${amount}

-----------------------

Thank You Visit Again

Happy Father's Day ❤️

`;

billOutput.innerHTML =

`
<pre>
${latestBill}
</pre>
`;

showToast(
"Bill Generated"
);

});

downloadBillBtn.addEventListener(
"click",
()=>{

if(!latestBill){

showToast(
"Generate Bill First"
);

return;

}

const blob =
new Blob(

[latestBill],

{
type:"text/plain"
}

);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement("a");

a.href=url;

a.download=
"repair-bill.txt";

a.click();

URL.revokeObjectURL(url);

showToast(
"Bill Downloaded"
);

});

/* ===================================
   WHATSAPP READY MESSAGE
=================================== */
whatsappBtn.addEventListener(
"click",
()=>{

const number =
document.getElementById(
"whatsappNumber"
).value;

const type =
document.getElementById(
"messageType"
).value;

let message = "";

if(type==="Repair Received"){

message =
"Your mobile has been received for repair.";

}

if(type==="Under Repair"){

message =
"Your mobile is currently under repair.";

}

if(type==="Ready For Collection"){

message =
"Your mobile repair is completed and ready for collection.";

}

if(type==="Delivered"){

message =
"Thank you for visiting Sri Mobile Repair Center.";

}

window.open(

`https://wa.me/91${number}?text=${encodeURIComponent(message)}`,

"_blank"

);

});

/* ===================================
   CUSTOMER HISTORY
=================================== */

function getCustomerHistory(phone){

return repairJobs.filter(

job=>

job.customerPhone===phone

);

}

/* ===================================
   LOW STOCK ALERT
=================================== */

function checkLowStock(){

const lowItems =

inventoryItems.filter(
item=>item.partQty<=3
);

if(lowItems.length>0){

console.log(
"Low Stock Items:",
lowItems
);

}

}

checkLowStock();

/* ===================================
   STARTUP REFRESH
=================================== */

updateEarnings();
renderInventory();

/* ===================================
   PART 4 COMPLETE
=================================== */