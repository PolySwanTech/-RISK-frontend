import { Component, inject } from '@angular/core';
import { ProcessService } from '../../../core/services/process/process.service';

@Component({
  selector: 'app-list-process',
  imports: [],
  templateUrl: './list-process.component.html',
  styleUrl: './list-process.component.scss'
})
export class ListProcessComponent {

  processService = inject(ProcessService);

  processes: any[] = [];

  ngOnInit(): void {
    this.fetchProcesses();
  }
  fetchProcesses(): void {
    this.processService.getAllByEntite("d9039d48-07ce-4f98-a776-69dc668f1f33").subscribe((data: any[]) => {
      this.processes = data;
    }, error => {
      console.error('Error fetching processes:', error);
    });
  }

}
