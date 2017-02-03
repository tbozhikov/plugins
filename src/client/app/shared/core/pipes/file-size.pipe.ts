import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  transform(bytes: any, args?: any[]) {
    var byteString = '0 Bytes';
    if (!bytes || bytes === 0) {
      return byteString;
    }
    switch (true) {
      case bytes < Math.pow(2, 10):
        byteString = bytes + ' Bytes';
        break;
      case bytes >= Math.pow(2, 10) && bytes < Math.pow(2, 20):
        byteString = Math.round(bytes / Math.pow(2, 10)) + ' KB';
        break;
      case bytes >= Math.pow(2, 20) && bytes < Math.pow(2, 30):
        byteString = Math.round((bytes / Math.pow(2, 20)) * 10) / 10 + ' MB';
        break;
      case bytes > Math.pow(2, 30):
        byteString = Math.round((bytes / Math.pow(2, 30)) * 100) / 100 + ' GB';
    }
    return byteString;
  }
}
