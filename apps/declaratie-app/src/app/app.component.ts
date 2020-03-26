// tslint:disable: prefer-const
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

// import { EImageType, SignPadComponent } from '@gappl/ngx-sign-pad';

// import * as moment from 'moment';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as PDFDocument from './../pdfkit.standalone.js';
import * as blobStream from './../blob-stream.js';

import { Buffer } from 'buffer';

import { OPEN_SANS, OPEN_SANS_BOLD } from '../fonts';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MM.YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MM.YYYY',
  },
};

@Component({
  selector: 'declaratie-solution-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ]
})
export class AppComponent implements OnInit {
  constructor(
    private snackBar: MatSnackBar
  ) { }

  loading = false;

  hideEmergencyReasonCtrl = true;
  requestedDocument = 'declaratie';
  today = new Date();
  yearViewStartDate = new Date('1990-01-01T00:00:00.000Z');

  declaratieForm: FormGroup;
  adeverintaForm: FormGroup;

  // imageTypes = EImageType;
  // signature = null;
  // @ViewChild(SignPadComponent) signaturePad: SignPadComponent;

  ngOnInit() {
    // START AUTOMATION TOKEN
    this.declaratieForm = new FormGroup({
      lastName: new FormControl(''),
      firstName: new FormControl(''),
      fatherLastNameAndFirstName: new FormControl(''),
      motherLastNameAndFirstName: new FormControl(''),
      city: new FormControl(''),
      county: new FormControl(''),
      street: new FormControl(''),
      no: new FormControl(''),
      building: new FormControl(''),
      floor: new FormControl(''),
      apartment: new FormControl(''),
      cnp: new FormControl(''),
      biOrCi: new FormControl(''),
      biOrCiSeries: new FormControl(''),
      biOrCiNumber: new FormControl(''),
      actualCity: new FormControl(''),
      actualCounty: new FormControl(''),
      actualStreet: new FormControl(''),
      actualNo: new FormControl(''),
      actualBuilding: new FormControl(''),
      actualFloor: new FormControl(''),
      actualApartment: new FormControl(''),
      transitType: new FormControl(''),
      transitHours: new FormControl(''),
      transitFrom: new FormControl(''),
      transitTo: new FormControl(''),
      transitReason: new FormControl(''),
      emergencyReason: new FormControl(''),
      documentDate: new FormControl(''),
    });


    this.adeverintaForm = new FormGroup({
      employerLastName: new FormControl(''),
      employerFirstName: new FormControl(''),
      employerPosition: new FormControl(''),
      company: new FormControl(''),
      lastName: new FormControl(''),
      firstName: new FormControl(''),
      dateOfBirth: new FormControl(''),
      address: new FormControl(''),
      activityDomain: new FormControl(''),
      activityLocation: new FormControl(''),
      itinerary: new FormControl(''),
      transitMeans: new FormControl(''),
      documentDate: new FormControl(''),
    });// END AUTOMATION TOKEN

    const transitReasonCtrl = this.declaratieForm.controls.transitReason;
    const emergencyReasonCtrl = this.declaratieForm.controls.emergencyReason;
    transitReasonCtrl.valueChanges
      .subscribe((transitReason) => {
        console.log(transitReason, this.hideEmergencyReasonCtrl);
        if (transitReason === 'urgenta') {
          emergencyReasonCtrl.setValidators([Validators.required]);
          this.hideEmergencyReasonCtrl = false;
        } else {
          emergencyReasonCtrl.clearValidators()
          this.hideEmergencyReasonCtrl = true;
        }
      });

    const testDeclaratie = {
      lastName: 'Doe',
      firstName: 'John',
      fatherLastNameAndFirstName: 'Doe Jack',
      motherLastNameAndFirstName: 'Doe Jane',
      city: 'New York',
      county: 'NY',
      street: '5th',
      no: '721-725',
      building: 'Trump Tower',
      floor: '58',
      apartment: '420',
      cnp: '1000101112233',
      biOrCi: 'ci',
      biOrCiSeries: 'RR',
      biOrCiNumber: '123123',
      actualCity: 'Houston',
      actualCounty: 'TX',
      actualStreet: 'W 34th St',
      actualNo: '100',
      actualBuilding: 'Forest Oaks',
      actualFloor: '4',
      actualApartment: '20',
      transitType: 'profesional',
      transitHours: '22 - 23',
      transitFrom: 'Houston',
      transitTo: 'Washington, D.C.',
      transitReason: 'urgenta',
      emergencyReason: 'Corporate bailout',
      documentDate: new Date(),
    };

    const testAdeverinta = {
      employerLastName: 'Doe',
      employerFirstName: 'John',
      employerPosition: 'CEO',
      company: 'Dow Jones',
      lastName: 'Roe',
      firstName: 'Jane',
      dateOfBirth: new Date('1969-04-20T00:00:00.000Z'),
      address: '6th Ave.',
      activityDomain: 'Finance',
      activityLocation: 'Wall St.',
      itinerary: '6th Ave. -> Wall St.',
      transitMeans: 'Cab',
      documentDate: new Date(),
    };

    // this.generateDeclaratiePdf(testDeclaratie);
    // this.generateAdeverintaPdf(testAdeverinta);
  }

