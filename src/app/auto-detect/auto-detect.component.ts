import { Component, OnInit } from '@angular/core';
import classesName from './itemList.js';
import yolo from 'tfjs-yolo';
import * as $ from 'jquery';
import { MdcSnackbarService } from '@blox/material';
import { FetchService } from '../fetch.service';
import { Router } from '@angular/router';
import { MaterialInfo } from '../model/materialinfo';
import vintagejs from "vintagejs"

// TODO:可调整识别结果

@Component({
  selector: 'app-auto-detect',
  templateUrl: './auto-detect.component.html',
  styleUrls: ['./auto-detect.component.scss']
})
export class AutoDetectComponent implements OnInit {


  detectedItemList = new Array(new Array());
  proxy = 'https://rest.graueneko.xyz/proxy/';
  ImageLoaded = false;
  mIdx: { [key: string]: MaterialInfo };
  items = [];
  boxes;
  // Need to be updated every 30 days
  private ACCESS_TOKEN = '24.d13d0147a0c455d1ff0ad9e6cffb9d03.2592000.1564799928.282335-16699672';

  constructor(private fetchService: FetchService, private snackbar: MdcSnackbarService, private router: Router) {
  }

  async ngOnInit() {
    // TestONLY
    /*this.detectedItemList = [['MTL_SL_DS',2,1],
    ['MTL_SL_RUSH4',3,1],
    ['MTL_SL_KETONE2',3,1],
    ['MTL_SL_BN',2,1],
    ['MTL_SL_RUSH1',3,1],
    ['MTL_SL_STRG4',3,1],
    ['MTL_SKILL2',1,1]]*/

    const loaded = document.getElementById('loadedimg');
    const display = document.getElementById('display');
    const file = document.querySelector('#test-image-file');
    file.addEventListener('change', previewImage, false);

    // 图片预览
    function previewImage(event) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('loaded');
        // @ts-ignore
        (loaded as HTMLImageElement).src = e.target.result;
        // @ts-ignore
        (display as HTMLImageElement).src = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }

