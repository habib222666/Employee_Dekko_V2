const SUPABASE_URL = "https://jborzgwqlinwkeiquivy.supabase.co";
const SUPABASE_KEY = "sb_publishable_W_h2UbIqWWJNGZfRnJSojg_JCpHW7qN";


/* =========================
   ELEMENTS
========================= */

const employeeList = document.getElementById("employeeList");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const resultCount = document.getElementById("resultCount");
const departmentSection = document.getElementById("departmentSection");
const departmentCards = document.getElementById("departmentCards");
const allDepartmentsButton = document.getElementById("allDepartmentsButton");
const allEmployeesButton = document.getElementById("allEmployeesButton");
const favoriteEmployeesButton = document.getElementById("favoriteEmployeesButton");
const departmentPage = document.getElementById("departmentPage");
const departmentPageTitle = document.getElementById("departmentPageTitle");
const departmentEmployeeList = document.getElementById("departmentEmployeeList");
const departmentBackButton = document.getElementById("departmentBackButton");
const favoritePage = document.getElementById("favoritePage");
const favoriteEmployeeList = document.getElementById("favoriteEmployeeList");
const favoriteBackButton = document.getElementById("favoriteBackButton");
const birthdayButton = document.getElementById("birthdayButton");
const birthdayPage = document.getElementById("birthdayPage");
const birthdayBackButton = document.getElementById("birthdayBackButton");
const birthdayEmployeeList = document.getElementById("birthdayEmployeeList");
const birthdayMonths = document.getElementById("birthdayMonths");

let favoriteEmployees = JSON.parse(
    localStorage.getItem("favoriteEmployees") || "[]"
);

function isFavorite(employee) {
    return favoriteEmployees.includes(
        String(employee.employee_no)
    );
}

async function toggleFavorite(employee) {

    const employeeNo = String(employee.employee_no);
    const newFavorite = !isFavorite(employee);

    if (newFavorite) {
        favoriteEmployees.push(employeeNo);
    } else {
        favoriteEmployees =
            favoriteEmployees.filter(
                id => id !== employeeNo
            );
    }

    localStorage.setItem(
        "favoriteEmployees",
        JSON.stringify(favoriteEmployees)
    );

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/employee_dekko_v2?employee_no=eq.${encodeURIComponent(employeeNo)}`,
            {
                method: "PATCH",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({
                    favorite: newFavorite
                })
            }
        );

        if (!response.ok) {
            console.error(
                "Failed to sync favorite:",
                await response.text()
            );
        }
    } catch (error) {
        console.error("Favorite sync error:", error);
    }
}


departmentBackButton.addEventListener("click", function() {

    departmentPage.style.display = "none";

    listPage.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});



const listPage = document.getElementById("listPage");
const detailsPage = document.getElementById("detailsPage");
const employeeDetails = document.getElementById("employeeDetails");
const backButton = document.getElementById("backButton");

const adminButton = document.getElementById("adminButton");

const loginPage = document.getElementById("loginPage");
const loginBackButton = document.getElementById("loginBackButton");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const loginButton = document.getElementById("loginButton");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const resetPasswordPage = document.getElementById("resetPasswordPage");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const updatePasswordButton = document.getElementById("updatePasswordButton");
const resetStatus = document.getElementById("resetStatus");
const loginStatus = document.getElementById("loginStatus");

const adminPage = document.getElementById("adminPage");
const adminBackButton = document.getElementById("adminBackButton");
const logoutButton = document.getElementById("logoutButton");

const employeeSelect = document.getElementById("employeeSelect");
const photoInput = document.getElementById("photoInput");
const uploadPhotoButton = document.getElementById("uploadPhotoButton");
const uploadStatus = document.getElementById("uploadStatus");


let employees = [];


/* =========================
   SUPABASE AUTH
========================= */

let accessToken = null;

const hashParams = new URLSearchParams(
    window.location.hash.substring(1)
);

if (hashParams.get("access_token")) {

    accessToken = hashParams.get("access_token");

    listPage.style.display = "none";
    detailsPage.style.display = "none";
    loginPage.style.display = "none";
    adminPage.style.display = "none";
    resetPasswordPage.style.display = "block";
}



/* =========================
   LOAD EMPLOYEES
========================= */

async function loadEmployees() {

    employeeList.innerHTML =
        "<p>Loading employees...</p>";

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/employee_dekko_v2?select=*`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                "Supabase error: " + response.status
            );

        }


        employees = await response.json();

        // Load favorite status from Supabase
        favoriteEmployees = employees
            .filter(employee => employee.favorite === true)
            .map(employee => String(employee.employee_no));

        localStorage.setItem(
            "favoriteEmployees",
            JSON.stringify(favoriteEmployees)
        );


        showDepartmentCards();

        showEmployees(employees);

        loadEmployeeSelect();


    } catch (error) {

        console.error(error);


        employeeList.innerHTML =
            "<p>Employee data load হয়নি।</p>";


        resultCount.textContent = "";

    }

}


