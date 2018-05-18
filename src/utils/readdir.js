import fs from 'fs';
import path from 'path';

function diretoryTreeToObj(dir, done) {
    let results = [];

    fs.readdir(dir, function(err, list) {

        if (err) done(err);

        let pending = list.length;

        if (!pending) done(null, results);

        list.forEach(function(file) {

            let fullFileName = path.resolve(dir, file);

            fs.stat(fullFileName, function(err, stat) {

                if (stat && stat.isDirectory()) {

                    diretoryTreeToObj(fullFileName, (err, res) => {

                        if (err) done(err);

                        let { name, dir } = path.parse(fullFileName);

                        results.push({
                            label: name,
                            type: 'folder',
                            path: dir,
                            id: fullFileName,
                            children: res
                        });

                        if (!--pending) done(null, results);
                    });

                } else {

                    fs.readFile(fullFileName, 'utf8', (err, data) => {

                        if (err) throw err;

                        let { ext, name, dir } = path.parse(fullFileName);

                        results.push({
                            type: 'file',
                            label: name,
                            path: dir,
                            id: fullFileName,
                            content: data,
                            ext: ext
                        });

                        if (!--pending) done(null, results);
                    });
                } // if
            }); // fs.stat

        }); // list.foreach

    }); // fs.readdir

};

export default diretoryTreeToObj;
