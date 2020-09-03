import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';
import { K8sNodes } from '../app.types';

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.css']
})
export class NodeListComponent implements OnInit {
  k8sNodes: K8sNodes;
  isLoading = true;
  pageIndex = 1;
  pageSize = 10;

  constructor(private appService: AppServiceService) {
    this.k8sNodes = new K8sNodes();
  }

  ngOnInit(): void {

  }

  get firstItem(): number {
    return this.pageSize * (this.pageIndex - 1) + 1;
  }

  get lastItem(): number {
    return this.pageSize * this.pageIndex;
  }

  retrieve(): void {
    this.isLoading = true;
    this.appService.testK8s().subscribe(
      (res: K8sNodes) => this.k8sNodes = res,
      () => this.isLoading = false,
      () => this.isLoading = false
    );
  }
}
