import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { ActionPlan } from "../../../core/models/ActionPlan";

interface TimelinePoint {
  date: Date;
  label: string;
  position: number;
}

interface TimelineSegment {
  start: number;
  end: number;
  color: string;
  days: number;
  label: string;
}

@Component({
  selector: 'app-timeline-action-plan',
  imports: [CommonModule],
  templateUrl: './timeline-action-plan.component.html',
  styleUrls: ['./timeline-action-plan.component.scss']
})
export class TimelineActionPlanComponent implements OnInit, OnDestroy {

  @Input() actionPlan : ActionPlan | null = null;
  
  creationDate: Date = new Date();
  dueDate: Date =  new Date();
  currentDate: Date = new Date();

  points: TimelinePoint[] = [];
  segments: TimelineSegment[] = [];

  private intervalId: any;

  ngOnInit() {
    if(this.actionPlan){
      this.creationDate = new Date(this.actionPlan.createdAt);
      this.dueDate = new Date(this.actionPlan.echeance);
    }
    this.updateTimeline();

    // Mise à jour toutes les minutes
    this.intervalId = setInterval(() => {
      this.currentDate = new Date();
      this.updateTimeline();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateTimeline() {
    const dates = [
      { date: this.creationDate, label: 'Création' },
      { date: this.dueDate, label: 'Échéance' },
      { date: this.currentDate, label: 'Aujourd\'hui' }
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    const minDate = dates[0].date.getTime();
    const maxDate = dates[dates.length - 1].date.getTime();
    const totalRange = maxDate - minDate;

    // Calculer les positions (0-100%)
    this.points = dates.map(d => ({
      date: d.date,
      label: d.label,
      position: totalRange === 0 ? 50 : ((d.date.getTime() - minDate) / totalRange) * 100
    }));

    // Créer les segments
    this.segments = [];

    const creationPos = this.points.find(p => p.label === 'Création')!.position;
    const duePos = this.points.find(p => p.label === 'Échéance')!.position;
    const currentPos = this.points.find(p => p.label === 'Aujourd\'hui')!.position;

    const daysUntilDue = this.getDaysDifference(this.currentDate, this.dueDate);
    const daysFromCreation = this.getDaysDifference(this.creationDate, this.dueDate);

    // Segment 1 : Création -> Échéance
    const color1 = this.getSegmentColor(daysUntilDue);
    this.segments.push({
      start: creationPos,
      end: duePos,
      color: color1,
      days: daysFromCreation,
      label: `${daysFromCreation} jours (planifié)`
    });

    // Segment 2 : Échéance -> Aujourd'hui (si applicable)
    if (this.currentDate > this.dueDate) {
      const daysOverdue = this.getDaysDifference(this.dueDate, this.currentDate);
      this.segments.push({
        start: duePos,
        end: currentPos,
        color: '#f44336',
        days: daysOverdue,
        label: `${daysOverdue} jours de retard`
      });
    }
  }

  getDaysDifference(date1: Date, date2: Date): number {
    const diff = date2.getTime() - date1.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getSegmentColor(daysUntilDue: number): string {
    if (daysUntilDue < 0) {
      return '#f44336'; // Rouge (en retard)
    } else if (daysUntilDue < 7) {
      return '#f44336'; // Rouge (moins de 7 jours)
    } else if (daysUntilDue <= 30) {
      return '#ff9800'; // Orange (7-30 jours)
    } else {
      return '#4caf50'; // Vert (plus de 30 jours)
    }
  }

  getStatus(): string {
    const daysUntilDue = this.getDaysDifference(this.currentDate, this.dueDate);

    if (daysUntilDue < 0) {
      return `En retard de ${Math.abs(daysUntilDue)} jour(s)`;
    } else if (daysUntilDue === 0) {
      return 'Échéance aujourd\'hui';
    } else if (daysUntilDue < 7) {
      return `${daysUntilDue} jour(s) restant(s) - Urgent`;
    } else if (daysUntilDue <= 30) {
      return `${daysUntilDue} jour(s) restant(s) - Attention`;
    } else {
      return `${daysUntilDue} jour(s) restant(s) - Dans les temps`;
    }
  }

  getStatusColor(): string {
    const daysUntilDue = this.getDaysDifference(this.currentDate, this.dueDate);
    return this.getSegmentColor(daysUntilDue);
  }
}