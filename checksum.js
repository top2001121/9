var fs = require('fs');
var crypto = require('crypto');

function generateChecksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

async function p(file) {
    const data = fs.readFileSync(file);
    var checksum = generateChecksum(data);
    fs.appendFileSync('checksum.txt', `${file}\t${checksum}\n`)
    console.log(file, checksum)
}

function getFiles() {
    var files = fs.readdirSync('.')
    files = files.filter((item) => !(item.endsWith('git') || item.endsWith('.js') || item.endsWith('.txt')))
    return files
}

async function pp() {
    const files = getFiles()
    for (var i = 0; i < files.length; i++) {
        const file = files[i]
        await p(file)
    }
}

async function pa() {
    if (!fs.existsSync('checksum.txt')) {
        console.error('not found checksum.txt file')
        return
    }
    const checksumList = fs.readFileSync('checksum.txt', {encoding: 'utf8'}).split('\n') || []

    const files = getFiles() || []
    if(checksumList.length - 1 != files.length) {
        console.log('checksum file len error', checksumList.length - 1, files.length)    
        return
    }
    for (var i = 0; i < files.length; i++) {
        const file = files[i]
        const data = fs.readFileSync(file);
        var checksum = generateChecksum(data);
        var checkTxt = `${file}\t${checksum}`
        if(!checksumList.includes(checkTxt)) {
            console.error('checksum not match', checkTxt, file)
            throw new Error(file)
        }
        console.log('checksum ok', file)
    }
}

var isGen = process.argv[2]
if (!isGen) {
    pa()
}
else {
    fs.writeFileSync('checksum.txt', '')
    pp()
}
