import { HttpBase, HttpBind, HttpBindArray, HttpBindObject } from './shared/model-types';
import { ElementRef } from '@angular/core';

export const RADIUS = 200;

export class Point {
  x: number;
  y: number;

  get clone(): Point {
    const point = new Point();
    point.x = this.x;
    point.y = this.y;
    return point;
  }
}

export enum Position {
  LeftTop, LeftBottom, RightTop, RightBottom
}

export enum VehiclePosition {
  LeftTopCircle, TopLine, RightTopCircle, RightBottomCircle, BottomLine, LeftBottomCircle
}

export class RaspberryPi {
  imageElement: HTMLImageElement;

  constructor(public position: Position) {

  }

  bindImageElement(element: ElementRef): void {
    this.imageElement = element.nativeElement as HTMLImageElement;
    switch (this.position) {
      case Position.LeftTop: {
        this.imageElement.style.left = '180px';
        this.imageElement.style.top = '60px';
        break;
      }
      case Position.LeftBottom: {
        this.imageElement.style.left = '180px';
        this.imageElement.style.top = '320px';
        break;
      }
      case Position.RightBottom: {
        this.imageElement.style.left = '980px';
        this.imageElement.style.top = '320px';
        break;
      }
      case Position.RightTop: {
        this.imageElement.style.left = '980px';
        this.imageElement.style.top = '60px';
        break;
      }
    }
  }
}

export class Vehicle {
  imageElement: HTMLImageElement;
  minAngle = 180 / (Math.PI * RADIUS);
  oldVehiclePosition: VehiclePosition;
  curTrackPoint: Point;
  curAngle = 0;

  constructor(public initTrackPosition: Point) {
    this.curTrackPoint = initTrackPosition.clone;
  }

  get position(): VehiclePosition {
    if (this.curTrackPoint.x >= RADIUS && this.curTrackPoint.x <= 990 && this.curTrackPoint.y === 0) {
      return VehiclePosition.TopLine;
    } else if (this.curTrackPoint.x >= RADIUS && this.curTrackPoint.x <= 990 && this.curTrackPoint.y === 400) {
      return VehiclePosition.BottomLine;
    } else if (this.curTrackPoint.x < RADIUS) {
      if (this.curTrackPoint.y <= RADIUS) {
        return VehiclePosition.LeftTopCircle;
      } else {
        return VehiclePosition.LeftBottomCircle;
      }
    } else if (this.curTrackPoint.x > 990) {
      if (this.curTrackPoint.y <= RADIUS) {
        return VehiclePosition.RightTopCircle;
      } else {
        return VehiclePosition.RightBottomCircle;
      }
    }
  }

  calculateTrackPoint(): void {
    if (this.curAngle >= 180) {
      this.curTrackPoint.y = 400;
    } else if (this.curAngle <= 0) {
      this.curTrackPoint.y = 0;
    }
    switch (this.position) {
      case VehiclePosition.TopLine: {
        this.curTrackPoint.x += 1;
        break;
      }
      case VehiclePosition.BottomLine: {
        this.curTrackPoint.x -= 1;
        break;
      }
      case VehiclePosition.RightTopCircle:
      case VehiclePosition.RightBottomCircle: {
        this.curTrackPoint.x = 990 + Math.sin(this.curAngle * (Math.PI / 180)) * RADIUS;
        this.curTrackPoint.y = RADIUS - Math.cos(this.curAngle * (Math.PI / 180)) * RADIUS;
        break;
      }
      case VehiclePosition.LeftBottomCircle:
      case VehiclePosition.LeftTopCircle: {
        this.curTrackPoint.x = RADIUS - Math.sin(this.curAngle * (Math.PI / 180)) * RADIUS;
        this.curTrackPoint.y = RADIUS - Math.cos(this.curAngle * (Math.PI / 180)) * RADIUS;
        break;
      }
    }
  }

  calculateAngle(): void {
    const curPosition = this.position;
    if (this.oldVehiclePosition === VehiclePosition.TopLine &&
      curPosition === VehiclePosition.RightTopCircle) {
      this.curAngle = this.minAngle;
    } else if (this.oldVehiclePosition === VehiclePosition.BottomLine &&
      curPosition === VehiclePosition.LeftBottomCircle) {
      this.curAngle = 180;
    }

    if (this.oldVehiclePosition === VehiclePosition.RightTopCircle ||
      this.oldVehiclePosition === VehiclePosition.RightBottomCircle) {
      this.curAngle += this.minAngle;
    } else if (this.oldVehiclePosition === VehiclePosition.LeftBottomCircle ||
      this.oldVehiclePosition === VehiclePosition.LeftTopCircle) {
      this.curAngle -= this.minAngle;
    }
  }

