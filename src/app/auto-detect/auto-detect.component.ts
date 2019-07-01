import { Component, OnInit } from '@angular/core';
import {Tesseract} from 'tesseract.ts';
import * as tf from '@tensorflow/tfjs';
import { yolov3Tiny } from 'tfjs-yolov3'
import a from '../../assets/models/tfjs-yolov3/classes.js';
import * as $ from "jquery"

@Component({
  selector: 'app-auto-detect',
  templateUrl: './auto-detect.component.html',
  styleUrls: ['./auto-detect.component.scss']
})
export class AutoDetectComponent implements OnInit {
  constructor() { }

  ngOnInit() {
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
  }

  digitReg() {

    Tesseract.recognize('./assets/img/w1T.jpg', {
      lang: 'eng0',
      // tessedit_char_blacklist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,<>/?+=*!@#$%^&*()',
      tessedit_char_whitelist: '1234567890'
      // tessedit_pageseg_mode: 'PSM_AUTO'
    })
    // tslint:disable-next-line:only-arrow-functions
      .then(function(result) {
        console.log(result);
      });
  }
  async testTf() {
    const yolo = await yolov3Tiny({modelUrl:'./assets/models/Yolo-identify/model.json',anchors:[37,61, 21,65, 37,42, 28,57, 376,370, 38,77]})
    //const inputImage = './assets/img/w1T.jpg';

    // @ts-ignore
    const boxes = await yolo(document.getElementById("loadedimg"));

// Display detected boxes
    boxes.forEach(box => {
      const {
        top,
        left,
        bottom,
        right,
        width,
        height,
        scores,
        classes,
      } = box;

      console.log(top,left, bottom, right, width, height, scores, classes,)
    });
    /*
    const model = await tf.loadLayersModel('./assets/models/Yolo-identify/model.json');
    //const example = tf.fromPixels(webcamElement);  // for example
    const imageElement = document.getElementById("loadedimg");
    // @ts-ignore
    let img = tf.browser.fromPixels(imageElement).toFloat();
    //const offset = tf.scalar(127.5);
    //const normalized = img.sub(offset).div(offset);

    // Reshape to a single-element batch so we can pass it to predict.
    const batched = img.reshape([1, 832, 832, 3]);
    const prediction = model.predict(batched);
    console.log(prediction)*/
  }

  Onupdate(){
    var fileInput = document.getElementById('test-image-file');
    /*
    $.ajax({
      type : 'post',
      url : '/uploadUserImgPre',
      data: FormData ,
      processData:false,
      async:false,
      cache: false,
      contentType: false,
      success:function(re){
        re.imgSrc = re.imgSrc.replace('public','');
        re.imgSrc = re.imgSrc.replace(/\\/g,'\/');
        $('#j_imgPic').attr('src',re.imgSrc);
      },
      error:function(re){
        console.log(re);
      }
    });
    */

    // @ts-ignore
      console.log(fileInput.value)

      // @ts-ignore
      //loaded.src = fileInput.value;

  }


}
