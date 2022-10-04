import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { GeneralService } from '../services/general/general.service';
// import * as TableSchemas from './tables.json'

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {
  table: any;
  entity: any;
  tab: string = 'attestation'
  tableSchema: any;
  apiUrl: any;
  model: any;
  Data: string[] = [];
  property: any[] = [];
  field;

  page: number = 1;
  limit: number = 10;
  identifier: any;
  layout: string;
  isPreview: boolean;
  isLoading = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public generalService: GeneralService,
    public schemaService: SchemaService
  ) { }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let tabUrl = this.router.url;
    this.route.params.subscribe(async params => {
      this.table = params['table'].toLowerCase();
      this.entity = params['entity'].toLowerCase();
      this.tab = tabUrl.replace(this.table, "").replace(this.entity, "").split("/").join("");
      this.schemaService.getTableJSON().subscribe(async (TableSchemas) => {
        let filtered = TableSchemas.tables.filter(obj => {
          return Object.keys(obj)[0] === this.table
        })
        this.tableSchema = filtered[0][this.table]
        this.apiUrl = this.tableSchema.api;
        this.limit = filtered[0].hasOwnProperty(this.limit) ? filtered[0].limit : this.limit;
        await this.getData();
      })
    });
  }

  openPreview(item) {
    this.identifier = item.id;
    this.layout = 'Prerak';
  }

  close() {
    alert('hi');
  }

  getData(request = { filters: {} }) {
    this.isLoading = true;
    let url;
    if (this.entity) {
      url = this.apiUrl
    } else {
      console.log("Something went wrong");
      return;
    }

    if (url.toLowerCase().includes('search')) {
      this.generalService.postData(url, request).subscribe((res) => {
        this.model = res;
        this.addData()
      });
    } else {
      this.generalService.getData(url).subscribe((res) => {
        this.model = res;
        this.addData()
      });
    }
  }

  addData() {
    let tempArray;
    let tempObject;
    this.property = []; 
    this.model.forEach(element => {
      tempArray = [];
      this.tableSchema.fields.forEach((field) => {
        tempObject = field;

        if (tempObject.name) {
          tempObject['value'] = element[field.name]
          tempObject['status'] = element['status']
        }

        if (tempObject.formate) {
          tempObject['formate'] = field.formate
        }

        if (tempObject.custom) {
          if (tempObject.type === "button") {
            if (tempObject.redirectTo && tempObject.redirectTo.includes(":")) {
              let urlParam = tempObject.redirectTo.split(":")
              urlParam.forEach((paramVal, index) => {
                if (paramVal in element) {
                  urlParam[index] = element[paramVal]
                }
              });
              tempObject['redirectToUrl'] = urlParam.join("/").replace("//", "/");
              tempObject['id'] = element.osid;
            }
          }
          tempObject['type'] = field.type
        }
        tempArray.push(this.pushData(tempObject));
      });
      this.property.push(tempArray)
    });

    this.tableSchema.items = this.property;
    this.isLoading = false;
  }

  pushData(data) {
    let object = {};
    for (let key in data) {
      if (data.hasOwnProperty(key))
        object[key] = data[key];
    }
    return object;
  }

  onSubmit(event) {
    this.getData(event);
  }

}
