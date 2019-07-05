import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
//import { yolov3Tiny as yolov3Tiny_item }  from 'src/assets/models/tfjs-yolov3';
//import { yolov3Tiny as yolov3Tiny_num} from 'src/assets/tfjs-yolov3/';
import nums from "./num.js";
import classesName from "./itemList.js"
import yolo from 'tfjs-yolo'
import itemList from "./itemList";
import * as $ from "jquery";
import {MdcSnackbarService} from "@blox/material";
import {FetchService} from "../fetch.service";
import {Router} from "@angular/router";
import { MaterialInfo } from '../model/materialinfo';
import itemName from "./itemNameList.js"

@Component({
  selector: 'app-auto-detect',
  templateUrl: './auto-detect.component.html',
  styleUrls: ['./auto-detect.component.scss']
})
export class AutoDetectComponent implements OnInit {

  detectedItemList = new Array(new Array())

  private ACCESS_TOKEN = '24.d13d0147a0c455d1ff0ad9e6cffb9d03.2592000.1564799928.282335-16699672'
  proxy="https://rest.graueneko.xyz/proxy/"
  ImageLoaded = false
  mIdx: { [key: string]: MaterialInfo };
  constructor(private fetch: FetchService, private snackbar: MdcSnackbarService, private router: Router) { }

  async ngOnInit() {
    //testing
    //this.detectedItemList = [['MTL_SL_DS',2,1],['MTL_SL_RUSH4',3,1],['MTL_SL_KETONE2',3,1],['MTL_SL_BN',2,1],['MTL_SL_RUSH1',3,1],['MTL_SL_STRG4',3,1],['MTL_SKILL2',1,1]]

    var loaded = document.getElementById("loadedimg")
    var file = document.querySelector('#test-image-file');
    file.addEventListener('change', previewImage, false);
// 图片预览
    function previewImage(event) {
      var reader = new FileReader();
      reader.onload = function (event) {
        console.log("loaded");
        // @ts-ignore
        (loaded as HTMLImageElement).src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
    // @ts-ignore
    /*loaded.src = './assets/img/i1.jpg'

    const test = await yolo.v3tiny('./assets/models/numtfjs3/model.json')
    // @ts-ignore
    var result = await test(loaded)
    console.log(result)
    result.forEach(box => {
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
      console.log(box)
      console.log(top,left, bottom, right, width, height, score, classes,)
    });*/
    // const numDetect = yolov3Tiny({modelUrl:'./assets/models/numtfjs/model.json',anchors:[21,34 ,27,47 ,29,40 ,32,49 ,25,39 ,23,42]})
    /*var changed = document.getElementById("changed");
    // @ts-ignore
    changed.src = "./assets/img/i1.jpg"
    const numDetect = await yolo.v3tiny('./assets/models/numtfjsnew/model.json')
    var result = await numDetect.predict(changed,{
      maxBoxes: 10,          // defaults to 20
      scoreThreshold: .1,   // defaults to .5
      iouThreshold: .3,     // defaults to .3
      numClasses: 10,       // defaults to 80 for yolo v3, tiny yolo v2, v3 and 20 for tiny yolo v1
      anchors: [21,34 ,27,47 ,29,40 ,32,49 ,25,39 ,23,42],       // See ./src/config.js for examples
      classNames: nums,    // defaults to coco classes for yolo v3, tiny yolo v2, v3 and voc classes for tiny yolo v1
      inputSize: 320,       // defaults to 416
    })
    result.forEach(box => {
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
      console.log(box)
      //console.log(top,left, bottom, right, width, height, score, classes,)
    });
    console.log(result)*/

    //this.testNum(changed, numDetect,"name")
    // console.log(numDetect(changed))
  }

  async digitReg() {
    var loaded = document.getElementById("loadedimg")
    var changed = document.getElementById("changed")
    try {
      if (this.boxes.length == 0 ){
        console.log("Empty!");
        return
      }
      var boxlist = new Array()
      let count = 0
      this.boxes.forEach(box => {
        boxlist.push(box)
        let {
          top,
          left,
          bottom,
          right,
          width,
          height,
          score: score,
          class: classes,
        } = box;
      })
      for (let i = 0;i<boxlist.length;i++) {
        let {
          top,
          left,
          bottom,
          right,
          width,
          height,
          score: score,
          class: classes,
        } = boxlist[i];

          // @ts-ignore
          let size = Math.max(Math.ceil(width), Math.ceil(height))
          // @ts-ignore
          changed.src = await this.getImagePortion(loaded, size, size, Math.ceil(left),Math.ceil(top) , 1);
          // @ts-ignore
        // time = new Date()
        // @ts-ignore
        //this.downLoad(changed.src,'a'+time.getTime())
        //  count++
          //console.log(changed.src)

          let count = await this.testNum(changed,classes)
          return count
          /*console.log(count)
=======
          let count = await this.testNum(changed,classes)
          //return count
          console.log(count)
>>>>>>> Stashed changes

          let dulplicate = false
          for (let i = 0; i< this.detectedItemList.length;i++){
            if(this.detectedItemList[i][0]==classes){
              dulplicate=true
              if(this.detectedItemList[i][2]>=score)
                continue;
              this.detectedItemList[i][1] = count;
              return
            }
          }

<<<<<<< Updated upstream
          this.detectedItemList.push([classes,parseInt(count),score])
          console.log("Success")*/
          this.detectedItemList.push([classes,count,Math.round(score*100)])
          console.log("Success")

        }

    }catch (e) {
      if(e == TypeError)
        console.error("Nothing Detected");
      else
        console.error("Unknown Error: "+ e);
    }

  };


boxes;
  async testTf() {
    // @ts-ignore
    const ItemDetect = await yolo.v3tiny('./assets/models/Yolo-identify/model.json')//,anchors:[37,61, 21,65, 37,42, 28,57, 376,370, 38,77]})

    //const inputImage = './assets/img/w1T.jpg';

    // @ts-ignore
    this.boxes = await ItemDetect.predict(document.getElementById("loadedimg"),{
      maxBoxes: 30,          // defaults to 20
      scoreThreshold: .25,   // defaults to .5
      iouThreshold: .3,     // defaults to .3
      numClasses: 86,       // defaults to 80 for yolo v3, tiny yolo v2, v3 and 20 for tiny yolo v1
      anchors: [37,61, 21,65, 37,42, 28,57, 376,370, 38,77],       // See ./src/config.js for examples
      classNames: classesName,    // defaults to coco classes for yolo v3, tiny yolo v2, v3 and voc classes for tiny yolo v1
      inputSize: 416,       // defaults to 416
    });
    //console.log(typeof this.boxes)

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
      //console.log(box)
      console.log(top,left, bottom, right, width, height, score, classes,)
    });
    ItemDetect.dispose()
    this.digitReg()
  }

