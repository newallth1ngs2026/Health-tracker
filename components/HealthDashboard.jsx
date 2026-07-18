import { useState, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Cell, ComposedChart, Area, ScatterChart, Scatter, CartesianGrid } from "recharts";

// ─── GOALS ───────────────────────────────────────────────────────────────────
const GOALS = {
  sleep: 7,           // hours
  bedtime: "22:30",   // 10:30 PM
  steps: 8000,
  exercise: 30,       // min/day
  distance: 4,        // mi/day
};

// Date threshold: BP readings on/after this datetime are from the arm cuff
const ARM_CUFF_START = "2026-05-16 18:00";

// ─── DATA ────────────────────────────────────────────────────────────────────
// All data derived from Apple Health JSON exports.
// `bedtimeHr` = hours past 6 PM (so 10:30 PM = 4.5, midnight = 6, 1 AM = 7).

const ALL_DAYS = [
  { date:"2026-04-16", label:"4/16", dist:1.93 },
  { date:"2026-04-17", label:"4/17", dist:2.51 },
  { date:"2026-04-18", label:"4/18", dist:2.82 },
  { date:"2026-04-19", label:"4/19", dist:4.13 },
  { date:"2026-04-20", label:"4/20", dist:1.74 },
  { date:"2026-04-21", label:"4/21", dist:0.59 },
  { date:"2026-04-22", label:"4/22", dist:1.01 },
  { date:"2026-04-23", label:"4/23", dist:1.54 },
  { date:"2026-04-24", label:"4/24", dist:1.83 },
  { date:"2026-04-25", label:"4/25", dist:1.88 },
  { date:"2026-04-26", label:"4/26", dist:1.36 },
  { date:"2026-04-27", label:"4/27", dist:3.20 },
  { date:"2026-04-28", label:"4/28", dist:1.39 },
  { date:"2026-04-29", label:"4/29", dist:5.11, exMins:89,  active:986,  basal:2171, rhr:85, walkHR:103, hrv:24.1 },
  { date:"2026-04-30", label:"4/30", dist:4.90, exMins:79,  active:798,  basal:2176, rhr:84, walkHR:98,  hrv:26.4, sleep:5.59, deep:0.82, rem:1.18, core:3.58 },
  { date:"2026-05-01", label:"5/1",  dist:2.74, exMins:55,  active:555,  basal:2065, rhr:82, walkHR:100, hrv:20.8, sleep:5.08, deep:0.66, rem:0.84, core:3.58, bedtimeHr:5.10 },
  { date:"2026-05-02", label:"5/2",  dist:4.44, exMins:18,  active:409,  basal:2078, rhr:80, walkHR:97,  hrv:23.4, sleep:3.27, deep:0.43, rem:0.25, core:2.58, bedtimeHr:8.30 },
  { date:"2026-05-03", label:"5/3",  dist:3.15, exMins:16,  active:482,  basal:2155, rhr:79, walkHR:98,  hrv:21.3, sleep:7.23, deep:0.88, rem:0.72, core:1.79, bedtimeHr:4.20 },
  { date:"2026-05-04", label:"5/4",  dist:4.40, exMins:34,  active:689,  basal:2185, rhr:88, walkHR:109, hrv:29.9, sleep:3.31, deep:0.63, rem:0.43, core:2.24, bedtimeHr:8.40 },
  { date:"2026-05-05", label:"5/5",  dist:3.99, exMins:60,  active:703,  basal:1970, rhr:90, walkHR:112, hrv:21.9, sleep:5.03, deep:0.95, rem:0.77, core:3.31, bedtimeHr:6.20 },
  { date:"2026-05-06", label:"5/6",  dist:5.25, exMins:179, active:1602, basal:2186, rhr:72, walkHR:94,  hrv:24.4, sleep:4.91, deep:0.73, rem:1.24, core:2.94, bedtimeHr:6.50 },
  { date:"2026-05-07", label:"5/7",  dist:5.92, exMins:69,  active:1133, basal:2248, rhr:89, walkHR:109, hrv:22.1, sleep:5.35, deep:0.93, rem:1.19, core:3.23, bedtimeHr:5.90 },
  { date:"2026-05-10", label:"5/10", dist:4.66, exMins:16,  active:587,  basal:2207, rhr:79, walkHR:94,  hrv:16.5, sleep:5.68, deep:0.76, rem:0.72, core:2.75, bedtimeHr:8.37 },
  { date:"2026-05-11", label:"5/11", dist:5.61, exMins:64,  active:1089, basal:2391, rhr:84, walkHR:114, hrv:22.7, sleep:5.59, deep:0.88, rem:0.97, core:3.74, bedtimeHr:5.68 },
  { date:"2026-05-12", label:"5/12", dist:4.96, exMins:82,  active:1230, basal:2244, rhr:79, walkHR:117, hrv:16.4, sleep:6.00, deep:0.78, rem:0.56, core:4.67, bedtimeHr:5.85 },
  { date:"2026-05-13", label:"5/13", dist:3.20, exMins:81,  active:938,  basal:2267, rhr:73, walkHR:null,hrv:19.6, sleep:5.78, deep:1.01, rem:0.78, core:3.99, bedtimeHr:5.58 },
  { date:"2026-05-14", label:"5/14", dist:5.35, exMins:51,  active:891,  basal:2362, rhr:80, walkHR:119, hrv:22.5, sleep:5.67, deep:0.83, rem:0.91, core:3.93, bedtimeHr:6.35 },
  { date:"2026-05-15", label:"5/15", dist:3.13, exMins:22,  active:563,  basal:2250, rhr:88, walkHR:103, hrv:25.4, sleep:5.48, deep:0.65, rem:1.44, core:3.39, bedtimeHr:6.47 },
  { date:"2026-05-16", label:"5/16", dist:0.94, exMins:4,   active:147,  basal:965,  rhr:79, walkHR:88.5,hrv:25.5, sleep:6.43, deep:1.11, rem:1.00, core:4.32, bedtimeHr:7.35 },
  { date:"2026-05-18", label:"5/18", dist:4.51, exMins:58,  active:934,  basal:2313, rhr:84, walkHR:109, hrv:17.5, steps:10097 },
  { date:"2026-05-19", label:"5/19", dist:2.60, exMins:6,   active:505,  basal:2214, rhr:79, walkHR:96,  hrv:37.3, steps:5777,  sleep:7.36, deep:0.57, rem:1.60, core:5.18, bedtimeHr:5.80 },
  { date:"2026-05-20", label:"5/20", dist:5.04, exMins:82,  active:1189, basal:2293, rhr:90, walkHR:106, hrv:27.5, steps:10592, sleep:5.41, deep:0.89, rem:0.96, core:3.56, bedtimeHr:6.57 },
  { date:"2026-05-21", label:"5/21", dist:5.59, exMins:150, active:1605, basal:2356, rhr:89, walkHR:108, hrv:20.6, steps:12237, sleep:4.75, deep:0.61, rem:0.86, core:3.28, bedtimeHr:6.63 },
  { date:"2026-05-22", label:"5/22", dist:4.25, exMins:10,  active:561,  basal:2179, rhr:83, walkHR:111, hrv:26.1, steps:9546,  sleep:7.48, deep:1.47, rem:0.71, core:5.31, bedtimeHr:8.23 },
  { date:"2026-05-23", label:"5/23", dist:4.78, exMins:21,  active:786,  basal:2323, rhr:84, walkHR:101, hrv:21.5, steps:10548, sleep:4.42, deep:0,    rem:0,    core:0,    bedtimeHr:9.85 },
  { date:"2026-05-24", label:"5/24", dist:2.63, exMins:4,   active:465,  basal:2204, rhr:79, walkHR:96,  hrv:19.5, steps:5830,  sleep:7.67, deep:0.81, rem:2.02, core:4.85, bedtimeHr:7.20 },
  { date:"2026-05-25", label:"5/25", dist:3.60, exMins:55,  active:619,  basal:2127, rhr:88, walkHR:104, hrv:22.3, steps:8067 },
  { date:"2026-05-26", label:"5/26", dist:6.18, exMins:48,  active:893,  basal:2274, rhr:84, walkHR:122, hrv:21.1, steps:13612, sleep:6.58, deep:1.32, rem:1.11, core:4.16, bedtimeHr:5.40 },
  { date:"2026-05-27", label:"5/27", dist:6.30, exMins:74,  active:1059, basal:2345, rhr:91, walkHR:117, hrv:21.0, steps:14009, sleep:6.48, deep:0.75, rem:1.06, core:4.68, bedtimeHr:4.90 },
  { date:"2026-05-28", label:"5/28", dist:3.45, exMins:10,  active:699,  basal:2368, rhr:85, walkHR:103, hrv:23.8, steps:7547,  sleep:5.39, deep:1.02, rem:0.82, core:3.55, bedtimeHr:6.15 },
  { date:"2026-05-29", label:"5/29", dist:5.00, exMins:164, active:1115, basal:2206, rhr:73, walkHR:101, hrv:22.6, steps:11227, sleep:6.93, deep:0.97, rem:1.56, core:4.41, bedtimeHr:8.02 },
];

// BP readings — pulled from Apple Health JSON. `dt` = ISO-like datetime so we can route to device.
const BP_READINGS = [
  { dt:"2026-05-03 09:00", label:"5/3",   sys:133, dia:75  },
  { dt:"2026-05-04 09:00", label:"5/4",   sys:142, dia:82  },
  { dt:"2026-05-05 06:00", label:"5/5",   sys:141, dia:77  },
  { dt:"2026-05-05 12:00", label:"5/5",   sys:117, dia:74  },
  { dt:"2026-05-05 20:00", label:"5/5",   sys:144, dia:82  },
  { dt:"2026-05-06 06:00", label:"5/6",   sys:127, dia:76  },
  { dt:"2026-05-06 09:00", label:"5/6",   sys:142, dia:89  },
  { dt:"2026-05-06 13:00", label:"5/6",   sys:133, dia:88  },
  { dt:"2026-05-06 17:00", label:"5/6",   sys:146, dia:78  },
  { dt:"2026-05-06 21:00", label:"5/6",   sys:118, dia:74  },
  { dt:"2026-05-07 06:00", label:"5/7",   sys:141, dia:78  },
  { dt:"2026-05-10 02:00", label:"5/10",  sys:133, dia:60  },
  { dt:"2026-05-11 06:00", label:"5/11",  sys:122, dia:77  },
  { dt:"2026-05-12 07:00", label:"5/12",  sys:122, dia:86  },
  { dt:"2026-05-12 23:00", label:"5/12",  sys:113, dia:76  },
  { dt:"2026-05-13 06:00", label:"5/13",  sys:120, dia:79  },
  { dt:"2026-05-13 12:00", label:"5/13",  sys:136, dia:96  },
  { dt:"2026-05-13 13:00", label:"5/13",  sys:123, dia:65  },
  { dt:"2026-05-18 21:55", label:"5/18",  sys:132, dia:80  },
  { dt:"2026-05-18 21:57", label:"5/18",  sys:131, dia:80  },
  { dt:"2026-05-19 07:57", label:"5/19",  sys:116, dia:75  },
  { dt:"2026-05-20 20:44", label:"5/20",  sys:134, dia:93  },
  { dt:"2026-05-20 22:48", label:"5/20",  sys:104, dia:73  },
  { dt:"2026-05-21 20:23", label:"5/21",  sys:116, dia:83  },
  { dt:"2026-05-25 22:00", label:"5/25",  sys:142, dia:83  },
  { dt:"2026-05-26 07:00", label:"5/26",  sys:122, dia:86  },
  { dt:"2026-05-27 23:00", label:"5/27",  sys:124, dia:79  },
];

// Tag each BP with device based on the cutover datetime
const ALL_BP = BP_READINGS.map(b => ({ ...b, device: b.dt >= ARM_CUFF_START ? "arm" : "wrist" }));

const VO2 = [
  { day:"5/4",  val:31.32 },
  { day:"5/11", val:30.98 },
  { day:"5/12", val:31.22 },
  { day:"5/14", val:30.61 },
];