/* =========================
   INITIALS
========================= */

function getInitials(name) {

    if (!name) {

        return "E";

    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[1].charAt(0)
    ).toUpperCase();

}


/* =========================
   PHOTO URL
========================= */

function getPhoto(employee) {

    if (employee.photo_path) {

        const photoId =
            "photo_" + employee.employee_no + "_" +
            Math.random().toString(36).substring(2, 8);

        const photoUrl =
            `${SUPABASE_URL}/storage/v1/object/employee-photos/${employee.photo_path}`;

        setTimeout(async () => {

            try {

                const response = await fetch(photoUrl, {
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": "Bearer " + SUPABASE_KEY
                    }
                });

                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }

                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);

                const img = document.getElementById(photoId);

                if (img) {
                    img.src = imageUrl;
                }

            } catch (error) {

                console.error(
                    "Photo loading failed:",
                    employee.employee_no,
                    error
                );

                const img = document.getElementById(photoId);

                if (img) {
                    img.style.display = "none";

                    if (img.nextElementSibling) {
                        img.nextElementSibling.style.display = "flex";
                    }
                }
            }

        }, 0);

        return `
            <img
                id="${photoId}"
                src=""
                class="employee-photo"
                alt="${employee.employee_name || "Employee"}"
            >
            <div
                class="employee-photo-placeholder"
                style="display:none;"
            >
                No Photo
            </div>
        `;
    }

    return `
        <div class="employee-photo-placeholder">
            No Photo
        </div>
    `;
}

function showDepartmentCards() {

    departmentCards.innerHTML = "";

    const departments = {};

    employees.forEach((employee) => {

        const department =
            (employee.department || "Other").trim();

        if (!departments[department]) {
            departments[department] = [];
        }

        departments[department].push(employee);
    });

    const departmentNames =
        Object.keys(departments).sort((a, b) =>
            a.localeCompare(b)
        );

    departmentNames.forEach((department, index) => {

        const card =
            document.createElement("button");

        card.type = "button";
        card.className =
            "department-card department-color-" +
            ((index % 30) + 1);

        card.innerHTML = `
            <span class="department-name">
                ${department}
            </span>
            <span class="department-count">
                ${departments[department].length} Employees
            </span>
        `;

        card.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();

            searchInput.value = "";

            departmentPageTitle.textContent = department;
            departmentEmployeeList.innerHTML = "";

            const selectedEmployees = departments[department];

            selectedEmployees.forEach((employee) => {
                const div = document.createElement("div");
                div.className = "employee-card";

                div.innerHTML = `
                    <div class="employee-card-top">
                        ${getPhoto(employee)}
                        <div class="employee-card-info">
                            <h3>${employee.employee_name || "-"}</h3>
                            <p>${employee.designation || "-"}</p>
                            <span>${employee.employee_no || "-"}</span>
                        </div>
                    </div>
                    <div class="employee-card-actions">

                        <button class="favorite-button" type="button">
                            ${isFavorite(employee) ? "❤️" : "♡"}
                        </button>

                        <button class="view-button" type="button">
                            View Details
                        </button>

                    </div>
                `;

                div.querySelector(".view-button").addEventListener(
                    "click",
                    function() {
                        showDetails(employee, "department");
                    }
                );

                div.querySelector(".favorite-button")
                    .addEventListener(
                        "click",
                        function() {
                            toggleFavorite(employee);
                            this.textContent =
                                isFavorite(employee) ? "❤️" : "♡";
                        }
                    );

                departmentEmployeeList.appendChild(div);
            });

            listPage.style.display = "none";
            departmentPage.style.display = "block";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        };

        departmentCards.appendChild(card);
    });

    departmentSection.style.display =
        departmentNames.length ? "block" : "none";
}

