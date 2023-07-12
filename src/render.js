const loadingScreen = document.getElementById("loadingScreen");
const content = document.getElementById("content");
const myfile = document.getElementById("myfile");
const submit = document.getElementById("btnn");

const { promisify } = require("util");
const PDFDocument = require("pdfkit");
const imgSize = promisify(require("image-size"));
const fs = require("fs");
const { remote } = require("electron");
const { dialog, app } = remote;

let selectedFiles = [];
let imageDimensions = [];

myfile.onchange = () => {
  selectedFiles = myfile.files;
  console.log(selectedFiles);
  for (let i = 0; i < selectedFiles.length; i++) {
    imgSize(selectedFiles[i].path)
      .then((dimensions) => {
        console.log(dimensions.width, dimensions.height);
        imageDimensions.push([dimensions.width, dimensions.height]);
      })
      .catch((err) => console.error(err));
  }

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

  await dialog
    .showSaveDialog({
      filters: [
        {
          name: "PDF Document",
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
