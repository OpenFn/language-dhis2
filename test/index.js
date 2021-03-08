import { expect } from 'chai';
import { dataValue } from '@openfn/language-common';
import {
  execute,
  getData,
  upsert,
  upsertTEI,
  create,
  attribute,
  update,
  patch,
  del,
  getMetadata,
  getSchema,
  getResources,
  getAnalytics,
  discover,
  generateDhis2UID,
  getDataValues,
  createEvents,
  enrollTEI,
} from '../lib/Adaptor';
import nock from 'nock';
import {
  upsertNewState,
  upsertExistingState,
  upsertExistingTEIState,
  upsertNewTEIState,
  createState,
  updateState,
  patchState,
  delState,
  getState,
  createBulkUnrelatedDataValues,
  createRelatedDataValues,
  createEventsState,
  sendDataForMultipleEventsState,
  enrollTEIState,
} from './ClientFixtures';
import { result } from 'lodash';
import { prettyJson } from '../src/Utils';
import { createDataValues } from '../src/Adaptor';

describe('execute', () => {
  it('executes each operation in sequence', done => {
    let state = {
      configuration: {
        hostUrl: 'https://play.dhis2.org/demo',
      },
    };
    let operations = [
      state => {
        return { counter: 1 };
      },
      state => {
        return { counter: 2 };
      },
      state => {
        return { counter: 3 };
      },
    ];

    execute(...operations)(state)
      .then(finalState => {
        expect(finalState).to.eql({ counter: 3 });
      })
      .then(done)
      .catch(done);
  });

  it('assigns references, data to the initialState', () => {
    let state = {
      configuration: {
        hostUrl: 'https://play.dhis2.org/demo',
      },
    };

    let finalState = execute()(state);

    execute()(state).then(finalState => {
      expect(finalState).to.eql({
        configuration: {
          hostUrl: 'https://play.dhis2.org/demo',
        },
        references: [],
        data: null,
      });
    });
  });
});

