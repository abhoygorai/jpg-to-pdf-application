const loadingScreen = document.getElementById("loadingScreen");
const content = document.getElementById("content");
const myfile = document.getElementById("myfile");
const submit = document.getElementById("btnn");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const { remote } = require("electron");
const { dialog, app } = remote;

function showLoadingScreen() {
  loadingScreen.classList.remove("hidden");
  content.classList.add("hidden");
}

function hideLoadingScreen() {
  loadingScreen.classList.add("hidden");
  content.classList.remove("hidden");
}

let selectedFiles = [];
let imageDimensions = [];

myfile.onchange = () => {
  showLoadingScreen();
  selectedFiles = myfile.files;
  console.log(selectedFiles);

  for (let i = 0; i < selectedFiles.length; i++) {
    const selectedFile = selectedFiles[i];

    const reader = new FileReader();

    reader.onload = async function (event) {
      const imageElement = new Image();
      imageElement.onload = function () {
        const imageWidth = imageElement.naturalWidth;
        const imageHeight = imageElement.naturalHeight;

        imageDimensions[i] = [imageWidth, imageHeight];
        if (imageDimensions.length === selectedFiles.length) {
          console.log(imageDimensions);
        }
      };

      imageElement.src = event.target.result;
    };

    reader.readAsDataURL(selectedFile);
  }
  hideLoadingScreen();
};

submit.onclick = async function createPDF() {
  const doc = new PDFDocument({
    size: [imageDimensions[0][0], imageDimensions[0][1]],
    margins: {
      // by default, all are 72
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });
  doc.image(selectedFiles[0].path, {
    fit: [imageDimensions[0][0], imageDimensions[0][1]],
    align: "center",
    valign: "center",
  });

  for (let i = 1; i < selectedFiles.length; i++) {
    console.log(selectedFiles[i].path);

    doc.addPage({
      size: [imageDimensions[i][0], imageDimensions[i][1]],
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    });
    doc.image(selectedFiles[i].path, {
      fit: [imageDimensions[i][0], imageDimensions[i][1]],
      align: "center",
      valign: "center",
    });
  }

  //   const filepath = dialog.showOpenDialogSync({
  //     title: "Save PDF",
  //     buttonLabel: "Save PDF",
  //     defaultPath: "output.pdf",
  //   });

  await dialog
    .showSaveDialog({
      filters: [
        {
          name: "Adobe PDF",
          extensions: [".pdf"],
        },
      ],
      buttonLabel: "Save PDF",
      defaultPath: "zzzz.pdf",
    })
    .then((result) => {
      console.log(result.filePath);
      doc.pipe(fs.createWriteStream(result.filePath));
    });

  doc.end();
  // app.relaunch();
  // app.exit();
};
