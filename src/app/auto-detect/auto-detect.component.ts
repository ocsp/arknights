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
  ImageLoaded = false;
  mIdx: { [key: string]: MaterialInfo };
  items = [];
  boxes;

  constructor(private fetchService: FetchService, private snackbar: MdcSnackbarService, private router: Router) {
  }

  async ngOnInit() {
    // TestONLY
    this.detectedItemList = [['MTL_SL_DS',2,1],
    ['MTL_SL_RUSH4',3,1],
    ['MTL_SL_KETONE2',3,1],
    ['MTL_SL_BN',2,1],
    ['MTL_SL_RUSH1',3,1],
    ['MTL_SL_STRG4',3,1],
    ['MTL_SKILL2',1,1]]

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


  async objectRegonition() {
    const loaded = document.getElementById('loadedimg');
    // @ts-ignore
    var img64 = loaded.src
    var resultList = []
    await $.ajax({
      type: 'POST',
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      url: 'https://rest.graueneko.xyz/aktools/detect',
      data: {
        image: img64
      },
      success:function(res) {
        if(resultList['error']){
          console.warn("Server Internal Error")
          this.snackbar.show({
              message: '服务器内部错误，请重试',
            actionText: '好的',
            multiline: false,
            actionOnBottom: false
          });
        }
        resultList = res['itemList']
        //console.log(res)
        for(let i = 0;i<resultList.length;i++){
          let dulplicate = false;
          for (let j = 0;j<this.detectedItemList.length;j++) {
            if (this.detectedItemList[j][0] === resultList[i][0]) {
              dulplicate = true;
              if (this.detectedItemList[j][2] >= resultList[i][2]) {
                continue;
              }
              this.detectedItemList[j][2] = resultList[i][2]
              this.detectedItemList[j][1] = resultList[i][1];
              return;
            }
          }
          this.detectedItemList.push(resultList[i]);
        }

      },
      error:function(res) {
        // @ts-ignore
        alert('错误:'+res.status + " " + res.statusText)
      }
      // dataType: 'JSON'
    });
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
  update(item){

  }

}