  getFilename(extension) {
    return this.requestedDocument + '-' + (new Date()).getTime() + '.' + extension;
  }

  goExternalLink() {
    window.open(window.location.href, '_system');
    return false;
  }

  isFacebookApp() {
    const ua = navigator.userAgent || navigator.vendor;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
  }

  throwIfNoDocumentDate(formGroupValue) {
    if (!formGroupValue.documentDate) {
      this.snackBar.open('Data este obligatorie.', 'OK', {
        duration: 3000
      });
      this.loading = false;
      throw new Error('Data este obligatorie.');
    }
  }

  download() {
    this.loading = true;

    if (this.requestedDocument === 'declaratie') {
      this.throwIfNoDocumentDate(this.declaratieForm.value);

      try {
        this.generateDeclaratiePdf(this.declaratieForm.value);
      } catch (e) {
        this.snackBar.open('Eroare: nu a putut fi realizată descărcarea fișierului ' + 'pdf'.toUpperCase() + '.', 'OK', {
          duration: 3000
        });
        console.error(e);
      }

      this.loading = false;
    }

    if (this.requestedDocument === 'adeverinta') {
      this.throwIfNoDocumentDate(this.adeverintaForm.value);

      try {
        this.generateAdeverintaPdf(this.adeverintaForm.value);
      } catch (e) {
        this.snackBar.open('Eroare: nu a putut fi realizată descărcarea fișierului ' + 'pdf'.toUpperCase() + '.', 'OK', {
          duration: 3000
        });
        console.error(e);
      }

      this.loading = false;
    }
  }

  // clear() {
  //   this.signaturePad.clear();
  // }

  saveBlobAs(res, filename) {
    const blob = new Blob([res]);
    saveAs(blob, filename);
    return res;
  }