  async testNum(img,name){
    let img64 = img.src.replace('data:image/jpeg;base64,','')
    console.log(img64)
    //console.log(img64)
    let numberOfObject = 0
    await $.ajax({
      type: 'POST',
      headers: {"Content-type":"application/x-www-form-urlencoded"},
      url: this.proxy+'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
      data: {
        access_token : this.ACCESS_TOKEN,
        image : img64,
        probability:true,
        language_type:'ENG'
      },
      success: function (res) {
        console.log(res)
        try {
          var results = res

        }catch (e) {
          console.error(e)
          console.warn(res)
        }
        let topPro = 0
        let topRes = 0
        results["words_result"].forEach(function (result) {
          if (result["probability"]["average"]>topPro && result["words"].match('[^0-9]') == null){
            topPro = result["probability"]["average"]
            topRes = result["words"]
          }
        })
        numberOfObject = topRes;
        return
      },
      error:function (res) {
        numberOfObject = 0
        return
      }
      //dataType: 'JSON'
    });
    /*var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
    httpRequest.open('POST', 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token='+this.ACCESS_TOKEN+"&jsoncallback=?", true); //第二步：打开连接
    httpRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
    httpRequest.send(' image='+img.src.replace('data:image/!*;base64,',''));//发送请求 将情头体写在send中
    /!**
     * 获取数据后的处理程序
     *!/
    httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
      if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
        var json = httpRequest.responseText;//获取到服务端返回的数据
        console.log(json);
      }
    };*/

    /*const numRes = await detector.predict(
      img,
      {
        maxBoxes: 20,          // defaults to 20
        scoreThreshold: .01,   // defaults to .5
        iouThreshold: .05,     // defaults to .3
        numClasses: 10,       // defaults to 80 for yolo v3, tiny yolo v2, v3 and 20 for tiny yolo v1
        anchors: [21,34 ,27,47 ,29,40 ,32,49 ,25,39 ,23,42],       // See ./src/config.js for examples
        classNames: nums,    // defaults to coco classes for yolo v3, tiny yolo v2, v3 and voc classes for tiny yolo v1
        inputSize: 320,       // defaults to 416
      });
    try {
      numRes.forEach(box => {
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

        console.log(name +":" +classes)
        return classes
      });
    }catch (e) {
      const {
        top,
        left,
        bottom,
        right,
        width,
        height,
        score: score,
        class: classes,
      } = numRes;
      console.log(numRes)
      console.log(top,left, bottom, right, width, height, score, classes,)
      console.log(name + ":"+ classes)
      if (numRes == undefined){
        console.log("Num fail")
        return '0'
      }
      return classes
    }*/

  }

  getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio){
    /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
    //set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth; tnCanvas.height = newHeight;

    /* use the sourceCanvas to duplicate the entire image. This step was crucial for iOS4 and under devices. Follow the link at the end of this post to see what happens when you don’t do this */
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0);

    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth * ratio, newHeight * ratio,0,0,newWidth,newHeight);
    return tnCanvas.toDataURL("image/jpeg");
    //From https://www.codewoody.com/posts/2543/
  }

  downLoad(url,name){
    var oA = document.createElement("a");
    oA.download = name;// 设置下载的文件名，默认是'下载'
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
    const data = this.fetch.getLocalStorage('m-data', {});
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
      if (m[0] == undefined)
        continue
      console.log(m[0])
      try{
        let name = this.getMaterialInfo(m[0])
        data[name].have = m[1];
      }catch (e) {
        console.error(e)
        continue
      }
    }
    this.fetch.setLocalStorage('m-data', data);
    this.fetch.setLocalStorage('m-option', {
      showOnly3plus: true,
      filtered: true,
      showMat: true,
      showChip: true,
      showBook: true
    });
    this.router.navigateByUrl('/material');
  }

  getMaterialInfo(name){
    for(let i = 0;i<itemName.length;i++){
      if(itemName[i].split(":")[0] == name)
        return itemName[i].split(":")[1]
    }
  }


}


