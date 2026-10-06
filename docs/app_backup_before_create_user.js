const SUPABASE_URL = "https://jborzgwqlinwkeiquivy.supabase.co";
const SUPABASE_KEY = "sb_publishable_W_h2UbIqWWJNGZfRnJSojg_JCpHW7qN";


/* =========================
   ELEMENTS
========================= */

const employeeList = document.getElementById("employeeList");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const resultCount = document.getElementById("resultCount");

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
            `${SUPABASE_URL}/rest/v1/employee_dekko?select=*`,
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
            `${SUPABASE_URL}/storage/v1/object/employee-photo/${employee.photo_path}`;

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


            <button class="view-button">

                View Details

            </button>

        `;


        div.querySelector(".view-button")
            .addEventListener(
                "click",
                function() {

                    showDetails(employee);

                }
            );


        employeeList.appendChild(div);

    });

}


/* =========================
   EMPLOYEE DETAILS
========================= */

function showDetails(employee) {

    listPage.style.display =
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
            "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
            encodeURIComponent(qrUrl);
        img.width = 180;
        img.height = 180;
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
                    `${SUPABASE_URL}/storage/v1/object/employee-photo/${fileName}`,
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
                    `${SUPABASE_URL}/rest/v1/employee_dekko?employee_no=eq.${encodeURIComponent(employeeNo)}`,
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


        listPage.style.display =
            "block";

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

