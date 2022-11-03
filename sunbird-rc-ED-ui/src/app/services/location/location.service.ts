import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SchemaService } from '../data/schema.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  readDistrict: any;
  districtList: any = [];
  blockList: any = [];
  location: any;
  villageList: any = [];
  blockItems: any = {
    null: [],
  };
  villageItems: any = {
    null: [],
  };

  constructor(private schemaService: SchemaService) {
    this.readLocationJson();
  }

  readLocationJson() {
    this.schemaService
      .getJSONData('/assets/config/ui-config/location.json')
      .subscribe((json) => {
        this.location = json;

        //  For-loop for district
        for (let i = 0; i < this.location.length; i++) {
          this.districtList.push({
            value: this.location[i]['district'],
            label: this.location[i]['district'],
          });

          if (this.location[i].hasOwnProperty('block')) {
            let tempDist = this.location[i]['district'];
            this.blockItems[tempDist] = [];

            for (let l = 0; l < this.location[i].block.length; l++) {
              this.blockItems[tempDist].push({
                value: this.location[i].block[l].name,
                label: this.location[i].block[l].name,
              });

              //  console.log(this.blockItems);

              if (this.location[i].block[l].hasOwnProperty('village')) {
                let tempBlock = this.location[i].block[l].name;
                this.villageItems[tempBlock] = [];

                for (
                  let k = 0;
                  k < this.location[i].block[l].village.length;
                  k++
                ) {
                  this.villageItems[tempBlock].push({
                    value: this.location[i].block[l].village[k],
                    label: this.location[i].block[l].village[k],
                  });
                }
              }
            }

            //  For-loop for Blocks
            /*  for (let j = 0; j < this.location[i].block.length; j++) {

            this.blockList.push({
              value: this.location[i].block[j].name,
              label: this.location[i].block[j].name,
              district: this.location[i]['district']
            })


            if (this.location[i].block[j].hasOwnProperty('village')) {

              //  For-loop for village
              for (let k = 0; k < this.location[i].block[j].village.length; k++) {

                this.villageList.push({
                  value: this.location[i].block[j].village[k],
                  label: this.location[i].block[j].village[k],
                  block: this.location[i].block[j].name
                })
              } //village for-loop
            }

          }//block for-loop  */
          }
        } //district for-loop

        //  console.log(this.districtList);
        //  console.log(this.blockList);
      });
  }

  getDistrict() {
    return this.districtList;
  }

  getBlock(district: string = null): Observable<any> {
    if (district) {
      return of(this.blockItems[district]);
    } else {
      return of([]);
    }
  }

  getVillege(block: string = null): Observable<any> {
    if (block) {
      return of(this.villageItems[block]);
    } else {
      return of([]);
    }
  }

  getBlock1(district: string = null) {
    return of(
      this.blockList.filter((entry) => {
        if (district) {
          return entry.district === district;
        } else {
          return true;
        }
      })
    );
  }

  getVillege1(block: string = null) {
    // console.log(this.villageList);
    return of(
      this.villageList.filter((entry) => {
        if (block) {
          return entry.block === block;
        } else {
          return true;
        }
      })
    );
  }
}
