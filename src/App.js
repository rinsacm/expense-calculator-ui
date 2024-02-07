import { useEffect, useState } from "react";
import "./App.css";
import React, { PureComponent } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function App() {
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(null);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseForMonth, setExpenseForMonth] = useState({});
  const [chartData, setChartData] = useState([{}]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const getDateToday = () => {
    let curr = new Date();
    curr.setDate(curr.getDate());
    let date = curr.toISOString().slice(0, 10);
    return date;
  };
  const [expenseDate, setExpenseDate] = useState(getDateToday());

  const clearFormFields = () => {
    setExpenseCategory("");
    setExpenseAmount(null);
    setExpenseDescription("");
  };

  const fetchExpenseDataMonth = (year, month) => {
    let bodyData = {
      year: year,
      month: month,
    };
    fetch("http://localhost:3001/get-expense-for-month", {
      method: "POST",
      credentials: "include",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    })
      .then((res) => {
        return res.json();
      })
      .then((resJson) => {
        let tempArr = [];
        let tempObj = {};
        let total = 0;
        resJson.data.map((ele, index) => {
          console.log(ele);
          tempObj = {
            name: ele._id,
            value: ele.totalAmount,
          };
          total += ele.totalAmount;
          tempArr.push(tempObj);
          console.log(tempArr);
          setChartData(tempArr);
          setTotalAmount(total);
          setExpenseForMonth(resJson.data);
        });

        console.log(expenseForMonth);

        console.log(chartData);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.toString());
      })
      .finally(() => {
        clearFormFields();
      });
  };
  useEffect(() => {
    setLoading(true);
    fetchExpenseDataMonth(2024, 2);
  }, []);

  const saveExpenseData = (e) => {
    e.preventDefault();
    let expenseData = {
      category: expenseCategory,
      amount: expenseAmount,
      desc: expenseDescription,
      date: getDateToday(),
    };
    fetch("http://localhost:3001/add-expense-data", {
      method: "POST",
      credentials: "include",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseData),
    })
      .then((res) => {
        return res.json();
      })
      .then((resJson) => {
        console.log(resJson);
      })
      .catch((err) => {
        console.log(err.toString());
      });
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const CustomTooltip = ({ payload }) => {
    return (
      <div>
        <div className="ant-popover-arrow" />
        <div className="first-letter:">
          <b>{payload?.[0]?.payload?.name}</b>
          <span className="">
            <p className="desc">
              <small>{payload?.[0]?.payload?.value}</small>
            </p>
            {/* <p>{payload?.[0]?.payload?.profitInPercentage} %</p> */}
          </span>
        </div>
      </div>
    );
  };
  if (!loading)
    return (
      <div className="App ">
        <div className="container mx-auto">
          <h1 className="font-karla heading1-color font-extrabold  text-5xl py-2">
            Expense Calculator
          </h1>
          <div className="my-2 bg-white backdrop-blur-3xl grid grid-cols-2 gap-2 p-2 ">
            <div className="min-h-44  flex flex-col mx-auto  align-middle justify-center w-full ">
              <h2 className="font-karl text-xl font-medium ">
                Add Today's Expense
              </h2>
              <div className="w-full py-2">
                <form className="flex flex-col gap-2 w-full px-4">
                  <input
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="rounded border  border-slate-200  p-2 mb-4"
                    type="text"
                    name="category"
                    placeholder="category"
                  />
                  <input
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="rounded border border-slate-200  border-1 w-full p-2 mb-4"
                    type="number"
                    name="amount"
                    placeholder="Enter the expense amount"
                  />
                  <input
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    className="rounded border border-slate-200  border-1 w-full p-2 mb-4"
                    type="text"
                    name="description"
                    placeholder="description"
                  />
                  <input
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="rounded border border-slate-200 s border-1 w-full p-2 mb-4"
                    type="date"
                    name="date"
                    placeholder="date"
                  />
                  <button
                    style={{ backgroundColor: "#7397CE" }}
                    onClick={(e) => saveExpenseData(e)}
                    type="submit"
                    className="text-white font-karla font-semibold rounded  py-2 self-center py-2 px-4"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
            <div>
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart width={400} height={400}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="font-karla text-lg text-red-600 justify-center ">
              You spend total of {totalAmount} Rs. this month.
            </div>
          </div>
        </div>
      </div>
    );
}

export default App;