    this.fetchService.getJson('./assets/data/material.json').subscribe(data => {
      this.items = [];
      for (const k in data) {
        if (data[k]) {
          this.items.push(data[k]);
        }
      }
    });

  }

  async digitReg() {
    const loaded = document.getElementById('loadedimg');
    const changed = document.getElementById('changed');
    try {
      if (this.boxes.length === 0) {
        console.log('Empty!');
        return;
      }
      const boxlist = new Array();
      this.boxes.forEach(box => {
        boxlist.push(box);
        const {
          top,
          left,
          bottom,
          right,
          width,
          height,
          score: score,
          class: classes,
        } = box;
      });
      for (const box of boxlist) {
        const {
          top,
          left,
          bottom,
          right,
          width,
          height,
          score: score,
          class: classes,
        } = box;

        const size = Math.max(Math.ceil(width), Math.ceil(height));
        // @ts-ignore

        changed.src = await this.getImagePortion(loaded, size, size, Math.ceil(left), Math.ceil(top), 1);
        const count = await this.getNumbyAPI(changed, classes);


        let dulplicate = false;
        for (const item of this.detectedItemList) {
          if (item[0] === classes) {
            dulplicate = true;
            if (item[2] >= score) {
              continue;
            }
            item[1] = count;
            return;
          }
        }
        this.detectedItemList.push([classes, count, score]);
        console.log('Success');
      }

    } catch (e) {
      if (e === TypeError) {
        console.error('Nothing Detected');
      } else {
        console.error('Unknown Error: ' + e);
      }
    }
  }

  async objectRegonition() {
    const ItemDetect = await yolo.v3tiny('./assets/models/Yolo-identify/model.json');
    // ,anchors:[37,61, 21,65, 37,42, 28,57, 376,370, 38,77]})
    this.boxes = await ItemDetect.predict(document.getElementById('loadedimg'), {
      maxBoxes: 30,          // defaults to 20
      scoreThreshold: .25,   // defaults to .5
      iouThreshold: .3,     // defaults to .3
      numClasses: 86,       // defaults to 80 for yolo v3, tiny yolo v2, v3 and 20 for tiny yolo v1
      anchors: [37, 61, 21, 65, 37, 42, 28, 57, 376, 370, 38, 77],       // See ./src/config.js for examples
      classNames: classesName,    // defaults to coco classes for yolo v3, tiny yolo v2, v3 and voc classes for tiny yolo v1
      inputSize: 416,       // defaults to 416
    });
    // console.log(typeof this.boxes)

    // Display detected boxes
    this.boxes.forEach(box => {
      // @ts-ignore
      const {
        top,
        left,
        bottom,
        right,
        width,
        height,
        score: score,
        class: classes,
      } = box;
      // console.log(box)
      console.log(top, left, bottom, right, width, height, score, classes);
    });
    ItemDetect.dispose();

    this.digitReg();

  }


  async getNumbyAPI(img, name) {
    const effect = {
      contrast: 0.5,
      saturation: 0
    };
    let img64 = img.src;
    vintagejs(img64, effect)
      .then(res => {
        img64 = res.getDataURL();
      });
    // console.log(img64)
    let numberOfObject = 0;
    await $.ajax({
      type: 'POST',
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      url: this.proxy + 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
      data: {
        access_token: this.ACCESS_TOKEN,
        image: img64.replace('data:image/jpeg;base64,', ''),
        probability: true,
        language_type: 'ENG'
      },
      success(res) {
        console.log(res);
        const results = res;
        let topPro = 0;
        let topRes = 1;
        results.words_result.forEach((result) => {
          if (result.probability.average > topPro && result.words.match('[^0-9]') == null) {
            topPro = result.probability.average;
            topRes = parseInt(result.words, 10);
          }
        });
        numberOfObject = topRes;
      },
      error(res) {
        numberOfObject = 1;

      }
      // dataType: 'JSON'
    });
    return numberOfObject;
  }

  getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio) {
    /* the parameters:
    - the image element
    - the new width
    - the new height
    - the x point we start taking pixels
    - the y point we start taking pixels
    - the ratio */
    // set up canvas for thumbnail
    const tnCanvas = document.createElement('canvas');
    const tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth;
    tnCanvas.height = newHeight;

    /* use the sourceCanvas to duplicate the entire image.
    This step was crucial for iOS4 and under devices.
    Follow the link at the end of this post to see what happens when you don’t do this */
    const bufferCanvas = document.createElement('canvas');
    const bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0);

    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    tnCanvasContext.drawImage(bufferCanvas, startX, startY, newWidth * ratio, newHeight * ratio, 0, 0, newWidth, newHeight);
    return tnCanvas.toDataURL('image/jpeg');
    // From https://www.codewoody.com/posts/2543/
  }

  downLoad(url, name) {
    const oA = document.createElement('a');
    oA.download = name; // 设置下载的文件名，默认是'下载'
    oA.href = url;
    document.body.appendChild(oA);
    oA.click();
    oA.remove(); // 下载之后把创建的元素删除
  }

  async toMaterialCalc() {
    if (!this.detectedItemList || this.detectedItemList.length === 0) {
      this.snackbar.show({
        message: '材料为空，请先输入需求。',
        actionText: '好的',
        multiline: false,
        actionOnBottom: false
      });
      return;
    }
    const data = this.fetchService.getLocalStorage('m-data', {});
    if (Object.keys(data).length === 0) {
      this.snackbar.show({
        message: '请先打开一次材料计算页面。',
        actionText: '好的',
        multiline: false,
        actionOnBottom: false
      });
      return;
    }
    for (const m of this.detectedItemList) {
      if (!m[0]) {
        continue;
      }
      console.log(m[0]);
      try {
        const name = this.getMaterialInfo(m[0]);
        if (name === m[0]) {
          continue;
        }
        data[name].have = m[1];
      } catch (e) {
        console.error(e);
        continue;
      }
    }
    this.fetchService.setLocalStorage('m-data', data);
    this.fetchService.setLocalStorage('m-option', {
      showOnly3plus: true,
      filtered: true,
      showMat: true,
      showChip: true,
      showBook: true
    });
    this.router.navigateByUrl('/material');
  }

  getMaterialInfo(name) {
    for (const k in this.items) {
      if (this.items[k]) {
        if (this.items[k].icon === name) {
          return this.items[k].name;
        }
      }
    }
    // console.warn("Unable to find proper name")
    return name;
  }


}


