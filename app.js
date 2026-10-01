
// ======================================================
// FIREBASE IMPORTS
// ======================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
let map;
let marker;
let selectedLatitude = null;
let selectedLongitude = null;
function initializeMap() {
    const defaultLocation = {
        lat: 28.6139,
        lng: 77.2090
    };

    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 15
    });

    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true
    });

    selectedLatitude = defaultLocation.lat;
    selectedLongitude = defaultLocation.lng;

    marker.addListener("dragend", () => {
        const position = marker.getPosition();

        selectedLatitude = position.lat();
        selectedLongitude = position.lng();

        document.getElementById("locationMessage").textContent =
            `Selected location: ${selectedLatitude.toFixed(6)}, ${selectedLongitude.toFixed(6)}`;
    });
}
window.addEventListener("load", () => {
    initializeMap();
});
const useLocationButton = document.getElementById("useLocationButton");

useLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        document.getElementById("locationMessage").textContent =
            "Geolocation is not supported by this browser.";
        return;
    }

    document.getElementById("locationMessage").textContent =
        "Getting your location...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            selectedLatitude = position.coords.latitude;
            selectedLongitude = position.coords.longitude;

            const userLocation = {
                lat: selectedLatitude,
                lng: selectedLongitude
            };

            map.setCenter(userLocation);
            map.setZoom(17);

            marker.setPosition(userLocation);

            document.getElementById("location").value =
                `${selectedLatitude.toFixed(6)}, ${selectedLongitude.toFixed(6)}`;

            document.getElementById("locationMessage").textContent =
                `Location selected: ${selectedLatitude.toFixed(6)}, ${selectedLongitude.toFixed(6)}`;
        },
        (error) => {
            document.getElementById("locationMessage").textContent =
                "Unable to get your location. Please allow location permission.";
        }
    );
});

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ======================================================
// FIREBASE CONFIG
// ======================================================

// IMPORTANT:
// Replace these values with YOUR Firebase web configuration.

const firebaseConfig = {

    apiKey: "AIzaSyCmAY-JSuoU9m2EPbTKOyU7sGsIbu9UwTw",
  authDomain: "cleantrack-4498c.firebaseapp.com",
  projectId: "cleantrack-4498c",
  storageBucket: "cleantrack-4498c.firebasestorage.app",
  messagingSenderId: "656707267707",
  appId: "1:656707267707:web:8a57c8edd717da738cc6de",
  measurementId: "G-6VFGTXZC1T"

};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ======================================================
// GET HTML ELEMENTS
// ======================================================

// Navigation

const reportTab = document.getElementById("reportTab");

const adminTab = document.getElementById("adminTab");


// Pages

const reportPage = document.getElementById("reportPage");

const loginPage = document.getElementById("loginPage");

const adminPage = document.getElementById("adminPage");


// Report form

const reportForm = document.getElementById("reportForm");

const nameInput = document.getElementById("name");

const locationInput = document.getElementById("location");

const wasteTypeInput = document.getElementById("wasteType");

const photoInput = document.getElementById("photo");

const photoPreview = document.getElementById("photoPreview");

const descriptionInput = document.getElementById("description");

const submitReportButton =
    document.getElementById("submitReportButton");

const message =
    document.getElementById("message");


// Login

const loginForm =
    document.getElementById("loginForm");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const loginMessage =
    document.getElementById("loginMessage");


// Dashboard

const logoutButton =
    document.getElementById("logoutButton");

const reportsList =
    document.getElementById("reportsList");

const totalCount =
    document.getElementById("totalCount");

const pendingCount =
    document.getElementById("pendingCount");

const progressCount =
    document.getElementById("progressCount");

const resolvedCount =
    document.getElementById("resolvedCount");


// ======================================================
// VARIABLES
// ======================================================

let unsubscribeReports = null;


// ======================================================
// PAGE NAVIGATION
// ======================================================

function hideAllPages() {

    reportPage.classList.add("hidden");

    loginPage.classList.add("hidden");

    adminPage.classList.add("hidden");
}


// ======================================================
// REPORT TAB
// ======================================================

reportTab.addEventListener("click", function () {

    hideAllPages();

    reportPage.classList.remove("hidden");

    reportTab.classList.add("nav-active");

    adminTab.classList.remove("nav-active");

});


// ======================================================
// ADMIN TAB
// ======================================================

adminTab.addEventListener("click", function () {

    hideAllPages();

    adminTab.classList.add("nav-active");

    reportTab.classList.remove("nav-active");


    // If already logged in,
    // show dashboard.

    if (auth.currentUser) {

        adminPage.classList.remove("hidden");

    }

    // Otherwise show login.

    else {

        loginPage.classList.remove("hidden");

    }

});


