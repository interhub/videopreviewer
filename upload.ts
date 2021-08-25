const AWS = require('aws-sdk')
const fs = require('fs')
require('dotenv').config()

const backetDefaultBase = 'https://storage.yandexcloud.net'
const backetDefaultName = 'videopreviewer'

const config = {
    endpoint: backetDefaultBase,
    region: 'ru-central1',
    accessKeyId: process.env.KEY_ID,
    secretAccessKey: process.env.KEY,
}

const s3 = new AWS.S3(config)
const fileName = 'cat.jpg'

const file = fs.readFileSync(`./${fileName}`, 'binary')
const Body = Buffer.from(file, 'binary')

s3.putObject({
    Body,
    Bucket: backetDefaultName,
    Key: fileName,
}).promise().then((data) => {
    console.log(data, 'success ✅ ')
})

