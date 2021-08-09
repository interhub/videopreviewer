import fs from 'fs'
import moment from 'moment'
import {spawn} from 'child_process'

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
        return ''
    }
}

export const getAndCacheImageByVideo = async (uri: string, id: string, options?: MediaOptionsType) => {
    const output_path = `./${OUT_FOLDER}/${id}.${OUT_FORMAT}`
    try {
        await fs.promises.access(output_path)
        return getBase64File(output_path)
    } catch (e) {

    }
    const {width = 0, height = 0, seconds = 0} = options || {}
    const time = moment().startOf('day').seconds(seconds).format('HH:mm:ss')
    const args: string[] = []
    if (width && height) {
        args.push(`-vf "thumbnail,scale=${width}:${height}"`)
    }
    args.push(`-i ${uri}`)
    args.push(`-ss ${time}`)
    args.push('-nostdin -y')
    args.push(' -vframes 1')
    args.push(output_path)
    await new Promise((ok, err) => {
        let convert
        convert = spawn(
            './ffmpeg',
            args,
            {shell: true,}
        )
        convert.on('exit', (code: number) => {
            console.log('server response with code', code)
            ok(true)
        })
    })
    return getBase64File(output_path)
}
