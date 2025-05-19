import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matrix',
  imports: [CommonModule, FormsModule],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent {
  matrix: string[][] = [
    ['#fcf3cf', '#fcf3cf', '#f9e79f', '#e74c3c', '#e74c3c'],
    ['#fcf3cf', '#fcf3cf', '#f9e79f', '#f9e79f', '#e74c3c'],
    ['#f5f8fa', '#fcf3cf', '#f9e79f', '#f9e79f', '#e74c3c'],
    ['#f5f8fa', '#f5f8fa', '#fcf3cf', '#f9e79f', '#f9e79f'],
    ['#f5f8fa', '#f5f8fa', '#fcf3cf', '#fcf3cf', '#f9e79f'],
  ];
  selectedColor: string = '#f5f8fa';

  rowLabels: string[] = ['> 20 x', '> 10 x', '> 5 x', '> 3 x', '> 1 x'];
  colLabels: string[] = ['1k', '5k', '10k', '15k', '20k'];

  setColor(row: number, col: number): void {
    this.matrix[row][col] = this.selectedColor;
  }

  trackByFn(index: number, item: string): any {
    return index;  // Utiliser l'index pour suivre l'élément
  }

  getCellStyle(color: string): any {
    return {
      backgroundColor: color || '#f5f8fa',
      border: '1px solid #ccc',
      width: '40px',
      height: '40px',
      cursor: 'pointer'
    };
  }

    saveMatrice(){
      console.log(this.matrix);
    }
}