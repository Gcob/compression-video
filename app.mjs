import ffmpeg from 'fluent-ffmpeg';
import glob from 'glob';
import path from 'path';
import fs from 'fs';

const inputFolder = config.inputFolder;
const outputFolder = `${inputFolder}${config.outputFolderSuffix}`;

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Fonction pour compresser une vidéo
function compressVideo(videoPath) {
  return new Promise((resolve, reject) => {
    const outputFilePath = path.join(outputFolder, path.basename(videoPath, path.extname(videoPath)) + '.min.mp4');

    ffmpeg(videoPath)
      .videoCodec('libx264')
      .size('1280x720')
      .outputOptions(['-crf 28', '-preset veryfast'])
      .on('end', () => {
        console.log(`Compression terminée : ${outputFilePath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Erreur : ${err.message}`);
        reject(err);
      })
      .save(outputFilePath);
  });
}

// Trouver toutes les vidéos dans le dossier et ses sous-dossiers
glob(`${inputFolder}/**/*.+(${config.videoFormats.join('|')})`, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  // Compresser les vidéos de manière asynchrone
  Promise.all(files.map(file => compressVideo(file)))
    .then(() => console.log('Toutes les vidéos ont été compressées.'))
    .catch(error => console.error(`Erreur lors de la compression : ${error}`));
});