  get VehiclePoint(): Point {
    const point = new Point();
    switch (this.position) {
      case VehiclePosition.TopLine: {
        point.x = this.curTrackPoint.x - 60;
        point.y = this.curTrackPoint.y - 25;
        break;
      }
      case VehiclePosition.BottomLine: {
        point.x = this.curTrackPoint.x - 60;
        point.y = this.curTrackPoint.y - 37;
        break;
      }
      case VehiclePosition.RightTopCircle:
      case VehiclePosition.RightBottomCircle: {
        point.x = this.curTrackPoint.x - 60;
        point.y = this.curTrackPoint.y - 25 - (this.curAngle / 180) * 12;
        break;
      }
      case VehiclePosition.LeftTopCircle:
      case VehiclePosition.LeftBottomCircle: {
        point.x = this.curTrackPoint.x - 60;
        point.y = this.curTrackPoint.y - 37 + ((180 - this.curAngle) / 180) * 12;
        break;
      }
    }

    return point;
  }

  bindImageElement(element: ElementRef): void {
    this.imageElement = element.nativeElement as HTMLImageElement;
    const vehiclePoint = this.VehiclePoint;
    this.imageElement.style.left = `${vehiclePoint.x}px`;
    this.imageElement.style.top = `${vehiclePoint.y}px`;
  }

  run(): void {
    this.calculateAngle();
    this.calculateTrackPoint();
    this.oldVehiclePosition = this.position;
    const vehiclePoint = this.VehiclePoint;
    this.imageElement.style.left = `${vehiclePoint.x}px`;
    this.imageElement.style.top = `${vehiclePoint.y}px`;
    if (this.position === VehiclePosition.RightBottomCircle ||
      this.position === VehiclePosition.RightTopCircle) {
      this.imageElement.style.transform = `rotate(${this.curAngle}deg)`;
    } else if (this.position === VehiclePosition.LeftTopCircle ||
      this.position === VehiclePosition.LeftBottomCircle) {
      this.imageElement.style.transform = `rotate(${360 - this.curAngle}deg)`;
    }

  }
}

export class NodeMetadata extends HttpBase {
  @HttpBind('name') name = '';
  @HttpBind('creationTimestamp') creationTimestamp = '';
  @HttpBind('selfLink') selfLink = '';
  @HttpBind('annotations') annotations: { [index: string]: string };
  @HttpBind('labels') labels: { [index: string]: string };
}

export class NodeStatusAddress extends HttpBase {
  @HttpBind('address') address = '';
  @HttpBind('type') type = '';
}

export class NodeStatusAllocatable extends HttpBase {
  @HttpBind('cpu') cpu = '';
  @HttpBind('ephemeral-storage') ephemeralStorage = '';
  @HttpBind('hugepages-2Mi') hugePages = '';
  @HttpBind('memory') memory = '';
  @HttpBind('pods') pods = '';
}

export class NodeStatus extends HttpBase {
  @HttpBind('nodeInfo') nodeInfo: { [index: string]: string };
  @HttpBindArray('addresses', NodeStatusAddress) addresses: Array<NodeStatusAddress>;
  @HttpBindObject('allocatable', NodeStatusAllocatable) allocatable: NodeStatusAllocatable;

  protected prepareInit(): void {
    this.addresses = new Array<NodeStatusAddress>();
  }
}

export class Node extends HttpBase {
  @HttpBindObject('status', NodeStatus) status: NodeStatus;
  @HttpBindObject('metadata', NodeMetadata) metadata: NodeMetadata;
}

export class K8sNodeMetadata extends HttpBase {
  @HttpBind('resourceVersion') resourceVersion = '';
  @HttpBind('creationTimestamp') creationTimestamp = '';
}

export class K8sNodes extends HttpBase {
  @HttpBind('apiVersion') apiVersion = '';
  @HttpBind('kind') kind = '';
  @HttpBindObject('metadata', K8sNodeMetadata) metadata: K8sNodeMetadata;
  @HttpBindArray('items', Node) items: Array<Node>;

  protected prepareInit(): void {
    this.items = new Array<Node>();
  }
}
