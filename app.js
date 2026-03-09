// Base API endpoint
const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab";

// will store all issues locally
let masterData = [];


/* -------------------------
LOGIN
Simple demo login
-------------------------*/
function attemptLogin() {

    const username = document.getElementById("user-field").value;
    const password = document.getElementById("pass-field").value;

    if (username === "admin" && password === "admin123") {

        document.getElementById("auth-screen").classList.add("hidden");
        document.getElementById("dashboard-screen").classList.remove("hidden");

        initializeDashboard();

    } else {

        alert("Invalid credentials. Use admin / admin123");

    }
}



/* -------------------------
LOAD ALL ISSUES
Runs after login
-------------------------*/
async function initializeDashboard() {

    showSpinner(true);

    try {

        const response = await fetch(`${API_URL}/issues`);
        const result = await response.json();

        masterData = result.data;

        renderGrid(masterData);

    } catch (error) {

        console.log("Error loading issues:", error);

    }

    showSpinner(false);

}



/* -------------------------
RENDER ISSUE CARDS
Creates cards inside the grid
-------------------------*/
function renderGrid(issues) {

    const grid = document.getElementById("issues-grid");
    const counter = document.getElementById("count-display");

    grid.innerHTML = "";
    counter.innerText = issues.length;


    issues.forEach(issue => {

        // choose color depending on status
        const borderStyle =
            issue.status === "open"
                ? "border-[#22c55e]"
                : "border-[#a855f7]";


        const card = document.createElement("div");

        card.className =
            `bg-white p-5 rounded-lg shadow-sm border-t-4 ${borderStyle}
             cursor-pointer hover:shadow-md transition-all flex flex-col h-full`;


        card.onclick = () => openIssueDetails(issue.id);


        // build label tags
        const labelsHTML = issue.labels.map(label => {

            let colorClasses = "bg-gray-100 text-gray-500";

           if (label.toLowerCase() === "bug")
                colorClasses = "bg-[#FFFBEB] text-[#FBBF24]";

            if (label.toLowerCase() === "help wanted")
                colorClasses = "bg-[#FFFBEB] text-[#FBBF24]";
            if (label.toLowerCase() === "enhancement")
                colorClasses = "bg-[#FFFBEB] text-[#FBBF24]";
            if (label.toLowerCase() === "good first issue")
                colorClasses = "bg-[#FFFBEB] text-[#FBBF24]";
            if (label.toLowerCase() === "documentation")
                colorClasses = "bg-[#FFFBEB] text-[#FBBF24]";


            return `
            <span class="${colorClasses} px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                <i class="fas fa-tag text-[8px]"></i>
                ${label}
            </span>
            `;

        }).join("");



        card.innerHTML = `

        <div class="flex justify-between items-start mb-4">

            <i class="far fa-check-circle
            ${issue.status === "open" ? "text-green-500" : "text-purple-500"}">
            </i>

            <span class="bg-red-50 text-red-500 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase">
                ${issue.priority}
            </span>

        </div>


        <h3 class="font-bold text-sm text-gray-800 mb-2 line-clamp-2">
            ${issue.title}
        </h3>


        <p class="text-xs text-gray-400 line-clamp-3 mb-6 flex-grow">
            ${issue.description}
        </p>


        <div class="flex flex-wrap gap-2 mb-6">
            ${labelsHTML}
        </div>


        <div class="flex justify-between text-[10px] text-gray-400 border-t pt-3">

            <span>#${issue.id} by ${issue.author}</span>

            <span>${new Date(issue.createdAt).toLocaleDateString()}</span>

        </div>

        `;


        grid.appendChild(card);

    });

}



/* -------------------------
SEARCH ISSUES and
Uses API search endpoint
-------------------------*/
async function executeSearch() {

    const query = document.getElementById("search-box").value;

    if (!query.trim()) {

        renderGrid(masterData);
        return;

    }

    showSpinner(true);

    try {

        const response =
            await fetch(`${API_URL}/issues/search?q=${query}`);

        const result = await response.json();

        renderGrid(result.data);

    } catch (error) {

        console.log("Search error:", error);

    }

    showSpinner(false);

}



/* -------------------------
FILTER BUTTONS or
Show open / closed / all
-------------------------*/
function updateFilter(type, btn) {

    document.querySelectorAll(".tab-btn").forEach(b => {

        b.className = "tab-btn btn btn-sm filter-btn";

    });

    btn.className = "tab-btn btn btn-sm filter-active";


    if (type === "all") {

        renderGrid(masterData);

    } else {

        const filtered =
            masterData.filter(issue => issue.status === type);

        renderGrid(filtered);

    }

}



/* -------------------------
OPEN ISSUE DETAILS and
Loads single issue
-------------------------*/
async function openIssueDetails(id) {

    try {

        const response = await fetch(`${API_URL}/issue/${id}`);
        const result = await response.json();

        const issue = result.data;

        const modal = document.getElementById("modal-content");


        modal.innerHTML = `

        <div class="p-8">

            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                ${issue.title}
            </h2>

            <div class="flex items-center gap-3 text-xs mb-6">

                <span class="bg-green-600 text-white px-3 py-1 rounded-full uppercase font-bold">
                    ${issue.status}
                </span>

                <span class="text-gray-400">

                    Opened by
                    <span class="text-gray-600 font-medium">
                        ${issue.author}
                    </span>

                    • ${new Date(issue.createdAt).toLocaleDateString()}

                </span>

            </div>


            <div class="flex gap-2 mb-8">

            ${issue.labels.map(label => `
                <span class="px-3 py-1 border border-blue-100 bg-blue-50 text-blue-500 text-[10px] rounded-full font-bold uppercase">
                    ${label}
                </span>
            `).join("")}

            </div>


            <p class="text-gray-600 mb-10 leading-relaxed">
                ${issue.description}
            </p>


            <div class="grid grid-cols-2 gap-8 border-t pt-8">

                <div>
                    <p class="text-xs text-gray-400 mb-1">Assignee:</p>
                    <p class="font-bold text-gray-800">
                        ${issue.assignee || "Unassigned"}
                    </p>
                </div>


                <div>
                    <p class="text-xs text-gray-400 mb-1">Priority:</p>

                    <span class="bg-amber-500 text-white px-4 py-1 rounded text-xs font-bold uppercase">
                        ${issue.priority}
                    </span>

                </div>

            </div>

        </div>

        `;


        document.getElementById("issue-detail-modal").showModal();

    } catch (error) {

        console.error("Failed to load issue:", error);

    }

}



/* -------------------------
LOADER
Show / hide spinner
-------------------------*/
function showSpinner(show) {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.classList.toggle("hidden", !show);

    }

}