const LAB_GROUPS = [
  { group:"Metabolic", markers:[
    { name:"Glucose", unit:"mg/dL", lo:65, hi:99, pts:[["2018-03-14",96.0],["2018-09-11",98.0],["2019-03-28",85.0],["2019-10-24",91.0],["2020-08-11",85.0],["2020-09-01",101.0],["2021-03-03",85.0],["2021-09-10",89.0],["2022-06-03",91.0],["2023-09-28",94.0],["2023-12-07",117.0],["2024-05-14",88.0],["2024-12-09",84.0],["2025-05-22",96.0],["2025-09-03",99.0],["2026-05-12",95.0],["2026-05-20",90.0]] },
    { name:"HbA1c", unit:"%", lo:4.0, hi:5.6, pts:[["2025-09-03",5.5],["2026-05-12",5.4],["2026-05-20",5.6]] },
    { name:"BMI", unit:"kg/m²", lo:18.5, hi:24.9, pts:[["2018-03-15",28.41],["2018-09-18",28.98],["2019-04-02",28.41],["2019-10-30",28.55],["2020-08-18",28.98],["2022-06-09",29.81],["2023-10-03",30.62],["2024-12-16",30.7],["2025-05-01",30.99]] },
  ]},
  { group:"Lipids", markers:[
    { name:"Total Cholesterol", unit:"mg/dL", lo:100, hi:199, pts:[["2018-09-11",151.0],["2019-03-28",152.0],["2019-10-24",155.0],["2020-08-11",163.0],["2020-09-01",168.0],["2021-03-03",163.0],["2022-06-03",131.0],["2022-08-25",146.0],["2023-09-28",171.0],["2023-12-07",187.0],["2024-12-09",197.0],["2025-05-22",194.0],["2025-09-03",164.0],["2026-05-12",189.0]] },
    { name:"LDL Cholesterol", unit:"mg/dL", lo:0, hi:99, pts:[["2018-09-11",96.0],["2019-03-28",100.0],["2019-10-24",100.4],["2020-08-11",112.8],["2020-09-01",101.0],["2021-03-03",104.7],["2022-06-03",77.3],["2022-08-25",86.0],["2023-09-28",110.3],["2023-12-07",119.0],["2024-12-09",129.6],["2025-05-22",128.0],["2025-09-03",104.0],["2026-05-12",129.0]] },
    { name:"HDL Cholesterol", unit:"mg/dL", lo:39, hi:null, pts:[["2018-09-11",46.0],["2019-03-28",42.0],["2019-10-24",43.0],["2020-08-11",43.0],["2020-09-01",52.0],["2021-03-03",48.0],["2022-06-03",33.0],["2022-08-25",45.0],["2023-09-28",51.0],["2023-12-07",52.0],["2024-12-09",56.0],["2025-05-22",44.0],["2025-09-03",46.0],["2026-05-12",46.0]] },
    { name:"Triglycerides", unit:"mg/dL", lo:0, hi:149, pts:[["2018-09-11",43.0],["2019-03-28",52.0],["2019-10-24",58.0],["2020-08-11",38.0],["2020-09-01",75.0],["2021-03-03",54.0],["2022-06-03",105.0],["2022-08-25",76.0],["2023-09-28",47.0],["2023-12-07",65.0],["2024-12-09",59.0],["2025-05-22",112.0],["2025-09-03",70.0],["2026-05-12",85.0]] },
    { name:"Chol/HDL Ratio", unit:"ratio", lo:0, hi:5, pts:[["2018-09-11",3.3],["2019-03-28",3.7],["2019-10-24",3.6],["2020-08-11",3.8],["2020-09-01",3.2],["2021-03-03",3.4],["2022-06-03",4.0],["2023-09-28",3.3],["2023-12-07",3.6],["2024-12-09",3.5],["2025-05-22",4.4],["2025-09-03",3.6],["2026-05-12",4.1]] },
  ]},
  { group:"Kidney", markers:[
    { name:"BUN", unit:"mg/dL", lo:6, hi:24, pts:[["2018-03-14",17.0],["2018-09-11",15.0],["2019-03-28",13.0],["2019-10-24",11.0],["2020-08-11",11.0],["2020-09-01",11.0],["2021-03-03",8.0],["2021-09-10",16.0],["2022-06-03",16.0],["2023-09-28",18.0],["2023-12-07",11.0],["2024-05-14",13.0],["2024-12-09",13.0],["2025-05-22",14.0],["2025-09-03",13.0],["2026-05-12",12.0]] },
    { name:"Creatinine", unit:"mg/dL", lo:0.76, hi:1.27, pts:[["2018-03-14",1.18],["2018-09-11",1.18],["2019-03-28",1.31],["2019-10-24",1.36],["2020-08-11",1.18],["2020-09-01",1.19],["2021-03-03",1.2],["2021-09-10",1.25],["2022-06-03",1.06],["2023-09-28",1.21],["2023-12-07",1.31],["2024-05-14",1.15],["2024-12-09",1.26],["2025-05-22",1.44],["2025-09-03",1.23],["2026-05-12",1.3]] },
    { name:"eGFR", unit:"mL/min", lo:59, hi:null, pts:[["2018-03-14",77.0],["2018-09-11",76.0],["2019-03-28",67.0],["2019-10-24",64.0],["2020-08-11",75.0],["2021-03-03",74.0],["2021-09-10",70.0],["2022-06-03",85.0],["2023-09-28",75.0],["2024-05-14",79.0],["2024-12-09",71.0],["2025-05-22",60.0],["2025-09-03",73.0],["2026-05-12",68.0]] },
  ]},
  { group:"Electrolytes", markers:[
    { name:"Sodium", unit:"mmol/L", lo:134, hi:144, pts:[["2018-03-14",140.0],["2018-09-11",138.0],["2019-03-28",140.0],["2019-10-24",139.0],["2020-08-11",139.0],["2020-09-01",140.0],["2021-03-03",142.0],["2021-09-10",140.0],["2022-06-03",141.0],["2023-09-28",142.0],["2023-12-07",140.0],["2024-05-14",140.0],["2024-12-09",142.0],["2025-05-22",142.0],["2025-09-03",140.0],["2026-05-12",140.0]] },
    { name:"Potassium", unit:"mmol/L", lo:3.5, hi:5.2, pts:[["2018-03-14",4.3],["2018-09-11",4.1],["2019-03-28",4.4],["2019-10-24",4.3],["2020-08-11",4.3],["2020-09-01",4.2],["2021-03-03",4.2],["2021-09-10",4.2],["2022-06-03",4.2],["2023-09-28",4.3],["2023-12-07",4.6],["2024-05-14",4.5],["2024-12-09",4.4],["2025-05-22",4.7],["2025-09-03",4.5],["2026-05-12",4.2]] },
    { name:"Chloride", unit:"mmol/L", lo:96, hi:106, pts:[["2018-03-14",105.0],["2018-09-11",102.0],["2019-03-28",103.0],["2019-10-24",103.0],["2020-08-11",104.0],["2020-09-01",102.0],["2021-03-03",105.0],["2021-09-10",106.0],["2022-06-03",105.0],["2023-09-28",107.0],["2023-12-07",103.0],["2024-05-14",105.0],["2024-12-09",105.0],["2025-05-22",103.0],["2025-09-03",102.0],["2026-05-12",102.0]] },
    { name:"CO₂, Total", unit:"mmol/L", lo:18, hi:29, pts:[["2018-03-14",28.0],["2018-09-11",29.0],["2019-03-28",28.0],["2019-10-24",30.0],["2020-08-11",28.0],["2020-09-01",27.0],["2021-03-03",31.0],["2021-09-10",30.0],["2022-06-03",33.0],["2023-09-28",30.0],["2023-12-07",31.0],["2024-05-14",31.0],["2024-12-09",31.0],["2025-05-22",30.0],["2025-09-03",26.0],["2026-05-12",27.0]] },
    { name:"Calcium", unit:"mg/dL", lo:8.7, hi:10.2, pts:[["2018-03-14",9.2],["2018-09-11",8.8],["2019-03-28",9.1],["2019-10-24",9.1],["2020-08-11",9.0],["2020-09-01",9.7],["2021-03-03",9.1],["2021-09-10",9.1],["2022-06-03",9.2],["2023-09-28",9.0],["2023-12-07",9.4],["2024-05-14",9.2],["2024-12-09",8.7],["2025-05-22",9.7],["2025-09-03",9.3],["2026-05-12",9.2]] },
    { name:"Phosphorus", unit:"mg/dL", lo:2.8, hi:4.1, pts:[["2026-05-12",2.7]] },
    { name:"Magnesium", unit:"mg/dL", lo:1.6, hi:2.3, pts:[["2026-05-12",2.2]] },
  ]},
  { group:"Liver & Protein", markers:[
    { name:"AST (SGOT)", unit:"U/L", lo:0, hi:40, pts:[["2018-03-14",28.0],["2018-09-11",23.0],["2019-03-28",18.0],["2019-10-24",21.0],["2020-08-11",18.0],["2020-09-01",21.0],["2021-03-03",15.0],["2022-06-03",14.0],["2023-12-07",19.0],["2024-05-14",23.0],["2024-12-09",22.0],["2025-05-22",21.0],["2025-09-03",27.0],["2026-05-12",20.0]] },
    { name:"ALT (SGPT)", unit:"U/L", lo:0, hi:44, pts:[["2018-03-14",30.0],["2018-09-11",18.0],["2019-03-28",18.0],["2019-10-24",18.0],["2020-08-11",18.0],["2020-09-01",21.0],["2021-03-03",17.0],["2022-06-03",17.0],["2023-12-07",19.0],["2024-05-14",19.0],["2024-12-09",18.0],["2025-05-22",20.0],["2025-09-03",18.0],["2026-05-12",20.0]] },
    { name:"Alkaline Phosphatase", unit:"U/L", lo:39, hi:117, pts:[["2018-03-14",59.0],["2018-09-11",55.0],["2019-03-28",56.0],["2019-10-24",61.0],["2020-08-11",59.0],["2020-09-01",69.0],["2021-03-03",59.0],["2022-06-03",60.0],["2023-12-07",59.0],["2024-05-14",64.0],["2024-12-09",66.0],["2025-05-22",72.0],["2025-09-03",88.0],["2026-05-12",80.0]] },
    { name:"Bilirubin", unit:"mg/dL", lo:0, hi:1.2, pts:[["2018-03-14",1.9],["2018-09-11",1.2],["2019-03-28",1.7],["2019-10-24",0.9],["2020-08-11",1.5],["2020-09-01",1.5],["2021-03-03",1.1],["2022-06-03",1.4],["2023-09-28",1.0],["2024-05-14",1.1],["2024-12-09",1.1],["2025-09-03",1.1],["2026-05-12",0.6]] },
    { name:"Protein, Total", unit:"g/dL", lo:6.0, hi:8.5, pts:[["2018-03-14",7.0],["2018-09-11",6.8],["2019-03-28",6.3],["2019-10-24",6.2],["2020-08-11",6.1],["2020-09-01",7.0],["2021-03-03",6.5],["2021-09-10",6.2],["2022-06-03",6.1],["2023-09-28",6.0],["2024-05-14",6.3],["2024-12-09",6.4],["2025-05-22",6.4],["2025-09-03",6.2],["2026-05-12",6.4]] },
    { name:"Albumin", unit:"g/dL", lo:3.5, hi:5.5, pts:[["2018-09-11",4.0],["2019-03-28",4.0],["2019-10-24",3.9],["2020-08-11",3.9],["2020-09-01",4.8],["2021-03-03",4.3],["2021-09-10",4.0],["2022-06-03",3.9],["2023-09-28",4.0],["2023-12-07",4.3],["2024-05-14",4.0],["2024-12-09",4.1],["2024-12-16",4.1],["2025-05-22",3.9],["2025-09-03",4.2],["2026-05-12",4.2]] },
    { name:"Globulin, Total", unit:"g/dL", lo:1.5, hi:4.5, pts:[["2026-05-12",2.2]] },
  ]},
  { group:"Blood Count", markers:[
    { name:"WBC", unit:"K/µL", lo:3.4, hi:10.8, pts:[["2018-03-14",5.0],["2018-09-11",5.3],["2019-03-28",4.6],["2019-10-24",4.6],["2020-08-11",4.8],["2020-09-05",5.0],["2021-03-03",5.2],["2022-06-03",4.1],["2023-09-28",4.3],["2023-12-07",5.3],["2024-12-09",5.0],["2024-12-16",6.5],["2025-05-22",5.4],["2025-09-03",5.1],["2026-05-12",4.4]] },
    { name:"RBC", unit:"M/µL", lo:4.14, hi:5.8, pts:[["2018-03-14",5.65],["2018-09-11",5.57],["2019-03-28",5.57],["2019-10-24",5.34],["2020-08-11",5.19],["2020-09-05",5.9],["2021-03-03",5.6],["2022-06-03",5.4],["2023-09-28",4.8],["2023-12-07",5.38],["2024-12-09",5.62],["2024-12-16",5.38],["2025-05-22",5.55],["2025-09-03",5.7],["2026-05-12",5.56]] },
    { name:"Hemoglobin", unit:"g/dL", lo:12.6, hi:17.7, pts:[["2018-03-14",17.4],["2018-09-11",14.8],["2019-03-28",16.7],["2019-10-24",16.3],["2020-08-11",16.0],["2020-09-05",18.1],["2021-03-03",16.3],["2022-06-03",16.1],["2023-09-28",14.6],["2023-12-07",15.6],["2024-12-09",16.3],["2024-12-16",16.1],["2025-05-22",16.4],["2025-09-03",16.0],["2026-05-12",15.3]] },
    { name:"Hematocrit", unit:"%", lo:37.5, hi:51.0, pts:[["2018-03-14",51.0],["2018-09-11",46.4],["2019-03-28",50.2],["2019-10-24",48.8],["2020-08-11",47.7],["2020-09-05",55.5],["2021-03-03",49.2],["2022-06-03",49.0],["2023-09-28",44.4],["2023-12-07",48.1],["2024-12-09",50.6],["2024-12-16",48.8],["2025-05-22",50.8],["2025-09-03",51.0],["2026-05-12",48.6]] },
    { name:"MCV", unit:"fL", lo:79, hi:97, pts:[["2018-03-14",90.3],["2018-09-11",83.3],["2019-03-28",90.1],["2019-10-24",91.4],["2020-08-11",91.9],["2020-09-05",94.0],["2021-03-03",87.4],["2022-06-03",90.9],["2023-09-28",92.1],["2023-12-07",90.0],["2024-12-09",90.0],["2024-12-16",90.7],["2025-05-22",92.0],["2025-09-03",90.0],["2026-05-12",87.0]] },
    { name:"Platelet Count", unit:"K/µL", lo:150, hi:379, pts:[["2018-03-14",188.0],["2018-09-11",246.0],["2019-03-28",190.0],["2019-10-24",192.0],["2020-08-11",183.0],["2020-09-05",200.0],["2021-03-03",225.0],["2022-06-03",180.0],["2023-09-28",210.0],["2023-12-07",267.0],["2024-12-09",216.0],["2024-12-16",258.0],["2025-05-22",221.0],["2025-09-03",246.0],["2026-05-12",221.0]] },
  ]},
  { group:"Iron Studies", markers:[
    { name:"Iron", unit:"ug/dL", lo:38, hi:169, pts:[["2026-05-12",36.0]] },
    { name:"Ferritin", unit:"ng/mL", lo:30, hi:400, pts:[["2026-05-12",13.0]] },
    { name:"Iron Saturation", unit:"%", lo:15, hi:55, pts:[["2026-05-12",9.0]] },
    { name:"TIBC", unit:"ug/dL", lo:250, hi:450, pts:[["2026-05-12",392.0]] },
    { name:"UIBC", unit:"ug/dL", lo:111, hi:343, pts:[["2026-05-12",356.0]] },
  ]},
  { group:"Inflammatory & Cardiac", markers:[
    { name:"hs-CRP (Cardiac)", unit:"mg/L", lo:0, hi:3.0, pts:[["2026-05-12",8.8]] },
    { name:"Homocysteine", unit:"umol/L", lo:0, hi:14.5, pts:[["2026-05-12",22.3]] },
    { name:"Fibrinogen", unit:"mg/dL", lo:193, hi:507, pts:[["2026-05-12",279.0]] },
    { name:"Uric Acid", unit:"mg/dL", lo:3.8, hi:8.4, pts:[["2026-05-12",5.9]] },
    { name:"LDH", unit:"IU/L", lo:121, hi:224, pts:[["2026-05-12",169.0]] },
    { name:"GGT", unit:"IU/L", lo:0, hi:65, pts:[["2026-05-12",14.0]] },
  ]},
  { group:"Thyroid", markers:[
    { name:"TSH", unit:"uIU/mL", lo:0.45, hi:4.5, pts:[["2026-05-12",3.12]] },
    { name:"Free T4 (Direct)", unit:"ng/dL", lo:0.82, hi:1.77, pts:[["2026-05-12",1.07]] },
    { name:"Free T3", unit:"pg/mL", lo:2.0, hi:4.4, pts:[["2026-05-12",3.4]] },
    { name:"Reverse T3", unit:"ng/dL", lo:9.2, hi:24.1, pts:[["2026-05-12",16.8]] },
    { name:"Total T4 (Thyroxine)", unit:"ug/dL", lo:4.5, hi:12.0, pts:[["2026-05-12",8.4]] },
    { name:"Total T3", unit:"ng/dL", lo:71, hi:180, pts:[["2026-05-12",126.0]] },
    { name:"Free Thyroxine Index", unit:"", lo:1.2, hi:4.9, pts:[["2026-05-12",2.9]] },
    { name:"TPO Antibody", unit:"IU/mL", lo:0, hi:34, pts:[["2026-05-12",11.0]] },
  ]},
  { group:"Hormones", markers:[
    { name:"Total Testosterone", unit:"ng/dL", lo:250, hi:1100, pts:[["2018-03-14",100.5],["2018-09-11",1367.6],["2019-03-28",806.2],["2019-10-24",1205.3],["2020-08-11",111.3],["2021-03-03",1206.1],["2022-06-03",1010.9],["2023-09-28",600.7],["2024-12-09",1586.0],["2024-12-16",897.1]] },
    { name:"Free Testosterone", unit:"pg/mL", lo:35, hi:155, pts:[["2018-03-14",1.67],["2018-09-11",43.25],["2019-03-28",22.75],["2019-10-24",34.27],["2020-08-11",32.71],["2021-03-03",32.31],["2022-06-03",28.59],["2023-09-28",13.58],["2024-12-09",47.85],["2024-12-16",26.4]] },
    { name:"SHBG", unit:"nmol/L", lo:22, hi:77, pts:[["2018-03-14",38.9],["2018-09-11",24.8],["2019-03-28",24.6],["2019-10-24",30.7],["2020-08-11",27.5],["2021-03-03",29.9],["2022-06-03",28.3],["2023-09-28",33.2],["2024-12-09",29.1],["2024-12-16",22.5]] },
    { name:"Estradiol", unit:"pg/mL", lo:0, hi:39, pts:[["2018-03-14",32.26],["2018-09-11",69.97],["2019-03-28",48.58],["2019-10-24",61.12],["2020-08-11",87.67],["2021-03-03",52.67],["2022-06-03",53.36],["2023-09-28",41.16],["2024-12-09",103.44]] },
  ]},
  { group:"Vitamins", markers:[
    { name:"Vitamin D", unit:"ng/mL", lo:30, hi:100, pts:[["2019-03-28",58.7],["2019-10-24",28.7],["2020-08-11",40.4],["2021-03-03",27.2],["2021-09-10",42.6],["2022-06-03",30.2],["2023-09-28",39.4],["2024-12-09",40.1],["2025-09-03",74.2],["2026-05-12",44.5]] },
  ]},
];

