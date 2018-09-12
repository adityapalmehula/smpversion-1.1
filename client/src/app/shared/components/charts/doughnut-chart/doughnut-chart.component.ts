import { Component, OnInit, AfterViewInit,Input } from '@angular/core';
import * as Chart from 'chart.js'

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.css']
})
export class DoughnutChartComponent implements AfterViewInit {
  @Input() labels;
  @Input() data;
  @Input() text;
  @Input() toolTipTitle;
  @Input() id;
  @Input() type?: string;

  canvas: any;
  ctx: any;
  myChart:any;
  display: boolean=true;
  fontColor:string='#fff';
  colors:any= [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)'
  ];
  height: number=180;
  width: number=450;
  center_text_ratio:number=2.5;

  constructor() { }

  ngOnInit() {
    if(this.type) {
      this.colors[1]="#CCD1D1";
      this.display=false;
      this.fontColor="#212121";
      this.height=152;
      this.center_text_ratio=2;
    }
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById('daughnutChart'+this.id);
    this.ctx = this.canvas.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'doughnut',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor:this.colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        legend: {
          display: this.display,
          position: 'bottom',
          labels: {
            //fontColor: 'rgb(255, 99, 132)',
            boxWidth: 10,
            fontSize: 12
          }
        },
        tooltips: {
          // Disable the on-canvas tooltip
          enabled: true,
          callbacks: {
            title:  (tooltipItems, data)=> {
              return this.toolTipTitle;
            },

            label: function(tooltipItem, data) {
              //get the concerned dataset
              let dataset = data.datasets[tooltipItem.datasetIndex];

              //get the current items value
              let currentValue = dataset.data[tooltipItem.index];
              
              let currentLabel = data.labels[tooltipItem.index]+" : "+currentValue;
              return currentLabel;
            }
          }
        }
      },
    });

    Chart.pluginService.register({
      beforeDraw: () =>{
        var width = this.myChart.chart.chart.width,
        height = this.myChart.chart.chart.height,
        ctx = this.myChart.chart.chart.ctx;

        ctx.restore();
        var fontSize = (height / 200).toFixed(2);
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";

        var text = this.text,
        textX = Math.round((width - ctx.measureText(text).width) / 2),
        textY = height / this.center_text_ratio;
        ctx.fillText(text, textX, textY);
        ctx.save();
      },
      afterDraw: ()=>{
        var ctx = this.myChart.chart.chart.ctx;
        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        this.myChart.config.data.datasets.forEach((dataset)=> {

          for (var i = 0; i < dataset.data.length; i++) {
            var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
            total = dataset._meta[Object.keys(dataset._meta)[0]].total,
            mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius)/2,
            start_angle = model.startAngle,
            end_angle = model.endAngle,
            mid_angle = start_angle + (end_angle - start_angle)/2;

            var x = mid_radius * Math.cos(mid_angle);
            var y = mid_radius * Math.sin(mid_angle);

            ctx.fillStyle = this.fontColor;
          if (i == 3){ // Darker text color for lighter background
            ctx.fillStyle = '#444';
          }
          ctx.fillText(dataset.data[i], model.x + x, model.y + y);
        }
      });               
      }
    })
  }

}
