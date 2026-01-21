const fs = require('fs');

function generateMatrix(size, min = 1, max = 100) {
  const matrix = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    matrix.push(row);
  }
  return matrix;
}

const size = 100;
const data = {
  matrixA: {
    data: generateMatrix(size)
  },
  matrixB: {
    data: generateMatrix(size)
  }
};

const json = JSON.stringify(data, null, 2);
fs.writeFileSync('matrices-100x100.json', json, 'utf8');
const fileSizeMB = (json.length / 1024 / 1024).toFixed(2);
console.log('Матрицы 100x100 успешно созданы в файле matrices-100x100.json');
console.log(`Размер файла: ${fileSizeMB} МБ`);