// Saliva panels (DiagnosTechs, collected 2026-05-03) — structurally different from blood trends
const CORTISOL_RHYTHM = {
  date: "2026-05-03",
  total: { val: 45, lo: 22, hi: 46, unit: "nM" },
  points: [
    { time: "Morning (6–8 AM)",   val: 19, lo: 13, hi: 24, flag: "Normal" },
    { time: "Noon (11–1 PM)",     val: 12, lo: 5,  hi: 10, flag: "High" },
    { time: "Afternoon (4–5 PM)", val: 11, lo: 3,  hi: 8,  flag: "High" },
    { time: "Midnight (10–12)",   val: 3,  lo: 1,  hi: 4,  flag: "Normal" },
  ],
  dhea: { val: 3, lo: 3, hi: 10, unit: "ng/mL", flag: "Borderline" },
  zone: "Zone 2 — Cortisol elevation (normal DHEA). Often reflects the transition between acute and prolonged stress.",
};

const SALIVA_HORMONES = [
  { name:"Testosterone (saliva)", unit:"pg/mL", lo:36, hi:145, val:">200", flag:"High", num:200 },
  { name:"DHT (saliva)", unit:"pg/mL", lo:75, hi:192, val:">300", flag:"High", num:300 },
  { name:"Estradiol (saliva)", unit:"pg/mL", lo:2, hi:6, val:16, flag:"High", num:16 },
  { name:"Estrone (saliva)", unit:"pg/mL", lo:14, hi:103, val:86, flag:"Normal", num:86 },
  { name:"Estriol (saliva)", unit:"pg/mL", lo:5, hi:25, val:52, flag:"High", num:52 },
  { name:"Progesterone (saliva)", unit:"pg/mL", lo:15, hi:95, val:163, flag:"High", num:163 },
  { name:"Androstenedione (saliva)", unit:"pg/mL", lo:151, hi:350, val:279, flag:"Normal", num:279 },
  { name:"17-OH Progesterone (saliva)", unit:"pg/mL", lo:22, hi:100, val:15, flag:"Low", num:15 },
  { name:"FSH", unit:"uIU/mL", lo:12, hi:125, val:269, flag:"High", num:269 },
  { name:"LH", unit:"uIU/mL", lo:8, hi:55, val:16, flag:"Normal", num:16 },
];


const WEEK_DAYS = ALL_DAYS.slice(-7);
const LATEST    = ALL_DAYS[ALL_DAYS.length - 1];
const PREV      = ALL_DAYS[ALL_DAYS.length - 2];
const LATEST_BP = ALL_BP[ALL_BP.length - 1];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const avg = (arr, key) => {
  const vals = arr.filter(d => d[key] != null).map(d => d[key]);
  return vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : null;
};
const sum = (arr, key) => arr.filter(d => d[key] != null).reduce((a,d) => a + d[key], 0);

// Convert bedtimeHr (hours past 6 PM) → "10:30 PM" style display
const fmtBedtime = (hr) => {
  if (hr == null) return "—";
  const totalMin = Math.round(hr * 60);
  const realHr = (18 + Math.floor(totalMin / 60)) % 24;
  const realMin = totalMin % 60;
  const h12 = ((realHr + 11) % 12) + 1;
  const ampm = realHr < 12 ? "AM" : "PM";
  return `${h12}:${String(realMin).padStart(2,"0")} ${ampm}`;
};
// 10:30 PM = 4.5 hrs past 6 PM
const TARGET_BEDTIME_HR = 4.5;

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0f1923", border:"1px solid #1e3a4a", borderRadius:6, padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color }}>
          {p.name}: {typeof p.value==="number" ? p.value.toFixed(p.value>100?0:1) : p.value}{unit||""}
        </div>
      ))}
    </div>
  );
};

const BedtimeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background:"#0f1923", border:"1px solid #1e3a4a", borderRadius:6, padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:4 }}>{d.label}</div>
      <div style={{ color:"#a78bfa" }}>Bedtime: {fmtBedtime(d.bedtimeHr)}</div>
      <div style={{ color:"#7bafc8" }}>Sleep: {d.sleep?.toFixed(1)}h</div>
    </div>
  );
};

const Card = ({ title, children, badge }) => (
  <div className="hd-card" style={{ background:"linear-gradient(135deg,#0d1e2b 0%,#0a1520 100%)", border:"1px solid #1a3045", borderRadius:12, padding:"18px 20px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
      <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", letterSpacing:"0.12em", color:"#7fb8d4", textTransform:"uppercase" }}>{title}</div>
      {badge && <div style={{ fontSize:10, color:"#7bafc8" }}>{badge}</div>}
    </div>
    {children}
  </div>
);

const Stat = ({ label, value, unit, color="#5ec4ff", sub }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
    <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
      <span style={{ fontSize:28, fontFamily:"'Space Mono',monospace", fontWeight:700, color, lineHeight:1 }}>{value}</span>
      <span style={{ fontSize:13, color:"#8bbdd4" }}>{unit}</span>
    </div>
    <div style={{ fontSize:11, color:"#7fb8d4" }}>{label}</div>
    {sub && <div style={{ fontSize:10, color:"#6aaac2", marginTop:2 }}>{sub}</div>}
  </div>
);

const BpBadge = ({ sys, dia }) => {
  const s2 = sys >= 140 || dia >= 90;
  const elev = sys >= 130 || dia >= 80;
  const color = s2 ? "#ff4d6d" : elev ? "#ffb347" : "#4ecb71";
  return <span style={{ fontSize:10, background:color+"22", color, border:`1px solid ${color}55`, borderRadius:4, padding:"1px 6px" }}>{s2?"Stage 2":elev?"Elevated":"Normal"}</span>;
};

const DeviceBadge = ({ device }) => (
  <span style={{
    fontSize:9, fontWeight:700, fontFamily:"'Space Mono',monospace",
    background: device==="arm" ? "#1e6a9a33" : "#5a5a6a33",
    color: device==="arm" ? "#5ec4ff" : "#a0a0b0",
    border: `1px solid ${device==="arm" ? "#1e6a9a55" : "#5a5a6a55"}`,
    borderRadius:3, padding:"1px 5px", letterSpacing:"0.05em"
  }} title={device==="arm" ? "Arm cuff (more accurate)" : "Wrist cuff"}>
    {device==="arm" ? "ARM" : "WRIST"}
  </span>
);

// One bloodwork marker: trend line + reference band + latest-value status
// Lab data source by date — distinguishes holistic clinic, conventional PCP, and historical spreadsheet
const SOURCE_COLORS = { holistic: "#c084fc", pcp: "#38bdf8", historic: "#5a8aaa" };
const SOURCE_LABELS = { holistic: "Holistic clinic", pcp: "PCP", historic: "Prior labs" };
const labSource = (date) => {
  if (date === "2026-05-03" || date === "2026-05-12") return "holistic";
  if (date === "2026-05-20") return "pcp";
  return "historic";
};

const LabMarker = ({ m }) => {
  const data = m.pts.map(([date,v]) => ({ date, label: date.slice(5).replace("-","/")+"/"+date.slice(2,4), v, src: labSource(date) }));
  const latest = m.pts[m.pts.length-1];
  const lv = latest[1];
  const out = (m.lo!=null && lv<m.lo) || (m.hi!=null && lv>m.hi);
  const color = out ? "#ff6b8a" : "#4ecb71";
  const vals = m.pts.map(p=>p[1]);
  const dMin = Math.min(...vals, m.lo!=null?m.lo:Infinity);
  const dMax = Math.max(...vals, m.hi!=null?m.hi:-Infinity);
  const pad = (dMax-dMin)*0.15 || 1;
  const prev = m.pts.length>1 ? m.pts[m.pts.length-2][1] : null;
  const delta = prev!=null ? lv-prev : null;
  return (
    <div style={{ background:"#0a1722", border:"1px solid #16304a", borderRadius:10, padding:"12px 14px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:2 }}>
        <span style={{ fontSize:12.5, color:"#cfe6f2", fontWeight:500 }}>{m.name}</span>
        <span style={{ fontSize:9, color:"#5a8aaa", fontFamily:"'Space Mono',monospace" }}>{m.unit}</span>
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:6 }}>
        <span style={{ fontSize:21, fontFamily:"'Space Mono',monospace", fontWeight:700, color }}>{lv}</span>
        {delta!=null && Math.abs(delta)>1e-9 && (
          <span style={{ fontSize:10, color:"#6aaac2" }}>
            {delta>0?"▲":"▼"} {Math.abs(delta).toFixed(Math.abs(delta)<1?2:1)} since prior
          </span>
        )}
        <span style={{ fontSize:9, marginLeft:"auto", color, background:color+"1e", border:`1px solid ${color}44`, borderRadius:3, padding:"1px 6px" }}>
          {out ? "Out of range" : "In range"}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={70}>
        <LineChart data={data} margin={{ top:4, right:4, bottom:0, left:4 }}>
          <YAxis hide domain={[dMin-pad, dMax+pad]}/>
          <XAxis dataKey="label" hide/>
          {m.lo!=null && m.hi!=null && (
            <ReferenceArea y1={m.lo} y2={m.hi} fill="#1e6a9a" fillOpacity={0.12} stroke="none"/>
          )}
          {m.lo!=null && <ReferenceLine y={m.lo} stroke="#2a5a7a" strokeDasharray="3 3"/>}
          {m.hi!=null && <ReferenceLine y={m.hi} stroke="#2a5a7a" strokeDasharray="3 3"/>}
          <Tooltip
            contentStyle={{ background:"#0c1a28", border:"1px solid #1e4060", borderRadius:8, fontSize:11 }}
            labelStyle={{ color:"#7bafc8" }}
            formatter={(v,n,p)=>[v+" "+m.unit+"  ·  "+SOURCE_LABELS[p.payload.src], m.name]}
          />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2}
            dot={(props)=>{ const { cx, cy, payload } = props; return <circle key={payload.date} cx={cx} cy={cy} r={3} fill={SOURCE_COLORS[payload.src]} stroke="#0a1722" strokeWidth={1}/>; }}
            activeDot={{ r:4 }}/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize:9.5, color:"#5a8aaa", marginTop:4, textAlign:"right" }}>
        latest {latest[0]} · {m.pts.length} draws
      </div>
    </div>
  );
};

