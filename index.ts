const {exec} = require('child_process')
const moment = require('moment')
const axios = require('axios')
const {path: ffmpegPath} = require('@ffmpeg-installer/ffmpeg')
const fs = require('fs')
const path = require('path')

const backetDefaultBase = 'https://storage.yandexcloud.net'
const OUT_FOLDER = 'tmp'
const OUT_FORMAT = 'jpg'


const getBlobLocalFile = async (path) => {
    if (!path) return ''
    try {
        const data = await fs.promises.readFile(path)
        return String(data)
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
        // console.log('getCacheImage', e)
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

const getAndCacheImageByVideo = async (uri = '', fileNameWithoutWxt = '', options?: OptionsType) => {
    console.log('getAndCacheImageByVideo start', uri, fileNameWithoutWxt, options)
    const resultFileUrl = encodeURI(uri)
    const output_path = `./${OUT_FOLDER}/${fileNameWithoutWxt}.${OUT_FORMAT}`
    const {cachedImage, isCached} = await getCacheImage(output_path)
    if (isCached) {
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
    await removeFile(output_path)
    return imageData
}

const getBacketFileAndImage = async (fileName = '', backetName = '') => {
    if (!fileName) return {}
    const fullUrl = `${backetDefaultBase}/${backetName}/${fileName}`
    const fileNameWithoutExt = fileName.replace(/(.mp4)$/, '')
    const image = (await getAndCacheImageByVideo(fullUrl, fileNameWithoutExt)) || ''
    const {data: video = {}} = await axios.get(fullUrl, {responseType: 'blob'})
    console.log((image?.length || 0), 'size image', (video?.length || 0), 'size video')
    return {video, image}
}


type EventType = {
    messages: [{ details: { object_id: string, bucket_id: string } }]
}

const videopreview = async function (event?: EventType) {
    const fileName = event?.messages ? event.messages[0].details.object_id : ''
    if (!fileName) return {
        statusCode: 400,
        body: {message: 'file name is not correct'},
    }
    const backetDefaultName = 'videopreviewer'
    const backetName = event?.messages ? event.messages[0].details?.bucket_id : backetDefaultName
    console.log(backetName, 'backetName', fileName, 'fileName')
    const {image} = await getBacketFileAndImage(fileName, backetName)

    return {
        statusCode: 200,
        body: String(`data:${image}`),
    }
}

module.exports.handler = videopreview

