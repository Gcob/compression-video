import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import config from './config.js';

const inputFolder = config.inputFolder;
const outputFolder = config.outputFolder;

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Fonction pour lister les fichiers récursivement
function listFilesRecursively(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      listFilesRecursively(filePath, extensions, fileList);
    } else {
      if (extensions.some(ext => file.endsWith(`.${ext}`))) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Fonction pour compresser une vidéo
function compressVideo(videoPath) {
  return new Promise((resolve, reject) => {
    const outputFilePath = path.join(outputFolder, path.basename(videoPath, path.extname(videoPath)) + '.min.mp4');

    ffmpeg(videoPath)
      .outputOptions([
        '-vf', 'scale=-2:720', // redimensionne la vidéo à une hauteur de 720px tout en conservant le ratio d'aspect
        '-crf 28', 
        '-preset veryfast'
      ])
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
const files = listFilesRecursively(inputFolder, config.videoFormats);
console.log("Fichiers à compresser:", files);

// Compresser les vidéos de manière asynchrone
Promise.all(files.map(file => compressVideo(file)))
  .then(() => console.log('Toutes les vidéos ont été compressées.'))
  .catch(error => console.error(`Erreur lors de la compression : ${error}`));