describe('live adaptor testing', () => {
  // before ALL tests run, we must re-configure the dhis2 environment
  before(function () {
    this.timeout(30000);
    let state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.35.0',
      },
    };

    const permissions = {
      id: 'xE7jOejl9FI',
      userCredentials: {
        id: 'ZyjSDLHGPv4',
        userInfo: {
          id: 'xE7jOejl9FI',
        },
        cogsDimensionConstraints: [
          {
            id: 'C31vHZqu0qU',
          },
          {
            id: 'SooXFOUnciJ',
          },
        ],
        catDimensionConstraints: [
          {
            id: 'yY2bQYqNt0o',
          },
          {
            id: 'eLwL77Z9E7R',
          },
          {
            id: 'LFsZ8v5v7rq',
          },
        ],
        username: 'admin',
        externalAuth: false,
        userRoles: [
          {
            id: 'UYXOT4A7JMI',
          },
          {
            id: 'Ufph3mGRmMo',
          },
          {
            id: 'Euq3XfEIEbx',
          },
          {
            id: 'aNk5AyC7ydy',
          },
          {
            id: 'cUlTcejWree',
          },
          {
            id: 'TMK9CMZ2V98',
          },
          {
            id: 'Ql6Gew7eaX6',
          },
          {
            id: 'Pqoy4DLOdMK',
          },
          {
            id: 'DRdaVRtwmG5',
          },
          {
            id: 'jRWSNIHdKww',
          },
          {
            id: 'txB7vu1w2Pr',
          },
          {
            id: 'xJZBzAHI88H',
          },
          {
            id: 'XS0dNzuZmfH',
          },
        ],
      },
      surname: 'Traore',
      firstName: 'John',
      email: 'john.traore@mail.com',
      whatsApp: '+123123123123',
      facebookMessenger: 'john.traore',
      skype: 'john.traore',
      telegram: 'john.traore',
      twitter: 'john.traore',
      organisationUnits: [
        {
          id: 'ImspTQPwCqd',
        },
      ],
      dataViewOrganisationUnits: [],
      userGroups: [
        {
          id: 'Kk12LkEWtXp',
        },
        {
          id: 'M1Qre0247G3',
        },
        {
          id: 'NTC8GjJ7p8P',
        },
        {
          id: 'B6JNeAQ6akX',
        },
        {
          id: 'wl5cDMuUhmF',
        },
        {
          id: 'QYrzIjSfI8z',
        },
        {
          id: 'lFHP5lLkzVr',
        },
        {
          id: 'jvrEwEJ2yZn',
        },
        {
          id: 'vAvEltyXGbD',
        },
        {
          id: 'w900PX10L7O',
        },
        {
          id: 'GogLpGmkL0g',
        },
        {
          id: 'vRoAruMnNpB',
        },
        {
          id: 'z1gNAf2zUxZ',
        },
        {
          id: 'gXpmQO6eEOo',
        },
        {
          id: 'tH0GcNZZ1vW',
        },
        {
          id: 'H9XnHoWRKCg',
        },
        {
          id: 'ZoHNWQajIoe',
        },
        {
          id: 'th4S6ovwcr8',
        },
        {
          id: 'wAAA1agEHin',
        },
        {
          id: 'zz6XckBrLlj',
        },
        {
          id: 'qlEhuAA77gc',
        },
        {
          id: 'ZrsVF7IJ93y',
        },
        {
          id: 'sZRhXMPbcWc',
        },
        {
          id: 'Rg8wusV7QYi',
        },
        {
          id: 'YCPJDwzbe8T',
        },
        {
          id: 'k3xzluFKVyw',
        },
        {
          id: 'GZSvMCVowAx',
        },
        {
          id: 'pBnkuih0c1K',
        },
        {
          id: 'hj0nnsVsPLU',
        },
        {
          id: 'L4XTzgbdza3',
        },
        {
          id: 'Iqfwd3j2qe5',
        },
      ],
      teiSearchOrganisationUnits: [
        {
          id: 'ImspTQPwCqd',
        },
      ],
      attributeValues: [],
      birthday: '1971-04-08T00:00:00.000',
      education: 'Master of super using',
      gender: 'gender_male',
      jobTitle: 'Super user',
      lastUpdated: '2021-03-08T08:36:44.531',
      employer: 'DHIS',
      introduction: 'I am the super user of DHIS 2',
      languages: 'English',
      created: '2013-04-18T17:15:08.407',
      lastCheckedInterpretations: '2021-03-08T08:36:44.531',
      nationality: 'Sierra Leone',
      interests: 'Football, swimming, singing, dancing',
    };

    const userRoles = {
      access: {
        read: true,
        update: true,
        externalize: false,
        delete: true,
        write: true,
        manage: true,
      },
      created: '2019-04-25T14:22:00.262',
      displayName: 'Superuser',
      publicAccess: 'rw------',
      description: 'Superuser',
      lastUpdated: '2020-07-28T07:49:49.374',
      name: 'Superuser',
      id: 'Ufph3mGRmMo',
      lastUpdatedBy: { id: 'GOLswS44mh8' },
      user: { id: 'GOLswS44mh8' },
      userGroupAccesses: [],
      authorities: [
        'F_PROGRAM_INDICATOR_PUBLIC_ADD',
        'F_SQLVIEW_EXECUTE',
        'F_USER_VIEW',
        'F_GENERATE_MIN_MAX_VALUES',
        'F_VALIDATIONRULE_PUBLIC_ADD',
        'F_CATEGORY_PRIVATE_ADD',
        'F_INDICATORGROUPSET_PUBLIC_ADD',
        'F_DATAVALUE_DELETE',
        'F_EXTERNAL_MAP_LAYER_PRIVATE_ADD',
        'F_RELATIONSHIPTYPE_DELETE',
        'F_CATEGORY_OPTION_PRIVATE_ADD',
        'F_CATEGORY_OPTION_GROUP_PUBLIC_ADD',
        'F_GIS_ADMIN',
        'M_dhis-web-event-capture',
        'F_SEND_EMAIL',
        'F_ORGUNITGROUPSET_PRIVATE_ADD',
        'F_INDICATOR_DELETE',
        'M_dhis-web-event-reports',
        'F_VIEW_UNAPPROVED_DATA',
        'F_USERGROUP_MANAGING_RELATIONSHIPS_VIEW',
        'F_OPTIONGROUPSET_DELETE',
        'F_USERGROUP_PUBLIC_ADD',
        'F_PROGRAM_INDICATOR_GROUP_PRIVATE_ADD',
        'F_DOCUMENT_EXTERNAL',
        'F_TRACKED_ENTITY_ATTRIBUTE_PUBLIC_ADD',
        'F_PROGRAM_INDICATOR_DELETE',
        'F_MOBILE_SENDSMS',
        'F_TRACKED_ENTITY_ADD',
        'F_TRACKED_ENTITY_MANAGEMENT',
        'F_VALIDATIONRULEGROUP_PUBLIC_ADD',
        'F_REPORT_EXTERNAL',
        'F_DOCUMENT_PRIVATE_ADD',
        'M_dhis-web-reports',
        'F_TRACKED_ENTITY_DELETE',
        'F_USERGROUP_DELETE',
        'F_PROGRAM_PRIVATE_ADD',
        'F_CATEGORY_COMBO_PRIVATE_ADD',
        'F_SCHEDULING_SEND_MESSAGE',
        'F_EXTERNAL_MAP_LAYER_PUBLIC_ADD',
        'F_PROGRAM_INDICATOR_GROUP_DELETE',
        'F_ORGANISATIONUNIT_MOVE',
        'M_dhis-web-usage-analytics',
        'F_COLOR_DELETE',
        'F_INDICATORGROUP_DELETE',
        'F_ORGANISATIONUNIT_DELETE',
        'F_PROGRAM_RULE_ADD',
        'M_dhis-web-light',
        'F_OPTIONGROUPSET_PRIVATE_ADD',
        'F_DATA_MART_ADMIN',
        'M_dhis-web-maintenance-mobile',
        'F_DATASET_PUBLIC_ADD',
        'F_CATEGORY_COMBO_DELETE',
        'F_SECTION_DELETE',
        'F_USER_DELETE',
        'F_INDICATORGROUPSET_PRIVATE_ADD',
        'F_PROGRAM_INDICATOR_PRIVATE_ADD',
        'F_METADATA_IMPORT',
        'F_EXPORT_EVENTS',
        'F_SQLVIEW_PUBLIC_ADD',
        'F_PERFORM_MAINTENANCE',
        'F_COLOR_SET_ADD',
        'F_METADATA_EXPORT',
        'F_MINMAX_DATAELEMENT_ADD',
        'F_PROGRAMSTAGE_SECTION_ADD',
        'F_DATAELEMENTGROUP_PRIVATE_ADD',
        'F_VALIDATIONRULE_PRIVATE_ADD',
        'F_APPROVE_DATA',
        'M_dhis-web-mapping',
        'F_DATAELEMENT_PRIVATE_ADD',
        'F_VALIDATIONCRITERIA_ADD',
        'F_TRACKED_ENTITY_INSTANCE_SEARCH_IN_ALL_ORGUNITS',
        'F_IGNORE_TRACKER_REQUIRED_VALUE_VALIDATION',
        'F_PROGRAM_PUBLIC_ADD',
        'F_CATEGORY_OPTION_GROUP_SET_PRIVATE_ADD',
        'F_CATEGORY_OPTION_GROUP_SET_DELETE',
        'F_USER_ADD_WITHIN_MANAGED_GROUP',
        'M_Web_Portal',
        'F_ORGANISATIONUNIT_ADD',
        'M_dhis-web-user',
        'F_LEGEND_SET_PUBLIC_ADD',
        'F_CONSTANT_ADD',
        'F_PREDICTORGROUP_DELETE',
        'M_dhis-web-visualizer',
        'F_INDICATOR_PUBLIC_ADD',
        'F_INDICATORGROUP_PUBLIC_ADD',
        'F_TRACKED_ENTITY_ATTRIBUTE_PRIVATE_ADD',
        'M_dhis-web-maintenance',
        'M_dhis-web-approval',
        'F_PROGRAM_RULE_MANAGEMENT',
        'F_TEI_CASCADE_DELETE',
        'F_FRED_UPDATE',
        'F_VISUALIZATION_EXTERNAL',
        'M_dhis-web-cache-cleaner',
        'F_EDIT_EXPIRED',
        'F_PROGRAM_DASHBOARD_CONFIG_ADMIN',
        'F_ORGANISATIONUNITLEVEL_UPDATE',
        'F_CATEGORY_OPTION_PUBLIC_ADD',
        'M_dhis-web-datastore',
        'F_CATEGORY_OPTION_DELETE',
        'M_Data_Table',
        'M_dhis-web-menu-management',
        'F_REPORT_PUBLIC_ADD',
        'F_VALIDATIONRULEGROUP_DELETE',
        'F_PROGRAM_TRACKED_ENTITY_ATTRIBUTE_GROUP_ADD',
        'F_COLOR_ADD',
        'F_OPTIONSET_PRIVATE_ADD',
        'F_PROGRAM_RULE_DELETE',
        'F_ORGUNITGROUP_DELETE',
        'F_DATAELEMENTGROUPSET_PRIVATE_ADD',
        'M_dhis-web-tracker-capture',
        'F_LOCALE_ADD',
        'F_LEGEND_ADD',
        'F_CATEGORY_OPTION_GROUP_PRIVATE_ADD',
        'M_dhis-web-reporting',
        'F_CATEGORY_PUBLIC_ADD',
        'F_SECTION_ADD',
        'F_CATEGORY_COMBO_PUBLIC_ADD',
        'F_DATASET_DELETE',
        'F_INDICATORGROUPSET_DELETE',
        'F_USER_DELETE_WITHIN_MANAGED_GROUP',
        'F_ADD_TRACKED_ENTITY_FORM',
        'M_dhis-web-scheduler',
        'F_OPTIONGROUP_PUBLIC_ADD',
        'F_USERROLE_PRIVATE_ADD',
        'M_dhis-web-messaging',
        'M_dhis-web-maintenance-program',
        'F_EXTERNALFILERESOURCE_ADD',
        'F_MAP_EXTERNAL',
        'M_bna_widget',
        'F_DATAELEMENTGROUPSET_PUBLIC_ADD',
        'F_DATAELEMENTGROUP_DELETE',
        'F_USERGROUP_MANAGING_RELATIONSHIPS_ADD',
        'F_ORGUNITGROUP_PRIVATE_ADD',
        'F_DATAELEMENTGROUP_PUBLIC_ADD',
        'F_USER_GROUPS_READ_ONLY_ADD_MEMBERS',
        'F_LOCALE_DELETE',
        'F_PREDICTOR_RUN',
        'F_DATAELEMENT_DELETE',
        'F_OPTIONGROUP_DELETE',
        'F_LEGEND_SET_PRIVATE_ADD',
        'F_PROGRAMSTAGE_DELETE',
        'F_ATTRIBUTE_PUBLIC_ADD',
        'F_TRACKED_ENTITY_FORM_DELETE',
        'F_USERROLE_DELETE',
        'F_DOCUMENT_DELETE',
        'F_ORGUNITGROUPSET_DELETE',
        'M_dhis-web-translations',
        'M_dhis-web-sms',
        'F_SCHEDULING_CASE_AGGREGATE_QUERY_BUILDER',
        'F_PROGRAM_DELETE',
        'F_VALIDATIONRULE_DELETE',
        'F_PROGRAMDATAELEMENT_ADD',
        'M_dhis-web-mobile',
        'F_RELATIONSHIPTYPE_PUBLIC_ADD',
        'F_PREDICTOR_ADD',
        'F_SQLVIEW_PRIVATE_ADD',
        'F_EXPORT_DATA',
        'F_OAUTH2_CLIENT_MANAGE',
        'F_ORGUNITGROUP_PUBLIC_ADD',
        'F_APPROVE_DATA_LOWER_LEVELS',
        'M_Social_Media_Video',
        'F_OPTIONSET_PUBLIC_ADD',
        'F_EVENTCHART_EXTERNAL',
        'M_dhis-web-dataentry',
        'M_dhis-web-maintenance-dataset',
        'F_USERROLE_LIST',
        'M_dhis-web-import-export',
        'F_USERROLE_PUBLIC_ADD',
        'M_dhis-web-importexport',
        'M_InterpretationsTest',
        'F_ORGUNITGROUPSET_PUBLIC_ADD',
        'F_SQLVIEW_EXTERNAL',
        'F_REPORT_DELETE',
        'F_DASHBOARD_PUBLIC_ADD',
        'F_CONSTANT_DELETE',
        'M_dhis-web-maintenance-user',
        'F_PREDICTOR_DELETE',
        'M_dhis-web-data-visualizer',
        'F_DATASET_PRIVATE_ADD',
        'F_EVENTREPORT_PUBLIC_ADD',
        'F_PROGRAMSTAGE_SECTION_DELETE',
        'F_TRACKED_ENTITY_UPDATE',
        'F_CATEGORY_OPTION_GROUP_SET_PUBLIC_ADD',
        'F_METADATA_MANAGE',
        'F_ANALYTICSTABLEHOOK_DELETE',
        'F_UNCOMPLETE_EVENT',
        'M_dhis-web-sms-configuration',
        'M_dhis-web-interpretation',
        'F_LEGEND_DELETE',
        'M_Custom_Js_Css',
        'F_PROGRAM_INDICATOR_MANAGEMENT',
        'F_MAP_PUBLIC_ADD',
        'F_PROGRAM_VALIDATION',
        'F_SCHEDULING_ADMIN',
        'F_DATAELEMENT_MINMAX_DELETE',
        'F_MOBILE_SETTINGS',
        'F_PREDICTORGROUP_ADD',
        'F_REPORT_PRIVATE_ADD',
        'F_VALIDATIONRULEGROUP_PRIVATE_ADD',
        'F_PUSH_ANALYSIS_DELETE',
        'F_REPLICATE_USER',
        'F_DATAVALUE_ADD',
        'M_dhis-web-maintenance-organisationunit',
        'F_INSERT_CUSTOM_JS_CSS',
        'F_DATAELEMENTGROUPSET_DELETE',
        'F_SQLVIEW_DELETE',
        'F_ENROLLMENT_CASCADE_DELETE',
        'F_PROGRAMDATAELEMENT_DELETE',
        'F_INDICATORTYPE_ADD',
        'F_LEGEND_SET_DELETE',
        'F_VIEW_EVENT_ANALYTICS',
        'F_PROGRAMSTAGE_SECTION_MANAGEMENT',
        'F_IMPORT_EVENTS',
        'F_INDICATOR_PRIVATE_ADD',
        'F_FRED_CREATE',
        'F_EVENTCHART_PUBLIC_ADD',
        'F_PUSH_ANALYSIS_ADD',
        'M_dhis-web-event-visualizer',
        'F_USER_ADD',
        'F_EXTERNAL_MAP_LAYER_DELETE',
        'F_SYSTEM_SETTING',
        'F_ANALYTICSTABLEHOOK_ADD',
        'F_ATTRIBUTE_PRIVATE_ADD',
        'F_DOCUMENT_PUBLIC_ADD',
        'F_TRACKED_ENTITY_ATTRIBUTE_DELETE',
        'M_Easy_Visualization',
        'F_VISUALIZATION_PUBLIC_ADD',
        'F_DATAELEMENT_MINMAX_ADD',
        'M_dhis-web-data-quality',
        'M_dhis-web-pivot',
        'F_EVENTREPORT_EXTERNAL',
        'F_PROGRAM_RULE_UPDATE',
        'F_DATAELEMENT_PUBLIC_ADD',
        'M_dhis-web-validationrule',
        'F_CONSTANT_MANAGEMENT',
        'F_RUN_VALIDATION',
        'F_MANAGE_TICKETS',
        'F_OPTIONGROUP_PRIVATE_ADD',
        'F_CATEGORY_OPTION_GROUP_DELETE',
        'M_User_Administration',
        'M_dhis-web-settings',
        'F_IMPORT_DATA',
        'F_VIEW_DATABROWSER',
        'F_MOBILE_DELETE_SMS',
        'F_OPTIONSET_MANAGEMENT',
        'F_PROGRAMSTAGE_ADD',
        'M_dhis-web-maps',
        'F_MINMAX_DATAELEMENT_DELETE',
        'F_ATTRIBUTE_DELETE',
        'F_OPTIONSET_DELETE',
        'M_dhis-web-dashboard',
        'M_dhis-web-data-administration',
        'F_ACCEPT_DATA_LOWER_LEVELS',
        'F_PROGRAM_TRACKED_ENTITY_ATTRIBUTE_GROUP_DELETE',
        'F_OPTIONGROUPSET_PUBLIC_ADD',
        'M_dhis-web-capture',
        'F_PROGRAM_INDICATOR_GROUP_PUBLIC_ADD',
        'F_CATEGORY_DELETE',
        'F_COLOR_SET_DELETE',
        'M_dhis-web-app-management',
        'F_INDICATORTYPE_DELETE',
        'F_INDICATORGROUP_PRIVATE_ADD',
        'F_FRED_DELETE',
        'F_VALIDATIONCRITERIA_DELETE',
        'M_Alma_Export',
        'M_Alma_scorecard',
        'M_BIF',
        'M_Bulk_Load',
        'M_CBS_Line_Listing',
        'M_Common_GeoRegistry',
        'M_Dashboard_Classic',
        'M_Dashboard_Information',
        'M_Data_Import_Wizard',
        'M_Dhis2_Taskr',
        'M_Function_Maintanance_2',
        'M_GoDataDHIS2_Interoperability_App',
        'M_HMIS_Dictionary',
        'M_KoboDHIS2_Integration',
        'M_MetaData_Synchronization',
        'M_Metadata_Repository',
        'M_Organisation_Unit_Code',
        'M_Pact_Swazi_dashboard_ppprevsemiannually',
        'M_Score_Card_Widget',
        'M_Scorecard_24beta14',
        'M_Scorecard',
        'M_Tracker_Report_App',
        'M_User_Extended_App',
        'M_Users_Role_Monitor_Widget',
        'M_WHO_Data_Quality_Tool',
        'M_WHO_Metadata_browser',
        'M_androidsettingsapp',
        'M_customreportbuilder',
        'M_dAtaZ',
        'M_dataimporter',
        'M_esigl',
        'M_gisadmin',
        'M_queryplayground',
        'F_SKIP_DATA_IMPORT_AUDIT',
        'ALL',
        'MY_APP_ADD_NEW',
        'MY_APP_DELETE',
        'MY_APP_UPDATE',
        'F_TRACKER_IMPORTER_EXPERIMENTAL',
      ],
      users: [],
      translations: [],
      userAccesses: [],
    };

    const personAttributes = {
      publicAccess: 'rw------',
      description: 'Person',
      lastUpdated: '2021-03-08T17:28:00.040',
      allowAuditLog: false,
      featureType: 'NONE',
      minAttributesRequiredToSearch: 1,
      id: 'nEenWmSyUEp',
      created: '2015-12-21T04:40:43.000',
      attributeValues: [],
      maxTeiCountToReturn: 0,
      name: 'Person',
      lastUpdatedBy: { id: 'xE7jOejl9FI' },
      user: { id: 'GOLswS44mh8' },
      trackedEntityTypeAttributes: [
        {
          displayName: 'Address',
          text: 'Address',
          value: 'VqEFza8wbwA',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'VqEFza8wbwA' },
        },
        {
          displayName: 'Age',
          text: 'Age',
          value: 'spFvx9FndA4',
          valueType: 'AGE',
          unique: false,
          trackedEntityAttribute: { id: 'spFvx9FndA4' },
        },
        {
          displayName: 'Age (years)',
          text: 'Age (years)',
          value: 'B6TnnFMgmCk',
          valueType: 'INTEGER_ZERO_OR_POSITIVE',
          unique: false,
          trackedEntityAttribute: { id: 'B6TnnFMgmCk' },
        },
        {
          displayName: 'Area (kmsq)',
          text: 'Area (kmsq)',
          value: 'qDQUHqdAXkT',
          valueType: 'NUMBER',
          unique: false,
          trackedEntityAttribute: { id: 'qDQUHqdAXkT' },
        },
        {
          displayName: 'Average location of health facility (from inhabitants)',
          text: 'Average location of health facility (from inhabitants)',
          value: 'TgSJNUL2cqd',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'NxVachTgbj0' },
          trackedEntityAttribute: { id: 'TgSJNUL2cqd' },
        },
        {
          displayName: 'Birth date',
          text: 'Birth date',
          value: 'gHGyrwKPzej',
          valueType: 'DATE',
          unique: false,
          trackedEntityAttribute: { id: 'gHGyrwKPzej' },
        },
        {
          displayName: 'Blood type',
          text: 'Blood type',
          value: 'H9IlTX2X6SL',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'H9IlTX2X6SL' },
        },
        {
          displayName: 'BmDistrict ',
          text: 'BmDistrict ',
          value: 'S0pWxe6nalk',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'QpBcdBqMVdd' },
          trackedEntityAttribute: { id: 'S0pWxe6nalk' },
        },
        {
          displayName: 'BmProvince',
          text: 'BmProvince',
          value: 'm2FImp4f75A',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'oJrpON8stGq' },
          trackedEntityAttribute: { id: 'm2FImp4f75A' },
        },
        {
          displayName: 'Bottleneck',
          text: 'Bottleneck',
          value: 'PwYEdpwKLj9',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'PwYEdpwKLj9' },
        },
        {
          displayName: 'City',
          text: 'City',
          value: 'FO4sWYJ64LQ',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'FO4sWYJ64LQ' },
        },
        {
          displayName: 'Civil status',
          text: 'Civil status',
          value: 'ciq2USN94oJ',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'xjA5E9MimMU' },
          trackedEntityAttribute: { id: 'ciq2USN94oJ' },
        },
        {
          displayName: 'Company',
          text: 'Company',
          value: 'kyIzQsj96BD',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'kyIzQsj96BD' },
        },
        {
          displayName: 'Coverage Indicator',
          text: 'Coverage Indicator',
          value: 'kgRcTHCG3ll',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'kgRcTHCG3ll' },
        },
        {
          displayName: 'Date of birth',
          text: 'Date of birth',
          value: 'iESIqZ0R0R0',
          valueType: 'DATE',
          unique: false,
          trackedEntityAttribute: { id: 'iESIqZ0R0R0' },
        },
        {
          displayName: 'Date of birth (mal)',
          text: 'Date of birth (mal)',
          value: 'BiTsLcJQ95V',
          valueType: 'DATE',
          unique: false,
          trackedEntityAttribute: { id: 'BiTsLcJQ95V' },
        },
        {
          displayName: 'Date of birth (mal) is estimated',
          text: 'Date of birth (mal) is estimated',
          value: 'Z1rLc1rVHK8',
          valueType: 'TRUE_ONLY',
          unique: false,
          trackedEntityAttribute: { id: 'Z1rLc1rVHK8' },
        },
        {
          displayName: 'Death date',
          text: 'Death date',
          value: 'USfGm3Y5W4j',
          valueType: 'DATE',
          unique: false,
          trackedEntityAttribute: { id: 'USfGm3Y5W4j' },
        },
        {
          displayName: 'Email',
          text: 'Email',
          value: 'NDXw0cluzSw',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'NDXw0cluzSw' },
        },
        {
          displayName: 'Email address',
          text: 'Email address',
          value: 'KmEUg2hHEtx',
          valueType: 'EMAIL',
          unique: false,
          trackedEntityAttribute: { id: 'KmEUg2hHEtx' },
        },
        {
          displayName: 'Father of child',
          text: 'Father of child',
          value: 'FPVL78fPgdF',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'bVOLWJ2ZHdV' },
          trackedEntityAttribute: { id: 'FPVL78fPgdF' },
        },
        {
          displayName: 'First Name',
          text: 'First Name',
          value: 'TfdH5KvFmMy',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'TfdH5KvFmMy' },
        },
        {
          displayName: 'First name',
          text: 'First name',
          value: 'w75KJ2mc4zz',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'w75KJ2mc4zz' },
        },
        {
          displayName: 'Focus Name',
          text: 'Focus Name',
          value: 'Kv4fmHVAzwX',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'Kv4fmHVAzwX' },
        },
        {
          displayName: 'Gender',
          text: 'Gender',
          value: 'cejWyOfXge6',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'pC3N9N77UmT' },
          trackedEntityAttribute: { id: 'cejWyOfXge6' },
        },
        {
          displayName: 'GPS attribute',
          text: 'GPS attribute',
          value: 'vTKipVM0GsX',
          valueType: 'COORDINATE',
          unique: false,
          trackedEntityAttribute: { id: 'vTKipVM0GsX' },
        },
        {
          displayName: 'Height in cm',
          text: 'Height in cm',
          value: 'lw1SqmMlnfh',
          valueType: 'NUMBER',
          unique: false,
          trackedEntityAttribute: { id: 'lw1SqmMlnfh' },
        },
        {
          displayName: 'Indicator',
          text: 'Indicator',
          value: 'k9nRgmHqg8X',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'k9nRgmHqg8X' },
        },
        {
          displayName: 'Intervention',
          text: 'Intervention',
          value: 'TAJyOs1ZTrV',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'TAJyOs1ZTrV' },
        },
        {
          displayName: 'Is dead',
          text: 'Is dead',
          value: 'iggSfNDnsCw',
          valueType: 'BOOLEAN',
          unique: false,
          trackedEntityAttribute: { id: 'iggSfNDnsCw' },
        },
        {
          displayName: 'Is under age',
          text: 'Is under age',
          value: 'mTg1B4t9Liz',
          valueType: 'BOOLEAN',
          unique: false,
          trackedEntityAttribute: { id: 'mTg1B4t9Liz' },
        },
        {
          displayName: 'Last Name',
          text: 'Last Name',
          value: 'aW66s2QSosT',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'aW66s2QSosT' },
        },
        {
          displayName: 'Last name',
          text: 'Last name',
          value: 'zDhUuAYrxNC',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'zDhUuAYrxNC' },
        },
        {
          displayName: 'Latitude',
          text: 'Latitude',
          value: 'Qo571yj6Zcn',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'Qo571yj6Zcn' },
        },
        {
          displayName: 'Local Case ID',
          text: 'Local Case ID',
          value: 'h5FuguPFF2j',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'h5FuguPFF2j' },
        },
        {
          displayName: 'Local Focus ID',
          text: 'Local Focus ID',
          value: 'QRg7SZ6VOAV',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'QRg7SZ6VOAV' },
        },
        {
          displayName: 'Locality',
          text: 'Locality',
          value: 'KrCahWFMYYz',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'oBWhZmavxQY' },
          trackedEntityAttribute: { id: 'KrCahWFMYYz' },
        },
        {
          displayName: 'Longitude',
          text: 'Longitude',
          value: 'RG7uGl4w5Jq',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'RG7uGl4w5Jq' },
        },
        {
          displayName: 'Mobile number',
          text: 'Mobile number',
          value: 'Agywv2JGwuq',
          valueType: 'PHONE_NUMBER',
          unique: false,
          trackedEntityAttribute: { id: 'Agywv2JGwuq' },
        },
        {
          displayName: 'Mother maiden name',
          text: 'Mother maiden name',
          value: 'o9odfev2Ty5',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'o9odfev2Ty5' },
        },
        {
          displayName: 'Name of health facility catchment area',
          text: 'Name of health facility catchment area',
          value: 'ffbaoqebOT3',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'ffbaoqebOT3' },
        },
        {
          displayName: 'National identifier',
          text: 'National identifier',
          value: 'AuPLng5hLbE',
          valueType: 'TEXT',
          unique: true,
          trackedEntityAttribute: { id: 'AuPLng5hLbE' },
        },
        {
          displayName: 'Nationality',
          text: 'Nationality',
          value: 'spkM2E9dn2J',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'ynHtyLDVeJO' },
          trackedEntityAttribute: { id: 'spkM2E9dn2J' },
        },
        {
          displayName: 'Occupation',
          text: 'Occupation',
          value: 'A4xFHyieXys',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'A4xFHyieXys' },
        },
        {
          displayName: 'Phone number',
          text: 'Phone number',
          value: 'P2cwLGskgxn',
          valueType: 'PHONE_NUMBER',
          unique: false,
          trackedEntityAttribute: { id: 'P2cwLGskgxn' },
        },
        {
          displayName: 'Postal code',
          text: 'Postal code',
          value: 'ZcBPrXKahq2',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'ZcBPrXKahq2' },
        },
        {
          displayName: 'Provider ID',
          text: 'Provider ID',
          value: 'DODgdr5Oo2v',
          valueType: 'TEXT',
          unique: true,
          trackedEntityAttribute: { id: 'DODgdr5Oo2v' },
        },
        {
          displayName: 'Registration date',
          text: 'Registration date',
          value: 'bN4qkuvDR7Y',
          valueType: 'DATE',
          unique: false,
          trackedEntityAttribute: { id: 'bN4qkuvDR7Y' },
        },
        {
          displayName: 'Relationship with the mother',
          text: 'Relationship with the mother',
          value: 'u0RdNBMUey6',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'u0RdNBMUey6' },
        },
        {
          displayName: 'Residence location',
          text: 'Residence location',
          value: 'G7vUx908SwP',
          valueType: 'COORDINATE',
          unique: false,
          trackedEntityAttribute: { id: 'G7vUx908SwP' },
        },
        {
          displayName: 'Resident in catchment area',
          text: 'Resident in catchment area',
          value: 'bJeK4FaRKDS',
          valueType: 'TRUE_ONLY',
          unique: false,
          trackedEntityAttribute: { id: 'bJeK4FaRKDS' },
        },
        {
          displayName: 'Sex',
          text: 'Sex',
          value: 'CklPZdOd6H1',
          valueType: 'TEXT',
          unique: false,
          optionSet: { id: 'hiQ3QFheQ3O' },
          trackedEntityAttribute: { id: 'CklPZdOd6H1' },
        },
        {
          displayName: 'State',
          text: 'State',
          value: 'GUOBQt5K2WI',
          valueType: 'NUMBER',
          unique: false,
          trackedEntityAttribute: { id: 'GUOBQt5K2WI' },
        },
        {
          displayName: 'System Case ID',
          text: 'System Case ID',
          value: 'flGbXLXCrEo',
          valueType: 'TEXT',
          unique: true,
          trackedEntityAttribute: { id: 'flGbXLXCrEo' },
        },
        {
          displayName: 'System Focus ID',
          text: 'System Focus ID',
          value: 'coaSpbzZiTB',
          valueType: 'TEXT',
          unique: true,
          trackedEntityAttribute: { id: 'coaSpbzZiTB' },
        },
        {
          displayName: 'TB identifier',
          text: 'TB identifier',
          value: 'xs8A6tQJY0s',
          valueType: 'TEXT',
          unique: true,
          trackedEntityAttribute: { id: 'xs8A6tQJY0s' },
        },
        {
          displayName: 'TB number',
          text: 'TB number',
          value: 'ruQQnf6rswq',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'ruQQnf6rswq' },
        },
        {
          displayName: 'Unique ID',
          text: 'Unique ID',
          value: 'lZGmxYbs97q',
          valueType: 'TEXT',
          unique: true,
          trackedEntityAttribute: { id: 'lZGmxYbs97q' },
        },
        {
          displayName: 'Vehicle',
          text: 'Vehicle',
          value: 'VHfUeXpawmE',
          valueType: 'TEXT',
          unique: false,
          trackedEntityAttribute: { id: 'VHfUeXpawmE' },
        },
        {
          displayName: 'Weight in kg',
          text: 'Weight in kg',
          value: 'OvY4VVhSDeJ',
          valueType: 'NUMBER',
          unique: false,
          trackedEntityAttribute: { id: 'OvY4VVhSDeJ' },
        },
        {
          displayName: 'Zip code',
          text: 'Zip code',
          value: 'n9nUvfpTsxQ',
          valueType: 'NUMBER',
          unique: false,
          trackedEntityAttribute: { id: 'n9nUvfpTsxQ' },
        },
      ],
      translations: [],
      userGroupAccesses: [],
      userAccesses: [],
    };

    return execute(update('users', 'xE7jOejl9FI', permissions))(state)
      .then(() => {
        console.log('updated user permissions');
      })
      .then(() => {
        console.log('updated user roles');
        return execute(update('users', 'xE7jOejl9FI', userRoles))(state);
      })
      .then(() => {
        console.log('assigned attributes to person entity type');
        return execute(
          update('trackedEntityTypes', 'nEenWmSyUEp', personAttributes, {
            mergeMode: 'REPLACE',
          })
        )(state);
      })
      .then(() => {
        // PUT add Programs... // ??
        // console.log('updated programs');
        console.log('dhis2 instance configured, starting tests...');
      });
  });

  describe('buildUrl for getData', () => {
    before(() => {
      nock('https://play.dhis2.org/2.35.0/')
        .get(uri => uri.includes('api/34'))
        .reply(200, {
          trackedEntityInstances: ['from v34'],
        });

      nock('https://play.dhis2.org/2.35.0/')
        .get(uri => uri.includes('api/999'))
        .reply(200, {
          trackedEntityInstances: ['from v999'],
        });
    });

    it('should respect api version when passed through configuration', () => {
      let state = {
        configuration: {
          username: 'admin',
          password: 'district',
          hostUrl: 'https://play.dhis2.org/2.35.0',
          apiVersion: 34,
        },
      };

      return execute(getData('trackedEntityInstances', {}))(state).then(
        state => {
          expect(state.data.trackedEntityInstances[0]).to.eq('from v34');
        }
      );
    }).timeout(10 * 1000);

    it('should respect the api version when passed through the options argument', () => {
      let state = {
        configuration: {
          username: 'admin',
          password: 'district',
          hostUrl: 'https://play.dhis2.org/2.35.0',
        },
      };

      return execute(
        getData('trackedEntityInstances', {}, { apiVersion: 999 })
      )(state).then(state => {
        expect(state.data.trackedEntityInstances[0]).to.eq('from v999');
      });
    }).timeout(10 * 1000);
  });

  describe('getData', () => {
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it("should return one trackedEntityInstance with trackedInstanceInstance Id 'dNpxRu1mWG5' for a given orgUnit(DiszpKrYNg8)", () => {
      let state = {
        configuration: {
          username: 'admin',
          password: 'district',
          hostUrl: 'https://play.dhis2.org/2.35.0',
        },
      };

      return execute(
        getData('trackedEntityInstances', {
          fields: '*',
          ou: 'DiszpKrYNg8',
          entityType: 'nEenWmSyUEp',
          trackedEntityInstance: 'dNpxRu1mWG5',
        })
      )(state).then(state => {
        const instances = state.data.trackedEntityInstances;
        expect(instances.length).to.eq(1);
        expect(instances[0].trackedEntityInstance).to.eq('dNpxRu1mWG5');
      });
    }).timeout(10 * 1000);
  });

  describe('upsert', () => {
    let state = upsertExistingState;
    state.attributeVal = state =>
      state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q').value;
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should create a new TEI', () => {
      return execute(
        upsert(
          'trackedEntityInstances',
          {
            attributeId: 'lZGmxYbs97q',
            attributeValue: state =>
              state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
                .value,
          },
          state.data,
          { ou: 'TSyzvBiovKh' }
        )
      )(state).then(result => {
        expect(result.data.httpStatus).to.eq('OK');
        expect(result.data.httpStatusCode).to.eq(200);
        expect(result.data.response.imported).to.eq(1);
        expect(result.data.response.updated).to.eq(0);
        expect(result.data.response.deleted).to.eq(0);
        expect(result.data.response.ignored).to.eq(0);
      });
    }).timeout(20 * 1000);

    it('should update an existing TEI when a matching TEI is found by attribute ID', () => {
      return execute(
        upsert(
          'trackedEntityInstances',
          {
            attributeId: 'lZGmxYbs97q',
            attributeValue: state.attributeVal,
          },
          state.data,
          { ou: 'TSyzvBiovKh' }
        )
      )(state).then(state => {
        expect(state.data.response.importCount.imported).to.eq(0);
        expect(state.data.response.importCount.updated).to.eq(1);
        expect(state.data.response.importCount.deleted).to.eq(0);
        expect(state.data.response.importCount.ignored).to.eq(0);
        expect(state.data.response.importCount.ignored).to.eq(0);
      });
    }).timeout(30 * 1000);

    it('should create a new TEI when a matching TEI is not found by attribute ID', () => {
      let state = upsertNewState;

      return execute(
        upsert(
          'trackedEntityInstances',
          {
            attributeId: 'lZGmxYbs97q',
            attributeValue: state =>
              state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
                .value,
          },
          state.data,
          { ou: 'TSyzvBiovKh' }
        )
      )(state).then(state => {
        expect(state.data.response.imported).to.eq(1);
        expect(state.data.response.updated).to.eq(0);
        expect(state.data.response.deleted).to.eq(0);
        expect(state.data.response.ignored).to.eq(0);
      });
    }).timeout(20 * 1000);
  });

  describe('upsertTEI', () => {
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should update an existing TEI when a matching TEI is found by attribute ID', () => {
      let state = upsertExistingTEIState;

      return execute(upsertTEI('lZGmxYbs97q', state.data))(state).then(
        state => {
          expect(state.data.response.importCount.imported).to.eq(0);
          expect(state.data.response.importCount.updated).to.eq(1);
          expect(state.data.response.importCount.deleted).to.eq(0);
          expect(state.data.response.importCount.ignored).to.eq(0);
        }
      );
    }).timeout(20 * 1000);

    it('should create a new TEI when a matching TEI is not found by attribute ID', () => {
      let state = upsertNewTEIState;

      return execute(upsertTEI('lZGmxYbs97q', state.data))(state).then(
        state => {
          expect(state.data.response.imported).to.eq(1);
          expect(state.data.response.updated).to.eq(0);
          expect(state.data.response.deleted).to.eq(0);
          expect(state.data.response.ignored).to.eq(0);
        }
      );
    }).timeout(20 * 1000);

    it('should allow the user to build a TEI object from a generic state', () => {
      let state = {
        ...upsertNewTEIState,
        data: {
          form: {
            name: 'Taylor',
            uniqueId: '1135353',
            organization: 'TSyzvBiovKh',
            programsJoined: ['fDd25txQckK'],
          },
        },
      };

      return execute(
        upsertTEI('lZGmxYbs97q', {
          orgUnit: state.data.form.organization,
          trackedEntityType: 'nEenWmSyUEp',
          attributes: [
            {
              attribute: 'w75KJ2mc4zz',
              value: state.data.form.name,
            },
            {
              attribute: 'lZGmxYbs97q',
              value: state.data.form.uniqueId,
            },
          ],
          enrollments: state =>
            state.data.form.programsJoined.map(item => ({
              orgUnit: state.data.form.organization,
              program: item,
              programState: 'lST1OZ5BDJ2',
              enrollmentDate: '2021-01-05',
              incidentDate: '2021-01-05',
            })),
        })
      )(state).then(state => {
        expect(state.data.response.status).to.eq('SUCCESS');
        expect(state.data.httpStatusCode).to.eq(200);
        expect(
          state.data.response.deleted ?? state.data.response.importCount.deleted
        ).to.eq(0);
        expect(
          state.data.response.ignored ?? state.data.response.importCount.ignored
        ).to.eq(0);
      });
    }).timeout(20 * 1000);

    it('should allow the user to use `attribute` and `dataValue` helper functions', () => {
      let state = {
        ...upsertNewTEIState,
        data: {
          form: {
            name: 'Taylor',
            uniqueId: '1135354',
            organization: 'TSyzvBiovKh',
            programsJoined: ['fDd25txQckK'],
          },
        },
      };

      return execute(
        upsertTEI('lZGmxYbs97q', {
          orgUnit: dataValue('form.organization'),
          trackedEntityType: 'nEenWmSyUEp',
          attributes: [
            attribute('w75KJ2mc4zz', dataValue('form.name')),
            attribute('lZGmxYbs97q', dataValue('form.uniqueId')),
          ],
          enrollments: state =>
            state.data.form.programsJoined.map(item => ({
              orgUnit: dataValue('form.organization'),
              program: item,
              programState: 'lST1OZ5BDJ2',
              enrollmentDate: '2021-01-05',
              incidentDate: '2021-01-05',
            })),
        })
      )(state).then(state => {
        expect(state.data.response.status).to.eq('SUCCESS');
        expect(state.data.httpStatusCode).to.eq(200);
        expect(
          state.data.response.deleted ?? state.data.response.importCount.deleted
        ).to.eq(0);
        expect(
          state.data.response.ignored ?? state.data.response.importCount.ignored
        ).to.eq(0);
      });
    }).timeout(20 * 1000);

    it('should allow the user to use `arrow function` to access data', () => {
      let state = {
        ...upsertNewTEIState,
        data: {
          form: {
            name: 'Taylor',
            uniqueId: '1135354',
            organization: 'TSyzvBiovKh',
            programsJoined: ['fDd25txQckK'],
          },
        },
      };

      return execute(
        upsertTEI('lZGmxYbs97q', {
          orgUnit: state => state.data.form.organization,
          trackedEntityType: 'nEenWmSyUEp',
          attributes: [
            attribute('w75KJ2mc4zz', state => state.data.form.name),
            attribute('lZGmxYbs97q', state => state.data.form.uniqueId),
          ],
          enrollments: state =>
            state.data.form.programsJoined.map(item => ({
              orgUnit: state.data.form.organization,
              program: item,
              programState: 'lST1OZ5BDJ2',
              enrollmentDate: '2021-01-05',
              incidentDate: '2021-01-05',
            })),
        })
      )(state).then(state => {
        expect(state.data.response.status).to.eq('SUCCESS');
        expect(state.data.httpStatusCode).to.eq(200);
        expect(
          state.data.response.deleted ?? state.data.response.importCount.deleted
        ).to.eq(0);
        expect(
          state.data.response.ignored ?? state.data.response.importCount.ignored
        ).to.eq(0);
      });
    }).timeout(20 * 1000);
  });

  describe('create', () => {
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it.skip(
      'should create a new single event and link it to a given program',
      () => {
        let state = createState;
        return execute(create('events', state.data))(state).then(state => {
          expect(state.data.response.imported).to.eq(1);
          expect(state.data.response.updated).to.eq(0);
          expect(state.data.response.deleted).to.eq(0);
          expect(state.data.response.ignored).to.eq(0);
        });
      }
    ).timeout(20 * 1000);
  });

  describe('update', () => {
    let state = updateState;
    state.data.name += Date.now();
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should update the name of a data element', () => {
      return execute(update('dataElements', state.data.id, state.data))(
        state
      ).then(result => {
        expect(result.data.httpStatusCode).to.eq(200);
        expect(result.data.response.uid).to.eq(state.data.id);
      });
    }).timeout(20 * 1000);

    it('should verify that the name of the data element was updated', () => {
      return execute(getData(`dataElements/${state.data.id}`))(state).then(
        result => {
          expect(result.data.name).to.eq(state.data.name);
        }
      );
    }).timeout(20 * 1000);
  });

  describe('patch', () => {
    let state = patchState;
    state.id = 'FTRrcoaog83';
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should do a partial update(patch) of a data element', () => {
      return execute(patch('dataElements', state.id, state.data))(state).then(
        result => {
          expect(result.data.status).to.eq(204);
        }
      );
    }).timeout(20 * 1000);

    it('should verify that the name of the data element was updated', () => {
      return execute(getData(`dataElements/${state.id}`))(state).then(
        result => {
          expect(result.data.name).to.eq(state.data.name);
        }
      );
    }).timeout(20 * 1000);
  });

  describe('delete', () => {
    let id = '';
    let state = delState;
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should create a new tracked entity instance', () => {
      return execute(create('trackedEntityInstances', state.data))(state).then(
        result => {
          id = result.data.response.importSummaries[0].reference;
          expect(result.data.response.imported).to.eq(1);
          expect(result.data.response.updated).to.eq(0);
          expect(result.data.response.deleted).to.eq(0);
          expect(result.data.response.ignored).to.eq(0);
        }
      );
    }).timeout(20 * 1000);

    it('should delete the newly created tracked entity instance', () => {
      return execute(del('trackedEntityInstances', id))(state).then(result => {
        expect(result.data.response.importCount.imported).to.eq(0);
        expect(result.data.response.importCount.updated).to.eq(0);
        expect(result.data.response.importCount.ignored).to.eq(0);
        expect(result.data.response.importCount.deleted).to.eq(1);
      });
    }).timeout(20 * 1000);
  });

  describe('getMetadata', () => {
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should get a list of orgUnits', () => {
      let state = getState;
      return execute(
        getMetadata('organisationUnits', { fields: ['id', 'name'] })
      )(state).then(result => {
        expect(result.data.organisationUnits.length).to.be.gte(1);
      });
    }).timeout(30 * 1000);

    it('should get data elements and indicators where name includes "ANC"', () => {
      let state = getState;
      return execute(
        getMetadata(['dataElements', 'indicators'], {
          filters: ['name:like:ANC'],
          fields: ['id', 'name'],
        })
      )(state).then(result => {
        expect(result.data.dataElements.length).to.be.gte(1);
        expect(result.data.indicators.length).to.be.gte(1);
      });
    }).timeout(20 * 1000);
  });

  describe('getSchema', () => {
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should get the schema for dataElement', () => {
      let state = getState;
      return execute(getSchema('dataElement'))(state).then(result => {
        expect(result.data.name).to.eq('dataElement');
      });
    }).timeout(20 * 1000);

    it('should get the schema for dataElement, only returning the `properties` field', () => {
      let state = getState;
      return execute(getSchema('dataElement', { fields: 'properties' }))(
        state
      ).then(result => {
        expect(result.data).to.have.a.key('properties');
        expect(Object.keys(result.data).length).to.eq(1);
      });
    }).timeout(20 * 1000);

    it('should get the schema for dataElement in XML, returning all the fields', () => {
      let state = getState;
      return execute(
        getSchema('dataElement', { fields: '*' }, { responseType: 'xml' })
      )(state).then(result => {
        expect(result.data.slice(2, 5)).to.eq('xml');
      });
    }).timeout(20 * 1000);
  });

  describe('getResources', () => {
    let state = getState;
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should get a list of all DHIS2 resources', () => {
      return execute(getResources())(state).then(result => {
        expect(result.data.resources.length).to.be.gte(1);
      });
    }).timeout(20 * 1000);

    it('should get a resource named `attribute`, in `json` format', () => {
      return execute(getResources({ filter: 'singular:eq:attribute' }))(
        state
      ).then(result => {
        expect(result.data.resources.length).to.be.eq(1);
        expect(result.data.resources[0].singular).to.be.eq('attribute');
      });
    }).timeout(20 * 1000);

    it('should get a resource named `attribute`, in `xml` format, returning all the fields', () => {
      return execute(
        getResources('dataElement', {
          filter: 'singular:eq:attribute',
          fields: '*',
          responseType: 'xml',
        })
      )(state).then(result => {
        expect(result.data.slice(2, 5)).to.be.eq('xml');
      });
    }).timeout(20 * 1000);
  });

  describe('getAnalytics', () => {
    let state = getState;
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should return a list of data elements filtered by the periods and organisation units', () => {
      return execute(
        getAnalytics({
          dimensions: ['dx:fbfJHSPpUQD;cYeuwXTCPkU'],
          filters: ['pe:2014Q1;2014Q2', 'ou:O6uvpzGd5pu;lc3eMKXaEfw'],
        })
      )(state).then(result => {
        expect(result.data).to.be.not.null;
        expect(result.data).to.haveOwnProperty('rows');
      });
    }).timeout(20 * 1000);

    it('should return only records where the data value is greater or equal to 6500 and less than 33000', () => {
      return execute(
        getAnalytics({
          dimensions: [
            'dx:fbfJHSPpUQD;cYeuwXTCPkU',
            'pe:2014',
            'ou:O6uvpzGd5pu;lc3eMKXaEfw',
          ],
          measureCriteria: 'GE:6500;LT:33000',
        })
      )(state).then(result => {
        expect(result.data).to.be.not.null;
        expect(result.data).to.haveOwnProperty('rows');
      });
    }).timeout(20 * 1000);

    it('should allow users to send a date range using startDate and endDate', () => {
      return execute(
        getAnalytics({
          dimensions: ['dx:fbfJHSPpUQD;cYeuwXTCPkU', 'ou:ImspTQPwCqd'],
          startDate: '2018-01-01',
          endDate: '2018-06-01',
        })
      )(state).then(result => {
        expect(result.data).to.be.not.null;
        expect(result.data).to.haveOwnProperty('rows');
      });
    }).timeout(20 * 1000);
  });

  describe('discover', () => {
    let state = getState;
    it('should return a list of parameters allowed on a given endpoint for specific http method', () => {
      return execute(discover('get', '/trackedEntityInstances'))(state).then(
        result => {
          expect(result.data.description).to.be.eq(
            'list tracked entity instances (TEIs)'
          );
        }
      );
    }).timeout(30 * 1000);
  });

  describe('generateDhis2UID', () => {
    let state = getState;
    it('should return one UID generated from DHIS2 server', () => {
      return execute(generateDhis2UID())(state).then(result => {
        expect(result.data.codes.length).to.be.eq(1);
      });
    }).timeout(20 * 1000);

    it('should return three UIDs generated from DHIS2 server', () => {
      return execute(generateDhis2UID({ limit: 3 }))(state).then(result => {
        expect(result.data.codes.length).to.be.eq(3);
      });
    }).timeout(20 * 1000);
  });

  describe('getDataValues', () => {
    let state = getState;
    it('should return two `data values` associated with a specific `orgUnit`, `dataSet`, and `period `', () => {
      return execute(
        getDataValues({
          orgUnit: 'DiszpKrYNg8',
          period: '202010',
          dataSet: 'pBOMPrpg1QX',
          limit: 2,
        })
      )(state).then(result => {
        expect(result.data.orgUnit).to.be.eq('DiszpKrYNg8');
        expect(result.data.period).to.be.eq('202010');
        expect(result.data.dataSet).to.be.eq('pBOMPrpg1QX');
        expect(result.data.dataValues.length).to.be.eq(2);
      });
    }).timeout(20 * 1000);
  });

  describe('createDataValues', () => {
    it('should create large bulks of data values which are not logically related', () => {
      let state = createBulkUnrelatedDataValues;
      return execute(createDataValues(state.data))(state).then(result => {
        expect(
          (result.data.status === 'WARNING' &&
            result.data.importCount.ignored > 0) ||
            result.data.importCount.imported > 0 ||
            result.data.importCount.updated > 0
        );
        expect(result.data.importCount.deleted).to.eq(0);
      });
    }).timeout(20 * 1000);

    it('should create large bulks of data values which are not logically related', () => {
      let state = createRelatedDataValues;
      return execute(createDataValues(state.data))(state).then(result => {
        expect(
          (result.data.status === 'WARNING' &&
            result.data.importCount.ignored > 0) ||
            result.data.importCount.imported > 0 ||
            result.data.importCount.updated > 0
        );
        expect(result.data.importCount.deleted).to.eq(0);
      });
    }).timeout(20 * 1000);
  });

  describe('createEvents', () => {
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it.skip(
      'should create a new single event and link it to a given program',
      () => {
        let state = createEventsState;
        return execute(createEvents(state.data))(state).then(result => {
          expect(result.data.response.imported).to.eq(1);
          expect(result.data.response.updated).to.eq(0);
          expect(result.data.response.deleted).to.eq(0);
          expect(result.data.response.ignored).to.eq(0);
        });
      }
    ).timeout(20 * 1000);

    it.skip(
      'should create two new events and link them to respective programs',
      () => {
        let state = sendDataForMultipleEventsState;
        return execute(createEvents(state.data))(state).then(result => {
          expect(result.data.response.imported).to.eq(2);
          expect(result.data.response.updated).to.eq(0);
          expect(result.data.response.deleted).to.eq(0);
          expect(result.data.response.ignored).to.eq(0);
        });
      }
    ).timeout(20 * 1000);
  });

  describe('enrollTEI', () => {
    let trackedEntityInstance = '';

    let state = enrollTEIState;

    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should create a new tracked entity instance', () => {
      return execute(create('trackedEntityInstances', state.data))(state).then(
        result => {
          trackedEntityInstance =
            result.data.response.importSummaries[0].reference;
          expect(result.data.response.imported).to.eq(1);
          expect(result.data.response.updated).to.eq(0);
          expect(result.data.response.deleted).to.eq(0);
          expect(result.data.response.ignored).to.eq(0);
        }
      );
    }).timeout(20 * 1000);

    it('should enroll TEI into a given program', () => {
      let date = new Date();
      state = {
        ...state,
        data: {
          trackedEntityInstance: trackedEntityInstance,
          orgUnit: 'ImspTQPwCqd',
          program: 'WSGAb5XwJ3Y',
          enrollmentDate: date,
          incidentDate: date,
        },
      };

      console.log('state', state);
      return execute(enrollTEI(state.data))(state).then(result => {
        expect(result.data.response.imported).to.eq(1);
        expect(result.data.response.updated).to.eq(0);
        expect(result.data.response.deleted).to.eq(0);
        expect(result.data.response.ignored).to.eq(0);
      });
    }).timeout(20 * 1000);
  });
});
