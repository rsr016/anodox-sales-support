import Papa from 'papaparse';

export const parseCSV = async (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};