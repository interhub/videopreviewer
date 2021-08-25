"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.videopreview = exports.uploadFileToBacket = void 0;
var AWS = require('aws-sdk');
var exec = require('child_process').exec;
var moment = require('moment');
var axios = require('axios');
var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var fs = require('fs');
require('dotenv').config();
var backetDefaultBase = 'https://storage.yandexcloud.net';
var backetDefaultName = 'videopreviewer';
var OUT_FOLDER = 'tmp';
var OUT_FORMAT = 'jpg';
var isCachingImages = false;
var getBlobLocalFile = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!path)
                    return [2 /*return*/, ''];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, fs.promises.readFile(path, 'binary')];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                e_1 = _a.sent();
                console.log('getBlobLocalFile', e_1);
                return [2 /*return*/, ''];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getCacheImage = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    var cachedImage, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fs.promises.access(path)];
            case 1:
                _a.sent();
                return [4 /*yield*/, getBlobLocalFile(path)];
            case 2:
                cachedImage = _a.sent();
                return [2 /*return*/, { cachedImage: cachedImage, isCached: !!cachedImage }];
            case 3:
                e_2 = _a.sent();
                return [2 /*return*/, { image: '', isCached: false }];
            case 4: return [2 /*return*/];
        }
    });
}); };
var removeFile = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    var e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fs.promises.access(path)];
            case 1:
                _a.sent();
                return [4 /*yield*/, fs.promises.unlink(path)];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                e_3 = _a.sent();
                console.log('remove file Err', e_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getAndCacheImageByVideo = function (uri, fileNameWithoutWxt, options) {
    if (uri === void 0) { uri = ''; }
    if (fileNameWithoutWxt === void 0) { fileNameWithoutWxt = ''; }
    return __awaiter(void 0, void 0, void 0, function () {
        var resultFileUrl, output_path, _a, cachedImage, isCached, _b, _c, width, _d, height, _e, seconds, time, args, isCreated, imageData;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('getAndCacheImageByVideo start', uri, fileNameWithoutWxt, options);
                    resultFileUrl = encodeURI(uri);
                    output_path = "./" + OUT_FOLDER + "/" + fileNameWithoutWxt + "." + OUT_FORMAT;
                    return [4 /*yield*/, getCacheImage(output_path)];
                case 1:
                    _a = _f.sent(), cachedImage = _a.cachedImage, isCached = _a.isCached;
                    if (!isCached) return [3 /*break*/, 4];
                    if (!!isCachingImages) return [3 /*break*/, 3];
                    return [4 /*yield*/, removeFile(output_path)];
                case 2:
                    _f.sent();
                    _f.label = 3;
                case 3: return [2 /*return*/, cachedImage];
                case 4:
                    _b = options || {}, _c = _b.width, width = _c === void 0 ? 0 : _c, _d = _b.height, height = _d === void 0 ? 0 : _d, _e = _b.seconds, seconds = _e === void 0 ? 0 : _e;
                    time = moment().startOf('day').seconds(seconds).format('HH:mm:ss');
                    args = [];
                    if (width && height) {
                        args.push("-vf \"thumbnail,scale=" + width + ":" + height + "\"");
                    }
                    args.push("-i " + resultFileUrl);
                    args.push("-ss " + time);
                    args.push(' -vframes 1');
                    args.push(output_path);
                    console.log(resultFileUrl, 'resultFileUrl', output_path, 'output_path');
                    return [4 /*yield*/, new Promise(function (ok, err) {
                            exec(ffmpegPath + " " + args.join(' '), function (err, stdout, stderr) {
                                console.log(err, stdout, stderr, 'err, stdout, stderr');
                                var isCreated = !err;
                                console.log('image created is', isCreated ? 'success' : 'failure', 'with err', err);
                                ok(isCreated);
                            });
                        })];
                case 5:
                    isCreated = _f.sent();
                    if (!isCreated)
                        return [2 /*return*/, ''];
                    return [4 /*yield*/, getBlobLocalFile(output_path)];
                case 6:
                    imageData = _f.sent();
                    if (!!isCachingImages) return [3 /*break*/, 8];
                    return [4 /*yield*/, removeFile(output_path)];
                case 7:
                    _f.sent();
                    _f.label = 8;
                case 8: return [2 /*return*/, imageData];
            }
        });
    });
};
var getBacketFileAndImage = function (fileName) {
    if (fileName === void 0) { fileName = ''; }
    return __awaiter(void 0, void 0, void 0, function () {
        var fullUrl, fileNameWithoutExt, resultImageName, image, _a, video;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!fileName)
                        return [2 /*return*/, {}];
                    fullUrl = backetDefaultBase + "/" + backetDefaultName + "/" + fileName;
                    fileNameWithoutExt = fileName.replace(/(.mp4)$/, '');
                    resultImageName = fileNameWithoutExt + "." + OUT_FORMAT;
                    return [4 /*yield*/, getAndCacheImageByVideo(fullUrl, fileNameWithoutExt)];
                case 1:
                    image = (_b.sent()) || '';
                    return [4 /*yield*/, axios.get(fullUrl, { responseType: 'blob' })];
                case 2:
                    _a = (_b.sent()).data, video = _a === void 0 ? {} : _a;
                    console.log(((image === null || image === void 0 ? void 0 : image.length) || 0), 'size image', ((video === null || video === void 0 ? void 0 : video.length) || 0), 'size video');
                    return [2 /*return*/, { video: video, image: image, resultImageName: resultImageName }];
            }
        });
    });
};
var uploadFileToBacket = function (file, fileName) {
    try {
        var config = {
            endpoint: backetDefaultBase,
            region: 'ru-central1',
            accessKeyId: process.env.KEY_ID,
            secretAccessKey: process.env.KEY
        };
        var s3 = new AWS.S3(config);
        var Body = Buffer.from(file, 'binary');
        s3.putObject({
            Body: Body,
            Bucket: backetDefaultName,
            Key: fileName
        }).promise().then(function (data) {
            console.log(data, 'success ✅ ');
        });
    }
    catch (e) {
        console.log('uploadFileToBacket', e);
    }
};
exports.uploadFileToBacket = uploadFileToBacket;
var videopreview = function (event) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, _a, image, video, resultImageName;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fileName = (event === null || event === void 0 ? void 0 : event.messages) ? event.messages[0].details.object_id : '';
                    if (!fileName)
                        return [2 /*return*/, {
                                statusCode: 400,
                                body: { message: 'file name is not correct' }
                            }];
                    return [4 /*yield*/, getBacketFileAndImage(fileName)];
                case 1:
                    _a = _b.sent(), image = _a.image, video = _a.video, resultImageName = _a.resultImageName;
                    exports.uploadFileToBacket(image, resultImageName);
                    return [2 /*return*/, {
                            statusCode: 200,
                            body: { image: image, video: video }
                        }];
            }
        });
    });
};
exports.videopreview = videopreview;
module.exports.handler = exports.videopreview;
