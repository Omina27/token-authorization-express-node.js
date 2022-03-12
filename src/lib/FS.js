const fs = require('fs')
const path = require('path')

const read = (dir) => {
    return JSON.parse(fs.readFileSync(dir, { encoding: 'utf-8', flag: 'r' }))
}

const write = (dir, data) => {
    fs.writeFileSync(dir, JSON.stringify(data, null, 4))
    return "written"
}

module.exports = {
    read,
    write
}