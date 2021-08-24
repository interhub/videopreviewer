import fs from 'fs'
import moment from 'moment'
import {spawn} from 'child_process'
import {path as ffmpegPath} from '@ffmpeg-installer/ffmpeg'

type MediaOptionsType = {
    width?: number;
    height?: number;
    seconds?: number
}


const OUT_FOLDER = 'cache'
const OUT_FORMAT = 'jpg'

const getBase64File = async (path: string) => {
    try {
        const url = await fs.promises.readFile(path, 'base64')
        const base = 'data:image/png;base64, '
        return base + url
    } catch (e) {
        console.log('getBase64File', e)
        return ''
    }
}

const getCacheImage = async (path: string) => {
    try {
        await fs.promises.access(path)
        const cachedImage = getBase64File(path)
        return {cachedImage, isCached: !!cachedImage}
    } catch (e) {
        console.log('getCacheImage', e)
        return {image: '', isCached: false}
    }
}

export const getAndCacheImageByVideo = async (uri: string, id: string, options?: MediaOptionsType) => {
    const encodeUri = encodeURI(uri)
    console.log(encodeUri,'encodeUri')
    const output_path = `./${OUT_FOLDER}/${id}.${OUT_FORMAT}`
    const {cachedImage, isCached} = await getCacheImage(output_path)
    if (isCached) return cachedImage
    const {width = 0, height = 0, seconds = 0} = options || {}
    const time = moment().startOf('day').seconds(seconds).format('HH:mm:ss')
    const args: string[] = []
    if (width && height) {
        args.push(`-vf "thumbnail,scale=${width}:${height}"`)
    }
    args.push(`-i ${encodeUri}`)
    args.push(`-ss ${time}`)
    args.push('-nostdin -y')
    args.push(' -vframes 1')
    args.push(output_path)
    const isCreated = await new Promise((ok, err) => {
        let convert
        convert = spawn(
            ffmpegPath,
            args,
            {shell: true,}
        )
        convert.on('exit', (code: number) => {
            const isCreated = code === 0
            console.log('image created is', isCreated ? 'success' : 'failure', 'with code', code)
            ok(isCreated)
        })
    })
    if (!isCreated) return ''
    return getBase64File(output_path)
}


//test case
//http://localhost:3001/video/18?link=https://storage.yandexcloud.net/videopreviewer/Cat%20-%2066004.mp4
