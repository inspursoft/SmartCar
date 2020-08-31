import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Point, Position, RaspberryPi, Vehicle } from '../app.types';
import { interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasElement') canvasElement: ElementRef;
  @ViewChild('vehicle') vehicleElement: ElementRef;
  @ViewChild('imageLeftTop') imageLeftTop: ElementRef;
  @ViewChild('imageLeftBottom') imageLeftBottom: ElementRef;
  @ViewChild('imageRightTop') imageRightTop: ElementRef;
  @ViewChild('imageRightBottom') imageRightBottom: ElementRef;
  @ViewChild('divElement') divElement: ElementRef;
  leftTopPi: RaspberryPi;
  leftBottomPi: RaspberryPi;
  rightTopPi: RaspberryPi;
  rightBottomPi: RaspberryPi;
  vehicle: Vehicle;

  constructor() {
    const vehicleInitPoint = new Point();
    vehicleInitPoint.x = 900;
    vehicleInitPoint.y = 0;
    this.vehicle = new Vehicle(vehicleInitPoint);
    this.leftBottomPi = new RaspberryPi(Position.LeftBottom);
    this.leftTopPi = new RaspberryPi(Position.LeftTop);
    this.rightTopPi = new RaspberryPi(Position.RightTop);
    this.rightBottomPi = new RaspberryPi(Position.RightBottom);
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.leftBottomPi.bindImageElement(this.imageLeftBottom);
    this.leftTopPi.bindImageElement(this.imageLeftTop);
    this.rightBottomPi.bindImageElement(this.imageRightBottom);
    this.rightTopPi.bindImageElement(this.imageRightTop);
    this.vehicle.bindImageElement(this.vehicleElement);

    this.ctx.canvas.height = 420;
    this.ctx.canvas.width = 1220;
    // this.drawVehicleTrack();
    this.drawVehicleTrackBorder();

    window.requestAnimationFrame(this.moveVehicle.bind(this));
    // interval(1000).subscribe(() => this.moveVehicle());
  }

  get ctx(): CanvasRenderingContext2D {
    return (this.canvasElement.nativeElement as HTMLCanvasElement).getContext('2d');
  }

  moveVehicle(): void {
    this.vehicle.run();
    (this.divElement.nativeElement as HTMLDivElement).style.left = `${this.vehicle.curTrackPoint.x}px`;
    (this.divElement.nativeElement as HTMLDivElement).style.top = `${this.vehicle.curTrackPoint.y}px`;
    window.requestAnimationFrame(this.moveVehicle.bind(this));
  }

  drawVehicleTrackBorder(): void {
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.beginPath();
    this.ctx.moveTo(210, 0);
    this.ctx.lineTo(1000, 0);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(1000, 210, 210, Math.PI / 2, Math.PI + Math.PI / 2, true);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(1000, 420);
    this.ctx.lineTo(210, 420);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(210, 210, 210, Math.PI / 2, Math.PI + Math.PI / 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(200, 20);
    this.ctx.lineTo(1000, 20);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(1000, 210, 190, Math.PI / 2, Math.PI + Math.PI / 2, true);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(1000, 400);
    this.ctx.lineTo(200, 400);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(210, 210, 190, Math.PI / 2, Math.PI + Math.PI / 2);
    this.ctx.stroke();
  }

  drawVehicleTrack(): void {
    this.ctx.lineWidth = 20;
    this.ctx.beginPath();
    const gradientLeft = this.ctx.createRadialGradient(210, 210, 190, 210, 210, 210);
    gradientLeft.addColorStop(0, 'lightblue');
    gradientLeft.addColorStop(0.5, 'gray');
    gradientLeft.addColorStop(1, 'lightblue');
    this.ctx.strokeStyle = gradientLeft;
    this.ctx.arc(210, 210, 200, Math.PI / 2, Math.PI + Math.PI / 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    const gradientRight = this.ctx.createRadialGradient(1000, 210, 190, 1000, 210, 210);
    gradientRight.addColorStop(0, 'lightblue');
    gradientRight.addColorStop(0.5, 'gray');
    gradientRight.addColorStop(1, 'lightblue');
    this.ctx.strokeStyle = gradientRight;
    this.ctx.arc(1000, 210, 200, Math.PI / 2, Math.PI + Math.PI / 2, true);
    this.ctx.stroke();

    this.ctx.beginPath();
    const gradientTop = this.ctx.createLinearGradient(210, 0, 210, 20);
    gradientTop.addColorStop(0, 'lightblue');
    gradientTop.addColorStop(0.5, 'gray');
    gradientTop.addColorStop(1, 'lightblue');
    this.ctx.strokeStyle = gradientTop;
    this.ctx.moveTo(210, 10);
    this.ctx.lineTo(1000, 10);
    this.ctx.stroke();

    this.ctx.beginPath();
    const gradientBottom = this.ctx.createLinearGradient(210, 400, 210, 420);
    gradientBottom.addColorStop(0, 'lightblue');
    gradientBottom.addColorStop(0.5, 'gray');
    gradientBottom.addColorStop(1, 'lightblue');
    this.ctx.strokeStyle = gradientBottom;
    this.ctx.moveTo(1000, 410);
    this.ctx.lineTo(210, 410);
    this.ctx.stroke();
  }

}
