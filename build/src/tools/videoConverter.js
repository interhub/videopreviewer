"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndCacheImageByVideo = void 0;
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const child_process_1 = require("child_process");
const OUT_FOLDER = 'cache';
const OUT_FORMAT = 'jpg';
const getBase64File = async (path) => {
    try {
        const url = await fs_1.default.promises.readFile(path, 'base64');
        const base = 'data:image/png;base64, ';
        return base + url;
    }
    catch (e) {
        return '';
    }
};
const getAndCacheImageByVideo = async (uri, id, options) => {
    const output_path = `./${OUT_FOLDER}/${id}.${OUT_FORMAT}`;
    try {
        await fs_1.default.promises.access(output_path);
        return getBase64File(output_path);
    }
    catch (e) {
    }
    const { width = 0, height = 0, seconds = 0 } = options || {};
    const time = moment_1.default().startOf('day').seconds(seconds).format('HH:mm:ss');
    const args = [];
    if (width && height) {
        args.push(`-vf "thumbnail,scale=${width}:${height}"`);
    }
    args.push(`-i ${uri}`);
    args.push(`-ss ${time}`);
    args.push('-nostdin -y');
    args.push(' -vframes 1');
    args.push(output_path);
    await new Promise((ok, err) => {
        let convert;
        convert = child_process_1.spawn('./ffmpeg', args, { shell: true, });
        convert.on('exit', (code) => {
            console.log('server response with code', code);
            ok(true);
        });
    });
    return getBase64File(output_path);
};
exports.getAndCacheImageByVideo = getAndCacheImageByVideo;
//# sourceMappingURL=videoConverter.js.map