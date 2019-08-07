import { Component, OnInit, ElementRef } from '@angular/core';
import { MdcSnackbarService } from '@blox/material';
import { FetchService } from '../fetch.service';
import { Router } from '@angular/router';
import { MaterialInfo } from '../model/materialinfo';
import { Content } from '@angular/compiler/src/render3/r3_ast';
@Component({
    selector: 'app-auto-detect',
    templateUrl: './auto-detect-hash.component.html',
    styleUrls: ['./auto-detect-hash.component.scss']
})
export class AutoDetectHashComponent implements OnInit {
    // tslint:disable: max-line-length

    detectedItemList = [];
    ItemHashList = [];
    ImageElement: HTMLImageElement;
    ImageLoaded: boolean;
    Canvas: HTMLCanvasElement;
    Ctx: CanvasRenderingContext2D;
    ImageData: ImageData;
    InfoText = '等待处理';
    progress = 0;
    XBound = [];
    YBound = [];
    ItemGreyData = [];
    ItemHash = [];
    ImageGreyData = {};
    NumberHash = {
        1: '000000000000000000000000000000000001100001111000000110000000100000001000000010000000100000001000000010000000100000001000000010000000100000001000000110001111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        2: '000000000000000000000000000000000000001111100111000110100000011000000011000000001000000011000000011000000011000000110000000100000001100000011000000110000001100000011100000011111111111111111100000000000000000000000000000000000000000000000000000000000000000000000',
        3: '000000000000000000000000000000000000011111100110000110000000011000000011000000011000000010000000100000111100000001100000000010000000001000000001000000001000000011100000011011111110000010000000000000000000000000000000000000000000000000000000000000000000',
        4: '000000000000000000000000000000000000000000000000000110000000011100000001111000000011110000001101100000110011000001000110000110001100001000011000110000110011100001100111111111110000000110000000001100000000011000000000110000000000000000000000000000000000000000000',
        5: '000000000000000000000000000000000000000000000000000000000000000000000000000000000011111110011000000001100000000110000000011000000001100000000111111000011000011000000000110000000011000000001100000000110000000011000000001110000001100110011100000111000000000000000',
        6: '000000000000000000000000111100000111011100110000000110000000011000000001000000000100000000110011110011110001101110000011110000000101000000010100000001011000000101100000110011000110000111110000000000000000000000000000000000000000000000000000000000000000000000000',
        7: '000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111000000001100000000110000000110000000010000000011000000001000000001100000000110000000010000000011000000001100000000110000000011000000001100000000110000000000000000000000000',
        8: '000000000000000000000000000000000000000000011111000010000110011000001101100000110110000011011000001100110001100001110100001101110001100001100100000011110000001111000000011100000001010000001100110001100000110000000000000000000000000000000000000000000000000000000',
        9: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111000001000011000110000011001000000110110000000101100000001001000000010011000001110011000111000011100010000000000100000000001000000000110000000001000000000110000111111',
        0: '100000000000000000000000011100000011111000011000110011000001101100000110100000011110000000111000000011100000001110000000111000000010100000001010000001101100000110110000010001100011000011111000000000000000000000000000000000000000000000000000000000000000000000000',
        万: '1111111010010011010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111100000000011111111111111111111000000010000000000000000000100000000000000000011000000000000000000110000000000000000001100000000000000000011111111111100000000110000000011000000001100000000110000000010000000001100000001100000000011000000011000000000110000000100000000001100000011000000000010000001100000000000100000110000000000001000011100000000000110001100000000111111000000000000000000000000'
    };
    constructor(private fetchService: FetchService, private snackbar: MdcSnackbarService, private router: Router, private el: ElementRef) {
    }

