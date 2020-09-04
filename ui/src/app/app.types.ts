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

// ############################### Device #####################################

export class DeviceMetadata extends HttpBase {
  @HttpBind('creationTimestamp') creationTimestamp = '';
  @HttpBind('generation') generation = 0;
  @HttpBind('labels') labels = '';
  @HttpBind('name') name = '';
  @HttpBind('namespace') namespace = '';
  @HttpBind('resourceVersion') resourceVersion = '';
  @HttpBind('selfLink') selfLink = '';
  @HttpBind('uid') uid = '';
}

export class DeviceModelRef extends HttpBase {
  @HttpBind('name') name = '';
}

export class MatchExpression extends HttpBase {
  @HttpBind('key') key = '';
  @HttpBind('operator') operator = '';
  @HttpBind('values') values = [];
  // @HttpBindStringArray('values', Array<string>) values: Array<string>;
}

export class NodeSelectorTerm extends HttpBase {
  @HttpBindArray('matchExpressions', MatchExpression) matchExpressions: Array<MatchExpression>;

  protected prepareInit(): void {
    this.matchExpressions = new Array<MatchExpression>();
  }
}

export class NodeSelector extends HttpBase {
  @HttpBindArray('nodeSelectorTerms', NodeSelectorTerm) nodeSelectorTerms: Array<NodeSelectorTerm>;

  protected prepareInit(): void {
    this.nodeSelectorTerms = new Array<NodeSelectorTerm>();
  }
}

export class Spec extends HttpBase {
  @HttpBindObject('deviceModelRef', DeviceModelRef) deviceModelRef: DeviceModelRef;
  @HttpBindObject('nodeSelector', NodeSelector) nodeSelector: NodeSelector;
}

export class TwinValueMetadata extends HttpBase {
  @HttpBind('type') type = '';
  @HttpBind('timestamp') timestamp = '';

  protected prepareInit(): void {
    this.timestamp = '0';
  }
}

export class TwinValue extends HttpBase {
  @HttpBind('value') value = '';
  @HttpBindObject('metadata', TwinValueMetadata) metadata: TwinValueMetadata;
}

export class Twin extends HttpBase {
  @HttpBindObject('desired', TwinValue) desired: TwinValue;
  @HttpBind('propertyName') propertyName = '';
  @HttpBindObject('reported', TwinValue) reported: TwinValue;
}

export class Twins extends HttpBase {
  @HttpBindArray('twins', Twin) twins: Array<Twin>;

  protected prepareInit(): void {
    this.twins = new Array<Twin>();
  }
}

export class Device extends HttpBase {
  @HttpBind('apiVersion') apiVersion = '';
  @HttpBind('kind') kind = '';
  @HttpBindObject('metadata', DeviceMetadata) metadata: DeviceMetadata;
  @HttpBindObject('spec', Spec) spec: Spec;
  @HttpBindObject('status', Twins) status: Twins;

  updateExpectedValue(propertyName: string, value: string): void {
    for (let index = 0; index < this.status.twins.length; index++) {
      if (this.status.twins[index].propertyName === propertyName) {
        this.status.twins[index].desired.value = value;
        break;
      }
    }
  }
}

export class DeviceList extends HttpBase {
  @HttpBind('apiVersion') apiVersion = '';
  @HttpBindArray('items', Device) items: Array<Device>;
  @HttpBind('kind') kind = '';

  protected prepareInit(): void {
    this.items = new Array<Device>();
  }
}

export class DeviceValue {
  timestamp = '';
  desired = '';
  reported = '';

  constructor(timestamp: string, desired: string, reported: string) {
    this.timestamp = timestamp ? timestamp : '/';
    this.desired = desired ? desired : '/';
    this.reported = reported ? reported : '/';
  }
}

export class DeviceDetail {
  twins: Array<string>;
  values: Map<string, Array<DeviceValue>>;

  constructor(device: Device) {
    this.twins = new Array<string>();
    this.values = new Map<string, Array<DeviceValue>>();
    device.status.twins.forEach(twin => {
      this.twins.push(twin.propertyName);
      const twinValue = new Array<DeviceValue>();
      const timestamp = typeof (twin.reported) !== 'undefined' ? twin.reported.metadata.timestamp : '0';
      const desired = twin.desired.value ? twin.desired.value : '/';
      const reported = typeof (twin.reported) !== 'undefined' ? twin.reported.value : '/';
      twinValue.push(
        new DeviceValue(timestamp, desired, reported));
      this.values.set(twin.propertyName, twinValue);
    });
  }

  pushValues(device: Device): void {
    device.status.twins.forEach(twin => {
      const list = this.values.get(twin.propertyName);
      const timestamp = typeof (twin.reported) !== 'undefined' ? twin.reported.metadata.timestamp : '0';
      const desired = twin.desired.value ? twin.desired.value : '/';
      const reported = typeof (twin.reported) !== 'undefined' ? twin.reported.value : '/';
      list.push(
        new DeviceValue(timestamp, desired, reported));
      if (list.length > 20) {
        list.shift();
      }
      this.values.set(twin.propertyName, list);
    });
  }
}

// ############################## DeviceModel ################################

export class ModelPropertyTypeValue extends HttpBase {
  @HttpBind('accessMode') accessMode = '';
  @HttpBind('defaultValue') defaultValue = '';
}

export class ModelPropertyType extends HttpBase {
  @HttpBindObject('string', ModelPropertyTypeValue) string: ModelPropertyTypeValue;
  @HttpBindObject('int', ModelPropertyTypeValue) int: ModelPropertyTypeValue;
}

export class ModelProperty extends HttpBase {
  @HttpBind('description') properties = '';
  @HttpBind('name') name = '';
  @HttpBindObject('type', ModelPropertyType) type: ModelPropertyType;
}

export class ModelSpec extends HttpBase {
  @HttpBind('properties') properties: Array<ModelProperty>;

  protected prepareInit(): void {
    this.properties = new Array<ModelProperty>();
  }
}

export class DeviceModel extends HttpBase {
  @HttpBind('apiVersion') apiVersion = '';
  @HttpBind('kind') kind = '';
  @HttpBindObject('spec', ModelSpec) spec: ModelSpec;
  name = '';

  setName(name: string): void {
    this.name = name;
  }
}
