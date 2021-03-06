import React, { useState, useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import Drawer from "@material-ui/core/Drawer";
import { Link, Route } from "react-router-dom";
import { auth, db } from "./firebase";
import { TextField, Radio } from "@material-ui/core";
import DissatisfiedIcon from "@material-ui/icons/SentimentDissatisfied";
import SatisfiedIcon from "@material-ui/icons/SentimentSatisfied";
import VeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import VerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";
import { Line } from "react-chartjs-2";
var unirest = require("unirest");

export function App(props) {
  const [drawer_open, setDrawerOpen] = useState(false);
  const handleMenuOpen = () => {
    setDrawerOpen(true);
  };
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const refresh = auth.onAuthStateChanged(u => {
      if (u) {
        setUser(u);
      } else {
        props.history.push("/");
      }
    });
    return refresh;
  }, [props.history]);

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {})
      .catch(error => {
        window.alert(error.message);
      });
  };

  if (!user) return <div />;

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Typography
            color="inherit"
            variant="h6"
            style={{ marginLeft: 15, flexGrow: 1 }}
          >
            News
          </Typography>
          <Typography color="inherit" style={{ marginRight: 30 }}>
            Hi {user.email}
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer open={drawer_open} onClose={handleCloseDrawer}>
        <List>
          <ListItem
            button
            to="/app/"
            component={Link}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            <ListItemText primary="Take Survey" />
          </ListItem>
          <ListItem
            button
            to="/app/charts/"
            component={Link}
            onClick={handleCloseDrawer}
          >
            <ListItemText primary="Chart" />
          </ListItem>
        </List>
      </Drawer>
      <Route path="/app/charts" component={Charts} />
      <Route
        exact
        path="/app/"
        render={routeProps => {
          return (
            <Survey
              uid={user.uid}
              match={routeProps.match}
              location={routeProps.location}
              hitsory={routeProps.history}
            />
          );
        }}
      />
    </div>
  );
}

function Survey(props) {
  const [happiness, setHappiness] = useState(4);
  const [sleepHours, setSleepHours] = useState(6.5);
  const [temp, setTemp] = useState(212);
  const [lon, setLon] = useState(50);
  const [lat, setLat] = useState(50);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setLat(position.coords.latitude);
      setLon(position.coords.longitude);
    });
  }, []);

  useEffect(() => {
    var req = unirest(
      "GET",
      "https://community-open-weather-map.p.rapidapi.com/weather"
    );

    req.query({
      lat: lat,
      lon: lon,
      units: "imperial"
    });

    req.headers({
      "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
      "x-rapidapi-key": "2ab76a46c3msh95a7e9a72dc4326p1f1d13jsna9d018bfce1d"
    });

    req.end(function(res) {
      if (res.error) throw new Error(res.error);
      setTemp(res.body.main.temp);
    });
  }, [lat, lon]);

  const handleSave = () => {
    db.collection("users")
      .doc(props.uid)
      .collection("surveys")
      .add({ temp: temp, happiness: happiness, sleepHours: sleepHours })
      .then(() => {
        props.history.push("/app/charts/");
      });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Paper
        style={{ marginTop: 30, padding: 20, maxWidth: 400, width: "100%" }}
      >
        <Typography>How many hours did you sleep last night?</Typography>
        <TextField
          fullWidth
          value={sleepHours}
          onChange={e => {
            setSleepHours(e.target.value);
          }}
        />
        <Typography style={{ marginTop: 30 }}>
          How happy do you feel today?
        </Typography>
        <div>
          <Radio
            icon={<VeryDissatisfiedIcon />}
            checkedIcon={<VeryDissatisfiedIcon />}
            checked={happiness === 1}
            onChange={() => {
              setHappiness(1);
            }}
          />
          <Radio
            icon={<DissatisfiedIcon />}
            checkedIcon={<DissatisfiedIcon />}
            checked={happiness === 2}
            onChange={() => {
              setHappiness(2);
            }}
          />
          <Radio
            icon={<SatisfiedIcon />}
            checkedIcon={<SatisfiedIcon />}
            checked={happiness === 3}
            onChange={() => {
              setHappiness(3);
            }}
          />
          <Radio
            icon={<VerySatisfiedIcon />}
            checkedIcon={<VerySatisfiedIcon />}
            checked={happiness === 4}
            onChange={() => {
              setHappiness(4);
            }}
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          style={{ marginTop: 20 }}
        >
          Save
        </Button>
      </Paper>
    </div>
  );
}

function Charts(props) {
  const data = {
    datasets: [
      {
        label: "Happiness",
        data: [
          {
            x: "2019-01-01",
            y: 1
          },
          {
            t: new Date(),
            y: 10
          }
        ],
        backgroundColor: "transparent",
        borderColor: "red",
        yAxisID: "y-axis-2"
      },
      {
        label: "Sleep",
        data: [
          {
            x: new Date(),
            y: 1
          },
          {
            t: new Date(),
            y: 10
          }
        ],
        backgroundColor: "transparent",
        borderColor: "blue",
        yAxisID: "y-axis-2"
      },
      {
        label: "Temperature",
        data: [
          {
            x: "2019-01-01",
            y: 4
          },
          {
            t: new Date(),
            y: 7
          }
        ],
        backgroundColor: "transparent",
        borderColor: "green",
        yAxisID: "y-axis-1"
      }
    ]
  };

  const options = {
    scales: {
      yAxes: [
        {
          type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: "left",
          id: "y-axis-1"
        },
        {
          type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: "right",
          id: "y-axis-2"
          // grid line settings
        }
      ],
      xAxes: [
        {
          type: "time",
          time: {
            unit: "month"
          }
        }
      ]
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Paper
        style={{ marginTop: 30, padding: 30, maxWidth: 600, width: "100%" }}
      >
        <Typography variant="h6" style={{ marginBottom: 20 }}>
          {" "}
          Health stats over time{" "}
        </Typography>
        <Line data={data} options={options} />
      </Paper>
    </div>
  );
}
