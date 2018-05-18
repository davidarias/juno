import fs from 'fs';
import path from 'path';

function saveFile(path, content, callback){
    fs.writeFile(path, content, function(err){
        callback(err,path);
    });
}

export default saveFile;
