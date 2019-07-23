import { Component, OnInit } from '@angular/core';
import { MdcSnackbarService } from '@blox/material';
import { FetchService } from '../fetch.service';
import { Router } from '@angular/router';
import { MaterialInfo } from '../model/materialinfo';

// TODO:可调整识别结果

@Component({
  selector: 'app-auto-detect',
  templateUrl: './auto-detect.component.html',
  styleUrls: ['./auto-detect.component.scss']
})
export class AutoDetectComponent implements OnInit {


  detectedItemList = [];
  ImageLoaded = false;
  mIdx: { [key: string]: MaterialInfo };
  items = [];
  boxes;
  imageSrc;
  resultList = [];

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


    this.fetchService.getJson('./assets/data/material.json').subscribe(data => {
      this.items = [];
      for (const k in data) {
        if (data[k]) {
          this.items.push(data[k]);
        }
      }
    });

  }

  // 图片预览
  previewImage(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        // const image: HTMLImageElement = document.createElement("img");
        // image.src = reader.r;
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 1200;

          // calculate new size
          const width = img.width > img.height ? maxSize : (maxSize * img.width / img.height);
          const height = img.width > img.height ? (maxSize * img.height / img.width) : maxSize;

          // resize the canvas to the new dimensions
          canvas.width = width;
          canvas.height = height;

          // scale & draw the image onto the canvas

          ctx.drawImage(img, 0, 0, width, height);
          this.imageSrc = canvas.toDataURL('image/jpeg');
        };
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }


  async objectRegonition() {
    this.fetchService.postJson('https://rest.graueneko.xyz:1443/aktools/detect', {
      image: this.imageSrc
    }).subscribe(result => {
      if (result.error) {
        this.snackbar.show({
          message: '服务器内部错误，请重试',
          actionText: '好的',
          multiline: false,
          actionOnBottom: false
        });
        return;
      }
      const resultList = result.itemList;
      for (const item of resultList) {
        let dulplicate = false;
        if (isNaN(item[2])) {
          item[2] = 1;
        }
        for (const existed of this.detectedItemList) {
          if (existed[0] === item[0]) {
            dulplicate = true;
            if (existed[2] < item[2]) {
              existed[2] = item[2];
              existed[1] = item[1];
            }
            break;
          }
        }
        if (!dulplicate) {
          this.detectedItemList.push(item);
        }
      }
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

}


