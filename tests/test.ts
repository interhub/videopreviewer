import fs from 'fs'
import {uploadFileToBacket, videopreview} from '../index'

jest.setTimeout(20000)

describe('test upload video', function () {
    test('upload file and generate image and send it to backet', async () => {
        const testFileName = 'cat.mp4'
        const file = fs.readFileSync(testFileName, 'binary')
        await uploadFileToBacket(file, testFileName)
        const {statusCode} = await videopreview({messages: [{details: {object_id: testFileName}}]})
        expect(statusCode).toBe(200)
    })
})