function showFavoriteEmployees() {

    favoriteEmployeeList.innerHTML = "";

    const favorites = employees.filter(function(employee) {
        return isFavorite(employee);
    });

    if (favorites.length === 0) {
        favoriteEmployeeList.innerHTML =
            "<p>No favorite employees found.</p>";
        return;
    }

    favorites.forEach(function(employee) {

        const div = document.createElement("div");

        div.className = "employee-card";

        div.innerHTML = `
            <div class="employee-card-top">
                ${getPhoto(employee)}
                <div class="employee-card-info">
                    <h3>${employee.employee_name || "-"}</h3>
                    <p>${employee.designation || "-"}</p>
                    <span>${employee.employee_no || "-"}</span>
                </div>
            </div>

            <div class="employee-card-actions">

                <button class="favorite-button" type="button">
                    ❤️
                </button>

                <button class="view-button" type="button">
                    View Details
                </button>

            </div>
        `;

        div.querySelector(".favorite-button")
            .addEventListener(
                "click",
                function() {
                    toggleFavorite(employee);
                    showFavoriteEmployees();
                }
            );

        div.querySelector(".view-button")
            .addEventListener(
                "click",
                function() {
                    showDetails(employee, "favorite");
                }
            );

        favoriteEmployeeList.appendChild(div);
    });
}


function showEmployees(list) {

    employeeList.innerHTML = "";


    resultCount.textContent =
        `${list.length} employee${list.length === 1 ? "" : "s"} found`;


    if (list.length === 0) {

        employeeList.innerHTML =
            "<p>No employees found.</p>";

        return;

    }


    list.forEach((employee) => {

        const div =
            document.createElement("div");


        div.className =
            "employee-card";


        div.innerHTML = `

            <div class="employee-card-top">

                ${getPhoto(employee)}

                <div class="employee-card-info">

                    <h3>
                        ${employee.employee_name || "-"}
                    </h3>

                    <p>
                        ${employee.designation || "-"}
                    </p>

                    <span>
                        ${employee.employee_no || "-"}
                    </span>

                </div>

            </div>


            <div class="employee-card-actions">

                <button class="favorite-button" type="button">

                    ${isFavorite(employee) ? "❤️" : "♡"}

                </button>

                <button class="view-button" type="button">

                    View Details

                </button>

            </div>

        `;


        div.querySelector(".view-button")
            .addEventListener(
                "click",
                function() {

                    showDetails(employee, "allEmployees");

                }
            );


        div.querySelector(".favorite-button")
            .addEventListener(
                "click",
                function() {
                    toggleFavorite(employee);
                    this.textContent =
                        isFavorite(employee) ? "❤️" : "♡";
                }
            );

        employeeList.appendChild(div);

    });

}


/* =========================
   EMPLOYEE DETAILS
========================= */

let detailsPreviousPage = "list";

function showDetails(employee, previousPage = "list") {

    detailsPreviousPage = previousPage;

    listPage.style.display =
        "none";

    departmentPage.style.display =
        "none";

    favoritePage.style.display =
        "none";


    detailsPage.style.display =
        "block";


    employeeDetails.innerHTML = `

        <div class="profile-card">

            <div class="profile-photo">

                ${getPhoto(employee)}

            </div>


            <h2>

                ${employee.employee_name || "-"}

            </h2>


            <p class="profile-designation">

                ${employee.designation || "-"}

            </p>


            <p class="profile-company">

                ${employee.company || "-"}

            </p>

        </div>


        <div class="details-card">

            <div class="detail-row">
                <span>
                    Employee ID
                </span>
                <strong>
                    ${employee.employee_no || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    Department
                </span>
                <strong>
                    ${employee.department || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    Official No.
                </span>
                <strong>
                    ${employee.phone_official || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    Personal No.
                </span>
                <strong>
                    ${employee.personal_no || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    Email Address
                </span>
                <strong>
                    ${employee.email_official || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    PABX No.
                </span>
                <strong>
                    ${employee.pabx_number || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    Blood Group
                </span>
                <strong>
                    ${employee.blood_group || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    Joining Date
                </span>
                <strong>
                    ${employee.joining_date || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    Date of Birth
                </span>
                <strong>
                    ${employee.date_of_birth || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    NID No.
                </span>
                <strong>
                    ${employee.nid || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    TIN No.
                </span>
                <strong>
                    ${employee.tin_no || "-"}
                </strong>
            </div>

            <div class="detail-row">
                <span>
                    QR Code
                </span>
                <strong>
                    <div id="employeeQRCode"></div>
                </strong>
            </div>

        </div>

    `;


    const qrContainer = document.getElementById("employeeQRCode");

    if (qrContainer && employee.employee_no) {
        const qrUrl =
            "https://www.dekkolegacy.com/employees/" +
            encodeURIComponent(employee.employee_no);

        const img = document.createElement("img");
        img.src =
            "https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=" +
            encodeURIComponent(qrUrl);
        img.width = 130;
        img.height = 130;
        img.alt = "QR Code";

        qrContainer.innerHTML = "";
        qrContainer.appendChild(img);
    }
}