// Single saliva hormone row — value vs. range, color-coded by flag
const SalivaMarker = ({ m }) => {
  const flagColor = m.flag === "High" ? "#ff6b8a" : m.flag === "Low" || m.flag === "Borderline" ? "#fbbf24" : "#4ecb71";
  return (
    <div style={{ background:"#0a1722", border:`1px solid ${flagColor}33`, borderRadius:10, padding:"12px 14px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
        <span style={{ fontSize:12.5, color:"#cfe6f2", fontWeight:500 }}>{m.name}</span>
        <span style={{ fontSize:9, color:"#5a8aaa", fontFamily:"'Space Mono',monospace" }}>{m.unit}</span>
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
        <span style={{ fontSize:20, fontFamily:"'Space Mono',monospace", fontWeight:700, color:flagColor }}>{m.val}</span>
        <span style={{ fontSize:10, color:"#6aaac2" }}>ref {m.lo}–{m.hi}</span>
        <span style={{ fontSize:9, marginLeft:"auto", color:flagColor, background:flagColor+"1e", border:`1px solid ${flagColor}44`, borderRadius:3, padding:"1px 6px" }}>{m.flag}</span>
      </div>
    </div>
  );
};

// Diurnal cortisol rhythm — 4 timepoints across one day vs. reference band
const CortisolRhythm = ({ data }) => {
  const chartData = data.points.map(p => ({ label: p.time.split(" ")[0], val: p.val, lo: p.lo, hi: p.hi, flag: p.flag }));
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:16, marginBottom:12 }}>
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={chartData} margin={{ top:8, right:8, bottom:0, left:-18 }}>
              <CartesianGrid stroke="#13283c" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill:"#7bafc8", fontSize:10 }} axisLine={{ stroke:"#1e4060" }} tickLine={false}/>
              <YAxis tick={{ fill:"#7bafc8", fontSize:10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"#0c1a28", border:"1px solid #1e4060", borderRadius:8, fontSize:11 }}/>
              <Area dataKey="hi" stroke="none" fill="#1e6a9a" fillOpacity={0.10}/>
              <Area dataKey="lo" stroke="none" fill="#070e14" fillOpacity={1}/>
              <Line type="monotone" dataKey="val" stroke="#5ec4ff" strokeWidth={2.5} dot={{ r:4, fill:"#5ec4ff" }}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6, justifyContent:"center" }}>
          {data.points.map(p => {
            const c = p.flag === "High" ? "#ff6b8a" : p.flag === "Low" ? "#fbbf24" : "#4ecb71";
            return (
              <div key={p.time} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, borderBottom:"1px solid #13283c", paddingBottom:4 }}>
                <span style={{ color:"#9fc8dc" }}>{p.time}</span>
                <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontFamily:"'Space Mono',monospace", color:"#cfe6f2" }}>{p.val} nM</span>
                  <span style={{ fontSize:8.5, color:c, background:c+"1e", border:`1px solid ${c}44`, borderRadius:3, padding:"1px 5px" }}>{p.flag}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
        <div style={{ fontSize:11, color:"#7bafc8" }}>Total output <span style={{ color:"#cfe6f2", fontFamily:"'Space Mono',monospace" }}>{data.total.val} {data.total.unit}</span> <span style={{ color:"#5a8aaa" }}>(ref {data.total.lo}–{data.total.hi})</span></div>
        <div style={{ fontSize:11, color:"#7bafc8" }}>DHEA <span style={{ color:"#fbbf24", fontFamily:"'Space Mono',monospace" }}>{data.dhea.val} {data.dhea.unit}</span> <span style={{ color:"#5a8aaa" }}>(ref {data.dhea.lo}–{data.dhea.hi}, {data.dhea.flag})</span></div>
      </div>
      <div style={{ fontSize:11, color:"#9fc8dc", lineHeight:1.55, background:"#0a1722", border:"1px solid #16304a", borderRadius:8, padding:"10px 12px" }}>
        {data.zone}
      </div>
    </div>
  );
};

// Goal progress ring (compact, SVG-based)
const Ring = ({ pct, color, size=70, stroke=6 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, pct));
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#1a3045" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
              strokeDasharray={`${c*p/100} ${c}`} strokeLinecap="round" />
    </svg>
  );
};

