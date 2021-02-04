const imageUpload = document.getElementById("imageUpload");

Promise.all([
  // recognize the faces
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  // Detect where the actual faces are
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  // determine which one of faces
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(start);

async function start() {
  document.body.append("Loaded");

  const container = document.createElement("div");
  container.style.position = "relative";

  document.body.append(container);

  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

  imageUpload.addEventListener("change", async () => {
    const image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);

    const canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);
    });
  });
}

function loadLabeledImages() {
  const labels = ["Kadek Pradnyana", "Candra Pertiwi"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 1; i++) {
        const image = await faceapi.fetchImage(
          `http://127.0.0.1:5500/labeled_images/${labels}/${i}.jpg`
        );
        const detections = await faceapi
          .detectSingleFace(image)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
