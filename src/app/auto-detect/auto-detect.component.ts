import { Component, OnInit } from '@angular/core';
import {Tesseract} from 'tesseract.ts';
import * as tf from '@tensorflow/tfjs';
import { yolov3Tiny } from 'tfjs-yolov3'
import a from '../../assets/models/tfjs-yolov3/classes.js';
@Component({
  selector: 'app-auto-detect',
  templateUrl: './auto-detect.component.html',
  styleUrls: ['./auto-detect.component.scss']
})
export class AutoDetectComponent implements OnInit {
  constructor() { }

  ngOnInit() {
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
    const inputImage = './assets/img/w1T.jpg';

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


}
