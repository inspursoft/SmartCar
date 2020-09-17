import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';
import { DeviceList, DeviceDetail, Device, DeviceModel } from '../app.types';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {
  deviceList: DeviceList;
  isLoading = true;
  pageIndex = 1;
  pageSize = 10;
  isShowModel = false;
  isShowDetail = false;
  model: DeviceModel;
  device: Device;
  deviceDetail: DeviceDetail;
  begin: number;
  isDeviceLoading = true;
  isPropertiesEditable: Map<string, boolean>;
  exceptedValues: Array<string>;
  isEnableUpdate = true;

  constructor(private appService: AppServiceService) {
    this.deviceList = new DeviceList();
    this.device = new Device();
    this.model = new DeviceModel();
    this.isPropertiesEditable = new Map<string, boolean>();
  }

  ngOnInit(): void {
  }

  get firstItem(): number {
    return this.pageSize * (this.pageIndex - 1) + 1;
  }

  get lastItem(): number {
    return this.pageSize * this.pageIndex;
  }

  getDevice(): void {
    this.appService.getDeviceList().subscribe(
      (res: DeviceList) => {
        this.deviceList = res;
      },
      err => {
        console.error('some error:', err);
        this.isLoading = false;
      },
      () => this.isLoading = false
    );
  }

  showModel(modelName: string): void {
    this.appService.getDeviceModel(modelName).subscribe(
      (res: DeviceModel) => {
        this.model = res;
        this.model.setName(modelName);
        this.isShowModel = true;
      },
      err => {
        alert(err);
        console.error('some error:', err);
      }
    );
  }

  showDevice(device: Device): void {
    this.device = device;
    console.log(device);
    console.log(device.getPostBody());
    console.log(device.res);

    this.deviceDetail = new DeviceDetail(device);
    this.exceptedValues = new Array<string>(this.deviceDetail.twins.length);
    this.isEnableUpdate = true;
    this.appService.getDeviceModel(this.device.spec.deviceModelRef.name).subscribe(
      (res: DeviceModel) => {
        this.model = res;
        this.model.spec.properties.forEach(property => {
          const isEditable = typeof property.type.string !== 'undefined' ?
            property.type.string.accessMode : property.type.int.accessMode;
          this.isPropertiesEditable.set(property.name,
            isEditable.toUpperCase() === 'ReadWrite'.toUpperCase());
        });
        this.isShowDetail = true;
        this.updateDeviceInfo(device.metadata.name);
      },
      err => {
        console.error('some error:', err);
      }
    );
  }

  updateDeviceInfo(deviceName: string): void {
    this.begin = setInterval(() => {
      this.isDeviceLoading = true;
      this.appService.getDevice(deviceName).subscribe(
        (res: Device) => this.deviceDetail.pushValues(res),
        err => { console.error('Some err:', err); this.isDeviceLoading = false; },
        () => this.isDeviceLoading = false
      );
    }, 5000);
  }

  clearSetInterval(): void {
    this.isShowDetail = false;
    clearInterval(this.begin);
  }

  updateExcepted(propertyName: string, index: number): void {
    this.isEnableUpdate = false;
    this.appService.getDevice(this.device.metadata.name).subscribe(
      (dev: Device) => {
        this.device = dev;
        this.device.updateExpectedValue(propertyName, this.exceptedValues[index]);
        this.appService.putDevice(this.device, this.device.metadata.name).subscribe(
          res => {
            console.log(res);
            this.exceptedValues[index] = '';
            setTimeout(() => {
              this.isEnableUpdate = true;
            }, 3000);
          },
          err => alert(err.message)
        );
      },
      err => alert(err.message)
    );
  }
}