/* =========================
   EMPLOYEE SELECT
========================= */

function loadEmployeeSelect() {

    employeeSelect.innerHTML = `
        <option value="">
            Select employee
        </option>
    `;


    employees.forEach((employee) => {

        const option =
            document.createElement("option");


        option.value =
            employee.employee_no;


        option.textContent =
            `${employee.employee_no} - ${employee.employee_name}`;


        employeeSelect.appendChild(option);

    });

}


/* =========================
   ADMIN BUTTON
========================= */

adminButton.addEventListener(
    "click",
    function() {

        listPage.style.display =
            "none";


        detailsPage.style.display =
            "none";


        loginPage.style.display =
            "block";


        loginStatus.textContent = "";

    }
);


/* =========================
   LOGIN BACK
========================= */

loginBackButton.addEventListener(
    "click",
    function() {

        loginPage.style.display =
            "none";


        listPage.style.display =
            "block";

    }
);


/* =========================
   RESET PASSWORD
========================= */

updatePasswordButton.addEventListener(
    "click",
    async function() {

        const password = newPassword.value;
        const confirm = confirmPassword.value;

        if (!password || !confirm) {
            resetStatus.textContent =
                "Please enter both password fields.";
            return;
        }

        if (password !== confirm) {
            resetStatus.textContent =
                "Passwords do not match.";
            return;
        }

        resetStatus.textContent =
            "Updating password...";

        try {

            const response = await fetch(
                `${SUPABASE_URL}/auth/v1/user`,
                {
                    method: "PUT",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            "Bearer " + accessToken,
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.msg ||
                    data.error_description ||
                    "Password update failed."
                );
            }

            resetStatus.textContent =
                "Password updated successfully.";

            newPassword.value = "";
            confirmPassword.value = "";

        } catch (error) {

            console.error(error);

            resetStatus.textContent =
                error.message;
        }
    }
);


/* =========================
   FORGOT PASSWORD
========================= */

forgotPasswordButton.addEventListener(
    "click",
    async function() {

        const email = adminEmail.value.trim();

        if (!email) {
            loginStatus.textContent =
                "Please enter your admin email first.";
            return;
        }

        loginStatus.textContent =
            "Sending password reset email...";

        try {

            const response = await fetch(
                `${SUPABASE_URL}/auth/v1/recover`,
                {
                    method: "POST",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        redirect_to: window.location.origin +
                            window.location.pathname
                    })
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.msg ||
                    data.error_description ||
                    "Password reset failed."
                );
            }

            loginStatus.textContent =
                "Password reset email sent. Check your email.";

        } catch (error) {

            console.error(error);

            loginStatus.textContent =
                error.message;
        }
    }
);


/* =========================
   ADMIN LOGIN
========================= */

