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

  @Input() actionPlan: ActionPlan | null = null;

  creationDate: Date = new Date();
  endDate: Date | undefined = undefined;
  dueDate: Date = new Date();
  currentDate: Date = new Date();

  points: TimelinePoint[] = [];
  segments: TimelineSegment[] = [];

  private intervalId: any;

  ngOnInit() {
    if (this.actionPlan) {
      this.creationDate = new Date(this.actionPlan.createdAt);
      this.endDate = this.actionPlan.closedAt ? new Date(this.actionPlan.closedAt) : undefined;
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
    // ... (votre code de tri des points reste identique)
    const dates = [
      { date: this.creationDate, label: 'Création' },
      { date: this.dueDate, label: 'Échéance' },
    ];

    if (this.endDate) {
      // Si clôturé, on ajoute uniquement la clôture
      dates.push({ date: this.endDate, label: 'Clôture' });
    } else {
      // Sinon, on garde le marqueur temporel actuel
      dates.push({ date: this.currentDate, label: 'Aujourd\'hui' });
    }

    dates.sort((a, b) => a.date.getTime() - b.date.getTime());

    const minDate = dates[0].date.getTime();
    const maxDate = dates[dates.length - 1].date.getTime();
    const totalRange = maxDate - minDate;

    // Calculer les positions (0-100%)
    this.points = dates.map(d => ({
      date: d.date,
      label: d.label,
      position: totalRange === 0 ? 50 : ((d.date.getTime() - minDate) / totalRange) * 100
    }));

    // Récupération sécurisée des positions
    const creationPos = this.points.find(p => p.label === 'Création')?.position || 0;
    const duePos = this.points.find(p => p.label === 'Échéance')?.position || 0;
    const closedPoint = this.points.find(p => p.label === 'Clôture');
    const currentPoint = this.points.find(p => p.label === 'Aujourd\'hui');

    const currentPos = currentPoint ? currentPoint.position : (closedPoint ? closedPoint.position : duePos);

    this.segments = [];

    // Déterminer la couleur du segment principal
    let mainSegmentColor: string;
    const daysFromCreation = this.getDaysDifference(this.creationDate, this.dueDate);

    if (this.endDate) {
      // Si clôturé : on compare la date de clôture à l'échéance
      const diffClosureDue = this.getDaysDifference(this.endDate, this.dueDate);
      mainSegmentColor = this.getSegmentColor(diffClosureDue, true);
    } else {
      // Si pas clôturé : logique classique basée sur la date du jour
      const daysUntilDue = this.getDaysDifference(this.currentDate, this.dueDate);
      mainSegmentColor = this.getSegmentColor(daysUntilDue, false);
    }

    // Segment 1 : Création -> Échéance
    this.segments.push({
      start: creationPos,
      end: duePos,
      color: mainSegmentColor,
      days: daysFromCreation,
      label: this.endDate ? "Terminer" : `${daysFromCreation} jours (planifié)`
    });

    // Segment 2 : Échéance -> Aujourd'hui ou Clôture (si retard)
    const referenceDate = this.endDate || this.currentDate;
    if (referenceDate > this.dueDate) {
      const daysOverdue = this.getDaysDifference(this.dueDate, referenceDate);
      this.segments.push({
        start: duePos,
        end: closedPoint ? closedPoint.position : currentPos,
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

  getSegmentColor(daysUntilDue: number, isClosed: boolean = false): string {
    // Si le plan est clôturé
    if (isClosed) {
      // Si la clôture a eu lieu après l'échéance (daysUntilDue est calculé entre clôture et échéance ici)
      return daysUntilDue < 0 ? '#f44336' : '#4caf50';
    }

    // Logique existante pour les plans en cours
    if (daysUntilDue < 0) return '#f44336';
    if (daysUntilDue < 7) return '#f44336';
    if (daysUntilDue <= 30) return '#ff9800';
    return '#4caf50';
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