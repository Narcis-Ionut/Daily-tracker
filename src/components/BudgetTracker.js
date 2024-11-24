// BudgetTracker.js
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  container: {
    padding: "16px",
  },
  form: {
    marginTop: "16px",
    marginBottom: "16px",
  },
  listItem: {
    borderBottom: "1px solid #e0e0e0",
  },
});

function BudgetTracker() {
  const classes = useStyles();

  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (e) => {
    e.preventDefault();
    const newTransaction = { description, amount: parseFloat(amount) };
    setTransactions([...transactions, newTransaction]);
    setDescription("");
    setAmount("");
  };

  const deleteTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Paper className={classes.container} elevation={3}>
      <Typography variant="h4" gutterBottom>
        Budget Tracker
      </Typography>
      <form className={classes.form} onSubmit={addTransaction}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                inputProps: { min: 0, step: "0.01" },
              }}
              required
              fullWidth
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ marginTop: 2 }}
        >
          Add Transaction
        </Button>
      </form>
      <Typography variant="h5" gutterBottom>
        Transactions
      </Typography>
      <List>
        {transactions.map((item, index) => (
          <ListItem
            key={index}
            className={classes.listItem}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteTransaction(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={item.description}
              secondary={`£${item.amount.toFixed(2)}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h5" gutterBottom>
        Total: £{total.toFixed(2)}
      </Typography>
    </Paper>
  );
}

export default BudgetTracker;