loginButton.addEventListener(
    "click",
    async function() {

        const email =
            adminEmail.value.trim();


        const password =
            adminPassword.value;


        if (!email) {

            loginStatus.textContent =
                "Please enter email.";

            return;

        }


        if (!password) {

            loginStatus.textContent =
                "Please enter password.";

            return;

        }


        loginStatus.textContent =
            "Logging in...";


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
                    {
                        method: "POST",

                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error_description ||
                    data.msg ||
                    "Login failed."
                );

            }


            accessToken =
                data.access_token;


            loginStatus.textContent =
                "Login successful!";


            adminEmail.value = "";

            adminPassword.value = "";


            loginPage.style.display =
                "none";


            adminPage.style.display =
                "block";


            uploadStatus.textContent = "";


        } catch (error) {

            console.error(error);


            loginStatus.textContent =
                "Login failed: " +
                error.message;

        }

    }
);


/* =========================
   ADMIN BACK
========================= */

adminBackButton.addEventListener(
    "click",
    function() {

        adminPage.style.display =
            "none";


        listPage.style.display =
            "block";


        uploadStatus.textContent =
            "";

    }
);


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    function() {

        accessToken = null;


        adminPage.style.display =
            "none";


        listPage.style.display =
            "block";


        uploadStatus.textContent =
            "";

    }
);


/* =========================
   PHOTO UPLOAD
========================= */

uploadPhotoButton.addEventListener(
    "click",
    async function() {

        if (!accessToken) {

            uploadStatus.textContent =
                "Please login first.";

            return;

        }


        const employeeNo =
            employeeSelect.value;


        const file =
            photoInput.files[0];


        if (!employeeNo) {

            uploadStatus.textContent =
                "Please select an employee.";

            return;

        }


        if (!file) {

            uploadStatus.textContent =
                "Please select a photo.";

            return;

        }


        const employee =
            employees.find(
                e =>
                    e.employee_no === employeeNo
            );


        if (!employee) {

            uploadStatus.textContent =
                "Employee not found.";

            return;

        }


        uploadStatus.textContent =
            "Uploading photo...";


        try {

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                `${employeeNo}.${extension}`;


            const uploadResponse =
                await fetch(
                    `${SUPABASE_URL}/storage/v1/object/employee-photos/${fileName}`,
                    {
                        method: "POST",

                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${accessToken}`,
                            "Content-Type": file.type
                        },

                        body: file
                    }
                );


            if (!uploadResponse.ok) {

                const errorText =
                    await uploadResponse.text();


                throw new Error(
                    errorText
                );

            }


            const updateResponse =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/employee_dekko_v2?employee_no=eq.${encodeURIComponent(employeeNo)}`,
                    {
                        method: "PATCH",

                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                            "Prefer": "return=minimal"
                        },

                        body: JSON.stringify({
                            photo_path: fileName
                        })
                    }
                );


            if (!updateResponse.ok) {

                throw new Error(
                    "Photo uploaded but database update failed."
                );

            }


            uploadStatus.textContent =
                "Photo uploaded successfully!";


            photoInput.value = "";


            await loadEmployees();


        } catch (error) {

            console.error(error);


            uploadStatus.textContent =
                "Upload failed: " +
                error.message;

        }

    }
);


/* =========================
   BACK BUTTON
========================= */

