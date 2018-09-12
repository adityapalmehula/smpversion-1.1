import { Component, OnInit, Input } from '@angular/core';
import * as Chart from 'chart.js'

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent {
  @Input()id;
  @Input()labels;
  @Input()data;
  @Input()labelText;

  canvas: any;
  ctx: any;
  myChart:any;

  constructor() { }
  ngOnInit() {

  }
  ngAfterViewInit() {
    var data = {
      labels: this.labels,
      datasets: this.data
    };
    this.canvas = document.getElementById('barChart'+this.id);
    this.ctx = this.canvas.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'bar',
      data: data,
      options: {
        tooltips: {
          backgroundColor:'rgba(0,0,0,0.8)',
        },
        "hover": {
          "animationDuration": 0
        },
        "animation": {
          "duration": 1,
          "onComplete": function() {
            var chartInstance = this.chart,
            ctx = chartInstance.ctx;

            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            this.data.datasets.forEach(function(dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function(bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });
          }
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.labelText.y
            },
            gridLines: {
              display: false
            },
            ticks: {
              max: Math.max(...data.datasets[0].data)+10,
              display: true,
              beginAtZero: true
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.labelText.x
            },
            gridLines: {
              display: false
            },
            ticks: {
              beginAtZero: true,
              maxRotation:0,
              minRotation:0,
              autoSkip: false,
            },
          }]
        },
        responsive: true,
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            // fontColor: 'rgb(255, 99, 132)',
            boxWidth: 10,
            fontSize: 12
          }
        },
      },
      plugins: [{
        beforeInit: function (chart) {
          chart.data.labels.forEach(function (e, i, a) {
            a[i] = e[0].split(" ")
          })
        }
      }]
    });
  }

}