    async ngOnInit() {
        this.fetchService.getJson('./assets/data/MaterialHash.json').subscribe(data => {
            this.ItemHashList = data;
        });
        this.ImageElement = document.createElement('img');
        this.Canvas = this.el.nativeElement.getElementsByTagName('canvas')[0];
        this.Ctx = this.Canvas.getContext('2d');
    }
    choiceImage(event) {
        const ImageContainer = event.target;
        const Reader = new FileReader();
        Reader.onload = e => {
            this.LoadImage(Reader.result.toString());
        };
        Reader.readAsDataURL(ImageContainer.files[0]);
        this.XBound = [];
        this.YBound = [];
        this.ItemGreyData = [];
        this.detectedItemList = [];
        this.ItemHash = [];
    }
    LoadImage(src: string) {
        this.ImageElement.src = src;
        this.ImageElement.onload = () => {
            this.setProgress('等待处理', 0);
            const img = this.ImageElement;
            this.Canvas.width = this.ImageElement.width;
            this.Canvas.height = this.ImageElement.height;
            const maxSize = 1200;
            /*const width = img.width > img.height ? maxSize : (maxSize * img.width / img.height);
            const height = img.width > img.height ? (maxSize * img.height / img.width) : maxSize;
            this.Canvas.style.width = width + 'px';
            this.Canvas.style.height = height + 'px';*/
            this.ImageLoaded = true;
            this.Ctx.drawImage(img, 0, 0);
            this.Ctx.font = '20px serif';
            this.Ctx.textAlign = 'center';
            this.ImageData = this.Ctx.getImageData(0, 0, this.Canvas.width, this.Canvas.height);
        };
    }
    objectRegonition() {
        this.XBound = [];
        this.YBound = [];
        this.ItemGreyData = [];
        this.detectedItemList = [];
        this.ItemHash = [];
        this.setProgress('正在扫描图片', 0.1);
        this.searchBoundary().then(() => {
            return this.CropImage();
        }).then(() => {
            return this.genHash();
        }).then(() => {
            return this.checkHash();
        }).then(() => {
            return this.Ocr();
        });
    }
    Ocr() {
        return new Promise((resolve, reject) => {
            // 十分简易的文字识别
            this.setProgress('正在识别各物品数量', 0.90);
            setTimeout(() => {
                // 惯例两for遍历
                for (let y = 0, YAll = this.detectedItemList.length; y < YAll; y++) {
                    const YDistance = this.YBound[y][1] - this.YBound[y][0];
                    const top = Math.floor(YDistance * 0.73);
                    const bottom = Math.floor(YDistance * 0.0725);
                    const height = YDistance - bottom - top;
                    const realTop = this.YBound[y][0] + top + ((y === 2) ? 5 : 0); // 修正第三行
                    for (let x = 0, XAll = this.detectedItemList[y].length; x < XAll; x++) {
                        const XDistance = this.XBound[x][1] - this.XBound[x][0];
                        const width = Math.floor(XDistance * 0.48);
                        const realLeft = Math.floor(this.XBound[x][0] + (XDistance * 0.4));
                        // 1.裁剪出数字的地方
                        const NumberBuffer = document.createElement('canvas').getContext('2d');
                        NumberBuffer.canvas.height = height;
                        NumberBuffer.canvas.width = width;
                        NumberBuffer.drawImage(this.ImageElement, realLeft, realTop, width, height, 0, 0, width, height);
                        const rImgData = NumberBuffer.getImageData(0, 0, width, height);
                        const ImgData = rImgData.data;
                        // 2.图像预处理，只保留出两种状态
                        const easyData = [];
                        for (let ny = 0; ny < height; ny++) {
                            easyData.push([]);
                            const BaseY = (ny * width) * 4;
                            for (let nx = 0; nx < width; nx++) {
                                if (255 - Math.floor((ImgData[BaseY + nx * 4] + ImgData[BaseY + nx * 4 + 1] + ImgData[BaseY + nx * 4 + 2]) / 3) <= 80) {
                                    /* ImgData[BaseY + nx * 4] = 255;
                                     ImgData[BaseY + nx * 4 + 1] = 255;
                                     ImgData[BaseY + nx * 4 + 2] = 255; */
                                    easyData[ny][nx] = true;
                                } else {
                                    /* ImgData[BaseY + nx * 4] = 0;
                                     ImgData[BaseY + nx * 4 + 1] = 0;
                                     ImgData[BaseY + nx * 4 + 2] = 0; */
                                    easyData[ny][nx] = false;
                                }
                            }
                        }
                        // this.Ctx.putImageData(rImgData, realLeft, realTop);
                        // 3. 分割每个数字，方便计算Hash
                        const NumberBound = [];
                        this.Ctx.fillStyle = '#00ff00';
                        for (let nx = 0, whiteLock = false, i: number; nx < width; nx++) {
                            let white = 0;
                            for (let ny = 0; ny < height; ny++) {
                                if (easyData[ny][nx]) { white++; }
                            }
                            if (white && !whiteLock) {
                                i = NumberBound.push([]) - 1;
                                NumberBound[i][0] = nx;
                                this.Ctx.fillRect(realLeft + nx, realTop, 1, height);
                                whiteLock = true;
                            } else if (whiteLock && white === 0) {
                                NumberBound[i][1] = nx - 1;
                                this.Ctx.fillRect(realLeft + nx - 1, realTop, 1, height);
                                whiteLock = false;
                            }
                        }
                        this.Ctx.fillStyle = '#ff0000';
                        let NumberString = '';
                        for (let i = 0, all = NumberBound.length; i < all; i++) {
                            if (NumberBound[i].length !== 2) { continue; }
                            if (NumberBound[i][1] - NumberBound[i][0] >= 1 && NumberBound[i][1] - NumberBound[i][0] <= 3) {
                                NumberString = NumberString.replace(/\./g, '') + '.';
                            }
                            if (NumberBound[i][1] - NumberBound[i][0] < 6 || NumberBound[i][1] - NumberBound[i][0] >= 24) { continue; }
                            this.Ctx.fillRect(realLeft + NumberBound[i][0], realTop, 1, height);
                            this.Ctx.fillRect(realLeft + NumberBound[i][1], realTop, 1, height);
                            let hash = ''; // 直接对比汉明距离在这里不太好用，使用编辑距离来进行比较
                            for (let ny = 0; ny < height; ny++) {
                                for (let nx = NumberBound[i][0]; nx <= NumberBound[i][1]; nx++) {
                                    hash += easyData[ny][nx] ? '1' : '0';
                                }
                            }
                            let min = Infinity;
                            let Value: string;
                            for (const key of Object.keys(this.NumberHash)) {
                                const ld = this.LD((hash.length < this.NumberHash[key]) ? hash.padEnd(this.NumberHash[key].length, '0') : hash, (hash.length < this.NumberHash[key]) ? this.NumberHash[key] : this.NumberHash[key].padEnd(hash.length, '0'));
                                min = Math.min(min, ld);
                                if (ld === min) {
                                    Value = key;
                                }
                            }
                            NumberString += (min > 100) ? '' : Value;
                        }
                        if (NumberString.indexOf('.') === -1) {
                            NumberString.replace(/万/g, '');
                        }
                        this.Ctx.fillStyle = '#00ff00';
                        this.Ctx.fillText(NumberString, Math.floor(this.XBound[x][0] + (this.XBound[x][1] - this.XBound[x][0]) / 2), Math.floor(this.YBound[y][0] + (this.YBound[y][1] - this.YBound[y][0]) / 2 + 20));
                        if (NumberString.substr(NumberString.length - 1, 1) === '万') {
                            this.detectedItemList[y][x].have = Number(NumberString.substr(0, NumberString.length - 1)) * 10000;
                        } else {
                            this.detectedItemList[y][x].have = Number(NumberString);
                        }
                        // console.log(easyData);
                        // console.log(NumberBound);
                    }
                }
                resolve();
            }, 25);
        });
    }
    LD(str1: string, str2: string) {
        // 实现LD算法计算编辑距离 可以优化成LDCompare(https://www.cnblogs.com/grenet/archive/2009/12/17/1626649.html#comment_body_1727150)?
        // 代码参考https://www.cnblogs.com/grenet/archive/2010/06/01/1748448.html
        const L = [];
        L[0] = [];
        L[0][0] = 0;
        for (let i = 1, all = str1.length; i <= all; i++) {
            L[i] = [];
            L[i][0] = i;
        }
        for (let j = 1, all = str2.length; j <= all; j++) {
            L[0][j] = j;
        }
        for (let i = 1, all = str1.length; i <= all; i++) {
            for (let j = 1, all2 = str2.length; j <= all2; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    L[i][j] = L[i - 1][j - 1];
                } else {
                    L[i][j] = Math.min(L[i - 1][j - 1], L[i - 1][j], L[i][j - 1]) + 1;
                }
            }
        }
        return L[str1.length][str2.length];
    }
    CropImage() {
        // 裁剪图片
        return new Promise((resolve, reject) => {
            this.setProgress('正在裁剪并缩放各物品图片', 0.55);
            setTimeout(() => {
                const TempCanvas = document.createElement('canvas');
                TempCanvas.width = 9;
                TempCanvas.height = 8;
                const TempCtx = TempCanvas.getContext('2d');
                for (let y = 0, YAll = this.YBound.length; y < YAll; y++) {
                    if (this.YBound[y].length !== 2) { continue; }
                    this.ItemGreyData.push([]);
                    for (let x = 0, XAll = this.XBound.length; x < XAll; x++) {
                        if (this.XBound[x].length !== 2) { continue; }
                        TempCtx.drawImage(this.ImageElement, this.XBound[x][0], this.YBound[y][0], this.XBound[x][1] - this.XBound[x][0], this.YBound[y][1] - this.YBound[y][0], 0, 0, TempCanvas.width, TempCanvas.height);
                        const TempImageData = TempCtx.getImageData(0, 0, TempCanvas.width, TempCanvas.height).data;
                        const l = this.ItemGreyData[y].push([]) - 1;
                        for (let ya = 0; ya < TempCanvas.height; ya++) {
                            this.ItemGreyData[y][l].push([]);
                            for (let xa = 0; xa < TempCanvas.width; xa++) {
                                const index = (ya * TempCanvas.width + xa) * 4;
                                this.ItemGreyData[y][l][ya][xa] = Math.floor((TempImageData[index] + TempImageData[index + 1] + TempImageData[index + 2]) / 3);
                            }
                        }
                    }
                }
                TempCanvas.remove();
                resolve();
            }, 25);
        });
    }
    genHash() {
        return new Promise((resolve, reject) => {
            this.setProgress('正在计算Hash(请耐心等待)', 0.65);
            setTimeout(() => {
                for (let ya = 0, YaAll = this.ItemGreyData.length; ya < YaAll; ya++) {
                    this.ItemHash.push([]);
                    for (let xa = 0, XaAll = this.ItemGreyData[ya].length; xa < XaAll; xa++) {
                        let hash = '';
                        for (let yb = 0, YbAll = this.ItemGreyData[ya][xa].length; yb < YbAll; yb++) {
                            for (let xb = 0, XbAll = this.ItemGreyData[ya][xa][yb].length; xb < XbAll - 1; xb++) {
                                hash += (this.ItemGreyData[ya][xa][yb][xb] > this.ItemGreyData[ya][xa][yb][xb + 1] ? '1' : '0');
                            }
                        }
                        this.ItemHash[ya][xa] = hash;
                    }
                }
                resolve();
            }, 25);
        });
    }
    checkHash() {
        // 对比Hash部分
        return new Promise((resolve, reject) => {
            this.setProgress('正在识别物品', 0.75);
            setTimeout(() => {
                for (let y = 0, YAll = this.ItemHash.length; y < YAll; y++) {
                    this.detectedItemList.push([]);
                    for (let x = 0, XAll = this.ItemHash[y].length; x < XAll; x++) {
                        this.detectedItemList[y][x] = {
                            have: 0,
                            item: this.ItemHashList.map((item) => {
                                if (item.hash === '') {
                                    return { distance: 64, name: item.name, hash: item.hash };
                                }
                                return {
                                    distance: this.ItemHash[y][x].split('').reduce((count, value, index) => {
                                        return count + (value === item.hash[index] ? 0 : 1);
                                    }, 0), name: item.name, hash: item.hash
                                };
                            }).sort((a, b) => a.distance - b.distance)
                        };
                        this.Ctx.fillText(this.detectedItemList[y][x].item[0].name, Math.floor(this.XBound[x][0] + (this.XBound[x][1] - this.XBound[x][0]) / 2), Math.floor(this.YBound[y][0] + (this.YBound[y][1] - this.YBound[y][0]) / 2));
                    }
                }
                resolve();
            }, 25);
        });
    }
    getPixelGrey(x: number, y: number) {
        if (x < 0 || y < 0 || x > this.Canvas.width || y > this.Canvas.height) { return -1; }
        const offset = y * 10000 + x;
        if (typeof this.ImageGreyData[offset] !== 'undefined') {
            return this.ImageGreyData[offset];
        }
        const index = (y * this.Canvas.width + x) * 4;
        this.ImageGreyData[offset] = Math.floor((this.ImageData.data[index] + this.ImageData.data[index + 1] + this.ImageData.data[index + 2]) / 3);
        return this.ImageGreyData[offset];
    }
    searchBoundary() {
        this.setProgress('扫描图像边界', 0.2);
        const XBlank = Array(this.Canvas.width).fill(0);
        const YBlank = Array(this.Canvas.height).fill(0);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // console.time("a");
                for (let y = 100; y < this.Canvas.height; y++) {
                    for (let x = 15; x < this.Canvas.width - 1; x++) {
                        const GreyList = [
                            [this.getPixelGrey(x - 1, y - 1), this.getPixelGrey(x, y - 1), this.getPixelGrey(x + 1, y - 1)],
                            [this.getPixelGrey(x - 1, y), this.getPixelGrey(x, y), this.getPixelGrey(x + 1, y)],
                            [this.getPixelGrey(x - 1, y - 1), this.getPixelGrey(x, y - 1), this.getPixelGrey(x + 1, y - 1)]
                        ];
                        if ((() => {
                            for (let ya = 0; ya < 3; ya++) {
                                for (let xa = 0; xa < 3; xa++) {
                                    if (GreyList[ya][xa] === -1) {
                                        GreyList[ya][xa] = GreyList[1][1];
                                        continue;
                                    }
                                    if (ya === 1 && xa === 1) { continue; }
                                    if (Math.abs(GreyList[ya][xa] - GreyList[1][1]) <= 10) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        })()) {
                            YBlank[y]++;
                            XBlank[x]++;
                        }
                    }
                }
                this.ImageGreyData = {};
                // console.timeEnd("a");
                resolve();
            }, 25);
        }).then(() => {
            this.setProgress('正在计算各元素Y轴方向上的边界', 0.35);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.Ctx.fillStyle = '#00ff00';
                    for (let y = 0, isObject = false, LastBlank = 0, SpaceLength, ItemHeight, length; y < this.Canvas.height; y++) {
                        if (!isObject && YBlank[y] > (10)) {
                            length = this.YBound.push([]);
                            isObject = true;
                            this.YBound[length - 1][0] = y;
                            SpaceLength = 0;
                            ItemHeight = 0;
                            this.Ctx.fillRect(0, y, this.Canvas.width, 1);

                        }
                        if (isObject && ItemHeight > 100 && YBlank[y] <= (this.YBound.length < 3 ? 10 : 30)) {
                            SpaceLength++;
                            if (SpaceLength > 15) {
                                SpaceLength = 0;
                                this.YBound[length - 1][1] = LastBlank;
                                isObject = false;
                                this.Ctx.fillRect(0, LastBlank, this.Canvas.width, 1);
                                // if (this.YBound.length === 3) { break; }
                            }
                        }
                        if (isObject && YBlank[y] > (this.YBound.length < 3 ? 5 : 20)) {
                            LastBlank = y;
                            SpaceLength = 0;
                        }
                        if (isObject) {
                            ItemHeight++;
                        }
                    }
                    resolve();
                }, 25);
            });
        }).then(() => {
            this.setProgress('正在计算各元素X轴方向上的边界', 0.45);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    for (let x = 0, isObject = false, LastBlank = 0, SpaceLength, ItemWidth, length; x < this.Canvas.width; x++) {
                        if (!isObject && XBlank[x] > (this.XBound.length > 0 ? 5 : 20)) {
                            length = this.XBound.push([]);
                            isObject = true;
                            this.XBound[length - 1][0] = x;
                            SpaceLength = 0;
                            ItemWidth = 0;
                            this.Ctx.fillRect(x, 0, 1, this.Canvas.height);
                        }
                        if (isObject && ItemWidth > 100 && XBlank[x] <= 10) {
                            SpaceLength++;
                            if (SpaceLength > 15) {
                                SpaceLength = 0;
                                this.XBound[length - 1][1] = LastBlank;
                                isObject = false;
                                this.Ctx.fillRect(LastBlank, 0, 1, this.Canvas.height);
                                if (this.XBound.length === 8) { break; }
                            }
                        }
                        if (isObject && XBlank[x] > 5) {
                            LastBlank = x;
                            SpaceLength = 0;
                        }
                        if (isObject) {
                            ItemWidth++;
                        }
                    }
                    // console.log(XBlank);
                    resolve();
                }, 25);
            });
        });
    }
    setProgress(text: string, Progress: number) {
        this.InfoText = text;
        this.progress = Progress;
    }
}


