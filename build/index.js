"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const videoConverter_1 = require("./src/tools/videoConverter");
const app = express_1.default();
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
/*
* @method is converting video file to preview video
* GET/video/:id?link=http...
* */
app.get('/video/:id', async (req, res) => {
    const id = req.params.id;
    const link = String(req.query.link || '');
    const image = await videoConverter_1.getAndCacheImageByVideo(link, id);
    const is_exist_image = !!image;
    res.json({ image, id, link, is_exist_image });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('SERVER START ON PORT', PORT);
});
//# sourceMappingURL=index.js.map