// ======================================================
// PHOTO PREVIEW
// ======================================================

photoInput.addEventListener("change", function () {

    const file = photoInput.files[0];


    // No file selected

    if (!file) {

        photoPreview.src = "";

        photoPreview.classList.add("hidden");

        return;
    }


    // Check image

    if (!file.type.startsWith("image/")) {

        message.textContent =
            "Please select an image file.";

        photoInput.value = "";

        photoPreview.classList.add("hidden");

        return;
    }


    // Check file size

    if (file.size > 5 * 1024 * 1024) {

        message.textContent =
            "Photo must be smaller than 5 MB.";

        photoInput.value = "";

        photoPreview.classList.add("hidden");

        return;
    }


    // Preview image

    const reader = new FileReader();

    reader.onload = function (event) {

        photoPreview.src =
            event.target.result;

        photoPreview.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

});


// ======================================================
// SUBMIT WASTE REPORT
// ======================================================

reportForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Get values

    const name =
        nameInput.value.trim();

    const location =
        locationInput.value.trim();

    const wasteType =
        wasteTypeInput.value;

    const description =
        descriptionInput.value.trim();

    const photo =
        photoInput.files[0];


    // Validate

    if (!name) {

        message.textContent =
            "Please enter your name.";

        return;
    }


    if (!location) {

        message.textContent =
            "Please enter the location.";

        return;
    }


    if (!wasteType) {

        message.textContent =
            "Please select a waste type.";

        return;
    }


    // Disable button

    submitReportButton.disabled = true;

    submitReportButton.textContent =
        "Submitting...";


    try {

        // Save report to Firestore

        await addDoc(collection(db, "reports"), {
    name,
    location,
    latitude: selectedLatitude,
    longitude: selectedLongitude,
    wasteType,
    description,
    hasPhoto: Boolean(photo),
    status: "Pending",
    createdAt: serverTimestamp()
});


        // Success

        message.textContent =
            "Report submitted successfully!";

        message.style.color = "#2e7d32";


        // Reset form

        reportForm.reset();


        // Hide photo

        photoPreview.src = "";

        photoPreview.classList.add("hidden");


    } catch (error) {

        console.error(
            "Error submitting report:",
            error
        );

        message.textContent =
            "Could not submit report. Please try again.";

        message.style.color = "#dc2626";

    }


    // Enable button again

    submitReportButton.disabled = false;

    submitReportButton.textContent =
        "Submit Report";

});


// ======================================================
// ADMIN LOGIN
// ======================================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const email =
        adminEmail.value.trim();

    const password =
        adminPassword.value;


    if (!email || !password) {

        loginMessage.textContent =
            "Please enter email and password.";

        return;
    }


    loginMessage.textContent =
        "Logging in...";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        loginMessage.textContent =
            "Login successful!";

        loginMessage.style.color =
            "#2e7d32";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        loginMessage.style.color =
            "#dc2626";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            loginMessage.textContent =
                "Invalid email or password.";

        }

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            loginMessage.textContent =
                "Admin account not found.";

        }

        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            loginMessage.textContent =
                "Incorrect password.";

        }

        else {

            loginMessage.textContent =
                "Login failed. Check Firebase Authentication.";

        }

    }

});


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(
    auth,
    function (user) {

        if (user) {

            console.log(
                "Admin logged in:",
                user.email
            );


            // Start listening to reports

            startReportsListener();


            // If admin tab is active,
            // show dashboard.

            if (
                adminTab.classList.contains(
                    "nav-active"
                )
            ) {

                hideAllPages();

                adminPage.classList.remove(
                    "hidden"
                );

            }

        }

        else {

            console.log(
                "No admin logged in."
            );


            // Stop report listener

            stopReportsListener();


            // Show report page

            hideAllPages();

            reportPage.classList.remove(
                "hidden"
            );


            reportTab.classList.add(
                "nav-active"
            );

            adminTab.classList.remove(
                "nav-active"
            );

        }

    }
);


// ======================================================
// LOGOUT
// ======================================================

logoutButton.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


// ======================================================
// START REPORT LISTENER
// ======================================================

