
const sharp = require('sharp');


export default function CompressImage(filePath) {
    sharp(filePath)
      .identify()
      .then(info => {
        const format = info.format;
        const outputPath = filePath.replace(/\.[^.]+$/, `.${format.toLowerCase()}`);
  
        if (format === 'JPEG') {
          sharp(filePath)
            .quality(80) // تنظیم کیفیت برای JPG
            .toFile(outputPath);
        } else if (format === 'PNG') {
          sharp(filePath)
            .quality(80) // تنظیم کیفیت برای PNG
            .toFile(outputPath);
        } else {
          console.error(`فرمت تصویر ${filePath} پشتیبانی نمی شود: ${format}`);
        }
      })
      .catch(err => {
        console.error(`خطا در فشرده سازی تصویر ${filePath}: ${err.message}`);
      });
  }


  