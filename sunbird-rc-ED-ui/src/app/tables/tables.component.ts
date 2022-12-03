import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { GeneralService } from '../services/general/general.service';

import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { Location } from '@angular/common';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import dayjs from 'dayjs';
import { ExportToCsv } from 'export-to-csv';
import * as _ from 'lodash-es';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent implements OnInit {
  table: any;
  entity: any;
  tab: string = 'attestation';
  tableSchema: any;
  apiUrl: any;
  tabUrl: any;
  model: any;
  Data: string[] = [];
  property: any[] = [];
  field;
  public csvExporter: any;
  public tableData = [];

  page: number = 1;
  limit: number = 100;
  identifier: any;
  layout: string;
  isPreview: boolean = false;
  isLoading = false;
  name = '';
  form = new FormGroup({});
  modelInterview: any;
  options: FormlyFormOptions = {};
  listName: any;
  fields: FormlyFieldConfig[] = [];
  isEdit: boolean = false;
  responseData: any;
  token: any;
  filterData: any;
  roleCheck = false;
  sort: string = '';

  constructor(
    public location: Location,
    public router: Router,
    public toastMsg: ToastMessageService,
    private route: ActivatedRoute,
    public generalService: GeneralService,
    public schemaService: SchemaService,
    public keycloak: KeycloakService
  ) {}
  sortTable(colName) {
    if (this.sort === '' || this.sort === 'asc') {
      this.model = _.orderBy(this.model, [colName], ['desc']);
      this.addData();
      this.sort = 'desc';
    } else {
      this.model = _.orderBy(this.model, [colName], ['asc']);
      this.addData();
      this.sort = 'asc';
    }
  }
  ngOnInit(): void {
    this.keycloak.loadUserProfile().then((res) => {
      this.roleCheck = this.keycloak.isUserInRole(
        'Report-manager',
        res['username']
      );
    });

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.tabUrl = this.router.url;
    if (this.tabUrl.includes('Prerak')) {
      this.listName = 'PrerakList';
    } else if (this.tabUrl.includes('AGV8')) {
      this.listName = 'AGList';
    }
    this.route.params.subscribe(async (params) => {
      this.table = params['table'].toLowerCase();
      if (this.table == 'admin-attestation') {
      }
      this.entity = params['entity'].toLowerCase();
      this.tab = this.tabUrl
        .replace(this.table, '')
        .replace(this.entity, '')
        .split('/')
        .join('');
      this.schemaService.getTableJSON().subscribe(async (TableSchemas) => {
        let filtered = TableSchemas.tables.filter((obj) => {
          return Object.keys(obj)[0] === this.table;
        });
        this.tableSchema = filtered[0][this.table];
        this.apiUrl = this.tableSchema.api;
        this.limit = filtered[0].hasOwnProperty(this.limit)
          ? filtered[0].limit
          : this.limit;
        await this.getData();
      });
    });

    this.schemaService
      .getJSONData('/assets/config/ui-config/interview.json')
      .subscribe((res) => {
        this.responseData = res.definitions.Interview.properties;
        let _self = this;
        Object.keys(this.responseData).forEach(function (key) {
          let fieldVal = _self.responseData[key];
          let option = [];

          if (fieldVal.hasOwnProperty('enum')) {
            for (let i = 0; i < fieldVal.enum.length; i++) {
              option.push({ value: fieldVal.enum[i], label: fieldVal.enum[i] });
            }
            _self.fields.push({
              key: key,
              type: 'select',
              templateOptions: {
                label: fieldVal.title,
                // placeholder: fieldVal.placeholder,
                // description: fieldVal.description,
                // required: true,
                options: option,
              },
            });
          } else {
            _self.fields.push({
              key: key,
              type: 'input',
              templateOptions: {
                // placeholder: fieldVal.placeholder,
                // description: fieldVal.description,
                // required: true,
                label: fieldVal.title,
              },
            });
          }
        });
      });
  }

  submitInterviewData(modelInterview) {
    let data = {
      vfsTeamName: modelInterview['vfsTeamName'],
      mcqWhyDoYouWantPragatiPrerak:
        modelInterview['mcqWhyDoYouWantPragatiPrerak'],
      freeTextWhyDoYouWantPragatiPrerak:
        modelInterview['freeTextWhyDoYouWantPragatiPrerak'],
      mcqPastExperience: modelInterview['mcqPastExperience'],
      freeTextPastExperience: modelInterview['freeTextPastExperience'],
      mcqNgoExperience: modelInterview['mcqNgoExperience'],
      freeTextNgoExperience: modelInterview['freeTextNgoExperience'],
      mcqYearOfNgoExperience: modelInterview['mcqYearOfNgoExperience'],
      mcqSectorOfNgoExperience: modelInterview['mcqSectorOfNgoExperience'],
      mcqPrimaryStakeholder: modelInterview['mcqPrimaryStakeholder'],
      mcqEngagementType: modelInterview['mcqEngagementType'],
      mcqTeachingExpierience: modelInterview['mcqTeachingExpierience'],
      freeTextTeachingExpierience:
        modelInterview['freeTextTeachingExpierience'],
      mcqYearOfTeachingExpierience:
        modelInterview['mcqYearOfTeachingExpierience'],
      mcqTeachingEngagementType: modelInterview['mcqTeachingEngagementType'],
      mcqPrimaryStakeholderType: modelInterview['mcqPrimaryStakeholderType'],
      mcqTrainingExpierience: modelInterview['mcqTrainingExpierience'],
      freeTextTrainingExpierience:
        modelInterview['freeTextTrainingExpierience'],
      mcqTrainingProvider: modelInterview['mcqTrainingProvider'],
      mcqTrainingDuration: modelInterview['mcqTrainingDuration'],
      mcqTrainingContent: modelInterview['mcqTrainingContent'],
      mcqPastExperienceWillHelp: modelInterview['mcqPastExperienceWillHelp'],
      mcqPocPastExperience: modelInterview['mcqPocPastExperience'],
      freeTextNameOfPoc: modelInterview['freeTextNameOfPoc'],
      digitMobNoOfPoc: modelInterview['digitMobNoOfPoc'],
      mcqRelationshipWithThePOC: modelInterview['mcqRelationshipWithThePOC'],
    };
    // this.model['sorder']  = this.exLength;
    this.generalService
      .postData('/PrerakV2/' + this.identifier, data)
      .subscribe(
        (res) => {
          if (res.params.status == 'SUCCESSFUL' && !this.model['attest']) {
          } else if (
            res.params.errmsg != '' &&
            res.params.status == 'UNSUCCESSFUL'
          ) {
            this.toastMsg.error('error', res.params.errmsg);
          }
        },
        (err) => {
          this.toastMsg.error('error', err.error.params.errmsg);
        }
      );
  }

  openPreview(item, row) {
    this.isEdit = false;
    this.isPreview = true;

    this.identifier = item.id;
    this.layout = 'PrerakV2';
  }

  openEdit(item, row) {
    this.identifier = '';
    this.isEdit = true;
    this.isPreview = false;

    this.identifier = item.id;
    this.layout = 'PrerakV2';
  }

  addPrerak() {
    localStorage.setItem('id', '');
    localStorage.setItem('isAdminAdd', 'true');
  }

  addAG() {
    localStorage.setItem('id', '');
    localStorage.setItem('isAGAdd', 'true');
    // this.router.navigate(['/profile/AG2/(claim:add/AG-add)'])
    // this.router.navigate('/profile/AG2/(claim:add/AG-add)')
  }

  getPrerakData(item, data) {
    this.identifier = item.id;
  }

  getData(request = { filters: {} }) {
    this.isLoading = true;
    let url;
    if (this.entity) {
      url = this.apiUrl;
    } else {
      console.log('Something went wrong');
      return;
    }

    if (url.toLowerCase().includes('search')) {
      this.generalService.postData(url, request).subscribe((res) => {
        this.model = res;
        this.addData();
      });
    } else {
      this.generalService.getData(url).subscribe((res) => {
        this.model = res;
        this.addData();
      });
    }
  }

  addData() {
    let tempArray;
    let tempObject;
    this.property = [];
    this.model.forEach((element) => {
      tempArray = [];
      this.tableSchema.fields.forEach((field) => {
        tempObject = field;

        if (tempObject.name) {
          tempObject['value'] = this.getKeyPath(element, field.keyPath);
          tempObject['status'] = element['status'];
        }

        if (tempObject.formate) {
          tempObject['formate'] = field.formate;
        }

        if (tempObject.custom) {
          if (tempObject.type === 'button') {
            if (tempObject.redirectTo && tempObject.redirectTo.includes(':')) {
              let urlParam = tempObject.redirectTo.split(':');
              urlParam.forEach((paramVal, index) => {
                if (paramVal in element) {
                  urlParam[index] = element[paramVal];
                }
              });
              urlParam[1] = element['osid'];
              tempObject['redirectToUrl'] = urlParam
                .join('/')
                .replace('//', '/');
              tempObject['id'] = element.osid;
            }
          }
          tempObject['type'] = field.type;
        }
        tempArray.push(this.pushData(tempObject));
      });

      this.property.push(tempArray);
    });

    this.tableSchema.items = this.property;
    this.isLoading = false;
  }

  pushData(data) {
    let object = {};
    for (let key in data) {
      if (data.hasOwnProperty(key)) object[key] = data[key];
    }
    return object;
  }

  onSubmit(event) {
    this.getData(event);
  }

  getKeyPath(element, keyPath) {
    var propertySplit = keyPath.split('.');

    let fieldValue = [];

    if (propertySplit.length > 1) {
      for (let j = 0; j < propertySplit.length; j++) {
        let a = propertySplit[j];

        if (j == 0 && element.hasOwnProperty(a)) {
          fieldValue = element[a];
        } else if (fieldValue.hasOwnProperty(a)) {
          fieldValue = fieldValue[a];
        } else if (fieldValue[0]) {
          let arryItem = [];
          if (fieldValue.length > 0) {
            for (let i = 0; i < fieldValue.length; i++) {}

            fieldValue = arryItem;
          } else {
            fieldValue = fieldValue[a];
          }
        } else {
          fieldValue = [];
        }
      }
      return fieldValue;
    } else {
      return element[keyPath];
    }
  }
  downloadPrerakCSVFile() {
    this.name = `prerak_with_interviewDetails_${dayjs().format(
      'YYYY-MM-DD_HH_mm'
    )}`;
    let arr = [];
    let finalarr = [];
    this.model.forEach((element) => {
      arr = [];
      let obj = [];
      obj['PrerakID'] = element.osid ? element.osid : '';
      obj['fullname'] = element.fullName ? element.fullName : '';
      obj['mobile'] = element.mobile ? element.mobile : '';
      obj['parentOrganization'] = element.parentOrganization
        ? element.parentOrganization
        : '';
      if (element.address) {
        obj['district'] = element.address.district
          ? element.address.district
          : '';
      } else {
        obj['district'] = '';
      }
      console.log('ele-----', element);
      obj['qualification'] = element.qualification ? element.qualification : '';
      obj['gender'] = element.gender ? element.gender : '';
      obj['sourcingChannel'] = element.sourcingChannel
        ? element.sourcingChannel
        : '';
      obj['referrerIfApplicable'] = element.referrerIfApplicable
        ? element.referrerIfApplicable
        : '';
      obj['relationshipWithTheCandidate'] = element.relationshipWithTheCandidate
        ? element.relationshipWithTheCandidate
        : '';
      obj['candidateStatus'] = element.candidateStatus
        ? element.candidateStatus
        : '';
      obj['vfsMemberName'] = element.vfsMemberName ? element.vfsMemberName : '';
      obj['numberOfAttempts'] = element.numberOfAttempts
        ? element.numberOfAttempts
        : '';
      obj['callStatus'] = element.callStatus ? element.callStatus : '';
      obj['explainRROfPrerak'] = element.explainRROfPrerak
        ? element.explainRROfPrerak
        : '';
      obj['userInterestedRole'] = element.userInterestedRole
        ? element.userInterestedRole
        : '';
      obj['reasonForNotInterested'] = element.reasonForNotInterested
        ? element.reasonForNotInterested
        : '';
      obj['descForNotInterested'] = element.descForNotInterested
        ? element.descForNotInterested
        : '';
      obj['confirmName'] = element.confirmName ? element.confirmName : '';
      obj['confirmPhoneNumber'] = element.confirmPhoneNumber
        ? element.confirmPhoneNumber
        : '';
      obj['alternateMobileNumber'] = element.alternateMobileNumber
        ? element.alternateMobileNumber
        : '';
      obj['confirmQualification'] = element.confirmQualification
        ? element.confirmQualification
        : '';
      obj['whenToCallNextOrOtherNotes'] = element.whenToCallNextOrOtherNotes
        ? element.whenToCallNextOrOtherNotes
        : '';
      obj['accessToMobNo'] = element.accessToMobNo ? element.accessToMobNo : '';
      if (element.confirmAddress) {
        obj['confirmDistrict'] = element.confirmAddress.district
          ? element.confirmAddress.district
          : '';
        obj['confirmBlock'] = element.confirmAddress.block
          ? element.confirmAddress.block
          : '';
        obj['confirmVillage'] = element.confirmAddress.village
          ? element.confirmAddress.village
          : '';
      } else {
        obj['confirmDistrict'] = ' ';
        obj['confirmBlock'] = ' ';
        obj['confirmVillage'] = ' ';
      }

      if (element.interviewDetails?.length >= 0) {
        obj['vfsTeamName'] = element.interviewDetails[0].vfsTeamName
          ? element.interviewDetails[0].vfsTeamName
          : '';
        obj['mcqWhyDoYouWantPragatiPrerak'] = element.interviewDetails[0]
          .mcqWhyDoYouWantPragatiPrerak
          ? element.interviewDetails[0].mcqWhyDoYouWantPragatiPrerak
          : '';

        obj['mcqPastExperienceVolunteering'] = element.interviewDetails[0]
          .mcqPastExperienceVolunteering
          ? element.interviewDetails[0].mcqPastExperienceVolunteering
          : '';

        obj['mcqNgoExperience'] = element.interviewDetails[0].mcqNgoExperience
          ? element.interviewDetails[0].mcqNgoExperience
          : '';
        obj['freeTextNgoExperience'] = element.interviewDetails[0]
          .freeTextNgoExperience
          ? element.interviewDetails[0].freeTextNgoExperience
          : '';
        obj['mcqYearOfNgoExperience'] = element.interviewDetails[0]
          .mcqYearOfNgoExperience
          ? element.interviewDetails[0].mcqYearOfNgoExperience
          : '';
        obj['mcqSectorOfNgoExperience'] = element.interviewDetails[0]
          .mcqSectorOfNgoExperience
          ? element.interviewDetails[0].mcqSectorOfNgoExperience
          : '';
        obj['mcqPrimaryStakeholder'] = element.interviewDetails[0]
          .mcqPrimaryStakeholder
          ? element.interviewDetails[0].mcqPrimaryStakeholder
          : '';
        obj['mcqEngagementType'] = element.interviewDetails[0].mcqEngagementType
          ? element.interviewDetails[0].mcqEngagementType
          : '';
        obj['mcqPastTeachingExperience'] = element.interviewDetails[0]
          .mcqPastTeachingExperience
          ? element.interviewDetails[0].mcqPastTeachingExperience
          : '';
        obj['freeTextTeachingExpierience'] = element.interviewDetails[0]
          .freeTextTeachingExpierience
          ? element.interviewDetails[0].freeTextTeachingExpierience
          : '';
        obj['mcqYearOfTeachingExpierience'] = element.interviewDetails[0]
          .mcqYearOfTeachingExpierience
          ? element.interviewDetails[0].mcqYearOfTeachingExpierience
          : '';
        obj['mcqTeachingEngagementType'] = element.interviewDetails[0]
          .mcqTeachingEngagementType
          ? element.interviewDetails[0].mcqTeachingEngagementType
          : '';
        obj['mcqPrimaryStakeholderType'] = element.interviewDetails[0]
          .mcqPrimaryStakeholderType
          ? element.interviewDetails[0].mcqPrimaryStakeholderType
          : '';
        obj['mcqTrainingExpierience'] = element.interviewDetails[0]
          .mcqTrainingExpierience
          ? element.interviewDetails[0].mcqTrainingExpierience
          : '';
        obj['freeTextTrainingExpierience'] = element.interviewDetails[0]
          .freeTextTrainingExpierience
          ? element.interviewDetails[0].freeTextTrainingExpierience
          : '';
        obj['mcqTrainingProvider'] = element.interviewDetails[0]
          .mcqTrainingProvider
          ? element.interviewDetails[0].mcqTrainingProvider
          : '';
        obj['mcqTrainingDuration'] = element.interviewDetails[0]
          .mcqTrainingDuration
          ? element.interviewDetails[0].mcqTrainingDuration
          : '';
        obj['mcqTrainingContent'] = element.interviewDetails[0]
          .mcqTrainingContent
          ? element.interviewDetails[0].mcqTrainingContent
          : '';
        obj['mcqAnyOtherExperience'] = element.interviewDetails[0]
          .mcqAnyOtherExperience
          ? element.interviewDetails[0].mcqAnyOtherExperience
          : '';
        obj['freeTextExplainAboutYourExperience'] = element.interviewDetails[0]
          .freeTextExplainAboutYourExperience
          ? element.interviewDetails[0].freeTextExplainAboutYourExperience
          : '';
        obj['mcqPastExperienceWillHelp'] = element.interviewDetails[0]
          .mcqPastExperienceWillHelp
          ? element.interviewDetails[0].mcqPastExperienceWillHelp
          : '';
        obj['mcqPocPastExperience'] = element.interviewDetails[0]
          .mcqPocPastExperience
          ? element.interviewDetails[0].mcqPocPastExperience
          : '';
        obj['freeTextNameOfPoc'] = element.interviewDetails[0].freeTextNameOfPoc
          ? element.interviewDetails[0].freeTextNameOfPoc
          : '';
        obj['digitMobNoOfPoc'] = element.interviewDetails[0].digitMobNoOfPoc
          ? element.interviewDetails[0].digitMobNoOfPoc
          : '';
        obj['mcqRelationshipWithThePOC'] = element.interviewDetails[0]
          .mcqRelationshipWithThePOC
          ? element.interviewDetails[0].mcqRelationshipWithThePOC
          : '';
      }

      finalarr.push(obj);
    });

    const options = {
      filename: this.name,
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: false,
      headers: [
        'PrerakID',
        'full Name',
        'Mobile',
        'parentOrganization',
        'District',
        'Qualification',
        'Gender',
        'Sourcing Channel',
        'Referrer If Applicable',
        'Relationship With The Candidate',
        'Candidate Status',
        'VFS Member Name',
        'Number Of Attempts',
        'Call Status',
        'Explain RR Of Prerak',
        'User Interested Role',
        'Reason For Not Interested',
        'Desc For Not Interested',
        'Confirm Name',
        'Confirm Phone Number',
        'Alternate Mobile Number',
        'Confirm Qualification',
        'When To Call Next Or Other Notes',
        'Access To Mobile No',
        'Confirm District',
        'Confirm Block',
        'Confirm Village',
        'VFS team name',
        'Why do you want to be a Pragati Prerak?',
        'Past experience of volunteering?',
        'NGO experience',
        'NGO experience details',
        'Year of NGO experience',
        'Sector of NGO experience',
        'Primary stakeholder',
        'Engagement type',
        'Past experience of teaching ?',
        'Teaching experience ',
        'Years of teaching experience',
        'Teaching engagement type',
        ' Primary stakeholder type',
        'Past experience of training',
        'Teaching experience',
        'Training provider',
        'Training duration',
        'Training content/objective',
        'Any other experience?',
        'Explain about your experience',
        'How do you think your past experience will help you in role as Prerak?',
        'Can you share details of a POC from any of the past experiences for a reference check?',
        'Name of the POC',
        'Mobile number of POC',
        'Relationship with the POC',
      ],
    };
    this.csvExporter = new ExportToCsv(options);
    this.csvExporter.generateCsv(finalarr);
  }

  async downloadAGCSVFile() {
    this.name = `Ags_${dayjs().format('YYYY-MM-DD_HH_mm')}`;
    let arr = [];
    let finalarr = [];

    // osid_data.forEach(async (element, index) => {
    //   await this.generalService.postData("PrerakV2/search", {"filters":{"osid":{"contains":element?.osid}}}).subscribe(
    //     (res) => {
    //       console.log("all_data",res);
    //       osid_data[index]["parentOrganization"] = res[0]["parentOrganization"]
    //       // if(!element.prerakName){
    //       //   element.prerakName = res[0]["fullName"]
    //       // }
    //       // if(!element.prerakId){
    //       //   element.prerakId = res[0]["osid"]
    //       // }
    //       // if(!element.parentOrganization){
    //       //   element.parentOrganization = res[0]["parentOrganization"]
    //       // }
    //     })
    // })
    var osid_data = [];
    var osUpdated = false;
    await this.generalService
      .postData('PrerakV2/search', { filters: {} })
      .subscribe((res) => {
        // console.log("all_data",res);
        res.forEach((element) => {
          let osid_tmp = {};
          if (element?.fullName) {
            osid_tmp['prerakName'] = element['fullName'];
          }
          if (element?.parentOrganization) {
            osid_tmp['parentOrganization'] = element['parentOrganization'];
          }
          if (element?.osid) {
            osid_tmp['prerakId'] = element['osid'];
          }
          if (element?.osOwner) {
            osid_tmp['osOwner'] = element['osOwner'];
          }
          osid_data.push(osid_tmp);
        });
        osUpdated = true;
        if (osUpdated) {
          console.log('osid_data', osid_data);
          this.model.forEach(async (element) => {
            console.log(
              "element['osOwner']===",
              element['osid'],
              '    ',
              element['osOwner']
            );
            arr = [];
            let obj = [];
            let prerak_obj = osid_data.find(
              (o) =>
                o.osOwner.includes(element['osOwner'][1]) ||
                o.osOwner.includes(element['osOwner'][0])
            );

            if (prerak_obj) {
              if (!element.prerakName) {
                element.prerakName = prerak_obj['prerakName'];
              }
              if (!element.prerakId) {
                element.prerakId = prerak_obj['prerakId'];
              }

              if (
                !element.parentOrganization ||
                element.parentOrganization == ''
              ) {
                element.parentOrganization = prerak_obj['parentOrganization'];
              }
            }

            obj['campId'] = element.campId ? element.campId : '';
            obj['AGId'] = element.osid ? element.osid : '';
            obj['prerakId'] = element.prerakId ? element.prerakId : '';
            obj['prerakName'] = element.prerakName ? element.prerakName : '';
            obj['parentOrganization'] = element.parentOrganization
              ? element.parentOrganization
              : '';

            obj['AGfullName'] = element.AGfullName ? element.AGfullName : '';
            obj['dob'] = element.dob ? element.dob : '';
            obj['category'] = element.category ? element.category : '';

            if (element.AgAddress) {
              obj['District'] = element.AgAddress.district
                ? element.AgAddress.district
                : '';
              obj['Block'] = element.AgAddress.block
                ? element.AgAddress.block
                : '';
              obj['Village'] = element.AgAddress.village
                ? element.AgAddress.village
                : '';
            } else {
              obj['District'] = ' ';
              obj['Block'] = ' ';
              obj['Village'] = ' ';
            }
            obj['PanchayatList'] = element.PanchayatList
              ? element.PanchayatList
              : '';
            obj['maritalStatus'] = element.maritalStatus
              ? element.maritalStatus
              : '';
            obj['connectVia'] = element.connectVia ? element.connectVia : '';

            obj['fatherFullName'] = element.fatherFullName
              ? element.fatherFullName
              : '';
            obj['motherFullName'] = element.motherFullName
              ? element.motherFullName
              : '';
            obj['parentsMobileNumber'] = element.parentsMobileNumber
              ? element.parentsMobileNumber
              : '';
            obj['parentsWhatsappNumber'] = element.parentsWhatsappNumber
              ? element.parentsWhatsappNumber
              : '';
            obj['mobileAvailablity'] = element.mobileAvailablity
              ? element.mobileAvailablity
              : '';

            obj['AGWhatsappNumber'] = element.AGWhatsappNumber
              ? element.AGWhatsappNumber
              : '';
            obj['lastStandardOfEducation'] = element.lastStandardOfEducation
              ? element.lastStandardOfEducation
              : '';

            obj['lastStandardOfEducationYear'] =
              element.lastStandardOfEducationYear
                ? element.lastStandardOfEducationYear
                : '';
            obj['reasonOfLeavingEducation'] = element.reasonOfLeavingEducation
              ? element.reasonOfLeavingEducation
              : '';
            obj['whereStudiedLast'] = element.whereStudiedLast
              ? element.whereStudiedLast
              : '';

            obj['किशोरी की पंजीकरण की स्थिति'] = element.registrationStatus
              ? element.registrationStatus
              : '';

            if (element.AGDocumentsV3) {
              if (Array.isArray(element.AGDocumentsV3)) {
                element.AGDocumentsV3.forEach((element) => {
                  obj[element.document] = element.document
                    ? element.document
                    : '';
                  obj[element.document + '-Status'] = element.status
                    ? element.status
                    : '';
                  obj[element.document + '-Doc number'] =
                    element.document_number ? element.document_number : '';
                });
              } else {
                obj[
                  'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)Marksheet_CBO_HighSchool'
                ] = element.AGDocumentsV3.Marksheet_CBO_HighSchool
                  ? element.AGDocumentsV3.Marksheet_CBO_HighSchool
                  : '';
                obj[
                  'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Status'
                ] = '';
                obj[
                  'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Doc number'
                ] = '';
                obj['आधार कार्ड-Status'] = '';
                obj['आधार कार्ड-Doc number'] = '';
                obj['आधार कार्ड'] = element.AGDocumentsV3.aadhar
                  ? element.AGDocumentsV3.aadhar
                  : '';
                obj['2 फोटो-Status'] = '';
                obj['2 फोटो-Doc number'] = '';
                obj['2 फोटो'] = element.AGDocumentsV3.photo
                  ? element.AGDocumentsV3.photo
                  : '';

                obj['जनाधार कार्ड-Status'] = '';
                obj['जनाधार कार्ड-Doc number'] = '';
                obj['जनाधार कार्ड'] = element.AGDocumentsV3.janadharCard
                  ? element.AGDocumentsV3.janadharCard
                  : '';

                obj['किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)-Status'] =
                  '';
                obj[
                  'किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)-Doc number'
                ] = '';
                obj['किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)'] = element
                  .AGDocumentsV3.bankPassbook
                  ? element.AGDocumentsV3.bankPassbook
                  : '';
                obj['ईमेल आईडी-Status'] = '';
                obj['ईमेल आईडी-Doc number'] = '';
                obj['ईमेल आईडी'] = element.AGDocumentsV3.emailId
                  ? element.AGDocumentsV3.emailId
                  : '';
                obj['टीसी'] = element.AGDocumentsV3.TC
                  ? element.AGDocumentsV3.TC
                  : '';
                obj['टीसी-Status'] = '';
                obj['टीसी-Doc number'] = '';

                obj['मार्कशीट'] = element.AGDocumentsV3.markSheet
                  ? element.AGDocumentsV3.markSheet
                  : '';
                obj['मार्कशीट-Status'] = '';
                obj['मार्कशीट-Doc number'] = '';

                obj['जन्मा प्रमाण पत्-Status'] = '';
                obj['जन्मा प्रमाण पत्-Doc number'] = '';
                obj['जन्मा प्रमाण पत्'] = element.AGDocumentsV3.birthCertificate
                  ? element.AGDocumentsV3.birthCertificate
                  : '';
                obj['जाती प्रमाण पत्र'] = element.AGDocumentsV3.castCertificate
                  ? element.AGDocumentsV3.castCertificate
                  : '';
                obj['जाती प्रमाण पत्र-Status'] = '';
                obj['जाती प्रमाण पत्र-Doc number'] = '';

                obj['राशन कार्ड'] = element.AGDocumentsV3.rationCard
                  ? element.AGDocumentsV3.rationCard
                  : '';
                obj['राशन कार्ड-Status'] = '';
                obj['राशन कार्ड-Doc number'] = '';

                obj['BPL प्रमाण पत्र'] = element.AGDocumentsV3.BPLCard
                  ? element.AGDocumentsV3.BPLCard
                  : '';
                obj['BPL प्रमाण पत्र-Status'] = '';
                obj['BPL प्रमाण पत्र-Doc number'] = '';
              }
            } else {
              obj[
                'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)'
              ] = '';
              obj[
                'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Status'
              ] = '';
              obj[
                'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Doc number'
              ] = '';
              obj[
                'मार्कशीट (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)'
              ] = '';
              obj[
                'मार्कशीट (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Status'
              ] = '';
              obj[
                'मार्कशीट (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Doc number'
              ] = '';
              obj['आधार कार्ड'] = '';
              obj['आधार कार्ड-Status'] = '';
              obj['आधार कार्ड-Doc number'] = '';
              obj['2 फोटो'] = '';
              obj['2 फोटो-Status'] = '';
              obj['2 फोटो-Doc number'] = '';
              obj['जनाधार कार्ड'] = '';
              obj['जनाधार कार्ड-Status'] = '';
              obj['जनाधार कार्ड-Doc number'] = '';
              obj['किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)'] = '';
              obj['किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)-Status'] = '';
              obj['किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)-Doc number'] =
                '';
              obj['मोबाइल नंबर'] = '';
              obj['मोबाइल नंबर-Status'] = '';
              obj['मोबाइल नंबर-Doc number'] = '';
              obj['ईमेल आईडी'] = '';
              obj['ईमेल आईडी-Status'] = '';
              obj['ईमेल आईडी-Doc number'] = '';
              obj['टीसी'] = '';
              obj['टीसी-Status'] = '';
              obj['टीसी-Doc number'] = '';
              obj['मार्कशीट'] = '';
              obj['मार्कशीट-Status'] = '';
              obj['मार्कशीट-Doc number'] = '';
              obj['जन्मा प्रमाण पत्'] = '';
              obj['जन्मा प्रमाण पत्-Status'] = '';
              obj['जन्मा प्रमाण पत्-Doc number'] = '';
              obj['जाती प्रमाण पत्र'] = '';
              obj['जाती प्रमाण पत्र-Status'] = '';
              obj['जाती प्रमाण पत्र-Doc number'] = '';
              obj['राशन कार्ड'] = '';
              obj['राशन कार्ड-Status'] = '';
              obj['राशन कार्ड-Doc number'] = '';
              obj['BPL प्रमाण पत्र'] = '';
              obj['BPL प्रमाण पत्र-Status'] = '';
              obj['BPL प्रमाण पत्र-Doc number'] = '';
            }
            if (element.AgRegistrationForm && element.AgRegistrationForm[0]) {
              obj[
                'क्या किशोरी के द्वारा RSOS/NIOS पंजीकरण फॉर्म जमा किया गया है'
              ] = element.AgRegistrationForm[0].isRSOS_NIOSFormSubmitted
                ? element.AgRegistrationForm[0].isRSOS_NIOSFormSubmitted
                : '';
              obj[
                'जमा किए गए RSOS/NIOS रजिस्ट्रेशन फॉर्म की रसीद की एक तस्वीर प्रदान करें'
              ] = element.AgRegistrationForm[0].RSOS_NIOSFormPhoto
                ? element.AgRegistrationForm[0].RSOS_NIOSFormPhoto
                : '';
              obj['निम्न में से चुने की किशोरी कौनसी परीक्षा में भाग लेगी'] =
                element.AgRegistrationForm[0].examChoice
                  ? element.AgRegistrationForm[0].examChoice
                  : '';
              if (element.AgRegistrationForm[0].subjects) {
                obj['subjects'] =
                  element.AgRegistrationForm[0]?.subjects?.toString();
              } else {
                obj['subjects'] = '';
              }
              obj['RSOS/NIOS रजिस्ट्रेशन फॉर्म के अनुसार जन्मतिथि'] = element
                .AgRegistrationForm[0].birthDateOnRSOS_NIOSForm
                ? element.AgRegistrationForm[0].birthDateOnRSOS_NIOSForm
                : '';
              obj[
                'क्या RSOS/NIOS रजिस्ट्रेशन आईडी / क्रमांक प्राप्त हो गयी है'
              ] = element.AgRegistrationForm[0].isRSOS_NIOSRegIdReceived
                ? element.AgRegistrationForm[0].isRSOS_NIOSRegIdReceived
                : '';
              obj['किशोरी का RSOS/NIOS रजिस्ट्रेशन आईडी / क्रमांक दर्ज करें'] =
                element.AgRegistrationForm[0].RSOS_NIOSRegId
                  ? element.AgRegistrationForm[0].RSOS_NIOSRegId
                  : '';
            } else {
              obj[
                'क्या किशोरी के द्वारा RSOS/NIOS पंजीकरण फॉर्म जमा किया गया है'
              ] = '';
              obj[
                'जमा किए गए RSOS/NIOS रजिस्ट्रेशन फॉर्म की रसीद की एक तस्वीर प्रदान करें'
              ] = '';
              obj['निम्न में से चुने की किशोरी कौनसी परीक्षा में भाग लेगी'] =
                '';
              obj['RSOS/NIOS रजिस्ट्रेशन फॉर्म के अनुसार जन्मतिथि'] = '';
              obj[
                'क्या RSOS/NIOS रजिस्ट्रेशन आईडी / क्रमांक प्राप्त हो गयी है'
              ] = '';
              obj['किशोरी का RSOS/NIOS रजिस्ट्रेशन आईडी / क्रमांक दर्ज करें'] =
                '';
            }

            finalarr.push(obj);
          });
          const options = {
            filename: this.name,
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true,
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: false,
            headers: [
              'campId',
              'AGId',
              'prerakId',
              'prerakName',
              'parentOrganization',
              'AGfullName',
              'dob',
              'category',
              'District',
              'Block',
              'Village',
              'PanchayatList',
              'maritalStatus',
              'connectVia',
              'fatherFullName',
              'motherFullName',
              'parentsMobileNumber',
              'parentsWhatsappNumber',
              'mobileAvailablity',
              'AGWhatsappNumber',
              'lastStandardOfEducation',
              'lastStandardOfEducationYear',
              'reasonOfLeavingEducation',
              'whereStudiedLast',
              'किशोरी की पंजीकरण की स्थिति',

              'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)',
              'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Status',
              'टीसी (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Doc number',

              'मार्कशीट (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)',
              'मार्कशीट (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Status',
              'मार्कशीट (CBO या उच्चतर माध्यमिक सरकारी स्कूल के प्रधानाचार्य द्वारा भेरिफाइड और हस्ताक्षरित)-Doc number',

              'आधार कार्ड',
              'आधार कार्ड-Status',
              'आधार कार्ड-Doc number',

              '2 फोटो',
              '2 फोटो-Status',
              '2 फोटो-Doc number',

              'जनाधार कार्ड',
              'जनाधार कार्ड-Status',
              'जनाधार कार्ड-Doc number',

              'किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)',
              'किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)-Status',
              'किशोरी का बैंक पासबुक (स्वयं या संयुक्त खाता)-Doc number',

              'मोबाइल नंबर',
              'मोबाइल नंबर-Status',
              'मोबाइल नंबर-Doc number',

              'ईमेल आईडी',
              'ईमेल आईडी-Status',
              'ईमेल आईडी-Doc number',

              'टीसी',
              'टीसी-Status',
              'टीसी-Doc number',

              'मार्कशीट',
              'मार्कशीट-Status',
              'मार्कशीट-Doc number',

              'जन्मा प्रमाण पत्',
              'जन्मा प्रमाण पत्-Status',
              'जन्मा प्रमाण पत्-Doc number',

              'जाती प्रमाण पत्र',
              'जाती प्रमाण पत्र-Status',
              'जाती प्रमाण पत्र-Doc number',

              'राशन कार्ड',
              'राशन कार्ड-Status',
              'राशन कार्ड-Doc number',

              'BPL प्रमाण पत्र',
              'BPL प्रमाण पत्र-Status',
              'BPL प्रमाण पत्र-Doc number',

              'क्या किशोरी के द्वारा RSOS/NIOS पंजीकरण फॉर्म जमा किया गया है',
              'जमा किए गए RSOS/NIOS रजिस्ट्रेशन फॉर्म की रसीद की एक तस्वीर प्रदान करें',
              'निम्न में से चुने की किशोरी कौनसी परीक्षा में भाग लेगी',
              'subjects',
              'RSOS/NIOS रजिस्ट्रेशन फॉर्म के अनुसार जन्मतिथि',
              'क्या RSOS/NIOS रजिस्ट्रेशन आईडी / क्रमांक प्राप्त हो गयी है',
              'किशोरी का RSOS/NIOS रजिस्ट्रेशन आईडी / क्रमांक दर्ज करें',
            ],
          };
          this.csvExporter = new ExportToCsv(options);
          this.csvExporter.generateCsv(finalarr);
        }
      });
  }
  hasWhiteSpace(s) {
    return /\s/.test(s);
  }
}