backButton.addEventListener(

    "click",

    function() {

        detailsPage.style.display =
            "none";

        if (detailsPreviousPage === "favorite") {

            listPage.style.display =
                "none";

            departmentPage.style.display =
                "none";

            favoritePage.style.display =
                "block";

            showFavoriteEmployees();

        } else if (detailsPreviousPage === "department") {

            listPage.style.display =
                "none";

            favoritePage.style.display =
                "none";

            departmentPage.style.display =
                "block";

        } else {

            favoritePage.style.display =
                "none";

            departmentPage.style.display =
                "none";

            listPage.style.display =
                "block";

            departmentSection.style.display =
                "block";

            employeeList.style.display =
                "block";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

);


/* =========================
   ALL DEPARTMENTS
========================= */

allDepartmentsButton.addEventListener(
    "click",
    function() {

        favoritePage.style.display = "none";
        departmentPage.style.display = "none";
        listPage.style.display = "block";

        departmentSection.style.display = "block";
        employeeList.style.display = "none";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================
   FAVORITE EMPLOYEES
========================= */

favoriteEmployeesButton.addEventListener(
    "click",
    function() {

        showFavoriteEmployees();

        listPage.style.display = "none";
        departmentPage.style.display = "none";
        favoritePage.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


favoriteBackButton.addEventListener(
    "click",
    function() {

        favoritePage.style.display = "none";
        listPage.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================
   DEPARTMENT / ALL EMPLOYEES
========================= */

allEmployeesButton.addEventListener(
    "click",
    function() {

        searchInput.value = "";

        departmentPage.style.display = "none";
        favoritePage.style.display = "none";
        listPage.style.display = "block";
        departmentSection.style.display = "block";
        employeeList.style.display = "block";

        showEmployees(employees);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    function() {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        const filtered =
            employees.filter(
                employee =>

                    (employee.employee_name || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    (employee.employee_no || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    (employee.company || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    (employee.department || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    (employee.designation || "")
                        .toLowerCase()
                        .includes(searchText)

            );


        showEmployees(filtered);

    }
);


/* =========================
   CLEAR SEARCH
========================= */

clearSearch.addEventListener(
    "click",
    function() {

        searchInput.value = "";


        showEmployees(
            employees
        );


        searchInput.focus();

    }
);


/* =========================
   START APP
========================= */

loadEmployees();


/* =========================
   CREATE NEW USER
========================= */

document.addEventListener("DOMContentLoaded", function () {

    const createUserButton = document.getElementById("createUserButton");

    if (!createUserButton) return;

    createUserButton.addEventListener("click", async function () {

        const email = prompt("Enter new user email:");

        if (!email) return;

        const password = prompt("Enter password (minimum 6 characters):");

        if (!password) return;

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        createUserButton.disabled = true;
        createUserButton.textContent = "Creating...";

        try {

            const response = await fetch(
                `${SUPABASE_URL}/auth/v1/signup`,
                {
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log("Create User Response:", data);

            if (!response.ok) {
                throw new Error(
                    data.msg ||
                    data.message ||
                    data.error_description ||
                    "User creation failed"
                );
            }

            alert(
                "User created successfully!\n\n" +
                "Email: " + email
            );

        } catch (error) {

            console.error("Create User Error:", error);

            alert(
                "User creation failed:\n\n" +
                error.message
            );

        } finally {

            createUserButton.disabled = false;
            createUserButton.textContent = "Create New User";

        }

    });

});

/* =========================
   BIRTHDAY FEATURE
========================= */

function showBirthdayEmployees(month) {
    if (!birthdayEmployeeList) return;

    const monthNumber = String(month).padStart(2, "0");

    const birthdayEmployees = employees
        .filter(employee => {
            const birthday = String(employee.birthday || "").trim();
            return /^\d{1,2}-\d{1,2}$/.test(birthday) &&
                   birthday.split("-")[1].padStart(2, "0") === monthNumber;
        })
        .sort((a, b) => {
            const dayA = parseInt(String(a.birthday).split("-")[0], 10);
            const dayB = parseInt(String(b.birthday).split("-")[0], 10);
            return dayA - dayB;
        });

    if (birthdayEmployees.length === 0) {
        birthdayEmployeeList.innerHTML =
            '<p class="no-birthday">No birthdays in this month.</p>';
        return;
    }

    birthdayEmployeeList.innerHTML = `
        <div class="birthday-table-wrapper">
            <table class="birthday-table">
                <thead>
                    <tr>
                        <th>Sl.</th>
                        <th>Emp. Name</th>
                        <th>Designation</th>
                        <th>Birthday Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${birthdayEmployees.map((employee, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${employee.name || employee.employee_name || ""}</td>
                            <td>${employee.designation || ""}</td>
                            <td>${employee.birthday || ""}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function openBirthdayPage() {
    departmentSection.style.display = "none";
    employeeList.style.display = "none";
    departmentPage.style.display = "none";
    favoritePage.style.display = "none";
    detailsPage.style.display = "none";
    birthdayPage.style.display = "block";

    birthdayEmployeeList.innerHTML =
        '<p class="birthday-instruction">Select a month to view birthdays.</p>';
}

if (birthdayButton) {
    birthdayButton.addEventListener("click", openBirthdayPage);
}

if (birthdayBackButton) {
    birthdayBackButton.addEventListener("click", () => {
        birthdayPage.style.display = "none";
        departmentSection.style.display = "block";
        employeeList.style.display = "block";
    });
}

if (birthdayMonths) {
    birthdayMonths.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
            birthdayMonths.querySelectorAll("button").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            showBirthdayEmployees(button.dataset.month);
        });
    });
}
