import express from 'express'
import {getAndCacheImageByVideo} from './src/tools/videoConverter'

const app = express()
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb', extended: false}))

/*
* @method is converting video file to preview video
* GET/video/:id?link=http...
* */
app.get('/video/:id', async (req, res) => {
    const id = req.params.id
    const link: string = String(req.query.link || '')
    const image = await getAndCacheImageByVideo(link, id)
    const is_exist_image = !!image
    res.json({image, id, link, is_exist_image})
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log('SERVER START ON PORT', PORT)
})
