import React, {useState} from 'react';
import './PriceTicker.css';
import autobahn from 'autobahn-browser';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tableWrapper: {
    maxHeight: '100%',
    overflow: 'auto',
  },
});

const columns = [
  {
    id: 'symbol',
    label: 'Symbol',
    align: 'left',
    minWidth: 10},
  {
    id: 'take_action',
    label: 'Trade',
    align: 'left',
    minWidth: 45},
  {
    id: 'askPrice',
    label: 'Ask Price',
    minWidth: 10,
    align: 'left'
  },
  {
    id: 'bidPrice',
    label: 'Bid Price',
    minWidth: 10,
    align: 'left'
  },
  {
    id: 'spread',
    label: 'Spread',
    minWidth: 10,
    align: 'left'
  },
  {
    id: 'askSymbol',
    label: 'Ask Symbol',
    minWidth: 10,
    align: 'left'
  },
  {
    id: 'bidSymbol',
    label: 'Bid Symbol',
    minWidth: 10,
    align: 'left'
  },
];

const connection = new autobahn.Connection({
  url: 'ws://pcw.vapesear.ch/ws',
  realm: 'pdubscryptoworld'
});

connection.open();

function PriceTicker() {
  const [spreads, setSpreads] = useState([]);

  connection.onopen = function (session) {
    session.subscribe('com.pdubscryptoworld.ui', (args) => {
      setSpreads(prevSpreads => {
        const newSpread = args[0]['spread'];
        let newSpreads = prevSpreads;
        let match_found = false;

        for (let i = 0; i < newSpreads.length; i++) {
          if (newSpreads[i] === undefined) {
            newSpreads = [];
            break;
          }

          if (newSpreads[i]['symbol'] === newSpread['symbol']) {
            newSpreads[i] = newSpread;
            match_found = true;
            break;
          }
        }

        if (!match_found) {
          newSpreads = [...newSpreads, newSpread];
        }

        return [...newSpreads]

      });
    });
  };

  const classes = useStyles();

  return (
    <div>
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{minWidth: column.minWidth}}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {spreads.map(row => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.symbol}>
                    {columns.map(column => {
                      const value = row[column.id];
                      let color = 'black';
                      switch (row.take_action) {
                        case "Yes":
                          color = 'green';
                          break;
                        case "Almost":
                          color = 'orange';
                          break;
                        default:
                          color = 'black';
                          break;
                      }
                      return (
                        <TableCell key={column.id} align={column.align} style={{color: color}}>
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Paper>
    </div>
  );
}

export default PriceTicker;
