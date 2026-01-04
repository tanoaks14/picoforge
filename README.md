# PicoForge

Welcome to PicoForge!

PicoForge is a friendly, browser-based tool designed to make programming the Raspberry Pi Pico (RP2040) accessible and fun. We wanted to bridge the gap between simple visual tools and professional development, so we built a platform where you can drag and drop your logic and instantly get valid, compiled C++ code.

Use it to sketch out ideas, learn how the hardware works, or build full projects without ever installing a compiler on your machine.

---

## What can you do?

**Build Visually**
You don't need to memorize syntax. Just drag blocks for things like GPIO, SPI, I2C, and more. Connect them together to define how your Pico should behave.

**See Your System**
As you build, PicoForge draws a diagram of your system architecture. It helps you visualize how everything connects, making it easier to spot issues before you even build.

**Compile Immediately**
We handle the heavy lifting. The backend runs a dedicated build environment that compiles your specific setup into a `.uf2` file. No toolchains to install, no path configuration headaches.

**Learn Real C++**
We don't hide the code. PicoForge generates clean, readable C++ code that uses the native Pico SDK. It's a great way to learn by seeing exactly how your visual blocks translate into real implementation.

---

## How it works

PicoForge keeps things clean by separating the visual interface from the compilation work.

1.  **You design** the logic in your browser.
2.  **We generate** the C++ code and CMake files for you.
3.  **We compile** it using a standardized, containerized environment.
4.  **You download** the ready-to-run firmware and drop it on your Pico.

---

## Project Structure

If you want to poke around the code, here is where everything lives:

*   `web/frontend`: The React application you see in the browser. It handles the block building and validation.
*   `web/backend`: The Node.js service that manages your projects and orchestrates the builds.
*   `docker`: The definitions for our build environments.
*   `workspace`: Where your project files and build artifacts are stored.

---

## Getting Started

You will need **Docker Desktop** and **Git** installed on your machine.

1.  **Get the code**
    Clone the repository to your local machine.

2.  **Start the app**
    Run `docker-compose up -d --build`. This might take a moment the first time as it prepares the build environment.

3.  **Start creating**
    Open your browser to `http://localhost:8080`.

### A Quick First Project

Try making a simple clear LED blinker:
1.  Click "New Project" and name it "Blinky".
2.  Grab a **GPIO SET** block and drop it in the Loop section.
3.  Set it to Pin 25 (the onboard LED) and set the level to HIGH.
4.  Add a **SLEEP** block for 500ms.
5.  Add another **GPIO SET** block to set Pin 25 to LOW.
6.  Add one last **SLEEP** block.
7.  Hit **Build**, waiting for the download, and drag the file to your Pico!

7.  [video.webm](https://github.com/user-attachments/assets/4075250f-adcc-471e-97f1-a37b0610b0b9)


---

## Contributing

We would love your help making PicoForge better. If you have ideas or fixes, please fork the repository and open a Pull Request.

## License

This project is open source and available under the MIT License.
