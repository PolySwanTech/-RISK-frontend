import { Component } from '@angular/core';
import { ControlChartComponent } from "../../features/control/control-chart/control-chart/control-chart.component";
import { ControlListComponent } from '../../features/control/control-list/control-list.component';

@Component({
  selector: 'app-control-page',
  imports: [ControlListComponent],
  templateUrl: './control-page.component.html',
  styleUrl: './control-page.component.scss'
})
export class ControlPageComponent {

}
