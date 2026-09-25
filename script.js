let port = null;
let connected = false;

const connectButton =
    document.getElementById("connectButton");

const runButton =
    document.getElementById("runButton");

const offButton =
    document.getElementById("offButton");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");

const boardState =
    document.getElementById("boardState");

const ledLight =
    document.getElementById("ledLight");

const consoleOutput =
    document.getElementById("consoleOutput");


// ------------------------------
// CONSOLE
// ------------------------------

function log(message, muted = false) {

    const line =
        document.createElement("div");

    line.className = "message";

    if (muted) {
        line.classList.add("muted");
        line.textContent = message;
    } else {
        line.innerHTML =
            `<i></i>${message}`;
    }

    consoleOutput.appendChild(line);

    consoleOutput.scrollTop =
        consoleOutput.scrollHeight;
}


// ------------------------------
// BROWSER SUPPORT
// ------------------------------

if (!("serial" in navigator)) {

    connectButton.disabled = true;

    log(
        "Web Serial is not available in this browser.",
        true
    );

}


// ------------------------------
// CONNECT
// ------------------------------

connectButton.addEventListener(
    "click",
    async () => {

        try {

            log("Opening USB device selector...");


            port =
                await navigator.serial.requestPort({
                    filters: [
                        {
                            usbVendorId: 0x2341
                        }
                    ]
                });


            const info =
                port.getInfo();


            log(
                "Arduino USB device detected."
            );


            await port.open({
                baudRate: 115200
            });


            connected = true;


            statusText.textContent =
                "Arduino Connected";

            statusDot.classList.add(
                "connected"
            );


            boardState.textContent =
                "Connected";


            connectButton.textContent =
                "Connected";

            connectButton.disabled =
                true;


            runButton.disabled =
                false;

            offButton.disabled =
                false;


            log(
                "UNO R4 WiFi connected."
            );


            if (info.usbVendorId) {

                log(
                    `USB Vendor: 0x${info.usbVendorId
                        .toString(16)
                        .toUpperCase()}`
                );

            }


        } catch (error) {

            console.error(error);

            log(
                "Could not connect: " +
                error.message
            );

        }

    }
);


// ------------------------------
// RUN
// ------------------------------

runButton.addEventListener(
    "click",
    async () => {

        if (!connected) {
            return;
        }


        /*
         * Prototype communication layer.
         *
         * The eventual LoWorks compiler/flasher
         * will replace this section.
         */

        const state =
            document.getElementById(
                "ledSelect"
            ).value;


        log(
            `LoWorks program: SET LED → ${state}`
        );


        if (state === "ON") {

            ledLight.classList.add("on");

            boardState.textContent =
                "LED ON";

        } else {

            ledLight.classList.remove("on");

            boardState.textContent =
                "LED OFF";

        }

    }
);


// ------------------------------
// TURN OFF
// ------------------------------

offButton.addEventListener(
    "click",
    () => {

        if (!connected) {
            return;
        }


        ledLight.classList.remove("on");

        boardState.textContent =
            "LED OFF";


        log(
            "LoWorks program: SET LED → OFF"
        );

    }
);


// ------------------------------
// CLEAR
// ------------------------------

document
    .getElementById("clearButton")
    .addEventListener(
        "click",
        () => {

            consoleOutput.innerHTML = "";

        }
    );


// ------------------------------
// USB DISCONNECT
// ------------------------------

if ("serial" in navigator) {

    navigator.serial.addEventListener(
        "disconnect",
        () => {

            connected = false;


            statusText.textContent =
                "Not Connected";

            statusDot.classList.remove(
                "connected"
            );


            boardState.textContent =
                "Waiting";


            connectButton.textContent =
                "Connect Arduino";

            connectButton.disabled =
                false;


            runButton.disabled =
                true;

            offButton.disabled =
                true;


            ledLight.classList.remove(
                "on"
            );


            log(
                "Arduino disconnected."
            );

        }
    );

}
