
    // MD5 계산함수
    export const getMD5 = (blob, cbProgress) => {
        return new Promise((resolve, reject) => {
        var md5 = CryptoJS.algo.MD5.create();
        readChunked(blob, (chunk, offs, total) => {
            md5.update(CryptoJS.enc.Latin1.parse(chunk));
            if (cbProgress) {
            cbProgress(offs / total);
            }
        }, err => {
            if (err) {
            reject(err);
            } else {
            // TODO: Handle errors
            var hash = md5.finalize();
            var hashHex = hash.toString(CryptoJS.enc.Hex);
            resolve(hashHex);
            }
        });
        });
    }
    
    // 대용량 MD5 파일진행 관리 ( 4MB씩 나누어 관리 )
    export const readChunked = (file, chunkCallback, endCallback) => {
        var fileSize   = file.size;
        var chunkSize  = 4 * 1024 * 1024; // 4MB
        var offset     = 0;
        var reader = new FileReader();
        reader.onload = function() {
            if (reader.error) {
                endCallback(reader.error || {});
                return;
            }
            offset += reader.result.length;
            // callback for handling read chunk
            // TODO: handle errors
            chunkCallback(reader.result, offset, fileSize);
            if (offset >= fileSize) {
                endCallback(null);
                return;
            }
            readNext();
        };
    
        reader.onerror = function(err) {
            endCallback(err || {});
        };
    
        function readNext() {
            var fileSlice = file.slice(offset, offset + chunkSize);
            reader.readAsBinaryString(fileSlice);
        }
        readNext();
    }
    