export {}
const AWS = require('aws-sdk')
const {exec} = require('child_process')
const moment = require('moment')
const axios = require('axios')
const {path: ffmpegPath} = require('@ffmpeg-installer/ffmpeg')
const fs = require('fs')
require('dotenv').config()


const backetDefaultBase = 'https://storage.yandexcloud.net'
const backetDefaultName = 'videopreviewer'

const OUT_FOLDER = 'tmp'
const OUT_FORMAT = 'jpg'

const isCachingImages = false

const getBlobLocalFile = async (path) => {
    if (!path) return ''
    try {
        return await fs.promises.readFile(path, 'binary')
    } catch (e) {
        console.log('getBlobLocalFile', e)
        return ''
    }
}

const getCacheImage = async (path) => {
    try {
        await fs.promises.access(path)
        const cachedImage = await getBlobLocalFile(path)
        return {cachedImage, isCached: !!cachedImage}
    } catch (e) {
        return {image: '', isCached: false}
    }
}

const removeFile = async (path) => {
    try {
        await fs.promises.access(path)
        return await fs.promises.unlink(path)
    } catch (e) {
        console.log('remove file Err', e)
    }
}

type OptionsType = {
    height?: number;
    width?: number;
    seconds?: number;
}


const getAndCacheImageByVideo = async (uri = '', fileNameWithoutWxt = '', options?: OptionsType): Promise<string> => {
    console.log('getAndCacheImageByVideo start', uri, fileNameWithoutWxt, options)
    const resultFileUrl = encodeURI(uri)
    const output_path = `./${OUT_FOLDER}/${fileNameWithoutWxt}.${OUT_FORMAT}`
    const {cachedImage, isCached} = await getCacheImage(output_path)
    if (isCached) {
        if (!isCachingImages)
            await removeFile(output_path)
        return cachedImage
    }
    const {width = 0, height = 0, seconds = 0} = options || {}
    const time = moment().startOf('day').seconds(seconds).format('HH:mm:ss')
    const args = []
    if (width && height) {
        args.push(`-vf "thumbnail,scale=${width}:${height}"`)
    }
    args.push(`-i ${resultFileUrl}`)
    args.push(`-ss ${time}`)
    args.push(' -vframes 1')
    args.push(output_path)
    console.log(resultFileUrl, 'resultFileUrl', output_path, 'output_path')
    const isCreated = await new Promise((ok, err) => {
        exec(`${ffmpegPath} ` + args.join(' '), (err, stdout, stderr) => {
            console.log(err, stdout, stderr, 'err, stdout, stderr')
            const isCreated = !err
            console.log('image created is', isCreated ? 'success' : 'failure', 'with err', err)
            ok(isCreated)
        })
    })
    if (!isCreated) return ''
    const imageData = await getBlobLocalFile(output_path)
    if (!isCachingImages)
        await removeFile(output_path)
    return imageData
}

const getBacketFileAndImage = async (fileName = '') => {
    if (!fileName) return {}
    const fullUrl = `${backetDefaultBase}/${backetDefaultName}/${fileName}`
    const fileNameWithoutExt = fileName.replace(/(.mp4)$/, '')
    const resultImageName = `${fileNameWithoutExt}.${OUT_FORMAT}`
    const image = (await getAndCacheImageByVideo(fullUrl, fileNameWithoutExt)) || ''
    const {data: video = {}} = await axios.get(fullUrl, {responseType: 'blob'})
    console.log((image?.length || 0), 'size image', (video?.length || 0), 'size video')
    return {video, image, resultImageName}
}

const uploadFileToBacket = (file: string, fileName: string) => {
    try {
        const config = {
            endpoint: backetDefaultBase,
            region: 'ru-central1',
            accessKeyId: process.env.KEY_ID,
            secretAccessKey: process.env.KEY,
        }

        const s3 = new AWS.S3(config)
        const Body = Buffer.from(file, 'binary')

        s3.putObject({
            Body,
            Bucket: backetDefaultName,
            Key: fileName,
        }).promise().then((data) => {
            console.log(data, 'success ✅ ')
        })
    } catch (e) {
        console.log('uploadFileToBacket', e)
    }
}


type EventType = {
    messages: [{ details: { object_id: string } }]
}

const videopreview = async function (event?: EventType) {
    const fileName = event?.messages ? event.messages[0].details.object_id : ''
    if (!fileName) return {
        statusCode: 400,
        body: {message: 'file name is not correct'},
    }
    const {image, video, resultImageName} = await getBacketFileAndImage(fileName)
    uploadFileToBacket(image, resultImageName)
    return {
        statusCode: 200,
        body: {image, video},
    }
}

const test = async () => {
    const testFileName = 'cat.mp4'
    await uploadFileToBacket(fs.readFileSync(testFileName, 'binary'), testFileName)
    const res = await videopreview({messages: [{details: {object_id: testFileName}}]})
    console.log(res.statusCode, '= result code should be 200 ⚙️ ')
}

test()

module.exports.handler = videopreview