  generateDeclaratiePdf(declaratie) {
    // tokens
    const transitReasonMap = {
      serviciu: false, medical: false, cumparaturi: false, asistenta: false, sport: false, animale: false, urgenta: false
    }

    // mark selected
    Object.keys(transitReasonMap).forEach((k) => {
      if (declaratie.transitReason === k) {
        transitReasonMap[k] = true;
      };
    });

    Object.keys(transitReasonMap).forEach((k) => {
      if (transitReasonMap[k]) {
        transitReasonMap[k] = '(x)';
      } else {
        transitReasonMap[k] = '( )';
      }
    });


    const buildingExpr = declaratie.building ? ` bloc ${declaratie.building},` : '';
    const floorExpr = declaratie.floor ? ` etaj ${declaratie.floor},` : '';
    const apartmentExpr = declaratie.apartment ? ` apartament ${declaratie.apartment},` : '';
    const actualBuildingExpr = declaratie.actualBuilding ? ` bloc ${declaratie.actualBuilding},` : '';
    const actualFloorExpr = declaratie.actualFloor ? ` etaj ${declaratie.actualFloor},` : '';
    const actualApartmentExpr = declaratie.actualApartment ? ` apartament ${declaratie.actualApartment},` : '';

    let {
      lastName,
      firstName,
      sex,
      fatherLastNameAndFirstName,
      motherLastNameAndFirstName,
      city,
      county,
      street,
      no,
      building,
      floor,
      apartment,
      cnp,
      biOrCi,
      biOrCiSeries,
      biOrCiNumber,
      actualCity,
      actualCounty,
      actualStreet,
      actualNo,
      actualBuilding,
      actualFloor,
      actualApartment,
      transitType,
      transitHours,
      transitFrom,
      transitTo,
      transitReasons,
      emergencyReason,
      documentDate
    } = declaratie;

    if (typeof biOrCi === 'string') {
      biOrCi = biOrCi.toUpperCase();
    }

    const tokens = {
      lastName,
      firstName,
      sex,
      fatherLastNameAndFirstName,
      motherLastNameAndFirstName,
      city,
      county,
      street,
      no,
      building,
      floor,
      apartment,
      cnp,
      biOrCi,
      biOrCiSeries,
      biOrCiNumber,
      actualCity,
      actualCounty,
      actualStreet,
      actualNo,
      actualBuilding,
      actualFloor,
      actualApartment,
      transitType,
      transitHours,
      transitFrom,
      transitTo,
      transitReasons,
      emergencyReason,
      documentDate,

      buildingExpr,
      floorExpr,
      apartmentExpr,
      actualBuildingExpr,
      actualFloorExpr,
      actualApartmentExpr,

    };

    documentDate = this.formatDateRo(documentDate);

    // pdf generation
    const doc = new PDFDocument();
    const stream = doc.pipe(blobStream());

    const openSans = (Buffer as any).from(OPEN_SANS, 'base64');
    const openSansBold = (Buffer as any).from(OPEN_SANS_BOLD, 'base64');

    doc
      .font(openSansBold, 12)
      .text(
        `DECLARAȚIE PE PROPRIE R\u0102SPUNDERE
      `, { align: 'center' })
      .font(openSans, 10)
      .text(`Subsemnatul(a) `, { indent: 48, continued: true })
      .font(openSansBold)
      .text(`${lastName} ${firstName}`, { continued: true })
      .font(openSans)
      .text(`, copilul lui `, { continued: true })
      .font(openSansBold)
      .text(`${fatherLastNameAndFirstName}`, { continued: true })
      .font(openSans)
      .text(` \u0219i al `, { continued: true })
      .font(openSansBold)
      .text(`${motherLastNameAndFirstName}`, { continued: true })
      .font(openSans)
      .text(`, domiciliat(\u0103) \u00EEn `, { continued: true })
      .font(openSansBold)
      .text(`${city}`, { continued: true })
      .font(openSans)
      .text(`, jude\u021Bul/sectorul `, { continued: true })
      .font(openSansBold)
      .text(`${county}`, { continued: true })
      .font(openSans)
      .text(`, strada `, { continued: true })
      .text(`${street}`, { continued: true })
      .text(`, num\u0103r ${no},`, { continued: true })
      .text(`${buildingExpr}${floorExpr}${apartmentExpr}`, { continued: true })
      .text(` av\u00E2nd CNP `, { continued: true })
      .font(openSansBold)
      .text(`${cnp}`, { continued: true })
      .font(openSans)
      .text(`, `, { continued: true })
      .font(openSansBold)
      .text(`${biOrCi},`, { continued: true })
      .font(openSans)
      .text(` seria `, { continued: true })
      .font(openSansBold)
      .text(`${biOrCiSeries}`, { continued: true })
      .font(openSans)
      .text(`, num\u0103r `, { continued: true })
      .font(openSansBold)
      .text(`${biOrCiNumber}`, { continued: true })
      .text(',')
      .font(openSans)
      .text(`Locuind \u00EEn fapt\u00B9 \u00EEn localitatea ${actualCity}, jude\u021Bul/sectorul ${actualCounty}, strada ${actualStreet}, num\u0103r ${actualNo}, ${actualBuildingExpr}${actualFloorExpr}${actualApartmentExpr}
      `, { indent: 48 })
      .moveDown()
      .font(openSansBold)
      .text(`(X) `, { continued: true, indent: 48 })
      .font(openSans)
      .text(`Cunosc\u00E2nd prevederile articolului 326, referitoare la falsul \u00EEn declara\u021Bii\u00B2, precum \u0219i ale art. 352 referitoare la z\u0103d\u0103rnicirea combaterii bolilor din Noul Cod Penal, declar pe proprie r\u0103spundere faptul c\u0103 m\u0103 deplasez \u00EEn interes profesional/personal, \u00EEntre orele `, { continued: true, indent: 48 })
      .font(openSansBold)
      .text(`${transitHours}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(`, de la `, { continued: true, indent: 48 })
      .font(openSansBold)
      .text(`${transitFrom}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(`, p\u00E2n\u0103 la `, { continued: true, indent: 48 })
      .font(openSansBold)
      .text(`${transitTo}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(`, pentru\u00B3:`, { indent: 48 })
      .font(openSansBold)
      .text(`${transitReasonMap['serviciu']}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(` deplasarea \u00EEntre domiciliu \u0219i locul de munc\u0103, atunci c\u00E2nd activitatea profesional\u0103 este esen\u021Bial\u0103 \u0219i nu poate fi organizat\u0103 sub form\u0103 de lucru la distan\u021B\u0103 sau deplasarea \u00EEn interes profesional care nu poate fi am\u00E2nat\u0103.)`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${transitReasonMap['medical']}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(` consult medical de specialitate care nu poate fi am\u00E2nat;`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${transitReasonMap['cumparaturi']}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(` deplasare pentru cump\u0103r\u0103turi de prim\u0103 necesitate la unit\u0103\u021Bi comerciale din zona de domiciliu;`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${transitReasonMap['asistenta']}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(` deplasare pentru asigurarea asisten\u021Bei pentru persoane \u00EEn v\u00E2rst\u0103, vulnerabile sau pentru \u00EEnso\u021Birea copiilor;`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${transitReasonMap['sport']}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(` deplasare scurt\u0103, l\u00E2ng\u0103 domiciliu, pentru desf\u0103\u0219urarea de activit\u0103\u021Bi fizice individuale, \u00EEn aer liber, cu excluderea oric\u0103rei forme de activitate sportiv\u0103 colectiv\u0103;`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${transitReasonMap['animale']}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(` deplasare scurt\u0103, l\u00E2ng\u0103 domiciliu, legat\u0103 de nevoile animalelor de companie`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${transitReasonMap['urgenta']}`, { continued: true, indent: 48 })
      .font(openSans)
      .text(` deplasare pentru rezolvarea urm\u0103toarei situa\u021Bii urgente `)
      .font(openSansBold)
      .text(`${emergencyReason}`)
      .font(openSans)
      .moveDown()
      .text(`At\u00E2t declar, sus\u021Bin \u0219i semnez.
      `, { indent: 48 })
      .moveDown()
      .text(`Data                                                                                                       Semn\u0103tura,`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${documentDate}`, { indent: 48 })
      .moveDown()
      .moveDown()
      .moveDown()
      .moveDown()
      .moveDown()
      .moveDown()
      .font(openSans, 6)
      .text(`\u00B9Se declar\u0103 situa\u021Bia \u00EEn care persoana nu locuie\u0219te la domiciliul prev\u0103zut \u00EEn actul de identitate.`,
        { indent: 48 })
      .text(`\u00B22. Declararea necorespunz\u0103toare a adev\u0103rului, f\u0103cut\u0103 unei persoane dintre cele prev\u0103zute \u00EEn art. 175 sau unei unit\u0103\u0163i \u00EEn care aceasta \u00EE\u015Fi desf\u0103\u015Foar\u0103 activitatea \u00EEn vederea producerii unei consecin\u021Be juridice, pentru sine sau pentru altul, atunci c\u00E2nd, potrivit legii ori \u00EEmprejur\u0103rilor, declara\u021Bia f\u0103cut\u0103 serve\u0219te la producerea acelei consecin\u021Be, se pedepse\u0219te cu \u00EEnchisoare de la 3 luni la 2 ani sau cu amend\u0103.`,
        { indent: 48 })
      .text(`\u00B3Se completeaz\u0103 motivul/cauzele deplas\u0103rii.`,
        { indent: 48 })
      .moveDown()
      .font(openSansBold, 10)
      .text(`Generat cu `, { continued: true })
      .text(`https://declaratie.egovernment.ro`, 10, 685, {
        link: `https://declaratie.egovernment.ro`,
        color: `blue`,
        underline: true
      });

    doc.end();
    stream.on('finish', function () {
      const blob = stream.toBlobURL('application/pdf');
      window.open(blob)
    });
  }

  formatDateRo(date) {
    return date.toISOString().substring(0, 10).replace(/-/g, '.').split('.').reverse().join('.');
  }

  generateAdeverintaPdf(adeverinta) {
    // tokens
    let {
      employerLastName,
      employerFirstName,
      employerPosition,
      company,
      lastName,
      firstName,
      dateOfBirth,
      address,
      activityDomain,
      activityLocation,
      itinerary,
      transitMeans,
      documentDate
    } = adeverinta;

    dateOfBirth = this.formatDateRo(dateOfBirth);
    documentDate = this.formatDateRo(documentDate);

    const tokens = {
      employerLastName,
      employerFirstName,
      employerPosition,
      company,
      lastName,
      firstName,
      dateOfBirth,
      address,
      activityDomain,
      activityLocation,
      itinerary,
      transitMeans,
      documentDate
    };

    // pdf generation
    const doc = new PDFDocument();
    const stream = doc.pipe(blobStream());

    const openSans = (Buffer as any).from(OPEN_SANS, 'base64');
    const openSansBold = (Buffer as any).from(OPEN_SANS_BOLD, 'base64');

    doc
      .font(openSansBold, 12)
      .text(
        `ADEVERINȚĂ PERMANENTĂ
      `, { align: 'center' })
      .font(openSans, 10)
      .text(`Subsemnatul (nume, prenume) `, { indent: 48, continued: true })
      .font(openSansBold)
      .text(`${employerLastName} ${employerFirstName}`, { continued: true })
      .font(openSans)
      .text(` în calitate de (funcția) `, { continued: true })
      .font(openSansBold)
      .text(`${employerPosition}`, { continued: true })
      .font(openSans)
      .text(` în cadrul (organizația) `, { continued: true })
      .font(openSansBold)
      .text(`${company}`, { continued: true })
      .font(openSans)
      .text(` confirm faptul că deplasarea persoanei menționată mai jos, între domiciliu și locul său de muncă, este esențială pentru activitatea organizației și nu poate fi organizată sub formă de telemuncă.`)
      .moveDown()
      .text(`Datele persoanei care se deplasează: `)
      .moveDown()
      .font(openSans)
      .text(`Nume: `, { continued: true })
      .font(openSansBold)
      .text(`${lastName}`)
      .font(openSans)
      .text(`Prenume: `, { continued: true })
      .font(openSansBold)
      .text(`${firstName}`)
      .font(openSans)
      .text(`Data nașterii: `, { continued: true })
      .font(openSansBold)
      .text(`${dateOfBirth}`)
      .font(openSans)
      .text(`Adresa: `, { continued: true })
      .font(openSansBold)
      .text(`${address},`)
      .font(openSans)
      .text(`Domeniul activității profesionale: `, { continued: true })
      .font(openSansBold)
      .text(`${activityDomain}`)
      .font(openSans)
      .text(`Locul de desfășurare al activității profesionale: `, { continued: true })
      .font(openSansBold)
      .text(`${activityLocation}`)
      .font(openSans)
      .text(`Traseul deplasării: `, { continued: true })
      .font(openSansBold)
      .text(`${itinerary}`)
      .font(openSans)
      .text(`Mijlocul de deplasare: `, { continued: true })
      .font(openSansBold)
      .text(`${transitMeans}`)
      .moveDown()
      .font(openSansBold)
      .text(`Subsemnatul cunosc prevederile art. 326 din Codul Penal cu privire la falsul în declarații și art. 352 din Codul Penal cu privire la zădărnicirea combaterii bolilor.`)
      .moveDown()
      .font(openSans)
      .text(`Data                                                                                                       Semn\u0103tura,`,
        { indent: 48 })
      .font(openSansBold)
      .text(`${documentDate}`, { indent: 48 })
      .moveDown()
      .moveDown()
      .moveDown()
      .moveDown()
      .moveDown()
      .moveDown()
      .font(openSans, 6)
      .text(`\u00B9Adeverința se va completa și certifica de către angajator sau alt reprezentant legal al acestuia.`)
      .moveDown()
      .font(openSansBold, 10)
      .text(`Generat cu `, { continued: true })
      .text(`https://declaratie.egovernment.ro`, 72, 489, {
        link: `https://declaratie.egovernment.ro`,
        color: `blue`,
        underline: true
      });

    doc.end();
    stream.on('finish', function () {
      const blob = stream.toBlobURL('application/pdf');
      window.open(blob)
    });
  }
}
