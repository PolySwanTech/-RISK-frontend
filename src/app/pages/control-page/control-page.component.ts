import { Component } from '@angular/core';
import { ControlChartComponent } from "../../features/control/control-chart/control-chart/control-chart.component";

@Component({
  selector: 'app-control-page',
  imports: [ControlChartComponent],
  templateUrl: './control-page.component.html',
  styleUrl: './control-page.component.scss'
})
export class ControlPageComponent {

}
