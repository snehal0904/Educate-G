import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { SchemaService } from '../services/data/schema.service';
import { GeneralService } from '../services/general/general.service';


@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() searchSchemas!: any;
  @Input() showTabs: boolean = false;
  @Input() defaultItems: any;
  @Output() submitFilter = new EventEmitter();

  searchJson;
  filtered = [];
  activeTabIs: string;
  responseData: any; //schemaResponse

  fields: FormlyFieldConfig[] = [];
  data: any = []; //fieldGroupData

  privateFields;
  cardFields = [];
  form = new FormGroup({});
  model: any = {};
  dropdownList = [];
  selectedItems = [];

  dropdownSettings = {
    singleSelection: false,
    text: this.translate.instant("SELECT_FILTER"),
    selectAllText: this.translate.instant("SELECT_ALL"),
    unSelectAllText: this.translate.instant("UNSELECT_ALL"),
    searchPlaceholderText: this.translate.instant("SEARCH"),
    enableSearchFilter: true,
    noDataLabel: this.translate.instant("FILTER_NOT_AVAILABLE"),
    classes: "myclass custom-class"
  };
  constructor(
    public schemaService: SchemaService,
    public translate: TranslateService,
    public generalService: GeneralService
  ) { }

  ngOnInit() {
    this.schemaService.getSearchJSON().subscribe((searchSchemas) => {
      this.searchSchemas = searchSchemas;

      Object.keys(this.searchSchemas.searches).forEach((key) => {
        this.searchJson = this.searchSchemas.searches[key];

        Object.keys(this.searchJson).forEach((key1) => {
          this.filtered.push(this.searchJson[key1]);

          if (this.searchJson[key1]?.activeTab === 'active') {
            this.activeTabIs = this.searchJson[key1].tab;
          }
        });
      });

      this.schemaService.getSchemas().subscribe((res) => {
        this.responseData = res;
        console.log("schema Response", this.responseData);
        this.showFilter();
      });
    });
  }

  showFilter() {
    let list = [];
    this.filtered.forEach((fieldset, index) => {
      if (this.filtered[index].tab === this.activeTabIs) {
        this.data.push({
          fieldGroupClassName: 'row', fieldGroup: []
        });

        if (this.filtered[index].hasOwnProperty('privateFields')) {
          this.privateFields = this.responseData.definitions[this.filtered[index]['privateFields']]?.privateFields ?? [];
        }

        fieldset.filters.forEach((filter) => {

          if (this.privateFields !== [] && !this.privateFields.includes('$.' + filter.propertyPath)) {
            let fieldObj = {
              key: filter.key,
              type: 'input',
              className: 'col-sm-4',
              templateOptions: {
                label: this.translate.instant(filter.title),
              }
            }

            list.push({ "id": filter.key, "itemName": this.translate.instant(filter.title), "data": fieldObj });

            if (filter.default) {
              this.data[0].fieldGroup.push(fieldObj);
              this.selectedItems.push({ "id": filter.key, "itemName": this.translate.instant(filter.title) });
            }
          }
        });
        this.fields = [this.data[0]];
        fieldset.results.fields.forEach((fields) => {
          if (this.privateFields != [] && !this.privateFields.includes('$.' + fields.property)) {
            this.cardFields.push(fields);
          }
        });
      }
    });
    this.dropdownList = [...list];
  }

  createFilterRequest() { // search with filters
    let request = {
      "filters": {}
    }
    Object.keys(this.model).forEach((key) => {
      this.filtered.forEach((fieldset, index) => {

        if (this.filtered[index].tab == this.activeTabIs) {
          fieldset.filters.forEach((filter) => {

            if (key === filter.key && this.model[key]) {
              request.filters[filter.propertyPath] = { "startsWith": this.model[key] };
            }
          });
        }
      });
    });

    this.submitFilter.emit(request);
  }

  onSubmit() {
    this.createFilterRequest();
  }

  /* Filter Methods */
  onTabChange(event, activeTabIs) {
    this.cardFields = [];
    this.fields = [];
    this.data = [];
    this.dropdownList = [];
    this.selectedItems = [];
    this.model = {};
    this.activeTabIs = activeTabIs;
    event.preventDefault();
    this.showFilter();
  }

  resetModel(index?) {
    this.model = {};
    this.createFilterRequest();
  }

  resetData() {
    this.fields = [];
    this.resetModel();
  }

  onItemSelect(item: any) {
    this.data[0].fieldGroup.push(item.data);
    this.fields = [this.data[0]];
  }

  onItemDeSelect(item: any) {
    this.fields = this.data[0].fieldGroup.filter((obj) => obj.key !== item.id);
    this.data[0].fieldGroup = [...this.fields];
  }

  onSelectAll(items: any) {
    this.data[0].fieldGroup = [];
    for (let i = 0; i < items.length; i++) {
      this.data[0].fieldGroup.push(items[i].data);
    }
    this.fields = [this.data[0]];
  }

  onDeSelectAll(items: any) {
    this.data[0].fieldGroup = [];
    this.model = {};
    this.createFilterRequest();
  }
}