function startReportsListener() {


    // Prevent duplicate listeners

    if (unsubscribeReports) {

        unsubscribeReports();

        unsubscribeReports = null;

    }


    const reportsQuery = query(

        collection(db, "reports"),

        orderBy(
            "createdAt",
            "desc"
        )

    );


    unsubscribeReports =
        onSnapshot(

            reportsQuery,

            function (snapshot) {

                // No reports

                if (snapshot.empty) {

                    totalCount.textContent = "0";

                    pendingCount.textContent = "0";

                    progressCount.textContent = "0";

                    resolvedCount.textContent = "0";


                    reportsList.innerHTML =
                        '<p class="muted">No reports found.</p>';

                    return;
                }


                // Counters

                let total = 0;

                let pending = 0;

                let inProgress = 0;

                let resolved = 0;


                // Clear old reports

                reportsList.innerHTML = "";


                // Loop through reports

                snapshot.forEach(
                    function (reportDocument) {

                        const report =
                            reportDocument.data();


                        const reportId =
                            reportDocument.id;


                        total++;


                        // Count status

                        if (
                            report.status ===
                            "Pending"
                        ) {

                            pending++;

                        }

                        else if (
                            report.status ===
                            "In Progress"
                        ) {

                            inProgress++;

                        }

                        else if (
                            report.status ===
                            "Resolved"
                        ) {

                            resolved++;

                        }


                        // Create card

                        const card =
                            document.createElement(
                                "div"
                            );

                        card.className =
                            "report-card";


                        // Title

                        const title =
                            document.createElement(
                                "h3"
                            );

                        title.textContent =
                            report.wasteType ||
                            "Waste Report";


                        card.appendChild(title);


                        // Name

                        const name =
                            document.createElement(
                                "p"
                            );

                        name.innerHTML =
                            "<strong>Name:</strong> ";

                        name.appendChild(
                            document.createTextNode(
                                report.name ||
                                "Not provided"
                            )
                        );

                        card.appendChild(name);


                        // Location

                        const location =
                            document.createElement(
                                "p"
                            );

                        location.innerHTML =
                            "<strong>Location:</strong> ";

                        location.appendChild(
                            document.createTextNode(
                                report.location ||
                                "Not provided"
                            )
                        );

                        card.appendChild(
                            location
                        );


                        // Description

                        const description =
                            document.createElement(
                                "p"
                            );

                        description.innerHTML =
                            "<strong>Description:</strong> ";

                        description.appendChild(
                            document.createTextNode(
                                report.description ||
                                "No description"
                            )
                        );

                        card.appendChild(
                            description
                        );


                        // Photo information

                        if (report.hasPhoto) {

                            const photoInfo =
                                document.createElement(
                                    "p"
                                );

                            photoInfo.textContent =
                                "📷 Photo was attached during submission.";

                            card.appendChild(
                                photoInfo
                            );

                        }


                        // Status label

                        const statusLabel =
                            document.createElement(
                                "label"
                            );

                        statusLabel.textContent =
                            "Status";


                        card.appendChild(
                            statusLabel
                        );


                        // Status dropdown

                        const statusSelect =
                            document.createElement(
                                "select"
                            );


                        const statuses = [
                            "Pending",
                            "In Progress",
                            "Resolved"
                        ];


                        statuses.forEach(
                            function (status) {

                                const option =
                                    document.createElement(
                                        "option"
                                    );

                                option.value =
                                    status;

                                option.textContent =
                                    status;


                                if (
                                    report.status ===
                                    status
                                ) {

                                    option.selected =
                                        true;

                                }


                                statusSelect.appendChild(
                                    option
                                );

                            }
                        );


                        // Change status

                        statusSelect.addEventListener(
                            "change",
                            async function () {

                                try {

                                    await updateDoc(

                                        doc(
                                            db,
                                            "reports",
                                            reportId
                                        ),

                                        {
                                            status:
                                                statusSelect.value
                                        }

                                    );

                                }

                                catch (error) {

                                    console.error(
                                        "Status update error:",
                                        error
                                    );

                                    alert(
                                        "Could not update report status."
                                    );

                                }

                            }
                        );


                        card.appendChild(
                            statusSelect
                        );


                        // Add card

                        reportsList.appendChild(
                            card
                        );

                    }
                );


                // Update statistics

                totalCount.textContent =
                    total;

                pendingCount.textContent =
                    pending;

                progressCount.textContent =
                    inProgress;

                resolvedCount.textContent =
                    resolved;

            },

            function (error) {

                console.error(
                    "Firestore listener error:",
                    error
                );


                reportsList.innerHTML =
                    '<p class="muted">Could not load reports. Check your Firestore rules.</p>';

            }

        );

}


// ======================================================
// STOP REPORT LISTENER
// ======================================================

function stopReportsListener() {

    if (unsubscribeReports) {

        unsubscribeReports();

        unsubscribeReports = null;

    }

}


// ======================================================
// INITIAL PAGE
// ======================================================

hideAllPages();

reportPage.classList.remove("hidden");

reportTab.classList.add("nav-active");

adminTab.classList.remove("nav-active");
