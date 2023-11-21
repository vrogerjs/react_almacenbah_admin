import React, { useRef, useState, useEffect, PureComponent } from 'react';
import { PieChart, Pie, Area, Cell, AreaChart } from 'recharts';
import * as Rechart from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {CardContent,Card,CardHeader,IconButton,
  Button, Checkbox, Fab, styled, Table, TableCell, TextField,
  TableHead, TableBody, TablePagination, TableRow, TableContainer, Toolbar
} from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useResize, http } from 'gra-react-utils';
import Plot from 'react-plotly.js';
import { blue } from '@mui/material/colors';

const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Rechart;

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};



const data2 = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const data3 = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const size = [
  [
    [0], [0], [0]
  ],
  [
    [0], [0]
  ],
];

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function Plot2({ children, type, ...props }) {
  const [mounted, setCount] = useState(false);
  const [w, setW] = useState(1);
  const [h, setH] = useState(1);
  const el = useRef(null);
  useEffect(() => {
    // Update the document title using the browser API
    if (el.current) {
      var { offsetWidth, offsetHeight } = el.current.parentNode;
      window.setTimeout(() => {
        
        setW(offsetWidth);
        setH(offsetHeight);
        setCount(true);
      }, 1000);
    }
  }, [el.current]);
  var content=<div>Rendering...</div>;
  if(props.layout){
    props.title=props.layout.title;
    delete props.layout.title;
  }
  if (mounted) {
    if (type) {
      const T = Rechart[type];//`${type}`;
      var p = mergeDeep(props, { width: w, height: h-64  });
      content= <T {...p}>{children}</T>;
    {/*{e2.c}</ResponsiveContainer>*/}
      
    } else{
      var p = mergeDeep(props, { layout: { width: w, height: h-64 } });
      content= <Plot {...p}></Plot>;
    }
  }
  
  return <Card  ref={el} style={{height:h,width:w}}>
      <CardHeader  style={{backgroundColor:'gray',color:'white'}}
        
        action={
          <IconButton aria-label="settings" style={{color:'white'}}>
            <MoreVertIcon />
          </IconButton>
        }
        title={props.title||''}
      />
      <CardContent style={{height:h-64,padding:0}}>{content}</CardContent>

     </Card>
}

const ChartPanel = () => {

  const dispatch = useDispatch();

  const { width, height } = useResize(React);

  const [key, setKey] = React.useState(0);
  const [wh, setWH] = React.useState([{ w: 0, h: 0 }]);
  const [h, setH] = React.useState(0);
  const [w, setW] = React.useState(0);
  const [table, setTable] = React.useState([]);


  useEffect(() => {
    dispatch({ type: 'title', title: 'Gráficos' });
  }, []);

  useEffect(() => {

    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.dashboard');
    const nav = document.querySelector('nav');

    if (tableContainer && width) {
      wh[0].w = (width - nav.offsetWidth - 20);
      wh[0].h = wh[0].w;

      setW(width - nav.offsetWidth);
      setH(height - header.offsetHeight);

      var tt = [
        {
          items: [
            {
              c: <Plot2 type='PieChart' title="Grafico de Pastel" >
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}

                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </Plot2>
            },
            {
              c: <Plot2
                type='AreaChart'
                title='Grafico de Areas'
                width={wh[0].w}
                height={wh[0].w}
                data={data3}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="uv" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </Plot2>
            },
            {
              c: <Plot2
                data={[
                  {
                    x: [1, 2, 3],
                    y: [2, 6, 3],
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'red' },
                  },
                  { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] },
                ]}
                layout={{ width: 320, height: 240, title: 'A Fancy Plot' }}
              />
            },
          ]
        },
        {
          items: [
            {
              c: <Plot2

                data={[{
                  values: [16, 15, 12, 6, 5, 4, 42],
                  labels: ['US', 'China', 'European Union', 'Russian Federation', 'Brazil', 'India', 'Rest of World'],
                  domain: { column: 0 },
                  name: 'GHG Emissions',
                  hoverinfo: 'label+percent+name',
                  hole: .4,
                  type: 'pie'
                }, {
                  values: [27, 11, 25, 8, 1, 3, 25],
                  labels: ['US', 'China', 'European Union', 'Russian Federation', 'Brazil', 'India', 'Rest of World'],
                  text: 'CO2',
                  textposition: 'inside',
                  domain: { column: 1 },
                  name: 'CO2 Emissions',
                  hoverinfo: 'label+percent+name',
                  hole: .4,
                  type: 'pie'
                }]}

                layout={{
                  title: 'Global Emissions 1990-2011',
                  annotations: [
                    {
                      font: {
                        size: 20
                      },
                      showarrow: false,
                      text: 'GHG',
                      x: 0.17,
                      y: 0.5
                    },
                    {
                      font: {
                        size: 20
                      },
                      showarrow: false,
                      text: 'CO2',
                      x: 0.82,
                      y: 0.5
                    }
                  ],
                  showlegend: false,
                  grid: { rows: 1, columns: 2 }
                }}
              />
            },
            {
              flex: 2, c: <Plot2
                title='Grafico de Barras'
                type='BarChart'
                data={data2}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
              </Plot2>
            }
          ]
        }
      ];
      if (wh[0].w < 600) {
        tt.forEach((row, i) => {
          row.items.forEach(e2 => {
            e2.flex = 1;
            e2.width = wh[0].w - 10 -
              (tableContainer.offsetWidth - tableContainer.clientWidth) / 2;
            e2.height = wh[0].w;
          });
        });
      } else
        tt.forEach((row, i) => {
          var t = row.items.reduce((t, e2) => t + (e2.flex ? e2.flex : 1), 0);
          row.items.forEach(e2 => {
            e2.width = (e2.flex ? e2.flex : 1) * (wh[0].w - 10 * t -
              ((tableContainer.offsetWidth - tableContainer.clientWidth) / 2)) / t;
            e2.height = wh[0].w / t;
          });
        });

      setTable(tt);

      setWH(wh);
      setKey(key + 1);

    }





  }, [width, height]);





  return (

    <div className="dashboard" key={key} style={{ paddingBottom: 10, width: w, height: h, overflow: 'auto' }}>






      {
        table.map((e, i) =>
          <div key={'c_' + i}>{e.items.map((e2, c) => <div key={'c_' + i + '_' + c}
            style={{ float: 'left', display: 'inline-block', height: e2.height ? e2.height : 0, width: e2.width ? (e2.width + 10 * ((e2.flex || 1) - 1)) : 0, marginLeft: 10, marginTop: 10 }}>
            {e2.c}
          </div>)}</div>
        )
      }

    </div>

  );

};

export default ChartPanel;