
import React from "react";

// rrd imports
import { Link, useLoaderData } from "react-router-dom";

// library imports
import { toast } from "react-toastify";

// components
import Intro from "../components/Intro";
import AddBudgetForm from "../components/AddBudgetForm";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";

//  helper functions
import { createBudget, createExpense, fetchData, waait, deleteItem } from "../helpers"

// loader
export function dashboardLoader() {
  const userName = fetchData("userName");
  const budgets = fetchData("budgets");
  const expenses = fetchData("expenses");
  return { userName, budgets, expenses }
}

// Function to capitalize the First Letter of the First Name and the First Letter of the Last Name
const capitalizeFirstLetters = (name) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length > 1) {
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
    return `${firstName} ${lastName}`;
  }
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// action
export async function dashboardAction({ request }) {
  await waait();

  const data = await request.formData();
  const { _action, ...values } = Object.fromEntries(data)

  // new user submission
  if (_action === "newUser") {
    try {
      localStorage.setItem("userName", JSON.stringify(values.userName))
      return toast.dark(`Welcome, ${values.userName}`)
    } catch (e) {
      throw new Error("There was a problem creating your account.")
    }
  }

  if (_action === "createBudget") {
    try {
      createBudget({
        name: values.budget,
        amount: values.amount,
      })
      return toast.dark("Budget created!")
    } catch (e) {
      throw new Error("There was a problem creating your budget.")
    }
  }

  if (_action === "createExpense") {
    try {
      createExpense({
        name: values.newExpense,
        amount: values.newExpenseAmount,
        budgetId: values.newExpenseBudget
      })
      return toast.dark(`Expense ${values.newExpense} created!`)
    } catch (e) {
      throw new Error("There was a problem creating your expense.")
    }
  }

  if (_action === "deleteExpense") {
    try {
      deleteItem({
        key: "expenses",
        id: values.expenseId,
      });
      return toast.dark("Expense deleted!");
    } catch (e) {
      throw new Error("There was a problem deleting your expense.");
    }
  }
}

const Dashboard = () => {
  const { userName, budgets, expenses } = useLoaderData();

  return (
    <>
      {userName ? (
        <div className="dashboard">
          <h1>
            Welcome to BluVault, <br></br>
            <span className="accent">{capitalizeFirstLetters(userName)}</span>!
          </h1>
          <p>We're excited to have you on board. Start exploring your financial possibilities and 
          take the first step towards managing your budget with ease.
          </p>
          <div className="grid-sm">
            {budgets && budgets.length > 0 ? (
              <div className="grid-lg">
                <div className="flex-lg">
                  <AddBudgetForm />
                  <AddExpenseForm budgets={budgets} />
                </div>
                <h2>Existing Budgets</h2>
                <div className="budgets">
                  {budgets.map((budget) => (
                    <BudgetItem key={budget.id} budget={budget} />
                  ))}
                </div>
                {expenses && expenses.length > 0 && (
                  <div className="grid-md">
                    <h2>Recent Expenses</h2>
                    <Table
                      expenses={expenses
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .slice(0, 5)}
                    />
                    {expenses.length > 5 && (
                      <Link to="expenses" className="btn btn--dark">
                        See all expenses
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid-sm">
                <p>
                  Create a budget to get started!
                </p>
                <AddBudgetForm />
              </div>
            )}
          </div>
        </div>
      ) : (
        <Intro />
      )}
    </>
  );
};

export default Dashboard;