const GoalCard = ({ label, value, goal, unit, color, fmt }) => {
  const pct = value != null ? (value / goal) * 100 : 0;
  const display = fmt ? fmt(value) : (value != null ? value : "—");
  return (
    <div style={{ background:"linear-gradient(135deg,#0d1e2b 0%,#0a1520 100%)", border:"1px solid #1a3045", borderRadius:12, padding:"16px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ position:"relative", width:70, height:70, flexShrink:0 }}>
        <Ring pct={pct} color={color} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'Space Mono',monospace", fontWeight:700, color }}>
          {Math.round(pct)}%
        </div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10, color:"#7fb8d4", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Space Mono',monospace" }}>{label}</div>
        <div style={{ fontSize:20, fontWeight:700, color:"#e0f0ff", fontFamily:"'Space Mono',monospace", lineHeight:1.2, marginTop:4 }}>
          {display}<span style={{ fontSize:12, color:"#7bafc8", marginLeft:4 }}>{unit}</span>
        </div>
        <div style={{ fontSize:10, color:"#6aaac2", marginTop:2 }}>Goal: {fmt ? fmt(goal) : goal}{unit ? ` ${unit}` : ""}</div>
      </div>
    </div>
  );
};

const TICK    = { fill:"#7bafc8", fontSize:11 };
const TICK_SM = { fill:"#7bafc8", fontSize:10 };
const AX      = { axisLine:false, tickLine:false };

// ─── SECTION DEFINITIONS ─────────────────────────────────────────────────────
// Single source of truth for tab labels used both by the nav and the print menu.
const SECTIONS = [
  { id:"today",    label:"Today" },
  { id:"overview", label:"Overview" },
  { id:"sleep",    label:"Sleep" },
  { id:"heart",    label:"Heart" },
  { id:"activity", label:"Activity" },
  { id:"labs",     label:"Labs" },
  { id:"meds",     label:"Meds" },
  { id:"symptoms", label:"Symptoms" },
];

// ─── PRINT STYLES ────────────────────────────────────────────────────────────
// Injected once. Two ideas:
//  1. When printing a single section, everything else is already unmounted by React,
//     browser's print dialog is blocked inside the artifact sandbox (no allow-modals),
//     so instead we snapshot the rendered DOM to a canvas and build a downloadable PDF.
//  2. The "hd-print-only" / "hd-print-section" hooks let us show section headers and
//     drive page grouping while capturing.
const PRINT_CSS = `
.hd-print-only { display: none; }
.hd-capturing .hd-print-only { display: block; }
`;

// ─── PDF EXPORT ──────────────────────────────────────────────────────────────
// window.print() is silently ignored inside the artifact iframe (the sandbox omits
// allow-modals), which is why the old buttons appeared to do nothing. Instead we
// load jsPDF + html2canvas on demand, rasterize each section, and download a real PDF.

// Load a script from cdnjs once; resolve when window[globalName] is available.
const loadScript = (src, globalName) => new Promise((resolve, reject) => {
  if (window[globalName]) return resolve(window[globalName]);
  const existing = document.querySelector(`script[data-lib="${globalName}"]`);
  if (existing) {
    existing.addEventListener("load", () => resolve(window[globalName]));
    existing.addEventListener("error", reject);
    return;
  }
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.dataset.lib = globalName;
  s.onload = () => resolve(window[globalName]);
  s.onerror = () => reject(new Error(`Failed to load ${globalName}`));
  document.head.appendChild(s);
});

const ensurePdfLibs = async () => {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "html2canvas");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf");
  return { html2canvas: window.html2canvas, jsPDF: window.jspdf.jsPDF };
};

const PAGE_BG = "#070e14";

// Capture a DOM node to a canvas at 2x for crispness, then place it into a jsPDF
// document, slicing across as many A4 pages as the height requires.
const addNodeToPdf = async (pdf, node, html2canvas, { firstPage }) => {
  const canvas = await html2canvas(node, {
    backgroundColor: PAGE_BG,
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: node.scrollWidth,
    onclone: (doc) => {
      // Expand any internally-scrolling panels (e.g. the BP readings list) so the
      // capture includes all rows instead of clipping at the scroll box height.
      doc.querySelectorAll("*").forEach((el) => {
        const s = el.style;
        if (s && (s.overflowY === "auto" || s.overflowY === "scroll" || s.overflow === "auto")) {
          s.overflow = "visible";
          s.maxHeight = "none";
        }
      });
    },
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8; // mm
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  // How many source pixels map to one usable page height, given we scale to usableW.
  const pxPerMm = canvas.width / usableW;
  const pageHpx = usableH * pxPerMm;

  let renderedPx = 0;
  let pageIndex = 0;
  while (renderedPx < canvas.height) {
    const sliceH = Math.min(pageHpx, canvas.height - renderedPx);
    // Copy this slice onto a temp canvas
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceH;
    const ctx = slice.getContext("2d");
    ctx.fillStyle = PAGE_BG;
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    if (!(firstPage && pageIndex === 0)) pdf.addPage();
    // paint page background so margins aren't white
    pdf.setFillColor(7, 14, 20);
    pdf.rect(0, 0, pageW, pageH, "F");
    const imgH = sliceH / pxPerMm;
    pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", margin, margin, usableW, imgH);

    renderedPx += sliceH;
    pageIndex += 1;
  }
};

// ─── PRINT BAR ───────────────────────────────────────────────────────────────
const PrintBar = ({ currentLabel, onPrintCurrent, onPrintAll, busy }) => (
  <div className="hd-noprint" style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
    <button
      onClick={onPrintCurrent}
      disabled={busy}
      style={{
        display:"flex", alignItems:"center", gap:7, padding:"7px 15px", borderRadius:7,
        cursor: busy ? "default" : "pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif",
        background:"#0d2a3d", color:"#5ec4ff", border:"none", outline:"1px solid #1e6a9a",
        opacity: busy ? 0.5 : 1,
      }}
      title={`Download the ${currentLabel} section as a PDF`}
    >
      <PrinterIcon/> {busy === "section" ? "Building…" : "Download this section"}
    </button>
    <button
      onClick={onPrintAll}
      disabled={busy}
      style={{
        display:"flex", alignItems:"center", gap:7, padding:"7px 15px", borderRadius:7,
        cursor: busy ? "default" : "pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif",
        background:"#123a2a", color:"#4ecb71", border:"none", outline:"1px solid #1e6a4a",
        opacity: busy ? 0.5 : 1,
      }}
      title="Download the entire report — every section — as one consolidated PDF"
    >
      <StackIcon/> {busy === "all" ? "Building…" : "Download full report"}
    </button>
    <span style={{ fontSize:10.5, color: busy ? "#7bafc8" : "#5a8aaa", fontFamily:"'Space Mono',monospace" }}>
      {busy === "all" ? "Rendering all sections…" : busy === "section" ? "Rendering…" : "→ saves a PDF to your device"}
    </span>
  </div>
);

const PrinterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const StackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

// Header shown at the top of each section in the captured PDF. Hidden on screen;
// revealed only while the .hd-capturing class is applied to the wrapper.
const sectionDateLine = (label, isMonth) => {
  switch (label) {
    case "Today":    return "TODAY · MAY 29, 2026";
    case "Labs":     return "BLOODWORK · 2018–2026";
    case "Meds":     return "SUPPLEMENTS & MEDICATIONS";
    case "Symptoms": return "SYMPTOMS & HISTORY";
    default:         return isMonth ? "APR 29 – MAY 29, 2026" : "MAY 23–29, 2026";
  }
};
const PrintSectionHeader = ({ label, isMonth }) => (
  <div className="hd-print-only" style={{ marginBottom:8, paddingBottom:10, borderBottom:"1px solid #1a3045" }}>
    <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:"#5a8aaa", letterSpacing:"0.15em" }}>
      HEALTH REPORT · {sectionDateLine(label, isMonth)}
    </div>
    <div style={{ fontSize:20, fontWeight:600, color:"#e0f0ff", marginTop:3 }}>{label}</div>
  </div>
);

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function HealthDashboard() {
  const [tab,   setTab]   = useState("today");
  const [range, setRange] = useState("week");
  const [printAll, setPrintAll] = useState(false); // when true, render every section for a consolidated PDF
  const [busy, setBusy] = useState(false);         // false | "section" | "all"
  const [pdfError, setPdfError] = useState(null);
  const captureRef = useRef(null);                 // wraps the rendered sections for DOM capture

  const data       = range === "week" ? WEEK_DAYS : ALL_DAYS;
  const sleepData  = data.filter(d => d.sleep  != null);
  const hrData     = data.filter(d => d.rhr    != null);
  const exData     = data.filter(d => d.exMins != null);
  const energyData = data.filter(d => d.active != null && d.date !== "2026-04-28");
  const bedData    = data.filter(d => d.bedtimeHr != null);
  const stepsData  = data.filter(d => d.steps != null);
  const isMonth    = range === "month";
  const barSz      = isMonth ? 9 : 20;

  const avgSleepVal = avg(sleepData, "sleep");
  const avgRHR      = Math.round(avg(hrData, "rhr") ?? 0);
  const avgHRV      = Math.round(avg(data.filter(d=>d.hrv), "hrv") ?? 0);
  const totalEx     = sum(exData.filter(d => d.date !== "2026-05-16"), "exMins");
  const avgBedtime  = avg(bedData, "bedtimeHr");

  const tabs = SECTIONS.map(s => s.id);
  const currentLabel = SECTIONS.find(s => s.id === tab)?.label ?? "Today";

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // Download the section currently on screen as a PDF. Only the active tab is
  // mounted, so we capture the wrapper node directly.
  const printCurrent = async () => {
    if (busy) return;
    setPdfError(null);
    setBusy("section");
    try {
      const { html2canvas, jsPDF } = await ensurePdfLibs();
      // add the capturing class so any print-only headers show, then let charts settle
      captureRef.current?.classList.add("hd-capturing");
      await wait(900); // let Recharts finish its mount animation before capture
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const node = captureRef.current.querySelector("[data-section]");
      await addNodeToPdf(pdf, node || captureRef.current, html2canvas, { firstPage: true });
      pdf.save(`health-${tab}-2026-05-29.pdf`);
    } catch (e) {
      setPdfError(e.message || "Could not build the PDF.");
    } finally {
      captureRef.current?.classList.remove("hd-capturing");
      setBusy(false);
    }
  };

  // Download every section as one consolidated PDF. Flip printAll on so all
  // sections mount, wait for charts to lay out, capture each section onto its
  // own page group, then restore the single-tab view.
  const printEverything = async () => {
    if (busy) return;
    setPdfError(null);
    setBusy("all");
    setPrintAll(true);
    try {
      const { html2canvas, jsPDF } = await ensurePdfLibs();
      // give React time to mount all sections + Recharts time to finish animating
      await wait(1800);
      captureRef.current?.classList.add("hd-capturing");
      await wait(200);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      // Cover page
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.setFillColor(7, 14, 20);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.setTextColor(224, 240, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text("Consolidated Health Report", pageW / 2, 120, { align: "center" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(123, 175, 200);
      pdf.text("All sections \u00B7 Generated May 29, 2026", pageW / 2, 132, { align: "center" });

      // Each section node onto its own fresh page(s)
      const nodes = captureRef.current.querySelectorAll("[data-section]");
      for (const node of nodes) {
        await addNodeToPdf(pdf, node, html2canvas, { firstPage: false });
      }
      pdf.save("health-report-full-2026-05-29.pdf");
    } catch (e) {
      setPdfError(e.message || "Could not build the PDF.");
    } finally {
      captureRef.current?.classList.remove("hd-capturing");
      setPrintAll(false);
      setBusy(false);
    }
  };

  // Which sections to render. Normally just the active tab; in full-report mode, all of them.
  const sectionsToRender = printAll ? tabs : [tab];

  return (
    <div style={{ minHeight:"100vh", background:"#070e14", color:"#c8dde8", fontFamily:"'DM Sans',sans-serif", paddingBottom:40 }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <style>{PRINT_CSS}</style>

      {/* ── HEADER ── */}
      <div className="hd-noprint" style={{ padding:"28px 28px 0", borderBottom:"1px solid #0f2030", marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", paddingBottom:20 }}>
          <div>
            <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:"#5a8aaa", letterSpacing:"0.15em", marginBottom:6 }}>
              HEALTH REPORT · {tab === "today" ? "TODAY · MAY 29, 2026" : tab === "labs" ? "BLOODWORK · 2018–2026" : tab === "meds" ? "SUPPLEMENTS & MEDICATIONS" : tab === "symptoms" ? "SYMPTOMS & HISTORY" : isMonth ? "APR 29 – MAY 29, 2026" : "MAY 23–29, 2026"}
            </div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:600, color:"#e0f0ff", letterSpacing:"-0.02em" }}>
              {tab === "today" ? "Today" : tab === "labs" ? "Lab Work" : tab === "meds" ? "Meds & Supplements" : tab === "symptoms" ? "Symptoms & History" : isMonth ? "Monthly Overview" : "Weekly Overview"}
            </h1>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
            {tab !== "today" && tab !== "labs" && tab !== "meds" && tab !== "symptoms" && (
              <div style={{ display:"flex", background:"#0a1520", borderRadius:8, border:"1px solid #1a3045", overflow:"hidden" }}>
                {["week","month"].map(r => (
                  <button key={r} onClick={() => setRange(r)} style={{
                    padding:"5px 18px", border:"none", cursor:"pointer", fontSize:11,
                    fontFamily:"'Space Mono',monospace", letterSpacing:"0.08em",
                    background: range===r ? "#1a3a55" : "transparent",
                    color: range===r ? "#5ec4ff" : "#5a8aaa",
                  }}>{r==="week"?"WEEK":"MONTH"}</button>
                ))}
              </div>
            )}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding:"6px 14px", borderRadius:6, cursor:"pointer", fontSize:12, border:"none",
                  background: tab===t ? "#0d2a3d" : "transparent",
                  color: tab===t ? "#5ec4ff" : "#7bafc8",
                  outline: tab===t ? "1px solid #1e6a9a" : "1px solid #0f2030",
                  fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize",
                }}>{t}</button>
              ))}
            </div>
            <PrintBar currentLabel={currentLabel} onPrintCurrent={printCurrent} onPrintAll={printEverything} busy={busy}/>
          </div>
        </div>
      </div>

      {/* While building the full report, show a lightweight status so the user
          knows all sections are rendering off-screen for capture. */}
      {busy === "all" && (
        <div className="hd-noprint" style={{ padding:"0 28px", marginBottom:12 }}>
          <div style={{ fontSize:12, color:"#4ecb71", fontFamily:"'Space Mono',monospace" }}>
            Rendering all {tabs.length} sections into a PDF — this takes a few seconds…
          </div>
        </div>
      )}
      {pdfError && (
        <div className="hd-noprint" style={{ padding:"0 28px", marginBottom:12 }}>
          <div style={{ fontSize:12, color:"#ff8aa3", background:"#2a1420", border:"1px solid #5a2030", borderRadius:8, padding:"10px 14px" }}>
            Couldn't build the PDF: {pdfError}. If this keeps happening, your network may be blocking the PDF libraries from cdnjs — try again, or let me know and I'll switch to an image export instead.
          </div>
        </div>
      )}

      <div ref={captureRef} style={{ padding:"0 28px", display:"flex", flexDirection:"column", gap:14 }}>

        {sectionsToRender.map((sec) => {
          const secLabel = SECTIONS.find(s => s.id === sec)?.label ?? sec;
          return (
          <div key={sec} data-section={sec} className={printAll ? "hd-print-section" : undefined} style={{ display:"flex", flexDirection:"column", gap:14, background:"#070e14" }}>
            <PrintSectionHeader label={secLabel} range={range} isMonth={isMonth}/>

        {/* ── TODAY ── */}
        {sec === "today" && (<>
          {/* Goal rings */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
            <GoalCard label="Last night's sleep" value={LATEST.sleep} goal={GOALS.sleep} unit="h" color="#a78bfa" fmt={v => v?.toFixed(1)} />
            <GoalCard label="Bedtime" value={LATEST.bedtimeHr ? Math.max(0, 9 - LATEST.bedtimeHr) : 0} goal={9 - TARGET_BEDTIME_HR} unit="" color="#6366f1" fmt={() => fmtBedtime(LATEST.bedtimeHr)} />
            <GoalCard label="Steps" value={LATEST.steps} goal={GOALS.steps} unit="" color="#38bdf8" fmt={v => v ? v.toLocaleString() : "—"} />
            <GoalCard label="Exercise" value={LATEST.exMins} goal={GOALS.exercise} unit="min" color="#fbbf24" />
            <GoalCard label="Distance" value={LATEST.dist} goal={GOALS.distance} unit="mi" color="#34d399" fmt={v => v?.toFixed(1)} />
          </div>

          {/* Latest vitals */}
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:14 }}>
            <Card title="Latest Vitals">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                <Stat label="Resting HR"   value={LATEST.rhr}  unit="bpm" color="#f87171" sub={`Prev: ${PREV.rhr ?? "—"}`} />
                <Stat label="HRV"          value={LATEST.hrv?.toFixed(0)} unit="ms"  color="#34d399" sub={`Prev: ${PREV.hrv?.toFixed(0) ?? "—"}`} />
                <Stat label="Walking HR"   value={LATEST.walkHR?.toFixed(0) ?? "—"}  unit="bpm" color="#fbbf24" sub="—" />
              </div>
              <div style={{ marginTop:18, paddingTop:14, borderTop:"1px solid #1a3045" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:11, color:"#7fb8d4", fontFamily:"'Space Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>Latest BP</span>
                  <DeviceBadge device={LATEST_BP.device}/>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ fontSize:32, fontWeight:700, color:"#e0f0ff", fontFamily:"'Space Mono',monospace", lineHeight:1 }}>
                    {LATEST_BP.sys}<span style={{ color:"#7bafc8", margin:"0 4px" }}>/</span>{LATEST_BP.dia}
                  </div>
                  <span style={{ fontSize:11, color:"#7bafc8" }}>mmHg</span>
                  <BpBadge sys={LATEST_BP.sys} dia={LATEST_BP.dia}/>
                  <span style={{ fontSize:11, color:"#6aaac2", marginLeft:"auto" }}>{LATEST_BP.label}</span>
                </div>
              </div>
            </Card>

            <Card title="Sleep Last Night">
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontSize:36, fontWeight:700, color:"#a78bfa", fontFamily:"'Space Mono',monospace", lineHeight:1 }}>{LATEST.sleep?.toFixed(2)}</span>
                <span style={{ fontSize:14, color:"#7bafc8" }}>hrs</span>
                <span style={{ marginLeft:"auto", fontSize:11, color: LATEST.sleep >= GOALS.sleep ? "#4ecb71" : "#ffb347" }}>
                  {LATEST.sleep >= GOALS.sleep ? "Met goal" : `${(GOALS.sleep - LATEST.sleep).toFixed(1)}h short`}
                </span>
              </div>
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:6 }}>
                {[["Deep", LATEST.deep, "#6366f1"], ["REM", LATEST.rem, "#a78bfa"], ["Core", LATEST.core, "#7dd3fc"]].map(([nm,v,c]) => (
                  <div key={nm} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, color:"#7fb8d4", minWidth:36 }}>{nm}</span>
                    <div style={{ flex:1, height:6, background:"#0a1520", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ width:`${(v / 5) * 100}%`, height:"100%", background:c, borderRadius:3 }}/>
                    </div>
                    <span style={{ fontSize:11, color:c, fontFamily:"'Space Mono',monospace", minWidth:36, textAlign:"right" }}>{v?.toFixed(2)}h</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Steps — 7-day */}
          <Card title="Steps — last 7 days">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={WEEK_DAYS} margin={{ top:6, right:8, bottom:0, left:-18 }}>
                <CartesianGrid stroke="#13283c" vertical={false}/>
                <XAxis dataKey="label" tick={{ fill:"#7bafc8", fontSize:11 }} axisLine={{ stroke:"#1e4060" }} tickLine={false}/>
                <YAxis tick={{ fill:"#7bafc8", fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"#0c1a28", border:"1px solid #1e4060", borderRadius:8, fontSize:12 }}/>
                <ReferenceLine y={GOALS.steps} stroke="#1e4060" strokeDasharray="4 3"/>
                <Bar dataKey="steps" radius={[4,4,0,0]}>
                  {WEEK_DAYS.map((d,i) => <Cell key={i} fill={(d.steps ?? 0) >= GOALS.steps ? "#38bdf8" : "#2a6a8a"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick context */}
          <Card title="At a Glance">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              <div style={{ padding:"10px 12px", background:"#080f17", borderRadius:8 }}>
                <div style={{ fontSize:10, color:"#7fb8d4", letterSpacing:"0.1em", textTransform:"uppercase" }}>7-day avg sleep</div>
                <div style={{ fontSize:18, color:"#a78bfa", fontFamily:"'Space Mono',monospace", fontWeight:700, marginTop:4 }}>{avg(WEEK_DAYS.filter(d=>d.sleep),"sleep").toFixed(1)}h</div>
              </div>
              <div style={{ padding:"10px 12px", background:"#080f17", borderRadius:8 }}>
                <div style={{ fontSize:10, color:"#7fb8d4", letterSpacing:"0.1em", textTransform:"uppercase" }}>7-day avg bedtime</div>
                <div style={{ fontSize:18, color:"#6366f1", fontFamily:"'Space Mono',monospace", fontWeight:700, marginTop:4 }}>{fmtBedtime(avg(WEEK_DAYS.filter(d=>d.bedtimeHr),"bedtimeHr"))}</div>
              </div>
              <div style={{ padding:"10px 12px", background:"#080f17", borderRadius:8 }}>
                <div style={{ fontSize:10, color:"#7fb8d4", letterSpacing:"0.1em", textTransform:"uppercase" }}>7-day total exercise</div>
                <div style={{ fontSize:18, color:"#fbbf24", fontFamily:"'Space Mono',monospace", fontWeight:700, marginTop:4 }}>{sum(WEEK_DAYS.filter(d=>d.exMins),"exMins")} min</div>
              </div>
            </div>
          </Card>
        </>)}

        {/* ── OVERVIEW ── */}
        {sec === "overview" && (<>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {[
              { label:"Avg Sleep",  value: avgSleepVal?.toFixed(1) ?? "—", unit:"hrs", color:"#a78bfa", sub:`${sleepData.length} nights · goal 7h` },
              { label:"Avg Bedtime",value: fmtBedtime(avgBedtime), unit:"", color:"#6366f1", sub:`Goal: 10:30 PM` },
              { label:"Avg RHR",    value: avgRHR, unit:"bpm", color:"#f87171", sub:"Resting" },
              { label:"Exercise",   value: totalEx, unit:"min", color:"#fbbf24", sub: isMonth ? "Apr 29–May 15 total" : "Mon–Sat total" },
            ].map((s,i) => <Card key={i} title={s.label}><Stat {...s}/></Card>)}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:14 }}>
            <Card title="Sleep Duration">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={sleepData} barSize={barSz}>
                  <XAxis dataKey="label" tick={TICK} {...AX}/>
                  <YAxis domain={[2,8]} tick={TICK_SM} {...AX} width={25}/>
                  <Tooltip content={<CustomTooltip unit="h"/>}/>
                  <ReferenceLine y={GOALS.sleep} stroke="#1e4060" strokeDasharray="4 3"/>
                  <Bar dataKey="sleep" name="Sleep" radius={[4,4,0,0]}>
                    {sleepData.map((d,i) => <Cell key={i} fill={d.sleep>=GOALS.sleep?"#a78bfa":d.sleep>=6?"#6d6afa":"#3a3a7a"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="HRV Trend">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data.filter(d=>d.hrv)}>
                  <XAxis dataKey="label" tick={TICK} {...AX}/>
                  <YAxis domain={[10,35]} tick={TICK_SM} {...AX} width={25}/>
                  <Tooltip content={<CustomTooltip unit=" ms"/>}/>
                  <Line type="monotone" dataKey="hrv" name="HRV" stroke="#34d399" strokeWidth={2.5} dot={{ fill:"#34d399", r:isMonth?2:3 }}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="Walking / Running Distance">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data} barSize={barSz}>
                <XAxis dataKey="label" tick={TICK} {...AX}/>
                <YAxis domain={[0,7]} tick={TICK_SM} {...AX} width={28}/>
                <Tooltip content={<CustomTooltip unit=" mi"/>}/>
                <ReferenceLine y={GOALS.distance} stroke="#1e4060" strokeDasharray="4 3"/>
                <Bar dataKey="dist" name="Distance" radius={[4,4,0,0]}>
                  {data.map((d,i) => <Cell key={i} fill={d.dist>=4?"#34d399":d.dist>=2.5?"#20a070":"#174d38"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>)}

        {/* ── SLEEP ── */}
        {sec === "sleep" && (<>
          <Card title="Sleep Stages Breakdown">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sleepData} barSize={barSz}>
                <XAxis dataKey="label" tick={TICK} {...AX}/>
                <YAxis tick={TICK_SM} {...AX} width={25}/>
                <Tooltip content={<CustomTooltip unit="h"/>}/>
                <Bar dataKey="deep" name="Deep" stackId="a" fill="#6366f1"/>
                <Bar dataKey="rem"  name="REM"  stackId="a" fill="#a78bfa"/>
                <Bar dataKey="core" name="Core" stackId="a" fill="#7dd3fc" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* ── BEDTIME CHART ── */}
          <Card title="When You Fell Asleep" badge={`Goal: 10:30 PM`}>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart data={bedData} margin={{ top:10, right:10, bottom:10, left:0 }}>
                <XAxis dataKey="label" type="category" tick={TICK} {...AX} interval={0}/>
                <YAxis dataKey="bedtimeHr" type="number" domain={[3, 9]} ticks={[3,4,5,6,7,8,9]}
                       tickFormatter={(h) => {
                         const totalMin = h * 60;
                         const realHr = (18 + Math.floor(totalMin / 60)) % 24;
                         const h12 = ((realHr + 11) % 12) + 1;
                         const ampm = realHr < 12 ? "a" : "p";
                         return `${h12}${ampm}`;
                       }}
                       tick={TICK_SM} {...AX} width={36}/>
                <Tooltip content={<BedtimeTooltip/>}/>
                <ReferenceLine y={TARGET_BEDTIME_HR} stroke="#4ecb71" strokeDasharray="5 4" strokeWidth={1.5}
                               label={{ value:"10:30 PM goal", fill:"#4ecb71", fontSize:10, position:"insideTopRight" }}/>
                <ReferenceLine y={6} stroke="#1e4060" strokeDasharray="3 3"
                               label={{ value:"Midnight", fill:"#5a8aaa", fontSize:9, position:"insideTopRight" }}/>
                <Scatter name="Bedtime" dataKey="bedtimeHr" fill="#a78bfa">
                  {bedData.map((d,i) => (
                    <Cell key={i} fill={d.bedtimeHr <= TARGET_BEDTIME_HR ? "#4ecb71" : d.bedtimeHr <= 6 ? "#fbbf24" : "#f87171"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div style={{ marginTop:10, display:"flex", gap:14, fontSize:11, color:"#7bafc8", flexWrap:"wrap" }}>
              <span><span style={{ color:"#4ecb71" }}>●</span> Before 10:30 PM</span>
              <span><span style={{ color:"#fbbf24" }}>●</span> 10:30 PM – midnight</span>
              <span><span style={{ color:"#f87171" }}>●</span> After midnight</span>
              <span style={{ marginLeft:"auto", color:"#6aaac2" }}>
                On-target nights: {bedData.filter(d => d.bedtimeHr <= TARGET_BEDTIME_HR).length} of {bedData.length}
              </span>
            </div>
          </Card>

          {!isMonth && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
              {sleepData.map((d,i) => (
                <div key={i} style={{ background:"#0a1520", border:"1px solid #1a3045", borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"#7bafc8", fontFamily:"'Space Mono',monospace", marginBottom:8 }}>{d.label}</div>
                  <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Space Mono',monospace", color:d.sleep>=7?"#a78bfa":d.sleep>=6?"#7dd3fc":"#f87171" }}>{d.sleep.toFixed(1)}</div>
                  <div style={{ fontSize:9, color:"#7bafc8", marginBottom:8 }}>hrs total</div>
                  {[["Deep",d.deep,"#6366f1"],["REM",d.rem,"#a78bfa"],["Core",d.core,"#7dd3fc"]].map(([nm,v,c]) => (
                    <div key={nm} style={{ display:"flex", justifyContent:"space-between", fontSize:9 }}>
                      <span style={{ color:"#5a8aaa" }}>{nm}</span>
                      <span style={{ color:c }}>{v.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <Card title="Sleep Insights">
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {(!isMonth ? [
                { icon:"⚠️", text:"Averaging 5.8h this week — consistently short of your 7h goal. Sleep debt accumulating.", color:"#ffb347" },
                { icon:"🛌", text:`Avg bedtime ${fmtBedtime(avg(WEEK_DAYS.filter(d=>d.bedtimeHr),"bedtimeHr"))} — over an hour past your 10:30 PM target.`, color:"#a78bfa" },
                { icon:"✅", text:"Deep sleep solid most nights (0.65–1.11h). 5/16 best night at 1.11h deep.", color:"#4ecb71" },
                { icon:"💡", text:"Earlier bedtime = the highest-leverage change. Sleep is plenty restorative; you just need more of it.", color:"#5ec4ff" },
              ] : [
                { icon:"⚠️", text:`Month avg sleep ${avgSleepVal.toFixed(1)}h — only 1 of ${sleepData.length} nights hit the 7h goal.`, color:"#ffb347" },
                { icon:"🛌", text:`Avg bedtime ${fmtBedtime(avgBedtime)} — ${bedData.filter(d=>d.bedtimeHr<=TARGET_BEDTIME_HR).length} of ${bedData.length} nights on target.`, color:"#a78bfa" },
                { icon:"🔴", text:"Latest bedtimes: 5/2 (~2:30 AM) and 5/4 (~2:30 AM) — both crashed at ~3.3h sleep.", color:"#f87171" },
                { icon:"💡", text:"Bedtime is the single biggest lever. Every 30 min earlier shows up as +0.5h sleep here.", color:"#5ec4ff" },
              ]).map((item,i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"10px 14px", background:"#080f17", borderRadius:8 }}>
                  <span>{item.icon}</span>
                  <span style={{ fontSize:13, color:item.color, lineHeight:1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ── HEART ── */}
        {sec === "heart" && (<>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Card title="Resting & Walking HR">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={hrData}>
                  <XAxis dataKey="label" tick={TICK} {...AX}/>
                  <YAxis domain={[60,125]} tick={TICK_SM} {...AX} width={30}/>
                  <Tooltip content={<CustomTooltip unit=" bpm"/>}/>
                  <ReferenceLine y={80} stroke="#1e4060" strokeDasharray="4 3"/>
                  <Line type="monotone" dataKey="rhr"    name="Resting HR" stroke="#f87171" strokeWidth={2.5} dot={{ fill:"#f87171", r:isMonth?2:3 }}/>
                  <Line type="monotone" dataKey="walkHR" name="Walking HR" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 3" dot={{ fill:"#fbbf24", r:isMonth?2:3 }} connectNulls={false}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card title="HRV Daily Average">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.filter(d=>d.hrv)}>
                  <XAxis dataKey="label" tick={TICK} {...AX}/>
                  <YAxis domain={[10,40]} tick={TICK_SM} {...AX} width={30}/>
                  <Tooltip content={<CustomTooltip unit=" ms"/>}/>
                  <Line type="monotone" dataKey="hrv" name="Avg HRV" stroke="#34d399" strokeWidth={2.5} dot={{ fill:"#34d399", r:isMonth?2:4 }}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="Blood Pressure Readings" badge={`${ALL_BP.length} readings`}>
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:340, overflowY:"auto" }}>
              {ALL_BP.map((b,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"7px 12px", background:"#080f17", borderRadius:8 }}>
                  <span style={{ fontSize:11, color:"#7bafc8", fontFamily:"'Space Mono',monospace", minWidth:44 }}>{b.label}</span>
                  <span style={{ fontSize:15, fontWeight:600, color:"#e0f0ff", fontFamily:"'Space Mono',monospace", minWidth:64 }}>{b.sys}/{b.dia}</span>
                  <BpBadge sys={b.sys} dia={b.dia}/>
                  <DeviceBadge device={b.device}/>
                  <div style={{ flex:1, height:4, background:"#0d1e2b", borderRadius:2, overflow:"hidden", marginLeft:"auto", maxWidth:140 }}>
                    <div style={{ width:`${Math.min(100,((b.sys-90)/70)*100)}%`, height:"100%", background:b.sys>=140?"#ff4d6d":b.sys>=130?"#ffb347":"#4a7a9b", borderRadius:2 }}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10, fontSize:11, color:"#7bafc8", lineHeight:1.6 }}>
              <strong style={{ color:"#5ec4ff" }}>Note:</strong> Wrist-cuff readings can run 5–10 mmHg higher than arm-cuff. Going forward, arm readings (the more accurate device) will be tagged <DeviceBadge device="arm"/>. Don't mix devices when comparing trends.
            </div>
          </Card>

          <Card title="VO₂ Max">
            <div style={{ display:"flex", gap:20, alignItems:"center", padding:"10px 0" }}>
              {VO2.map((v,i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:22, fontWeight:700, color:"#5ec4ff", fontFamily:"'Space Mono',monospace" }}>{v.val.toFixed(1)}</div>
                  <div style={{ fontSize:11, color:"#7bafc8" }}>ml/kg·min</div>
                  <div style={{ fontSize:11, color:"#6aaac2", marginTop:4 }}>{v.day}</div>
                </div>
              ))}
              <div style={{ flex:1, padding:"12px 18px", background:"#080f17", borderRadius:8, fontSize:13, color:"#8ab8d0", lineHeight:1.7 }}>
                Consistent ~31 ml/kg·min across 4 readings. Below average for males 40–49 (~35). Stable but room to grow with consistent cardio.
              </div>
            </div>
          </Card>
        </>)}

        {/* ── ACTIVITY ── */}
        {sec === "activity" && (<>
          <Card title="Daily Steps">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stepsData} barSize={barSz}>
                <XAxis dataKey="label" tick={TICK} {...AX}/>
                <YAxis tick={TICK_SM} {...AX} width={36}/>
                <CartesianGrid stroke="#13283c" vertical={false}/>
                <Tooltip content={<CustomTooltip unit=" steps"/>}/>
                <ReferenceLine y={GOALS.steps} stroke="#1e4060" strokeDasharray="4 3"/>
                <Bar dataKey="steps" radius={[4,4,0,0]}>
                  {stepsData.map((d,i) => <Cell key={i} fill={(d.steps ?? 0) >= GOALS.steps ? "#38bdf8" : "#2a6a8a"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop:8, fontSize:11, color:"#6aaac2" }}>
              Dashed line marks your {GOALS.steps.toLocaleString()}-step goal. {stepsData.filter(d => (d.steps ?? 0) >= GOALS.steps).length} of {stepsData.length} tracked days met it.
            </div>
          </Card>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Card title="Exercise Minutes">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={exData} barSize={barSz}>
                  <XAxis dataKey="label" tick={TICK} {...AX}/>
                  <YAxis tick={TICK_SM} {...AX} width={28}/>
                  <Tooltip content={<CustomTooltip unit=" min"/>}/>
                  <ReferenceLine y={GOALS.exercise} stroke="#1e4060" strokeDasharray="4 3"/>
                  <Bar dataKey="exMins" name="Exercise" radius={[4,4,0,0]}>
                    {exData.map((d,i) => <Cell key={i} fill={d.exMins>=60?"#fbbf24":d.exMins>=GOALS.exercise?"#b08010":"#4a5568"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Distance">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} barSize={barSz}>
                  <XAxis dataKey="label" tick={TICK} {...AX}/>
                  <YAxis tick={TICK_SM} {...AX} width={28}/>
                  <Tooltip content={<CustomTooltip unit=" mi"/>}/>
                  <ReferenceLine y={GOALS.distance} stroke="#1e4060" strokeDasharray="4 3"/>
                  <Bar dataKey="dist" name="Distance" radius={[4,4,0,0]}>
                    {data.map((d,i) => <Cell key={i} fill={d.dist>=4?"#34d399":d.dist>=2.5?"#20a070":"#174d38"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="Daily Calories Burned">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={energyData} barSize={barSz}>
                <XAxis dataKey="label" tick={TICK} {...AX}/>
                <YAxis tick={TICK_SM} {...AX} width={40}/>
                <Tooltip content={<CustomTooltip unit=" kcal"/>}/>
                <Bar dataKey="basal"  name="Basal"  stackId="a" fill="#1e3a4a"/>
                <Bar dataKey="active" name="Active" stackId="a" fill="#fbbf24" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>)}

        {/* ── LABS ── */}
        {sec === "labs" && (<>
          <Card title="Bloodwork — Latest Draw">
            <div style={{ fontSize:12.5, color:"#8ab8d0", lineHeight:1.6 }}>
              Lab markers from 2018 through May 2026 — {LAB_GROUPS.reduce((s,g)=>s+g.markers.length,0)} tracked across {LAB_GROUPS.length} panels.
              Each chart shows the trend over all draws; the shaded band is the reference range,
              and the value is colored <span style={{ color:"#4ecb71" }}>green</span> when in range,
              {" "}<span style={{ color:"#ff6b8a" }}>red</span> when out. Each data point's dot is colored by
              its source.
            </div>
            <div style={{ display:"flex", gap:18, marginTop:12, flexWrap:"wrap" }}>
              {Object.keys(SOURCE_COLORS).map(k => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#9fc8dc" }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:SOURCE_COLORS[k], border:"1px solid #0a1722", display:"inline-block" }}/>
                  {SOURCE_LABELS[k]}
                  {k==="holistic" && <span style={{ color:"#5a8aaa" }}>(saliva + 5/12 blood)</span>}
                  {k==="pcp" && <span style={{ color:"#5a8aaa" }}>(5/20)</span>}
                </div>
              ))}
            </div>
          </Card>

          {LAB_GROUPS.map(g => (
            <Card key={g.group} title={g.group}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                {g.markers.map(m => <LabMarker key={m.name} m={m}/>)}
              </div>
            </Card>
          ))}

          <Card title="Adrenal / Cortisol Rhythm">
            <div style={{ fontSize:11.5, color:"#6aaac2", lineHeight:1.5, marginBottom:12 }}>
              <span style={{ width:9, height:9, borderRadius:"50%", background:SOURCE_COLORS.holistic, display:"inline-block", marginRight:6 }}/>
              Saliva, collected 5/3/2026 (DiagnosTechs, via your holistic clinic). Measures free cortisol at four points across the day
              against the expected circadian curve.
            </div>
            <CortisolRhythm data={CORTISOL_RHYTHM}/>
          </Card>

          <Card title="Saliva Hormones">
            <div style={{ fontSize:11.5, color:"#6aaac2", lineHeight:1.5, marginBottom:12 }}>
              <span style={{ width:9, height:9, borderRadius:"50%", background:SOURCE_COLORS.holistic, display:"inline-block", marginRight:6 }}/>
              Saliva, collected 5/3/2026 (DiagnosTechs Expanded Male Hormone Panel, via your holistic clinic). Saliva measures the
              free (unbound) hormone fraction — these values are <strong>not directly comparable</strong> to the
              serum hormone numbers in the panels above, which use different units and reference ranges.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
              {SALIVA_HORMONES.map(m => <SalivaMarker key={m.name} m={m}/>)}
            </div>
          </Card>

          <Card title="Insights">
            <div style={{ fontSize:12.5, color:"#9fc8dc", lineHeight:1.7, display:"flex", flexDirection:"column", gap:14 }}>

              <div style={{ background:"#0a1722", border:"1px solid #c084fc33", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ color:"#c084fc", fontWeight:600, marginBottom:3 }}>Connecting your symptoms to these labs</div>
                Your reported symptoms (see the Symptoms tab) map onto this bloodwork more than you might expect.
                The chronic fatigue has measurable contributors here — iron deficiency, the Vitamin D drop, and
                the testosterone trough pattern. The hives track with the elevated CRP. And the depression/anxiety
                picture connects to the shifted cortisol rhythm and high homocysteine. None of these are the whole
                story, but they're the threads where symptom and data line up — and where re-testing will show
                whether things are moving.
              </div>

              <div>
                <div style={{ color:"#ff8aa3", fontWeight:600, marginBottom:3 }}>New &amp; most important: iron deficiency</div>
                Your 5/12/2026 panel shows a clear iron-deficiency pattern — ferritin 13 (low, ref starts at 30),
                iron saturation 9% (flagged Alert Low), serum iron 36 (low), with TIBC and UIBC both high as the
                body tries to grab more iron. This is the single most actionable finding in the new labs and it
                connects directly to your fatigue question: low ferritin causes fatigue, low exercise tolerance,
                and low mood even before anemia shows up — and your hemoglobin is still normal, so this is
                early iron deficiency without anemia. It also makes the Thorne iron supplement make sense.
                Worth a direct conversation about iron repletion and finding the underlying cause.
              </div>

              <div>
                <div style={{ color:"#ff8aa3", fontWeight:600, marginBottom:3 }}>New: inflammation markers are elevated</div>
                hs-CRP came back at 8.8 mg/L — well above the &gt;3.0 "high cardiovascular risk" threshold — and
                homocysteine at 22.3 is high (ref tops at 14.5). Both are inflammation/cardiovascular signals.
                Elevated CRP fits with an active inflammatory process (your CSU/hives are one plausible source),
                and high homocysteine is exactly what methylfolate and methyl-B12 are meant to bring down — so
                your supplement choices are aimed at this. These are worth rechecking after a few months on the
                methylated B vitamins to confirm they're trending down.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>New: cortisol rhythm is shifted</div>
                Your saliva cortisol (5/3/2026) shows normal morning and midnight values but elevated noon and
                afternoon levels — total output is normal, but the curve is flatter than ideal. The lab placed you
                in "Zone 2 — cortisol elevation," often the transition between acute and prolonged stress. Combined
                with borderline-low DHEA (3), this is a stress-physiology pattern that fits the anxiety and the
                disrupted sleep visible elsewhere in the dashboard. Elevated afternoon cortisol can also feed the
                late-bedtime pattern on your Sleep tab.
              </div>

              <div>
                <div style={{ color:"#fbbf24", fontWeight:600, marginBottom:3 }}>Reversal worth noting: Vitamin D has dropped</div>
                Your Vitamin D fell from 74 (Sept 2025) to 44.5 (May 2026). Still in range, but a meaningful drop.
                Since low D independently contributes to fatigue and low mood, this is worth keeping an eye on —
                possibly a dosing or absorption question given everything else going on.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Good news on the metabolic front</div>
                The newest HbA1c actually came down to 5.4 (LabCorp, 5/12) from the 5.5–5.6 range, and glucose
                is a steady 95. Thyroid panel is essentially unremarkable — TSH 3.12, free T4 and free T3 both
                mid-range, reverse T3 normal, thyroid antibodies negative. So thyroid is not the driver of your
                fatigue, which is useful to rule out.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Red blood cell markers remain high-normal</div>
                Hemoglobin (15.3), hematocrit (48.6), and RBC (5.56) are still at the upper end — the long-standing
                TRT-associated pattern. Interesting tension here: you have high red cell counts <em>and</em> low iron
                stores at the same time. TRT drives red cell production, which consumes iron — that combination can
                actually accelerate iron depletion, which may partly explain the low ferritin. Worth raising both
                together with your doctor rather than treating them as separate issues.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Lipids and kidney — small shifts</div>
                LDL nudged to 129 (high) on 5/12 and Chol/HDL ratio to 4.1; HDL steady at 46. Creatinine ticked to
                1.30 (just over the 1.27 ceiling) with eGFR 68 — consistent with the slow trend already noted, and
                influenced by muscle mass and hydration. Nothing alarming, but the cardiovascular picture (LDL +
                high CRP + low HDL together) is the cluster most worth a proactive conversation.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Body weight remains the throughline</div>
                BMI has climbed steadily — 28.4 (2018) to 31.0 (2025). It amplifies several of the above: inflammation,
                lipids, and insulin/glucose all move with it, and it's the lever with the broadest downstream effect.
                Your Activity tab shows the capacity is there on good days; consistency is the gap.
              </div>

            </div>
          </Card>

          <Card title="Note">
            <div style={{ fontSize:11.5, color:"#6aaac2", lineHeight:1.6 }}>
              Reference ranges shown are standard lab intervals. Your spreadsheet also tracks tighter
              "functional" ranges for several markers — those aren't reflected in the in/out coloring here.
              This view is for tracking trends, not for medical interpretation; discuss any out-of-range
              values with your doctor.
            </div>
          </Card>
        </>)}

        {/* ── MEDS & SUPPLEMENTS ── */}
        {sec === "meds" && (<>

          <Card title="Supplements">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {[
                { name:"Vitamin E", brand:"Kirkland Signature", dose:"180 mg (400 IU)", form:"Softgel", freq:"3–4 per day", total:"540–720 mg · 1,200–1,600 IU", note:"dl-Alpha Tocopheryl Acetate (synthetic form). Antioxidant and immune support. 400 IU/day is the threshold cited in some long-term studies — worth confirming this dose with your doctor.", color:"#f59e0b" },
                { name:"Fish Oil", brand:"Nature Made", dose:"1,200 mg (360 mg Omega-3)", form:"Softgel", freq:"1 per day", total:"360 mg Omega-3/day", note:"EPA+DHA for triglycerides and cardiovascular health. Your triglycerides (70) are already in good range — fish oil is likely contributing to that.", color:"#38bdf8" },
                { name:"Vitamin D3", brand:"Nature Made", dose:"1,000 IU (25 mcg)", form:"Softgel", freq:"3 per day", total:"3,000 IU/day", note:"Your Vitamin D went from 27 (deficient) to 74 ng/mL — well into the optimal band. This dose is maintaining that well.", color:"#fbbf24" },
                { name:"Turmeric", brand:"Youtheory", dose:"750 mg (95% curcuminoids)", form:"Veggie capsule", freq:"2 per day", total:"1,500 mg/day", note:"Anti-inflammatory support. Label serving is 3 caps = 2,250 mg; at 2 caps you get 1,500 mg. Curcumin absorbs better with fat and black pepper (piperine) — take with a meal.", color:"#f97316" },
                { name:"Super C with D3 & Zinc", brand:"Nature Made", dose:"Per label", form:"Tablet", freq:"1 per day", total:"1 tablet/day", note:"Combines Vitamin C, D3, and Zinc across 5 immune-support nutrients. Check combined D3 total with your doctor given the standalone D3 also.", color:"#4ecb71" },
                { name:"Magnesium Citrate", brand:"Nature Made", dose:"250 mg", form:"Softgel", freq:"Per label", total:"250 mg/serving", note:"High-absorption citrate form. Supports muscle relaxation, sleep, nerve, and heart function. Good addition especially given your late bedtimes and fragmented sleep.", color:"#a78bfa" },
                { name:"Iron Bisglycinate", brand:"Thorne", dose:"Per label", form:"Capsule", freq:"1 per day", total:"1 capsule/day", note:"Gentle chelated iron with lower GI irritation. Worth flagging: your hemoglobin, hematocrit, and RBC already run at the top of range — confirm with your doctor whether iron supplementation is appropriate.", color:"#f87171" },
                { name:"L-Methylfolate", brand:"MethylPro", dose:"2.5 mg", form:"Capsule", freq:"Per label", total:"2.5 mg/day", note:"Active folate that bypasses MTHFR conversion. Often prescribed alongside methylated B12. Complements the Jarrow B-12 & Folate below.", color:"#6ee7b7" },
                { name:"Methyl B-12 & Folate", brand:"Jarrow Formulas", dose:"1,000 mcg B12 + 400 mcg Folate", form:"Chewable", freq:"1 per day", total:"1,000 mcg B12 · 400 mcg methylfolate + P-5-P", note:"Methylated active forms — well-absorbed and bioavailable. Works synergistically with the MethylPro L-Methylfolate for methylation pathway support.", color:"#818cf8" },
              ].map(s => (
                <div key={s.name} style={{ background:"#0a1722", border:`1px solid ${s.color}33`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#e0f0ff" }}>{s.name}</div>
                      <div style={{ fontSize:11, color:"#5a8aaa", marginTop:1 }}>{s.brand}</div>
                    </div>
                    <span style={{ fontSize:10, background:s.color+"22", color:s.color, border:`1px solid ${s.color}55`, borderRadius:4, padding:"2px 8px", whiteSpace:"nowrap", marginLeft:8 }}>{s.form}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:8 }}>
                    <div style={{ fontSize:11, color:"#7bafc8" }}>Dose <span style={{ color:"#cfe6f2", fontWeight:500 }}>{s.dose}</span></div>
                    <div style={{ fontSize:11, color:"#7bafc8" }}>Frequency <span style={{ color:"#cfe6f2", fontWeight:500 }}>{s.freq}</span></div>
                    <div style={{ fontSize:11, color:"#7bafc8", gridColumn:"1/-1" }}>Daily total <span style={{ color:s.color, fontWeight:500 }}>{s.total}</span></div>
                  </div>
                  <div style={{ fontSize:11, color:"#6aaac2", lineHeight:1.55, borderTop:"1px solid #16304a", paddingTop:8 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Prescriptions">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {[
                { name:"Testosterone Cypionate", dose:"200 mg/mL", form:"IM Injection", freq:"0.5 mL every Friday", total:"100 mg/week", note:"Weekly intramuscular injection. Consistent with your hormone panel trends. Monitor hematocrit closely — currently at 51, the top of the standard range.", color:"#f59e0b" },
                { name:"Amphetamine Salts", dose:"20 mg", form:"Tablet", freq:"1 morning · 1 early afternoon", total:"40 mg/day", note:"Stimulant — can elevate RHR and suppress HRV, visible on the Heart tab. Afternoon dose timing may affect sleep onset; the late bedtimes in your sleep data are worth cross-referencing.", color:"#f87171" },
                { name:"Buspirone HCl", dose:"7.5 mg", form:"Tablet", freq:"1 morning · 1 night", total:"15 mg/day", note:"Non-benzodiazepine anxiolytic. No sedation or dependence risk. Takes several weeks to reach full effect. Unlikely to affect your daily metrics significantly.", color:"#a78bfa" },
                { name:"Tadalafil", dose:"5 mg", form:"Tablet", freq:"1 per day", total:"5 mg/day", note:"Daily low-dose. Commonly co-prescribed with TRT. Some evidence supports cardiovascular microcirculation benefits at daily dosing vs. as-needed use.", color:"#38bdf8" },
                { name:"Rhapsido (remibrutinib)", dose:"25 mg", form:"Tablet", freq:"1 morning · 1 night", total:"50 mg/day", note:"BTK inhibitor (Novartis) for immune/inflammatory conditions. Swallow whole — do not split or crush. Relatively new therapy; report any unusual symptoms to your prescribing doctor promptly.", color:"#6ee7b7" },
              ].map(s => (
                <div key={s.name} style={{ background:"#0a1722", border:`1px solid ${s.color}33`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#e0f0ff" }}>{s.name}</div>
                      <div style={{ fontSize:11, color:"#5a8aaa", marginTop:1 }}>Rx · {s.form}</div>
                    </div>
                    <span style={{ fontSize:10, background:"#ff6b8a22", color:"#ff6b8a", border:"1px solid #ff6b8a44", borderRadius:4, padding:"2px 8px", whiteSpace:"nowrap", marginLeft:8 }}>Rx</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:8 }}>
                    <div style={{ fontSize:11, color:"#7bafc8" }}>Dose <span style={{ color:"#cfe6f2", fontWeight:500 }}>{s.dose}</span></div>
                    <div style={{ fontSize:11, color:"#7bafc8" }}>Schedule <span style={{ color:"#cfe6f2", fontWeight:500 }}>{s.freq}</span></div>
                    <div style={{ fontSize:11, color:"#7bafc8", gridColumn:"1/-1" }}>Daily total <span style={{ color:s.color, fontWeight:500 }}>{s.total}</span></div>
                  </div>
                  <div style={{ fontSize:11, color:"#6aaac2", lineHeight:1.55, borderTop:"1px solid #16304a", paddingTop:8 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Insights — How This Stack May Be Affecting You">
            <div style={{ fontSize:12.5, color:"#9fc8dc", lineHeight:1.7, display:"flex", flexDirection:"column", gap:16 }}>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>The hives — Rhapsido is the right tool for this</div>
                Rhapsido is FDA-approved specifically for chronic spontaneous urticaria — hives with
                no identifiable external trigger. It works by blocking BTK, which shuts down the mast
                cell and basophil signaling that drives histamine release. Clinical trials showed about
                a third of patients reached complete resolution by week 12. If you are not seeing
                meaningful improvement yet, discuss with your doctor how long you have been on it
                and whether a reassessment is due.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>The fatigue — multiple things pulling in the same direction</div>
                Chronic fatigue rarely has one cause, and your stack has several contributors worth
                separating. Remibrutinib lists fatigue as a common side effect in its clinical trial
                data. Amphetamine salts create a stimulation-then-crash cycle — the rebound when
                the afternoon dose wears off can feel like profound fatigue. Your sleep data makes
                this concrete: bedtimes at 2–4 AM and multiple nights under 5 hours means chronic
                sleep deprivation, which no stimulant fully compensates for — it just shifts the
                problem. Testosterone levels also fluctuate significantly around injection day; the
                trough period (days 5–7 before your Friday dose) is a well-documented low-energy,
                low-mood window on weekly TRT.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>The anxiety — the amphetamine-buspirone combination deserves a conversation</div>
                Amphetamine salts are contraindicated in patients with marked anxiety because they
                can worsen it directly — the stimulant and the anxiolytic are working against each
                other. The combination also carries a documented interaction: both affect serotonin
                pathways, and together they can increase serotonin syndrome risk (agitation, elevated
                heart rate, sweating, confusion). This does not mean the combination is wrong for
                you — your doctor prescribed both — but the anxiety you experience may be partly
                pharmacological. It is worth asking whether the stimulant dose or timing is
                contributing more than it is helping.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>The depression — low testosterone troughs and sleep are the first places to look</div>
                Testosterone troughs in the days before your Friday injection are a well-documented
                cause of low mood on weekly TRT protocols. Chronic poor sleep alone is sufficient
                to produce depressive symptoms independent of anything else. The L-Methylfolate
                and Methyl B-12 suggest your doctor is already thinking about methylation pathway
                support, which often accompanies mood-related treatment. Buspirone alone does not
                treat depression, so if that is a significant symptom it may warrant a direct
                conversation about whether the current protocol is fully addressing it.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Supplements working in your favor</div>
                Magnesium citrate at bedtime is probably your most useful supplement right now given
                the sleep patterns here — it supports muscle relaxation and sleep quality directly.
                Vitamin D at 74 ng/mL is well-optimized; low D is independently linked to fatigue
                and low mood, so maintaining it matters. Fish oil supports the cardiovascular
                picture (your triglycerides are good at 70). Turmeric has real anti-inflammatory
                evidence, relevant both to the CSU and to general inflammatory load.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Iron — now clarified by your latest labs</div>
                Your 5/12/2026 panel resolved an earlier open question: ferritin is low (13), iron saturation is
                Alert Low (9%), and serum iron is low (36). So the Thorne iron is appropriately targeted — you
                genuinely are iron-deficient, even though your hemoglobin and hematocrit run high from TRT.
                That combination (low iron stores + high red cell production) is worth managing together with
                your doctor, since TRT consumes iron and can deepen the deficiency. Take iron away from coffee,
                calcium, and the magnesium for best absorption.
              </div>

              <div style={{ fontSize:11, color:"#5a8aaa", borderTop:"1px solid #16304a", paddingTop:10 }}>
                These are data-grounded observations, not diagnoses. The most useful thing this
                section can do is arm you with specific, informed questions for your doctor —
                particularly around stimulant timing, the testosterone trough window, iron
                supplementation given your CBC, and whether the amphetamine-buspirone combination
                is optimally balanced.
              </div>

            </div>
          </Card>

          <Card title="Note">
            <div style={{ fontSize:11.5, color:"#6aaac2", lineHeight:1.6 }}>
              This tab is a personal reference log, not medical advice. Dosing, interactions, and
              appropriateness of each item should be reviewed with your prescribing physician and
              pharmacist — particularly given the combination of stimulants, TRT, and remibrutinib.
              Items marked Rx should not be adjusted without provider guidance.
            </div>
          </Card>

        </>)}

        {/* ── SYMPTOMS & HISTORY ── */}
        {sec === "symptoms" && (<>

          <Card title="Active Symptoms & Concerns">
            <div style={{ fontSize:11.5, color:"#6aaac2", lineHeight:1.5, marginBottom:14 }}>
              Compiled from your clinical history note (5/27/2026). Grouped by system. All listed as current/active concerns.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:12 }}>
              {[
                { sys:"Skin / Immune", color:"#c084fc", items:[
                  { s:"Chronic hives (urticaria)", d:"Onset ~mid-2024, ongoing — on Rhapsido" },
                  { s:"Vitiligo", d:"Location noted as a question" },
                  { s:"Fatty lipomas", d:"Subcutaneous growths" },
                ]},
                { sys:"Energy / Sleep", color:"#38bdf8", items:[
                  { s:"Chronic fatigue", d:"Years-long; a primary driver of TRT" },
                  { s:"Sleep apnea", d:"On CPAP" },
                  { s:"Narcolepsy", d:"Dx 2013 → Adderall" },
                ]},
                { sys:"Mood / Cognitive", color:"#a78bfa", items:[
                  { s:"Depression", d:"Since ~2004" },
                  { s:"Anxiety", d:"Ongoing — on Buspirone" },
                  { s:"ADHD", d:"Since youth → Adderall" },
                ]},
                { sys:"Endocrine / Metabolic", color:"#f59e0b", items:[
                  { s:"Low testosterone", d:"On TRT 'for chronic fatigue / low T'" },
                  { s:"Weight gain", d:"Associated with steroids" },
                  { s:"Stress → sugar intake", d:"Self-identified pattern" },
                ]},
                { sys:"GI / Digestive", color:"#4ecb71", items:[
                  { s:"Irregular bowel movements", d:"Alternating; up to 2 days without" },
                  { s:"Food sensitivities", d:"Cow's milk, soy" },
                ]},
                { sys:"Other", color:"#6ee7b7", items:[
                  { s:"Prostate concern", d:"Noted for follow-up" },
                  { s:"Dental", d:"2 root canals, cavities" },
                  { s:"Vasectomy", d:"~2018 (history)" },
                ]},
              ].map(g => (
                <div key={g.sys} style={{ background:"#0a1722", border:`1px solid ${g.color}33`, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:g.color, marginBottom:8, letterSpacing:"0.02em" }}>{g.sys}</div>
                  {g.items.map(it => (
                    <div key={it.s} style={{ marginBottom:8 }}>
                      <div style={{ fontSize:12.5, color:"#cfe6f2" }}>{it.s}</div>
                      <div style={{ fontSize:10.5, color:"#6aaac2", lineHeight:1.4 }}>{it.d}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Symptom ↔ Data Correlations">
            <div style={{ fontSize:12.5, color:"#9fc8dc", lineHeight:1.7, display:"flex", flexDirection:"column", gap:14 }}>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Chronic fatigue — the most over-determined symptom you have</div>
                Your fatigue has at least five plausible contributors that the dashboard can actually see:
                iron deficiency (ferritin 13, sat 9%), fragmented sleep (multiple nights under 5 hours on the
                Sleep tab), the testosterone trough before each Friday injection, the amphetamine crash cycle,
                and the recent Vitamin D drop (74 → 44). No single fix addresses all five. The iron and sleep
                are the two most directly correctable, and both are measurable, so they're the best places to
                start tracking change.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Hives + elevated CRP line up</div>
                Your chronic urticaria (active since ~2024) and the high hs-CRP (8.8) are consistent with each
                other — active immune/inflammatory activity shows up in both the symptom and the bloodwork.
                As Rhapsido controls the hives, CRP is a marker worth rechecking to see whether systemic
                inflammation settles alongside the skin symptoms.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Anxiety, sleep, and the cortisol curve</div>
                Your elevated afternoon cortisol (Labs → Adrenal) connects three things at once: the anxiety,
                the late bedtimes (Sleep tab shows 2–4 AM), and the stimulant timing (Meds tab). Cortisol that
                stays high into the afternoon makes winding down harder, which delays sleep, which worsens both
                fatigue and mood the next day. It's a loop, and the afternoon Adderall dose sits right in the
                middle of it — worth discussing dose timing with your prescriber.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Depression — several measurable inputs</div>
                Depression since 2004 is long-standing, but several things visible here can worsen it
                independently: the testosterone trough days, chronic sleep loss, low-ish Vitamin D, and even
                the high homocysteine (22.3), which some research links to mood. Your methylfolate and methyl-B12
                target that homocysteine pathway directly, so they may be doing double duty for mood and
                cardiovascular risk.
              </div>

              <div>
                <div style={{ color:"#e0f0ff", fontWeight:600, marginBottom:3 }}>Weight, stress, and sugar</div>
                You flagged stress → sugar intake yourself, and the dashboard shows the downstream: steady BMI
                climb (28 → 31), LDL creeping up, and HbA1c at the edge. This is the cluster where a behavioral
                lever (the stress-sugar loop) has the broadest measurable payoff across multiple markers.
              </div>

            </div>
          </Card>

          <Card title="Note">
            <div style={{ fontSize:11.5, color:"#6aaac2", lineHeight:1.6 }}>
              This is a self-tracking summary of your own clinical history note, not a diagnosis or
              medical record. Some items were transcribed from handwriting and should be verified.
              The correlations above are observational patterns across your own data — useful for
              framing questions with your care team, not a substitute for their assessment.
            </div>
          </Card>

        </>)}

          </div>
          );
        })}

      </div>
    </div>
  );
}
